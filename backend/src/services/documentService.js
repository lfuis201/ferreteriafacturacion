const xmlbuilder2 = require("xmlbuilder2");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const Configuracion = require("../models/Configuracion");

// Cargar variables de entorno
dotenv.config();

// Crear la carpeta 'files' si no existe
const filesDir = path.join(__dirname, "../../files");
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir, { recursive: true });
}

class DocumentService {
  static async generateXML(venta, sucursal, cliente, detalles, taller = null) {
    // Verificar que todos los datos necesarios estén disponibles
    if (!venta || !sucursal || !cliente || !detalles) {
      throw new Error("Datos incompletos para generar el XML");
    }

    const xml = xmlbuilder2
      .create({ version: "1.0", encoding: "UTF-8" })
      .ele("Invoice", {
        xmlns: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
        "xmlns:cac":
          "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
        "xmlns:cbc":
          "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
      })
      .ele("cbc:UBLVersionID")
      .txt("2.1")
      .up()
      .ele("cbc:CustomizationID")
      .txt("2.0")
      .up()
      .ele("cbc:ID")
      .txt(venta.numeroComprobante)
      .up()
      .ele("cbc:IssueDate")
      .txt(new Date(venta.fechaVenta).toISOString().split("T")[0])
      .up()
      .ele("cbc:InvoiceTypeCode")
      .txt(venta.tipoComprobante === "FACTURA" ? "01" : "03")
      .up()
      .ele("cac:AccountingSupplierParty")
      .ele("cac:Party")
      .ele("cac:PartyIdentification")
      .ele("cbc:ID")
      .txt(sucursal.ruc)
      .up()
      .up()
      .ele("cac:PartyName")
      .ele("cbc:Name")
      .txt(sucursal.razonSocial)
      .up()
      .up()
      .ele("cac:PostalAddress")
      .ele("cbc:ID")
      .txt(sucursal.ubigeo)
      .up()
      .ele("cbc:StreetName")
      .txt(sucursal.direccion)
      .up()
      .ele("cbc:CityName")
      .txt(sucursal.distrito)
      .up()
      .ele("cbc:CountrySubentity")
      .txt(sucursal.departamento)
      .up()
      .ele("cac:Country")
      .ele("cbc:IdentificationCode")
      .txt("PE")
      .up()
      .up()
      .up()
      .up()
      .up()
      .ele("cac:AccountingCustomerParty")
      .ele("cac:Party")
      .ele("cac:PartyIdentification")
      .ele("cbc:ID")
      .txt(cliente.numeroDocumento)
      .up()
      .up()
      .ele("cac:PartyName")
      .ele("cbc:Name")
      .txt(cliente.nombre || 'Cliente sin nombre')
      .up()
      .up()
      .ele("cac:PostalAddress")
      .ele("cbc:StreetName")
      .txt(cliente.direccion || "")
      .up()
      .up()
      .up()
      .up()
      .ele("cac:LegalMonetaryTotal")
      .ele("cbc:LineExtensionAmount", { currencyID: venta.moneda })
      .txt(venta.subtotal)
      .up()
      .ele("cbc:TaxInclusiveAmount", { currencyID: venta.moneda })
      .txt(venta.total)
      .up()
      .ele("cbc:PayableAmount", { currencyID: venta.moneda })
      .txt(venta.total)
      .up()
      .up();

    // Añadir detalles de productos
    detalles.forEach((detalle) => {
      xml
        .ele("cac:InvoiceLine")
        .ele("cbc:ID")
        .txt(detalle.id.toString())
        .up()
        .ele("cbc:InvoicedQuantity", { unitCode: "NIU" })
        .txt(detalle.cantidad)
        .up()
        .ele("cbc:LineExtensionAmount", { currencyID: venta.moneda })
        .txt(detalle.subtotal)
        .up()
        .ele("cac:Item")
        .ele("cbc:Description")
        .txt(detalle.Producto.nombre)
        .up()
        .up()
        .ele("cac:Price")
        .ele("cbc:PriceAmount", { currencyID: venta.moneda })
        .txt(detalle.precioUnitario)
        .up()
        .up()
        .up();
    });

    // Añadir información del taller si existe
    if (taller) {
      xml
        .ele("cac:InvoiceLine")
        .ele("cbc:ID")
        .txt("TALLER")
        .up()
        .ele("cbc:InvoicedQuantity", { unitCode: "ZZ" })
        .txt("1")
        .up()
        .ele("cbc:LineExtensionAmount", { currencyID: venta.moneda })
        .txt(taller.precio || "0.00")
        .up()
        .ele("cac:Item")
        .ele("cbc:Description")
        .txt(
          `SERVICIO DE TALLER: ${
            taller.descripcion || "Servicio realizado"
          } - Motivo: ${taller.motivo || "No especificado"}`
        )
        .up()
        .up()
        .ele("cac:Price")
        .ele("cbc:PriceAmount", { currencyID: venta.moneda })
        .txt(taller.precio || "0.00")
        .up()
        .up()
        .up();
    }

    const xmlString = xml.end({ prettyPrint: true });
    const xmlBase64 = Buffer.from(xmlString).toString("base64");

    return { xmlString, xmlBase64 };
  }




