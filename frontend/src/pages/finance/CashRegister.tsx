import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, Download, Calendar, X, Trash2 } from 'lucide-react';
import gsap from 'gsap';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  concept: string;
  amount: number;
  time: string;
  method: string;
}

export default function CashRegister() {
  const { profile } = useOutletContext<{ profile: any }>();
  const isDemo = profile?.tenant?.slug === 'oxford';

  const [isOpen, setIsOpen] = useState(true);
  const [initialBalance, setInitialBalance] = useState(() => isDemo ? 500 : 0);

  // Stateful transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (!isDemo) return [];
    return [
      { id: 1, type: 'income', concept: 'Mensualidad - Juan Pérez', amount: 350, time: '09:15 AM', method: 'Efectivo' },
      { id: 2, type: 'income', concept: 'Inscripción - María Gómez', amount: 400, time: '10:30 AM', method: 'QR' },
      { id: 3, type: 'expense', concept: 'Compra material escritorio', amount: 150, time: '11:45 AM', method: 'Efectivo' },
      { id: 4, type: 'income', concept: 'Mensualidad - Carlos Ruiz', amount: 500, time: '14:20 PM', method: 'Transferencia' },
    ];
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Efectivo');

  // Dynamic calculations
  const totalIncome = transactions.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc, 0);
  const totalExpenses = transactions.reduce((acc, curr) => curr.type === 'expense' ? acc + curr.amount : acc, 0);
  const currentBalance = initialBalance + totalIncome - totalExpenses;

  useEffect(() => {
    gsap.fromTo(
      '.gsap-finance-card',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
    );
  }, [transactions]);

  const handleDeleteTransaction = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de caja?')) {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    }
  };

  const handleOpenModal = (type: 'income' | 'expense') => {
    setTxType(type);
    setConcept('');
    setAmount('');
    setMethod('Efectivo');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timeNow = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
    const newTx: Transaction = {
      id: Date.now(),
      type: txType,
      concept,
      amount: Number(amount),
      time: timeNow,
      method
    };
    setTransactions(prev => [newTx, ...prev]);
    setIsModalOpen(false);
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
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-xl text-sm font-semibold border border-gray-800 transition-colors flex items-center gap-2 cursor-pointer">
            <Download className="h-4 w-4" />
            Reporte Diario
          </button>
          {isOpen ? (
            <button 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-rose-500/10 cursor-pointer"
            >
              Cerrar Caja
            </button>
          ) : (
            <button 
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Abrir Caja
            </button>
          )}
        </div>
      </div>

      {!isOpen && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-500/20">
            <Wallet className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-amber-400 font-bold">La caja está cerrada</h3>
            <p className="text-amber-200/70 text-sm">Debes abrir caja indicando un saldo inicial para registrar movimientos hoy.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Movimientos */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 gsap-finance-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Movimientos Recientes</h3>
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Hoy, {new Date().toLocaleDateString('es-BO')}
            </span>
          </div>

          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${
                    tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {tx.type === 'income' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-200">{tx.concept}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{tx.time}</span>
                      <span className="text-[10px] text-gray-600">•</span>
                      <span className="text-xs text-indigo-400 font-medium">{tx.method}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'} Bs. {tx.amount}
                  </p>
                  <button 
                    onClick={() => handleDeleteTransaction(tx.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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

        {/* Acciones Rápidas */}
        <div className="glass-panel rounded-3xl p-6 gsap-finance-card flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white mb-2">Registrar Movimiento</h3>
          
          <button 
            disabled={!isOpen}
            onClick={() => handleOpenModal('income')}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            <div className="p-2 rounded-full bg-emerald-500/20 group-hover:scale-110 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <span className="font-bold text-sm">Nuevo Ingreso Extra</span>
          </button>

          <button 
            disabled={!isOpen}
            onClick={() => handleOpenModal('expense')}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 to-rose-600/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            <div className="p-2 rounded-full bg-rose-500/20 group-hover:scale-110 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <span className="font-bold text-sm">Registrar Egreso/Gasto</span>
          </button>

          <div className="mt-auto pt-6 text-center text-xs text-gray-500">
            Los ingresos por pensiones e inscripciones se registran automáticamente desde sus respectivos módulos.
          </div>
        </div>
      </div>

      {/* Modal - Registrar Movimiento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">
              {txType === 'income' ? 'Registrar Ingreso Extra' : 'Registrar Egreso / Gasto'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Concepto</label>
                <input 
                  type="text" 
                  required
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder={txType === 'income' ? 'Ej. Venta de folleto pre-universitario' : 'Ej. Pago de luz eléctrica'}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Monto (Bs.)</label>
                <input 
                  type="number" 
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ej. 150"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Método de Pago</label>
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                >
                  <option value="Efectivo" className="bg-gray-900 text-white">Efectivo</option>
                  <option value="QR" className="bg-gray-900 text-white">Código QR</option>
                  <option value="Transferencia" className="bg-gray-900 text-white">Transferencia Bancaria</option>
                  <option value="Tarjeta" className="bg-gray-900 text-white">Tarjeta de Débito/Crédito</option>
                </select>
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
                  className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold shadow-lg transition-colors cursor-pointer ${
                    txType === 'income' 
                      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                      : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                  }`}
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
