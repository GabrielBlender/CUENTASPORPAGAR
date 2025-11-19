// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  Avatar,
} from '@mui/material';
import { Lock, Person } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Usuario requerido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al iniciar sesión');
      }

      router.push('/empresas');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
      }}
    >
      <Container maxWidth="xs">
        <Card 
          elevation={2}
          sx={{ 
            borderRadius: 3,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          }}
        >
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 3,
                  bgcolor: '#2563EB',
                }}
              >
                <Lock sx={{ fontSize: 40 }} />
              </Avatar>
              
              <Typography variant="h5" component="h1" fontWeight="700" gutterBottom color="text.primary">
                Sistema de Cuentas por Pagar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ingresa tus credenciales para continuar
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                Usuario
              </Typography>
              <TextField
                {...register('email')}
                fullWidth
                placeholder="MAURO"
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    backgroundColor: '#F1F5F9',
                    '& fieldset': { border: 'none' },
                    borderRadius: 2,
                  }
                }}
              />

              <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                Contraseña
              </Typography>
              <TextField
                {...register('password')}
                type="password"
                fullWidth
                placeholder="••••••••••••"
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete="current-password"
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    backgroundColor: '#F1F5F9',
                    '& fieldset': { border: 'none' },
                    borderRadius: 2,
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  }
                }}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Sistema de gestión empresarial
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
