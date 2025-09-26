import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import RequestTable from '../components/Sections/Requests/RequestTable';
import RequestFilters from '../components/Sections/Requests/RequestFilters';
import RequestModal from '../components/Sections/Requests/RequestModal';
import ConfirmationModal from '../components/Common/ConfirmationModal';
import { adminService } from '../services/admin';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('');

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Cargar solicitudes
  const loadRequests = async (filters = {}) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Loading requests with filters:', filters);
      
      let response;
      
      if (filters.searchTerm) {
        console.log('🔍 Searching requests with term:', filters.searchTerm);
        response = await adminService.searchRequests(filters.searchTerm);
      } else {
        console.log('📋 Getting all requests');
        response = await adminService.getAllRequests();
      }
      
      console.log('✅ Requests loaded:', response.data);
      
      let filteredRequests = response.data;

      // Aplicar filtros adicionales
      if (filters.statusFilter) {
        filteredRequests = filteredRequests.filter(
          req => req.status === filters.statusFilter
        );
      }

      if (filters.assignmentFilter) {
        filteredRequests = filteredRequests.filter(
          req => req.assignmentStatus === filters.assignmentFilter
        );
      }

      setRequests(filteredRequests);
      console.log('📊 Filtered requests:', filteredRequests.length);
      
    } catch (error) {
      console.error('❌ Error loading requests:', error);
      console.error('Error details:', error.response?.data);
      setError(`Error al cargar las solicitudes: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Requests component mounted');
    loadRequests();
  }, []);

  const handleSearch = () => {
    console.log('🔍 Executing search with:', { searchTerm, statusFilter, assignmentFilter });
    loadRequests({
      searchTerm,
      statusFilter,
      assignmentFilter
    });
  };

  const handleClearFilters = () => {
    console.log('🧹 Clearing filters');
    setSearchTerm('');
    setStatusFilter('');
    setAssignmentFilter('');
    loadRequests();
  };

  const handleEdit = (request) => {
    console.log('✏️ Editing request:', request);
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleDelete = (request) => {
    console.log('🗑️ Deleting request:', request);
    setSelectedRequest(request);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRequest) return;

    try {
      console.log('✅ Confirming deletion of request:', selectedRequest.id);
      await adminService.deleteRequest(selectedRequest.id);
      setSnackbar({ 
        open: true, 
        message: 'Solicitud eliminada correctamente', 
        severity: 'success' 
      });
      loadRequests();
    } catch (error) {
      console.error('❌ Error deleting request:', error);
      setSnackbar({ 
        open: true, 
        message: `Error al eliminar la solicitud: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    } finally {
      setDeleteModalOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleAssign = (request) => {
    console.log('👤 Assigning request:', request);
    setSnackbar({ 
      open: true, 
      message: 'Funcionalidad de asignación en desarrollo', 
      severity: 'info' 
    });
  };

  const handleViewLocation = (request) => {
    if (request.latitude && request.longitude) {
      const url = `https://maps.google.com/?q=${request.latitude},${request.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleSave = () => {
    setSnackbar({ 
      open: true, 
      message: 'Solicitud guardada correctamente', 
      severity: 'success' 
    });
    loadRequests();
  };

  // Función para probar la conexión manualmente
  const testConnection = async () => {
    console.log('🧪 Testing API connection...');
    try {
      const response = await adminService.getAllRequests();
      console.log('✅ Connection test successful:', response.data);
      setSnackbar({ 
        open: true, 
        message: `Conexión exitosa. ${response.data.length} solicitudes cargadas.`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setSnackbar({ 
        open: true, 
        message: `Error de conexión: ${error.message}`, 
        severity: 'error' 
      });
    }
  };

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header de la página */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Gestión de Solicitudes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {requests.length} solicitudes encontradas
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<Refresh />}
              onClick={() => loadRequests()}
              disabled={loading}
            >
              Actualizar
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={testConnection}
            >
              Probar Conexión
            </Button>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => setModalOpen(true)}
            >
              Nueva Solicitud
            </Button>
          </Box>
        </Box>

        {/* Filtros */}
        <RequestFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          assignmentFilter={assignmentFilter}
          onAssignmentFilterChange={setAssignmentFilter}
          onClearFilters={handleClearFilters}
        />

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Box sx={{ mt: 1 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => loadRequests()}
              >
                Reintentar
              </Button>
            </Box>
          </Alert>
        )}

        {/* Contenido */}
        {loading ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Cargando solicitudes...
            </Typography>
          </Paper>
        ) : (
          <RequestTable
            requests={requests}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAssign={handleAssign}
            onViewLocation={handleViewLocation}
          />
        )}

        {/* Modales */}
        <RequestModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onSave={handleSave}
        />

        <ConfirmationModal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedRequest(null);
          }}
          onConfirm={confirmDelete}
          title="Eliminar Solicitud"
          message={`¿Estás seguro de que quieres eliminar la solicitud ${selectedRequest?.code}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          severity="error"
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

export default Requests;