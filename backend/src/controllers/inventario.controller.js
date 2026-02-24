const { Inventario, Producto, Sucursal, MovimientoInventario, Usuario } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const TrasladoPdfService = require('../services/trasladoPdfService');
const path = require('path');

// Obtener inventario con filtros
exports.obtenerInventario = async (req, res) => {
  try {
    const { sucursalId, productoId, stockMinimo, search } = req.query;
    
    // Construir condiciones de filtro
    const whereConditions = {};
    const productoWhere = { estado: true };
    
    if (sucursalId) {
      whereConditions.sucursalId = sucursalId;
    }
    
    if (productoId) {
      whereConditions.productoId = productoId;
    }
    
    if (stockMinimo === 'true') {
      whereConditions[Op.and] = [
        { stock: { [Op.lte]: sequelize.col('stockMinimo') } },
        { stockMinimo: { [Op.gt]: 0 } }
      ];
    }
    
    // Agregar búsqueda por nombre o código de producto
    if (search) {
      productoWhere[Op.or] = [
        { codigo: { [Op.like]: `%${search}%` } },
        { nombre: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Si no es SuperAdmin, solo puede ver el inventario de su sucursal
      if (req.usuario.sucursalId) {
        whereConditions.sucursalId = req.usuario.sucursalId;
      }
    }
    
    const inventario = await Inventario.findAll({
      where: whereConditions,
      include: [
        { 
          model: Producto, 
          attributes: ['id', 'nombre', 'codigo', 'unidadMedida', 'precioVenta'],
          where: productoWhere,
          required: true // Solo incluir inventarios con productos activos
        },
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre', 'direccion'],
          where: { estado: true },
          required: true // Solo incluir inventarios con sucursales activas
        }
      ]
    });
    
    res.json({ inventario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el inventario', error: error.message });
  }
};

// Obtener inventario por sucursal
exports.obtenerInventarioPorSucursal = async (req, res) => {
  const { sucursalId } = req.params;

  try {
    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Si no es SuperAdmin, solo puede ver el inventario de su sucursal
      if (req.usuario.sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res.status(403).json({ mensaje: 'No tiene permisos para ver el inventario de otras sucursales' });
      }
    }

    // Verificar si la sucursal existe
    const sucursalExiste = await Sucursal.findOne({ 
      where: { id: sucursalId, estado: true } 
    });
    
    if (!sucursalExiste) {
      return res.status(404).json({ mensaje: 'La sucursal no existe o está inactiva' });
    }

    const inventario = await Inventario.findAll({
      where: { sucursalId },
      include: [
        { 
          model: Producto, 
          attributes: ['id', 'nombre', 'codigo', 'unidadMedida', 'precioVenta'],
          where: { estado: true }
        },
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre']
        }
      ]
    });

    res.json({ inventario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el inventario', error: error.message });
  }
};

// Obtener inventario por producto
exports.obtenerInventarioPorProducto = async (req, res) => {
  const { productoId } = req.params;

  try {
    // Verificar si el producto existe
    const productoExiste = await Producto.findOne({ 
      where: { id: productoId, estado: true } 
    });
    
    if (!productoExiste) {
      return res.status(404).json({ mensaje: 'El producto no existe o está inactivo' });
    }

    let inventario;
    
    // Si es SuperAdmin, puede ver el inventario en todas las sucursales
    if (req.usuario && req.usuario.rol === 'SuperAdmin') {
      inventario = await Inventario.findAll({
        where: { productoId },
        include: [
          { model: Sucursal, attributes: ['id', 'nombre'] }
        ]
      });
    } else {
      // Si no es SuperAdmin, solo puede ver el inventario de su sucursal
      inventario = await Inventario.findAll({
        where: { 
          productoId,
          sucursalId: req.usuario.sucursalId 
        },
        include: [
          { model: Sucursal, attributes: ['id', 'nombre'] }
        ]
      });
    }

    res.json({ inventario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el inventario', error: error.message });
  }
};



// Actualizar stock de un producto en una sucursal
exports.actualizarStock = async (req, res) => {
  const { productoId, sucursalId } = req.params;
  const { stock, stockMinimo, precioVenta } = req.body;

  try {
    // Convertir los parámetros a enteros
    const productoIdInt = parseInt(productoId);
    const sucursalIdInt = parseInt(sucursalId);

    // Verificar que los parámetros sean válidos
    if (isNaN(productoIdInt) || isNaN(sucursalIdInt)) {
      return res.status(400).json({ mensaje: 'Los IDs deben ser números válidos' });
    }

    console.log(`Actualizando inventario - Producto: ${productoIdInt}, Sucursal: ${sucursalIdInt}`);

    // Verificar permisos
    if (req.usuario &&
        req.usuario.rol !== 'SuperAdmin' &&
        req.usuario.rol !== 'Admin' &&
        req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para actualizar el stock' });
    }

    // Si no es SuperAdmin, solo puede actualizar el stock de su sucursal
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.sucursalId !== sucursalIdInt) {
      return res.status(403).json({ mensaje: 'No tiene permisos para actualizar el stock de otras sucursales' });
    }

    // Verificar si el producto existe
    const productoExiste = await Producto.findOne({
      where: { id: productoIdInt, estado: true }
    });
    if (!productoExiste) {
      return res.status(404).json({ mensaje: 'El producto no existe o está inactivo' });
    }

    // Verificar si la sucursal existe
    const sucursalExiste = await Sucursal.findOne({
      where: { id: sucursalIdInt, estado: true }
    });
    if (!sucursalExiste) {
      return res.status(404).json({ mensaje: 'La sucursal no existe o está inactiva' });
    }

    // Buscar el registro de inventario
    let inventario = await Inventario.findOne({
      where: { productoId: productoIdInt, sucursalId: sucursalIdInt }
    });
    
    let mensaje;
    let stockAnterior = 0;

    // Si no existe, crear un nuevo registro
    if (!inventario) {
      inventario = await Inventario.create({
        productoId: productoIdInt,
        sucursalId: sucursalIdInt,
        stock: stock || 0,
        stockMinimo: stockMinimo || 0,
        precioVenta: precioVenta || productoExiste.precioVenta
      });
      mensaje = 'Inventario creado exitosamente';
    } else {
      // Si existe, actualizar el registro
      stockAnterior = parseFloat(inventario.stock);
      const precioVentaAnterior = inventario.precioVenta;
      
      await inventario.update({
        stock: stock !== undefined ? stock : inventario.stock,
        stockMinimo: stockMinimo !== undefined ? stockMinimo : inventario.stockMinimo,
        precioVenta: precioVenta !== undefined ? precioVenta : inventario.precioVenta
      });
      
      // Sincronizar precio de venta en el producto si se actualiza en inventario
      if (precioVenta !== undefined && precioVenta !== precioVentaAnterior) {
        try {
          await Producto.update(
            { precioVenta: precioVenta },
            { where: { id: productoIdInt } }
          );
          console.log(`Precio de venta sincronizado en producto ${productoIdInt}: ${precioVenta}`);
        } catch (error) {
          console.error('Error al sincronizar precio de venta en producto:', error);
        }
      }
      
      mensaje = 'Inventario actualizado exitosamente';
    }

    // Registrar movimiento de inventario si hay cambio en el stock
   if (stock !== undefined && parseFloat(stock) !== stockAnterior) {
      const stockFloat = parseFloat(stock);
      const tipoMovimiento = stockFloat > stockAnterior ? 'ENTRADA' : 'SALIDA';
      const cantidad = Math.abs(stockFloat - stockAnterior);

      if (cantidad > 0) {
        try {
          // Verificar que la sucursal origen existe
          const sucursalOrigen = await Sucursal.findOne({
            where: { id: sucursalIdInt, estado: true }
          });

          if (!sucursalOrigen) {
            mensaje += ' (Sin registro de movimiento por error en BD: sucursal origen no válida)';
          } else {
            // Crear el movimiento de inventario
            const movimiento = await MovimientoInventario.create({
              productoId: productoIdInt,
              sucursalOrigenId: sucursalIdInt, // Siempre se requiere
              sucursalDestinoId: sucursalIdInt, // Usar la misma sucursal para movimientos no de traslado
              tipoMovimiento,
              cantidad,
              precioUnitario: precioVenta || productoExiste.precioVenta,
              documentoRelacionadoTipo: 'AJUSTE_MANUAL',
              documentoRelacionadoId: 0, // Valor por defecto si no se proporciona
              usuarioId: req.usuario.id,
              observacion: `Ajuste manual - Stock: ${stockAnterior} → ${stockFloat}`,
              autorizado: true,
              autorizadoPorId: req.usuario.id
            });

            console.log('Movimiento de inventario registrado exitosamente:', movimiento);
          }
        } catch (movError) {
          console.error('Error al registrar movimiento:', movError.message);
          mensaje += ' (Sin registro de movimiento por error en BD)';
        }
      }
    }

    res.json({
      mensaje,
      inventario: {
        id: inventario.id,
        productoId: inventario.productoId,
        sucursalId: inventario.sucursalId,
        stock: parseInt(inventario.stock), 
        stockMinimo: parseInt(inventario.stockMinimo),
        precioVenta: inventario.precioVenta ? parseFloat(inventario.precioVenta) : null
      }
    });

  } catch (error) {
    console.error('Error al actualizar el inventario:', error);
    // Manejo específico para errores de FK
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        mensaje: 'Error de configuración de base de datos: restricciones de clave foránea incorrectas',
        error: 'Las restricciones FK apuntan a tablas incorrectas. Contacte al administrador.'
      });
    }
    res.status(500).json({
      mensaje: 'Error al actualizar el inventario',
      error: error.message
    });
  }
};
// Realizar traslado entre sucursales
exports.realizarTraslado = async (req, res) => {
  const {
    productoId,
    sucursalOrigenId,
    sucursalDestinoId,
    cantidad,
    observacion
  } = req.body; // Eliminado presentacionId

  // Iniciar transacción
  const t = await sequelize.transaction();
  try {
    // Verificar permisos (solo SuperAdmin, Admin y Almacenero pueden realizar traslados)
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Almacenero') {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para realizar traslados' });
    }

    // Si no es SuperAdmin, solo puede trasladar desde su sucursal
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.sucursalId !== parseInt(sucursalOrigenId)) {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para trasladar productos desde otras sucursales' });
    }

    // Verificar si el producto existe
    const producto = await Producto.findOne({
      where: { id: productoId, estado: true },
      transaction: t
    });
    if (!producto) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'El producto no existe o está inactivo' });
    }

    // Verificar si las sucursales existen
    const sucursalOrigen = await Sucursal.findOne({
      where: { id: sucursalOrigenId, estado: true },
      transaction: t
    });
    if (!sucursalOrigen) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'La sucursal de origen no existe o está inactiva' });
    }

    const sucursalDestino = await Sucursal.findOne({
      where: { id: sucursalDestinoId, estado: true },
      transaction: t
    });
    if (!sucursalDestino) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'La sucursal de destino no existe o está inactiva' });
    }

    // Verificar stock en sucursal de origen
    const inventarioOrigen = await Inventario.findOne({
      where: { productoId, sucursalId: sucursalOrigenId },
      transaction: t
    });
    if (!inventarioOrigen || inventarioOrigen.stock < cantidad) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'No hay suficiente stock en la sucursal de origen' });
    }

    // Buscar o crear inventario en sucursal de destino
    let inventarioDestino = await Inventario.findOne({
      where: { productoId, sucursalId: sucursalDestinoId },
      transaction: t
    });
    if (!inventarioDestino) {
      inventarioDestino = await Inventario.create({
        productoId,
        sucursalId: sucursalDestinoId,
        stock: 0,
        stockMinimo: 0,
        precioVenta: producto.precioVenta
      }, { transaction: t });
    }

    // Actualizar stock en ambas sucursales
    await inventarioOrigen.update({
      stock: inventarioOrigen.stock - cantidad
    }, { transaction: t });

    await inventarioDestino.update({
      stock: inventarioDestino.stock + cantidad
    }, { transaction: t });

    // Registrar el movimiento
    const movimiento = await MovimientoInventario.create({
      productoId,
      sucursalOrigenId,
      sucursalDestinoId,
      tipoMovimiento: 'TRASLADO',
      cantidad,
      stock: inventarioOrigen.stock - cantidad, // Stock después del movimiento en sucursal origen
      precioUnitario: inventarioOrigen.precioVenta || producto.precioVenta,
      documentoRelacionadoTipo: 'TRASLADO',
      documentoRelacionadoId: null,
      usuarioId: req.usuario.id,
      observacion: observacion || 'Traslado entre sucursales',
      comentarios: comentarios || null,
      fechaRegistro: fechaRegistro ? new Date(fechaRegistro) : null,
      referenciaId: referenciaId || null,
      autorizado: req.usuario.rol === 'SuperAdmin', // Solo SuperAdmin autoriza automáticamente
      autorizadoPorId: req.usuario.rol === 'SuperAdmin' ? req.usuario.id : null
    }, { transaction: t });

    // Confirmar transacción
    await t.commit();
    res.json({
      mensaje: 'Traslado realizado exitosamente',
      movimiento
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al realizar el traslado', error: error.message });
  }
};



