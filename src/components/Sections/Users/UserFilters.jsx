import React from 'react';
import {
  Paper,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear
} from '@mui/icons-material';

const UserFilters = ({
  searchTerm,
  onSearchChange,
  onSearch,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters
}) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            alignItems: 'center',
            flexWrap: 'wrap' 
            }}>
              <Box sx={{ display: 'flex', gap: 1, width: 300 }}>
            <TextField
              fullWidth
              label="Buscar por nombre, email o teléfono"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              size="small"
            />
            <IconButton 
            onClick={onSearch} 
            color="primary"
            sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }}
          >
            <Search />
          </IconButton>
        </Box>

         <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          marginLeft: 'auto', // ← Empuja todo a la derecha
          flexWrap: 'wrap'
        }}>   
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Rol</InputLabel>
            <Select
              value={roleFilter}
              label="Filtrar por rol"
              onChange={(e) => onRoleFilterChange(e.target.value)}
            >
              <MenuItem value="">Todos los roles</MenuItem>
              <MenuItem value="ROLE_USER">Usuario</MenuItem>
              <MenuItem value="ROLE_COLLECTOR">Recolector</MenuItem>
              <MenuItem value="ROLE_ADMIN">Administrador</MenuItem>
            </Select>
          </FormControl>
        

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Actividad</InputLabel>
            <Select
              value={statusFilter}
              label="Estado de actividad"
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <MenuItem value="">Todos los estados</MenuItem>
              <MenuItem value="active">Usuarios activos</MenuItem>
              <MenuItem value="inactive">Usuarios inactivos</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={onSearch}
              size="small"
            >
              Filtrar
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Clear />}
              onClick={onClearFilters}
              size="small"
            >
              Limpiar
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default UserFilters;