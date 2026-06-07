import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { supabase } from '../lib/supabase';

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  async function logout() {
    await supabase?.auth.signOut();
    navigate('/login');
  }

  return (
    <header className="app-header">
      <button className="app-header__menu" type="button" onClick={onMenuClick} aria-label="Abrir menu">
        <Menu size={22} />
      </button>
      <div>
        <p className="app-header__eyebrow">Operacion planta</p>
        <h1>Hola, equipo Curimapu</h1>
      </div>
      <div className="app-header__right">
        <div className="text-right">
          <p className="m-0 text-xs font-black text-curimapu-dark">Bienvenido</p>
          <p className="m-0 max-w-56 truncate normal-case">{user?.user_metadata?.nombre || user?.email}</p>
        </div>
        <span>{today}</span>
        <Logo size="sm" showText={false} />
        <button className="btn btn-secondary" type="button" onClick={logout}><LogOut size={17} />Cerrar sesion</button>
      </div>
    </header>
  );
}
