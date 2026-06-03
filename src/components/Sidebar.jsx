import { BarChart3, Database, FlaskConical, LogOut, Scale, Settings, Table2, Warehouse, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/romana', label: 'Romana / Pesaje', icon: Scale },
  { to: '/laboratorio', label: 'Laboratorio / Analisis', icon: FlaskConical },
  { to: '/almacenamiento', label: 'Almacenamiento', icon: Warehouse },
  { to: '/planilla', label: 'Planilla general', icon: Table2 },
  { to: '/configuracion', label: 'Configuracion', icon: Settings },
];

export default function Sidebar({ open = false, onClose }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('curimapu_session');
    navigate('/login');
  }

  return (
    <>
      {open && <div className="app-sidebar__overlay" onClick={onClose} />}
      <aside className={`app-sidebar ${open ? 'is-open' : ''}`}>
        <div className="app-sidebar__inner">
          <div className="app-sidebar__brand">
            <div className="flex items-start justify-between gap-3">
              <Logo size="md" />
              <button className="btn btn-secondary px-2 lg:hidden" type="button" onClick={onClose} aria-label="Cerrar menu">
                <X size={17} />
              </button>
            </div>
            <p>Sistema de Recepcion y Analisis de Cereales</p>
          </div>

          <nav className="app-sidebar__nav">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) => `app-sidebar__link ${isActive ? 'is-active' : ''}`}
              >
                <Icon size={19} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="app-sidebar__footer">
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-curimapu-light p-3 text-sm font-bold text-curimapu-dark">
              <Database size={18} />
              Datos centralizados
            </div>
            <button className="btn btn-secondary w-full justify-start" onClick={logout}>
              <LogOut size={17} />
              Salir
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
