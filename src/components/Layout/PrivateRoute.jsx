import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';

const PrivateRoute = ({ children, requireAdmin = true }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Verificando permisos de acceso..." />;
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar si se requiere ser admin y el usuario no lo es
  if (requireAdmin && !isAdmin) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos de administrador para acceder a esta página.</p>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;