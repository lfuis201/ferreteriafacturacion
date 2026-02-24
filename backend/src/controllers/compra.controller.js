const { Compra, DetalleCompra, Producto, Proveedor, Sucursal, Usuario, Inventario, MovimientoInventario, PagoCompra } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const fs = require('fs');

// Obtener todas las compras

exports.obtenerCompras = async (req, res) => {
  const { sucursalId, estado, fechaInicio } = req.query;
  try {
    // Construir condiciones de búsqueda
    const where = {};
    if (estado) {
      where.estado = estado;
    }
    if (fechaInicio) {
      where.fechaCompra = {
        [Op.gte]: new Date(fechaInicio)
      };
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Si no es SuperAdmin, solo puede ver compras de su sucursal
      if (sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res.status(403).json({ mensaje: 'No tiene permisos para ver compras de otras sucursales' });
      }
      // Filtrar por sucursal del usuario
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      // Si es SuperAdmin y se especifica sucursalId, filtrar por esa sucursal
      where.sucursalId = sucursalId;
    }

    const compras = await Compra.findAll({
      where,
      include: [
        { model: Proveedor, attributes: ['id', 'nombre', 'numeroDocumento'] },
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Usuario, attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fechaCompra', 'DESC']]
    });

    // Generar URLs completas para los PDFs
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const comprasConUrlsCompletas = compras.map(compra => {
      const compraJson = compra.toJSON();
      if (compraJson.pdfGenerado) {
        compraJson.pdfGenerado = `${baseUrl}${compraJson.pdfGenerado}`;
        compraJson.pdfUrl = compraJson.pdfGenerado;
      }
      return compraJson;
    });

    res.json({ compras: comprasConUrlsCompletas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las compras', error: error.message });
  }
};

// Obtener una compra por ID
// Obtener una compra por ID
exports.obtenerCompraPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const compra = await Compra.findOne({
      where: { id },
      include: [
        { model: Proveedor, attributes: ['id', 'nombre', 'numeroDocumento'] },
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Usuario, attributes: ['id', 'nombre', 'apellido'] },
        {
          model: DetalleCompra,
          include: [
            { model: Producto, attributes: ['id', 'nombre', 'codigo', 'unidadMedida'] }
          ]
        },
        {
          model: PagoCompra,
          attributes: ['id', 'formaPago', 'desde', 'referencia', 'glosa', 'monto', 'createdAt']
        }
      ]
    });

    if (!compra) {
      return res.status(404).json({ mensaje: 'Compra no encontrada' });
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && compra.sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({ mensaje: 'No tiene permisos para ver compras de otras sucursales' });
    }

    // Generar URL completa para el PDF
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const compraJson = compra.toJSON();
    if (compraJson.pdfGenerado) {
      compraJson.pdfGenerado = `${baseUrl}${compraJson.pdfGenerado}`;
      compraJson.pdfUrl = compraJson.pdfGenerado;
    }

    res.json({ compra: compraJson });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la compra', error: error.message });
  }
};



// Crear una nueva compra

