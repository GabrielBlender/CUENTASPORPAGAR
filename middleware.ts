// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  // Rutas públicas - permitir acceso sin token
  if (request.nextUrl.pathname.startsWith('/login')) {
    // Si ya tiene token válido, redirigir al dashboard
    if (token) {
      const user = await verifyToken(token);
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Rutas de API públicas
  if (
    request.nextUrl.pathname === '/api/auth/login' ||
    request.nextUrl.pathname === '/api/auth/register'
  ) {
    return NextResponse.next();
  }

  // Rutas protegidas - requieren autenticación
  if (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/empresas') ||
    request.nextUrl.pathname.startsWith('/facturas') ||
    request.nextUrl.pathname.startsWith('/api/')
  ) {
    if (!token) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const user = await verifyToken(token);
    if (!user) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Agregar user info a los headers para que esté disponible en API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-role', user.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/empresas/:path*',
    '/facturas/:path*',
    '/login',
    '/api/:path*',
  ],
};
