import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { Recycling, Lock, Warning } from '@mui/icons-material';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  
  const { login, user, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar si estamos en Vercel
  const isVercel = window.location.hostname.includes('vercel.app');

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Detectar errores de red
  useEffect(() => {
    if (error && (error.includes('conexión') || error.includes('Network'))) {
      setNetworkError(true);
    } else {
      setNetworkError(false);
    }
  }, [error]); // ✅ Agregar error como dependencia

  // Limpiar error cuando se cambian los campos
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [credentials.username, credentials.password]); // ✅ Solo estas dependencias

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNetworkError(false);

    const result = await login(credentials.username, credentials.password);
    
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const testConnection = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('https://ec-backend-drg8.onrender.com/api/test/status');
      if (response.ok) {
        setNetworkError(false);
        alert('✅ Conexión con el servidor exitosa');
      } else {
        setNetworkError(true);
        alert('❌ Error de conexión con el servidor');
      }
    } catch (error) {
      setNetworkError(true);
      alert('❌ No se pudo conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container component="main" maxWidth="xs">
        <Box sx={{ 
          mt: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo y título */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Recycling color="primary" sx={{ fontSize: 40, mr: 1 }} />
            <Typography component="h1" variant="h4" color="primary">
              EcoCollet
            </Typography>
          </Box>
          
          <Typography component="h2" variant="h5" gutterBottom>
            Panel de Administración
          </Typography>

          {isVercel && (
            <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
              <strong>Modo Vercel:</strong> Aplicación en entorno de producción
            </Alert>
          )}

          {networkError && (
            <Alert 
              severity="error" 
              sx={{ width: '100%', mb: 2 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={testConnection}
                  disabled={isSubmitting}
                >
                  Probar Conexión
                </Button>
              }
            >
              <Box>
                <Typography fontWeight="bold">Error de conexión</Typography>
                <Typography variant="body2">
                  No se puede conectar con el servidor. Verifica:
                </Typography>
                <Typography variant="body2">
                  • Tu conexión a internet
                  • Que el servidor esté funcionando
                  • La configuración CORS del backend
                </Typography>
              </Box>
            </Alert>
          )}

          {error && !networkError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Email o Usuario"
              name="username"
              autoComplete="username"
              autoFocus
              value={credentials.username}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <Lock />}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Box>


          {/* Información de debug para Vercel */}
          {isVercel && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'warning.light', borderRadius: 1, width: '100%' }}>
              <Typography variant="caption" align="center">
                <Warning sx={{ fontSize: 16, verticalAlign: 'middle' }} />
                <strong> Debug Vercel:</strong> Si el login falla, verifica:
                <br/>1. CORS configurado en el backend
                <br/>2. Servidor backend funcionando
                <br/>3. Variables de entorno en Vercel
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;