import { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import {
    obtenerNotificacionesAdmin,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion
} from '../services/notificacionService';

function Dashboard() {
    const [stats, setStats] = useState({
        totalVehiculos: 0,
        totalMarcas: 0,
        totalModelos: 0
    });

    const [notificaciones, setNotificaciones] = useState([]);
    const [filtro, setFiltro] = useState('todas');
    const [cargandoNotif, setCargandoNotif] = useState(false);
    const [mostrarPanel, setMostrarPanel] = useState(false);

    useEffect(() => {
        fetchStats();
        cargarNotificaciones();

        // Recargar notificaciones cada 5 minutos
        const interval = setInterval(cargarNotificaciones, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Cerrar panel al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mostrarPanel && !event.target.closest('.notif-bell-container') && !event.target.closest('.notif-panel-dropdown')) {
                setMostrarPanel(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mostrarPanel]);

    const fetchStats = async () => {
        const [vehRes, marcasRes, modelosRes] = await Promise.all([
            axios.get('http://localhost:3000/api/vehiculos'),
            axios.get('http://localhost:3000/api/marcas'),
            axios.get('http://localhost:3000/api/modelos')
        ]);

        setStats({
            totalVehiculos: vehRes.data.length,
            totalMarcas: marcasRes.data.length,
            totalModelos: modelosRes.data.length
        });
    };

    const cargarNotificaciones = async () => {
        try {
            setCargandoNotif(true);
            const notifs = await obtenerNotificacionesAdmin();
            setNotificaciones(notifs);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        } finally {
            setCargandoNotif(false);
        }
    };

    const handleMarcarLeida = async (id) => {
        try {
            await marcarComoLeida(id);
            await cargarNotificaciones();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleMarcarTodasLeidas = async () => {
        try {
            await marcarTodasComoLeidas();
            await cargarNotificaciones();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEliminar = async (id) => {
        try {
            await eliminarNotificacion(id);
            await cargarNotificaciones();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const formatearFechaRelativa = (fecha) => {
        const ahora = new Date();
        const fechaNotif = new Date(fecha);
        const diffMs = ahora - fechaNotif;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Justo ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;
        return fechaNotif.toLocaleDateString();
    };

    const notificacionesFiltradas = notificaciones.filter(n => {
        if (filtro === 'no-leidas') return !n.leida;
        if (filtro === 'leidas') return n.leida;
        return true;
    });

    const noLeidas = notificaciones.filter(n => !n.leida).length;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>📊 Dashboard</h2>

                {/* Campanita de Notificaciones */}
                <div className="notif-bell-container">
                    <button
                        className="notif-bell-btn"
                        onClick={() => setMostrarPanel(!mostrarPanel)}
                    >
                        🔔
                        {noLeidas > 0 && (
                            <span className="notif-bell-badge">{noLeidas}</span>
                        )}
                    </button>

                    {/* Panel Dropdown de Notificaciones */}
                    {mostrarPanel && (
                        <div className="notif-panel-dropdown">
                            <div className="notif-panel-header">
                                <h3>Notificaciones</h3>
                                <div className="notif-panel-actions">
                                    <button
                                        className="btn-refrescar-small"
                                        onClick={cargarNotificaciones}
                                        disabled={cargandoNotif}
                                        title="Refrescar"
                                    >
                                        🔄
                                    </button>
                                    {noLeidas > 0 && (
                                        <button
                                            className="btn-marcar-small"
                                            onClick={handleMarcarTodasLeidas}
                                            title="Marcar todas como leídas"
                                        >
                                            ✓
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Filtros */}
                            <div className="notif-panel-filtros">
                                <button
                                    className={`filtro-btn-small ${filtro === 'todas' ? 'active' : ''}`}
                                    onClick={() => setFiltro('todas')}
                                >
                                    Todas ({notificaciones.length})
                                </button>
                                <button
                                    className={`filtro-btn-small ${filtro === 'no-leidas' ? 'active' : ''}`}
                                    onClick={() => setFiltro('no-leidas')}
                                >
                                    No leídas ({noLeidas})
                                </button>
                                <button
                                    className={`filtro-btn-small ${filtro === 'leidas' ? 'active' : ''}`}
                                    onClick={() => setFiltro('leidas')}
                                >
                                    Leídas ({notificaciones.length - noLeidas})
                                </button>
                            </div>

                            {/* Lista de Notificaciones */}
                            <div className="notif-panel-lista">
                                {cargandoNotif ? (
                                    <div className="notif-loading">
                                        <div className="spinner"></div>
                                        <p>Cargando...</p>
                                    </div>
                                ) : notificacionesFiltradas.length === 0 ? (
                                    <div className="notif-empty">
                                        <span className="empty-icon">📭</span>
                                        <p>No hay notificaciones</p>
                                    </div>
                                ) : (
                                    notificacionesFiltradas.map((notif) => (
                                        <div
                                            key={notif.id_notificacion}
                                            className={`notif-item ${!notif.leida ? 'no-leida' : ''}`}
                                        >
                                            <div className="notif-item-content">
                                                <div className="notif-item-titulo">
                                                    {notif.titulo}
                                                </div>
                                                <div className="notif-item-mensaje">
                                                    {notif.mensaje}
                                                </div>
                                                <div className="notif-item-footer">
                                                    <span className="notif-item-fecha">
                                                        📅 {formatearFechaRelativa(notif.fecha_creacion)}
                                                    </span>
                                                    {notif.nombre_usuario && (
                                                        <span className="notif-item-usuario">
                                                            👤 {notif.nombre_usuario}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="notif-item-acciones">
                                                {!notif.leida && (
                                                    <button
                                                        className="btn-check-small"
                                                        onClick={() => handleMarcarLeida(notif.id_notificacion)}
                                                        title="Marcar como leída"
                                                    >
                                                        ✓
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-delete-small"
                                                    onClick={() => handleEliminar(notif.id_notificacion)}
                                                    title="Eliminar"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="card-grid">
                <div className="card total">
                    <h3>Total Vehículos</h3>
                    <p>{stats.totalVehiculos}</p>
                </div>
                <div className="card marcas">
                    <h3>Total Marcas</h3>
                    <p>{stats.totalMarcas}</p>
                </div>
                <div className="card modelos">
                    <h3>Total Modelos</h3>
                    <p>{stats.totalModelos}</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;