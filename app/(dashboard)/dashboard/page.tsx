// app/(dashboard)/dashboard/page.tsx
'use client';

import { Box, Grid, Card, CardContent, Typography, Paper, Stack } from '@mui/material';
import {
  TrendingUp,
  Receipt,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

export default function DashboardPage() {
  const metrics = {
    totalDeuda: 1250000,
    facturasPendientes: 45,
    facturasPagadasMes: 28,
    proximosVencimientos: 12,
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <Card elevation={0}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom sx={{ fontSize: '0.875rem' }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="700" sx={{ my: 1 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.50`,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color: `${color}.main`, fontSize: 28 }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Resumen general del sistema de cuentas por pagar
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Total Deuda Pendiente"
            value={`$${metrics.totalDeuda.toLocaleString()}`}
            subtitle="+5.2% vs mes anterior"
            icon={TrendingUp}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Facturas Pendientes"
            value={metrics.facturasPendientes}
            subtitle="Por pagar"
            icon={Receipt}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Pagadas este Mes"
            value={metrics.facturasPagadasMes}
            subtitle="Completadas"
            icon={CheckCircle}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Próximos Vencimientos"
            value={metrics.proximosVencimientos}
            subtitle="En 7 días"
            icon={Warning}
            color="error"
          />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Sistema Completamente Funcional
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Navega por el menú lateral para acceder a empresas, facturas y reportes.
        </Typography>
      </Paper>
    </Box>
  );
}
