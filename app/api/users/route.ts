// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET - Listar todos los usuarios (solo admin)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const db = await getDatabase();
    const users = await db
      .collection('users')
      .find({})
      .project({ password: 0 }) // No enviar passwords
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// POST - Crear nuevo usuario (solo admin)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, nombre, role } = body;

    // Validaciones
    if (!email || !password || !nombre) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre son requeridos' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Verificar si el email ya existe
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      nombre,
      role: role || 'user',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario creado exitosamente',
        data: { ...newUser, _id: result.insertedId, password: undefined },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}
