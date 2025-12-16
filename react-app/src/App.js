import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import VehiculosPage from './pages/VehiculosPage';
import MarcasPage from './pages/MarcasPage';
import ModelosPage from './pages/ModelosPage';
import CitasPage from './pages/CitasPage';
import RepuestosPage from './pages/RepuestosPage'; // ⭐ NUEVO
import ServiciosPage from './pages/ServiciosPage'; // ⭐ NUEVO (lo crearemos después)
import AdminNavbar from './components/AdminNavbar';

function App() {
  return (
    <Router>
      <AdminNavbar />
      <div style={{ marginLeft: '220px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/vehiculos" element={<VehiculosPage />} />
          <Route path="/admin/marcas" element={<MarcasPage />} />
          <Route path="/admin/modelos" element={<ModelosPage />} />
          <Route path="/admin/citas" element={<CitasPage />} />
          <Route path="/admin/repuestos" element={<RepuestosPage />} /> {/* ⭐ NUEVO */}
          <Route path="/admin/servicios" element={<ServiciosPage />} /> {/* ⭐ NUEVO */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;