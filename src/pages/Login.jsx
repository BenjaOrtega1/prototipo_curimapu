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
    <main className="grid min-h-screen place-items-center bg-curimapu-light px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size="lg" showText={false} />
          <h1 className="mt-5 text-2xl font-bold text-curimapu-dark">Sistema de Recepción y Análisis de Cereales</h1>
          <p className="mt-2 text-sm text-slate-500">Acceso operativo Curimapu Chillán</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <label>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={17} />
              <input className="pl-9" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <label>Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-slate-400" size={17} />
              <input className="pl-9" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary w-full" type="submit">Ingresar</button>
        </div>
      </form>
    </main>
  );
}
