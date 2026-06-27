import { BarChart3, Database, FlaskConical, LogOut, PanelLeftClose, Scale, Table2, UserCog, Warehouse } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { motionTokens } from '../lib/motionSystem';
import { supabase } from '../lib/supabase';
import { roleLabel } from '../utils/permissions';

const links = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/romana', label: 'Romana / Pesaje', icon: Scale },
  { to: '/laboratorio', label: 'Laboratorio / Análisis', icon: FlaskConical },
  { to: '/almacenamiento', label: 'Almacenamiento', icon: Warehouse },
  { to: '/planilla', label: 'Planilla general', icon: Table2 },
];

export default function Sidebar({ open = false, onClose }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { exitDemo, role } = useAuth();
  const visibleLinks = role === 'desarrollador'
    ? [...links, { to: '/usuarios', label: 'Usuarios y roles', icon: UserCog }]
    : links;

  async function logout() {
    exitDemo?.();
    await supabase?.auth.signOut();
    navigate('/login');
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="app-sidebar__overlay"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionTokens.duration.base }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      <motion.aside
        className={`app-sidebar ${open ? 'is-open' : ''}`}
        initial={false}
      >
        <div className="app-sidebar__inner">
          <div className="app-sidebar__brand">
            <div className="flex items-start justify-between gap-3">
              <Logo size="md" showText={false} />
              <button className="btn btn-secondary px-2" type="button" onClick={onClose} aria-label="Minimizar menú lateral">
                <PanelLeftClose size={17} />
              </button>
            </div>
            <div className="app-sidebar__system">
              <strong>Sistema de Recepción y Análisis Curimapu</strong>
              <span>{roleLabel(role)}</span>
            </div>
          </div>

          <nav className="app-sidebar__nav">
            {visibleLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
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
      </motion.aside>
    </>
  );
}
