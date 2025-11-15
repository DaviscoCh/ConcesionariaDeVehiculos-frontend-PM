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
        <form className="marcas-form" onSubmit={handleSubmit}>
            <input
                name="nombre"
                placeholder="Nombre de la marca"
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

export default MarcasForm;