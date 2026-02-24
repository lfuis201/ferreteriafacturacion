const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * Servicio para generar PDFs de comprobantes electrónicos
 */
class PdfGeneratorService {
  constructor() {
    this.outputDir = path.join(__dirname, '../../files');
    this.ensureOutputDir();
  }

  /**
   * Asegura que el directorio de salida existe
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Genera PDF de comprobante de compra
   * @param {Object} datosComprobante - Datos del comprobante
   * @param {string} cdr - CDR de SUNAT
   * @param {number} compraId - ID de la compra
   * @returns {Promise<string>} Ruta del PDF generado
   */
  async generarPdfCompra(datosComprobante, cdr, compraId) {
    try {
      const htmlContent = this.generarHtmlComprobante(datosComprobante, cdr);
      
      const fileName = `compra-${compraId}-${Date.now()}.pdf`;
      const filePath = path.join(this.outputDir, fileName);
      
      // Generar PDF real usando puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      await browser.close();
      
      // Retornar la ruta relativa
      return `/files/${fileName}`;
    } catch (error) {
      throw new Error(`Error generando PDF: ${error.message}`);
    }
  }

  /**
   * Genera contenido HTML del comprobante
   * @param {Object} datosComprobante - Datos del comprobante
   * @param {string} cdr - CDR de SUNAT
   * @returns {string} Contenido HTML
   */
  generarHtmlComprobante(datosComprobante, cdr) {
    const fechaActual = new Date().toLocaleDateString('es-PE');
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprobante de Compra - ${datosComprobante.numero}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .invoice-details div {
            flex: 1;
            margin-right: 20px;
        }
        .invoice-details div:last-child {
            margin-right: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #007bff;
            color: white;
        }
        .totals {
            text-align: right;
            margin-top: 20px;
        }
        .totals table {
            width: 300px;
            margin-left: auto;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
        .status {
            background-color: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>COMPROBANTE DE COMPRA ELECTRÓNICO</h1>
        <h2>${this.obtenerTipoComprobanteTexto(datosComprobante.tipoComprobante)} N° ${datosComprobante.numero}</h2>
    </div>

    <div class="status">
        ✅ COMPROBANTE ACEPTADO POR SUNAT
    </div>

    <div class="company-info">
        <h3>Información del Proveedor</h3>
        <p><strong>RUC:</strong> ${datosComprobante.proveedor.ruc || 'N/A'}</p>
        <p><strong>Razón Social:</strong> ${datosComprobante.proveedor.razonSocial || 'N/A'}</p>
        <p><strong>Dirección:</strong> ${datosComprobante.proveedor.direccion || 'N/A'}</p>
    </div>

    <div class="invoice-details">
        <div>
            <h3>Datos del Comprobante</h3>
            <p><strong>Fecha de Emisión:</strong> ${datosComprobante.fecha || 'N/A'}</p>
            <p><strong>Moneda:</strong> ${datosComprobante.moneda || 'PEN'}</p>
            <p><strong>Tipo:</strong> ${this.obtenerTipoComprobanteTexto(datosComprobante.tipoComprobante)}</p>
        </div>
        <div>
            <h3>Cliente</h3>
            <p><strong>Documento:</strong> ${datosComprobante.cliente.documento || 'N/A'}</p>
            <p><strong>Nombre:</strong> ${datosComprobante.cliente.nombre || 'N/A'}</p>
            <p><strong>Dirección:</strong> ${datosComprobante.cliente.direccion || 'N/A'}</p>
        </div>
    </div>

    <h3>Detalle de Items</h3>
    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Valor Venta</th>
            </tr>
        </thead>
        <tbody>
            ${this.generarFilasItems(datosComprobante.items)}
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td><strong>Subtotal:</strong></td>
                <td>S/ ${(datosComprobante.totales.subtotal || 0).toFixed(2)}</td>
            </tr>
            <tr>
                <td><strong>IGV (18%):</strong></td>
                <td>S/ ${(datosComprobante.totales.igv || 0).toFixed(2)}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
                <td><strong>TOTAL:</strong></td>
                <td><strong>S/ ${(datosComprobante.totales.total || 0).toFixed(2)}</strong></td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p><strong>Información SUNAT:</strong></p>
        <p>Este comprobante ha sido procesado y aceptado por SUNAT.</p>
        <p><strong>Fecha de procesamiento:</strong> ${fechaActual}</p>
        <p><strong>Hash CDR:</strong> ${this.extraerHashCdr(cdr)}</p>
        
        <hr style="margin: 20px 0;">
        <p style="text-align: center;">Documento generado electrónicamente - Sistema de Ferretería</p>
    </div>
</body>
</html>`;
  }

  /**
   * Genera filas HTML para los items
   * @param {Array} items - Lista de items
   * @returns {string} HTML de las filas
   */
  generarFilasItems(items) {
    if (!items || items.length === 0) {
      return '<tr><td colspan="5" style="text-align: center;">No hay items registrados</td></tr>';
    }

    return items.map(item => `
      <tr>
        <td>${item.codigo || 'N/A'}</td>
        <td>${item.descripcion || 'N/A'}</td>
        <td style="text-align: center;">${item.cantidad || 0}</td>
        <td style="text-align: right;">S/ ${(item.precioUnitario || 0).toFixed(2)}</td>
        <td style="text-align: right;">S/ ${(item.valorVenta || 0).toFixed(2)}</td>
      </tr>
    `).join('');
  }

  /**
   * Obtiene el texto descriptivo del tipo de comprobante
   * @param {string} tipo - Código del tipo de comprobante
   * @returns {string} Descripción del tipo
   */
  obtenerTipoComprobanteTexto(tipo) {
    const tipos = {
      '01': 'FACTURA ELECTRÓNICA',
      '03': 'BOLETA DE VENTA ELECTRÓNICA',
      '07': 'NOTA DE CRÉDITO ELECTRÓNICA',
      '08': 'NOTA DE DÉBITO ELECTRÓNICA',
      '09': 'GUÍA DE REMISIÓN ELECTRÓNICA'
    };
    
    return tipos[tipo] || 'COMPROBANTE ELECTRÓNICO';
  }

  /**
   * Extrae hash del CDR para mostrar en el PDF
   * @param {string} cdr - CDR de SUNAT
   * @returns {string} Hash extraído
   */
  extraerHashCdr(cdr) {
    try {
      // Extraer información básica del CDR
      const crypto = require('crypto');
      return crypto.createHash('md5').update(cdr).digest('hex').substring(0, 16).toUpperCase();
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Elimina archivos PDF antiguos (limpieza)
   * @param {number} diasAntiguedad - Días de antigüedad para eliminar
   */
  async limpiarArchivosAntiguos(diasAntiguedad = 30) {
    try {
      const files = fs.readdirSync(this.outputDir);
      const ahora = Date.now();
      const tiempoLimite = diasAntiguedad * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.outputDir, file);
        const stats = fs.statSync(filePath);
        
        if (ahora - stats.mtime.getTime() > tiempoLimite) {
          fs.unlinkSync(filePath);
          console.log(`Archivo eliminado: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error limpiando archivos antiguos:', error);
    }
  }
}

module.exports = new PdfGeneratorService();