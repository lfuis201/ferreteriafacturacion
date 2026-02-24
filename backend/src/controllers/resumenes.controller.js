const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Venta = require('../models/Venta');
const Cliente = require('../models/Cliente');
const Sucursal = require('../models/Sucursal');
const Usuario = require('../models/Usuario');

// Obtener todos los resúmenes con filtros
exports.obtenerResumenes = async (req, res) => {
  try {
    const { 
      fechaEmision, 
      busqueda, 
      sucursalId, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Construir condiciones de búsqueda
    const where = {
      tipoComprobante: {
        [Op.in]: ['BOLETA', 'FACTURA']
      },
      estado: 'COMPLETADA'
    };

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      where.sucursalId = sucursalId;
    }

    // Filtro por fecha de emisión
    if (fechaEmision) {
      const hoy = new Date();
      const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

      switch (fechaEmision) {
        case 'hoy':
          where.fechaVenta = {
            [Op.between]: [inicioHoy, finHoy]
          };
          break;
        case 'ayer':
          const ayer = new Date(inicioHoy);
          ayer.setDate(ayer.getDate() - 1);
          const finAyer = new Date(ayer);
          finAyer.setHours(23, 59, 59);
          where.fechaVenta = {
            [Op.between]: [ayer, finAyer]
          };
          break;
        case 'esta-semana':
          const inicioSemana = new Date(inicioHoy);
          inicioSemana.setDate(inicioHoy.getDate() - inicioHoy.getDay());
          where.fechaVenta = {
            [Op.between]: [inicioSemana, finHoy]
          };
          break;
        case 'este-mes':
          const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          where.fechaVenta = {
            [Op.between]: [inicioMes, finHoy]
          };
          break;
        case 'mes-anterior':
          const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
          const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59);
          where.fechaVenta = {
            [Op.between]: [inicioMesAnterior, finMesAnterior]
          };
          break;
      }
    }

    // Filtro por búsqueda (serie, número, cliente)
    if (busqueda) {
      where[Op.or] = [
        { serieComprobante: { [Op.like]: `%${busqueda}%` } },
        { numeroComprobante: { [Op.like]: `%${busqueda}%` } },
        { '$Cliente.nombre$': { [Op.like]: `%${busqueda}%` } },
        { '$Cliente.numeroDocumento$': { [Op.like]: `%${busqueda}%` } }
      ];
    }

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Obtener resúmenes con paginación
    const { count, rows: resumenes } = await Venta.findAndCountAll({
      where,
      include: [
        { 
          model: Cliente, 
          attributes: ['id', 'nombre', 'numeroDocumento', 'tipoDocumento'],
          required: false
        },
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre', 'ruc', 'razonSocial'] 
        },
        { 
          model: Usuario, 
          as: 'Usuario', 
          attributes: ['id', 'nombre', 'apellido'] 
        }
      ],
      order: [['fechaVenta', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Formatear los resúmenes
    const resumenesFormateados = resumenes.map(resumen => {
      const resumenJson = resumen.toJSON();
      
      // Formatear fecha
      if (resumenJson.fechaVenta) {
        const fecha = new Date(resumenJson.fechaVenta);
        resumenJson.fechaEmision = fecha.toISOString().split('T')[0];
        resumenJson.fechaReferencia = fecha.toISOString().split('T')[0];
      }

      // Crear identificador único
      resumenJson.identificador = `${resumenJson.serieComprobante}-${resumenJson.numeroComprobante}`;

      // Determinar estado SUNAT
      let estadoSunat = 'PENDIENTE';
      if (resumenJson.estadoSunat === 'ACEPTADO') {
        estadoSunat = 'ACEPTADO';
      } else if (resumenJson.estadoSunat === 'RECHAZADO') {
        estadoSunat = 'RECHAZADO';
      } else if (resumenJson.sunatError) {
        estadoSunat = 'ERROR';
      }

      resumenJson.estado = estadoSunat;
      resumenJson.ticket = resumenJson.sunatTicket || '-';

      return resumenJson;
    });

    // Calcular información de paginación
    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: resumenesFormateados,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener resúmenes:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error al obtener resúmenes', 
      error: error.message 
    });
  }
};

