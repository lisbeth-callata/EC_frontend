import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Assignment,
  Scale,
  TrendingUp,
  Schedule,
  CheckCircle
} from '@mui/icons-material';
import { formatDate, formatWeight } from '../../../utils/helpers';

const CollectorDetail = ({ open, onClose, collector, assignments }) => {
  if (!collector) return null;

  const stats = [
    {
      icon: <Assignment />,
      label: 'Total Asignaciones',
      value: collector.totalAssignments || 0,
      color: 'primary'
    },
    {
      icon: <CheckCircle />,
      label: 'Completadas',
      value: collector.completedAssignments || 0,
      color: 'success'
    },
    {
      icon: <Scale />,
      label: 'Peso Total',
      value: formatWeight(collector.totalWeight || 0),
      color: 'warning'
    },
    {
      icon: <TrendingUp />,
      label: 'Rendimiento',
      value: `${collector.performance || 0}%`,
      color: 'info'
    }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              width: 50,
              height: 50
            }}
          >
            {collector.name?.charAt(0)}{collector.lastname?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {collector.name} {collector.lastname}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Recolector - {collector.isActive ? 'Activo' : 'Inactivo'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Información personal */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Información Personal
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText 
                    primary="Nombre completo" 
                    secondary={`${collector.name} ${collector.lastname}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Email /></ListItemIcon>
                  <ListItemText primary="Email" secondary={collector.email} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Phone /></ListItemIcon>
                  <ListItemText 
                    primary="Teléfono" 
                    secondary={collector.phone || 'No registrado'} 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Estadísticas */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Estadísticas de Rendimiento
              </Typography>
              <Grid container spacing={2}>
                {stats.map((stat, index) => (
                  <Grid item xs={6} key={index}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Box sx={{ color: `${stat.color}.main`, mb: 1 }}>
                        {stat.icon}
                      </Box>
                      <Typography variant="h5" fontWeight="bold">
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              
              <LinearProgress 
                variant="determinate" 
                value={collector.performance || 0}
                sx={{ mt: 2, height: 10, borderRadius: 5 }}
                color={
                  (collector.performance || 0) >= 80 ? 'success' :
                  (collector.performance || 0) >= 60 ? 'warning' : 'error'
                }
              />
            </Paper>
          </Grid>

          {/* Asignaciones actuales */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Asignaciones Actuales ({assignments.length})
              </Typography>
              
              {assignments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No hay asignaciones activas
                </Typography>
              ) : (
                <List>
                  {assignments.map((assignment, index) => (
                    <React.Fragment key={assignment.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Schedule color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                {assignment.material}
                              </Typography>
                              <Chip 
                                label={assignment.status} 
                                size="small" 
                                color={
                                  assignment.status === 'COLLECTED' ? 'success' :
                                  assignment.status === 'PENDING' ? 'warning' : 'info'
                                }
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption">
                                {assignment.address}
                              </Typography>
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(assignment.createdAt)} • {formatWeight(assignment.weight)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < assignments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default CollectorDetail;