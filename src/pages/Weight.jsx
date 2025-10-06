import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  Grid
} from '@mui/material';
import { Refresh, Download, Analytics } from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import WeightTable from '../components/Sections/Weight/WeightTable';
import WeightStats from '../components/Sections/Weight/WeightStats';
import RealCharts from '../components/Sections/Weight/RealCharts';
import { adminService } from '../services/admin';

const Weight = () => {
  const [weightData, setWeightData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [chartType, setChartType] = useState('bar');
  const [allRequests, setAllRequests] = useState([]);

  // Cargar datos de peso
  const loadWeightData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Loading weight data...');

      const [weightsResponse, statsResponse, requestsResponse] = await Promise.all([
        adminService.getUserWeights(),
        adminService.getWeightStats(),
        adminService.getAllRequests() 
      ]);

      console.log('✅ Weight data loaded:', weightsResponse.data);
      console.log('✅ All requests loaded:', requestsResponse.data);

      // Ordenar datos por peso descendente
      const sortedData = weightsResponse.data.sort((a, b) => b.totalWeight - a.totalWeight);
      setWeightData(sortedData);
      setStats(statsResponse.data);
      setAllRequests(requestsResponse.data); 
    } catch (error) {
      console.error('Error loading weight data:', error);
      setError(`Error al cargar los datos de peso: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeightData();
  }, [loadWeightData]);

  const handleRefresh = () => {
    loadWeightData();
  };

  const handleExport = () => {
    // Simular exportación de datos
    const csvContent = [
      ['Usuario', 'Email', 'Solicitudes', 'Peso Total (kg)'],
      ...weightData.map(user => [
        `${user.userName} ${user.userLastname}`,
        user.userEmail,
        user.totalRequests,
        user.totalWeight
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pesos-ecocollet-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: 'Datos exportados correctamente',
      severity: 'success'
    });
  };

  const calculateTotalWeight = () => {
    return weightData.reduce((total, user) => total + (user.totalWeight || 0), 0);
  };

  const getTopUser = () => {
    if (weightData.length === 0) return null;
    return weightData[0];
  };

  const enhancedStats = {
    ...stats,
    totalWeight: calculateTotalWeight(),
    totalUsers: weightData.length,
    averageWeight: weightData.length > 0 ? calculateTotalWeight() / weightData.length : 0,
    topUser: getTopUser()
  };

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header de la página */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Estadísticas de Peso
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitoreo del peso total de materiales reciclados
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Actualizar
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
              disabled={loading || weightData.length === 0}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<Analytics />}
              disabled={loading}
            >
              Generar Reporte
            </Button>
          </Box>
        </Box>

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Box sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => loadWeightData()}
              >
                Reintentar
              </Button>
            </Box>
          </Alert>
        )}

        {/* Estadísticas */}
        <WeightStats stats={enhancedStats} loading={loading} />

        {/* Contenido principal */}
        {loading ? (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Cargando datos de peso...
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Tabla de pesos */}
            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Ranking de Usuarios por Peso Recolectado
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {weightData.length} usuarios han contribuido con un total de {calculateTotalWeight().toFixed(1)} kg
                </Typography>

                <WeightTable
                  weightData={weightData}
                  totalWeight={calculateTotalWeight()}
                />
              </Paper>
            </Box>

            {/* Gráficos */}
            <RealCharts
              weightData={weightData}
              chartType={chartType}
              onChartTypeChange={setChartType}
              allRequests={allRequests}
            />

            {/* Resumen adicional */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Resumen de Contribuciones
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      • Usuario top: {enhancedStats.topUser ? `${enhancedStats.topUser.userName} ${enhancedStats.topUser.userLastname}` : 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      • Peso máximo: {enhancedStats.topUser ? `${enhancedStats.topUser.totalWeight} kg` : 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      • Promedio por usuario: {enhancedStats.averageWeight.toFixed(1)} kg
                    </Typography>
                    <Typography variant="body2">
                      • Total de solicitudes procesadas: {weightData.reduce((total, user) => total + user.totalRequests, 0)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Impacto Ambiental
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      • Equivale a aproximadamente {Math.round(calculateTotalWeight() / 5)} árboles salvados
                    </Typography>
                    <Typography variant="body2">
                      • Reducción de CO₂: {Math.round(calculateTotalWeight() * 2.5)} kg
                    </Typography>
                    <Typography variant="body2">
                      • Ahorro de energía: {Math.round(calculateTotalWeight() * 10)} kWh
                    </Typography>
                    <Typography variant="body2">
                      • Agua ahorrada: {Math.round(calculateTotalWeight() * 100)} litros
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}

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

export default Weight;