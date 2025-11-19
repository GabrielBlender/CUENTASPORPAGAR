import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { deleteFile } from '@/lib/blob-storage';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
