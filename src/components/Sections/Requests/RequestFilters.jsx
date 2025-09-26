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

const RequestFilters = ({
  searchTerm,
  onSearchChange,
  onSearch,
  statusFilter,
  onStatusFilterChange,
  assignmentFilter,
  onAssignmentFilterChange,
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
        {/* Búsqueda a la IZQUIERDA con anchura normal */}
        <Box sx={{ display: 'flex', gap: 1, width: 300 }}> {/* Anchura fija */}
          <TextField
            fullWidth
            label="Buscar por código o nombre"
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

        {/* Todo lo demás a la DERECHA */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          marginLeft: 'auto', // ← Empuja todo a la derecha
          flexWrap: 'wrap'
        }}>
          {/* Filtros */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={statusFilter}
              label="Estado"
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="PENDING">Pendiente</MenuItem>
              <MenuItem value="SCHEDULED">Programado</MenuItem>
              <MenuItem value="COLLECTED">Recolectado</MenuItem>
              <MenuItem value="CANCELLED">Cancelado</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Asignación</InputLabel>
            <Select
              value={assignmentFilter}
              label="Asignación"
              onChange={(e) => onAssignmentFilterChange(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="AVAILABLE">Disponible</MenuItem>
              <MenuItem value="PENDING">Pendiente</MenuItem>
              <MenuItem value="IN_PROGRESS">En progreso</MenuItem>
              <MenuItem value="COMPLETED">Completado</MenuItem>
              <MenuItem value="CANCELLED">Cancelado</MenuItem>
            </Select>
          </FormControl>

          {/* Botones */}
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

export default RequestFilters;