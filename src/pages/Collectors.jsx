import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import { Add, Refresh, Group, Person, Directions } from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import CollectorTable from '../components/Sections/Collectors/CollectorTable';
import CollectorDetail from '../components/Sections/Collectors/CollectorDetail';
import { adminService } from '../services/admin';

const Collectors = () => {
  const [collectors, setCollectors] = useState([]);
  const [filteredCollectors, setFilteredCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [activeTab, setActiveTab] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [collectorAssignments, setCollectorAssignments] = useState([]);

  // Cargar recolectores
  const loadCollectors = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Loading collectors...');
      const response = await adminService.getAllCollectors();
      console.log('✅ Collectors loaded:', response.data);

      // Enriquecer datos de recolectores con estadísticas simuladas
      const enrichedCollectors = response.data.map(collector => ({
        ...collector,
        isActive: Math.random() > 0.2, // 80% de probabilidad de estar activo
        currentAssignments: Math.floor(Math.random() * 5), // 0-4 asignaciones actuales
        totalAssignments: Math.floor(Math.random() * 50) + 10, // 10-60 asignaciones totales
        completedAssignments: Math.floor(Math.random() * 45) + 5, // 5-50 completadas
        totalWeight: Math.random() * 1000 + 100, // 100-1100 kg
        performance: Math.floor(Math.random() * 40) + 60, // 60-100% rendimiento
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Última semana
      }));

      setCollectors(enrichedCollectors);
      applyFilters(enrichedCollectors, activeTab);
      
    } catch (error) {
      console.error('❌ Error loading collectors:', error);
      setError(`Error al cargar los recolectores: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadCollectors();
  }, [loadCollectors]);

  // Aplicar filtros por pestaña
  const applyFilters = (collectorsList, tab) => {
    let filtered = collectorsList;

    switch (tab) {
      case 1: // Activos
        filtered = filtered.filter(collector => collector.isActive);
        break;
      case 2: // En ruta
        filtered = filtered.filter(collector => collector.isActive && collector.currentAssignments > 0);
        break;
      case 3: // Disponibles
        filtered = filtered.filter(collector => collector.isActive && collector.currentAssignments === 0);
        break;
      default: // Todos
        break;
    }

    setFilteredCollectors(filtered);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    applyFilters(collectors, newValue);
  };

  const handleViewDetail = async (collector) => {
    setSelectedCollector(collector);
    
    try {
      // Cargar asignaciones del recolector
      const assignmentsResponse = await adminService.getCollectorAssignments(collector.id);
      setCollectorAssignments(assignmentsResponse.data || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setCollectorAssignments([]);
    }
    
    setDetailOpen(true);
  };

  const handleAssign = (collector) => {
    setSnackbar({ 
      open: true, 
      message: `Redirigiendo a asignaciones para ${collector.name}`, 
      severity: 'info' 
    });
    // Aquí redirigirías a la página de asignaciones
  };

  const handleContact = (collector) => {
    if (collector.phone) {
      window.open(`tel:${collector.phone}`);
    } else {
      setSnackbar({ 
        open: true, 
        message: 'No hay número de teléfono registrado', 
        severity: 'warning' 
      });
    }
  };

  const getTabLabel = (tabIndex) => {
    const total = collectors.length;
    const active = collectors.filter(c => c.isActive).length;
    const onRoute = collectors.filter(c => c.isActive && c.currentAssignments > 0).length;
    const available = collectors.filter(c => c.isActive && c.currentAssignments === 0).length;
    
    switch (tabIndex) {
      case 0: return `Todos (${total})`;
      case 1: return `Activos (${active})`;
      case 2: return `En ruta (${onRoute})`;
      case 3: return `Disponibles (${available})`;
      default: return 'Todos';
    }
  };

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header de la página */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Gestión de Recolectores
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Supervisión y gestión del equipo de recolección
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<Refresh />}
              onClick={() => loadCollectors()}
              disabled={loading}
            >
              Actualizar
            </Button>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => setSnackbar({ 
                open: true, 
                message: 'Funcionalidad de nuevo recolector en desarrollo', 
                severity: 'info' 
              })}
            >
              Nuevo Recolector
            </Button>
          </Box>
        </Box>

        {/* Pestañas */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<Group />} label={getTabLabel(0)} />
            <Tab icon={<Person />} label={getTabLabel(1)} />
            <Tab icon={<Directions />} label={getTabLabel(2)} />
            <Tab label={getTabLabel(3)} />
          </Tabs>
        </Paper>

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Box sx={{ mt: 1 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => loadCollectors()}
              >
                Reintentar
              </Button>
            </Box>
          </Alert>
        )}

        {/* Resumen rápido */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
              <Typography variant="h4" fontWeight="bold">
                {collectors.length}
              </Typography>
              <Typography variant="body2">Total Recolectores</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
              <Typography variant="h4" fontWeight="bold">
                {collectors.filter(c => c.isActive).length}
              </Typography>
              <Typography variant="body2">Activos</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
              <Typography variant="h4" fontWeight="bold">
                {collectors.filter(c => c.isActive && c.currentAssignments > 0).length}
              </Typography>
              <Typography variant="body2">En Ruta</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
              <Typography variant="h4" fontWeight="bold">
                {collectors.filter(c => c.isActive && c.currentAssignments === 0).length}
              </Typography>
              <Typography variant="body2">Disponibles</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Contenido principal */}
        {loading ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Cargando recolectores...
            </Typography>
          </Paper>
        ) : (
          <CollectorTable
            collectors={filteredCollectors}
            onViewDetail={handleViewDetail}
            onAssign={handleAssign}
            onContact={handleContact}
          />
        )}

        {/* Modal de detalle */}
        <CollectorDetail
          open={detailOpen}
          onClose={() => {
            setDetailOpen(false);
            setSelectedCollector(null);
            setCollectorAssignments([]);
          }}
          collector={selectedCollector}
          assignments={collectorAssignments}
        />

        {/* Snackbar para notificaciones */}
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

export default Collectors;