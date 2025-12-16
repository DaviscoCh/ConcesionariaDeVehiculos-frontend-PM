import { useState, useEffect } from 'react';
import axios from 'axios';
import './ServiciosForm.css';

function ServiciosForm({ servicio, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: '',
        precio_mano_obra: '',
        tiempo_estimado: '',
        requiere_repuestos: false,
        estado: 'Activo',
        imagen_url: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState('');

    const categorias = [
        'Mantenimiento Preventivo',
        'Mantenimiento Correctivo',
        'Reparación Motor',
        'Reparación Transmisión',
        'Sistema de Frenos',
        'Sistema Eléctrico',
        'Suspensión y Dirección',
        'Sistema de Escape',
        'Aire Acondicionado',
        'Diagnóstico',
        'Revisión Completa',
        'Otros'
    ];

    useEffect(() => {
        if (servicio) {
            setFormData({
                nombre: servicio.nombre || '',
                descripcion: servicio.descripcion || '',
                categoria: servicio.categoria || '',
                precio_mano_obra: servicio.precio_mano_obra || '',
                tiempo_estimado: servicio.tiempo_estimado || '',
                requiere_repuestos: servicio.requiere_repuestos || false,
                estado: servicio.estado || 'Activo',
                imagen_url: servicio.imagen_url || ''
            });
            setPreviewImage(servicio.imagen_url || '');
        }
    }, [servicio]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }

        if (name === 'imagen_url') {
            setPreviewImage(value);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }

        if (!formData.precio_mano_obra || parseFloat(formData.precio_mano_obra) <= 0) {
            newErrors.precio_mano_obra = 'El precio debe ser mayor a 0';
        }

        if (!formData.categoria) {
            newErrors.categoria = 'Selecciona una categoría';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const dataToSend = {
                ...formData,
                precio_mano_obra: parseFloat(formData.precio_mano_obra)
            };

            if (servicio) {
                await axios.put(
                    `http://localhost:3000/api/admin/servicios/${servicio.id_servicio}`,
                    dataToSend
                );
                onSuccess('✅ Servicio actualizado exitosamente');
            } else {
                await axios.post('http://localhost:3000/api/admin/servicios', dataToSend);
                onSuccess('✅ Servicio creado exitosamente');
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            alert(error.response?.data?.error || 'Error al guardar servicio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="servicios-form-container">
            <form onSubmit={handleSubmit} className="servicios-form">

                {/* Sección: Información Básica */}
                <div className="form-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="section-icon">📋</span>
                            Información Básica
                        </h3>
                    </div>

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label className="form-label">
                                Nombre del Servicio
                                <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Cambio de Aceite y Filtro Completo"
                                className={`form-input ${errors.nombre ? 'error' : ''}`}
                            />
                            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">Descripción del Servicio</label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Describe en detalle qué incluye este servicio..."
                                rows="3"
                                className="form-textarea"
                            />
                            <span className="helper-text">
                                {formData.descripcion.length}/300 caracteres
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sección: Categorización */}
                <div className="form-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="section-icon">🏷️</span>
                            Categoría y Estado
                        </h3>
                    </div>

                    <div className="form-grid grid-2">
                        <div className="form-group">
                            <label className="form-label">
                                Categoría
                                <span className="required">*</span>
                            </label>
                            <select
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                className={`form-select ${errors.categoria ? 'error' : ''}`}
                            >
                                <option value="">Seleccionar categoría...</option>
                                {categorias.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {errors.categoria && <span className="error-message">{errors.categoria}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Estado del Servicio</label>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="Activo">✅ Activo</option>
                                <option value="Inactivo">❌ Inactivo</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sección: Precio y Duración */}
                <div className="form-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="section-icon">💰</span>
                            Precio y Duración
                        </h3>
                    </div>

                    <div className="form-grid grid-2">
                        <div className="form-group">
                            <label className="form-label">
                                Precio Mano de Obra
                                <span className="required">*</span>
                            </label>
                            <div className="input-with-icon">
                                <span className="input-icon">$</span>
                                <input
                                    type="number"
                                    name="precio_mano_obra"
                                    value={formData.precio_mano_obra}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className={`form-input with-icon ${errors.precio_mano_obra ? 'error' : ''}`}
                                />
                            </div>
                            {errors.precio_mano_obra && <span className="error-message">{errors.precio_mano_obra}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Tiempo Estimado
                                <span className="optional">(Opcional)</span>
                            </label>
                            <div className="input-with-icon">
                                <span className="input-icon">⏱️</span>
                                <input
                                    type="text"
                                    name="tiempo_estimado"
                                    value={formData.tiempo_estimado}
                                    onChange={handleChange}
                                    placeholder="Ej: 45 min, 2 horas"
                                    className="form-input with-icon"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-card">
                            <input
                                type="checkbox"
                                name="requiere_repuestos"
                                checked={formData.requiere_repuestos}
                                onChange={handleChange}
                            />
                            <div className="checkbox-content">
                                <span className="checkbox-icon">🔩</span>
                                <div className="checkbox-text">
                                    <strong>Requiere Repuestos Adicionales</strong>
                                    <small>Este servicio necesita repuestos que se cobran aparte</small>
                                </div>
                            </div>
                            <span className="checkbox-check">✓</span>
                        </label>
                    </div>
                </div>

                {/* Sección: Imagen */}
                <div className="form-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="section-icon">🖼️</span>
                            Imagen del Servicio
                        </h3>
                    </div>

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label className="form-label">URL de la Imagen</label>
                            <input
                                type="url"
                                name="imagen_url"
                                value={formData.imagen_url}
                                onChange={handleChange}
                                placeholder="https://ejemplo.com/servicio.jpg"
                                className="form-input"
                            />
                            <span className="helper-text">
                                Proporciona una URL de imagen válida para el servicio
                            </span>
                        </div>

                        {previewImage && (
                            <div className="image-preview">
                                <label className="form-label">Vista Previa:</label>
                                <div className="preview-container">
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/200?text=Error+al+cargar';
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        <span className="btn-icon">✕</span>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">{servicio ? '💾' : '➕'}</span>
                                {servicio ? 'Actualizar Servicio' : 'Crear Servicio'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ServiciosForm;