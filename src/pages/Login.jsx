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
  CircularProgress
} from '@mui/material';
import { Recycling, Lock, Warning } from '@mui/icons-material';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const { login, user, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir si ya está autenticado como admin
  useEffect(() => {
    if (user && user.role === 'ROLE_ADMIN') {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Limpiar error cuando se cambian los campos
  useEffect(() => {
    if (error || loginError) {
      clearError();
      setLoginError('');
    }
  }, [credentials.username, credentials.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    try {
      const result = await login(credentials.username, credentials.password);
      
      if (result.success) {
        if (result.data.role === 'ROLE_ADMIN') {
          navigate('/dashboard', { replace: true });
        } else {
          // Usuario no es administrador - cerrar sesión y mostrar error
          await logoutNonAdmin();
          setLoginError('Acceso restringido. Solo personal autorizado puede acceder al panel de administración.');
        }
      } else {
        setLoginError(result.error);
      }
    } catch (error) {
      setLoginError('Error en el servidor. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para cerrar sesión de usuarios no administradores
  const logoutNonAdmin = async () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // Forzar actualización del contexto
    window.location.reload();
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  // Si está cargando y hay un usuario, verificar si es admin
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
            Verificando acceso...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Si hay un usuario pero no es admin, mostrar mensaje de acceso denegado
  if (user && user.role !== 'ROLE_ADMIN') {
    return (
      <Container component="main" maxWidth="sm">
        <Box sx={{ 
          mt: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center'
        }}>
          <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
            <Warning color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" color="error" gutterBottom>
              Acceso Denegado
            </Typography>
            <Typography variant="h6" gutterBottom>
              Panel de Administración
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              No tienes permisos para acceder al panel de administración de EcoCollet.
            </Typography>
            <Button 
              variant="contained" 
              onClick={logoutNonAdmin}
              sx={{ mt: 2 }}
            >
              Volver al Inicio
            </Button>
          </Paper>
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

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            Acceso restringido al personal autorizado
          </Typography>

          {(error || loginError) && (
            <Alert 
              severity="error" 
              sx={{ width: '100%', mb: 2 }}
              icon={<Warning />}
            >
              {error || loginError}
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
              {isSubmitting ? 'Verificando acceso...' : 'Iniciar Sesión'}
            </Button>
          </Box>

          {/* Información de prueba SOLO para desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1, width: '100%' }}>
              <Typography variant="body2" color="text.secondary" align="center">
                <strong>Credenciales de prueba (Admin):</strong><br />
                Usuario: admin@ecocollet.com<br />
                Contraseña: admin123
              </Typography>
              <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
                <strong>Nota:</strong> Solo usuarios con rol ADMIN pueden acceder
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Información de seguridad */}
        <Paper elevation={1} sx={{ p: 2, mt: 2, width: '100%', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            🔒 Acceso seguro | Solo personal municipal autorizado
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;