import gsap from 'gsap';
import { Activity, ClipboardList, FlaskConical, Lock, Mail, Moon, PlayCircle, Scale, Sun, Warehouse } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const processStages = [
  { label: 'Romana', helper: 'Ingreso y pesaje', icon: Scale },
  { label: 'Laboratorio', helper: 'Analisis de muestra', icon: FlaskConical },
  { label: 'Silo', helper: 'Destino y stock', icon: Warehouse },
  { label: 'Planilla', helper: 'Registro auditable', icon: ClipboardList },
];

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, enterDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const loginRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate('/');
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (reduceMotion || !loginRef.current) return undefined;

    const context = gsap.context(() => {
      gsap.to('.login-energy-particle', {
        x: '78vw',
        opacity: 1,
        duration: 4.8,
        repeat: -1,
        stagger: 0.65,
        ease: 'none',
      });

      gsap.to('.login-diagonal-line', {
        xPercent: 18,
        opacity: 0.75,
        duration: 6,
        repeat: -1,
        yoyo: true,
        stagger: 0.5,
        ease: 'sine.inOut',
      });

      gsap.to('.login-process__pulse', {
        scale: 1.35,
        opacity: 0,
        duration: 1.8,
        repeat: -1,
        stagger: 0.28,
        ease: 'power2.out',
      });
    }, loginRef);

    return () => context.revert();
  }, [reduceMotion]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!isSupabaseConfigured) {
      setError('Supabase no está configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
      return;
    }

    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (loginError) {
      setError(friendlyAuthError(loginError.message));
      return;
    }

    navigate('/');
  }

  async function resetPassword() {
    setError('');
    setMessage('');
    if (!email) {
      setError('Ingresa tu correo para enviar recuperación de contraseña.');
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) setError(friendlyAuthError(resetError.message));
    else setMessage('Te enviamos un correo para recuperar tu contraseña.');
  }

  function startDemo() {
    setError('');
    setMessage('');
    enterDemo?.();
    navigate('/');
  }

  return (
    <main className="login-page" ref={loginRef}>
      <div className="login-background" aria-hidden="true">
        <div className="login-field-lines">
          {Array.from({ length: 9 }).map((_, index) => <span key={index} />)}
        </div>
        <div className="login-diagonal-field">
          {Array.from({ length: 5 }).map((_, index) => <span className="login-diagonal-line" key={index} />)}
        </div>
        <div className="login-energy-stream">
          {Array.from({ length: 7 }).map((_, index) => <span className="login-energy-particle" key={index} />)}
        </div>
        <div className="login-grain-flow">
          {Array.from({ length: 18 }).map((_, index) => <span key={index} style={{ '--i': index }} />)}
        </div>
        <div className="login-horizon" />
      </div>

      <div className="login-theme-toggle">
        <button
          className="btn btn-secondary p-2.5 rounded-xl backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/10 hover:bg-white/20 dark:hover:bg-black/20 text-white shadow-lg"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-orange-400" />
          ) : (
            <Moon size={18} className="text-slate-200" />
          )}
        </button>
      </div>

      <section className="login-shell">
        <motion.div
          className="login-copy"
          initial={reduceMotion ? false : { opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        >
          <div className="login-brand-mark">
            <Logo size="xl" showText={false} />
            <span></span>
          </div>
          <div className="login-copy__kicker">Recepción agrícola · Planta Chillán</div>
          <h1>Del camión al silo, sin perder el hilo.</h1>
          <span>Controla pesaje, análisis, almacenamiento y planilla desde una operación clara, rápida y auditable.</span>
          <motion.div
            className="login-process"
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.09, delayChildren: 0.18 } },
            }}
            aria-label="Flujo de operacion: romana, laboratorio, silo y planilla"
          >
            {processStages.map(({ label, icon: Icon }) => (
              <motion.div
                className="login-process__stage"
                key={label}
                variants={{
                  hidden: { opacity: 0, y: 16, filter: 'blur(8px)' },
                  show: { opacity: 1, y: 0, filter: 'blur(0px)' },
                }}
                whileHover={reduceMotion ? undefined : { y: -5, scale: 1.015 }}
                layout
              >
                <span className="login-process__pulse" aria-hidden="true" />
                <div className="login-process__icon">
                  <Icon size={22} />
                </div>
                <span className="login-process__label">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.form
          onSubmit={submit}
          className={`login-card ${error ? 'has-error' : ''}`}
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        >
          <div className="login-card__control">
            <div>
              <span>Acceso seguro</span>
              <strong>Recepción Chillán</strong>
            </div>
            <em>Operativo</em>
          </div>

          <div className="login-card__body">
            <div className="login-card__intro">
              <p>Panel de operación</p>
              <h2>Ingresa al flujo</h2>
              <span>Sesión para equipos de recepción, laboratorio y bodega.</span>
            </div>

            <AnimatePresence mode="popLayout">
              {error && (
                <motion.div
                  className="mb-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-3 text-sm font-bold text-red-900 dark:text-red-300"
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                >
                  {error}
                </motion.div>
              )}
              {message && (
                <motion.div
                  className="mb-4 rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-950/20 p-3 text-sm font-bold text-green-900 dark:text-green-300"
                  initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="login-fields">
              <div className="form-field login-field">
                <label>Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={19} />
                  <input className="pl-11" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
              </div>
              <div className="form-field login-field">
                <label>Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={19} />
                  <input className="pl-11" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                </div>
              </div>
              <div className="login-actions">
                <button className="btn btn-primary login-submit w-full text-base" type="submit" disabled={loading}>
                  {loading ? (
                    <span className="login-submit__loading">
                      <Activity size={18} />
                      Sincronizando acceso
                    </span>
                  ) : 'Ingresar'}
                </button>
                <button className="login-demo-button" type="button" onClick={startDemo}>
                  <PlayCircle size={18} />
                  Explorar demo
                </button>
              </div>
              <button className="login-recovery" type="button" onClick={resetPassword}>¿Olvidaste tu contraseña?</button>
            </div>
          </div>
        </motion.form>
      </section>
    </main>
  );
}

function friendlyAuthError(message) {
  const text = String(message).toLowerCase();
  if (text.includes('invalid login')) return 'Correo o contraseña incorrectos.';
  if (text.includes('email not confirmed')) return 'Debes confirmar tu correo antes de ingresar.';
  if (text.includes('network')) return 'Error de conexión con Supabase.';
  return 'No se pudo iniciar sesión. Revisa tus datos e intenta nuevamente.';
}
