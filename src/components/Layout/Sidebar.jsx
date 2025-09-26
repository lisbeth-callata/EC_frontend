import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Chip,
  IconButton,
  
} from '@mui/material';
import {
  Dashboard,
  RequestPage,
  People,
  Scale,
  Recycling,
  Close,
  Group, // ← AGREGAR ESTE IMPORT
  Assignment // ← AGREGAR ESTE IMPORT TAMBIÉN
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    description: 'Resumen general del sistema'
  },
  {
    text: 'Solicitudes',
    icon: <RequestPage />,
    path: '/requests',
    description: 'Gestionar solicitudes de recolección'
  },
  {
    text: 'Usuarios',
    icon: <People />,
    path: '/users',
    description: 'Administrar usuarios del sistema'
  },
  {
    text: 'Pesos',
    icon: <Scale />,
    path: '/weights',
    description: 'Estadísticas de peso recolectado'
  },
  {
    text: 'Recolectores',
    icon: <Group />,
    path: '/collectors',
    description: 'Gestionar equipo de recolección'
  },
  {
    text: 'Asignaciones',
    icon: <Assignment />,
    path: '/assignments',
    description: 'Asignar y seguir solicitudes'
  },

];

const Sidebar = ({ mobileOpen, desktopOpen, onMobileClose, drawerWidth = 280 }) => {
  const location = useLocation();
  const { user } = useAuth();

  

  const drawerContent = (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      {/* Header del sidebar con botón de cerrar (solo mobile) */}
      <Box sx={{ 
        display: { xs: 'flex', md: 'none' }, 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Recycling color="primary" />
          <Typography variant="h6" color="primary" fontWeight="bold">
            EcoCollet
          </Typography>
        </Box>
        <IconButton onClick={onMobileClose}>
          <Close />
        </IconButton>
      </Box>

      {/* Logo y título */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Recycling 
          color="primary" 
          sx={{ fontSize: 48, mb: 1 }} 
        />
        <Typography 
          variant="h6" 
          color="primary" 
          fontWeight="bold"
          gutterBottom
        >
          EcoCollet
        </Typography>
        <Chip 
          label="Panel Admin" 
          size="small" 
          color="primary" 
          variant="outlined" 
        />
      </Box>

      <Divider />

      {/* Menú de navegación */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem
              button
              component={Link}
              to={item.path}
              key={item.text}
              selected={isActive}
              onClick={onMobileClose} 
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? 'white' : 'primary.main',
                  minWidth: 45,
                }}
              >
                {item.icon}
              </ListItemIcon>
              
              <Box sx={{ flex: 1 }}>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: isActive ? 'bold' : 'normal'
                  }}
                />
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ display: { xs: 'none', lg: 'block' } }}
                >
                  {item.description}
                </Typography>
              </Box>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Información del usuario */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Usuario activo
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          {user?.name} {user?.lastname}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.email}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Drawer para desktop - AHORA ES TEMPORAL */}
      <Drawer
        variant="temporary"
        open={desktopOpen}
        onClose={onMobileClose} // ← No hacer nada en desktop
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            position: 'fixed',
            top: '64px',
            height: 'calc(100% - 64px)',
            border: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            zIndex: (theme) => theme.zIndex.drawer,
            overflowY: 'auto',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer para mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            top: '64px',
            height: 'calc(100% - 64px)',
            border: 'none',
            zIndex: (theme) => theme.zIndex.drawer,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;