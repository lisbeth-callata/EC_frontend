import React, { useState } from 'react';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false); 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
    setDesktopOpen(false);
  };

  const drawerWidth = 280;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar
        mobileOpen={mobileOpen}
        desktopOpen={desktopOpen} 
        onMobileClose={handleMobileClose}
        drawerWidth={drawerWidth}
        
      />

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            xs: '100%',
            md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' // ← Ancho dinámico
          },
          marginLeft: { 
            xs: 0,
            md: desktopOpen ? `${drawerWidth}px` : 0 // ← Margen dinámico
          },
          marginTop: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'background.default',
          overflow: 'auto', // ← SCROLL SIEMPRE VISIBLE
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />

        {/* Contenido de la página */}
        <Box sx={{
          maxWidth: 1200,
          mx: 'auto',
        }}>
          {children}
        </Box>
      </Box>

      {/* Overlay para mobile */}
      {isMobile && mobileOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: (theme) => theme.zIndex.drawer - 1,
            display: { xs: 'block', md: 'none' },
          }}
          onClick={handleMobileClose}
        />
      )}
    </Box>
  );
};

export default MainLayout;