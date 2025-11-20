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
const DRAWER_WIDTH_MINI = 72;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
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
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', show: currentUser?.role === 'admin' },
    { text: 'Empresas', icon: <Business />, path: '/empresas', show: true },
    { text: 'Reportes', icon: <Assessment />, path: '/reportes', show: currentUser?.role === 'admin' },
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
          bgcolor: '#1E293B',
          minHeight: 64,
        }}
      >
        {(isMobile || desktopOpen) ? (
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: '#FFFFFF',
            }}
          >
            Cuenta por Cobrar
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Hamburger
              toggled={desktopOpen}
              toggle={() => setDesktopOpen(!desktopOpen)}
              size={22}
              color="#FFFFFF"
              rounded
              label="Toggle menu"
            />
          </Box>
        )}
      </Box>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

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
                justifyContent: (isMobile || desktopOpen) ? 'initial' : 'center',
                px: (isMobile || desktopOpen) ? 2.5 : 1.5,
                '&.Mui-selected': {
                  bgcolor: '#2563EB',
                  '&:hover': {
                    bgcolor: '#1E40AF',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#FFFFFF',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(37, 99, 235, 0.1)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: (isMobile || desktopOpen) ? 45 : 0,
                  mr: (isMobile || desktopOpen) ? 0 : 'auto',
                  justifyContent: 'center',
                  color: pathname.startsWith(item.path) ? '#FFFFFF' : '#94A3B8',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {(isMobile || desktopOpen) && (
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: pathname.startsWith(item.path) ? 600 : 500,
                      fontSize: '0.95rem',
                      color: '#FFFFFF',
                    },
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
      
      {(isMobile || desktopOpen) ? (
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: '#2563EB',
                fontWeight: 600,
              }}
            >
              {currentUser?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography variant="body2" fontWeight="600" noWrap sx={{ color: '#FFFFFF' }}>
                {currentUser?.nombre || 'Usuario'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ color: '#94A3B8' }}>
                {currentUser?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: 2, mt: 'auto', display: 'flex', justifyContent: 'center' }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: '#2563EB',
              fontWeight: 600,
            }}
          >
            {currentUser?.email?.charAt(0).toUpperCase()}
          </Avatar>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* AppBar - Responsive */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { 
            xs: '100%', 
            md: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - ${DRAWER_WIDTH_MINI}px)`
          },
          ml: { 
            xs: 0, 
            md: desktopOpen ? `${DRAWER_WIDTH}px` : `${DRAWER_WIDTH_MINI}px`
          },
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          {(isMobile || desktopOpen) && (
            <Box sx={{ mr: 2 }}>
              <Hamburger
                toggled={isMobile ? mobileOpen : desktopOpen}
                toggle={() => isMobile ? setMobileOpen(!mobileOpen) : setDesktopOpen(!desktopOpen)}
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
            
          </Typography>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
            <Avatar 
              sx={{ 
                width: { xs: 32, sm: 36 }, 
                height: { xs: 32, sm: 36 },
                bgcolor: '#2563EB',
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
              bgcolor: '#1E293B',
              borderRadius: 0,
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
          width: desktopOpen ? DRAWER_WIDTH : DRAWER_WIDTH_MINI,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: desktopOpen ? DRAWER_WIDTH : DRAWER_WIDTH_MINI,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
            bgcolor: '#1E293B',
            borderRadius: 0,
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
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
          width: { 
            xs: '100%', 
            md: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - ${DRAWER_WIDTH_MINI}px)`
          },
          ml: {
            xs: 0,
            md: desktopOpen ? `${DRAWER_WIDTH}px` : `${DRAWER_WIDTH_MINI}px`
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
