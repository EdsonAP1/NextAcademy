import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, BookOpen, Users, Edit, Trash2, CalendarDays, X, AlertTriangle, DoorOpen, Pencil, Check } from 'lucide-react';
import gsap from 'gsap';
import api from '../../shared/api';

interface Course {
  id: string;
  name: string;
  schedule: string;
  days: string[];
  startTime: string;
  endTime: string;
  classroom: string;
  cost: number;
  teacher: string;
  capacity: number;
  enrolled: number;
  status: string;
}

const DAYS_OF_WEEK = [
  { label: 'Lunes', value: 'Lun' },
  { label: 'Martes', value: 'Mar' },
  { label: 'Miércoles', value: 'Mie' },
  { label: 'Jueves', value: 'Jue' },
  { label: 'Viernes', value: 'Vie' },
  { label: 'Sábado', value: 'Sab' }
];

const HOURS = Array.from({ length: 15 }, (_, i) => 8 + i); // 08:00 to 22:00

export default function CoursesList() {
  const { profile } = useOutletContext<{ profile: any }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'schedule'>('catalog');
  const [scheduleDay, setScheduleDay] = useState('Lun');

  const tenantSlug = profile?.tenant?.slug || 'oxford';
  const activeBranch = localStorage.getItem(`${tenantSlug}_academy_active_branch`) || 'principal';

  const [classrooms, setClassrooms] = useState<{ id: string; name: string; capacity: number }[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [cost, setCost] = useState<number>(400);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('16:30');
  const [classroom, setClassroom] = useState('');
  const [teacher, setTeacher] = useState('');
  const [capacity, setCapacity] = useState(30);
  const [enrolled, setEnrolled] = useState(0);

  const [conflictError, setConflictError] = useState<string | null>(null);

  // Helper time conversion
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // ---- Classroom Management Modal State ----
  const [isClsModalOpen, setIsClsModalOpen] = useState(false);
  const [clsFormName, setClsFormName] = useState('');
  const [clsFormCapacity, setClsFormCapacity] = useState(30);
  const [clsEditingId, setClsEditingId] = useState<string | null>(null);
  const [clsDeleteId, setClsDeleteId] = useState<string | null>(null);
  const [clsError, setClsError] = useState('');

  const fetchClassrooms = async () => {
    try {
      const res = await api.get(`/classrooms?branchId=${activeBranch}`);
      setClassrooms(res.data);
      if (res.data.length > 0 && !classroom) {
        setClassroom(res.data[0].name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/courses?branchId=${activeBranch}`);
      const mapped = res.data.map((c: any) => {
        const days = c.schedules?.map((s: any) => s.dayOfWeek) || [];
        const startTime = c.schedules?.[0]?.startTime || '15:00';
        const endTime = c.schedules?.[0]?.endTime || '16:30';
        const classroomName = c.schedules?.[0]?.classroom?.name || '';
        const daysStr = days.join('-');
        const scheduleStr = `${daysStr} ${startTime} - ${endTime}`;

        return {
          id: c.id,
          name: c.name,
          cost: c.price,
          teacher: c.teacher,
          capacity: c.capacity,
          enrolled: c.enrollments?.length || 0,
          status: c.status === 'ACTIVE' ? 'Activo' : c.status === 'FULL' ? 'Lleno' : 'Inactivo',
          days,
          startTime,
          endTime,
          classroom: classroomName,
          schedule: scheduleStr,
        };
      });
      setCourses(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
  }, [activeBranch]);

  const openClsModal = () => {
    setClsFormName('');
    setClsFormCapacity(30);
    setClsEditingId(null);
    setClsDeleteId(null);
    setClsError('');
    setIsClsModalOpen(true);
  };

  const handleSaveCls = async () => {
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
          branchId: activeBranch,
        });
      }
      setClsFormName('');
      setClsFormCapacity(30);
      setClsEditingId(null);
      setClsError('');
      fetchClassrooms();
    } catch (e: any) {
      setClsError(e.response?.data?.message || 'Error al guardar el aula');
    }
  };

  const handleDeleteCls = async (id: string) => {
    try {
      await api.delete(`/classrooms/${id}`);
      setClsDeleteId(null);
      fetchClassrooms();
    } catch (e) {
      console.error(e);
    }
  };

  const startEditCls = (cls: { id: string; name: string; capacity: number }) => {
    setClsEditingId(cls.id);
    setClsFormName(cls.name);
    setClsFormCapacity(cls.capacity);
    setClsError('');
  };

  const cancelEditCls = () => {
    setClsEditingId(null);
    setClsFormName('');
    setClsFormCapacity(30);
    setClsError('');
  };

  useEffect(() => {
    if (activeTab === 'catalog') {
      gsap.fromTo(
        '.gsap-course-card',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'back.out(1.2)' }
      );
    } else {
      gsap.fromTo(
        '.gsap-schedule-row',
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [courses, activeTab, scheduleDay]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este curso?')) {
      try {
        await api.delete(`/courses/${id}`);
        fetchCourses();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setName('');
    setCost(400);
    setSelectedDays([]);
    setStartTime('15:00');
    setEndTime('16:30');
    setClassroom(classrooms[0]?.name || '');
    setTeacher('');
    setCapacity(30);
    setEnrolled(0);
    setConflictError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setEditingCourse(course);
    setName(course.name);
    setCost(course.cost || 400);
    setSelectedDays(course.days || []);
    setStartTime(course.startTime || '15:00');
    setEndTime(course.endTime || '16:30');
    setClassroom(course.classroom || classrooms[0]?.name || '');
    setTeacher(course.teacher);
    setCapacity(course.capacity);
    setEnrolled(course.enrolled);
    setConflictError(null);
    setIsModalOpen(true);
  };

  const handleDayToggle = (dayVal: string) => {
    setSelectedDays(prev => 
      prev.includes(dayVal) ? prev.filter(d => d !== dayVal) : [...prev, dayVal]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const selectedClassroomObj = classrooms.find(c => c.name === classroom);
    const classroomId = selectedClassroomObj ? selectedClassroomObj.id : classrooms[0]?.id;

    if (!classroomId) {
      setConflictError('Debe crear un aula antes de registrar un curso.');
      return;
    }

    const schedules = selectedDays.map(day => ({
      dayOfWeek: day,
      startTime,
      endTime,
      classroomId,
    }));

    const payload = {
      name,
      teacher,
      capacity,
      price: cost,
      status: enrolled >= capacity ? 'FULL' : 'ACTIVE',
      branchId: activeBranch,
      schedules,
    };

    try {
      if (editingCourse) {
        await api.patch(`/courses/${editingCourse.id}`, {
          name,
          teacher,
          capacity,
          price: cost,
          status: payload.status,
          schedules,
        });
      } else {
        await api.post('/courses', payload);
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (e: any) {
      setConflictError(e.response?.data?.message || 'Error al guardar el curso');
    }
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-400" />
            Catálogo de Cursos y Horarios
          </h2>
          <p className="text-sm text-gray-400 mt-1">Administra los cursos, asigna aulas, horarios persistentes y evita colisiones.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'catalog' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Catálogo
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'schedule' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Visualizar Horarios
            </button>
          </div>

          <button
            onClick={openClsModal}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-indigo-500/40 text-gray-300 hover:text-indigo-400 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <DoorOpen className="h-4 w-4" />
            Gestionar Aulas
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Crear Curso
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <>
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 w-full">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Cargando catálogo de cursos...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const occupancyPercentage = (course.enrolled / course.capacity) * 100;
                  const isFull = occupancyPercentage >= 100;

                  return (
                    <div key={course.id} className="gsap-course-card glass-panel rounded-3xl p-6 group relative overflow-hidden flex flex-col justify-between">
                      <div>
                        {/* Badge Estado */}
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isFull ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {isFull ? 'Agotado' : 'Disponible'}
                          </span>
                          <span className="text-sm font-bold text-indigo-400">
                            Bs. {course.cost || 400}
                          </span>
                        </div>

                        {/* Info Principal */}
                        <div className="mb-4 pr-6">
                          <h3 className="text-lg font-bold text-white mb-1 line-clamp-1" title={course.name.toUpperCase()}>{course.name.toUpperCase()}</h3>
                          <p className="text-xs text-indigo-400 font-medium">Prof: {course.teacher.toUpperCase()}</p>
                        </div>

                        {/* Detalles */}
                        <div className="space-y-2 mb-6 text-xs text-gray-400">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-500 shrink-0" />
                            <span>{course.schedule}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-semibold uppercase text-[9px] px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800">Aula</span>
                            <span className="font-semibold text-gray-300">{course.classroom || 'Sin aula'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
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
            </>
          )}
        </>
      ) : (
        /* Visual Classroom Timeline Grid Dashboard */
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-850 pb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Ocupación Diaria de Aulas</h3>
              <p className="text-xs text-gray-400 mt-1">Selecciona un día para visualizar la asignación de horarios de cada aula.</p>
            </div>
            
            {/* Day Selector */}
            <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 select-none">
              {DAYS_OF_WEEK.map(d => (
                <button
                  key={d.value}
                  onClick={() => setScheduleDay(d.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    scheduleDay === d.value ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px] pb-4">
              {/* Timeline Hours Header */}
              <div className="grid grid-cols-12 items-center pb-3 border-b border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <div className="col-span-3">Aula / Aula Habilitada</div>
                <div className="col-span-9 relative h-6">
                  {HOURS.map((h, idx) => (
                    <span
                      key={h}
                      className="absolute -translate-x-1/2 text-center"
                      style={{ left: `${(idx / (HOURS.length - 1)) * 100}%` }}
                    >
                      {h === 12 ? '12:00 PM' : `${h}:00`}
                    </span>
                  ))}
                </div>
              </div>

              {/* Classroom Rows */}
              <div className="divide-y divide-gray-800/40">
                {classrooms.map(room => (
                  <div key={room.id} className="gsap-schedule-row grid grid-cols-12 items-center py-6 border-b border-gray-800/30">
                    <div className="col-span-3 pr-4">
                      <div className="font-bold text-gray-200 text-sm flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        {room.name}
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1 block">Capacidad: {room.capacity} alumnos</span>
                    </div>
                    
                    <div className="col-span-9 relative h-12 bg-gray-950/40 rounded-xl border border-gray-900 overflow-hidden">
                      {/* Grid lines for each hour */}
                      <div className="absolute inset-0 flex justify-between pointer-events-none">
                        {HOURS.map((h, idx) => (
                          <div 
                            key={h} 
                            className="h-full w-[1px] bg-gray-900 border-dashed border-gray-800/30" 
                            style={{ left: `${(idx / (HOURS.length - 1)) * 100}%` }} 
                          />
                        ))}
                      </div>

                      {/* Course blocks absolute positioned */}
                      {courses
                        .filter(c => (c.classroom === room.name || (!c.classroom && room.name === 'Aula 101')) && c.days?.includes(scheduleDay))
                        .map(c => {
                          const startMin = toMinutes(c.startTime || '15:00');
                          const endMin = toMinutes(c.endTime || '16:30');
                          const totalMin = 14 * 60; // 08:00 to 22:00 is 14 hours (840 mins)
                          const offsetMin = startMin - 8 * 60;
                          const durationMin = endMin - startMin;

                          const leftPercent = Math.max(0, (offsetMin / totalMin) * 100);
                          const widthPercent = Math.min(100 - leftPercent, (durationMin / totalMin) * 100);

                          return (
                            <div
                              key={c.id}
                              onClick={() => handleOpenEditModal(c)}
                              className="absolute top-1.5 bottom-1.5 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/30 hover:border-indigo-500/50 px-3 py-1 flex flex-col justify-center overflow-hidden transition-all group cursor-pointer shadow-lg shadow-indigo-500/5"
                              style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                              title={`${c.name}\nDocente: ${c.teacher}\nHorario: ${c.startTime} - ${c.endTime}`}
                            >
                              <p className="text-[10px] font-bold text-indigo-300 truncate leading-tight group-hover:text-indigo-200">{c.name}</p>
                              <p className="text-[8px] text-gray-400 truncate leading-none mt-1">{c.startTime} - {c.endTime} | {c.teacher}</p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Create / Edit Course */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 relative my-8">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">
              {editingCourse ? 'Editar Curso' : 'Crear Curso'}
            </h3>

            {conflictError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-start gap-2 animate-float">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{conflictError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Nombre del Curso</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  placeholder="Ej. Inglés Básico (A1)"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Costo del Curso (Bs.)</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    placeholder="Ej. 400"
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Docente</label>
                  <input 
                    type="text" 
                    required
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value.toUpperCase())}
                    placeholder="Ej. Lic. Martha Vargas"
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* Day Selection */}
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Días del Horario</label>
                <div className="flex flex-wrap gap-2 select-none">
                  {DAYS_OF_WEEK.map(d => {
                    const isSelected = selectedDays.includes(d.value);
                    return (
                      <button
                        type="button"
                        key={d.value}
                        onClick={() => handleDayToggle(d.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-500 border-indigo-400 text-white' 
                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preajustes Rápidos de Horario */}
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-3">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">⚡ Asignación Rápida de Horario</p>
                
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 block">Días Frecuentes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDays(['Lun', 'Mie', 'Vie'])}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-gray-950 border border-gray-850 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      Lun-Mie-Vie
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDays(['Mar', 'Jue'])}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-gray-950 border border-gray-850 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      Mar-Jue
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDays(['Sab'])}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-gray-950 border border-gray-850 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      Sábados
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDays(['Lun', 'Mar', 'Mie', 'Jue', 'Vie'])}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-gray-950 border border-gray-850 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      Lunes a Viernes
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 block">Horas y Turnos de Clase:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setStartTime('08:00'); setEndTime('10:00'); }}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-gray-950 border border-gray-850 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      08:00 - 10:00 (Mañana 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStartTime('10:00'); setEndTime('12:00'); }}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-gray-950 border border-gray-850 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      10:00 - 12:00 (Mañana 2)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStartTime('14:00'); setEndTime('16:00'); }}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-gray-950 border border-gray-850 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      14:00 - 16:00 (Tarde 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStartTime('16:00'); setEndTime('18:00'); }}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-gray-950 border border-gray-850 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      16:00 - 18:00 (Tarde 2)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStartTime('18:00'); setEndTime('20:00'); }}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-gray-950 border border-gray-850 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      18:00 - 20:00 (Noche 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStartTime('20:00'); setEndTime('22:00'); }}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-gray-950 border border-gray-850 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      20:00 - 22:00 (Noche 2)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStartTime('08:00'); setEndTime('12:00'); }}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-gray-950 border border-gray-850 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      08:00 - 12:00 (Intensivo Sáb)
                    </button>
                  </div>
                </div>
              </div>

              {/* Time slots and Classroom */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Hora Inicio</label>
                  <input 
                    type="time" 
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Hora Fin</label>
                  <input 
                    type="time" 
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Aula</label>
                  {classrooms.length === 0 ? (
                    <div className="w-full px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                      Sin aulas configuradas.
                    </div>
                  ) : (
                    <select
                      value={classroom}
                      onChange={(e) => setClassroom(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                    >
                      {classrooms.map(c => (
                        <option key={c.id} value={c.name} className="bg-gray-900 text-white">{c.name} (cap. {c.capacity})</option>
                      ))}
                    </select>
                  )}
                </div>
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
      {/* Classroom Management Modal */}
      {isClsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsClsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0d1117] border border-gray-800 rounded-2xl shadow-2xl z-10 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <DoorOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Gestionar Aulas</h2>
                  <p className="text-[10px] text-gray-500">Sucursal activa: {activeBranch}</p>
                </div>
              </div>
              <button
                onClick={() => setIsClsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Classroom List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {classrooms.length === 0 && (
                <div className="text-center py-10 text-gray-600">
                  <DoorOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin aulas configuradas. Agrega la primera abajo.</p>
                </div>
              )}
              {classrooms.map((cls: any) => (
                <div key={cls.id}>
                  {clsDeleteId === cls.id ? (
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 gap-3">
                      <p className="text-xs text-rose-300 flex-1">Eliminar <span className="font-bold">{cls.name}</span>?</p>
                      <div className="flex gap-2">
                        <button onClick={() => setClsDeleteId(null)} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white border border-gray-700 cursor-pointer">Cancelar</button>
                        <button onClick={() => handleDeleteCls(cls.id)} className="px-3 py-1.5 rounded-lg text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer">Eliminar</button>
                      </div>
                    </div>
                  ) : clsEditingId === cls.id ? (
                    <div className="px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={clsFormName}
                          onChange={e => { setClsFormName(e.target.value); setClsError(''); }}
                          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                          placeholder="Nombre del aula"
                          autoFocus
                        />
                        <input
                          type="number" min={1} value={clsFormCapacity}
                          onChange={e => setClsFormCapacity(Number(e.target.value))}
                          className="w-20 px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                        />
                      </div>
                      {clsError && <p className="text-rose-400 text-xs">{clsError}</p>}
                      <div className="flex gap-2">
                        <button onClick={cancelEditCls} className="flex-1 px-3 py-1.5 rounded-xl border border-gray-700 text-xs text-gray-400 hover:text-white cursor-pointer">Cancelar</button>
                        <button onClick={handleSaveCls} className="flex-1 px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-xs text-white font-bold cursor-pointer">
                          <Check className="h-3 w-3 inline mr-1" />Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-all group">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-indigo-400/60" />
                        <span className="text-sm font-medium text-white">{cls.name}</span>
                        <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">cap. {cls.capacity}</span>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditCls(cls)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white cursor-pointer" title="Editar">
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

            {/* Add New Classroom */}
            {!clsEditingId && (
              <div className="p-5 border-t border-gray-800 space-y-3">
                <p className="text-xs font-bold text-gray-400">Agregar nueva aula</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clsFormName}
                    onChange={e => { setClsFormName(e.target.value); setClsError(''); }}
                    placeholder="Nombre (Ej. Sala B, Lab Idiomas...)"
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 placeholder-gray-600"
                    onKeyDown={e => e.key === 'Enter' && handleSaveCls()}
                  />
                  <input
                    type="number" min={1} value={clsFormCapacity}
                    onChange={e => setClsFormCapacity(Number(e.target.value))}
                    title="Capacidad"
                    className="w-20 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                  <button
                    onClick={handleSaveCls}
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
    </div>
  );
}
