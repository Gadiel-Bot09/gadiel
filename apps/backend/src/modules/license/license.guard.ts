import { BadRequestException, CanActivate, ExecutionContext, Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

import { LicenseService } from './license.service';

@Injectable()
export class LicenseGuard implements CanActivate {
  private readonly logger = new Logger(LicenseGuard.name);

  constructor(private readonly licenseService: LicenseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { companyId?: string }>();
    const isAuthRoute = request.path?.startsWith('/api/auth');
    const isActivationRoute = request.path?.startsWith('/api/licenses/activate');

    if (isAuthRoute) {
      return true;
    }

    const companyId = this.extractCompanyId(request);
    request.companyId = companyId;

    if (isActivationRoute) {
      const validation = await this.licenseService.validateLicense(companyId);
      (request as unknown as { licenseValidation?: unknown }).licenseValidation = validation;
      return true;
    }

    const validation = await this.licenseService.validateHttpRequest(request, companyId);
    (request as unknown as { licenseValidation?: unknown }).licenseValidation = validation;

    if (validation.state === 'expired' || validation.state === 'invalid') {
      const method = request.method.toUpperCase();
      const isRead = ['GET', 'HEAD', 'OPTIONS'].includes(method);
      if (isRead) {
        return true;
      }
      this.logger.warn(`Bloqueo de petición por licencia (${validation.state}) en empresa ${companyId}`);
      throw new ForbiddenException('Licencia inválida o vencida.');
    }

    return true;
  }

  private extractCompanyId(request: Request): string {
    const header = request.headers['x-company-id'];
    const companyId = Array.isArray(header) ? header[0] : header;
    if (!companyId) {
      throw new BadRequestException('Encabezado X-Company-Id requerido');
    }
    return companyId;
  }
}
