import { useState, useEffect } from 'react';
import axios from 'axios';
import RepuestosForm from '../components/RepuestosForm';
import filtrosRepuestosService from '../services/filtrosRepuestosService';
import './RepuestosPage.css';

function RepuestosPage() {
    const [repuestos, setRepuestos] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingRepuesto, setEditingRepuesto] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');

    // Estados para filtros avanzados
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [filtros, setFiltros] = useState({
        categoria: '',
        precio_min: '',
        precio_max: '',
        estado: '',
        marca: '',
        stock_min: '',
        buscar: ''
    });
    const [opcionesFiltro, setOpcionesFiltro] = useState({
        categorias: [],
        estados: [],
        rango_precios: { minimo: '0', maximo: '0' }
    });
    const [filtrosActivos, setFiltrosActivos] = useState(false);

    // Estados para estadísticas
    const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
    const [estadisticas, setEstadisticas] = useState(null);
    const [mostrarBajoStock, setMostrarBajoStock] = useState(false);
    const [repuestosBajoStock, setRepuestosBajoStock] = useState([]);

    useEffect(() => {
        fetchRepuestos();
        fetchMarcas();
        fetchModelos();
        cargarOpcionesFiltro();
    }, []);

    const fetchRepuestos = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/admin/repuestos');
            setRepuestos(res.data.data || res.data);
            setFiltrosActivos(false);
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

    // Cargar opciones para los filtros
    const cargarOpcionesFiltro = async () => {
        try {
            const data = await filtrosRepuestosService.obtenerOpcionesFiltro();
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
            const data = await filtrosRepuestosService.filtrarRepuestos(filtros);

            if (data.success) {
                setRepuestos(data.repuestos);
                setFiltrosActivos(true);

                setTimeout(() => {
                    setMensajeExito('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error al filtrar repuestos:', error);
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
            marca: '',
            stock_min: '',
            buscar: ''
        });
        setFiltrosActivos(false);
        fetchRepuestos();
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
            const data = await filtrosRepuestosService.obtenerEstadisticas();
            if (data.success) {
                setEstadisticas(data);
                setMostrarEstadisticas(true);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    // Cargar repuestos con bajo stock
    const cargarBajoStock = async () => {
        try {
            const data = await filtrosRepuestosService.obtenerBajoStock(10);
            if (data.success) {
                setRepuestosBajoStock(data.repuestos);
                setMostrarBajoStock(true);
            }
        } catch (error) {
            console.error('Error al cargar bajo stock:', error);
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

            // Recargar según si hay filtros activos o no
            if (filtrosActivos) {
                aplicarFiltros();
            } else {
                await fetchRepuestos();
            }

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

        // Recargar según si hay filtros activos o no
        if (filtrosActivos) {
            aplicarFiltros();
        } else {
            await fetchRepuestos();
        }

        setTimeout(() => setMensajeExito(''), 3000);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingRepuesto(null);
        setMensajeExito('');
    };

    // Calcular estadísticas rápidas
    const stats = {
        total: repuestos.length,
        disponibles: repuestos.filter(r => r.estado === 'Disponible').length,
        agotados: repuestos.filter(r => r.estado === 'Agotado').length,
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
                    <button
                        className="btn-bajo-stock"
                        onClick={cargarBajoStock}
                    >
                        ⚠️ Bajo Stock
                    </button>
                    <button className="btn-primary" onClick={handleCreate}>
                        <span className="btn-icon">+</span>
                        Nuevo Repuesto
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
                            <label>Marca Compatible:</label>
                            <select
                                name="marca"
                                value={filtros.marca}
                                onChange={handleFiltroChange}
                            >
                                <option value="">Todas</option>
                                {marcas.map(m => (
                                    <option key={m.id_marca} value={m.nombre}>{m.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filtro-item">
                            <label>Stock Mínimo:</label>
                            <input
                                type="number"
                                name="stock_min"
                                placeholder="Stock mínimo..."
                                value={filtros.stock_min}
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
                    <div className="estadisticas-grid">
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
                                <span className="stat-label">Agotados</span>
                                <span className="stat-value">{stats.agotados}</span>
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
                                        <p><strong>{cat.cantidad}</strong> productos</p>
                                        <p><strong>{cat.stock_total}</strong> en stock</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Panel de Bajo Stock */}
            {mostrarBajoStock && (
                <div className="bajo-stock-panel">
                    <div className="bajo-stock-header">
                        <h3>⚠️ Repuestos con Bajo Stock</h3>
                        <button
                            className="btn-cerrar-stats"
                            onClick={() => setMostrarBajoStock(false)}
                        >
                            ✕
                        </button>
                    </div>
                    {repuestosBajoStock.length === 0 ? (
                        <p className="no-results">✅ No hay repuestos con bajo stock</p>
                    ) : (
                        <div className="bajo-stock-list">
                            {repuestosBajoStock.map(r => (
                                <div key={r.id_repuesto} className="bajo-stock-item">
                                    <div className="item-info">
                                        <strong>{r.nombre}</strong>
                                        <span className="item-categoria">{r.categoria}</span>
                                    </div>
                                    <div className="item-stock">
                                        <span className="stock-badge stock-critical">
                                            {r.stock} unidades
                                        </span>
                                        <span className="item-precio">${parseFloat(r.precio).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                        {repuestos.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-state">
                                    <div className="empty-icon">📭</div>
                                    <h3>No se encontraron repuestos</h3>
                                    <p>
                                        {filtrosActivos
                                            ? 'No hay resultados con los filtros aplicados'
                                            : 'Comienza agregando tu primer repuesto'}
                                    </p>
                                    {!filtrosActivos && (
                                        <button className="btn-primary" onClick={handleCreate}>
                                            + Agregar Repuesto
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            repuestos.map((r) => (
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