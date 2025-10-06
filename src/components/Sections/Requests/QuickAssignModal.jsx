import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Chip,
    CircularProgress,
    Paper
} from '@mui/material';
import { Assignment } from '@mui/icons-material';

const QuickAssignModal = ({
    open,
    onClose,
    request,
    collectors,
    onAssign,
    assigning
}) => {
    const [selectedCollector, setSelectedCollector] = useState('');

    const handleAssign = () => {
        if (selectedCollector && request) {
            onAssign(request.id, selectedCollector);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment color="primary" />
                    Asignar Solicitud Rápida
                </Box>
            </DialogTitle>

            <DialogContent>
                {/* Información de la solicitud */}
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                        Solicitud a asignar:
                    </Typography>
                    <Typography variant="body2">
                        <strong>Código:</strong> {request?.code}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Material:</strong> {request?.material}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Ubicación:</strong> {request?.address}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Usuario:</strong> {request?.userName} {request?.userLastname}
                    </Typography>
                </Paper>

                {/* Selector de recolector */}
                <FormControl fullWidth>
                    <InputLabel>Recolector disponible</InputLabel>
                    <Select
                        value={selectedCollector}
                        label="Recolector disponible"
                        onChange={(e) => setSelectedCollector(e.target.value)}
                    >
                        <MenuItem value="">
                            <em>Seleccionar recolector</em>
                        </MenuItem>
                        {collectors.map(collector => (
                            <MenuItem key={collector.id} value={collector.id}>
                                <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                        {collector.name} {collector.lastname}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {collector.phone || 'Sin teléfono'} • {collector.email}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        @{collector.username}
                                    </Typography>
                                    {/* Mostrar estado basado en datos reales */}
                                    <Chip
                                        label={collector.status || (collector.isActive ? 'Disponible' : 'Ocupado')}
                                        size="small"
                                        color={collector.isActive ? 'success' : 'default'}
                                        sx={{ mt: 0.5 }}
                                    />
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {collectors.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                        No hay recolectores disponibles en este momento
                    </Typography>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={assigning}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleAssign}
                    variant="contained"
                    disabled={!selectedCollector || assigning}
                    startIcon={assigning ? <CircularProgress size={20} /> : <Assignment />}
                >
                    {assigning ? 'Asignando...' : 'Asignar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuickAssignModal;