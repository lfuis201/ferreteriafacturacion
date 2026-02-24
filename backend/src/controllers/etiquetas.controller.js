const { Producto, Categoria, Sucursal, Almacen, InventarioAlmacen } = require('../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');

/**
 * @swagger
 * tags:
 *   name: Etiquetas
 *   description: Generación de etiquetas con códigos de barras
 */

/**
 * @swagger
 * /api/etiquetas/exportar:
 *   post:
 *     summary: Exportar etiquetas con códigos de barras
 *     tags: [Etiquetas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID del producto
 *                     cantidad:
 *                       type: integer
 *                       description: Cantidad de etiquetas a generar
 *                       default: 1
 *               filtros:
 *                 type: object
 *                 properties:
 *                   categoriaId:
 *                     type: integer
 *                     description: Filtrar por categoría
 *                   sucursalId:
 *                     type: integer
 *                     description: Filtrar por sucursal
 *                   almacenId:
 *                     type: integer
 *                     description: Filtrar por almacén
 *                   conStock:
 *                     type: boolean
 *                     description: Solo productos con stock
 *               configuracion:
 *                 type: object
 *                 properties:
 *                   tamanoEtiqueta:
 *                     type: string
 *                     enum: ['pequena', 'mediana', 'grande']
 *                     default: 'mediana'
 *                   incluirPrecio:
 *                     type: boolean
 *                     default: true
 *                   incluirCodigo:
 *                     type: boolean
 *                     default: true
 *                   incluirNombre:
 *                     type: boolean
 *                     default: true
 *     responses:
 *       200:
 *         description: PDF con etiquetas generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
const exportarEtiquetas = async (req, res) => {
  try {
    const { productos = [], filtros = {}, configuracion = {} } = req.body;
    
    // Configuración por defecto
    const config = {
      tamanoEtiqueta: configuracion.tamanoEtiqueta || 'mediana',
      incluirPrecio: configuracion.incluirPrecio !== false,
      incluirCodigo: configuracion.incluirCodigo !== false,
      incluirNombre: configuracion.incluirNombre !== false,
      incluirSucursal: configuracion.incluirSucursal !== false
    };

    let productosParaEtiquetas = [];

    // Si se proporcionan productos específicos
    if (productos.length > 0) {
      for (const item of productos) {
        const producto = await Producto.findByPk(item.id, {
          include: [
            { model: Categoria, attributes: ['nombre'] },
            { 
              model: InventarioAlmacen,
              include: [{
                model: Almacen,
                include: [{
                  model: Sucursal,
                  attributes: ['nombre']
                }]
              }]
            }
          ]
        });
        
        if (producto) {
          // Agregar múltiples copias según la cantidad solicitada
          for (let i = 0; i < (item.cantidad || 1); i++) {
            productosParaEtiquetas.push(producto);
          }
        }
      }
    } else {
      // Filtrar productos según los criterios
      const whereClause = { estado: true };
      const includeClause = [
        { model: Categoria, attributes: ['nombre'] }
      ];

      if (filtros.categoriaId) {
        whereClause.categoriaId = filtros.categoriaId;
      }

      // Siempre incluir inventario para obtener información de sucursal
      const inventarioInclude = {
        model: InventarioAlmacen,
        required: filtros.conStock || false,
        where: filtros.conStock ? { stock: { [Op.gt]: 0 } } : {},
        include: [
          {
            model: Almacen,
            include: [
              { model: Sucursal, attributes: ['nombre'] }
            ]
          }
        ]
      };

      // Aplicar filtros específicos de almacén o sucursal si se proporcionan
      if (filtros.almacenId || filtros.sucursalId) {
        inventarioInclude.include[0].where = {
          ...(filtros.almacenId && { id: filtros.almacenId }),
          ...(filtros.sucursalId && { sucursalId: filtros.sucursalId })
        };
      }

      includeClause.push(inventarioInclude);

      productosParaEtiquetas = await Producto.findAll({
        where: whereClause,
        include: includeClause,
        order: [['nombre', 'ASC']]
      });
    }

    if (productosParaEtiquetas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se encontraron productos para generar etiquetas'
      });
    }

    // Generar PDF con etiquetas
    const pdfBuffer = await generarPDFEtiquetas(productosParaEtiquetas, config);

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="etiquetas_${new Date().toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error al exportar etiquetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Genera un PDF con etiquetas de productos
 */
