import { useState, useEffect } from 'react';
import { Search, CreditCard, CheckCircle2, AlertCircle, Calendar, Receipt, FileText } from 'lucide-react';
import gsap from 'gsap';

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  // Mock Data
  const students = [
    { id: 1, name: 'Juan Carlos Pérez', course: 'Inglés Básico (A1)' },
    { id: 2, name: 'María Gómez', course: 'Matemáticas Pre-U' },
  ];

  const pendingPayments = [
    { id: 1, month: 'Junio 2024', amount: 350, dueDate: '2024-06-15', status: 'overdue' },
    { id: 2, month: 'Julio 2024', amount: 350, dueDate: '2024-07-15', status: 'pending' },
    { id: 3, month: 'Agosto 2024', amount: 350, dueDate: '2024-08-15', status: 'upcoming' },
  ];

  useEffect(() => {
    gsap.fromTo(
      '.gsap-payment-item',
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
    );
  }, [selectedStudent]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-indigo-400" />
          Cobro de Mensualidades
        </h2>
        <p className="text-sm text-gray-400 mt-1">Busca un estudiante para ver su estado de cuenta y registrar pagos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buscador de Estudiantes */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">Buscar Estudiante</h3>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Nombre o CI..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {students.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedStudent === student.id 
                      ? 'bg-indigo-500/20 border-indigo-500/40 shadow-inner' 
                      : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <p className="font-bold text-gray-200 text-sm">{student.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{student.course}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estado de Cuenta */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="glass-panel rounded-3xl p-6 h-full flex flex-col">
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-800">
                <div>
                  <h3 className="text-xl font-bold text-white">{students.find(s => s.id === selectedStudent)?.name}</h3>
                  <p className="text-sm text-indigo-400 mt-1">{students.find(s => s.id === selectedStudent)?.course}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Deuda Total</p>
                  <p className="text-2xl font-bold text-rose-400">Bs. 700</p>
                </div>
              </div>

              <h4 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">Plan de Pagos</h4>
              
              <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="gsap-payment-item p-4 rounded-2xl bg-gray-900/60 border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        payment.status === 'overdue' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        payment.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-gray-800/50 text-gray-400 border border-gray-700'
                      }`}>
                        {payment.status === 'overdue' ? <AlertCircle className="h-5 w-5" /> : 
                         payment.status === 'pending' ? <Calendar className="h-5 w-5" /> : 
                         <Receipt className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-200">{payment.month}</p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          Vence: {new Date(payment.dueDate).toLocaleDateString('es-BO')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="text-left sm:text-right flex-1">
                        <p className="font-bold text-white">Bs. {payment.amount}</p>
                        <p className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${
                          payment.status === 'overdue' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {payment.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap">
                        Cobrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
                <button className="text-sm text-gray-400 hover:text-white font-medium flex items-center gap-2 transition-colors">
                  <FileText className="h-4 w-4" />
                  Ver Historial de Pagos
                </button>
                <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                  Cobrar Seleccionadas
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="p-4 rounded-full bg-gray-900/50 mb-4 border border-gray-800">
                <Search className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-300 mb-2">Ningún estudiante seleccionado</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Busca y selecciona un estudiante en la lista lateral para ver sus mensualidades pendientes y registrar pagos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
