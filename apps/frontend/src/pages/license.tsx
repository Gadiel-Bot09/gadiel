import { useState } from 'react';
import { ShieldCheck, ShieldOff, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';

import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { useLicenseStatus } from '../hooks/use-license';
import { useCompanyStore } from '../store/company-store';
import { useLicenseStore } from '../store/license-store';
import { formatDate } from '../lib/utils';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export default function LicensePage() {
  const { status, loading } = useLicenseStatus();
  const setStatus = useLicenseStore((state) => state.setStatus);
  const { currentCompanyId } = useCompanyStore();
  const [token, setToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const Icon = status?.state === 'active' || status?.state === 'expiring' ? ShieldCheck : ShieldOff;

  async function activateLicense() {
    try {
      setSubmitting(true);
      const response = await axios.post(
        `${API_URL}/licenses/activate`,
        { token },
        {
          headers: {
            'X-Company-Id': currentCompanyId,
          },
        },
      );
      toast.success('Licencia activada correctamente');
      setToken('');
      setStatus(response.data);
    } catch (err) {
      console.error(err);
      toast.error('No fue posible activar la licencia');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Licencia</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Activa tu licencia para continuar operando sin restricciones.
        </p>
      </div>

      <Card className="space-y-6">
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 md:flex-row"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <Icon className="h-10 w-10 text-primary-500" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Estado de la licencia
                  </p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                    {status?.state.toUpperCase() ?? 'SIN LICENCIA'}
                  </p>
                </div>
              </div>
              <dl className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                <div>
                  <dt className="font-semibold">Plan</dt>
                  <dd>{status?.plan ?? 'No disponible'}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Vigencia</dt>
                  <dd>{status?.expiresAt ? formatDate(status.expiresAt) : 'No disponible'}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Días restantes</dt>
                  <dd>{status?.daysRemaining ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Modo</dt>
                  <dd>{status?.state === 'grace' ? 'Gracia offline' : 'Operación normal'}</dd>
                </div>
              </dl>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => toast.message('Historial próximamente')}>
                  Ver historial
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  className="inline-flex items-center gap-2"
                  onClick={() => toast.message('Reemplazo de licencia próximamente')}
                >
                  <RefreshCw className="h-4 w-4" /> Reemplazar licencia
                </Button>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Activar/Reactivar</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pega el código firmado proporcionado por el equipo de soporte para activar tu licencia.
              </p>
              <textarea
                value={token}
                onChange={(event) => setToken(event.target.value)}
                rows={6}
                className="w-full rounded-lg border border-slate-200 bg-white/80 p-3 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <div className="flex justify-end">
                <Button onClick={activateLicense} disabled={!token || submitting}>
                  {submitting ? 'Validando...' : 'Activar licencia'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
