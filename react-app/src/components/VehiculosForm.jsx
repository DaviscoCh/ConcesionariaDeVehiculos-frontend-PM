import './VehiculosForm.css';

function VehiculoForm({
    formData,
    marcas,
    modelosFiltrados,
    handleChange,
    handleSubmit,
    errores,
    mensajeExito,
    limpiarFormulario,
    modoEdicion
}) {
    const tiposVehiculo = [
        'Sedán', 'SUV', 'Coupé', 'Hatchback', 'Pickup',
        'Convertible', 'Furgoneta', 'Camión'
    ];

    return (
        <div className="vehiculo-form-container">
            <div className="form-header">
                <h3>{modoEdicion ? '✏️ Editar Vehículo' : '➕ Agregar Nuevo Vehículo'}</h3>
                <p className="form-subtitle">
                    {modoEdicion
                        ? 'Modifica los datos del vehículo seleccionado'
                        : 'Completa la información para registrar un nuevo vehículo'}
                </p>
            </div>

            <form className="vehiculo-form" onSubmit={handleSubmit}>
                {/* Sección: Información del Vehículo */}
                <div className="form-section">
                    <h4 className="section-title">🚗 Información del Vehículo</h4>
                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="marca_id">Marca *</label>
                            <select
                                id="marca_id"
                                name="marca_id"
                                value={formData.marca_id}
                                onChange={handleChange}
                                className={errores.marca_id ? 'error-field' : ''}
                            >
                                <option value="">Selecciona una marca</option>
                                {marcas.map((m) => (
                                    <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>
                                ))}
                            </select>
                            {errores.marca_id && <span className="error-message">{errores.marca_id}</span>}
                        </div>

                        <div className="form-field">
                            <label htmlFor="modelo_id">Modelo *</label>
                            <select
                                id="modelo_id"
                                name="modelo_id"
                                value={formData.modelo_id}
                                onChange={handleChange}
                                className={errores.modelo_id ? 'error-field' : ''}
                                disabled={!formData.marca_id}
                            >
                                <option value="">Selecciona un modelo</option>
                                {modelosFiltrados.map((mod) => (
                                    <option key={mod.id_modelo} value={mod.id_modelo}>{mod.nombre}</option>
                                ))}
                            </select>
                            {errores.modelo_id && <span className="error-message">{errores.modelo_id}</span>}
                        </div>

                        <div className="form-field">
                            <label htmlFor="tipo">Tipo de Vehículo *</label>
                            <select
                                id="tipo"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona un tipo</option>
                                {tiposVehiculo.map((tipo) => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sección: Detalles */}
                <div className="form-section">
                    <h4 className="section-title">📋 Detalles</h4>
                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="anio">Año *</label>
                            <input
                                id="anio"
                                type="number"
                                name="anio"
                                placeholder="Ej: 2024"
                                value={formData.anio}
                                onChange={handleChange}
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                className={errores.anio ? 'error-field' : ''}
                            />
                            {errores.anio && <span className="error-message">{errores.anio}</span>}
                        </div>

                        <div className="form-field">
                            <label htmlFor="color">Color</label>
                            <input
                                id="color"
                                type="text"
                                name="color"
                                placeholder="Ej: Blanco"
                                value={formData.color}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="estado">Estado *</label>
                            <select
                                id="estado"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona estado</option>
                                <option value="Disponible">Disponible</option>
                                <option value="Vendido">Vendido</option>
                                <option value="Reservado">Reservado</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sección: Precio e Ingreso */}
                <div className="form-section">
                    <h4 className="section-title">💰 Precio e Ingreso</h4>
                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="precio">Precio *</label>
                            <div className="input-with-icon">
                                <span className="input-icon">$</span>
                                <input
                                    id="precio"
                                    type="number"
                                    name="precio"
                                    placeholder="25000"
                                    value={formData.precio}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className={errores.precio ? 'error-field with-icon' : 'with-icon'}
                                />
                            </div>
                            {errores.precio && <span className="error-message">{errores.precio}</span>}
                        </div>

                        <div className="form-field">
                            <label htmlFor="fecha_ingreso">Fecha de Ingreso</label>
                            <input
                                id="fecha_ingreso"
                                type="date"
                                name="fecha_ingreso"
                                value={formData.fecha_ingreso}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Sección: Descripción e Imagen */}
                <div className="form-section">
                    <h4 className="section-title">📝 Descripción e Imagen</h4>
                    <div className="form-row full-width">
                        <div className="form-field">
                            <label htmlFor="descripcion">Descripción</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                placeholder="Características del vehículo..."
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="3"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="imagen_url">URL de Imagen</label>
                            <input
                                id="imagen_url"
                                type="url"
                                name="imagen_url"
                                placeholder="https://ejemplo.com/imagen.jpg"
                                value={formData.imagen_url}
                                onChange={handleChange}
                                className={errores.imagen_url ? 'error-field' : ''}
                            />
                            {errores.imagen_url && <span className="error-message">{errores.imagen_url}</span>}
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="form-actions">
                    <button type="submit" className="btn-submit">
                        {modoEdicion ? '✓ Actualizar Vehículo' : '+ Agregar Vehículo'}
                    </button>
                    <button type="button" onClick={limpiarFormulario} className="btn-cancel">
                        ✕ Limpiar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default VehiculoForm;