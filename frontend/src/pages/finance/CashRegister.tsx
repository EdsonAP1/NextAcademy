import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Wallet, ArrowDownRight, ArrowUpRight, Download, Calendar, X } from 'lucide-react';
import gsap from 'gsap';
import api from '../../shared/api';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  concept: string;
  amount: number;
  time: string;
  method: string;
  date?: string;
  isCanceled?: boolean;
}

const openReportPrintTab = (period: 'day' | 'week' | 'month', filteredTxs: any[], initialBalance: number, profile: any) => {
  const newWindow = window.open('', '_blank');
  if (!newWindow) {
    alert('Por favor, permite las ventanas emergentes (pop-ups) para ver el reporte.');
    return;
  }

  const tenantName = profile?.tenant?.name || 'Instituto de Idiomas Oxford';
  
  // Calculate simplifed Bolivian-friendly totals (excluding canceled transactions)
  const totalIncome = filteredTxs.reduce((acc, tx) => (tx.type === 'income' && !tx.isCanceled) ? acc + tx.amount : acc, 0);
  const totalExpense = filteredTxs.reduce((acc, tx) => (tx.type === 'expense' && !tx.isCanceled) ? acc + tx.amount : acc, 0);
  
  // Cash vs Digital breakdown (crucial for square up in Bolivia)
  const physicalCash = filteredTxs.reduce((acc, tx) => (tx.type === 'income' && tx.method === 'Efectivo' && !tx.isCanceled) ? acc + tx.amount : (tx.type === 'expense' && tx.method === 'Efectivo' && !tx.isCanceled) ? acc - tx.amount : acc, 0) + (period === 'day' ? initialBalance : 0);
  const digitalMoney = filteredTxs.reduce((acc, tx) => (tx.type === 'income' && tx.method !== 'Efectivo' && !tx.isCanceled) ? acc + tx.amount : acc, 0);
  
  // Count enrollments by parsing concept strings
  const enrollCount = filteredTxs.filter(tx => tx.type === 'income' && !tx.isCanceled && (tx.concept.toLowerCase().includes('inscr') || tx.concept.toLowerCase().includes('cobro'))).length;

  let periodLabel = '';
  const today = new Date().toLocaleDateString('es-BO');
  if (period === 'day') {
    periodLabel = `HOY (${today})`;
  } else if (period === 'week') {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-BO');
    periodLabel = `ESTA SEMANA (${oneWeekAgo} al ${today})`;
  } else {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-BO');
    periodLabel = `ESTE MES (${oneMonthAgo} al ${today})`;
  }

  const htmlContent = `
    <html>
      <head>
        <title>Resumen de Caja - ${periodLabel}</title>
        <style>
          @page { size: letter; margin: 15mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #111827;
            margin: 0;
            padding: 10px;
            background-color: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            line-height: 1.5;
          }
          .report-container {
            max-width: 750px;
            margin: auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 2px solid #111827;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .header-left h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 800;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: -0.01em;
          }
          .header-left p {
            margin: 2px 0 0 0;
            font-size: 12px;
            color: #4b5563;
          }
          .header-right {
            text-align: right;
          }
          .header-right h2 {
            margin: 0;
            font-size: 14px;
            font-weight: 700;
            color: #4b5563;
            letter-spacing: 0.05em;
          }
          .header-right p {
            margin: 2px 0 0 0;
            font-size: 11px;
            color: #6b7280;
          }
          .hero-section {
            text-align: center;
            padding: 32px 0;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 24px;
          }
          .hero-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #6b7280;
            font-weight: 700;
            display: block;
            margin-bottom: 6px;
          }
          .hero-amount {
            font-size: 44px;
            font-weight: 800;
            color: #059669;
            margin: 0;
            letter-spacing: -0.02em;
          }
          .metrics-grid {
            display: grid;
            grid-template-cols: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 32px;
          }
          .metric-item {
            border-left: 2px solid #e5e7eb;
            padding-left: 12px;
          }
          .metric-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            font-weight: 700;
            display: block;
            margin-bottom: 4px;
          }
          .metric-val {
            font-size: 16px;
            font-weight: 700;
            color: #111827;
          }
          .metric-val.expense {
            color: #dc2626;
          }
          .section-title {
            font-size: 12px;
            font-weight: 700;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 1px solid #111827;
          }
          .tx-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .tx-table th {
            padding: 6px 0;
            text-align: left;
            font-size: 10px;
            font-weight: 700;
            color: #6b7280;
            text-transform: uppercase;
            border-bottom: 1px solid #e5e7eb;
          }
          .tx-table td {
            padding: 10px 0;
            font-size: 12px;
            color: #374151;
            border-bottom: 1px solid #f3f4f6;
          }
          .tx-amount {
            text-align: right;
            font-weight: 700;
          }
          .tx-amount.income {
            color: #059669;
          }
          .tx-amount.expense {
            color: #dc2626;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
            padding-top: 40px;
          }
          .signature-box {
            width: 220px;
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #9ca3af;
            padding-top: 6px;
            font-size: 11px;
            font-weight: 700;
            color: #4b5563;
          }
          .print-btn-container {
            text-align: center;
            margin-top: 30px;
          }
          .print-btn {
            background-color: #111827;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .print-btn:hover { background-color: #374151; }
          @media print {
            .print-btn-container { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <div class="header-left">
              <h1>${tenantName}</h1>
              <p>Sede Principal - Bolivia</p>
            </div>
            <div class="header-right">
              <h2>RESUMEN DE MOVIMIENTOS</h2>
              <p><strong>PERÍODO:</strong> ${periodLabel}</p>
              <p><strong>EMISIÓN:</strong> ${new Date().toLocaleString('es-BO')}</p>
            </div>
          </div>

          <div class="hero-section">
            <span class="hero-label">Total Recaudado (Ingresos)</span>
            <h2 class="hero-amount">Bs. ${totalIncome}</h2>
          </div>

          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-label">Total Gastado</span>
              <span class="metric-val expense">Bs. ${totalExpense}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Efectivo en Caja</span>
              <span class="metric-val">Bs. ${physicalCash}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Bancos / QR</span>
              <span class="metric-val">Bs. ${digitalMoney}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Inscripciones</span>
              <span class="metric-val">${enrollCount} nuevos alumnos</span>
            </div>
          </div>

          <h3 class="section-title">Detalle de Transacciones</h3>
          <table class="tx-table">
            <thead>
              <tr>
                <th style="width: 15%">Hora</th>
                <th style="width: 50%">Detalle / Concepto</th>
                <th style="width: 20%">Método</th>
                <th style="text-align: right; width: 15%">Monto</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTxs.length === 0 ? `
                <tr>
                  <td colspan="4" style="text-align: center; color: #9ca3af; padding: 20px;">No se registraron movimientos en este período.</td>
                </tr>
              ` : filteredTxs.map(tx => `
                <tr style="${tx.isCanceled ? 'opacity: 0.5; text-decoration: line-through; background-color: #f9fafb;' : ''}">
                  <td>${tx.time}</td>
                  <td>
                    <strong>${tx.concept}</strong>
                    ${tx.isCanceled ? '<span style="color: #dc2626; font-size: 10px; font-weight: 700; margin-left: 8px; text-transform: uppercase;">[ANULADO]</span>' : ''}
                  </td>
                  <td>${tx.method}</td>
                  <td class="tx-amount ${tx.isCanceled ? '' : tx.type === 'income' ? 'income' : 'expense'}" style="${tx.isCanceled ? 'color: #9ca3af; text-decoration: line-through;' : ''}">
                    ${tx.isCanceled ? '' : tx.type === 'income' ? '+' : '-'} Bs. ${tx.amount}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div class="signature-box">
              <div class="signature-line">Firma Responsable de Caja</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Firma Director de Instituto</div>
            </div>
          </div>
        </div>

        <div class="print-btn-container">
          <button class="print-btn" onclick="window.print()">Imprimir Resumen / PDF</button>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  newWindow.document.write(htmlContent);
  newWindow.document.close();
};

