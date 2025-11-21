import { Link, useLocation } from 'react-router-dom';
import './AdminNavbar.css'; // ✅ crea este archivo para estilos

function AdminNavbar() {
    const location = useLocation();

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/vehiculos', label: 'Vehículos', icon: '🚗' },
        { path: '/admin/marcas', label: 'Marcas', icon: '🏷️' },
        { path: '/admin/modelos', label: 'Modelos', icon: '📦' },
        { path: '/admin/citas', label: 'Citas', icon: '📅' }
    ];

    const handleLogout = () => {
        localStorage.clear();
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        localStorage.removeItem("usuario");
        localStorage.removeItem("nombre");
        localStorage.removeItem("apellido");
        window.location.href = 'http://localhost:4200/home';
        localStorage.clear();
        sessionStorage.clear();
    };

    return (
        <aside className="admin-navbar">
            <h2 className="admin-title">Panel Admin</h2>
            <ul className="admin-nav-list">
                {navItems.map(item => (
                    <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                        <Link to={item.path}>
                            <span className="icon">{item.icon}</span>
                            <span className="label">{item.label}</span>
                        </Link>
                    </li>
                ))}
                <button className="logout-button" onClick={handleLogout}>
                    🔓 Cerrar sesión
                </button>
            </ul>
        </aside>
    );
}

export default AdminNavbar;