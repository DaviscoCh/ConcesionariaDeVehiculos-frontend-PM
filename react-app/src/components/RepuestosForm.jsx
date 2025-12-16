import { useState, useEffect } from 'react';
import axios from 'axios';
import './RepuestosForm.css';

function RepuestosForm({ repuesto, marcas, modelos, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        imagen_url: '',
        categoria: '',
        estado: 'Disponible',
        marcas_compatibles: [],
        modelos_compatibles: []
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState('');

    const categorias = [
        'Motor', 'Transmisión', 'Frenos', 'Suspensión', 'Eléctrico',
        'Filtros', 'Neumáticos', 'Escape', 'Sistema de Enfriamiento',
        'Carrocería', 'Iluminación', 'Accesorios'
    ];

    useEffect(() => {
        if (repuesto) {
            setFormData({
                nombre: repuesto.nombre || '',
                descripcion: repuesto.descripcion || '',
                precio: repuesto.precio || '',
                stock: repuesto.stock || '',
                imagen_url: repuesto.imagen_url || '',
                categoria: repuesto.categoria || '',
                estado: repuesto.estado || 'Disponible',
                marcas_compatibles: repuesto.marcas_compatibles || [],
                modelos_compatibles: repuesto.modelos_compatibles || []
            });
            setPreviewImage(repuesto.imagen_url || '');
        }
    }, [repuesto]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Limpiar error del campo
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }

        // Preview de imagen
        if (name === 'imagen_url') {
            setPreviewImage(value);
        }
    };

    const handleMarcaToggle = (marca) => {
        const isSelected = formData.marcas_compatibles.includes(marca);
        setFormData({
            ...formData,
            marcas_compatibles: isSelected
                ? formData.marcas_compatibles.filter(m => m !== marca)
                : [...formData.marcas_compatibles, marca]
        });

        if (errors.marcas_compatibles) {
            setErrors({ ...errors, marcas_compatibles: '' });
        }
    };

    const handleModeloToggle = (modelo) => {
        const isSelected = formData.modelos_compatibles.includes(modelo);
        setFormData({
            ...formData,
            modelos_compatibles: isSelected
                ? formData.modelos_compatibles.filter(m => m !== modelo)
                : [...formData.modelos_compatibles, modelo]
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }

        if (!formData.precio || parseFloat(formData.precio) <= 0) {
            newErrors.precio = 'El precio debe ser mayor a 0';
        }

        if (!formData.stock || parseInt(formData.stock) < 0) {
            newErrors.stock = 'El stock no puede ser negativo';
        }

        if (!formData.categoria) {
            newErrors.categoria = 'Selecciona una categoría';
        }

        if (formData.marcas_compatibles.length === 0) {
            newErrors.marcas_compatibles = 'Selecciona al menos una marca compatible';
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
                precio: parseFloat(formData.precio),
                stock: parseInt(formData.stock) || 0
            };

            if (repuesto) {
                await axios.put(`http://localhost:3000/api/admin/repuestos/${repuesto.id_repuesto}`, dataToSend);
                onSuccess('✅ Repuesto actualizado exitosamente');
            } else {
                await axios.post('http://localhost:3000/api/admin/repuestos', dataToSend);
                onSuccess('✅ Repuesto creado exitosamente');
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            alert(error.response?.data?.error || 'Error al guardar repuesto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="repuestos-form-container">
            <form onSubmit={handleSubmit} className="repuestos-form">

                {/* Sección: Información Básica */}
                <div className="form-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="section-icon">📝</span>
                            Información Básica
                        </h3>
                    </div>

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label className="form-label">
                                Nombre del Repuesto
                                <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Pastillas de Freno Delanteras Cerámicas"
                                className={`form-input ${errors.nombre ? 'error' : ''}`}
                            />
                            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">Descripción</label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Describe las características y especificaciones del repuesto..."
                                rows="3"
                                className="form-textarea"
                            />
                            <span className="helper-text">
                                {formData.descripcion.length}/500 caracteres
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sección: Precio y Stock */}
                <div className="form-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="section-icon">💰</span>
                            Precio e Inventario
                        </h3>
                    </div>

                    <div className="form-grid grid-2">
                        <div className="form-group">
                            <label className="form-label">
                                Precio Unitario
                                <span className="required">*</span>
                            </label>
                            <div className="input-with-icon">
                                <span className="input-icon">$</span>
                                <input
                                    type="number"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className={`form-input with-icon ${errors.precio ? 'error' : ''}`}
                                />
                            </div>
                            {errors.precio && <span className="error-message">{errors.precio}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Stock Disponible
                                <span className="required">*</span>
                            </label>
                            <div className="input-with-icon">
                                <span className="input-icon">📦</span>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="0"
                                    className={`form-input with-icon ${errors.stock ? 'error' : ''}`}
                                />
                            </div>
                            {errors.stock && <span className="error-message">{errors.stock}</span>}
                        </div>
                    </div>

                    <div className="stock-indicator">
                        {parseInt(formData.stock) === 0 && (
                            <div className="indicator indicator-danger">
                                <span className="indicator-icon">⚠️</span>
                                Sin stock disponible
                            </div>
                        )}
                        {parseInt(formData.stock) > 0 && parseInt(formData.stock) < 10 && (
                            <div className="indicator indicator-warning">
                                <span className="indicator-icon">📊</span>
                                Stock bajo - Considera reabastecer
                            </div>
                        )}
                        {parseInt(formData.stock) >= 10 && (
                            <div className="indicator indicator-success">
                                <span className="indicator-icon">✅</span>
                                Stock saludable
                            </div>
                        )}
                    </div>
                </div>

                {/* Sección: Categorización */}
                <div className="form-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="section-icon">🏷️</span>
                            Categorización
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
                            <label className="form-label">Estado</label>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="Disponible">✅ Disponible</option>
                                <option value="Agotado">❌ Agotado</option>
                                <option value="Descontinuado">🚫 Descontinuado</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sección: Imagen */}
                <div className="form-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="section-icon">🖼️</span>
                            Imagen del Producto
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
                                placeholder="https://ejemplo.com/imagen.jpg"
                                className="form-input"
                            />
                            <span className="helper-text">
                                Proporciona una URL de imagen válida
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

                {/* Sección: Compatibilidad */}
                <div className="form-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="section-icon">🚗</span>
                            Compatibilidad de Vehículos
                        </h3>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Marcas Compatibles
                            <span className="required">*</span>
                        </label>
                        <div className="checkbox-grid">
                            {marcas.map(marca => (
                                <label
                                    key={marca.id_marca}
                                    className={`checkbox-card ${formData.marcas_compatibles.includes(marca.nombre) ? 'selected' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.marcas_compatibles.includes(marca.nombre)}
                                        onChange={() => handleMarcaToggle(marca.nombre)}
                                    />
                                    <span className="checkbox-label">{marca.nombre}</span>
                                    <span className="checkbox-check">✓</span>
                                </label>
                            ))}
                        </div>
                        {errors.marcas_compatibles && (
                            <span className="error-message">{errors.marcas_compatibles}</span>
                        )}
                        <div className="selection-count">
                            {formData.marcas_compatibles.length > 0 && (
                                <span className="count-badge">
                                    {formData.marcas_compatibles.length} marca(s) seleccionada(s)
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Modelos Compatibles
                            <span className="optional">(Opcional)</span>
                        </label>
                        <div className="checkbox-grid small">
                            {modelos.map(modelo => (
                                <label
                                    key={modelo.id_modelo}
                                    className={`checkbox-card ${formData.modelos_compatibles.includes(modelo.nombre) ? 'selected' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.modelos_compatibles.includes(modelo.nombre)}
                                        onChange={() => handleModeloToggle(modelo.nombre)}
                                    />
                                    <span className="checkbox-label">{modelo.nombre}</span>
                                    <span className="checkbox-check">✓</span>
                                </label>
                            ))}
                        </div>
                        <div className="selection-count">
                            {formData.modelos_compatibles.length > 0 && (
                                <span className="count-badge">
                                    {formData.modelos_compatibles.length} modelo(s) seleccionado(s)
                                </span>
                            )}
                        </div>
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
                                <span className="btn-icon">{repuesto ? '💾' : '➕'}</span>
                                {repuesto ? 'Actualizar Repuesto' : 'Crear Repuesto'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default RepuestosForm;