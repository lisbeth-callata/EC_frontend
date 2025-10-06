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
  Tooltip
} from '@mui/material';
import {
  Edit,
  Delete,
  Assignment,
  LocationOn
} from '@mui/icons-material';
import { formatDate, formatWeight, capitalize } from '../../../utils/helpers';

const RequestTable = ({
  requests,
  onEdit,
  onDelete,
  onAssign,
  onViewLocation
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'COLLECTED': return 'success';
      case 'SCHEDULED': return 'info';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getAssignmentColor = (assignmentStatus) => {
    switch (assignmentStatus) {
      case 'AVAILABLE': return 'default';
      case 'PENDING': return 'warning';
      case 'IN_PROGRESS': return 'info';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      case 'EXPIRED': return 'error';
      default: return 'default';
    }
  };

  if (requests.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No hay solicitudes para mostrar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No se encontraron solicitudes con los filtros aplicados.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table sx={{ minWidth: 650 }} aria-label="tabla de solicitudes">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Código</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Material</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ubicación</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Asignación</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Peso (kg)</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow
              key={request.id}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <TableCell component="th" scope="row">
                <Typography variant="body2" fontWeight="bold">
                  {request.code}
                </Typography>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {request.userName} {request.userLastname}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {request.userEmail}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {request.material}
                </Typography>
                {request.description && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {request.description}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Tooltip title={request.address || 'Sin ubicación'} arrow>
                  <IconButton
                    size="small"
                    onClick={() => onViewLocation(request)}
                    disabled={!request.address}
                  >
                    <LocationOn color={request.address ? "primary" : "disabled"} />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(request.createdAt)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={capitalize(request.status?.toLowerCase() || 'PENDIENTE')}
                  color={getStatusColor(request.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={capitalize(request.assignmentStatus?.toLowerCase() || 'DISPONIBLE')}
                  color={getAssignmentColor(request.assignmentStatus)}
                  size="small"
                  variant={request.assignmentStatus === 'AVAILABLE' ? 'outlined' : 'filled'}
                />
                {request.assignedCollectorName && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {request.assignedCollectorName}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {formatWeight(request.weight)}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Editar solicitud">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(request)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Asignar recolector disponible">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onAssign(request)}
                      disabled={request.assignmentStatus !== 'AVAILABLE'}
                    >
                      <Assignment />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Eliminar solicitud">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(request)}
                    >
                      <Delete />
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

export default RequestTable;