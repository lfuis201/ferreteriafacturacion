// controllers/cajaController.js
const { Caja, Sucursal, Usuario } = require('../models');
const { Op } = require('sequelize'); 

const moment = require('moment'); // Importar moment para trabajar con fechas

// Abrir caja
// controllers/cajaController.js
exports.abrirCaja = async (req, res) => {
  const { sucursalId, saldoInicial, observaciones } = req.body;

  try {
    // Validar datos de entrada
    if (!sucursalId || !saldoInicial) {
      return res.status(400).json({
        mensaje: 'Faltan datos requeridos: sucursalId y saldoInicial son obligatorios'
      });
    }

    // Verificar si el usuario tiene permisos para abrir caja en esta sucursal
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.sucursalId !== parseInt(sucursalId)) {
      return res.status(403).json({
        mensaje: 'No tiene permisos para abrir caja en esta sucursal'
      });
    }

    // Verificar si el usuario existe
    const usuarioExiste = await Usuario.findByPk(req.usuario.id);
    if (!usuarioExiste) {
      return res.status(400).json({
        mensaje: 'El usuario que intenta abrir la caja no existe'
      });
    }

    // Verificar si la sucursal existe
    const sucursalExiste = await Sucursal.findByPk(sucursalId);
    if (!sucursalExiste) {
      return res.status(400).json({
        mensaje: 'La sucursal especificada no existe'
      });
    }

    // Verificar si ya hay una caja abierta para esta sucursal
    const cajaAbierta = await Caja.findOne({
      where: {
        sucursalId,
        estado: 'ABIERTA'
      }
    });

    if (cajaAbierta) {
      return res.status(400).json({
        mensaje: 'Ya existe una caja abierta para esta sucursal',
        caja: cajaAbierta
      });
    }

    // Crear nueva caja
    const nuevaCaja = await Caja.create({
      sucursalId,
      saldoInicial,
      usuarioId: req.usuario.id, // Asegúrate de que este valor sea correcto
      observaciones,
      estado: 'ABIERTA'
    });

    // Obtener la caja completa
    const cajaCompleta = await Caja.findByPk(nuevaCaja.id, {
      include: [
        {
          model: Sucursal,
          attributes: ['id', 'nombre']
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'apellido']
        }
      ]
    });

    res.status(201).json({
      mensaje: 'Caja abierta exitosamente',
      caja: cajaCompleta
    });
  } catch (error) {
    console.error('Error al abrir caja:', error);

    // Manejar específicamente el error de clave foránea
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        mensaje: 'Error al abrir caja: el usuario o sucursal especificado no existe',
        error: error.message,
        usuarioId: req.usuario.id, // Agregar el ID del usuario para depuración
        sucursalId: sucursalId // Agregar el ID de la sucursal para depuración
      });
    }

    res.status(500).json({
      mensaje: 'Error al abrir caja',
      error: error.message
    });
  }
};
// Cerrar caja
exports.cerrarCaja = async (req, res) => {
  const { sucursalId, saldoFinal, observaciones } = req.body;

  try {
    // Validar datos de entrada
    if (!sucursalId || !saldoFinal) {
      return res.status(400).json({
        mensaje: 'Faltan datos requeridos: sucursalId y saldoFinal son obligatorios'
      });
    }

    // Verificar si el usuario tiene permisos para cerrar caja en esta sucursal
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.sucursalId !== parseInt(sucursalId)) {
      return res.status(403).json({
        mensaje: 'No tiene permisos para cerrar caja en esta sucursal'
      });
    }

    // Verificar que la caja exista y esté abierta
    const caja = await Caja.findOne({
      where: {
        sucursalId,
        estado: 'ABIERTA'
      },
      include: [
        {
          model: Sucursal,
          attributes: ['id', 'nombre']
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'apellido']
        }
      ]
    });

    if (!caja) {
      return res.status(400).json({
        mensaje: 'No se encontró una caja abierta para esta sucursal'
      });
    }

    // Verificar que el saldo final coincida con el saldo inicial
    if (parseFloat(saldoFinal) < parseFloat(caja.saldoInicial)) {
      return res.status(400).json({
        mensaje: 'El saldo final no puede ser menor que el saldo inicial',
        saldoInicial: caja.saldoInicial
      });
    }

    // Cerrar la caja
    await caja.update({
      fechaCierre: new Date(),
      saldoFinal,
      observaciones: observaciones || caja.observaciones,
      estado: 'CERRADA'
    });

    // Obtener la caja cerrada completa
    const cajaCerrada = await Caja.findByPk(caja.id, {
      include: [
        {
          model: Sucursal,
          attributes: ['id', 'nombre']
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'apellido']
        }
      ]
    });

    res.json({
      mensaje: 'Caja cerrada exitosamente',
      caja: cajaCerrada
    });
  } catch (error) {
    console.error('Error al cerrar caja:', error);
    res.status(500).json({
      mensaje: 'Error al cerrar caja',
      error: error.message
    });
  }
};

