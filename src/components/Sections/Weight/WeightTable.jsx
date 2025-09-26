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
  Box,
  Typography,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Scale,
  TrendingUp,
  EmojiEvents,
  Recycling
} from '@mui/icons-material';
import { formatWeight } from '../../../utils/helpers';

const WeightTable = ({ 
  weightData,
  totalWeight 
}) => {
  const getRankColor = (index) => {
    switch (index) {
      case 0: return '#FFD700'; // Oro
      case 1: return '#C0C0C0'; // Plata
      case 2: return '#CD7F32'; // Bronce
      default: return 'default';
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <EmojiEvents sx={{ color: '#FFD700' }} />;
      case 1: return <EmojiEvents sx={{ color: '#C0C0C0' }} />;
      case 2: return <EmojiEvents sx={{ color: '#CD7F32' }} />;
      default: return <Typography variant="body2">{index + 1}°</Typography>;
    }
  };

  const getPercentage = (userWeight) => {
    if (totalWeight === 0) return 0;
    return (userWeight / totalWeight) * 100;
  };

  if (weightData.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No hay datos de peso para mostrar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aún no se han registrado pesos de materiales reciclados.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table sx={{ minWidth: 650 }} aria-label="tabla de pesos">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '60px' }}>#</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Solicitudes</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Peso Total</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Porcentaje</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Progreso</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {weightData.map((user, index) => (
            <TableRow 
              key={user.userId}
              sx={{ 
                '&:last-child td, &:last-child th': { border: 0 },
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getRankIcon(index)}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: getRankColor(index),
                      width: 40,
                      height: 40
                    }}
                  >
                    {user.userName?.charAt(0)}{user.userLastname?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {user.userName} {user.userLastname}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.userEmail}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Recycling color="action" fontSize="small" />
                  <Typography variant="body2" fontWeight="medium">
                    {user.totalRequests}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Scale color="primary" fontSize="small" />
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {formatWeight(user.totalWeight)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={`${getPercentage(user.totalWeight).toFixed(1)}%`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={getPercentage(user.totalWeight)}
                    sx={{ 
                      flexGrow: 1,
                      height: 8,
                      borderRadius: 4
                    }}
                  />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WeightTable;