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
  Avatar
} from '@mui/material';
import {
  Edit,
  Delete,
  Email,
  Phone,
  Recycling
} from '@mui/icons-material';
import { formatDate } from '../../../utils/helpers';

const UserTable = ({ 
  users, 
  onEdit, 
  onDelete,
  activeTab 
}) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'error';
      case 'ROLE_COLLECTOR': return 'warning';
      case 'ROLE_USER': return 'primary';
      default: return 'default';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Administrador';
      case 'ROLE_COLLECTOR': return 'Recolector';
      case 'ROLE_USER': return 'Usuario';
      default: return role;
    }
  };

  const getInitials = (name, lastname) => {
    return `${name?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

  if (users.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No hay usuarios para mostrar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {activeTab === 0 ? 'No se encontraron usuarios en el sistema.' :
           activeTab === 1 ? 'No hay usuarios con solicitudes activas.' :
           'Todos los usuarios tienen al menos una solicitud.'}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table sx={{ minWidth: 650 }} aria-label="tabla de usuarios">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contacto</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rol</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha Registro</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Solicitudes</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id}
              sx={{ 
                '&:last-child td, &:last-child th': { border: 0 },
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40
                    }}
                  >
                    {getInitials(user.name, user.lastname)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {user.name} {user.lastname}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      @{user.username}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                  </Box>
                  {user.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">
                        {user.phone}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={getRoleText(user.role)}
                  color={getRoleColor(user.role)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(user.createdAt)}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Recycling color="action" fontSize="small" />
                  <Typography variant="body2" fontWeight="medium">
                    {user.requests ? user.requests.length : 0}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={user.requests && user.requests.length > 0 ? 'Activo' : 'Inactivo'}
                  color={user.requests && user.requests.length > 0 ? 'success' : 'default'}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Editar usuario">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => onEdit(user)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Eliminar usuario">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => onDelete(user)}
                      disabled={user.role === 'ROLE_ADMIN'} // No permitir eliminar admins
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

export default UserTable;