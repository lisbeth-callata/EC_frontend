import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  Button,
  IconButton,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Assignment,
  Scale,
  TrendingUp,
  Schedule,
  CheckCircle,
  Close,
  LocationOn,
  Recycling,
  AccessTime,
  DoneAll
} from '@mui/icons-material';
import { formatDate, formatWeight } from '../../../utils/helpers';

const CollectorDetail = ({ open, onClose, collector, assignments, stats: collectorStatsData = {} }) => {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!collector) return null;

  const collectorStats = [
    {
      icon: <Assignment />,
      label: 'Total Asignaciones',
      value: collectorStatsData.totalAssignments || 0,
      color: 'primary'
    },
    {
      icon: <CheckCircle />,
      label: 'Completadas',
      value: collectorStatsData.completedAssignments || 0,
      color: 'success'
    },
    {
      icon: <Scale />,
      label: 'Peso Total',
      value: formatWeight(collectorStatsData.totalWeight || 0),
      color: 'warning'
    },
    {
      icon: <TrendingUp />,
      label: 'Rendimiento',
      value: `${collectorStatsData.performance || 0}%`,
      color: 'info'
    }
  ];

  // Separar asignaciones
  const activeAssignments = assignments.filter(assignment => 
    assignment.status === 'PENDING' || assignment.assignmentStatus === 'IN_PROGRESS'
  );
  
  const completedAssignments = assignments.filter(assignment => 
    assignment.status === 'COLLECTED' || assignment.assignmentStatus === 'COMPLETED'
  );

  const allAssignments = assignments;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status, assignmentStatus) => {
    if (status === 'COLLECTED' || assignmentStatus === 'COMPLETED') return 'success';
    if (assignmentStatus === 'IN_PROGRESS') return 'info';
    if (status === 'PENDING' || assignmentStatus === 'PENDING') return 'warning';
    return 'default';
  };

  const getStatusText = (status, assignmentStatus) => {
    if (status === 'COLLECTED' || assignmentStatus === 'COMPLETED') return 'Completado';
    if (assignmentStatus === 'IN_PROGRESS') return 'En Progreso';
    if (status === 'PENDING' || assignmentStatus === 'PENDING') return 'Pendiente';
    return 'Disponible';
  };

  const getStatusIcon = (status, assignmentStatus) => {
    if (status === 'COLLECTED' || assignmentStatus === 'COMPLETED') return <CheckCircle />;
    if (assignmentStatus === 'IN_PROGRESS') return <AccessTime />;
    return <Schedule />;
  };

  const currentAssignments = tabValue === 0 ? allAssignments : 
                           tabValue === 1 ? activeAssignments : completedAssignments;

  const paginatedAssignments = currentAssignments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" // Cambiado de "xl" a "lg" para mejor proporción
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '95vh',
          width: '95%', // Controlamos el ancho máximo
          maxWidth: '1200px' // Ancho máximo fijo
        }
      }}
    >
      {/* Header con botón de cerrar */}
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'primary.main',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'white',
              color: 'primary.main',
              width: 60,
              height: 60,
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {collector.name?.charAt(0)}{collector.lastname?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {collector.name} {collector.lastname}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={collector.isActive ? 'Activo' : 'Inactivo'} 
                color={collector.isActive ? 'success' : 'default'}
                variant="filled"
                sx={{ color: 'white', backgroundColor: collector.isActive ? 'success.main' : 'grey.600' }}
              />
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Recolector • @{collector.username}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: 'white',
            '&:hover': { 
              backgroundColor: 'primary.dark',
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2, p: 3 }}>
        <Grid container spacing={3}>
          {/* Información personal - AHORA OCUPA 3 COLUMNAS */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, height: '100%' }} elevation={2}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person /> Información Personal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium" color="text.secondary" gutterBottom>
                    Nombre completo
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {collector.name} {collector.lastname}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium" color="text.secondary" gutterBottom>
                    <Email sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {collector.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium" color="text.secondary" gutterBottom>
                    <Phone sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Teléfono
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {collector.phone || 'No registrado'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Estadísticas - AHORA OCUPA 9 COLUMNAS */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp /> Estadísticas de Rendimiento
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {collectorStats.map((stat, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Card 
                      sx={{ 
                        textAlign: 'center',
                        p: 2,
                        backgroundColor: `${stat.color}.light`,
                        color: `${stat.color}.contrastText`,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2
                        },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}
                      elevation={0}
                    >
                      <CardContent sx={{ p: '8px !important' }}>
                        <Box sx={{ color: 'inherit', mb: 1 }}>
                          {stat.icon}
                        </Box>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                          {stat.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    Progreso de rendimiento
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {collectorStatsData.performance || 0}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={collectorStatsData.performance || 0}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'grey.300'
                  }}
                  color={
                    (collectorStatsData.performance || 0) >= 80 ? 'success' :
                    (collectorStatsData.performance || 0) >= 60 ? 'warning' : 'error'
                  }
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Bajo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Excelente
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Asignaciones - AHORA OCUPA 12 COLUMNAS (TODO EL ANCHO) */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment /> Historial de Asignaciones
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<Assignment />}
                    label={`${allAssignments.length} Total`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    icon={<Schedule />}
                    label={`${activeAssignments.length} Activas`}
                    color="warning"
                    variant="outlined"
                  />
                  <Chip 
                    icon={<DoneAll />}
                    label={`${completedAssignments.length} Completadas`}
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </Box>

              {/* Tabs para filtrar asignaciones */}
              <Paper sx={{ mb: 3, backgroundColor: 'transparent' }} elevation={0}>
                <Tabs 
                  value={tabValue} 
                  onChange={(e, newValue) => {
                    setTabValue(newValue);
                    setPage(0);
                  }}
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 'bold',
                      minWidth: 'auto',
                      px: 3,
                      py: 1,
                      borderRadius: 1,
                      mx: 0.5
                    }
                  }}
                >
                  <Tab 
                    icon={<Assignment />} 
                    iconPosition="start"
                    label={`Todas (${allAssignments.length})`} 
                  />
                  <Tab 
                    icon={<Schedule />} 
                    iconPosition="start"
                    label={`Activas (${activeAssignments.length})`} 
                  />
                  <Tab 
                    icon={<CheckCircle />} 
                    iconPosition="start"
                    label={`Completadas (${completedAssignments.length})`} 
                  />
                </Tabs>
              </Paper>

              {allAssignments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Recycling sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No hay asignaciones registradas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Este recolector no tiene asignaciones activas o completadas.
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Tabla de asignaciones */}
                  <TableContainer 
                    component={Paper} 
                    elevation={1}
                    sx={{ 
                      borderRadius: 2,
                      maxHeight: 400,
                      border: 1,
                      borderColor: 'divider'
                    }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white', fontSize: '0.9rem' }}>
                            Material
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white', fontSize: '0.9rem' }}>
                            Ubicación
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white', fontSize: '0.9rem' }}>
                            Estado
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white', fontSize: '0.9rem' }}>
                            Fecha
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white', fontSize: '0.9rem' }}>
                            Peso
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white', fontSize: '0.9rem' }}>
                            Código
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedAssignments.map((assignment) => (
                          <TableRow 
                            key={assignment.id}
                            sx={{ 
                              '&:last-child td, &:last-child th': { border: 0 },
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ color: 'primary.main' }}>
                                  {getStatusIcon(assignment.status, assignment.assignmentStatus)}
                                </Box>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {assignment.material}
                                  </Typography>
                                  {assignment.description && (
                                    <Typography variant="caption" color="text.secondary">
                                      {assignment.description}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOn sx={{ fontSize: 16, color: 'primary.main' }} />
                                <Box>
                                  <Typography variant="body2">
                                    {assignment.addressUser || assignment.address}
                                  </Typography>
                                  {assignment.district && (
                                    <Typography variant="caption" color="text.secondary">
                                      {assignment.district}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={getStatusText(assignment.status, assignment.assignmentStatus)}
                                color={getStatusColor(assignment.status, assignment.assignmentStatus)}
                                size="small"
                                variant="filled"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(assignment.createdAt)}
                              </Typography>
                              {assignment.updatedAt && assignment.updatedAt !== assignment.createdAt && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Actualizado: {formatDate(assignment.updatedAt)}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Scale sx={{ fontSize: 16, color: 'warning.main' }} />
                                <Typography variant="body2" fontWeight="medium">
                                  {formatWeight(assignment.weight)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={assignment.code}
                                variant="outlined"
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Paginación */}
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={currentAssignments.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => 
                      `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                    }
                    sx={{ mt: 2 }}
                  />
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Botón de cerrar en el footer */}
      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button 
          onClick={onClose}
          variant="contained"
          startIcon={<Close />}
          sx={{ minWidth: 120 }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CollectorDetail;