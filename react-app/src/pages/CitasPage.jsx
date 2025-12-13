import { useEffect, useState } from 'react';
import axios from 'axios';
import './CitasPage.css';

function CitasPage() {
    const [citas, setCitas] = useState([]);
    const [mensajeExito, setMensajeExito] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        fetchCitas();
    }, []);

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
        } catch (err) {
            console.error('Error al cargar citas:', err);
        } finally {
            setCargando(false);
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

            setMensajeExito(`✅ Cita actualizada a: ${nuevoEstado}`);

            setTimeout(() => {
                setMensajeExito('');
            }, 3000);

            fetchCitas();
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

            setMensajeExito('🗑️ Cita eliminada correctamente');

            setTimeout(() => {
                setMensajeExito('');
            }, 3000);

            fetchCitas();
        } catch (err) {
            console.error('Error al eliminar:', err);
        }
    };

    // Función para obtener la clase CSS según el estado
    const obtenerClaseEstado = (estado) => {
        return `badge-estado badge-${estado.toLowerCase()}`;
    };

    // Función para formatear fecha
    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Renderizar botones según el estado actual
    const renderizarBotones = (cita) => {
        const { id_cita, estado } = cita;

        // Si la cita está Atendida o Cancelada, no mostrar botones
        if (estado === 'Atendida' || estado === 'Cancelada') {
            return <span className="sin-acciones">Sin acciones disponibles</span>;
        }

        // Si está Pendiente: mostrar Confirmar y Cancelar
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

        // Si está Confirmada: mostrar Atender y Cancelar
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
                <button
                    className="btn-recargar"
                    onClick={fetchCitas}
                    disabled={cargando}
                >
                    {cargando ? '⏳ Cargando...' : '🔄 Recargar'}
                </button>
            </div>

            {mensajeExito && (
                <div className="mensaje-exito">
                    {mensajeExito}
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
                                    {cargando ? 'Cargando citas...' : 'No hay citas registradas'}
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
                                        <button
                                            className="btn-eliminar"
                                            onClick={() => handleDelete(cita.id_cita)}
                                            title="Eliminar cita"
                                        >
                                            🗑️
                                        </button>
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