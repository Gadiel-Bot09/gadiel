import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';

import { PrismaService } from '../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  companyId: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private get accessTokenTtl(): number {
    return this.configService.get<number>('ACCESS_TOKEN_TTL', 60 * 15);
  }

  private get refreshTokenTtl(): number {
    return this.configService.get<number>('REFRESH_TOKEN_TTL', 60 * 60 * 24 * 7);
  }

  async validateUser(email: string, password: string): Promise<{ userId: string; companyId: string; role: string }> {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const passwordValid = await argon.verify(user.passwordHash, password);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    return {
      userId: user.id,
      companyId: user.companyId,
      role: user.role?.slug ?? 'user',
    };
  }

  async issueTokens(payload: JwtPayload): Promise<{ accessToken: string; refreshToken: string }> {
    const secret = this.configService.get<string>('JWT_SECRET', 'change-me');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', 'change-me-too');

    const accessToken = await this.jwt.signAsync(payload, {
      secret,
      expiresIn: this.accessTokenTtl,
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: this.refreshTokenTtl,
    });

    const hashedRefresh = await argon.hash(refreshToken);

    await this.prisma.refreshToken.upsert({
      where: { userId: payload.sub },
      update: {
        tokenHash: hashedRefresh,
        expiresAt: new Date(Date.now() + this.refreshTokenTtl * 1000),
      },
      create: {
        userId: payload.sub,
        tokenHash: hashedRefresh,
        expiresAt: new Date(Date.now() + this.refreshTokenTtl * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const record = await this.prisma.refreshToken.findUnique({ where: { userId } });
    if (!record) {
      throw new UnauthorizedException('Token inválido');
    }

    const isValid = await argon.verify(record.tokenHash, refreshToken);
    if (!isValid || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return this.issueTokens({ sub: userId, companyId: user.companyId, role: user.role?.slug ?? 'user' });
  }

  async decodeRefreshToken(refreshToken: string): Promise<JwtPayload> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', 'change-me-too');
    const payload = (await this.jwt.verifyAsync(refreshToken, {
      secret: refreshSecret,
    })) as JwtPayload;
    return payload;
  }
}
