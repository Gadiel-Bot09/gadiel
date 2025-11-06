import { create } from 'zustand';

export type LicenseState = 'active' | 'expiring' | 'expired' | 'invalid' | 'grace';

export interface LicenseStatus {
  state: LicenseState;
  daysRemaining?: number;
  plan?: string;
  expiresAt?: string;
  features?: Record<string, unknown>;
}

interface LicenseStore {
  status: LicenseStatus | null;
  loading: boolean;
  error: string | null;
  setStatus: (status: LicenseStatus | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLicenseStore = create<LicenseStore>((set) => ({
  status: null,
  loading: false,
  error: null,
  setStatus: (status) => set({ status }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
