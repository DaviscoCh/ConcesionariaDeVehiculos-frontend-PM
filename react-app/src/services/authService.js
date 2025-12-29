// react-app/src/services/authService.js

const API_URL = 'http://localhost:3000/api/usuario';

/**
 * Login - Fase 1: Validar credenciales y enviar código 2FA
 */
export const login = async (correo, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al iniciar sesión');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};

/**
 * Verificar código 2FA - Fase 2: Completar login
 */
export const verify2FA = async (id_usuario, codigo) => {
    try {
        const response = await fetch(`${API_URL}/verify-2fa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_usuario, codigo })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Código inválido');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en verify2FA:', error);
        throw error;
    }
};

/**
 * Reenviar código 2FA
 */
export const resendCode = async (id_usuario) => {
    try {
        const response = await fetch(`${API_URL}/resend-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_usuario })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al reenviar código');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en resendCode:', error);
        throw error;
    }
};

/**
 * Verificar si hay token válido
 */
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Verificar que sea admin
        if (payload.rol !== 'admin') {
            return false;
        }

        // Verificar que no haya expirado
        const exp = payload.exp * 1000;
        return exp > Date.now();
    } catch {
        return false;
    }
};

/**
 * Cerrar sesión
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    localStorage.removeItem('nombre');
    localStorage.removeItem('apellido');
    localStorage.removeItem('correo');
};

/**
 * Obtener datos del usuario autenticado
 */
export const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            id_usuario: payload.id_usuario,
            rol: payload.rol,
            correo: payload.correo
        };
    } catch {
        return null;
    }
};