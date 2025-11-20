// app/api/invoices/[id]/upload-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { uploadFile } from '@/lib/blob-storage';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;

    if (!pdfFile) {
      return NextResponse.json({ error: 'Archivo PDF requerido' }, { status: 400 });
    }

    // Validar que sea un PDF
    if (!pdfFile.type.includes('pdf')) {
      return NextResponse.json({ error: 'El archivo debe ser un PDF' }, { status: 400 });
    }

    // Subir archivo PDF
    const pdfUrl = await uploadFile(pdfFile, 'pdf');

    // Actualizar la factura en MongoDB
    const db = await getDatabase();
    
    const updateData: any = {
      $set: {
        archivo_pdf: pdfUrl,
        updated_at: new Date(),
      },
      $push: {
        actividad: {
          fecha: new Date(),
          usuario: user.nombre || user.email,
          accion: 'PDF cargado',
          detalle: 'Archivo PDF adjuntado a la factura',
        },
      },
    };
    
    const result = await db.collection('invoices').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
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
      { 
        message: 'PDF cargado exitosamente',
        data: result
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al cargar PDF:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
