import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';

import { formatCOP } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export interface ProductTableRow {
  id: string;
  name: string;
  price: number;
  taxable: boolean;
  sku?: string;
}

interface Handlers {
  onEdit: (product: ProductTableRow) => void;
  onDelete: (product: ProductTableRow) => void;
}

export const buildProductColumns = ({ onEdit, onDelete }: Handlers): ColumnDef<ProductTableRow>[] => [
  {
    accessorKey: 'name',
    header: 'Producto',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-slate-900 dark:text-slate-100">{row.original.name}</p>
        {row.original.sku ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">SKU: {row.original.sku}</p>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: 'price',
    header: 'Precio',
    cell: ({ row }) => <span className="font-semibold text-primary-600 dark:text-primary-200">{formatCOP(row.original.price)}</span>,
  },
  {
    accessorKey: 'taxable',
    header: 'IVA',
    cell: ({ row }) => (
      <Badge variant={row.original.taxable ? 'success' : 'neutral'}>
        {row.original.taxable ? 'Gravado (19%)' : 'Exento'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="primary"
          size="sm"
          className="flex items-center gap-2 text-white"
          onClick={() => onEdit(row.original)}
        >
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => onDelete(row.original)}
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      </div>
    ),
    enableSorting: false,
  },
];
