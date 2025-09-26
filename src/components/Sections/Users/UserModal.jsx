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
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { adminService } from '../../../services/admin';

const UserModal = ({ open, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'ROLE_USER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastname: user.lastname || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '', // No mostrar password existente
        role: user.role || 'ROLE_USER'
      });
    } else {
      setFormData({
        name: '',
        lastname: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'ROLE_USER'
      });
    }
    setError('');
    setShowPassword(false);
  }, [user, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (user) {
        // Actualizar usuario existente
        const updateData = { ...formData };
        // Si no se cambió la contraseña, no enviarla
        if (!updateData.password) {
          delete updateData.password;
        }
        await adminService.updateUser(user.id, updateData);
      } else {
        // Crear nuevo usuario
        await adminService.createUser(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar el usuario');
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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        {user && (
          <Typography variant="body2" color="text.secondary">
            ID: {user.id}
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
                label="Nombre"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apellido"
                value={formData.lastname}
                onChange={(e) => handleChange('lastname', e.target.value)}
                required
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre de usuario"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                required
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.role}
                  label="Rol"
                  onChange={(e) => handleChange('role', e.target.value)}
                >
                  <MenuItem value="ROLE_USER">Usuario</MenuItem>
                  <MenuItem value="ROLE_COLLECTOR">Recolector</MenuItem>
                  <MenuItem value="ROLE_ADMIN">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={user ? "Nueva Contraseña (dejar vacío para no cambiar)" : "Contraseña"}
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required={!user}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
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

export default UserModal;