export default function CashRegister() {
  const { profile } = useOutletContext<{ profile: any }>();
  const isDemo = profile?.tenant?.slug === 'oxford';

  // Open/Close Caja strictly between Mon-Sat 8:00 AM - 8:00 PM
  const checkIfOpenByDefault = (): boolean => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = now.getHours();
    const isWorkingDay = day >= 1 && day <= 6;
    const isWorkingHour = hours >= 8 && hours < 20;
    return isWorkingDay && isWorkingHour;
  };

  const tenantSlug = profile?.tenant?.slug || 'oxford';
  const activeBranch = localStorage.getItem(`${tenantSlug}_academy_active_branch`) || 'principal';

  const [isOpen, setIsOpen] = useState(checkIfOpenByDefault);
  const [initialBalance, setInitialBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${tenantSlug}_${activeBranch}_initial_balance`);
      if (saved) return Number(saved);
    } catch (e) {
      console.error(e);
    }
    return (isDemo && activeBranch === 'principal') ? 393 : 0;
  });

  useEffect(() => {
    localStorage.setItem(`${tenantSlug}_${activeBranch}_initial_balance`, initialBalance.toString());
  }, [initialBalance, activeBranch, tenantSlug]);

  // Stateful transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = async () => {
    try {
      const res = await api.get(`/payments/transactions?branchId=${activeBranch}`);
      const mapped = res.data.map((tx: any) => {
        const dt = new Date(tx.createdAt || tx.date);
        const timeStr = dt.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
        const dateStr = dt.toISOString().split('T')[0];

        return {
          id: tx.id,
          type: tx.type === 'income' ? 'income' : 'expense',
          concept: tx.concept,
          amount: tx.amount,
          time: timeStr,
          method: tx.method === 'CASH' ? 'Efectivo' : tx.method === 'QR' ? 'QR' : 'Transferencia',
          date: dateStr,
          isCanceled: tx.isCanceled || false,
        };
      });
      setTransactions(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeBranch]);

  // Report Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'day' | 'week' | 'month'>('day');

  const filterTransactions = (period: 'day' | 'week' | 'month') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return transactions.filter(tx => {
      const txDateStr = tx.date || new Date(tx.id).toISOString().split('T')[0];
      const txDate = new Date(txDateStr);
      txDate.setHours(0, 0, 0, 0);
      
      if (period === 'day') {
        return txDateStr === today.toISOString().split('T')[0];
      }
      
      const diffTime = Math.abs(today.getTime() - txDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (period === 'week') {
        return diffDays <= 7;
      } else if (period === 'month') {
        return diffDays <= 30;
      }
      return false;
    });
  };

  // Dynamic calculations (excluding canceled transactions)
  const totalIncome = transactions.reduce((acc, curr) => (curr.type === 'income' && !curr.isCanceled) ? acc + curr.amount : acc, 0);
  const totalExpenses = transactions.reduce((acc, curr) => (curr.type === 'expense' && !curr.isCanceled) ? acc + curr.amount : acc, 0);
  const currentBalance = initialBalance + totalIncome - totalExpenses;

  // Background interval effect to check open/close schedule automatically every 10 seconds
  useEffect(() => {
    const checkSchedule = () => {
      setIsOpen(checkIfOpenByDefault());
    };
    checkSchedule();
    const interval = setInterval(checkSchedule, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      gsap.fromTo(
        '.gsap-finance-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, [transactions]);

  const handleCancelTransaction = async (id: string) => {
    const password = prompt('Introduce la contraseña de administrador para ANULAR esta transacción:');
    if (password === null) return; // user canceled
    if (password === 'admin') {
      try {
        await api.patch(`/payments/transactions/${id}`, {
          isCanceled: true,
          concept: '[ANULADO] ' + (transactions.find(tx => tx.id === id)?.concept || ''),
        });
        alert('Transacción anulada con éxito en los registros de auditoría.');
        await fetchTransactions();
      } catch (e: any) {
        alert(e.response?.data?.message || 'Error al anular transacción');
      }
    } else {
      alert('Contraseña incorrecta. No se pudo anular la transacción.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-indigo-400" />
            Caja Diaria
          </h2>
          <p className="text-sm text-gray-400 mt-1">Control de ingresos y egresos de la sucursal.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Reporte de Caja
          </button>
          
          {isOpen ? (
            <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Caja Abierta (Auto)
            </span>
          ) : (
            <span className="px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider select-none">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Caja Cerrada (Auto)
            </span>
          )}
        </div>
      </div>

      {!isOpen && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-500/20">
            <Wallet className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-amber-400 font-bold">Caja cerrada automáticamente</h3>
            <p className="text-amber-200/70 text-sm">La caja se encuentra cerrada fuera de horario de atención comercial (Horario: Lunes a Sábado de 8:00 AM a 8:00 PM).</p>
          </div>
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="gsap-finance-card glass-panel rounded-2xl p-5 border-l-4 border-l-gray-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Saldo Inicial</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-200">Bs.</span>
            <input 
              type="number"
              value={initialBalance}
              disabled={!isOpen}
              onChange={(e) => setInitialBalance(Number(e.target.value))}
              className="bg-transparent text-2xl font-bold text-gray-200 w-24 focus:outline-none focus:border-b border-gray-700 disabled:opacity-80"
            />
          </div>
        </div>
        <div className="gsap-finance-card glass-panel rounded-2xl p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ingresos Hoy</p>
          <h3 className="text-2xl font-bold text-emerald-400">Bs. {totalIncome}</h3>
        </div>
        <div className="gsap-finance-card glass-panel rounded-2xl p-5 border-l-4 border-l-rose-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Egresos Hoy</p>
          <h3 className="text-2xl font-bold text-rose-400">Bs. {totalExpenses}</h3>
        </div>
        <div className="gsap-finance-card glass-panel rounded-2xl p-5 border-l-4 border-l-indigo-500 bg-indigo-500/5">
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">Saldo Actual</p>
          <h3 className="text-2xl font-bold text-white">Bs. {currentBalance}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Movimientos */}
        <div className="glass-panel rounded-3xl p-6 gsap-finance-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Movimientos Recientes</h3>
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Hoy, {new Date().toLocaleDateString('es-BO')}
            </span>
          </div>

          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className={`flex items-center justify-between p-4 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors group ${tx.isCanceled ? 'opacity-40 select-none' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${
                    tx.isCanceled ? 'bg-gray-800 text-gray-500' : tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {tx.type === 'income' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${tx.isCanceled ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                      {tx.concept}
                      {tx.isCanceled && (
                        <span className="ml-2 text-[9px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">Anulado</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{tx.time}</span>
                      <span className="text-[10px] text-gray-600">•</span>
                      <span className="text-xs text-indigo-400 font-medium">{tx.method}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`font-bold ${tx.isCanceled ? 'text-gray-500 line-through' : tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.isCanceled ? '' : tx.type === 'income' ? '+' : '-'} Bs. {tx.amount}
                  </p>
                  {!tx.isCanceled && (
                    <button 
                      onClick={() => handleCancelTransaction(tx.id)}
                      className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Anular Registro"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay movimientos registrados hoy.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal - Reporte de Caja Interactivo */}
      {isReportModalOpen && (() => {
        const filtered = filterTransactions(reportPeriod);
        const repIncome = filtered.reduce((acc, curr) => (curr.type === 'income' && !curr.isCanceled) ? acc + curr.amount : acc, 0);
        const repExpense = filtered.reduce((acc, curr) => (curr.type === 'expense' && !curr.isCanceled) ? acc + curr.amount : acc, 0);
        
        // Physical Cash vs Bank/QR Transfers (for drawer checking, excluding canceled)
        const repPhysical = filtered.reduce((acc, curr) => (curr.type === 'income' && curr.method === 'Efectivo' && !curr.isCanceled) ? acc + curr.amount : (curr.type === 'expense' && curr.method === 'Efectivo' && !curr.isCanceled) ? acc - curr.amount : acc, 0) + (reportPeriod === 'day' ? initialBalance : 0);
        const repDigital = filtered.reduce((acc, curr) => (curr.type === 'income' && curr.method !== 'Efectivo' && !curr.isCanceled) ? acc + curr.amount : acc, 0);
        
        // Count enrollments (matching "inscrip" or "cobro" string in concept, excluding canceled)
        const repEnrollCount = filtered.filter(tx => tx.type === 'income' && !tx.isCanceled && (tx.concept.toLowerCase().includes('inscr') || tx.concept.toLowerCase().includes('cobro'))).length;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative">
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer z-20"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-xl font-bold text-white mb-2">Resumen de Caja e Inscripciones</h3>
              <p className="text-xs text-gray-400 mb-6">Selecciona el período para ver el resumen de inscripciones y montos recaudados.</p>

              {/* Period tabs */}
              <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6">
                {(['day', 'week', 'month'] as const).map(period => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setReportPeriod(period)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      reportPeriod === period 
                        ? 'bg-indigo-500 text-white' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {period === 'day' ? 'Hoy' : period === 'week' ? 'Semana' : 'Mes'}
                  </button>
                ))}
              </div>

              {/* Live Preview Summary (Bolivian simple metrics) */}
              <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-5 mb-6 space-y-4">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">⚡ Recaudación e Inscripciones</p>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-[9px] font-semibold text-gray-500 block uppercase">Total Recaudado</span>
                    <span className="text-lg font-black text-emerald-400 mt-1 block">Bs. {repIncome}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                    <span className="text-[9px] font-semibold text-gray-500 block uppercase">Nuevos Inscritos</span>
                    <span className="text-lg font-black text-indigo-400 mt-1 block">{repEnrollCount} alumnos</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center pt-2 border-t border-gray-900/60">
                  <div className="p-2 rounded-xl bg-gray-900/40 border border-gray-850">
                    <span className="text-[8px] font-semibold text-gray-500 block uppercase">Efectivo Físico</span>
                    <span className="text-xs font-bold text-amber-500 mt-0.5 block">Bs. {repPhysical}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-900/40 border border-gray-850">
                    <span className="text-[8px] font-semibold text-gray-500 block uppercase">QR / Bancos</span>
                    <span className="text-xs font-bold text-blue-400 mt-0.5 block">Bs. {repDigital}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-900/40 border border-gray-850">
                    <span className="text-[8px] font-semibold text-gray-500 block uppercase">Egresos / Gastos</span>
                    <span className="text-xs font-bold text-rose-400 mt-0.5 block">Bs. {repExpense}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Cerrar
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    openReportPrintTab(reportPeriod, filtered, initialBalance, profile);
                    setIsReportModalOpen(false);
                  }}
                  className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  Imprimir Resumen
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
