const { Producto, Almacen, InventarioAlmacen, Sucursal, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     MigracionProducto:
 *       type: object
 *       required:
 *         - productoId
 *         - almacenOrigenId
 *         - almacenDestinoId
 *         - cantidad
 *       properties:
 *         productoId:
 *           type: integer
 *           description: ID del producto a migrar
 *         almacenOrigenId:
 *           type: integer
 *           description: ID del almacén de origen
 *         almacenDestinoId:
 *           type: integer
 *           description: ID del almacén de destino
 *         cantidad:
 *           type: integer
 *           minimum: 1
 *           description: Cantidad a migrar
 *         motivo:
 *           type: string
 *           description: Motivo de la migración
 *         observaciones:
 *           type: string
 *           description: Observaciones adicionales
 */

/**
 * @swagger
 * /api/migracion/productos:
 *   post:
 *     summary: Migrar productos entre almacenes
 *     tags: [Migración]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               migraciones:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/MigracionProducto'
 *     responses:
 *       200:
 *         description: Migración realizada exitosamente
 *       400:
 *         description: Error en los datos de entrada
 *       500:
 *         description: Error interno del servidor
 */
const migrarProductos = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { migraciones } = req.body;
    
    if (!migraciones || !Array.isArray(migraciones) || migraciones.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos una migración'
      });
    }
    
    const resultados = [];
    
    for (const migracion of migraciones) {
      const { productoId, almacenOrigenId, almacenDestinoId, cantidad, motivo, observaciones } = migracion;
      
      // Validaciones básicas
      if (!productoId || !almacenOrigenId || !almacenDestinoId || !cantidad) {
        throw new Error('Faltan datos requeridos para la migración');
      }
      
      if (almacenOrigenId === almacenDestinoId) {
        throw new Error('El almacén de origen no puede ser el mismo que el de destino');
      }
      
      if (cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }
      
      // Verificar que el producto existe
      const producto = await Producto.findByPk(productoId);
      if (!producto) {
        throw new Error(`Producto con ID ${productoId} no encontrado`);
      }
      
      // Verificar que los almacenes existen
      const [almacenOrigen, almacenDestino] = await Promise.all([
        Almacen.findByPk(almacenOrigenId),
        Almacen.findByPk(almacenDestinoId)
      ]);
      
      if (!almacenOrigen) {
        throw new Error(`Almacén de origen con ID ${almacenOrigenId} no encontrado`);
      }
      
      if (!almacenDestino) {
        throw new Error(`Almacén de destino con ID ${almacenDestinoId} no encontrado`);
      }
      
      // Verificar stock disponible en el almacén de origen
      const inventarioOrigen = await InventarioAlmacen.findOne({
        where: {
          productoId,
          almacenId: almacenOrigenId
        }
      });
      
      if (!inventarioOrigen || inventarioOrigen.stock < cantidad) {
        throw new Error(`Stock insuficiente en almacén ${almacenOrigen.nombre}. Stock disponible: ${inventarioOrigen?.stock || 0}`);
      }
      
      // Buscar o crear inventario en el almacén de destino
      let inventarioDestino = await InventarioAlmacen.findOne({
        where: {
          productoId,
          almacenId: almacenDestinoId
        }
      });
      
      if (!inventarioDestino) {
        // Crear nuevo registro de inventario en el almacén de destino
        inventarioDestino = await InventarioAlmacen.create({
          productoId,
          almacenId: almacenDestinoId,
          stock: 0,
          stockMinimo: 0,
          stockMaximo: 1000,
          precioVenta: producto.precioVenta,
          estado: 'activo'
        }, { transaction });
      }
      
      // Realizar la migración
      await inventarioOrigen.update({
        stock: inventarioOrigen.stock - cantidad
      }, { transaction });
      
      await inventarioDestino.update({
        stock: inventarioDestino.stock + cantidad
      }, { transaction });
      
      resultados.push({
        productoId,
        producto: producto.nombre,
        almacenOrigen: almacenOrigen.nombre,
        almacenDestino: almacenDestino.nombre,
        cantidad,
        stockOrigenAnterior: inventarioOrigen.stock + cantidad,
        stockOrigenActual: inventarioOrigen.stock,
        stockDestinoAnterior: inventarioDestino.stock - cantidad,
        stockDestinoActual: inventarioDestino.stock,
        motivo,
        observaciones
      });
    }
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Migración realizada exitosamente',
      data: resultados
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error en migración de productos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /api/migracion/almacenes:
 *   get:
 *     summary: Obtener lista de almacenes para migración
 *     tags: [Migración]
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: Filtrar por sucursal
 *     responses:
 *       200:
 *         description: Lista de almacenes obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