// Obtener movimientos de inventario
// Obtener movimientos de inventario
exports.obtenerMovimientos = async (req, res) => {
  const { sucursalId, tipoMovimiento, fechaInicio, fechaFin } = req.query;
  try {
    // Construir condiciones de búsqueda
    const where = {};
    if (tipoMovimiento) {
      where.tipoMovimiento = tipoMovimiento;
    }
    if (fechaInicio && fechaFin) {
      where.createdAt = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
      };
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Si no es SuperAdmin, solo puede ver movimientos de su sucursal
      if (sucursalId && req.usuario.sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res.status(403).json({ mensaje: 'No tiene permisos para ver movimientos de otras sucursales' });
      }
      // Filtrar por sucursal del usuario (solo si tiene sucursal asignada)
      if (req.usuario.sucursalId) {
        where[Op.or] = [
          { sucursalOrigenId: req.usuario.sucursalId },
          { sucursalDestinoId: req.usuario.sucursalId }
        ];
      }
    } else if (sucursalId) {
      // Si es SuperAdmin y se especifica sucursalId, filtrar por esa sucursal
      where[Op.or] = [
        { sucursalOrigenId: sucursalId },
        { sucursalDestinoId: sucursalId }
      ];
    }

    // Eliminar la asociación con Presentacion
    const movimientos = await MovimientoInventario.findAll({
      where,
      include: [
        { model: Producto, attributes: ['id', 'nombre', 'codigo'] },
        { model: Sucursal, as: 'SucursalOrigen', attributes: ['id', 'nombre'] },
        { model: Sucursal, as: 'SucursalDestino', attributes: ['id', 'nombre'] }
        // Eliminado: { model: Presentacion, attributes: ['id', 'nombre', 'factor'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ movimientos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los movimientos', error: error.message });
  }
};

// Obtener productos con stock bajo
exports.obtenerProductosStockBajo = async (req, res) => {
  const { sucursalId } = req.params;

  try {
    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Si no es SuperAdmin, solo puede ver el inventario de su sucursal
      if (req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res.status(403).json({ mensaje: 'No tiene permisos para ver el inventario de otras sucursales' });
      }
    }

    // Verificar si la sucursal existe
    const sucursalExiste = await Sucursal.findOne({ 
      where: { id: sucursalId, estado: true } 
    });
    
    if (!sucursalExiste) {
      return res.status(404).json({ mensaje: 'La sucursal no existe o está inactiva' });
    }

    // Obtener productos con stock menor o igual al stock mínimo
    const productosStockBajo = await Inventario.findAll({
      where: { 
        sucursalId,
        [Op.and]: [
          { stock: { [Op.lte]: sequelize.col('stockMinimo') } },
          { stockMinimo: { [Op.gt]: 0 } } // Solo considerar productos con stock mínimo mayor a 0
        ]
      },
      include: [
        { 
          model: Producto, 
          attributes: ['id', 'nombre', 'codigo', 'unidadMedida'],
          where: { estado: true }
        }
      ]
    });

    res.json({ productosStockBajo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos con stock bajo', error: error.message });
  }
};

// Obtener inventario con búsqueda para el componente MovimientoInventario
exports.obtenerInventarioConBusqueda = async (req, res) => {
  try {
    const { search, sucursalId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Construir condiciones de búsqueda
    const whereConditions = {};
    const productoWhere = { estado: true };
    
    if (search) {
      productoWhere[Op.or] = [
        { codigo: { [Op.like]: `%${search}%` } },
        { nombre: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filtrar por sucursal específica si se proporciona
    if (sucursalId) {
      whereConditions.sucursalId = parseInt(sucursalId);
    }
    
    // Verificar permisos de sucursal
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      if (req.usuario.sucursalId) {
        // Si no es SuperAdmin, solo puede ver inventario de su sucursal
        whereConditions.sucursalId = req.usuario.sucursalId;
      }
    }
    
    const { count, rows: inventario } = await Inventario.findAndCountAll({
      where: whereConditions,
      include: [
        { 
          model: Producto, 
          attributes: ['id', 'nombre', 'codigo', 'unidadMedida', 'precioVenta'],
          where: productoWhere,
          required: true
        },
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre', 'direccion'],
          where: { estado: true },
          required: true
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']]
    });
    
    res.json({ 
      inventario,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el inventario', error: error.message });
  }
};

// Obtener productos activos para selects
exports.obtenerProductosActivos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { estado: true },
      attributes: ['id', 'nombre', 'codigo', 'unidadMedida', 'precioVenta'],
      order: [['nombre', 'ASC']]
    });
    
    res.json({ productos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
};

// Obtener sucursales activas para selects
exports.obtenerSucursalesActivas = async (req, res) => {
  try {
    let sucursales;
    
    // Si es SuperAdmin, puede ver todas las sucursales
    if (req.usuario && req.usuario.rol === 'SuperAdmin') {
      sucursales = await Sucursal.findAll({
        where: { estado: true },
        attributes: ['id', 'nombre', 'direccion'],
        order: [['nombre', 'ASC']]
      });
    } else {
      // Si no es SuperAdmin, solo puede ver su sucursal
      sucursales = await Sucursal.findAll({
        where: { 
          estado: true,
          id: req.usuario.sucursalId 
        },
        attributes: ['id', 'nombre', 'direccion'],
        order: [['nombre', 'ASC']]
      });
    }
    
    res.json({ sucursales });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener sucursales', error: error.message });
  }
};

// Trasladar producto entre almacenes
exports.trasladarProducto = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      productoId, 
      sucursalOrigenId, 
      sucursalDestinoId, 
      cantidad, 
      motivo,
      observacion,
      comentarios,
      fechaRegistro,
      referenciaId 
    } = req.body;
    
    // Validaciones
    if (!productoId || !sucursalOrigenId || !sucursalDestinoId || !cantidad) {
      return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
    }
    
    if (cantidad <= 0) {
      return res.status(400).json({ mensaje: 'La cantidad debe ser mayor a 0' });
    }
    
    if (sucursalOrigenId === sucursalDestinoId) {
      return res.status(400).json({ mensaje: 'La sucursal origen y destino no pueden ser la misma' });
    }
    
    // Verificar permisos
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin' && req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para realizar traslados' });
    }
    
    // Verificar stock en sucursal origen
    const inventarioOrigen = await Inventario.findOne({
      where: { productoId, sucursalId: sucursalOrigenId },
      transaction
    });
    
    if (!inventarioOrigen || inventarioOrigen.stock < cantidad) {
      return res.status(400).json({ mensaje: 'Stock insuficiente en la sucursal origen' });
    }
    
    // Actualizar stock en sucursal origen (restar)
    await inventarioOrigen.update({
      stock: inventarioOrigen.stock - cantidad
    }, { transaction });
    
    // Buscar o crear inventario en sucursal destino
    let inventarioDestino = await Inventario.findOne({
      where: { productoId, sucursalId: sucursalDestinoId },
      transaction
    });
    
    if (inventarioDestino) {
      // Actualizar stock existente (sumar)
      await inventarioDestino.update({
        stock: inventarioDestino.stock + cantidad
      }, { transaction });
    } else {
      // Crear nuevo registro de inventario
      inventarioDestino = await Inventario.create({
        productoId,
        sucursalId: sucursalDestinoId,
        stock: cantidad,
        stockMinimo: 0
      }, { transaction });
    }
    
    // Registrar movimiento de salida
    await MovimientoInventario.create({
      productoId,
      sucursalOrigenId,
      sucursalDestinoId,
      tipoMovimiento: 'TRASLADO',
      cantidad: -cantidad, // Negativo para salida
      stock: inventarioOrigen.stock - cantidad, // Stock después del movimiento en sucursal origen
      documentoRelacionadoTipo: 'TRASLADO',
      usuarioId: req.usuario.id,
      observacion: observacion || motivo || 'Traslado entre sucursales',
      autorizado: true,
      autorizadoPorId: req.usuario.id
    }, { transaction });
    
    // Registrar movimiento de entrada
    await MovimientoInventario.create({
      productoId,
      sucursalOrigenId: sucursalDestinoId,
      sucursalDestinoId: null,
      tipoMovimiento: 'ENTRADA',
      cantidad: cantidad, // Positivo para entrada
      stock: inventarioDestino.stock, // Stock después del movimiento en sucursal destino
      documentoRelacionadoTipo: 'TRASLADO',
      usuarioId: req.usuario.id,
      observacion: observacion || motivo || 'Traslado entre sucursales',
      autorizado: true,
      autorizadoPorId: req.usuario.id
    }, { transaction });
    
    await transaction.commit();
    
    res.json({ 
      mensaje: 'Traslado realizado exitosamente',
      inventarioOrigen: inventarioOrigen.stock,
      inventarioDestino: inventarioDestino.stock
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ mensaje: 'Error al realizar el traslado', error: error.message });
  }
};

// Remover producto del inventario
exports.removerProducto = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      productoId, 
      sucursalId, 
      cantidad, 
      motivo,
      observacion,
      comentarios,
      fechaRegistro,
      referenciaId
    } = req.body;
    
    // Validaciones
    if (!productoId || !sucursalId || !cantidad) {
      return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
    }
    
    if (cantidad <= 0) {
      return res.status(400).json({ mensaje: 'La cantidad debe ser mayor a 0' });
    }
    
    // Verificar permisos
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin' && req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para remover productos' });
    }
    
    // Verificar stock
    const inventario = await Inventario.findOne({
      where: { productoId, sucursalId },
      transaction
    });
    
    if (!inventario || inventario.stock < cantidad) {
      return res.status(400).json({ mensaje: 'Stock insuficiente' });
    }
    
    // Actualizar stock
    await inventario.update({
      stock: inventario.stock - cantidad
    }, { transaction });
    
    // Registrar movimiento
    await MovimientoInventario.create({
      productoId,
      sucursalOrigenId: sucursalId,
      tipoMovimiento: 'SALIDA',
      cantidad: -cantidad, // Negativo para salida
      stock: inventario.stock - cantidad, // Stock después del movimiento
      documentoRelacionadoTipo: 'AJUSTE',
      usuarioId: req.usuario.id,
      observacion: observacion || motivo || 'Remoción de producto',
      comentarios: comentarios || null,
      fechaRegistro: fechaRegistro ? new Date(fechaRegistro) : null,
      referenciaId: referenciaId || null,
      autorizado: true,
      autorizadoPorId: req.usuario.id
    }, { transaction });
    
    await transaction.commit();
    
    res.json({ 
      mensaje: 'Producto removido exitosamente',
      stockActual: inventario.stock
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ mensaje: 'Error al remover el producto', error: error.message });
  }
};

