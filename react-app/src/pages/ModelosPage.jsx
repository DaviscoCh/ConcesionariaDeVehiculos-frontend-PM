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

        try {
            if (modoEdicion && idEditando) {
                await axios.put(`http://localhost:3000/api/modelos/${idEditando}`, formData);
                setMensajeExito('✅ Modelo actualizado exitosamente');
            } else {
                await axios.post('http://localhost:3000/api/modelos', formData);
                setMensajeExito('✅ Modelo creado exitosamente');
            }

            setFormData({ id_marca: '', nombre: '', descripcion: '' });
            setModoEdicion(false);
            setIdEditando(null);
            await fetchModelos();

            setTimeout(() => setMensajeExito(''), 3000);
        } catch (error) {
            console.error('Error:', error);
            setMensajeExito('❌ Error al guardar el modelo');
        }
    };

    const handleEdit = (modelo) => {
        setFormData({
            id_marca: modelo.id_marca,
            nombre: modelo.nombre,
            descripcion: modelo.descripcion
        });
        setModoEdicion(true);
        setIdEditando(modelo.id_modelo);
        setMensajeExito('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este modelo?')) return;

        try {
            await axios.delete(`http://localhost:3000/api/modelos/${id}`);
            setMensajeExito('✅ Modelo eliminado exitosamente');
            await fetchModelos();
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (error) {
            console.error('Error:', error);
            setMensajeExito('❌ Error al eliminar el modelo');
        }
    };

    const limpiarFormulario = () => {
        setFormData({ id_marca: '', nombre: '', descripcion: '' });
        setModoEdicion(false);
        setIdEditando(null);
        setMensajeExito('');
    };

    return (
        <div className="modelos-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1 className="page-title">
                        <span className="icon">🚗</span>
                        Gestión de Modelos
                    </h1>
                    <p className="page-subtitle">Administra el catálogo de modelos de vehículos</p>
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
            <ModelosForm
                formData={formData}
                marcas={marcas}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                modoEdicion={modoEdicion}
                limpiarFormulario={limpiarFormulario}
                mensajeExito={mensajeExito}
            />

            {/* Tabla de Modelos */}
            <div className="table-container">
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
                        {modelos.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="empty-state">
                                    <div className="empty-icon">📭</div>
                                    <h3>No hay modelos registrados</h3>
                                    <p>Comienza agregando tu primer modelo</p>
                                </td>
                            </tr>
                        ) : (
                            modelos.map((m) => (
                                <tr key={m.id_modelo}>
                                    <td><strong>{m.marca}</strong></td>
                                    <td>{m.nombre}</td>
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
                                                onClick={() => handleDelete(m.id_modelo)}
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

export default ModelosPage;