// Crear nuevo resumen (generar resumen diario)
exports.crearResumen = async (req, res) => {
  try {
    const { fechaComprobantes } = req.body;

    if (!fechaComprobantes) {
      return res.status(400).json({
        success: false,
        mensaje: 'La fecha de comprobantes es requerida'
      });
    }

    // Verificar permisos
    let sucursalId = req.body.sucursalId;
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      sucursalId = req.usuario.sucursalId;
    }

    // Convertir fecha a rango del día
    const fechaInicio = new Date(fechaComprobantes);
    fechaInicio.setHours(0, 0, 0, 0);
    
    const fechaFin = new Date(fechaComprobantes);
    fechaFin.setHours(23, 59, 59, 999);

    // Buscar comprobantes del día
    const where = {
      fechaVenta: {
        [Op.between]: [fechaInicio, fechaFin]
      },
      tipoComprobante: {
        [Op.in]: ['BOLETA', 'FACTURA']
      },
      estado: 'COMPLETADA'
    };

    if (sucursalId) {
      where.sucursalId = sucursalId;
    }

    const comprobantes = await Venta.findAll({
      where,
      include: [
        { 
          model: Cliente, 
          attributes: ['id', 'nombre', 'numeroDocumento'],
          required: false
        },
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre', 'ruc'] 
        }
      ],
      order: [['fechaVenta', 'ASC']]
    });

    if (comprobantes.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: 'No se encontraron comprobantes para la fecha especificada'
      });
    }

    // Generar estadísticas del resumen
    const estadisticas = {
      totalComprobantes: comprobantes.length,
      totalBoletas: comprobantes.filter(c => c.tipoComprobante === 'BOLETA').length,
      totalFacturas: comprobantes.filter(c => c.tipoComprobante === 'FACTURA').length,
      montoTotal: comprobantes.reduce((sum, c) => sum + parseFloat(c.total), 0),
      montoSubtotal: comprobantes.reduce((sum, c) => sum + parseFloat(c.subtotal), 0),
      montoIGV: comprobantes.reduce((sum, c) => sum + parseFloat(c.igv), 0),
      fechaResumen: fechaComprobantes,
      sucursalId: sucursalId
    };

    res.status(201).json({
      success: true,
      mensaje: 'Resumen generado exitosamente',
      resumen: {
        id: Date.now(), // ID temporal para el frontend
        fechaEmision: fechaComprobantes,
        fechaReferencia: fechaComprobantes,
        identificador: `RES-${fechaComprobantes.replace(/-/g, '')}`,
        estado: 'GENERADO',
        ticket: `TKT-${Date.now()}`,
        estadisticas,
        comprobantes: comprobantes.map(c => ({
          id: c.id,
          tipo: c.tipoComprobante,
          serie: c.serieComprobante,
          numero: c.numeroComprobante,
          cliente: c.Cliente ? c.Cliente.nombre : 'Cliente General',
          total: c.total
        }))
      }
    });

  } catch (error) {
    console.error('Error al crear resumen:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error al crear resumen', 
      error: error.message 
    });
  }
};

// Obtener estadísticas de resúmenes
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, sucursalId } = req.query;

    // Construir condiciones
    const where = {
      tipoComprobante: {
        [Op.in]: ['BOLETA', 'FACTURA']
      },
      estado: 'COMPLETADA'
    };

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      where.sucursalId = sucursalId;
    }

    // Filtro por fechas
    if (fechaInicio && fechaFin) {
      where.fechaVenta = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
      };
    }

    // Obtener estadísticas
    const estadisticas = await Venta.findAll({
      where,
      attributes: [
        'tipoComprobante',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
        [sequelize.fn('SUM', sequelize.col('total')), 'montoTotal'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'montoSubtotal'],
        [sequelize.fn('SUM', sequelize.col('igv')), 'montoIGV']
      ],
      group: ['tipoComprobante']
    });

    res.json({
      success: true,
      estadisticas: estadisticas.map(stat => ({
        tipo: stat.tipoComprobante,
        cantidad: parseInt(stat.dataValues.cantidad),
        montoTotal: parseFloat(stat.dataValues.montoTotal || 0),
        montoSubtotal: parseFloat(stat.dataValues.montoSubtotal || 0),
        montoIGV: parseFloat(stat.dataValues.montoIGV || 0)
      }))
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error al obtener estadísticas', 
      error: error.message 
    });
  }
};

// Descargar resumen (XML, PDF, etc.)
exports.descargarResumen = async (req, res) => {
  try {
    const { id, tipo } = req.params;

    // Buscar la venta/resumen
    const venta = await Venta.findByPk(id, {
      include: [
        { model: Cliente, required: false },
        { model: Sucursal }
      ]
    });

    if (!venta) {
      return res.status(404).json({
        success: false,
        mensaje: 'Resumen no encontrado'
      });
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && venta.sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tiene permisos para descargar este resumen'
      });
    }

    // Según el tipo de descarga
    switch (tipo) {
      case 'xml':
        if (venta.xmlUrl) {
          return res.redirect(venta.xmlUrl);
        }
        break;
      case 'cdr':
        if (venta.cdrUrl) {
          return res.redirect(venta.cdrUrl);
        }
        break;
      case 'pdf':
        if (venta.pdfUrl) {
          return res.redirect(venta.pdfUrl);
        }
        break;
      default:
        return res.status(400).json({
          success: false,
          mensaje: 'Tipo de descarga no válido'
        });
    }

    res.status(404).json({
      success: false,
      mensaje: `Archivo ${tipo.toUpperCase()} no disponible`
    });

  } catch (error) {
    console.error('Error al descargar resumen:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error al descargar resumen', 
      error: error.message 
    });
  }
};