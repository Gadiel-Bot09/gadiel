import { Loader2 } from 'lucide-react';

import { cn } from '../../lib/utils';

interface LoaderProps {
  label?: string;
  className?: string;
}

export function Loader({ label = 'Cargando...', className }: LoaderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 text-primary-600 dark:text-primary-200', className)}>
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
