import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import './AdminNavbar.css';

function AdminNavbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/vehiculos', label: 'Vehículos', icon: '🚗' },
        { path: '/admin/marcas', label: 'Marcas', icon: '🏷️' },
        { path: '/admin/modelos', label: 'Modelos', icon: '📦' },
        { path: '/admin/citas', label: 'Citas', icon: '📅' },
        { path: '/admin/repuestos', label: 'Repuestos', icon: '🔧' },
        { path: '/admin/servicios', label: 'Servicios', icon: '⚙️' }
    ];

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
            logout(); // Usa la función del servicio
            navigate('/admin/login'); // Redirige al login de React
        }
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
                <li>
                    <button className="logout-button" onClick={handleLogout}>
                        🚪 Cerrar Sesión
                    </button>
                </li>
            </ul>
        </aside>
    );
}

export default AdminNavbar;