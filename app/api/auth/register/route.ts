// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';
import { userSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nombre, role } = userSchema.parse(body);

    const db = await getDatabase();

    // Verificar si el usuario ya existe
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const newUser = {
      email,
      password: hashedPassword,
      nombre,
      role: role || 'user',
      activo: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario registrado exitosamente',
        user: {
          id: result.insertedId.toString(),
          email: newUser.email,
          nombre: newUser.nombre,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 });
  }
}
