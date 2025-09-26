import React from 'react';
import {
  Paper,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { BarChart, PieChart, ShowChart } from '@mui/icons-material';

const WeightCharts = ({ weightData, chartType, onChartTypeChange }) => {
  // Datos de ejemplo para gráficos (en una implementación real usarías una librería como Chart.js)
  const chartData = {
    bar: {
      labels: weightData.map(user => `${user.userName} ${user.userLastname}`.substring(0, 10) + '...'),
      values: weightData.map(user => user.totalWeight)
    },
    pie: {
      labels: weightData.slice(0, 5).map(user => user.userName),
      values: weightData.slice(0, 5).map(user => user.totalWeight)
    }
  };

  const renderChartPlaceholder = () => {
    switch (chartType) {
      case 'bar':
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BarChart sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Gráfico de Barras
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualización del peso recolectado por usuario
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption">
                En una implementación completa, aquí verías un gráfico interactivo
                mostrando los pesos de cada usuario.
              </Typography>
            </Box>
          </Box>
        );
      
      case 'pie':
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PieChart sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Gráfico Circular
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Distribución porcentual del peso total
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption">
                Gráfico circular mostrando la participación de cada usuario
                en el total recolectado.
              </Typography>
            </Box>
          </Box>
        );
      
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShowChart sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Análisis de Pesos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selecciona un tipo de gráfico para visualizar los datos
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Visualización de Datos
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Tipo de gráfico</InputLabel>
          <Select
            value={chartType}
            label="Tipo de gráfico"
            onChange={(e) => onChartTypeChange(e.target.value)}
          >
            <MenuItem value="bar">Gráfico de Barras</MenuItem>
            <MenuItem value="pie">Gráfico Circular</MenuItem>
            <MenuItem value="none">Sin gráfico</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {chartType !== 'none' && renderChartPlaceholder()}
      
      {chartType === 'none' && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Selecciona un tipo de gráfico para visualizar los datos de peso.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default WeightCharts;