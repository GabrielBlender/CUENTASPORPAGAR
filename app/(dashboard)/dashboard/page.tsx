// app/(dashboard)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Stack,
  Chip,
  Avatar,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Receipt,
  CheckCircle,
  Warning,
  Business,
  People,
  CalendarToday,
  PieChart,
  Store,
  AccountBalance,
} from '@mui/icons-material';

interface Empresa {
  _id: string;
  nombre: string;
  rfc: string;
  activo: boolean;
}

interface DashboardStats {
  empresas: {
    total: number;
    activas: number;
    lista: Empresa[];
  };
  facturas: {
    total: number;
    pendientes: number;
    pagadas: number;
    vencidas: number;
  };
  montos: {
    totalPendiente: number;
    totalPagado: number;
    totalVencido: number;
    promedioFactura: number;
  };
  proveedores: {
    total: number;
    conDeuda: number;
    lista: Array<{
      rfc: string;
      nombre: string;
      totalDeuda: number;
      facturas: number;
    }>;
  };
  tendencias: {
    facturasEsteMes: number;
    facturasMesAnterior: number;
    montoEsteMes: number;
    montoMesAnterior: number;
  };
  deudaPorEmpresa: Array<{
    empresa: string;
    empresaId: string;
    monto: number;
  }>;
  pagadoPorEmpresa: Array<{
    empresa: string;
    empresaId: string;
    monto: number;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string>('todas');
  const [proveedoresUnicos, setProveedoresUnicos] = useState<string[]>([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', {
        credentials: 'include',
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setStats(data.data);
        
        // Extraer proveedores únicos
        const proveedoresSet = new Set<string>();
        if (data.data.deudaPorEmpresa) {
          data.data.deudaPorEmpresa.forEach((item: any) => proveedoresSet.add(item.empresa));
        }
        if (data.data.pagadoPorEmpresa) {
          data.data.pagadoPorEmpresa.forEach((item: any) => proveedoresSet.add(item.empresa));
        }
        setProveedoresUnicos(Array.from(proveedoresSet));
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const calcularCrecimiento = (actual: number, anterior: number) => {
    if (anterior === 0) return 0;
    return ((actual - anterior) / anterior) * 100;
  };

  // Componente de gráfico de dona animado
  const DonutChart = ({ 
    value, 
    total, 
    color, 
    label, 
    size = 200 
  }: { 
    value: number; 
    total: number; 
    color: string; 
    label: string;
    size?: number;
  }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Círculo de fondo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={40}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="12"
          />
          {/* Círculo animado */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={40}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>
        {/* Texto central */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" fontWeight="700" color={color}>
            {percentage.toFixed(0)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Filtrar datos por empresa
  const getFilteredData = () => {
    if (!stats || empresaSeleccionada === 'todas') {
      return {
        deuda: stats?.deudaPorEmpresa || [],
        pagado: stats?.pagadoPorEmpresa || [],
        pendiente: stats?.montos.totalPendiente || 0,
        pagadoTotal: stats?.montos.totalPagado || 0,
      };
    }

    const deudaFiltrada = stats.deudaPorEmpresa.filter(
      d => d.empresaId === empresaSeleccionada
    );
    const pagadoFiltrado = stats.pagadoPorEmpresa.filter(
      p => p.empresaId === empresaSeleccionada
    );

    const pendiente = deudaFiltrada.reduce((sum, d) => sum + d.monto, 0);
    const pagadoTotal = pagadoFiltrado.reduce((sum, p) => sum + p.monto, 0);

    return {
      deuda: deudaFiltrada,
      pagado: pagadoFiltrado,
      pendiente,
      pagadoTotal,
    };
  };

  const filteredData = getFilteredData();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="body1" color="text.secondary">
          No se pudieron cargar las estadísticas
        </Typography>
      </Box>
    );
  }

  const crecimientoFacturas = calcularCrecimiento(
    stats.tendencias.facturasEsteMes,
    stats.tendencias.facturasMesAnterior
  );

  const crecimientoMonto = calcularCrecimiento(
    stats.tendencias.montoEsteMes,
    stats.tendencias.montoMesAnterior
  );

  return (
    <Box>
      {/* Header - Responsive */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography 
          variant="h4" 
          fontWeight="700" 
          gutterBottom
          sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}
        >
          Dashboard General
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Vista general de todas las empresas y cuentas por pagar
        </Typography>
      </Box>

      {/* KPIs Principales - Responsive Grid */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        {/* Total Pendiente */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              border: '1px solid #E2E8F0',
              borderRadius: { xs: 2, md: 3 },
              background: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%)',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Avatar sx={{ 
                  bgcolor: '#FEE2E2',
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                }}>
                  <AttachMoney sx={{ color: '#DC2626', fontSize: { xs: 20, sm: 24 } }} />
                </Avatar>
                <Chip 
                  label={`${stats.facturas.pendientes} facturas`}
                  size="small"
                  sx={{ 
                    bgcolor: '#FEE2E2', 
                    color: '#DC2626', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  }}
                />
              </Stack>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                gutterBottom 
                display="block"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Total Pendiente
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight="700" 
                color="#DC2626"
                sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
              >
                {formatCurrency(stats.montos.totalPendiente)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Pagado */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              border: '1px solid #E2E8F0',
              borderRadius: { xs: 2, md: 3 },
              background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Avatar sx={{ 
                  bgcolor: '#D1FAE5',
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                }}>
                  <CheckCircle sx={{ color: '#10B981', fontSize: { xs: 20, sm: 24 } }} />
                </Avatar>
                <Chip 
                  label={`${stats.facturas.pagadas} facturas`}
                  size="small"
                  sx={{ 
                    bgcolor: '#D1FAE5', 
                    color: '#10B981', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  }}
                />
              </Stack>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                gutterBottom 
                display="block"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Total Pagado
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight="700" 
                color="#10B981"
                sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
              >
                {formatCurrency(stats.montos.totalPagado)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Facturas Vencidas */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              border: '1px solid #E2E8F0',
              borderRadius: { xs: 2, md: 3 },
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFFFF 100%)',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Avatar sx={{ 
                  bgcolor: '#FDE68A',
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                }}>
                  <Warning sx={{ color: '#D97706', fontSize: { xs: 20, sm: 24 } }} />
                </Avatar>
                <Chip 
                  label={`${stats.facturas.vencidas} vencidas`}
                  size="small"
                  sx={{ 
                    bgcolor: '#FDE68A', 
                    color: '#D97706', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  }}
                />
              </Stack>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                gutterBottom 
                display="block"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Monto Vencido
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight="700" 
                color="#D97706"
                sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
              >
                {formatCurrency(stats.montos.totalVencido)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Promedio por Factura */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              border: '1px solid #E2E8F0',
              borderRadius: { xs: 2, md: 3 },
              background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Avatar sx={{ 
                  bgcolor: '#DBEAFE',
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                }}>
                  <PieChart sx={{ color: '#2563EB', fontSize: { xs: 20, sm: 24 } }} />
                </Avatar>
                <Chip 
                  label={`${stats.facturas.total} total`}
                  size="small"
                  sx={{ 
                    bgcolor: '#DBEAFE', 
                    color: '#2563EB', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  }}
                />
              </Stack>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                gutterBottom 
                display="block"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Promedio por Factura
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight="700" 
                color="#2563EB"
                sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
              >
                {formatCurrency(stats.montos.promedioFactura)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>



      {/* Empresas Activas y Proveedores Únicos - Responsive */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        {/* Lista de Empresas Activas */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: { xs: 2, md: 3 }, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Avatar sx={{ 
                  bgcolor: '#EFF6FF', 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 },
                }}>
                  <Business sx={{ color: '#2563EB', fontSize: { xs: 20, sm: 24 } }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6" 
                    fontWeight="600"
                    sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
                  >
                    Empresas Activas
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    {stats.empresas.activas} de {stats.empresas.total} empresas
                  </Typography>
                </Box>
              </Stack>
              
              <List sx={{ maxHeight: { xs: 250, sm: 300 }, overflow: 'auto' }}>
                {stats.empresas.lista
                  .filter(e => e.activo)
                  .map((empresa) => (
                    <ListItem 
                      key={empresa._id}
                      sx={{ 
                        px: { xs: 1.5, sm: 2 },
                        py: 1,
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: '#F8FAFC',
                        '&:hover': { bgcolor: '#EFF6FF' },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: '#2563EB', 
                          width: { xs: 32, sm: 36 }, 
                          height: { xs: 32, sm: 36 },
                        }}>
                          <Store fontSize="small" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body2" 
                            fontWeight="600"
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                          >
                            {empresa.nombre}
                          </Typography>
                        }
                        secondary={
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            RFC: {empresa.rfc}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Proveedores Únicos */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: { xs: 2, md: 3 }, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Avatar sx={{ 
                  bgcolor: '#F0FDF4', 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 },
                }}>
                  <People sx={{ color: '#10B981', fontSize: { xs: 20, sm: 24 } }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6" 
                    fontWeight="600"
                    sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
                  >
                    Proveedores Únicos
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    {stats.proveedores.total} proveedores • {stats.proveedores.conDeuda} con deuda
                  </Typography>
                </Box>
              </Stack>
              
              <List sx={{ maxHeight: { xs: 250, sm: 300 }, overflow: 'auto' }}>
                {stats.proveedores.lista.map((proveedor) => (
                  <ListItem 
                    key={proveedor.rfc}
                    sx={{ 
                      px: { xs: 1.5, sm: 2 },
                      py: 1,
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: proveedor.totalDeuda > 0 ? '#FEF2F2' : '#F8FAFC',
                      '&:hover': { bgcolor: proveedor.totalDeuda > 0 ? '#FEE2E2' : '#EFF6FF' },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: proveedor.totalDeuda > 0 ? '#DC2626' : '#10B981', 
                        width: { xs: 32, sm: 36 }, 
                        height: { xs: 32, sm: 36 },
                      }}>
                        <AccountBalance fontSize="small" sx={{ fontSize: { xs: 18, sm: 20 } }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body2" 
                          fontWeight="600"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          {proveedor.nombre}
                        </Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            RFC: {proveedor.rfc}
                          </Typography>
                          {proveedor.totalDeuda > 0 && (
                            <Chip 
                              label={`Deuda: ${formatCurrency(proveedor.totalDeuda)}`}
                              size="small"
                              sx={{ 
                                height: { xs: 16, sm: 18 }, 
                                fontSize: { xs: '0.6rem', sm: '0.65rem' },
                                bgcolor: '#FEE2E2', 
                                color: '#DC2626',
                              }}
                            />
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Selector de Empresa - Responsive */}
      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: { xs: 2, md: 3 }, mb: { xs: 3, md: 4 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
            <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Filtrar por Empresa
            </InputLabel>
            <Select
              value={empresaSeleccionada}
              label="Filtrar por Empresa"
              onChange={(e) => setEmpresaSeleccionada(e.target.value)}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              <MenuItem value="todas">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Business fontSize="small" />
                  <Typography>Todas las empresas</Typography>
                </Stack>
              </MenuItem>
              {stats.empresas.lista.map((empresa) => (
                <MenuItem key={empresa._id} value={empresa._id}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Store fontSize="small" />
                    <Typography>{empresa.nombre}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Gráficos de Dona - Responsive */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        {/* Pagado vs Pendiente */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: { xs: 2, md: 3 } }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography 
                variant="h6" 
                fontWeight="600" 
                gutterBottom 
                textAlign="center"
                sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
              >
                Pagado vs Pendiente
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                textAlign="center" 
                display="block" 
                sx={{ mb: 3, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                {empresaSeleccionada === 'todas' ? 'Todas las empresas' : stats.empresas.lista.find(e => e._id === empresaSeleccionada)?.nombre}
              </Typography>
              
              <DonutChart 
                value={filteredData.pagadoTotal}
                total={filteredData.pagadoTotal + filteredData.pendiente}
                color="#10B981"
                label="Pagado"
                size={isMobile ? 160 : 200}
              />
              
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#10B981', borderRadius: '50%' }} />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Pagado
                    </Typography>
                  </Stack>
                  <Typography 
                    variant="body2" 
                    fontWeight="600"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {formatCurrency(filteredData.pagadoTotal)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#DC2626', borderRadius: '50%' }} />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Pendiente
                    </Typography>
                  </Stack>
                  <Typography 
                    variant="body2" 
                    fontWeight="600"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {formatCurrency(filteredData.pendiente)}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Deuda por Empresa */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom textAlign="center">
                Deuda por Empresa
              </Typography>
              <Typography variant="caption" color="text.secondary" textAlign="center" display="block" sx={{ mb: 3 }}>
                Distribución de deuda pendiente
              </Typography>

              {filteredData.deuda.length > 0 ? (
                <>
                  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <Typography variant="h3" fontWeight="700" color="#DC2626">
                      {formatCurrency(filteredData.deuda.reduce((sum, d) => sum + d.monto, 0))}
                    </Typography>
                  </Box>
                  
                  <Stack spacing={1} sx={{ maxHeight: 150, overflow: 'auto' }}>
                    {filteredData.deuda.map((item, index) => {
                      const total = filteredData.deuda.reduce((sum, d) => sum + d.monto, 0);
                      const percentage = (item.monto / total) * 100;
                      return (
                        <Paper key={index} elevation={0} sx={{ p: 1.5, bgcolor: '#FEF2F2', borderRadius: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" fontWeight="600">
                              {item.empresa}
                            </Typography>
                            <Chip 
                              label={`${percentage.toFixed(0)}%`}
                              size="small"
                              sx={{ bgcolor: '#DC2626', color: 'white', fontSize: '0.7rem' }}
                            />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(item.monto)}
                          </Typography>
                        </Paper>
                      );
                    })}
                  </Stack>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Sin deuda registrada
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pagado por Empresa */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom textAlign="center">
                Pagado por Empresa
              </Typography>
              <Typography variant="caption" color="text.secondary" textAlign="center" display="block" sx={{ mb: 3 }}>
                Distribución de pagos realizados
              </Typography>

              {filteredData.pagado.length > 0 ? (
                <>
                  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <Typography variant="h3" fontWeight="700" color="#10B981">
                      {formatCurrency(filteredData.pagado.reduce((sum, p) => sum + p.monto, 0))}
                    </Typography>
                  </Box>
                  
                  <Stack spacing={1} sx={{ maxHeight: 150, overflow: 'auto' }}>
                    {filteredData.pagado.map((item, index) => {
                      const total = filteredData.pagado.reduce((sum, p) => sum + p.monto, 0);
                      const percentage = (item.monto / total) * 100;
                      return (
                        <Paper key={index} elevation={0} sx={{ p: 1.5, bgcolor: '#F0FDF4', borderRadius: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" fontWeight="600">
                              {item.empresa}
                            </Typography>
                            <Chip 
                              label={`${percentage.toFixed(0)}%`}
                              size="small"
                              sx={{ bgcolor: '#10B981', color: 'white', fontSize: '0.7rem' }}
                            />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(item.monto)}
                          </Typography>
                        </Paper>
                      );
                    })}
                  </Stack>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Sin pagos registrados
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Proveedores eliminado - reemplazado por gráficos */}
    </Box>
  );
}