// Ajustar stock de producto
exports.ajustarStock = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      productoId, 
      sucursalId, 
      stockReal, 
      observacion,
      comentarios,
      fechaRegistro,
      referenciaId
    } = req.body;
    
    // Validaciones
    if (!productoId || !sucursalId || stockReal === undefined || stockReal === null) {
      return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
    }
    
    if (stockReal < 0) {
      return res.status(400).json({ mensaje: 'El stock real no puede ser negativo' });
    }
    
    // Verificar permisos
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin' && req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para ajustar stock' });
    }
    
    // Buscar o crear inventario
    let inventario = await Inventario.findOne({
      where: { productoId, sucursalId },
      transaction
    });
    
    let stockAnterior = 0;
    let diferencia = 0;
    
    if (inventario) {
      stockAnterior = inventario.stock;
      diferencia = stockReal - stockAnterior;
      
      await inventario.update({
        stock: stockReal
      }, { transaction });
    } else {
      // Crear nuevo registro
      inventario = await Inventario.create({
        productoId,
        sucursalId,
        stock: stockReal,
        stockMinimo: 0
      }, { transaction });
      
      diferencia = stockReal;
    }
    
    // Registrar movimiento solo si hay diferencia
    if (diferencia !== 0) {
      await MovimientoInventario.create({
        productoId,
        sucursalOrigenId: sucursalId,
        tipoMovimiento: 'AJUSTE',
        cantidad: diferencia,
        stock: stockReal, // Stock después del ajuste
        documentoRelacionadoTipo: 'AJUSTE',
        usuarioId: req.usuario.id,
        observacion: observacion || `Ajuste de stock. Stock anterior: ${stockAnterior}, Stock nuevo: ${stockReal}`,
        comentarios: comentarios || null,
        fechaRegistro: fechaRegistro ? new Date(fechaRegistro) : null,
        referenciaId: referenciaId || null,
        autorizado: true,
        autorizadoPorId: req.usuario.id
      }, { transaction });
    }
    
    await transaction.commit();
    
    res.json({ 
      mensaje: 'Stock ajustado exitosamente',
      stockAnterior,
      stockNuevo: stockReal,
      diferencia
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ mensaje: 'Error al ajustar el stock', error: error.message });
  }
};

