
/** NO SE USA
 * Controlador para manejar facturas gratuitas
 */
/**
const FacturaGratuitaService = require('../services/FacturaGratuitaService');
const Venta = require('../models/Venta');
const Cliente = require('../models/Cliente');
const Sucursal = require('../models/Sucursal');
const Producto = require('../models/Producto');
const DetalleVenta = require('../models/DetalleVenta');
const { sequelize } = require('../config/database');
const { verificarToken } = require('../middlewares/authMiddleware');
const { tieneRol } = require('../middlewares/roleMiddleware');
 */
/**
 * Crea una factura gratuita
 * @param {Object} req - Request
 * @param {Object} res - Response
 */


/**
async function crearFacturaGratuita(req, res) {
  // Iniciar transacción
  const t = await sequelize.transaction();

  try {
    // Verificar permisos
    if (!req.usuario || !['SuperAdmin', 'Admin', 'Cajero'].includes(req.usuario.rol)) {
      await t.rollback();
      return res.status(403).json({ error: 'No tiene permisos para crear facturas gratuitas' });
    }

    // Obtener datos del request
    const {
      clienteId,
      sucursalId,
      fechaEmision = new Date(),
      observacion,
      items
    } = req.body;

    // Validar datos requeridos
    if (!clienteId || !sucursalId || !items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Datos incompletos para crear factura gratuita' });
    }

    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      await t.rollback();
      return res.status(404).json({ error: `Cliente con ID ${clienteId} no encontrado` });
    }

    // Verificar que la sucursal existe
    const sucursal = await Sucursal.findByPk(sucursalId);
    if (!sucursal) {
      await t.rollback();
      return res.status(404).json({ error: `Sucursal con ID ${sucursalId} no encontrada` });
    }

    // Validar datos de la empresa para SUNAT
    if (!sucursal.ruc || !sucursal.razonSocial || !sucursal.direccion) {
      await t.rollback();
      return res.status(400).json({ error: 'La sucursal no tiene configurados los datos requeridos para facturación electrónica' });
    }

    // Generar serie y número de comprobante
    const serie = 'F001'; // Serie para facturas
    const ultimaVenta = await Venta.findOne({
      where: { tipoComprobante: 'FACTURA' },
      order: [['numeroComprobante', 'DESC']],
      transaction: t
    });
    const numeroComprobante = ultimaVenta ? parseInt(ultimaVenta.numeroComprobante) + 1 : 1;

    // Crear la venta en la base de datos
    const nuevaVenta = await Venta.create({
      clienteId,
      sucursalId,
      usuarioId: req.usuario.id,
      fechaVenta: fechaEmision,
      subtotal: 0, // En facturas gratuitas el valor es 0
      igv: 0, // En facturas gratuitas el valor es 0
      total: 0, // En facturas gratuitas el valor es 0
      formaPago: 'CONTADO',
      moneda: 'PEN',
      estado: 'COMPLETADO',
      tipoComprobante: 'FACTURA',
      serieComprobante: serie,
      numeroComprobante: numeroComprobante.toString().padStart(8, '0'),
      observacion: observacion || 'TRANSFERENCIA GRATUITA',
      estadoSunat: 'PENDIENTE',
      esGratuita: true // Marcar como factura gratuita
    }, { transaction: t });

    // Obtener IDs de productos
    const productosIds = items.map(item => item.productoId);
    const productos = await Producto.findAll({
      where: { id: productosIds },
      transaction: t
    });

    // Crear un mapa de productos para acceso rápido
    const productosMap = new Map();
    productos.forEach(producto => {
      productosMap.set(producto.id, producto);
    });

    // Crear detalles de venta
    const detallesVenta = [];
    for (const item of items) {
      const producto = productosMap.get(item.productoId);
      if (!producto) {
        await t.rollback();
        return res.status(404).json({ error: `Producto con ID ${item.productoId} no encontrado` });
      }

      // Validar valor gratuito
      if (!item.valorGratuito || parseFloat(item.valorGratuito) <= 0) {
        await t.rollback();
        return res.status(400).json({ error: `El producto ${producto.nombre} debe tener un valor gratuito mayor a 0` });
      }

      // Crear detalle de venta
      const detalle = await DetalleVenta.create({
        ventaId: nuevaVenta.id,
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: 0, // En facturas gratuitas el precio es 0
        subtotal: 0, // En facturas gratuitas el subtotal es 0
        valorGratuito: item.valorGratuito // Valor referencial del producto gratuito
      }, { transaction: t });

      detallesVenta.push({
        ...detalle.toJSON(),
        producto: producto.toJSON()
      });
    }

    // Preparar datos para enviar a SUNAT según ejemplo de greenter.dev
    const datosEmpresa = {
      ruc: sucursal.ruc,
      razonSocial: sucursal.razonSocial,
      nombreComercial: sucursal.nombreComercial,
      direccion: sucursal.direccion,
      ubigeo: sucursal.ubigeo,
      urbanizacion: sucursal.urbanizacion,
      distrito: sucursal.distrito,
      provincia: sucursal.provincia,
      departamento: sucursal.departamento
    };

    const datosVenta = {
      serie,
      numero: numeroComprobante.toString().padStart(8, '0'),
      fechaEmision,
      moneda: 'PEN',
      formaPago: 'CONTADO',
      observacion,
      tipo_operacion: "0501" // Código para operaciones gratuitas según greenter.dev
    };

    // Preparar items para SUNAT según ejemplo de greenter.dev
    const itemsSunat = items.map(item => {
      const producto = productosMap.get(item.productoId);
      return {
        nombre: producto.nombre,
        cantidad: item.cantidad,
        valorGratuito: item.valorGratuito,
        mto_valor_gratuito: item.valorGratuito, // Campo según greenter.dev
        codigoSunat: producto.codigoSunat,
        codigo: producto.codigo,
        unidadMedida: producto.unidadMedida,
        tipo_igv_codigo: "9996" // Código para operaciones gratuitas según greenter.dev
      };
    });

    try {
      // Enviar factura gratuita a SUNAT
      const respuestaSUNAT = await FacturaGratuitaService.enviarFacturaGratuita(
        datosEmpresa,
        cliente,
        datosVenta,
        itemsSunat
      );

      // Actualizar venta con respuesta de SUNAT
      if (respuestaSUNAT.aceptado) {
        await nuevaVenta.update({
          xmlUrl: respuestaSUNAT.xmlUrl,
          cdrUrl: respuestaSUNAT.cdrUrl,
          pdfUrl: respuestaSUNAT.pdfUrl,
          codigoHash: respuestaSUNAT.codigoHash,
          xmlBase64: respuestaSUNAT.xmlBase64,
          cdrBase64: respuestaSUNAT.cdrBase64,
          estadoSunat: 'ACEPTADO',
          sunatError: null
        }, { transaction: t });
      } else {
        await nuevaVenta.update({
          estadoSunat: 'RECHAZADO',
          sunatError: respuestaSUNAT.mensaje || 'Comprobante rechazado por SUNAT'
        }, { transaction: t });
      }
    } catch (sunatError) {
      console.error('Error al enviar factura gratuita a SUNAT:', sunatError.message);
      await nuevaVenta.update({
        estadoSunat: 'ERROR',
        sunatError: sunatError.message
      }, { transaction: t });
    }

    // Confirmar transacción
    await t.commit();

    // Recargar venta con relaciones
    const ventaCompleta = await Venta.findByPk(nuevaVenta.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Sucursal, as: 'sucursal' },
        {
          model: DetalleVenta,
          as: 'detalles',
          include: [{ model: Producto, as: 'producto' }]
        }
      ]
    });

    // Responder con éxito
    return res.status(201).json({
      mensaje: 'Factura gratuita creada exitosamente',
      venta: ventaCompleta,
      estadoSunat: ventaCompleta.estadoSunat,
      sunatError: ventaCompleta.sunatError
    });
  } catch (error) {
    console.error('Error al crear factura gratuita:', error);
    await t.rollback();
    return res.status(500).json({ error: `Error al crear factura gratuita: ${error.message}` });
  }
}


*/



/**
 * Obtiene información sobre facturas gratuitas
 * @param {Object} req - Request
 * @param {Object} res - Response
 */






/**

function getInfoFacturaGratuita(req, res) {
  try {
    // Verificar permisos
    if (!req.usuario || !['SuperAdmin', 'Admin', 'Cajero'].includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tiene permisos para consultar información de facturas gratuitas' });
    }

    const info = FacturaGratuitaService.getInfo();
    
    // Agregar información adicional sobre normativa SUNAT
    const infoCompleta = {
      ...info,
      normativaSunat: {
        base_legal: 'Resolución de Superintendencia N° 007-99/SUNAT',
        tipo_operacion: '0501',
        codigo_igv: '9996',
        descripcion: 'Transferencia de bienes o servicios a título gratuito'
      }
    };
    
    return res.status(200).json(infoCompleta);
  } catch (error) {
    console.error('Error al obtener información de facturas gratuitas:', error);
    return res.status(500).json({ error: `Error al obtener información: ${error.message}` });
  }
}

module.exports = {
  crearFacturaGratuita,
  getInfoFacturaGratuita
}; 

*/