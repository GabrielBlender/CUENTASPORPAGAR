// app/(dashboard)/empresas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Business,
  Add,
  Edit,
  Delete,
  Email,
  ArrowForward,
} from '@mui/icons-material';

interface Empresa {
  _id: string;
  nombre: string;
  rfc: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export default function EmpresasPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    rfc: '',
    direccion: '',
    telefono: '',
    email: '',
  });

  useEffect(() => {
    fetchEmpresas();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const res = await fetch('/api/empresas');
      if (res.ok) {
        const data = await res.json();
        setEmpresas(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmpresa = async () => {
    try {
      // Validar campos requeridos
      if (!formData.nombre || formData.nombre.trim().length < 3) {
        alert('El nombre de la empresa debe tener al menos 3 caracteres');
        return;
      }

      if (!formData.rfc || formData.rfc.trim().length === 0) {
        alert('El RFC/RUT es requerido');
        return;
      }

      // Transformar formData al formato esperado por el schema
      const payload: any = {
        nombre: formData.nombre.trim(),
        rfc: formData.rfc.trim().toUpperCase(),
      };

      // Agregar campos opcionales solo si tienen valor
      if (formData.direccion && formData.direccion.trim()) {
        payload.direccion = formData.direccion.trim();
      }
      if (formData.email && formData.email.trim()) {
        payload.email = formData.email.trim();
      }
      if (formData.telefono && formData.telefono.trim()) {
        payload.telefono = formData.telefono.trim();
      }

      const res = await fetch('/api/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setOpenDialog(false);
        setFormData({ nombre: '', rfc: '', direccion: '', telefono: '', email: '' });
        fetchEmpresas();
      } else {
        alert(data.error || 'Error al crear empresa');
      }
    } catch (error) {
      console.error('Error creating empresa:', error);
      alert('Error al crear empresa');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#2563EB', width: 48, height: 48 }}>
            {currentUser?.nombre?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="700" color="text.primary">
              {currentUser?.nombre || 'Usuario'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentUser?.role === 'admin' ? 'Administrador' : 'Usuario'}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          startIcon={<ArrowForward />}
          sx={{ textTransform: 'none' }}
        >
          Cerrar Sesión
        </Button>
      </Box>

      {/* Title */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom color="text.primary">
          Panel de Gestión Empresarial
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Gestiona las cuentas por pagar de todas tus empresas
        </Typography>

        {currentUser?.role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{
              textTransform: 'none',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            Nueva Empresa
          </Button>
        )}
      </Box>

      {/* Grid de Empresas */}
      <Grid container spacing={3}>
        {empresas.map((empresa) => (
          <Grid item xs={12} sm={6} md={4} key={empresa._id}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: '#E2E8F0',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#2563EB',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                },
              }}
              onClick={() => router.push(`/empresas/${empresa._id}`)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#2563EB', width: 48, height: 48 }}>
                      <Business />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="700" color="text.primary">
                        {empresa.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {empresa.email || 'Sin email'}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" sx={{ color: 'text.secondary' }}>
                    <ArrowForward />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {empresa.email || 'uhrnnogales@gmail.com'}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/empresas/${empresa._id}`);
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Gestionar Cuentas
                    </Button>
                    {currentUser?.role === 'admin' && (
                      <>
                        <IconButton size="small" color="primary" onClick={(e) => e.stopPropagation()}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={(e) => e.stopPropagation()}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog Nueva Empresa */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="700">
            Crear Nueva Empresa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingresa los datos de la nueva empresa.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Nombre de la Empresa *"
              placeholder="Ej: Mi Empresa S.A."
              fullWidth
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
            <TextField
              label="RFC/RUT/CUIT *"
              placeholder="Ej: ABC123456XYZ o 20-12345678-9"
              fullWidth
              required
              value={formData.rfc}
              onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
            />
            <TextField
              label="Dirección"
              placeholder="Ej: Av. Principal 123"
              fullWidth
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            />
            <TextField
              label="Teléfono"
              placeholder="Ej: +54 11 1234-5678"
              fullWidth
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            />
            <TextField
              label="Email"
              placeholder="Ej: contacto@miempresa.com"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setOpenDialog(false)}
                sx={{ textTransform: 'none' }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleCreateEmpresa}
                disabled={!formData.nombre}
                sx={{ textTransform: 'none', boxShadow: 'none' }}
              >
                Crear Empresa
              </Button>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
