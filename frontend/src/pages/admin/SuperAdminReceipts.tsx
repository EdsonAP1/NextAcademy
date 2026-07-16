import { useState, useEffect } from 'react';
import { Check, X as RejectIcon, Clock, CreditCard } from 'lucide-react';
import api from '../../shared/api';
import gsap from 'gsap';

interface Receipt {
  id: string;
  tenantSlug: string;
  tenantName: string;
  receiptNumber: string;
  submittedAt: string;
  status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
}

export default function SuperAdminReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [, setRefreshKey] = useState(0); // to force re-render timeago

  const loadReceipts = () => {
    try {
      const saved = localStorage.getItem('saas_receipts');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setReceipts(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Error loading receipts', e);
    }
    // Load mock receipt for display if empty
      const mockReceipts: Receipt[] = [
        {
          id: 'mock-1',
          tenantSlug: 'oxford',
          tenantName: 'Instituto de Idiomas Oxford',
          receiptNumber: 'BCE-920491',
          submittedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          status: 'PENDIENTE'
        }
      ];
      localStorage.setItem('saas_receipts', JSON.stringify(mockReceipts));
      setReceipts(mockReceipts);
  };

  useEffect(() => {
    loadReceipts();
    
    // Auto-update times every 10 seconds
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (receipts.length > 0) {
      gsap.fromTo(
        '.gsap-receipt-row',
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [receipts]);

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 10) return 'hace unos segundos';
    if (diffSecs < 60) return `hace ${diffSecs} segundos`;
    if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  };

  const handleApprove = async (receipt: Receipt) => {
    if (confirm(`¿Estás seguro de que deseas aprobar el comprobante ${receipt.receiptNumber} de ${receipt.tenantName} y activar su suscripción por 30 días?`)) {
      try {
        // 1. Fetch real DB tenants to find matching dbId by slug
        const response = await api.get('/auth/admin/tenants');
        const matched = response.data.find((t: any) => t.slug === receipt.tenantSlug);

        if (!matched) {
          throw new Error('No se encontró el inquilino correspondiente en la base de datos real.');
        }

        // 2. Extend subscription by 30 days in DB
        await api.post('/auth/admin/tenants/extend', {
          tenantId: matched.id,
          days: 30
        });

        // 3. Set status to ACTIVE in DB
        await api.post('/auth/update-tenant-user', {
          tenantSlug: matched.slug,
          status: 'ACTIVE',
          email: matched.users[0]?.email,
          name: matched.users[0]?.name
        });

        // 4. Update local state
        const updated = receipts.map(r => r.id === receipt.id ? { ...r, status: 'APROBADO' as const } : r);
        localStorage.setItem('saas_receipts', JSON.stringify(updated));
        setReceipts(updated);

        // Force reload tenants in localStorage so DashboardLayout updates immediately
        const mapped = response.data.map((t: any) => {
          const owner = t.users[0] || {};
          const sub = t.subscriptions[0] || {};
          const plan = sub.plan || {};
          // Calculate end date after extension
          const currentEnd = new Date(sub.endDate);
          const baseDate = currentEnd >= new Date() ? currentEnd : new Date();
          const newEnd = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          return {
            id: t.slug,
            dbId: t.id,
            name: t.name,
            ownerName: owner.name || 'Sin dueño',
            ownerEmail: owner.email || '',
            ownerPassword: owner.plainPassword || '********',
            planName: plan.name || 'Sin plan',
            planId: plan.id || '',
            startDate: sub.startDate ? sub.startDate.split('T')[0] : '',
            endDate: newEnd.toISOString().split('T')[0],
            status: 'Activa',
            dbStatus: 'ACTIVE'
          };
        });
        localStorage.setItem('saas_tenants', JSON.stringify(mapped));

        alert('Pago verificado y suscripción activada con éxito en la base de datos.');
      } catch (err: any) {
        console.error('Error al aprobar pago:', err);
        alert('Error: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleReject = (receipt: Receipt) => {
    if (confirm(`¿Deseas rechazar el comprobante ${receipt.receiptNumber} de ${receipt.tenantName}?`)) {
      const updated = receipts.map(r => r.id === receipt.id ? { ...r, status: 'RECHAZADO' as const } : r);
      localStorage.setItem('saas_receipts', JSON.stringify(updated));
      setReceipts(updated);
      alert('Comprobante rechazado.');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-indigo-400" />
          Verificación de Comprobantes de Pago
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Verifica manualmente los comprobantes de depósito/transferencia enviados por los inquilinos bloqueados para reactivar sus accesos.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-3 font-semibold px-4">Instituto / Inquilino</th>
                <th className="pb-3 font-semibold px-4">Nro. Comprobante</th>
                <th className="pb-3 font-semibold px-4">Enviado Hace</th>
                <th className="pb-3 font-semibold px-4">Estado</th>
                <th className="pb-3 font-semibold px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {receipts.map(r => {
                const isPending = r.status === 'PENDIENTE';
                const isApproved = r.status === 'APROBADO';
                
                return (
                  <tr key={r.id} className="gsap-receipt-row border-b border-gray-800/50 hover:bg-gray-800/10 transition-colors group">
                    <td className="py-4 px-4 font-bold text-gray-200">
                      {r.tenantName}
                      <span className="block font-normal text-xs text-gray-500 mt-0.5">slug: {r.tenantSlug}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-300 font-semibold">{r.receiptNumber}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                        <Clock className="h-3.5 w-3.5 text-gray-500" />
                        <span>{formatTimeAgo(r.submittedAt)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isApproved 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : r.status === 'RECHAZADO'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(r)}
                            className="p-1.5 bg-green-500/20 hover:bg-green-500/35 border border-green-500/30 text-green-400 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                            title="Aprobar Pago"
                          >
                            <Check className="h-4 w-4" />
                            Aprobar
                          </button>
                          <button 
                            onClick={() => handleReject(r)}
                            className="p-1.5 bg-red-500/20 hover:bg-red-500/35 border border-red-500/30 text-red-400 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                            title="Rechazar Pago"
                          >
                            <RejectIcon className="h-4 w-4" />
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 font-medium">
                          {isApproved ? 'Suscripción Activa (+30d)' : 'Comprobante Rechazado'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {receipts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No se han recibido comprobantes de pago todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
