import api from './api';

export const adminService = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),

  // SOLICITUDES - Endpoints corregidos según tu backend
  getAllRequests: () => api.get('/requests'),
  searchRequests: (term) => api.get(`/requests/search?term=${term}`),
  getRequestById: (id) => api.get(`/requests/${id}`),

  // IMPORTANTE: Según tu backend, updateRequest usa PUT en /api/requests/{id}
  updateRequest: (id, data) => api.put(`/requests/${id}`, data),

  // IMPORTANTE: Según tu backend, deleteRequest usa DELETE en /api/requests/{id}
  deleteRequest: (id) => api.delete(`/requests/${id}`),

  // Usuarios
  getAllUsers: () => api.get('/admin/users'),
  searchUsers: (term) => api.get(`/admin/users/search?term=${term}`),
  getUsersWithRequests: () => api.get('/admin/users/with-requests'),
  getUsersWithoutRequests: () => api.get('/admin/users/without-requests'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Pesos
  getUserWeights: () => api.get('/admin/weights'),
  getWeightStats: () => api.get('/admin/weights/stats'),

  // RECOLECTORES
  getAllCollectors: () => api.get('/admin/users/role/ROLE_COLLECTOR'),
  getCollectorDetail: (id) => api.get(`/admin/users/${id}`),
  getCollectorAssignments: (collectorId) => api.get(`/api/assignments/collector/${collectorId}`),
  getCollectorStats: (collectorId) => api.get(`/api/collector/stats/${collectorId}`),
  
  // ASIGNACIONES
  getAvailableRequests: () => api.get('/api/requests/available'),
  assignRequestToCollector: (requestId, collectorData) => api.post(`/api/assignments/claim/${requestId}`, collectorData),
  unassignRequest: (requestId) => api.post(`/api/assignments/release/${requestId}`),
  completeRequest: (requestId) => api.post(`/api/assignments/complete/${requestId}`),
  updateRequestStatus: (requestId, status, weight) => api.patch(`/api/collector/requests/${requestId}?status=${status}&weight=${weight}`),
  
  // DASHBOARD RECOLECTOR
  getCollectorDashboard: () => api.get('/api/collector/dashboard'),
};