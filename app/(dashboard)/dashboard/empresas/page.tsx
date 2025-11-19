// app/(dashboard)/dashboard/empresas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';

interface Empresa {
  _id: string;
  razon_social: string;
  rfc: string;
  email?: string;
  telefono?: string;
  activa: boolean;
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas');
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (empresa?: Empresa) => {
    if (empresa) {
      setEditingEmpresa(empresa);
      setValue('razon_social', empresa.razon_social);
      setValue('rfc', empresa.rfc);
      setValue('email', empresa.email);
      setValue('telefono', empresa.telefono);
    } else {
      setEditingEmpresa(null);
      reset();
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmpresa(null);
    reset();
    setError('');
  };

  const onSubmit = async (data: any) => {
    try {
      const url = editingEmpresa
        ? `/api/empresas/${editingEmpresa._id}`
        : '/api/empresas';
      const method = editingEmpresa ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar empresa');
      }

      await loadEmpresas();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta empresa?')) return;

    try {
      const response = await fetch(`/api/empresas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadEmpresas();
      }
    } catch (error) {
      console.error('Error al eliminar empresa:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando empresas...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            Empresas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona las empresas proveedoras
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Empresa
        </Button>
      </Box>

      {empresas.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, textAlign: 'center' }}>
          <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No hay empresas registradas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comienza agregando tu primera empresa proveedora
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Agregar Empresa
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Razón Social</strong></TableCell>
                <TableCell><strong>RFC</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Teléfono</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell align="right"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {empresas.map((empresa) => (
                <TableRow key={empresa._id} hover>
                  <TableCell>{empresa.razon_social}</TableCell>
                  <TableCell>{empresa.rfc}</TableCell>
                  <TableCell>{empresa.email || '-'}</TableCell>
                  <TableCell>{empresa.telefono || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={empresa.activa ? 'Activa' : 'Inactiva'}
                      color={empresa.activa ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(empresa)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(empresa._id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingEmpresa ? 'Editar Empresa' : 'Nueva Empresa'}
          </DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                {...register('razon_social', { required: true })}
                label="Razón Social"
                fullWidth
                required
              />
              <TextField
                {...register('rfc', { required: true })}
                label="RFC"
                fullWidth
                required
                inputProps={{ maxLength: 13 }}
              />
              <TextField
                {...register('email')}
                label="Email"
                type="email"
                fullWidth
              />
              <TextField
                {...register('telefono')}
                label="Teléfono"
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingEmpresa ? 'Guardar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
