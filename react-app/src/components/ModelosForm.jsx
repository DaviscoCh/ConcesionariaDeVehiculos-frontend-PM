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
        <form className="modelos-form" onSubmit={handleSubmit}>
            <select name="id_marca" value={formData.id_marca} onChange={handleChange}>
                <option value="">Selecciona una marca</option>
                {marcas.map((m) => (
                    <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>
                ))}
            </select>

            <input
                name="nombre"
                placeholder="Nombre del modelo"
                value={formData.nombre}
                onChange={handleChange}
            />

            <input
                name="descripcion"
                placeholder="Descripción"
                value={formData.descripcion}
                onChange={handleChange}
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit">{modoEdicion ? 'Actualizar' : 'Agregar'}</button>
                <button type="button" onClick={limpiarFormulario}>Limpiar</button>
            </div>

            {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}
        </form>
    );
}

export default ModelosForm;