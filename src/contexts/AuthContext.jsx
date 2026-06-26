import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { clearDemoStore, DEMO_SESSION_KEY } from '../services/localStore';
import { getRoleCapabilities, normalizeRole } from '../utils/permissions';

const AuthContext = createContext(null);

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
  const [profile, setProfile] = useState(null);
  const [demoSession, setDemoSession] = useState(() => sessionStorage.getItem(DEMO_SESSION_KEY) === 'true');
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

  useEffect(() => {
    const userId = session?.user?.id;
    if (!isSupabaseConfigured || demoSession || !userId) {
      setProfile(null);
      return;
    }

    supabase
      .from('perfiles')
      .select('id, nombre, rol')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => setProfile(data || null));
  }, [session?.user?.id, demoSession]);

  function enterDemo() {
    sessionStorage.setItem(DEMO_SESSION_KEY, 'true');
    clearDemoStore();
    setDemoSession(true);
  }

  function exitDemo() {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    clearDemoStore();
    setDemoSession(false);
  }

  const user = demoSession ? demoUser : session?.user || null;
  const role = demoSession
    ? 'admin'
    : normalizeRole(profile?.rol || user?.app_metadata?.role || user?.user_metadata?.rol || user?.user_metadata?.role);
  const capabilities = getRoleCapabilities(role);

  const value = useMemo(() => ({
    session,
    user,
    profile,
    role,
    capabilities,
    loading,
    isDemo: demoSession,
    enterDemo,
    exitDemo,
    isAuthenticated: demoSession || Boolean(session),
    can: (permission) => capabilities.includes(permission),
    isAdmin: role === 'admin' || role === 'desarrollador',
  }), [session, user, profile, role, capabilities, loading, demoSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
