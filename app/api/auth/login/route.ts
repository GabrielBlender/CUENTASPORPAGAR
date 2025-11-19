// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    if (!user.activo) {
      return NextResponse.json({ error: 'Usuario inactivo' }, { status: 403 });
    }

    const token = await createToken({
      id: user._id.toString(),
      email: user.email,
      nombre: user.nombre,
      role: user.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        nombre: user.nombre,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
