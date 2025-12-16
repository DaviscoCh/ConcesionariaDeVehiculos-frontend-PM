import { useState, useEffect } from 'react';
import axios from 'axios';
import ServiciosForm from '../components/ServiciosForm';
import './ServiciosPage.css';

function ServiciosPage() {
    const [servicios, setServicios] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingServicio, setEditingServicio] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('Todos');
    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        fetchServicios();
    }, []);

    const fetchServicios = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/admin/servicios');
            setServicios(res.data);
        } catch (error) {
            console.error('Error al cargar servicios:', error);
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
            setMensajeExito('✅ Servicio eliminado exitosamente');
            await fetchServicios();
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
        await fetchServicios();
        setTimeout(() => setMensajeExito(''), 3000);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingServicio(null);
        setMensajeExito('');
    };

    // Obtener categorías únicas
    const categorias = ['Todos', ...new Set(servicios.map(s => s.categoria).filter(Boolean))];

    // Filtrar servicios
    const serviciosFiltrados = servicios.filter(s => {
        const matchCategoria = filtroCategoria === 'Todos' || s.categoria === filtroCategoria;
        const matchEstado = filtroEstado === 'Todos' || s.estado === filtroEstado;
        const matchBusqueda = s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            s.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
        return matchCategoria && matchEstado && matchBusqueda;
    });

    // Calcular estadísticas
    const stats = {
        total: servicios.length,
        activos: servicios.filter(s => s.estado === 'Activo').length,
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
                <button className="btn-primary" onClick={handleCreate}>
                    <span className="btn-icon">+</span>
                    Nuevo Servicio
                </button>
            </div>

            {/* Tarjetas de Estadísticas */}
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

            {/* Mensaje de Éxito */}
            {mensajeExito && (
                <div className="alert alert-success">
                    <span className="alert-icon">✓</span>
                    <span>{mensajeExito}</span>
                    <button className="alert-close" onClick={() => setMensajeExito('')}>×</button>
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
                        {serviciosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-state">
                                    <div className="empty-icon">🔍</div>
                                    <h3>No se encontraron servicios</h3>
                                    <p>
                                        {busqueda || filtroCategoria !== 'Todos' || filtroEstado !== 'Todos'
                                            ? 'Intenta ajustar los filtros de búsqueda'
                                            : 'Comienza agregando tu primer servicio'}
                                    </p>
                                    {!busqueda && filtroCategoria === 'Todos' && filtroEstado === 'Todos' && (
                                        <button className="btn-primary" onClick={handleCreate}>
                                            + Agregar Servicio
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            serviciosFiltrados.map((s) => (
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
                                        <span className={`badge badge-status ${s.estado === 'Activo' ? 'badge-active' : 'badge-inactive'}`}>
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