const {
  GuiaRemision,
  DetalleGuiaRemision,
  Producto,
  Cliente,
  Sucursal,
  Usuario,
  Venta,
  DetalleVenta,
  Presentacion,
  Transportista,
} = require("../models");
const { Op, Transaction } = require("sequelize");
const sequelize = require("../config/database");

// Obtener todas las guías de remisión
exports.obtenerGuiasRemision = async (req, res) => {
  const { sucursalId, estado, fechaInicio, fechaFin, ventaId } = req.query;

  try {
    console.log('=== DEBUG OBTENER GUÍAS ===');
    console.log('Usuario:', req.usuario);
    console.log('Query params:', req.query);
    
    // Construir condiciones de búsqueda
    const where = {};

    if (estado) {
      where.estado = estado;
    }

    if (fechaInicio && fechaFin) {
      where.fechaSalida = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
      };
    }

    if (ventaId) {
      where.ventaId = ventaId;
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== "SuperAdmin") {
      console.log('Usuario no es SuperAdmin, aplicando filtro de sucursal');
      console.log('sucursalId del usuario:', req.usuario.sucursalId);
      
      // Si no es SuperAdmin, solo puede ver guías de su sucursal
      if (sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res
          .status(403)
          .json({
            mensaje:
              "No tiene permisos para ver guías de remisión de otras sucursales",
          });
      }

      // Filtrar por sucursal del usuario
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      console.log('Usuario es SuperAdmin, aplicando filtro de sucursal específica:', sucursalId);
      // Si es SuperAdmin y se especifica sucursalId, filtrar por esa sucursal
      where.sucursalId = sucursalId;
    } else {
      console.log('Usuario es SuperAdmin, sin filtro de sucursal');
    }
    
    console.log('Filtros WHERE aplicados:', where);

    const guiasRemision = await GuiaRemision.findAll({
      where,
      include: [
        { model: Cliente, as: 'cliente', attributes: ["id", "nombre", "numeroDocumento"] },
        { model: Sucursal, as: 'sucursal', attributes: ["id", "nombre"] },
        { model: Usuario, as: 'usuario', attributes: ["id", "nombre", "apellido"] },
        { model: Venta, as: 'venta', attributes: ["id", "serieComprobante", "numeroComprobante"] },
        {
          model: DetalleGuiaRemision,
          as: 'detalles',
          include: [
            { model: Producto, as: 'producto', attributes: ["id", "nombre", "unidadMedida"] },
            { model: Presentacion, as: 'presentacion', attributes: ["id", "descripcion", "unidadMedida"] },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log('Número de guías encontradas:', guiasRemision.length);
    console.log('=== FIN DEBUG OBTENER GUÍAS ===');

    res.json({ guiasRemision });
  } catch (error) {
    res
      .status(500)
      .json({
        mensaje: "Error al obtener guías de remisión",
        error: error.message,
      });
  }
};

// Obtener una guía de remisión por ID
exports.obtenerGuiaRemisionPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const guiaRemision = await GuiaRemision.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente', attributes: ["id", "nombre", "numeroDocumento", "direccion", "telefono", "email"] },
        { model: Sucursal, as: 'sucursal', attributes: ["id", "nombre", "ubicacion"] },
        { model: Usuario, as: 'usuario', attributes: ["id", "nombre", "apellido"] },
        { model: Venta, as: 'venta', attributes: ["id", "serieComprobante", "numeroComprobante", "fechaVenta"] },
        {
          model: DetalleGuiaRemision,
          as: 'detalles',
          include: [
            { model: Producto, as: 'producto', attributes: ["id", "nombre", "codigo", "unidadMedida"] },
            { model: Presentacion, as: 'presentacion', attributes: ["id", "descripcion", "factor"] },
          ],
        },
      ],
    });

    if (!guiaRemision) {
      return res
        .status(404)
        .json({ mensaje: "Guía de remisión no encontrada" });
    }

    res.json({ guiaRemision });
  } catch (error) {
    res
      .status(500)
      .json({
        mensaje: "Error al obtener la guía de remisión",
        error: error.message,
      });
  }
};

