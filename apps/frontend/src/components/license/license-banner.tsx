import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { useLicenseStatus } from '../../hooks/use-license';
import { formatDate } from '../../lib/utils';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export function LicenseBanner() {
  const { status, loading } = useLicenseStatus();

  if (loading) {
    return (
      <div className="border-b border-slate-200 bg-white/60 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!status) return null;

  const isInactive = status.state === 'expired' || status.state === 'invalid';
  const Icon = isInactive ? ShieldAlert : status.state === 'expiring' ? AlertTriangle : CheckCircle2;
  const variantClass = isInactive
    ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-200'
    : status.state === 'expiring'
    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200'
    : 'bg-accent-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-wrap items-center justify-between gap-4 border-b border-transparent px-6 py-3 text-sm ${variantClass}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <div>
          <p className="font-semibold uppercase tracking-wide">Licencia {status.state.toUpperCase()}</p>
          {status.expiresAt && (
            <p className="text-xs opacity-80">
              Vigencia hasta {formatDate(status.expiresAt)} · Plan {status.plan ?? '—'}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {status.daysRemaining !== undefined && (
          <span className="rounded-full bg-white/40 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-white">
            {status.daysRemaining} días restantes
          </span>
        )}
        <Button asChild variant={isInactive ? 'accent' : 'outline'} size="sm">
          <Link to="/configuracion/licencia">Gestionar licencia</Link>
        </Button>
      </div>
    </motion.div>
  );
}