// Ingresar producto al inventario
exports.ingresarProducto = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      productoId, 
      sucursalId, 
      cantidad, 
      motivo,
      observacion,
      fechaRegistro,
      comentarios,
      referenciaId
    } = req.body;
    
    // Validaciones
    if (!productoId || !sucursalId || !cantidad) {
      return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
    }
    
    if (cantidad <= 0) {
      return res.status(400).json({ mensaje: 'La cantidad debe ser mayor a 0' });
    }
    
    // Verificar permisos
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin' && req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para ingresar productos' });
    }
    
    // Buscar o crear inventario
    let inventario = await Inventario.findOne({
      where: { productoId, sucursalId },
      transaction
    });
    
    let stockFinal;
    
    if (inventario) {
      // Actualizar stock existente
      stockFinal = inventario.stock + cantidad;
      await inventario.update({
        stock: stockFinal
      }, { transaction });
      // Recargar el inventario para obtener los datos actualizados
      await inventario.reload({ transaction });
    } else {
      // Crear nuevo registro
      stockFinal = cantidad;
      inventario = await Inventario.create({
        productoId,
        sucursalId,
        stock: stockFinal,
        stockMinimo: 0
      }, { transaction });
    }
    
    // Registrar movimiento
    const movimiento = await MovimientoInventario.create({
      productoId,
      sucursalOrigenId: sucursalId,
      tipoMovimiento: 'ENTRADA',
      cantidad: cantidad,
      stock: stockFinal, // Stock después del movimiento
      documentoRelacionadoTipo: 'INGRESO',
      usuarioId: req.usuario.id,
      observacion: observacion || motivo || 'Ingreso de producto',
      comentarios: comentarios || null,
      fechaRegistro: fechaRegistro ? new Date(fechaRegistro) : null,
      referenciaId: referenciaId || null,
      autorizado: true,
      autorizadoPorId: req.usuario.id
    }, { transaction });
    
    // Si se especifica fecha de registro, actualizarla
    if (fechaRegistro) {
      await movimiento.update({
        createdAt: new Date(fechaRegistro)
      }, { transaction });
    }
    
    await transaction.commit();
    
    res.json({ 
      mensaje: 'Producto ingresado exitosamente',
      stockActual: stockFinal
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ mensaje: 'Error al ingresar el producto', error: error.message });
  }
};

