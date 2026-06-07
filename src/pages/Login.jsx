import { Lock, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate('/');
  }, [authLoading, isAuthenticated, navigate]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!isSupabaseConfigured) {
      setError('Supabase no esta configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
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
      setError('Ingresa tu correo para enviar recuperacion de contrasena.');
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) setError(friendlyAuthError(resetError.message));
    else setMessage('Te enviamos un correo para recuperar tu contrasena.');
  }

  return (
    <main className="login-page">
      <form onSubmit={submit} className="login-card">
        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center"><Logo size="lg" showText={false} /></div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-curimapu-green">Curimapu Chillan</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-curimapu-dark">Sistema de Recepcion y Analisis de Cereales</h1>
          <p className="mt-3 text-sm font-medium text-slate-500">Ingresa con tu usuario registrado en Supabase Auth.</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-900">{error}</div>}
        {message && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-900">{message}</div>}

        <div className="space-y-4">
          <div className="form-field">
            <label>Correo electronico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={19} />
              <input className="pl-11" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
          </div>
          <div className="form-field">
            <label>Contrasena</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={19} />
              <input className="pl-11" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary w-full text-base" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <button className="btn btn-ghost w-full" type="button" onClick={resetPassword}>Olvidaste tu contrasena?</button>
        </div>
      </form>
    </main>
  );
}

function friendlyAuthError(message) {
  const text = String(message).toLowerCase();
  if (text.includes('invalid login')) return 'Correo o contrasena incorrectos.';
  if (text.includes('email not confirmed')) return 'Debes confirmar tu correo antes de ingresar.';
  if (text.includes('network')) return 'Error de conexion con Supabase.';
  return 'No se pudo iniciar sesion. Revisa tus datos e intenta nuevamente.';
}
