import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip
} from '@mui/material';
import RealMap from './RealMap'; // ← Importar el nuevo componente

const AssignmentMap = ({ assignments, selectedAssignment, onAssignmentSelect, availableRequests = [] }) => {
  
  // Combinar todas las ubicaciones para el mapa
  const allMapItems = [...assignments, ...availableRequests];

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Mapa de Asignaciones
        </Typography>
        <Chip 
          label={`${allMapItems.length} ubicaciones`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Usar el mapa real */}
      <RealMap
        assignments={assignments}
        availableRequests={availableRequests}
        selectedAssignment={selectedAssignment}
        onAssignmentSelect={onAssignmentSelect}
      />

      {/* Lista de asignaciones debajo del mapa */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Solicitudes en el Área ({allMapItems.length})
        </Typography>
        
        {allMapItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No hay solicitudes disponibles en el área
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
            {allMapItems.map((item) => (
              <Paper
                key={item.id}
                sx={{
                  p: 2,
                  mb: 1,
                  cursor: 'pointer',
                  border: selectedAssignment?.id === item.id ? '2px solid' : '1px solid',
                  borderColor: selectedAssignment?.id === item.id ? 'primary.main' : 'grey.300',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => onAssignmentSelect(item)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {item.material} - {item.code}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.address}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Usuario: {item.userName} {item.userLastname}
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={item.assignmentStatus || 'DISPONIBLE'}
                    color={
                      item.assignmentStatus === 'AVAILABLE' ? 'default' :
                      item.assignmentStatus === 'PENDING' ? 'warning' :
                      item.assignmentStatus === 'IN_PROGRESS' ? 'info' : 'success'
                    }
                    size="small"
                  />
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