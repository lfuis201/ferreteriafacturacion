const { Almacen, Sucursal, InventarioAlmacen, Producto } = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * tags:
 *   name: Almacenes
 *   description: Gestión de almacenes
 */

/**
 * @swagger
 * /api/almacenes:
 *   get:
 *     summary: Obtener todos los almacenes
 *     tags: [Almacenes]
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: Filtrar por sucursal
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [PRINCIPAL, TALLER, MOSTRADOR, DEPOSITO, OTRO]
 *         description: Filtrar por tipo de almacén
 *       - in: query
 *         name: estado
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de almacenes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Almacen'
 */
const obtenerAlmacenes = async (req, res) => {
  try {
    const { sucursalId, tipo, estado } = req.query;
    
    const whereClause = {};
    
    if (sucursalId) {
      whereClause.sucursalId = sucursalId;
    }
    
    if (tipo) {
      whereClause.tipo = tipo;
    }
    
    if (estado !== undefined) {
      whereClause.estado = estado === 'true';
    }

    const almacenes = await Almacen.findAll({
      where: whereClause,
      include: [
        {
          model: Sucursal,
          attributes: ['id', 'nombre', 'ubicacion']
        }
      ],
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
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/almacenes/{id}:
 *   get:
 *     summary: Obtener un almacén por ID
 *     tags: [Almacenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del almacén
 *     responses:
 *       200:
 *         description: Datos del almacén
 *       404:
 *         description: Almacén no encontrado
 */
const obtenerAlmacenPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const almacen = await Almacen.findByPk(id, {
      include: [
        {
          model: Sucursal,
          attributes: ['id', 'nombre', 'ubicacion']
        }
      ]
    });

    if (!almacen) {
      return res.status(404).json({
        success: false,
        message: 'Almacén no encontrado'
      });
    }

    res.json({
      success: true,
      data: almacen
    });
  } catch (error) {
    console.error('Error al obtener almacén:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/almacenes:
 *   post:
 *     summary: Crear un nuevo almacén
 *     tags: [Almacenes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Almacen'
 *     responses:
 *       201:
 *         description: Almacén creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
const crearAlmacen = async (req, res) => {
  try {
    const { nombre, descripcion, ubicacion, sucursalId, tipo } = req.body;

    // Validaciones
    if (!nombre || !sucursalId) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y la sucursal son obligatorios'
      });
    }

    // Verificar que la sucursal existe
    const sucursal = await Sucursal.findByPk(sucursalId);
    if (!sucursal) {
      return res.status(400).json({
        success: false,
        message: 'La sucursal especificada no existe'
      });
    }

    // Verificar que no existe otro almacén con el mismo nombre en la misma sucursal
    const almacenExistente = await Almacen.findOne({
      where: {
        nombre,
        sucursalId
      }
    });

    if (almacenExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un almacén con ese nombre en la sucursal'
      });
    }

    const nuevoAlmacen = await Almacen.create({
      nombre,
      descripcion,
      ubicacion,
      sucursalId,
      tipo: tipo || 'PRINCIPAL',
      estado: true
    });

    // Obtener el almacén creado con la sucursal incluida
    const almacenCreado = await Almacen.findByPk(nuevoAlmacen.id, {
      include: [
        {
          model: Sucursal,
          attributes: ['id', 'nombre', 'ubicacion']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Almacén creado exitosamente',
      data: almacenCreado
    });
  } catch (error) {
    console.error('Error al crear almacén:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/almacenes/{id}:
 *   put:
 *     summary: Actualizar un almacén
 *     tags: [Almacenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del almacén
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Almacen'
 *     responses:
 *       200:
 *         description: Almacén actualizado exitosamente
 *       404:
 *         description: Almacén no encontrado
 */
const actualizarAlmacen = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, ubicacion, tipo, estado } = req.body;

    const almacen = await Almacen.findByPk(id);
    if (!almacen) {
      return res.status(404).json({
        success: false,
        message: 'Almacén no encontrado'
      });
    }

    // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre en la misma sucursal
    if (nombre && nombre !== almacen.nombre) {
      const almacenExistente = await Almacen.findOne({
        where: {
          nombre,
          sucursalId: almacen.sucursalId,
          id: { [Op.ne]: id }
        }
      });

      if (almacenExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un almacén con ese nombre en la sucursal'
        });
      }
    }

    await almacen.update({
      nombre: nombre || almacen.nombre,
      descripcion: descripcion !== undefined ? descripcion : almacen.descripcion,
      ubicacion: ubicacion !== undefined ? ubicacion : almacen.ubicacion,
      tipo: tipo || almacen.tipo,
      estado: estado !== undefined ? estado : almacen.estado
    });

    // Obtener el almacén actualizado con la sucursal incluida
    const almacenActualizado = await Almacen.findByPk(id, {
      include: [
        {
          model: Sucursal,
          attributes: ['id', 'nombre', 'ubicacion']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Almacén actualizado exitosamente',
      data: almacenActualizado
    });
  } catch (error) {
    console.error('Error al actualizar almacén:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/almacenes/{id}:
 *   delete:
 *     summary: Eliminar un almacén
 *     tags: [Almacenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del almacén
 *     responses:
 *       200:
 *         description: Almacén eliminado exitosamente
 *       404:
 *         description: Almacén no encontrado
 *       400:
 *         description: No se puede eliminar el almacén
 */
const eliminarAlmacen = async (req, res) => {
  try {
    const { id } = req.params;

    const almacen = await Almacen.findByPk(id);
    if (!almacen) {
      return res.status(404).json({
        success: false,
        message: 'Almacén no encontrado'
      });
    }

    // Verificar si el almacén tiene inventario asociado
    const inventarioCount = await InventarioAlmacen.count({
      where: { almacenId: id }
    });

    if (inventarioCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el almacén porque tiene inventario asociado'
      });
    }

    await almacen.destroy();

    res.json({
      success: true,
      message: 'Almacén eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar almacén:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/almacenes/{id}/inventario:
 *   get:
 *     summary: Obtener inventario de un almacén
 *     tags: [Almacenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del almacén
 *     responses:
 *       200:
 *         description: Inventario del almacén
 */
const obtenerInventarioAlmacen = async (req, res) => {
  try {
    const { id } = req.params;

    const almacen = await Almacen.findByPk(id);
    if (!almacen) {
      return res.status(404).json({
        success: false,
        message: 'Almacén no encontrado'
      });
    }

    const inventario = await InventarioAlmacen.findAll({
      where: { almacenId: id },
      include: [
        {
          model: Producto,
          attributes: ['id', 'nombre', 'codigo', 'descripcion', 'unidadMedida']
        }
      ],
      order: [[Producto, 'nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        almacen,
        inventario
      }
    });
  } catch (error) {
    console.error('Error al obtener inventario del almacén:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/almacenes/{id}/actualizar-precios:
 *   put:
 *     summary: Actualizar precios de productos en un almacén
 *     tags: [Almacenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del almacén
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
 *                     productoId:
 *                       type: integer
 *                     precioVenta:
 *                       type: number
 *                       format: float
 *                   required:
 *                     - productoId
 *                     - precioVenta
 *               aplicarATodos:
 *                 type: boolean
 *                 description: Si es true, aplica el mismo precio a todos los productos
 *               precioGeneral:
 *                 type: number
 *                 format: float
 *                 description: Precio a aplicar a todos los productos si aplicarATodos es true
 *               porcentajeAumento:
 *                 type: number
 *                 format: float
 *                 description: Porcentaje de aumento/descuento a aplicar
 *     responses:
 *       200:
 *         description: Precios actualizados exitosamente
 *       404:
 *         description: Almacén no encontrado
 */
const actualizarPreciosAlmacen = async (req, res) => {
  try {
    const { id } = req.params;
    const { productos, aplicarATodos, precioGeneral, porcentajeAumento } = req.body;

    // Verificar permisos
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para actualizar precios'
      });
    }

    const almacen = await Almacen.findByPk(id);
    if (!almacen) {
      return res.status(404).json({
        success: false,
        message: 'Almacén no encontrado'
      });
    }

    const resultados = {
      actualizados: 0,
      errores: []
    };

    if (aplicarATodos) {
      // Actualizar todos los productos del almacén
      const inventarios = await InventarioAlmacen.findAll({
        where: { almacenId: id },
        include: [{ model: Producto, attributes: ['id', 'nombre', 'codigo'] }]
      });

      for (const inventario of inventarios) {
        try {
          let nuevoPrecio;
          
          if (precioGeneral !== undefined) {
            nuevoPrecio = precioGeneral;
          } else if (porcentajeAumento !== undefined) {
            const precioActual = inventario.precioVenta || inventario.Producto.precioVenta || 0;
            nuevoPrecio = precioActual * (1 + porcentajeAumento / 100);
          } else {
            resultados.errores.push({
              productoId: inventario.productoId,
              error: 'Debe especificar precioGeneral o porcentajeAumento'
            });
            continue;
          }

          await inventario.update({ precioVenta: nuevoPrecio });
          resultados.actualizados++;
        } catch (error) {
          resultados.errores.push({
            productoId: inventario.productoId,
            error: error.message
          });
        }
      }
    } else if (productos && productos.length > 0) {
      // Actualizar productos específicos
      for (const producto of productos) {
        try {
          const inventario = await InventarioAlmacen.findOne({
            where: {
              almacenId: id,
              productoId: producto.productoId
            }
          });

          if (!inventario) {
            resultados.errores.push({
              productoId: producto.productoId,
              error: 'Producto no encontrado en este almacén'
            });
            continue;
          }

          if (producto.precioVenta <= 0) {
            resultados.errores.push({
              productoId: producto.productoId,
              error: 'El precio debe ser mayor a 0'
            });
            continue;
          }

          await inventario.update({ precioVenta: producto.precioVenta });
          resultados.actualizados++;
        } catch (error) {
          resultados.errores.push({
            productoId: producto.productoId,
            error: error.message
          });
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar productos o activar aplicarATodos'
      });
    }

    res.json({
      success: true,
      message: `Precios actualizados exitosamente. ${resultados.actualizados} productos actualizados`,
      data: resultados
    });
  } catch (error) {
    console.error('Error al actualizar precios del almacén:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  obtenerAlmacenes,
  obtenerAlmacenPorId,
  crearAlmacen,
  actualizarAlmacen,
  eliminarAlmacen,
  obtenerInventarioAlmacen,
  actualizarPreciosAlmacen
};