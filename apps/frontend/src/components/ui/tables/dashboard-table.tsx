import { ColumnDef } from '@tanstack/react-table';

import { formatCOP } from '../../../lib/utils';
import { Badge } from '../badge';

export interface DashboardProductRow {
  product: string;
  category: string;
  margin: number;
  sales: number;
  stock: number;
}

export const dashboardColumns: ColumnDef<DashboardProductRow>[] = [
  {
    accessorKey: 'product',
    header: 'Producto',
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-slate-900 dark:text-slate-100">{row.original.product}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{row.original.category}</p>
      </div>
    ),
  },
  {
    accessorKey: 'sales',
    header: 'Ventas',
    cell: ({ row }) => <span className="font-medium">{formatCOP(row.original.sales)}</span>,
  },
  {
    accessorKey: 'margin',
    header: 'Margen',
    cell: ({ row }) => <Badge variant={row.original.margin > 0.4 ? 'success' : 'warning'}>{`${(row.original.margin * 100).toFixed(1)}%`}</Badge>,
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => (
      <Badge variant={row.original.stock < 10 ? 'destructive' : 'neutral'}>{row.original.stock}</Badge>
    ),
  },
];

export const dashboardRows: DashboardProductRow[] = [
  { product: 'Café orgánico 500g', category: 'Bebidas', margin: 0.52, sales: 420000, stock: 8 },
  { product: 'Empanada gourmet', category: 'Restaurante', margin: 0.36, sales: 215000, stock: 24 },
  { product: 'Queso mozzarella 1kg', category: 'Lácteos', margin: 0.41, sales: 362000, stock: 4 },
  { product: 'Té chai concentrado', category: 'Bebidas', margin: 0.47, sales: 189000, stock: 12 },
];
