// Importar tipos CFDI primero
import type { CFDIData } from './cfdi';

// Tipos generales
export interface User {
  id: string;
  email: string;
  nombre: string;
  password?: string;
  role: 'admin' | 'user';
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Empresa {
  id: string;
  nombre: string;
  rfc: string;
  direccion: {
    calle: string;
    numero: string;
    colonia: string;
    ciudad: string;
    estado: string;
    cp: string;
  };
  contacto: {
    nombre: string;
    email: string;
    telefono: string;
  };
  logo?: string;
  activa: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Invoice {
  id: string;
  empresa_id: string;
  cfdi: CFDIData;
  numero_factura: string;
  numero_contrato?: string;
  estado_pago: 'pendiente' | 'pagado' | 'vencido' | 'cancelado';
  fecha_programada_pago?: Date;
  fecha_pago_real?: Date;
  fecha_vencimiento?: Date;
  archivo_xml: string;
  archivo_pdf?: string;
  comprobante_pago?: string;
  tags: string[];
  notas: string;
  categoria?: string;
  prioridad: 'baja' | 'media' | 'alta';
  created_at: Date;
  updated_at: Date;
  created_by: string;
  actividad: ActividadItem[];
}

export interface ActividadItem {
  fecha: Date;
  usuario: string;
  accion: string;
  detalle: string;
}

// Respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard
export interface DashboardMetrics {
  total_deuda_pendiente: number;
  facturas_pendientes: number;
  facturas_pagadas_mes: number;
  proximos_vencimientos: number;
  tendencia_deuda: number;
}

export interface ChartData {
  name: string;
  value: number;
  fecha?: string;
}

// Filtros
export interface InvoiceFilters {
  empresa_id?: string;
  estado_pago?: string[];
  fecha_inicio?: Date;
  fecha_fin?: Date;
  monto_min?: number;
  monto_max?: number;
  proveedor_rfc?: string;
  tags?: string[];
  search?: string;
}

export * from './cfdi';