// Crear una nueva guía de remisión
exports.crearGuiaRemision = async (req, res) => {
  const {
    clienteId,
    ventaId,
    fechaSalida,
    puntoPartida,
    codigoUbigeoPartida,
    puntoLlegada,
    codigoUbigeoLlegada,
    motivoTraslado,
    tipoTransporte,
    vehiculoM1L,
    nroPlaca,
    conductor,
    dniConductor,
    marca,
    modelo,
    rutaVehiculo,
    direccionFiscal,
    codigoMTC,
    rucTransportista,
    detalles,
    observacion,
  } = req.body;

  const t = await sequelize.transaction();

  try {
    // Generar serie y número de comprobante
    const fecha = new Date();
    const anio = fecha.getFullYear().toString().substr(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");

    // Obtener la última guía de remisión para generar el correlativo
    const ultimaGuia = await GuiaRemision.findOne({
      where: {
        sucursalId: req.usuario.sucursalId,
      },
      order: [["createdAt", "DESC"]],
    });

    let correlativo = 1;
    if (ultimaGuia) {
      const ultimoNumero = ultimaGuia.numeroComprobante;
      if (ultimoNumero) {
        correlativo = parseInt(ultimoNumero) + 1;
      }
    }

    const serieComprobante = `GR-${req.usuario.sucursalId}`;
    const numeroComprobante = correlativo.toString().padStart(8, "0");

    // Crear la guía de remisión
    const guiaRemision = await GuiaRemision.create(
      {
        clienteId,
        usuarioId: req.usuario.id,
        sucursalId: req.usuario.sucursalId,
        serieComprobante,
        numeroComprobante,
        fechaSalida: fechaSalida || new Date(),
        puntoPartida,
        codigoUbigeoPartida,
        puntoLlegada,
        codigoUbigeoLlegada,
        motivoTraslado,
        nroPlaca,
        conductor,
        dniConductor,
        tipoTransporte,
        vehiculoM1L,
        marca,
        modelo,
        rutaVehiculo,
        direccionFiscal,
        codigoMTC,
        rucTransportista,
        estado: "Pendiente",
        ventaId,
        observacion,
      },
      { transaction: t }
    );

    // Crear los detalles de la guía de remisión
    if (detalles && detalles.length > 0) {
      const detallesGuia = detalles.map((detalle) => ({
        guiaId: guiaRemision.id,
        productoId: detalle.productoId,
        presentacionId: detalle.presentacionId,
        cantidad: detalle.cantidad,
        descripcion: detalle.descripcion,
      }));

      await DetalleGuiaRemision.bulkCreate(detallesGuia, { transaction: t });
    }

    await t.commit();

    res.status(201).json({
      mensaje: "Guía de remisión creada exitosamente",
      guiaRemision: {
        id: guiaRemision.id,
        serieComprobante: guiaRemision.serieComprobante,
        numeroComprobante: guiaRemision.numeroComprobante,
      },
    });
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({
        mensaje: "Error al crear la guía de remisión",
        error: error.message,
      });
  }
};

// Anular una guía de remisión
exports.anularGuiaRemision = async (req, res) => {
  const { id } = req.params;
  const { motivoAnulacion } = req.body;

  if (!motivoAnulacion) {
    return res
      .status(400)
      .json({ mensaje: "El motivo de anulación es requerido" });
  }

  const t = await sequelize.transaction();

  try {
    const guiaRemision = await GuiaRemision.findByPk(id, { transaction: t });

    if (!guiaRemision) {
      await t.rollback();
      return res
        .status(404)
        .json({ mensaje: "Guía de remisión no encontrada" });
    }

    if (guiaRemision.estado === "Anulado") {
      await t.rollback();
      return res
        .status(400)
        .json({ mensaje: "La guía de remisión ya está anulada" });
    }

    // Actualizar la guía de remisión
    guiaRemision.estado = "Anulado";
    guiaRemision.observacion =
      (guiaRemision.observacion || "") + " | ANULADA: " + motivoAnulacion;

    await guiaRemision.save({ transaction: t });

    await t.commit();
    res.json({
      mensaje: "Guía de remisión anulada correctamente",
      guiaRemision,
    });
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({
        mensaje: "Error al anular la guía de remisión",
        error: error.message,
      });
  }
};

exports.actualizarGuiaRemision = async (req, res) => {
  const { id } = req.params;
  const {
    clienteId,
    fechaSalida,
    puntoPartida,
    codigoUbigeoPartida,
    puntoLlegada,
    codigoUbigeoLlegada,
    motivoTraslado,
    tipoTransporte,
    vehiculoM1L,
    nroPlaca,
    conductor,
    dniConductor,
    marca,
    modelo,
    rutaVehiculo,
    direccionFiscal,
    codigoMTC,
    rucTransportista,
    observacion,
    detalles,
  } = req.body;

  const t = await sequelize.transaction();

  try {
    const guiaRemision = await GuiaRemision.findByPk(id, { transaction: t });

    if (!guiaRemision) {
      await t.rollback();
      return res
        .status(404)
        .json({ mensaje: "Guía de remisión no encontrada" });
    }

    if (guiaRemision.estado === "Anulado") {
      await t.rollback();
      return res
        .status(400)
        .json({
          mensaje: "No se puede actualizar una guía de remisión anulada",
        });
    }

    // Actualizar datos de la guía
    await guiaRemision.update(
      {
        clienteId,
        fechaSalida,
        puntoPartida,
        codigoUbigeoPartida,
        puntoLlegada,
        codigoUbigeoLlegada,
        motivoTraslado,
        nroPlaca,
        conductor,
        dniConductor,
        tipoTransporte,
        vehiculoM1L,
        marca,
        modelo,
        rutaVehiculo,
        direccionFiscal,
        codigoMTC,
        rucTransportista,
        observacion,
      },
      { transaction: t }
    );

    // Si se proporcionan detalles, actualizar los detalles
    if (detalles && detalles.length > 0) {
      // Eliminar detalles existentes
      await DetalleGuiaRemision.destroy({
        where: { guiaId: id },
        transaction: t,
      });

      // Crear nuevos detalles
      const nuevosDetalles = detalles.map((detalle) => ({
        guiaId: id,
        productoId: detalle.productoId,
        presentacionId: detalle.presentacionId,
        cantidad: detalle.cantidad,
        descripcion: detalle.descripcion,
      }));

      await DetalleGuiaRemision.bulkCreate(nuevosDetalles, { transaction: t });
    }

    // Obtener la guía actualizada con sus relaciones antes del commit
    const guiaActualizada = await GuiaRemision.findByPk(id, {
      include: [
        { model: Cliente, attributes: ["id", "nombre", "numeroDocumento"] },
        { model: Sucursal, attributes: ["id", "nombre"] },
        { model: Usuario, attributes: ["id", "nombre", "apellido"] },
        {
          model: DetalleGuiaRemision,
          include: [
            { model: Producto, attributes: ["id", "nombre", "codigo"] },
            {
              model: Presentacion,
              attributes: ["id", "descripcion", "factor"],
            },
          ],
        },
      ],
      transaction: t,
    });

    await t.commit();

    res.json({
      mensaje: "Guía de remisión actualizada correctamente",
      guiaRemision: guiaActualizada,
    });
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }
    res
      .status(500)
      .json({
        mensaje: "Error al actualizar la guía de remisión",
        error: error.message,
      });
  }
};

