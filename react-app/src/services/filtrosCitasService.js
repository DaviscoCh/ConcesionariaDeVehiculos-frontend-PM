import axios from 'axios';

const GATEWAY_URL = 'http://localhost:8080/api/filtros-citas';

/**
 * Servicio para consumir el microservicio de filtros de citas
 */
const filtrosCitasService = {

    /**
     * Filtrar citas con múltiples criterios
     * @param {Object} filtros - Objeto con los filtros a aplicar
     * @param {string} filtros.estado - Estado de la cita (Pendiente, Confirmada, Cancelada, Atendida)
     * @param {string} filtros.fecha_inicio - Fecha de inicio (YYYY-MM-DD)
     * @param {string} filtros.fecha_fin - Fecha de fin (YYYY-MM-DD)
     * @param {number} filtros.id_oficina - ID de la oficina
     * @param {number} filtros.id_usuario - ID del usuario
     * @param {number} filtros.id_vehiculo - ID del vehículo
     * @returns {Promise} - Promesa con las citas filtradas
     */
    filtrarCitas: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();

            // Agregar solo los filtros que tengan valor
            Object.keys(filtros).forEach(key => {
                if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
                    params.append(key, filtros[key]);
                }
            });

            const response = await axios.get(`${GATEWAY_URL}/citas/filtros?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error al filtrar citas:', error);
            throw error;
        }
    },

    /**
     * Obtener estadísticas de citas
     * @param {string} fecha_inicio - Fecha de inicio (YYYY-MM-DD)
     * @param {string} fecha_fin - Fecha de fin (YYYY-MM-DD)
     * @returns {Promise} - Promesa con las estadísticas
     */
    obtenerEstadisticas: async (fecha_inicio = null, fecha_fin = null) => {
        try {
            const params = new URLSearchParams();

            if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
            if (fecha_fin) params.append('fecha_fin', fecha_fin);

            const response = await axios.get(`${GATEWAY_URL}/citas/estadisticas?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    },

    /**
     * Obtener citas agrupadas por oficina
     * @param {string} fecha_inicio - Fecha de inicio (YYYY-MM-DD)
     * @param {string} fecha_fin - Fecha de fin (YYYY-MM-DD)
     * @returns {Promise} - Promesa con las citas por oficina
     */
    obtenerCitasPorOficina: async (fecha_inicio = null, fecha_fin = null) => {
        try {
            const params = new URLSearchParams();

            if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
            if (fecha_fin) params.append('fecha_fin', fecha_fin);

            const response = await axios.get(`${GATEWAY_URL}/citas/por-oficina?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas por oficina:', error);
            throw error;
        }
    },

    /**
     * Obtener opciones disponibles para los filtros
     * @returns {Promise} - Promesa con las opciones de filtro (oficinas, estados)
     */
    obtenerOpcionesFiltro: async () => {
        try {
            const response = await axios.get(`${GATEWAY_URL}/citas/opciones-filtro`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener opciones de filtro:', error);
            throw error;
        }
    }
};

export default filtrosCitasService;