// Obtener estado de caja
// Obtener historial de estado de cajas
exports.obtenerEstadoCaja = async (req, res) => {
  const { sucursalId, limite = 10, pagina = 1 } = req.query;

  try {
    // Validar datos de entrada
    if (!sucursalId) {
      return res.status(400).json({
        mensaje: 'El parámetro sucursalId es obligatorio'
      });
    }

    // Verificar si el usuario tiene permisos para ver el estado de caja en esta sucursal
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.sucursalId !== parseInt(sucursalId)) {
      return res.status(403).json({
        mensaje: 'No tiene permisos para ver el estado de caja en esta sucursal'
      });
    }

    // Calcular offset para paginación
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    // Buscar todas las cajas para esta sucursal (historial completo)
    const { count, rows: cajas } = await Caja.findAndCountAll({
      where: {
        sucursalId
      },
      include: [
        {
          model: Sucursal,
          attributes: ['id', 'nombre']
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'apellido']
        }
      ],
      order: [['fechaApertura', 'DESC']], // Ordenar por fecha más reciente primero
      limit: parseInt(limite),
      offset: offset
    });

    // Buscar si hay una caja actualmente abierta
    const cajaAbierta = await Caja.findOne({
      where: {
        sucursalId,
        estado: 'ABIERTA'
      }
    });

    // Determinar el estado actual
    const estadoActual = cajaAbierta ? 'ABIERTA' : 'CERRADA';

    // Calcular totales de páginas
    const totalPaginas = Math.ceil(count / parseInt(limite));

    if (cajas.length === 0) {
      return res.status(404).json({
        mensaje: 'No se encontraron cajas para esta sucursal',
        estadoActual: 'CERRADA',
        historial: {
          total: 0,
          totalPaginas: 0,
          paginaActual: parseInt(pagina),
          limite: parseInt(limite),
          cajas: []
        }
      });
    }

    res.json({
      mensaje: 'Historial de estado de cajas obtenido exitosamente',
      estadoActual,
      cajaActualAbierta: cajaAbierta ? {
        id: cajaAbierta.id,
        fechaApertura: cajaAbierta.fechaApertura,
        saldoInicial: cajaAbierta.saldoInicial,
        observaciones: cajaAbierta.observaciones
      } : null,
      historial: {
        total: count,
        totalPaginas,
        paginaActual: parseInt(pagina),
        limite: parseInt(limite),
        cajas: cajas.map(caja => ({
          id: caja.id,
          estado: caja.estado,
          fechaApertura: caja.fechaApertura,
          fechaCierre: caja.fechaCierre,
          saldoInicial: caja.saldoInicial,
          saldoFinal: caja.saldoFinal,
          observaciones: caja.observaciones,
          sucursal: caja.Sucursal,
          usuario: caja.Usuario
        }))
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de estado de caja:', error);
    res.status(500).json({
      mensaje: 'Error al obtener historial de estado de caja',
      error: error.message
    });
  }
};

// Generar reporte de caja
// Generar reporte de caja
// Generar reporte de caja


exports.reporteCaja = async (req, res) => {
  const { sucursalId, fechaInicio } = req.query;
  try {
    let fechaInicioDate, fechaFinDate;

    if (fechaInicio) {
      // Validar formato con moment
      if (!moment(fechaInicio, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ mensaje: 'Formato de fecha inválido, use YYYY-MM-DD' });
      }

      // Rango exacto del día (00:00:00 a 23:59:59)
      fechaInicioDate = moment(fechaInicio).startOf('day').toDate();
      fechaFinDate = moment(fechaInicio).endOf('day').toDate();
    }

    // Construir condiciones
    const where = {};

    if (fechaInicio) {
      where.fechaCierre = {
        [Op.between]: [fechaInicioDate, fechaFinDate]
      };
    }

    // Verificar permisos y filtrar por sucursal
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      if (sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res.status(403).json({ mensaje: 'No tiene permisos para ver cajas de otras sucursales' });
      }
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      where.sucursalId = sucursalId;
    }

    // Obtener cajas
    const cajas = await Caja.findAll({
      where,
      include: [
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Usuario, attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fechaCierre', 'DESC']] // 🔥 ahora ordena de más reciente a más antiguo
    });

    if (cajas.length === 0) {
      return res.status(404).json({
        mensaje: 'No se encontraron cajas para los criterios especificados',
        reporte: {
          sucursalId: sucursalId || (req.usuario.rol !== 'SuperAdmin' ? req.usuario.sucursalId : null),
          fechaInicio: fechaInicio || null,
          totalCajas: 0,
          totalIngresos: 0,
          promedioIngresos: 0,
          cajas: []
        }
      });
    }

    // Calcular totales
    const totalCajas = cajas.length;
    const totalIngresos = cajas.reduce((sum, caja) => {
      if (caja.saldoFinal) {
        return sum + parseFloat(caja.saldoFinal) - parseFloat(caja.saldoInicial);
      }
      return sum;
    }, 0);
    const promedioIngresos = totalCajas > 0 ? totalIngresos / totalCajas : 0;

    // Agrupar por sucursal si aplica
    let ingresosPorSucursal = [];
    if (!sucursalId && req.usuario.rol === 'SuperAdmin') {
      const sucursales = await Sucursal.findAll({
        where: { estado: true },
        attributes: ['id', 'nombre']
      });

      ingresosPorSucursal = sucursales.map(sucursal => {
        const cajasSucursal = cajas.filter(caja => caja.sucursalId === sucursal.id);
        const ingresosSucursal = cajasSucursal.reduce((sum, caja) => {
          if (caja.saldoFinal) {
            return sum + parseFloat(caja.saldoFinal) - parseFloat(caja.saldoInicial);
          }
          return sum;
        }, 0);
        return {
          sucursal: sucursal.nombre,
          totalCajas: cajasSucursal.length,
          ingresosTotales: ingresosSucursal,
          promedioIngresos: cajasSucursal.length > 0 ? ingresosSucursal / cajasSucursal.length : 0
        };
      });
    }

    res.json({
      reporte: {
        sucursalId: sucursalId || (req.usuario.rol !== 'SuperAdmin' ? req.usuario.sucursalId : null),
        fechaInicio: fechaInicio || null,
        totalCajas,
        totalIngresos,
        promedioIngresos,
        ingresosPorSucursal: ingresosPorSucursal.length > 0 ? ingresosPorSucursal : undefined,
        cajas
      }
    });
  } catch (error) {
    console.error('Error al generar reporte de caja:', error);
    res.status(500).json({
      mensaje: 'Error al generar reporte de caja',
      error: error.message
    });
  }
}; 


