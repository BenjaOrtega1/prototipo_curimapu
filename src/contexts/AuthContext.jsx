import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AuthContext = createContext(null);
const DEMO_SESSION_KEY = 'curimapu_demo_session';

const demoUser = {
  id: 'demo-user',
  email: 'demo@curimapu.local',
  user_metadata: {
    nombre: 'Modo Demo',
    rol: 'admin',
  },
  app_metadata: {
    role: 'admin',
  },
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [demoSession, setDemoSession] = useState(() => localStorage.getItem(DEMO_SESSION_KEY) === 'true');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  function enterDemo() {
    localStorage.setItem(DEMO_SESSION_KEY, 'true');
    setDemoSession(true);
  }

  function exitDemo() {
    localStorage.removeItem(DEMO_SESSION_KEY);
    setDemoSession(false);
  }

  const value = useMemo(() => ({
    session,
    user: demoSession ? demoUser : session?.user || null,
    loading,
    isDemo: demoSession,
    enterDemo,
    exitDemo,
    isAuthenticated: demoSession || Boolean(session),
  }), [session, loading, demoSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