exports.crearCompra = async (req, res) => {
  const {
    // Campos del frontend con mapeo correcto
    proveedor: proveedorId,
    sucursalId,
    tipoComprobante,
    serie: serieComprobante,
    numero: numeroComprobante,
    fechaEmision: fechaCompra,
    fechaVencimiento,
    moneda,
    tipoCambio,
    ordenCompra,
    observaciones: observacion,
    constDetraccion,
    fechaDetraccion,
    porcentajeDetraccion,
    periodoCompra,
    condicionPago,
    subtotal,
    igv,
    total,
    estado,
    detalles,
    pagos,
    // Campos adicionales que pueden venir del frontend
    proveedorId: proveedorIdDirecto,
    serieComprobante: serieComprobanteDirecto,
    numeroComprobante: numeroComprobanteDirecto,
    fechaCompra: fechaCompraDirecta,
    observacion: observacionDirecta
  } = req.body;

  // Fallbacks y normalización inicial
  const sucursalIdFinal = sucursalId || (req.usuario ? req.usuario.sucursalId : null);

  // Usar los valores mapeados o los directos como fallback
  const proveedorIdFinal = proveedorId || proveedorIdDirecto;
  const serieComprobanteFinal = serieComprobante || serieComprobanteDirecto;
  const numeroComprobanteFinal = numeroComprobante || numeroComprobanteDirecto;
  const fechaCompraFinal = fechaCompra || fechaCompraDirecta;
  const observacionFinal = observacion || observacionDirecta;

  // Validar tipoComprobante antes de iniciar la transacción
  const tiposComprobantePermitidos = [
    'FACTURA ELECTRÓNICA', 
    'BOLETA DE VENTA ELECTRONICA', 
    'NOTA DE CREDITO', 
    'NOTA DE DEBITO', 
    'GUÍA', 
    'NOTA DE VENTA', 
    'RECIBO POR HONORARIOS', 
    'SERVICIOS PÚBLICOS'
  ];

  if (tipoComprobante && !tiposComprobantePermitidos.includes(tipoComprobante)) {
    return res.status(400).json({ 
      mensaje: `Tipo de comprobante inválido. Los tipos permitidos son: ${tiposComprobantePermitidos.join(', ')}`,
      tipoComprobanteRecibido: tipoComprobante,
      tiposPermitidos: tiposComprobantePermitidos
    });
  }

  // Validar estado si se proporciona
  const estadosPermitidos = ['PENDIENTE', 'COMPLETADA', 'ANULADA', 'PROCESADA'];
  if (estado && !estadosPermitidos.includes(estado)) {
    return res.status(400).json({ 
      mensaje: `Estado inválido. Los estados permitidos son: ${estadosPermitidos.join(', ')}`,
      estadoRecibido: estado,
      estadosPermitidos: estadosPermitidos
    });
  }

  // Iniciar transacción
  const t = await sequelize.transaction();
  try {
    // Verificar permisos (solo SuperAdmin, Admin y Almacenero pueden crear compras)
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Almacenero') {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para crear compras' });
    }

    // Si no es SuperAdmin, solo puede crear compras para su sucursal
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.sucursalId !== parseInt(sucursalIdFinal)) {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para crear compras para otras sucursales' });
    }

    // Verificar si el proveedor existe
    const proveedorExiste = await Proveedor.findOne({
      where: { id: proveedorIdFinal, estado: true },
      transaction: t
    });
    if (!proveedorExiste) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'El proveedor seleccionado no existe o está inactivo' });
    }

    // Verificar si la sucursal existe
    const sucursalExiste = await Sucursal.findOne({
      where: { id: sucursalIdFinal, estado: true },
      transaction: t
    });
    if (!sucursalExiste) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'La sucursal seleccionada no existe o está inactiva' });
    }

    // Verificar si ya existe una compra con el mismo comprobante para este proveedor
    if (tipoComprobante && serieComprobanteFinal && numeroComprobanteFinal) {
      const compraExistente = await Compra.findOne({
        where: {
          proveedorId: proveedorIdFinal,
          tipoComprobante,
          serieComprobante: serieComprobanteFinal,
          numeroComprobante: numeroComprobanteFinal
        },
        transaction: t
      });
      if (compraExistente) {
        await t.rollback();
        return res.status(400).json({ mensaje: 'Ya existe una compra con ese comprobante para este proveedor' });
      }
    }

    // Verificar que haya detalles
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'Debe incluir al menos un detalle en la compra' });
    }

    // Normalizar y validar detalles para evitar NaN
    const detallesNormalizados = [];
    for (let i = 0; i < detalles.length; i++) {
      const d = detalles[i];
      const linea = i + 1;
      if (!d.productoId) {
        await t.rollback();
        return res.status(400).json({ mensaje: `Línea ${linea}: productoId es requerido` });
      }
      const cantidadNum = parseFloat(d.cantidad);
      const precioNum = parseFloat(d.precioUnitario ?? d.precio ?? 0);
      if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) {
        await t.rollback();
        return res.status(400).json({ mensaje: `Línea ${linea}: cantidad inválida` });
      }
      if (!Number.isFinite(precioNum) || precioNum <= 0) {
        await t.rollback();
        return res.status(400).json({ mensaje: `Línea ${linea}: precioUnitario inválido` });
      }
      const subtotalNum = d.subtotal !== undefined && Number.isFinite(parseFloat(d.subtotal))
        ? parseFloat(d.subtotal)
        : parseFloat((cantidadNum * precioNum).toFixed(2));
      detallesNormalizados.push({
        productoId: d.productoId,
        cantidad: cantidadNum,
        precioUnitario: precioNum,
        subtotal: subtotalNum
      });
    }

    // Calcular totales si no vienen o son NaN
    const subtotalCalc = detallesNormalizados.reduce((s, d) => s + (d.cantidad * d.precioUnitario), 0);
    const igvCalc = parseFloat((subtotalCalc * 0.18).toFixed(2));
    const totalCalc = parseFloat((subtotalCalc + igvCalc).toFixed(2));
    const subtotalFinal = Number.isFinite(parseFloat(subtotal)) ? parseFloat(subtotal) : parseFloat(subtotalCalc.toFixed(2));
    const igvFinal = Number.isFinite(parseFloat(igv)) ? parseFloat(igv) : igvCalc;
    const totalFinal = Number.isFinite(parseFloat(total)) ? parseFloat(total) : totalCalc;

    // Crear la compra
    const nuevaCompra = await Compra.create({
      proveedorId: proveedorIdFinal,
      sucursalId: sucursalIdFinal,
      usuarioId: req.usuario.id,
      tipoComprobante,
      serieComprobante: serieComprobanteFinal,
      numeroComprobante: numeroComprobanteFinal,
      fechaCompra: fechaCompraFinal || new Date(),
      fechaVencimiento,
      moneda,
      tipoCambio,
      ordenCompra,
      constDetraccion,
      fechaDetraccion,
      porcentajeDetraccion,
      periodoCompra,
      condicionPago,
      subtotal: subtotalFinal,
      igv: igvFinal,
      total: totalFinal,
      estado: estado || 'PENDIENTE', // Por defecto, las compras se crean como pendientes
      observacion: observacionFinal
    }, { transaction: t });

    // Crear los detalles de la compra y actualizar inventario
    for (const detalle of detallesNormalizados) {
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

      // Crear el detalle de compra
      try {
        await DetalleCompra.create({
          compraId: nuevaCompra.id,
          productoId,
          cantidad,
          precioUnitario,
          subtotal: subtotalDetalle
        }, { transaction: t });
      } catch (detalleError) {
        await t.rollback();
        return res.status(500).json({
          mensaje: 'Error al crear el detalle de la compra',
          error: detalleError.message
        });
      }

      // Actualizar el inventario
      const cantidadReal = cantidad;
      let inventario = await Inventario.findOne({
        where: { productoId, sucursalId: sucursalIdFinal },
        transaction: t
      });
      if (!inventario) {
        // Si no existe el inventario, crearlo
        inventario = await Inventario.create({
          productoId,
          sucursalId: sucursalIdFinal,
          stock: cantidadReal,
          stockMinimo: 0,
          precioVenta: producto.precioVenta
        }, { transaction: t });
      } else {
        // Si existe, actualizar el stock
        await inventario.update({
          stock: inventario.stock + cantidadReal
        }, { transaction: t });
      }

      // Registrar el movimiento de inventario
      try {
        await MovimientoInventario.create({
          productoId,
          sucursalOrigenId: sucursalIdFinal,
          sucursalDestinoId: sucursalIdFinal,
          tipoMovimiento: 'ENTRADA',
          cantidad: cantidadReal,
          precioUnitario,
          documentoRelacionadoTipo: 'COMPRA',
          documentoRelacionadoId: nuevaCompra.id,
          usuarioId: req.usuario.id,
          observacion: `Entrada por compra #${nuevaCompra.id}`,
          autorizado: true,
          autorizadoPorId: req.usuario.id
        }, { transaction: t });
      } catch (movimientoError) {
        await t.rollback();
        return res.status(500).json({
          mensaje: 'Error al registrar el movimiento de inventario',
          error: movimientoError.message
        });
      }
    }

    // Procesar pagos si existen
    if (pagos && Array.isArray(pagos) && pagos.length > 0) {
      try {
        for (const pago of pagos) {
          await PagoCompra.create({
            compraId: nuevaCompra.id,
            formaPago: pago.formaPago || 'Efectivo',
            desde: pago.desde || '',
            referencia: pago.referencia || '',
            glosa: pago.glosa || '',
            monto: parseFloat(pago.monto) || 0
          }, { transaction: t });
        }
      } catch (pagoError) {
        await t.rollback();
        return res.status(500).json({
          mensaje: 'Error al procesar los pagos',
          error: pagoError.message
        });
      }
    }

    // Confirmar transacción
    await t.commit();
    res.status(201).json({
      mensaje: 'Compra creada exitosamente',
      compra: nuevaCompra
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al crear la compra', error: error.message });
  }
};


