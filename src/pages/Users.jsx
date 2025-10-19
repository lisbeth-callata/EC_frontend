import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { Add, Refresh, Group, Person, PersonOff } from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import UserTable from '../components/Sections/Users/UserTable';
import UserFilters from '../components/Sections/Users/UserFilters';
import UserModal from '../components/Sections/Users/UserModal';
import ConfirmationModal from '../components/Common/ConfirmationModal';
import { adminService } from '../services/admin';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Pestañas y filtros
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);


  const applyFilters = useCallback((usersList, tab, search, role, status) => {
    let filtered = [...usersList];
    if (tab === 1) {
      filtered = filtered.filter(user => user.requestsCount > 0);
    } else if (tab === 2) {
      filtered = filtered.filter(user => user.requestsCount === 0);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.lastname?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.includes(search))
      );
    }
    if (role) {
      filtered = filtered.filter(user => user.role === role);
    }

    if (status === 'active') {
      filtered = filtered.filter(user => user.requestsCount > 0);
    } else if (status === 'inactive') {
      filtered = filtered.filter(user => user.requestsCount === 0);
    }

    setFilteredUsers(filtered);
  }, []);
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Loading users...');

      const [usersResponse, requestsResponse] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllRequests()
      ]);

      console.log('✅ Users loaded:', usersResponse.data);
      console.log('✅ Requests loaded:', requestsResponse.data);

      const usersWithRequests = usersResponse.data.map(user => {
        const userRequests = requestsResponse.data.filter(
          request => request.userId === user.id
        );
        return {
          ...user,
          requests: userRequests,
          requestsCount: userRequests.length
        };
      });

      setUsers(usersWithRequests);
      applyFilters(usersWithRequests, activeTab, searchTerm, roleFilter, statusFilter);

    } catch (error) {
      console.error('❌ Error loading users:', error);
      if (error.code === 'ECONNABORTED') {
        setError('El servidor está tardando mucho en responder. Por favor, intenta nuevamente.');
      } else {
        setError(`Error al cargar los usuarios: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, roleFilter, statusFilter, applyFilters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (users.length > 0) {
      applyFilters(users, activeTab, searchTerm, roleFilter, statusFilter);
    }
  }, [users, activeTab, searchTerm, roleFilter, statusFilter, applyFilters]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearch = () => {
    applyFilters(users, activeTab, searchTerm, roleFilter, statusFilter);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    applyFilters(users, activeTab, '', '', '');
  };

  const handleEdit = (user) => {
    console.log('✏️ Editing user:', user);
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDelete = (user) => {
    console.log('🗑️ Deleting user:', user);
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      console.log('✅ Confirming deletion of user:', selectedUser.id);
      await adminService.deleteUser(selectedUser.id);
      setSnackbar({
        open: true,
        message: 'Usuario eliminado correctamente',
        severity: 'success'
      });
      loadUsers();
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      setSnackbar({
        open: true,
        message: `Error al eliminar el usuario: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleSave = () => {
    setSnackbar({
      open: true,
      message: 'Usuario guardado correctamente',
      severity: 'success'
    });
    loadUsers();
  };

  const getTabLabel = (tabIndex) => {
    const total = users.length;

    const activeCount = users.filter(user => user.requestsCount > 0).length;
    const inactiveCount = users.filter(user => user.requestsCount === 0).length;

    switch (tabIndex) {
      case 0: return `Todos (${total})`;
      case 1: return `Activos (${activeCount})`;
      case 2: return `Inactivos (${inactiveCount})`;
      default: return 'Todos';
    }
  };

  const testUsersConnection = async () => {
    try {
      const response = await adminService.getAllUsers();
      setSnackbar({
        open: true,
        message: `Conexión exitosa. ${response.data.length} usuarios encontrados.`,
        severity: 'success'
      });
    } catch (error) {
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
              Gestión de Usuarios
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {filteredUsers.length} usuarios encontrados de {users.length} totales
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => loadUsers()}
              disabled={loading}
            >
              Actualizar
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={testUsersConnection}
              disabled={loading}
            >
              Probar Conexión
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setModalOpen(true)}
            >
              Nuevo Usuario
            </Button>
          </Box>
        </Box>

        {/* Pestañas */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<Group />} label={getTabLabel(0)} />
            <Tab icon={<Person />} label={getTabLabel(1)} />
            <Tab icon={<PersonOff />} label={getTabLabel(2)} />
          </Tabs>
        </Paper>

        {/* Filtros */}
        <UserFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
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
                onClick={() => loadUsers()}
              >
                Reintentar
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={testUsersConnection}
                sx={{ ml: 1 }}
              >
                Probar Conexión
              </Button>
            </Box>
          </Alert>
        )}

        {/* Contenido */}
        {loading ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Cargando usuarios...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Esto puede tomar unos segundos debido a la carga inicial del servidor.
            </Typography>
          </Paper>
        ) : (
          <UserTable
            users={filteredUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            activeTab={activeTab}
          />
        )}

        {/* Modales */}
        <UserModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSave={handleSave}
        />

        <ConfirmationModal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={confirmDelete}
          title="Eliminar Usuario"
          message={`¿Estás seguro de que quieres eliminar al usuario ${selectedUser?.name} ${selectedUser?.lastname}? Esta acción no se puede deshacer.`}
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

export default Users;