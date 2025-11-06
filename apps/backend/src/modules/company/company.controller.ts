import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

import { CompanyService } from './company.service';

@Controller('api/company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('me')
  async getCompany(@Req() request: Request & { companyId: string }) {
    return this.companyService.findCompany(request.companyId);
  }
}
