import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, School, BarChart3, ShieldCheck } from 'lucide-react';
import api from '../shared/api';
import gsap from 'gsap';

interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: {
    students: number;
    courses: number;
    users: number;
    branches: number;
    modules: string[];
  };
}

// Fondo Animado por CSS (100% Confiable, Minimalista y Elegante con "Líneas Orbitando")
const OrbitBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#030712] flex items-center justify-center">
    <style>{`
      @keyframes orbit-cw {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes orbit-ccw {
        0% { transform: translate(-50%, -50%) rotate(360deg); }
        100% { transform: translate(-50%, -50%) rotate(0deg); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px) translateX(0px); }
        50% { transform: translateY(-20px) translateX(10px); }
      }
      .orbit-cw { animation: orbit-cw linear infinite; }
      .orbit-ccw { animation: orbit-ccw linear infinite; }
      .float-1 { animation: float 6s ease-in-out infinite; }
      .float-2 { animation: float 8s ease-in-out infinite; animation-delay: -2s; }
      .float-3 { animation: float 7s ease-in-out infinite; animation-delay: -4s; }
    `}</style>

    {/* Cuadrícula sutil de fondo */}
    <div 
      className="absolute inset-0 opacity-[0.12]" 
      style={{ 
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', 
        backgroundSize: '60px 60px' 
      }}
    />

    {/* Resplandores Centrales (Nebulosas difusas) */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/15 rounded-full blur-[120px]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[80px]" />

    {/* ORBITAS Y PLANETAS */}
    
    {/* Órbita 1 (Pequeña, rápida) */}
    <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] border border-blue-400/25 rounded-full orbit-cw" style={{ animationDuration: '30s' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_12px_rgba(96,165,250,1)]" />
    </div>

    {/* Órbita 2 (Mediana, discontinua, reversa) */}
    <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border border-dashed border-indigo-400/25 rounded-full orbit-ccw" style={{ animationDuration: '50s' }}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,1)]" />
      <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full shadow-[0_0_10px_rgba(147,197,253,1)]" />
    </div>

    {/* Órbita 3 (Grande) */}
    <div className="absolute top-1/2 left-1/2 w-[900px] h-[900px] border border-blue-300/15 rounded-full orbit-cw" style={{ animationDuration: '80s' }}>
      <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,1)]" />
    </div>

    {/* Órbita 4 (Muy Grande, discontinua, reversa) */}
    <div className="absolute top-1/2 left-1/2 w-[1250px] h-[1250px] border border-dashed border-white/10 rounded-full orbit-ccw" style={{ animationDuration: '120s' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-violet-400 rounded-full shadow-[0_0_18px_rgba(167,139,250,1)]" />
    </div>

    {/* Órbita 5 (Enorme, envuelve toda la página) */}
    <div className="absolute top-1/2 left-1/2 w-[1700px] h-[1700px] border border-blue-500/10 rounded-full orbit-cw" style={{ animationDuration: '160s' }}>
      <div className="absolute bottom-1/2 left-0 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,1)]" />
    </div>

    {/* Partículas de Polvo Cósmico Flotantes */}
    <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 bg-white/40 rounded-full float-1 blur-[1px]" />
    <div className="absolute top-[65%] left-[85%] w-2 h-2 bg-blue-300/40 rounded-full float-2 blur-[1px]" />
    <div className="absolute top-[85%] left-[25%] w-1.5 h-1.5 bg-indigo-300/50 rounded-full float-3 blur-[1px]" />
    <div className="absolute top-[35%] left-[75%] w-2.5 h-2.5 bg-white/20 rounded-full float-1 blur-[2px]" />
    <div className="absolute top-[10%] left-[60%] w-1 h-1 bg-cyan-300/40 rounded-full float-2 blur-[1px]" />
  </div>
);

export default function Subscriptions() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const heroMockupRef = useRef<HTMLDivElement>(null);
  const heroMockupWrapperRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardWrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const caseMockupRef = useRef<HTMLDivElement>(null);
  const caseMockupWrapperRef = useRef<HTMLDivElement>(null);

  // Cargar planes
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/subscriptions/plans');
        setPlans(response.data);
      } catch (err) {
        console.error('Error cargando planes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // GSAP Fade In
  useEffect(() => {
    if (!loading && plans.length > 0) {
      gsap.fromTo(
        '.gsap-hero-fade',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );
    }
  }, [loading, plans]);

  // Tilt 3D Estable
  const handleMouseMoveTilt = (e: React.MouseEvent, wrapper: HTMLDivElement | null, card: HTMLDivElement | null) => {
    if (!wrapper || !card) return;

    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = -((x - centerX) / centerX) * 10;

    card.style.transition = 'none';
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
  };

  const handleMouseLeaveTilt = (card: HTMLDivElement | null) => {
    if (!card) return;
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  const handleSelectPlan = (planId: string) => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      navigate('/dashboard');
    } else {
      navigate(`/login?planId=${planId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="relative flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border border-blue-500/20 border-t-blue-500 animate-spin mb-3" />
          <p className="text-gray-500 text-xs tracking-wide">Cargando la plataforma...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-transparent relative overflow-hidden select-none text-white font-sans">
      
      {/* Nuevo Fondo Animado por CSS puro (Garantizado que se renderiza siempre) */}
      <OrbitBackground />

      {/* --- Navegación --- */}
      <nav className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-600 shadow-md">
            <School className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white uppercase">NextAcademy</span>
        </div>

        {/* Enlaces de navegación */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-400">
          <a href="#plans" className="hover:text-white transition-colors">Servicios</a>
          <a href="#plans" className="hover:text-white transition-colors">Tecnologías</a>
          <a href="#plans" className="hover:text-white transition-colors">Nosotros</a>
          <a href="#plans" className="hover:text-white transition-colors">Clientes</a>
          <a href="#plans" className="hover:text-white transition-colors">Soporte</a>
        </div>

        {/* Botón de acceso administrador */}
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md shadow-blue-600/10"
        >
          Acceso Administrador
        </button>
      </nav>

      {/* --- PANEL 1: Hero Principal con Imagen de Laptop Real --- */}
      <header className="max-w-6xl mx-auto text-center pt-20 pb-36 px-6 relative z-10 flex flex-col items-center">
        {/* Etiqueta */}
        <div className="gsap-hero-fade inline-flex items-center gap-2 text-blue-400 text-xs font-bold tracking-wider uppercase mb-5">
          <Sparkles className="h-3.5 w-3.5" />
          SaaS ERP Educativo Modular
        </div>

        {/* Título en Español y Mayúsculas */}
        <h1 className="gsap-hero-fade text-4xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08] uppercase max-w-4xl">
          Revitaliza y optimiza la gestión de tu academia
        </h1>

        {/* Subtítulo */}
        <p className="gsap-hero-fade text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed mb-10">
          Tu administración académica no tiene por qué frenar el crecimiento de tu instituto. Automatiza cobros por QR, organiza inscripciones y supervisa caja chica de forma estable, segura y libre de fricciones.
        </p>

        {/* Botones */}
        <div className="gsap-hero-fade flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto mb-16">
          <a
            href="#plans"
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition-all active:scale-[0.98] cursor-pointer text-center shadow-lg shadow-blue-600/20"
          >
            Iniciar Demo Gratuita
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold text-xs tracking-wide transition-all active:scale-[0.98] cursor-pointer text-center"
          >
            Ver Módulos Clave
          </a>
        </div>

        {/* Imagen del Laptop de Gestión (Estable con 3D Tilt) */}
        <div
          ref={heroMockupWrapperRef}
          onMouseMove={(e) => handleMouseMoveTilt(e, heroMockupWrapperRef.current, heroMockupRef.current)}
          onMouseLeave={() => handleMouseLeaveTilt(heroMockupRef.current)}
          className="w-full max-w-4xl relative cursor-pointer gsap-hero-fade animate-float-1"
          style={{ perspective: '1000px' }}
        >
          <div
            ref={heroMockupRef}
            className="rounded-2xl overflow-hidden border border-blue-500/20 shadow-2xl shadow-blue-500/5 bg-gray-950/40 relative aspect-video"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <img
              src="/laptop_preview.png"
              alt="Laptop de Gestión NextAcademy"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
          </div>
        </div>
      </header>

      {/* --- PANEL 2: Planes de Suscripción (Fondo transparente para ver fondo orbital) --- */}
      <section id="plans" className="max-w-7xl mx-auto px-6 py-28 relative z-10 border-t border-white/5 bg-transparent">
        
        <div className="text-center mb-20">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">
            ¡Deja que nuestros planes hablen por sí mismos!
          </h2>
          <p className="text-gray-500 text-xs tracking-wider uppercase font-semibold">
            Explora las opciones de suscripción modulares para tu instituto en Bolivia
          </p>
        </div>

        {/* Rejilla de planes minimalistas */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const isElite = plan.name.toLowerCase().includes('élite');
            
            return (
              <div
                key={plan.id}
                ref={(el) => { cardWrappersRef.current[index] = el; }}
                onMouseMove={(e) => handleMouseMoveTilt(e, cardWrappersRef.current[index], cardsRef.current[index])}
                onMouseLeave={() => handleMouseLeaveTilt(cardsRef.current[index])}
                className="relative cursor-pointer"
                style={{ perspective: '1000px' }}
              >
                <div
                  ref={(el) => { cardsRef.current[index] = el; }}
                  className="glass-panel rounded-2xl p-8 flex flex-col justify-between h-full border border-white/5 bg-gray-950/40 backdrop-blur-md"
                  style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                >
                  <div>
                    <h3 className="text-lg font-bold text-gray-200 mb-1 flex items-center justify-between">
                      <span>{plan.name}</span>
                      {isElite && (
                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-[8px] font-semibold uppercase text-blue-400">
                          Recomendado
                        </span>
                      )}
                    </h3>
                    
                    <p className="text-[10px] text-gray-500 mb-6 font-semibold uppercase">
                      Capacidad: {plan.features.students === -1 ? 'Alumnos ilimitados' : `${plan.features.students} alumnos`}
                    </p>

                    <div className="flex items-baseline gap-1 mb-8 pt-4">
                      <span className="text-4xl font-light tracking-tight text-white">Bs. {plan.price}</span>
                      <span className="text-gray-500 text-xs font-light">/mes</span>
                    </div>

                    <ul className="space-y-3.5 mb-8">
                      <li className="flex items-center gap-2.5 text-xs text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <span>{plan.features.students === -1 ? 'Estudiantes Ilimitados' : `Hasta ${plan.features.students} alumnos`}</span>
                      </li>
                      <li className="flex items-center gap-2.5 text-xs text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <span>{plan.features.branches === -1 ? 'Sucursales Ilimitadas' : `${plan.features.branches} Sucursal${plan.features.branches > 1 ? 'es' : ''}`}</span>
                      </li>
                      <li className="flex items-center gap-2.5 text-xs text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <span>{plan.features.users === -1 ? 'Usuarios Ilimitados' : `Hasta ${plan.features.users} usuarios`}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-gray-500 font-semibold uppercase">
                      #{plan.name.split(' ')[1] || 'SaaS'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan(plan.id);
                      }}
                      className="inline-flex items-center gap-1 font-bold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>Elegir Plan</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Acceso a la tabla comparativa */}
        <div className="text-center">
          <a
            href="#features"
            className="inline-block px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide uppercase transition-colors shadow-md shadow-blue-600/10"
          >
            Ver tabla de características
          </a>
        </div>
      </section>

      {/* --- PANEL 3: Casos de Éxito --- */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-white/5 bg-transparent">
        
        <div className="text-center mb-20">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">
            Casos de Éxito
          </h2>
          <p className="text-gray-500 text-xs tracking-wider uppercase font-semibold">
            Análisis de módulos y resultados del ERP
          </p>
        </div>

        {/* Layout dividido exacto al mockup */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          
          {/* Lado Izquierdo: Overlapping Smartphone Mockups */}
          <div
            ref={caseMockupWrapperRef}
            onMouseMove={(e) => handleMouseMoveTilt(e, caseMockupWrapperRef.current, caseMockupRef.current)}
            onMouseLeave={() => handleMouseLeaveTilt(caseMockupRef.current)}
            className="relative w-full h-[360px] flex items-center justify-center bg-gray-950/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
            style={{ perspective: '1000px' }}
          >
            <div
              ref={caseMockupRef}
              className="relative w-full h-full flex items-center justify-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Smartphone Real */}
              <div className="absolute w-[200px] h-[290px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 transform -rotate-12 -translate-x-12 translate-y-6 flex flex-col justify-between float-1">
                <img
                  src="/mobile_preview.png"
                  alt="Aplicación Móvil NextAcademy"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              </div>

              {/* Tarjeta de Datos flotante superpuesta */}
              <div className="absolute w-[180px] h-[120px] bg-[#0c1222]/80 border border-blue-500/30 rounded-xl shadow-2xl transform rotate-12 translate-x-16 -translate-y-12 flex flex-col justify-between p-3.5 float-2">
                <div>
                  <span className="text-[8px] font-bold uppercase text-blue-400 tracking-wider">Reporte de Recaudación</span>
                  <span className="text-lg font-bold text-white block mt-1">Bs. 34,200.00</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-3/4 rounded-full"></div>
                </div>
                <div className="flex justify-between items-center text-[8px] text-gray-500">
                  <span>Meta Mensual</span>
                  <span className="text-green-400 font-bold">75% Completado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Contenido */}
          <div className="space-y-6">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
              SaaS ERP Educativo / Bolivia
            </span>
            
            <h3 className="text-2xl font-extrabold text-white leading-none uppercase">
              Control de Caja Chica
            </h3>

            <p className="text-gray-400 text-xs font-light leading-relaxed">
              Supervisa de forma automatizada cada movimiento de cobros y gastos en tu centro de capacitación. Diseñado específicamente para cumplir con el control administrativo boliviano.
            </p>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Resultados Esperados
              </span>
              
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-200">100% de arqueos de caja transparentes</h4>
                  <p className="text-[10px] text-gray-500 font-light mt-0.5">Control sin fugas ni errores de cuadre.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Reducción del 30% en morosidad de alumnos</h4>
                  <p className="text-[10px] text-gray-500 font-light mt-0.5">Alertas automáticas de cobros pendientes.</p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-2">
                <span className="text-[9px] font-semibold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">#Caja</span>
                <span className="text-[9px] font-semibold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">#QR</span>
                <span className="text-[9px] font-semibold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">#Banca</span>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                <span>Probar módulo Caja</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer (Fondo transparente) --- */}
      <footer className="border-t border-white/5 py-12 px-6 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <School className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold uppercase text-gray-400">NextAcademy</span>
          </div>
          <p className="text-[9px] text-gray-600 uppercase tracking-widest">
            © {new Date().getFullYear()} NextAcademy. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
