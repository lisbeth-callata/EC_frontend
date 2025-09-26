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
  Analytics
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
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const RealCharts = ({ weightData, chartType, onChartTypeChange }) => {
  // Preparar datos para gráfico de barras
  const barChartData = {
    labels: weightData.slice(0, 10).map(user => 
      `${user.userName} ${user.userLastname}`.substring(0, 15) + '...'
    ),
    datasets: [
      {
        label: 'Peso Recolectado (kg)',
        data: weightData.slice(0, 10).map(user => user.totalWeight),
        backgroundColor: [
          'rgba(46, 125, 50, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(102, 187, 106, 0.8)',
          'rgba(129, 199, 132, 0.8)',
          'rgba(156, 204, 101, 0.8)',
          'rgba(174, 213, 129, 0.8)',
          'rgba(200, 230, 201, 0.8)',
          'rgba(225, 245, 254, 0.8)',
          'rgba(179, 229, 252, 0.8)',
          'rgba(129, 212, 250, 0.8)'
        ],
        borderColor: [
          'rgba(46, 125, 50, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(102, 187, 106, 1)',
          'rgba(129, 199, 132, 1)',
          'rgba(156, 204, 101, 1)',
          'rgba(174, 213, 129, 1)',
          'rgba(200, 230, 201, 1)',
          'rgba(225, 245, 254, 1)',
          'rgba(179, 229, 252, 1)',
          'rgba(129, 212, 250, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 10 Usuarios por Peso Recolectado',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Peso: ${context.parsed.y} kg`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Peso (kg)'
        },
        ticks: {
          callback: function(value) {
            return value + ' kg';
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Usuarios'
        }
      }
    },
  };

  // Preparar datos para gráfico circular
  const pieChartData = {
    labels: weightData.slice(0, 5).map(user => 
      `${user.userName} ${user.userLastname}`.substring(0, 12) + '...'
    ),
    datasets: [
      {
        data: weightData.slice(0, 5).map(user => user.totalWeight),
        backgroundColor: [
          'rgba(46, 125, 50, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(102, 187, 106, 0.8)',
          'rgba(156, 204, 101, 0.8)',
          'rgba(174, 213, 129, 0.8)'
        ],
        borderColor: [
          'rgba(46, 125, 50, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(102, 187, 106, 1)',
          'rgba(156, 204, 101, 1)',
          'rgba(174, 213, 129, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
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
        text: 'Distribución del Peso Recolectado (Top 5)',
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
            return `${context.label}: ${context.parsed} kg (${percentage}%)`;
          }
        }
      }
    },
  };

  // Gráfico de progreso mensual (simulado)
  const monthlyData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Peso Recolectado 2024',
        data: [120, 190, 300, 500, 200, 300, 400, 480, 362, 550, 600, 750],
        borderColor: 'rgba(46, 125, 50, 1)',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const monthlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Progreso Mensual de Recolección',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Peso (kg)'
        }
      },
    },
  };

  const renderChart = () => {
    if (weightData.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Analytics sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No hay datos para mostrar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Los gráficos se mostrarán cuando haya datos de peso recolectado.
          </Typography>
        </Box>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <Box sx={{ height: 400 }}>
            <Bar data={barChartData} options={barChartOptions} />
          </Box>
        );
      
      case 'pie':
        return (
          <Box sx={{ height: 400 }}>
            <Pie data={pieChartData} options={pieChartOptions} />
          </Box>
        );
      
      case 'monthly':
        return (
          <Box sx={{ height: 400 }}>
            {/* Para gráfico de línea necesitaríamos importar Line */}
            <Bar 
              data={monthlyData} 
              options={monthlyOptions}
            />
          </Box>
        );
      
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Selecciona un tipo de gráfico para visualizar los datos.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          📊 Visualización de Datos
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Tipo de gráfico</InputLabel>
          <Select
            value={chartType}
            label="Tipo de gráfico"
            onChange={(e) => onChartTypeChange(e.target.value)}
          >
            <MenuItem value="bar">
              <BarChart sx={{ mr: 1 }} /> Gráfico de Barras
            </MenuItem>
            <MenuItem value="pie">
              <PieChart sx={{ mr: 1 }} /> Gráfico Circular
            </MenuItem>
            <MenuItem value="monthly">
              <ShowChart sx={{ mr: 1 }} /> Progreso Mensual
            </MenuItem>
            <MenuItem value="none">Sin gráfico</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {chartType !== 'none' ? (
        renderChart()
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ShowChart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Selecciona un tipo de gráfico para visualizar los datos de peso.
          </Typography>
        </Box>
      )}

      {/* Estadísticas rápidas debajo del gráfico */}
      {weightData.length > 0 && chartType !== 'none' && (
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {weightData.length}
              </Typography>
              <Typography variant="body2">Usuarios Activos</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="success" fontWeight="bold">
                {weightData.reduce((sum, user) => sum + user.totalWeight, 0).toFixed(1)} kg
              </Typography>
              <Typography variant="body2">Peso Total</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="warning" fontWeight="bold">
                {(weightData.reduce((sum, user) => sum + user.totalWeight, 0) / weightData.length).toFixed(1)} kg
              </Typography>
              <Typography variant="body2">Promedio por Usuario</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="info" fontWeight="bold">
                {weightData[0]?.userName} {weightData[0]?.userLastname}
              </Typography>
              <Typography variant="body2">Usuario Top</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default RealCharts;