// app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const empresaId = searchParams.get('empresa_id');

    const db = await getDatabase();
    const query: any = {};

    if (estado) {
      query.estado_pago = estado;
    }

    if (empresaId) {
      query.empresa_id = empresaId;
    }

    const invoices = await db
      .collection('invoices')
      .find(query)
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      success: true,
      data: invoices,
      count: invoices.length,
    });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Error al obtener facturas' },
      { status: 500 }
    );
  }
}