// Generar PDF de traslado
exports.generarPdfTraslado = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el movimiento de traslado con todas las relaciones necesarias
    const traslado = await MovimientoInventario.findOne({
      where: { 
        id: id,
        tipoMovimiento: 'TRASLADO'
      },
      include: [
        {
          model: Producto,
          attributes: ['id', 'nombre', 'codigo', 'descripcion']
        },
        {
          model: Sucursal,
          as: 'SucursalOrigen',
          attributes: ['id', 'nombre', 'direccion', 'telefono']
        },
        {
          model: Sucursal,
          as: 'SucursalDestino',
          attributes: ['id', 'nombre', 'direccion', 'telefono']
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'correo']
        }
      ]
    });

    if (!traslado) {
      return res.status(404).json({ mensaje: 'Traslado no encontrado' });
    }

    // Verificar permisos - solo puede ver traslados de su sucursal (excepto SuperAdmin)
    if (req.usuario.rol !== 'SuperAdmin') {
      if (traslado.sucursalOrigenId !== req.usuario.sucursalId && 
          traslado.sucursalDestinoId !== req.usuario.sucursalId) {
        return res.status(403).json({ mensaje: 'No tiene permisos para ver este traslado' });
      }
    }

    // Generar el PDF
    const filePath = await TrasladoPdfService.generateTrasladoPDF(
      traslado,
      traslado.SucursalOrigen,
      traslado.SucursalDestino,
      traslado.Producto,
      traslado.Usuario
    );

    // Configurar headers para descarga
    const fileName = `traslado-${traslado.id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Enviar el archivo
    res.sendFile(path.resolve(filePath), (err) => {
      if (err) {
        console.error('Error al enviar el archivo:', err);
        if (!res.headersSent) {
          res.status(500).json({ mensaje: 'Error al descargar el PDF' });
        }
      }
      
      // Opcional: eliminar el archivo después de enviarlo
      // fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error('Error al generar PDF de traslado:', error);
    res.status(500).json({ mensaje: 'Error al generar el PDF', error: error.message });
  }
};







// Exportar revisión de inventario a Excel
exports.exportarRevisionInventarioExcel = async (req, res) => {
  try {
    const { sucursalId, categoriaId, search } = req.query;
    const ExcelJS = require('exceljs');
    
    // Construir condiciones de filtro
    const whereConditions = {};
    const productoWhere = { estado: true };
    
    if (sucursalId) {
      whereConditions.sucursalId = sucursalId;
    }
    
    if (search) {
      productoWhere[Op.or] = [
        { codigo: { [Op.like]: `%${search}%` } },
        { nombre: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filtro por categoría
    if (categoriaId) {
      productoWhere.categoriaId = categoriaId;
    }
    
    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      if (req.usuario.sucursalId) {
        whereConditions.sucursalId = req.usuario.sucursalId;
      }
    }
    
    const inventario = await Inventario.findAll({
      where: whereConditions,
      include: [
        { 
          model: Producto, 
          where: productoWhere,
          attributes: ['id', 'codigo', 'nombre', 'descripcion']
        },
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['id', 'ASC']]
    });
    
    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Revisión de Inventario');
    
    // Configurar columnas
    worksheet.columns = [
      { header: 'Código de Barras', key: 'codigo', width: 15 },
      { header: 'Producto', key: 'producto', width: 30 },
      { header: 'Sucursal', key: 'sucursal', width: 20 },
      { header: 'Stock del Sistema', key: 'stockSistema', width: 18 },
      { header: 'Diferencia de Stock', key: 'diferencia', width: 12 }
    ];
    
    // Agregar datos
    inventario.forEach(item => {
      worksheet.addRow({
        codigo: item.Producto.codigo,
        producto: item.Producto.nombre,
        sucursal: item.Sucursal.nombre,
        stockSistema: item.stock,
        diferencia: item.stock,
      });
    });
    
    // Estilo del header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Configurar respuesta
    const fileName = `revision_inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Enviar archivo
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    res.status(500).json({ mensaje: 'Error al exportar archivo Excel', error: error.message });
  }
};






