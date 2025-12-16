import { useState, useEffect } from 'react';
import axios from 'axios';
import RepuestosForm from '../components/RepuestosForm';
import './RepuestosPage.css';

function RepuestosPage() {
    const [repuestos, setRepuestos] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingRepuesto, setEditingRepuesto] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('Todos');
    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        fetchRepuestos();
        fetchMarcas();
        fetchModelos();
    }, []);

    const fetchRepuestos = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/admin/repuestos');
            setRepuestos(res.data.data || res.data);
        } catch (error) {
            console.error('Error al cargar repuestos:', error);
        }
    };

    const fetchMarcas = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/marcas');
            setMarcas(res.data);
        } catch (error) {
            console.error('Error al cargar marcas:', error);
        }
    };

    const fetchModelos = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/modelos');
            setModelos(res.data);
        } catch (error) {
            console.error('Error al cargar modelos:', error);
        }
    };

    const handleCreate = () => {
        setEditingRepuesto(null);
        setShowForm(true);
        setMensajeExito('');
    };

    const handleEdit = (repuesto) => {
        setEditingRepuesto(repuesto);
        setShowForm(true);
        setMensajeExito('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este repuesto?')) return;

        try {
            await axios.delete(`http://localhost:3000/api/admin/repuestos/${id}`);
            setMensajeExito('Repuesto eliminado exitosamente');
            await fetchRepuestos();
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar repuesto');
        }
    };

    const handleFormSuccess = async (mensaje) => {
        setShowForm(false);
        setEditingRepuesto(null);
        setMensajeExito(mensaje);
        await fetchRepuestos();
        setTimeout(() => setMensajeExito(''), 3000);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingRepuesto(null);
        setMensajeExito('');
    };

    // Obtener categorías únicas
    const categorias = ['Todos', ...new Set(repuestos.map(r => r.categoria).filter(Boolean))];

    // Filtrar repuestos
    const repuestosFiltrados = repuestos.filter(r => {
        const matchCategoria = filtroCategoria === 'Todos' || r.categoria === filtroCategoria;
        const matchEstado = filtroEstado === 'Todos' || r.estado === filtroEstado;
        const matchBusqueda = r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            r.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
        return matchCategoria && matchEstado && matchBusqueda;
    });

    // Calcular estadísticas
    const stats = {
        total: repuestos.length,
        disponibles: repuestos.filter(r => r.estado === 'Disponible').length,
        bajStock: repuestos.filter(r => r.stock < 10).length,
        valorTotal: repuestos.reduce((sum, r) => sum + (parseFloat(r.precio) * r.stock), 0)
    };

    return (
        <div className="repuestos-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1 className="page-title">
                        <span className="icon">🔧</span>
                        Gestión de Repuestos
                    </h1>
                    <p className="page-subtitle">Administra el inventario de repuestos y autopartes</p>
                </div>
                <button className="btn-primary" onClick={handleCreate}>
                    <span className="btn-icon">+</span>
                    Nuevo Repuesto
                </button>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="stats-grid">
                <div className="stat-card stat-primary">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <span className="stat-label">Total Repuestos</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>

                <div className="stat-card stat-success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <span className="stat-label">Disponibles</span>
                        <span className="stat-value">{stats.disponibles}</span>
                    </div>
                </div>

                <div className="stat-card stat-warning">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <span className="stat-label">Stock Bajo</span>
                        <span className="stat-value">{stats.bajStock}</span>
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
                            <h2>{editingRepuesto ? '✏️ Editar Repuesto' : '➕ Nuevo Repuesto'}</h2>
                            <button className="modal-close" onClick={handleFormCancel}>×</button>
                        </div>
                        <RepuestosForm
                            repuesto={editingRepuesto}
                            marcas={marcas}
                            modelos={modelos}
                            onSuccess={handleFormSuccess}
                            onCancel={handleFormCancel}
                        />
                    </div>
                </div>
            )}

            {/* Tabla de Repuestos */}
            <div className="table-container">
                <table className="repuestos-table">
                    <thead>
                        <tr>
                            <th className="th-image">Imagen</th>
                            <th className="th-name">Nombre</th>
                            <th className="th-category">Categoría</th>
                            <th className="th-price">Precio</th>
                            <th className="th-stock">Stock</th>
                            <th className="th-status">Estado</th>
                            <th className="th-compatibility">Compatibilidad</th>
                            <th className="th-actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {repuestosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-state">
                                    <div className="empty-icon">📭</div>
                                    <h3>No se encontraron repuestos</h3>
                                    <p>
                                        {busqueda || filtroCategoria !== 'Todos' || filtroEstado !== 'Todos'
                                            ? 'Intenta ajustar los filtros de búsqueda'
                                            : 'Comienza agregando tu primer repuesto'}
                                    </p>
                                    {!busqueda && filtroCategoria === 'Todos' && filtroEstado === 'Todos' && (
                                        <button className="btn-primary" onClick={handleCreate}>
                                            + Agregar Repuesto
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            repuestosFiltrados.map((r) => (
                                <tr key={r.id_repuesto} className="table-row">
                                    <td>
                                        <div className="product-image">
                                            <img
                                                src={r.imagen_url || 'https://via.placeholder.com/80?text=Sin+Imagen'}
                                                alt={r.nombre}
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=Error'}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="product-info">
                                            <strong className="product-name">{r.nombre}</strong>
                                            <span className="product-description">{r.descripcion}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-category">
                                            {r.categoria}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="price-value">${parseFloat(r.precio).toFixed(2)}</span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-stock ${r.stock < 10 ? 'badge-warning' : r.stock < 5 ? 'badge-danger' : 'badge-success'}`}>
                                            {r.stock} unid.
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-status ${r.estado === 'Disponible' ? 'badge-available' : 'badge-unavailable'}`}>
                                            <span className="status-dot"></span>
                                            {r.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="compatibility-tags">
                                            {r.marcas_compatibles?.slice(0, 3).map((m, i) => (
                                                <span key={i} className="tag tag-brand">{m}</span>
                                            ))}
                                            {r.marcas_compatibles?.length > 3 && (
                                                <span className="tag tag-more" title={r.marcas_compatibles.slice(3).join(', ')}>
                                                    +{r.marcas_compatibles.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action btn-edit"
                                                onClick={() => handleEdit(r)}
                                                title="Editar"
                                            >
                                                <span className="action-icon">✏️</span>
                                            </button>
                                            <button
                                                className="btn-action btn-delete"
                                                onClick={() => handleDelete(r.id_repuesto)}
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

export default RepuestosPage;