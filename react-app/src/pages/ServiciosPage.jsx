import { useState, useEffect } from 'react';
import axios from 'axios';
import ServiciosForm from '../components/ServiciosForm';
import filtrosServiciosService from '../services/filtrosServiciosService';
import './ServiciosPage.css';

function ServiciosPage() {
    const [servicios, setServicios] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingServicio, setEditingServicio] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');

    // Estados para filtros avanzados
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [filtros, setFiltros] = useState({
        categoria: '',
        precio_min: '',
        precio_max: '',
        estado: '',
        requiere_repuestos: '',
        tiempo_max: '',
        buscar: ''
    });
    const [opcionesFiltro, setOpcionesFiltro] = useState({
        categorias: [],
        estados: [],
        rango_precios: { minimo: '0', maximo: '0' },
        rango_tiempos: { minimo: 0, maximo: 0 }
    });
    const [filtrosActivos, setFiltrosActivos] = useState(false);

    // Estados para estadísticas y paneles
    const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
    const [estadisticas, setEstadisticas] = useState(null);
    const [mostrarMasSolicitados, setMostrarMasSolicitados] = useState(false);
    const [serviciosMasSolicitados, setServiciosMasSolicitados] = useState([]);
    const [mostrarRapidos, setMostrarRapidos] = useState(false);
    const [serviciosRapidos, setServiciosRapidos] = useState([]);

    useEffect(() => {
        fetchServicios();
        cargarOpcionesFiltro();
    }, []);

    const fetchServicios = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/admin/servicios');
            setServicios(res.data);
            setFiltrosActivos(false);
        } catch (error) {
            console.error('Error al cargar servicios:', error);
        }
    };

    // Cargar opciones para los filtros
    const cargarOpcionesFiltro = async () => {
        try {
            const data = await filtrosServiciosService.obtenerOpcionesFiltro();
            if (data.success) {
                setOpcionesFiltro(data);
            }
        } catch (error) {
            console.error('Error al cargar opciones:', error);
        }
    };

    // Aplicar filtros usando el microservicio
    const aplicarFiltros = async () => {
        try {
            const data = await filtrosServiciosService.filtrarServicios(filtros);

            if (data.success) {
                setServicios(data.servicios);
                setFiltrosActivos(true);

                setTimeout(() => {
                    setMensajeExito('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error al filtrar servicios:', error);
            setMensajeExito('❌ Error al aplicar filtros');
        }
    };

    // Limpiar filtros
    const limpiarFiltros = () => {
        setFiltros({
            categoria: '',
            precio_min: '',
            precio_max: '',
            estado: '',
            requiere_repuestos: '',
            tiempo_max: '',
            buscar: ''
        });
        setFiltrosActivos(false);
        fetchServicios();
    };

    // Manejar cambios en los filtros
    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Cargar estadísticas
    const cargarEstadisticas = async () => {
        try {
            const data = await filtrosServiciosService.obtenerEstadisticas();
            if (data.success) {
                setEstadisticas(data);
                setMostrarEstadisticas(true);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    // Cargar servicios más solicitados
    const cargarMasSolicitados = async () => {
        try {
            const data = await filtrosServiciosService.obtenerMasSolicitados(10);
            if (data.success) {
                setServiciosMasSolicitados(data.servicios);
                setMostrarMasSolicitados(true);
            }
        } catch (error) {
            console.error('Error al cargar servicios más solicitados:', error);
        }
    };

    // Cargar servicios rápidos
    const cargarRapidos = async () => {
        try {
            const data = await filtrosServiciosService.obtenerServiciosRapidos(60);
            if (data.success) {
                setServiciosRapidos(data.servicios);
                setMostrarRapidos(true);
            }
        } catch (error) {
            console.error('Error al cargar servicios rápidos:', error);
        }
    };

    const handleCreate = () => {
        setEditingServicio(null);
        setShowForm(true);
        setMensajeExito('');
    };

    const handleEdit = (servicio) => {
        setEditingServicio(servicio);
        setShowForm(true);
        setMensajeExito('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este servicio?')) return;

        try {
            await axios.delete(`http://localhost:3000/api/admin/servicios/${id}`);

            // Recargar según si hay filtros activos o no
            if (filtrosActivos) {
                aplicarFiltros();
            } else {
                await fetchServicios();
            }

            setTimeout(() => setMensajeExito(''), 3000);
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar servicio');
        }
    };

    const handleFormSuccess = async (mensaje) => {
        setShowForm(false);
        setEditingServicio(null);
        setMensajeExito(mensaje);

        // Recargar según si hay filtros activos o no
        if (filtrosActivos) {
            aplicarFiltros();
        } else {
            await fetchServicios();
        }

        setTimeout(() => setMensajeExito(''), 3000);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingServicio(null);
        setMensajeExito('');
    };

    // Calcular estadísticas rápidas
    const stats = {
        total: servicios.length,
        activos: servicios.filter(s => s.estado === 'Activo' || s.estado === 'activo').length,
        conRepuestos: servicios.filter(s => s.requiere_repuestos).length,
        precioPromedio: servicios.length > 0
            ? (servicios.reduce((sum, s) => sum + parseFloat(s.precio_mano_obra), 0) / servicios.length)
            : 0
    };

    return (
        <div className="servicios-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1 className="page-title">
                        <span className="icon">⚙️</span>
                        Gestión de Servicios de Mantenimiento
                    </h1>
                    <p className="page-subtitle">Administra el catálogo de servicios ofrecidos</p>
                </div>
                <div className="header-actions">
                    <button
                        className={`btn-filtros ${mostrarFiltros ? 'active' : ''}`}
                        onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    >
                        🔍 {mostrarFiltros ? 'Ocultar Filtros' : 'Filtros Avanzados'}
                    </button>
                    <button
                        className="btn-estadisticas"
                        onClick={cargarEstadisticas}
                    >
                        📊 Estadísticas
                    </button>
                    <button className="btn-primary" onClick={handleCreate}>
                        <span className="btn-icon">+</span>
                        Nuevo Servicio
                    </button>
                </div>
            </div>

            {/* Mensaje de Éxito */}
            {mensajeExito && (
                <div className="alert alert-success">
                    <span className="alert-icon">✓</span>
                    <span>{mensajeExito}</span>
                    <button className="alert-close" onClick={() => setMensajeExito('')}>×</button>
                </div>
            )}

            {/* Panel de Filtros Avanzados */}
            {mostrarFiltros && (
                <div className="filtros-panel">
                    <h3>🔍 Filtros Avanzados</h3>
                    <div className="filtros-grid">
                        <div className="filtro-item">
                            <label>Buscar:</label>
                            <input
                                type="text"
                                name="buscar"
                                placeholder="Nombre o descripción..."
                                value={filtros.buscar}
                                onChange={handleFiltroChange}
                            />
                        </div>

                        <div className="filtro-item">
                            <label>Categoría:</label>
                            <select
                                name="categoria"
                                value={filtros.categoria}
                                onChange={handleFiltroChange}
                            >
                                <option value="">Todas</option>
                                {opcionesFiltro.categorias.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filtro-item">
                            <label>Estado:</label>
                            <select
                                name="estado"
                                value={filtros.estado}
                                onChange={handleFiltroChange}
                            >
                                <option value="">Todos</option>
                                {opcionesFiltro.estados.map(est => (
                                    <option key={est} value={est}>{est}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filtro-item">
                            <label>Requiere Repuestos:</label>
                            <select
                                name="requiere_repuestos"
                                value={filtros.requiere_repuestos}
                                onChange={handleFiltroChange}
                            >
                                <option value="">Todos</option>
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                            </select>
                        </div>

                        <div className="filtro-item">
                            <label>Precio Mínimo:</label>
                            <input
                                type="number"
                                name="precio_min"
                                placeholder={`Desde $${opcionesFiltro.rango_precios.minimo}`}
                                value={filtros.precio_min}
                                onChange={handleFiltroChange}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="filtro-item">
                            <label>Precio Máximo:</label>
                            <input
                                type="number"
                                name="precio_max"
                                placeholder={`Hasta $${opcionesFiltro.rango_precios.maximo}`}
                                value={filtros.precio_max}
                                onChange={handleFiltroChange}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="filtro-item">
                            <label>Tiempo Máximo (min):</label>
                            <input
                                type="number"
                                name="tiempo_max"
                                placeholder={`Hasta ${opcionesFiltro.rango_tiempos.maximo} min`}
                                value={filtros.tiempo_max}
                                onChange={handleFiltroChange}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="filtros-acciones">
                        <button
                            className="btn-aplicar-filtros"
                            onClick={aplicarFiltros}
                        >
                            ✅ Aplicar Filtros
                        </button>
                        <button
                            className="btn-limpiar-filtros"
                            onClick={limpiarFiltros}
                        >
                            🗑️ Limpiar Filtros
                        </button>
                    </div>
                </div>
            )}

            {/* Panel de Estadísticas */}
            {mostrarEstadisticas && estadisticas && (
                <div className="estadisticas-panel">
                    <div className="estadisticas-header">
                        <h3>📊 Estadísticas Detalladas</h3>
                        <button
                            className="btn-cerrar-stats"
                            onClick={() => setMostrarEstadisticas(false)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-card stat-primary">
                            <div className="stat-icon">🔧</div>
                            <div className="stat-content">
                                <span className="stat-label">Total Servicios</span>
                                <span className="stat-value">{stats.total}</span>
                            </div>
                        </div>

                        <div className="stat-card stat-success">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <span className="stat-label">Activos</span>
                                <span className="stat-value">{stats.activos}</span>
                            </div>
                        </div>

                        <div className="stat-card stat-warning">
                            <div className="stat-icon">🔩</div>
                            <div className="stat-content">
                                <span className="stat-label">Con Repuestos</span>
                                <span className="stat-value">{stats.conRepuestos}</span>
                            </div>
                        </div>

                        <div className="stat-card stat-info">
                            <div className="stat-icon">💵</div>
                            <div className="stat-content">
                                <span className="stat-label">Precio Promedio</span>
                                <span className="stat-value">${stats.precioPromedio.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>


                    {estadisticas.por_categoria && estadisticas.por_categoria.length > 0 && (
                        <div className="categorias-stats">
                            <h4>📦 Por Categoría</h4>
                            <div className="categorias-grid">
                                {estadisticas.por_categoria.map(cat => (
                                    <div key={cat.categoria} className="categoria-card">
                                        <h5>{cat.categoria}</h5>
                                        <p><strong>{cat.cantidad}</strong> servicios</p>
                                        <p>Precio prom: <strong>${parseFloat(cat.precio_promedio).toFixed(2)}</strong></p>
                                        <p>Tiempo prom: <strong>{cat.tiempo_promedio} min</strong></p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Formulario Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={handleFormCancel}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingServicio ? '✏️ Editar Servicio' : '➕ Nuevo Servicio'}</h2>
                            <button className="modal-close" onClick={handleFormCancel}>×</button>
                        </div>
                        <ServiciosForm
                            servicio={editingServicio}
                            onSuccess={handleFormSuccess}
                            onCancel={handleFormCancel}
                        />
                    </div>
                </div>
            )}

            {/* Tabla de Servicios */}
            <div className="table-container">
                <table className="servicios-table">
                    <thead>
                        <tr>
                            <th className="th-image">Imagen</th>
                            <th className="th-name">Nombre</th>
                            <th className="th-category">Categoría</th>
                            <th className="th-price">Precio M.O.</th>
                            <th className="th-time">Tiempo Est.</th>
                            <th className="th-parts">Repuestos</th>
                            <th className="th-status">Estado</th>
                            <th className="th-actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servicios.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-state">
                                    <div className="empty-icon">🔍</div>
                                    <h3>No se encontraron servicios</h3>
                                    <p>
                                        {filtrosActivos
                                            ? 'No hay resultados con los filtros aplicados'
                                            : 'Comienza agregando tu primer servicio'}
                                    </p>
                                    {!filtrosActivos && (
                                        <button className="btn-primary" onClick={handleCreate}>
                                            + Agregar Servicio
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            servicios.map((s) => (
                                <tr key={s.id_servicio} className="table-row">
                                    <td>
                                        <div className="service-image">
                                            <img
                                                src={s.imagen_url || 'https://via.placeholder.com/80?text=Servicio'}
                                                alt={s.nombre}
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=Error'}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="service-info">
                                            <strong className="service-name">{s.nombre}</strong>
                                            <span className="service-description">{s.descripcion}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-category">
                                            {s.categoria}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="price-value">${parseFloat(s.precio_mano_obra).toFixed(2)}</span>
                                    </td>
                                    <td>
                                        <span className="time-badge">
                                            <span className="time-icon">⏱️</span>
                                            {s.tiempo_estimado} min
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-parts ${s.requiere_repuestos ? 'badge-warning' : 'badge-secondary'}`}>
                                            {s.requiere_repuestos ? '✓ Sí' : '✕ No'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-status ${s.estado === 'Activo' || s.estado === 'activo' ? 'badge-active' : 'badge-inactive'}`}>
                                            <span className="status-dot"></span>
                                            {s.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action btn-edit"
                                                onClick={() => handleEdit(s)}
                                                title="Editar"
                                            >
                                                <span className="action-icon">✏️</span>
                                            </button>
                                            <button
                                                className="btn-action btn-delete"
                                                onClick={() => handleDelete(s.id_servicio)}
                                                title="Eliminar"
                                            >
                                                <span className="action-icon">🗑️</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ServiciosPage;