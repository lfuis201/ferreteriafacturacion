const { DireccionPartida } = require("../models");
const { Op } = require("sequelize");

// Obtener todas las direcciones de partida
exports.obtenerDireccionesPartida = async (req, res) => {
  try {
    const { direccion, ubigeo } = req.query;
    const where = { estado: true };

    if (direccion) where.direccion = { [Op.like]: `%${direccion}%` };
    if (ubigeo) where.ubigeo = { [Op.like]: `%${ubigeo}%` };

    const direccionesPartida = await DireccionPartida.findAll({
      where,
      order: [["departamento", "ASC"], ["provincia", "ASC"], ["distrito", "ASC"]],
    });

    res.json({ mensaje: "Direcciones obtenidas", direccionesPartida });
  } catch (error) {
    console.error("Error obtener direcciones partida:", error);
    res.status(500).json({ mensaje: "Error al obtener direcciones", error: error.message });
  }
};

// Buscar direcciones de partida
exports.buscarDireccionesPartida = async (req, res) => {
  try {
    const { direccion, ubigeo } = req.query;
    const where = { estado: true };
    if (direccion) where.direccion = { [Op.like]: `%${direccion}%` };
    if (ubigeo) where.ubigeo = { [Op.like]: `%${ubigeo}%` };

    const direccionesPartida = await DireccionPartida.findAll({ where });
    res.json({ mensaje: "Búsqueda realizada", direccionesPartida });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en búsqueda", error: error.message });
  }
};

// Obtener por ID
exports.obtenerDireccionPartidaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const direccion = await DireccionPartida.findOne({ where: { id, estado: true } });
    if (!direccion) return res.status(404).json({ mensaje: "Dirección no encontrada" });
    res.json({ mensaje: "Dirección encontrada", direccion });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener dirección", error: error.message });
  }
};

// Crear
exports.crearDireccionPartida = async (req, res) => {
  try {
    const { direccion, direccionCompleta, departamento, provincia, distrito, ubigeo } = req.body;
    if (!direccion || !direccionCompleta || !departamento || !provincia || !distrito || !ubigeo) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }
    const nueva = await DireccionPartida.create({ direccion, direccionCompleta, departamento, provincia, distrito, ubigeo });
    res.status(201).json({ mensaje: "Dirección creada", direccion: nueva });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear dirección", error: error.message });
  }
};

// Actualizar
exports.actualizarDireccionPartida = async (req, res) => {
  try {
    const { id } = req.params;
    const { direccion, direccionCompleta, departamento, provincia, distrito, ubigeo } = req.body;
    const existente = await DireccionPartida.findByPk(id);
    if (!existente || !existente.estado) {
      return res.status(404).json({ mensaje: "Dirección no encontrada" });
    }
    await existente.update({ direccion, direccionCompleta, departamento, provincia, distrito, ubigeo });
    res.json({ mensaje: "Dirección actualizada", direccion: existente });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar dirección", error: error.message });
  }
};

// Eliminar (borrado lógico)
// Eliminar una dirección de partida
exports.eliminarDireccionPartida = async (req, res) => {
  try {
    const { id } = req.params;
    const existente = await DireccionPartida.findByPk(id);
    
    if (!existente) {
      return res.status(404).json({ mensaje: "Dirección no encontrada" });
    }

    await existente.destroy();

    res.json({ mensaje: "Dirección eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar dirección", error: error.message });
  }
};
