const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Crear la carpeta 'files' si no existe
const filesDir = path.join(__dirname, "../../files");
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir, { recursive: true });
}

class TrasladoPdfService {
  static async generateTrasladoPDF(traslado, sucursalOrigen, sucursalDestino, producto, usuario) {
    return new Promise((resolve, reject) => {
      try {
        // Crear documento PDF
        const doc = new PDFDocument({ margin: 30 });
        const buffers = [];

        // Generar nombre del archivo PDF
        const fileName = `traslado-${traslado.id}-${Date.now()}.pdf`;
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
        const headerColor = "#2563eb"; // Azul para traslados
        const borderColor = "#000000";

        let currentY = 30;

        // Encabezado principal
        doc.fontSize(16).fillColor(headerColor).font("Helvetica-Bold");
        doc.text("NOTA DE TRASLADO", 30, currentY, { align: "center" });
        currentY += 30;

        // Información de la empresa
        doc.fontSize(12).fillColor(primaryColor).font("Helvetica-Bold");
        doc.text("REPUESTOS FAMASUR", 30, currentY);
        currentY += 15;

        doc.fontSize(10).font("Helvetica");
        doc.text("DE: QUISPE NINA AMILCAR", 30, currentY);
        currentY += 12;
        doc.text("RUC: 10701154346", 30, currentY);
        currentY += 12;
        doc.text("Cal. Huancavelica Mz. C Lt. 3-B - La Kantuta - San", 30, currentY);
        currentY += 12;
        doc.text("Sebastián - Cusco - Cusco", 30, currentY);
        currentY += 20;

        // Recuadro del número de traslado (lado derecho)
        const trasladoX = 400;
        const trasladoY = 60;
        const trasladoWidth = 130;
        const trasladoHeight = 50;

        // Dibujar recuadro del traslado
        doc.rect(trasladoX, trasladoY, trasladoWidth, trasladoHeight).stroke(headerColor);

        // Texto del traslado
        doc.fontSize(11).fillColor(headerColor).font("Helvetica-Bold");
        doc.text("NTAT - 1", trasladoX + 5, trasladoY + 15, {
          width: trasladoWidth - 10,
          align: "center",
        });

        doc.fontSize(9).fillColor(primaryColor);
        doc.text(`N° ${String(traslado.id).padStart(6, '0')}`, trasladoX + 5, trasladoY + 35, {
          width: trasladoWidth - 10,
          align: "center",
        });

        // Información del traslado
        currentY = Math.max(currentY, trasladoY + trasladoHeight + 20);

        // Datos del traslado en dos columnas
        const leftColumnX = 30;
        const rightColumnX = 300;

        // Columna izquierda
        doc.fontSize(10).fillColor(primaryColor).font("Helvetica-Bold");
        doc.text("ALMACÉN INICIAL:", leftColumnX, currentY);
        doc.font("Helvetica");
        doc.text(sucursalOrigen.nombre, leftColumnX, currentY + 12);

        doc.font("Helvetica-Bold");
        doc.text("ALMACÉN DESTINO:", leftColumnX, currentY + 30);
        doc.font("Helvetica");
        doc.text(sucursalDestino.nombre, leftColumnX, currentY + 42);

        doc.font("Helvetica-Bold");
        doc.text("MOTIVO:", leftColumnX, currentY + 60);
        doc.font("Helvetica");
        doc.text(traslado.observacion || "Traslado entre sucursales", leftColumnX, currentY + 72);

        // Columna derecha
        doc.font("Helvetica-Bold");
        doc.text("FECHA DOCUMENTO:", rightColumnX, currentY);
        doc.font("Helvetica");
        const fechaTraslado = new Date(traslado.createdAt).toLocaleDateString('es-PE');
        doc.text(fechaTraslado, rightColumnX, currentY + 12);

        doc.font("Helvetica-Bold");
        doc.text("RESPONSABLE:", rightColumnX, currentY + 30);
        doc.font("Helvetica");
        doc.text(usuario.nombre || "Usuario", rightColumnX, currentY + 42);

        currentY += 100;

        // Tabla de productos (3 columnas en lugar de 4)
        const tableStartY = currentY;
        const tableHeaders = ["ITEM", "DESCRIPCIÓN PRODUCTO", "UNIDAD", "CANTIDAD"];
        const columnWidths = [40, 300, 60, 80]; // Eliminada la última columna
        const columnPositions = [30, 70, 370, 430]; // Ajustadas las posiciones

        // Encabezado de la tabla
        doc.fontSize(9).fillColor("#ffffff").font("Helvetica-Bold"); // Texto en blanco
        
        // Fondo azul para el encabezado
        doc.rect(30, currentY, 480, 20).fill(headerColor); // Ancho ajustado a 480 (30 + 480 = 510)
        
        // Texto del encabezado en BLANCO
        tableHeaders.forEach((header, index) => {
          if (index < 4) { // Solo las primeras 4 columnas
            doc.fillColor("#ffffff"); // Texto en blanco
            doc.text(header, columnPositions[index] + 5, currentY + 6, {
              width: columnWidths[index] - 10,
              align: "center"
            });
          }
        });

        currentY += 20;

        // Fila del producto
        doc.fillColor(primaryColor).font("Helvetica");
        
        // Alternar color de fondo para las filas
        doc.rect(30, currentY, 480, 25).fill("#f8f9fa");
        
        // Bordes de la fila
        doc.rect(30, currentY, 480, 25).stroke(borderColor);
        
        // Contenido de la fila
        doc.fillColor(primaryColor);
        doc.text("1", columnPositions[0] + 5, currentY + 8, {
          width: columnWidths[0] - 10,
          align: "center"
        });
        
        doc.text(producto.nombre, columnPositions[1] + 5, currentY + 8, {
          width: columnWidths[1] - 10,
          align: "left"
        });
        
        doc.text("UND", columnPositions[2] + 5, currentY + 8, {
          width: columnWidths[2] - 10,
          align: "center"
        });
        
        doc.text(traslado.cantidad.toString(), columnPositions[3] + 5, currentY + 8, {
          width: columnWidths[3] - 10,
          align: "center"
        });

        currentY += 25;

        // Bordes de la tabla
        columnPositions.forEach((pos, index) => {
          if (index < 4) { // Solo las primeras 4 columnas
            doc.moveTo(pos + columnWidths[index], tableStartY)
               .lineTo(pos + columnWidths[index], currentY)
               .stroke(borderColor);
          }
        });

        // Borde exterior de la tabla
        doc.rect(30, tableStartY, 480, currentY - tableStartY).stroke(borderColor);

        currentY += 30;

        // Información adicional
        doc.fontSize(9).font("Helvetica");
        doc.text("OBSERVACIONES:", 30, currentY);
        currentY += 15;
        doc.text(traslado.observacion || "Ninguna", 30, currentY);

        currentY += 40;

        // Firmas
        const firmaY = currentY;
        doc.fontSize(10).font("Helvetica-Bold");
        
        // Firma del responsable
        doc.text("_________________________", 50, firmaY);
        doc.text("RESPONSABLE DEL TRASLADO", 50, firmaY + 20);
        doc.font("Helvetica");
        doc.text(usuario.nombre || "Usuario", 50, firmaY + 35);

        // Firma del receptor 

        {/* doc.font("Helvetica-Bold");
        doc.text("_________________________", 350, firmaY);
        doc.text("RECIBIDO POR", 350, firmaY + 20);
        doc.font("Helvetica");
        doc.text("Nombre y Firma", 350, firmaY + 35);*/}
       

        // Finalizar el documento
        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = TrasladoPdfService;