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

  // Función para determinar el color basado en el estado
  const getStatusColor = (item) => {
    if (item.assignmentStatus === 'COMPLETED' || item.status === 'COLLECTED') {
      return 'success';
    } else if (item.assignmentStatus === 'IN_PROGRESS') {
      return 'warning';
    } else if (item.assignmentStatus === 'PENDING') {
      return 'warning';
    } else {
      return 'primary';
    }
  };

  // Función para determinar el texto del estado
  const getStatusText = (item) => {
    if (item.assignmentStatus === 'COMPLETED' || item.status === 'COLLECTED') {
      return 'COMPLETADO';
    } else if (item.assignmentStatus === 'IN_PROGRESS') {
      return 'EN PROGRESO';
    } else if (item.assignmentStatus === 'PENDING') {
      return 'PENDIENTE';
    } else {
      return 'DISPONIBLE';
    }
  };

  // Función para crear iconos con colores consistentes
  const createIcon = (color, type) => {
    const statusColors = {
      primary: '#1976d2',
      warning: '#ed6c02',  
      success: '#2e7d32',
    };

    const iconColor = statusColors[color] || '#1976d2';
    const emoji = type === 'request' ? '📦' : '👤';

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${iconColor};
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
          ${emoji}
        </div>
      `,
      iconSize: [25, 25],
      iconAnchor: [12, 12]
    });
  };

  useEffect(() => {
    if (!mapRef.current) return;

    mapInstance.current = L.map(mapRef.current).setView([-12.0464, -77.0428], 12);

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

    markersRef.current.forEach(marker => {
      mapInstance.current.removeLayer(marker);
    });
    markersRef.current = [];

    availableRequests.forEach(request => {
      if (request.latitude && request.longitude) {
        const statusColor = getStatusColor(request);
        const isSelected = selectedAssignment?.id === request.id;

        const marker = L.marker([request.latitude, request.longitude], {
          icon: createIcon(statusColor, 'request')
        })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: ${statusColor === 'primary' ? '#1976d2' : statusColor === 'warning' ? '#ed6c02' : '#2e7d32'};">${request.code}</h4>
              <p style="margin: 4px 0;"><strong>Material:</strong> ${request.material}</p>
              <p style="margin: 4px 0;"><strong>Usuario:</strong> ${request.userName}</p>
              <p style="margin: 4px 0;"><strong>Dirección:</strong> ${request.address}</p>
              <p style="margin: 4px 0;"><strong>Estado:</strong> <span style="color: ${statusColor === 'primary' ? '#1976d2' : statusColor === 'warning' ? '#ed6c02' : '#2e7d32'};">${getStatusText(request)}</span></p>
              <button onclick="window.selectAssignment && window.selectAssignment(${request.id})" 
                style="background: ${statusColor === 'primary' ? '#1976d2' : statusColor === 'warning' ? '#ed6c02' : '#2e7d32'}; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
                Seleccionar
              </button>
            </div>
          `);

        marker.requestId = request.id;
        markersRef.current.push(marker);

        marker.on('click', () => {
          if (onAssignmentSelect) {
            onAssignmentSelect(request);
          }
        });

        if (isSelected) {
          marker.openPopup();
        }
      }
    });

    assignments.forEach(assignment => {
      if (assignment.latitude && assignment.longitude) {
        const statusColor = getStatusColor(assignment);
        const isSelected = selectedAssignment?.id === assignment.id;

        const marker = L.marker([assignment.latitude, assignment.longitude], {
          icon: createIcon(statusColor, 'assignment')
        })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: ${statusColor === 'primary' ? '#1976d2' : statusColor === 'warning' ? '#ed6c02' : '#2e7d32'};">${assignment.code}</h4>
              <p style="margin: 4px 0;"><strong>Material:</strong> ${assignment.material}</p>
              <p style="margin: 4px 0;"><strong>Usuario:</strong> ${assignment.userName}</p>
              <p style="margin: 4px 0;"><strong>Recolector:</strong> ${assignment.assignedCollectorName || 'No asignado'}</p>
              <p style="margin: 4px 0;"><strong>Estado:</strong> <span style="color: ${statusColor === 'primary' ? '#1976d2' : statusColor === 'warning' ? '#ed6c02' : '#2e7d32'};">${getStatusText(assignment)}</span></p>
              <p style="margin: 4px 0;"><strong>Dirección:</strong> ${assignment.address}</p>
              <button onclick="window.selectAssignment && window.selectAssignment(${assignment.id})" 
                style="background: ${statusColor === 'primary' ? '#1976d2' : statusColor === 'warning' ? '#ed6c02' : '#2e7d32'}; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
                Seleccionar
              </button>
            </div>
          `);

        marker.assignmentId = assignment.id;
        markersRef.current.push(marker);

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

    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [assignments, availableRequests, selectedAssignment, onAssignmentSelect]);

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
    <Paper sx={{ 
      p: 3, 
      height: 600, // AUMENTADO de 400 a 600
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Mapa de Asignaciones en Tiempo Real
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {markersRef.current.length} ubicaciones en el mapa
      </Typography>
      
      <Box 
        ref={mapRef} 
        sx={{ 
          height: 500, // AUMENTADO de 300 a 500 - ¡ESTA ES LA PARTE IMPORTANTE!
          width: '100%',
          borderRadius: 1,
          overflow: 'hidden',
          flex: 1
        }} 
      />

      {/* Leyenda del mapa */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#1976d2' }} />
          <Typography variant="caption">Disponibles</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ed6c02' }} />
          <Typography variant="caption">Pendiente/En Progreso</Typography>
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