import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  School, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Wallet, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  ShieldAlert,
  CheckCircle2,
  CreditCard,
  GitBranch
} from 'lucide-react';
import api from '../shared/api';

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  plan: any;
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

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [submittedReceipt, setSubmittedReceipt] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');

  useEffect(() => {
    const fetchProfileAndBranches = async () => {
      try {
        const response = await api.get('/auth/me');
        const userProfile = response.data;
        setProfile(userProfile);

        if (userProfile.role !== 'SUPER_ADMIN') {
          const tenantSlug = userProfile.tenant?.slug || 'oxford';
          const branchesRes = await api.get('/branches');
          const branchesData = branchesRes.data.map((b: any) => ({ id: b.id, name: b.name }));
          setBranches(branchesData);
          localStorage.setItem(`${tenantSlug}_branch_ids`, JSON.stringify(branchesData));

          // Validar activeBranch en localStorage
          const activeBranch = localStorage.getItem(`${tenantSlug}_academy_active_branch`);
          if (branchesData.length > 0) {
            const exists = branchesData.some((b: any) => b.id === activeBranch);
            if (!activeBranch || activeBranch === 'principal' || !exists) {
              localStorage.setItem(`${tenantSlug}_academy_active_branch`, branchesData[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Error cargando perfil o sucursales', err);
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndBranches();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión', err);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm">Cargando ERP...</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = profile?.role === 'SUPER_ADMIN';

  // Subscription gating check
  const tenantsList = (() => {
    try {
      const saved = localStorage.getItem('saas_tenants');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error parsing saas_tenants', e);
    }
    return [];
  })();
  const currentTenantSlug = profile?.tenant?.slug || 'oxford';
  const activeTenantData = tenantsList.find((t: any) => t.id === currentTenantSlug);

  const isSubActive = activeTenantData
    ? (activeTenantData.status === 'Activa')
    : (profile?.tenant?.subscription?.status === 'Activa');

  if (!isSuperAdmin && !isSubActive) {
    const paymentQrUrl = localStorage.getItem('saas_qr_url') || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PagoSaaSNextAcademy';
    const paymentAccounts = (() => {
      try {
        const saved = localStorage.getItem('saas_bank_accounts');
        if (saved && saved !== 'undefined' && saved !== 'null') {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error('Error parsing saas_bank_accounts', e);
      }
      return [
        { id: '1', bankName: 'Banco Nacional de Bolivia (BNB)', accountNumber: '100-2938481', ownerName: 'NextAcademy SRL', nitCi: '3029482029' },
        { id: '2', bankName: 'Banco Mercantil Santa Cruz', accountNumber: '401-29481920', ownerName: 'NextAcademy SRL', nitCi: '3029482029' },
      ];
    })();

    return (
      <div className="min-h-screen bg-[#030712] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
        {/* Lights decor */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full glow-blur-purple opacity-20 pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full glow-blur-blue opacity-20 pointer-events-none" />

        <div className="w-full max-w-3xl glass-panel rounded-3xl p-6 md:p-10 shadow-2xl relative z-10 border border-rose-500/20">
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <School className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-white text-2xl">NextAcademy</span>
          </div>

          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col sm:flex-row items-center gap-4 mb-8">
            <ShieldAlert className="h-12 w-12 text-rose-500 shrink-0" />
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-rose-400">¡ACCESO BLOQUEADO POR FALTA DE PAGO!</h3>
              <p className="text-sm text-rose-200/80 mt-1">La suscripción de tu instituto ha vencido o el pago no ha sido verificado. Por favor, regulariza tu cuenta para recuperar el acceso al sistema.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: QR and accounts */}
            <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pagar por Código QR</h4>
              
              <div className="flex flex-col items-center">
                <div className="p-3 bg-white rounded-xl mb-4 border border-gray-700 w-36 h-36 flex items-center justify-center">
                  <img src={paymentQrUrl} alt="QR de Pago" className="w-32 h-32 object-contain" />
                </div>
                <p className="text-[10px] text-gray-500 text-center">Escanea el código QR desde tu app bancaria para realizar el pago.</p>
              </div>
            </div>

            {/* Right: Transfer details and proof form */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gray-900/50 border border-gray-800 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cuentas para Transferencia</h4>
                <div className="space-y-3 max-h-[120px] overflow-y-auto pr-1">
                  {paymentAccounts.map((acc: any) => (
                    <div key={acc.id} className="text-xs border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                      <p className="font-bold text-gray-300">{acc.bankName}</p>
                      <p className="text-gray-400 mt-0.5">Cuenta: <span className="text-gray-200 font-medium">{acc.accountNumber}</span></p>
                      <p className="text-[10px] text-gray-500">Titular: {acc.ownerName} (NIT: {acc.nitCi})</p>
                    </div>
                  ))}
                </div>
              </div>

              {submittedReceipt ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                  <span>Comprobante enviado. Su cuenta será reactivada por el soporte pronto.</span>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!receiptNumber.trim()) return;
                    
                    const newReceipt = {
                      id: Date.now().toString(),
                      tenantSlug: currentTenantSlug,
                      tenantName: activeTenantData?.name || currentTenantSlug,
                      receiptNumber: receiptNumber.trim(),
                      submittedAt: new Date().toISOString(),
                      status: 'PENDIENTE'
                    };

                    const list = (() => {
                      try {
                        const saved = localStorage.getItem('saas_receipts');
                        if (saved && saved !== 'undefined' && saved !== 'null') {
                          const parsed = JSON.parse(saved);
                          if (Array.isArray(parsed)) return parsed;
                        }
                      } catch (e) {
                        console.error('Error parsing saas_receipts', e);
                      }
                      return [];
                    })();
                    list.unshift(newReceipt);
                    localStorage.setItem('saas_receipts', JSON.stringify(list));

                    setSubmittedReceipt(true);
                    setReceiptNumber('');
                    alert('Comprobante enviado con éxito. El Super Admin verificará tu pago.');
                  }} 
                  className="space-y-3"
                >
                  <label className="text-xs font-semibold text-gray-400 block">Número de Comprobante / Referencia de Transferencia</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      placeholder="Ej. 102934812"
                      className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    />
                    <button 
                      type="submit" 
                      className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500">Soporte: soporte@nextacademy.com</p>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer text-xs font-semibold"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = isSuperAdmin
    ? [
        { name: 'Suscripciones', path: '/dashboard/admin/subscriptions', icon: Users },
        { name: 'QR y Cuentas', path: '/dashboard/admin/qr', icon: Settings },
        { name: 'Comprobantes', path: '/dashboard/admin/receipts', icon: CreditCard },
      ]
    : [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Estudiantes', path: '/dashboard/students', icon: Users },
        { name: 'Cursos', path: '/dashboard/courses', icon: BookOpen },
        { name: 'Inscripciones y Pagos', path: '/dashboard/finance/payments', icon: CreditCard },
        { name: 'Caja Diaria', path: '/dashboard/finance', icon: Wallet },
        { name: 'Sucursales', path: '/dashboard/branches', icon: GitBranch },
        { name: 'Configuración', path: '/dashboard/settings', icon: Settings },
      ];

  return (
    <div className="min-h-screen bg-[#030712] flex overflow-hidden select-none">
      {/* Sidebar Desktop */}
      <aside 
        className={`hidden md:flex flex-col glass-panel border-r border-gray-800 transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <div className={`flex items-center gap-3 overflow-hidden ${!sidebarOpen && 'hidden'}`}>
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md min-w-[32px] flex items-center justify-center">
              <School className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white whitespace-nowrap truncate">NextAcademy</span>
          </div>
          {!sidebarOpen && (
             <div className="w-full flex justify-center">
               <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                 <School className="h-5 w-5 text-white" />
               </div>
             </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors absolute -right-3 top-5 bg-[#030712] border border-gray-700"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 min-w-[20px] ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
                {sidebarOpen && <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="h-8 w-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center min-w-[32px]">
              <User className="h-4 w-4 text-indigo-400" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-gray-200 truncate">{profile?.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{profile?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Luces decorativas de fondo globales para el ERP */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full glow-blur-purple opacity-5 pointer-events-none" />
        
        {/* Topbar */}
        <header className="h-16 glass-panel border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-400 hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div>
              <h2 className="text-sm font-bold text-white hidden sm:block">
                {isSuperAdmin ? 'Administración General SaaS' : (profile?.tenant?.name || 'Administración SaaS')}
              </h2>
              {!isSuperAdmin && (() => {
                const tenantSlug = profile?.tenant?.slug || 'oxford';
                const dynamicBranches = branches.length > 0 ? branches : (() => {
                  try {
                    const saved = localStorage.getItem(`${tenantSlug}_branch_ids`);
                    if (saved && saved !== 'undefined' && saved !== 'null') {
                      const parsed = JSON.parse(saved);
                      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                    }
                  } catch (e) { /* ignore */ }
                  // Fallback: single principal branch
                  return [{ id: 'principal', name: 'Sucursal Principal' }];
                })();
                return (
                  <select
                    value={localStorage.getItem(`${tenantSlug}_academy_active_branch`) || 'principal'}
                    onChange={(e) => {
                      localStorage.setItem(`${tenantSlug}_academy_active_branch`, e.target.value);
                      window.location.reload();
                    }}
                    className="text-[11px] px-2 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 outline-none focus:border-indigo-500/50 mt-1 cursor-pointer font-semibold"
                  >
                    {dynamicBranches.map(b => (
                      <option key={b.id} value={b.id} className="bg-gray-950 text-white">{b.name}</option>
                    ))}
                  </select>
                );
              })()}
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* Contenido de la Ruta actual (Outlet) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          <Outlet context={{ profile }} />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-64 max-w-[80%] bg-[#030712] border-r border-gray-800 flex flex-col h-full shadow-2xl">
            <div className="h-16 flex items-center px-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                  <School className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-white">NextAcademy</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
