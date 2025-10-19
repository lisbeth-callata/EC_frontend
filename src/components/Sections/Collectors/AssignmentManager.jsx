import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Card,
  CardContent,
  Avatar,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Pending,
  LocationOn,
  Person,
  TrendingUp,
  AccessTime,
  Email,
  Phone
} from '@mui/icons-material';
import { formatDate, formatWeight } from '../../../utils/helpers';

const AssignmentManager = ({ 
  collector, 
  assignments, 
  availableRequests,
  onAssign,
  onUnassign,
  onComplete 
}) => {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const currentAssignments = assignments.filter(a => 
    a.assignmentStatus === 'PENDING' || a.assignmentStatus === 'IN_PROGRESS'
  );

  const completedAssignments = assignments.filter(a => 
    a.assignmentStatus === 'COMPLETED'
  );

  const handleAssign = (request) => {
    if (collector && request) {
      onAssign(collector.id, request.id);
      setSelectedRequest(null);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'COMPLETED': 
        return { icon: <CheckCircle />, color: 'success', label: 'Completado' };
      case 'IN_PROGRESS': 
        return { icon: <AccessTime />, color: 'info', label: 'En Progreso' };
      case 'PENDING': 
        return { icon: <Pending />, color: 'warning', label: 'Pendiente' };
      default: 
        return { icon: <Assignment />, color: 'default', label: 'Asignado' };
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      
      {/* TARJETA DE RECOLECTOR - MEJOR ORGANIZADA */}
      <Paper sx={{ p: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person /> Recolector Asignado
        </Typography>
        
        {collector ? (
          <Box>
            {/* Información principal del recolector */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                }}
              >
                {collector.name?.charAt(0)}{collector.lastname?.charAt(0)}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {collector.name} {collector.lastname}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {collector.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {collector.phone || 'Sin teléfono'}
                    </Typography>
                  </Box>
                </Box>
                
                <Chip 
                  label={currentAssignments.length > 0 ? 'En ruta' : 'Disponible'}
                  color={currentAssignments.length > 0 ? 'warning' : 'success'}
                  size="medium"
                  sx={{ mt: 1, fontWeight: 'bold' }}
                />
              </Box>
            </Box>

            {/* Estadísticas del recolector */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2, backgroundColor: 'primary.light', color: 'white' }}>
                  <CardContent sx={{ p: '8px !important' }}>
                    <Typography variant="h5" fontWeight="bold">
                      {currentAssignments.length}
                    </Typography>
                    <Typography variant="body2">
                      Asignaciones Activas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2, backgroundColor: 'info.light', color: 'white' }}>
                  <CardContent sx={{ p: '8px !important' }}>
                    <Typography variant="h5" fontWeight="bold">
                      {currentAssignments.filter(a => a.assignmentStatus === 'PENDING').length}
                    </Typography>
                    <Typography variant="body2">
                      Pendientes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2, backgroundColor: 'warning.light', color: 'white' }}>
                  <CardContent sx={{ p: '8px !important' }}>
                    <Typography variant="h5" fontWeight="bold">
                      {currentAssignments.filter(a => a.assignmentStatus === 'IN_PROGRESS').length}
                    </Typography>
                    <Typography variant="body2">
                      En Progreso
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', p: 2, backgroundColor: 'success.light', color: 'white' }}>
                  <CardContent sx={{ p: '8px !important' }}>
                    <Typography variant="h5" fontWeight="bold">
                      {completedAssignments.length}
                    </Typography>
                    <Typography variant="body2">
                      Completadas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Alert severity="info" icon={<Person />}>
            Selecciona un recolector para gestionar sus asignaciones
          </Alert>
        )}
      </Paper>

      {/* SOLICITUDES DISPONIBLES */}
      <Paper sx={{ p: 3, flex: 1 }} elevation={2}>
        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assignment /> Solicitudes Disponibles ({availableRequests.length})
        </Typography>
        
        {availableRequests.length === 0 ? (
          <Alert severity="info">
            No hay solicitudes disponibles en este momento
          </Alert>
        ) : (
          <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
            <Grid container spacing={1}>
              {availableRequests.slice(0, 5).map((request) => (
                <Grid item xs={12} key={request.id}>
                  <Card
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: selectedRequest?.id === request.id ? '2px solid' : '1px solid',
                      borderColor: selectedRequest?.id === request.id ? 'primary.main' : 'grey.200',
                      backgroundColor: selectedRequest?.id === request.id ? 'primary.light' : 'white',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ListItemIcon sx={{ minWidth: 'auto' }}>
                        <LocationOn color="primary" />
                      </ListItemIcon>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {request.material}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {request.address}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.userName} {request.userLastname}
                        </Typography>
                      </Box>
                      <Chip 
                        label="DISPONIBLE"
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {selectedRequest && collector && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<Assignment />}
                onClick={() => handleAssign(selectedRequest)}
                sx={{ mt: 2 }}
                size="large"
              >
                Asignar a {collector.name}
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* ASIGNACIONES ACTIVAS */}
      <Paper sx={{ p: 3, flex: 1 }} elevation={2}>
        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp /> Asignaciones Activas ({currentAssignments.length})
        </Typography>
        
        {currentAssignments.length === 0 ? (
          <Alert severity="info">
            No hay asignaciones activas en este momento
          </Alert>
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {currentAssignments.map((assignment, index) => {
              const statusConfig = getStatusConfig(assignment.assignmentStatus);
              return (
                <React.Fragment key={assignment.id}>
                  <ListItem sx={{ px: 0 }}>
                    <Card sx={{ width: '100%', p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ListItemIcon sx={{ minWidth: 'auto', color: `${statusConfig.color}.main` }}>
                          {statusConfig.icon}
                        </ListItemIcon>
                        
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {assignment.material}
                            </Typography>
                            <Chip 
                              label={statusConfig.label}
                              color={statusConfig.color}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary" display="block">
                            📍 {assignment.address}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            🕒 {formatDate(assignment.createdAt)} • ⚖️ {formatWeight(assignment.weight)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => onComplete(assignment.id)}
                            disabled={assignment.assignmentStatus === 'COMPLETED'}
                            startIcon={<CheckCircle />}
                          >
                            Completar
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => onUnassign(assignment.id)}
                          >
                            Liberar
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  </ListItem>
                  {index < currentAssignments.length - 1 && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default AssignmentManager;