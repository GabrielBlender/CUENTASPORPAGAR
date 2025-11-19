// app/(dashboard)/dashboard/facturas/subir/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  TextField,
  MenuItem,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface UploadFile {
  xml: File | null;
  pdf: File | null;
}

export default function SubirFacturasPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [empresaId, setEmpresaId] = useState('');
  const [files, setFiles] = useState<UploadFile>({ xml: null, pdf: null });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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
    }
  };

  const handleFileChange = (type: 'xml' | 'pdf', file: File | null) => {
    setFiles((prev) => ({ ...prev, [type]: file }));
    setError('');
    setSuccess('');
  };

  const handleUpload = async () => {
    if (!files.xml) {
      setError('El archivo XML es requerido');
      return;
    }

    if (!empresaId) {
      setError('Selecciona una empresa');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('xml', files.xml);
      if (files.pdf) {
        formData.append('pdf', files.pdf);
      }
      formData.append('empresa_id', empresaId);

      const response = await fetch('/api/invoices/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir factura');
      }

      setSuccess(`Factura ${data.data.numero_factura} subida exitosamente`);
      setFiles({ xml: null, pdf: null });
      setEmpresaId('');

      // Redirigir a facturas después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard/facturas');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Subir Facturas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Carga archivos XML y PDF de facturas CFDI 4.0
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 4, maxWidth: 800 }}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            select
            label="Empresa"
            value={empresaId}
            onChange={(e) => setEmpresaId(e.target.value)}
            fullWidth
            disabled={uploading}
            helperText="Selecciona la empresa a la que pertenece esta factura"
          >
            <MenuItem value="">Selecciona una empresa</MenuItem>
            {empresas.map((empresa) => (
              <MenuItem key={empresa._id} value={empresa._id}>
                {empresa.razon_social} - {empresa.rfc}
              </MenuItem>
            ))}
          </TextField>

          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight="600">
              Archivo XML (Requerido) *
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<UploadIcon />}
              disabled={uploading}
              sx={{ py: 2, justifyContent: 'flex-start' }}
            >
              {files.xml ? files.xml.name : 'Seleccionar archivo XML'}
              <input
                type="file"
                accept=".xml"
                hidden
                onChange={(e) =>
                  handleFileChange('xml', e.target.files?.[0] || null)
                }
              />
            </Button>
            {files.xml && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                <FileIcon fontSize="small" color="success" />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {files.xml.name} ({(files.xml.size / 1024).toFixed(2)} KB)
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleFileChange('xml', null)}
                  disabled={uploading}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight="600">
              Archivo PDF (Opcional)
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<UploadIcon />}
              disabled={uploading}
              sx={{ py: 2, justifyContent: 'flex-start' }}
            >
              {files.pdf ? files.pdf.name : 'Seleccionar archivo PDF'}
              <input
                type="file"
                accept=".pdf"
                hidden
                onChange={(e) =>
                  handleFileChange('pdf', e.target.files?.[0] || null)
                }
              />
            </Button>
            {files.pdf && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                <FileIcon fontSize="small" color="error" />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {files.pdf.name} ({(files.pdf.size / 1024).toFixed(2)} KB)
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleFileChange('pdf', null)}
                  disabled={uploading}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}
          </Box>

          {uploading && <LinearProgress />}

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={() => router.back()}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!files.xml || !empresaId || uploading}
              startIcon={<UploadIcon />}
            >
              {uploading ? 'Subiendo...' : 'Subir Factura'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, mt: 3, maxWidth: 800, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle2" fontWeight="600" gutterBottom>
          Requisitos:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Archivo XML válido CFDI 4.0" />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="PDF opcional (representación impresa)" />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Tamaño máximo: 10 MB por archivo" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
}
