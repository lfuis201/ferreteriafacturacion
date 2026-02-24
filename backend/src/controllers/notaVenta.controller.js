const { NotaVenta, DetalleNotaVenta, Producto, Cliente, Sucursal, Usuario, Inventario, MovimientoInventario, Presentacion } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const DocumentService = require('../services/documentService');

// Obtener todas las notas de venta
// Obtener todas las notas de venta
exports.obtenerNotasVenta = async (req, res) => {
  const { sucursalId, estado, fechaEmision, buscar, serie, numero, cliente } = req.query;
  try {
    // Construir condiciones de búsqueda
    const where = {};
    const include = [
      { model: Cliente, attributes: ['id', 'nombre', 'numeroDocumento'] },
      { model: Sucursal, attributes: ['id', 'nombre'] },
      { model: Usuario, attributes: ['id', 'nombre', 'apellido'] }
    ];

    // Filtro por estado si se proporciona
    if (estado) {
      where.estado = estado;
    }

    // Filtro por fecha de emisión
    if (fechaEmision) {
      const fechaInicio = new Date(fechaEmision);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fechaEmision);
      fechaFin.setHours(23, 59, 59, 999);
      where.fecha = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    }

    // Filtro por serie
    if (serie) {
      where.serieComprobante = {
        [Op.like]: `%${serie}%`
      };
    }

    // Filtro por número
    if (numero) {
      where.numeroComprobante = {
        [Op.like]: `%${numero}%`
      };
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Si no es SuperAdmin, solo puede ver notas de venta de su sucursal
      if (sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res.status(403).json({ mensaje: 'No tiene permisos para ver notas de venta de otras sucursales' });
      }
      // Filtrar por sucursal del usuario
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      // Si es SuperAdmin y se especifica sucursalId, filtrar por esa sucursal
      where.sucursalId = sucursalId;
    }

    // Filtro de búsqueda general (cliente, vendedor)
    if (buscar) {
      include[0].where = {
        [Op.or]: [
          { nombre: { [Op.like]: `%${buscar}%` } },
          { numeroDocumento: { [Op.like]: `%${buscar}%` } }
        ]
      };
      include[2].where = {
        [Op.or]: [
          { nombre: { [Op.like]: `%${buscar}%` } },
          { apellido: { [Op.like]: `%${buscar}%` } }
        ]
      };
    }

    // Filtro específico por cliente
    if (cliente) {
      include[0].where = {
        [Op.or]: [
          { nombre: { [Op.like]: `%${cliente}%` } },
          { numeroDocumento: { [Op.like]: `%${cliente}%` } }
        ]
      };
    }

    const notasVenta = await NotaVenta.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']]
    });

    // Calcular algunos metadatos adicionales
    const totalNotasVenta = notasVenta.length;
    const notasPorEstado = notasVenta.reduce((acc, nota) => {
      acc[nota.estado] = (acc[nota.estado] || 0) + 1;
      return acc;
    }, {});
    const montoTotal = notasVenta.reduce((total, nota) => total + parseFloat(nota.total || 0), 0);

    res.json({
      notasVenta,
      metadatos: {
        totalNotasVenta,
        notasPorEstado,
        montoTotal
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener notas de venta', error: error.message });
  }
};



// Obtener una nota de venta por ID
exports.obtenerNotaVentaPorId = async (req, res) => {
  const { id } = req.params;
  const { sucursalId, estado, fecha } = req.query;
  try {
    // Construir condiciones de búsqueda
    const where = {};
    if (sucursalId) {
      where.sucursalId = sucursalId;
    }
    if (estado) {
      where.estado = estado;
    }
    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);
      where.fecha = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    }

    const notaVenta = await NotaVenta.findByPk(id, {
      where,
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'numeroDocumento', 'direccion', 'telefono', 'email'] },
        { model: Sucursal, attributes: ['id', 'nombre', 'ubicacion'] },
        { model: Usuario, attributes: ['id', 'nombre', 'apellido'] },
        {
          model: DetalleNotaVenta,
          include: [
            {
              model: Producto,
              attributes: ['id', 'nombre', 'codigo', 'unidadMedida']
            }
          ]
        }
      ]
    });
    if (!notaVenta) {
      return res.status(404).json({ mensaje: 'Nota de venta no encontrada' });
    }
    res.json({ notaVenta });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la nota de venta', error: error.message });
  }
};

