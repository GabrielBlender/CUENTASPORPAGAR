import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { deleteFile } from '@/lib/blob-storage';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación y permisos
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar facturas' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const invoiceId = params.id;

    // Buscar la factura primero para obtener las URLs de archivos
    const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(invoiceId) });
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar archivos del storage
    if (invoice.archivo_xml) {
      try {
        await deleteFile(invoice.archivo_xml);
      } catch (error) {
        console.error('Error al eliminar archivo XML:', error);
      }
    }

    if (invoice.archivo_pdf) {
      try {
        await deleteFile(invoice.archivo_pdf);
      } catch (error) {
        console.error('Error al eliminar archivo PDF:', error);
      }
    }

    // Eliminar el documento de la base de datos
    const result = await db.collection('invoices').deleteOne({ _id: new ObjectId(invoiceId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'No se pudo eliminar la factura' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Factura eliminada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const invoiceId = params.id;

    const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(invoiceId) });
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: invoice },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener factura:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar factura (cambiar estado de pago)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const invoiceId = params.id;
    const body = await request.json();
    const { estado_pago, notas } = body;

    // Construir el objeto de actualización
    const updateData: any = {
      $set: {
        updated_at: new Date(),
      }
    };

    if (estado_pago) {
      updateData.$set.estado_pago = estado_pago;
      // Agregar a la actividad
      updateData.$push = {
        actividad: {
          fecha: new Date(),
          usuario: payload.nombre || payload.email,
          accion: estado_pago === 'pagado' ? 'Marcado como pagado' : 'Cambio de estado',
          detalle: `Estado cambiado a: ${estado_pago}`,
        },
      };
    }

    if (notas !== undefined) {
      updateData.$set.notas = notas;
    }

    const result = await db.collection('invoices').findOneAndUpdate(
      { _id: new ObjectId(invoiceId) },
      updateData,
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Factura actualizada exitosamente', data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
