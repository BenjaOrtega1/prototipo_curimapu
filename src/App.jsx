import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Romana from './pages/Romana.jsx';
import Laboratorio from './pages/Laboratorio.jsx';
import Almacenamiento from './pages/Almacenamiento.jsx';
import Planilla from './pages/Planilla.jsx';
import Configuracion from './pages/Configuracion.jsx';

export default function App() {
  const isLogged = localStorage.getItem('curimapu_session') === 'true';

  return (
    <div className="min-h-screen bg-[#f4f6f3]">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            isLogged ? (
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
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}
