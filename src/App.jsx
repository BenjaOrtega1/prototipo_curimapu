import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Romana from './pages/Romana.jsx';
import Laboratorio from './pages/Laboratorio.jsx';
import Almacenamiento from './pages/Almacenamiento.jsx';
import Planilla from './pages/Planilla.jsx';
import Configuracion from './pages/Configuracion.jsx';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#f4f6f3]">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
              <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/romana" element={<Romana />} />
                    <Route path="/laboratorio" element={<Laboratorio />} />
                    <Route path="/almacenamiento" element={<Almacenamiento />} />
                    <Route path="/planilla" element={<Planilla />} />
                    <Route path="/configuracion" element={<Configuracion />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
              </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}
