import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { PrismaService } from '../prisma/prisma.service';

import { LicenseState, LicenseValidation } from './license.types';

interface LicenseCacheEntry {
  validation: LicenseValidation;
  cachedAt: number;
}

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CACHE_TTL_MS = 60 * 1000;
const OFFLINE_GRACE_MS = 72 * 60 * 60 * 1000;

@Injectable()
export class LicenseService {
  private readonly logger = new Logger(LicenseService.name);
  private readonly cache = new Map<string, LicenseCacheEntry>();

  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async validateHttpRequest(request: Request, companyId: string): Promise<LicenseValidation> {
    const validation = await this.validateLicense(companyId);

    const method = request.method.toUpperCase();
    const isRead = READ_METHODS.has(method);

    if (validation.state === 'expired' || validation.state === 'invalid') {
      if (isRead) {
        return validation;
      }
      throw new ForbiddenException('La licencia de la empresa no es válida o venció.');
    }

    if (validation.state === 'grace' && !isRead) {
      return validation;
    }

    return validation;
  }

  async validateLicense(companyId: string): Promise<LicenseValidation> {
    const cached = this.cache.get(companyId);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return cached.validation;
    }

    const license = await this.prisma.license.findFirst({
      where: { companyId, status: { in: ['ACTIVE', 'EXPIRING', 'EXPIRED'] } },
      orderBy: { createdAt: 'desc' },
    });

    if (!license) {
      const invalid: LicenseValidation = { state: 'invalid', companyId };
      this.cache.set(companyId, { validation: invalid, cachedAt: Date.now() });
      return invalid;
    }

    const tokenRecord = await this.prisma.licenseToken.findFirst({
      where: { companyId, revokedAt: null },
      orderBy: { issuedAt: 'desc' },
    });

    if (!tokenRecord) {
      const invalid: LicenseValidation = { state: 'invalid', companyId };
      this.cache.set(companyId, { validation: invalid, cachedAt: Date.now() });
      return invalid;
    }

    const tokenHash = tokenRecord.tokenHash;
    const lastValidation = await this.prisma.licenseEvent.findFirst({
      where: { companyId, type: 'validated' },
      orderBy: { createdAt: 'desc' },
    });

    const offlineGrace = lastValidation
      ? lastValidation.createdAt.getTime() + OFFLINE_GRACE_MS
      : undefined;

    let payload: JwtPayload & { company_id: string; end_date: string; plan?: string; features?: unknown };
    const secret = this.config.get<string>('LICENSE_JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('Configuración de licencias incompleta.');
    }

    try {
      payload = jwt.verify(tokenRecord.rawToken, secret) as typeof payload;
    } catch (error) {
      this.logger.warn(`Token de licencia inválido para empresa ${companyId}: ${String(error)}`);
      const invalid: LicenseValidation = { state: 'invalid', companyId };
      this.cache.set(companyId, { validation: invalid, cachedAt: Date.now() });
      await this.logEvent(companyId, 'invalid', { reason: 'token_invalid' });
      return invalid;
    }

    if (payload.company_id !== companyId) {
      const invalid: LicenseValidation = { state: 'invalid', companyId };
      this.cache.set(companyId, { validation: invalid, cachedAt: Date.now() });
      await this.logEvent(companyId, 'invalid', { reason: 'company_mismatch' });
      return invalid;
    }

    const now = Date.now();
    const startDate = new Date(payload.start_date ?? license.startDate);
    const endDate = new Date(payload.end_date ?? license.endDate);

    let state: LicenseState = 'active';
    const msRemaining = endDate.getTime() - now;
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

    if (msRemaining <= 0) {
      state = 'expired';
    } else if (daysRemaining <= 15) {
      state = 'expiring';
    }

    if (state === 'expired' && offlineGrace && now < offlineGrace) {
      state = 'grace';
    }

    const validation: LicenseValidation = {
      state,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      expiresAt: endDate,
      companyId,
      plan: payload.plan ?? license.plan,
      features: (payload.features as Record<string, unknown>) ?? (license.features as unknown as Record<string, unknown>),
    };

    this.cache.set(companyId, { validation, cachedAt: Date.now() });

    const nextStatus = state === 'expired' ? 'EXPIRED' : state === 'expiring' ? 'EXPIRING' : 'ACTIVE';
    if (license.status !== nextStatus) {
      await this.prisma.license.update({
        where: { id: license.id },
        data: { status: nextStatus },
      });
    }

    if (state === 'active' || state === 'expiring') {
      await this.logEvent(companyId, 'validated', {
        plan: validation.plan,
        expiresAt: validation.expiresAt?.toISOString(),
        state,
      });
    }

    return validation;
  }

  async activateLicense(companyId: string, rawToken: string): Promise<LicenseValidation> {
    const secret = this.config.get<string>('LICENSE_JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('No se configuró la clave de licencias.');
    }

    const payload = jwt.verify(rawToken, secret) as JwtPayload & {
      company_id: string;
      plan: string;
      start_date: string;
      end_date: string;
      features?: unknown;
      seats?: number;
      max_branches?: number;
      nonce: string;
    };

    if (payload.company_id !== companyId) {
      throw new ForbiddenException('El código de licencia pertenece a otra empresa.');
    }

    const tokenHash = this.hashToken(rawToken);

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.license.upsert({
        where: { companyId },
        update: {
          plan: payload.plan,
          startDate: new Date(payload.start_date),
          endDate: new Date(payload.end_date),
          status: 'ACTIVE',
          features: payload.features as Prisma.JsonValue,
          seats: payload.seats ?? null,
          maxBranches: payload.max_branches ?? null,
        },
        create: {
          companyId,
          plan: payload.plan,
          startDate: new Date(payload.start_date),
          endDate: new Date(payload.end_date),
          status: 'ACTIVE',
          features: payload.features as Prisma.JsonValue,
          seats: payload.seats ?? null,
          maxBranches: payload.max_branches ?? null,
        },
      });

      await tx.licenseToken.updateMany({
        where: { companyId, revokedAt: null },
        data: { revokedAt: new Date(), reason: 'replaced' },
      });

      await tx.licenseToken.create({
        data: {
          companyId,
          tokenHash,
          rawToken,
          issuedAt: new Date(),
        },
      });

      await this.logEvent(companyId, 'activated', {
        plan: payload.plan,
        expiresAt: payload.end_date,
      });
    });

    this.cache.delete(companyId);
    return this.validateLicense(companyId);
  }

  async revokeLicense(companyId: string, reason: string): Promise<void> {
    await this.prisma.licenseToken.updateMany({
      where: { companyId, revokedAt: null },
      data: { revokedAt: new Date(), reason },
    });
    await this.logEvent(companyId, 'revoked', { reason });
    this.cache.delete(companyId);
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private async logEvent(companyId: string, type: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.prisma.licenseEvent.create({
      data: {
        companyId,
        type,
        metadata: (metadata ?? {}) as Prisma.JsonValue,
      },
    });
  }
}
