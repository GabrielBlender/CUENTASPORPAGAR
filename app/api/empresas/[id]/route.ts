// app/api/empresas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { empresaSchema } from '@/lib/validators';
import { ObjectId } from 'mongodb';

// GET - Obtener una empresa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const db = await getDatabase();
    const empresa = await db
      .collection('empresas')
      .findOne({ _id: new ObjectId(params.id) });

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...empresa, id: empresa._id.toString(), _id: undefined },
    });
  } catch (error) {
    console.error('Get empresa error:', error);
    return NextResponse.json({ error: 'Error al obtener empresa' }, { status: 500 });
  }
}

// PUT - Actualizar empresa
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
    const data = empresaSchema.partial().parse(body);

    const db = await getDatabase();
    const result = await db.collection('empresas').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: { ...data, updated_at: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Empresa actualizada exitosamente',
      data: { ...result, id: result._id.toString(), _id: undefined },
    });
  } catch (error: any) {
    console.error('Update empresa error:', error);
    return NextResponse.json({ error: 'Error al actualizar empresa' }, { status: 500 });
  }
}

// DELETE - Eliminar empresa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const db = await getDatabase();

    // Verificar si hay facturas asociadas
    const invoiceCount = await db
      .collection('invoices')
      .countDocuments({ empresa_id: params.id });

    if (invoiceCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una empresa con facturas asociadas' },
        { status: 409 }
      );
    }

    const result = await db
      .collection('empresas')
      .deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Empresa eliminada exitosamente',
    });
  } catch (error) {
    console.error('Delete empresa error:', error);
    return NextResponse.json({ error: 'Error al eliminar empresa' }, { status: 500 });
  }
}
