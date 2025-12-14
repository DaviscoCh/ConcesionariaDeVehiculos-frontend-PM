// src/components/AdminNotifications.jsx
import React, { useState, useEffect } from 'react';
import './AdminNotifications.css';
import {
    obtenerNotificacionesAdmin,
    obtenerContadorNoLeidas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion
} from '../services/notificacionService';

const AdminNotifications = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    const [cargando, setCargando] = useState(false);

    // Cargar notificaciones y contador
    const cargarNotificaciones = async () => {
        try {
            setCargando(true);
            const [notifs, contador] = await Promise.all([
                obtenerNotificacionesAdmin(),
                obtenerContadorNoLeidas()
            ]);
            setNotificaciones(notifs);
            setNoLeidas(contador);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        } finally {
            setCargando(false);
        }
    };

    // Cargar al montar y cada 5 minutos
    useEffect(() => {
        cargarNotificaciones();
        const interval = setInterval(cargarNotificaciones, 5 * 60 * 1000); // 5 minutos
        return () => clearInterval(interval);
    }, []);

    // Marcar como leída
    const handleMarcarLeida = async (id) => {
        try {
            await marcarComoLeida(id);
            await cargarNotificaciones();
        } catch (error) {
            console.error('Error al marcar como leída:', error);
        }
    };

    // Marcar todas como leídas
    const handleMarcarTodasLeidas = async () => {
        try {
            await marcarTodasComoLeidas();
            await cargarNotificaciones();
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
        }
    };

    // Eliminar notificación
    const handleEliminar = async (id) => {
        try {
            await eliminarNotificacion(id);
            await cargarNotificaciones();
        } catch (error) {
            console.error('Error al eliminar:', error);
        }
    };

    // Formatear fecha relativa
    const formatearFechaRelativa = (fecha) => {
        const ahora = new Date();
        const fechaNotif = new Date(fecha);
        const diffMs = ahora - fechaNotif;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Justo ahora';
        if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        return fechaNotif.toLocaleDateString();
    };

    return (
        <div className="admin-notifications">
            {/* Campana con badge */}
            <button
                className="notif-bell"
                onClick={() => setMostrarDropdown(!mostrarDropdown)}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {noLeidas > 0 && (
                    <span className="notif-badge">{noLeidas}</span>
                )}
            </button>

            {/* Dropdown */}
            {mostrarDropdown && (
                <>
                    <div
                        className="notif-overlay"
                        onClick={() => setMostrarDropdown(false)}
                    />
                    <div className="notif-dropdown">
                        {/* Header */}
                        <div className="notif-header">
                            <h3>Notificaciones</h3>
                            {noLeidas > 0 && (
                                <button
                                    className="btn-marcar-todas"
                                    onClick={handleMarcarTodasLeidas}
                                >
                                    Marcar todas como leídas
                                </button>
                            )}
                        </div>

                        {/* Lista de notificaciones */}
                        <div className="notif-list">
                            {cargando ? (
                                <div className="notif-loading">Cargando...</div>
                            ) : notificaciones.length === 0 ? (
                                <div className="notif-empty">
                                    <p>No tienes notificaciones</p>
                                </div>
                            ) : (
                                notificaciones.map((notif) => (
                                    <div
                                        key={notif.id_notificacion}
                                        className={`notif-item ${!notif.leida ? 'no-leida' : ''}`}
                                    >
                                        <div className="notif-content">
                                            <div className="notif-title">
                                                {notif.titulo}
                                            </div>
                                            <div className="notif-mensaje">
                                                {notif.mensaje}
                                            </div>
                                            <div className="notif-footer">
                                                <span className="notif-fecha">
                                                    {formatearFechaRelativa(notif.fecha_creacion)}
                                                </span>
                                                {notif.nombre_usuario && (
                                                    <span className="notif-usuario">
                                                        👤 {notif.nombre_usuario}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="notif-actions">
                                            {!notif.leida && (
                                                <button
                                                    className="btn-marcar"
                                                    onClick={() => handleMarcarLeida(notif.id_notificacion)}
                                                    title="Marcar como leída"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button
                                                className="btn-eliminar"
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
                </>
            )}
        </div>
    );
};

export default AdminNotifications;