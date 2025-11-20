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
  DialogContentText,
  DialogActions,
  TextField,
  Stack,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Business,
  Add,
  Edit,
  Delete,
  Email,
  ArrowForward,
  Warning,
  Download,
  Description,
  PictureAsPdf,
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
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [empresaToEdit, setEmpresaToEdit] = useState<Empresa | null>(null);
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    rfc: '',
    direccion: '',
    telefono: '',
    email: '',
  });
  const [editFormData, setEditFormData] = useState({
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
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    router.push('/login');
  };

  const handleOpenDeleteDialog = async (empresa: Empresa) => {
    setEmpresaToDelete(empresa);
    setDeleteConfirmName('');
    
    // Obtener facturas de la empresa
    try {
      const res = await fetch(`/api/invoices?empresa_id=${empresa._id}`);
      if (res.ok) {
        const data = await res.json();
        setFacturas(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching facturas:', error);
    }
    
    setOpenDeleteDialog(true);
  };

  const handleOpenEditDialog = (empresa: Empresa) => {
    setEmpresaToEdit(empresa);
    setEditFormData({
      nombre: empresa.nombre || '',
      rfc: empresa.rfc || '',
      direccion: empresa.direccion || '',
      telefono: empresa.telefono || '',
      email: empresa.email || '',
    });
    setOpenEditDialog(true);
  };

  const handleEditEmpresa = async () => {
    if (!empresaToEdit) return;

    try {
      // Validar campos requeridos
      if (!editFormData.nombre || editFormData.nombre.trim().length < 3) {
        alert('El nombre de la empresa debe tener al menos 3 caracteres');
        return;
      }

      if (!editFormData.rfc || editFormData.rfc.trim().length === 0) {
        alert('El RFC/RUT es requerido');
        return;
      }

      // Transformar formData al formato esperado
      const payload: any = {
        nombre: editFormData.nombre.trim(),
        rfc: editFormData.rfc.trim().toUpperCase(),
      };

      // Agregar campos opcionales solo si tienen valor
      if (editFormData.direccion && editFormData.direccion.trim()) {
        payload.direccion = editFormData.direccion.trim();
      }
      if (editFormData.email && editFormData.email.trim()) {
        payload.email = editFormData.email.trim();
      }
      if (editFormData.telefono && editFormData.telefono.trim()) {
        payload.telefono = editFormData.telefono.trim();
      }

      const res = await fetch(`/api/empresas/${empresaToEdit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setOpenEditDialog(false);
        setEmpresaToEdit(null);
        setEditFormData({ nombre: '', rfc: '', direccion: '', telefono: '', email: '' });
        fetchEmpresas();
        alert('Empresa actualizada correctamente');
      } else {
        alert(data.error || 'Error al actualizar empresa');
      }
    } catch (error) {
      console.error('Error updating empresa:', error);
      alert('Error al actualizar empresa');
    }
  };

  const handleDownloadAllFiles = async () => {
    if (!empresaToDelete || facturas.length === 0) return;

    for (const factura of facturas) {
      // Descargar XML
      if (factura.archivo_xml) {
        try {
          const link = document.createElement('a');
          link.href = factura.archivo_xml;
          link.download = `${factura.cfdi?.folio || 'factura'}.xml`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Error descargando XML:', error);
        }
      }

      // Descargar PDF
      if (factura.archivo_pdf) {
        try {
          const link = document.createElement('a');
          link.href = factura.archivo_pdf;
          link.download = `${factura.cfdi?.folio || 'factura'}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Error descargando PDF:', error);
        }
      }
    }

    alert(`Se iniciaron ${facturas.length} descargas de archivos`);
  };

  const handleDeleteEmpresa = async () => {
    if (!empresaToDelete) return;

    if (deleteConfirmName !== empresaToDelete.nombre) {
      alert('El nombre no coincide. Por favor verifica e intenta nuevamente.');
      return;
    }

    setDeletingInProgress(true);

    try {
      const res = await fetch(`/api/empresas/${empresaToDelete._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Empresa y todas sus facturas eliminadas correctamente');
        setOpenDeleteDialog(false);
        setEmpresaToDelete(null);
        setDeleteConfirmName('');
        setFacturas([]);
        fetchEmpresas();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar empresa');
      }
    } catch (error) {
      console.error('Error deleting empresa:', error);
      alert('Error al eliminar empresa');
    } finally {
      setDeletingInProgress(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', p: 4 }}>
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

      {/* Grid de Empresas - Centrado con máximo 3 columnas */}
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
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
                      Gestionar Empresa
                    </Button>
                    {currentUser?.role === 'admin' && (
                      <>
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditDialog(empresa);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteDialog(empresa);
                          }}
                        >
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
      </Box>

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

      {/* Dialog Editar Empresa */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Edit color="primary" />
            <Typography variant="h6" fontWeight="700">
              Editar Empresa
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Modifica los datos de {empresaToEdit?.nombre}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Nombre de la Empresa *"
              placeholder="Ej: Mi Empresa S.A."
              fullWidth
              value={editFormData.nombre}
              onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
            />
            <TextField
              label="RFC/RUT/CUIT *"
              placeholder="Ej: ABC123456XYZ o 20-12345678-9"
              fullWidth
              required
              value={editFormData.rfc}
              onChange={(e) => setEditFormData({ ...editFormData, rfc: e.target.value })}
            />
            <TextField
              label="Dirección"
              placeholder="Ej: Av. Principal 123"
              fullWidth
              value={editFormData.direccion}
              onChange={(e) => setEditFormData({ ...editFormData, direccion: e.target.value })}
            />
            <TextField
              label="Teléfono"
              placeholder="Ej: +54 11 1234-5678"
              fullWidth
              value={editFormData.telefono}
              onChange={(e) => setEditFormData({ ...editFormData, telefono: e.target.value })}
            />
            <TextField
              label="Email"
              placeholder="Ej: contacto@miempresa.com"
              type="email"
              fullWidth
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            />

            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setOpenEditDialog(false)}
                sx={{ textTransform: 'none' }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleEditEmpresa}
                disabled={!editFormData.nombre || !editFormData.rfc}
                sx={{ textTransform: 'none', boxShadow: 'none' }}
              >
                Guardar Cambios
              </Button>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar Empresa */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => !deletingInProgress && setOpenDeleteDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Warning sx={{ color: 'error.main', fontSize: 28 }} />
            <Typography variant="h6" fontWeight="700" color="error.main">
              Eliminar Empresa
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="600" gutterBottom>
              ¡Esta acción no se puede deshacer!
            </Typography>
            <Typography variant="caption">
              Se eliminará la empresa <strong>{empresaToDelete?.nombre}</strong> y todas sus {facturas.length} factura(s) asociada(s).
            </Typography>
          </Alert>

          {facturas.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="600" gutterBottom>
                Facturas que se eliminarán ({facturas.length}):
              </Typography>
              <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#F8FAFC', borderRadius: 1, p: 1 }}>
                {facturas.slice(0, 10).map((factura, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Description fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={factura.cfdi?.emisor?.nombre || 'Sin nombre'}
                      secondary={`Folio: ${factura.cfdi?.folio || 'N/A'} - ${factura.cfdi?.total ? `$${Number(factura.cfdi.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : 'N/A'}`}
                      primaryTypographyProps={{ variant: 'body2', fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ variant: 'caption', fontSize: '0.75rem' }}
                    />
                  </ListItem>
                ))}
                {facturas.length > 10 && (
                  <ListItem>
                    <ListItemText
                      primary={`... y ${facturas.length - 10} factura(s) más`}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontStyle: 'italic' }}
                    />
                  </ListItem>
                )}
              </List>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownloadAllFiles}
                disabled={deletingInProgress}
                sx={{ mt: 2, textTransform: 'none' }}
              >
                Descargar todos los archivos XML y PDF
              </Button>
            </Box>
          )}

          <Typography variant="body2" gutterBottom sx={{ mt: 3, mb: 1 }}>
            Para confirmar, escribe el nombre exacto de la empresa:
          </Typography>
          <Typography variant="body2" fontWeight="700" color="primary" sx={{ mb: 2 }}>
            {empresaToDelete?.nombre}
          </Typography>

          <TextField
            fullWidth
            placeholder="Escribe el nombre de la empresa aquí"
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
            disabled={deletingInProgress}
            error={deleteConfirmName !== '' && deleteConfirmName !== empresaToDelete?.nombre}
            helperText={
              deleteConfirmName !== '' && deleteConfirmName !== empresaToDelete?.nombre
                ? 'El nombre no coincide'
                : ''
            }
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setOpenDeleteDialog(false)}
            disabled={deletingInProgress}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteEmpresa}
            disabled={deleteConfirmName !== empresaToDelete?.nombre || deletingInProgress}
            startIcon={deletingInProgress ? <CircularProgress size={20} color="inherit" /> : <Delete />}
            sx={{ textTransform: 'none' }}
          >
            {deletingInProgress ? 'Eliminando...' : 'Eliminar Empresa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
