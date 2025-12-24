import { useState, useEffect } from 'react';
import axios from 'axios';
import VehiculoForm from '../components/VehiculosForm';
import './VehiculosPage.css';

function VehiculosPage() {
    const [vehiculos, setVehiculos] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [formData, setFormData] = useState({
        marca_id: '',
        modelo_id: '',
        anio: '',
        color: '',
        precio: '',
        tipo: '',
        estado: '',
        descripcion: '',
        fecha_ingreso: '',
        imagen_url: ''
    });
    const [marcaSeleccionada, setMarcaSeleccionada] = useState('');
    const [errores, setErrores] = useState({});
    const [mensajeExito, setMensajeExito] = useState('');
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);
    const vehiculosOrdenados = [...vehiculos].sort((a, b) => new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso));
    const getMarcaNombre = (id) => {
        const marca = marcas.find((m) => m.id_marca === id);
        return marca ? marca.nombre : '';
    };
    const tiposVehiculo = [
        'Sedán',
        'SUV',
        'Coupé',
        'Hatchback',
        'Pickup',
        'Convertible',
        'Furgoneta',
        'Camión'
    ];

    const getModeloNombre = (id) => {
        const modelo = modelos.find((m) => m.id_modelo === id);
        return modelo ? modelo.nombre : '';
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '—';

        // Extraer solo la parte de la fecha (YYYY-MM-DD)
        const fechaSolo = fecha.split('T')[0];

        // Formatear a DD/MM/YYYY (opcional)
        const [anio, mes, dia] = fechaSolo.split('-');
        return `${dia}/${mes}/${anio}`;

        // O si prefieres YYYY-MM-DD, simplemente retorna: 
        // return fechaSolo;
    };

    useEffect(() => {
        fetchVehiculos();
        fetchMarcas();
        fetchModelos();
    }, []);

    const fetchVehiculos = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/vehiculos', { timeout: 10000 }); // 10 segundos
            setVehiculos(res.data);
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
            }
            if (err.code !== 'ECONNABORTED') {
                console.error('Error al obtener vehículos:', err.message);
            }
        }
    };

    const fetchMarcas = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/marcas');
            setMarcas(res.data);
        } catch (err) {
            console.error('Error al obtener marcas:', err.message);
        }
    };

    const fetchModelos = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/modelos');
            console.log('Modelos:', res.data);
            setModelos(res.data);
        } catch (err) {
            console.error('Error al obtener modelos:', err.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'marca_id') {
            setMarcaSeleccionada(value);
        }
    };

    const handleSubmit = async (e) => {
        console.log('handleSubmit ejecutado');
        e.preventDefault();
        const nuevosErrores = {};
        if (!formData.marca_id) nuevosErrores.marca_id = 'Marca obligatoria';
        if (!formData.modelo_id) nuevosErrores.modelo_id = 'Modelo obligatorio';
        if (!formData.anio || isNaN(formData.anio) || formData.anio < 1900 || formData.anio > new Date().getFullYear()) {
            nuevosErrores.anio = 'Año inválido';
        }
        if (!formData.precio || isNaN(formData.precio) || formData.precio <= 0) {
            nuevosErrores.precio = 'Precio inválido';
        }
        if (formData.imagen_url && !/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/.test(formData.imagen_url)) {
            nuevosErrores.imagen_url = 'URL de imagen inválida';
        }
        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }
        setErrores({}); // limpia errores si todo está bien

        const {
            marca_id, // ❌ excluir
            ...resto
        } = formData;

        const payload = {
            id_modelo: formData.modelo_id,
            anio: parseInt(formData.anio),
            color: formData.color,
            precio: parseFloat(formData.precio),
            tipo: formData.tipo,
            estado: formData.estado,
            descripcion: formData.descripcion,
            fecha_ingreso: formData.fecha_ingreso,
            imagen_url: formData.imagen_url
        };

        if (modoEdicion && idEditando) {
            console.log('Payload enviado:', payload);
            try {
                const res = await axios.put(`http://localhost:3000/api/vehiculos/${idEditando}`, payload);
                console.log('Respuesta del backend (PUT):', res.data);
                setVehiculos((prev) =>
                    prev.map((v) =>
                        v.id_vehiculo === idEditando
                            ? { ...v, ...payload, marca: getMarcaNombre(formData.marca_id), modelo: getModeloNombre(formData.modelo_id) }
                            : v
                    )
                );
                setModoEdicion(false);
                setIdEditando(null);
                limpiarFormulario();
            } catch (err) {
                console.error('Error en PUT:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    headers: err.response?.headers
                });
            }
        } else {
            // Modo inserción: crear nuevo
            try {
                const res = await axios.post('http://localhost:3000/api/vehiculos', payload);
                const nuevoVehiculo = res.data;
                setVehiculos((prev) => [
                    ...prev,
                    {
                        ...nuevoVehiculo,
                        marca: getMarcaNombre(formData.marca_id),
                        modelo: getModeloNombre(formData.modelo_id)
                    }
                ]);
                limpiarFormulario();
            } catch (err) {
                console.error('Error en POST:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    headers: err.response?.headers
                });
            }
        }
        await fetchVehiculos();
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/vehiculos/${id}`);
            setVehiculos((prev) => prev.filter((v) => v.id_vehiculo !== id));
            setMensajeExito('Vehículo agregado correctamente.');
            setTimeout(() => setMensajeExito(''), 3000);
        } catch (err) {
            console.error('Error al eliminar vehículo:', err.message);
        }
        await fetchVehiculos();
    };

    const handleEdit = (vehiculo) => {
        console.log('Vehículo seleccionado:', vehiculo);
        setMarcaSeleccionada(vehiculo.marca_id); // 👈 esto activa el filtro de modelos
        setModoEdicion(true);
        setIdEditando(vehiculo.id_vehiculo);
        setFormData({
            marca_id: vehiculo.id_marca,
            modelo_id: vehiculo.id_modelo,
            anio: vehiculo.anio,
            color: vehiculo.color,
            precio: vehiculo.precio,
            tipo: vehiculo.tipo,
            estado: vehiculo.estado,
            descripcion: vehiculo.descripcion,
            fecha_ingreso: vehiculo.fecha_ingreso?.slice(0, 10),
            imagen_url: vehiculo.imagen_url,
        });
    };

    const limpiarFormulario = () => {
        setFormData({
            marca_id: '', modelo_id: '', anio: '', color: '', precio: '',
            tipo: '', estado: '', descripcion: '', fecha_ingreso: '',
            imagen_url: ''
        });
        setErrores({});
        setMensajeExito('');
    };

    const modelosFiltrados = modelos.filter((mod) => mod.id_marca === formData.marca_id);

    return (
        <div className="vehiculos-container">
            <h2>Gestión de Vehículos</h2>

            <VehiculoForm
                formData={formData}
                marcas={marcas}
                modelosFiltrados={modelosFiltrados}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                errores={errores}
                mensajeExito={mensajeExito}
                limpiarFormulario={limpiarFormulario}
                modoEdicion={modoEdicion}
            />

            <table className="vehiculos-table">
                <thead>
                    <tr>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Año</th>
                        <th>Color</th>
                        <th>Precio</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Descripción</th>
                        <th>Fecha ingreso</th>
                        <th>Imagen</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {vehiculosOrdenados.map((v) => (
                        <tr key={v.id_vehiculo}>
                            <td>{v.marca}</td>
                            <td>{v.modelo}</td>
                            <td>{v.anio}</td>
                            <td>{v.color}</td>
                            <td>${v.precio}</td>
                            <td>{v.tipo}</td>
                            <td>{v.estado}</td>
                            <td>{v.descripcion}</td>
                            <td>{formatearFecha(v.fecha_ingreso)}</td>                            <td><img src={v.imagen_url} alt={v.modelo} /></td>
                            <td>
                                <button onClick={() => handleEdit(v)}>Editar</button>
                                <button onClick={() => handleDelete(v.id_vehiculo)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default VehiculosPage;