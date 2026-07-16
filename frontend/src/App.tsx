import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Subscriptions from './pages/Subscriptions';
import Overview from './pages/Overview';
const StudentsList = lazy(() => import('./pages/students/StudentsList'));
const CoursesList = lazy(() => import('./pages/courses/CoursesList'));
const CashRegister = lazy(() => import('./pages/finance/CashRegister'));
const Payments = lazy(() => import('./pages/finance/Payments'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const SuperAdminSubscriptions = lazy(() => import('./pages/admin/SuperAdminSubscriptions'));
const SuperAdminQR = lazy(() => import('./pages/admin/SuperAdminQR'));
const SuperAdminReceipts = lazy(() => import('./pages/admin/SuperAdminReceipts'));
const BranchManagement = lazy(() => import('./pages/branches/BranchManagement'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Componente para proteger la ruta del Dashboard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Componente para evitar ir a login si ya estás logueado
function AuthRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('user');
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={
          <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <p className="text-gray-400 text-xs font-semibold tracking-wider uppercase animate-pulse">Cargando Academia...</p>
          </div>
        }>
          <Routes>
            {/* Ruta Raíz */}
            <Route path="/" element={<Navigate to="/pricing" replace />} />

            {/* Rutas Públicas */}
            <Route path="/pricing" element={<Subscriptions />} />
            
            {/* Rutas de Autenticación (Bloqueadas si ya estás logueado) */}
            <Route 
              path="/login" 
              element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              } 
            />

            {/* Rutas Protegidas (Dashboard ERP) */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Sub-rutas del Dashboard */}
              <Route index element={<Overview />} />
              <Route path="students" element={<StudentsList />} />
              <Route path="courses" element={<CoursesList />} />
              <Route path="finance">
                <Route index element={<CashRegister />} />
                <Route path="payments" element={<Payments />} />
              </Route>
              <Route path="settings" element={<Settings />} />
              <Route path="branches" element={<BranchManagement />} />
              {/* Rutas de Super Admin */}
              <Route path="admin/subscriptions" element={<SuperAdminSubscriptions />} />
              <Route path="admin/qr" element={<SuperAdminQR />} />
              <Route path="admin/receipts" element={<SuperAdminReceipts />} />
            </Route>

            {/* Ruta 404 - Redirecciona a Pricing */}
            <Route path="*" element={<Navigate to="/pricing" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
}
