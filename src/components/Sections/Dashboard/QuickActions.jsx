import React from 'react';
import {
  Paper,
  Grid,
  Button,
  Box,
  Typography
} from '@mui/material';
import {
  Add,
  People,
  Scale,
  Analytics,
  Download,
  Notifications
} from '@mui/icons-material';

const QuickActions = ({ onActionClick }) => {
  const actions = [
    {
      icon: <Add sx={{ fontSize: 24 }} />,
      label: 'Nueva Solicitud',
      description: 'Crear solicitud de recolección',
      color: 'primary',
      action: 'create-request'
    },
    {
      icon: <People sx={{ fontSize: 24 }} />,
      label: 'Gestionar Usuarios',
      description: 'Ver y editar usuarios',
      color: 'secondary',
      action: 'manage-users'
    },
    {
      icon: <Scale sx={{ fontSize: 24 }} />,
      label: 'Ver Estadísticas',
      description: 'Analizar pesos y métricas',
      color: 'success',
      action: 'view-stats'
    },
    {
      icon: <Analytics sx={{ fontSize: 24 }} />,
      label: 'Generar Reporte',
      description: 'Crear reporte mensual',
      color: 'info',
      action: 'generate-report'
    },
    {
      icon: <Download sx={{ fontSize: 24 }} />,
      label: 'Exportar Datos',
      description: 'Descargar información',
      color: 'warning',
      action: 'export-data'
    },
    {
      icon: <Notifications sx={{ fontSize: 24 }} />,
      label: 'Notificaciones',
      description: 'Configurar alertas',
      color: 'error',
      action: 'notifications'
    }
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Acciones Rápidas
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Accesos directos a las funciones principales
      </Typography>
      
      <Grid container spacing={2}>
        {actions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={action.icon}
              onClick={() => onActionClick(action.action)}
              sx={{
                height: '80px',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                p: 2,
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                  transform: 'translateY(-2px)'
                }
              }}
              color={action.color}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="bold">
                  {action.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {action.description}
                </Typography>
              </Box>
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default QuickActions;