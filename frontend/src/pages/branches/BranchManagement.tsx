import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  MapPin,
  Phone,
  AlertTriangle,
  GitBranch,
  DoorOpen,
} from 'lucide-react';
import api from '../../shared/api';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string;
}

interface BranchStats {
  students: number;
  courses: number;
  totalCollected: number;
}

function getBranchStats(branchId: string, tenantSlug: string): BranchStats {
  const getArr = (key: string) => {
    try {
      const saved = localStorage.getItem(`${tenantSlug}_${branchId}_${key}`);
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* ignore */ }
    return [];
  };

  const students = getArr('academy_students').filter((s: any) => s.status === 'Activo').length;
  const courses = getArr('academy_courses').length;
  const transactions = getArr('academy_transactions');
  const todayStr = new Date().toISOString().split('T')[0];
  const totalCollected = transactions
    .filter((tx: any) => tx.type === 'income' && tx.date === todayStr)
    .reduce((acc: number, tx: any) => acc + (tx.amount || 0), 0);

  return { students, courses, totalCollected };
}

interface Classroom {
  id: string;
  name: string;
  capacity: number;
}

const ACCENT = 'from-indigo-500 to-purple-600';
const COLORS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-400 to-rose-500',
  'from-sky-500 to-blue-600',
  'from-pink-500 to-fuchsia-600',
];

