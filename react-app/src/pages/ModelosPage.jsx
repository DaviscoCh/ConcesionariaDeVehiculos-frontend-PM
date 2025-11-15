import { useState, useEffect } from 'react';
import axios from 'axios';
import ModelosForm from '../components/ModelosForm';
import './ModelosPage.css';

function ModelosPage() {
    const [modelos, setModelos] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [formData, setFormData] = useState({ id_marca: '', nombre: '', descripcion: '' });
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');

    useEffect(() => {
        fetchModelos();
        fetchMarcas();
    }, []);

    const fetchModelos = async () => {
        const res = await axios.get('http://localhost:3000/api/modelos');
        setModelos(res.data);
    };

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
        if (!formData.id_marca || !formData.nombre.trim()) return;

        if (modoEdicion && idEditando) {
            await axios.put(`http://localhost:3000/api/modelos/${idEditando}`, formData);
        } else {
            await axios.post('http://localhost:3000/api/modelos', formData);
        }

        setFormData({ id_marca: '', nombre: '', descripcion: '' });
        setModoEdicion(false);
        setIdEditando(null);
        setMensajeExito(modoEdicion ? 'Modelo actualizado' : 'Modelo agregado');
        await fetchModelos();
    };

    const handleEdit = (modelo) => {
        setFormData({
            id_marca: modelo.id_marca,
            nombre: modelo.nombre,
            descripcion: modelo.descripcion
        });
        setModoEdicion(true);
        setIdEditando(modelo.id_modelo);
    };

    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:3000/api/modelos/${id}`);
        setMensajeExito('Modelo eliminado');
        await fetchModelos();
    };

    return (
        <div className="modelos-container">
            <h2>Gestión de Modelos</h2>

            <ModelosForm
                formData={formData}
                marcas={marcas}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                modoEdicion={modoEdicion}
                limpiarFormulario={() => {
                    setFormData({ id_marca: '', nombre: '', descripcion: '' });
                    setModoEdicion(false);
                    setIdEditando(null);
                    setMensajeExito('');
                }}
                mensajeExito={mensajeExito}
            />

            <table className="modelos-table">
                <thead>
                    <tr>
                        <th>Marca</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {modelos.map((m) => (
                        <tr key={m.id_modelo}>
                            <td>{m.marca}</td>
                            <td>{m.nombre}</td>
                            <td>{m.descripcion}</td>
                            <td>
                                <button onClick={() => handleEdit(m)}>Editar</button>
                                <button onClick={() => handleDelete(m.id_modelo)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ModelosPage;