const { Venta, DetalleVenta, Producto, Cliente, Sucursal, Usuario, Inventario, MovimientoInventario, Presentacion, CuentasPorCobrar, Taller  } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const path = require('path');
const fs = require('fs');

// Servicios de sunat
//const SUNATService = require('../services/SUNATService');
//const { SUNAT_APIS } = require('../config/sunatConfig'); 

const DocumentService = require('../services/documentService');

// Obtener siguiente número de comprobante
exports.obtenerSiguienteNumero = async (req, res) => {
  try {
    const { serieComprobante, sucursalId } = req.query;
    
    if (!serieComprobante || !sucursalId) {
      return res.status(400).json({ 
        mensaje: 'Serie de comprobante y sucursal son requeridos' 
      });
    }
    
    // Verificar permisos de sucursal
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.sucursalId !== parseInt(sucursalId)) {
      return res.status(403).json({ 
        mensaje: 'No tiene permisos para consultar números de esta sucursal' 
      });
    }
    
    // Buscar la última venta con la misma serie y sucursal
    const ultimaVenta = await Venta.findOne({
      where: {
        serieComprobante: serieComprobante,
        sucursalId: sucursalId
      },
      order: [['createdAt', 'DESC']]
    });
    
    let correlativo = 1;
    if (ultimaVenta && ultimaVenta.numeroComprobante) {
      // Extraer el número del formato actual y incrementar
      const ultimoNumero = ultimaVenta.numeroComprobante;
      const numeroExtraido = parseInt(ultimoNumero.replace(/\D/g, '')) || 0;
      correlativo = numeroExtraido + 1;
    }
    
    // Generar número con formato de 6 dígitos con ceros a la izquierda
    const siguienteNumero = correlativo.toString().padStart(6, '0');
    
    res.json({
      mensaje: 'Siguiente número obtenido exitosamente',
      siguienteNumero: siguienteNumero,
      serieComprobante: serieComprobante,
      numeroCompleto: `${serieComprobante}-${siguienteNumero}`
    });
    
  } catch (error) {
    console.error('Error al obtener siguiente número:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener siguiente número de comprobante', 
      error: error.message 
    });
  }
};

// Consolidado de ítems de ventas
exports.obtenerConsolidadoItemsVentas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, sucursalId, productoId } = req.query;

    const { sequelize, Venta, DetalleVenta, Producto } = require('../models');

    // Construir filtro de ventas respetando permisos
    const whereVentas = { estado: { [require('sequelize').Op.not]: 'ANULADA' } };

    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      whereVentas.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      whereVentas.sucursalId = sucursalId;
    }

    if (fechaInicio && fechaFin) {
      whereVentas.fechaVenta = { [require('sequelize').Op.between]: [fechaInicio, fechaFin] };
    } else if (fechaInicio) {
      whereVentas.fechaVenta = { [require('sequelize').Op.gte]: fechaInicio };
    } else if (fechaFin) {
      whereVentas.fechaVenta = { [require('sequelize').Op.lte]: fechaFin };
    }

    // Filtro de detalles por producto
    const whereDetalles = {};
    if (productoId) whereDetalles.productoId = productoId;

    const resultados = await DetalleVenta.findAll({
      attributes: [
        'productoId',
        [sequelize.fn('SUM', sequelize.col('DetalleVenta.cantidad')), 'cantidadVendida'],
        [sequelize.fn('SUM', sequelize.col('DetalleVenta.subtotal')), 'montoSubtotal'],
        // IGV y Total no existen en DetalleVenta; se calcularán en el mapeo
      ],
      include: [
        {
          model: Venta,
          attributes: [],
          where: whereVentas
        },
        {
          model: Producto,
          attributes: ['id', 'nombre', 'codigo']
        }
      ],
      where: whereDetalles,
      group: ['productoId', 'Producto.id'],
      order: [[sequelize.fn('SUM', sequelize.col('DetalleVenta.cantidad')), 'DESC']]
    });

    const items = resultados.map(r => {
      const cantidadVendida = Number(r.get('cantidadVendida') || 0);
      const montoSubtotal = Number(r.get('montoSubtotal') || 0);
      const montoIgv = Number((montoSubtotal * 0.18).toFixed(2));
      const montoTotal = Number((montoSubtotal + montoIgv).toFixed(2));

      return {
        productoId: r.productoId,
        productoNombre: r.Producto?.nombre || 'Producto',
        productoCodigo: r.Producto?.codigo || '-',
        cantidadVendida,
        montoSubtotal,
        montoIgv,
        montoTotal
      };
    });

    res.json({ items, total: items.length });
  } catch (error) {
    console.error('Error en obtenerConsolidadoItemsVentas:', error);
    res.status(500).json({ mensaje: 'Error al obtener consolidado de ítems de ventas' });
  }
};

// Descargar CDR de venta
exports.descargarCDR = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la venta
    const venta = await Venta.findByPk(id);
    if (!venta) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && venta.sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({ mensaje: 'No tiene permisos para ver ventas de otras sucursales' });
    }

    // Verificar que existe el CDR
    if (!venta.cdrUrl && !venta.cdrBase64) {
      return res.status(404).json({ mensaje: 'CDR no disponible para esta venta' });
    }

    const path = require('path');
    const fs = require('fs');
    
    // Si hay cdrBase64, convertirlo y enviarlo
    if (venta.cdrBase64) {
      const cdrBuffer = Buffer.from(venta.cdrBase64, 'base64');
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="R-${venta.serieComprobante}-${venta.numeroComprobante}.xml"`);
      return res.send(cdrBuffer);
    }
    
    // Si hay cdrUrl, intentar leer el archivo
    if (venta.cdrUrl) {
      const cdrPath = path.join(__dirname, '..', '..', 'files', `R-${venta.serieComprobante}-${venta.numeroComprobante}.xml`);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(cdrPath)) {
        return res.status(404).json({ mensaje: 'Archivo CDR no encontrado en el servidor' });
      }

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="R-${venta.serieComprobante}-${venta.numeroComprobante}.xml"`);
      
      // Enviar archivo
      return res.sendFile(cdrPath);
    }
    
    return res.status(404).json({ mensaje: 'CDR no disponible para esta venta' });
  } catch (error) {
    console.error('Error al descargar CDR:', error);
    res.status(500).json({ mensaje: 'Error al descargar CDR', error: error.message });
  }
};

