// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const db = await getDatabase();
    const userData = await db.collection('users').findOne(
      { _id: new ObjectId(user.id) },
      { projection: { password: 0 } }
    );

    if (!userData) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData._id.toString(),
        email: userData.email,
        nombre: userData.nombre,
        role: userData.role,
        activo: userData.activo,
        created_at: userData.created_at,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 });
  }
}
