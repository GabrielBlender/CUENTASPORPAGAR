// app/(dashboard)/reportes/page.tsx
'use client';

import { Box, Typography, Card, CardContent } from '@mui/material';
import { Assessment } from '@mui/icons-material';

export default function ReportesPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="700" gutterBottom>
        Reportes
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Análisis y reportes financieros
      </Typography>

      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <Assessment sx={{ fontSize: 64, color: '#CBD5E1', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Módulo de Reportes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Próximamente: Reportes financieros y análisis avanzados
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
