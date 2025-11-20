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
} from '@mui/icons-material';

interface DashboardStats {
  empresas: {
    total: number;
    activas: number;
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
    topProveedores: Array<{
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
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Dashboard General
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vista general de todas las empresas y cuentas por pagar
        </Typography>
      </Box>

      {/* KPIs Principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Pendiente */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              border: '1px solid #E2E8F0', 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%)',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#FEE2E2' }}>
                  <AttachMoney sx={{ color: '#DC2626' }} />
                </Avatar>
                <Chip 
                  label={`${stats.facturas.pendientes} facturas`}
                  size="small"
                  sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Total Pendiente
              </Typography>
              <Typography variant="h4" fontWeight="700" color="#DC2626">
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
              borderRadius: 2,
              background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#D1FAE5' }}>
                  <CheckCircle sx={{ color: '#10B981' }} />
                </Avatar>
                <Chip 
                  label={`${stats.facturas.pagadas} facturas`}
                  size="small"
                  sx={{ bgcolor: '#D1FAE5', color: '#10B981', fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Total Pagado
              </Typography>
              <Typography variant="h4" fontWeight="700" color="#10B981">
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
              borderRadius: 2,
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFFFF 100%)',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#FDE68A' }}>
                  <Warning sx={{ color: '#D97706' }} />
                </Avatar>
                <Chip 
                  label={`${stats.facturas.vencidas} vencidas`}
                  size="small"
                  sx={{ bgcolor: '#FDE68A', color: '#D97706', fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Monto Vencido
              </Typography>
              <Typography variant="h4" fontWeight="700" color="#D97706">
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
              borderRadius: 2,
              background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#DBEAFE' }}>
                  <PieChart sx={{ color: '#2563EB' }} />
                </Avatar>
                <Chip 
                  label={`${stats.facturas.total} total`}
                  size="small"
                  sx={{ bgcolor: '#DBEAFE', color: '#2563EB', fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Promedio por Factura
              </Typography>
              <Typography variant="h4" fontWeight="700" color="#2563EB">
                {formatCurrency(stats.montos.promedioFactura)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Métricas Secundarias */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Empresas */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: '#EFF6FF', width: 48, height: 48 }}>
                  <Business sx={{ color: '#2563EB' }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Empresas Registradas
                  </Typography>
                  <Typography variant="h5" fontWeight="700">
                    {stats.empresas.total}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Empresas activas
                </Typography>
                <Chip 
                  label={stats.empresas.activas}
                  size="small"
                  color="primary"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Proveedores */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: '#F0FDF4', width: 48, height: 48 }}>
                  <People sx={{ color: '#10B981' }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Proveedores Únicos
                  </Typography>
                  <Typography variant="h5" fontWeight="700">
                    {stats.proveedores.total}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Con deuda pendiente
                </Typography>
                <Chip 
                  label={stats.proveedores.conDeuda}
                  size="small"
                  sx={{ bgcolor: '#FEE2E2', color: '#DC2626' }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Tendencia del Mes */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: '#F0FDFA', width: 48, height: 48 }}>
                  <CalendarToday sx={{ color: '#14B8A6' }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Facturas Este Mes
                  </Typography>
                  <Typography variant="h5" fontWeight="700">
                    {stats.tendencias.facturasEsteMes}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  vs. mes anterior
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {crecimientoFacturas >= 0 ? (
                    <TrendingUp sx={{ fontSize: 18, color: '#10B981' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 18, color: '#DC2626' }} />
                  )}
                  <Typography 
                    variant="body2" 
                    fontWeight="600"
                    color={crecimientoFacturas >= 0 ? '#10B981' : '#DC2626'}
                  >
                    {Math.abs(crecimientoFacturas).toFixed(1)}%
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Proveedores */}
      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Top Proveedores por Deuda
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Proveedores con mayor monto pendiente de pago
          </Typography>

          {stats.proveedores.topProveedores.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No hay proveedores con deuda
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {stats.proveedores.topProveedores.map((proveedor, index) => (
                <Paper
                  key={proveedor.rfc}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid #F1F5F9',
                    borderRadius: 2,
                    bgcolor: index === 0 ? '#FEF2F2' : '#FFFFFF',
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar 
                        sx={{ 
                          bgcolor: index === 0 ? '#DC2626' : '#64748B',
                          width: 40,
                          height: 40,
                          fontWeight: 700,
                        }}
                      >
                        #{index + 1}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {proveedor.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          RFC: {proveedor.rfc}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack alignItems="flex-end" spacing={0.5}>
                      <Typography variant="h6" fontWeight="700" color={index === 0 ? '#DC2626' : 'text.primary'}>
                        {formatCurrency(proveedor.totalDeuda)}
                      </Typography>
                      <Chip 
                        label={`${proveedor.facturas} factura${proveedor.facturas > 1 ? 's' : ''}`}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
