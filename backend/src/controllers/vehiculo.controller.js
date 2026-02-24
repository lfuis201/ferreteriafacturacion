const { Vehiculo } = require("../models");
const { Op } = require("sequelize");

// Obtener todos los vehículos
exports.obtenerVehiculos = async (req, res) => {
  try {
    const vehiculos = await Vehiculo.findAll({
      where: { estado: true },
      order: [["marcaVehiculo", "ASC"], ["modeloVehiculo", "ASC"]],
    });

    res.json({
      mensaje: "Vehículos obtenidos exitosamente",
      vehiculos
    });
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    res.status(500).json({
      mensaje: "Error al obtener los vehículos",
      error: error.message,
    });
  }
};

// Buscar vehículos por placa, marca, modelo
exports.buscarVehiculos = async (req, res) => {
  const { placa, marca, modelo } = req.query;
  
  if (!placa && !marca && !modelo) {
    return res
      .status(400)
      .json({ mensaje: "Debe proporcionar al menos un término de búsqueda" });
  }
  
  try {
    const whereClause = { estado: true };
    
    if (placa) {
      whereClause.nroPlacaId = { [Op.like]: `%${placa}%` };
    }
    if (marca) {
      whereClause.marcaVehiculo = { [Op.like]: `%${marca}%` };
    }
    if (modelo) {
      whereClause.modeloVehiculo = { [Op.like]: `%${modelo}%` };
    }
    
    const vehiculos = await Vehiculo.findAll({
      where: whereClause,
      order: [["marcaVehiculo", "ASC"], ["modeloVehiculo", "ASC"]],
    });
    
    res.json({ 
      mensaje: "Búsqueda completada exitosamente",
      vehiculos 
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al buscar vehículos", error: error.message });
  }
};

// Obtener un vehículo por ID
exports.obtenerVehiculoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const vehiculo = await Vehiculo.findOne({
      where: { id, estado: true },
    });

    if (!vehiculo) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    res.json({ 
      mensaje: "Vehículo obtenido exitosamente",
      vehiculo 
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener el vehículo", error: error.message });
  }
};

// Crear un nuevo vehículo
exports.crearVehiculo = async (req, res) => {
  try {
    const {
      nroPlacaId,
      tucId,
      autorizacionMTCPlacaPrincipal,
      nroPlacaSecundariaId,
      tucPlacaSecundariaId,
      autorizacionMTCPlacaSecundaria,
      modeloVehiculo,
      marcaVehiculo
    } = req.body;

    // Validaciones básicas
    if (!nroPlacaId) {
      return res.status(400).json({
        mensaje: "El campo nroPlacaId es obligatorio",
      });
    }

    // Verificar si ya existe un vehículo con esa placa
    const vehiculoExistente = await Vehiculo.findOne({
      where: { nroPlacaId: nroPlacaId.toUpperCase() },
    });

    if (vehiculoExistente) {
      return res.status(400).json({
        mensaje: "Ya existe un vehículo con este número de placa",
      });
    }

    // Crear el vehículo
    const nuevoVehiculo = await Vehiculo.create({
      nroPlacaId,
      tucId,
      autorizacionMTCPlacaPrincipal,
      nroPlacaSecundariaId,
      tucPlacaSecundariaId,
      autorizacionMTCPlacaSecundaria,
      modeloVehiculo,
      marcaVehiculo,
      estado: true,
    });

    res.status(201).json({
      mensaje: "Vehículo creado exitosamente",
      vehiculo: nuevoVehiculo,
    });
  } catch (error) {
    console.error("Error al crear vehículo:", error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        mensaje: "Error de validación",
        errores: error.errors.map(err => ({
          campo: err.path,
          mensaje: err.message
        }))
      });
    }

    res.status(500).json({
      mensaje: "Error al crear el vehículo",
      error: error.message,
    });
  }
};

// Actualizar un vehículo
exports.actualizarVehiculo = async (req, res) => {
  const { id } = req.params;
  
  try {
    const vehiculo = await Vehiculo.findOne({
      where: { id, estado: true },
    });

    if (!vehiculo) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    const {
      nroPlacaId,
      tucId,
      autorizacionMTCPlacaPrincipal,
      nroPlacaSecundariaId,
      tucPlacaSecundariaId,
      autorizacionMTCPlacaSecundaria,
      modeloVehiculo,
      marcaVehiculo
    } = req.body;

    // Si se está actualizando la placa, verificar que no exista otra
    if (nroPlacaId && nroPlacaId.toUpperCase() !== vehiculo.nroPlacaId) {
      const vehiculoConPlaca = await Vehiculo.findOne({
        where: { 
          nroPlacaId: nroPlacaId.toUpperCase(),
          id: { [Op.ne]: id }
        },
      });

      if (vehiculoConPlaca) {
        return res.status(400).json({
          mensaje: "Ya existe otro vehículo con este número de placa",
        });
      }
    }

    // Actualizar el vehículo
    await vehiculo.update({
      nroPlacaId: nroPlacaId || vehiculo.nroPlacaId,
      tucId: tucId !== undefined ? tucId : vehiculo.tucId,
      autorizacionMTCPlacaPrincipal: autorizacionMTCPlacaPrincipal !== undefined ? autorizacionMTCPlacaPrincipal : vehiculo.autorizacionMTCPlacaPrincipal,
      nroPlacaSecundariaId: nroPlacaSecundariaId !== undefined ? nroPlacaSecundariaId : vehiculo.nroPlacaSecundariaId,
      tucPlacaSecundariaId: tucPlacaSecundariaId !== undefined ? tucPlacaSecundariaId : vehiculo.tucPlacaSecundariaId,
      autorizacionMTCPlacaSecundaria: autorizacionMTCPlacaSecundaria !== undefined ? autorizacionMTCPlacaSecundaria : vehiculo.autorizacionMTCPlacaSecundaria,
      modeloVehiculo: modeloVehiculo || vehiculo.modeloVehiculo,
      marcaVehiculo: marcaVehiculo || vehiculo.marcaVehiculo,
    });

    res.json({
      mensaje: "Vehículo actualizado exitosamente",
      vehiculo,
    });
  } catch (error) {
    console.error("Error al actualizar vehículo:", error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        mensaje: "Error de validación",
        errores: error.errors.map(err => ({
          campo: err.path,
          mensaje: err.message
        }))
      });
    }

    res.status(500).json({
      mensaje: "Error al actualizar el vehículo",
      error: error.message,
    });
  }
};

// Buscar vehículo por placa
exports.buscarPorPlaca = async (req, res) => {
  const { placa } = req.params;

  if (!placa) {
    return res.status(400).json({ mensaje: "Debe proporcionar una placa" });
  }

  try {
    const vehiculo = await Vehiculo.findOne({
      where: { 
        nroPlacaId: placa.toUpperCase(),
        estado: true 
      },
    });

    if (!vehiculo) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    res.json({ 
      mensaje: "Vehículo encontrado",
      vehiculo 
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al buscar el vehículo",
      error: error.message,
    });
  }
};



// Eliminar un vehículo
exports.eliminarVehiculo = async (req, res) => {
  const { id } = req.params;

  try {
    const vehiculo = await Vehiculo.findOne({
      where: { id },
    });

    if (!vehiculo) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    await vehiculo.destroy();

    res.json({
      mensaje: "Vehículo eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar el vehículo",
      error: error.message,
    });
  }
};