// Crear Orden de Compra (wrapper para aceptar directamente los campos del formulario)
// Este endpoint mapea los campos del formulario de OrdenesCompra.jsx y delega en crearCompra
exports.crearOrdenCompra = async (req, res) => {
  try {
    const {
      proveedor,
      proveedorId,
      sucursalId,
      tipoComprobante,
      serie,
      numero,
      fechaEmision,
      fechaVencimiento,
      moneda,
      tipoCambio,
      observacion,
      productos,
      detalles: detallesEntrada
    } = req.body || {};

    // Tomar detalles enviados directamente si existen; si no, normalizar desde productos del formulario
    const fuenteDetalles = (Array.isArray(detallesEntrada) && detallesEntrada.length > 0)
      ? detallesEntrada
      : (productos || []);

    const detalles = fuenteDetalles.map((p) => {
      const cantidad = parseFloat(p.cantidad);
      const precioUnitario = parseFloat(p.precio ?? p.precioUnitario);
      const subtotal = (isNaN(cantidad) ? 0 : cantidad) * (isNaN(precioUnitario) ? 0 : precioUnitario);
      return {
        productoId: p.productoId ?? p.Producto?.id ?? null,
        cantidad: isNaN(cantidad) ? 0 : cantidad,
        precioUnitario: isNaN(precioUnitario) ? 0 : precioUnitario,
        subtotal: isNaN(subtotal) ? 0 : subtotal
      };
    }).filter(d => d.productoId);

    // Recalcular totales si no vienen
    const subtotalCalc = detalles.reduce((sum, d) => sum + (isNaN(d.subtotal) ? 0 : d.subtotal), 0);
    const igvCalc = Math.round(subtotalCalc * 0.18 * 100) / 100;
    const totalCalc = Math.round((subtotalCalc + igvCalc) * 100) / 100;

    // Construir el cuerpo esperado por crearCompra
    req.body = {
      proveedorId: proveedorId ?? proveedor ?? null,
      sucursalId: sucursalId ?? (req.usuario ? req.usuario.sucursalId : undefined),
      tipoComprobante,
      serieComprobante: serie,
      numeroComprobante: numero,
      fechaCompra: fechaEmision,
      fechaVencimiento,
      moneda,
      tipoCambio,
      observaciones: observacion,
      detalles,
      subtotal: subtotalCalc,
      igv: igvCalc,
      total: totalCalc
    };

    return exports.crearCompra(req, res);
  } catch (error) {
    console.error('Error preparando Orden de Compra', error);
    return res.status(500).json({
      mensaje: 'Error interno al preparar la orden de compra',
      error: error.message
    });
  }
};




















// Anular una compra
exports.anularCompra = async (req, res) => {
  const { id } = req.params;
  const { observacion } = req.body;

  // Iniciar transacción
  const t = await sequelize.transaction();
  try {
    // Verificar permisos (solo SuperAdmin y Admin pueden anular compras)
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin') {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para anular compras' });
    }

    // Verificar si la compra existe
    const compra = await Compra.findOne({
      where: { id },
      include: [{ model: DetalleCompra }],
      transaction: t
    });

    if (!compra) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Compra no encontrada' });
    }

    // Verificar si la compra ya está anulada
    if (compra.estado === 'ANULADA') {
      await t.rollback();
      return res.status(400).json({ mensaje: 'La compra ya está anulada' });
    }

    // Si no es SuperAdmin, solo puede anular compras de su sucursal
    if (req.usuario.rol !== 'SuperAdmin' && compra.sucursalId !== req.usuario.sucursalId) {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para anular compras de otras sucursales' });
    }

    // Revertir el inventario para cada detalle
    for (const detalle of compra.DetalleCompras) {
      // Calcular la cantidad real (sin considerar la presentación)
      const cantidadReal = detalle.cantidad;

      // Actualizar el inventario
      const inventario = await Inventario.findOne({
        where: { productoId: detalle.productoId, sucursalId: compra.sucursalId },
        transaction: t
      });

      if (inventario) {
        // Verificar que haya suficiente stock para anular
        if (inventario.stock < cantidadReal) {
          await t.rollback();
          return res.status(400).json({
            mensaje: `No hay suficiente stock para anular la compra. Producto ID: ${detalle.productoId}`
          });
        }

        // Actualizar el stock
        await inventario.update({
          stock: inventario.stock - cantidadReal
        }, { transaction: t });

        // Registrar el movimiento de inventario
        await MovimientoInventario.create({
          productoId: detalle.productoId,
          sucursalOrigenId: compra.sucursalId,
          sucursalDestinoId: null,
          tipoMovimiento: 'SALIDA',
          cantidad: cantidadReal,
          precioUnitario: detalle.precioUnitario,
          documentoRelacionadoTipo: 'ANULACION_COMPRA',
          documentoRelacionadoId: compra.id,
          usuarioId: req.usuario.id,
          observacion: `Salida por anulación de compra #${compra.id}`,
          autorizado: true,
          autorizadoPorId: req.usuario.id
        }, { transaction: t });
      }
    }

    // Anular la compra
    await compra.update({
      estado: 'ANULADA',
      observacion: observacion || 'Compra anulada'
    }, { transaction: t });

    // Confirmar transacción
    await t.commit();
    res.json({
      mensaje: 'Compra anulada exitosamente',
      compra
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al anular la compra', error: error.message });
  }
};

