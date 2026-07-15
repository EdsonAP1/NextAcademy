import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Settings as SettingsIcon, Building2, CreditCard, Users, ShieldAlert, CheckCircle2, Plus, Edit, Trash2, X } from 'lucide-react';
import gsap from 'gsap';

interface UserProfile {
  name: string;
  role: string;
  tenant: {
    name: string;
    slug?: string;
    subscription: any;
  };
}

interface Branch {
  id: number;
  name: string;
  address: string;
  status: string;
}

interface UserItem {
  id: number;
  name: string;
  role: string;
  email: string;
}

export default function Settings() {
  const { profile } = useOutletContext<{ profile: any }>();
  const isDemo = profile?.tenant?.slug === 'oxford';
  const [activeTab, setActiveTab] = useState('branches');

  // Stateful Mock Data
  const [branches, setBranches] = useState<Branch[]>(() => {
    if (!isDemo) return [];
    return [
      { id: 1, name: 'Sede Central - Sopocachi', address: 'Av. 20 de Octubre #1234', status: 'Activa' },
      { id: 2, name: 'Sucursal Sur - Calacoto', address: 'Av. Ballivián #5678', status: 'Activa' },
    ];
  });

  const [users, setUsers] = useState<UserItem[]>(() => {
    if (!isDemo) return [];
    return [
      { id: 1, name: 'Juan Pérez', role: 'Administrador', email: 'juan@instituto.edu' },
      { id: 2, name: 'Ana Fernández', role: 'Secretaria (Central)', email: 'ana@instituto.edu' },
    ];
  });

  // Modal states
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchStatus, setBranchStatus] = useState('Activa');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('Secretaria');

  useEffect(() => {
    gsap.fromTo(
      '.gsap-settings-card',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
    );
  }, [activeTab, branches, users]);

  // Branch CRUD
  const handleDeleteBranch = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta sucursal?')) {
      setBranches(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchName('');
    setBranchAddress('');
    setBranchStatus('Activa');
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchName(branch.name);
    setBranchAddress(branch.address);
    setBranchStatus(branch.status);
    setIsBranchModalOpen(true);
  };

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      setBranches(prev => prev.map(b => b.id === editingBranch.id ? {
        ...b,
        name: branchName,
        address: branchAddress,
        status: branchStatus
      } : b));
    } else {
      const newBranch = {
        id: Date.now(),
        name: branchName,
        address: branchAddress,
        status: branchStatus
      };
      setBranches(prev => [...prev, newBranch]);
    }
    setIsBranchModalOpen(false);
  };

  // User CRUD
  const handleDeleteUser = (id: number) => {
    if (confirm('¿Estás seguro de que deseas revocar el acceso a este usuario?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserRole('Secretaria');
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: UserItem) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserRole(user.role);
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        name: userName,
        email: userEmail,
        role: userRole
      } : u));
    } else {
      const newUser = {
        id: Date.now(),
        name: userName,
        email: userEmail,
        role: userRole
      };
      setUsers(prev => [...prev, newUser]);
    }
    setIsUserModalOpen(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-indigo-400" />
          Configuración del Instituto
        </h2>
        <p className="text-sm text-gray-400 mt-1">Administra sucursales, personal y suscripción de {profile?.tenant?.name}.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Settings */}
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('branches')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm cursor-pointer ${
              activeTab === 'branches' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:bg-gray-900/80 hover:text-gray-200'
            }`}
          >
            <Building2 className="h-5 w-5" />
            Sucursales
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm cursor-pointer ${
              activeTab === 'users' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:bg-gray-900/80 hover:text-gray-200'
            }`}
          >
            <Users className="h-5 w-5" />
            Personal
          </button>
          <button 
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm cursor-pointer ${
              activeTab === 'subscription' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:bg-gray-900/80 hover:text-gray-200'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            Suscripción
          </button>
        </div>

        {/* Content Settings */}
        <div className="flex-1">
          {activeTab === 'branches' && (
            <div className="gsap-settings-card glass-panel rounded-3xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Gestión de Sucursales</h3>
                  <p className="text-xs text-gray-400 mt-1">Administra las ubicaciones físicas de tu instituto.</p>
                </div>
                <button 
                  onClick={handleOpenAddBranch}
                  className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors border border-indigo-500/20 cursor-pointer"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {branches.map(b => (
                  <div key={b.id} className="p-4 rounded-2xl bg-gray-900/50 border border-gray-800 flex justify-between items-center group hover:border-gray-700 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-200">{b.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{b.address}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'Activa' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {b.status}
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEditBranch(b)}
                          className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBranch(b.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {branches.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-sm">No hay sucursales configuradas.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="gsap-settings-card glass-panel rounded-3xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Personal Administrativo</h3>
                  <p className="text-xs text-gray-400 mt-1">Otorga accesos y roles al personal de las sucursales.</p>
                </div>
                <button 
                  onClick={handleOpenAddUser}
                  className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors border border-indigo-500/20 cursor-pointer"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {users.map(u => (
                  <div key={u.id} className="p-4 rounded-2xl bg-gray-900/50 border border-gray-800 flex justify-between items-center group hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-300 font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-200">{u.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 font-medium">{u.role}</span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-sm">No hay personal administrativo registrado.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (() => {
            const paymentQrUrl = localStorage.getItem('saas_qr_url') || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PagoSaaSNextAcademy';
            const paymentAccounts = (() => {
              const saved = localStorage.getItem('saas_bank_accounts');
              if (saved) return JSON.parse(saved);
              return [
                { id: '1', bankName: 'Banco Nacional de Bolivia (BNB)', accountNumber: '100-2938481', ownerName: 'NextAcademy SRL', nitCi: '3029482029' },
                { id: '2', bankName: 'Banco Mercantil Santa Cruz', accountNumber: '401-29481920', ownerName: 'NextAcademy SRL', nitCi: '3029482029' },
              ];
            })();

            const savedTenants = localStorage.getItem('saas_tenants');
            const tenantsList = savedTenants ? JSON.parse(savedTenants) : [];
            const currentTenantSlug = profile?.tenant?.slug || 'oxford';
            const activeTenantData = tenantsList.find((t: any) => t.id === currentTenantSlug);

            const displayPlanName = activeTenantData ? activeTenantData.planName : (profile?.tenant?.subscription?.plan?.name || 'Plan Esencial');
            const displayPlanPrice = displayPlanName === 'Plan Avanzado' ? 500 : displayPlanName === 'Plan Corporativo' ? 1000 : 250;
            const displayEndDate = activeTenantData ? activeTenantData.endDate : (profile?.tenant?.subscription?.endDate || '2026-07-31');
            const isSubActive = activeTenantData ? (activeTenantData.status === 'Activa') : (profile?.tenant?.subscription?.status === 'Activa');

            return (
              <div className="gsap-settings-card glass-panel rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-bold text-white mb-6">Detalles de Suscripción</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Plan Details */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
                      <div className="flex justify-between items-start mb-6 pb-6 border-b border-indigo-500/10">
                        <div>
                          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1 block">Plan Actual</span>
                          <h4 className="text-2xl font-bold text-white">{displayPlanName}</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isSubActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <CheckCircle2 className="h-4 w-4" /> {isSubActive ? 'Activa' : 'Vencida'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                        <div>
                          <p className="text-gray-500 font-medium">Costo</p>
                          <p className="text-gray-200 font-bold">Bs. {displayPlanPrice} / mes</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Vencimiento</p>
                          <p className="text-gray-200 font-bold">{new Date(displayEndDate).toLocaleDateString('es-BO')}</p>
                        </div>
                      </div>
                    </div>

                    {!isSubActive && (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                        <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
                        <div>
                          <h4 className="font-bold text-rose-400 text-xs">Suscripción Expirada</h4>
                          <p className="text-[11px] text-rose-300/80 mt-0.5">Realice el pago utilizando los métodos de la derecha y envíe el comprobante al soporte.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Payment Instructions (SaaS Configured Accounts) */}
                  <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800 space-y-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Instrucciones de Pago / Renovación</h4>
                    
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                      <div className="p-3 bg-white rounded-xl border border-gray-700 w-32 h-32 shrink-0 flex items-center justify-center">
                        <img src={paymentQrUrl} alt="SaaS QR de Pago" className="w-28 h-28 object-contain" />
                      </div>
                      <div className="space-y-4 flex-1">
                        <p className="text-xs text-gray-400 font-medium">Transfiere a cualquiera de las siguientes cuentas y envía tu comprobante.</p>
                        
                        <div className="space-y-3">
                          {paymentAccounts.map((acc: any) => (
                            <div key={acc.id} className="text-xs border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                              <p className="font-bold text-gray-300">{acc.bankName}</p>
                              <p className="text-gray-400 mt-0.5">Cuenta: <span className="text-gray-200 font-medium">{acc.accountNumber}</span></p>
                              <p className="text-gray-500 text-[10px]">Titular: {acc.ownerName} (NIT: {acc.nitCi})</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Modal - Branch CRUD */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative">
            <button 
              onClick={() => setIsBranchModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">
              {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
            </h3>

            <form onSubmit={handleBranchSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Nombre de la Sucursal</label>
                <input 
                  type="text" 
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Ej. Sede Central - Sopocachi"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Dirección</label>
                <input 
                  type="text" 
                  required
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="Ej. Av. 20 de Octubre #1234"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Estado</label>
                <select 
                  value={branchStatus}
                  onChange={(e) => setBranchStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                >
                  <option value="Activa" className="bg-gray-900 text-white">Activa</option>
                  <option value="Inactiva" className="bg-gray-900 text-white">Inactiva</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-colors cursor-pointer"
                >
                  {editingBranch ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - User CRUD */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative">
            <button 
              onClick={() => setIsUserModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">
              {editingUser ? 'Editar Personal' : 'Nuevo Personal'}
            </h3>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ej. Ana Fernández"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="ejemplo@instituto.edu"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Rol / Cargo</label>
                <select 
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                >
                  <option value="Administrador" className="bg-gray-900 text-white">Administrador</option>
                  <option value="Secretaria" className="bg-gray-900 text-white">Secretaria</option>
                  <option value="Secretaria (Central)" className="bg-gray-900 text-white">Secretaria (Central)</option>
                  <option value="Secretaria (Auxiliar)" className="bg-gray-900 text-white">Secretaria (Auxiliar)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-colors cursor-pointer"
                >
                  {editingUser ? 'Guardar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
