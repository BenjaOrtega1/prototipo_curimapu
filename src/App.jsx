import { AnimatePresence, LayoutGroup } from 'motion/react';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import Layout from './components/Layout.jsx';
import PageTransition from './components/PageTransition.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Romana from './pages/Romana.jsx';
import Laboratorio from './pages/Laboratorio.jsx';
import Almacenamiento from './pages/Almacenamiento.jsx';
import Planilla from './pages/Planilla.jsx';
import Usuarios from './pages/Usuarios.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  const shellKey = location.pathname.startsWith('/login') ? '/login' : '/app';
  useRouteScrollRestoration(location);

  return (
    <LayoutGroup id="curimapu-app">
      <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={shellKey}>
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProtectedRoutes />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

function useRouteScrollRestoration(location) {
  useEffect(() => {
    const key = `scroll:${location.pathname}${location.search}`;
    const saved = Number(sessionStorage.getItem(key) || 0);
    requestAnimationFrame(() => window.scrollTo({ top: saved, left: 0, behavior: 'auto' }));

    return () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };
  }, [location.pathname, location.search]);
}

function ProtectedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/romana" element={<PageTransition><Romana /></PageTransition>} />
        <Route path="/laboratorio" element={<PageTransition><Laboratorio /></PageTransition>} />
        <Route path="/almacenamiento" element={<PageTransition><Almacenamiento /></PageTransition>} />
        <Route path="/planilla" element={<PageTransition><Planilla /></PageTransition>} />
        <Route path="/usuarios" element={<PageTransition><Usuarios /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
