import { Menu } from 'lucide-react';
import Logo from './Logo.jsx';

export default function Header({ onMenuClick }) {
  const today = new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

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
        <span>{today}</span>
        <Logo size="sm" showText={false} />
      </div>
    </header>
  );
}
