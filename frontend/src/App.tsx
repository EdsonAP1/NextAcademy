import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Subscriptions from './pages/Subscriptions';
import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/Overview';
import StudentsList from './pages/students/StudentsList';
import CoursesList from './pages/courses/CoursesList';
import CashRegister from './pages/finance/CashRegister';
import Payments from './pages/finance/Payments';
import Settings from './pages/settings/Settings';
import SuperAdminSubscriptions from './pages/admin/SuperAdminSubscriptions';
import SuperAdminQR from './pages/admin/SuperAdminQR';
import SuperAdminReceipts from './pages/admin/SuperAdminReceipts';

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
            {/* Rutas de Super Admin */}
            <Route path="admin/subscriptions" element={<SuperAdminSubscriptions />} />
            <Route path="admin/qr" element={<SuperAdminQR />} />
            <Route path="admin/receipts" element={<SuperAdminReceipts />} />
          </Route>

          {/* Ruta 404 - Redirecciona a Pricing */}
          <Route path="*" element={<Navigate to="/pricing" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
