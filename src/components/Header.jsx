import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { supabase } from '../lib/supabase';

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, exitDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const today = new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  async function logout() {
    exitDemo?.();
    await supabase?.auth.signOut();
    navigate('/login');
  }

  const { scrollY } = useScroll();
  const rawProgress = useTransform(scrollY, [0, 260], [0, 1]);
  const progress = useSpring(rawProgress, { stiffness: 260, damping: 32 });

  return (
    <header className="app-header">
      <motion.span className="app-header__progress" style={{ scaleX: progress }} aria-hidden="true" />
      <button className="app-header__menu" type="button" onClick={onMenuClick} aria-label="Abrir menu">
        <Menu size={22} />
      </button>
      <div>
        <p className="app-header__eyebrow">Operacion planta</p>
        <h1 className="text-xl md:text-2xl font-black text-curimapu-dark">Hola, equipo Curimapu</h1>
      </div>
      <div className="app-header__right">
        <div className="text-right">
          <p className="m-0 text-xs font-black text-curimapu-green">Bienvenido</p>
          <p className="m-0 max-w-56 truncate normal-case text-sm font-bold text-main">
            {user?.user_metadata?.nombre || user?.email}
          </p>
        </div>
        <span className="text-sm font-semibold text-muted">{today}</span>
        <button
          className="btn btn-secondary p-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {theme === 'dark' ? (
            <Sun size={17} className="text-amber-500 hover:text-amber-400 transition-colors" />
          ) : (
            <Moon size={17} className="text-muted hover:text-curimapu-dark transition-colors" />
          )}
        </button>
        <Logo size="sm" showText={false} />
        <button className="btn btn-secondary" type="button" onClick={logout}>
          <LogOut size={17} />
          Cerrar sesion
        </button>
      </div>
    </header>
  );
}
