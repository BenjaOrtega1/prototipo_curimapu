import { BarChart3, Database, FlaskConical, LogOut, Scale, Settings, Table2, Warehouse } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/romana', label: 'Romana / Pesaje', icon: Scale },
  { to: '/laboratorio', label: 'Laboratorio / Análisis', icon: FlaskConical },
  { to: '/almacenamiento', label: 'Almacenamiento', icon: Warehouse },
  { to: '/planilla', label: 'Planilla general', icon: Table2 },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('curimapu_session');
    navigate('/login');
  }

  return (
    <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-100 px-5 py-4">
          <Logo size="md" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sistema de Recepción y Análisis de Cereales
          </p>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 py-3 lg:flex-1 lg:flex-col lg:overflow-visible">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `btn justify-start whitespace-nowrap ${isActive ? 'bg-curimapu-green text-white' : 'text-slate-700 hover:bg-curimapu-light'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t border-slate-100 p-4 lg:block">
          <div className="mb-3 flex items-center gap-2 rounded-md bg-curimapu-light p-3 text-sm text-curimapu-dark">
            <Database size={17} />
            Datos centralizados
          </div>
          <button className="btn btn-secondary w-full justify-start" onClick={logout}>
            <LogOut size={17} />
            Salir
          </button>
        </div>
      </div>
    </aside>
  );
}
