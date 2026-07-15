import { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Edit, Save, QrCode, X } from 'lucide-react';
import gsap from 'gsap';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ownerName: string;
  nitCi: string;
}

export default function SuperAdminQR() {
  const [qrUrl, setQrUrl] = useState(() => {
    return localStorage.getItem('saas_qr_url') || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PagoSaaSNextAcademy';
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('saas_bank_accounts');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', bankName: 'Banco Nacional de Bolivia (BNB)', accountNumber: '100-2938481', ownerName: 'NextAcademy SRL', nitCi: '3029482029' },
      { id: '2', bankName: 'Banco Mercantil Santa Cruz', accountNumber: '401-29481920', ownerName: 'NextAcademy SRL', nitCi: '3029482029' },
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  // Form State
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [nitCi, setNitCi] = useState('');

  useEffect(() => {
    localStorage.setItem('saas_qr_url', qrUrl);
  }, [qrUrl]);

  useEffect(() => {
    localStorage.setItem('saas_bank_accounts', JSON.stringify(bankAccounts));
    gsap.fromTo(
      '.gsap-bank-item',
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, [bankAccounts]);

  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setBankName('');
    setAccountNumber('');
    setOwnerName('NextAcademy SRL');
    setNitCi('3029482029');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (acc: BankAccount) => {
    setEditingAccount(acc);
    setBankName(acc.bankName);
    setAccountNumber(acc.accountNumber);
    setOwnerName(acc.ownerName);
    setNitCi(acc.nitCi);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      setBankAccounts(prev => prev.map(a => a.id === editingAccount.id ? {
        ...a,
        bankName,
        accountNumber,
        ownerName,
        nitCi
      } : a));
    } else {
      const newAcc: BankAccount = {
        id: Date.now().toString(),
        bankName,
        accountNumber,
        ownerName,
        nitCi
      };
      setBankAccounts(prev => [...prev, newAcc]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('¿Deseas eliminar esta cuenta bancaria para los cobros?')) {
      setBankAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <QrCode className="h-6 w-6 text-indigo-400" />
          Configuración de QR y Cuentas de Cobro
        </h2>
        <p className="text-sm text-gray-400 mt-1">Define el QR y las cuentas bancarias donde tus clientes pagarán sus suscripciones.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* QR Manager */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-200 mb-6 uppercase tracking-wider self-start">QR de Pago de Suscripción</h3>
          
          <div className="p-4 rounded-2xl bg-white mb-6 border border-gray-800 shadow-xl max-w-[240px]">
            <img src={qrUrl} alt="QR de Pago" className="w-48 h-48 object-contain" />
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Enlace a Imagen de QR</label>
            <input 
              type="text"
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              placeholder="Pegue la URL de la imagen del QR..."
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 mb-3"
            />
            
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">O Subir Foto de QR Manualmente</label>
            <input 
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === 'string') {
                      setQrUrl(reader.result);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 file:cursor-pointer"
            />
            <p className="text-[10px] text-gray-500 mt-2">Los clientes visualizarán este QR en su panel al renovar o cambiar su plan.</p>
          </div>
        </div>

        {/* Bank Accounts Manager */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-400" />
              Cuentas de Transferencia Bancaria
            </h3>
            <button 
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-md shadow-indigo-500/10"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar Cuenta
            </button>
          </div>

          <div className="space-y-4">
            {bankAccounts.map((acc) => (
              <div key={acc.id} className="gsap-bank-item p-4 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors group flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-200 text-sm">{acc.bankName}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 mt-1 text-xs text-gray-500">
                    <p><span className="font-medium text-gray-400">Nro Cuenta:</span> {acc.accountNumber}</p>
                    <p><span className="font-medium text-gray-400">Titular:</span> {acc.ownerName}</p>
                    <p><span className="font-medium text-gray-400">NIT/CI:</span> {acc.nitCi}</p>
                  </div>
                </div>

                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handleOpenEditModal(acc)}
                    className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteAccount(acc.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {bankAccounts.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay cuentas bancarias registradas. Añade una para recibir transferencias.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal - Account CRUD */}
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
              {editingAccount ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Nombre del Banco</label>
                <input 
                  type="text" 
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ej. Banco Nacional de Bolivia"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Número de Cuenta</label>
                <input 
                  type="text" 
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Ej. 10002934812"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Nombre del Titular</label>
                <input 
                  type="text" 
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ej. NextAcademy SRL"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">NIT o CI del Titular</label>
                <input 
                  type="text" 
                  required
                  value={nitCi}
                  onChange={(e) => setNitCi(e.target.value)}
                  placeholder="Ej. 3029482029"
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
                  {editingAccount ? 'Guardar Cambios' : 'Añadir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
