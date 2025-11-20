// app/api/empresas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import { empresaSchema } from '@/lib/validators';

// GET - Listar todas las empresas
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const db = await getDatabase();
    const empresas = await db
      .collection('empresas')
      .find({})
      .sort({ nombre: 1 })
      .toArray();

    // Serializar _id a string para que Next.js lo maneje correctamente
    const empresasSerializadas = empresas.map((empresa) => ({
      ...empresa,
      _id: empresa._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: empresasSerializadas,
    });
  } catch (error) {
    console.error('Get empresas error:', error);
    return NextResponse.json({ error: 'Error al obtener empresas' }, { status: 500 });
  }
}

// POST - Crear nueva empresa
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const body = await request.json();
    const data = empresaSchema.parse(body);

    // Normalizar nombre: usar razon_social si nombre no está presente
    const normalizedData = {
      ...data,
      nombre: data.nombre || data.razon_social,
      razon_social: data.razon_social || data.nombre,
    };

    const db = await getDatabase();

    // Verificar si el RFC ya existe
    const existingEmpresa = await db.collection('empresas').findOne({ rfc: normalizedData.rfc });
    if (existingEmpresa) {
      return NextResponse.json({ error: 'El RFC ya está registrado' }, { status: 409 });
    }

    const newEmpresa = {
      ...normalizedData,
      activa: normalizedData.activa ?? true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection('empresas').insertOne(newEmpresa);

    return NextResponse.json(
      {
        success: true,
        message: 'Empresa creada exitosamente',
        data: { ...newEmpresa, id: result.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create empresa error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Error al crear empresa' }, { status: 500 });
  }
}
