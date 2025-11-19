// app/(dashboard)/dashboard/page.tsx
'use client';

import { Box, Grid, Card, CardContent, Typography, Paper } from '@mui/material';
import {
  TrendingUp,
  Receipt,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

export default function DashboardPage() {
  // Datos de ejemplo - en producción vendrán de la API
  const metrics = {
    totalDeuda: 1250000,
    facturasPendientes: 45,
    facturasPagadasMes: 28,
    proximosVencimientos: 12,
  };

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
  }: any) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color: `${color}.main`, fontSize: 32 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Resumen general del sistema de cuentas por pagar
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Deuda Pendiente"
            value={`$${metrics.totalDeuda.toLocaleString()}`}
            subtitle="+5.2% vs mes anterior"
            icon={TrendingUp}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Facturas Pendientes"
            value={metrics.facturasPendientes}
            subtitle="Por pagar"
            icon={Receipt}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pagadas este Mes"
            value={metrics.facturasPagadasMes}
            subtitle="Completadas"
            icon={CheckCircle}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Próximos Vencimientos"
            value={metrics.proximosVencimientos}
            subtitle="En 7 días"
            icon={Warning}
            color="error"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          🎉 Sistema Implementado Correctamente
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Todas las funcionalidades base están listas. Continúa con la integración de gráficos y tablas de datos.
        </Typography>
      </Paper>
    </Box>
  );
}
