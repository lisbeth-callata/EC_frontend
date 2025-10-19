import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Alert
} from '@mui/material';
import { adminService } from '../../../services/admin';

const RequestModal = ({ open, onClose, request, onSave }) => {
  const [formData, setFormData] = useState({
    material: '',
    description: '',
    weight: '',
    status: 'PENDING'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (request) {
      setFormData({
        material: request.material || '',
        description: request.description || '',
        weight: request.weight || '',
        status: request.status || 'PENDING'
      });
    } else {
      setFormData({
        material: '',
        description: '',
        weight: '',
        status: 'PENDING'
      });
    }
    setError('');
  }, [request, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (request) {
        // Actualizar solicitud existente
        await adminService.updateRequest(request.id, {
          ...request,
          material: formData.material,
          description: formData.description,
          weight: parseFloat(formData.weight) || null,
          status: formData.status
        });
      }
      onSave();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {request ? 'Editar Solicitud' : 'Nueva Solicitud'}
        {request && (
          <Typography variant="body2" color="text.secondary">
            Código: {request.code}
          </Typography>
        )}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Material"
                value={formData.material}
                onChange={(e) => handleChange('material', e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.status}
                  label="Estado"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="PENDING">Pendiente</MenuItem>
                  <MenuItem value="SCHEDULED">Programado</MenuItem>
                  <MenuItem value="COLLECTED">Recolectado</MenuItem>
                  <MenuItem value="CANCELLED">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Peso (kg)"
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                inputProps={{ step: "0.1", min: "0" }}
                margin="normal"
              />
            </Grid>

            {request && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Usuario"
                    value={`${request.userName} ${request.userLastname}`}
                    margin="normal"
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ubicación"
                    value={request.address || 'No especificada'}
                    margin="normal"
                    disabled
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RequestModal;