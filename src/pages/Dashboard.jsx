import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Alert,
  Snackbar,
  Button,
  CircularProgress
} from '@mui/material';
import { Refresh, Warning } from '@mui/icons-material'; // Removido Download
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
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  // Cargar datos del dashboard
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Loading dashboard data...');
      
      const [requestsResponse, usersResponse, weightsResponse] = await Promise.all([
        adminService.getAllRequests(),
        adminService.getAllUsers(),
        adminService.getUserWeights()
      ]);
      
      console.log('✅ Dashboard data loaded');

      const allRequests = requestsResponse.data;
      const allUsers = usersResponse.data;
      const weightData = weightsResponse.data;
      
      const recent = allRequests
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20);
      
      setRecentRequests(recent);

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
        totalRequests: allRequests.length,
        todayRequests: todayRequests,
        totalUsers: allUsers.length,
        totalWeight: totalWeight,
        pendingRequests: pendingRequests,
        efficiency: efficiency.toFixed(1),
        requestsChange: 12,
        todayChange: -5,
        usersChange: 8,
        weightChange: 15,
        pendingChange: -3,
        efficiencyChange: 2
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

  const generateReport = async () => {
    setSnackbar({ 
      open: true, 
      message: '🔄 Generando reporte mensual...', 
      severity: 'info' 
    });

    try {
      const reportData = {
        fechaGeneracion: new Date().toISOString(),
        periodo: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
        estadisticas: {
          totalSolicitudes: stats.totalRequests || 0,
          solicitudesEsteMes: stats.todayRequests || 0,
          totalUsuarios: stats.totalUsers || 0,
          pesoTotal: stats.totalWeight || 0,
          solicitudesPendientes: stats.pendingRequests || 0,
          eficiencia: stats.efficiency || 0
        },
        topUsuarios: recentRequests.slice(0, 5).map(req => ({
          usuario: `${req.userName} ${req.userLastname}`,
          material: req.material,
          peso: req.weight || 0,
          fecha: req.createdAt
        })),
        actividadReciente: recentRequests.slice(0, 10).map(req => ({
          codigo: req.code,
          estado: req.status,
          fecha: req.createdAt
        }))
      };

      const reportContent = `
REPORTE MENSUAL ECOCOLLET
=========================

Fecha de generación: ${new Date().toLocaleDateString('es-ES')}
Período: ${reportData.periodo}

ESTADÍSTICAS PRINCIPALES
------------------------
• Total de solicitudes: ${reportData.estadisticas.totalSolicitudes}
• Solicitudes este mes: ${reportData.estadisticas.solicitudesEsteMes}
• Usuarios registrados: ${reportData.estadisticas.totalUsuarios}
• Peso total recolectado: ${reportData.estadisticas.pesoTotal} kg
• Solicitudes pendientes: ${reportData.estadisticas.solicitudesPendientes}
• Eficiencia del sistema: ${reportData.estadisticas.eficiencia}%

TOP 5 USUARIOS
--------------
${reportData.topUsuarios.map((user, index) => 
  `${index + 1}. ${user.usuario} - ${user.material} (${user.peso} kg)`
).join('\n')}

ACTIVIDAD RECIENTE
------------------
${reportData.actividadReciente.map(act => 
  `• ${act.codigo} - ${act.estado} - ${new Date(act.fecha).toLocaleDateString()}`
).join('\n')}

RESUMEN EJECUTIVO
-----------------
El sistema ha procesado ${reportData.estadisticas.totalSolicitudes} solicitudes 
con una eficiencia del ${reportData.estadisticas.eficiencia}%. Se han recolectado 
${reportData.estadisticas.pesoTotal} kg de materiales reciclables.

© ${new Date().getFullYear()} EcoCollet - Sistema de Gestión de Reciclaje
      `;

      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-ecocollet-${reportData.periodo}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSnackbar({ 
        open: true, 
        message: 'Reporte generado y descargado correctamente', 
        severity: 'success' 
      });

    } catch (error) {
      console.error('Error generando reporte:', error);
      setSnackbar({ 
        open: true, 
        message: '❌ Error al generar el reporte', 
        severity: 'error' 
      });
    }
  };

  const exportData = async () => {
    setExporting(true);
    setSnackbar({ 
      open: true, 
      message: '📊 Preparando exportación completa a Excel...', 
      severity: 'info' 
    });

    try {
      const { utils, writeFile } = await import('xlsx');

      const [usersResponse, requestsResponse, weightsResponse] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllRequests(),
        adminService.getUserWeights()
      ]);

      const users = usersResponse.data;
      const requests = requestsResponse.data;
      const weights = weightsResponse.data;

      const exportDate = new Date().toISOString().split('T')[0];
      
      const workbook = utils.book_new();

      const usersData = [
        ['ID', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Rol', 'Fecha Registro', 'Total Solicitudes', 'Peso Total (kg)'],
        ...users.map(user => {
          const userWeight = weights.find(w => w.userId === user.id);
          const userRequests = requests.filter(req => req.userId === user.id);
          
          return [
            user.id,
            user.name,
            user.lastname,
            user.email,
            user.phone || 'N/A',
            user.role,
            new Date(user.createdAt).toLocaleDateString(),
            userRequests.length,
            userWeight ? userWeight.totalWeight : '0'
          ];
        })
      ];

      const usersSheet = utils.aoa_to_sheet(usersData);
      utils.book_append_sheet(workbook, usersSheet, 'Usuarios');

      const requestsData = [
        ['Código', 'Usuario', 'Email Usuario', 'Material', 'Descripción', 'Estado', 'Estado Asignación', 'Peso (kg)', 
         'Fecha Creación', 'Fecha Actualización', 'Dirección', 'Distrito', 'Provincia', 'Región',
         'Recolector Asignado', 'Fecha Asignación'],
        ...requests.map(req => [
          req.code,
          `${req.userName} ${req.userLastname}`,
          req.userEmail,
          req.material,
          req.description || 'N/A',
          req.status,
          req.assignmentStatus || 'N/A',
          req.weight || '0',
          new Date(req.createdAt).toLocaleDateString(),
          req.updatedAt ? new Date(req.updatedAt).toLocaleDateString() : 'N/A',
          req.address || 'N/A',
          req.district || 'N/A',
          req.province || 'N/A',
          req.region || 'N/A',
          req.assignedCollectorName || 'No asignado',
          req.assignedAt ? new Date(req.assignedAt).toLocaleDateString() : 'N/A'
        ])
      ];

      const requestsSheet = utils.aoa_to_sheet(requestsData);
      utils.book_append_sheet(workbook, requestsSheet, 'Solicitudes');

      const weightsData = [
        ['Ranking', 'Usuario', 'Email', 'Total Solicitudes', 'Peso Total (kg)', 'Promedio por Solicitud'],
        ...weights
          .sort((a, b) => b.totalWeight - a.totalWeight)
          .map((weight, index) => [
            index + 1,
            `${weight.userName} ${weight.userLastname}`,
            weight.userEmail,
            weight.totalRequests,
            weight.totalWeight,
            weight.totalRequests > 0 ? (weight.totalWeight / weight.totalRequests).toFixed(2) : '0'
          ])
      ];

      const weightsSheet = utils.aoa_to_sheet(weightsData);
      utils.book_append_sheet(workbook, weightsSheet, 'Pesos y Estadísticas');

      const today = new Date().toISOString().split('T')[0];
      const todayRequests = requests.filter(req => 
        req.createdAt && req.createdAt.split('T')[0] === today
      ).length;

      const pendingRequests = requests.filter(req => req.status === 'PENDING').length;
      const collectedRequests = requests.filter(req => req.status === 'COLLECTED').length;
      const totalWeight = weights.reduce((sum, w) => sum + w.totalWeight, 0);

      const summaryData = [
        ['RESUMEN GENERAL ECOCOLLET'],
        ['Fecha de exportación:', new Date().toLocaleDateString('es-ES')],
        [''],
        ['ESTADÍSTICAS PRINCIPALES'],
        ['Total de usuarios:', users.length],
        ['Total de solicitudes:', requests.length],
        ['Solicitudes hoy:', todayRequests],
        ['Solicitudes pendientes:', pendingRequests],
        ['Solicitudes recolectadas:', collectedRequests],
        ['Peso total recolectado:', `${totalWeight.toFixed(1)} kg`],
        ['Eficiencia del sistema:', `${((collectedRequests / requests.length) * 100).toFixed(1)}%`],
        [''],
        ['USUARIO TOP'],
        ['Nombre:', weights[0] ? `${weights[0].userName} ${weights[0].userLastname}` : 'N/A'],
        ['Peso recolectado:', weights[0] ? `${weights[0].totalWeight} kg` : 'N/A'],
        ['Total solicitudes:', weights[0] ? weights[0].totalRequests : 'N/A']
      ];

      const summarySheet = utils.aoa_to_sheet(summaryData);
      utils.book_append_sheet(workbook, summarySheet, 'Resumen');

      // Generar y descargar el archivo Excel
      writeFile(workbook, `datos-completos-ecocollet-${exportDate}.xlsx`);

      setSnackbar({ 
        open: true, 
        message: `Excel generado con 4 pestañas: ${users.length} usuarios, ${requests.length} solicitudes y ${weights.length} registros de peso`, 
        severity: 'success' 
      });

    } catch (error) {
      console.error('Error exportando datos a Excel:', error);
      setSnackbar({ 
        open: true, 
        message: '❌ Error al generar el archivo Excel', 
        severity: 'error' 
      });
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1 }}>
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

        <StatsCards stats={stats} loading={loading} />

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} lg={8}>
            <RecentActivity recentRequests={recentRequests} loading={loading} />
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <QuickActions onActionClick={handleActionClick} />
            
            {/* Indicador de exportación */}
            {exporting && (
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <Typography variant="body2">
                    Generando archivo Excel...
                  </Typography>
                </Box>
              </Paper>
            )}
            
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

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
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