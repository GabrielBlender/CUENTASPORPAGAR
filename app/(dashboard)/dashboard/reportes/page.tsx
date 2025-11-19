// app/(dashboard)/dashboard/reportes/page.tsx
'use client';

import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TrendingUp,
  Assessment,
} from '@mui/icons-material';

export default function ReportesPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Reportes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Análisis y estadísticas del sistema
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={0}>
            <CardContent>
              <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
                <Box
                  sx={{
                    bgcolor: 'primary.50',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <BarChartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="h6" fontWeight="600">
                  Reporte por Empresa
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Próximamente
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0}>
            <CardContent>
              <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
                <Box
                  sx={{
                    bgcolor: 'success.50',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
                <Typography variant="h6" fontWeight="600">
                  Tendencias
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Próximamente
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0}>
            <CardContent>
              <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
                <Box
                  sx={{
                    bgcolor: 'info.50',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Assessment sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
                <Typography variant="h6" fontWeight="600">
                  Análisis General
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Próximamente
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Funcionalidad en Desarrollo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Los reportes y gráficas estarán disponibles en la próxima versión
        </Typography>
      </Paper>
    </Box>
  );
}
