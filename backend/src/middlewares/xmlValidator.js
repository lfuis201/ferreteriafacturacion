const xml2js = require('xml2js');
const fs = require('fs');

/**
 * Middleware para validar archivos XML de compras según estándares SUNAT
 */
const validarXmlCompra = async (req, res, next) => {
  try {
    const xmlFile = req.file;
    
    // Verificar que existe el archivo
    if (!xmlFile) {
      return res.status(400).json({ 
        mensaje: 'Archivo XML requerido',
        codigo: 'XML_REQUIRED'
      });
    }

    // Verificar extensión del archivo
    if (!xmlFile.originalname.toLowerCase().endsWith('.xml')) {
      return res.status(400).json({ 
        mensaje: 'El archivo debe tener extensión .xml',
        codigo: 'INVALID_EXTENSION'
      });
    }

    // Verificar tamaño del archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (xmlFile.size > maxSize) {
      return res.status(400).json({ 
        mensaje: 'El archivo XML no puede exceder 5MB',
        codigo: 'FILE_TOO_LARGE'
      });
    }

    // Leer contenido del archivo
    let xmlContent;
    try {
      xmlContent = fs.readFileSync(xmlFile.path, 'utf8');
    } catch (readError) {
      return res.status(400).json({ 
        mensaje: 'Error al leer el archivo XML',
        codigo: 'READ_ERROR',
        error: readError.message
      });
    }

    // Validar que es un XML válido
    let parsedXml;
    try {
      const parser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: false,
        mergeAttrs: true
      });
      parsedXml = await parser.parseStringPromise(xmlContent);
    } catch (parseError) {
      return res.status(400).json({ 
        mensaje: 'Formato XML inválido',
        codigo: 'INVALID_XML_FORMAT',
        error: parseError.message
      });
    }

    // Validar estructura básica de comprobante electrónico SUNAT
    const validationResult = validarEstructuraSunat(parsedXml);
    if (!validationResult.valido) {
      return res.status(400).json({ 
        mensaje: 'XML no cumple con estructura SUNAT',
        codigo: 'INVALID_SUNAT_STRUCTURE',
        errores: validationResult.errores
      });
    }

    // Agregar datos parseados al request para uso posterior
    req.xmlData = {
      content: xmlContent,
      parsed: parsedXml,
      validation: validationResult
    };

    next();
  } catch (error) {
    return res.status(500).json({ 
      mensaje: 'Error interno al validar XML',
      codigo: 'VALIDATION_ERROR',
      error: error.message
    });
  }
};

/**
 * Valida la estructura del XML según estándares SUNAT
 * @param {Object} parsedXml - XML parseado
 * @returns {Object} Resultado de validación
 */
function validarEstructuraSunat(parsedXml) {
  const errores = [];
  let valido = true;

  try {
    // Verificar nodo raíz (puede ser Invoice, CreditNote, DebitNote, etc.)
    const rootKeys = Object.keys(parsedXml);
    if (rootKeys.length === 0) {
      errores.push('XML vacío o sin nodo raíz');
      valido = false;
    }

    const rootNode = parsedXml[rootKeys[0]];
    if (!rootNode) {
      errores.push('Nodo raíz inválido');
      valido = false;
      return { valido, errores };
    }

    // Validar campos obligatorios básicos
    const camposObligatorios = [
      'cbc:ID', // Número del comprobante
      'cbc:IssueDate', // Fecha de emisión
      'cac:AccountingSupplierParty', // Datos del proveedor
      'cac:AccountingCustomerParty', // Datos del cliente
      'cac:TaxTotal', // Totales de impuestos
      'cac:LegalMonetaryTotal' // Totales monetarios
    ];

    camposObligatorios.forEach(campo => {
      const valor = obtenerValorAnidado(rootNode, campo);
      // Para campos complejos, verificar que el objeto existe
      const existe = valor !== null && valor !== undefined;
      if (!existe) {
        errores.push(`Campo obligatorio faltante: ${campo}`);
        valido = false;
      }
    });

    // Validar RUC del proveedor
    const rucProveedor = obtenerValorAnidado(rootNode, 'cac:AccountingSupplierParty.cac:Party.cac:PartyIdentification.cbc:ID');
    if (rucProveedor && !validarRuc(rucProveedor)) {
      errores.push('RUC del proveedor inválido');
      valido = false;
    }

    // Validar que existan líneas de detalle
    const lineasDetalle = rootNode['cac:InvoiceLine'] || rootNode['cac:CreditNoteLine'] || rootNode['cac:DebitNoteLine'];
    if (!lineasDetalle) {
      errores.push('No se encontraron líneas de detalle en el comprobante');
      valido = false;
    }

    // Validar moneda
    const moneda = obtenerValorAnidado(rootNode, 'cbc:DocumentCurrencyCode');
    if (moneda && !['PEN', 'USD', 'EUR'].includes(moneda)) {
      errores.push(`Moneda no válida: ${moneda}`);
      valido = false;
    }

  } catch (error) {
    errores.push(`Error en validación de estructura: ${error.message}`);
    valido = false;
  }

  return { valido, errores };
}

/**
 * Obtiene un valor anidado del objeto usando notación de puntos
 * @param {Object} obj - Objeto a buscar
 * @param {string} path - Ruta del valor (ej: 'cac:Party.cbc:ID')
 * @returns {any} Valor encontrado o null
 */
function obtenerValorAnidado(obj, path) {
  const valor = path.split('.').reduce((current, key) => {
    return current && current[key] ? current[key] : null;
  }, obj);
  
  // Si el valor es un objeto con propiedades como '_' o '$', extraer el texto
  if (valor && typeof valor === 'object') {
    // Caso común: { _: 'PEN', $: { ... } }
    if (valor._ !== undefined) {
      return valor._;
    }
    // Caso alternativo: { $t: 'PEN' }
    if (valor.$t !== undefined) {
      return valor.$t;
    }
    // Si es un objeto simple con una sola propiedad de texto
    const keys = Object.keys(valor);
    if (keys.length === 1 && typeof valor[keys[0]] === 'string') {
      return valor[keys[0]];
    }
    // Para objetos complejos, devolver el objeto mismo (no null)
    return valor;
  }
  
  return valor;
}

/**
 * Valida formato de RUC peruano
 * @param {string} ruc - RUC a validar
 * @returns {boolean} True si es válido
 */
function validarRuc(ruc) {
  if (!ruc || typeof ruc !== 'string') return false;
  
  // RUC debe tener 11 dígitos
  if (!/^\d{11}$/.test(ruc)) return false;
  
  // Para desarrollo, aceptar cualquier RUC con formato válido
  // En producción, se puede activar la validación completa del dígito verificador
  const esDesarrollo = process.env.NODE_ENV !== 'production';
  
  if (esDesarrollo) {
    // En desarrollo, solo validar formato (11 dígitos)
    return true;
  }
  
  // Validar dígito verificador (algoritmo SUNAT) - solo en producción
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;
  
  for (let i = 0; i < 10; i++) {
    suma += parseInt(ruc[i]) * factores[i];
  }
  
  const resto = suma % 11;
  const digitoVerificador = resto < 2 ? resto : 11 - resto;
  
  return parseInt(ruc[10]) === digitoVerificador;
}

module.exports = {
  validarXmlCompra,
  validarEstructuraSunat,
  validarRuc
};