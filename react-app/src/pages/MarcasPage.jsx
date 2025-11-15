import { useState, useEffect } from 'react';
import axios from 'axios';
import MarcasForm from '../components/MarcasForm';
import './MarcasPage.css';

function MarcasPage() {
    const [marcas, setMarcas] = useState([]);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');


    useEffect(() => {
        fetchMarcas();
    }, []);

    const fetchMarcas = async () => {
        const res = await axios.get('http://localhost:3000/api/marcas');
        setMarcas(res.data);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) return;

        if (modoEdicion && idEditando) {
            await axios.put(`http://localhost:3000/api/marcas/${idEditando}`, formData);
        } else {
            await axios.post('http://localhost:3000/api/marcas', formData);
        }

        setFormData({ nombre: '', descripcion: '' });
        setModoEdicion(false);
        setIdEditando(null);
        setMensajeExito(modoEdicion ? 'Marca actualizada' : 'Marca agregada');
        await fetchMarcas();
    };

    const handleEdit = (marca) => {
        setFormData({ nombre: marca.nombre, descripcion: marca.descripcion });
        setModoEdicion(true);
        setIdEditando(marca.id_marca);
    };

    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:3000/api/marcas/${id}`);
        setMensajeExito('Marca eliminada');
        await fetchMarcas();
    };

    return (
        <div className="marcas-container">
            <h2>Gestión de Marcas</h2>

            {mensajeExito && <div style={{ color: 'green' }}>{mensajeExito}</div>}

            <MarcasForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                modoEdicion={modoEdicion}
                limpiarFormulario={() => {
                    setFormData({ nombre: '', descripcion: '' });
                    setModoEdicion(false);
                    setIdEditando(null);
                    setMensajeExito('');
                }}
                mensajeExito={mensajeExito}
            />

            <table className="marcas-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {marcas.map((m) => (
                        <tr key={m.id_marca}>
                            <td>{m.nombre}</td>
                            <td>{m.descripcion}</td>
                            <td>
                                <button onClick={() => handleEdit(m)}>Editar</button>
                                <button onClick={() => handleDelete(m.id_marca)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MarcasPage;