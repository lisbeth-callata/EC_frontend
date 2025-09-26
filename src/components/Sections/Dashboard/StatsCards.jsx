import React from 'react';
import {
  Grid,
  Paper,
  Box,
  Typography,
  LinearProgress
} from '@mui/material';
import {
  Recycling,
  People,
  Scale,
  TrendingUp,
  RequestPage,
  Assignment
} from '@mui/icons-material';
import { formatWeight } from '../../../utils/helpers';

const StatsCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
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
      icon: <Recycling sx={{ fontSize: 40 }} />,
      value: stats.totalRequests || 0,
      label: 'Solicitudes Totales',
      color: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
      change: stats.requestsChange || 0,
      description: 'Total de solicitudes registradas'
    },
    {
      icon: <RequestPage sx={{ fontSize: 40 }} />,
      value: stats.todayRequests || 0,
      label: 'Solicitudes Hoy',
      color: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      change: stats.todayChange || 0,
      description: 'Solicitudes del día actual'
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      value: stats.totalUsers || 0,
      label: 'Usuarios Registrados',
      color: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)',
      change: stats.usersChange || 0,
      description: 'Total de usuarios en el sistema'
    },
    {
      icon: <Scale sx={{ fontSize: 40 }} />,
      value: formatWeight(stats.totalWeight || 0),
      label: 'Peso Total Recolectado',
      color: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
      change: stats.weightChange || 0,
      description: 'Total de materiales reciclados'
    },
    {
      icon: <Assignment sx={{ fontSize: 40 }} />,
      value: stats.pendingRequests || 0,
      label: 'Solicitudes Pendientes',
      color: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
      change: stats.pendingChange || 0,
      description: 'Solicitudes por atender'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      value: `${stats.efficiency || 0}%`,
      label: 'Eficiencia del Sistema',
      color: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
      change: stats.efficiencyChange || 0,
      description: 'Tasa de completitud'
    }
  ];

 
  const getChangeIcon = (change) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  return (
    <Grid container spacing={3}>
      {statCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              background: card.color,
              color: 'white',
              minHeight: '160px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
            elevation={2}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {card.value}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {card.label}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', p: 1 }}>
                {card.icon}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {card.description}
              </Typography>
              {card.change !== 0 && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.3)', 
                    px: 1, 
                    borderRadius: 1,
                    fontWeight: 'bold'
                  }}
                >
                  {getChangeIcon(card.change)} {Math.abs(card.change)}%
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;