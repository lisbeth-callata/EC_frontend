import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Pending,
  Schedule,
  LocationOn
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle color="success" />;
      case 'IN_PROGRESS': return <Schedule color="info" />;
      case 'PENDING': return <Pending color="warning" />;
      default: return <Assignment color="action" />;
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Recolector actual */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Recolector Asignado
          </Typography>
          
          {collector ? (
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                {collector.name?.charAt(0)}{collector.lastname?.charAt(0)}
              </Box>
              
              <Typography variant="h6" fontWeight="bold">
                {collector.name} {collector.lastname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {collector.phone || 'Sin teléfono'}
              </Typography>
              
              <Chip 
                label={currentAssignments.length > 0 ? 'En ruta' : 'Disponible'}
                color={currentAssignments.length > 0 ? 'warning' : 'success'}
                sx={{ mt: 1 }}
              />
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Asignaciones activas:</strong> {currentAssignments.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Completadas hoy:</strong> {completedAssignments.length}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Alert severity="info">
              Selecciona un recolector para gestionar sus asignaciones
            </Alert>
          )}
        </Paper>

        {/* Solicitudes disponibles */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Solicitudes Disponibles
          </Typography>
          
          {availableRequests.length === 0 ? (
            <Alert severity="info">
              No hay solicitudes disponibles
            </Alert>
          ) : (
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {availableRequests.slice(0, 5).map((request, index) => (
                <React.Fragment key={request.id}>
                  <ListItem 
                    button 
                    selected={selectedRequest?.id === request.id}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <ListItemIcon>
                      <LocationOn color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={request.material}
                      secondary={
                        <Typography variant="caption">
                          {request.address}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < availableRequests.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
          
          {selectedRequest && collector && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<Assignment />}
              onClick={() => handleAssign(selectedRequest)}
              sx={{ mt: 2 }}
            >
              Asignar a {collector.name}
            </Button>
          )}
        </Paper>
      </Grid>

      {/* Asignaciones actuales */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Asignaciones Activas ({currentAssignments.length})
          </Typography>
          
          {currentAssignments.length === 0 ? (
            <Alert severity="info">
              No hay asignaciones activas
            </Alert>
          ) : (
            <List>
              {currentAssignments.map((assignment, index) => (
                <React.Fragment key={assignment.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getStatusIcon(assignment.assignmentStatus)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight="bold">
                            {assignment.material}
                          </Typography>
                          <Chip 
                            label={assignment.assignmentStatus} 
                            size="small"
                            color={
                              assignment.assignmentStatus === 'COMPLETED' ? 'success' :
                              assignment.assignmentStatus === 'IN_PROGRESS' ? 'info' : 'warning'
                            }
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {assignment.address}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(assignment.createdAt)} • {formatWeight(assignment.weight)}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        color="info"
                        onClick={() => onComplete(assignment.id)}
                        disabled={assignment.assignmentStatus === 'COMPLETED'}
                      >
                        Completar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => onUnassign(assignment.id)}
                      >
                        Liberar
                      </Button>
                    </Box>
                  </ListItem>
                  {index < currentAssignments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Historial reciente */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Historial de Hoy ({completedAssignments.length})
          </Typography>
          
          {completedAssignments.length === 0 ? (
            <Alert severity="info">
              No hay actividades completadas hoy
            </Alert>
          ) : (
            <List sx={{ maxHeight: 200, overflow: 'auto' }}>
              {completedAssignments.map((assignment, index) => (
                <React.Fragment key={assignment.id}>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={assignment.material}
                      secondary={
                        <Typography variant="caption">
                          {assignment.address} • {formatWeight(assignment.weight)} • {formatDate(assignment.updatedAt)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < completedAssignments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AssignmentManager;