// Subir archivo XML de compra
// Función auxiliar para buscar o crear proveedor
const buscarOCrearProveedor = async (datosProveedor, transaction) => {
  if (!datosProveedor.ruc) {
    throw new Error('Número de documento del proveedor es requerido');
  }

  let proveedor = await Proveedor.findOne({
    where: { numeroDocumento: datosProveedor.ruc },
    transaction
  });

  if (!proveedor) {
    // Crear objeto de datos del proveedor sin campos null que tienen validación
    const datosCreacion = {
      numeroDocumento: datosProveedor.ruc,
      tipoDocumento: 'RUC', // Asumimos que es RUC desde XML
      nombre: datosProveedor.razonSocial || 'Proveedor desde XML'
      // estado omitido para usar valor por defecto
    };
    
    // Solo agregar campos opcionales si tienen valores válidos
    if (datosProveedor.direccion) {
      datosCreacion.direccion = datosProveedor.direccion;
    }
    
    proveedor = await Proveedor.create(datosCreacion, { transaction });
  }

  return proveedor;
};

exports.uploadXmlAuto = async (req, res) => {
  const xmlFile = req.file;

  const t = await sequelize.transaction();
  try {
    // Verificar permisos
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Almacenero') {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para subir archivos XML' });
    }

    // Verificar que se subió un archivo
    if (!xmlFile) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'Debe subir un archivo XML' });
    }

    // Verificar que el archivo es XML
    if (!xmlFile.originalname.toLowerCase().endsWith('.xml')) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'El archivo debe ser de tipo XML' });
    }

    // Usar datos del middleware de validación
    const xmlContent = req.xmlData.content;
    const xmlParsed = req.xmlData.parsed;

    // Procesar XML para extraer datos
    const xmlProcessingService = require('../services/xmlProcessingService');
    const datosComprobante = xmlProcessingService.extraerDatosComprobante(xmlParsed);

    // Buscar o crear proveedor
    const proveedor = await buscarOCrearProveedor(datosComprobante.proveedor, t);

    // Determinar sucursal (usar la del usuario o sucursal por defecto)
    const sucursalId = req.usuario.sucursalId || 1;

    // Calcular totales si no están disponibles en el XML
    const totalXml = datosComprobante.totales?.total || 0;
    const subtotalCalculado = datosComprobante.totales?.subtotal || (totalXml / 1.18);
    const igvCalculado = datosComprobante.totales?.igv || (subtotalCalculado * 0.18);
    const totalCalculado = datosComprobante.totales?.total || (subtotalCalculado + igvCalculado);

    // Crear la compra automáticamente
    const nuevaCompra = await Compra.create({
      numeroComprobante: datosComprobante.numero || `AUTO-${Date.now()}`,
      fechaCompra: datosComprobante.fecha || new Date(),
      proveedorId: proveedor.id,
      sucursalId: sucursalId,
      usuarioId: req.usuario.id,
      tipoComprobante: datosComprobante.tipoComprobante || 'FACTURA',
      subtotal: parseFloat(subtotalCalculado),
      igv: parseFloat(igvCalculado),
      total: parseFloat(totalCalculado),
      estado: 'PENDIENTE',
      observacion: 'Compra creada automáticamente desde XML',
      xmlOriginal: xmlContent
    }, { transaction: t });

    // Crear detalles de compra si hay items
    if (datosComprobante.items && datosComprobante.items.length > 0) {
      for (const item of datosComprobante.items) {
        // Buscar o crear producto automáticamente
        let producto = await Producto.findOne({
          where: {
            [Op.or]: [
              { codigo: item.codigo },
              { nombre: { [Op.like]: `%${item.descripcion}%` } }
            ]
          },
          transaction: t
        });

        if (!producto) {
           // Crear producto automáticamente
            producto = await Producto.create({
                codigo: item.codigo || `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                nombre: item.descripcion || 'Producto desde XML',
                descripcion: item.descripcion || 'Producto creado automáticamente desde XML',
                precioCompra: parseFloat(item.precioUnitario || 0),
                precioVenta: parseFloat((item.precioUnitario || 0) * 1.3), // Margen del 30%
                unidadMedida: 'unidad',
                categoriaId: 1, // Categoría por defecto
                iscActivo: 0,
                sujetoDetraccion: 0
                // estado omitido para usar valor por defecto
              }, { transaction: t });
         }

        await DetalleCompra.create({
          compraId: nuevaCompra.id,
          productoId: producto.id,
          cantidad: item.cantidad || 1,
          precioUnitario: item.precioUnitario || 0,
          subtotal: (item.cantidad || 1) * (item.precioUnitario || 0),
          descripcion: item.descripcion || 'Producto desde XML'
        }, { transaction: t });
      }
    }

    // Procesar XML usando el servicio especializado
    const resultadoProcesamiento = await xmlProcessingService.procesarXmlCompra(
      xmlContent, 
      nuevaCompra.id, 
      sucursalId, 
      req.usuario.id,
      t
    );

    if (!resultadoProcesamiento.exito) {
      await t.rollback();
      return res.status(400).json({ 
        mensaje: 'Error procesando XML con SUNAT', 
        error: resultadoProcesamiento.error,
        codigo: resultadoProcesamiento.codigo
      });
    }

    // Actualizar compra con CDR y ruta del PDF
    await nuevaCompra.update({
      cdrRespuesta: resultadoProcesamiento.cdr,
      pdfGenerado: resultadoProcesamiento.pdfPath,
      estado: 'PROCESADA'
    }, { transaction: t });

    // Limpiar archivo temporal
    fs.unlinkSync(xmlFile.path);

    await t.commit();

    // Obtener compra actualizada
    const compraActualizada = await Compra.findByPk(nuevaCompra.id, {
      include: [
        { model: Proveedor, attributes: ['id', 'nombre', 'numeroDocumento'] },
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Usuario, attributes: ['id', 'nombre', 'apellido'] }
      ]
    });

    // Generar URL completa para el PDF
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const pdfUrlCompleta = resultadoProcesamiento.pdfPath ? `${baseUrl}${resultadoProcesamiento.pdfPath}` : null;

    // Actualizar el objeto compra con la URL completa
    const compraConUrlCompleta = {
      ...compraActualizada.toJSON(),
      pdfGenerado: pdfUrlCompleta,
      pdfUrl: pdfUrlCompleta
    };

    res.json({
      mensaje: 'Compra creada y XML procesado exitosamente',
      compra: compraConUrlCompleta,
      procesamiento: {
        estadoSunat: resultadoProcesamiento.estadoSunat,
        observacion: resultadoProcesamiento.observaciones,
        datosComprobante: resultadoProcesamiento.datosComprobante
      },
      inventario: resultadoProcesamiento.inventario,
      pdfUrl: pdfUrlCompleta
    });
  } catch (error) {
    await t.rollback();
    // Limpiar archivo temporal en caso de error
    if (xmlFile && xmlFile.path) {
      const fs = require('fs');
      try {
        fs.unlinkSync(xmlFile.path);
      } catch (cleanupError) {
        console.error('Error al limpiar archivo temporal:', cleanupError);
      }
    }
    res.status(500).json({ mensaje: 'Error al procesar XML', error: error.message });
  }
};

exports.uploadXml = async (req, res) => {
  const { compraId } = req.body;
  const xmlFile = req.file;

  const t = await sequelize.transaction();
  try {
    // Verificar permisos
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Almacenero') {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para subir archivos XML' });
    }

    // Verificar que se subió un archivo
    if (!xmlFile) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'Debe subir un archivo XML' });
    }

    // Verificar que el archivo es XML
    if (!xmlFile.originalname.toLowerCase().endsWith('.xml')) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'El archivo debe ser de tipo XML' });
    }

    // Verificar que la compra existe
    const compra = await Compra.findByPk(compraId, { transaction: t });
    if (!compra) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Compra no encontrada' });
    }

    // Verificar permisos de sucursal
    if (req.usuario.rol !== 'SuperAdmin' && compra.sucursalId !== req.usuario.sucursalId) {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para modificar compras de otras sucursales' });
    }

    // Usar datos del middleware de validación
    const xmlContent = req.xmlData.content;
    const xmlParsed = req.xmlData.parsed;

    // Actualizar la compra con el XML original
    await compra.update({
      xmlOriginal: xmlContent
    }, { transaction: t });

    // Procesar XML usando el servicio especializado
    const xmlProcessingService = require('../services/xmlProcessingService');
    const resultadoProcesamiento = await xmlProcessingService.procesarXmlCompra(
      xmlContent, 
      compraId, 
      compra.sucursalId, 
      req.usuario.id
    );

    if (!resultadoProcesamiento.exito) {
      await t.rollback();
      return res.status(400).json({ 
        mensaje: 'Error procesando XML con SUNAT', 
        error: resultadoProcesamiento.error,
        codigo: resultadoProcesamiento.codigo
      });
    }

    // Actualizar compra con CDR y ruta del PDF
    await compra.update({
      cdrRespuesta: resultadoProcesamiento.cdr,
      pdfGenerado: resultadoProcesamiento.pdfPath
    }, { transaction: t });

    // Limpiar archivo temporal
    fs.unlinkSync(xmlFile.path);

    await t.commit();

    // Obtener compra actualizada
    const compraActualizada = await Compra.findByPk(compraId, {
      include: [
        { model: Proveedor, attributes: ['id', 'nombre', 'numeroDocumento'] },
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Usuario, attributes: ['id', 'nombre', 'apellido'] }
      ]
    });

    // Generar URL completa para el PDF
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const pdfUrlCompleta = resultadoProcesamiento.pdfPath ? `${baseUrl}${resultadoProcesamiento.pdfPath}` : null;

    // Actualizar el objeto compra con la URL completa
    const compraConUrlCompleta = {
      ...compraActualizada.toJSON(),
      pdfGenerado: pdfUrlCompleta,
      pdfUrl: pdfUrlCompleta
    };

    res.json({
      mensaje: 'XML procesado exitosamente',
      compra: compraConUrlCompleta,
      procesamiento: {
        estadoSunat: resultadoProcesamiento.estadoSunat,
        observacion: resultadoProcesamiento.observaciones,
        datosComprobante: resultadoProcesamiento.datosComprobante
      },
      inventario: resultadoProcesamiento.inventario,
      pdfUrl: pdfUrlCompleta
    });
  } catch (error) {
    await t.rollback();
    // Limpiar archivo temporal en caso de error
    if (xmlFile && xmlFile.path) {
      const fs = require('fs');
      try {
        fs.unlinkSync(xmlFile.path);
      } catch (cleanupError) {
        console.error('Error al limpiar archivo temporal:', cleanupError);
      }
    }
    res.status(500).json({ mensaje: 'Error al procesar XML', error: error.message });
  }
};

// Descargar PDF de compra
exports.descargarPdf = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verificar que la compra existe
    const compra = await Compra.findByPk(id);
    if (!compra) {
      return res.status(404).json({ mensaje: 'Compra no encontrada' });
    }

    // Verificar permisos de sucursal
    if (req.usuario.rol !== 'SuperAdmin' && compra.sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({ mensaje: 'No tiene permisos para acceder a compras de otras sucursales' });
    }

    // Verificar que existe el PDF
    if (!compra.pdfGenerado) {
      return res.status(404).json({ mensaje: 'PDF no disponible para esta compra' });
    }

    const path = require('path');
    const fs = require('fs');
    const pdfPath = path.join(__dirname, '..', '..', compra.pdfGenerado);

    // Verificar que el archivo existe
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ mensaje: 'Archivo PDF no encontrado en el servidor' });
    }

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="compra-${id}.pdf"`);
    
    // Enviar archivo
    res.sendFile(pdfPath);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al descargar PDF', error: error.message });
  }
};

// Actualizar compra
exports.actualizarCompra = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();

  try {
    // Verificar que la compra existe
    const compra = await Compra.findByPk(id, {
      include: [
        { model: DetalleCompra, include: [Producto] },
        { model: PagoCompra }
      ]
    });

    if (!compra) {
      await transaction.rollback();
      return res.status(404).json({ mensaje: 'Compra no encontrada' });
    }

    // Verificar que la compra no esté anulada
    if (compra.estado === 'ANULADA') {
      await transaction.rollback();
      return res.status(400).json({ mensaje: 'No se puede actualizar una compra anulada' });
    }

    // Verificar permisos de sucursal
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      if (compra.sucursalId !== req.usuario.sucursalId) {
        await transaction.rollback();
        return res.status(403).json({ mensaje: 'No tiene permisos para actualizar compras de otras sucursales' });
      }
    }

    const {
      tipoComprobante,
      serie,
      numeroComprobante,
      fechaCompra,
      fechaVencimiento,
      proveedorId,
      moneda,
      tipoCambio,
      constDetraccion,
      fechaDetraccion,
      porcentajeDetraccion,
      condicionPago,
      clienteId,
      detalles,
      pagos
    } = req.body;

    // Actualizar datos básicos de la compra
    await compra.update({
      tipoComprobante: tipoComprobante || compra.tipoComprobante,
      serie: serie || compra.serie,
      numeroComprobante: numeroComprobante || compra.numeroComprobante,
      fechaCompra: fechaCompra || compra.fechaCompra,
      fechaVencimiento: fechaVencimiento || compra.fechaVencimiento,
      proveedorId: proveedorId || compra.proveedorId,
      moneda: moneda || compra.moneda,
      tipoCambio: tipoCambio || compra.tipoCambio,
      constDetraccion: constDetraccion || compra.constDetraccion,
      fechaDetraccion: fechaDetraccion || compra.fechaDetraccion,
      porcentajeDetraccion: porcentajeDetraccion || compra.porcentajeDetraccion,
      condicionPago: condicionPago || compra.condicionPago,
      clienteId: clienteId || compra.clienteId
    }, { transaction });

    // Si se proporcionan detalles, actualizar los productos
    if (detalles && Array.isArray(detalles)) {
      // Eliminar detalles existentes
      await DetalleCompra.destroy({
        where: { compraId: id },
        transaction
      });

      // Crear nuevos detalles
      let subtotal = 0;
      for (const detalle of detalles) {
        const detalleCreado = await DetalleCompra.create({
          compraId: id,
          productoId: detalle.productoId,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          subtotal: detalle.cantidad * detalle.precioUnitario
        }, { transaction });

        subtotal += detalleCreado.subtotal;
      }

      // Calcular totales
      const igv = subtotal * 0.18;
      const total = subtotal + igv;

      // Actualizar totales en la compra
      await compra.update({
        subtotal,
        igv,
        total
      }, { transaction });
    }

    // Si se proporcionan pagos, actualizar los pagos
    if (pagos && Array.isArray(pagos)) {
      // Eliminar pagos existentes
      await PagoCompra.destroy({
        where: { compraId: id },
        transaction
      });

      // Crear nuevos pagos
      for (const pago of pagos) {
        await PagoCompra.create({
          compraId: id,
          formaPago: pago.formaPago,
          monto: pago.monto,
          referencia: pago.referencia || '',
          glosa: pago.glosa || ''
        }, { transaction });
      }
    }

    await transaction.commit();

    // Obtener la compra actualizada con todas las relaciones
    const compraActualizada = await Compra.findByPk(id, {
      include: [
        { model: Proveedor, attributes: ['id', 'nombre', 'numeroDocumento'] },
        { model: DetalleCompra, include: [{ model: Producto, attributes: ['id', 'nombre', 'unidadMedida'] }] },
        { model: PagoCompra },
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Usuario, attributes: ['id', 'nombre', 'apellido'] }
      ]
    });

    res.json({
      mensaje: 'Compra actualizada exitosamente',
      compra: compraActualizada
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar compra:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor al actualizar la compra',
      error: error.message 
    });
  }
};

