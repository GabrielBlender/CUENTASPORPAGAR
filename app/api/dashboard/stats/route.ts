// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const db = await getDatabase();

    // Obtener todas las empresas
    const empresas = await db.collection('empresas').find({}).toArray();
    const empresasActivas = empresas.filter(e => e.activo !== false).length;
    
    // Convertir empresas a formato simple para el frontend
    const listaEmpresas = empresas.map(e => ({
      _id: e._id.toString(),
      nombre: e.nombre,
      rfc: e.rfc,
      activo: e.activo !== false,
    }));

    // Obtener todas las facturas
    const todasFacturas = await db.collection('invoices').find({}).toArray();

    // Calcular estadísticas de facturas
    const facturasPendientes = todasFacturas.filter(f => 
      f.estado_pago === 'pendiente' || f.estado_pago === 'vencido'
    );
    const facturasPagadas = todasFacturas.filter(f => f.estado_pago === 'pagado');
    const facturasVencidas = todasFacturas.filter(f => f.estado_pago === 'vencido');

    // Calcular montos
    const totalPendiente = facturasPendientes.reduce((sum, f) => 
      sum + Number(f.cfdi?.total || 0), 0
    );
    const totalPagado = facturasPagadas.reduce((sum, f) => 
      sum + Number(f.cfdi?.total || 0), 0
    );
    const totalVencido = facturasVencidas.reduce((sum, f) => 
      sum + Number(f.cfdi?.total || 0), 0
    );
    const promedioFactura = todasFacturas.length > 0 
      ? todasFacturas.reduce((sum, f) => sum + Number(f.cfdi?.total || 0), 0) / todasFacturas.length
      : 0;

    // Obtener proveedores únicos
    const proveedoresMap = new Map();
    const proveedoresConDeuda = new Set();

    todasFacturas.forEach(factura => {
      const rfc = factura.cfdi?.emisor?.rfc;
      const nombre = factura.cfdi?.emisor?.nombre || 'Sin nombre';
      
      if (!rfc) return;

      if (!proveedoresMap.has(rfc)) {
        proveedoresMap.set(rfc, {
          rfc,
          nombre,
          totalDeuda: 0,
          facturas: 0,
        });
      }

      const proveedor = proveedoresMap.get(rfc);
      
      // Solo contar deuda pendiente
      if (factura.estado_pago === 'pendiente' || factura.estado_pago === 'vencido') {
        proveedor.totalDeuda += Number(factura.cfdi?.total || 0);
        proveedor.facturas += 1;
        proveedoresConDeuda.add(rfc);
      }
    });

    // Lista de proveedores únicos
    const listaProveedores = Array.from(proveedoresMap.values())
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    // Calcular deuda por empresa
    const deudaPorEmpresaMap = new Map();
    const pagadoPorEmpresaMap = new Map();

    todasFacturas.forEach(factura => {
      const empresaId = factura.empresa_id?.toString();
      if (!empresaId) return;

      const empresa = empresas.find(e => e._id.toString() === empresaId);
      if (!empresa) return;

      const monto = Number(factura.cfdi?.total || 0);

      // Deuda pendiente
      if (factura.estado_pago === 'pendiente' || factura.estado_pago === 'vencido') {
        if (!deudaPorEmpresaMap.has(empresaId)) {
          deudaPorEmpresaMap.set(empresaId, {
            empresa: empresa.nombre,
            empresaId: empresaId,
            monto: 0,
          });
        }
        const item = deudaPorEmpresaMap.get(empresaId);
        item.monto += monto;
      }

      // Pagado
      if (factura.estado_pago === 'pagado') {
        if (!pagadoPorEmpresaMap.has(empresaId)) {
          pagadoPorEmpresaMap.set(empresaId, {
            empresa: empresa.nombre,
            empresaId: empresaId,
            monto: 0,
          });
        }
        const item = pagadoPorEmpresaMap.get(empresaId);
        item.monto += monto;
      }
    });

    const deudaPorEmpresa = Array.from(deudaPorEmpresaMap.values())
      .sort((a, b) => b.monto - a.monto);
    
    const pagadoPorEmpresa = Array.from(pagadoPorEmpresaMap.values())
      .sort((a, b) => b.monto - a.monto);

    // Calcular tendencias del mes
    const ahora = new Date();
    const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59);

    const facturasEsteMes = todasFacturas.filter(f => {
      const fecha = new Date(f.created_at);
      return fecha >= inicioMesActual;
    });

    const facturasMesAnterior = todasFacturas.filter(f => {
      const fecha = new Date(f.created_at);
      return fecha >= inicioMesAnterior && fecha <= finMesAnterior;
    });

    const montoEsteMes = facturasEsteMes.reduce((sum, f) => 
      sum + Number(f.cfdi?.total || 0), 0
    );
    const montoMesAnterior = facturasMesAnterior.reduce((sum, f) => 
      sum + Number(f.cfdi?.total || 0), 0
    );

    const stats = {
      empresas: {
        total: empresas.length,
        activas: empresasActivas,
        lista: listaEmpresas,
      },
      facturas: {
        total: todasFacturas.length,
        pendientes: facturasPendientes.length,
        pagadas: facturasPagadas.length,
        vencidas: facturasVencidas.length,
      },
      montos: {
        totalPendiente,
        totalPagado,
        totalVencido,
        promedioFactura,
      },
      proveedores: {
        total: proveedoresMap.size,
        conDeuda: proveedoresConDeuda.size,
        lista: listaProveedores,
      },
      tendencias: {
        facturasEsteMes: facturasEsteMes.length,
        facturasMesAnterior: facturasMesAnterior.length,
        montoEsteMes,
        montoMesAnterior,
      },
      deudaPorEmpresa,
      pagadoPorEmpresa,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
