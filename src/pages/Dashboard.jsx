import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  Button
} from '@mui/material';
import { Refresh, Warning } from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import StatsCards from '../components/Sections/Dashboard/StatsCards';
import RecentActivity from '../components/Sections/Dashboard/RecentActivity';
import QuickActions from '../components/Sections/Dashboard/QuickActions';
import { adminService } from '../services/admin';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  // Cargar datos del dashboard
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Loading dashboard data...');
      
      // Cargar múltiples datos en paralelo
      const [requestsResponse, usersResponse, weightsResponse, statsResponse] = await Promise.all([
        adminService.getAllRequests(),
        adminService.getAllUsers(),
        adminService.getUserWeights(),
        adminService.getDashboardStats()
      ]);
      
      console.log('✅ Dashboard data loaded');

      // Procesar estadísticas
      const allRequests = requestsResponse.data;
      const allUsers = usersResponse.data;
      const weightData = weightsResponse.data;
      
      // Solicitudes recientes (últimas 20)
      const recent = allRequests
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20);
      
      setRecentRequests(recent);

      // Calcular métricas del dashboard
      const totalWeight = weightData.reduce((sum, user) => sum + (user.totalWeight || 0), 0);
      const today = new Date().toISOString().split('T')[0];
      const todayRequests = allRequests.filter(req => 
        req.createdAt && req.createdAt.split('T')[0] === today
      ).length;

      const pendingRequests = allRequests.filter(req => 
        req.status === 'PENDING'
      ).length;

      const efficiency = allRequests.length > 0 ? 
        ((allRequests.filter(req => req.status === 'COLLECTED').length / allRequests.length) * 100) : 0;

      const dashboardStats = {
        // Datos básicos
        totalRequests: allRequests.length,
        todayRequests: todayRequests,
        totalUsers: allUsers.length,
        totalWeight: totalWeight,
        pendingRequests: pendingRequests,
        efficiency: efficiency.toFixed(1),

        // Cambios porcentuales (simulados para el ejemplo)
        requestsChange: 12, // +12% vs mes anterior
        todayChange: -5,    // -5% vs ayer
        usersChange: 8,     // +8% vs mes anterior
        weightChange: 15,   // +15% vs mes anterior
        pendingChange: -3,  // -3% vs ayer
        efficiencyChange: 2 // +2% vs mes anterior
      };

      setStats(dashboardStats);
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError(`Error al cargar el dashboard: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleActionClick = (action) => {
    switch (action) {
      case 'create-request':
        navigate('/requests');
        break;
      case 'manage-users':
        navigate('/users');
        break;
      case 'view-stats':
        navigate('/weights');
        break;
      case 'generate-report':
        generateReport();
        break;
      case 'export-data':
        exportData();
        break;
      case 'notifications':
        setSnackbar({ 
          open: true, 
          message: 'Configuración de notificaciones en desarrollo', 
          severity: 'info' 
        });
        break;
      default:
        break;
    }
  };

  const generateReport = () => {
    setSnackbar({ 
      open: true, 
      message: 'Generando reporte mensual...', 
      severity: 'info' 
    });
    // Simular generación de reporte
    setTimeout(() => {
      setSnackbar({ 
        open: true, 
        message: 'Reporte generado correctamente', 
        severity: 'success' 
      });
    }, 2000);
  };

  const exportData = () => {
    setSnackbar({ 
      open: true, 
      message: 'Exportando datos del sistema...', 
      severity: 'info' 
    });
    // Simular exportación
    setTimeout(() => {
      setSnackbar({ 
        open: true, 
        message: 'Datos exportados correctamente', 
        severity: 'success' 
      });
    }, 1500);
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header del dashboard */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Dashboard EcoCollet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Resumen general del sistema de reciclaje
            </Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>

        {/* Mensaje de error */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRefresh}
              >
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Tarjetas de estadísticas */}
        <StatsCards stats={stats} loading={loading} />

        {/* Contenido secundario */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} lg={8}>
            <RecentActivity recentRequests={recentRequests} loading={loading} />
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <QuickActions onActionClick={handleActionClick} />
            
            {/* Panel de alertas */}
            <Paper sx={{ p: 3, mt: 3, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Warning />
                <Typography variant="h6" fontWeight="bold">
                  Alertas del Sistema
                </Typography>
              </Box>
              
              {stats.pendingRequests > 0 ? (
                <Typography variant="body2">
                  Tienes {stats.pendingRequests} solicitudes pendientes por atender.
                </Typography>
              ) : (
                <Typography variant="body2">
                  ¡Excelente! No hay solicitudes pendientes.
                </Typography>
              )}
              
              {stats.todayRequests === 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  No hay solicitudes registradas hoy.
                </Typography>
              )}
            </Paper>

            {/* Resumen rápido */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Resumen Rápido
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {stats.todayRequests || 0} solicitudes hoy
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {stats.pendingRequests || 0} pendientes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {stats.efficiency || 0}% de eficiencia
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Última actualización: {new Date().toLocaleTimeString()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default Dashboard;