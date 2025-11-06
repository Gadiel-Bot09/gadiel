import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Settings, Wallet } from 'lucide-react';

import { cn } from '../../lib/utils';
import { ThemeToggle } from '../theme-toggle';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ventas', label: 'Ventas', icon: Wallet },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/configuracion/licencia', label: 'Licencia', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:flex">
      <div className="flex items-center justify-between px-6 py-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-300">
            Gadiel POS
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Retail &amp; Restaurantes</p>
        </div>
        <ThemeToggle />
      </div>
      <nav className="flex-1 space-y-1 px-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'text-slate-600 hover:bg-primary-50 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-slate-800/70',
              )
            }
          >
            <link.icon className="h-4 w-4" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-6 pb-6">
        <div className="rounded-xl bg-gradient-to-br from-primary-500/90 to-accent-500/80 p-4 text-white shadow-kpi">
          <p className="text-xs uppercase tracking-wider">Estado</p>
          <p className="text-sm font-semibold">Operación en línea</p>
          <p className="text-xs text-white/80">Zona horaria: America/Bogota</p>
        </div>
      </div>
    </aside>
  );
}
