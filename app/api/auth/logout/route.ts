// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    await removeAuthCookie();
    return NextResponse.json({ success: true, message: 'Sesión cerrada' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Error al cerrar sesión' }, { status: 500 });
  }
}
