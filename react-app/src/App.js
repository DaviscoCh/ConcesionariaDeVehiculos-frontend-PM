// react-app/src/App.js

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import VehiculosPage from './pages/VehiculosPage';
import MarcasPage from './pages/MarcasPage';
import ModelosPage from './pages/ModelosPage';
import CitasPage from './pages/CitasPage';
import RepuestosPage from './pages/RepuestosPage';
import ServiciosPage from './pages/ServiciosPage';
import LoginAdmin from './pages/LoginAdmin';
import AdminNavbar from './components/AdminNavbar';
import PrivateRoute from './components/PrivateRoute';
import { isAuthenticated } from './services/authService';

function App() {
  // Función para determinar la ruta inicial
  const getInitialRoute = () => {
    return isAuthenticated() ? '/admin/dashboard' : '/admin/login';
  };

  return (
    <Router>
      <Routes>
        {/* Ruta raíz */}
        <Route path="/" element={<Navigate to={getInitialRoute()} replace />} />

        {/* Ruta de login (pública) */}
        <Route path="/admin/login" element={<LoginAdmin />} />

        {/* Rutas protegidas */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute>
              <div style={{ display: 'flex' }}>
                <AdminNavbar />
                <div style={{ marginLeft: '220px', width: '100%' }}>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="vehiculos" element={<VehiculosPage />} />
                    <Route path="marcas" element={<MarcasPage />} />
                    <Route path="modelos" element={<ModelosPage />} />
                    <Route path="citas" element={<CitasPage />} />
                    <Route path="repuestos" element={<RepuestosPage />} />
                    <Route path="servicios" element={<ServiciosPage />} />
                  </Routes>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;