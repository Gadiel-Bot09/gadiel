import { PrismaClient, LicenseStatus } from '@prisma/client';
import * as argon from 'argon2';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { id: 'demo-company' },
    update: {},
    create: {
      id: 'demo-company',
      name: 'Empresa Demo Colombia',
      taxId: '900123456-7',
      timezone: 'America/Bogota',
      currency: 'COP',
    },
  });

  await prisma.branch.upsert({
    where: { id: 'demo-branch' },
    update: {},
    create: {
      id: 'demo-branch',
      name: 'Sede Bogotá',
      companyId: company.id,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {},
    create: {
      name: 'Administrador',
      slug: 'admin',
      companyId: company.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@gadielpos.com' },
    update: {},
    create: {
      email: 'admin@gadielpos.com',
      firstName: 'Admin',
      lastName: 'Principal',
      companyId: company.id,
      roleId: adminRole.id,
      passwordHash: await argon.hash('Cambiar123*'),
    },
  });

  const startDate = new Date();
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.license.upsert({
    where: { companyId: company.id },
    update: {
      plan: 'demo',
      status: LicenseStatus.ACTIVE,
      startDate,
      endDate,
    },
    create: {
      companyId: company.id,
      plan: 'demo',
      status: LicenseStatus.ACTIVE,
      startDate,
      endDate,
    },
  });

  const secret = process.env.LICENSE_JWT_SECRET ?? 'superlicensesecret';
  const licenseToken = jwt.sign(
    {
      company_id: company.id,
      plan: 'demo',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      features: { inventory: true, pos: true },
      seats: 5,
      max_branches: 3,
      nonce: 'seed-demo',
    },
    secret,
  );

  await prisma.licenseToken.create({
    data: {
      companyId: company.id,
      tokenHash: createHash('sha256').update(licenseToken).digest('hex'),
      rawToken: licenseToken,
      issuedAt: new Date(),
    },
  });

  await prisma.licenseEvent.create({
    data: {
      companyId: company.id,
      type: 'issued',
      metadata: {
        plan: 'demo',
        issuedAt: new Date().toISOString(),
      },
    },
  });

  console.info('Seed completado. Usuario admin@gadielpos.com / Cambiar123*');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
