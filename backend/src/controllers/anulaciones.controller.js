const { Venta, NotaVenta, Compra, GuiaRemision, Usuario, Cliente, Proveedor } = require('../models');
const { Op } = require('sequelize');

const anulacionesController = {
  // Obtener todas las anulaciones con filtros
  obtenerAnulaciones: async (req, res) => {
    try {
      const { 
        fechaInicio, 
        fechaFin, 
        tipo, 
        estado,
        page = 1, 
        limit = 10 
      } = req.query;

      const offset = (page - 1) * limit;
      
      // Crear condiciones de fecha para cada modelo
      const createDateConditions = (dateField) => {
        const conditions = {};
        if (fechaInicio && fechaFin) {
          conditions[dateField] = {
            [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
          };
        } else if (fechaInicio) {
          conditions[dateField] = {
            [Op.gte]: new Date(fechaInicio)
          };
        } else if (fechaFin) {
          conditions[dateField] = {
            [Op.lte]: new Date(fechaFin)
          };
        }
        return conditions;
      };

      let anulaciones = [];

      // Obtener anulaciones de ventas
      if (!tipo || tipo === 'venta') {
        const ventasAnuladas = await Venta.findAll({
          where: {
            estado: 'ANULADA',
            ...createDateConditions('fechaAnulacion')
          },
          include: [
            { 
              model: Cliente, 
              as: 'Cliente',
              attributes: ['id', 'nombre', 'numeroDocumento']
            },
            { 
              model: Usuario, 
              as: 'UsuarioAnulacion', 
              attributes: ['id', 'nombre', 'apellido'] 
            }
          ],
          order: [['fechaAnulacion', 'DESC']],
          limit: parseInt(limit),
          offset: parseInt(offset)
        });

        anulaciones = anulaciones.concat(
          ventasAnuladas.map(venta => ({
            id: venta.id,
            tipo: 'VENTA',
            tipoComprobante: venta.tipoComprobante,
            serieComprobante: venta.serieComprobante,
            numeroComprobante: venta.numeroComprobante,
            fechaEmision: venta.fechaEmision,
            fechaAnulacion: venta.fechaAnulacion,
            motivoAnulacion: venta.motivoAnulacion,
            total: venta.total,
            cliente: venta.Cliente ? {
              razonSocial: venta.Cliente.nombre,
              numeroDocumento: venta.Cliente.numeroDocumento
            } : null,
            usuarioAnulacion: venta.UsuarioAnulacion ? {
              nombre: `${venta.UsuarioAnulacion.nombre} ${venta.UsuarioAnulacion.apellido}`
            } : null,
            estado: 'ANULADO',
            identificador: `${venta.serieComprobante}-${venta.numeroComprobante}`,
            ticket: venta.numeroTicket || 'N/A'
          }))
        );
      }

      // Obtener anulaciones de notas de venta
      if (!tipo || tipo === 'nota_venta') {
        const notasAnuladas = await NotaVenta.findAll({
          where: {
            estado: 'anulada',
            ...createDateConditions('fechaAnulacion')
          },
          include: [
            { 
              model: Cliente, 
              as: 'Cliente',
              attributes: ['id', 'nombre', 'numeroDocumento']
            },
            { 
              model: Usuario, 
              as: 'UsuarioAnulacion', 
              attributes: ['id', 'nombre', 'apellido'] 
            }
          ],
          order: [['fechaAnulacion', 'DESC']],
          limit: parseInt(limit),
          offset: parseInt(offset)
        });

        anulaciones = anulaciones.concat(
          notasAnuladas.map(nota => ({
            id: nota.id,
            tipo: 'NOTA_VENTA',
            tipoComprobante: 'NOTA DE VENTA',
            serieComprobante: nota.serieComprobante,
            numeroComprobante: nota.numeroComprobante,
            fechaEmision: nota.fechaEmision,
            fechaAnulacion: nota.fechaAnulacion,
            motivoAnulacion: nota.motivoAnulacion,
            total: nota.total,
            cliente: nota.Cliente ? {
              razonSocial: nota.Cliente.nombre,
              numeroDocumento: nota.Cliente.numeroDocumento
            } : null,
            usuarioAnulacion: nota.UsuarioAnulacion ? {
              nombre: `${nota.UsuarioAnulacion.nombre} ${nota.UsuarioAnulacion.apellido}`
            } : null,
            estado: 'ANULADO',
            identificador: `${nota.serieComprobante}-${nota.numeroComprobante}`,
            ticket: nota.numeroTicket || 'N/A'
          }))
        );
      }

      // Obtener anulaciones de compras
      if (!tipo || tipo === 'compra') {
        const comprasAnuladas = await Compra.findAll({
          where: {
            estado: 'ANULADA',
            ...createDateConditions('updatedAt')
          },
          include: [
            { 
              model: Proveedor, 
              as: 'Proveedor',
              attributes: ['id', 'nombre', 'numeroDocumento']
            }
          ],
          order: [['updatedAt', 'DESC']],
          limit: parseInt(limit),
          offset: parseInt(offset)
        });

        anulaciones = anulaciones.concat(
          comprasAnuladas.map(compra => ({
            id: compra.id,
            tipo: 'COMPRA',
            tipoComprobante: compra.tipoComprobante,
            serieComprobante: compra.serieComprobante,
            numeroComprobante: compra.numeroComprobante,
            fechaEmision: compra.fechaCompra,
            fechaAnulacion: compra.updatedAt,
            motivoAnulacion: 'Compra anulada',
            total: compra.total,
            proveedor: compra.Proveedor ? {
              nombre: compra.Proveedor.nombre,
              numeroDocumento: compra.Proveedor.numeroDocumento
            } : null,
            estado: 'ANULADO',
            identificador: `${compra.serieComprobante}-${compra.numeroComprobante}`,
            ticket: 'N/A'
          }))
        );
      }

      // Obtener anulaciones de guías de remisión
      if (!tipo || tipo === 'guia_remision') {
        const guiasAnuladas = await GuiaRemision.findAll({
          where: {
            estado: 'Anulado',
            ...createDateConditions('updatedAt')
          },
          order: [['updatedAt', 'DESC']],
          limit: parseInt(limit),
          offset: parseInt(offset)
        });

        anulaciones = anulaciones.concat(
          guiasAnuladas.map(guia => ({
            id: guia.id,
            tipo: 'GUIA_REMISION',
            tipoComprobante: 'GUÍA DE REMISIÓN',
            serieComprobante: guia.serieComprobante,
            numeroComprobante: guia.numeroComprobante,
            fechaEmision: guia.fechaSalida,
            fechaAnulacion: guia.updatedAt,
            motivoAnulacion: guia.observacion || 'Guía anulada',
            total: 0,
            estado: 'ANULADO',
            identificador: `${guia.serieComprobante}-${guia.numeroComprobante}`,
            ticket: 'N/A'
          }))
        );
      }

      // Ordenar por fecha de anulación descendente
      anulaciones.sort((a, b) => new Date(b.fechaAnulacion) - new Date(a.fechaAnulacion));

      // Calcular total de registros para paginación
      const totalAnulaciones = anulaciones.length;
      const totalPages = Math.ceil(totalAnulaciones / limit);

      res.json({
        anulaciones: anulaciones.slice(0, limit),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalAnulaciones,
          itemsPerPage: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Error al obtener anulaciones:', error);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor',
        error: error.message 
      });
    }
  },

  // Obtener estadísticas de anulaciones
  obtenerEstadisticas: async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      
      // Crear condiciones de fecha para cada modelo
      const createDateConditions = (dateField) => {
        const conditions = {};
        if (fechaInicio && fechaFin) {
          conditions[dateField] = {
            [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
          };
        } else if (fechaInicio) {
          conditions[dateField] = {
            [Op.gte]: new Date(fechaInicio)
          };
        } else if (fechaFin) {
          conditions[dateField] = {
            [Op.lte]: new Date(fechaFin)
          };
        }
        return conditions;
      };

      const [ventasAnuladas, notasAnuladas, comprasAnuladas, guiasAnuladas] = await Promise.all([
        Venta.count({ 
          where: { 
            estado: 'ANULADA',
            ...createDateConditions('fechaAnulacion')
          }
        }),
        NotaVenta.count({ 
          where: { 
            estado: 'anulada',
            ...createDateConditions('fechaAnulacion')
          }
        }),
        Compra.count({ 
          where: { 
            estado: 'ANULADA',
            ...createDateConditions('updatedAt')
          }
        }),
        GuiaRemision.count({ 
          where: { 
            estado: 'Anulado',
            ...createDateConditions('updatedAt')
          }
        })
      ]);

      const totalAnulaciones = ventasAnuladas + notasAnuladas + comprasAnuladas + guiasAnuladas;

      res.json({
        estadisticas: {
          total: totalAnulaciones,
          ventas: ventasAnuladas,
          notasVenta: notasAnuladas,
          compras: comprasAnuladas,
          guiasRemision: guiasAnuladas
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de anulaciones:', error);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor',
        error: error.message 
      });
    }
  },

  // Descargar documento anulado
  descargarDocumento: async (req, res) => {
    try {
      const { id, tipo, formato = 'pdf' } = req.params;

      let documento = null;
      let controllerMethod = null;

      switch (tipo.toLowerCase()) {
        case 'venta':
          documento = await Venta.findByPk(id);
          // Aquí se podría implementar la descarga del PDF de la venta
          break;
        case 'nota_venta':
          documento = await NotaVenta.findByPk(id);
          // Aquí se podría implementar la descarga del PDF de la nota
          break;
        case 'compra':
          documento = await Compra.findByPk(id);
          // Aquí se podría implementar la descarga del PDF de la compra
          break;
        case 'guia_remision':
          documento = await GuiaRemision.findByPk(id);
          // Aquí se podría implementar la descarga del PDF de la guía
          break;
        default:
          return res.status(400).json({ mensaje: 'Tipo de documento no válido' });
      }

      if (!documento) {
        return res.status(404).json({ mensaje: 'Documento no encontrado' });
      }

      // Verificar si el documento está anulado según su tipo
      const estadosAnulados = {
        'venta': 'ANULADA',
        'nota_venta': 'anulada', 
        'compra': 'ANULADA',
        'guia_remision': 'Anulado'
      };

      if (documento.estado !== estadosAnulados[tipo.toLowerCase()]) {
        return res.status(400).json({ mensaje: 'El documento no está anulado' });
      }

      // Por ahora retornamos la información del documento
      // En una implementación completa, aquí se generaría y descargaría el PDF
      res.json({
        mensaje: 'Descarga simulada',
        documento: {
          id: documento.id,
          tipo: tipo.toUpperCase(),
          identificador: `${documento.serieComprobante}-${documento.numeroComprobante}`,
          fechaAnulacion: documento.fechaAnulacion,
          formato: formato
        }
      });

    } catch (error) {
      console.error('Error al descargar documento:', error);
      res.status(500).json({ 
        mensaje: 'Error interno del servidor',
        error: error.message 
      });
    }
  }
};

module.exports = anulacionesController;