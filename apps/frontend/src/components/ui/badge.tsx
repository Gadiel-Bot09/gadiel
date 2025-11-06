import { type ReactNode } from 'react';

import { cn } from '../../lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'destructive';
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const variantClass = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800/70 dark:text-slate-200',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
    destructive: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200',
  }[variant];

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variantClass)}>
      {children}
    </span>
  );
}
