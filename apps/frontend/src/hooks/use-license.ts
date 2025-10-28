import { useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

import { useCompanyStore } from '../store/company-store';
import { useLicenseStore } from '../store/license-store';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export function useLicenseStatus() {
  const { currentCompanyId } = useCompanyStore();
  const { status, loading, error, setError, setLoading, setStatus } = useLicenseStore();

  useEffect(() => {
    let isMounted = true;
    async function loadStatus() {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/licenses/status`, {
          headers: {
            'X-Company-Id': currentCompanyId,
          },
        });
        if (!isMounted) return;
        setStatus(response.data);
        setError(null);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError('No fue posible validar la licencia.');
        toast.error('No fue posible validar la licencia');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadStatus();
    const interval = setInterval(loadStatus, 60_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentCompanyId, setError, setLoading, setStatus]);

  return { status, loading, error };
}
