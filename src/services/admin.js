import api from './api';

export const adminService = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),

  // SOLICITUDES 
  getAllRequests: () => api.get('/requests'),
  searchRequests: (term) => api.get(`/requests/search?term=${term}`),
  getRequestById: (id) => api.get(`/requests/${id}`),
  deleteRequest: (id) => api.delete(`/requests/${id}`),
  
  // CREAR SOLICITUD 
  createRequest: async (requestData, userId) => {
    console.log('📤 Enviando solicitud al backend...');
    console.log('📋 Datos recibidos:', requestData);
    console.log('👤 User ID:', userId);
    
    const requestPayload = {
      material: requestData.material,
      description: requestData.description || '',
      latitude: requestData.latitude,
      longitude: requestData.longitude,
      address: requestData.address,
      district: requestData.district || '',
      province: requestData.province || '',
      region: requestData.region || '',
      addressUser: requestData.addressUser || '',
      reference: requestData.reference || '',
      status: 'PENDING',
      assignmentStatus: 'AVAILABLE'
    };

    if (!requestPayload.material) {
      throw new Error('El material es requerido');
    }
    if (!requestPayload.latitude || !requestPayload.longitude) {
      throw new Error('La ubicación es requerida');
    }
    if (!requestPayload.address) {
      throw new Error('La dirección es requerida');
    }

    console.log('🎯 Payload normalizado:', requestPayload);
    console.log('🔗 URL:', `/requests?userId=${userId}`);

    try {
      const response = await api.post(`/requests?userId=${userId}`, requestPayload);
      console.log('✅ Solicitud creada exitosamente:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error en createRequest:', error);
      console.error('📋 Error response:', error.response?.data);
      throw error;
    }
  },

  // ACTUALIZAR SOLICITUD
  updateRequest: (id, data) => {
    const updatePayload = {
      material: data.material,
      description: data.description || '',
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      district: data.district || '',
      province: data.province || '',
      region: data.region || '',
      addressUser: data.addressUser || '',
      reference: data.reference || '',
      status: data.status || 'PENDING',
      weight: data.weight || null
    };
    
    return api.put(`/requests/${id}`, updatePayload);
  },

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