  ///donde se crea todo el formato a4 de la factura o boleta
static async generatePDF(
  venta,
  sucursal,
  cliente,
  detalles,
  taller = null,
  formato = "A4"
) {
  // Verificar que todos los datos necesarios estén disponibles
  if (!venta || !sucursal || !cliente || !detalles) {
    throw new Error("Datos incompletos para generar el PDF");
  }

  // Si el formato es ticket, usar la función específica para tickets
  if (formato === "ticket" || formato === "80mm") {
    return this.generateTicketPDF(venta, sucursal, cliente, detalles, taller);
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: "A4" });
      const buffers = [];

      // Generar nombre del archivo PDF
      const fileName = `${venta.serieComprobante}-${venta.numeroComprobante}.pdf`;
      const filePath = path.join(filesDir, fileName);

      // Capturar el PDF en memoria
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        // Guardar el archivo PDF
        fs.writeFileSync(filePath, pdfBuffer);
        resolve(filePath);
      });
      doc.on("error", reject);

      // Configuración de colores
      const primaryColor = "#000000";
      const headerColor = "#8B0000"; // Rojo oscuro para el encabezado
      const borderColor = "#000000";

      let currentY = 30;

      // Encabezado con información de la empresa
      doc.fontSize(12).fillColor(primaryColor).font("Helvetica-Bold");
      doc.text(sucursal.razonSocial || "REPUESTOS FAMASUR", 30, currentY);
      currentY += 15;

      doc.fontSize(10).font("Helvetica");
      doc.text(`DE: QUISPE NINA AMILCAR`, 30, currentY);
      currentY += 12;
      doc.text(`RUC: ${sucursal.ruc || "10701154346"}`, 30, currentY);
      currentY += 12;
      doc.text(
        `Cal. Huancavelica Mz. C Lt. 3-B - La Kantuta - San`,
        30,
        currentY
      );
      currentY += 12;
      doc.text(`Sebastián - Cusco - Cusco`, 30, currentY);
      currentY += 12;
      doc.text(`Correo: repuestosfamasur@gmail.com`, 30, currentY);
      currentY += 20;

      // Recuadro del tipo de comprobante (lado derecho)
      const comprobanteX = 400;
      const comprobanteY = 30;
      const comprobanteWidth = 130;
      const comprobanteHeight = 60;

      // Dibujar recuadro del comprobante con borde rojo
      doc
        .rect(comprobanteX, comprobanteY, comprobanteWidth, comprobanteHeight)
        .stroke(headerColor);

      // Texto del comprobante
      doc.fontSize(11).fillColor(headerColor).font("Helvetica-Bold");
      const tipoTexto =
        venta.tipoComprobante === "FACTURA"
          ? "FACTURA ELECTRÓNICA"
          : venta.tipoComprobante === "NOTA_VENTA"
          ? "NOTA DE VENTA"
          : "BOLETA DE VENTA ELECTRÓNICA";
      doc.text(tipoTexto, comprobanteX + 5, comprobanteY + 15, {
        width: comprobanteWidth - 10,
        align: "center",
      });

      doc.fontSize(10).fillColor(primaryColor);
      doc.text(
        `${venta.serieComprobante}-${venta.numeroComprobante}`,
        comprobanteX + 5,
        comprobanteY + 40,
        {
          width: comprobanteWidth - 10,
          align: "center",
        }
      );

      // Información del cliente y venta
      currentY = Math.max(currentY, comprobanteY + comprobanteHeight + 20);
      doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(10);

      // Datos del cliente
      doc.text("Señor(es):", 30, currentY);
      currentY += 15;

      doc.font("Helvetica").fontSize(9);
      doc.text(`${cliente.nombre}`, 30, currentY);
      currentY += 12;

      const tipoDoc = cliente.tipoDocumento === "RUC" ? "RUC" : "DNI";
      doc.text(`${tipoDoc}: ${cliente.numeroDocumento}`, 30, currentY);
      currentY += 12;

      if (cliente.direccion) {
        doc.text(`Dirección: ${cliente.direccion}`, 30, currentY);
        currentY += 12;
      }

      // Ajustar la posición para las etiquetas verticales
      const verticalLabelsX = 350; // Posición X para las etiquetas verticales
      const verticalLabelsY = currentY - 36; // Alinear con la información del cliente

      // Dibujar etiquetas verticales
      doc.font("Helvetica-Bold").fontSize(9);
      doc.text("F. Emisión:", verticalLabelsX, verticalLabelsY);
      doc.text("Forma de Pago:", verticalLabelsX, verticalLabelsY + 20);
      doc.text("Método de Pago:", verticalLabelsX, verticalLabelsY + 40);
      doc.text("Moneda:", verticalLabelsX, verticalLabelsY + 60);

      // Valores correspondientes
      doc.font("Helvetica").fontSize(9);
      doc.text(new Date(venta.fechaVenta).toLocaleDateString("es-PE"), verticalLabelsX + 100, verticalLabelsY);
      doc.text(venta.formaPago || "CONTADO", verticalLabelsX + 100, verticalLabelsY + 20);
      doc.text(venta.metodoPago || "EFECTIVO", verticalLabelsX + 100, verticalLabelsY + 40);
      doc.text(venta.moneda || "PEN", verticalLabelsX + 100, verticalLabelsY + 60);

      // Tabla de productos
      currentY = Math.max(currentY, verticalLabelsY + 80) + 20; // Asegurarse de que hay suficiente espacio
      const tableStartY = currentY;
      const tableStartX = 30;
      const tableWidth = 535;

      // Definir anchos de columnas optimizados para mejor legibilidad
      const colWidths = [70, 220, 50, 50, 70, 80]; // Código, Descripción, Cant, U.M, P.U, Importe
      const rowHeight = 30;

      // Encabezado de la tabla con fondo rojo
      doc
        .rect(tableStartX, tableStartY, tableWidth, rowHeight)
        .fillAndStroke(headerColor, borderColor);

      doc.fillColor("white").font("Helvetica-Bold").fontSize(9);
      let colX = tableStartX;

      // Dibujar líneas verticales del encabezado
      for (let i = 0; i <= colWidths.length; i++) {
        const x = tableStartX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.moveTo(x, tableStartY).lineTo(x, tableStartY + rowHeight).stroke(borderColor);
      }

      doc.text("Código", colX + 2, tableStartY + 7, {
        width: colWidths[0] - 4,
        align: "center",
      });
      colX += colWidths[0];

      doc.text("Descripción", colX + 2, tableStartY + 7, {
        width: colWidths[1] - 4,
        align: "center",
      });
      colX += colWidths[1];

      doc.text("Cant.", colX + 2, tableStartY + 7, {
        width: colWidths[2] - 4,
        align: "center",
      });
      colX += colWidths[2];

      doc.text("U.M", colX + 2, tableStartY + 7, {
        width: colWidths[3] - 4,
        align: "center",
      });
      colX += colWidths[3];

      doc.text("P.U", colX + 2, tableStartY + 7, {
        width: colWidths[4] - 4,
        align: "center",
      });
      colX += colWidths[4];

      doc.text("Importe", colX + 2, tableStartY + 7, {
        width: colWidths[5] - 4,
        align: "center",
      });

      currentY = tableStartY + rowHeight;

      // Filas de productos
      doc.fillColor(primaryColor).font("Helvetica").fontSize(8);

      detalles.forEach((detalle, index) => {
        // Alternar color de fondo para mejor legibilidad
        if (index % 2 === 1) {
          doc
            .rect(tableStartX, currentY, tableWidth, rowHeight)
            .fillAndStroke("#f8f9fa", borderColor);
        } else {
          doc
            .rect(tableStartX, currentY, tableWidth, rowHeight)
            .stroke(borderColor);
        }

        // Dibujar líneas verticales para cada fila
        for (let i = 0; i <= colWidths.length; i++) {
          const x = tableStartX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
          doc.moveTo(x, currentY).lineTo(x, currentY + rowHeight).stroke(borderColor);
        }

        colX = tableStartX;

        // Código del producto
        doc.fillColor(primaryColor);
        doc.text(detalle.Producto.codigo || "", colX + 2, currentY + 7, {
          width: colWidths[0] - 4,
          align: "center",
        });
        colX += colWidths[0];

        // Descripción
        doc.text(detalle.Producto.nombre, colX + 2, currentY + 7, {
          width: colWidths[1] - 4,
          align: "left",
        });
        colX += colWidths[1];

        // Cantidad
        doc.text(detalle.cantidad.toString(), colX + 2, currentY + 7, {
          width: colWidths[2] - 4,
          align: "center",
        });
        colX += colWidths[2];

        // Unidad de medida
        doc.text(
          detalle.Producto.unidadMedida || "UND",
          colX + 2,
          currentY + 7,
          {
            width: colWidths[3] - 4,
            align: "center",
          }
        );
        colX += colWidths[3];

        // Precio unitario
        doc.text(
          parseFloat(detalle.precioUnitario).toFixed(2),
          colX + 2,
          currentY + 7,
          {
            width: colWidths[4] - 4,
            align: "right",
          }
        );
        colX += colWidths[4];

        // Importe
        doc.text(
          parseFloat(detalle.subtotal).toFixed(2),
          colX + 2,
          currentY + 7,
          {
            width: colWidths[5] - 4,
            align: "right",
          }
        );

        currentY += rowHeight;
      });

      // Añadir información del taller si existe
      if (taller) {
        const servicioDescripcion = `SERVICIO DE TALLER: ${
          taller.descripcion || "Servicio realizado"
        }`;

        // Alternar color de fondo
        const index = detalles.length;
        if (index % 2 === 1) {
          doc
            .rect(tableStartX, currentY, tableWidth, rowHeight)
            .fillAndStroke("#f8f9fa", "#dee2e6");
        } else {
          doc
            .rect(tableStartX, currentY, tableWidth, rowHeight)
            .stroke("#dee2e6");
        }

        colX = tableStartX;

        // Código del servicio
        doc.text("SERV001", colX + 2, currentY + 5, {
          width: colWidths[0] - 4,
          align: "center",
        });
        colX += colWidths[0];

        // Descripción del servicio
        doc.text(servicioDescripcion, colX + 2, currentY + 5, {
          width: colWidths[1] - 4,
          align: "left",
        });
        colX += colWidths[1];

        // Cantidad
        doc.text("1", colX + 2, currentY + 5, {
          width: colWidths[2] - 4,
          align: "center",
        });
        colX += colWidths[2];

        // Unidad de medida
        doc.text("SERV", colX + 2, currentY + 5, {
          width: colWidths[3] - 4,
          align: "center",
        });
        colX += colWidths[3];

        // Precio unitario
        doc.text(
          parseFloat(taller.precio || 0).toFixed(2),
          colX + 2,
          currentY + 5,
          {
            width: colWidths[4] - 4,
            align: "right",
          }
        );
        colX += colWidths[4];

        // Importe
        doc.text(
          parseFloat(taller.precio || 0).toFixed(2),
          colX + 2,
          currentY + 5,
          {
            width: colWidths[5] - 4,
            align: "right",
          }
        );

        currentY += rowHeight;
      }

      // Línea final de la tabla
      doc
        .moveTo(tableStartX, currentY)
        .lineTo(tableStartX + tableWidth, currentY)
        .stroke(primaryColor);

      currentY += 20;

      // Totales en formato mejorado - ajustado para que no salga del recuadro
      currentY += 15;
      const totalsStartX = 300;
      const totalsWidth = 265; // Aumentado para que no se salga
      const totalRowHeight = 20;

      // Tabla de totales con mejor diseño
      const totalRows = [
        { label: "Importe bruto", value: parseFloat(venta.subtotal).toFixed(2) },
        { label: "Total valor", value: parseFloat(venta.subtotal).toFixed(2) },
        { label: "I.G.V. 18%", value: parseFloat(venta.igv || 0).toFixed(2) },
        { label: "Total precio", value: parseFloat(venta.total).toFixed(2) }
      ];

      // Dibujar tabla de totales
      totalRows.forEach((row, index) => {
        const isLast = index === totalRows.length - 1;
        const bgColor = isLast ? headerColor : "#f8f9fa";
        const textColor = isLast ? "white" : primaryColor;
        
        // Fondo de la fila
        doc.rect(totalsStartX, currentY, totalsWidth, totalRowHeight)
           .fillAndStroke(bgColor, borderColor);
        
        // Texto de la etiqueta
        doc.fillColor(textColor)
           .font(isLast ? "Helvetica-Bold" : "Helvetica")
           .fontSize(9)
           .text(row.label, totalsStartX + 5, currentY + 6, {
             width: totalsWidth * 0.6 - 10,
             align: "left"
           });
        
        // Valor
        doc.text(`S/ ${row.value}`, totalsStartX + totalsWidth * 0.6, currentY + 6, {
          width: totalsWidth * 0.4 - 5,
          align: "right"
        });
        
        currentY += totalRowHeight;
      });

      // Sección "Neto a pagar" destacada
      currentY += 5;
      doc.rect(totalsStartX, currentY, totalsWidth, totalRowHeight + 5)
         .fillAndStroke(headerColor, borderColor);
      
      doc.fillColor("white")
         .font("Helvetica-Bold")
         .fontSize(11)
         .text("Neto a pagar", totalsStartX + 5, currentY + 8, {
           width: totalsWidth * 0.6 - 10,
           align: "left"
         })
         .text(`S/ ${parseFloat(venta.total).toFixed(2)}`, totalsStartX + totalsWidth * 0.6, currentY + 8, {
           width: totalsWidth * 0.4 - 5,
           align: "right"
         });
      
      currentY += totalRowHeight + 15;

      // Monto en letras
      currentY += 10;
      doc.fillColor(primaryColor)
         .font("Helvetica-Bold")
         .fontSize(9)
         .text(`SON: ${this.numeroALetras(parseFloat(venta.total))} CON ${Math.round((parseFloat(venta.total) % 1) * 100).toString().padStart(2, '0')}/100 SOLES`, 30, currentY, {
           width: 500,
           align: "left"
         });
      
      currentY += 25;

      // Información del servicio si existe taller
      if (taller) {
        doc.fillColor(primaryColor)
           .font("Helvetica-Bold")
           .fontSize(10)
           .text("INFORMACIÓN DEL SERVICIO:", 30, currentY);
        
        currentY += 15;
        
        doc.font("Helvetica")
           .fontSize(9)
           .text(`Motivo: ${taller.motivo || 'string'}`, 30, currentY);
        currentY += 12;
        
        doc.text(`Placa del vehículo: ${taller.placaVehiculo || '123456'}`, 30, currentY);
        currentY += 12;
        
        doc.text(`Operario: ${taller.operario || 'string string'}`, 30, currentY);
        currentY += 12;
        
        doc.text(`Puesto: ${taller.puesto || 'string'}`, 30, currentY);
        currentY += 20;
      }

      // Observaciones
      if (venta.observaciones) {
        doc.fillColor(primaryColor)
           .font("Helvetica-Bold")
           .fontSize(10)
           .text("OBSERVACIONES:", 30, currentY);
        
        currentY += 15;
        
        doc.font("Helvetica")
           .fontSize(9)
           .text(venta.observaciones, 30, currentY, {
             width: 500,
             align: "left"
           });
        
        currentY += 20;
      }

      // Pie de página
      currentY += 10;
      doc.fillColor(primaryColor)
         .font("Helvetica")
         .fontSize(8)
         .text("Representación impresa de la FACTURA ELECTRÓNICA", 30, currentY, {
           width: 500,
           align: "center"
         });
      
      currentY += 12;
      doc.text("Consulte su documento en: www.sunat.gob.pe", 30, currentY, {
        width: 500,
        align: "center"
      });
      
      currentY += 12;
      doc.text("Autorizado mediante Resolución de Intendencia N° 034-005-0005315", 30, currentY, {
        width: 500,
        align: "center"
      });

      // Finalizar el documento
      doc.end();
    } catch (error) {
      console.error("Error al generar PDF:", error);
      reject(error);
    }
  });
}



  static async generateCDR(venta) {
    // Verificar que la venta esté disponible
    if (!venta) {
      throw new Error("Datos incompletos para generar el CDR");
    }

    // Generar XML CDR válido según estándar SUNAT
    const cdrXml = xmlbuilder2
      .create({ version: "1.0", encoding: "UTF-8" })
      .ele("ApplicationResponse", {
        xmlns:
          "urn:oasis:names:specification:ubl:schema:xsd:ApplicationResponse-2",
        "xmlns:cac":
          "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
        "xmlns:cbc":
          "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
      })
      .ele("cbc:UBLVersionID")
      .txt("2.0")
      .up()
      .ele("cbc:CustomizationID")
      .txt("1.0")
      .up()
      .ele("cbc:ID")
      .txt(`R-${venta.numeroComprobante}`)
      .up()
      .ele("cbc:IssueDate")
      .txt(new Date().toISOString().split("T")[0])
      .up()
      .ele("cbc:IssueTime")
      .txt(new Date().toISOString().split("T")[1].split(".")[0])
      .up()
      .ele("cbc:ResponseDate")
      .txt(new Date().toISOString().split("T")[0])
      .up()
      .ele("cbc:ResponseTime")
      .txt(new Date().toISOString().split("T")[1].split(".")[0])
      .up()
      .ele("cac:DocumentResponse")
      .ele("cac:Response")
      .ele("cbc:ResponseCode")
      .txt("0000")
      .up()
      .ele("cbc:Description")
      .txt("El comprobante ha sido aceptado")
      .up()
      .up()
      .ele("cac:DocumentReference")
      .ele("cbc:ID")
      .txt(venta.numeroComprobante)
      .up()
      .up()
      .up();

    const cdrString = cdrXml.end({ prettyPrint: true });
    const cdrBase64 = Buffer.from(cdrString).toString("base64");

    return { cdrString, cdrBase64 };
  }

  //GENERADOR DE TIcKET
  static async generateTicketPDF(
    venta,
    sucursal,
    cliente,
    detalles,
    taller = null
  ) {
    if (!venta || !sucursal || !cliente || !detalles) {
      throw new Error("Datos incompletos para generar el ticket PDF");
    }

    return new Promise(async (resolve, reject) => {
      try {
        const QRCode = require("qrcode");
        const doc = new PDFDocument({
          margin: 15,
          size: [226, 700], // 80mm ancho, altura más grande para más espacio
        });
        const buffers = [];

        const fileName = `ticket-${venta.serieComprobante}-${venta.numeroComprobante}.pdf`;
        const filePath = path.join(filesDir, fileName);

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          fs.writeFileSync(filePath, pdfBuffer);
          resolve(filePath);
        });
        doc.on("error", reject);

        const primaryColor = "#000000";
        let currentY = 15;

        // Encabezado
        doc.fontSize(11).fillColor(primaryColor).font("Helvetica-Bold");
        doc.text(sucursal.razonSocial || "REPUESTOS FAMASUR", 10, currentY, {
          width: 206,
          align: "center",
        });
        currentY += 18;

        doc.fontSize(9).font("Helvetica");
        doc.text(`RUC ${sucursal.ruc || "10701154946"}`, 10, currentY, {
          width: 206,
          align: "center",
        });
        currentY += 14;

        doc.text(
          `${sucursal.direccion || "Cal. Huayrancanlle Mz E. Lt 1-B"}`,
          10,
          currentY,
          { width: 206, align: "center" }
        );
        currentY += 12;

        doc.text(
          `${sucursal.distrito || "Cusco"} , ${
            sucursal.provincia || "Cusco"
          } , ${sucursal.departamento || "Cusco"}`,
          10,
          currentY,
          { width: 206, align: "center" }
        );
        currentY += 12;

        doc.text(
          `Correo: ${sucursal.email || "repuestosfamasur@gmail.com"}`,
          10,
          currentY,
          { width: 206, align: "center" }
        );
        currentY += 18;

        doc.moveTo(10, currentY).lineTo(216, currentY).stroke();
        currentY += 14;

        // Comprobante
        doc.fontSize(10).font("Helvetica-Bold");
        const tipoTexto =
          venta.tipoComprobante === "FACTURA"
            ? "Factura Electrónica"
            : venta.tipoComprobante === "NOTA_VENTA"
            ? "Nota de Venta"
            : "Boleta de Venta";
        doc.text(tipoTexto, 10, currentY, { width: 206, align: "center" });
        currentY += 14;

        doc.text(
          `${venta.serieComprobante}-${venta.numeroComprobante}`,
          10,
          currentY,
          { width: 206, align: "center" }
        );
        currentY += 20;

        // Datos de venta
        doc.fontSize(8).font("Helvetica");
        doc.text(
          `F. Emisión: ${new Date(venta.fechaVenta).toLocaleDateString(
            "es-PE"
          )}`,
          10,
          currentY
        );
        currentY += 12;

        doc.text(
          `H. Emisión: ${new Date(venta.fechaVenta).toLocaleTimeString(
            "es-PE",
            { hour12: false }
          )}`,
          10,
          currentY
        );
        currentY += 12;

        if (venta.fechaVencimiento) {
          doc.text(
            `F. Vencimiento: ${new Date(
              venta.fechaVencimiento
            ).toLocaleDateString("es-PE")}`,
            10,
            currentY
          );
          currentY += 12;
        }

        doc.text(`Cliente: ${cliente.nombre || 'Cliente sin nombre'}`, 10, currentY, { width: 206 });
        currentY += 25;

        const tipoDoc = cliente.tipoDocumento === "RUC" ? "RUC" : "DNI";
        doc.text(`${tipoDoc}: ${cliente.numeroDocumento}`, 10, currentY);
        currentY += 15;

        doc.text(`Dirección: ${cliente.direccion || "----"}`, 10, currentY, {
          width: 206,
        });
        currentY += 18;

        // Encabezado productos
        doc.fontSize(8).font("Helvetica-Bold");
        doc.moveTo(10, currentY).lineTo(216, currentY).stroke();
        currentY += 4;

        const headerY = currentY;
        doc.text("Cant", 12, currentY, { width: 20, align: "center" });
        doc.text("Unid", 32, currentY, { width: 20, align: "center" });
        doc.text("Descripción", 54, currentY, { width: 90, align: "center" });
        doc.text("P.U.", 148, currentY, { width: 30, align: "center" });
        doc.text("Total", 180, currentY, { width: 30, align: "center" });
        currentY += 14;

        doc.moveTo(10, currentY).lineTo(216, currentY).stroke();
        currentY += 6;

        // Productos sin líneas verticales, solo horizontales
        doc.fontSize(7).font("Helvetica");
        
        // Agrupar productos iguales para evitar repetición
        const productosAgrupados = {};
        detalles.forEach(detalle => {
          const key = `${detalle.Producto.codigo || detalle.Producto.id}-${detalle.precioUnitario}`;
          if (productosAgrupados[key]) {
            productosAgrupados[key].cantidad += parseFloat(detalle.cantidad);
            productosAgrupados[key].total += parseFloat(detalle.cantidad) * parseFloat(detalle.precioUnitario);
          } else {
            productosAgrupados[key] = {
              cantidad: parseFloat(detalle.cantidad),
              producto: detalle.Producto,
              precioUnitario: parseFloat(detalle.precioUnitario),
              unidadMedida: detalle.unidadMedida || "UND",
              total: parseFloat(detalle.cantidad) * parseFloat(detalle.precioUnitario)
            };
          }
        });
        
        const productosUnicos = Object.values(productosAgrupados);
        
        productosUnicos.forEach((item, index) => {
          const startY = currentY;
          let maxHeight = 12;

          // Cantidad
          doc.text(item.cantidad.toFixed(2), 12, currentY, {
            width: 28,
            align: "center",
          });

          // Unidad
          doc.text(item.unidadMedida, 32, currentY, {
            width: 28,
            align: "center",
          });

          // Descripción con más espacio
          const descripcion = item.producto ? item.producto.nombre : (item.descripcion || 'Producto sin nombre');
          const descripcionHeight = doc.heightOfString(descripcion, {
            width: 90,
            fontSize: 7,
          });
          doc.text(descripcion, 54, currentY, { width: 90, align: "left" });
          maxHeight = Math.max(maxHeight, descripcionHeight + 4);

          // Precio Unitario
          doc.text(
            `${item.precioUnitario.toFixed(2)}`,
            148,
            currentY,
            { width: 28, align: "right" }
          );

          // Total
          doc.text(`${item.total.toFixed(2)}`, 178, currentY, {
            width: 32,
            align: "right",
          });

          // Avanzamos a la siguiente fila
          currentY += maxHeight + 4;

          // Solo línea horizontal separadora entre productos
          if (index < productosUnicos.length - 1) {
            doc.moveTo(10, currentY).lineTo(216, currentY).stroke();
            currentY += 4;
          }
        });

        currentY += 10;

        // Totales
        doc.fontSize(8).font("Helvetica");

        // Op. Gravadas
        doc.text(`Op. Gravadas: S/`, 120, currentY, {
          width: 80,
          align: "left",
        });
        doc.text(
          `${parseFloat(venta.subtotal || 0).toFixed(2)}`,
          180,
          currentY,
          { width: 40, align: "right" }
        );
        currentY += 12;

        // IGV
        doc.text(`IGV: S/`, 120, currentY, { width: 80, align: "left" });
        doc.text(`${parseFloat(venta.igv || 0).toFixed(2)}`, 180, currentY, {
          width: 40,
          align: "right",
        });
        currentY += 14;

        // Total a pagar (más grande y en negrita)
        doc.fontSize(9).font("Helvetica-Bold");
        doc.text(`Total a pagar: S/`, 120, currentY, {
          width: 80,
          align: "left",
        });
        doc.text(`${parseFloat(venta.total).toFixed(2)}`, 180, currentY, {
          width: 40,
          align: "right",
        });
        currentY += 20;

        // Total en letras
        doc.fontSize(7).font("Helvetica");
        doc.text(
          `Son: ${this.numeroALetras(parseFloat(venta.total))} con ${Math.round(
            (parseFloat(venta.total) % 1) * 100
          )
            .toString()
            .padStart(2, "0")}/100 Soles`,
          10,
          currentY,
          { width: 206 }
        );
        currentY += 20;

        // QR
        const tipoQr = venta.tipoComprobante === "FACTURA" ? "01" : (venta.tipoComprobante === "NOTA_VENTA" ? "NV" : "03");
        const qrData = `6|${
          tipoQr
        }|${venta.serieComprobante}|${venta.numeroComprobante}|${parseFloat(
          venta.igv || 0
        ).toFixed(2)}|${parseFloat(venta.total).toFixed(2)}|${
          new Date(venta.fechaVenta).toISOString().split("T")[0]
        }|${cliente.tipoDocumento === "RUC" ? "6" : "1"}|${
          cliente.numeroDocumento
        }|`;

        try {
          const qrCodeBuffer = await QRCode.toBuffer(qrData, {
            width: 90,
            margin: 1,
            color: { dark: "#000000", light: "#FFFFFF" },
          });
          doc.image(qrCodeBuffer, 68, currentY, { width: 90, height: 90 });
          currentY += 120;
        } catch (qrError) {
          console.error("Error generando QR:", qrError);
          currentY += 20;
        }

        // Hash y condiciones
        doc.fontSize(7).font("Helvetica-Bold");
        doc.text("Código hash:", 10, currentY);
        currentY += 12;

        doc.fontSize(6).font("Helvetica");
        const codigoHash = require("crypto")
          .createHash("sha256")
          .update(`${venta.serieComprobante}-${venta.numeroComprobante}`)
          .digest("hex")
          .substring(0, 32);
        doc.text(codigoHash, 10, currentY, { width: 206 });
        currentY += 16;

        doc.fontSize(7).font("Helvetica-Bold");
        doc.text("Condición de Pago:", 10, currentY);
        doc.text(`${venta.formaPago || "CONTADO"}`, 100, currentY);
        currentY += 12;

        doc.text("Pagos:", 10, currentY);
        currentY += 12;

        doc.fontSize(7).font("Helvetica");
        doc.text(
          `• Efectivo: S/ ${parseFloat(venta.total).toFixed(2)}`,
          20,
          currentY
        );
        currentY += 12;

        doc.text("Vendedor: Administrador", 10, currentY);
        currentY += 20;

        // Pie
        doc.fontSize(7).font("Helvetica");
        doc.text("Gracias por su compra", 10, currentY, {
          width: 206,
          align: "center",
        });
        currentY += 12;
        doc.text(
          "Representación impresa de comprobante electrónica",
          10,
          currentY,
          { width: 206, align: "center" }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  //FIN DE TIcKET

  // Función auxiliar para convertir números a letras
  static numeroALetras(numero) {
    const unidades = [
      "",
      "UNO",
      "DOS",
      "TRES",
      "CUATRO",
      "CINCO",
      "SEIS",
      "SIETE",
      "OCHO",
      "NUEVE",
    ];
    const decenas = [
      "",
      "",
      "VEINTE",
      "TREINTA",
      "CUARENTA",
      "CINCUENTA",
      "SESENTA",
      "SETENTA",
      "OCHENTA",
      "NOVENTA",
    ];
    const centenas = [
      "",
      "CIENTO",
      "DOSCIENTOS",
      "TRESCIENTOS",
      "CUATROCIENTOS",
      "QUINIENTOS",
      "SEISCIENTOS",
      "SETECIENTOS",
      "OCHOCIENTOS",
      "NOVECIENTOS",
    ];

    if (numero === 0) return "CERO";
    if (numero === 100) return "CIEN";

    let resultado = "";
    const entero = Math.floor(numero);

    if (entero >= 1000) {
      const miles = Math.floor(entero / 1000);
      if (miles === 1) {
        resultado += "MIL ";
      } else {
        resultado += this.numeroALetras(miles) + " MIL ";
      }
    }

    const resto = entero % 1000;
    if (resto >= 100) {
      const cent = Math.floor(resto / 100);
      resultado += centenas[cent] + " ";
    }

    const restoDecenas = resto % 100;
    if (restoDecenas >= 20) {
      const dec = Math.floor(restoDecenas / 10);
      const uni = restoDecenas % 10;
      resultado += decenas[dec];
      if (uni > 0) resultado += " Y " + unidades[uni];
    } else if (restoDecenas >= 10) {
      const especiales = [
        "DIEZ",
        "ONCE",
        "DOCE",
        "TRECE",
        "CATORCE",
        "QUINCE",
        "DIECISÉIS",
        "DIECISIETE",
        "DIECIOCHO",
        "DIECINUEVE",
      ];
      resultado += especiales[restoDecenas - 10];
    } else if (restoDecenas > 0) {
      resultado += unidades[restoDecenas];
    }

    return resultado.trim();
  }

  static async generateDocuments(
    venta,
    sucursal,
    cliente,
    detalles,
    taller = null
  ) {
    try {
      // Verificar que todos los datos necesarios estén disponibles
      if (!venta || !sucursal || !cliente || !detalles) {
        throw new Error("Datos incompletos para generar documentos");
      }

      // Generar XML
      const { xmlString, xmlBase64 } = await this.generateXML(
        venta,
        sucursal,
        cliente,
        detalles,
        taller
      );
      const xmlPath = path.join(
        __dirname,
        `../../files/${venta.serieComprobante}-${venta.numeroComprobante}.xml`
      );
      fs.writeFileSync(xmlPath, xmlString);

      // Generar PDF
      const pdfPath = await this.generatePDF(
        venta,
        sucursal,
        cliente,
        detalles,
        taller
      );

      // Generar CDR XML
      const { cdrString, cdrBase64 } = await this.generateCDR(venta);
      const cdrPath = path.join(
        __dirname,
        `../../files/${venta.serieComprobante}-${venta.numeroComprobante}_cdr.xml`
      );
      fs.writeFileSync(cdrPath, cdrString);

      // Generar código hash (simplificado)
      const codigoHash = require("crypto")
        .createHash("sha256")
        .update(xmlString)
        .digest("hex");

      // Obtener la URL base desde las variables de entorno
      const baseUrl = process.env.BASE_URL || "http://localhost:4000";

      return {
        xmlUrl: `${baseUrl}/files/${venta.serieComprobante}-${venta.numeroComprobante}.xml`,
        cdrUrl: `${baseUrl}/files/${venta.serieComprobante}-${venta.numeroComprobante}_cdr.xml`,
        pdfUrl: `${baseUrl}/files/${venta.serieComprobante}-${venta.numeroComprobante}.pdf`,
        codigoHash,
        xmlBase64,
        cdrBase64,
      };
    } catch (error) {
      console.error("Error al generar documentos:", error);
      throw error;
    }
  }
}

module.exports = DocumentService;
