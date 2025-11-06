import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCOP(value: number) {
  const formatted = COP_FORMATTER.format(value);
  return `${formatted} COP`;
}

export function formatDate(date: string | Date) {
  const instance = typeof date === 'string' ? new Date(date) : date;
  return instance.toLocaleDateString('es-CO');
}
