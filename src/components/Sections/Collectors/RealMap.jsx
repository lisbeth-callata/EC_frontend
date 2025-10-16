import React, { useEffect, useRef } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RealMap = ({ 
  assignments = [], 
  availableRequests = [], 
  selectedAssignment,
  onAssignmentSelect 
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Inicializar mapa centrado en Lima, Perú
    mapInstance.current = L.map(mapRef.current).setView([-12.0464, -77.0428], 12);

    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => {
      mapInstance.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Crear iconos personalizados
    const createIcon = (color, type) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 25px;
            height: 25px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">
            ${type === 'request' ? '📦' : '👤'}
          </div>
        `,
        iconSize: [25, 25],
        iconAnchor: [12, 12]
      });
    };

    // Agregar marcadores para solicitudes disponibles
    availableRequests.forEach(request => {
      if (request.latitude && request.longitude) {
        const marker = L.marker([request.latitude, request.longitude], {
          icon: createIcon('#1976d2', 'request')
        })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #1976d2;">${request.code}</h4>
              <p style="margin: 4px 0;"><strong>Material:</strong> ${request.material}</p>
              <p style="margin: 4px 0;"><strong>Usuario:</strong> ${request.userName}</p>
              <p style="margin: 4px 0;"><strong>Dirección:</strong> ${request.address}</p>
              <p style="margin: 4px 0;"><strong>Estado:</strong> <span style="color: #1976d2;">Disponible</span></p>
              <button onclick="window.selectAssignment && window.selectAssignment(${request.id})" 
                style="background: #1976d2; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
                Seleccionar
              </button>
            </div>
          `);

        marker.requestId = request.id;
        markersRef.current.push(marker);

        // Agregar evento de clic
        marker.on('click', () => {
          if (onAssignmentSelect) {
            onAssignmentSelect(request);
          }
        });
      }
    });

    // Agregar marcadores para asignaciones activas
    assignments.forEach(assignment => {
      if (assignment.latitude && assignment.longitude) {
        const isSelected = selectedAssignment?.id === assignment.id;
        const statusColor = assignment.assignmentStatus === 'IN_PROGRESS' ? '#ed6c02' : 
                           assignment.assignmentStatus === 'PENDING' ? '#ff9800' : '#2e7d32';

        const marker = L.marker([assignment.latitude, assignment.longitude], {
          icon: createIcon(statusColor, 'assignment')
        })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: ${statusColor};">${assignment.code}</h4>
              <p style="margin: 4px 0;"><strong>Material:</strong> ${assignment.material}</p>
              <p style="margin: 4px 0;"><strong>Usuario:</strong> ${assignment.userName}</p>
              <p style="margin: 4px 0;"><strong>Recolector:</strong> ${assignment.assignedCollectorName || 'No asignado'}</p>
              <p style="margin: 4px 0;"><strong>Estado:</strong> <span style="color: ${statusColor};">${assignment.assignmentStatus}</span></p>
              <p style="margin: 4px 0;"><strong>Dirección:</strong> ${assignment.address}</p>
              <button onclick="window.selectAssignment && window.selectAssignment(${assignment.id})" 
                style="background: ${statusColor}; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
                Seleccionar
              </button>
            </div>
          `);

        marker.assignmentId = assignment.id;
        markersRef.current.push(marker);

        // Resaltar marcador seleccionado
        if (isSelected) {
          marker.openPopup();
        }

        marker.on('click', () => {
          if (onAssignmentSelect) {
            onAssignmentSelect(assignment);
          }
        });
      }
    });

    // Ajustar el zoom para mostrar todos los marcadores
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [assignments, availableRequests, selectedAssignment, onAssignmentSelect]);

  // Exponer función global para los popups
  useEffect(() => {
    window.selectAssignment = (assignmentId) => {
      const allItems = [...assignments, ...availableRequests];
      const assignment = allItems.find(item => item.id === assignmentId);
      if (assignment && onAssignmentSelect) {
        onAssignmentSelect(assignment);
      }
    };

    return () => {
      delete window.selectAssignment;
    };
  }, [assignments, availableRequests, onAssignmentSelect]);

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Mapa de Asignaciones en Tiempo Real
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {markersRef.current.length} ubicaciones en el mapa
      </Typography>
      
      <Box 
        ref={mapRef} 
        sx={{ 
          height: 300, 
          width: '100%', 
          borderRadius: 1,
          overflow: 'hidden'
        }} 
      />

      {/* Leyenda del mapa */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#1976d2' }} />
          <Typography variant="caption">Solicitudes Disponibles</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800' }} />
          <Typography variant="caption">Asignaciones Pendientes</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ed6c02' }} />
          <Typography variant="caption">En Progreso</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2e7d32' }} />
          <Typography variant="caption">Completadas</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default RealMap;