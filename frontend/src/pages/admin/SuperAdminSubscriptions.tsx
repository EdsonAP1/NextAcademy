import { useState, useEffect } from 'react';
import { Users, Calendar, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../../shared/api';
import gsap from 'gsap';

interface Tenant {
  id: string; // slug
  dbId: string; // UUID from DB
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword?: string;
  planName: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: string;
  dbStatus: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
}

export default function SuperAdminSubscriptions() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tenantStatus, setTenantStatus] = useState('ACTIVE');
  const [daysToAdd, setDaysToAdd] = useState<{ [key: string]: string }>({});

  const fetchTenants = async () => {
    try {
      const response = await api.get('/auth/admin/tenants');
      const mapped = response.data.map((t: any) => {
        const owner = t.users[0] || {};
        const sub = t.subscriptions[0] || {};
        const plan = sub.plan || {};
        return {
          id: t.slug,
          dbId: t.id,
          name: t.name,
          ownerName: owner.name || 'Sin dueño',
          ownerEmail: owner.email || '',
          ownerPassword: owner.plainPassword || '********', // Read real plainPassword from database!
          planName: plan.name || 'Sin plan',
          planId: plan.id || '',
          startDate: sub.startDate ? sub.startDate.split('T')[0] : '',
          endDate: sub.endDate ? sub.endDate.split('T')[0] : '',
          status: t.status === 'ACTIVE' && new Date(sub.endDate) >= new Date() ? 'Activa' : 'Vencida',
          dbStatus: t.status
        };
      });
      setTenants(mapped);
      // Synchronize saas_tenants in localStorage for client-side pages to read
      localStorage.setItem('saas_tenants', JSON.stringify(mapped));
    } catch (err) {
      console.error('Error al cargar clientes de base de datos', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      setPlans(response.data);
      if (response.data.length > 0) {
        setSelectedPlanId(response.data[0].id);
      }
    } catch (err) {
      console.error('Error al cargar planes de base de datos', err);
    }
  };

  useEffect(() => {
    fetchTenants();
    fetchPlans();
  }, []);

  useEffect(() => {
    if (tenants.length > 0) {
      gsap.fromTo(
        '.gsap-admin-row',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [tenants]);

  const handleOpenAddModal = () => {
    setEditingTenant(null);
    setName('');
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPassword('123456');
    setTenantStatus('ACTIVE');
    if (plans.length > 0) setSelectedPlanId(plans[0].id);
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setName(tenant.name);
    setOwnerName(tenant.ownerName);
    setOwnerEmail(tenant.ownerEmail);
    setOwnerPassword(tenant.ownerPassword && tenant.ownerPassword !== '********' ? tenant.ownerPassword : ''); // Prefill if readable
    setSelectedPlanId(tenant.planId);
    setEndDate(tenant.endDate);
    setTenantStatus(tenant.dbStatus);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTenant) {
        // Update all data on backend
        await api.post('/auth/update-tenant-user', {
          tenantSlug: editingTenant.id,
          email: ownerEmail,
          pass: ownerPassword || undefined, // Send only if typed
          name: ownerName,
          status: tenantStatus,
          planId: selectedPlanId,
          endDate: new Date(endDate + 'T12:00:00').toISOString()
        });
        alert('Datos y credenciales del instituto actualizados con éxito.');
      } else {
        // Create new tenant on backend
        await api.post('/auth/admin/tenants', {
          name,
          ownerName,
          ownerEmail,
          pass: ownerPassword,
          planId: selectedPlanId,
          endDate: new Date(endDate + 'T12:00:00').toISOString()
        });
        alert('Instituto registrado y enlazado con éxito en la base de datos.');
      }
      setIsModalOpen(false);
      fetchTenants();
    } catch (err: any) {
      console.error('Error al guardar datos:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExtendDays = async (tenant: Tenant) => {
    const daysStr = daysToAdd[tenant.dbId] || '30';
    const days = parseInt(daysStr, 10);
    if (isNaN(days) || days <= 0) return;

    try {
      await api.post('/auth/admin/tenants/extend', {
        tenantId: tenant.dbId,
        days
      });
      alert(`Suscripción de ${tenant.name} extendida por ${days} días.`);
      fetchTenants();
    } catch (err: any) {
      console.error('Error al extender suscripción:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteTenant = async (dbId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar permanentemente este instituto de la base de datos?')) {
      try {
        await api.post('/auth/admin/tenants/delete', { tenantId: dbId });
        alert('Instituto eliminado correctamente.');
        fetchTenants();
      } catch (err: any) {
        console.error('Error al eliminar instituto:', err);
        alert('Error: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            Administración de Suscripciones SaaS
          </h2>
          <p className="text-sm text-gray-400 mt-1">Controla los accesos, planes, credenciales, estados e inquilinos registrados en la plataforma.</p>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Registrar Instituto
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Cargando suscripciones...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 font-semibold px-4">Instituto / Cliente</th>
                  <th className="pb-3 font-semibold px-4">Plan Actual</th>
                  <th className="pb-3 font-semibold px-4">Vigencia</th>
                  <th className="pb-3 font-semibold px-4">Estado</th>
                  <th className="pb-3 font-semibold px-4">Extender Días</th>
                  <th className="pb-3 font-semibold px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {tenants.map(t => {
                  const isActive = t.status === 'Activa';
                  
                  return (
                    <tr key={t.id} className="gsap-admin-row border-b border-gray-800/50 hover:bg-gray-800/10 transition-colors group">
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-200">{t.name.toUpperCase()}</span>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span>{t.ownerName.toUpperCase()} ({t.ownerEmail.toLowerCase()})</span>
                            <span className="px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] text-indigo-400 font-mono">
                              Pass: {t.ownerPassword}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-indigo-400 font-semibold text-xs px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/15">
                          {t.planName}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <Calendar className="h-3.5 w-3.5 text-gray-500" />
                            <span>Hasta: {new Date(t.endDate + 'T12:00:00').toLocaleDateString('es-BO')}</span>
                          </div>
                          {(() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const end = new Date(t.endDate + 'T12:00:00');
                            end.setHours(0, 0, 0, 0);
                            const diffTime = end.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays > 0) {
                              return (
                                <span className="text-[10px] text-green-400 font-semibold bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-md w-fit">
                                  Quedan {diffDays} días
                                </span>
                              );
                            } else if (diffDays === 0) {
                              return (
                                <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md w-fit">
                                  Vence hoy
                                </span>
                              );
                            } else {
                              return (
                                <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-md w-fit">
                                  Expiró hace {Math.abs(diffDays)} días
                                </span>
                              );
                            }
                          })()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {t.status}
                        </span>
                        {t.dbStatus === 'SUSPENDED' && (
                          <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] bg-red-500/20 text-red-300 font-semibold uppercase">
                            SUSPENDIDO
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            placeholder="Días"
                            value={daysToAdd[t.dbId] || '30'}
                            onChange={(e) => setDaysToAdd(prev => ({ ...prev, [t.dbId]: e.target.value }))}
                            className="w-16 px-2 py-1 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
                          />
                          <button 
                            onClick={() => handleExtendDays(t)}
                            className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                          >
                            + Añadir
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEditModal(t)}
                            className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTenant(t.dbId)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No se encontraron inquilinos registrados en la base de datos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Registrar / Editar Instituto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">
              {editingTenant ? 'Administrar Instituto' : 'Registrar Instituto'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Nombre del Instituto</label>
                <input 
                  type="text" 
                  required
                  disabled={!!editingTenant}
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  placeholder="Ej. Instituto Cambridge"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Nombre del Propietario</label>
                <input 
                  type="text" 
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value.toUpperCase())}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Correo del Propietario</label>
                  <input 
                    type="email" 
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value.toLowerCase())}
                    placeholder="propietario@email.com"
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">
                    {editingTenant ? 'Contraseña (Opcional)' : 'Contraseña'}
                  </label>
                  <input 
                    type="text" 
                    required={!editingTenant}
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder={editingTenant ? 'Dejar vacío para mantener' : 'Contraseña'}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Estado del Acceso</label>
                  <select 
                    value={tenantStatus}
                    onChange={(e) => setTenantStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer text-white"
                  >
                    <option value="ACTIVE" className="bg-gray-900 text-white">Activo</option>
                    <option value="SUSPENDED" className="bg-gray-900 text-white">Suspendido (Bloqueado)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Plan de Suscripción</label>
                  <select 
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer text-white"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id} className="bg-gray-900 text-white">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Fecha de Vencimiento de Suscripción</label>
                <input 
                  type="date" 
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-colors cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