async function generarPDFEtiquetas(productos, config) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 20 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Configuración de tamaños según el tipo de etiqueta
      const tamanos = {
        pequena: { width: 150, height: 80, fontSize: 8, barcodeHeight: 25 },
        mediana: { width: 200, height: 100, fontSize: 10, barcodeHeight: 30 },
        grande: { width: 250, height: 120, fontSize: 12, barcodeHeight: 35 }
      };

      const tamano = tamanos[config.tamanoEtiqueta];
      const etiquetasPorFila = Math.floor((doc.page.width - 40) / tamano.width);
      const etiquetasPorColumna = Math.floor((doc.page.height - 40) / tamano.height);
      const etiquetasPorPagina = etiquetasPorFila * etiquetasPorColumna;

      // Título del documento
      doc.fontSize(16).text('Etiquetas de Productos', { align: 'center' });
      doc.moveDown();

      let etiquetaActual = 0;
      let paginaActual = 1;

      for (let i = 0; i < productos.length; i++) {
        const producto = productos[i];
        
        // Calcular posición de la etiqueta
        const fila = Math.floor(etiquetaActual / etiquetasPorFila);
        const columna = etiquetaActual % etiquetasPorFila;
        
        const x = 20 + (columna * tamano.width);
        const y = 60 + (fila * tamano.height);

        // Dibujar borde de la etiqueta
        doc.rect(x, y, tamano.width - 5, tamano.height - 5).stroke();

        let yOffset = y + 5;

        // Nombre del producto
        if (config.incluirNombre) {
          doc.fontSize(tamano.fontSize)
             .text(producto.nombre.substring(0, 30), x + 5, yOffset, {
               width: tamano.width - 10,
               height: tamano.fontSize + 2
             });
          yOffset += tamano.fontSize + 5;
        }

        // Código del producto
        if (config.incluirCodigo) {
          doc.fontSize(tamano.fontSize - 1)
             .text(`Código: ${producto.codigo}`, x + 5, yOffset);
          yOffset += tamano.fontSize + 2;
        }

        // Precio
        if (config.incluirPrecio) {
          doc.fontSize(tamano.fontSize)
             .text(`S/ ${parseFloat(producto.precioVenta).toFixed(2)}`, x + 5, yOffset);
          yOffset += tamano.fontSize + 5;
        }

        // Sucursal
        if (config.incluirSucursal && producto.InventarioAlmacens && producto.InventarioAlmacens.length > 0) {
          const sucursal = producto.InventarioAlmacens[0].Almacen?.Sucursal?.nombre;
          if (sucursal) {
            doc.fontSize(tamano.fontSize - 1)
               .text(`Sucursal: ${sucursal}`, x + 5, yOffset);
            yOffset += tamano.fontSize + 2;
          }
        }

        // Código de barras
        const codigoParaBarras = producto.codigoBarras || producto.codigo;
        if (codigoParaBarras) {
          try {
            const canvas = createCanvas(tamano.width - 20, tamano.barcodeHeight);
            JsBarcode(canvas, codigoParaBarras, {
              format: 'CODE128',
              width: 1,
              height: tamano.barcodeHeight - 10,
              displayValue: false
            });
            
            const barcodeBuffer = canvas.toBuffer('image/png');
            doc.image(barcodeBuffer, x + 10, yOffset, {
              width: tamano.width - 20,
              height: tamano.barcodeHeight - 5
            });
          } catch (barcodeError) {
            console.warn(`Error generando código de barras para ${producto.codigo}:`, barcodeError.message);
            // Si falla el código de barras, mostrar el código como texto
            doc.fontSize(tamano.fontSize - 2)
               .text(codigoParaBarras, x + 5, yOffset);
          }
        }

        etiquetaActual++;

        // Nueva página si es necesario
        if (etiquetaActual >= etiquetasPorPagina && i < productos.length - 1) {
          doc.addPage();
          etiquetaActual = 0;
          paginaActual++;
          
          // Título en nueva página
          doc.fontSize(16).text('Etiquetas de Productos', { align: 'center' });
          doc.moveDown();
        }
      }

      // Información del pie de página
      doc.fontSize(8)
         .text(`Generado el ${new Date().toLocaleDateString('es-PE')} - Página ${paginaActual}`, 
               20, doc.page.height - 30, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * @swagger
 * /api/etiquetas/productos:
 *   get:
 *     summary: Obtener productos disponibles para etiquetas
 *     tags: [Etiquetas]
 *     parameters:
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: Filtrar por sucursal
 *       - in: query
 *         name: almacenId
 *         schema:
 *           type: integer
 *         description: Filtrar por almacén
 *       - in: query
 *         name: conStock
 *         schema:
 *           type: boolean
 *         description: Solo productos con stock
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Buscar por nombre o código
 *     responses:
 *       200:
 *         description: Lista de productos disponibles
 */
const obtenerProductosParaEtiquetas = async (req, res) => {
  try {
    const { categoriaId, sucursalId, almacenId, conStock, buscar } = req.query;
    
    const whereClause = { estado: true };
    const includeClause = [
      { model: Categoria, attributes: ['id', 'nombre'] }
    ];

    // Filtro de búsqueda
    if (buscar) {
      whereClause[Op.or] = [
        { nombre: { [Op.like]: `%${buscar}%` } },
              { codigo: { [Op.like]: `%${buscar}%` } }
      ];
    }

    if (categoriaId) {
      whereClause.categoriaId = categoriaId;
    }

    // Siempre incluir inventario para obtener información de sucursal
    const inventarioInclude = {
      model: InventarioAlmacen,
      required: conStock === 'true',
      where: conStock === 'true' ? { stock: { [Op.gt]: 0 } } : {},
      include: [
        {
          model: Almacen,
          include: [
            { model: Sucursal, attributes: ['id', 'nombre'] }
          ]
        }
      ]
    };

    // Aplicar filtros específicos de almacén o sucursal si se proporcionan
    if (almacenId || sucursalId) {
      inventarioInclude.include[0].where = {
        ...(almacenId && { id: almacenId }),
        ...(sucursalId && { sucursalId: sucursalId })
      };
    }

    includeClause.push(inventarioInclude);

    const productos = await Producto.findAll({
      where: whereClause,
      include: includeClause,
      order: [['nombre', 'ASC']],
      limit: 100 // Limitar resultados para mejor rendimiento
    });

    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error al obtener productos para etiquetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  exportarEtiquetas,
  obtenerProductosParaEtiquetas
};