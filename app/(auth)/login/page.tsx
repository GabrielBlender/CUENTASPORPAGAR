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
  Avatar,
} from '@mui/material';
import { Lock } from '@mui/icons-material';
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
  const [emailValue, setEmailValue] = useState('');

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

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Obtener la primera letra del email para el avatar
  const getAvatarContent = () => {
    if (emailValue && emailValue.length > 0) {
      return emailValue.charAt(0).toUpperCase();
    }
    return <Lock sx={{ fontSize: 40 }} />;
  };

  const getAvatarColor = () => {
    if (emailValue && emailValue.length > 0) {
      return '#10B981'; // Verde cuando hay texto
    }
    return '#2563EB'; // Azul por defecto
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
                  bgcolor: getAvatarColor(),
                  fontSize: '2rem',
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                }}
              >
                {getAvatarContent()}
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
              <TextField
                {...register('email', {
                  onChange: (e) => setEmailValue(e.target.value)
                })}
                label="Usuario"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
                variant="filled"
                sx={{ 
                  mb: 3,
                  '& .MuiFilledInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#F8FAFC',
                    '&:hover': {
                      backgroundColor: '#F1F5F9',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#F1F5F9',
                    },
                    '&:before': {
                      borderBottom: '2px solid #E2E8F0',
                    },
                    '&:hover:before': {
                      borderBottom: '2px solid #2563EB !important',
                    },
                    '&:after': {
                      borderBottom: '2px solid #2563EB',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: '#64748B',
                    '&.Mui-focused': {
                      color: '#2563EB',
                      fontWeight: 600,
                    },
                  },
                }}
              />

              <TextField
                {...register('password')}
                label="Contraseña"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete="current-password"
                variant="filled"
                sx={{ 
                  mb: 4,
                  '& .MuiFilledInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#F8FAFC',
                    '&:hover': {
                      backgroundColor: '#F1F5F9',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#F1F5F9',
                    },
                    '&:before': {
                      borderBottom: '2px solid #E2E8F0',
                    },
                    '&:hover:before': {
                      borderBottom: '2px solid #2563EB !important',
                    },
                    '&:after': {
                      borderBottom: '2px solid #2563EB',
                    },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: '#64748B',
                    '&.Mui-focused': {
                      color: '#2563EB',
                      fontWeight: 600,
                    },
                  },
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
