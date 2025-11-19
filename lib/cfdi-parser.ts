// lib/cfdi-parser.ts
import { XMLParser } from 'fast-xml-parser';
import type { CFDIData } from '@/types/cfdi';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Clase para parsear y validar archivos XML de CFDI 4.0
 */
export class CFDIParser {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true,
      parseTagValue: true,
    });
  }

  /**
   * Parsea un XML de CFDI 4.0 y extrae TODA la información
   * @param xmlContent - Contenido del archivo XML como string
   * @returns Objeto con toda la estructura del CFDI
   */
  parseXML(xmlContent: string): CFDIData {
    const parsed = this.parser.parse(xmlContent);
    const comprobante = parsed['cfdi:Comprobante'] || parsed['Comprobante'];

    if (!comprobante) {
      throw new Error('XML no contiene un comprobante CFDI válido');
    }

    // Datos generales del comprobante
    const cfdiData: CFDIData = {
      version: comprobante['@_Version'] || '4.0',
      serie: comprobante['@_Serie'] || '',
      folio: comprobante['@_Folio'] || '',
      fecha: new Date(comprobante['@_Fecha']),
      formaPago: comprobante['@_FormaPago'] || '',
      metodoPago: comprobante['@_MetodoPago'] || '',
      tipoDeComprobante: comprobante['@_TipoDeComprobante'],
      tipoCambio: parseFloat(comprobante['@_TipoCambio'] || '1'),
      moneda: comprobante['@_Moneda'] || 'MXN',
      subtotal: parseFloat(comprobante['@_SubTotal'] || '0'),
      descuento: parseFloat(comprobante['@_Descuento'] || '0'),
      total: parseFloat(comprobante['@_Total'] || '0'),
      sello: comprobante['@_Sello'] || '',
      noCertificado: comprobante['@_NoCertificado'] || '',
      certificado: comprobante['@_Certificado'] || '',
      emisor: {
        rfc: '',
        nombre: '',
        regimenFiscal: '',
      },
      receptor: {
        rfc: '',
        nombre: '',
        domicilioFiscalReceptor: '',
        regimenFiscalReceptor: '',
        usoCFDI: '',
      },
      conceptos: [],
      impuestos: {
        totalImpuestosTrasladados: 0,
        totalImpuestosRetenidos: 0,
        traslados: [],
        retenciones: [],
      },
      timbreFiscalDigital: {
        uuid: '',
        fechaTimbrado: new Date(),
        rfcProvCertif: '',
        selloCFD: '',
        noCertificadoSAT: '',
        selloSAT: '',
        version: '',
      },
    };

    // Emisor
    const emisor = comprobante['cfdi:Emisor'] || comprobante['Emisor'];
    if (emisor) {
      cfdiData.emisor = {
        rfc: emisor['@_Rfc'] || '',
        nombre: emisor['@_Nombre'] || '',
        regimenFiscal: emisor['@_RegimenFiscal'] || '',
      };
    }

    // Receptor
    const receptor = comprobante['cfdi:Receptor'] || comprobante['Receptor'];
    if (receptor) {
      cfdiData.receptor = {
        rfc: receptor['@_Rfc'] || '',
        nombre: receptor['@_Nombre'] || '',
        domicilioFiscalReceptor: receptor['@_DomicilioFiscalReceptor'] || '',
        regimenFiscalReceptor: receptor['@_RegimenFiscalReceptor'] || '',
        usoCFDI: receptor['@_UsoCFDI'] || '',
      };
    }

    // Conceptos
    const conceptos =
      comprobante['cfdi:Conceptos']?.['cfdi:Concepto'] ||
      comprobante['Conceptos']?.['Concepto'];
    if (conceptos) {
      const conceptosArray = Array.isArray(conceptos) ? conceptos : [conceptos];
      cfdiData.conceptos = conceptosArray.map((concepto: any) => ({
        claveProdServ: concepto['@_ClaveProdServ'] || '',
        noIdentificacion: concepto['@_NoIdentificacion'],
        cantidad: parseFloat(concepto['@_Cantidad'] || '0'),
        claveUnidad: concepto['@_ClaveUnidad'] || '',
        unidad: concepto['@_Unidad'] || '',
        descripcion: concepto['@_Descripcion'] || '',
        valorUnitario: parseFloat(concepto['@_ValorUnitario'] || '0'),
        importe: parseFloat(concepto['@_Importe'] || '0'),
        descuento: parseFloat(concepto['@_Descuento'] || '0'),
        objetoImp: concepto['@_ObjetoImp'] || '01',
      }));
    }

    // Impuestos
    const impuestos = comprobante['cfdi:Impuestos'] || comprobante['Impuestos'];
    if (impuestos) {
      cfdiData.impuestos.totalImpuestosTrasladados = parseFloat(
        impuestos['@_TotalImpuestosTrasladados'] || '0'
      );
      cfdiData.impuestos.totalImpuestosRetenidos = parseFloat(
        impuestos['@_TotalImpuestosRetenidos'] || '0'
      );

      // Traslados (IVA, etc.)
      const traslados =
        impuestos['cfdi:Traslados']?.['cfdi:Traslado'] ||
        impuestos['Traslados']?.['Traslado'];
      if (traslados) {
        const trasladosArray = Array.isArray(traslados) ? traslados : [traslados];
        cfdiData.impuestos.traslados = trasladosArray.map((traslado: any) => ({
          base: parseFloat(traslado['@_Base'] || '0'),
          impuesto: traslado['@_Impuesto'] || '',
          tipoFactor: traslado['@_TipoFactor'] || '',
          tasaOCuota: parseFloat(traslado['@_TasaOCuota'] || '0'),
          importe: parseFloat(traslado['@_Importe'] || '0'),
        }));
      }

      // Retenciones
      const retenciones =
        impuestos['cfdi:Retenciones']?.['cfdi:Retencion'] ||
        impuestos['Retenciones']?.['Retencion'];
      if (retenciones) {
        const retencionesArray = Array.isArray(retenciones) ? retenciones : [retenciones];
        cfdiData.impuestos.retenciones = retencionesArray.map((retencion: any) => ({
          impuesto: retencion['@_Impuesto'] || '',
          importe: parseFloat(retencion['@_Importe'] || '0'),
        }));
      }
    }

    // Timbre Fiscal Digital (Complemento)
    const complemento = comprobante['cfdi:Complemento'] || comprobante['Complemento'];
    if (complemento) {
      const tfd =
        complemento['tfd:TimbreFiscalDigital'] || complemento['TimbreFiscalDigital'];
      if (tfd) {
        cfdiData.timbreFiscalDigital = {
          uuid: tfd['@_UUID'] || '',
          fechaTimbrado: new Date(tfd['@_FechaTimbrado']),
          rfcProvCertif: tfd['@_RfcProvCertif'] || '',
          selloCFD: tfd['@_SelloCFD'] || '',
          noCertificadoSAT: tfd['@_NoCertificadoSAT'] || '',
          selloSAT: tfd['@_SelloSAT'] || '',
          version: tfd['@_Version'] || '1.1',
        };
      }
    }

    return cfdiData;
  }

  /**
   * Valida que el XML sea un CFDI 4.0 válido
   * @param xmlContent - Contenido del XML a validar
   * @returns ValidationResult con el resultado de la validación
   */
  validateCFDI(xmlContent: string): ValidationResult {
    const errors: string[] = [];

    try {
      const cfdiData = this.parseXML(xmlContent);

      // Validaciones básicas
      if (!cfdiData.version || !cfdiData.version.startsWith('4')) {
        errors.push('El CFDI debe ser versión 4.0 o superior');
      }

      if (!cfdiData.emisor.rfc) {
        errors.push('RFC del emisor es obligatorio');
      }

      if (!cfdiData.receptor.rfc) {
        errors.push('RFC del receptor es obligatorio');
      }

      if (!cfdiData.timbreFiscalDigital.uuid) {
        errors.push('UUID del timbre fiscal es obligatorio');
      }

      if (cfdiData.conceptos.length === 0) {
        errors.push('Debe haber al menos un concepto');
      }

      if (cfdiData.total <= 0) {
        errors.push('El total debe ser mayor a cero');
      }

      // Validar coherencia de totales
      const subtotalCalculado = cfdiData.conceptos.reduce(
        (sum, c) => sum + c.importe,
        0
      );
      const diff = Math.abs(subtotalCalculado - cfdiData.subtotal);
      if (diff > 0.01) {
        errors.push(
          `Subtotal no coincide con la suma de conceptos (diferencia: $${diff.toFixed(2)})`
        );
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [
          `Error al parsear XML: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Valida el formato de un RFC
   * @param rfc - RFC a validar
   * @returns boolean
   */
  validateRFC(rfc: string): boolean {
    // RFC Persona Moral: 12 caracteres
    // RFC Persona Física: 13 caracteres
    const rfcPattern = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;
    return rfcPattern.test(rfc.toUpperCase());
  }

  /**
   * Valida el formato de un UUID
   * @param uuid - UUID a validar
   * @returns boolean
   */
  validateUUID(uuid: string): boolean {
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(uuid);
  }
}

// Exportar instancia singleton
export const cfdiParser = new CFDIParser();
