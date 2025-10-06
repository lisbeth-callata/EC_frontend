import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Chip
} from '@mui/material';
import {
  LocationOn,
  Schedule
} from '@mui/icons-material';

const AssignmentMap = ({ assignments, selectedAssignment, onAssignmentSelect }) => {
  // Componente placeholder para el mapa (en producción usarías Google Maps o Leaflet)
  const renderMapPlaceholder = () => (
    <Box sx={{ 
      height: 400, 
      bgcolor: 'grey.100', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      borderRadius: 1,
      border: '2px dashed grey.300'
    }}>
      <LocationOn sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Mapa Interactivo
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        En una implementación completa, aquí verías un mapa<br />
        con las ubicaciones de las solicitudes y recolectores.
      </Typography>
      <Button variant="outlined" sx={{ mt: 2 }}>
        Ver en Google Maps
      </Button>
    </Box>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'default';
      case 'PENDING': return 'warning';
      case 'IN_PROGRESS': return 'info';
      case 'COMPLETED': return 'success';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Mapa de Asignaciones
        </Typography>
        <Chip 
          label={`${assignments.length} solicitudes`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Mapa placeholder */}
      {renderMapPlaceholder()}

      {/* Lista de asignaciones debajo del mapa */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Solicitudes en el Área
        </Typography>
        
        {assignments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No hay solicitudes disponibles en el área
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
            {assignments.map((assignment) => (
              <Paper
                key={assignment.id}
                sx={{
                  p: 2,
                  mb: 1,
                  cursor: 'pointer',
                  border: selectedAssignment?.id === assignment.id ? '2px solid' : '1px solid',
                  borderColor: selectedAssignment?.id === assignment.id ? 'primary.main' : 'grey.300',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => onAssignmentSelect(assignment)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {assignment.material}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {assignment.address}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Schedule fontSize="small" />
                      <Typography variant="caption">
                        Creado: {new Date(assignment.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: 0.5 }}>
                    <Chip 
                      label={assignment.assignmentStatus || 'DISPONIBLE'}
                      color={getStatusColor(assignment.assignmentStatus)}
                      size="small"
                    />
                    {assignment.weight && (
                      <Typography variant="caption" fontWeight="bold">
                        {assignment.weight} kg
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default AssignmentMap;