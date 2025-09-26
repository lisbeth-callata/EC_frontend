import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context
import { AuthProvider } from './context/AuthContext';

// Componentes
import PrivateRoute from './components/Layout/PrivateRoute';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import Users from './pages/Users';
import Weight from './pages/Weight';
import Collectors from './pages/Collectors';
import Assignments from './pages/Assignments';

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.04)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas - SOLO ADMIN */}
            <Route path="/dashboard" element={
              <PrivateRoute requireAdmin={true}>
                <Dashboard />
              </PrivateRoute>
            } />

            <Route path="/requests" element={
              <PrivateRoute requireAdmin={true}>
                <Requests />
              </PrivateRoute>
            } />

            <Route path="/users" element={
              <PrivateRoute requireAdmin={true}>
                <Users />
              </PrivateRoute>
            } />

            <Route path="/weights" element={
              <PrivateRoute requireAdmin={true}>
                <Weight />
              </PrivateRoute>
            } />

            <Route path="/collectors" element={
              <PrivateRoute>
                <Collectors />
              </PrivateRoute>
            } />

            <Route path="/assignments" element={
              <PrivateRoute>
                <Assignments />
              </PrivateRoute>
            } />

            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
export default App;