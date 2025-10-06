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
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Add,
  Refresh,
  Group,
  Person,
  Directions,
  Assignment,
  LocationOn
} from '@mui/icons-material';
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
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [collectorAssignments, setCollectorAssignments] = useState([]);
  const [collectorStats, setCollectorStats] = useState({});

  // Cargar recolectores con datos REALES
  const loadCollectors = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Loading collectors with real data...');
      const response = await adminService.getAllCollectors();
      console.log('✅ Collectors loaded:', response.data);

      // Enriquecer con datos reales
      const collectorsWithRealData = await Promise.all(
        response.data.map(async (collector) => {
          try {
            const stats = await adminService.getCollectorRealStats(collector.id);
            const assignments = await adminService.getCollectorAssignments(collector.id);

            const currentAssignments = assignments.data ?
              assignments.data.filter(a =>
                a.assignmentStatus === 'PENDING' || a.assignmentStatus === 'IN_PROGRESS'
              ).length : 0;

            return {
              ...collector,
              isActive: true, // Siempre activo si existe
              currentAssignments: currentAssignments,
              totalAssignments: stats.totalAssignments,
              completedAssignments: stats.completedAssignments,
              totalWeight: stats.totalWeight,
              performance: stats.performance,
              lastActivity: await getLastActivity(collector.id)
            };
          } catch (error) {
            console.error(`Error loading stats for collector ${collector.id}:`, error);
            return {
              ...collector,
              isActive: true,
              currentAssignments: 0,
              totalAssignments: 0,
              completedAssignments: 0,
              totalWeight: 0,
              performance: 0,
              lastActivity: null
            };
          }
        })
      );

      setCollectors(collectorsWithRealData);
      applyFilters(collectorsWithRealData, activeTab);

    } catch (error) {
      console.error('❌ Error loading collectors:', error);
      setError(`Error al cargar los recolectores: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Función para obtener última actividad
  const getLastActivity = async (collectorId) => {
    try {
      const assignments = await adminService.getCollectorAssignments(collectorId);
      if (assignments.data && assignments.data.length > 0) {
        // Ordenar por fecha de actualización y tomar la más reciente
        const sorted = assignments.data.sort((a, b) =>
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        return sorted[0].updatedAt;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Cargar solicitudes disponibles para asignación
  const loadAvailableRequests = async () => {
    try {
      console.log('🔄 EJECUTANDO loadAvailableRequests...');
      const response = await adminService.getAvailableRequestsForAssignment();
      console.log('✅ RESPONSE COMPLETA:', response);
      console.log('📊 RESPONSE.DATA:', response.data);
      console.log('🔢 NÚMERO DE SOLICITUDES EN RESPONSE:', response.data?.length || 0);

      // VERIFICAR QUE SE ESTÉ EJECUTANDO setAvailableRequests
      console.log('🎯 ANTES de setAvailableRequests');
      setAvailableRequests(response.data || []);
      console.log('🎯 DESPUÉS de setAvailableRequests');

    } catch (error) {
      console.error('❌ ERROR en loadAvailableRequests:', error);
      console.error('📋 Error details:', error.response?.data);
      setAvailableRequests([]);
    }
  };

  useEffect(() => {
    loadCollectors();
  }, [loadCollectors]);

  // Aplicar filtros por pestaña
  const applyFilters = (collectorsList, tab) => {
    let filtered = collectorsList;

    switch (tab) {
      case 1: // Activos (con asignaciones)
        filtered = filtered.filter(collector => collector.currentAssignments > 0);
        break;
      case 2: // En ruta
        filtered = filtered.filter(collector => collector.currentAssignments > 0);
        break;
      case 3: // Disponibles
        filtered = filtered.filter(collector => collector.currentAssignments === 0);
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
      // Cargar asignaciones y estadísticas reales del recolector
      const [assignmentsResponse, stats] = await Promise.all([
        adminService.getCollectorAssignments(collector.id),
        adminService.getCollectorRealStats(collector.id)
      ]);

      setCollectorAssignments(assignmentsResponse.data || []);
      setCollectorStats(stats);
    } catch (error) {
      console.error('Error loading collector details:', error);
      setCollectorAssignments([]);
      setCollectorStats({});
    }

    setDetailOpen(true);
  };

  const handleAssign = async (collector) => {
    console.log('🎯 Iniciando asignación para:', collector.name);
    setSelectedCollector(collector);
    setAssigning(false);
    setSelectedRequest(null);

    try {
      console.log('🔄 Cargando solicitudes disponibles...');

      // FORZAR LA CARGA ANTES DE ABRIR EL MODAL
      await loadAvailableRequests();

      // ESPERAR UN MOMENTO PARA QUE EL ESTADO SE ACTUALICE
      setTimeout(() => {
        console.log('📊 availableRequests después de carga:', availableRequests.length);
        console.log('📋 Datos de availableRequests:', availableRequests);
        setAssignDialogOpen(true);
      }, 100);

    } catch (error) {
      console.error('❌ Error en handleAssign:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar solicitudes disponibles',
        severity: 'error'
      });
    }
  };

  const confirmAssignment = async () => {
    if (!selectedCollector || !selectedRequest) return;

    setAssigning(true);
    try {
      await adminService.assignRequestToCollector(selectedRequest.id, {
        collectorId: selectedCollector.id,
        collectorName: `${selectedCollector.name} ${selectedCollector.lastname}`,
        timeoutMinutes: 30 // 30 minutos para completar
      });

      setSnackbar({
        open: true,
        message: `Solicitud asignada a ${selectedCollector.name} exitosamente`,
        severity: 'success'
      });

      setAssignDialogOpen(false);
      loadCollectors(); // Recargar datos

    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error al asignar: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setAssigning(false);
    }
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
    const active = collectors.filter(c => c.currentAssignments > 0).length;
    const available = collectors.filter(c => c.currentAssignments === 0).length;

    switch (tabIndex) {
      case 0: return `Todos (${total})`;
      case 1: return `En actividad (${active})`;
      case 2: return `En ruta (${active})`;
      case 3: return `Disponibles (${available})`;
      default: return 'Todos';
    }
  };

  // Diálogo de asignación
  const renderAssignmentDialog = () => (
    <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        Asignar Solicitud a {selectedCollector?.name} {selectedCollector?.lastname}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selecciona una solicitud disponible para asignar a este recolector.
        </Typography>

        {availableRequests.length === 0 ? (
          <Alert severity="info">
            No hay solicitudes disponibles para asignar en este momento.
          </Alert>
        ) : (
          <FormControl fullWidth>
            <InputLabel>Solicitud disponible</InputLabel>
            <Select
              value={selectedRequest?.id || ''}
              label="Solicitud disponible"
              onChange={(e) => {
                const request = availableRequests.find(r => r.id === e.target.value);
                setSelectedRequest(request);
              }}
            >
              {availableRequests.map(request => (
                <MenuItem key={request.id} value={request.id}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {request.code} - {request.material}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {request.addressUser || request.address} • {request.district}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedRequest && (
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Detalles de la solicitud seleccionada:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <LocationOn color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Ubicación"
                  secondary={selectedRequest.addressUser || selectedRequest.address}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Distrito"
                  secondary={selectedRequest.district || 'No especificado'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Material"
                  secondary={selectedRequest.material}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Descripción"
                  secondary={selectedRequest.description || 'Sin descripción'}
                />
              </ListItem>
            </List>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAssignDialogOpen(false)} disabled={assigning}>
          Cancelar
        </Button>
        <Button
          onClick={confirmAssignment}
          variant="contained"
          disabled={!selectedRequest || assigning}
          startIcon={assigning ? <CircularProgress size={20} /> : <Assignment />}
        >
          {assigning ? 'Asignando...' : 'Asignar Solicitud'}
        </Button>
      </DialogActions>
    </Dialog>
  );

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
                {collectors.filter(c => c.currentAssignments > 0).length}
              </Typography>
              <Typography variant="body2">En Actividad</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
              <Typography variant="h4" fontWeight="bold">
                {collectors.reduce((sum, c) => sum + c.currentAssignments, 0)}
              </Typography>
              <Typography variant="body2">Asignaciones Activas</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
              <Typography variant="h4" fontWeight="bold">
                {collectors.filter(c => c.currentAssignments === 0).length}
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
            setCollectorStats({});
          }}
          collector={selectedCollector}
          assignments={collectorAssignments}
          stats={collectorStats}
        />

        {/* Diálogo de asignación */}
        {renderAssignmentDialog()}

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