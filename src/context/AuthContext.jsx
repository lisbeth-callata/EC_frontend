import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verificar autenticación al inicializar
  const checkAuth = useCallback(async () => {
    try {
      const savedUser = authService.getCurrentUser();
      
      if (savedUser && authService.getToken()) {
        // Verificar si el token es válido y el usuario es admin
        if (savedUser.role === 'ROLE_ADMIN') {
          setUser(savedUser);
        } else {
          // Usuario no es admin - limpiar datos
          console.warn('Usuario no administrador intentando acceder:', savedUser.email);
          authService.logout();
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      authService.logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username, password) => {
    try {
      setError('');
      setLoading(true);

      const userData = await authService.login(username, password);
      
      // VERIFICACIÓN CRÍTICA: Solo permitir administradores
      if (userData.role === 'ROLE_ADMIN') {
        setUser(userData);
        return { success: true, data: userData };
      } else {
        // Usuario no es administrador - limpiar inmediatamente
        authService.logout();
        return { 
          success: false, 
          error: 'Acceso denegado. Solo el personal administrativo autorizado puede acceder a este panel.' 
        };
      }
    } catch (error) {
      const errorMessage = error.message || 'Error en el inicio de sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError('');
  };

  const clearError = () => setError('');

  // Función para verificar permisos específicos
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    return user.role === requiredRole;
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    hasPermission,
    isAuthenticated: !!user && user.role === 'ROLE_ADMIN', // Solo true si es admin
    isAdmin: !!user && user.role === 'ROLE_ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};