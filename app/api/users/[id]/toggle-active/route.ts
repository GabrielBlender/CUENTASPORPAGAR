// app/api/users/[id]/toggle-active/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// PATCH - Activar/Desactivar usuario (solo admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const body = await request.json();
    const { activo } = body;

    if (typeof activo !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo activo debe ser un booleano' },
        { status: 400 }
      );
    }

    // No permitir desactivar el propio usuario
    if (user.id === params.id && !activo) {
      return NextResponse.json(
        { error: 'No puedes desactivar tu propio usuario' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          activo,
          updated_at: new Date()
        } 
      },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    if (!result) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
      data: result,
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    return NextResponse.json({ error: 'Error al cambiar estado del usuario' }, { status: 500 });
  }
}
