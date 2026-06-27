import { RefreshCw, Save, ShieldCheck, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import SectionCard from '../components/SectionCard.jsx';
import Toast from '../components/Toast.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { createAdminUser, listAdminUsers, updateAdminUser } from '../services/adminUsersService';
import { roles } from '../utils/permissions';

const roleOptions = ['admin', 'desarrollador', 'romana', 'laboratorio', 'almacenamiento', 'consulta'];

const initialForm = {
  email: '',
  password: '',
  nombre: '',
  role: 'consulta',
};

export default function Usuarios() {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [roleDrafts, setRoleDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const canManageUsers = role === 'desarrollador';
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => String(a.email || '').localeCompare(String(b.email || ''))),
    [users],
  );

  async function load() {
    if (!canManageUsers) return;
    setLoading(true);
    setError('');
    try {
      const data = await listAdminUsers();
      setUsers(data.users || []);
      setRoleDrafts(Object.fromEntries((data.users || []).map((user) => [user.id, user.role || user.rol || 'consulta'])));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [canManageUsers]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!canManageUsers) return;
    if (!form.nombre.trim()) {
      setError('Payload incompleto: nombre requerido.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');
    try {
      await createAdminUser(form);
      setForm(initialForm);
      setNotice('Usuario creado y perfil asignado correctamente.');
      await load();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveRole(user) {
    const nextRole = roleDrafts[user.id] || 'consulta';
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await updateAdminUser(user.id, { nombre: user.nombre || user.email, role: nextRole });
      setNotice(`Rol actualizado para ${user.email}.`);
      await load();
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setSaving(false);
    }
  }

  if (!canManageUsers) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Usuarios</h1>
            <p className="text-sm text-slate-600">Esta seccion esta disponible solo para el rol desarrollador.</p>
          </div>
        </div>
        <SectionCard>
          <EmptyState title="Acceso restringido" description="Inicia sesion como desarrollador para administrar usuarios." />
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Usuarios y roles</h1>
          <p className="text-sm text-slate-600">Crea accesos y asigna permisos sin entrar al panel de Supabase.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={load} disabled={loading || saving}>
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      <SectionCard
        title="Agregar usuario"
        description="El usuario se crea en Supabase Auth y se registra en perfiles con el rol seleccionado."
        action={<ShieldCheck size={22} className="text-curimapu-green" />}
      >
        <form className="user-admin-form" onSubmit={submit}>
          <label>
            Nombre
            <input required value={form.nombre} onChange={(event) => updateForm('nombre', event.target.value)} placeholder="Nombre visible" />
          </label>
          <label>
            Correo
            <input required type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} placeholder="usuario@curimapu.cl" />
          </label>
          <label>
            Contrasena inicial
            <input required type="password" minLength={6} value={form.password} onChange={(event) => updateForm('password', event.target.value)} placeholder="Minimo 6 caracteres" />
          </label>
          <label>
            Rol
            <select value={form.role} onChange={(event) => updateForm('role', event.target.value)}>
              {roleOptions.map((option) => <option key={option} value={option}>{roles[option]?.label || option}</option>)}
            </select>
          </label>
          <button className="btn btn-primary user-admin-form__submit" type="submit" disabled={saving}>
            <UserPlus size={17} />
            {saving ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Usuarios registrados" description="Listado combinado desde Supabase Auth y la tabla perfiles.">
        {loading ? (
          <div className="premium-skeleton">
            <span className="premium-skeleton__block" />
            <span className="premium-skeleton__block" />
            <span className="premium-skeleton__block premium-skeleton__block--short" />
          </div>
        ) : sortedUsers.length === 0 ? (
          <EmptyState title="Sin usuarios" description="Crea el primer usuario operativo desde el formulario superior." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-3">Correo</th>
                  <th className="px-3 py-3">Nombre</th>
                  <th className="px-3 py-3">Rol actual</th>
                  <th className="px-3 py-3">Nuevo rol</th>
                  <th className="px-3 py-3">Accion</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => {
                  const currentRole = user.role || user.rol || 'consulta';
                  const draft = roleDrafts[user.id] || currentRole;
                  const unchanged = draft === currentRole;
                  return (
                    <tr key={user.id}>
                      <td className="px-3 py-2 font-bold">{user.email}</td>
                      <td className="px-3 py-2">{user.nombre || '-'}</td>
                      <td className="px-3 py-2">{roles[currentRole]?.label || currentRole}</td>
                      <td className="px-3 py-2">
                        <select value={draft} onChange={(event) => setRoleDrafts((current) => ({ ...current, [user.id]: event.target.value }))}>
                          {roleOptions.map((option) => <option key={option} value={option}>{roles[option]?.label || option}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <button className="btn btn-secondary" type="button" onClick={() => saveRole(user)} disabled={saving || unchanged}>
                          <Save size={16} />
                          Guardar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Toast message={notice} onClose={() => setNotice('')} />
      <Toast message={error} type="error" onClose={() => setError('')} />
    </div>
  );
}