// Crear una nueva nota de venta
exports.crearNotaVenta = async (req, res) => {
  const {
    clienteId,
    detalles,
    subtotal,
    igv,
    total,
    observacion,
    sucursalId,
    // Nuevos campos del formulario
    direccionCliente,
    establecimiento,
    moneda,
    tipoCambio,
    placa,
    ordenCompra,
    vendedor,
    fechaVencimiento,
    direccionEnvio,
    tipoPeriodo
  } = req.body;
  const t = await sequelize.transaction();
  try {
    // Resolver cliente cuando se usa la opción "99999999 - Clientes - Varios"
    // Si llega un valor no numérico o un número de documento (como 99999999),
    // buscamos/creamos el cliente por numeroDocumento y usamos su ID real.
    let clienteIdParaUsar = clienteId;
    if (clienteId && typeof clienteId === 'string') {
      const esNumeroDocumento = /^\d{7,11}$/.test(clienteId);
      if (esNumeroDocumento) {
        const [clienteVarios] = await Cliente.findOrCreate({
          where: { numeroDocumento: clienteId },
          defaults: {
            nombre: 'Clientes - Varios',
            tipoDocumento: clienteId.length === 11 ? 'RUC' : 'DNI',
            direccion: '',
            estado: true
          },
          transaction: t
        });
        clienteIdParaUsar = clienteVarios.id;
      }
    }

    // Determinar la sucursal a usar
    let sucursalParaUsar;
    if (req.usuario.rol === 'SuperAdmin') {
      // Si es SuperAdmin, puede especificar sucursalId en el JSON o usar la primera sucursal disponible
      if (sucursalId) {
        sucursalParaUsar = sucursalId;
      } else {
        // Obtener la primera sucursal disponible
        const primeraSucursal = await Sucursal.findOne({ where: { estado: true } });
        if (!primeraSucursal) {
          await t.rollback();
          return res.status(400).json({ mensaje: 'No hay sucursales disponibles. Especifique sucursalId en el JSON.' });
        }
        sucursalParaUsar = primeraSucursal.id;
      }
    } else {
      // Para otros roles, usar la sucursal del usuario
      if (!req.usuario.sucursalId) {
        await t.rollback();
        return res.status(400).json({ mensaje: 'El usuario no tiene una sucursal asignada' });
      }
      sucursalParaUsar = req.usuario.sucursalId;
    }

    // Verificar que la sucursal existe
    const sucursal = await Sucursal.findByPk(sucursalParaUsar);
    if (!sucursal) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'La sucursal especificada no existe' });
    }

    // Generar serie y número de comprobante
    const fecha = new Date();
    const anio = fecha.getFullYear().toString().substr(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');

    // Obtener la última nota de venta para generar el correlativo
    const ultimaNotaVenta = await NotaVenta.findOne({
      where: {
        sucursalId: sucursalParaUsar
      },
      order: [['createdAt', 'DESC']]
    });
    let correlativo = 1;
    if (ultimaNotaVenta) {
      const ultimoNumero = ultimaNotaVenta.numeroComprobante;
      if (ultimoNumero) {
        correlativo = parseInt(ultimoNumero) + 1;
      }
    }
    const serieComprobante = `NV-${sucursalParaUsar}`;
    const numeroComprobante = correlativo.toString().padStart(8, '0');

    // Crear la nota de venta
    const notaVenta = await NotaVenta.create({
      clienteId: clienteIdParaUsar,
      usuarioId: req.usuario.id,
      sucursalId: sucursalParaUsar,
      serieComprobante,
      numeroComprobante,
      fecha: new Date(),
      subtotal,
      igv,
      total,
      estado: 'emitida',
      observacion,
      // Nuevos campos del formulario
      direccionCliente,
      establecimiento: establecimiento || 'Oficina Principal',
      moneda: moneda || 'soles',
      tipoCambio: tipoCambio || 3.848,
      placa,
      ordenCompra,
      vendedor: vendedor || 'Administrador',
      fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
      direccionEnvio,
      tipoPeriodo
    }, { transaction: t });

    // Crear los detalles de la nota de venta
    if (detalles && detalles.length > 0) {
      const detallesNotaVenta = detalles.map(detalle => ({
        notaVentaId: notaVenta.id,
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        subtotal: detalle.subtotal
      }));
      await DetalleNotaVenta.bulkCreate(detallesNotaVenta, { transaction: t });

      // Actualizar inventario si es necesario
      for (const detalle of detalles) {
        // Verificar si se debe actualizar el inventario (opcional para notas de venta)
        if (req.body.actualizarInventario === true) {
          // Buscar el inventario del producto en la sucursal
          const inventario = await Inventario.findOne({
            where: {
              productoId: detalle.productoId,
              sucursalId: sucursalParaUsar
            },
            transaction: t
          });
          if (!inventario) {
            await t.rollback();
            return res.status(400).json({
              mensaje: `No existe inventario para el producto con ID ${detalle.productoId} en esta sucursal`
            });
          }

          // Verificar stock suficiente
          if (inventario.stock < detalle.cantidad) {
            await t.rollback();
            return res.status(400).json({
              mensaje: `Stock insuficiente para el producto con ID ${detalle.productoId}`
            });
          }

          // Actualizar stock
          inventario.stock -= detalle.cantidad;
          await inventario.save({ transaction: t });

          // Registrar movimiento de inventario
          await MovimientoInventario.create({
            productoId: detalle.productoId,
            sucursalOrigenId: req.usuario.sucursalId,
            sucursalDestinoId: null, // No es necesario para movimientos de salida
            tipoMovimiento: 'SALIDA',
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            documentoRelacionadoTipo: 'NOTA_VENTA',
            documentoRelacionadoId: notaVenta.id,
            usuarioId: req.usuario.id
          }, { transaction: t });
        }
      }
    }

    await t.commit();

    // Obtener el nombre del cliente y el nombre del usuario
    const cliente = await Cliente.findByPk(clienteId);
    const clienteNombre = cliente ? cliente.nombre : 'Cliente no especificado';
    const usuarioNombre = `${req.usuario.nombre} ${req.usuario.apellido}`;

    res.status(201).json({
      mensaje: 'Nota de venta creada exitosamente',
      notaVenta: {
        id: notaVenta.id,
        serieComprobante: notaVenta.serieComprobante,
        numeroComprobante: notaVenta.numeroComprobante,
        clienteId: notaVenta.clienteId,
        clienteNombre,
        usuarioId: notaVenta.usuarioId,
        usuarioNombre
      }
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al crear la nota de venta', error: error.message });
  }
};

// Anular una nota de venta
exports.anularNotaVenta = async (req, res) => {
  const { id } = req.params;
  const { motivoAnulacion } = req.body;
  if (!motivoAnulacion) {
    return res.status(400).json({ mensaje: 'El motivo de anulación es requerido' });
  }
  const t = await sequelize.transaction();
  try {
    const notaVenta = await NotaVenta.findByPk(id, { transaction: t });
    if (!notaVenta) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Nota de venta no encontrada' });
    }
    if (notaVenta.estado === 'anulada') {
      await t.rollback();
      return res.status(400).json({ mensaje: 'La nota de venta ya está anulada' });
    }

    // Verificar si se actualizó el inventario al crear la nota de venta
    if (req.body.revertirInventario === true) {
      // Obtener los detalles de la nota de venta
      const detalles = await DetalleNotaVenta.findAll({
        where: { notaVentaId: id },
        transaction: t
      });

      // Revertir los cambios en el inventario
      for (const detalle of detalles) {
        // Buscar el inventario del producto en la sucursal
        const inventario = await Inventario.findOne({
          where: {
            productoId: detalle.productoId,
            sucursalId: notaVenta.sucursalId
          },
          transaction: t
        });
        if (inventario) {
          // Actualizar stock
          inventario.stock += detalle.cantidad;
          await inventario.save({ transaction: t });

          // Registrar movimiento de inventario (ajuste por anulación)
          await MovimientoInventario.create({
            productoId: detalle.productoId,
            sucursalOrigenId: notaVenta.sucursalId,
            sucursalDestinoId: null, // No es necesario para ajustes
            tipoMovimiento: 'AJUSTE',
            cantidad: detalle.cantidad,
            documentoRelacionadoTipo: 'ANULACION_NOTA_VENTA',
            documentoRelacionadoId: notaVenta.id,
            usuarioId: req.usuario.id,
            observacion: `Anulación de nota de venta ${notaVenta.serieComprobante}-${notaVenta.numeroComprobante}`
          }, { transaction: t });
        }
      }
    }

    // Actualizar la nota de venta
    notaVenta.estado = 'anulada';
    notaVenta.motivoAnulacion = motivoAnulacion;
    notaVenta.usuarioAnulacionId = req.usuario.id;
    notaVenta.fechaAnulacion = new Date();
    await notaVenta.save({ transaction: t });

    await t.commit();
    res.json({ mensaje: 'Nota de venta anulada correctamente', notaVenta });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al anular la nota de venta', error: error.message });
  }
};

