import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, MoreVertical, GraduationCap, Edit, Trash2, X } from 'lucide-react';
import gsap from 'gsap';
import api from '../../shared/api';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  courses?: number;
  joined?: string;
  enrollments?: any[];
}

export default function StudentsList() {
  const { profile } = useOutletContext<{ profile: any }>();
  const [searchTerm, setSearchTerm] = useState('');
  const tenantSlug = profile?.tenant?.slug || 'oxford';
  const activeBranch = localStorage.getItem(`${tenantSlug}_academy_active_branch`) || 'principal';

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students?branchId=${activeBranch}`);
      // Map database student schema to UI structure
      const mapped = res.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        status: s.status === 'ACTIVE' ? 'Activo' : s.status === 'INACTIVE' ? 'Inactivo' : 'Pendiente',
        courses: s.enrollments?.length || 0,
        joined: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : '',
      }));
      setStudents(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [activeBranch]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Activo');

  useEffect(() => {
    gsap.fromTo(
      '.gsap-student-row',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, [students]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar a este estudiante?')) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setName('');
    setEmail('');
    setPhone('');
    setStatus('Activo');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone);
    setStatus(student.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      email,
      phone,
      status: status === 'Activo' ? 'ACTIVE' : status === 'Inactivo' ? 'INACTIVE' : 'PENDING',
      branchId: activeBranch,
    };

    try {
      if (editingStudent) {
        // Edit mode
        await api.patch(`/students/${editingStudent.id}`, {
          name,
          email,
          phone,
          status: payload.status,
        });
      } else {
        // Add mode
        await api.post('/students', payload);
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al guardar el estudiante');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-400" />
            Gestión de Estudiantes
          </h2>
          <p className="text-sm text-gray-400 mt-1">Administra el padrón de alumnos de esta sucursal.</p>
        </div>
        
        <button 
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo Estudiante
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-4 sm:p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="px-3 py-2 text-xs font-medium bg-gray-900/80 hover:bg-gray-800 text-gray-300 rounded-lg border border-gray-800 transition-colors">
              Filtros Avanzados
            </button>
            <button className="px-3 py-2 text-xs font-medium bg-gray-900/80 hover:bg-gray-800 text-gray-300 rounded-lg border border-gray-800 transition-colors">
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-3 font-semibold px-4">Estudiante</th>
                <th className="pb-3 font-semibold px-4">Contacto</th>
                <th className="pb-3 font-semibold px-4">Estado</th>
                <th className="pb-3 font-semibold px-4">Cursos Inscritos</th>
                <th className="pb-3 font-semibold px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                      <span>Cargando estudiantes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No se encontraron estudiantes.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="gsap-student-row border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-300 font-bold text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-200">{student.name.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-gray-300">{student.email.toLowerCase()}</span>
                        <span className="text-xs text-gray-500">{student.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        student.status === 'Activo' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        student.status === 'Inactivo' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400 font-medium">{student.courses} cursos</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Add / Edit Student */}
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
              {editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  placeholder="ejemplo@email.com"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Teléfono / Celular</label>
                <input 
                  type="text" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 78945612"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Estado</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                >
                  <option value="Activo" className="bg-gray-900 text-white">Activo</option>
                  <option value="Inactivo" className="bg-gray-900 text-white">Inactivo</option>
                  <option value="Pendiente" className="bg-gray-900 text-white">Pendiente</option>
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
                  className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-colors cursor-pointer"
                >
                  {editingStudent ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
