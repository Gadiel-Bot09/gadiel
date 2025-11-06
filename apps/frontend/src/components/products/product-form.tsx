import { useState } from 'react';

import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

import { ProductTableRow } from './columns';

interface ProductFormProps {
  defaultValues?: Partial<ProductTableRow>;
  onSubmit: (values: { name: string; price: number; sku?: string; taxable: boolean }) => Promise<void> | void;
  submitting?: boolean;
}

export function ProductForm({ defaultValues, onSubmit, submitting }: ProductFormProps) {
  const [values, setValues] = useState({
    name: defaultValues?.name ?? '',
    price: defaultValues?.price?.toString() ?? '0',
    sku: defaultValues?.sku ?? '',
    taxable: defaultValues?.taxable ?? true,
  });

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({
          name: values.name,
          price: Number(values.price),
          sku: values.sku || undefined,
          taxable: values.taxable,
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Precio (COP)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={values.price}
          onChange={(event) => setValues((prev) => ({ ...prev, price: event.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sku">SKU</Label>
        <Input
          id="sku"
          value={values.sku}
          onChange={(event) => setValues((prev) => ({ ...prev, sku: event.target.value }))}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/40 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/40">
        <div>
          <Label htmlFor="taxable" className="font-medium">
            Producto gravado (IVA 19%)
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cambia automáticamente el cálculo de impuestos en el POS.
          </p>
        </div>
        <Switch
          id="taxable"
          checked={values.taxable}
          onCheckedChange={(checked) => setValues((prev) => ({ ...prev, taxable: checked }))}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-primary-500 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:opacity-70"
        disabled={submitting}
      >
        {submitting ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
}
