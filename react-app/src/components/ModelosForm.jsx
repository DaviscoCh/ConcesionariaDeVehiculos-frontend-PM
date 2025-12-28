import './ModelosForm.css';

function ModelosForm({
    formData,
    marcas,
    handleChange,
    handleSubmit,
    modoEdicion,
    limpiarFormulario,
    mensajeExito
}) {
    return (
        <div className="modelos-form-container">
            <div className="form-header">
                <h3>{modoEdicion ? '✏️ Editar Modelo' : '➕ Agregar Nuevo Modelo'}</h3>
                <p className="form-subtitle">
                    {modoEdicion
                        ? 'Modifica los datos del modelo seleccionado'
                        : 'Completa la información para registrar un nuevo modelo'}
                </p>
            </div>

            <form className="modelos-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h4 className="section-title">📦 Información del Modelo</h4>

                    <div className="form-field">
                        <label htmlFor="id_marca">Marca *</label>
                        <select
                            id="id_marca"
                            name="id_marca"
                            value={formData.id_marca}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecciona una marca</option>
                            {marcas.map((m) => (
                                <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="nombre">Nombre del Modelo *</label>
                        <input
                            id="nombre"
                            type="text"
                            name="nombre"
                            placeholder="Ej: Corolla, Civic, X5..."
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
                            placeholder="Características del modelo..."
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-submit">
                        {modoEdicion ? '✓ Actualizar Modelo' : '+ Agregar Modelo'}
                    </button>
                    <button type="button" onClick={limpiarFormulario} className="btn-cancel">
                        ✕ Limpiar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ModelosForm;