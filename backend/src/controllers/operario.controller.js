const { Operario } = require('../models');
const { Op } = require('sequelize');

// Crear operario
exports.crearOperario = async (req, res) => {
  try {
    const { nombres, apellidos, puesto, especialidad, telefono, activo } = req.body;

    // Validar campos obligatorios
    if (!nombres || !apellidos || !puesto) {
      return res.status(400).json({
        mensaje: 'Los campos nombres, apellidos y puesto son obligatorios'
      });
    }

    const operario = await Operario.create({
      nombres,
      apellidos,
      puesto,
      especialidad,
      telefono,
      activo: activo !== undefined ? activo : true
    });

    res.status(201).json({
      mensaje: 'Operario creado exitosamente',
      operario
    });
  } catch (error) {
    console.error('Error al crear operario:', error);
    res.status(500).json({
      mensaje: 'Error al crear operario',
      error: error.message
    });
  }
};

// Obtener todos los operarios
exports.obtenerOperarios = async (req, res) => {
  try {
    const { activo, puesto, buscar } = req.query;
    const where = {};

    // Filtro por estado activo
    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    // Filtro por puesto
    if (puesto) {
      where.puesto = {
        [Op.like]: `%${puesto}%`
      };
    }

    // Búsqueda general por nombres o apellidos
    if (buscar) {
      where[Op.or] = [
        {
          nombres: {
            [Op.like]: `%${buscar}%`
          }
        },
        {
          apellidos: {
            [Op.like]: `%${buscar}%`
          }
        }
      ];
    }

    const operarios = await Operario.findAll({
      where,
      order: [['nombres', 'ASC']]
    });

    res.status(200).json({
      mensaje: 'Operarios obtenidos exitosamente',
      operarios
    });
  } catch (error) {
    console.error('Error al obtener operarios:', error);
    res.status(500).json({
      mensaje: 'Error al obtener operarios',
      error: error.message
    });
  }
};

// Obtener operario por ID
exports.obtenerOperarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const operario = await Operario.findByPk(id);

    if (!operario) {
      return res.status(404).json({
        mensaje: 'Operario no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Operario obtenido exitosamente',
      operario
    });
  } catch (error) {
    console.error('Error al obtener operario:', error);
    res.status(500).json({
      mensaje: 'Error al obtener operario',
      error: error.message
    });
  }
};

// Actualizar operario
exports.actualizarOperario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, puesto, especialidad, telefono, activo } = req.body;

    const operario = await Operario.findByPk(id);

    if (!operario) {
      return res.status(404).json({
        mensaje: 'Operario no encontrado'
      });
    }

    // Actualizar campos
    await operario.update({
      nombres: nombres || operario.nombres,
      apellidos: apellidos || operario.apellidos,
      puesto: puesto || operario.puesto,
      especialidad: especialidad !== undefined ? especialidad : operario.especialidad,
      telefono: telefono !== undefined ? telefono : operario.telefono,
      activo: activo !== undefined ? activo : operario.activo
    });

    res.status(200).json({
      mensaje: 'Operario actualizado exitosamente',
      operario
    });
  } catch (error) {
    console.error('Error al actualizar operario:', error);
    res.status(500).json({
      mensaje: 'Error al actualizar operario',
      error: error.message
    });
  }
};

// Eliminar operario (soft delete)
exports.eliminarOperario = async (req, res) => {
  try {
    const { id } = req.params;

    const operario = await Operario.findByPk(id);

    if (!operario) {
      return res.status(404).json({
        mensaje: 'Operario no encontrado'
      });
    }

    // Soft delete - cambiar estado a inactivo
    await operario.update({ activo: false });

    res.status(200).json({
      mensaje: 'Operario desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar operario:', error);
    res.status(500).json({
      mensaje: 'Error al eliminar operario',
      error: error.message
    });
  }
};

// Activar operario
exports.activarOperario = async (req, res) => {
  try {
    const { id } = req.params;

    const operario = await Operario.findByPk(id);

    if (!operario) {
      return res.status(404).json({
        mensaje: 'Operario no encontrado'
      });
    }

    await operario.update({ activo: true });

    res.status(200).json({
      mensaje: 'Operario activado exitosamente',
      operario
    });
  } catch (error) {
    console.error('Error al activar operario:', error);
    res.status(500).json({
      mensaje: 'Error al activar operario',
      error: error.message
    });
  }
};

// Obtener operarios activos (para selects)
exports.obtenerOperariosActivos = async (req, res) => {
  try {
    const operarios = await Operario.findAll({
      where: { activo: true },
      attributes: ['id', 'nombres', 'apellidos', 'puesto', 'especialidad'],
      order: [['nombres', 'ASC']]
    });

    res.status(200).json({
      mensaje: 'Operarios activos obtenidos exitosamente',
      operarios
    });
  } catch (error) {
    console.error('Error al obtener operarios activos:', error);
    res.status(500).json({
      mensaje: 'Error al obtener operarios activos',
      error: error.message
    });
  }
};