import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Chip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
  AdminPanelSettings // ← AGREGAR este import
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../Common/ConfirmationModal';

const Header = ({ onMenuClick }) => {
  const { user, logout, isAdmin } = useAuth(); 
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  // ← AGREGAR esta función que faltaba
  const handleSettings = () => {
    // Aquí puedes agregar navegación a configuración
    console.log('Abrir configuración');
    handleMenuClose();
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: '100%'
        }}
        elevation={2}
      >
        <Toolbar>
          {/* USANDO isMobile */}
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (


          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
)}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EcoCollet - Panel de Administración
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={isAdmin ? 'Administrador' : 'Usuario'} 
              color={isAdmin ? 'error' : 'primary'}
              size="small"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
            
            <Typography variant="body2" sx={{ color: 'white', display: { xs: 'none', sm: 'block' } }}>
              {user?.name} {user?.lastname}
            </Typography>

            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user?.name} {user?.lastname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                <Chip 
                  label={isAdmin ? 'Administrador' : 'Usuario'} 
                  color={isAdmin ? 'error' : 'primary'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </MenuItem>
            
            <MenuItem onClick={handleSettings}>
              <Settings sx={{ mr: 1 }} />
              Configuración
            </MenuItem>

            {isAdmin && (
              <MenuItem onClick={handleSettings}>
                <AdminPanelSettings sx={{ mr: 1 }} />
                Panel de Admin
              </MenuItem>
            )}
            
            <MenuItem onClick={() => setLogoutModalOpen(true)}>
              <Logout sx={{ mr: 1 }} />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <ConfirmationModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Cerrar Sesión"
        message="¿Estás seguro de que quieres cerrar la sesión?"
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        severity="warning"
      />
    </>
  );
};

export default Header;