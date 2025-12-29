// react-app/src/pages/LoginAdmin.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, verify2FA, resendCode } from '../services/authService';
import './LoginAdmin.css';

function LoginAdmin() {
    const navigate = useNavigate();

    // Estados del flujo
    const [step, setStep] = useState('login'); // 'login' | 'verify'
    const [loading, setLoading] = useState(false);

    // Datos del login
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');

    // Datos del 2FA
    const [id_usuario, setIdUsuario] = useState(null);
    const [codigo, setCodigo] = useState('');
    const [correoUsuario, setCorreoUsuario] = useState('');

    // Errores
    const [error, setError] = useState('');

    /**
     * FASE 1: Login - Validar credenciales
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        const esAdmin = correo === 'acarpremier@gmail.com' ||
            correo === 'admin@carpremier.com' ||
            correo.endsWith('@carpremier.com');

        if (!esAdmin) {
            setError('Solo administradores pueden acceder a este panel');
            return;
        }

        setLoading(true);

        try {
            const response = await login(correo, password);

            // Si requiere 2FA
            if (response.requiresTwoFactor) {
                setIdUsuario(response.id_usuario);
                setCorreoUsuario(response.correo);
                setStep('verify');
                setError('');
            } else {
                // Login directo (no debería pasar si configuraste 2FA)
                guardarSesion(response);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    /**
     * FASE 2: Verificar código 2FA
     */
    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');

        if (codigo.length !== 6) {
            setError('El código debe tener 6 dígitos');
            return;
        }

        setLoading(true);

        try {
            const response = await verify2FA(id_usuario, codigo);

            // Verificar que sea admin
            if (response.rol !== 'admin') {
                setError('Acceso denegado: No tienes permisos de administrador');
                handleCancelVerification();
                return;
            }

            // Guardar sesión y redirigir
            guardarSesion(response);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message || 'Código inválido');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Reenviar código 2FA
     */
    const handleResend = async () => {
        setLoading(true);
        setError('');

        try {
            await resendCode(id_usuario);
            setError(''); // Limpiar error
            alert('Código reenviado exitosamente');
        } catch (err) {
            setError('Error al reenviar código');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cancelar verificación y volver al login
     */
    const handleCancelVerification = () => {
        setStep('login');
        setIdUsuario(null);
        setCorreoUsuario('');
        setCodigo('');
        setError('');
    };

    /**
     * Guardar datos de sesión
     */
    const guardarSesion = (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('rol', response.rol);

        if (response.usuario) {
            localStorage.setItem('usuario', JSON.stringify(response.usuario));
            localStorage.setItem('nombre', response.usuario.nombres || '');
            localStorage.setItem('apellido', response.usuario.apellidos || '');
            localStorage.setItem('correo', response.usuario.correo || '');
        }
    };

    return (
        <div className="login-admin-container">
            <div className="login-admin-card">
                {/* VISTA 1: LOGIN */}
                {step === 'login' && (
                    <>
                        <div className="login-admin-header">
                            <h1>🚗 CarPremier</h1>
                            <p>Panel de Administración</p>
                        </div>

                        <form onSubmit={handleLogin} className="login-admin-form">
                            {error && (
                                <div className="error-message">
                                    ❌ {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="correo">Correo Administrativo</label>
                                <input
                                    type="email"
                                    id="correo"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    placeholder="admin@carpremier.com"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Contraseña</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-login"
                                disabled={loading}
                            >
                                {loading ? 'Validando...' : 'Iniciar Sesión'}
                            </button>
                        </form>
                    </>
                )}

                {/* VISTA 2: VERIFICACIÓN 2FA */}
                {step === 'verify' && (
                    <>
                        <div className="login-admin-header">
                            <div className="icon-2fa">🔐</div>
                            <h1>Verificación en Dos Pasos</h1>
                            <p>Hemos enviado un código a:</p>
                            <p className="email-highlight">{correoUsuario}</p>
                        </div>

                        <form onSubmit={handleVerify} className="login-admin-form">
                            {error && (
                                <div className="error-message">
                                    ❌ {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="codigo">Código de Verificación</label>
                                <input
                                    type="text"
                                    id="codigo"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="code-input"
                                    maxLength="6"
                                    autoComplete="off"
                                    required
                                    disabled={loading}
                                    autoFocus
                                />
                                <small className="help-text">Ingresa el código de 6 dígitos</small>
                            </div>

                            <button
                                type="submit"
                                className="btn-login"
                                disabled={loading || codigo.length !== 6}
                            >
                                {loading ? 'Verificando...' : 'Verificar Código'}
                            </button>

                            <div className="verification-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleResend}
                                    disabled={loading}
                                >
                                    🔄 Reenviar Código
                                </button>
                                <button
                                    type="button"
                                    className="btn-link"
                                    onClick={handleCancelVerification}
                                >
                                    ← Volver al login
                                </button>
                            </div>

                            <div className="info-box">
                                <p>⚠️ El código expira en 5 minutos</p>
                            </div>
                        </form>
                    </>
                )}

                <div className="login-admin-footer">
                    <p>&copy; 2024 CarPremier. Panel de Administración</p>
                </div>
            </div>
        </div>
    );
}

export default LoginAdmin;