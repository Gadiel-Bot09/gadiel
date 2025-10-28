import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './components/layout/app-layout';
import { Loader } from './components/ui/loader';

const DashboardPage = lazy(() => import('./pages/dashboard')); 
const ProductsPage = lazy(() => import('./pages/products'));
const LicensesPage = lazy(() => import('./pages/license'));
const SalesPage = lazy(() => import('./pages/sales'));

export default function App() {
  return (
    <AppLayout>
      <Suspense fallback={<Loader className="mt-20" label="Cargando módulo..." />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ventas" element={<SalesPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/configuracion/licencia" element={<LicensesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
