// app/(dashboard)/dashboard/facturas/page.tsx
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
  Chip,
  Stack,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  UploadFile as UploadFileIcon,
  FileDownload as DownloadIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Factura {
  _id: string;
  numero_factura: string;
  cfdi: {
    emisor: { nombre: string; rfc: string };
    receptor: { nombre: string };
    fecha: string;
    total: number;
    moneda: string;
  };
  estado_pago: 'pendiente' | 'pagado' | 'vencido';
  archivo_xml?: string;
  archivo_pdf?: string;
  created_at: string;
}

export default function FacturasPage() {
  const router = useRouter();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');

  useEffect(() => {
    loadFacturas();
  }, []);

  const loadFacturas = async () => {
    try {
      // Nota: Necesitas crear esta ruta API
      const response = await fetch('/api/invoices');
      if (response.ok) {
        const data = await response.json();
        setFacturas(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'vencido':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredFacturas = facturas.filter((factura) => {
    if (filter === 'todas') return true;
    return factura.estado_pago === filter;
  });

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando facturas...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            Facturas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona las facturas y comprobantes fiscales
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UploadFileIcon />}
          onClick={() => router.push('/dashboard/facturas/subir')}
        >
          Subir Factura
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          select
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="todas">Todas</MenuItem>
          <MenuItem value="pendiente">Pendientes</MenuItem>
          <MenuItem value="pagado">Pagadas</MenuItem>
          <MenuItem value="vencido">Vencidas</MenuItem>
        </TextField>
      </Stack>

      {filteredFacturas.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No hay facturas registradas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comienza subiendo archivos XML de facturas CFDI 4.0
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={() => router.push('/dashboard/facturas/subir')}
          >
            Subir Facturas
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Folio</strong></TableCell>
                <TableCell><strong>Proveedor</strong></TableCell>
                <TableCell><strong>RFC</strong></TableCell>
                <TableCell><strong>Fecha</strong></TableCell>
                <TableCell align="right"><strong>Total</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell align="center"><strong>Archivos</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFacturas.map((factura) => (
                <TableRow key={factura._id} hover>
                  <TableCell>{factura.numero_factura}</TableCell>
                  <TableCell>{factura.cfdi.emisor.nombre}</TableCell>
                  <TableCell>{factura.cfdi.emisor.rfc}</TableCell>
                  <TableCell>
                    {new Date(factura.cfdi.fecha).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="600">
                      ${factura.cfdi.total.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={factura.estado_pago.toUpperCase()}
                      color={getEstadoColor(factura.estado_pago)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {factura.archivo_xml && (
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => window.open(factura.archivo_xml, '_blank')}
                        >
                          XML
                        </Button>
                      )}
                      {factura.archivo_pdf && (
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => window.open(factura.archivo_pdf, '_blank')}
                        >
                          PDF
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Total: {filteredFacturas.length} facturas
        </Typography>
      </Box>
    </Box>
  );
}
