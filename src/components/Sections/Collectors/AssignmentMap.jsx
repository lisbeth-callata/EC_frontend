import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import { LocationOn, Person, Assignment } from '@mui/icons-material';
import RealMap from './RealMap';

const AssignmentMap = ({ assignments, selectedAssignment, onAssignmentSelect, availableRequests = [] }) => {
  
  const allMapItems = [...availableRequests];
  
  const getStatusColor = (item) => {
    if (item.assignmentStatus === 'COMPLETED' || item.status === 'COLLECTED') {
      return 'success';
    } else if (item.assignmentStatus === 'IN_PROGRESS') {
      return 'info'; 
    } else if (item.assignmentStatus === 'PENDING') {
      return 'warning';
    } else {
      return 'primary';
    }
  };

  const getStatusText = (item) => {
    if (item.assignmentStatus === 'COMPLETED' || item.status === 'COLLECTED') {
      return 'COMPLETADO';
    } else if (item.assignmentStatus === 'IN_PROGRESS') {
      return 'EN PROGRESO';
    } else if (item.assignmentStatus === 'PENDING') {
      return 'PENDIENTE';
    } else {
      return 'DISPONIBLE';
    }
  };

  const getStatusIcon = (item) => {
    if (item.assignmentStatus === 'COMPLETED' || item.status === 'COLLECTED') {
      return '✅';
    } else if (item.assignmentStatus === 'IN_PROGRESS') {
      return '🔄';
    } else {
      return '📦';
    }
  };

  // Función para acortar texto largo
  const shortenText = (text, maxLength = 25) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Paper sx={{ 
      p: 3, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%'
    }} elevation={2}>
      {/* Header del mapa */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn color="primary" /> 
          Mapa de Asignaciones
        </Typography>
        <Chip 
          icon={<Assignment />}
          label={`${allMapItems.length} ubicaciones`}
          color="primary"
          variant="filled"
        />
      </Box>

      {/* CONTENIDO PRINCIPAL - LAYOUT HORIZONTAL */}
      <Box sx={{ display: 'flex', gap: 3, flex: 1, minHeight: 500 }}>
        
        {/* LISTA DE SOLICITUDES - IZQUIERDA */}
        <Box sx={{ width: '40%', display: 'flex', flexDirection: 'column' }}> {/* Aumentado a 40% */}
          <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person /> Solicitudes en el Área ({allMapItems.length})
          </Typography>
          
          {allMapItems.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 3, backgroundColor: 'grey.50', flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  No hay solicitudes disponibles en el área
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 1,
              p: 1
            }}>
              {allMapItems.map((item) => (
                <Card
                  key={item.id}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    cursor: 'pointer',
                    border: selectedAssignment?.id === item.id ? '2px solid' : '1px solid',
                    borderColor: selectedAssignment?.id === item.id ? 'primary.main' : 'grey.200',
                    backgroundColor: selectedAssignment?.id === item.id ? 'primary.light' : 'white',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateY(-1px)'
                    }
                  }}
                  onClick={() => onAssignmentSelect(item)}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {/* Primera línea: Material y Estado */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getStatusIcon(item)} {item.material}
                      </Typography>
                      <Chip 
                        label={getStatusText(item)}
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          minWidth: 'auto',
                          backgroundColor: `${getStatusColor(item)}.light`,
                          color: `${getStatusColor(item)}.dark`,
                        }}
                      />
                    </Box>

                    {/* Segunda línea: Código y Dirección */}
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                      <strong>{item.code}</strong> • {shortenText(item.address, 30)}
                    </Typography>

                    {/* Tercera línea: Usuario */}
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                      {shortenText(`${item.userName} ${item.userLastname}`, 28)}
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* MAPA - DERECHA */}
        <Box sx={{ width: '60%', display: 'flex', flexDirection: 'column' }}> {/* Reducido a 60% */}
          <RealMap
            assignments={assignments}
            availableRequests={availableRequests}
            selectedAssignment={selectedAssignment}
            onAssignmentSelect={onAssignmentSelect}
          />
        </Box>

      </Box>
    </Paper>
  );
};

export default AssignmentMap;