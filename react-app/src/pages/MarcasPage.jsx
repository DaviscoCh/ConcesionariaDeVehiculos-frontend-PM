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

        try {
            if (modoEdicion && idEditando) {
                await axios.put(`http://localhost:3000/api/marcas/${idEditando}`, formData);
                setMensajeExito('✅ Marca actualizada exitosamente');
            } else {
                await axios.post('http://localhost:3000/api/marcas', formData);
                setMensajeExito('✅ Marca creada exitosamente');
            }

            setFormData({ nombre: '', descripcion: '' });
            setModoEdicion(false);
            setIdEditando(null);
            await fetchMarcas();

            setTimeout(() => setMensajeExito(''), 3000);
        } catch (error) {
            console.error('Error:', error);
            setMensajeExito('❌ Error al guardar la marca');
        }
    };

    const handleEdit = (marca) => {
        setFormData({ nombre: marca.nombre, descripcion: marca.descripcion });
        setModoEdicion(true);
        setIdEditando(marca.id_marca);
        setMensajeExito('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta marca?')) return;

        try {
            await axios.delete(`http://localhost:3000/api/marcas/${id}`);
            setMensajeExito('✅ Marca eliminada exitosamente');
            await fetchMarcas();
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (error) {
            console.error('Error:', error);
            setMensajeExito('❌ Error al eliminar la marca');
        }
    };

    const limpiarFormulario = () => {
        setFormData({ nombre: '', descripcion: '' });
        setModoEdicion(false);
        setIdEditando(null);
        setMensajeExito('');
    };

    return (
        <div className="marcas-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1 className="page-title">
                        <span className="icon">🏷️</span>
                        Gestión de Marcas
                    </h1>
                    <p className="page-subtitle">Administra el catálogo de marcas de vehículos</p>
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
            {/* Formulario */}
            <MarcasForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                modoEdicion={modoEdicion}
                limpiarFormulario={limpiarFormulario}
                mensajeExito={mensajeExito}
            />

            {/* Tabla de Marcas */}
            <div className="table-container">
                <table className="marcas-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marcas.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="empty-state">
                                    <div className="empty-icon">📭</div>
                                    <h3>No hay marcas registradas</h3>
                                    <p>Comienza agregando tu primera marca</p>
                                </td>
                            </tr>
                        ) : (
                            marcas.map((m) => (
                                <tr key={m.id_marca}>
                                    <td><strong>{m.nombre}</strong></td>
                                    <td>{m.descripcion || '—'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action btn-edit"
                                                onClick={() => handleEdit(m)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-action btn-delete"
                                                onClick={() => handleDelete(m.id_marca)}
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

export default MarcasPage;