// eliminarCaja 
exports.eliminarHistorialSucursal = async (req, res) => {
  const { sucursalId } = req.params;
  try {
    // Verificar permisos
    if (req.usuario.rol !== 'SuperAdmin') {
      return res.status(403).json({ mensaje: 'No tiene permisos para eliminar el historial de una sucursal' });
    }

    // Eliminar todas las cajas asociadas a la sucursal
    const resultado = await Caja.destroy({
      where: {
        sucursalId: sucursalId
      }
    });

    if (resultado === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron cajas para la sucursal especificada' });
    }

    res.json({ mensaje: `Se eliminaron ${resultado} cajas del historial de la sucursal con ID ${sucursalId}` });
  } catch (error) {
    console.error('Error al eliminar el historial de la sucursal:', error);
    res.status(500).json({
      mensaje: 'Error al eliminar el historial de la sucursal',
      error: error.message
    });
  }
};

// Actualizar caja (solo observaciones)
exports.actualizarCaja = async (req, res) => {
  try {
    const { id } = req.params;
    const { observaciones } = req.body;

    if (!id) {
      return res.status(400).json({ mensaje: 'El parámetro id es obligatorio' });
    }

    const caja = await Caja.findByPk(id, {
      include: [
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Usuario, attributes: ['id', 'nombre', 'apellido'] },
      ],
    });

    if (!caja) {
      return res.status(404).json({ mensaje: 'Caja no encontrada' });
    }

    // Verificar permisos: solo SuperAdmin o usuarios de la misma sucursal
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && req.usuario.sucursalId !== caja.sucursalId) {
      return res.status(403).json({ mensaje: 'No tiene permisos para editar esta caja' });
    }

    await caja.update({
      observaciones: observaciones !== undefined ? observaciones : caja.observaciones,
    });

    const cajaActualizada = await Caja.findByPk(id, {
      include: [
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Usuario, attributes: ['id', 'nombre', 'apellido'] },
      ],
    });

    return res.json({
      mensaje: 'Caja actualizada exitosamente',
      caja: cajaActualizada,
    });
  } catch (error) {
    console.error('Error al actualizar caja:', error);
    return res.status(500).json({ mensaje: 'Error al actualizar caja', error: error.message });
  }
};