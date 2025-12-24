import { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import {
    obtenerNotificacionesAdmin,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion
} from '../services/notificacionService';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

function Dashboard() {
    const [stats, setStats] = useState({
        totalVehiculos: 0,
        totalMarcas: 0,
        totalModelos: 0,
        totalCitas: 0,
        citasConfirmadas: 0,      // 👈 NUEVO
        citasAtendidas: 0,        // 👈 NUEVO
        citasCanceladas: 0,
        citasPendientes: 0,
        citasCompletadas: 0,
        totalRepuestos: 0,
        totalServicios: 0
    });

    const [vehiculosPorTipo, setVehiculosPorTipo] = useState({});
    const [vehiculosPorMarca, setVehiculosPorMarca] = useState({});
    const [notificaciones, setNotificaciones] = useState([]);
    const [filtro, setFiltro] = useState('todas');
    const [cargandoNotif, setCargandoNotif] = useState(false);
    const [mostrarPanel, setMostrarPanel] = useState(false);

    useEffect(() => {
        fetchStats();
        cargarNotificaciones();

        const interval = setInterval(cargarNotificaciones, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mostrarPanel && !event.target.closest('.notif-bell-container') && !event.target.closest('. notif-panel-dropdown')) {
                setMostrarPanel(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mostrarPanel]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token'); // 👈 Necesario para la API de citas

            const [vehRes, marcasRes, modelosRes, citasRes, repuestosRes, serviciosRes] = await Promise.all([
                axios.get('http://localhost:3000/api/vehiculos'),
                axios.get('http://localhost:3000/api/marcas'),
                axios.get('http://localhost:3000/api/modelos'),
                axios.get('http://localhost:3000/api/citas/admin/all', {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: [] })),
                axios.get('http://localhost:3000/api/admin/repuestos').catch(() => ({ data: { data: [] } })),
                axios.get('http://localhost:3000/api/admin/servicios').catch(() => ({ data: { data: [] } }))
            ]);

            const vehiculos = vehRes.data;
            const citas = citasRes.data;

            // Manejar el formato de respuesta correcto
            const repuestos = repuestosRes.data.data || repuestosRes.data || [];
            const servicios = serviciosRes.data.data || serviciosRes.data || [];

            // Contar vehículos por tipo
            const porTipo = vehiculos.reduce((acc, v) => {
                acc[v.tipo] = (acc[v.tipo] || 0) + 1;
                return acc;
            }, {});

            // 👇 NUEVO: Contar citas por estado
            const citasPorEstado = {
                'Pendiente': 0,
                'Confirmada': 0,
                'Atendida': 0,
                'Cancelada': 0
            };

            citas.forEach(c => {
                const estado = c.estado || 'Pendiente';
                if (citasPorEstado.hasOwnProperty(estado)) {
                    citasPorEstado[estado]++;
                }
            });

            setVehiculosPorTipo(porTipo);
            setVehiculosPorMarca(citasPorEstado); // 👈 Reutilizamos este estado para las citas

            setStats({
                totalVehiculos: vehiculos.length,
                totalMarcas: marcasRes.data.length,
                totalModelos: modelosRes.data.length,
                totalCitas: citas.length,
                citasPendientes: citasPorEstado['Pendiente'],
                citasConfirmadas: citasPorEstado['Confirmada'],
                citasAtendidas: citasPorEstado['Atendida'],
                citasCanceladas: citasPorEstado['Cancelada'],
                totalRepuestos: repuestos.length,
                totalServicios: servicios.length
            });

            console.log('📊 Estadísticas cargadas:', {
                repuestos: repuestos.length,
                servicios: servicios.length,
                citasPorEstado
            });

        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
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

    // Datos para gráfico de vehículos por tipo
    const dataTipos = {
        labels: Object.keys(vehiculosPorTipo),
        datasets: [{
            label: 'Cantidad',
            data: Object.values(vehiculosPorTipo),
            backgroundColor: [
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(199, 199, 199, 0.7)',
                'rgba(83, 102, 255, 0.7)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)',
                'rgba(83, 102, 255, 1)'
            ],
            borderWidth: 2
        }]
    };

    // Datos para gráfico de citas
    const dataCitas = {
        labels: ['Pendiente', 'Confirmada', 'Atendida', 'Cancelada'],
        datasets: [{
            label: 'Cantidad de Citas',
            data: [
                stats.citasPendientes,
                stats.citasConfirmadas,
                stats.citasAtendidas,
                stats.citasCanceladas
            ],
            backgroundColor: [
                'rgba(255, 193, 7, 0.7)',   // Amarillo - Pendiente
                'rgba(33, 150, 243, 0.7)',  // Azul - Confirmada
                'rgba(76, 175, 80, 0.7)',   // Verde - Atendida
                'rgba(244, 67, 54, 0.7)'    // Rojo - Cancelada
            ],
            borderColor: [
                'rgba(255, 193, 7, 1)',
                'rgba(33, 150, 243, 1)',
                'rgba(76, 175, 80, 1)',
                'rgba(244, 67, 54, 1)'
            ],
            borderWidth: 2
        }]
    };

    // Opciones de gráficos
    const opcionesBar = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
            }
        }
    };

    const opcionesDoughnut = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { padding: 15, font: { size: 12 } }
            }
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>📊 Dashboard</h2>

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

                            <div className="notif-panel-lista">
                                {cargandoNotif ? (
                                    <div className="notif-loading">
                                        <div className="spinner"></div>
                                        <p>Cargando... </p>
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
                    <div className="card-icon">🚗</div>
                    <div className="card-info">
                        <h3>Total Vehículos</h3>
                        <p className="card-number">{stats.totalVehiculos}</p>
                    </div>
                </div>
                <div className="card marcas">
                    <div className="card-icon">🏷️</div>
                    <div className="card-info">
                        <h3>Total Marcas</h3>
                        <p className="card-number">{stats.totalMarcas}</p>
                    </div>
                </div>
                <div className="card modelos">
                    <div className="card-icon">📦</div>
                    <div className="card-info">
                        <h3>Total Modelos</h3>
                        <p className="card-number">{stats.totalModelos}</p>
                    </div>
                </div>
                <div className="card citas">
                    <div className="card-icon">📅</div>
                    <div className="card-info">
                        <h3>Total Citas</h3>
                        <p className="card-number">{stats.totalCitas}</p>
                    </div>
                </div>
                <div className="card repuestos">
                    <div className="card-icon">🔧</div>
                    <div className="card-info">
                        <h3>Repuestos</h3>
                        <p className="card-number">{stats.totalRepuestos}</p>
                    </div>
                </div>
                <div className="card servicios">
                    <div className="card-icon">⚙️</div>
                    <div className="card-info">
                        <h3>Servicios</h3>
                        <p className="card-number">{stats.totalServicios}</p>
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>📊 Vehículos por Tipo</h3>
                    <div className="chart-container">
                        {Object.keys(vehiculosPorTipo).length > 0 ? (
                            <Bar data={dataTipos} options={opcionesBar} />
                        ) : (
                            <p className="no-data">No hay datos disponibles</p>
                        )}
                    </div>
                </div>

                <div className="chart-card">
                    <h3>📅 Estado de Citas</h3>
                    <div className="chart-container">
                        {stats.totalCitas > 0 ? (
                            <Bar data={dataCitas} options={opcionesBar} />
                        ) : (
                            <p className="no-data">No hay citas registradas</p>
                        )}
                    </div>
                </div>
                {/* Estadísticas detalladas de citas */}
                <div className="card citas-pendiente">
                    <div className="card-icon">⏳</div>
                    <div className="card-info">
                        <h3>Pendientes</h3>
                        <p className="card-number">{stats.citasPendientes}</p>
                    </div>
                </div>
                <div className="card citas-confirmada">
                    <div className="card-icon">✓</div>
                    <div className="card-info">
                        <h3>Confirmadas</h3>
                        <p className="card-number">{stats.citasConfirmadas}</p>
                    </div>
                </div>
                <div className="card citas-atendida">
                    <div className="card-icon">✅</div>
                    <div className="card-info">
                        <h3>Atendidas</h3>
                        <p className="card-number">{stats.citasAtendidas}</p>
                    </div>
                </div>
                <div className="card citas-cancelada">
                    <div className="card-icon">✕</div>
                    <div className="card-info">
                        <h3>Canceladas</h3>
                        <p className="card-number">{stats.citasCanceladas}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;