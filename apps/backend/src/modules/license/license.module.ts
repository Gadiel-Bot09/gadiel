import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { LicenseController } from './license.controller';
import { LicenseService } from './license.service';

@Module({
  imports: [PrismaModule],
  providers: [LicenseService],
  controllers: [LicenseController],
  exports: [LicenseService],
})
export class LicenseModule {}
