import './MarcasForm.css';

function MarcasForm({
    formData,
    handleChange,
    handleSubmit,
    modoEdicion,
    limpiarFormulario,
    mensajeExito
}) {
    return (
        <div className="marcas-form-container">
            <div className="form-header">
                <h3>{modoEdicion ? '✏️ Editar Marca' : '➕ Agregar Nueva Marca'}</h3>
                <p className="form-subtitle">
                    {modoEdicion
                        ? 'Modifica los datos de la marca seleccionada'
                        : 'Completa la información para registrar una nueva marca'}
                </p>
            </div>

            <form className="marcas-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h4 className="section-title">🏷️ Información de la Marca</h4>

                    <div className="form-field">
                        <label htmlFor="nombre">Nombre de la Marca *</label>
                        <input
                            id="nombre"
                            type="text"
                            name="nombre"
                            placeholder="Ej: Toyota, Honda, BMW..."
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            placeholder="Descripción de la marca..."
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-submit">
                        {modoEdicion ? '✓ Actualizar Marca' : '+ Agregar Marca'}
                    </button>
                    <button type="button" onClick={limpiarFormulario} className="btn-cancel">
                        ✕ Limpiar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default MarcasForm;