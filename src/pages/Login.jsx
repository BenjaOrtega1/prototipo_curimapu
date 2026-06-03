import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('operaciones@curimapu.cl');
  const [password, setPassword] = useState('demo123');

  function submit(event) {
    event.preventDefault();
    localStorage.setItem('curimapu_session', 'true');
    navigate('/');
  }

  return (
    <main className="login-page">
      <form onSubmit={submit} className="login-card">
        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <Logo size="lg" showText={false} />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-curimapu-green">Curimapu Chillan</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-curimapu-dark">
            Sistema de Recepcion y Analisis de Cereales
          </h1>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Acceso simple para romana, laboratorio, almacenamiento y planilla general.
          </p>
        </div>

        <div className="space-y-4">
          <div className="form-field">
            <label>Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={19} />
              <input className="pl-11" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="form-field">
            <label>Contrasena</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={19} />
              <input className="pl-11" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary w-full text-base" type="submit">
            Ingresar al sistema
          </button>
        </div>
      </form>
    </main>
  );
}