// Obtener ventas
exports.obtenerVentas = async (req, res) => {
  try {
    const { 
      fechaInicio, 
      fechaFin, 
      sucursalId, 
      clienteId, 
      tipoComprobante, 
      estadoSunat,
      page = 1, 
      limit = 10 
    } = req.query;

    const where = {};
    
    if (fechaInicio && fechaFin) {
      where.fechaVenta = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    }
    
    if (tipoComprobante) {
      where.tipoComprobante = tipoComprobante;
    }
    
    if (estadoSunat) {
      where.estadoSunat = estadoSunat;
    }
    
    if (clienteId) {
      where.clienteId = clienteId;
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Si no es SuperAdmin, solo puede ver ventas de su sucursal
      if (sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res.status(403).json({ mensaje: 'No tiene permisos para ver ventas de otras sucursales' });
      }
      // Filtrar por sucursal del usuario
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      // Si es SuperAdmin y se especifica sucursalId, filtrar por esa sucursal
      where.sucursalId = sucursalId;
    }

    const ventas = await Venta.findAll({
      where,
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'numeroDocumento', 'tipoDocumento', 'telefono', 'email', 'direccion'] },
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'apellido'] },
        { 
          model: Taller, 
          as: 'taller', 
          attributes: ['id', 'descripcion', 'motivoIngreso', 'estado', 'categoria', 'operarioId', 'precioMantenimiento'],
          required: false 
        },
        {
          model: DetalleVenta,
          include: [
            { model: Producto, attributes: ['id', 'nombre', 'codigo', 'unidadMedida'] },
            { model: Presentacion, attributes: ['id', 'descripcion', 'factor'], required: false }
          ]
        }
      ],
      order: [['fechaVenta', 'DESC']]
    });

    // Formatear las ventas con información adicional
    const ventasFormateadas = ventas.map(venta => {
      const ventaJson = venta.toJSON();
      
      // Formatear fecha para evitar problemas de zona horaria
      if (ventaJson.fechaVenta) {
        const fecha = new Date(ventaJson.fechaVenta);
        // Ajustar a zona horaria local de Perú (UTC-5)
        const fechaLocal = new Date(fecha.getTime() - (fecha.getTimezoneOffset() * 60000));
        ventaJson.fechaVentaFormateada = fechaLocal.toISOString().split('T')[0];
      }
      
      // Agregar información de WhatsApp
      if (ventaJson.Cliente && ventaJson.Cliente.telefono) {
        const telefono = ventaJson.Cliente.telefono.toString();
        // Verificar si ya tiene código de país (+51 para Perú)
        if (!telefono.startsWith('+51') && !telefono.startsWith('51')) {
          ventaJson.Cliente.telefonoWhatsApp = `+51${telefono}`;
        } else {
          ventaJson.Cliente.telefonoWhatsApp = telefono.startsWith('+') ? telefono : `+${telefono}`;
        }
        ventaJson.Cliente.tieneWhatsApp = true;
      } else {
        ventaJson.Cliente = ventaJson.Cliente || {};
        ventaJson.Cliente.tieneWhatsApp = false;
      }
      
      // Agregar información del PDF si está disponible
      if (ventaJson.pdfUrl) {
        ventaJson.pdfDisponible = true;
      } else if (ventaJson.numeroComprobante) {
        // Construir URL del PDF basada en el número de comprobante
        ventaJson.pdfUrl = `${process.env.BASE_URL || 'http://localhost:4000'}/files/${ventaJson.numeroComprobante}.pdf`;
        ventaJson.pdfPath = `/files/${ventaJson.numeroComprobante}.pdf`;
        ventaJson.pdfDisponible = true;
      } else {
        ventaJson.pdfDisponible = false;
      }
      
      return ventaJson;
    });

    res.json({ 
      ventas: ventasFormateadas,
      total: ventasFormateadas.length,
      mensaje: 'Ventas obtenidas exitosamente',
      configuracion: {
        codigoPais: '+51',
        zonaHoraria: 'America/Lima'
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las ventas', error: error.message });
  }
};




// Obtener una venta por ID
// Obtener una venta por ID
exports.obtenerVentaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const venta = await Venta.findOne({
      where: { id },
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'numeroDocumento', 'tipoDocumento'] },
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'UsuarioAnulacion', attributes: ['id', 'nombre', 'apellido'] },
        { 
          model: Taller, 
          as: 'taller', 
          attributes: ['id', 'descripcion', 'motivoIngreso', 'estado', 'categoria', 'operarioId', 'precioMantenimiento'],
          required: false 
        },
        {
          model: DetalleVenta,
          include: [
            { model: Producto, attributes: ['id', 'nombre', 'codigo', 'unidadMedida'] }
          ]
        }
      ]
    });
    if (!venta) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }
    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && venta.sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({ mensaje: 'No tiene permisos para ver ventas de otras sucursales' });
    }
    res.json({ venta });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la venta', error: error.message });
  }
};







