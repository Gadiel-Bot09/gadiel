import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { LicenseStatus } from '@prisma/client';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

import { LicenseGuard } from '../license.guard';
import { LicenseService } from '../license.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('LicenseGuard', () => {
  it('permite lecturas cuando la licencia está expirada', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LicenseGuard,
        LicenseService,
        { provide: PrismaService, useValue: createPrismaMock({ state: 'expired' }) },
        {
          provide: ConfigService,
          useValue: { get: () => 'secret' },
        },
      ],
    }).compile();

    const guard = moduleRef.get(LicenseGuard);
    const canActivate = await guard.canActivate({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          headers: { 'x-company-id': 'demo' },
        }),
      }),
    } as any);
    expect(canActivate).toBe(true);
  });
});

function createPrismaMock({ state }: { state: 'expired' | 'active' }) {
  const license = {
    companyId: 'demo',
    plan: 'pro',
    startDate: new Date(Date.now() - 10 * 86400000),
    endDate: new Date(Date.now() - (state === 'expired' ? 1 : -10) * 86400000),
    status: state === 'expired' ? LicenseStatus.EXPIRED : LicenseStatus.ACTIVE,
    features: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  } as const;

  const prismaMock = {
    license: {
      findFirst: jest.fn().mockResolvedValue(license),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    licenseToken: {
      findFirst: jest.fn().mockResolvedValue({
        tokenHash: 'hash',
        rawToken: createLicenseToken(license),
      }),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    licenseEvent: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
    $transaction: async (fn: any) => fn(prismaMock),
  };

  return prismaMock as unknown as PrismaService;
}

function createLicenseToken(license: {
  endDate: Date;
  companyId: string;
  plan: string;
}) {
  const payload = {
    company_id: license.companyId,
    plan: license.plan,
    start_date: new Date().toISOString(),
    end_date: license.endDate.toISOString(),
  };
  return jwt.sign(payload, 'secret');
}
