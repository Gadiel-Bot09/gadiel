import { TrendingUp, Users, ShoppingBag, AlertTriangle, ArrowUpRight, PiggyBank } from 'lucide-react';
import { motion } from 'framer-motion';

import { formatCOP } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { DataTable } from '../components/ui/data-table';
import { dashboardColumns, dashboardRows } from '../components/ui/tables/dashboard-table';

export default function DashboardPage() {
  const kpis = [
    {
      label: 'Ventas (30d)',
      value: formatCOP(1250500),
      trend: '+18.2%',
      icon: TrendingUp,
      gradient: 'from-primary-500/90 to-primary-700/80',
    },
    {
      label: 'Ticket promedio',
      value: formatCOP(56200),
      trend: '+5.4%',
      icon: ShoppingBag,
      gradient: 'from-accent-500/90 to-primary-500/70',
    },
    {
      label: 'Clientes activos',
      value: '1.245',
      trend: '+3.1%',
      icon: Users,
      gradient: 'from-primary-500/80 to-slate-900/80',
    },
    {
      label: 'Margen bruto',
      value: '42.5%',
      trend: '+1.8%',
      icon: PiggyBank,
      gradient: 'from-emerald-500/90 to-primary-600/80',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-4 lg:grid-cols-4"
      >
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className={`relative overflow-hidden border-0 bg-gradient-to-br ${kpi.gradient} text-white shadow-kpi`}
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-3xl" />
            <kpi.icon className="h-6 w-6" />
            <p className="mt-3 text-xs uppercase tracking-wider opacity-80">{kpi.label}</p>
            <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
            <span className="mt-4 inline-flex items-center text-xs font-semibold text-white/80">
              <ArrowUpRight className="mr-1 h-4 w-4" /> {kpi.trend}
            </span>
          </Card>
        ))}
      </motion.section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Top productos</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Por margen y rotación en los últimos 30 días
              </p>
            </div>
            <Button variant="outline" size="sm">
              Ver inventario
            </Button>
          </div>
          <div className="mt-4">
            <DataTable columns={dashboardColumns} data={dashboardRows} />
          </div>
        </Card>
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Alertas de stock</h2>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-amber-50 p-3 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
              <p className="font-semibold">Café orgánico 500g</p>
              <p>Stock en sede Bogotá: 5 unidades</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-500/20 dark:text-red-200">
              <p className="font-semibold">Queso mozzarella 1kg</p>
              <p>Stock crítico · Reabastecer hoy</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