// Crear una nueva venta
exports.crearVenta = async (req, res) => {
  const {
    clienteId,
    sucursalId,
    tipoComprobante,
    serieComprobante,
    numeroComprobante,
    fechaVenta,
    fechaVencimiento,
    subtotal,
    igv,
    total,
    observacion,
    detalles,
    metodoPago,
    formaPago,
    moneda,
    tipoOperacion,
    codigoVin,
    tallerId
  } = req.body;

  // Iniciar transacción
  const t = await sequelize.transaction();

  try {
    // Verificar permisos
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Cajero') {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para crear ventas' });
    }

    // Si no es SuperAdmin, solo puede crear ventas para su sucursal
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.sucursalId !== parseInt(sucursalId)) {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para crear ventas para otras sucursales' });
    }

    // Verificar si el cliente existe
    if (clienteId) {
      const clienteExiste = await Cliente.findOne({
        where: { id: clienteId, estado: true },
        transaction: t
      });
      if (!clienteExiste) {
        await t.rollback();
        return res.status(400).json({ mensaje: 'El cliente seleccionado no existe o está inactivo' });
      }
    }

    // Verificar si la sucursal existe
    const sucursalExiste = await Sucursal.findOne({
      where: { id: sucursalId, estado: true },
      transaction: t
    });
    if (!sucursalExiste) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'La sucursal seleccionada no existe o está inactiva' });
    }

    // Validar datos de la sucursal (empresa) para SUNAT
    const camposRequeridosEmpresa = [
      'ruc', 'razonSocial', 'nombreComercial', 'direccion',
      'ubigeo', 'urbanizacion', 'distrito', 'provincia', 'departamento'
    ];
    const camposFaltantes = camposRequeridosEmpresa.filter(campo => !sucursalExiste[campo]);
    if (camposFaltantes.length > 0) {
      await t.rollback();
      return res.status(400).json({
        mensaje: 'Datos incompletos de la empresa para SUNAT',
        camposFaltantes: camposFaltantes
      });
    }

    // Verificar que haya detalles
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'Debe incluir al menos un detalle en la venta' });
    }

    // Determinar el estado según el tipo de comprobante
    const esCotizacion = tipoComprobante === 'COTIZACION';
    const estadoVenta = esCotizacion ? 'PENDIENTE' : 'COMPLETADA';

    // Calcular totales automáticamente
    let subtotalCalculado = 0;
    let totalTaller = 0;

    // Calcular subtotal de productos
    for (const detalle of detalles) {
      subtotalCalculado += parseFloat(detalle.subtotal || (detalle.cantidad * detalle.precioUnitario));
    }

    // Agregar precio del taller si existe
    if (tallerId) {
      const taller = await Taller.findByPk(tallerId, { transaction: t });
      if (taller && taller.precioMantenimiento) {
        totalTaller = parseFloat(taller.precioMantenimiento);
        subtotalCalculado += totalTaller;
      }
    }

    // Usar IGV proporcionado por el usuario o calcular automáticamente si no se proporciona
    const igvFinal = igv !== undefined && igv !== null ? parseFloat(igv) : subtotalCalculado * 0.18;
    const totalCalculado = subtotalCalculado + igvFinal;

    // Generar número de comprobante automáticamente si no se proporciona
    let numeroComprobanteGenerado = numeroComprobante;
    
    if (!numeroComprobanteGenerado || numeroComprobanteGenerado === '') {
      // Buscar la última venta con la misma serie y sucursal
      const ultimaVenta = await Venta.findOne({
        where: {
          serieComprobante: serieComprobante,
          sucursalId: sucursalId
        },
        order: [['createdAt', 'DESC']],
        transaction: t
      });
      
      let correlativo = 1;
      if (ultimaVenta && ultimaVenta.numeroComprobante) {
        // Extraer el número del formato actual y incrementar
        const ultimoNumero = ultimaVenta.numeroComprobante;
        const numeroExtraido = parseInt(ultimoNumero.replace(/\D/g, '')) || 0;
        correlativo = numeroExtraido + 1;
      }
      
      // Generar número con formato de 6 dígitos con ceros a la izquierda
      numeroComprobanteGenerado = correlativo.toString().padStart(6, '0');
    }

    // Crear la venta con los valores proporcionados o calculados
    const nuevaVenta = await Venta.create({
      clienteId,
      sucursalId,
      usuarioId: req.usuario.id,
      tipoComprobante,
      serieComprobante,
      numeroComprobante: numeroComprobanteGenerado,
      fechaVenta: new Date(), // Siempre usar fecha actual para que coincida con createdAt
      fechaVencimiento: fechaVencimiento || null,
      subtotal: parseFloat(subtotalCalculado.toFixed(2)),
      igv: parseFloat(igvFinal.toFixed(2)),
      total: parseFloat(totalCalculado.toFixed(2)),
      estado: estadoVenta,
      observacion,
      metodoPago,
      formaPago,
      moneda,
      tipoOperacion: tipoOperacion || 'Venta interna',
      codigoVin,
      tallerId,
      estadoSunat: esCotizacion ? 'PENDIENTE' : 'PENDIENTE' // Estado inicial para SUNAT
    }, { transaction: t });

    // Procesar detalles
    for (const detalle of detalles) {
      const { productoId, cantidad, precioUnitario, subtotal: subtotalDetalle } = detalle;

      // Verificar si el producto existe
      const producto = await Producto.findOne({
        where: { id: productoId, estado: true },
        transaction: t
      });
      if (!producto) {
        await t.rollback();
        return res.status(400).json({ mensaje: `El producto con ID ${productoId} no existe o está inactivo` });
      }

      // Calcular la cantidad real
      const cantidadReal = cantidad;

      // Solo verificar stock y actualizar inventario si NO es una cotización
      if (!esCotizacion) {
        // Verificar stock en inventario
        const inventario = await Inventario.findOne({
          where: { productoId, sucursalId },
          transaction: t
        });
        if (!inventario || inventario.stock < cantidadReal) {
          await t.rollback();
          return res.status(400).json({
            mensaje: `No hay suficiente stock para el producto con ID ${productoId}`
          });
        }

        // Actualizar el inventario
        await inventario.update({
          stock: inventario.stock - cantidadReal
        }, { transaction: t });

        // Registrar el movimiento de inventario
        await MovimientoInventario.create({
          productoId,
          sucursalOrigenId: sucursalId,
          sucursalDestinoId: sucursalId,
          tipoMovimiento: 'SALIDA',
          cantidad: cantidadReal,
          precioUnitario,
          documentoRelacionadoTipo: 'VENTA',
          documentoRelacionadoId: nuevaVenta.id,
          usuarioId: req.usuario.id,
          observacion: `Salida por venta #${nuevaVenta.id}`,
          autorizado: true,
          autorizadoPorId: req.usuario.id
        }, { transaction: t });
      }

      // Crear el detalle de venta
      await DetalleVenta.create({
        ventaId: nuevaVenta.id,
        productoId,
        cantidad,
        precioUnitario,
        subtotal: subtotalDetalle
      }, { transaction: t });
    }

    // Si es factura o boleta, enviar a SUNAT y generar documentos
    if (['FACTURA', 'BOLETA'].includes(tipoComprobante) && !esCotizacion) {
      try {
        // Obtener datos del cliente
        const cliente = await Cliente.findByPk(clienteId, { transaction: t });

        // Obtener detalles completos con productos
        const detallesCompletos = await DetalleVenta.findAll({
          where: { ventaId: nuevaVenta.id },
          include: [
            {
              model: Producto,
              include: [
                {
                  model: Presentacion,
                  attributes: ['id', 'descripcion', 'factor']
                }
              ]
            }
          ],
          transaction: t
        });

        // Obtener información del taller si existe
        let tallerInfo = null;
        if (tallerId) {
          const taller = await Taller.findByPk(tallerId, { 
            include: [{
              model: require('../models').Operario,
              as: 'operarioAsignado',
              attributes: ['nombres', 'apellidos', 'puesto']
            }],
            transaction: t 
          });
          if (taller) {
            tallerInfo = {
              descripcion: taller.descripcion,
              motivo: taller.motivoIngreso,
              precio: taller.precioMantenimiento,
              placa: taller.placa,
              observaciones: taller.observaciones,
              operario: taller.operarioAsignado ? {
                nombres: taller.operarioAsignado.nombres,
                apellidos: taller.operarioAsignado.apellidos,
                puesto: taller.operarioAsignado.puesto
              } : null
            };
          }
        }

        // Generar documentos
        const documents = await DocumentService.generateDocuments(
          nuevaVenta,
          sucursalExiste,
          cliente,
          detallesCompletos,
          tallerInfo
        );

        // Generar PDF del ticket (formato 80mm)
        const ticketPdfPath = await DocumentService.generatePDF(
          nuevaVenta,
          sucursalExiste,
          cliente,
          detallesCompletos,
          tallerInfo,
          'ticket'
        );

        // Construir la URL del ticket
        const ticketFileName = `ticket-${nuevaVenta.serieComprobante}-${nuevaVenta.numeroComprobante}.pdf`;
        const ticketUrl = `${process.env.BASE_URL || 'http://localhost:4000'}/files/${ticketFileName}`;
        
        console.log('✅ Ticket PDF generado:', ticketPdfPath);

        // Actualizar la venta con los documentos generados
        await nuevaVenta.update({
          xmlUrl: documents.xmlUrl,
          cdrUrl: documents.cdrUrl,
          pdfUrl: documents.pdfUrl,
          ticketUrl: ticketUrl,
          codigoHash: documents.codigoHash,
          xmlBase64: documents.xmlBase64,
          cdrBase64: documents.cdrBase64,
          estadoSunat: 'ACEPTADO',
          sunatError: null
        }, { transaction: t });

        console.log('✅ Documentos generados y venta actualizada');
      } catch (error) {
        console.error('Error al generar documentos:', error.message);
        // Marcar como error pero continuar con la venta
        await nuevaVenta.update({
          estadoSunat: 'ERROR',
          sunatError: `Error al generar documentos: ${error.message}`
        }, { transaction: t });
      }
    }

    // Crear cuenta por cobrar si la forma de pago es crédito
    if (formaPago === 'CREDITO' && !esCotizacion) {
      try {
        await CuentasPorCobrar.create({
          clienteId: clienteId,
          ventaId: nuevaVenta.id,
          numeroDocumento: numeroComprobante,
          tipoDocumento: tipoComprobante,
          fechaEmision: fechaVenta,
          fechaVencimiento: fechaVencimiento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días por defecto
          montoOriginal: total,
          montoPagado: 0,
          montoPendiente: total,
          estado: 'PENDIENTE',
          moneda: 'PEN',
          sucursalId: sucursalId
        }, { transaction: t });
        
        console.log('✅ Cuenta por cobrar creada para venta a crédito');
      } catch (error) {
        console.error('Error al crear cuenta por cobrar:', error.message);
        // No fallar la venta por este error, solo registrar
      }
    }

    // Recargar la venta con todos los datos actualizados antes del commit
    const ventaCompleta = await Venta.findByPk(nuevaVenta.id, {
      include: [
        {
          model: DetalleVenta,
          include: [
            {
              model: Producto,
              include: [
                {
                  model: Presentacion,
                  attributes: ['id', 'descripcion', 'factor']
                }
              ]
            }
          ]
        },
        {
          model: Cliente
        },
        {
          model: Sucursal
        }
      ],
      transaction: t
    });

    // Confirmar transacción
    await t.commit();

    const mensajeExito = esCotizacion ? 'Cotización creada exitosamente' :
      tipoComprobante === 'FACTURA' ? 'Factura creada exitosamente' :
      tipoComprobante === 'BOLETA' ? 'Boleta creada exitosamente' :
      'Venta creada exitosamente';

        res.status(201).json({
      mensaje: mensajeExito,
      venta: ventaCompleta,
      esCotizacion: esCotizacion,
      esFactura: tipoComprobante === 'FACTURA',
      esBoleta: tipoComprobante === 'BOLETA',
      estadoSunat: ventaCompleta.estadoSunat,
      sunatError: ventaCompleta.sunatError,
      // Incluir URLs si están disponibles
      ...(ventaCompleta.xmlUrl && {
        xmlUrl: ventaCompleta.xmlUrl,
        ruta_xml: ventaCompleta.xmlUrl // Compatibilidad
      }),
      ...(ventaCompleta.cdrUrl && {
        cdrUrl: ventaCompleta.cdrUrl,
        ruta_cdr: ventaCompleta.cdrUrl // Compatibilidad
      }),
      ...(ventaCompleta.pdfUrl && {
        pdfUrl: ventaCompleta.pdfUrl,
        ruta_pdf: ventaCompleta.pdfUrl // Compatibilidad
      }),
      // URL del ticket generado (formato 80mm)
      ticketUrl: ventaCompleta.ticketUrl,
      ...(ventaCompleta.codigoHash && {
        codigoHash: ventaCompleta.codigoHash,
        codigo_hash: ventaCompleta.codigoHash // Compatibilidad
      })
    });
  } catch (error) {
    // Solo hacer rollback si la transacción no ha sido confirmada
    if (!t.finished) {
      await t.rollback();
    }
    console.error('Error general al crear la venta:', error);
    res.status(500).json({
      mensaje: 'Error al crear la venta',
      error: error.message,
      estadoSunat: 'ERROR',
      sunatError: error.message
    });
  }
};







