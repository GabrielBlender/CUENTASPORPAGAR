// lib/utils.ts

/**
 * Formatea un número como moneda mexicana
 * @param amount - Cantidad a formatear
 * @returns string formateado como moneda
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

/**
 * Formatea una fecha en formato corto
 * @param date - Fecha a formatear
 * @returns string formateado
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-MX').format(d);
}

/**
 * Formatea una fecha con hora
 * @param date - Fecha a formatear
 * @returns string formateado
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d);
}

/**
 * Calcula el porcentaje de cambio entre dos números
 * @param current - Valor actual
 * @param previous - Valor anterior
 * @returns porcentaje de cambio
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Trunca un texto a una longitud máxima
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @returns texto truncado
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Genera un nombre de archivo seguro
 * @param filename - Nombre original del archivo
 * @returns nombre de archivo sanitizado
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Convierte un objeto a query string
 * @param obj - Objeto a convertir
 * @returns query string
 */
export function objectToQueryString(obj: Record<string, any>): string {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

/**
 * Calcula días entre dos fechas
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns número de días
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

/**
 * Verifica si una factura está vencida
 * @param fechaVencimiento - Fecha de vencimiento
 * @returns boolean
 */
export function isOverdue(fechaVencimiento: Date | string): boolean {
  const vencimiento = typeof fechaVencimiento === 'string' ? new Date(fechaVencimiento) : fechaVencimiento;
  return vencimiento < new Date();
}

/**
 * Obtiene el color del badge según el estado
 * @param estado - Estado de la factura
 * @returns color del badge
 */
export function getStatusColor(
  estado: 'pendiente' | 'pagado' | 'vencido' | 'cancelado'
): 'default' | 'success' | 'error' | 'warning' {
  const colors = {
    pendiente: 'warning' as const,
    pagado: 'success' as const,
    vencido: 'error' as const,
    cancelado: 'default' as const,
  };
  return colors[estado];
}

/**
 * Obtiene el texto del estado en español
 * @param estado - Estado de la factura
 * @returns texto del estado
 */
export function getStatusText(
  estado: 'pendiente' | 'pagado' | 'vencido' | 'cancelado'
): string {
  const texts = {
    pendiente: 'Pendiente',
    pagado: 'Pagado',
    vencido: 'Vencido',
    cancelado: 'Cancelado',
  };
  return texts[estado];
}

/**
 * Clasifica una fecha como próxima, normal o vencida
 * @param fecha - Fecha a clasificar
 * @returns clasificación
 */
export function classifyDueDate(fecha: Date | string): 'urgent' | 'soon' | 'normal' | 'overdue' {
  const fechaVencimiento = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const hoy = new Date();
  const dias = daysBetween(hoy, fechaVencimiento);

  if (fechaVencimiento < hoy) return 'overdue';
  if (dias <= 3) return 'urgent';
  if (dias <= 7) return 'soon';
  return 'normal';
}
