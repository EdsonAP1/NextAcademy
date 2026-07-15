import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Subscriptions from './pages/Subscriptions';
import Dashboard from './pages/Dashboard';

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

          {/* Rutas Protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Ruta 404 - Redirecciona a Pricing */}
          <Route path="*" element={<Navigate to="/pricing" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