// Generar reporte de ventas
// Generar reporte de ventas
exports.reporteVentas = async (req, res) => {
  const { sucursalId, fechaVenta, tipoComprobante, metodoPago } = req.query;

  try {
    // Inicializar condiciones de búsqueda
    const where = {
      estado: 'COMPLETADA'
    };

    // Aplicar filtro por fecha si se proporciona
    if (fechaVenta) {
      const [año, mes, dia] = fechaVenta.split('-').map(Number);

      // Validar la fecha
      if (!año || !mes || !dia) {
        return res.status(400).json({ mensaje: 'Formato de fecha inválido' });
      }

      // Crear fechaInicio y fechaFin en UTC
      const fechaInicioUTC = new Date(Date.UTC(año, mes - 1, dia, 0, 0, 0, 0));
      const fechaFinUTC = new Date(Date.UTC(año, mes - 1, dia, 23, 59, 59, 999));

      // Ajustar para que coincida con la zona horaria local
      const fechaInicioLocal = new Date(fechaInicioUTC.getTime() + fechaInicioUTC.getTimezoneOffset() * 60000);
      const fechaFinLocal = new Date(fechaFinUTC.getTime() + fechaFinUTC.getTimezoneOffset() * 60000);

      where.fechaVenta = {
        [Op.between]: [fechaInicioLocal, fechaFinLocal]
      };
    }

    // Aplicar filtro por tipo de comprobante si se proporciona
    if (tipoComprobante) {
      where.tipoComprobante = tipoComprobante;
    }

    // NUEVO: Aplicar filtro por método de pago si se proporciona
    if (metodoPago) {
      // Validar que el método de pago sea válido
      const metodosValidos = ['EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'YAPE', 'PLIN', 'CONTRAENTREGA'];
      if (!metodosValidos.includes(metodoPago)) {
        return res.status(400).json({ 
          mensaje: 'Método de pago inválido',
          metodosValidos: metodosValidos
        });
      }
      where.metodoPago = metodoPago;
    }

    // Verificar permisos y aplicar filtro por sucursal
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Si no es SuperAdmin, solo puede ver ventas de su sucursal
      if (sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res.status(403).json({ mensaje: 'No tiene permisos para ver ventas de otras sucursales' });
      }
      // Filtrar por sucursal del usuario
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      // Si es SuperAdmin y se especifica sucursalId, filtrar por esa sucursal
      where.sucursalId = sucursalId;
    }

    // Obtener ventas para el reporte
    const ventas = await Venta.findAll({
      where,
      include: [
        { model: Cliente, attributes: ['id', 'nombre'] },
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fechaVenta', 'ASC']]
    });

    // Verificar si se encontraron ventas
    if (ventas.length === 0) {
      return res.status(404).json({
        mensaje: 'No se encontraron ventas para los criterios especificados',
        reporte: {
          sucursalId: sucursalId || (req.usuario.rol !== 'SuperAdmin' ? req.usuario.sucursalId : null),
          fechaVenta: fechaVenta || null,
          tipoComprobante: tipoComprobante || null,
          metodoPago: metodoPago || null,
          totalVentas: 0,
          montoTotal: 0,
          promedioVenta: 0,
          ventasPorSucursal: [],
          ventasPorMetodoPago: [],
          ventas: []
        }
      });
    }

    // Calcular totales
    const totalVentas = ventas.length;
    const montoTotal = ventas.reduce((sum, venta) => sum + parseFloat(venta.total), 0);
    const promedioVenta = totalVentas > 0 ? montoTotal / totalVentas : 0;

    // Agrupar por sucursal si no se especificó una
    let ventasPorSucursal = [];
    if (!sucursalId && req.usuario.rol === 'SuperAdmin') {
      // Obtener todas las sucursales activas
      const sucursales = await Sucursal.findAll({
        where: { estado: true },
        attributes: ['id', 'nombre']
      });

      // Agrupar ventas por sucursal
      ventasPorSucursal = sucursales.map(sucursal => {
        const ventasSucursal = ventas.filter(v => v.sucursalId === sucursal.id);
        const montoSucursal = ventasSucursal.reduce((sum, venta) => sum + parseFloat(venta.total), 0);
        return {
          sucursal: sucursal.nombre,
          totalVentas: ventasSucursal.length,
          montoTotal: montoSucursal
        };
      });
    }

    // NUEVO: Agrupar por método de pago si no se especificó uno
    let ventasPorMetodoPago = [];
    if (!metodoPago) {
      const metodosUnicos = [...new Set(ventas.map(v => v.metodoPago))];
      ventasPorMetodoPago = metodosUnicos.map(metodo => {
        const ventasMetodo = ventas.filter(v => v.metodoPago === metodo);
        const montoMetodo = ventasMetodo.reduce((sum, venta) => sum + parseFloat(venta.total), 0);
        return {
          metodoPago: metodo,
          totalVentas: ventasMetodo.length,
          montoTotal: montoMetodo,
          porcentaje: ((ventasMetodo.length / totalVentas) * 100).toFixed(2)
        };
      }).sort((a, b) => b.montoTotal - a.montoTotal); // Ordenar por monto descendente
    }

    res.json({
      reporte: {
        sucursalId: sucursalId || (req.usuario.rol !== 'SuperAdmin' ? req.usuario.sucursalId : null),
        fechaVenta: fechaVenta || null,
        tipoComprobante: tipoComprobante || null,
        metodoPago: metodoPago || null,
        totalVentas,
        montoTotal,
        promedioVenta,
        ventasPorSucursal: ventasPorSucursal.length > 0 ? ventasPorSucursal : undefined,
        ventasPorMetodoPago: ventasPorMetodoPago.length > 0 ? ventasPorMetodoPago : undefined,
        ventas
      }
    });
  } catch (error) {
    console.error('Error al generar el reporte de ventas:', error);
    res.status(500).json({
      mensaje: 'Error al generar el reporte de ventas',
      error: error.message,
      detalles: error.stack
    });
  }
};


// Anular una venta
exports.anularVenta = async (req, res) => {
  const { id } = req.params;
  const { motivoAnulacion } = req.body;
  // Iniciar transacción
  const t = await sequelize.transaction();
  try {
    // Verificar permisos (solo SuperAdmin y Admin pueden anular ventas)
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin') {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para anular ventas' });
    }
    // Verificar si la venta existe
    const venta = await Venta.findOne({
      where: { id },
      include: [
        { model: DetalleVenta },
        { model: Cliente, attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'apellido'] }
      ],
      transaction: t
    });
    if (!venta) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }
    // Verificar si la venta ya está anulada
    if (venta.estado === 'ANULADA') {
      await t.rollback();
      return res.status(400).json({ mensaje: 'La venta ya está anulada' });
    }
    // Si no es SuperAdmin, solo puede anular ventas de su sucursal
    if (req.usuario.rol !== 'SuperAdmin' && venta.sucursalId !== req.usuario.sucursalId) {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para anular ventas de otras sucursales' });
    }
    // Revertir el inventario para cada detalle
    if (venta.DetalleVenta && Array.isArray(venta.DetalleVenta)) {
      for (const detalle of venta.DetalleVenta) {
        // Verificar si la presentación existe y obtener el factor
        let factor = 1;
        if (detalle.presentacionId) {
          const presentacion = await Presentacion.findOne({
            where: { id: detalle.presentacionId },
            transaction: t
          });
          if (presentacion) {
            factor = presentacion.factor;
          }
        }
        // Calcular la cantidad real
        const cantidadReal = detalle.cantidad * factor;
        // Actualizar el inventario
        let inventario = await Inventario.findOne({
          where: { productoId: detalle.productoId, sucursalId: venta.sucursalId },
          transaction: t
        });
        if (!inventario) {
          // Si no existe el inventario, crearlo
          inventario = await Inventario.create({
            productoId: detalle.productoId,
            sucursalId: venta.sucursalId,
            stock: cantidadReal,
            stockMinimo: 0
          }, { transaction: t });
        } else {
          // Si existe, actualizar el stock
          await inventario.update({
            stock: inventario.stock + cantidadReal
          }, { transaction: t });
        }
        // Registrar el movimiento de inventario
        await MovimientoInventario.create({
          productoId: detalle.productoId,
          sucursalOrigenId: null,
          sucursalDestinoId: venta.sucursalId,
          tipoMovimiento: 'ENTRADA',
          cantidad: cantidadReal,
          presentacionId: detalle.presentacionId,
          precioUnitario: detalle.precioUnitario,
          documentoRelacionadoTipo: 'ANULACION_VENTA',
          documentoRelacionadoId: venta.id,
          usuarioId: req.usuario.id,
          observacion: `Entrada por anulación de venta #${venta.id}`,
          autorizado: true,
          autorizadoPorId: req.usuario.id
        }, { transaction: t });
      }
    }
    // Anular la venta
    await venta.update({
      estado: 'ANULADA',
      motivoAnulacion: motivoAnulacion || 'Venta anulada',
      usuarioAnulacionId: req.usuario.id,
      fechaAnulacion: new Date()
    }, { transaction: t });
    // Confirmar transacción
    await t.commit();
    // Obtener el nombre del cliente y el nombre del usuario
    const clienteNombre = venta.Cliente ? venta.Cliente.nombre : 'Cliente no especificado';
    const usuarioNombre = venta.Usuario ? `${venta.Usuario.nombre} ${venta.Usuario.apellido}` : 'Usuario no especificado';
    res.json({
      mensaje: 'Venta anulada exitosamente',
      venta: {
        ...venta.toJSON(),
        clienteNombre,
        usuarioNombre
      }
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al anular la venta', error: error.message });
  }
};