const obtenerAlmacenesParaMigracion = async (req, res) => {
  try {
    const { sucursalId } = req.query;
    
    const whereClause = {
      estado: 'activo'
    };
    
    if (sucursalId) {
      whereClause.sucursalId = sucursalId;
    }
    
    const almacenes = await Almacen.findAll({
      where: whereClause,
      include: [{
        model: Sucursal,
        attributes: ['id', 'nombre']
      }],
      attributes: ['id', 'nombre', 'descripcion', 'ubicacion', 'sucursalId'],
      order: [['nombre', 'ASC']]
    });
    
    res.json({
      success: true,
      data: almacenes
    });
    
  } catch (error) {
    console.error('Error al obtener almacenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /api/migracion/productos-inventario:
 *   get:
 *     summary: Obtener productos con inventario por almacén
 *     tags: [Migración]
 *     parameters:
 *       - in: query
 *         name: almacenId
 *         schema:
 *           type: integer
 *         description: ID del almacén
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Buscar por nombre o código
 *       - in: query
 *         name: conStock
 *         schema:
 *           type: boolean
 *         description: Solo productos con stock
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
const obtenerProductosConInventario = async (req, res) => {
  try {
    const { almacenId, buscar, conStock } = req.query;
    
    const whereClauseInventario = {};
    const whereClauseProducto = {
      estado: true
    };
    
    if (almacenId) {
      whereClauseInventario.almacenId = almacenId;
    }
    
    if (conStock === 'true') {
      whereClauseInventario.stock = {
        [Op.gt]: 0
      };
    }
    
    if (buscar) {
      whereClauseProducto[Op.or] = [
        { nombre: { [Op.like]: `%${buscar}%` } },
              { codigo: { [Op.like]: `%${buscar}%` } }
      ];
    }
    
    const productos = await InventarioAlmacen.findAll({
      where: whereClauseInventario,
      include: [{
        model: Producto,
        where: whereClauseProducto,
        attributes: ['id', 'nombre', 'codigo', 'precioVenta']
      }, {
        model: Almacen,
        attributes: ['id', 'nombre']
      }],
      attributes: ['productoId', 'almacenId', 'stock', 'stockMinimo', 'stockMaximo'],
      order: [[Producto, 'nombre', 'ASC']]
    });
    
    res.json({
      success: true,
      data: productos
    });
    
  } catch (error) {
    console.error('Error al obtener productos con inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /api/migracion/historial:
 *   get:
 *     summary: Obtener historial de migraciones
 *     tags: [Migración]
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin
 *       - in: query
 *         name: almacenId
 *         schema:
 *           type: integer
 *         description: Filtrar por almacén
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
 *       500:
 *         description: Error interno del servidor
 */
const obtenerHistorialMigraciones = async (req, res) => {
  try {
    // Por ahora retornamos un array vacío ya que no tenemos tabla de historial
    // En una implementación completa, se crearía una tabla MovimientoInventario
    res.json({
      success: true,
      data: [],
      message: 'Funcionalidad de historial en desarrollo'
    });
    
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  migrarProductos,
  obtenerAlmacenesParaMigracion,
  obtenerProductosConInventario,
  obtenerHistorialMigraciones
};