export default function BranchManagement() {
  const { profile } = useOutletContext<{ profile: any }>();
  const tenantSlug = profile?.tenant?.slug || 'oxford';

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data);
      localStorage.setItem(
        `${tenantSlug}_branch_ids`,
        JSON.stringify(res.data.map((b: any) => ({ id: b.id, name: b.name })))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [tenantSlug]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Classroom management state
  const [classroomBranchId, setClassroomBranchId] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [clsFormName, setClsFormName] = useState('');
  const [clsFormCapacity, setClsFormCapacity] = useState(30);
  const [clsEditingId, setClsEditingId] = useState<string | null>(null);
  const [clsDeleteId, setClsDeleteId] = useState<string | null>(null);
  const [clsError, setClsError] = useState('');

  const openClassroomModal = async (branchId: string) => {
    setClassroomBranchId(branchId);
    setClsFormName('');
    setClsFormCapacity(30);
    setClsEditingId(null);
    setClsDeleteId(null);
    setClsError('');
    try {
      const res = await api.get(`/classrooms?branchId=${branchId}`);
      setClassrooms(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const closeClassroomModal = () => {
    setClassroomBranchId(null);
    setClsEditingId(null);
    setClsDeleteId(null);
    setClsError('');
  };

  const handleSaveClassroom = async () => {
    if (!classroomBranchId) return;
    const trimmed = clsFormName.trim();
    if (!trimmed) { setClsError('El nombre es obligatorio.'); return; }
    if (clsFormCapacity < 1) { setClsError('La capacidad debe ser mayor a 0.'); return; }

    try {
      if (clsEditingId) {
        await api.patch(`/classrooms/${clsEditingId}`, {
          name: trimmed,
          capacity: clsFormCapacity,
        });
      } else {
        await api.post('/classrooms', {
          name: trimmed,
          capacity: clsFormCapacity,
          branchId: classroomBranchId,
        });
      }
      setClsFormName('');
      setClsFormCapacity(30);
      setClsEditingId(null);
      setClsError('');
      // Reload classrooms list
      const res = await api.get(`/classrooms?branchId=${classroomBranchId}`);
      setClassrooms(res.data);
    } catch (e: any) {
      setClsError(e.response?.data?.message || 'Error al guardar el aula');
    }
  };

  const handleDeleteClassroom = async (id: string) => {
    if (!classroomBranchId) return;
    try {
      await api.delete(`/classrooms/${id}`);
      setClsDeleteId(null);
      // Reload classrooms list
      const res = await api.get(`/classrooms?branchId=${classroomBranchId}`);
      setClassrooms(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const startEditClassroom = (cls: Classroom) => {
    setClsEditingId(cls.id);
    setClsFormName(cls.name);
    setClsFormCapacity(cls.capacity);
    setClsError('');
  };

  const cancelEditClassroom = () => {
    setClsEditingId(null);
    setClsFormName('');
    setClsFormCapacity(30);
    setClsError('');
  };

  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formError, setFormError] = useState('');

  const openCreate = () => {
    setEditingBranch(null);
    setFormName('');
    setFormAddress('');
    setFormPhone('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormName(branch.name);
    setFormAddress(branch.address);
    setFormPhone(branch.phone);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    setFormError('');
  };

  const handleSave = async () => {
    const trimmedName = formName.trim();
    if (!trimmedName) {
      setFormError('El nombre de la sucursal es obligatorio.');
      return;
    }

    try {
      if (editingBranch) {
        await api.patch(`/branches/${editingBranch.id}`, {
          name: trimmedName,
          address: formAddress.trim(),
          phone: formPhone.trim(),
        });
      } else {
        await api.post('/branches', {
          name: trimmedName,
          address: formAddress.trim(),
          phone: formPhone.trim(),
        });
      }
      closeModal();
      fetchBranches();
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Error al guardar la sucursal');
    }
  };

  const handleDelete = async (id: string) => {
    if (branches.length === 1) return;
    try {
      await api.delete(`/branches/${id}`);
      const activeBranchKey = `${tenantSlug}_academy_active_branch`;
      const activeBranch = localStorage.getItem(activeBranchKey);
      if (activeBranch === id) {
        localStorage.setItem(activeBranchKey, 'principal');
      }
      setDeleteConfirmId(null);
      fetchBranches();
      if (activeBranch === id) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeBranchId = localStorage.getItem(`${tenantSlug}_academy_active_branch`) || 'principal';

  return (
    <div className="min-h-screen bg-[#030712] p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${ACCENT} shadow-lg`}>
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Gestión de Sucursales</h1>
          </div>
          <p className="text-sm text-gray-500 ml-11">
            Administra las sedes de{' '}
            <span className="text-indigo-400 font-semibold">{profile?.tenant?.name || tenantSlug}</span>.
            Cada sucursal tiene sus propios alumnos, cursos y caja independiente.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Nueva Sucursal
        </button>
      </div>

      {/* Grid */}
      {loadingBranches ? (
        <div className="flex flex-col items-center justify-center py-20 w-full col-span-3">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm">Cargando sucursales...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {branches.map((branch, idx) => {
            const stats = getBranchStats(branch.id, tenantSlug);
            const isPrincipal = branch.id === 'principal';
            const isActive = activeBranchId === branch.id;
            const color = COLORS[idx % COLORS.length];

            return (
              <div
                key={branch.id}
                className={`relative rounded-2xl border p-5 flex flex-col gap-4 transition-all ${
                  isActive
                    ? 'bg-indigo-500/5 border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                    : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Branch details & actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-md`}>
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-snug">{branch.name}</h3>
                      <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Creada: {branch.createdAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(branch)}
                      className="p-1.5 rounded-lg bg-gray-950/60 border border-gray-800/80 hover:border-indigo-500/30 text-gray-400 hover:text-indigo-400 transition-all cursor-pointer"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {!isPrincipal && (
                      <button
                        onClick={() => setDeleteConfirmId(branch.id)}
                        className="p-1.5 rounded-lg bg-gray-950/60 border border-gray-800/80 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 border-t border-gray-800/60 pt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{branch.address || 'Sin dirección registrada'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Phone className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span>{branch.phone || 'Sin teléfono registrado'}</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 bg-gray-950/40 border border-gray-800/50 rounded-xl p-2.5 mt-1">
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">{stats.students}</p>
                    <p className="text-[10px] text-gray-500 leading-tight">Alumnos activos</p>
                  </div>
                  <div className="text-center border-x border-gray-800/60">
                    <p className="text-sm font-bold text-white">{stats.courses}</p>
                    <p className="text-[10px] text-gray-500 leading-tight">Cursos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-emerald-400">Bs.{stats.totalCollected}</p>
                    <p className="text-[10px] text-gray-500 leading-tight">Recaudado hoy</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  {!isActive ? (
                    <button
                      onClick={() => {
                        localStorage.setItem(`${tenantSlug}_academy_active_branch`, branch.id);
                        window.location.reload();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Cambiar a esta
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                      <Check className="h-3.5 w-3.5" />
                      Sucursal activa
                    </div>
                  )}
                  <button
                    onClick={() => openClassroomModal(branch.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-950/60 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <DoorOpen className="h-3.5 w-3.5 text-indigo-400" />
                    Aulas ({stats.courses})
                  </button>
                </div>

                {deleteConfirmId === branch.id && (
                  <div className="absolute inset-0 bg-[#0d1117]/95 rounded-2xl p-4 flex flex-col items-center justify-center text-center z-10 border border-red-500/20">
                    <AlertTriangle className="h-8 w-8 text-red-500 mb-2 animate-bounce" />
                    <h4 className="text-sm font-bold text-white mb-1">¿Confirmar eliminación?</h4>
                    <p className="text-[10px] text-gray-500 mb-4 max-w-[200px]">Esta acción es irreversible y podría borrar datos asociados.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(branch.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Sí, eliminar
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={openCreate}
            className="rounded-2xl border-2 border-dashed border-gray-800 hover:border-indigo-500/40 hover:bg-indigo-500/5 flex flex-col items-center justify-center gap-3 p-8 text-gray-600 hover:text-indigo-400 transition-all min-h-[220px] cursor-pointer group"
          >
            <div className="p-3 rounded-xl border-2 border-dashed border-gray-700 group-hover:border-indigo-500/40 transition-colors">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold">Agregar Sucursal</span>
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-[#0d1117] border border-gray-800 rounded-2xl shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${ACCENT}`}>
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">
                  {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">
                  Nombre de la Sucursal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => { setFormName(e.target.value.toUpperCase()); setFormError(''); }}
                  placeholder="Ej. Sucursal Norte, Sede Centro..."
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  autoFocus
                />
                {formError && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {formError}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">
                  Direccion <span className="text-gray-600">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                  placeholder="Ej. Av. America 1234, entre Calles..."
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">
                  Telefono <span className="text-gray-600">(opcional)</span>
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="Ej. 78456123"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 text-sm font-semibold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${ACCENT} text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all active:scale-95 cursor-pointer`}
              >
                <Check className="h-4 w-4" />
                {editingBranch ? 'Guardar Cambios' : 'Crear Sucursal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classroom Management Modal */}
      {classroomBranchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeClassroomModal} />
          <div className="relative w-full max-w-lg bg-[#0d1117] border border-gray-800 rounded-2xl shadow-2xl z-10 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <DoorOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Gestionar Aulas</h2>
                  <p className="text-[10px] text-gray-500">
                    {branches.find(b => b.id === classroomBranchId)?.name}
                  </p>
                </div>
              </div>
              <button onClick={closeClassroomModal} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Classroom List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {classrooms.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  <DoorOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin aulas configuradas. Agrega la primera abajo.</p>
                </div>
              )}
              {classrooms.map(cls => (
                <div key={cls.id}>
                  {clsDeleteId === cls.id ? (
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 gap-3">
                      <p className="text-xs text-rose-300 flex-1">Eliminar <span className="font-bold">{cls.name.toUpperCase()}</span>?</p>
                      <div className="flex gap-2">
                        <button onClick={() => setClsDeleteId(null)} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white border border-gray-700 cursor-pointer">Cancelar</button>
                        <button onClick={() => handleDeleteClassroom(cls.id)} className="px-3 py-1.5 rounded-lg text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer">Eliminar</button>
                      </div>
                    </div>
                  ) : clsEditingId === cls.id ? (
                    <div className="px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={clsFormName}
                          onChange={e => { setClsFormName(e.target.value.toUpperCase()); setClsError(''); }}
                          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                          placeholder="Nombre del aula"
                          autoFocus
                        />
                        <input
                          type="number"
                          min={1}
                          value={clsFormCapacity}
                          onChange={e => setClsFormCapacity(Number(e.target.value))}
                          className="w-20 px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                          placeholder="Cap."
                        />
                      </div>
                      {clsError && <p className="text-rose-400 text-xs">{clsError}</p>}
                      <div className="flex gap-2">
                        <button onClick={cancelEditClassroom} className="flex-1 px-3 py-1.5 rounded-xl border border-gray-700 text-xs text-gray-400 hover:text-white cursor-pointer">Cancelar</button>
                        <button onClick={handleSaveClassroom} className="flex-1 px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-xs text-white font-bold cursor-pointer">
                          <Check className="h-3 w-3 inline mr-1" />Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-all group">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-indigo-400/60" />
                        <span className="text-sm font-medium text-white">{cls.name.toUpperCase()}</span>
                        <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">cap. {cls.capacity}</span>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditClassroom(cls)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white cursor-pointer" title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setClsDeleteId(cls.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 cursor-pointer" title="Eliminar">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Classroom Form */}
            {!clsEditingId && (
              <div className="p-5 border-t border-gray-800 space-y-3">
                <p className="text-xs font-bold text-gray-400">Agregar nueva aula</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clsFormName}
                    onChange={e => { setClsFormName(e.target.value); setClsError(''); }}
                    placeholder="Nombre del aula (Ej. Sala B, Lab Idiomas...)"
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 placeholder-gray-600"
                  />
                  <input
                    type="number"
                    min={1}
                    value={clsFormCapacity}
                    onChange={e => setClsFormCapacity(Number(e.target.value))}
                    className="w-20 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    title="Capacidad"
                  />
                  <button
                    onClick={handleSaveClassroom}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4 inline" /> Agregar
                  </button>
                </div>
                {clsError && (
                  <p className="text-rose-400 text-xs flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />{clsError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm bg-[#0d1117] border border-rose-500/20 rounded-2xl shadow-2xl p-6 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Eliminar sucursal</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {branches.find(b => b.id === deleteConfirmId)?.name}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Los datos guardados de esta sucursal permaneceran en memoria, pero dejara de aparecer en el sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white text-sm font-semibold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold transition-all active:scale-95 cursor-pointer"
              >
                Si, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