// Obtener estado SUNAT y generar PDF
exports.obtenerEstadoSunat = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la venta con todas las relaciones necesarias
    const venta = await Venta.findByPk(id, {
      include: [
        {
          model: Cliente,
          attributes: ['id', 'nombre', 'email', 'telefono', 'direccion', 'tipoDocumento', 'numeroDocumento']
        },
        {
          model: Sucursal,
          attributes: ['id', 'nombre', 'direccion', 'ruc', 'razonSocial']
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'apellido']
        },
        {
          model: DetalleVenta,
          attributes: ['id', 'ventaId', 'productoId', 'cantidad', 'precioUnitario', 'subtotal', 'presentacionId', 'createdAt', 'updatedAt'],
          include: [
            {
              model: Producto,
              attributes: ['id', 'nombre', 'codigo', 'unidadMedida']
            },
            {
              model: Presentacion,
              attributes: ['id', 'descripcion', 'factor'],
              required: false
            }
          ]
        }
      ]
    });

    if (!venta) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && venta.sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({ mensaje: 'No tiene permisos para ver ventas de otras sucursales' });
    }

    // Obtener formato del query parameter (por defecto A4)
    const formato = req.query.formato || 'A4';
    
    // Generar PDF usando el servicio de documentos
    const pdfPath = await DocumentService.generatePDF(
      venta,
      venta.Sucursal,
      venta.Cliente,
      venta.DetalleVenta,
      null, // taller
      formato
    );

    // Obtener la URL base desde las variables de entorno
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    const fileName = formato === 'ticket' || formato === '80mm' 
      ? `ticket-${venta.serieComprobante}-${venta.numeroComprobante}.pdf`
      : `${venta.serieComprobante}-${venta.numeroComprobante}.pdf`;
    const pdfUrl = `${baseUrl}/files/${fileName}`;

    // Actualizar la venta con la URL del PDF generado automáticamente
    await venta.update({
      pdfUrl: pdfUrl,
      estadoSunat: venta.estadoSunat || 'PROCESADO'
    });

    // Respuesta con estado SUNAT y PDF
    res.json({
      id: venta.id,
      numeroComprobante: venta.numeroComprobante,
      tipoComprobante: venta.tipoComprobante,
      estadoSunat: venta.estadoSunat || 'PROCESADO',
      fechaVenta: venta.fechaVenta,
      total: venta.total,
      cliente: venta.Cliente,
      sucursal: venta.Sucursal,
      usuario: venta.Usuario,
      detalles: venta.DetalleVenta,
      pdfUrl: pdfUrl,
      pdfPath: pdfPath,
      mensaje: 'PDF generado y subido automáticamente'
    });
  } catch (error) {
    console.error('Error al obtener estado SUNAT:', error);
    res.status(500).json({ mensaje: 'Error al obtener estado SUNAT', error: error.message });
  }
};

