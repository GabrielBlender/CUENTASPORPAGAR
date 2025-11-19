// Tipos para CFDI 4.0 (Comprobante Fiscal Digital por Internet)

export interface CFDIData {
  version: string;
  serie: string;
  folio: string;
  fecha: Date;
  formaPago: string;
  metodoPago: string;
  tipoDeComprobante: string;
  tipoCambio: number;
  moneda: string;
  subtotal: number;
  descuento: number;
  total: number;
  sello: string;
  noCertificado: string;
  certificado: string;
  emisor: CFDIEmisor;
  receptor: CFDIReceptor;
  conceptos: CFDIConcepto[];
  impuestos: CFDIImpuestos;
  timbreFiscalDigital: CFDITimbreFiscal;
}

export interface CFDIEmisor {
  rfc: string;
  nombre: string;
  regimenFiscal: string;
}

export interface CFDIReceptor {
  rfc: string;
  nombre: string;
  domicilioFiscalReceptor: string;
  regimenFiscalReceptor: string;
  usoCFDI: string;
}

export interface CFDIConcepto {
  claveProdServ: string;
  noIdentificacion?: string;
  cantidad: number;
  claveUnidad: string;
  unidad: string;
  descripcion: string;
  valorUnitario: number;
  importe: number;
  descuento?: number;
  objetoImp: string;
  impuestos?: CFDIConceptoImpuestos;
}

export interface CFDIConceptoImpuestos {
  traslados?: CFDITraslado[];
  retenciones?: CFDIRetencion[];
}

export interface CFDIImpuestos {
  totalImpuestosTrasladados: number;
  totalImpuestosRetenidos: number;
  traslados: CFDITraslado[];
  retenciones: CFDIRetencion[];
}

export interface CFDITraslado {
  base: number;
  impuesto: string;
  tipoFactor: string;
  tasaOCuota: number;
  importe: number;
}

export interface CFDIRetencion {
  impuesto: string;
  importe: number;
}

export interface CFDITimbreFiscal {
  uuid: string;
  fechaTimbrado: Date;
  rfcProvCertif: string;
  selloCFD: string;
  noCertificadoSAT: string;
  selloSAT: string;
  version: string;
}

// Catálogos SAT
export const FORMA_PAGO: Record<string, string> = {
  '01': 'Efectivo',
  '02': 'Cheque nominativo',
  '03': 'Transferencia electrónica de fondos',
  '04': 'Tarjeta de crédito',
  '05': 'Monedero electrónico',
  '06': 'Dinero electrónico',
  '08': 'Vales de despensa',
  '12': 'Dación en pago',
  '13': 'Pago por subrogación',
  '14': 'Pago por consignación',
  '15': 'Condonación',
  '17': 'Compensación',
  '23': 'Novación',
  '24': 'Confusión',
  '25': 'Remisión de deuda',
  '26': 'Prescripción o caducidad',
  '27': 'A satisfacción del acreedor',
  '28': 'Tarjeta de débito',
  '29': 'Tarjeta de servicios',
  '30': 'Aplicación de anticipos',
  '31': 'Intermediario pagos',
  '99': 'Por definir',
};

export const METODO_PAGO: Record<string, string> = {
  PUE: 'Pago en una sola exhibición',
  PPD: 'Pago en parcialidades o diferido',
};

export const USO_CFDI: Record<string, string> = {
  G01: 'Adquisición de mercancías',
  G02: 'Devoluciones, descuentos o bonificaciones',
  G03: 'Gastos en general',
  I01: 'Construcciones',
  I02: 'Mobiliario y equipo de oficina por inversiones',
  I03: 'Equipo de transporte',
  I04: 'Equipo de cómputo y accesorios',
  I05: 'Dados, troqueles, moldes, matrices y herramental',
  I06: 'Comunicaciones telefónicas',
  I07: 'Comunicaciones satelitales',
  I08: 'Otra maquinaria y equipo',
  D01: 'Honorarios médicos, dentales y gastos hospitalarios',
  D02: 'Gastos médicos por incapacidad o discapacidad',
  D03: 'Gastos funerales',
  D04: 'Donativos',
  D05: 'Intereses reales efectivamente pagados por créditos hipotecarios',
  D06: 'Aportaciones voluntarias al SAR',
  D07: 'Primas por seguros de gastos médicos',
  D08: 'Gastos de transportación escolar obligatoria',
  D09: 'Depósitos en cuentas para el ahorro',
  D10: 'Pagos por servicios educativos',
  P01: 'Por definir',
  S01: 'Sin efectos fiscales',
  CP01: 'Pagos',
  CN01: 'Nómina',
};

export const TIPO_COMPROBANTE: Record<string, string> = {
  I: 'Ingreso',
  E: 'Egreso',
  T: 'Traslado',
  N: 'Nómina',
  P: 'Pago',
};

export const IMPUESTOS: Record<string, string> = {
  '001': 'ISR',
  '002': 'IVA',
  '003': 'IEPS',
};
