// Formatear fecha
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Formatear peso
export const formatWeight = (weight) => {
  if (!weight && weight !== 0) return '0 kg';
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(1)} ton`;
  }
  return `${weight.toFixed(1)} kg`;
};

// Calcular impacto ambiental
export const calculateEnvironmentalImpact = (weight) => {
  return {
    treesSaved: Math.round(weight / 5), // 5kg salva 1 árbol aproximadamente
    co2Reduction: Math.round(weight * 2.5), // 1kg reciclado = 2.5kg CO2 reducido
    energySaved: Math.round(weight * 10), // 1kg reciclado = 10 kWh ahorrados
    waterSaved: Math.round(weight * 100) // 1kg reciclado = 100 litros agua ahorrada
  };
};


// Capitalizar texto
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Formatear estado de solicitud
export const formatRequestStatus = (status) => {
  const statusMap = {
    'PENDING': 'Pendiente',
    'SCHEDULED': 'Programado',
    'COLLECTED': 'Recolectado',
    'CANCELLED': 'Cancelado'
  };
  return statusMap[status] || status;
};

// Formatear estado de asignación
export const formatAssignmentStatus = (status) => {
  const statusMap = {
    'AVAILABLE': 'Disponible',
    'PENDING': 'Pendiente',
    'IN_PROGRESS': 'En progreso',
    'COMPLETED': 'Completado',
    'CANCELLED': 'Cancelado',
    'EXPIRED': 'Expirado'
  };
  return statusMap[status] || status;
};

// Filtrar solicitudes por múltiples criterios
export const filterRequests = (requests, filters) => {
  return requests.filter(request => {
    // Filtro por búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        request.code.toLowerCase().includes(searchLower) ||
        request.userName.toLowerCase().includes(searchLower) ||
        request.userLastname.toLowerCase().includes(searchLower) ||
        request.material.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtro por estado
    if (filters.statusFilter && request.status !== filters.statusFilter) {
      return false;
    }

    // Filtro por asignación
    if (filters.assignmentFilter && request.assignmentStatus !== filters.assignmentFilter) {
      return false;
    }

    return true;
  });
};