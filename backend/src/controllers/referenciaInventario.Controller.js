const ReferenciaInventario = require('../models/ReferenciaInventario');
const { Op } = require('sequelize');

/**
 * @swagger
 * tags:
 *   name: Referencias Inventario
 *   description: API para gestión de referencias de inventario
 */

/**
 * @swagger
 * /api/referencias-inventario:
 *   get:
 *     summary: Obtener todas las referencias de inventario
 *     tags: [Referencias Inventario]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar por código o descripción
       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de elementos por página
 *     responses:
 *       200:
 *         description: Lista de referencias obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 referencias:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ReferenciaInventario'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
const obtenerReferencias = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    // Construir condiciones de búsqueda
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { codigo: { [Op.like]: `%${search}%` } },
        { descripcion: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Calcular offset para paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Obtener referencias con paginación
    const { count, rows } = await ReferenciaInventario.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      referencias: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener referencias:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

/**
 * @swagger
 * /api/referencias-inventario/{id}:
 *   get:
 *     summary: Obtener una referencia por ID
 *     tags: [Referencias Inventario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la referencia
 *     responses:
 *       200:
 *         description: Referencia obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReferenciaInventario'
 *       404:
 *         description: Referencia no encontrada
 */
const obtenerReferenciaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const referencia = await ReferenciaInventario.findByPk(id);
    
    if (!referencia) {
      return res.status(404).json({ error: 'Referencia no encontrada' });
    }
    
    res.json(referencia);
  } catch (error) {
    console.error('Error al obtener referencia:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

/**
 * @swagger
 * /api/referencias-inventario:
 *   post:
 *     summary: Crear una nueva referencia de inventario
 *     tags: [Referencias Inventario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - descripcion
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: "REF001"
 *               descripcion:
                 type: string
                 example: "Tornillo hexagonal 1/4"
 *     responses:
 *       201:
 *         description: Referencia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReferenciaInventario'
 *       400:
 *         description: Datos inválidos o código duplicado
 */
const crearReferencia = async (req, res) => {
  try {
    const { codigo, descripcion } = req.body;
    
    // Validaciones
    if (!codigo || !descripcion) {
      return res.status(400).json({ 
        error: 'Código y descripción son obligatorios' 
      });
    }
    
    // Verificar si el código ya existe
    const referenciaExistente = await ReferenciaInventario.findOne({
      where: { codigo }
    });
    
    if (referenciaExistente) {
      return res.status(400).json({ 
        error: 'Ya existe una referencia con este código' 
      });
    }
    
    const nuevaReferencia = await ReferenciaInventario.create({
      codigo,
      descripcion
    });
    
    res.status(201).json(nuevaReferencia);
  } catch (error) {
    console.error('Error al crear referencia:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

/**
 * @swagger
 * /api/referencias-inventario/{id}:
 *   put:
 *     summary: Actualizar una referencia de inventario
 *     tags: [Referencias Inventario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la referencia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
                 type: string
               descripcion:
                 type: string
 *     responses:
 *       200:
 *         description: Referencia actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReferenciaInventario'
 *       404:
 *         description: Referencia no encontrada
 *       400:
 *         description: Código duplicado
 */
const actualizarReferencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, descripcion } = req.body;
    
    const referencia = await ReferenciaInventario.findByPk(id);
    
    if (!referencia) {
      return res.status(404).json({ error: 'Referencia no encontrada' });
    }
    
    // Si se está actualizando el código, verificar que no exista
    if (codigo && codigo !== referencia.codigo) {
      const referenciaExistente = await ReferenciaInventario.findOne({
        where: { codigo }
      });
      
      if (referenciaExistente) {
        return res.status(400).json({ 
          error: 'Ya existe una referencia con este código' 
        });
      }
    }
    
    await referencia.update({
      codigo: codigo || referencia.codigo,
      descripcion: descripcion || referencia.descripcion
    });
    
    res.json(referencia);
  } catch (error) {
    console.error('Error al actualizar referencia:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

/**
 * @swagger
 * /api/referencias-inventario/{id}:
 *   delete:
 *     summary: Eliminar una referencia de inventario
 *     tags: [Referencias Inventario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la referencia
 *     responses:
 *       200:
 *         description: Referencia eliminada exitosamente
 *       404:
 *         description: Referencia no encontrada
 */
const eliminarReferencia = async (req, res) => {
  try {
    const { id } = req.params;
    
    const referencia = await ReferenciaInventario.findByPk(id);
    
    if (!referencia) {
      return res.status(404).json({ error: 'Referencia no encontrada' });
    }
    
    await referencia.destroy();
    
    res.json({ message: 'Referencia eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar referencia:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

module.exports = {
  obtenerReferencias,
  obtenerReferenciaPorId,
  crearReferencia,
  actualizarReferencia,
  eliminarReferencia
};