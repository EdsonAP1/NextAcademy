import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, MoreVertical, BookOpen, Clock, Users, Edit, Trash2, CalendarDays, X } from 'lucide-react';
import gsap from 'gsap';

interface Course {
  id: number;
  name: string;
  schedule: string;
  teacher: string;
  capacity: number;
  enrolled: number;
  status: string;
}

export default function CoursesList() {
  const { profile } = useOutletContext<{ profile: any }>();
  const isDemo = profile?.tenant?.slug === 'oxford';

  const [searchTerm, setSearchTerm] = useState('');
  
  // Stateful Mock Data
  const [courses, setCourses] = useState<Course[]>(() => {
    if (!isDemo) return [];
    return [
      { id: 1, name: 'Inglés Básico (A1)', schedule: 'Lun-Mie-Vie 15:00 - 16:30', teacher: 'Lic. Martha Vargas', capacity: 25, enrolled: 22, status: 'Activo' },
      { id: 2, name: 'Matemáticas Pre-U', schedule: 'Mar-Jue 16:00 - 18:00', teacher: 'Ing. Roberto Silva', capacity: 30, enrolled: 30, status: 'Lleno' },
      { id: 3, name: 'Francés Intensivo', schedule: 'Sábados 08:00 - 12:00', teacher: 'Lic. Jean Dupont', capacity: 15, enrolled: 8, status: 'Activo' },
      { id: 4, name: 'Física y Química', schedule: 'Lun-Mie-Vie 18:00 - 20:00', teacher: 'Ing. Roberto Silva', capacity: 30, enrolled: 12, status: 'Activo' },
    ];
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('');
  const [teacher, setTeacher] = useState('');
  const [capacity, setCapacity] = useState(30);
  const [enrolled, setEnrolled] = useState(0);

  useEffect(() => {
    gsap.fromTo(
      '.gsap-course-card',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(1.2)' }
    );
  }, [courses]);

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este curso?')) {
      setCourses(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setName('');
    setSchedule('');
    setTeacher('');
    setCapacity(30);
    setEnrolled(0);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setEditingCourse(course);
    setName(course.name);
    setSchedule(course.schedule);
    setTeacher(course.teacher);
    setCapacity(course.capacity);
    setEnrolled(course.enrolled);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      // Edit
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? {
        ...c,
        name,
        schedule,
        teacher,
        capacity,
        enrolled,
        status: enrolled >= capacity ? 'Lleno' : 'Activo'
      } : c));
    } else {
      // Add
      const newCourse: Course = {
        id: Date.now(),
        name,
        schedule,
        teacher,
        capacity,
        enrolled,
        status: enrolled >= capacity ? 'Lleno' : 'Activo'
      };
      setCourses(prev => [...prev, newCourse]);
    }
    setIsModalOpen(false);
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-400" />
            Catálogo de Cursos
          </h2>
          <p className="text-sm text-gray-400 mt-1">Administra los cursos, horarios y cupos disponibles.</p>
        </div>
        
        <button 
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Crear Curso
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar curso o docente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <button className="px-4 py-2 text-sm font-medium bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20 whitespace-nowrap">
            Todos ({courses.length})
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-gray-900/80 hover:bg-gray-800 text-gray-400 rounded-lg border border-gray-800 transition-colors whitespace-nowrap">
            Activos ({courses.filter(c => c.status === 'Activo').length})
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-gray-900/80 hover:bg-gray-800 text-gray-400 rounded-lg border border-gray-800 transition-colors whitespace-nowrap">
            Llenos ({courses.filter(c => c.status === 'Lleno').length})
          </button>
        </div>
      </div>

      {/* Grid de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const occupancyPercentage = (course.enrolled / course.capacity) * 100;
          const isFull = occupancyPercentage >= 100;

          return (
            <div key={course.id} className="gsap-course-card glass-panel rounded-3xl p-6 group relative overflow-hidden">
              {/* Badge Estado */}
              <div className="absolute top-4 right-4 flex gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isFull ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {isFull ? 'Agotado' : 'Disponible'}
                </span>
              </div>

              {/* Info Principal */}
              <div className="mb-4 pr-6">
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1" title={course.name}>{course.name}</h3>
                <p className="text-xs text-indigo-400 font-medium">Prof: {course.teacher}</p>
              </div>

              {/* Detalles */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2 text-gray-400">
                  <CalendarDays className="h-4 w-4 mt-0.5 text-gray-500 shrink-0" />
                  <span className="text-xs">{course.schedule}</span>
                </div>
              </div>

              {/* Progress Bar (Cupos) */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Cupos
                  </span>
                  <span className={isFull ? 'text-rose-400' : 'text-emerald-400'}>
                    {course.enrolled} / {course.capacity}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-800/50">
                <button 
                  onClick={() => handleOpenEditModal(course)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-indigo-500/30 text-gray-400 hover:text-indigo-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(course.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-rose-500/30 text-gray-400 hover:text-rose-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No se encontraron cursos que coincidan con la búsqueda.</p>
        </div>
      )}

      {/* Modal - Create / Edit Course */}
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
              {editingCourse ? 'Editar Curso' : 'Crear Curso'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Nombre del Curso</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Inglés Básico (A1)"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Horario</label>
                <input 
                  type="text" 
                  required
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Ej. Lun-Mie-Vie 15:00 - 16:30"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Docente</label>
                <input 
                  type="text" 
                  required
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="Ej. Lic. Martha Vargas"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Capacidad Máxima</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Inscritos Actuales</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    max={capacity}
                    value={enrolled}
                    onChange={(e) => setEnrolled(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
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
                  {editingCourse ? 'Guardar Cambios' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