// Eliminar compra
exports.eliminarCompra = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();

  try {
    // Verificar que la compra existe
    const compra = await Compra.findByPk(id);
    if (!compra) {
      await transaction.rollback();
      return res.status(404).json({ mensaje: 'Compra no encontrada' });
    }

    // Verificar permisos de sucursal
    if (req.usuario.rol !== 'SuperAdmin' && compra.sucursalId !== req.usuario.sucursalId) {
      await transaction.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para eliminar compras de otras sucursales' });
    }

    // Verificar que la compra no esté en estado COMPLETADA
    if (compra.estado === 'COMPLETADA') {
      await transaction.rollback();
      return res.status(400).json({ mensaje: 'No se puede eliminar una compra completada' });
    }

    // Obtener los detalles de la compra para revertir el inventario si es necesario
    const detalles = await DetalleCompra.findAll({
      where: { compraId: id },
      include: [{ model: Producto }]
    });

    // Si la compra tenía productos en inventario, revertir los movimientos
    for (const detalle of detalles) {
      if (detalle.Producto) {
        // Buscar el inventario del producto en la sucursal
        const inventario = await Inventario.findOne({
          where: {
            productoId: detalle.productoId,
            sucursalId: compra.sucursalId
          }
        });

        if (inventario) {
          // Restar la cantidad del inventario
          await inventario.update({
            stock: inventario.stock - detalle.cantidad
          }, { transaction });

          // Crear movimiento de inventario para registrar la eliminación
          await MovimientoInventario.create({
            productoId: detalle.productoId,
            sucursalOrigenId: compra.sucursalId,
            tipoMovimiento: 'SALIDA',
            cantidad: detalle.cantidad,
            usuarioId: req.usuario.id,
            documentoRelacionadoTipo: 'COMPRA',
            documentoRelacionadoId: compra.id,
            observacion: `Eliminación de compra ${compra.numeroComprobante || 'sin número'}`,
            fechaRegistro: new Date()
          }, { transaction });
        }
      }
    }

    // Eliminar los pagos asociados
    await PagoCompra.destroy({
      where: { compraId: id },
      transaction
    });

    // Eliminar los detalles de la compra
    await DetalleCompra.destroy({
      where: { compraId: id },
      transaction
    });

    // Eliminar el archivo PDF si existe
    if (compra.pdfGenerado) {
      const pdfPath = compra.pdfGenerado.replace('/uploads/', './uploads/');
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    // Eliminar la compra
    await compra.destroy({ transaction });

    await transaction.commit();

    res.json({
      mensaje: 'Compra eliminada exitosamente'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar compra:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor al eliminar la compra',
      error: error.message 
    });
  }
};

