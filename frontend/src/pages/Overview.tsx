import { useEffect } from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import { ShieldAlert, Sparkles, CreditCard, Calendar, Users, TrendingUp } from 'lucide-react';
import gsap from 'gsap';

interface UserProfile {
  name: string;
  role: string;
  tenant: {
    slug: string;
    subscription: any;
  } | null;
}

export default function Overview() {
  const { profile } = useOutletContext<{ profile: UserProfile }>();
  const isSuperAdmin = profile?.role === 'SUPER_ADMIN';

  // Plans fetch removed since unused
  useEffect(() => {
    if (isSuperAdmin) return;
    gsap.fromTo(
      '.gsap-dash-card',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
    );
  }, [isSuperAdmin]);

  if (isSuperAdmin) {
    return <Navigate to="/dashboard/admin/subscriptions" replace />;
  }

  const subscription = profile?.tenant?.subscription;
  const isDemo = profile?.tenant?.slug === 'oxford';

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Banner de Bienvenida */}
      <div className="glass-panel rounded-3xl p-8 mb-8 gsap-dash-card border border-indigo-500/10 bg-gradient-to-r from-indigo-950/15 via-transparent to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="h-3 w-3" /> Panel General
          </span>
          <h2 className="text-3xl font-extrabold text-white mb-1">
            Bienvenido, {profile?.name}
          </h2>
          <p className="text-gray-400 text-sm">
            Aquí tienes un resumen del estado actual de tu instituto y la suscripción activa.
          </p>
        </div>

        {isDemo && (
          <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold animate-float relative z-10">
            Modo Demostración Activo
          </div>
        )}
      </div>

      {/* Widgets Mocks (Nuevos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel rounded-2xl p-6 gsap-dash-card flex items-center gap-4">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Users className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Alumnos Activos</p>
            <h3 className="text-2xl font-bold text-white">{isDemo ? '1,248' : '0'}</h3>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-6 gsap-dash-card flex items-center gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ingresos del Mes</p>
            <h3 className="text-2xl font-bold text-white">{isDemo ? 'Bs. 45,200' : 'Bs. 0'}</h3>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-6 gsap-dash-card flex items-center gap-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <CreditCard className="h-6 w-6 text-rose-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mensualidades Pendientes</p>
            <h3 className="text-2xl font-bold text-white">{isDemo ? '32' : '0'}</h3>
          </div>
        </div>
      </div>

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
                {subscription.plan.features.modules.map((m: string) => (
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
    </div>
  );
}
