// app/(dashboard)/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  Business,
  Assessment,
  People,
  Logout,
} from '@mui/icons-material';
import { Squash as Hamburger } from 'hamburger-react';

const DRAWER_WIDTH = 280;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    router.push('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', show: true },
    { text: 'Empresas', icon: <Business />, path: '/empresas', show: true },
    { text: 'Reportes', icon: <Assessment />, path: '/reportes', show: true },
    { text: 'Usuarios', icon: <People />, path: '/usuarios', show: currentUser?.role === 'admin' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800, 
            color: '#FFFFFF',
            letterSpacing: 1,
          }}
        >
          CxP System
        </Typography>
      </Box>

      <List sx={{ mt: 2, px: 2, flexGrow: 1 }}>
        {menuItems.filter(item => item.show).map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={pathname.startsWith(item.path)}
              onClick={() => {
                router.push(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                minHeight: 52,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#FFFFFF',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#FFFFFF',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.08)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 45,
                  color: pathname.startsWith(item.path) ? '#FFFFFF' : '#64748B',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: pathname.startsWith(item.path) ? 600 : 500,
                    fontSize: '0.95rem',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 600,
            }}
          >
            {currentUser?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight="600" noWrap>
              {currentUser?.nombre || 'Usuario'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {currentUser?.role === 'admin' ? 'Administrador' : 'Usuario'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* AppBar - Responsive */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Toolbar>
          {isMobile && (
            <Box sx={{ mr: 2 }}>
              <Hamburger
                toggled={mobileOpen}
                toggle={setMobileOpen}
                size={24}
                color="#1E293B"
                rounded
                label="Toggle menu"
              />
            </Box>
          )}
          
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700,
              color: '#1E293B',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            Cuentas por Pagar
          </Typography>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
            <Avatar 
              sx={{ 
                width: { xs: 32, sm: 36 }, 
                height: { xs: 32, sm: 36 },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600,
              }}
            >
              {currentUser?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                borderRadius: 2,
                minWidth: 200,
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                {currentUser?.nombre || 'Usuario'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {currentUser?.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentUser?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <MenuItem 
              onClick={handleLogout} 
              sx={{ 
                color: 'error.main',
                borderRadius: 1,
                mx: 1,
                '&:hover': {
                  bgcolor: 'error.lighter',
                },
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              boxShadow: '4px 0 12px rgba(0,0,0,0.08)',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content - Responsive */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#F8FAFC',
          p: { xs: 2, sm: 3 },
          mt: { xs: 7, sm: 8 },
          minHeight: 'calc(100vh - 64px)',
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
