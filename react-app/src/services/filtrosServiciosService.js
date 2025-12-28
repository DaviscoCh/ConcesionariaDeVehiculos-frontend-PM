import axios from 'axios';

const GATEWAY_URL = 'http://localhost:8080/api/filtros-servicios';

/**
 * Servicio para consumir el microservicio de filtros de servicios
 */
const filtrosServiciosService = {

    /**
     * Filtrar servicios con múltiples criterios
     * @param {Object} filtros - Objeto con los filtros a aplicar
     * @param {string} filtros.categoria - Categoría del servicio
     * @param {number} filtros.precio_min - Precio mínimo
     * @param {number} filtros.precio_max - Precio máximo
     * @param {string} filtros.estado - Estado (activo, inactivo)
     * @param {string} filtros.requiere_repuestos - 'true' o 'false'
     * @param {number} filtros.tiempo_max - Tiempo máximo en minutos
     * @param {string} filtros.buscar - Búsqueda por nombre o descripción
     * @returns {Promise} - Promesa con los servicios filtrados
     */
    filtrarServicios: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();

            // Agregar solo los filtros que tengan valor
            Object.keys(filtros).forEach(key => {
                if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
                    params.append(key, filtros[key]);
                }
            });

            const response = await axios.get(`${GATEWAY_URL}/servicios/filtros?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error al filtrar servicios:', error);
            throw error;
        }
    },

    /**
     * Obtener estadísticas de servicios
     * @returns {Promise} - Promesa con las estadísticas
     */
    obtenerEstadisticas: async () => {
        try {
            const response = await axios.get(`${GATEWAY_URL}/servicios/estadisticas`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    },

    /**
     * Obtener servicios agrupados por categoría
     * @returns {Promise} - Promesa con los servicios por categoría
     */
    obtenerPorCategoria: async () => {
        try {
            const response = await axios.get(`${GATEWAY_URL}/servicios/por-categoria`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener servicios por categoría:', error);
            throw error;
        }
    },

    /**
     * Obtener servicios más solicitados
     * @param {number} limite - Cantidad de servicios a obtener (default: 10)
     * @returns {Promise} - Promesa con los servicios más solicitados
     */
    obtenerMasSolicitados: async (limite = 10) => {
        try {
            const response = await axios.get(`${GATEWAY_URL}/servicios/mas-solicitados?limite=${limite}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener servicios más solicitados:', error);
            throw error;
        }
    },

    /**
     * Obtener servicios rápidos (que tomen menos tiempo)
     * @param {number} tiempo_max - Tiempo máximo en minutos (default: 60)
     * @returns {Promise} - Promesa con los servicios rápidos
     */
    obtenerServiciosRapidos: async (tiempo_max = 60) => {
        try {
            const response = await axios.get(`${GATEWAY_URL}/servicios/rapidos?tiempo_max=${tiempo_max}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener servicios rápidos:', error);
            throw error;
        }
    },

    /**
     * Obtener opciones disponibles para los filtros
     * @returns {Promise} - Promesa con las opciones de filtro (categorías, estados, rangos)
     */
    obtenerOpcionesFiltro: async () => {
        try {
            const response = await axios.get(`${GATEWAY_URL}/servicios/opciones-filtro`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener opciones de filtro:', error);
            throw error;
        }
    }
};

export default filtrosServiciosService;