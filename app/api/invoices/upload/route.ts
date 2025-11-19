// app/api/invoices/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { cfdiParser } from '@/lib/cfdi-parser';
import { uploadFile } from '@/lib/blob-storage';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const xmlFile = formData.get('xml') as File;
    const pdfFile = formData.get('pdf') as File | null;
    const empresaId = formData.get('empresa_id') as string;

    if (!xmlFile) {
      return NextResponse.json({ error: 'Archivo XML requerido' }, { status: 400 });
    }

    if (!empresaId) {
      return NextResponse.json({ error: 'ID de empresa requerido' }, { status: 400 });
    }

    // Leer contenido del XML
    const xmlContent = await xmlFile.text();

    // Parsear XML CFDI
    const validation = cfdiParser.validateCFDI(xmlContent);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'XML inválido', details: validation.errors },
        { status: 400 }
      );
    }

    const cfdiData = cfdiParser.parseXML(xmlContent);

    // Verificar que el UUID no esté duplicado
    const db = await getDatabase();
    const existingInvoice = await db.collection('invoices').findOne({
      'cfdi.timbreFiscalDigital.uuid': cfdiData.timbreFiscalDigital.uuid,
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Esta factura ya ha sido cargada anteriormente' },
        { status: 409 }
      );
    }

    // Subir archivo XML a Vercel Blob o file system local
    const xmlUrl = await uploadFile(xmlFile, 'xml');

    // Subir PDF si existe
    let pdfUrl: string | null = null;
    if (pdfFile) {
      pdfUrl = await uploadFile(pdfFile, 'pdf');
    }

    // Determinar estado de pago inicial
    let estadoPago: 'pendiente' | 'vencido' = 'pendiente';
    if (cfdiData.fecha < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      estadoPago = 'vencido';
    }

    // Crear documento de factura en MongoDB
    const invoice = {
      empresa_id: empresaId,
      cfdi: cfdiData,
      numero_factura: `${cfdiData.serie}${cfdiData.folio}`,
      estado_pago: estadoPago,
      archivo_xml: xmlUrl,
      archivo_pdf: pdfUrl,
      tags: [],
      notas: '',
      prioridad: 'media' as const,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: user.id,
      actividad: [
        {
          fecha: new Date(),
          usuario: user.nombre,
          accion: 'Creación',
          detalle: 'Factura creada desde XML',
        },
      ],
    };

    const result = await db.collection('invoices').insertOne(invoice);

    return NextResponse.json({
      success: true,
      message: 'Factura creada exitosamente',
      data: {
        id: result.insertedId.toString(),
        numero_factura: invoice.numero_factura,
        total: cfdiData.total,
        proveedor: cfdiData.emisor.nombre,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error al procesar archivo', details: error.message },
      { status: 500 }
    );
  }
}
