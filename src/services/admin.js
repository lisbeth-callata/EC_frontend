import api from './api';

// En adminService.js - DEJAR SOLO UNA VERSIÓN de cada método:

export const adminService = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),

  // SOLICITUDES
  getAllRequests: () => api.get('/requests'),
  searchRequests: (term) => api.get(`/requests/search?term=${term}`),
  getRequestById: (id) => api.get(`/requests/${id}`),
  updateRequest: (id, data) => api.put(`/requests/${id}`, data),
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
  getCollectorAssignments: (collectorId) => api.get(`/assignments/collector/${collectorId}`),

  // ASIGNACIONES
  getAvailableRequests: () => api.get('/requests/available'),
  getAvailableRequestsForAssignment: () => api.get('/assignments/available'),
  assignRequestToCollector: (requestId, collectorData) => 
    api.post(`/assignments/claim/${requestId}`, collectorData),
  unassignRequest: (requestId) => api.post(`/assignments/release/${requestId}`),
  completeRequest: (requestId) => api.post(`/assignments/complete/${requestId}`),
  updateRequestStatus: (requestId, status, weight) => 
    api.patch(`/collector/requests/${requestId}?status=${status}&weight=${weight}`),
  
  // DASHBOARD RECOLECTOR
  getCollectorDashboard: () => api.get('/collector/dashboard'),

  // Obtener estadísticas reales de recolectores (SOLO UNA VERSIÓN)
  getCollectorRealStats: async (collectorId) => {
    try {
      const assignmentsResponse = await api.get(`/assignments/collector/${collectorId}`);
      const assignments = assignmentsResponse.data || [];
      
      const totalAssignments = assignments.length;
      const completedAssignments = assignments.filter(a => 
        a.assignmentStatus === 'COMPLETED' || a.status === 'COLLECTED'
      ).length;
      
      const totalWeight = assignments
        .filter(a => a.weight)
        .reduce((sum, a) => sum + a.weight, 0);
      
      const performance = totalAssignments > 0 
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

      return {
        totalAssignments,
        completedAssignments,
        totalWeight: totalWeight || 0,
        performance,
        currentAssignments: assignments.filter(a => 
          a.assignmentStatus === 'PENDING' || a.assignmentStatus === 'IN_PROGRESS'
        ).length
      };
    } catch (error) {
      console.error('Error getting collector stats:', error);
      return {
        totalAssignments: 0,
        completedAssignments: 0,
        totalWeight: 0,
        performance: 0,
        currentAssignments: 0
      };
    }
  }
};