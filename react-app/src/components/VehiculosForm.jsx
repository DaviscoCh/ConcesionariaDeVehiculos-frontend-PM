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
        <form className="vehiculo-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <div>
                    <select name="marca_id" value={formData.marca_id} onChange={handleChange}>
                        <option value="">Selecciona una marca</option>
                        {marcas.map((m) => (
                            <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>
                        ))}
                    </select>
                    {errores.marca_id && <div className="error">{errores.marca_id}</div>}
                </div>

                <div>
                    <select name="modelo_id" value={formData.modelo_id} onChange={handleChange}>
                        <option value="">Selecciona un modelo</option>
                        {modelosFiltrados.map((mod) => (
                            <option key={mod.id_modelo} value={mod.id_modelo}>{mod.nombre}</option>
                        ))}
                    </select>
                    {errores.modelo_id && <div className="error">{errores.modelo_id}</div>}
                </div>
            </div>

            <div className="form-group">
                <div>
                    <input name="anio" placeholder="Año" value={formData.anio} onChange={handleChange} />
                    {errores.anio && <div className="error">{errores.anio}</div>}
                </div>
                <div>
                    <input name="color" placeholder="Color" value={formData.color} onChange={handleChange} />
                </div>
                <div>
                    <input name="precio" placeholder="Precio" value={formData.precio} onChange={handleChange} />
                    {errores.precio && <div className="error">{errores.precio}</div>}
                </div>
            </div>

            <div className="form-group">
                <div>
                    <select name="tipo" value={formData.tipo} onChange={handleChange}>
                        <option value="">Selecciona un tipo</option>
                        {tiposVehiculo.map((tipo) => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <select name="estado" value={formData.estado} onChange={handleChange}>
                        <option value="">Selecciona estado</option>
                        <option value="Disponible">Disponible</option>
                        <option value="Agotado">Agotado</option>
                    </select>
                </div>
            </div>

            <input name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange} />
            <input name="fecha_ingreso" type="date" value={formData.fecha_ingreso} onChange={handleChange} />
            <input name="imagen_url" placeholder="URL Imagen" value={formData.imagen_url} onChange={handleChange} />
            {errores.imagen_url && <div className="error">{errores.imagen_url}</div>}

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit">
                    {modoEdicion ? 'Actualizar Vehículo' : 'Agregar Vehículo'}
                </button>
                <button type="button" onClick={limpiarFormulario}>Limpiar</button>
            </div>

            {mensajeExito && <div style={{ color: 'green', marginTop: '1rem' }}>{mensajeExito}</div>}
        </form>
    );
}

export default VehiculoForm;