// Obtener reporte de compras totales
exports.obtenerReporteComprasTotales = async (req, res) => {
  try {
    const { sucursalId, estado, fechaInicio, fechaFin, proveedorId } = req.query;

    // Construir condiciones de búsqueda
    const where = {};
    
    if (estado) {
      where.estado = estado;
    }
    
    if (fechaInicio && fechaFin) {
      where.fechaCompra = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
      };
    } else if (fechaInicio) {
      where.fechaCompra = {
        [Op.gte]: new Date(fechaInicio)
      };
    } else if (fechaFin) {
      where.fechaCompra = {
        [Op.lte]: new Date(fechaFin)
      };
    }

    if (proveedorId) {
      where.proveedorId = proveedorId;
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Si no es SuperAdmin, solo puede ver compras de su sucursal
      if (sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res.status(403).json({ mensaje: 'No tiene permisos para ver compras de otras sucursales' });
      }
      // Filtrar por sucursal del usuario
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      // Si es SuperAdmin y se especifica sucursalId, filtrar por esa sucursal
      where.sucursalId = sucursalId;
    }

    // Obtener compras con relaciones
    const compras = await Compra.findAll({
      where,
      include: [
        { 
          model: Proveedor, 
          attributes: ['id', 'nombre', 'numeroDocumento'] 
        },
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre'] 
        },
        { 
          model: Usuario, 
          attributes: ['id', 'nombre', 'apellido'] 
        }
      ],
      order: [['fechaCompra', 'DESC']]
    });

    // Calcular estadísticas
    const totalCompras = compras.length;
    const montoTotal = compras.reduce((sum, compra) => sum + parseFloat(compra.total || 0), 0);
    const promedioPorCompra = totalCompras > 0 ? montoTotal / totalCompras : 0;

    // Agrupar por estado
    const comprasPorEstado = compras.reduce((acc, compra) => {
      const estado = compra.estado || 'SIN_ESTADO';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    // Agrupar por proveedor
    const comprasPorProveedor = compras.reduce((acc, compra) => {
      const proveedorNombre = compra.Proveedor?.nombre || 'Sin proveedor';
      if (!acc[proveedorNombre]) {
        acc[proveedorNombre] = {
          cantidad: 0,
          monto: 0
        };
      }
      acc[proveedorNombre].cantidad += 1;
      acc[proveedorNombre].monto += parseFloat(compra.total || 0);
      return acc;
    }, {});

    // Generar URLs completas para los PDFs
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const comprasConUrlsCompletas = compras.map(compra => {
      const compraJson = compra.toJSON();
      if (compraJson.pdfGenerado) {
        compraJson.pdfGenerado = `${baseUrl}${compraJson.pdfGenerado}`;
        compraJson.pdfUrl = compraJson.pdfGenerado;
      }
      return compraJson;
    });

    res.json({
      compras: comprasConUrlsCompletas,
      estadisticas: {
        totalCompras,
        montoTotal: parseFloat(montoTotal.toFixed(2)),
        promedioPorCompra: parseFloat(promedioPorCompra.toFixed(2)),
        comprasPorEstado,
        comprasPorProveedor
      }
    });

  } catch (error) {
    console.error('Error al obtener reporte de compras totales:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener el reporte de compras totales', 
      error: error.message 
    });
  }
};






