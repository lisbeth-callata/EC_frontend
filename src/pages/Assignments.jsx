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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { Refresh, Assignment, Directions, Schedule, CheckCircle } from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import AssignmentMap from '../components/Sections/Collectors/AssignmentMap';
import AssignmentManager from '../components/Sections/Collectors/AssignmentManager';
import { adminService } from '../services/admin';

const Assignments = () => {
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Loading assignment data...');

      const [collectorsResponse, requestsResponse, availableResponse] = await Promise.all([
        adminService.getAllCollectors(),
        adminService.getAllRequests(),
        adminService.getAvailableRequests()
      ]);

      // Enriquecer recolectores con datos simulados
      const enrichedCollectors = collectorsResponse.data.map(collector => ({
        ...collector,
        isActive: Math.random() > 0.3
      }));

      setCollectors(enrichedCollectors);
      setAssignments(requestsResponse.data);
      setAvailableRequests(availableResponse.data);

      // Seleccionar primer recolector activo por defecto
      const activeCollector = enrichedCollectors.find(c => c.isActive);
      if (activeCollector) {
        setSelectedCollector(activeCollector);
      }

    } catch (error) {
      console.error('❌ Error loading assignment data:', error);
      setError(`Error al cargar los datos: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async (collectorId, requestId) => {
    try {
      await adminService.assignRequestToCollector(requestId, {
        collectorId: collectorId,
        collectorName: selectedCollector?.name
      });

      setSnackbar({
        open: true,
        message: 'Solicitud asignada correctamente',
        severity: 'success'
      });
      loadData(); // Recargar datos
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error al asignar: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleUnassign = async (requestId) => {
    try {
      await adminService.unassignRequest(requestId);
      setSnackbar({
        open: true,
        message: 'Solicitud liberada correctamente',
        severity: 'success'
      });
      loadData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error al liberar: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleComplete = async (requestId) => {
    try {
      await adminService.completeRequest(requestId);
      setSnackbar({
        open: true,
        message: 'Solicitud completada correctamente',
        severity: 'success'
      });
      loadData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error al completar: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const getCollectorAssignments = () => {
    if (!selectedCollector) return [];
    return assignments.filter(assignment =>
      assignment.assignedCollectorId === selectedCollector.id
    );
  };

  // Calcular estadísticas
  const getStats = () => {
    return {
      disponibles: availableRequests.length,
      pendientes: assignments.filter(a => a.assignmentStatus === 'PENDING').length,
      enProgreso: assignments.filter(a => a.assignmentStatus === 'IN_PROGRESS').length,
      completadas: assignments.filter(a => a.assignmentStatus === 'COMPLETED').length
    };
  };

  const stats = getStats();

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header de la página */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment color="primary" />
              Gestión de Asignaciones
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Asignación y seguimiento de solicitudes a recolectores
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Seleccionar Recolector</InputLabel>
              <Select
                value={selectedCollector?.id || ''}
                label="Seleccionar Recolector"
                onChange={(e) => {
                  const collector = collectors.find(c => c.id === e.target.value);
                  setSelectedCollector(collector);
                }}
              >
                <MenuItem value="">
                  <em>Seleccionar recolector</em>
                </MenuItem>
                {collectors.filter(c => c.isActive).map(collector => (
                  <MenuItem key={collector.id} value={collector.id}>
                    {collector.name} {collector.lastname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => loadData()}
              disabled={loading}
              size="large"
            >
              Actualizar
            </Button>
          </Box>
        </Box>

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Box sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => loadData()}
              >
                Reintentar
              </Button>
            </Box>
          </Alert>
        )}

        {/* Estadísticas rápidas - MEJOR DISEÑO */}
        {!loading && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2, backgroundColor: 'info.light', color: 'white', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: '8px !important' }}>
                  <Assignment sx={{ fontSize: 30, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.disponibles}
                  </Typography>
                  <Typography variant="body2">Disponibles</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2, backgroundColor: 'warning.light', color: 'white', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: '8px !important' }}>
                  <Schedule sx={{ fontSize: 30, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.pendientes}
                  </Typography>
                  <Typography variant="body2">Pendientes</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2, backgroundColor: 'primary.light', color: 'white', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: '8px !important' }}>
                  <Directions sx={{ fontSize: 30, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.enProgreso}
                  </Typography>
                  <Typography variant="body2">En Progreso</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2, backgroundColor: 'success.light', color: 'white', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: '8px !important' }}>
                  <CheckCircle sx={{ fontSize: 30, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.completadas}
                  </Typography>
                  <Typography variant="body2">Completadas</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Contenido principal */}
        {loading ? (
          <Paper sx={{ p: 4, textAlign: 'center' }} elevation={2}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Cargando datos de asignaciones...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Esto puede tomar unos segundos
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3} sx={{ width: '100%' }}>
            {/* Mapa y solicitudes disponibles - 7 COLUMNAS */}
            <Grid item xs={12} lg={7} sx={{ width: '100%' }}>
              <AssignmentMap
                assignments={getCollectorAssignments()} 
                availableRequests={availableRequests} 
                selectedAssignment={selectedAssignment}
                onAssignmentSelect={setSelectedAssignment}
              />
            </Grid>

            {/* Gestor de asignaciones - 5 COLUMNAS */}
            <Grid item xs={12} lg={5} sx={{ width: '100%' }}>
              <AssignmentManager
                collector={selectedCollector}
                assignments={getCollectorAssignments()}
                availableRequests={availableRequests}
                onAssign={handleAssign}
                onUnassign={handleUnassign}
                onComplete={handleComplete}
              />
            </Grid>
          </Grid>
        )}

        {/* Información del recolector seleccionado */}
        {selectedCollector && !loading && (
          <Paper sx={{ p: 2, mt: 3, backgroundColor: 'primary.light', color: 'white' }} elevation={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Recolector Seleccionado: {selectedCollector.name} {selectedCollector.lastname}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedCollector.email} • {selectedCollector.phone || 'Sin teléfono'}
                </Typography>
              </Box>
              <Chip
                label={`${getCollectorAssignments().length} asignaciones activas`}
                color="secondary"
                variant="filled"
                sx={{ color: 'white', fontWeight: 'bold' }}
              />
            </Box>
          </Paper>
        )}

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default Assignments;