const { Servicio, Categoria, Sucursal } = require('../models');
const { Op } = require('sequelize');

// Listar servicios con filtros básicos
exports.obtenerServicios = async (req, res) => {
  try {
    const { nombre, categoriaId, sucursalId } = req.query;

    const where = { estado: true };
    if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
    if (categoriaId) where.categoriaId = categoriaId;
    if (sucursalId) where.sucursalId = sucursalId;

    const servicios = await Servicio.findAll({
      where,
      include: [
        { model: Categoria, attributes: ['id', 'nombre'] },
        { model: Sucursal, attributes: ['id', 'nombre'] }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({ servicios });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener servicios', error: error.message });
  }
};

// Obtener servicio por ID
exports.obtenerServicioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findOne({
      where: { id, estado: true },
      include: [
        { model: Categoria, attributes: ['id', 'nombre'] },
        { model: Sucursal, attributes: ['id', 'nombre'] }
      ]
    });
    if (!servicio) return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    res.json({ servicio });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el servicio', error: error.message });
  }
};

// Crear servicio
exports.crearServicio = async (req, res) => {
  try {
    // Permisos básicos: SuperAdmin/Admin pueden crear; si existe req.usuario
    if (
      req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Almacenero'
    ) {
      return res.status(403).json({ mensaje: 'No tiene permisos para crear servicios' });
    }

    const {
      nombre,
      codigo,
      descripcion,
      precioVenta,
      unidadMedida = 'ZZ',
      tieneIgv = true,
      tipodeAfectacion,
      codigosunat,
      modelo,
      marca,
      categoriaId,
      sucursalId,
      estado = true
    } = req.body;

    // Validaciones mínimas
    if (!nombre || !codigo || !precioVenta) {
      return res.status(400).json({ mensaje: 'nombre, codigo y precioVenta son requeridos' });
    }

    const existe = await Servicio.findOne({ where: { codigo } });
    if (existe) {
      return res.status(409).json({ mensaje: 'Código de servicio ya existe' });
    }

    const servicio = await Servicio.create({
      nombre,
      codigo,
      descripcion,
      precioVenta,
      unidadMedida,
      tieneIgv,
      tipodeAfectacion,
      codigosunat,
      modelo,
      marca,
      categoriaId,
      sucursalId,
      estado
    });

    res.status(201).json({ mensaje: 'Servicio creado exitosamente', servicio });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear servicio', error: error.message });
  }
};

// Actualizar servicio
exports.actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findByPk(id);
    if (!servicio || !servicio.estado) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    const datos = req.body;
    // Evitar cambiar código a uno existente
    if (datos.codigo && datos.codigo !== servicio.codigo) {
      const dup = await Servicio.findOne({ where: { codigo: datos.codigo } });
      if (dup) return res.status(409).json({ mensaje: 'Código ya utilizado por otro servicio' });
    }

    await servicio.update(datos);
    res.json({ mensaje: 'Servicio actualizado', servicio });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar servicio', error: error.message });
  }
};

// Eliminar (soft delete)
exports.eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findByPk(id);
    if (!servicio || !servicio.estado) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }
    await servicio.update({ estado: false });
    res.json({ mensaje: 'Servicio eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar servicio', error: error.message });
  }
};