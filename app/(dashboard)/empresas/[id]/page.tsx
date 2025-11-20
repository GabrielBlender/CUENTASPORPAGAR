// app/(dashboard)/empresas/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import React from 'react';
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
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
  PictureAsPdf,
  Article,
  CheckCircleOutline,
  DeleteOutline,
  UndoOutlined,
  CloudUpload,
  FactCheck,
  Close,
  Cancel,
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
  const [uploading, setUploading] = useState(false);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [facturasPagadas, setFacturasPagadas] = useState<any[]>([]);
  const [todasFacturas, setTodasFacturas] = useState<any[]>([]);
  const [loadingFacturas, setLoadingFacturas] = useState(false);
  
  // Modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedInvoice, setUploadedInvoice] = useState<any>(null);
  
  // Modales de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showMarkPendingModal, setShowMarkPendingModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<any>(null);
  
  // Filtros para el resumen
  const [filtroProveedor, setFiltroProveedor] = useState('todos');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  
  // Filtros para Pendientes
  const [filtroProveedorPendientes, setFiltroProveedorPendientes] = useState('todos');
  const [paginaPendientes, setPaginaPendientes] = useState(0);
  const registrosPorPaginaPendientes = 2;
  
  // Filtros para Pagadas
  const [filtroProveedorPagadas, setFiltroProveedorPagadas] = useState('todos');
  const [paginaPagadas, setPaginaPagadas] = useState(0);
  const registrosPorPaginaPagadas = 2;
  
  // Lista de proveedores únicos para todas las facturas
  const proveedoresUnicos = React.useMemo(() => {
    const proveedores = todasFacturas.map(f => ({
      rfc: f.cfdi?.emisor?.rfc || '',
      nombre: f.cfdi?.emisor?.nombre || 'Sin nombre'
    })).filter(p => p.rfc);
    
    const unique = Array.from(new Map(proveedores.map(p => [p.rfc, p])).values());
    return unique.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [todasFacturas]);

  // Lista de proveedores únicos para facturas pendientes
  const proveedoresUnicosPendientes = React.useMemo(() => {
    const proveedores = facturas.map(f => ({
      rfc: f.cfdi?.emisor?.rfc || '',
      nombre: f.cfdi?.emisor?.nombre || 'Sin nombre'
    })).filter(p => p.rfc);
    
    const unique = Array.from(new Map(proveedores.map(p => [p.rfc, p])).values());
    return unique.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [facturas]);

  // Lista de proveedores únicos para facturas pagadas
  const proveedoresUnicosPagadas = React.useMemo(() => {
    const proveedores = facturasPagadas.map(f => ({
      rfc: f.cfdi?.emisor?.rfc || '',
      nombre: f.cfdi?.emisor?.nombre || 'Sin nombre'
    })).filter(p => p.rfc);
    
    const unique = Array.from(new Map(proveedores.map(p => [p.rfc, p])).values());
    return unique.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [facturasPagadas]);

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

  const handleDeleteInvoice = (id: string, facturaData?: any) => {
    // Verificar que el usuario es admin
    if (currentUser?.role !== 'admin') {
      alert('No tienes permisos para eliminar facturas');
      return;
    }

    setSelectedInvoiceId(id);
    setSelectedInvoiceData(facturaData);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedInvoiceId) return;
    
    try {
      const res = await fetch(`/api/invoices/${selectedInvoiceId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.status === 401) {
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        router.push('/login');
        return;
      }
      
      if (res.ok) {
        await fetchFacturas();
        setShowDeleteModal(false);
        setSelectedInvoiceId(null);
        setSelectedInvoiceData(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar factura');
      }
    } catch (error) {
      console.error('Error al eliminar factura:', error);
      alert('Error al eliminar factura');
    }
  };

  const handleMarkAsPaid = (id: string, facturaData?: any) => {
    setSelectedInvoiceId(id);
    setSelectedInvoiceData(facturaData);
    setShowMarkPaidModal(true);
  };

  const confirmMarkAsPaid = async () => {
    if (!selectedInvoiceId) return;
    
    try {
      const res = await fetch(`/api/invoices/${selectedInvoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado_pago: 'pagado' }),
      });
      
      if (res.status === 401) {
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        router.push('/login');
        return;
      }
      
      if (res.ok) {
        await fetchFacturas();
        setShowMarkPaidModal(false);
        setSelectedInvoiceId(null);
        setSelectedInvoiceData(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar factura');
      }
    } catch (error) {
      console.error('Error al marcar como pagada:', error);
      alert('Error al actualizar factura');
    }
  };

  const handleMarkAsPending = (id: string, facturaData?: any) => {
    setSelectedInvoiceId(id);
    setSelectedInvoiceData(facturaData);
    setShowMarkPendingModal(true);
  };

  const confirmMarkAsPending = async () => {
    if (!selectedInvoiceId) return;
    
    try {
      const res = await fetch(`/api/invoices/${selectedInvoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado_pago: 'pendiente' }),
      });
      
      if (res.status === 401) {
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        router.push('/login');
        return;
      }
      
      if (res.ok) {
        await fetchFacturas();
        setShowMarkPendingModal(false);
        setSelectedInvoiceId(null);
        setSelectedInvoiceData(null);
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

  const handleUploadPDF = async () => {
    if (!selectedFile || !empresaId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('xml', selectedFile);
    formData.append('empresa_id', empresaId);

    try {
      const res = await fetch('/api/invoices/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedFile(null);
        
        // Obtener la factura recién creada
        const facturaRes = await fetch(`/api/invoices/${data.data.id}`);
        if (facturaRes.ok) {
          const facturaData = await facturaRes.json();
          setUploadedInvoice(facturaData.data);
          setShowSuccessModal(true);
        }
        
        await fetchFacturas();
      } else {
        const error = await res.json();
        alert(error.message || error.error || 'Error al subir factura');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error al subir factura');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadPDFToInvoice = async (e: React.ChangeEvent<HTMLInputElement>, facturaId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea PDF
    if (!file.type.includes('pdf')) {
      alert('Por favor selecciona un archivo PDF válido');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const res = await fetch(`/api/invoices/${facturaId}/upload-pdf`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (res.status === 401) {
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        router.push('/login');
        return;
      }

      if (res.ok) {
        alert('PDF cargado exitosamente');
        await fetchFacturas();
        // Limpiar el input
        e.target.value = '';
      } else {
        const error = await res.json();
        alert(error.error || 'Error al cargar PDF');
      }
    } catch (error) {
      console.error('Error al cargar PDF:', error);
      alert('Error al cargar PDF');
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
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, maxWidth: 600, mx: 'auto' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <FileUpload sx={{ fontSize: 64, color: '#2563EB', mb: 2 }} />
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Subir Factura CFDI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Selecciona el archivo XML para extraer automáticamente los datos de la factura
                </Typography>
              </Box>

              <Box
                sx={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: 3,
                  p: 5,
                  textAlign: 'center',
                  bgcolor: selectedFile ? '#EFF6FF' : '#F8FAFC',
                  borderColor: selectedFile ? '#2563EB' : '#CBD5E1',
                  transition: 'all 0.2s ease',
                  mb: 3,
                  '&:hover': {
                    borderColor: '#2563EB',
                    bgcolor: '#F8FAFC',
                  }
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
                <label htmlFor="xml-upload" style={{ cursor: 'pointer', display: 'block' }}>
                  <Description sx={{ fontSize: 48, color: selectedFile ? '#2563EB' : '#94A3B8', mb: 2 }} />
                  <Typography variant="body1" fontWeight="600" gutterBottom>
                    {selectedFile ? selectedFile.name : 'Selecciona un archivo XML'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    {selectedFile ? 'Archivo listo para procesar' : 'Arrastra aquí o haz clic para seleccionar'}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    component="span" 
                    size="medium" 
                    startIcon={<FileUpload />}
                    sx={{ textTransform: 'none', mt: 1 }}
                  >
                    {selectedFile ? 'Cambiar archivo' : 'Seleccionar archivo XML'}
                  </Button>
                </label>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleUploadPDF}
                disabled={!selectedFile || uploading}
                startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <Check />}
                sx={{ 
                  textTransform: 'none', 
                  boxShadow: 'none',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {uploading ? 'Procesando factura...' : 'Subir y Procesar Factura'}
              </Button>

              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2, textAlign: 'center' }}>
                💡 Nota: El archivo PDF se puede agregar posteriormente desde la tabla de facturas
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Tab 1: Todas las Facturas */}
        <TabPanel value={tabValue} index={1}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="600">
                  Todas las Facturas
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<GetApp />}
                  sx={{ textTransform: 'none' }}
                  onClick={() => handleExportToExcel(todasFacturas, `todas-facturas-${empresa?.nombre || 'empresa'}.xlsx`)}
                >
                  Exportar a Excel
                </Button>
              </Box>

              {loadingFacturas ? (
                <Typography>Cargando...</Typography>
              ) : todasFacturas.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Receipt sx={{ fontSize: 64, color: '#CBD5E1', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay facturas registradas
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Nº Factura
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          Proveedor
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                          RFC
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
                          PDF
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
                      {todasFacturas.map((factura, index) => (
                        <tr 
                          key={factura._id || index}
                          style={{ 
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                          }}
                        >
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" fontWeight="600">
                              {factura.numero_factura || 'N/A'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2">
                              {factura.cfdi?.emisor?.nombre || 'Sin proveedor'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" color="text.secondary">
                              {factura.cfdi?.emisor?.rfc || 'N/A'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(factura.cfdi?.fecha || factura.created_at).toLocaleDateString()}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight="600">
                              $ {Number(factura.cfdi?.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Chip 
                              label={factura.estado_pago === 'pagado' ? 'Pagada' : factura.estado_pago === 'vencido' ? 'Vencida' : 'Pendiente'}
                              size="small"
                              sx={{
                                bgcolor: factura.estado_pago === 'pagado' ? '#D1FAE5' : factura.estado_pago === 'vencido' ? '#FEE2E2' : '#FEF3C7',
                                color: factura.estado_pago === 'pagado' ? '#065F46' : factura.estado_pago === 'vencido' ? '#DC2626' : '#D97706',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            {factura.archivo_pdf ? (
                              <CheckCircle sx={{ color: '#10B981', fontSize: '1.5rem' }} />
                            ) : (
                              <Cancel sx={{ color: '#EF4444', fontSize: '1.5rem' }} />
                            )}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Stack direction="row" spacing={1} justifyContent="center">
                              {factura.archivo_xml && (
                                <Tooltip title="Descargar archivo XML" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ 
                                      color: '#10B981',
                                      '&:hover': { bgcolor: '#D1FAE5', transform: 'scale(1.1)' },
                                      transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleDownloadFile(factura.archivo_xml, `${factura.numero_factura}.xml`)}
                                  >
                                    <Article fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {factura.archivo_pdf ? (
                                <Tooltip title="Ver archivo PDF" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ 
                                      color: '#DC2626',
                                      '&:hover': { bgcolor: '#FEE2E2', transform: 'scale(1.1)' },
                                      transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleViewPDF(factura.archivo_pdf)}
                                  >
                                    <PictureAsPdf fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Cargar PDF" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ 
                                      color: '#F59E0B',
                                      '&:hover': { bgcolor: '#FEF3C7', transform: 'scale(1.1)' },
                                      transition: 'all 0.2s'
                                    }}
                                    component="label"
                                  >
                                    <CloudUpload fontSize="small" />
                                    <input
                                      type="file"
                                      hidden
                                      accept="application/pdf"
                                      onChange={(e) => handleUploadPDFToInvoice(e, factura._id)}
                                    />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              {factura.estado_pago !== 'pagado' && (
                                <Tooltip title="Marcar como pagada" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ 
                                      color: '#10B981',
                                      '&:hover': { bgcolor: '#D1FAE5', transform: 'scale(1.1)' },
                                      transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleMarkAsPaid(factura._id, factura)}
                                  >
                                    <CheckCircleOutline fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {factura.estado_pago === 'pagado' && (
                                <Tooltip title="Marcar como pendiente" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ 
                                      color: '#F59E0B',
                                      '&:hover': { bgcolor: '#FEF3C7', transform: 'scale(1.1)' },
                                      transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleMarkAsPending(factura._id, factura)}
                                  >
                                    <UndoOutlined fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {currentUser?.role === 'admin' && (
                                <Tooltip title="Eliminar factura" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ 
                                      color: '#EF4444',
                                      '&:hover': { bgcolor: '#FEE2E2', transform: 'scale(1.1)' },
                                      transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleDeleteInvoice(factura._id, factura)}
                                  >
                                    <DeleteOutline fontSize="small" />
                                  </IconButton>
                                </Tooltip>
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

        {/* Tab 2: Facturas Pendientes con Dashboard */}
        <TabPanel value={tabValue} index={2}>
          {/* Mini Dashboard Pendientes */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FEF2F2' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Deuda Total Pendiente
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="error.main">
                    $ {facturas.reduce((sum, f) => sum + Number(f.cfdi?.total || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FEF3C7' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Facturas Pendientes
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="#D97706">
                    {facturas.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FEF2F2' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Facturas Vencidas
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="error.main">
                    {facturas.filter(f => f.estado_pago === 'vencido').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F0FDF4' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Proveedores con Deuda
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="success.main">
                    {new Set(facturas.map(f => f.cfdi?.emisor?.rfc)).size}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="600">
                  Facturas Pendientes
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

              {/* Filtro por Proveedor */}
              <Box sx={{ mb: 3 }}>
                <FormControl size="small" sx={{ minWidth: 300 }}>
                  <InputLabel>Filtrar por Proveedor</InputLabel>
                  <Select
                    value={filtroProveedorPendientes}
                    label="Filtrar por Proveedor"
                    onChange={(e) => {
                      setFiltroProveedorPendientes(e.target.value);
                      setPaginaPendientes(0);
                    }}
                  >
                    <MenuItem value="todos">Todos los proveedores</MenuItem>
                    {proveedoresUnicosPendientes.map((proveedor) => (
                      <MenuItem key={proveedor.rfc} value={proveedor.rfc}>
                        {proveedor.nombre} ({proveedor.rfc})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {loadingFacturas ? (
                <Typography>Cargando...</Typography>
              ) : (() => {
                // Aplicar filtro
                const facturasFiltradas = filtroProveedorPendientes === 'todos' 
                  ? facturas 
                  : facturas.filter(f => f.cfdi?.emisor?.rfc === filtroProveedorPendientes);
                
                // Aplicar paginación
                const inicio = paginaPendientes * registrosPorPaginaPendientes;
                const facturasPaginadas = facturasFiltradas.slice(inicio, inicio + registrosPorPaginaPendientes);
                
                return facturasFiltradas.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <CheckCircle sx={{ fontSize: 64, color: '#10B981', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      {filtroProveedorPendientes === 'todos' 
                        ? '¡No hay facturas pendientes! Todo al día.'
                        : 'No hay facturas pendientes de este proveedor.'}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                              Nº Factura
                            </th>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                              Proveedor
                            </th>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                              RFC
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
                              PDF
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
                          {facturasPaginadas.map((factura, index) => (
                        <tr 
                          key={factura._id || index}
                          style={{ 
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                          }}
                        >
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" fontWeight="600">
                              {factura.numero_factura || 'N/A'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2">
                              {factura.cfdi?.emisor?.nombre || 'Sin proveedor'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" color="text.secondary">
                              {factura.cfdi?.emisor?.rfc || 'N/A'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(factura.cfdi?.fecha || factura.created_at).toLocaleDateString()}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight="600">
                              $ {Number(factura.cfdi?.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Chip 
                              label={factura.estado_pago === 'vencido' ? 'Vencida' : 'Pendiente'}
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
                            {factura.archivo_pdf ? (
                              <CheckCircle sx={{ color: '#10B981', fontSize: '1.5rem' }} />
                            ) : (
                              <Cancel sx={{ color: '#EF4444', fontSize: '1.5rem' }} />
                            )}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Stack direction="row" spacing={1} justifyContent="center">
                              {factura.archivo_xml && (
                                <Tooltip title="Descargar XML" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ 
                                      color: '#10B981',
                                      '&:hover': { 
                                        bgcolor: '#D1FAE5',
                                        transform: 'scale(1.1)',
                                      },
                                      transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleDownloadFile(factura.archivo_xml, `${factura.numero_factura}.xml`)}
                                  >
                                    <Article fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {factura.archivo_pdf ? (
                                <Tooltip title="Ver PDF" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ 
                                      color: '#DC2626',
                                      '&:hover': { 
                                        bgcolor: '#FEE2E2',
                                        transform: 'scale(1.1)',
                                      },
                                      transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleViewPDF(factura.archivo_pdf)}
                                  >
                                    <PictureAsPdf fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Cargar PDF" arrow>
                                  <IconButton 
                                    component="label"
                                    size="small" 
                                    sx={{ 
                                      color: '#F97316',
                                      '&:hover': { 
                                        bgcolor: '#FFEDD5',
                                        transform: 'scale(1.1)',
                                      },
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <CloudUpload fontSize="small" />
                                    <input
                                      type="file"
                                      hidden
                                      accept="application/pdf"
                                      onChange={(e) => handleUploadPDFToInvoice(e, factura._id)}
                                    />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <Tooltip title="Marcar como pagada" arrow>
                                <IconButton 
                                  size="small" 
                                  sx={{ 
                                    color: '#10B981',
                                    '&:hover': { 
                                      bgcolor: '#D1FAE5',
                                      transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s'
                                  }}
                                  onClick={() => handleMarkAsPaid(factura._id, factura)}
                                >
                                  <CheckCircleOutline fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {currentUser?.role === 'admin' && (
                                <Tooltip title="Eliminar" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ 
                                      color: '#EF4444',
                                      '&:hover': { 
                                        bgcolor: '#FEE2E2',
                                        transform: 'scale(1.1)',
                                      },
                                      transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleDeleteInvoice(factura._id, factura)}
                                  >
                                    <DeleteOutline fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
                
                {/* Paginación */}
                <TablePagination
                  component="div"
                  count={facturasFiltradas.length}
                  page={paginaPendientes}
                  onPageChange={(_, newPage) => setPaginaPendientes(newPage)}
                  rowsPerPage={registrosPorPaginaPendientes}
                  rowsPerPageOptions={[registrosPorPaginaPendientes]}
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                  labelRowsPerPage="Registros por página:"
                  sx={{ borderTop: '1px solid #E2E8F0', mt: 2 }}
                />
              </>
            );
          })()}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Tab 3: Facturas Pagadas con Dashboard */}
        <TabPanel value={tabValue} index={3}>
          {/* Mini Dashboard Pagadas */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F0FDF4' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Total Pagado
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="success.main">
                    $ {facturasPagadas.reduce((sum, f) => sum + Number(f.cfdi?.total || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#EFF6FF' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Facturas Pagadas
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="#2563EB">
                    {facturasPagadas.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F0FDF4' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Promedio por Factura
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="success.main">
                    $ {facturasPagadas.length > 0 ? (facturasPagadas.reduce((sum, f) => sum + Number(f.cfdi?.total || 0), 0) / facturasPagadas.length).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#EFF6FF' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Proveedores Atendidos
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="#2563EB">
                    {new Set(facturasPagadas.map(f => f.cfdi?.emisor?.rfc)).size}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

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

              {/* Filtro por Proveedor */}
              <Box sx={{ mb: 3 }}>
                <FormControl size="small" sx={{ minWidth: 300 }}>
                  <InputLabel>Filtrar por Proveedor</InputLabel>
                  <Select
                    value={filtroProveedorPagadas}
                    label="Filtrar por Proveedor"
                    onChange={(e) => {
                      setFiltroProveedorPagadas(e.target.value);
                      setPaginaPagadas(0);
                    }}
                  >
                    <MenuItem value="todos">Todos los proveedores</MenuItem>
                    {proveedoresUnicosPagadas.map((proveedor) => (
                      <MenuItem key={proveedor.rfc} value={proveedor.rfc}>
                        {proveedor.nombre} ({proveedor.rfc})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {loadingFacturas ? (
                <Typography>Cargando...</Typography>
              ) : (() => {
                // Aplicar filtro
                const facturasFiltradas = filtroProveedorPagadas === 'todos' 
                  ? facturasPagadas 
                  : facturasPagadas.filter(f => f.cfdi?.emisor?.rfc === filtroProveedorPagadas);
                
                // Aplicar paginación
                const inicio = paginaPagadas * registrosPorPaginaPagadas;
                const facturasPaginadas = facturasFiltradas.slice(inicio, inicio + registrosPorPaginaPagadas);
                
                return facturasFiltradas.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <CheckCircle sx={{ fontSize: 64, color: '#CBD5E1', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      {filtroProveedorPagadas === 'todos' 
                        ? 'No hay facturas pagadas aún'
                        : 'No hay facturas pagadas de este proveedor.'}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                              Nº Factura
                            </th>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                              Proveedor
                            </th>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                              RFC
                            </th>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                              Fecha
                            </th>
                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                              Monto
                            </th>
                            <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                              PDF
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
                          {facturasPaginadas.map((factura, index) => (
                        <tr 
                          key={factura._id || index}
                          style={{ 
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                          }}
                        >
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" fontWeight="600">
                              {factura.numero_factura || 'N/A'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2">
                              {factura.cfdi?.emisor?.nombre || 'Sin proveedor'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" color="text.secondary">
                              {factura.cfdi?.emisor?.rfc || 'N/A'}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(factura.cfdi?.fecha || factura.created_at).toLocaleDateString()}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight="600" color="success.main">
                              $ {Number(factura.cfdi?.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            {factura.archivo_pdf ? (
                              <CheckCircle sx={{ color: '#10B981', fontSize: '1.5rem' }} />
                            ) : (
                              <Cancel sx={{ color: '#EF4444', fontSize: '1.5rem' }} />
                            )}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Stack direction="row" spacing={1} justifyContent="center">
                              {factura.archivo_xml && (
                                <Tooltip title="Descargar XML" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ 
                                      color: '#10B981',
                                      '&:hover': { bgcolor: '#D1FAE5', transform: 'scale(1.1)' },
                                      transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleDownloadFile(factura.archivo_xml, `${factura.numero_factura}.xml`)}
                                  >
                                    <Article fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {factura.archivo_pdf ? (
                                <Tooltip title="Ver PDF" arrow>
                                  <IconButton 
                                    size="small" 
                                    sx={{ 
                                      color: '#DC2626',
                                      '&:hover': { bgcolor: '#FEE2E2', transform: 'scale(1.1)' },
                                      transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleViewPDF(factura.archivo_pdf)}
                                  >
                                    <PictureAsPdf fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Cargar PDF" arrow>
                                  <IconButton 
                                    component="label"
                                    size="small" 
                                    sx={{ 
                                      color: '#F97316',
                                      '&:hover': { bgcolor: '#FFEDD5', transform: 'scale(1.1)' },
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <CloudUpload fontSize="small" />
                                    <input
                                      type="file"
                                      hidden
                                      accept="application/pdf"
                                      onChange={(e) => handleUploadPDFToInvoice(e, factura._id)}
                                    />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <Tooltip title="Marcar como pendiente" arrow>
                                <IconButton 
                                  size="small" 
                                  sx={{ 
                                    color: '#F59E0B',
                                    '&:hover': { bgcolor: '#FEF3C7', transform: 'scale(1.1)' },
                                    transition: 'all 0.2s'
                                  }}
                                  onClick={() => handleMarkAsPending(factura._id, factura)}
                                >
                                  <UndoOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
                
                {/* Paginación */}
                <TablePagination
                  component="div"
                  count={facturasFiltradas.length}
                  page={paginaPagadas}
                  onPageChange={(_, newPage) => setPaginaPagadas(newPage)}
                  rowsPerPage={registrosPorPaginaPagadas}
                  rowsPerPageOptions={[registrosPorPaginaPagadas]}
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                  labelRowsPerPage="Registros por página:"
                  sx={{ borderTop: '1px solid #E2E8F0', mt: 2 }}
                />
              </>
            );
          })()}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Tab 4: Resumen de Facturación con Filtros */}
        <TabPanel value={tabValue} index={4}>
          {/* Filtros */}
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Filtros
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Proveedor</InputLabel>
                    <Select
                      value={filtroProveedor}
                      onChange={(e) => setFiltroProveedor(e.target.value)}
                      label="Proveedor"
                      sx={{ 
                        borderRadius: 2,
                        bgcolor: '#FFFFFF'
                      }}
                    >
                      <MenuItem value="todos">Todos los proveedores</MenuItem>
                      {proveedoresUnicos.map((prov) => (
                        <MenuItem key={prov.rfc} value={prov.rfc}>
                          {prov.nombre} - {prov.rfc}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Fecha Inicio"
                    value={filtroFechaInicio}
                    onChange={(e) => setFiltroFechaInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        bgcolor: '#FFFFFF'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Fecha Fin"
                    value={filtroFechaFin}
                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        bgcolor: '#FFFFFF'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Dashboard Comparativo */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FEF2F2' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Deuda Total Pendiente
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="error.main">
                    $ {(() => {
                      let filtered = facturas;
                      if (filtroProveedor && filtroProveedor !== 'todos') {
                        filtered = filtered.filter(f => f.cfdi?.emisor?.rfc === filtroProveedor);
                      }
                      if (filtroFechaInicio) {
                        filtered = filtered.filter(f => new Date(f.cfdi?.fecha || f.created_at) >= new Date(filtroFechaInicio));
                      }
                      if (filtroFechaFin) {
                        filtered = filtered.filter(f => new Date(f.cfdi?.fecha || f.created_at) <= new Date(filtroFechaFin));
                      }
                      return filtered.reduce((sum, f) => sum + Number(f.cfdi?.total || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F0FDF4' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Total Pagado
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="success.main">
                    $ {(() => {
                      let filtered = facturasPagadas;
                      if (filtroProveedor && filtroProveedor !== 'todos') {
                        filtered = filtered.filter(f => f.cfdi?.emisor?.rfc === filtroProveedor);
                      }
                      if (filtroFechaInicio) {
                        filtered = filtered.filter(f => new Date(f.cfdi?.fecha || f.created_at) >= new Date(filtroFechaInicio));
                      }
                      if (filtroFechaFin) {
                        filtered = filtered.filter(f => new Date(f.cfdi?.fecha || f.created_at) <= new Date(filtroFechaFin));
                      }
                      return filtered.reduce((sum, f) => sum + Number(f.cfdi?.total || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FEF3C7' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Facturas Pendientes
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="#D97706">
                    {(() => {
                      let filtered = facturas;
                      if (filtroProveedor && filtroProveedor !== 'todos') {
                        filtered = filtered.filter(f => f.cfdi?.emisor?.rfc === filtroProveedor);
                      }
                      if (filtroFechaInicio) {
                        filtered = filtered.filter(f => new Date(f.cfdi?.fecha || f.created_at) >= new Date(filtroFechaInicio));
                      }
                      if (filtroFechaFin) {
                        filtered = filtered.filter(f => new Date(f.cfdi?.fecha || f.created_at) <= new Date(filtroFechaFin));
                      }
                      return filtered.length;
                    })()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#EFF6FF' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Facturas Pagadas
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="#2563EB">
                    {(() => {
                      let filtered = facturasPagadas;
                      if (filtroProveedor && filtroProveedor !== 'todos') {
                        filtered = filtered.filter(f => f.cfdi?.emisor?.rfc === filtroProveedor);
                      }
                      if (filtroFechaInicio) {
                        filtered = filtered.filter(f => new Date(f.cfdi?.fecha || f.created_at) >= new Date(filtroFechaInicio));
                      }
                      if (filtroFechaFin) {
                        filtered = filtered.filter(f => new Date(f.cfdi?.fecha || f.created_at) <= new Date(filtroFechaFin));
                      }
                      return filtered.length;
                    })()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Resumen por Proveedor */}
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="600">
                  Resumen por Proveedor
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<GetApp />}
                  sx={{ textTransform: 'none' }}
                  onClick={() => handleExportToExcel(todasFacturas, `resumen-completo-${empresa?.nombre || 'empresa'}.xlsx`)}
                >
                  Exportar Resumen
                </Button>
              </Box>
              
              {loadingFacturas ? (
                <Typography>Cargando...</Typography>
              ) : (() => {
                // Filtrar facturas
                let facturasFiltradas = todasFacturas;
                if (filtroProveedor && filtroProveedor !== 'todos') {
                  facturasFiltradas = facturasFiltradas.filter(f => f.cfdi?.emisor?.rfc === filtroProveedor);
                }
                if (filtroFechaInicio) {
                  facturasFiltradas = facturasFiltradas.filter(f => 
                    new Date(f.cfdi?.fecha || f.created_at) >= new Date(filtroFechaInicio)
                  );
                }
                if (filtroFechaFin) {
                  facturasFiltradas = facturasFiltradas.filter(f => 
                    new Date(f.cfdi?.fecha || f.created_at) <= new Date(filtroFechaFin)
                  );
                }

                // Agrupar por proveedor
                const proveedoresMap = new Map<string, { 
                  nombre: string; 
                  rfc: string; 
                  totalPendiente: number; 
                  totalPagado: number;
                  countPendiente: number;
                  countPagado: number;
                }>();
                
                facturasFiltradas.forEach((factura) => {
                  const nombre = factura.cfdi?.emisor?.nombre || 'Sin nombre';
                  const rfc = factura.cfdi?.emisor?.rfc || 'Sin RFC';
                  const key = rfc;
                  const total = Number(factura.cfdi?.total || 0);
                  const esPagada = factura.estado_pago === 'pagado';
                  
                  if (proveedoresMap.has(key)) {
                    const existing = proveedoresMap.get(key)!;
                    if (esPagada) {
                      existing.totalPagado += total;
                      existing.countPagado += 1;
                    } else {
                      existing.totalPendiente += total;
                      existing.countPendiente += 1;
                    }
                  } else {
                    proveedoresMap.set(key, {
                      nombre,
                      rfc,
                      totalPendiente: esPagada ? 0 : total,
                      totalPagado: esPagada ? total : 0,
                      countPendiente: esPagada ? 0 : 1,
                      countPagado: esPagada ? 1 : 0
                    });
                  }
                });

                const proveedores = Array.from(proveedoresMap.values()).sort((a, b) => 
                  (b.totalPendiente + b.totalPagado) - (a.totalPendiente + a.totalPagado)
                );

                return proveedores.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Receipt sx={{ fontSize: 64, color: '#CBD5E1', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No hay facturas que coincidan con los filtros
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
                            Pendientes
                          </th>
                          <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                            Deuda Pendiente
                          </th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                            Pagadas
                          </th>
                          <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                            Total Pagado
                          </th>
                          <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                            Total General
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
                                label={proveedor.countPendiente} 
                                size="small"
                                sx={{ 
                                  bgcolor: proveedor.countPendiente > 0 ? '#FEF3C7' : '#F1F5F9', 
                                  color: proveedor.countPendiente > 0 ? '#D97706' : '#64748B',
                                  fontWeight: 600 
                                }}
                              />
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <Typography variant="body2" fontWeight="600" color={proveedor.totalPendiente > 0 ? 'error.main' : 'text.secondary'}>
                                $ {proveedor.totalPendiente.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <Chip 
                                label={proveedor.countPagado} 
                                size="small"
                                sx={{ 
                                  bgcolor: proveedor.countPagado > 0 ? '#D1FAE5' : '#F1F5F9', 
                                  color: proveedor.countPagado > 0 ? '#065F46' : '#64748B',
                                  fontWeight: 600 
                                }}
                              />
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <Typography variant="body2" fontWeight="600" color={proveedor.totalPagado > 0 ? 'success.main' : 'text.secondary'}>
                                $ {proveedor.totalPagado.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <Typography variant="body1" fontWeight="700">
                                $ {(proveedor.totalPendiente + proveedor.totalPagado).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                            </td>
                          </tr>
                        ))}
                        {/* Fila de Totales */}
                        <tr style={{ borderTop: '2px solid #E2E8F0', backgroundColor: '#F1F5F9' }}>
                          <td colSpan={2} style={{ padding: '16px' }}>
                            <Typography variant="body1" fontWeight="700">
                              TOTALES
                            </Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Chip 
                              label={proveedores.reduce((sum, p) => sum + p.countPendiente, 0)} 
                              size="small"
                              sx={{ 
                                bgcolor: '#D97706', 
                                color: '#FFFFFF',
                                fontWeight: 700 
                              }}
                            />
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight="700" color="error.main">
                              $ {proveedores.reduce((sum, p) => sum + p.totalPendiente, 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Chip 
                              label={proveedores.reduce((sum, p) => sum + p.countPagado, 0)} 
                              size="small"
                              sx={{ 
                                bgcolor: '#10B981', 
                                color: '#FFFFFF',
                                fontWeight: 700 
                              }}
                            />
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight="700" color="success.main">
                              $ {proveedores.reduce((sum, p) => sum + p.totalPagado, 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <Typography variant="h5" fontWeight="700">
                              $ {proveedores.reduce((sum, p) => sum + p.totalPendiente + p.totalPagado, 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        </TabPanel>
      </Box>

      {/* Modal de Éxito */}
      <Dialog 
        open={showSuccessModal} 
        onClose={() => {
          setShowSuccessModal(false);
          setTabValue(1);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#F0FDF4', color: '#065F46', display: 'flex', alignItems: 'center', gap: 2 }}>
          <CheckCircleOutline sx={{ fontSize: 40, color: '#10B981' }} />
          <Box>
            <Typography variant="h6" fontWeight="700">
              ¡Factura Cargada Exitosamente!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              La factura ha sido procesada y guardada en el sistema
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          {uploadedInvoice && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card elevation={0} sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Número de Factura
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {uploadedInvoice.numero_factura || 'N/A'}
                          </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Proveedor
                          </Typography>
                          <Typography variant="body2" fontWeight="600" textAlign="right">
                            {uploadedInvoice.cfdi?.emisor?.nombre || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            RFC
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {uploadedInvoice.cfdi?.emisor?.rfc || 'N/A'}
                          </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Fecha
                          </Typography>
                          <Typography variant="body2">
                            {uploadedInvoice.cfdi?.fecha ? new Date(uploadedInvoice.cfdi.fecha).toLocaleDateString('es-MX') : 'N/A'}
                          </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Monto Total
                          </Typography>
                          <Typography variant="h6" fontWeight="700" color="primary.main">
                            $ {Number(uploadedInvoice.cfdi?.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            UUID
                          </Typography>
                          <Typography variant="caption" fontFamily="monospace" sx={{ bgcolor: '#E2E8F0', px: 1, py: 0.5, borderRadius: 1 }}>
                            {uploadedInvoice.cfdi?.timbreFiscalDigital?.uuid || 'N/A'}
                          </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Estado
                          </Typography>
                          <Chip 
                            label={uploadedInvoice.estado_pago === 'pendiente' ? 'Pendiente' : 'Vencida'}
                            size="small"
                            sx={{
                              bgcolor: uploadedInvoice.estado_pago === 'vencido' ? '#FEE2E2' : '#FEF3C7',
                              color: uploadedInvoice.estado_pago === 'vencido' ? '#DC2626' : '#D97706',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 2, p: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PictureAsPdf sx={{ color: '#2563EB' }} />
                      <Typography variant="body2" color="#1E40AF">
                        <strong>Próximo paso:</strong> Puedes agregar el archivo PDF de esta factura desde la tabla de facturas.
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => {
              setShowSuccessModal(false);
              setTabValue(1);
            }}
            variant="contained"
            fullWidth
            size="large"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Ver en Tabla de Facturas
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#FEE2E2', color: '#991B1B', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteOutline />
          Eliminar Factura
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            ¿Estás seguro de que deseas eliminar esta factura?
          </Typography>
          {selectedInvoiceData && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Número:</strong> {selectedInvoiceData.numero_factura || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Proveedor:</strong> {selectedInvoiceData.cfdi?.emisor?.nombre || selectedInvoiceData.proveedor || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Monto:</strong> ${Number(selectedInvoiceData.cfdi?.total || selectedInvoiceData.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            <strong>Esta acción no se puede deshacer.</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setShowDeleteModal(false)}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none' }}
            startIcon={<DeleteOutline />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para marcar como pagada */}
      <Dialog
        open={showMarkPaidModal}
        onClose={() => setShowMarkPaidModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#D1FAE5', color: '#065F46', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleOutline />
          Marcar como Pagada
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            ¿Deseas marcar esta factura como pagada?
          </Typography>
          {selectedInvoiceData && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Número:</strong> {selectedInvoiceData.numero_factura || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Proveedor:</strong> {selectedInvoiceData.cfdi?.emisor?.nombre || selectedInvoiceData.proveedor || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>RFC:</strong> {selectedInvoiceData.cfdi?.emisor?.rfc || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Monto:</strong> ${Number(selectedInvoiceData.cfdi?.total || selectedInvoiceData.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setShowMarkPaidModal(false)}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmMarkAsPaid}
            variant="contained"
            sx={{ 
              textTransform: 'none',
              bgcolor: '#10B981',
              '&:hover': { bgcolor: '#059669' }
            }}
            startIcon={<CheckCircleOutline />}
          >
            Marcar como Pagada
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para marcar como pendiente */}
      <Dialog
        open={showMarkPendingModal}
        onClose={() => setShowMarkPendingModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', gap: 1 }}>
          <UndoOutlined />
          Marcar como Pendiente
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            ¿Deseas revertir esta factura a estado pendiente?
          </Typography>
          {selectedInvoiceData && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Número:</strong> {selectedInvoiceData.numero_factura || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Proveedor:</strong> {selectedInvoiceData.cfdi?.emisor?.nombre || selectedInvoiceData.proveedor || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>RFC:</strong> {selectedInvoiceData.cfdi?.emisor?.rfc || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Monto:</strong> ${Number(selectedInvoiceData.cfdi?.total || selectedInvoiceData.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
            Esta factura volverá a la lista de pendientes de pago.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setShowMarkPendingModal(false)}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmMarkAsPending}
            variant="contained"
            sx={{ 
              textTransform: 'none',
              bgcolor: '#F59E0B',
              '&:hover': { bgcolor: '#D97706' }
            }}
            startIcon={<UndoOutlined />}
          >
            Marcar como Pendiente
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