// Generar guía de remisión a partir de una venta
exports.generarDesdeVenta = async (req, res) => {
  const { ventaId } = req.params;
  const {
    fechaSalida,
    puntoPartida,
    codigoUbigeoPartida,
    puntoLlegada,
    codigoUbigeoLlegada,
    motivoTraslado,
    tipoTransporte,
    vehiculoM1L,
    nroPlaca,
    conductor,
    dniConductor,
    marca,
    modelo,
    rutaVehiculo,
    direccionFiscal,
    codigoMTC,
    rucTransportista,
    observacion,
  } = req.body;

  const t = await sequelize.transaction();

  try {
    // Verificar que la venta existe
    const venta = await Venta.findByPk(ventaId, {
      include: [
        { model: Cliente },
        {
          model: DetalleVenta,
          include: [{ model: Producto }, { model: Presentacion }],
        },
      ],
      transaction: t,
    });

    if (!venta) {
      await t.rollback();
      return res.status(404).json({ mensaje: "Venta no encontrada" });
    }

    // Generar serie y número de comprobante
    const fecha = new Date();
    const anio = fecha.getFullYear().toString().substr(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");

    // Obtener la última guía de remisión para generar el correlativo
    const ultimaGuia = await GuiaRemision.findOne({
      where: {
        sucursalId: req.usuario.sucursalId,
      },
      order: [["createdAt", "DESC"]],
    });

    let correlativo = 1;
    if (ultimaGuia) {
      const ultimoNumero = ultimaGuia.numeroComprobante;
      if (ultimoNumero) {
        correlativo = parseInt(ultimoNumero) + 1;
      }
    }

    const serieComprobante = `GR-${req.usuario.sucursalId}`;
    const numeroComprobante = correlativo.toString().padStart(8, "0");

    // Crear la guía de remisión
    const guiaRemision = await GuiaRemision.create(
      {
        clienteId: venta.clienteId,
        usuarioId: req.usuario.id,
        sucursalId: req.usuario.sucursalId,
        serieComprobante,
        numeroComprobante,
        fechaSalida: fechaSalida || new Date(),
        puntoPartida: puntoPartida || "Almacén principal",
        codigoUbigeoPartida,
        puntoLlegada:
          puntoLlegada ||
          (venta.Cliente ? venta.Cliente.direccion : "No especificado"),
        codigoUbigeoLlegada,
        motivoTraslado: motivoTraslado || "Venta",
        nroPlaca,
        conductor,
        dniConductor,
        tipoTransporte,
        vehiculoM1L,
        marca,
        modelo,
        rutaVehiculo,
        direccionFiscal,
        codigoMTC,
        rucTransportista,
        estado: "Pendiente",
        ventaId: venta.id,
        observacion:
          observacion ||
          `Guía generada desde venta ${venta.serieComprobante}-${venta.numeroComprobante}`,
      },
      { transaction: t }
    );

    // Crear los detalles de la guía de remisión a partir de los detalles de la venta
    if (venta.DetalleVenta && venta.DetalleVenta.length > 0) {
      const detallesGuia = venta.DetalleVenta.map((detalle) => ({
        guiaId: guiaRemision.id,
        productoId: detalle.productoId,
        presentacionId: detalle.presentacionId,
        cantidad: detalle.cantidad,
        descripcion: detalle.Producto ? detalle.Producto.nombre : "",
      }));

      await DetalleGuiaRemision.bulkCreate(detallesGuia, { transaction: t });
    }

    await t.commit();

    res.status(201).json({
      mensaje: "Guía de remisión generada exitosamente desde la venta",
      guiaRemision: {
        id: guiaRemision.id,
        serieComprobante: guiaRemision.serieComprobante,
        numeroComprobante: guiaRemision.numeroComprobante,
      },
    });
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({
        mensaje: "Error al generar la guía de remisión",
        error: error.message,
      });
  }
};

// Crear guía de remisión específica para transportista
exports.crearGuiaRemisionTransportista = async (req, res) => {
  let transaction;
  
  try {
    console.log('=== INICIO CREACIÓN GUÍA TRANSPORTISTA ===');
    console.log('Datos recibidos:', req.body);
    
    const {
      clienteId,
      conductor,
      dniConductor,
      marca,
      modelo,
      rutaVehiculo,
      observacion,
      detalles,
      // Campos adicionales del modal
      numeroPlaca,
      numeroPlacaSecundaria,
      autorizacionMTC,
      autorizacionMTCSecundaria,
      tucPlacaSecundaria,
      modeloVehiculo,
      marcaVehiculo,
      puntoPartida,
      destinatario,
      puntoLlegada,
      datosVehiculo,
      datosConductor,
      pesoTotal,
      numeroPaquetes,
      ordenCompra,
      empresaPagadorFlete,
      empresaSubcontratada,
      remitente
    } = req.body;

    // Validaciones básicas - hacer más flexibles para el modal
    if (!detalles || detalles.length === 0) {
      console.log('Error: No hay detalles de productos');
      return res.status(400).json({
        success: false,
        message: "Debe incluir al menos un detalle de producto"
      });
    }

    // Validar que cada detalle tenga al menos descripción
    for (let i = 0; i < detalles.length; i++) {
      const detalle = detalles[i];
      // Solo requerir descripción para guías de transportista
      if (!detalle.descripcion && !detalle.producto) {
        console.log(`Error: Detalle ${i + 1} sin descripción ni producto`);
        return res.status(400).json({
          success: false,
          message: `El detalle ${i + 1} debe tener al menos una descripción`
        });
      }
      if (!detalle.cantidad || detalle.cantidad <= 0) {
        console.log(`Error: Detalle ${i + 1} sin cantidad válida`);
        return res.status(400).json({
          success: false,
          message: `El detalle ${i + 1} debe tener una cantidad válida`
        });
      }
    }

    // Validar que al menos tengamos datos básicos del transportista
    const tieneDataConductor = conductor || datosConductor;
    const tieneDataVehiculo = marca || marcaVehiculo || numeroPlaca;
    
    if (!tieneDataConductor && !tieneDataVehiculo) {
      console.log('Error: Faltan datos mínimos del transportista');
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar al menos datos del conductor o del vehículo"
      });
    }

    // Obtener el usuario y sucursal
    const usuarioId = req.usuario.id;
    const sucursalId = req.usuario.sucursalId;
    
    console.log('Usuario ID:', usuarioId, 'Sucursal ID:', sucursalId);

    // Iniciar transacción con timeout personalizado
    transaction = await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
      timeout: 30000 // 30 segundos de timeout para la transacción
    });

    console.log('Transacción iniciada');

    // Generar serie y número de comprobante de forma más eficiente
    const ultimaGuia = await GuiaRemision.findOne({
      where: { sucursalId },
      order: [['id', 'DESC']],
      attributes: ['numeroComprobante'],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    let numeroComprobante = '00000001';
    if (ultimaGuia) {
      const ultimoNumero = parseInt(ultimaGuia.numeroComprobante);
      numeroComprobante = (ultimoNumero + 1).toString().padStart(8, '0');
    }

    const serieComprobante = `GR-${sucursalId}`;
    
    console.log('Serie:', serieComprobante, 'Número:', numeroComprobante);

    // Crear la guía de remisión
    const datosGuia = {
      clienteId: clienteId || null,
      usuarioId,
      sucursalId,
      serieComprobante,
      numeroComprobante,
      fechaSalida: new Date(),
      puntoPartida: puntoPartida || 'Almacén principal',
      puntoLlegada: puntoLlegada || 'Destino del cliente',
      motivoTraslado: 'Transporte',
      conductor: conductor || datosConductor || 'Sin especificar',
      dniConductor: dniConductor || 'Sin especificar',
      marca: marca || marcaVehiculo || 'Sin especificar',
      modelo: modelo || modeloVehiculo || 'Sin especificar',
      rutaVehiculo: rutaVehiculo || 'Sin especificar',
      observacion: observacion || '',
      estado: 'emitida',
      tipoTransporte: 'privado',
      nroPlaca: numeroPlaca || 'Sin especificar',
      // Campos adicionales del modal
      direccionFiscal: empresaPagadorFlete || empresaSubcontratada || null,
      codigoMTC: autorizacionMTC || null,
      rucTransportista: empresaPagadorFlete || null
    };
    
    console.log('Datos para crear guía:', datosGuia);
    
    const nuevaGuia = await GuiaRemision.create(datosGuia, { transaction });
    
    console.log('Guía creada con ID:', nuevaGuia.id);

    // Crear los detalles en lote para mejor rendimiento
    const detallesParaCrear = detalles.map(detalle => ({
      guiaId: nuevaGuia.id,
      productoId: detalle.productoId || null, // Permitir null para productos sin ID
      cantidad: detalle.cantidad,
      descripcion: detalle.descripcion || detalle.producto || '', // Usar descripción o nombre del producto
      peso: detalle.peso || 0,
      unidad: detalle.unidad || 'UND'
    }));

    console.log('Detalles para crear:', detallesParaCrear);

    const detallesCreados = await DetalleGuiaRemision.bulkCreate(detallesParaCrear, { 
      transaction,
      returning: true
    });

    console.log('Detalles creados:', detallesCreados.length);

    // Confirmar la transacción antes de continuar
    await transaction.commit();
    console.log('Transacción confirmada - Datos guardados en la base de datos');

    // Verificar que la guía se guardó correctamente
    const guiaVerificacion = await GuiaRemision.findByPk(nuevaGuia.id);
    if (!guiaVerificacion) {
      console.error('ERROR: La guía no se encontró después del commit');
      return res.status(500).json({
        success: false,
        message: 'Error: La guía no se guardó correctamente'
      });
    }

    console.log('Verificación exitosa - Guía guardada con ID:', guiaVerificacion.id);

    // Obtener la guía completa con sus relaciones (fuera de la transacción)
    const guiaCompleta = await GuiaRemision.findByPk(nuevaGuia.id, {
      include: [
        {
          model: DetalleGuiaRemision,
          as: 'detalles',
          include: [
            {
              model: Producto,
              as: 'producto',
              attributes: ['id', 'nombre', 'codigo']
            }
          ]
        },
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'numeroDocumento']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre']
        },
        {
          model: Sucursal,
          as: 'sucursal',
          attributes: ['id', 'nombre']
        }
      ]
    });

    console.log('Guía completa obtenida:', guiaCompleta ? 'SÍ' : 'NO');
    console.log('=== FIN CREACIÓN GUÍA TRANSPORTISTA ===');

    res.status(201).json({
      success: true,
      message: 'Guía de remisión de transportista creada exitosamente',
      data: guiaCompleta
    });

  } catch (error) {
    console.error('=== ERROR EN CREACIÓN GUÍA ===');
    console.error('Error completo:', error);
    
    if (transaction) {
      try {
        await transaction.rollback();
        console.log('Rollback realizado');
      } catch (rollbackError) {
        console.error('Error al hacer rollback:', rollbackError);
      }
    }
    
    console.error('Error al crear guía de remisión de transportista:', error);
    
    // Manejo específico de errores de timeout
    if (error.name === 'SequelizeConnectionAcquireTimeoutError') {
      return res.status(503).json({
        success: false,
        message: 'Timeout de conexión a la base de datos. Intente nuevamente.',
        error: 'CONNECTION_TIMEOUT'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cambiar estado de guía de remisión
exports.cambiarEstadoGuia = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    // Validar estados permitidos
    const estadosPermitidos = [
      "Pendiente",
      "En tránsito",
      "Entregado",
      "Anulado",
    ];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ mensaje: "Estado no válido" });
    }

    const guiaRemision = await GuiaRemision.findByPk(id);
    if (!guiaRemision) {
      return res
        .status(404)
        .json({ mensaje: "Guía de remisión no encontrada" });
    }

    // Verificar permisos
    if (
      req.usuario &&
      req.usuario.rol !== "SuperAdmin" &&
      guiaRemision.sucursalId !== req.usuario.sucursalId
    ) {
      return res
        .status(403)
        .json({
          mensaje: "No tiene permisos para modificar esta guía de remisión",
        });
    }

    // Actualizar estado
    await guiaRemision.update({ estado });

    res.json({
      mensaje: "Estado actualizado correctamente",
      guiaRemision: {
        id: guiaRemision.id,
        estado: guiaRemision.estado,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        mensaje: "Error al cambiar estado de la guía",
        error: error.message,
      });
  }
};

