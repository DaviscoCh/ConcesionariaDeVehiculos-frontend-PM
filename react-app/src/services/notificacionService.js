// src/services/notificacionService.js

const API_URL = 'http://localhost:3000/api/notificaciones';

// Obtener todas las notificaciones del admin
export const obtenerNotificacionesAdmin = async () => {
    try {
        const response = await fetch(`${API_URL}/admin`);
        if (!response.ok) throw new Error('Error al obtener notificaciones');
        return await response.json();
    } catch (error) {
        console.error('Error en obtenerNotificacionesAdmin:', error);
        throw error;
    }
};

// Obtener contador de notificaciones no leídas
export const obtenerContadorNoLeidas = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/contador`);
        if (!response.ok) throw new Error('Error al obtener contador');
        const data = await response.json();
        return data.total;
    } catch (error) {
        console.error('Error en obtenerContadorNoLeidas:', error);
        throw error;
    }
};

// Marcar una notificación como leída
export const marcarComoLeida = async (id) => {
    try {
        const response = await fetch(`${API_URL}/admin/${id}/leida`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Error al marcar como leída');
        return await response.json();
    } catch (error) {
        console.error('Error en marcarComoLeida:', error);
        throw error;
    }
};

// Marcar todas las notificaciones como leídas
export const marcarTodasComoLeidas = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/marcar-todas-leidas`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Error al marcar todas como leídas');
        return await response.json();
    } catch (error) {
        console.error('Error en marcarTodasComoLeidas:', error);
        throw error;
    }
};

// Eliminar una notificación
export const eliminarNotificacion = async (id) => {
    try {
        const response = await fetch(`${API_URL}/admin/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Error al eliminar notificación');
        return await response.json();
    } catch (error) {
        console.error('Error en eliminarNotificacion:', error);
        throw error;
    }
};