// Descargar PDF de Nota de Venta (A4, ticket/80mm)
exports.descargarPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const formato = req.query.formato || 'A4';

    // Buscar la nota de venta con sus relaciones necesarias
    const nota = await NotaVenta.findOne({
      where: { id },
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'numeroDocumento', 'tipoDocumento'] },
        { model: Sucursal, attributes: ['id', 'nombre', 'razonSocial', 'ruc', 'direccion', 'email'] },
        {
          model: DetalleNotaVenta,
          include: [{ model: Producto, attributes: ['id', 'nombre', 'codigo', 'unidadMedida'] }]
        }
      ]
    });

    if (!nota) {
      return res.status(404).json({ mensaje: 'Nota de venta no encontrada' });
    }

    // Verificar permisos por sucursal (si aplica)
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && nota.sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({ mensaje: 'No tiene permisos para ver notas de otras sucursales' });
    }

    // Preparar datos en el formato esperado por el DocumentService
    const ventaLike = {
      ...nota.toJSON(),
      tipoComprobante: 'NOTA_VENTA',
      fechaVenta: nota.fecha || nota.createdAt,
      DetalleVenta: nota.DetalleNotaVenta || [],
    };

    // Generar PDF usando el servicio de documentos
    const pdfPath = await DocumentService.generatePDF(
      ventaLike,
      nota.Sucursal,
      nota.Cliente,
      ventaLike.DetalleVenta,
      null,
      formato
    );

    // Configurar headers para descarga
    const fileName = (formato === 'ticket' || formato === '80mm')
      ? `ticket-${nota.serieComprobante}-${nota.numeroComprobante}.pdf`
      : `${nota.serieComprobante}-${nota.numeroComprobante}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(pdfPath);
  } catch (error) {
    console.error('Error al descargar PDF de Nota de Venta:', error);
    res.status(500).json({ mensaje: 'Error al descargar PDF de Nota de Venta', error: error.message });
  }
};