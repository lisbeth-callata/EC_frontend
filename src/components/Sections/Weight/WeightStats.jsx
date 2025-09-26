import React from 'react';
import {
  Paper,
  Grid,
  Box,
  Typography,
  LinearProgress
} from '@mui/material';
import {
  Scale,
  People,
  TrendingUp,
  EmojiEvents
} from '@mui/icons-material';
import { formatWeight } from '../../../utils/helpers';

const WeightStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <LinearProgress />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  const statCards = [
    {
      icon: <Scale sx={{ fontSize: 40 }} />,
      value: formatWeight(stats.totalWeight || 0),
      label: 'Peso Total Recolectado',
      color: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
      description: 'Total de materiales reciclados'
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      value: stats.totalUsers || 0,
      label: 'Usuarios Activos',
      color: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      description: 'Usuarios que han reciclado'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      value: `${stats.averageWeight ? stats.averageWeight.toFixed(1) : 0} kg`,
      label: 'Promedio por Usuario',
      color: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)',
      description: 'Peso promedio por usuario'
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40 }} />,
      value: stats.topUser ? `${stats.topUser.userName} ${stats.topUser.userLastname}` : 'N/A',
      label: 'Usuario Top',
      color: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
      description: 'Mayor contribuidor'
    }
  ];

  return (
    <Grid container spacing={3}>
      {statCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              background: card.color,
              color: 'white',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ mb: 1 }}>
              {card.icon}
            </Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {card.value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {card.label}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, mt: 1 }}>
              {card.description}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default WeightStats;