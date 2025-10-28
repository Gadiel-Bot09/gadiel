export type LicenseState = 'active' | 'expiring' | 'expired' | 'invalid' | 'grace';

export interface LicenseValidation {
  state: LicenseState;
  daysRemaining?: number;
  expiresAt?: Date;
  companyId: string;
  plan?: string;
  features?: Record<string, unknown>;
}