// Exportar compras a Excel
exports.exportarComprasExcel = async (req, res) => {
  try {
    const XLSX = require('xlsx');
    const { sucursalId, estado, fechaInicio, fechaFin, proveedorId } = req.query;

    // Construir condiciones de búsqueda
    const where = {};
    if (estado) {
      where.estado = estado;
    }
    if (fechaInicio && fechaFin) {
      where.fechaCompra = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
      };
    } else if (fechaInicio) {
      where.fechaCompra = {
        [Op.gte]: new Date(fechaInicio)
      };
    } else if (fechaFin) {
      where.fechaCompra = {
        [Op.lte]: new Date(fechaFin)
      };
    }
    if (proveedorId) {
      where.proveedorId = proveedorId;
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Si no es SuperAdmin, solo puede exportar compras de su sucursal
      if (sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res.status(403).json({ 
          mensaje: 'No tiene permisos para exportar compras de otras sucursales' 
        });
      }
      // Filtrar por sucursal del usuario
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      // Si es SuperAdmin y se especifica sucursalId, filtrar por esa sucursal
      where.sucursalId = sucursalId;
    }

    const compras = await Compra.findAll({
      where,
      include: [
        { model: Proveedor, attributes: ['id', 'nombre', 'numeroDocumento'] },
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Usuario, attributes: ['id', 'nombre', 'apellido'] },
        {
          model: DetalleCompra,
          include: [
            { model: Producto, attributes: ['id', 'nombre', 'codigo'] }
          ]
        }
      ],
      order: [['fechaCompra', 'DESC']]
    });

    // Preparar datos para Excel
    const datosExcel = [];
    
    compras.forEach(compra => {
      const fechaCompra = compra.fechaCompra ? new Date(compra.fechaCompra).toLocaleDateString('es-PE') : 'N/A';
      const proveedor = compra.Proveedor?.nombre || 'Sin proveedor';
      const sucursal = compra.Sucursal?.nombre || 'Sin sucursal';
      const usuario = compra.Usuario ? `${compra.Usuario.nombre} ${compra.Usuario.apellido}` : 'Sin usuario';

      if (compra.DetalleCompras && compra.DetalleCompras.length > 0) {
        compra.DetalleCompras.forEach(detalle => {
          datosExcel.push({
            'ID Compra': compra.id,
            'Fecha': fechaCompra,
            'Proveedor': proveedor,
            'RUC/DNI': compra.Proveedor?.numeroDocumento || 'N/A',
            'Sucursal': sucursal,
            'Tipo Comprobante': compra.tipoComprobante || 'N/A',
            'Serie': compra.serieComprobante || 'N/A',
            'Número': compra.numeroComprobante || 'N/A',
            'Estado': compra.estado,
            'Producto': detalle.Producto?.nombre || 'Sin producto',
            'Código Producto': detalle.Producto?.codigo || 'N/A',
            'Cantidad': detalle.cantidad,
            'Precio Unitario': parseFloat(detalle.precioUnitario || 0).toFixed(2),
            'Subtotal Detalle': parseFloat(detalle.subtotal || 0).toFixed(2),
            'Subtotal Compra': parseFloat(compra.subtotal || 0).toFixed(2),
            'IGV': parseFloat(compra.igv || 0).toFixed(2),
            'Total Compra': parseFloat(compra.total || 0).toFixed(2),
            'Usuario': usuario,
            'Observación': compra.observacion || 'N/A'
          });
        });
      } else {
        // Si no hay detalles, agregar solo la información de la compra
        datosExcel.push({
          'ID Compra': compra.id,
          'Fecha': fechaCompra,
          'Proveedor': proveedor,
          'RUC/DNI': compra.Proveedor?.numeroDocumento || 'N/A',
          'Sucursal': sucursal,
          'Tipo Comprobante': compra.tipoComprobante || 'N/A',
          'Serie': compra.serieComprobante || 'N/A',
          'Número': compra.numeroComprobante || 'N/A',
          'Estado': compra.estado,
          'Producto': 'Sin productos',
          'Código Producto': 'N/A',
          'Cantidad': 0,
          'Precio Unitario': '0.00',
          'Subtotal Detalle': '0.00',
          'Subtotal Compra': parseFloat(compra.subtotal || 0).toFixed(2),
          'IGV': parseFloat(compra.igv || 0).toFixed(2),
          'Total Compra': parseFloat(compra.total || 0).toFixed(2),
          'Usuario': usuario,
          'Observación': compra.observacion || 'N/A'
        });
      }
    });

    // Crear libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);

    // Configurar anchos de columna
    const columnWidths = [
      { wch: 10 }, // ID Compra
      { wch: 12 }, // Fecha
      { wch: 25 }, // Proveedor
      { wch: 15 }, // RUC/DNI
      { wch: 15 }, // Sucursal
      { wch: 20 }, // Tipo Comprobante
      { wch: 10 }, // Serie
      { wch: 15 }, // Número
      { wch: 12 }, // Estado
      { wch: 30 }, // Producto
      { wch: 15 }, // Código Producto
      { wch: 10 }, // Cantidad
      { wch: 15 }, // Precio Unitario
      { wch: 15 }, // Subtotal Detalle
      { wch: 15 }, // Subtotal Compra
      { wch: 10 }, // IGV
      { wch: 15 }, // Total Compra
      { wch: 20 }, // Usuario
      { wch: 30 }  // Observación
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte de Compras');

    // Generar buffer del archivo Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers para descarga
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `reporte_compras_${fechaActual}.xlsx`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Length', excelBuffer.length);
    
    res.send(excelBuffer);

  } catch (error) {
    console.error('Error en exportación de Excel:', error);
    res.status(500).json({ 
      mensaje: 'Error al exportar compras a Excel', 
      error: error.message 
    });
  }
};