// Eliminar guía de remisión
exports.eliminarGuiaRemision = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();

  try {
    const guiaRemision = await GuiaRemision.findByPk(id);
    if (!guiaRemision) {
      await t.rollback();
      return res
        .status(404)
        .json({ mensaje: "Guía de remisión no encontrada" });
    }

    // Verificar permisos
    if (
      req.usuario &&
      req.usuario.rol !== "SuperAdmin" &&
      guiaRemision.sucursalId !== req.usuario.sucursalId
    ) {
      await t.rollback();
      return res
        .status(403)
        .json({
          mensaje: "No tiene permisos para eliminar esta guía de remisión",
        });
    }

    // Permitir eliminar guías en cualquier estado
    // Comentario: Se permite eliminar guías en cualquier estado según requerimiento del usuario

    // Eliminar detalles primero
    await DetalleGuiaRemision.destroy({
      where: { guiaId: id },
      transaction: t,
    });

    // Eliminar guía
    await guiaRemision.destroy({ transaction: t });

    await t.commit();
    res.json({ mensaje: "Guía de remisión eliminada correctamente" });
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({
        mensaje: "Error al eliminar la guía de remisión",
        error: error.message,
      });
  }
};

// Exportar guías a Excel
exports.exportarExcel = async (req, res) => {
  try {
    const { sucursalId, estado, fechaInicio, fechaFin } = req.query;

    console.log("Parámetros recibidos en backend:", req.query);

    // Construir filtros
    const where = {};

    if (estado) {
      where.estado = estado;
    }

    if (fechaInicio && fechaFin) {
      where.fechaSalida = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
      };
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== "SuperAdmin") {
      // Si no es SuperAdmin, solo puede exportar guías de su sucursal
      if (sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res
          .status(403)
          .json({
            mensaje:
              "No tiene permisos para exportar guías de remisión de otras sucursales",
          });
      }

      // Filtrar por sucursal del usuario
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      // Si es SuperAdmin y se especifica sucursalId, filtrar por esa sucursal
      where.sucursalId = sucursalId;
    }

    console.log("Filtros aplicados:", JSON.stringify(where, null, 2));

    // Obtener guías de remisión
    const guiasRemision = await GuiaRemision.findAll({
      where,
      include: [
        {
          model: Cliente,
          attributes: ["id", "nombre", "numeroDocumento", "direccion"],
        },
        { model: Sucursal, attributes: ["id", "nombre"] },
        { model: Usuario, attributes: ["id", "nombre", "apellido"] },
        {
          model: Venta,
          attributes: ["id", "serieComprobante", "numeroComprobante"],
        },
        {
          model: DetalleGuiaRemision,
          include: [
            {
              model: Producto,
              attributes: ["id", "nombre", "codigo"],
            },
            {
              model: Presentacion,
              attributes: ["id", "descripcion", "factor"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log("Número de guías encontradas:", guiasRemision.length);

    // Verificar si se encontraron guías
    if (guiasRemision.length === 0) {
      return res
        .status(404)
        .json({
          mensaje:
            "No se encontraron guías de remisión con los filtros especificados",
        });
    }

    // Preparar datos para Excel
    const datosExcel = [];

    guiasRemision.forEach((guia) => {
      const datosBase = {
        ID: guia.id,
        Serie: guia.serieComprobante,
        Número: guia.numeroComprobante,
        "Fecha Salida": guia.fechaSalida
          ? new Date(guia.fechaSalida).toLocaleDateString("es-PE")
          : "",
        Cliente: guia.Cliente ? guia.Cliente.nombre : "",
        "Documento Cliente": guia.Cliente ? guia.Cliente.numeroDocumento : "",
        "Punto Partida": guia.puntoPartida || "",
        "Punto Llegada": guia.puntoLlegada || "",
        "Motivo Traslado": guia.motivoTraslado || "",
        "Placa Vehículo": guia.nroPlaca || "",
        Conductor: guia.conductor || "",
        "DNI Conductor": guia.dniConductor || "",
        "Tipo Transporte": guia.tipoTransporte || "",
        "Marca Vehículo": guia.marca || "",
        "Modelo Vehículo": guia.modelo || "",
        Estado: guia.estado,
        Sucursal: guia.Sucursal ? guia.Sucursal.nombre : "",
        Usuario: guia.Usuario
          ? `${guia.Usuario.nombre} ${guia.Usuario.apellido}`
          : "",
        "Venta Asociada": guia.Venta
          ? `${guia.Venta.serieComprobante}-${guia.Venta.numeroComprobante}`
          : "",
        Observaciones: guia.observacion || "",
        "Fecha Creación": guia.createdAt
          ? new Date(guia.createdAt).toLocaleDateString("es-PE")
          : "",
      };

      if (guia.DetalleGuiaRemisions && guia.DetalleGuiaRemisions.length > 0) {
        // Si tiene detalles, crear una fila por cada detalle
        guia.DetalleGuiaRemisions.forEach((detalle) => {
          datosExcel.push({
            ...datosBase,
            Producto: detalle.Producto ? detalle.Producto.nombre : "",
            "Código Producto": detalle.Producto ? detalle.Producto.codigo : "",
            Presentación: detalle.Presentacion
              ? detalle.Presentacion.descripcion
              : "",
            Cantidad: detalle.cantidad || 0,
            "Descripción Detalle": detalle.descripcion || "",
          });
        });
      } else {
        // Si no tiene detalles, agregar una fila sin información de productos
        datosExcel.push({
          ...datosBase,
          Producto: "",
          "Código Producto": "",
          Presentación: "",
          Cantidad: "",
          "Descripción Detalle": "",
        });
      }
    });

    // Crear libro de Excel
    const XLSX = require("xlsx");
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);

    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 8 }, // ID
      { wch: 12 }, // Serie
      { wch: 12 }, // Número
      { wch: 12 }, // Fecha Salida
      { wch: 25 }, // Cliente
      { wch: 15 }, // Documento Cliente
      { wch: 20 }, // Punto Partida
      { wch: 20 }, // Punto Llegada
      { wch: 15 }, // Motivo Traslado
      { wch: 12 }, // Placa Vehículo
      { wch: 20 }, // Conductor
      { wch: 12 }, // DNI Conductor
      { wch: 12 }, // Tipo Transporte
      { wch: 15 }, // Marca Vehículo
      { wch: 15 }, // Modelo Vehículo
      { wch: 12 }, // Estado
      { wch: 15 }, // Sucursal
      { wch: 20 }, // Usuario
      { wch: 15 }, // Venta Asociada
      { wch: 30 }, // Observaciones
      { wch: 12 }, // Fecha Creación
      { wch: 25 }, // Producto
      { wch: 15 }, // Código Producto
      { wch: 20 }, // Presentación
      { wch: 10 }, // Cantidad
      { wch: 30 }, // Descripción Detalle
    ];

    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Guías de Remisión");

    // Generar buffer del archivo Excel
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Configurar headers para descarga
    const fechaActual = new Date().toISOString().split("T")[0];
    const nombreArchivo = `guias_remision_${fechaActual}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"`
    );
    res.setHeader("Content-Length", excelBuffer.length);

    res.send(excelBuffer);
  } catch (error) {
    console.error("Error en exportación de Excel:", error);
    res.status(500).json({
      mensaje: "Error al exportar guías de remisión a Excel",
      error: error.message,
    });
  }
};

// Generar PDF de guía de remisión
exports.generarPDF = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Generando PDF para guía ID:", id);

    // Obtener la guía de remisión con todos sus datos relacionados
    const guiaRemision = await GuiaRemision.findByPk(id, {
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: [
            "id",
            "nombre",
            "numeroDocumento",
            "direccion",
            "telefono",
            "email",
          ],
        },
        {
          model: Sucursal,
          as: 'sucursal',
          attributes: ["id", "nombre", "direccion", "telefono"],
        },
        { model: Usuario, as: 'usuario', attributes: ["id", "nombre", "apellido"] },
        {
          model: Venta,
          as: 'venta',
          attributes: ["id", "serieComprobante", "numeroComprobante"],
        },
        {
          model: DetalleGuiaRemision,
          as: 'detalles',
          include: [
            {
              model: Producto,
              as: 'producto',
              attributes: ["id", "nombre", "codigo", "descripcion"],
            },
            {
              model: Presentacion,
              as: 'presentacion',
              attributes: ["id", "descripcion", "factor"],
            },
          ],
        },
      ],
    });

    // Compatibilidad de claves con y sin alias
    const sucursal = guiaRemision.sucursal || guiaRemision.Sucursal;
    const cliente = guiaRemision.cliente || guiaRemision.Cliente;
    const usuario = guiaRemision.usuario || guiaRemision.Usuario;
    const venta = guiaRemision.venta || guiaRemision.Venta;
    const detalles = guiaRemision.detalles || guiaRemision.DetalleGuiaRemisions || [];

    // Si es transporte público, obtener los datos del transportista
    let transportista = null;
    if (guiaRemision && guiaRemision.tipoTransporte === 'publico' && guiaRemision.rucTransportista) {
      transportista = await Transportista.findOne({
        where: { numeroDocumento: guiaRemision.rucTransportista },
        attributes: ["id", "razonSocial", "nombreComercial", "direccionFiscal", "mtc"]
      });
    }

    if (!guiaRemision) {
      return res
        .status(404)
        .json({ mensaje: "Guía de remisión no encontrada" });
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== "SuperAdmin") {
      if (guiaRemision.sucursalId !== req.usuario.sucursalId) {
        return res
          .status(403)
          .json({
            mensaje:
              "No tiene permisos para generar PDF de esta guía de remisión",
          });
      }
    }




    ////GENERACION DE PDF GUIA
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 50 });

    // Configurar headers para PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="guia_remision_${guiaRemision.serieComprobante}-${guiaRemision.numeroComprobante}.pdf"`
    );

    // Pipe del documento al response
    doc.pipe(res);

    // Título del documento
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("GUÍA DE REMISIÓN", 50, 50, { align: "center" });
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        `${guiaRemision.serieComprobante} - ${guiaRemision.numeroComprobante}`,
        50,
        80,
        { align: "center" }
      );

    // Línea separadora
    doc.moveTo(50, 100).lineTo(550, 100).stroke();

    let yPosition = 120;

    // Información de la empresa/sucursal
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("DATOS DEL REMITENTE:", 50, yPosition);
    yPosition += 20;
    doc.fontSize(10).font("Helvetica");
    if (sucursal) {
      doc.text(`Empresa: ${sucursal.nombre}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Dirección: ${sucursal.direccion || "No especificada"}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Teléfono: ${sucursal.telefono || "No especificado"}`, 50, yPosition);
      yPosition += 20;
    }

    // Información del destinatario
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("DATOS DEL DESTINATARIO:", 50, yPosition);
    yPosition += 20;
    doc.fontSize(10).font("Helvetica");
    if (cliente) {
      doc.text(`Cliente: ${cliente.nombre}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Documento: ${cliente.numeroDocumento || "No especificado"}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Dirección: ${cliente.direccion || "No especificada"}`, 50, yPosition);
      yPosition += 15;
      if (cliente.telefono) {
        doc.text(`Teléfono: ${cliente.telefono}`, 50, yPosition);
        yPosition += 15;
      }
    }
    yPosition += 10;

    // Información del traslado
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("INFORMACIÓN DEL TRASLADO:", 50, yPosition);
    yPosition += 20;
    doc.fontSize(10).font("Helvetica");

    const fechaSalida = guiaRemision.fechaSalida
      ? new Date(guiaRemision.fechaSalida).toLocaleDateString("es-PE")
      : "No especificada";
    doc.text(`Fecha de Salida: ${fechaSalida}`, 50, yPosition);
    yPosition += 15;

    doc.text(
      `Punto de Partida: ${guiaRemision.puntoPartida || "No especificado"}`,
      50,
      yPosition
    );
    yPosition += 15;

    doc.text(
      `Punto de Llegada: ${guiaRemision.puntoLlegada || "No especificado"}`,
      50,
      yPosition
    );
    yPosition += 15;

    doc.text(
      `Motivo de Traslado: ${guiaRemision.motivoTraslado || "No especificado"}`,
      50,
      yPosition
    );
    yPosition += 15;

    // Mostrar tipo de transporte
    doc.text(
      `Tipo de Transporte: ${guiaRemision.tipoTransporte === 'publico' ? 'Público' : 'Privado'}`,
      50,
      yPosition
    );
    yPosition += 15;

    // Datos del transportista (para transporte público)
    if (guiaRemision.tipoTransporte === 'publico') {
      if (transportista && transportista.razonSocial) {
        doc.text(`Transportista: ${transportista.nombreComercial || transportista.razonSocial}`, 50, yPosition);
        yPosition += 15;
      }
      if (guiaRemision.rucTransportista) {
        doc.text(`RUC Transportista: ${guiaRemision.rucTransportista}`, 50, yPosition);
        yPosition += 15;
      }




      
        if (guiaRemision.conductor) {
        doc.text(`Transportista: ${guiaRemision.conductor}`, 50, yPosition);
        yPosition += 15;
      }




      if (guiaRemision.direccionFiscal) {
        doc.text(`Dirección Fiscal: ${guiaRemision.direccionFiscal}`, 50, yPosition);
        yPosition += 15;
      }
      if (guiaRemision.codigoMTC) {
        doc.text(`Código MTC: ${guiaRemision.codigoMTC}`, 50, yPosition);
        yPosition += 15;
      }
      if (guiaRemision.rutaVehiculo) {
        doc.text(`Ruta del Vehículo: ${guiaRemision.rutaVehiculo}`, 50, yPosition);
        yPosition += 15;
      }
    }

    // Datos del vehículo (para transporte privado o cuando están llenos en público)
    if (guiaRemision.nroPlaca) {
      doc.text(`Placa del Vehículo: ${guiaRemision.nroPlaca}`, 50, yPosition);
      yPosition += 15;
    }

    if (guiaRemision.marca) {
      doc.text(`Marca: ${guiaRemision.marca}`, 50, yPosition);
      yPosition += 15;
    }

    if (guiaRemision.modelo) {
      doc.text(`Modelo: ${guiaRemision.modelo}`, 50, yPosition);
      yPosition += 15;
    }

    // Datos del conductor
    if (guiaRemision.conductor) {
      doc.text(`Conductor: ${guiaRemision.conductor}`, 50, yPosition);
      yPosition += 15;
    }

    if (guiaRemision.dniConductor) {
      doc.text(`DNI Conductor: ${guiaRemision.dniConductor}`, 50, yPosition);
      yPosition += 15;
    }

    doc.text(`Estado: ${guiaRemision.estado}`, 50, yPosition);
    yPosition += 20;

    // Verificar si necesitamos una nueva página
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 50;
    }

    // Detalles de productos
    if (detalles && detalles.length > 0) {
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("DETALLE DE PRODUCTOS:", 50, yPosition);
      yPosition += 25;

      // Encabezados de tabla
      doc.fontSize(9).font("Helvetica-Bold");
      doc.text("Código", 50, yPosition);
      doc.text("Producto", 120, yPosition);
      doc.text("Presentación", 300, yPosition);
      doc.text("Cantidad", 420, yPosition);
      doc.text("Descripción", 480, yPosition);

      yPosition += 15;

      // Línea separadora
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;

      // Detalles
      doc.fontSize(8).font("Helvetica");
      detalles.forEach((detalle) => {
        // Verificar si necesitamos una nueva página
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;

          // Repetir encabezados en nueva página
          doc.fontSize(9).font("Helvetica-Bold");
          doc.text("Código", 50, yPosition);
          doc.text("Producto", 120, yPosition);
          doc.text("Presentación", 300, yPosition);
          doc.text("Cantidad", 420, yPosition);
          doc.text("Descripción", 480, yPosition);
          yPosition += 15;
          doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
          yPosition += 10;
          doc.fontSize(8).font("Helvetica");
        }

        const prod = detalle.producto || detalle.Producto;
        const pres = detalle.presentacion || detalle.Presentacion;
        const codigo = prod ? prod.codigo : "";
        const nombreProducto = prod ? prod.nombre : "";
        const presentacion = pres ? pres.descripcion : "";
        const cantidad = detalle.cantidad || 0;
        const descripcion = detalle.descripcion || "";

        doc.text(codigo, 50, yPosition, { width: 60, ellipsis: true });
        doc.text(nombreProducto, 120, yPosition, {
          width: 170,
          ellipsis: true,
        });
        doc.text(presentacion, 300, yPosition, { width: 110, ellipsis: true });
        doc.text(cantidad.toString(), 420, yPosition, { width: 50 });
        doc.text(descripcion, 480, yPosition, { width: 70, ellipsis: true });

        yPosition += 20;
      });
    }

    // Observaciones
    if (guiaRemision.observacion) {
      yPosition += 20;
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("OBSERVACIONES:", 50, yPosition);
      yPosition += 15;
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(guiaRemision.observacion, 50, yPosition, { width: 500 });
    }

    // Información adicional
    yPosition += 40;
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(10).font("Helvetica");
    if (usuario) {
      doc.text(`Generado por: ${usuario.nombre} ${usuario.apellido}`, 50, yPosition);
      yPosition += 15;
    }

    const fechaGeneracion = new Date().toLocaleDateString("es-PE");
    const horaGeneracion = new Date().toLocaleTimeString("es-PE");
    doc.text(
      `Fecha de generación: ${fechaGeneracion} ${horaGeneracion}`,
      50,
      yPosition
    );

    if (venta) {
      yPosition += 15;
      doc.text(`Venta asociada: ${venta.serieComprobante}-${venta.numeroComprobante}`, 50, yPosition);
    }

    // Finalizar el documento
    doc.end();
  } catch (error) {
    console.error("Error al generar PDF:", error);
    res.status(500).json({
      mensaje: "Error al generar PDF de la guía de remisión",
      error: error.message,
    });
  }
};
