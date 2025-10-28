import { useMemo, useState } from 'react';
import { PlusCircle } from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { DataTable } from '../components/ui/data-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { ProductForm } from '../components/products/product-form';
import { buildProductColumns, ProductTableRow } from '../components/products/columns';
import { useProducts } from '../hooks/use-products';

export default function ProductsPage() {
  const { products, loading, createProduct, patchProduct, deleteProduct } = useProducts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [productEditing, setProductEditing] = useState<ProductTableRow | null>(null);

  const columns = useMemo(
    () =>
      buildProductColumns({
        onEdit: (product) => {
          setProductEditing(product);
          setIsFormOpen(true);
        },
        onDelete: (product) => {
          setProductEditing(product);
          setIsDeleteOpen(true);
          setConfirmation('');
        },
      }),
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Productos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gestiona tu catálogo con precios en $ COP e impuestos configurables.
          </p>
        </div>
        <Button
          onClick={() => {
            setProductEditing(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 shadow-lg shadow-primary-500/20"
        >
          <PlusCircle className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <DataTable columns={columns} data={products} loading={loading} />
        )}
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader
            title={productEditing ? 'Editar producto' : 'Nuevo producto'}
            description="Configura precios en pesos colombianos con impuestos locales."
          />
          <ProductForm
            defaultValues={productEditing ?? undefined}
            submitting={loading}
            onSubmit={async (values) => {
              if (productEditing) {
                await patchProduct(productEditing.id, values);
              } else {
                await createProduct(values);
              }
              setIsFormOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader
            title="Confirmar eliminación"
            description="Esta acción es irreversible. Escribe ELIMINAR para continuar."
          />
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-medium text-slate-900 dark:text-slate-100">{productEditing?.name}</p>
            <Input
              placeholder="Escribe ELIMINAR"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value.toUpperCase())}
              className="uppercase"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={confirmation !== 'ELIMINAR' || loading}
              onClick={async () => {
                if (!productEditing) return;
                await deleteProduct(productEditing.id, confirmation);
                setIsDeleteOpen(false);
              }}
            >
              Eliminar definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
