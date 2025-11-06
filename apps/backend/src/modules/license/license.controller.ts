import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { IsNotEmpty, IsString } from 'class-validator';

import { LicenseService } from './license.service';
import { LicenseValidation } from './license.types';

class ActivateLicenseDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

@Controller('api/licenses')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get('status')
  async status(@Req() request: Request & { companyId: string }): Promise<LicenseValidation> {
    return this.licenseService.validateLicense(request.companyId);
  }

  @Post('activate')
  async activate(
    @Req() request: Request & { companyId: string },
    @Body() body: ActivateLicenseDto,
  ): Promise<LicenseValidation> {
    return this.licenseService.activateLicense(request.companyId, body.token);
  }
}
