import React from 'react';
import {
  Paper,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  BarChart,
  PieChart,
  ShowChart,
  Analytics,
  LocationOn,
  TrendingUp,
  CalendarMonth,
  RequestPage
} from '@mui/icons-material';

// Importar componentes de Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const RealCharts = ({ weightData, chartType, onChartTypeChange, allRequests = [] }) => {
  
  // 1. DATOS POR DISTRITOS (usando la nueva columna district)
  const getDistrictStats = () => {
    const districtMap = {};
    
    allRequests.forEach(request => {
      if (request.district) {
        const district = request.district;
        const weight = request.weight || 0;
        
        if (districtMap[district]) {
          districtMap[district].totalWeight += weight;
          districtMap[district].requestCount += 1;
          districtMap[district].totalUsers.add(request.userId);
        } else {
          districtMap[district] = {
            totalWeight: weight,
            requestCount: 1,
            totalUsers: new Set([request.userId]),
            districtName: district
          };
        }
      }
    });

    // Convertir a array y ordenar por número de solicitudes (más activos primero)
    return Object.values(districtMap)
      .map(district => ({
        ...district,
        userCount: district.totalUsers.size
      }))
      .sort((a, b) => b.requestCount - a.requestCount) // Ordenar por solicitudes
      .slice(0, 10); // Top 10 distritos
  };

  // 2. DATOS MENSUALES REALES
  const getMonthlyStats = () => {
    const monthlyData = {
      weights: Array(12).fill(0),
      requests: Array(12).fill(0),
      users: Array(12).fill(0),
      districts: Array(12).fill(0)
    };

    const userActivityPerMonth = new Map();
    const districtActivityPerMonth = new Map();

    allRequests.forEach(request => {
      if (request.createdAt) {
        const date = new Date(request.createdAt);
        const month = date.getMonth();
        const year = date.getFullYear();
        const userId = request.userId;
        const district = request.district;
        
        // Solo considerar el año actual
        if (year === new Date().getFullYear()) {
          // Peso
          monthlyData.weights[month] += request.weight || 0;
          
          // Solicitudes
          monthlyData.requests[month] += 1;
          
          // Usuarios únicos por mes
          const userMonthKey = `${year}-${month}`;
          if (!userActivityPerMonth.has(userMonthKey)) {
            userActivityPerMonth.set(userMonthKey, new Set());
          }
          userActivityPerMonth.get(userMonthKey).add(userId);
          
          // Distritos únicos por mes
          const districtMonthKey = `${year}-${month}`;
          if (!districtActivityPerMonth.has(districtMonthKey)) {
            districtActivityPerMonth.set(districtMonthKey, new Set());
          }
          if (district) {
            districtActivityPerMonth.get(districtMonthKey).add(district);
          }
        }
      }
    });

    // Contar usuarios únicos por mes
    userActivityPerMonth.forEach((users, monthKey) => {
      const [year, month] = monthKey.split('-');
      monthlyData.users[parseInt(month)] = users.size;
    });

    // Contar distritos únicos por mes
    districtActivityPerMonth.forEach((districts, monthKey) => {
      const [year, month] = monthKey.split('-');
      monthlyData.districts[parseInt(month)] = districts.size;
    });

    return monthlyData;
  };

  const districtStats = getDistrictStats();
  const monthlyStats = getMonthlyStats();
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Gráfico de Barras - DISTRITOS MÁS ACTIVOS
  const districtBarChartData = {
    labels: districtStats.map(district => 
      district.districtName.length > 12 
        ? district.districtName.substring(0, 12) + '...' 
        : district.districtName
    ),
    datasets: [
      {
        label: 'Solicitudes de Recolección',
        data: districtStats.map(district => district.requestCount),
        backgroundColor: 'rgba(25, 118, 210, 0.8)',
        borderColor: 'rgba(25, 118, 210, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Usuarios Activos',
        data: districtStats.map(district => district.userCount),
        backgroundColor: 'rgba(46, 125, 50, 0.8)',
        borderColor: 'rgba(46, 125, 50, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Peso Recolectado (kg)',
        data: districtStats.map(district => district.totalWeight),
        backgroundColor: 'rgba(237, 108, 2, 0.8)',
        borderColor: 'rgba(237, 108, 2, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ],
  };

  const districtBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 10 Distritos con Mayor Actividad de Recolección',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            if (datasetLabel.includes('Peso')) {
              return `${datasetLabel}: ${value.toFixed(1)} kg`;
            }
            return `${datasetLabel}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Métricas de Actividad'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Distritos'
        }
      }
    },
  };

  // Gráfico Circular - DISTRIBUCIÓN POR DISTRITOS
  const districtPieChartData = {
    labels: districtStats.slice(0, 6).map(district => 
      district.districtName.length > 10 
        ? district.districtName.substring(0, 10) + '...' 
        : district.districtName
    ),
    datasets: [
      {
        data: districtStats.slice(0, 6).map(district => district.requestCount),
        backgroundColor: [
          'rgba(25, 118, 210, 0.8)',
          'rgba(46, 125, 50, 0.8)',
          'rgba(237, 108, 2, 0.8)',
          'rgba(156, 39, 176, 0.8)',
          'rgba(0, 150, 136, 0.8)',
          'rgba(244, 67, 54, 0.8)'
        ],
        borderColor: [
          'rgba(25, 118, 210, 1)',
          'rgba(46, 125, 50, 1)',
          'rgba(237, 108, 2, 1)',
          'rgba(156, 39, 176, 1)',
          'rgba(0, 150, 136, 1)',
          'rgba(244, 67, 54, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const districtPieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15
        }
      },
      title: {
        display: true,
        text: 'Distribución de Solicitudes por Distrito (Top 6)',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} solicitudes (${percentage}%)`;
          }
        }
      }
    },
  };

  // Gráfico de Línea - PROGRESO MENSUAL REAL
  const monthlyLineChartData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Solicitudes Mensuales',
        data: monthlyStats.requests,
        borderColor: 'rgba(25, 118, 210, 1)',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Usuarios Activos',
        data: monthlyStats.users,
        borderColor: 'rgba(46, 125, 50, 1)',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      },
      {
        label: 'Distritos Activos',
        data: monthlyStats.districts,
        borderColor: 'rgba(237, 108, 2, 1)',
        backgroundColor: 'rgba(237, 108, 2, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      }
    ],
  };

  const monthlyLineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolución Mensual - Actividad del Sistema',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Solicitudes'
        },
        beginAtZero: true
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Usuarios/Distritos'
        },
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const renderChart = () => {
    if (allRequests.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Analytics sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No hay datos para mostrar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Los gráficos se mostrarán cuando haya solicitudes registradas.
          </Typography>
        </Box>
      );
    }

    // Verificar si hay datos de distritos
    const hasDistrictData = allRequests.some(request => request.district);
    
    if (!hasDistrictData && chartType !== 'monthly') {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LocationOn sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Datos geográficos no disponibles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Los gráficos de distritos requieren que las solicitudes tengan información de ubicación.
          </Typography>
        </Box>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <Box sx={{ height: 400 }}>
            <Bar data={districtBarChartData} options={districtBarChartOptions} />
          </Box>
        );
      
      case 'pie':
        return (
          <Box sx={{ height: 400 }}>
            <Pie data={districtPieChartData} options={districtPieChartOptions} />
          </Box>
        );
      
      case 'monthly':
        return (
          <Box sx={{ height: 400 }}>
            <Line data={monthlyLineChartData} options={monthlyLineChartOptions} />
          </Box>
        );
      
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Selecciona un tipo de análisis para visualizar los datos.
            </Typography>
          </Box>
        );
    }
  };

  // Calcular estadísticas generales
  const totalRequests = allRequests.length;
  const activeDistricts = new Set(allRequests.map(req => req.district).filter(Boolean)).size;
  const totalWeight = allRequests.reduce((sum, req) => sum + (req.weight || 0), 0);
  const topDistrict = districtStats[0];

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          📊 Análisis Geográfico y Temporal
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Tipo de análisis</InputLabel>
          <Select
            value={chartType}
            label="Tipo de análisis"
            onChange={(e) => onChartTypeChange(e.target.value)}
          >
            <MenuItem value="bar">
              <BarChart sx={{ mr: 1 }} /> Distritos Más Activos
            </MenuItem>
            <MenuItem value="pie">
              <PieChart sx={{ mr: 1 }} /> Distribución por Distritos
            </MenuItem>
            <MenuItem value="monthly">
              <CalendarMonth sx={{ mr: 1 }} /> Evolución Mensual
            </MenuItem>
            <MenuItem value="none">Sin gráfico</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {chartType !== 'none' ? (
        renderChart()
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <TrendingUp sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Selecciona un tipo de análisis para visualizar los datos de recolección.
          </Typography>
        </Box>
      )}

      {/* Estadísticas rápidas debajo del gráfico */}
      {allRequests.length > 0 && chartType !== 'none' && (
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <LocationOn color="primary" />
              <Typography variant="h6" color="primary" fontWeight="bold">
                {activeDistricts}
              </Typography>
              <Typography variant="body2">Distritos con Actividad</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <RequestPage color="success" />
              <Typography variant="h6" color="success" fontWeight="bold">
                {totalRequests}
              </Typography>
              <Typography variant="body2">Total Solicitudes</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <BarChart color="warning" />
              <Typography variant="h6" color="warning" fontWeight="bold">
                {totalWeight.toFixed(0)} kg
              </Typography>
              <Typography variant="body2">Peso Total</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <TrendingUp color="info" />
              <Typography variant="h6" color="info" fontWeight="bold">
                {topDistrict ? `${topDistrict.requestCount} solicitudes` : 'N/A'}
              </Typography>
              <Typography variant="body2">
                {topDistrict ? topDistrict.districtName : 'Distrito Líder'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default RealCharts;