// Exportar revisión de inventario a PDF
exports.exportarRevisionInventarioPdf = async (req, res) => {
  try {
    const { sucursalId, categoriaId, search } = req.query;
    const PDFDocument = require('pdfkit');
    
    // Construir condiciones de filtro
    const whereConditions = {};
    const productoWhere = { estado: true };
    
    if (sucursalId) {
      whereConditions.sucursalId = sucursalId;
    }
    
    if (search) {
      productoWhere[Op.or] = [
        { codigo: { [Op.like]: `%${search}%` } },
        { nombre: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filtro por categoría
    if (categoriaId) {
      productoWhere.categoriaId = categoriaId;
    }
    
    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      if (req.usuario.sucursalId) {
        whereConditions.sucursalId = req.usuario.sucursalId;
      }
    }
    
    const inventario = await Inventario.findAll({
      where: whereConditions,
      include: [
        { 
          model: Producto, 
          where: productoWhere,
          attributes: ['id', 'codigo', 'nombre', 'descripcion']
        },
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre'] 
        }
      ],
      order: [['id', 'ASC']]
    });
    
    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Configurar respuesta
    const fileName = `revision_inventario_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Pipe del documento a la respuesta
    doc.pipe(res);
    
    // Título
    doc.fontSize(18).font('Helvetica-Bold').text('REVISIÓN DE INVENTARIO', { align: 'center' });
    doc.moveDown();
    
    // Fecha
    doc.fontSize(12).font('Helvetica').text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();
    
    // Headers de la tabla
    const startY = doc.y;
    const colWidths = [80, 120, 120, 80, 120];
    const headers = ['Código', 'Producto', 'Sucursal', 'Stock Sistema', 'Diferencia Stock'];
    
    let currentX = 50;
    headers.forEach((header, index) => {
      doc.fontSize(10).font('Helvetica-Bold')
         .rect(currentX, startY, colWidths[index], 20)
         .stroke()
         .text(header, currentX + 5, startY + 5, { width: colWidths[index] - 10 });
      currentX += colWidths[index];
    });
    
    // Datos de la tabla
    let currentY = startY + 20;
    inventario.forEach(item => {
      currentX = 50;
      const rowData = [
        item.Producto.codigo,
        item.Producto.nombre.substring(0, 30), // Limitar longitud
        item.Sucursal.nombre,
        item.stock.toString(),
        item.stock.toString(), 
      ];
      
      rowData.forEach((data, index) => {
        doc.fontSize(9).font('Helvetica')
           .rect(currentX, currentY, colWidths[index], 15)
           .stroke()
           .text(data, currentX + 5, currentY + 2, { width: colWidths[index] - 10 });
        currentX += colWidths[index];
      });
      
      currentY += 15;
      
      // Nueva página si es necesario
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });
    
    // Finalizar documento
    doc.end();
    
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    res.status(500).json({ mensaje: 'Error al exportar archivo PDF', error: error.message });
  }
};








// Obtener stock histórico con filtros de fecha
exports.obtenerStockHistorico = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta, sucursalId, search, page = 1, limit = 20 } = req.query;
    
    // Validar fechas
    if (!fechaDesde || !fechaHasta) {
      return res.status(400).json({ mensaje: 'Las fechas desde y hasta son requeridas' });
    }
    
    const fechaInicio = new Date(fechaDesde);
    const fechaFin = new Date(fechaHasta);
    fechaFin.setHours(23, 59, 59, 999); // Incluir todo el día final
    
    // Verificar permisos
    let sucursalFiltro = {};
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      if (req.usuario.sucursalId) {
        sucursalFiltro.sucursalOrigenId = req.usuario.sucursalId;
      }
    } else if (sucursalId) {
      sucursalFiltro.sucursalOrigenId = sucursalId;
    }
    
    // Construir condiciones de búsqueda
    const whereConditions = {
      createdAt: {
        [Op.between]: [fechaInicio, fechaFin]
      },
      ...sucursalFiltro
    };
    
    // Condiciones para búsqueda de productos
    const productoWhere = { estado: true };
    if (search) {
      productoWhere[Op.or] = [
        { codigo: { [Op.like]: `%${search}%` } },
        { nombre: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Obtener movimientos de inventario en el rango de fechas
    const movimientos = await MovimientoInventario.findAll({
      where: whereConditions,
      include: [
        {
          model: Producto,
          where: productoWhere,
          attributes: ['id', 'codigo', 'nombre', 'precioVenta']
        },
        {
          model: Sucursal,
          as: 'SucursalOrigen',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    // Agrupar movimientos por producto
    const productosMap = new Map();
    
    for (const movimiento of movimientos) {
      const productoId = movimiento.productoId;
      const producto = movimiento.Producto;
      
      if (!productosMap.has(productoId)) {
        // Obtener stock anterior (antes del rango de fechas)
        const stockAnterior = await this.calcularStockAnterior(productoId, sucursalFiltro.sucursalOrigenId || null, fechaInicio);
        
        productosMap.set(productoId, {
          id: productoId,
          producto: producto.nombre,
          codigo: producto.codigo,
          precioVenta: producto.precioVenta || 0,
          fisico: {
            ingreso: 0,
            salida: 0,
            saldo: 0,
            saldoAnterior: stockAnterior.cantidad,
            saldoTotal: stockAnterior.cantidad
          },
          valorizado: {
            ingreso: 0,
            salida: 0,
            saldo: 0,
            saldoAnterior: stockAnterior.valor,
            saldoTotal: stockAnterior.valor
          }
        });
      }
      
      const item = productosMap.get(productoId);
      const precioUnitario = movimiento.precioUnitario || producto.precioVenta || 0;
      const valorMovimiento = movimiento.cantidad * precioUnitario;
      
      // Procesar según tipo de movimiento
      if (movimiento.tipoMovimiento === 'ENTRADA' || movimiento.tipoMovimiento === 'TRASLADO') {
        if (movimiento.sucursalDestinoId === (sucursalFiltro.sucursalOrigenId || movimiento.sucursalOrigenId)) {
          // Es una entrada a esta sucursal
          item.fisico.ingreso += movimiento.cantidad;
          item.valorizado.ingreso += valorMovimiento;
        } else {
          // Es una salida de esta sucursal
          item.fisico.salida += movimiento.cantidad;
          item.valorizado.salida += valorMovimiento;
        }
      } else if (movimiento.tipoMovimiento === 'SALIDA') {
        item.fisico.salida += movimiento.cantidad;
        item.valorizado.salida += valorMovimiento;
      } else if (movimiento.tipoMovimiento === 'AJUSTE') {
        if (movimiento.cantidad > 0) {
          item.fisico.ingreso += movimiento.cantidad;
          item.valorizado.ingreso += valorMovimiento;
        } else {
          item.fisico.salida += Math.abs(movimiento.cantidad);
          item.valorizado.salida += Math.abs(valorMovimiento);
        }
      }
      
      // Calcular saldos
      item.fisico.saldo = item.fisico.ingreso - item.fisico.salida;
      item.fisico.saldoTotal = item.fisico.saldoAnterior + item.fisico.saldo;
      
      item.valorizado.saldo = item.valorizado.ingreso - item.valorizado.salida;
      item.valorizado.saldoTotal = item.valorizado.saldoAnterior + item.valorizado.saldo;
    }
    
    // Convertir Map a Array y aplicar paginación
    const stockHistorico = Array.from(productosMap.values());
    const offset = (page - 1) * limit;
    const paginatedData = stockHistorico.slice(offset, offset + parseInt(limit));
    
    res.json({
      stockHistorico: paginatedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(stockHistorico.length / limit),
        totalItems: stockHistorico.length,
        itemsPerPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error al obtener stock histórico:', error);
    res.status(500).json({ mensaje: 'Error al obtener stock histórico', error: error.message });
  }
};

// Función auxiliar para calcular stock anterior
exports.calcularStockAnterior = async (productoId, sucursalId, fechaLimite) => {
  try {
    const whereConditions = {
      productoId,
      createdAt: { [Op.lt]: fechaLimite }
    };
    
    if (sucursalId) {
      whereConditions.sucursalOrigenId = sucursalId;
    }
    
    const movimientos = await MovimientoInventario.findAll({
      where: whereConditions,
      include: [
        {
          model: Producto,
          attributes: ['precioVenta']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    let stockAnterior = 0;
    let valorAnterior = 0;
    
    for (const movimiento of movimientos) {
      const precioUnitario = movimiento.precioUnitario || movimiento.Producto?.precioVenta || 0;
      
      if (movimiento.tipoMovimiento === 'ENTRADA' || 
          (movimiento.tipoMovimiento === 'TRASLADO' && movimiento.sucursalDestinoId === sucursalId)) {
        stockAnterior += movimiento.cantidad;
        valorAnterior += movimiento.cantidad * precioUnitario;
      } else if (movimiento.tipoMovimiento === 'SALIDA' || 
                 (movimiento.tipoMovimiento === 'TRASLADO' && movimiento.sucursalOrigenId === sucursalId)) {
        stockAnterior -= movimiento.cantidad;
        valorAnterior -= movimiento.cantidad * precioUnitario;
      } else if (movimiento.tipoMovimiento === 'AJUSTE') {
        stockAnterior += movimiento.cantidad; // cantidad puede ser negativa
        valorAnterior += movimiento.cantidad * precioUnitario;
      }
    }
    
    return {
      cantidad: stockAnterior,
      valor: valorAnterior
    };
  } catch (error) {
    console.error('Error al calcular stock anterior:', error);
    return { cantidad: 0, valor: 0 };
  }
};










// Exportar stock histórico a Excel
exports.exportarStockHistoricoExcel = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta, sucursalId, search } = req.query;
    const ExcelJS = require('exceljs');
    
    // Validar fechas
    if (!fechaDesde || !fechaHasta) {
      return res.status(400).json({ mensaje: 'Las fechas desde y hasta son requeridas' });
    }
    
    const fechaInicio = new Date(fechaDesde);
    const fechaFin = new Date(fechaHasta);
    fechaFin.setHours(23, 59, 59, 999);
    
    // Verificar permisos
    let sucursalFiltro = {};
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      if (req.usuario.sucursalId) {
        sucursalFiltro.sucursalOrigenId = req.usuario.sucursalId;
      }
    } else if (sucursalId) {
      sucursalFiltro.sucursalOrigenId = sucursalId;
    }
    
    // Construir condiciones de búsqueda
    const whereConditions = {
      createdAt: {
        [Op.between]: [fechaInicio, fechaFin]
      },
      ...sucursalFiltro
    };
    
    // Condiciones para búsqueda de productos
    const productoWhere = { estado: true };
    if (search) {
      productoWhere[Op.or] = [
        { codigo: { [Op.like]: `%${search}%` } },
        { nombre: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Obtener movimientos de inventario en el rango de fechas
    const movimientos = await MovimientoInventario.findAll({
      where: whereConditions,
      include: [
        {
          model: Producto,
          where: productoWhere,
          attributes: ['id', 'codigo', 'nombre', 'precioVenta']
        },
        {
          model: Sucursal,
          as: 'SucursalOrigen',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    // Agrupar movimientos por producto
    const productosMap = new Map();
    
    for (const movimiento of movimientos) {
      const productoId = movimiento.productoId;
      const producto = movimiento.Producto;
      
      if (!productosMap.has(productoId)) {
        // Obtener stock anterior
        const stockAnterior = await this.calcularStockAnterior(productoId, sucursalFiltro.sucursalOrigenId || null, fechaInicio);
        
        productosMap.set(productoId, {
          id: productoId,
          producto: producto.nombre,
          codigo: producto.codigo,
          precioVenta: producto.precioVenta || 0,
          fisico: {
            ingreso: 0,
            salida: 0,
            saldo: 0,
            saldoAnterior: stockAnterior.cantidad,
            saldoTotal: stockAnterior.cantidad
          },
          valorizado: {
            ingreso: 0,
            salida: 0,
            saldo: 0,
            saldoAnterior: stockAnterior.valor,
            saldoTotal: stockAnterior.valor
          }
        });
      }
      
      const item = productosMap.get(productoId);
      const precioUnitario = movimiento.precioUnitario || producto.precioVenta || 0;
      const valorMovimiento = movimiento.cantidad * precioUnitario;
      
      // Procesar según tipo de movimiento
      if (movimiento.tipoMovimiento === 'ENTRADA' || movimiento.tipoMovimiento === 'TRASLADO') {
        if (movimiento.sucursalDestinoId === (sucursalFiltro.sucursalOrigenId || movimiento.sucursalOrigenId)) {
          item.fisico.ingreso += movimiento.cantidad;
          item.valorizado.ingreso += valorMovimiento;
        } else {
          item.fisico.salida += movimiento.cantidad;
          item.valorizado.salida += valorMovimiento;
        }
      } else if (movimiento.tipoMovimiento === 'SALIDA') {
        item.fisico.salida += movimiento.cantidad;
        item.valorizado.salida += valorMovimiento;
      } else if (movimiento.tipoMovimiento === 'AJUSTE') {
        if (movimiento.cantidad > 0) {
          item.fisico.ingreso += movimiento.cantidad;
          item.valorizado.ingreso += valorMovimiento;
        } else {
          item.fisico.salida += Math.abs(movimiento.cantidad);
          item.valorizado.salida += Math.abs(valorMovimiento);
        }
      }
      
      // Calcular saldos
      item.fisico.saldo = item.fisico.ingreso - item.fisico.salida;
      item.fisico.saldoTotal = item.fisico.saldoAnterior + item.fisico.saldo;
      
      item.valorizado.saldo = item.valorizado.ingreso - item.valorizado.salida;
      item.valorizado.saldoTotal = item.valorizado.saldoAnterior + item.valorizado.saldo;
    }
    
    // Convertir Map a Array
    const stockHistorico = Array.from(productosMap.values());
    
    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Histórico');
    
    // Configurar columnas según el formato de la imagen
    worksheet.columns = [
      { header: 'Producto', key: 'producto', width: 30 },
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Saldo Anterior', key: 'saldoAnterior', width: 15 },
      { header: 'Ingreso', key: 'ingreso', width: 12 },
      { header: 'Salida', key: 'salida', width: 12 },
      { header: 'Saldo', key: 'saldo', width: 12 },
      { header: 'Saldo Total', key: 'saldoTotal', width: 15 },
      { header: 'Valor Anterior', key: 'valorAnterior', width: 15 },
      { header: 'Valor Ingreso', key: 'valorIngreso', width: 15 },
      { header: 'Valor Salida', key: 'valorSalida', width: 15 },
      { header: 'Valor Saldo', key: 'valorSaldo', width: 15 },
      { header: 'Valor Total', key: 'valorTotal', width: 15 }
    ];
    
    // Agregar datos
    stockHistorico.forEach(item => {
      worksheet.addRow({
        producto: item.producto,
        codigo: item.codigo,
        saldoAnterior: item.fisico.saldoAnterior,
        ingreso: item.fisico.ingreso,
        salida: item.fisico.salida,
        saldo: item.fisico.saldo,
        saldoTotal: item.fisico.saldoTotal,
        valorAnterior: item.valorizado.saldoAnterior.toFixed(2),
        valorIngreso: item.valorizado.ingreso.toFixed(2),
        valorSalida: item.valorizado.salida.toFixed(2),
        valorSaldo: item.valorizado.saldo.toFixed(2),
        valorTotal: item.valorizado.saldoTotal.toFixed(2)
      });
    });
    
    // Estilo del header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Configurar respuesta
    const fileName = `stock_historico_${fechaDesde}_${fechaHasta}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Enviar archivo
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Error al exportar stock histórico a Excel:', error);
    res.status(500).json({ mensaje: 'Error al exportar stock histórico a Excel', error: error.message });
  }
};










// Exportar kardex a Excel
exports.exportarKardexExcel = async (req, res) => {
  try {
    const { productoId, fechaInicio, fechaFin, sucursalId } = req.query;
    const usuario = req.usuario;

    // Validar que se proporcione el producto
    if (!productoId) {
      return res.status(400).json({ mensaje: 'El ID del producto es requerido' });
    }

    // Construir filtros para obtener movimientos
    const filtros = {
      productoId: productoId
    };

    if (fechaInicio) filtros.fechaInicio = fechaInicio;
    if (fechaFin) filtros.fechaFin = fechaFin;
    if (sucursalId) filtros.sucursalId = sucursalId;

    // Verificar permisos de usuario
    let whereClause = { productoId: productoId };
    
    if (fechaInicio && fechaFin) {
      whereClause.fechaRegistro = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
      };
    } else if (fechaInicio) {
      whereClause.fechaRegistro = {
        [Op.gte]: new Date(fechaInicio)
      };
    } else if (fechaFin) {
      whereClause.fechaRegistro = {
        [Op.lte]: new Date(fechaFin)
      };
    }

    // Aplicar filtros de sucursal según permisos
    if (usuario.rol !== 'SuperAdmin') {
      if (sucursalId) {
        whereClause[Op.or] = [
          { sucursalOrigenId: sucursalId },
          { sucursalDestinoId: sucursalId }
        ];
      } else {
        whereClause[Op.or] = [
          { sucursalOrigenId: usuario.sucursalId },
          { sucursalDestinoId: usuario.sucursalId }
        ];
      }
    } else if (sucursalId) {
      whereClause[Op.or] = [
        { sucursalOrigenId: sucursalId },
        { sucursalDestinoId: sucursalId }
      ];
    }

    // Obtener movimientos
    const movimientos = await MovimientoInventario.findAll({
      where: whereClause,
      include: [
        {
          model: Producto,
          attributes: ['nombre', 'codigo', 'unidadMedida']
        },
        {
          model: Sucursal,
          as: 'SucursalOrigen',
          attributes: ['nombre']
        },
        {
          model: Sucursal,
          as: 'SucursalDestino',
          attributes: ['nombre']
        }
      ],
      order: [['fechaRegistro', 'ASC'], ['id', 'ASC']]
    });

    // Obtener información del producto
    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Crear workbook de Excel
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Kardex');

    // Configurar encabezados
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="kardex_${producto.codigo}_${new Date().toISOString().split('T')[0]}.xlsx"`);

    // Título del reporte
    worksheet.mergeCells('A1:I1');
    worksheet.getCell('A1').value = `KARDEX - ${producto.nombre} (${producto.codigo})`;
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Información adicional
    worksheet.mergeCells('A2:I2');
    worksheet.getCell('A2').value = `Período: ${fechaInicio || 'Desde el inicio'} - ${fechaFin || 'Hasta la fecha'}`;
    worksheet.getCell('A2').font = { bold: true };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    // Encabezados de columnas
    const headers = [
      'Fecha',
      'Tipo Movimiento',
      'Número',
      'Sucursal Origen',
      'Sucursal Destino',
      'Entradas',
      'Salidas',
      'Stock',
      'Costo Unit.',
      'Total'
    ];

    worksheet.addRow([]);
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Calcular kardex con stock acumulado
    let stockAcumulado = 0;
    const kardexData = [];

    for (const movimiento of movimientos) {
      let entrada = 0;
      let salida = 0;
      
      if (movimiento.tipoMovimiento === 'ENTRADA') {
        entrada = movimiento.cantidad;
      } else if (movimiento.tipoMovimiento === 'SALIDA') {
        salida = movimiento.cantidad;
      } else if (movimiento.tipoMovimiento === 'TRASLADO') {
        // Para traslados, verificar si es entrada o salida según la sucursal
        if (movimiento.sucursalDestinoId === parseInt(sucursalId)) {
          entrada = movimiento.cantidad;
        } else if (movimiento.sucursalOrigenId === parseInt(sucursalId)) {
          salida = movimiento.cantidad;
        }
      } else if (movimiento.tipoMovimiento === 'AJUSTE') {
        // Para ajustes, verificar si es positivo o negativo
        if (movimiento.cantidad > 0) {
          entrada = movimiento.cantidad;
        } else {
          salida = Math.abs(movimiento.cantidad);
        }
      }
      
      stockAcumulado += entrada - salida;

      kardexData.push({
        fecha: movimiento.fechaRegistro ? new Date(movimiento.fechaRegistro) : new Date(movimiento.createdAt),
        tipoMovimiento: movimiento.tipoMovimiento,
        numero: movimiento.documentoRelacionadoId || '-',
        sucursalOrigen: movimiento.SucursalOrigen?.nombre || '-',
        sucursalDestino: movimiento.SucursalDestino?.nombre || '-',
        entrada: entrada,
        salida: salida,
        stock: stockAcumulado,
        costoUnitario: movimiento.precioUnitario || 0,
        total: (movimiento.precioUnitario || 0) * movimiento.cantidad
      });
    }

    // Agregar datos al worksheet
    kardexData.forEach(item => {
      worksheet.addRow([
        item.fecha.toLocaleDateString(),
        item.tipoMovimiento,
        item.numero,
        item.sucursalOrigen,
        item.sucursalDestino,
        item.entrada || '',
        item.salida || '',
        item.stock,
        item.costoUnitario,
        item.total
      ]);
    });

    // Ajustar ancho de columnas
    worksheet.columns.forEach(column => {
      column.width = 15;
    });

    // Escribir archivo
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error al exportar kardex a Excel:', error);
    res.status(500).json({ mensaje: 'Error al exportar kardex a Excel', error: error.message });
  }
};







// Exportar kardex a PDF
exports.exportarKardexPdf = async (req, res) => {
  try {
    const { productoId, fechaInicio, fechaFin, sucursalId } = req.query;
    const usuario = req.usuario;

    // Validar que se proporcione el producto
    if (!productoId) {
      return res.status(400).json({ mensaje: 'El ID del producto es requerido' });
    }

    // Construir filtros para obtener movimientos (misma lógica que Excel)
    let whereClause = { productoId: productoId };
    
    if (fechaInicio && fechaFin) {
      whereClause.fechaRegistro = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
      };
    } else if (fechaInicio) {
      whereClause.fechaRegistro = {
        [Op.gte]: new Date(fechaInicio)
      };
    } else if (fechaFin) {
      whereClause.fechaRegistro = {
        [Op.lte]: new Date(fechaFin)
      };
    }

    // Aplicar filtros de sucursal según permisos
    if (usuario.rol !== 'SuperAdmin') {
      if (sucursalId) {
        whereClause[Op.or] = [
          { sucursalOrigenId: sucursalId },
          { sucursalDestinoId: sucursalId }
        ];
      } else {
        whereClause[Op.or] = [
          { sucursalOrigenId: usuario.sucursalId },
          { sucursalDestinoId: usuario.sucursalId }
        ];
      }
    } else if (sucursalId) {
      whereClause[Op.or] = [
        { sucursalOrigenId: sucursalId },
        { sucursalDestinoId: sucursalId }
      ];
    }

    // Obtener movimientos
    const movimientos = await MovimientoInventario.findAll({
      where: whereClause,
      include: [
        {
          model: Producto,
          attributes: ['nombre', 'codigo', 'unidadMedida']
        },
        {
          model: Sucursal,
          as: 'SucursalOrigen',
          attributes: ['nombre']
        },
        {
          model: Sucursal,
          as: 'SucursalDestino',
          attributes: ['nombre']
        }
      ],
      order: [['fechaRegistro', 'ASC'], ['id', 'ASC']]
    });

    // Obtener información del producto
    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Crear PDF
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });

    // Configurar headers de respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="kardex_${producto.codigo}_${new Date().toISOString().split('T')[0]}.pdf"`);

    // Pipe del documento al response
    doc.pipe(res);

    // Título
    doc.fontSize(16).font('Helvetica-Bold');
    doc.text(`KARDEX - ${producto.nombre} (${producto.codigo})`, { align: 'center' });
    doc.moveDown();

    // Período
    doc.fontSize(12).font('Helvetica');
    doc.text(`Período: ${fechaInicio || 'Desde el inicio'} - ${fechaFin || 'Hasta la fecha'}`, { align: 'center' });
    doc.moveDown(2);

    // Calcular kardex con stock acumulado
    let stockAcumulado = 0;
    const kardexData = [];

    for (const movimiento of movimientos) {
      let entrada = 0;
      let salida = 0;
      
      if (movimiento.tipoMovimiento === 'ENTRADA') {
        entrada = movimiento.cantidad;
      } else if (movimiento.tipoMovimiento === 'SALIDA') {
        salida = movimiento.cantidad;
      } else if (movimiento.tipoMovimiento === 'TRASLADO') {
        // Para traslados, verificar si es entrada o salida según la sucursal
        if (movimiento.sucursalDestinoId === parseInt(sucursalId)) {
          entrada = movimiento.cantidad;
        } else if (movimiento.sucursalOrigenId === parseInt(sucursalId)) {
          salida = movimiento.cantidad;
        }
      } else if (movimiento.tipoMovimiento === 'AJUSTE') {
        // Para ajustes, verificar si es positivo o negativo
        if (movimiento.cantidad > 0) {
          entrada = movimiento.cantidad;
        } else {
          salida = Math.abs(movimiento.cantidad);
        }
      }
      
      stockAcumulado += entrada - salida;

      kardexData.push({
        fecha: movimiento.fechaRegistro ? new Date(movimiento.fechaRegistro).toLocaleDateString() : new Date(movimiento.createdAt).toLocaleDateString(),
        tipoMovimiento: movimiento.tipoMovimiento,
        numero: movimiento.documentoRelacionadoId || '-',
        entrada: entrada || '',
        salida: salida || '',
        stock: stockAcumulado
      });
    }

    // Tabla de datos
    const tableTop = doc.y;
    const tableLeft = 50;
    const rowHeight = 20;

    // Encabezados
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Fecha', tableLeft, tableTop);
    doc.text('Tipo', tableLeft + 80, tableTop);
    doc.text('Número', tableLeft + 160, tableTop);
    doc.text('Entradas', tableLeft + 220, tableTop);
    doc.text('Salidas', tableLeft + 280, tableTop);
    doc.text('Stock', tableLeft + 340, tableTop);

    // Línea separadora
    doc.moveTo(tableLeft, tableTop + 15)
       .lineTo(tableLeft + 400, tableTop + 15)
       .stroke();

    // Datos
    doc.font('Helvetica');
    let currentY = tableTop + 25;

    kardexData.forEach((item, index) => {
      if (currentY > 700) { // Nueva página si es necesario
        doc.addPage();
        currentY = 50;
      }

      doc.text(item.fecha, tableLeft, currentY);
      doc.text(item.tipoMovimiento.substring(0, 12), tableLeft + 80, currentY);
      doc.text(item.numero, tableLeft + 160, currentY);
      doc.text(item.entrada.toString(), tableLeft + 220, currentY);
      doc.text(item.salida.toString(), tableLeft + 280, currentY);
      doc.text(item.stock.toString(), tableLeft + 340, currentY);

      currentY += rowHeight;
    });

    // Finalizar documento
    doc.end();

  } catch (error) {
    console.error('Error al exportar kardex a PDF:', error);
    res.status(500).json({ mensaje: 'Error al exportar kardex a PDF', error: error.message });
  }
};