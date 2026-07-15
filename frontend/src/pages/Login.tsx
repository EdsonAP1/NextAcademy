import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Mail, Lock, User, Sparkles, LogIn, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../shared/api';
import gsap from 'gsap';

interface Plan {
  id: string;
  name: string;
  price: number;
}

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [tenantName, setTenantName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);

  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tiltWrapperRef = useRef<HTMLDivElement>(null);

  // Cargar planes para registro
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/subscriptions/plans');
        setPlans(response.data);
        
        // Leer planId pre-seleccionado de la URL
        const queryParams = new URLSearchParams(window.location.search);
        const planIdParam = queryParams.get('planId');
        
        if (planIdParam && response.data.some((p: Plan) => p.id === planIdParam)) {
          setSelectedPlan(planIdParam);
          setIsLogin(false); // Cambiar a registro si viene un plan de la landing
        } else if (response.data.length > 0) {
          setSelectedPlan(response.data[0].id); // Por defecto el primer plan
        }
      } catch (err) {
        console.error('Error cargando planes', err);
      }
    };
    fetchPlans();
  }, []);

  // Animación de entrada GSAP
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        '.gsap-fade-in',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );
    }
  }, [isLogin]);

  // Efecto 3D Tilt al mover el mouse
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!tiltWrapperRef.current || !cardRef.current) return;
    const wrapper = tiltWrapperRef.current;
    const card = cardRef.current;
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = -((x - centerX) / centerX) * 10;

    card.style.transition = 'none';
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', {
        email: loginEmail,
        pass: loginPassword,
      });
      // Guardar información básica de sesión en localStorage para estado no-crítico del cliente
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/auth/register', {
        tenantName,
        name: ownerName,
        email: registerEmail,
        pass: registerPassword,
        planId: selectedPlan,
      });
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setSuccess('¡Registro completado con éxito!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar el instituto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center bg-[#030712] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Fondos degradados brillantes (Antigravity Space Depth) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full glow-blur-purple opacity-40 animate-float-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full glow-blur-blue opacity-40 animate-float pointer-events-none" />

      {/* Grid de partículas del fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-lg z-10 perspective-container">
        {/* Cabecera / Logotipo */}
        <div className="text-center mb-8 gsap-fade-in">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 mb-4 animate-float">
            <School className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            NextAcademy
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            SaaS ERP Administrativo Educativo para Bolivia
          </p>
        </div>

        {/* Tarjeta de Autenticación Wrapper (Estático para evitar saltos) */}
        <div
          ref={tiltWrapperRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full relative"
          style={{ perspective: '1000px' }}
        >
          <div
            ref={cardRef}
            className="glass-panel rounded-3xl p-8 tilt-card shadow-2xl relative w-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
          {/* Tabs */}
          <div className="flex border-b border-gray-800 mb-6 gsap-fade-in">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 pb-3 text-center font-semibold text-sm transition-colors duration-300 ${isLogin ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 pb-3 text-center font-semibold text-sm transition-colors duration-300 ${!isLogin ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Registrar Instituto
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-900/30 border border-red-500/30 text-red-200 text-xs font-medium animate-float">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 rounded-xl bg-green-900/30 border border-green-500/30 text-green-200 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              {success}
            </div>
          )}

          {/* Formulario de Login */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="gsap-fade-in flex flex-col">
                <label className="text-xs font-semibold text-gray-400 mb-2">Correo Electrónico</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 py-3 pr-4 glass-input text-sm"
                    placeholder="ejemplo@instituto.edu"
                  />
                </div>
              </div>

              <div className="gsap-fade-in flex flex-col">
                <label className="text-xs font-semibold text-gray-400 mb-2">Contraseña</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 py-3 pr-4 glass-input text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="gsap-fade-in w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {loading ? 'Accediendo...' : 'Ingresar'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            /* Formulario de Registro */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              <div className="gsap-fade-in flex flex-col">
                <label className="text-xs font-semibold text-gray-400 mb-1.5">Nombre del Instituto</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <School className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full pl-10 py-3 pr-4 glass-input text-sm"
                    placeholder="Ej. Instituto Oxford"
                  />
                </div>
              </div>

              <div className="gsap-fade-in flex flex-col">
                <label className="text-xs font-semibold text-gray-400 mb-1.5">Nombre del Propietario</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full pl-10 py-3 pr-4 glass-input text-sm"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
              </div>

              <div className="gsap-fade-in flex flex-col">
                <label className="text-xs font-semibold text-gray-400 mb-1.5">Correo del Propietario</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full pl-10 py-3 pr-4 glass-input text-sm"
                    placeholder="admin@oxford.edu"
                  />
                </div>
              </div>

              <div className="gsap-fade-in flex flex-col">
                <label className="text-xs font-semibold text-gray-400 mb-1.5">Contraseña de Acceso</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full pl-10 py-3 pr-4 glass-input text-sm"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div className="gsap-fade-in flex flex-col">
                <label className="text-xs font-semibold text-gray-400 mb-1.5">Seleccionar Plan Inicial</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-4 py-3 glass-input text-sm text-gray-300 focus:bg-gray-900 cursor-pointer"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id} className="bg-gray-900 text-gray-300">
                      {p.name} - Bs. {p.price}/mes
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="gsap-fade-in w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {loading ? 'Creando Instituto...' : 'Crear Instituto y Suscribirse'}
                {!loading && <Sparkles className="h-4 w-4" />}
              </button>
            </form>
          )}
        </div>
      </div>

        {/* Enlace a la Landing de Planes Públicos */}
        <div className="text-center mt-6 gsap-fade-in">
          <button
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium border-b border-indigo-500/30 hover:border-indigo-500/80 pb-0.5 cursor-pointer"
          >
            Ver tabla de características de planes y suscripciones
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
