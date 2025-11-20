// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// GET - Obtener un usuario por ID (solo admin)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const db = await getDatabase();
    const foundUser = await db
      .collection('users')
      .findOne({ _id: new ObjectId(params.id) }, { projection: { password: 0 } });

    if (!foundUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: foundUser,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 });
  }
}

// PUT - Actualizar usuario (solo admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, nombre, role } = body;

    const updateData: any = {
      updated_at: new Date(),
    };

    if (email) updateData.email = email;
    if (nombre) updateData.nombre = nombre;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const db = await getDatabase();
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    if (!result) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: result,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

// DELETE - Eliminar usuario (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    // No permitir eliminar el propio usuario
    if (user.id === params.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propio usuario' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db
      .collection('users')
      .deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}
