import { create } from 'zustand';

interface Company {
  id: string;
  name: string;
}

interface CompanyState {
  companies: Company[];
  currentCompanyId: string;
  setCompanies: (companies: Company[]) => void;
  setCompany: (id: string | undefined) => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  companies: [
    { id: 'demo-company', name: 'Empresa Demo' },
    { id: 'restaurante-demo', name: 'Restaurante Demo' },
  ],
  currentCompanyId: 'demo-company',
  setCompanies: (companies) => set({ companies }),
  setCompany: (id) => set((state) => ({ currentCompanyId: id ?? state.currentCompanyId })),
}));
