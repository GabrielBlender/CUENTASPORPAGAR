// app/(dashboard)/empresas/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Avatar,
  Card,
  CardContent,
  Grid,
  Paper,
  TextField,
  Stack,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Upload,
  Dashboard as DashboardIcon,
  Receipt,
  CheckCircle,
  Assessment,
  FileUpload,
  AttachMoney,
  Business,
  TrendingUp,
  Edit,
  Delete,
  Download,
  Visibility,
  Description,
  GetApp,
  Check,
  Undo,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EmpresaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [empresa, setEmpresa] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [facturasPagadas, setFacturasPagadas] = useState<any[]>([]);
  const [todasFacturas, setTodasFacturas] = useState<any[]>([]);
  const [loadingFacturas, setLoadingFacturas] = useState(false);
  
  // Filtros para el resumen
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');

  // Obtener el ID de los parámetros
  const empresaId = params?.id as string;

  useEffect(() => {
    if (!empresaId) {
      router.push('/empresas');
      return;
    }
    fetchEmpresa();
    fetchCurrentUser();
    fetchFacturas();
  }, [empresaId]);

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

  const fetchEmpresa = async () => {
    if (!empresaId) return;
    try {
      const res = await fetch(`/api/empresas/${empresaId}`);
      if (res.ok) {
        const data = await res.json();
        setEmpresa(data.data);
      }
    } catch (error) {
      console.error('Error fetching empresa:', error);
    }
  };

  const fetchFacturas = async () => {
    if (!empresaId) return;
    setLoadingFacturas(true);
    try {
      const res = await fetch(`/api/invoices?empresa_id=${empresaId}`);
      if (res.ok) {
        const data = await res.json();
        const todas = data.data || [];
        setTodasFacturas(todas);
        setFacturas(todas.filter((f: any) => f.estado_pago !== 'pagado'));
        setFacturasPagadas(todas.filter((f: any) => f.estado_pago === 'pagado'));
      }
    } catch (error) {
      console.error('Error fetching facturas:', error);
    } finally {
      setLoadingFacturas(false);
    }
  };

  const handleDownloadFile = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
    }
  };

  const handleViewPDF = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDeleteInvoice = async (id: string) => {
    // Verificar que el usuario es admin
    if (currentUser?.role !== 'admin') {
      alert('No tienes permisos para eliminar facturas');
      return;
    }

    if (!confirm('¿Estás seguro de eliminar esta factura?')) return;
    
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        await fetchFacturas(); // Recargar lista
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar factura');
      }
    } catch (error) {
      console.error('Error al eliminar factura:', error);
      alert('Error al eliminar factura');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    if (!confirm('¿Marcar esta factura como pagada?')) return;
    
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado_pago: 'pagado' }),
      });
      
      if (res.ok) {
        await fetchFacturas(); // Recargar lista
        alert('Factura marcada como pagada');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar factura');
      }
    } catch (error) {
      console.error('Error al marcar como pagada:', error);
      alert('Error al actualizar factura');
    }
  };

  const handleMarkAsPending = async (id: string) => {
    if (!confirm('¿Marcar esta factura como pendiente?')) return;
    
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado_pago: 'pendiente' }),
      });
      
      if (res.ok) {
        await fetchFacturas(); // Recargar lista
        alert('Factura marcada como pendiente');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar factura');
      }
    } catch (error) {
      console.error('Error al marcar como pendiente:', error);
      alert('Error al actualizar factura');
    }
  };

  const handleExportToExcel = async (facturasToExport: any[], filename: string) => {
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Facturas');
      
      // Headers
      worksheet.columns = [
        { header: 'Nº Factura', key: 'numero_factura', width: 20 },
        { header: 'Proveedor', key: 'proveedor', width: 30 },
        { header: 'RFC Proveedor', key: 'rfc_proveedor', width: 15 },
        { header: 'Fecha', key: 'fecha', width: 12 },
        { header: 'Monto', key: 'monto', width: 15 },
        { header: 'Estado', key: 'estado', width: 12 }
      ];

      // Data rows
      facturasToExport.forEach((factura) => {
        worksheet.addRow({
          numero_factura: factura.numero_factura || 'N/A',
          proveedor: factura.cfdi?.emisor?.nombre || 'Sin proveedor',
          rfc_proveedor: factura.cfdi?.emisor?.rfc || 'N/A',
          fecha: new Date(factura.cfdi?.fecha || factura.created_at).toLocaleDateString(),
          monto: Number(factura.cfdi?.total || 0),
          estado: factura.estado_pago || 'pendiente'
        });
      });

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' }
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.name.endsWith('.xml')) {
        setSelectedFile(file);
      } else if (file.name.endsWith('.pdf')) {
        setSelectedPDF(file);
      }
    }
  };

  const handleUploadPDF = async () => {
    if (!selectedFile || !empresaId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('xml', selectedFile);
    if (selectedPDF) {
      formData.append('pdf', selectedPDF);
    }
    formData.append('empresa_id', empresaId);

    try {
      const res = await fetch('/api/invoices/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSelectedFile(null);
        setSelectedPDF(null);
        await fetchFacturas();
        alert('Factura procesada exitosamente');
      } else {
        const error = await res.json();
        alert(error.error || 'Error al subir factura');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error al subir factura');
    } finally {
      setUploading(false);
    }
  };

  if (!empresa) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Box sx={{ p: 4 }}>
        {/* Botón volver */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/empresas')}
          sx={{ mb: 3, textTransform: 'none', color: 'text.secondary' }}
        >
          Volver a Empresas
        </Button>

        {/* Título de la empresa */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="700" gutterBottom color="text.primary">
            {empresa.nombre}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de Cuentas por Pagar
          </Typography>
        </Box>

        {/* Tabs Centrados */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            centered
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9375rem',
                minHeight: 48,
              },
            }}
          >
            <Tab label="Subir Factura" />
            <Tab label="Facturas" />
            <Tab label="Pendientes" />
            <Tab label="Pagadas" />
            <Tab label="Resumen de Facturación" />
          </Tabs>
        </Box>

        {/* Tab 0: Subir Factura */}
        <TabPanel value={tabValue} index={0}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, maxWidth: 700, mx: 'auto' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <FileUpload sx={{ fontSize: 48, color: '#2563EB', mb: 2 }} />
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Subir Factura CFDI (XML)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  El archivo XML es obligatorio para extraer los datos de la factura
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      border: '2px dashed #CBD5E1',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      bgcolor: selectedFile ? '#EFF6FF' : '#F8FAFC',
                      borderColor: selectedFile ? '#2563EB' : '#CBD5E1',
                    }}
                  >
                    <input
                      accept=".xml"
                      style={{ display: 'none' }}
                      id="xml-upload"
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                    <label htmlFor="xml-upload">
                      <Button variant="outlined" component="span" size="small" sx={{ textTransform: 'none', mb: 1 }}>
                        Elegir XML
                      </Button>
                    </label>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {selectedFile ? selectedFile.name : 'Requerido'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      border: '2px dashed #CBD5E1',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      bgcolor: selectedPDF ? '#F0FDF4' : '#F8FAFC',
                      borderColor: selectedPDF ? '#10B981' : '#CBD5E1',
                    }}
                  >
                    <input
                      accept=".pdf"
                      style={{ display: 'none' }}
                      id="pdf-upload"
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedPDF(e.target.files[0]);
                        }
                      }}
                    />
                    <label htmlFor="pdf-upload">
                      <Button variant="outlined" component="span" size="small" sx={{ textTransform: 'none', mb: 1 }}>
                        Elegir PDF
                      </Button>
                    </label>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {selectedPDF ? selectedPDF.name : 'Opcional'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleUploadPDF}
                disabled={!selectedFile || uploading}
                sx={{ textTransform: 'none', boxShadow: 'none' }}
              >
                {uploading ? 'Procesando factura...' : 'Subir y Procesar Factura'}
              </Button>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Tab 1: Dashboard */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Deuda Total
                      </Typography>
                      <Typography variant="h4" fontWeight="700" color="error.main">
                        $ 118.403,64
                      </Typography>
                    </Box>
                    <AttachMoney sx={{ color: 'error.main', fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Facturas
                      </Typography>
                      <Typography variant="h4" fontWeight="700" color="primary.main">
                        34
                      </Typography>
                    </Box>
                    <Receipt sx={{ color: 'primary.main', fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Pendientes
                      </Typography>
                      <Typography variant="h4" fontWeight="700" color="error.main">
                        4
                      </Typography>
                    </Box>
                    <TrendingUp sx={{ color: 'error.main', fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Pagadas
                      </Typography>
                      <Typography variant="h4" fontWeight="700" color="success.main">
                        30
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Resumen por Proveedor
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Información detallada de facturas por proveedor
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Facturas */}
        <TabPanel value={tabValue} index={2}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="600">
                  Lista de Facturas
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<GetApp />}
                  sx={{ textTransform: 'none' }}
                  onClick={() => handleExportToExcel(facturas, `facturas-pendientes-${empresa?.nombre || 'empresa'}.xlsx`)}
                >
                  Exportar a Excel
                </Button>
              </Box>

              {loadingFacturas ? (
                <Typography>Cargando...</Typography>
              ) : facturas.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Receipt sx={{ fontSize: 64, color: '#CBD5E1', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay facturas pendientes
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Nº Factura
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Nº Contrato
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Proveedor
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Fecha
                        </th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Monto
                        </th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Estado
                        </th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Archivos
                        </th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturas.map((factura, index) => (
                        <tr 
                          key={index}
                          style={{ borderBottom: '1px solid #F1F5F9' }}
                        >
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" fontWeight="600">
                              {factura.numero_factura || 'N/A'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2">
                              {factura.cfdi?.emisor?.nombre || 'Sin proveedor'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(factura.cfdi?.fecha || factura.created_at).toLocaleDateString()}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight="600">
                              $ {Number(factura.cfdi?.total || 0).toLocaleString()}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Chip 
                              label={factura.estado_pago === 'pendiente' ? 'Pendiente' : 'Vencido'}
                              size="small"
                              sx={{
                                bgcolor: factura.estado_pago === 'vencido' ? '#FEE2E2' : '#FEF3C7',
                                color: factura.estado_pago === 'vencido' ? '#DC2626' : '#D97706',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Stack direction="row" spacing={1} justifyContent="center">
                              {factura.archivo_xml && (
                                <IconButton 
                                  size="small" 
                                  sx={{ color: '#10B981' }}
                                  onClick={() => handleDownloadFile(factura.archivo_xml, `${factura.numero_factura}.xml`)}
                                  title="Descargar XML"
                                >
                                  <Description fontSize="small" />
                                </IconButton>
                              )}
                              {factura.archivo_pdf && (
                                <IconButton 
                                  size="small" 
                                  sx={{ color: '#3B82F6' }}
                                  onClick={() => handleViewPDF(factura.archivo_pdf)}
                                  title="Ver PDF"
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <IconButton 
                                size="small" 
                                sx={{ color: '#10B981' }}
                                onClick={() => handleMarkAsPaid(factura._id)}
                                title="Marcar como pagada"
                              >
                                <Check fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                sx={{ color: '#64748B' }}
                                onClick={() => factura.archivo_pdf && handleDownloadFile(factura.archivo_pdf, `${factura.numero_factura}.pdf`)}
                                title="Descargar PDF"
                              >
                                <Download fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                sx={{ color: '#3B82F6' }}
                                onClick={() => factura.archivo_pdf && handleViewPDF(factura.archivo_pdf)}
                                title="Ver detalles"
                              >
                                <Description fontSize="small" />
                              </IconButton>
                              {currentUser?.role === 'admin' && (
                                <IconButton 
                                  size="small" 
                                  sx={{ color: '#EF4444' }}
                                  onClick={() => handleDeleteInvoice(factura._id)}
                                  title="Eliminar"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Tab 3: Facturas Pagadas */}
        <TabPanel value={tabValue} index={3}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="600">
                  Facturas Pagadas
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<GetApp />}
                  sx={{ textTransform: 'none' }}
                  onClick={() => handleExportToExcel(facturasPagadas, `facturas-pagadas-${empresa?.nombre || 'empresa'}.xlsx`)}
                >
                  Exportar a Excel
                </Button>
              </Box>

              {loadingFacturas ? (
                <Typography>Cargando...</Typography>
              ) : facturasPagadas.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CheckCircle sx={{ fontSize: 64, color: '#CBD5E1', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay facturas pagadas aún
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Nº Factura
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Nº Contrato
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Proveedor
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Fecha
                        </th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Monto
                        </th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Archivos
                        </th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturasPagadas.map((factura, index) => (
                        <tr 
                          key={index}
                          style={{ borderBottom: '1px solid #F1F5F9' }}
                        >
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" fontWeight="600">
                              {factura.numero_factura || 'N/A'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2">
                              {factura.cfdi?.emisor?.nombre || 'Sin proveedor'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(factura.cfdi?.fecha || factura.created_at).toLocaleDateString()}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight="600" color="success.main">
                              $ {Number(factura.cfdi?.total || 0).toLocaleString()}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Stack direction="row" spacing={1} justifyContent="center">
                              {factura.archivo_xml && (
                                <IconButton size="small" sx={{ color: '#10B981' }}>
                                  <Description fontSize="small" />
                                </IconButton>
                              )}
                              {factura.archivo_pdf && (
                                <IconButton size="small" sx={{ color: '#3B82F6' }}>
                                  <Visibility fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <IconButton 
                                size="small" 
                                sx={{ color: '#F59E0B' }}
                                onClick={() => handleMarkAsPending(factura._id)}
                                title="Marcar como pendiente"
                              >
                                <Undo fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                sx={{ color: '#64748B' }}
                                onClick={() => factura.archivo_pdf && handleDownloadFile(factura.archivo_pdf, `${factura.numero_factura}.pdf`)}
                                title="Descargar PDF"
                              >
                                <Download fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                sx={{ color: '#3B82F6' }}
                                onClick={() => factura.archivo_pdf && handleViewPDF(factura.archivo_pdf)}
                                title="Ver detalles"
                              >
                                <Description fontSize="small" />
                              </IconButton>
                              {currentUser?.role === 'admin' && (
                                <IconButton 
                                  size="small" 
                                  sx={{ color: '#EF4444' }}
                                  onClick={() => handleDeleteInvoice(factura._id)}
                                  title="Eliminar"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Tab 4: Resumen */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            {/* Card de Resumen Financiero */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Resumen Financiero General
                  </Typography>
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ p: 2, bgcolor: '#FEF2F2', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Deuda Total Pendiente
                        </Typography>
                        <Typography variant="h4" fontWeight="700" color="error.main">
                          $ {facturas.reduce((sum, f) => sum + (Number(f.cfdi?.total) || 0), 0).toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ p: 2, bgcolor: '#F0F9FF', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total Facturas Pendientes
                        </Typography>
                        <Typography variant="h4" fontWeight="700" color="primary.main">
                          {facturas.length}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Facturas Pagadas
                        </Typography>
                        <Typography variant="h4" fontWeight="700" color="success.main">
                          {facturasPagadas.length}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total General
                        </Typography>
                        <Typography variant="h4" fontWeight="700">
                          {facturas.length + facturasPagadas.length}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Tabla de Resumen por Proveedor */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
                    Deuda por Proveedor
                  </Typography>
                  
                  {loadingFacturas ? (
                    <Typography>Cargando...</Typography>
                  ) : (() => {
                    // Agrupar facturas pendientes por proveedor
                    const proveedoresMap = new Map<string, { nombre: string; rfc: string; total: number; count: number }>();
                    
                    facturas.forEach((factura) => {
                      const nombre = factura.cfdi?.emisor?.nombre || 'Sin nombre';
                      const rfc = factura.cfdi?.emisor?.rfc || 'Sin RFC';
                      const key = rfc;
                      
                      if (proveedoresMap.has(key)) {
                        const existing = proveedoresMap.get(key)!;
                        existing.total += Number(factura.cfdi?.total || 0);
                        existing.count += 1;
                      } else {
                        proveedoresMap.set(key, {
                          nombre,
                          rfc,
                          total: Number(factura.cfdi?.total || 0),
                          count: 1
                        });
                      }
                    });

                    const proveedores = Array.from(proveedoresMap.values()).sort((a, b) => b.total - a.total);

                    return proveedores.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <CheckCircle sx={{ fontSize: 64, color: '#CBD5E1', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          No hay deudas pendientes
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                                Proveedor
                              </th>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                                RFC
                              </th>
                              <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                                Cantidad Facturas
                              </th>
                              <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                                Deuda Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {proveedores.map((proveedor, index) => (
                              <tr 
                                key={index}
                                style={{ 
                                  borderBottom: '1px solid #F1F5F9',
                                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                                }}
                              >
                                <td style={{ padding: '16px' }}>
                                  <Typography variant="body2" fontWeight="600">
                                    {proveedor.nombre}
                                  </Typography>
                                </td>
                                <td style={{ padding: '16px' }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {proveedor.rfc}
                                  </Typography>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                  <Chip 
                                    label={proveedor.count} 
                                    size="small"
                                    sx={{ 
                                      bgcolor: '#DBEAFE', 
                                      color: '#1E40AF',
                                      fontWeight: 600 
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                  <Typography variant="body1" fontWeight="700" color="error.main">
                                    $ {proveedor.total.toLocaleString()}
                                  </Typography>
                                </td>
                              </tr>
                            ))}
                            {/* Fila de Total */}
                            <tr style={{ borderTop: '2px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                              <td colSpan={2} style={{ padding: '16px' }}>
                                <Typography variant="body1" fontWeight="700">
                                  TOTAL
                                </Typography>
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <Chip 
                                  label={facturas.length} 
                                  size="small"
                                  sx={{ 
                                    bgcolor: '#1E40AF', 
                                    color: '#FFFFFF',
                                    fontWeight: 600 
                                  }}
                                />
                              </td>
                              <td style={{ padding: '16px', textAlign: 'right' }}>
                                <Typography variant="h6" fontWeight="700" color="error.main">
                                  $ {proveedores.reduce((sum, p) => sum + p.total, 0).toLocaleString()}
                                </Typography>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </Box>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
}
