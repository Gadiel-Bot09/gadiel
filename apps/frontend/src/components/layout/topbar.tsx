import { useMemo } from 'react';
import { Building2, ChevronDown, Search } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useCompanyStore } from '../../store/company-store';

export function Topbar() {
  const { companies, currentCompanyId, setCompany } = useCompanyStore();
  const company = useMemo(() => companies.find((item) => item.id === currentCompanyId), [
    companies,
    currentCompanyId,
  ]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Buscar productos, clientes, ventas..." className="pl-10" />
        </div>
        <div className="hidden items-center gap-2 xl:flex">
          <QuickAction label="Nueva venta" />
          <QuickAction label="Nuevo gasto" variant="accent" />
          <QuickAction label="Reabastecer" variant="outline" />
        </div>
      </div>
      <div className="ml-6 flex items-center gap-4">
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80"
          disabled={companies.length === 0}
          onClick={() =>
            setCompany(
              companies.length
                ? companies[(Math.max(companies.findIndex((item) => item.id === company?.id), 0) + 1) % companies.length]
                    ?.id
                : undefined,
            )
          }
        >
          <Building2 className="h-4 w-4 text-primary-600 dark:text-primary-200" />
          <span className="text-sm font-semibold">
            {company?.name ?? 'Selecciona empresa'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {company?.name?.[0] ?? 'G'}
        </motion.div>
      </div>
    </header>
  );
}

function QuickAction({ label, variant = 'primary' }: { label: string; variant?: 'primary' | 'accent' | 'outline' }) {
  return (
    <Button variant={variant === 'outline' ? 'outline' : variant} size="sm" className="shadow-sm">
      {label}
    </Button>
  );
}
