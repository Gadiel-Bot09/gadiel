import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Ventas POS</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Módulo en construcción. Incluye lector de código de barras, descuentos, multi pago y propinas.
        </p>
      </div>
      <Card className="flex flex-col items-start gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Usa el botón para registrar una venta rápida. Próximamente: cotizaciones, devoluciones, arqueos y cierre de caja.
        </p>
        <Button>Registrar venta rápida</Button>
      </Card>
    </div>
  );
}
