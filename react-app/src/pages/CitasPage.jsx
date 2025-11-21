import { useEffect, useState } from 'react';
import axios from 'axios';
import './CitasPage.css';


function CitasPage() {
    const [citas, setCitas] = useState([]);
    const [oficinas, setOficinas] = useState([]);

    const [formData, setFormData] = useState({
        fecha: '',
        hora: '',
        id_oficina: '',
        comentario: ''
    });

    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');

    useEffect(() => {
        fetchCitas();
        fetchOficinas();
    }, []);

    const fetchCitas = async () => {
        try {
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
            console.error(err);
        }
    };

    const fetchOficinas = async () => {
        const res = await axios.get('http://localhost:3000/api/oficinas');
        setOficinas(res.data);
    };

    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:3000/api/citas/${id}`);
        setMensajeExito('Cita eliminada');
        fetchCitas();
    };

    const cambiarEstado = async (id_cita, nuevoEstado) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3000/api/citas/${id_cita}/estado`, { estado: nuevoEstado }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMensajeExito(`Estado cambiado a ${nuevoEstado}`);
            fetchCitas(); // recargar la tabla
        } catch (err) {
            console.error('Error al cambiar estado:', err);
        }
    };

    return (
        <div className="citas-container">
            <h2>Gestión de Citas</h2>

            {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}

            <table className="citas-table">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Correo</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Oficina</th>
                        <th>Estado</th>
                        <th>Comentario</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {citas.map((c) => (
                        <tr key={c.id_cita}>
                            <td>{c.cliente}</td>
                            <td>{c.correo}</td>
                            <td>{c.marca}</td>
                            <td>{c.modelo}</td>
                            <td>{c.fecha}</td>
                            <td>{c.hora}</td>
                            <td>{c.oficina}</td>
                            <td>
                                <select
                                    value={c.estado}
                                    onChange={(e) => cambiarEstado(c.id_cita, e.target.value)}
                                    className={`estado-select estado-${c.estado.toLowerCase()}`}
                                    disabled={c.estado === 'Cancelada' || c.estado === 'Atendida'}
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Confirmada">Confirmada</option>
                                    <option value="Atendida">Atendida</option>
                                    <option value="Cancelada">Cancelada</option>
                                </select>
                            </td>
                            <td>{c.comentario || '—'}</td>
                            <td>
                                <button onClick={() => handleDelete(c.id_cita)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CitasPage;