// Descargar XML de venta
exports.descargarXML = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la venta
    const venta = await Venta.findByPk(id);
    if (!venta) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && venta.sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({ mensaje: 'No tiene permisos para ver ventas de otras sucursales' });
    }

    // Verificar que existe el XML
    if (!venta.xmlUrl && !venta.xmlBase64) {
      return res.status(404).json({ mensaje: 'XML no disponible para esta venta' });
    }

    const path = require('path');
    const fs = require('fs');
    
    // Si hay xmlBase64, convertirlo y enviarlo
    if (venta.xmlBase64) {
      const xmlBuffer = Buffer.from(venta.xmlBase64, 'base64');
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="${venta.serieComprobante}-${venta.numeroComprobante}.xml"`);
      return res.send(xmlBuffer);
    }
    
    // Si hay xmlUrl, intentar leer el archivo
    if (venta.xmlUrl) {
      const xmlPath = path.join(__dirname, '..', '..', 'files', `${venta.serieComprobante}-${venta.numeroComprobante}.xml`);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(xmlPath)) {
        return res.status(404).json({ mensaje: 'Archivo XML no encontrado en el servidor' });
      }

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="${venta.serieComprobante}-${venta.numeroComprobante}.xml"`);
      
      // Enviar archivo
      return res.sendFile(xmlPath);
    }
    
    return res.status(404).json({ mensaje: 'XML no disponible para esta venta' });
  } catch (error) {
     console.error('Error al descargar XML:', error);
    res.status(500).json({ mensaje: 'Error al descargar XML', error: error.message });
  }
};

// Reenviar venta a SUNAT
exports.reenviarSunat = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la venta
    const venta = await Venta.findByPk(id);
    if (!venta) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && venta.sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({ mensaje: 'No tiene permisos para reenviar ventas de otras sucursales' });
    }

    // Verificar que la venta esté completada
    if (venta.estado !== 'completada') {
      return res.status(400).json({ mensaje: 'Solo se pueden reenviar ventas completadas' });
    }

    // Verificar que tenga XML generado
    if (!venta.xmlGenerado) {
      return res.status(400).json({ mensaje: 'La venta no tiene XML generado para reenviar' });
    }

    // Aquí iría la lógica para reenviar a SUNAT
    // Por ahora, simularemos el reenvío actualizando el estado
    await venta.update({
      estadoSunat: 'REENVIADO',
      fechaActualizacion: new Date()
    });

    res.json({
      mensaje: 'Venta reenviada a SUNAT exitosamente',
      venta: {
        id: venta.id,
        numeroComprobante: venta.numeroComprobante,
        estadoSunat: venta.estadoSunat,
        fechaActualizacion: venta.fechaActualizacion
      }
    });
  } catch (error) {
     console.error('Error al reenviar venta a SUNAT:', error);
     res.status(500).json({ mensaje: 'Error al reenviar venta a SUNAT', error: error.message });
   }
 };

