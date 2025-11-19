// lib/validators.ts
import { z } from 'zod';

// Usuario
export const userSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  role: z.enum(['admin', 'user']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

// Empresa
export const empresaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  rfc: z
    .string()
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/, 'RFC inválido')
    .transform((val) => val.toUpperCase()),
  direccion: z.object({
    calle: z.string().min(1, 'Calle es requerida'),
    numero: z.string().min(1, 'Número es requerido'),
    colonia: z.string().min(1, 'Colonia es requerida'),
    ciudad: z.string().min(1, 'Ciudad es requerida'),
    estado: z.string().min(1, 'Estado es requerido'),
    cp: z.string().regex(/^\d{5}$/, 'Código postal inválido'),
  }),
  contacto: z.object({
    nombre: z.string().min(1, 'Nombre de contacto es requerido'),
    email: z.string().email('Email inválido'),
    telefono: z.string().min(10, 'Teléfono inválido'),
  }),
  activa: z.boolean().optional(),
});

// Factura
export const invoiceSchema = z.object({
  empresa_id: z.string().min(1, 'Empresa es requerida'),
  numero_factura: z.string().optional(),
  numero_contrato: z.string().optional(),
  estado_pago: z.enum(['pendiente', 'pagado', 'vencido', 'cancelado']).optional(),
  fecha_programada_pago: z.coerce.date().optional(),
  fecha_pago_real: z.coerce.date().optional(),
  fecha_vencimiento: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  notas: z.string().optional(),
  categoria: z.string().optional(),
  prioridad: z.enum(['baja', 'media', 'alta']).optional(),
});

export const invoiceUpdateSchema = invoiceSchema.partial();

// Filtros
export const invoiceFiltersSchema = z.object({
  empresa_id: z.string().optional(),
  estado_pago: z.array(z.string()).optional(),
  fecha_inicio: z.coerce.date().optional(),
  fecha_fin: z.coerce.date().optional(),
  monto_min: z.coerce.number().optional(),
  monto_max: z.coerce.number().optional(),
  proveedor_rfc: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

// Upload
export const uploadSchema = z.object({
  empresa_id: z.string().min(1, 'Empresa es requerida'),
});

/**
 * Valida un RFC mexicano
 * @param rfc - RFC a validar
 * @returns boolean
 */
export function validateRFC(rfc: string): boolean {
  const rfcPattern = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;
  return rfcPattern.test(rfc.toUpperCase());
}

/**
 * Valida un UUID
 * @param uuid - UUID a validar
 * @returns boolean
 */
export function validateUUID(uuid: string): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(uuid);
}

/**
 * Valida un código postal mexicano
 * @param cp - Código postal
 * @returns boolean
 */
export function validateCP(cp: string): boolean {
  return /^\d{5}$/.test(cp);
}

/**
 * Valida un email
 * @param email - Email a validar
 * @returns boolean
 */
export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}
