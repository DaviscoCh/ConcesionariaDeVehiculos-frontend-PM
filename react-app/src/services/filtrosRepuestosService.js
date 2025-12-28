import axios from 'axios';

const GATEWAY_URL = 'http://localhost:8080/api/filtros-repuestos';

/**
 * Servicio para consumir el microservicio de filtros de repuestos
 */
const filtrosRepuestosService = {
    
    /**
     * Filtrar repuestos con múltiples criterios
     * @param {Object} filtros - Objeto con los filtros a aplicar
     * @param {string} filtros.categoria - Categoría del repuesto
     * @param {number} filtros.precio_min - Precio mínimo
     * @param {number} filtros.precio_max - Precio máximo
     * @param {string} filtros.estado - Estado (disponible, agotado)
     * @param {string} filtros.marca - Marca compatible
     * @param {string} filtros.modelo - Modelo compatible
     * @param {number} filtros.stock_min - Stock mínimo
     * @param {string} filtros.buscar - Búsqueda por nombre o descripción
     * @returns {Promise} - Promesa con los repuestos filtrados
     */
    filtrarRepuestos: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            
            // Agregar solo los filtros que tengan valor
            Object.keys(filtros).forEach(key => {
                if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
                    params.append(key, filtros[key]);
                }
            });

            const response = await axios.get(`${GATEWAY_URL}/repuestos/filtros?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error al filtrar repuestos:', error);
            throw error;
        }
    },

    /**
     * Obtener estadísticas de repuestos
     * @returns {Promise} - Promesa con las estadísticas
     */
    obtenerEstadisticas: async () => {
        try {
            const response = await axios.get(`${GATEWAY_URL}/repuestos/estadisticas`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    },

    /**
     * Obtener repuestos agrupados por categoría
     * @returns {Promise} - Promesa con los repuestos por categoría
     */
    obtenerPorCategoria: async () => {
        try {
            const response = await axios.get(`${GATEWAY_URL}/repuestos/por-categoria`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener repuestos por categoría:', error);
            throw error;
        }
    },

    /**
     * Obtener repuestos con bajo stock
     * @param {number} limite - Stock máximo considerado como bajo (default: 10)
     * @returns {Promise} - Promesa con los repuestos con bajo stock
     */
    obtenerBajoStock: async (limite = 10) => {
        try {
            const response = await axios.get(`${GATEWAY_URL}/repuestos/bajo-stock?limite=${limite}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener repuestos con bajo stock:', error);
            throw error;
        }
    },

    /**
     * Obtener opciones disponibles para los filtros
     * @returns {Promise} - Promesa con las opciones de filtro (categorías, estados, rangos)
     */
    obtenerOpcionesFiltro: async () => {
        try {
            const response = await axios.get(`${GATEWAY_URL}/repuestos/opciones-filtro`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener opciones de filtro:', error);
            throw error;
        }
    }
};

export default filtrosRepuestosService;