// Descargar PDF de venta
exports.descargarPDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la venta con todas las relaciones necesarias
    const venta = await Venta.findByPk(id, {
      include: [
        {
          model: Cliente,
          attributes: ['id', 'nombre', 'email', 'telefono', 'direccion', 'tipoDocumento', 'numeroDocumento']
        },
        {
          model: Sucursal,
          attributes: ['id', 'nombre', 'direccion', 'ruc', 'razonSocial']
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'apellido']
        },
        {
          model: DetalleVenta,
          attributes: ['id', 'ventaId', 'productoId', 'cantidad', 'precioUnitario', 'subtotal', 'presentacionId', 'createdAt', 'updatedAt'],
          include: [
            {
              model: Producto,
              attributes: ['id', 'nombre', 'codigo', 'unidadMedida']
            },
            {
              model: Presentacion,
              attributes: ['id', 'descripcion', 'factor'],
              required: false
            }
          ]
        }
      ]
    });

    if (!venta) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && venta.sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({ mensaje: 'No tiene permisos para ver ventas de otras sucursales' });
    }

    // Obtener formato del query parameter (por defecto A4)
    const formato = req.query.formato || 'A4';
    
    // Generar PDF usando el servicio de documentos
    const pdfPath = await DocumentService.generatePDF(
      venta,
      venta.Sucursal,
      venta.Cliente,
      venta.DetalleVenta,
      null, // taller
      formato
    );

    // Verificar que el archivo PDF existe
    const fs = require('fs');
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ mensaje: 'Error al generar el archivo PDF' });
    }

    // Configurar headers para descarga
    const fileName = formato === 'ticket' || formato === '80mm' 
      ? `ticket-${venta.serieComprobante}-${venta.numeroComprobante}.pdf`
      : `${venta.serieComprobante}-${venta.numeroComprobante}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Enviar archivo
    res.sendFile(pdfPath);
  } catch (error) {
    console.error('Error al descargar PDF:', error);
    res.status(500).json({ mensaje: 'Error al descargar PDF', error: error.message });
  }
};

// Obtener ventas por cliente
exports.obtenerVentasPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const { periodo, mes, fechaInicio, fechaFin } = req.query;

    console.log('Obteniendo historial para cliente:', clienteId, 'con filtros:', { periodo, mes, fechaInicio, fechaFin });

    const where = {
      clienteId: clienteId,
      estado: 'COMPLETADA'
    };

    // Aplicar filtros de fecha según el período
    if (periodo === 'Por mes' && mes) {
      const [año, mesNum] = mes.split('-').map(Number);
      const fechaInicioMes = new Date(año, mesNum - 1, 1);
      const fechaFinMes = new Date(año, mesNum, 0, 23, 59, 59, 999);
      
      where.fechaVenta = {
        [Op.between]: [fechaInicioMes, fechaFinMes]
      };
    } else if (fechaInicio && fechaFin) {
      where.fechaVenta = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      where.sucursalId = req.usuario.sucursalId;
    }

    const ventas = await Venta.findAll({
      where,
      include: [
        { 
          model: Cliente, 
          attributes: ['id', 'nombre', 'numeroDocumento', 'tipoDocumento'] 
        },
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre'] 
        },
        {
          model: Usuario,
          as: 'Usuario',
          attributes: ['id', 'nombre', 'apellido']
        },
        {
          model: DetalleVenta,
          include: [
            { 
              model: Producto, 
              attributes: ['id', 'nombre', 'codigo'] 
            }
          ]
        }
      ],
      order: [['fechaVenta', 'DESC']]
    });

    console.log(`Encontradas ${ventas.length} ventas para el cliente ${clienteId}`);

    // Formatear los datos para el frontend
    const ventasFormateadas = ventas.map(venta => ({
      id: venta.id,
      fechaVenta: venta.fechaVenta,
      tipoComprobante: venta.tipoComprobante,
      detalle: `${venta.serieComprobante}-${venta.numeroComprobante}`,
      estado: venta.estado,
      estadoSunat: venta.estadoSunat,
      notaCredito: venta.notaCredito || '-',
      moneda: venta.moneda || 'PEN',
      placaVehiculo: venta.placaVehiculo || '-',
      serieComprobante: venta.serieComprobante,
      numeroComprobante: venta.numeroComprobante,
      total: parseFloat(venta.total).toFixed(2),
      subtotal: parseFloat(venta.subtotal || 0).toFixed(2),
      igv: parseFloat(venta.igv || 0).toFixed(2),
      formaPago: venta.formaPago,
      metodoPago: venta.metodoPago,
      observacion: venta.observacion || '',
      clienteNombre: venta.Cliente ? venta.Cliente.nombre : 'Cliente no especificado',
      sucursalNombre: venta.Sucursal ? venta.Sucursal.nombre : 'Sucursal no especificada',
      usuarioNombre: venta.Usuario ? `${venta.Usuario.nombre} ${venta.Usuario.apellido}` : 'Usuario no especificado'
    }))

    res.json({
      data: ventasFormateadas,
      total: ventasFormateadas.length,
      mensaje: ventasFormateadas.length > 0 ? 'Historial obtenido exitosamente' : 'No se encontraron documentos para este cliente'
    });

  } catch (error) {
    console.error('Error al obtener historial del cliente:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener historial del cliente', 
      error: error.message,
      data: []
    });
  }
};

// Obtener comprobantes no enviados a SUNAT
exports.obtenerComprobantesNoEnviados = async (req, res) => {
  try {
    const { 
      sucursalId, 
      fechaInicio, 
      fechaFin, 
      tipoComprobante, 
      serie, 
      numero,
      page = 1, 
      limit = 10 
    } = req.query;

    // Verificar permisos de sucursal
    if (req.usuario.rol !== 'SuperAdmin' && sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
      return res.status(403).json({ 
        mensaje: 'No tiene permisos para consultar comprobantes de esta sucursal' 
      });
    }

    // Construir filtros
    const whereConditions = {
      tipoComprobante: {
        [Op.in]: ['FACTURA', 'BOLETA'] // Solo comprobantes que se envían a SUNAT
      },
      estadoSunat: {
        [Op.in]: ['PENDIENTE', 'ERROR', 'RECHAZADO'] // Estados que indican que no se enviaron correctamente
      }
    };

    // Filtro por sucursal
    if (sucursalId) {
      whereConditions.sucursalId = sucursalId;
    } else if (req.usuario.rol !== 'SuperAdmin') {
      whereConditions.sucursalId = req.usuario.sucursalId;
    }

    // Filtro por rango de fechas
    if (fechaInicio && fechaFin) {
      whereConditions.fechaVenta = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    } else if (fechaInicio) {
      whereConditions.fechaVenta = {
        [Op.gte]: fechaInicio
      };
    } else if (fechaFin) {
      whereConditions.fechaVenta = {
        [Op.lte]: fechaFin
      };
    }

    // Filtro por tipo de comprobante
    if (tipoComprobante && tipoComprobante !== 'TODOS') {
      whereConditions.tipoComprobante = tipoComprobante;
    }

    // Filtro por serie
    if (serie) {
      whereConditions.serieComprobante = {
        [Op.like]: `%${serie}%`
      };
    }

    // Filtro por número
    if (numero) {
      whereConditions.numeroComprobante = {
        [Op.like]: `%${numero}%`
      };
    }

    // Calcular offset para paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Obtener comprobantes no enviados
    const { count, rows: comprobantes } = await Venta.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Cliente,
          attributes: ['id', 'nombre', 'numeroDocumento', 'tipoDocumento']
        },
        {
          model: Sucursal,
          attributes: ['id', 'nombre', 'ruc', 'razonSocial']
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'apellido']
        }
      ],
      order: [['fechaVenta', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Formatear datos para el frontend
    const comprobantesFormateados = comprobantes.map(comprobante => ({
      id: comprobante.id,
      fechaEmision: comprobante.fechaVenta,
      tipoComprobante: comprobante.tipoComprobante,
      serie: comprobante.serieComprobante,
      numero: comprobante.numeroComprobante,
      comprobante: `${comprobante.serieComprobante}-${comprobante.numeroComprobante}`,
      cliente: comprobante.Cliente ? comprobante.Cliente.nombre : 'Cliente no especificado',
      clienteDocumento: comprobante.Cliente ? comprobante.Cliente.numeroDocumento : '-',
      rucEmisor: comprobante.Sucursal ? comprobante.Sucursal.ruc : '-',
      razonSocialEmisor: comprobante.Sucursal ? comprobante.Sucursal.razonSocial : '-',
      moneda: comprobante.moneda || 'PEN',
      total: parseFloat(comprobante.total).toFixed(2),
      subtotal: parseFloat(comprobante.subtotal || 0).toFixed(2),
      igv: parseFloat(comprobante.igv || 0).toFixed(2),
      estadoSunat: comprobante.estadoSunat,
      motivoError: comprobante.sunatError || '-',
      fechaCreacion: comprobante.createdAt,
      usuario: comprobante.Usuario ? `${comprobante.Usuario.nombre} ${comprobante.Usuario.apellido}` : 'Usuario no especificado',
      sucursal: comprobante.Sucursal ? comprobante.Sucursal.nombre : 'Sucursal no especificada'
    }));

    // Calcular totales
    const totalPaginas = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: comprobantesFormateados,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPaginas,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPaginas,
        hasPrevPage: parseInt(page) > 1
      },
      resumen: {
        totalComprobantes: count,
        pendientes: comprobantes.filter(c => c.estadoSunat === 'PENDIENTE').length,
        conError: comprobantes.filter(c => c.estadoSunat === 'ERROR').length,
        rechazados: comprobantes.filter(c => c.estadoSunat === 'RECHAZADO').length
      },
      mensaje: count > 0 ? 'Comprobantes no enviados obtenidos exitosamente' : 'No se encontraron comprobantes no enviados'
    });

  } catch (error) {
    console.error('Error al obtener comprobantes no enviados:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error al obtener comprobantes no enviados', 
      error: error.message,
      data: []
    });
  }
};

// Obtener comprobantes pendientes de rectificación
exports.obtenerComprobantesPendientesRectificacion = async (req, res) => {
  try {
    const { 
      sucursalId, 
      fechaInicio, 
      fechaFin, 
      tipoComprobante, 
      serie, 
      numero,
      entorno = 'PRODUCCION',
      page = 1, 
      limit = 10 
    } = req.query;

    // Construir condiciones WHERE
    const whereConditions = {
      // Comprobantes que necesitan rectificación: RECHAZADOS por SUNAT o con errores específicos
      [Op.or]: [
        { estadoSunat: 'RECHAZADO' },
        { 
          estadoSunat: 'ERROR',
          sunatError: {
            [Op.not]: null
          }
        }
      ],
      // Solo comprobantes electrónicos (FACTURA y BOLETA)
      tipoComprobante: {
        [Op.in]: ['FACTURA', 'BOLETA']
      }
    };

    // Filtro por sucursal
    if (sucursalId && sucursalId !== 'todas') {
      whereConditions.sucursalId = sucursalId;
    }

    // Filtro por rango de fechas
    if (fechaInicio && fechaFin) {
      whereConditions.fechaVenta = {
        [Op.between]: [
          new Date(fechaInicio + ' 00:00:00'),
          new Date(fechaFin + ' 23:59:59')
        ]
      };
    } else if (fechaInicio) {
      whereConditions.fechaVenta = {
        [Op.gte]: new Date(fechaInicio + ' 00:00:00')
      };
    } else if (fechaFin) {
      whereConditions.fechaVenta = {
        [Op.lte]: new Date(fechaFin + ' 23:59:59')
      };
    }

    // Filtro por tipo de comprobante
    if (tipoComprobante && tipoComprobante !== 'todos') {
      whereConditions.tipoComprobante = tipoComprobante;
    }

    // Filtro por serie
    if (serie) {
      whereConditions.serieComprobante = {
        [Op.like]: `%${serie}%`
      };
    }

    // Filtro por número
    if (numero) {
      whereConditions.numeroComprobante = {
        [Op.like]: `%${numero}%`
      };
    }

    // Calcular offset para paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Obtener comprobantes pendientes de rectificación
    const { count, rows: comprobantes } = await Venta.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Cliente,
          attributes: ['id', 'nombre', 'numeroDocumento', 'tipoDocumento']
        },
        {
          model: Sucursal,
          attributes: ['id', 'nombre', 'ruc', 'razonSocial']
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'apellido']
        }
      ],
      order: [['fechaVenta', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Formatear datos para el frontend
    const comprobantesFormateados = comprobantes.map(comprobante => ({
      id: comprobante.id,
      entorno: entorno, // Simulado - en producción vendría de configuración
      usuario: comprobante.Usuario ? `${comprobante.Usuario.nombre} ${comprobante.Usuario.apellido}` : 'Usuario no especificado',
      fechaEmision: comprobante.fechaVenta,
      cliente: comprobante.Cliente ? comprobante.Cliente.nombre : 'Cliente no especificado',
      clienteDocumento: comprobante.Cliente ? comprobante.Cliente.numeroDocumento : '-',
      tipoComprobante: comprobante.tipoComprobante,
      serie: comprobante.serieComprobante,
      numero: comprobante.numeroComprobante,
      comprobante: `${comprobante.serieComprobante}-${comprobante.numeroComprobante}`,
      descripcion: comprobante.sunatError || 'Comprobante rechazado por SUNAT',
      estadoSunat: comprobante.estadoSunat,
      motivoError: comprobante.sunatError || 'Error no especificado',
      total: parseFloat(comprobante.total).toFixed(2),
      moneda: comprobante.moneda || 'PEN',
      xmlUrl: comprobante.xmlUrl,
      cdrUrl: comprobante.cdrUrl,
      pdfUrl: comprobante.pdfUrl,
      codigoHash: comprobante.codigoHash,
      fechaCreacion: comprobante.createdAt,
      sucursal: comprobante.Sucursal ? comprobante.Sucursal.nombre : 'Sucursal no especificada',
      rucEmisor: comprobante.Sucursal ? comprobante.Sucursal.ruc : '-'
    }));

    // Calcular totales
    const totalPaginas = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: comprobantesFormateados,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPaginas,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPaginas,
        hasPrevPage: parseInt(page) > 1
      },
      resumen: {
        totalComprobantes: count,
        rechazados: comprobantes.filter(c => c.estadoSunat === 'RECHAZADO').length,
        conError: comprobantes.filter(c => c.estadoSunat === 'ERROR').length,
        facturas: comprobantes.filter(c => c.tipoComprobante === 'FACTURA').length,
        boletas: comprobantes.filter(c => c.tipoComprobante === 'BOLETA').length
      },
      mensaje: count > 0 ? 'Comprobantes pendientes de rectificación obtenidos exitosamente' : 'No se encontraron comprobantes pendientes de rectificación'
    });

  } catch (error) {
    console.error('Error al obtener comprobantes pendientes de rectificación:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error al obtener comprobantes pendientes de rectificación', 
      error: error.message,
      data: []
    });
  }
};