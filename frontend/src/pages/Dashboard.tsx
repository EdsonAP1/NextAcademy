import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, User, Calendar, LogOut, CheckCircle2, ShieldAlert, Sparkles, CreditCard, RefreshCw } from 'lucide-react';
import api from '../shared/api';
import gsap from 'gsap';

interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: {
    students: number;
    courses: number;
    users: number;
    branches: number;
    modules: string[];
  };
}

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  plan: Plan;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    subscription: Subscription | null;
  } | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setProfile(response.data);
    } catch (err) {
      console.error('Error cargando perfil', err);
      navigate('/login');
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      setPlans(response.data);
    } catch (err) {
      console.error('Error cargando planes', err);
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchPlans()]);
      setLoading(false);
    };
    initDashboard();
  }, []);

  // Animaciones de carga de elementos
  useEffect(() => {
    if (!loading) {
      gsap.fromTo(
        '.gsap-dash-card',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [loading]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión', err);
    }
  };

  const handleChangePlan = async (planId: string) => {
    setChangingPlan(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/subscriptions/change', { planId });
      setSuccess(`¡Suscripción actualizada al ${response.data.plan.name} con éxito!`);
      // Recargar datos
      await fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar plan');
    } finally {
      setChangingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm">Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  const subscription = profile?.tenant?.subscription;
  const isDemo = profile?.tenant?.slug === 'oxford';

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden select-none pb-12">
      {/* Luces decorativas */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full glow-blur-purple opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full glow-blur-blue opacity-10 pointer-events-none" />

      {/* Barra de Navegación superior */}
      <nav className="glass-panel py-4 px-6 md:px-12 flex justify-between items-center relative z-20 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <School className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">
              {profile?.tenant?.name || 'Administración SaaS'}
            </h1>
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
              {profile?.role === 'SUPER_ADMIN' ? 'SaaS Super Admin' : 'Portal Administrativo'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900/50 border border-gray-800">
            <User className="h-4 w-4 text-indigo-400" />
            <span className="text-xs text-gray-300 font-medium">{profile?.name}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        {/* Banner de Bienvenida */}
        <div className="glass-panel rounded-3xl p-8 mb-8 gsap-dash-card border border-indigo-500/10 bg-gradient-to-r from-indigo-950/15 via-transparent to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-3">
              <Sparkles className="h-3 w-3" /> Dashboard Activo
            </span>
            <h2 className="text-3xl font-extrabold text-white mb-1">
              Bienvenido, {profile?.name}
            </h2>
            <p className="text-gray-400 text-sm">
              Aquí puedes ver los límites administrativos de tu instituto y gestionar tu suscripción.
            </p>
          </div>

          {isDemo && (
            <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold animate-float">
              Modo Demostración Activo (Oxford)
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-200 text-sm font-medium animate-float">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-green-950/30 border border-green-500/30 text-green-200 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            {success}
          </div>
        )}

        {/* Panel de Suscripción */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Card: Suscripción Activa */}
          <div className="glass-panel rounded-3xl p-6 md:col-span-2 gsap-dash-card flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2 mb-6">
                <CreditCard className="h-5 w-5 text-indigo-400" />
                Detalle de Suscripción
              </h3>

              {subscription ? (
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block uppercase">Plan Actual</span>
                    <span className="text-2xl font-extrabold text-indigo-400 block mt-1">
                      {subscription.plan.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-300 mt-1 block">
                      Bs. {subscription.plan.price} / mes
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 font-semibold block uppercase">Vencimiento</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4.5 w-4.5 text-gray-400" />
                      <span className="text-sm text-gray-300 font-semibold">
                        {new Date(subscription.endDate).toLocaleDateString('es-BO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider mt-3">
                      ✓ ACTIVA
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center gap-3">
                  <ShieldAlert className="h-10 w-10 text-red-400" />
                  <p className="text-sm text-red-200 font-semibold text-center">
                    No tienes una suscripción activa o tu instituto ha sido suspendido.
                  </p>
                </div>
              )}
            </div>

            {subscription && (
              <div className="pt-6 border-t border-gray-800">
                <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase">Habilitados en este plan:</h4>
                <div className="flex flex-wrap gap-2">
                  {subscription.plan.features.modules.map((m) => (
                    <span
                      key={m}
                      className="px-2.5 py-1 rounded-xl bg-gray-900/60 border border-gray-800 text-gray-400 text-xs font-medium"
                    >
                      {m === 'students' ? 'Alumnos' :
                       m === 'courses' ? 'Cursos' :
                       m === 'schedules' ? 'Horarios' :
                       m === 'payments' ? 'Pagos' :
                       m === 'cash-register' ? 'Caja' :
                       m === 'expenses' ? 'Gastos' :
                       m === 'reports' ? 'Reportes' :
                       m === 'audit' ? 'Auditoría' :
                       m === 'notifications' ? 'Notificaciones' :
                       m === 'settings' ? 'Configuración' : m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card: Límites Operativos */}
          <div className="glass-panel rounded-3xl p-6 gsap-dash-card">
            <h3 className="text-lg font-bold text-gray-200 mb-6">
              Límites del Plan
            </h3>

            {subscription ? (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2">
                    <span>Límite de Alumnos</span>
                    <span className="text-gray-300">
                      {subscription.plan.features.students === -1 ? 'Ilimitado' : subscription.plan.features.students}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: subscription.plan.features.students === -1 ? '100%' : '15%' }} // Demo 15% usado
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2">
                    <span>Límite de Sucursales</span>
                    <span className="text-gray-300">
                      {subscription.plan.features.branches === -1 ? 'Ilimitado' : subscription.plan.features.branches}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: subscription.plan.features.branches === -1 ? '100%' : '33%' }} // Demo 1 de 3 sucursales
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2">
                    <span>Límite de Usuarios</span>
                    <span className="text-gray-300">
                      {subscription.plan.features.users === -1 ? 'Ilimitado' : subscription.plan.features.users}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-pink-500 rounded-full"
                      style={{ width: subscription.plan.features.users === -1 ? '100%' : '20%' }} // Demo 1 usuario activo
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-6">Sin límites disponibles</p>
            )}
          </div>
        </div>

        {/* Sección: Cambiar Plan */}
        <div className="glass-panel rounded-3xl p-8 gsap-dash-card">
          <h3 className="text-xl font-bold text-gray-200 mb-2 flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 text-indigo-400 ${changingPlan ? 'animate-spin' : ''}`} />
            Cambiar de Plan de Suscripción
          </h3>
          <p className="text-gray-400 text-xs mb-8">
            Puedes cambiar de plan instantáneamente. Al actualizar, tu ciclo de facturación se renovará por 30 días para el nuevo plan seleccionado.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isActive = subscription?.plan?.id === p.id;
              
              return (
                <div
                  key={p.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-indigo-500/40 bg-indigo-950/10'
                      : 'border-gray-800 hover:border-gray-700 bg-gray-900/10'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-gray-200 text-sm mb-1">{p.name}</h4>
                    <span className="text-xs text-indigo-400 font-bold block mb-4">Bs. {p.price} / mes</span>
                    
                    <ul className="space-y-2.5 mb-6">
                      <li className="text-[11px] text-gray-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500/80" />
                        {p.features.students === -1 ? 'Alumnos ilimitados' : `${p.features.students} alumnos`}
                      </li>
                      <li className="text-[11px] text-gray-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500/80" />
                        {p.features.branches === -1 ? 'Sucursales ilimitadas' : `${p.features.branches} sucursal${p.features.branches > 1 ? 'es' : ''}`}
                      </li>
                    </ul>
                  </div>

                  <button
                    disabled={isActive || changingPlan}
                    onClick={() => handleChangePlan(p.id)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 cursor-default'
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                    }`}
                  >
                    {isActive ? 'Plan Activo' : 'Seleccionar Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
