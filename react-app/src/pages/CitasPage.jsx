import { useEffect, useState } from 'react';
import axios from 'axios';
import filtrosCitasService from '../services/filtrosCitasService';
import './CitasPage.css';

function CitasPage() {
    const [citas, setCitas] = useState([]);
    const [mensajeExito, setMensajeExito] = useState('');
    const [cargando, setCargando] = useState(false);

    // Estados para los filtros
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [filtros, setFiltros] = useState({
        estado: '',
        fecha_inicio: '',
        fecha_fin: '',
        id_oficina: ''
    });
    const [opcionesFiltro, setOpcionesFiltro] = useState({ oficinas: [], estados: [] });
    const [filtrosActivos, setFiltrosActivos] = useState(false);

    // Estados para estadísticas
    const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
    const [estadisticas, setEstadisticas] = useState(null);

    useEffect(() => {
        cargarOpcionesFiltro();
        fetchCitas();
    }, []);

    // Cargar opciones para los filtros (oficinas y estados)
    const cargarOpcionesFiltro = async () => {
        try {
            const data = await filtrosCitasService.obtenerOpcionesFiltro();
            if (data.success) {
                setOpcionesFiltro(data);
            }
        } catch (error) {
            console.error('Error al cargar opciones:', error);
        }
    };

    // Fetch original (sin filtros)
    const fetchCitas = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');

            const res = await axios.get(
                'http://localhost:3000/api/citas/admin/all',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCitas(res.data);
            setFiltrosActivos(false);
        } catch (err) {
            console.error('Error al cargar citas:', err);
        } finally {
            setCargando(false);
        }
    };

    // Aplicar filtros usando el microservicio
    const aplicarFiltros = async () => {
        try {
            setCargando(true);
            const data = await filtrosCitasService.filtrarCitas(filtros);

            if (data.success) {
                // Transformar los datos del microservicio al formato esperado por la tabla
                const citasTransformadas = data.citas.map(cita => ({
                    id_cita: cita.id_cita,
                    cliente: cita.nombre_cliente,
                    correo: cita.correo_cliente,
                    marca: cita.marca_vehiculo,
                    modelo: cita.modelo_vehiculo,
                    tipo: cita.tipo_vehiculo,
                    fecha: cita.fecha,
                    hora: cita.hora,
                    oficina: cita.nombre_oficina,
                    estado: cita.estado,
                    comentario: cita.comentario
                }));

                setCitas(citasTransformadas);
                setFiltrosActivos(true);

                setTimeout(() => {
                    setMensajeExito('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error al filtrar citas:', error);
            setMensajeExito('❌ Error al aplicar filtros');
        } finally {
            setCargando(false);
        }
    };

    // Limpiar filtros
    const limpiarFiltros = () => {
        setFiltros({
            estado: '',
            fecha_inicio: '',
            fecha_fin: '',
            id_oficina: ''
        });
        setFiltrosActivos(false);
        fetchCitas(); // Volver a cargar todas las citas
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
            const data = await filtrosCitasService.obtenerEstadisticas(
                filtros.fecha_inicio || null,
                filtros.fecha_fin || null
            );
            if (data.success) {
                setEstadisticas(data);
                setMostrarEstadisticas(true);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const cambiarEstado = async (id_cita, nuevoEstado) => {
        try {
            const token = localStorage.getItem('token');

            await axios.patch(
                `http://localhost:3000/api/citas/${id_cita}/estado`,
                { estado: nuevoEstado },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setTimeout(() => {
                setMensajeExito('');
            }, 3000);

            // Recargar según si hay filtros activos o no
            if (filtrosActivos) {
                aplicarFiltros();
            } else {
                fetchCitas();
            }
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            setMensajeExito('❌ Error al actualizar la cita');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta cita?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/citas/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTimeout(() => {
                setMensajeExito('');
            }, 3000);

            // Recargar según si hay filtros activos o no
            if (filtrosActivos) {
                aplicarFiltros();
            } else {
                fetchCitas();
            }
        } catch (err) {
            console.error('Error al eliminar:', err);
        }
    };

    const obtenerClaseEstado = (estado) => {
        return `badge-estado badge-${estado.toLowerCase()}`;
    };

    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const renderizarBotones = (cita) => {
        const { id_cita, estado } = cita;

        if (estado === 'Atendida' || estado === 'Cancelada') {
            return <span className="sin-acciones"></span>;
        }

        if (estado === 'Pendiente') {
            return (
                <div className="botones-acciones">
                    <button
                        className="btn-confirmar"
                        onClick={() => cambiarEstado(id_cita, 'Confirmada')}
                        title="Confirmar cita"
                    >
                        ✓ Confirmar
                    </button>
                    <button
                        className="btn-cancelar"
                        onClick={() => cambiarEstado(id_cita, 'Cancelada')}
                        title="Cancelar cita"
                    >
                        ✕ Cancelar
                    </button>
                </div>
            );
        }

        if (estado === 'Confirmada') {
            return (
                <div className="botones-acciones">
                    <button
                        className="btn-atender"
                        onClick={() => cambiarEstado(id_cita, 'Atendida')}
                        title="Marcar como atendida"
                    >
                        ✓ Atender
                    </button>
                    <button
                        className="btn-cancelar"
                        onClick={() => cambiarEstado(id_cita, 'Cancelada')}
                        title="Cancelar cita"
                    >
                        ✕ Cancelar
                    </button>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="citas-container">
            <div className="citas-header">
                <h2>📅 Gestión de Citas</h2>
                <div className="header-actions">
                    <button
                        className={`btn-filtros ${mostrarFiltros ? 'active' : ''}`}
                        onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    >
                        🔍 {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </button>
                    <button
                        className="btn-recargar"
                        onClick={filtrosActivos ? aplicarFiltros : fetchCitas}
                        disabled={cargando}
                    >
                        {cargando ? '⏳ Cargando...' : '🔄 Recargar'}
                    </button>
                </div>
            </div>

            {mensajeExito && (
                <div className="mensaje-exito">
                    {mensajeExito}
                </div>
            )}

            {/* Panel de Filtros */}
            {mostrarFiltros && (
                <div className="filtros-panel">
                    <h3>🔍 Filtrar Citas</h3>
                    <div className="filtros-grid">
                        <div className="filtro-item">
                            <label>Estado:</label>
                            <select
                                name="estado"
                                value={filtros.estado}
                                onChange={handleFiltroChange}
                            >
                                <option value="">Todos</option>
                                {opcionesFiltro.estados.map(estado => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filtro-item">
                            <label>Fecha Inicio:</label>
                            <input
                                type="date"
                                name="fecha_inicio"
                                value={filtros.fecha_inicio}
                                onChange={handleFiltroChange}
                            />
                        </div>

                        <div className="filtro-item">
                            <label>Fecha Fin:</label>
                            <input
                                type="date"
                                name="fecha_fin"
                                value={filtros.fecha_fin}
                                onChange={handleFiltroChange}
                            />
                        </div>

                        <div className="filtro-item">
                            <label>Oficina:</label>
                            <select
                                name="id_oficina"
                                value={filtros.id_oficina}
                                onChange={handleFiltroChange}
                            >
                                <option value="">Todas</option>
                                {opcionesFiltro.oficinas.map(oficina => (
                                    <option key={oficina.id_oficina} value={oficina.id_oficina}>
                                        {oficina.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="filtros-acciones">
                        <button
                            className="btn-aplicar-filtros"
                            onClick={aplicarFiltros}
                            disabled={cargando}
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

            <div className="tabla-wrapper">
                <table className="citas-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Correo</th>
                            <th>Vehículo</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Oficina</th>
                            <th>Estado</th>
                            <th>Comentario</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {citas.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="sin-datos">
                                    {cargando ? 'Cargando citas...' :
                                        filtrosActivos ? 'No se encontraron citas con los filtros aplicados' :
                                            'No hay citas registradas'}
                                </td>
                            </tr>
                        ) : (
                            citas.map((cita) => (
                                <tr key={cita.id_cita}>
                                    <td className="td-cliente">{cita.cliente}</td>
                                    <td className="td-correo">{cita.correo}</td>
                                    <td className="td-vehiculo">
                                        <strong>{cita.marca}</strong> {cita.modelo}
                                        <br />
                                        <small>{cita.tipo}</small>
                                    </td>
                                    <td className="td-fecha">{formatearFecha(cita.fecha)}</td>
                                    <td className="td-hora">{cita.hora}</td>
                                    <td className="td-oficina">{cita.oficina}</td>
                                    <td>
                                        <span className={obtenerClaseEstado(cita.estado)}>
                                            {cita.estado}
                                        </span>
                                    </td>
                                    <td className="td-comentario">
                                        {cita.comentario || '—'}
                                    </td>
                                    <td className="td-acciones">
                                        {renderizarBotones(cita)}

                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="leyenda-estados">
                <h4>📊 Leyenda de Estados:</h4>
                <div className="leyenda-items">
                    <div className="leyenda-item">
                        <span className="badge-estado badge-pendiente">Pendiente</span>
                        <span>Cita creada, esperando confirmación</span>
                    </div>
                    <div className="leyenda-item">
                        <span className="badge-estado badge-confirmada">Confirmada</span>
                        <span>Cita confirmada por el administrador</span>
                    </div>
                    <div className="leyenda-item">
                        <span className="badge-estado badge-atendida">Atendida</span>
                        <span>Cliente atendido exitosamente</span>
                    </div>
                    <div className="leyenda-item">
                        <span className="badge-estado badge-cancelada">Cancelada</span>
                        <span>Cita cancelada (manual o automática)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CitasPage;