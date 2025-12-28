import axios from 'axios';

const API_URL = 'http://localhost:3000/api/vehiculos';

/**
 * Servicio para filtrar vehículos usando el backend principal
 */
const filtrosVehiculosService = {

    /**
     * Obtener todos los vehículos sin filtros
     * @returns {Promise} - Promesa con todos los vehículos
     */
    obtenerTodos: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Error al obtener vehículos:', error);
            throw error;
        }
    },

    /**
     * Filtrar vehículos con múltiples criterios
     * @param {Object} filtros - Objeto con los filtros a aplicar
     * @param {string} filtros.marca - Marca del vehículo
     * @param {string} filtros.modelo - Modelo del vehículo
     * @param {number} filtros.anio - Año del vehículo
     * @param {string} filtros.tipo - Tipo de vehículo
     * @param {string} filtros.color - Color del vehículo
     * @param {number} filtros.precioMin - Precio mínimo
     * @param {number} filtros.precioMax - Precio máximo
     * @param {string} filtros.estado - Estado del vehículo
     * @param {string} filtros.busqueda - Búsqueda general
     * @returns {Promise} - Promesa con los vehículos filtrados
     */
    filtrarVehiculos: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();

            // Agregar solo los filtros que tengan valor
            Object.keys(filtros).forEach(key => {
                if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
                    params.append(key, filtros[key]);
                }
            });

            const response = await axios.get(`${API_URL}/filtrar?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error al filtrar vehículos:', error);
            throw error;
        }
    },

    /**
     * Obtener vehículos por marca
     * @param {number} id_marca - ID de la marca
     * @returns {Promise} - Promesa con los vehículos de esa marca
     */
    obtenerPorMarca: async (id_marca) => {
        try {
            const response = await axios.get(`${API_URL}/marca/${id_marca}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener vehículos por marca:', error);
            throw error;
        }
    },

    /**
     * Obtener estadísticas de vehículos (calculadas en el frontend)
     * @param {Array} vehiculos - Array de vehículos
     * @returns {Object} - Objeto con estadísticas
     */
    calcularEstadisticas: (vehiculos) => {
        if (!vehiculos || vehiculos.length === 0) {
            return {
                total: 0,
                disponibles: 0,
                vendidos: 0,
                precioPromedio: 0,
                precioMin: 0,
                precioMax: 0,
                porMarca: [],
                porTipo: [],
                porAnio: []
            };
        }

        const disponibles = vehiculos.filter(v => v.estado?.toLowerCase() === 'disponible').length;
        const vendidos = vehiculos.filter(v => v.estado?.toLowerCase() === 'vendido').length;

        const precios = vehiculos.map(v => parseFloat(v.precio));
        const precioPromedio = precios.reduce((sum, p) => sum + p, 0) / precios.length;
        const precioMin = Math.min(...precios);
        const precioMax = Math.max(...precios);

        // Agrupar por marca
        const porMarca = vehiculos.reduce((acc, v) => {
            const marca = v.marca || 'Sin marca';
            if (!acc[marca]) {
                acc[marca] = { marca, cantidad: 0, totalPrecio: 0 };
            }
            acc[marca].cantidad++;
            acc[marca].totalPrecio += parseFloat(v.precio);
            return acc;
        }, {});

        // Agrupar por tipo
        const porTipo = vehiculos.reduce((acc, v) => {
            const tipo = v.tipo || 'Sin tipo';
            if (!acc[tipo]) {
                acc[tipo] = { tipo, cantidad: 0 };
            }
            acc[tipo].cantidad++;
            return acc;
        }, {});

        // Agrupar por año
        const porAnio = vehiculos.reduce((acc, v) => {
            const anio = v.anio;
            if (!acc[anio]) {
                acc[anio] = { anio, cantidad: 0 };
            }
            acc[anio].cantidad++;
            return acc;
        }, {});

        return {
            total: vehiculos.length,
            disponibles,
            vendidos,
            precioPromedio: precioPromedio.toFixed(2),
            precioMin: precioMin.toFixed(2),
            precioMax: precioMax.toFixed(2),
            porMarca: Object.values(porMarca).sort((a, b) => b.cantidad - a.cantidad),
            porTipo: Object.values(porTipo).sort((a, b) => b.cantidad - a.cantidad),
            porAnio: Object.values(porAnio).sort((a, b) => b.anio - a.anio)
        };
    }
};

export default filtrosVehiculosService;