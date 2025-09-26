import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Box,
  Typography,
  Tooltip,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  Assignment,
  Directions,
  Phone,
  Email
} from '@mui/icons-material';
import { formatDate } from '../../../utils/helpers';

const CollectorTable = ({ 
  collectors, 
  onViewDetail, 
  onAssign,
  onContact 
}) => {
  const getStatusColor = (assignments, isActive) => {
    if (!isActive) return 'default';
    if (assignments > 0) return 'warning';
    return 'success';
  };

  const getStatusText = (assignments, isActive) => {
    if (!isActive) return 'Inactivo';
    if (assignments > 0) return `En ruta (${assignments})`;
    return 'Disponible';
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 80) return 'success';
    if (performance >= 60) return 'warning';
    return 'error';
  };

  if (collectors.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No hay recolectores registrados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Los recolectores aparecerán aquí una vez que sean creados.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table sx={{ minWidth: 650 }} aria-label="tabla de recolectores">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Recolector</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contacto</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Asignaciones</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rendimiento</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Última Actividad</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {collectors.map((collector) => (
            <TableRow 
              key={collector.id}
              sx={{ 
                '&:last-child td, &:last-child th': { border: 0 },
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: collector.isActive ? 'primary.main' : 'grey.400',
                      width: 40,
                      height: 40
                    }}
                  >
                    {collector.name?.charAt(0)}{collector.lastname?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {collector.name} {collector.lastname}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      @{collector.username}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2">
                      {collector.phone || 'No registrado'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2">
                      {collector.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={getStatusText(collector.currentAssignments || 0, collector.isActive)}
                  color={getStatusColor(collector.currentAssignments || 0, collector.isActive)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment color="action" fontSize="small" />
                  <Typography variant="body2" fontWeight="medium">
                    {collector.currentAssignments || 0} / {collector.totalAssignments || 0}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={collector.performance || 0}
                    sx={{ 
                      flexGrow: 1,
                      height: 8,
                      borderRadius: 4
                    }}
                    color={getPerformanceColor(collector.performance || 0)}
                  />
                  <Typography variant="body2" fontWeight="medium">
                    {collector.performance || 0}%
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {collector.lastActivity ? formatDate(collector.lastActivity) : 'Sin actividad'}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Ver detalle">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => onViewDetail(collector)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Asignar solicitud">
                    <IconButton 
                      size="small" 
                      color="secondary"
                      onClick={() => onAssign(collector)}
                      disabled={!collector.isActive}
                    >
                      <Assignment />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Contactar">
                    <IconButton 
                      size="small" 
                      color="info"
                      onClick={() => onContact(collector)}
                    >
                      <Phone />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CollectorTable;