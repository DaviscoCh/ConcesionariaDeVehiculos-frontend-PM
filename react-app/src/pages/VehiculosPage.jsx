import { useState, useEffect } from 'react';
import axios from 'axios';
import VehiculoForm from '../components/VehiculosForm';
import filtrosVehiculosService from '../services/filtrosVehiculosService';
import './VehiculosPage.css';

function VehiculosPage() {
    const [vehiculos, setVehiculos] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [formData, setFormData] = useState({
        marca_id: '',
        modelo_id: '',
        anio: '',
        color: '',
        precio: '',
        tipo: '',
        estado: '',
        descripcion: '',
        fecha_ingreso: '',
        imagen_url: ''
    });

    // Estados para filtros avanzados
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [filtros, setFiltros] = useState({
        marca: '',
        modelo: '',
        anio: '',
        tipo: '',
        color: '',
        precioMin: '',
        precioMax: '',
        estado: '',
        busqueda: ''
    });
    const [filtrosActivos, setFiltrosActivos] = useState(false);

    // Estados para estadísticas
    const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
    const [estadisticas, setEstadisticas] = useState(null);

    const [marcaSeleccionada, setMarcaSeleccionada] = useState('');
    const [errores, setErrores] = useState({});
    const [mensajeExito, setMensajeExito] = useState('');
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);

    const vehiculosOrdenados = [...vehiculos].sort((a, b) =>
        new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso)
    );

    const tiposVehiculo = [
        'Sedán',
        'SUV',
        'Coupé',
        'Hatchback',
        'Pickup',
        'Convertible',
        'Furgoneta',
        'Camión'
    ];

    const getMarcaNombre = (id) => {
        const marca = marcas.find((m) => m.id_marca === id);
        return marca ? marca.nombre : '';
    };

    const getModeloNombre = (id) => {
        const modelo = modelos.find((m) => m.id_modelo === id);
        return modelo ? modelo.nombre : '';
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '—';
        const fechaSolo = fecha.split('T')[0];
        const [anio, mes, dia] = fechaSolo.split('-');
        return `${dia}/${mes}/${anio}`;
    };

    useEffect(() => {
        fetchVehiculos();
        fetchMarcas();
        fetchModelos();
    }, []);

    const fetchVehiculos = async () => {
        try {
            const vehiculosData = await filtrosVehiculosService.obtenerTodos();
            setVehiculos(vehiculosData);
            setFiltrosActivos(false);
        } catch (err) {
            console.error('Error al obtener vehículos:', err.message);
        }
    };

    const fetchMarcas = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/marcas');
            setMarcas(res.data);
        } catch (err) {
            console.error('Error al obtener marcas:', err.message);
        }
    };

    const fetchModelos = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/modelos');
            setModelos(res.data);
        } catch (err) {
            console.error('Error al obtener modelos:', err.message);
        }
    };

    // Aplicar filtros
    const aplicarFiltros = async () => {
        try {
            const vehiculosFiltrados = await filtrosVehiculosService.filtrarVehiculos(filtros);
            setVehiculos(vehiculosFiltrados);
            setFiltrosActivos(true);
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (error) {
            console.error('Error al filtrar vehículos:', error);
            setMensajeExito('❌ Error al aplicar filtros');
        }
    };

    // Limpiar filtros
    const limpiarFiltros = () => {
        setFiltros({
            marca: '',
            modelo: '',
            anio: '',
            tipo: '',
            color: '',
            precioMin: '',
            precioMax: '',
            estado: '',
            busqueda: ''
        });
        setFiltrosActivos(false);
        fetchVehiculos();
    };

    // Manejar cambios en filtros
    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Calcular y mostrar estadísticas
    const cargarEstadisticas = () => {
        const stats = filtrosVehiculosService.calcularEstadisticas(vehiculos);
        setEstadisticas(stats);
        setMostrarEstadisticas(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'marca_id') {
            setMarcaSeleccionada(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nuevosErrores = {};

        if (!formData.marca_id) nuevosErrores.marca_id = 'Marca obligatoria';
        if (!formData.modelo_id) nuevosErrores.modelo_id = 'Modelo obligatorio';
        if (!formData.anio || isNaN(formData.anio) || formData.anio < 1900 || formData.anio > new Date().getFullYear()) {
            nuevosErrores.anio = 'Año inválido';
        }
        if (!formData.precio || isNaN(formData.precio) || formData.precio <= 0) {
            nuevosErrores.precio = 'Precio inválido';
        }
        if (formData.imagen_url && !/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/.test(formData.imagen_url)) {
            nuevosErrores.imagen_url = 'URL de imagen inválida';
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        setErrores({});

        const payload = {
            id_modelo: formData.modelo_id,
            anio: parseInt(formData.anio),
            color: formData.color,
            precio: parseFloat(formData.precio),
            tipo: formData.tipo,
            estado: formData.estado,
            descripcion: formData.descripcion,
            fecha_ingreso: formData.fecha_ingreso,
            imagen_url: formData.imagen_url
        };

        try {
            if (modoEdicion && idEditando) {
                await axios.put(`http://localhost:3000/api/vehiculos/${idEditando}`, payload);
                setMensajeExito('✅ Vehículo actualizado exitosamente');
                setModoEdicion(false);
                setIdEditando(null);
            } else {
                await axios.post('http://localhost:3000/api/vehiculos', payload);
                setMensajeExito('✅ Vehículo creado exitosamente');
            }

            limpiarFormulario();

            // Recargar según si hay filtros activos
            if (filtrosActivos) {
                aplicarFiltros();
            } else {
                await fetchVehiculos();
            }

            setTimeout(() => setMensajeExito(''), 3000);
        } catch (err) {
            console.error('Error:', err);
            setMensajeExito('❌ Error al guardar vehículo');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este vehículo?')) return;

        try {
            await axios.delete(`http://localhost:3000/api/vehiculos/${id}`);

            // Recargar según si hay filtros activos
            if (filtrosActivos) {
                aplicarFiltros();
            } else {
                await fetchVehiculos();
            }

            setTimeout(() => setMensajeExito(''), 3000);
        } catch (err) {
            console.error('Error al eliminar vehículo:', err.message);
            setMensajeExito('❌ Error al eliminar vehículo');
        }
    };

    const handleEdit = (vehiculo) => {
        setMarcaSeleccionada(vehiculo.marca_id);
        setModoEdicion(true);
        setIdEditando(vehiculo.id_vehiculo);
        setFormData({
            marca_id: vehiculo.id_marca,
            modelo_id: vehiculo.id_modelo,
            anio: vehiculo.anio,
            color: vehiculo.color,
            precio: vehiculo.precio,
            tipo: vehiculo.tipo,
            estado: vehiculo.estado,
            descripcion: vehiculo.descripcion,
            fecha_ingreso: vehiculo.fecha_ingreso?.slice(0, 10),
            imagen_url: vehiculo.imagen_url,
        });
    };

    const limpiarFormulario = () => {
        setFormData({
            marca_id: '', modelo_id: '', anio: '', color: '', precio: '',
            tipo: '', estado: '', descripcion: '', fecha_ingreso: '',
            imagen_url: ''
        });
        setErrores({});
    };

    const modelosFiltrados = modelos.filter((mod) => mod.id_marca === formData.marca_id);

    // Calcular estadísticas rápidas
    const stats = {
        total: vehiculos.length,
        disponibles: vehiculos.filter(v => v.estado?.toLowerCase() === 'disponible').length,
        vendidos: vehiculos.filter(v => v.estado?.toLowerCase() === 'vendido').length,
        precioPromedio: vehiculos.length > 0
            ? (vehiculos.reduce((sum, v) => sum + parseFloat(v.precio), 0) / vehiculos.length).toFixed(2)
            : '0.00'
    };

    return (
        <div className="vehiculos-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1 className="page-title">
                        <span className="icon">🚗</span>
                        Gestión de Vehículos
                    </h1>
                    <p className="page-subtitle">Administra el inventario de vehículos</p>
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
                                name="busqueda"
                                placeholder="Marca, modelo, tipo, color..."
                                value={filtros.busqueda}
                                onChange={handleFiltroChange}
                            />
                        </div>

                        <div className="filtro-item">
                            <label>Marca:</label>
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
                            <label>Modelo:</label>
                            <select
                                name="modelo"
                                value={filtros.modelo}
                                onChange={handleFiltroChange}
                            >
                                <option value="">Todos</option>
                                {modelos.map(m => (
                                    <option key={m.id_modelo} value={m.nombre}>{m.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filtro-item">
                            <label>Año:</label>
                            <input
                                type="number"
                                name="anio"
                                placeholder="Año"
                                value={filtros.anio}
                                onChange={handleFiltroChange}
                                min="1900"
                                max={new Date().getFullYear() + 1}
                            />
                        </div>

                        <div className="filtro-item">
                            <label>Tipo:</label>
                            <select
                                name="tipo"
                                value={filtros.tipo}
                                onChange={handleFiltroChange}
                            >
                                <option value="">Todos</option>
                                {tiposVehiculo.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filtro-item">
                            <label>Color:</label>
                            <input
                                type="text"
                                name="color"
                                placeholder="Color"
                                value={filtros.color}
                                onChange={handleFiltroChange}
                            />
                        </div>

                        <div className="filtro-item">
                            <label>Precio Mínimo:</label>
                            <input
                                type="number"
                                name="precioMin"
                                placeholder="Precio mínimo"
                                value={filtros.precioMin}
                                onChange={handleFiltroChange}
                                min="0"
                                step="1000"
                            />
                        </div>

                        <div className="filtro-item">
                            <label>Precio Máximo:</label>
                            <input
                                type="number"
                                name="precioMax"
                                placeholder="Precio máximo"
                                value={filtros.precioMax}
                                onChange={handleFiltroChange}
                                min="0"
                                step="1000"
                            />
                        </div>

                        <div className="filtro-item">
                            <label>Estado:</label>
                            <select
                                name="estado"
                                value={filtros.estado}
                                onChange={handleFiltroChange}
                            >
                                <option value="">Todos</option>
                                <option value="Disponible">Disponible</option>
                                <option value="Vendido">Vendido</option>
                                <option value="Reservado">Reservado</option>
                            </select>
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
                        <h3>📊 Estadísticas del Inventario</h3>
                        <button
                            className="btn-cerrar-stats"
                            onClick={() => setMostrarEstadisticas(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="estadisticas-grid">
                        <div className="stat-card stat-primary">
                            <div className="stat-icon">🚗</div>
                            <div className="stat-content">
                                <span className="stat-label">Total Vehículos</span>
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
                        <div className="stat-card stat-info">
                            <div className="stat-icon">💵</div>
                            <div className="stat-content">
                                <span className="stat-label">Precio Promedio</span>
                                <span className="stat-value">${stats.precioPromedio}</span>
                            </div>
                        </div>
                    </div>

                    {estadisticas.porMarca.length > 0 && (
                        <div className="categorias-stats">
                            <h4>🚗 Por Marca</h4>
                            <div className="categorias-grid">
                                {estadisticas.porMarca.slice(0, 6).map(item => (
                                    <div key={item.marca} className="categoria-card">
                                        <h5>{item.marca}</h5>
                                        <p><strong>{item.cantidad}</strong> vehículos</p>
                                        <p>Promedio: <strong>${(item.totalPrecio / item.cantidad).toFixed(2)}</strong></p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {estadisticas.porTipo.length > 0 && (
                        <div className="categorias-stats">
                            <h4>🚙 Por Tipo</h4>
                            <div className="categorias-grid">
                                {estadisticas.porTipo.map(item => (
                                    <div key={item.tipo} className="categoria-card">
                                        <h5>{item.tipo}</h5>
                                        <p><strong>{item.cantidad}</strong> unidades</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Formulario */}
            <VehiculoForm
                formData={formData}
                marcas={marcas}
                modelosFiltrados={modelosFiltrados}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                errores={errores}
                mensajeExito={mensajeExito}
                limpiarFormulario={limpiarFormulario}
                modoEdicion={modoEdicion}
            />

            {/* Tabla de Vehículos */}
            <div className="table-container">
                <table className="vehiculos-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                            <th>Año</th>
                            <th>Color</th>
                            <th>Precio</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Descripción</th>
                            <th>Fecha ingreso</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehiculosOrdenados.length === 0 ? (
                            <tr>
                                <td colSpan="11" className="empty-state">
                                    <div className="empty-icon">🚗</div>
                                    <h3>No se encontraron vehículos</h3>
                                    <p>
                                        {filtrosActivos
                                            ? 'No hay resultados con los filtros aplicados'
                                            : 'Comienza agregando tu primer vehículo'}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            vehiculosOrdenados.map((v) => (
                                <tr key={v.id_vehiculo}>
                                    <td>
                                        <img
                                            src={v.imagen_url}
                                            alt={v.modelo}
                                            className="vehicle-image"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=Vehículo'}
                                        />
                                    </td>
                                    <td><strong>{v.marca}</strong></td>
                                    <td>{v.modelo}</td>
                                    <td>{v.anio}</td>
                                    <td>{v.color}</td>
                                    <td className="price-cell">${parseFloat(v.precio).toLocaleString()}</td>
                                    <td>
                                        <span className="badge badge-tipo">{v.tipo}</span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-estado ${v.estado?.toLowerCase()}`}>
                                            {v.estado}
                                        </span>
                                    </td>
                                    <td className="descripcion-cell">{v.descripcion}</td>
                                    <td>{formatearFecha(v.fecha_ingreso)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action btn-edit"
                                                onClick={() => handleEdit(v)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-action btn-delete"
                                                onClick={() => handleDelete(v.id_vehiculo)}
                                                title="Eliminar"
                                            >
                                                🗑️
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

export default VehiculosPage;