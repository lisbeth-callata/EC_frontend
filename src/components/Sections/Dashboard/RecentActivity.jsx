import React from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar
} from '@mui/material';
import {
  Recycling,
  CheckCircle,
  Pending,
  Schedule
} from '@mui/icons-material';
import { formatDate } from '../../../utils/helpers';

const RecentActivity = ({ recentRequests, loading }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Actividad Reciente
        </Typography>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Cargando actividad reciente...
          </Typography>
        </Box>
      </Paper>
    );
  }

  const getActivityIcon = (status) => {
    switch (status) {
      case 'COLLECTED': return <CheckCircle color="success" />;
      case 'PENDING': return <Pending color="warning" />;
      case 'SCHEDULED': return <Schedule color="info" />;
      default: return <Recycling color="action" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COLLECTED': return 'success';
      case 'PENDING': return 'warning';
      case 'SCHEDULED': return 'info';
      default: return 'default';
    }
  };

  const getActivityText = (request) => {
    const userName = `${request.userName} ${request.userLastname}`;
    const material = request.material.toLowerCase();
    
    switch (request.status) {
      case 'COLLECTED':
        return `${userName} completó recolección de ${material}`;
      case 'PENDING':
        return `${userName} solicitó recolección de ${material}`;
      case 'SCHEDULED':
        return `${userName} programó recolección de ${material}`;
      default:
        return `${userName} actualizó solicitud de ${material}`;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Actividad Reciente
      </Typography>
      
      {recentRequests.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Recycling sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No hay actividad reciente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Las nuevas solicitudes aparecerán aquí
          </Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {recentRequests.slice(0, 10).map((request, index) => (
            <ListItem key={request.id} divider={index < recentRequests.length - 1}>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                  {getActivityIcon(request.status)}
                </Avatar>
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" component="span">
                      {getActivityText(request)}
                    </Typography>
                    <Chip 
                      label={request.status.toLowerCase()}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(request.createdAt)} • {request.address || 'Sin ubicación'}
                  </Typography>
                }
              />
              
              <Chip 
                label={request.material}
                variant="outlined"
                size="small"
                sx={{ ml: 1 }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default RecentActivity;