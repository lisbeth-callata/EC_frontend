import api from './api';

export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      if (response.data.role !== 'ROLE_ADMIN') {
        throw new Error('Usuario no tiene permisos de administrador');
      }

      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      if (error.message.includes('permisos')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
      throw new Error(error.response?.data?.message || error.message || 'Error de autenticación');
    }
  },
  
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
  
  getCurrentUser: () => {
    try {
      const user = JSON.parse(localStorage.getItem('adminUser'));
      return user && user.role === 'ROLE_ADMIN' ? user : null;
    } catch (error) {
      return null;
    }
  },
  
  getToken: () => {
    return localStorage.getItem('adminToken');
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem('adminToken');
    const user = authService.getCurrentUser();
    return !!(token && user && user.role === 'ROLE_ADMIN');
  }
};