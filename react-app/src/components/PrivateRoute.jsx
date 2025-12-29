// react-app/src/components/PrivateRoute.jsx

import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

function PrivateRoute({ children }) {
    // Verificar si el usuario está autenticado
    if (!isAuthenticated()) {
        // Redirigir al login si no está autenticado
        return <Navigate to="/admin/login" replace />;
    }

    // Si está autenticado, mostrar el componente
    return children;
}

export default PrivateRoute;