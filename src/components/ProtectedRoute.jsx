import { Navigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();

  if (!isSupabaseConfigured) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm font-bold text-slate-600">Verificando sesion...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
