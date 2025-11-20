// app/api/empresas/[id]/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que el usuario es admin
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden eliminar empresas.' },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID de empresa inválido' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Verificar que la empresa existe
    const empresa = await db.collection('empresas').findOne({
      _id: new ObjectId(id),
    });

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar todas las facturas asociadas a esta empresa
    const deleteFacturasResult = await db.collection('invoices').deleteMany({
      empresa_id: new ObjectId(id),
    });

    // Eliminar la empresa
    const deleteEmpresaResult = await db.collection('empresas').deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteEmpresaResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'No se pudo eliminar la empresa' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Empresa eliminada correctamente junto con ${deleteFacturasResult.deletedCount} factura(s)`,
      data: {
        empresaEliminada: empresa.nombre,
        facturasEliminadas: deleteFacturasResult.deletedCount,
      },
    });
  } catch (error) {
    console.error('Delete empresa error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar empresa' },
      { status: 500 }
    );
  }
}
