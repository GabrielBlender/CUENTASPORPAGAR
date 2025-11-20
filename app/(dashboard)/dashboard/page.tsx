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
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useMediaQuery,
  useTheme,
  Chip,
  Divider,
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
  PieChart as PieChartIcon,
  Store,
  AccountBalance,
} from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';

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

// Componente para texto central del gráfico
interface PieCenterLabelProps {
  children: React.ReactNode;
}

function PieCenterLabel({ children }: PieCenterLabelProps) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <text
      x={left + width / 2}
      y={top + height / 2}
      style={{
        textAnchor: 'middle',
        dominantBaseline: 'central',
        fontSize: '24px',
        fontWeight: 'bold',
        fill: '#1e293b',
      }}
    >
      {children}
    </text>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Preparar datos para el gráfico multi-anillo
  const prepareChartData = () => {
    if (!stats) return { empresaData: [], empresaPaymentData: [], estadoData: [], estadoEmpresaData: [] };

    // Colores variados para empresas
    const empresaColors = [
      '#3B82F6', // Azul
      '#8B5CF6', // Púrpura
      '#EC4899', // Rosa
      '#F59E0B', // Naranja
      '#06B6D4', // Cyan
      '#14B8A6', // Teal
      '#6366F1', // Indigo
      '#F97316', // Naranja oscuro
    ];

    // Calcular total de facturas
    const totalFacturas = stats.facturas.total;

    // Datos del anillo interior (Empresas)
    const empresaData = stats.empresas.lista.map((empresa, index) => {
      // Calcular cuántas facturas tiene cada empresa (esto es aproximado, ajusta según tu API)
      const facturasPorEmpresa = Math.round(totalFacturas / stats.empresas.lista.length); // Distribución simplificada
      const percentage = (facturasPorEmpresa / totalFacturas) * 100;
      
      return {
        id: empresa.nombre.substring(0, 20), // Nombre corto
        value: facturasPorEmpresa,
        label: empresa.nombre,
        percentage,
        color: empresaColors[index % empresaColors.length],
      };
    });

    // Datos del anillo exterior (Estado de pago por empresa)
    const empresaPaymentData: any[] = [];
    stats.empresas.lista.forEach((empresa, empresaIndex) => {
      // Calcular facturas pagadas y pendientes por empresa
      const facturasPorEmpresa = Math.round(totalFacturas / stats.empresas.lista.length);
      const pagadas = Math.round(facturasPorEmpresa * (stats.facturas.pagadas / totalFacturas));
      const pendientes = facturasPorEmpresa - pagadas;

      // Pagadas (verde)
      if (pagadas > 0) {
        empresaPaymentData.push({
          id: `${empresa.nombre}-Pagadas`,
          value: pagadas,
          label: 'Pagadas',
          empresaNombre: empresa.nombre,
          percentage: (pagadas / totalFacturas) * 100,
          color: '#10B981', // Verde para pagadas
        });
      }

      // Pendientes (rojo)
      if (pendientes > 0) {
        empresaPaymentData.push({
          id: `${empresa.nombre}-Pendientes`,
          value: pendientes,
          label: 'Pendientes',
          empresaNombre: empresa.nombre,
          percentage: (pendientes / totalFacturas) * 100,
          color: '#DC2626', // Rojo para pendientes
        });
      }
    });

    return {
      empresaData,
      empresaPaymentData,
    };
  };

  // Componente de gráfico de dona animado con dos segmentos (Pagado y Pendiente)
  const DualDonutChart = ({ 
    pagado, 
    pendiente, 
    size = 200 
  }: { 
    pagado: number; 
    pendiente: number; 
    size?: number;
  }) => {
    const total = pagado + pendiente;
    const pagadoPercentage = total > 0 ? (pagado / total) * 100 : 0;
    const pendientePercentage = total > 0 ? (pendiente / total) * 100 : 0;
    const circumference = 2 * Math.PI * 40;
    
    const pagadoStrokeDashoffset = circumference - (pagadoPercentage / 100) * circumference;
    const pendienteStrokeDasharray = `${(pendientePercentage / 100) * circumference} ${circumference}`;
    const pendienteStrokeOffset = -circumference + pagadoStrokeDashoffset;

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
          {/* Segmento Pagado (verde) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={40}
            fill="none"
            stroke="#10B981"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={pagadoStrokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
          {/* Segmento Pendiente (rojo) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={40}
            fill="none"
            stroke="#DC2626"
            strokeWidth="12"
            strokeDasharray={pendienteStrokeDasharray}
            strokeDashoffset={pendienteStrokeOffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dasharray 1s ease-in-out, stroke-dashoffset 1s ease-in-out',
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
          <Typography variant="h4" fontWeight="700" color="#10B981">
            {pagadoPercentage.toFixed(0)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Pagado
          </Typography>
        </Box>
      </Box>
    );
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

      {/* Gráfico Multi-Anillo: Empresas y Estado de Pago */}
      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: { xs: 2, md: 3 }, mb: { xs: 3, md: 4 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h6" 
              fontWeight="600" 
              gutterBottom
              sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
            >
              Distribución de Facturas por Empresa
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              Total: {stats.facturas.total} facturas ({stats.facturas.pagadas} pagadas, {stats.facturas.pendientes} pendientes)
            </Typography>
          </Box>

          {/* Gráfico Multi-Anillo */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: { xs: 400, sm: 500 },
          }}>
            {(() => {
              const chartData = prepareChartData();
              
              return (
                <PieChart
                  series={[
                    {
                      innerRadius: isMobile ? 40 : 60,
                      outerRadius: isMobile ? 100 : 140,
                      data: chartData.empresaData,
                      arcLabel: (item: any) => `${item.percentage.toFixed(0)}%`,
                      arcLabelMinAngle: 20,
                    },
                    {
                      innerRadius: isMobile ? 105 : 145,
                      outerRadius: isMobile ? 125 : 175,
                      data: chartData.empresaPaymentData,
                      arcLabel: (item: any) => `${item.label}`,
                      arcLabelMinAngle: 15,
                    },
                  ]}
                  width={isMobile ? 350 : 500}
                  height={isMobile ? 350 : 500}
                  margin={{ top: 50, bottom: 50, left: 50, right: 50 }}
                >
                  <PieCenterLabel>
                    {stats.facturas.total}
                  </PieCenterLabel>
                </PieChart>
              );
            })()}
          </Box>

          {/* Resumen de Facturas */}
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="600">
                      Total Pagadas
                    </Typography>
                  </Stack>
                  <Stack alignItems="flex-end">
                    <Typography variant="h6" fontWeight="700" color="#10B981">
                      {stats.facturas.pagadas}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(stats.montos.totalPagado)}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#FEF2F2', borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Warning sx={{ color: '#DC2626', fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="600">
                      Total Pendientes
                    </Typography>
                  </Stack>
                  <Stack alignItems="flex-end">
                    <Typography variant="h6" fontWeight="700" color="#DC2626">
                      {stats.facturas.pendientes}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(stats.montos.totalPendiente)}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Montos por Empresa */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
              Montos por Empresa
            </Typography>
            <Grid container spacing={2}>
              {stats.empresas.lista.map((empresa) => {
                const pagadoEmpresa = stats.pagadoPorEmpresa.find(p => p.empresaId === empresa._id);
                const pendienteEmpresa = stats.deudaPorEmpresa.find(d => d.empresaId === empresa._id);
                const montoPagado = pagadoEmpresa?.monto || 0;
                const montoPendiente = pendienteEmpresa?.monto || 0;
                const total = montoPagado + montoPendiente;
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={empresa._id}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        border: '1px solid #E2E8F0',
                        borderRadius: 2,
                        height: '100%',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom noWrap>
                        {empresa.nombre}
                      </Typography>
                      <Stack spacing={1.5} sx={{ mt: 2 }}>
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              Pagado
                            </Typography>
                            <Typography variant="body2" fontWeight="600" color="#10B981">
                              {formatCurrency(montoPagado)}
                            </Typography>
                          </Stack>
                        </Box>
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              Pendiente
                            </Typography>
                            <Typography variant="body2" fontWeight="600" color="#DC2626">
                              {formatCurrency(montoPendiente)}
                            </Typography>
                          </Stack>
                        </Box>
                        <Divider sx={{ my: 0.5 }} />
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" fontWeight="600">
                              Total
                            </Typography>
                            <Typography variant="body2" fontWeight="700">
                              {formatCurrency(total)}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Listas - Empresas y Proveedores */}
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

      {/* Top Proveedores eliminado - reemplazado por gráficos */}
    </Box>
  );
}
