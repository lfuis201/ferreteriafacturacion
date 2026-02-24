const { ConfiguracionSunat } = require('../models');
const { Op } = require('sequelize');

/**
 * Controlador para gestionar series y correlativos de comprobantes electrónicos
 */
class SeriesCorrelativosController {
  /**
   * Obtener todas las series configuradas para una sucursal
   */
  static async obtenerSeries(req, res) {
    try {
      const { sucursalId } = req.params;
      const { usuarioId } = req.user;

      const configuracion = await ConfiguracionSunat.findOne({
        where: { 
          sucursalId, 
          usuarioId,
          activo: true 
        }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración SUNAT para esta sucursal'
        });
      }

      const series = configuracion.series || {
        facturas: [],
        boletas: [],
        notasCredito: [],
        notasDebito: []
      };

      res.json({
        success: true,
        data: {
          sucursalId,
          series,
          fechaActualizacion: configuracion.updatedAt
        }
      });

    } catch (error) {
      console.error('Error al obtener series:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear nueva serie para un tipo de comprobante
   */
  static async crearSerie(req, res) {
    try {
      const { sucursalId } = req.params;
      const { usuarioId } = req.user;
      const {
        tipoComprobante,
        serie,
        correlativoInicial,
        descripcion,
        activo = true
      } = req.body;

      // Validar datos requeridos
      if (!tipoComprobante || !serie || correlativoInicial === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de comprobante, serie y correlativo inicial son requeridos'
        });
      }

      // Validar formato de serie
      if (!SeriesCorrelativosController.validarFormatoSerie(serie, tipoComprobante)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de serie inválido para el tipo de comprobante'
        });
      }

      // Validar correlativo inicial
      if (correlativoInicial < 1 || correlativoInicial > 99999999) {
        return res.status(400).json({
          success: false,
          message: 'El correlativo inicial debe estar entre 1 y 99999999'
        });
      }

      const configuracion = await ConfiguracionSunat.findOne({
        where: { 
          sucursalId, 
          usuarioId,
          activo: true 
        }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración SUNAT para esta sucursal'
        });
      }

      // Obtener series actuales
      const seriesActuales = configuracion.series || {
        facturas: [],
        boletas: [],
        notasCredito: [],
        notasDebito: []
      };

      // Determinar el array de series según el tipo
      const tipoSerie = SeriesCorrelativosController.obtenerTipoSerie(tipoComprobante);
      if (!seriesActuales[tipoSerie]) {
        seriesActuales[tipoSerie] = [];
      }

      // Verificar que la serie no exista
      const serieExistente = seriesActuales[tipoSerie].find(s => s.serie === serie);
      if (serieExistente) {
        return res.status(400).json({
          success: false,
          message: `La serie ${serie} ya existe para ${tipoComprobante}`
        });
      }

      // Crear nueva serie
      const nuevaSerie = {
        id: Date.now().toString(),
        serie,
        tipoComprobante,
        correlativoActual: correlativoInicial,
        correlativoInicial,
        descripcion: descripcion || `Serie ${serie} para ${tipoComprobante}`,
        activo,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      };

      // Agregar la nueva serie
      seriesActuales[tipoSerie].push(nuevaSerie);

      // Actualizar configuración
      configuracion.series = seriesActuales;
      await configuracion.save();

      res.status(201).json({
        success: true,
        message: 'Serie creada exitosamente',
        data: nuevaSerie
      });

    } catch (error) {
      console.error('Error al crear serie:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar serie existente
   */
  static async actualizarSerie(req, res) {
    try {
      const { sucursalId, serieId } = req.params;
      const { usuarioId } = req.user;
      const {
        descripcion,
        activo,
        correlativoActual
      } = req.body;

      const configuracion = await ConfiguracionSunat.findOne({
        where: { 
          sucursalId, 
          usuarioId,
          activo: true 
        }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración SUNAT para esta sucursal'
        });
      }

      const seriesActuales = configuracion.series || {
        facturas: [],
        boletas: [],
        notasCredito: [],
        notasDebito: []
      };

      // Buscar la serie en todos los tipos
      let serieEncontrada = null;
      let tipoSerie = null;
      let indice = -1;

      for (const [tipo, series] of Object.entries(seriesActuales)) {
        const index = series.findIndex(s => s.id === serieId);
        if (index !== -1) {
          serieEncontrada = series[index];
          tipoSerie = tipo;
          indice = index;
          break;
        }
      }

      if (!serieEncontrada) {
        return res.status(404).json({
          success: false,
          message: 'Serie no encontrada'
        });
      }

      // Actualizar campos permitidos
      if (descripcion !== undefined) {
        serieEncontrada.descripcion = descripcion;
      }
      
      if (activo !== undefined) {
        serieEncontrada.activo = activo;
      }
      
      if (correlativoActual !== undefined) {
        // Validar que el nuevo correlativo sea mayor al actual
        if (correlativoActual < serieEncontrada.correlativoActual) {
          return res.status(400).json({
            success: false,
            message: 'El nuevo correlativo debe ser mayor o igual al actual'
          });
        }
        serieEncontrada.correlativoActual = correlativoActual;
      }

      serieEncontrada.fechaActualizacion = new Date();

      // Actualizar en el array
      seriesActuales[tipoSerie][indice] = serieEncontrada;
      configuracion.series = seriesActuales;
      await configuracion.save();

      res.json({
        success: true,
        message: 'Serie actualizada exitosamente',
        data: serieEncontrada
      });

    } catch (error) {
      console.error('Error al actualizar serie:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar serie
   */
  static async eliminarSerie(req, res) {
    try {
      const { sucursalId, serieId } = req.params;
      const { usuarioId } = req.user;

      const configuracion = await ConfiguracionSunat.findOne({
        where: { 
          sucursalId, 
          usuarioId,
          activo: true 
        }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración SUNAT para esta sucursal'
        });
      }

      const seriesActuales = configuracion.series || {
        facturas: [],
        boletas: [],
        notasCredito: [],
        notasDebito: []
      };

      // Buscar y eliminar la serie
      let serieEliminada = false;
      for (const [tipo, series] of Object.entries(seriesActuales)) {
        const index = series.findIndex(s => s.id === serieId);
        if (index !== -1) {
          // Verificar que no sea la única serie activa del tipo
          const seriesActivas = series.filter(s => s.activo && s.id !== serieId);
          if (seriesActivas.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'No se puede eliminar la única serie activa de este tipo'
            });
          }

          series.splice(index, 1);
          serieEliminada = true;
          break;
        }
      }

      if (!serieEliminada) {
        return res.status(404).json({
          success: false,
          message: 'Serie no encontrada'
        });
      }

      configuracion.series = seriesActuales;
      await configuracion.save();

      res.json({
        success: true,
        message: 'Serie eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar serie:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener siguiente correlativo para una serie
   */
  static async obtenerSiguienteCorrelativo(req, res) {
    try {
      const { sucursalId } = req.params;
      const { usuarioId } = req.user;
      const { tipoComprobante, serie } = req.query;

      if (!tipoComprobante || !serie) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de comprobante y serie son requeridos'
        });
      }

      const configuracion = await ConfiguracionSunat.findOne({
        where: { 
          sucursalId, 
          usuarioId,
          activo: true 
        }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración SUNAT para esta sucursal'
        });
      }

      const seriesActuales = configuracion.series || {};
      const tipoSerie = SeriesCorrelativosController.obtenerTipoSerie(tipoComprobante);
      const series = seriesActuales[tipoSerie] || [];

      const serieEncontrada = series.find(s => s.serie === serie && s.activo);
      if (!serieEncontrada) {
        return res.status(404).json({
          success: false,
          message: 'Serie no encontrada o inactiva'
        });
      }

      const siguienteCorrelativo = serieEncontrada.correlativoActual + 1;

      res.json({
        success: true,
        data: {
          serie: serieEncontrada.serie,
          correlativoActual: serieEncontrada.correlativoActual,
          siguienteCorrelativo,
          tipoComprobante
        }
      });

    } catch (error) {
      console.error('Error al obtener siguiente correlativo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Incrementar correlativo de una serie
   */
  static async incrementarCorrelativo(req, res) {
    try {
      const { sucursalId } = req.params;
      const { usuarioId } = req.user;
      const { tipoComprobante, serie } = req.body;

      if (!tipoComprobante || !serie) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de comprobante y serie son requeridos'
        });
      }

      const configuracion = await ConfiguracionSunat.findOne({
        where: { 
          sucursalId, 
          usuarioId,
          activo: true 
        }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración SUNAT para esta sucursal'
        });
      }

      const seriesActuales = configuracion.series || {};
      const tipoSerie = SeriesCorrelativosController.obtenerTipoSerie(tipoComprobante);
      const series = seriesActuales[tipoSerie] || [];

      const indice = series.findIndex(s => s.serie === serie && s.activo);
      if (indice === -1) {
        return res.status(404).json({
          success: false,
          message: 'Serie no encontrada o inactiva'
        });
      }

      // Incrementar correlativo
      series[indice].correlativoActual += 1;
      series[indice].fechaActualizacion = new Date();

      configuracion.series = seriesActuales;
      await configuracion.save();

      res.json({
        success: true,
        message: 'Correlativo incrementado exitosamente',
        data: {
          serie: series[indice].serie,
          correlativoActual: series[indice].correlativoActual,
          tipoComprobante
        }
      });

    } catch (error) {
      console.error('Error al incrementar correlativo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Validar formato de serie según tipo de comprobante
   */
  static validarFormatoSerie(serie, tipoComprobante) {
    // Formato general: 4 caracteres alfanuméricos
    if (!/^[A-Z0-9]{4}$/.test(serie)) {
      return false;
    }

    // Validaciones específicas por tipo
    switch (tipoComprobante) {
      case '01': // Factura
        return /^F[A-Z0-9]{3}$/.test(serie);
      case '03': // Boleta
        return /^B[A-Z0-9]{3}$/.test(serie);
      case '07': // Nota de Crédito
        return /^FC[A-Z0-9]{2}$|^BC[A-Z0-9]{2}$/.test(serie);
      case '08': // Nota de Débito
        return /^FD[A-Z0-9]{2}$|^BD[A-Z0-9]{2}$/.test(serie);
      default:
        return true;
    }
  }

  /**
   * Obtener tipo de serie según código de comprobante
   */
  static obtenerTipoSerie(tipoComprobante) {
    const tipos = {
      '01': 'facturas',
      '03': 'boletas',
      '07': 'notasCredito',
      '08': 'notasDebito'
    };
    return tipos[tipoComprobante] || 'facturas';
  }

  /**
   * Obtener series por tipo de comprobante
   */
  static async obtenerSeriesPorTipo(req, res) {
    try {
      const { sucursalId, tipoComprobante } = req.params;
      const { usuarioId } = req.user;

      const configuracion = await ConfiguracionSunat.findOne({
        where: { 
          sucursalId, 
          usuarioId,
          activo: true 
        }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración SUNAT para esta sucursal'
        });
      }

      const seriesActuales = configuracion.series || {};
      const tipoSerie = SeriesCorrelativosController.obtenerTipoSerie(tipoComprobante);
      const series = seriesActuales[tipoSerie] || [];

      // Filtrar solo series activas
      const seriesActivas = series.filter(s => s.activo);

      res.json({
        success: true,
        data: {
          tipoComprobante,
          series: seriesActivas,
          total: seriesActivas.length
        }
      });

    } catch (error) {
      console.error('Error al obtener series por tipo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Inicializar series por defecto para una sucursal
   */
  static async inicializarSeriesDefecto(req, res) {
    try {
      const { sucursalId } = req.params;
      const { usuarioId } = req.user;

      const configuracion = await ConfiguracionSunat.findOne({
        where: { 
          sucursalId, 
          usuarioId,
          activo: true 
        }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración SUNAT para esta sucursal'
        });
      }

      // Verificar si ya tiene series configuradas
      if (configuracion.series && Object.keys(configuracion.series).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existen series configuradas para esta sucursal'
        });
      }

      // Crear series por defecto
      const seriesDefecto = {
        facturas: [{
          id: Date.now().toString(),
          serie: 'F001',
          tipoComprobante: '01',
          correlativoActual: 1,
          correlativoInicial: 1,
          descripcion: 'Serie por defecto para facturas',
          activo: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        }],
        boletas: [{
          id: (Date.now() + 1).toString(),
          serie: 'B001',
          tipoComprobante: '03',
          correlativoActual: 1,
          correlativoInicial: 1,
          descripcion: 'Serie por defecto para boletas',
          activo: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        }],
        notasCredito: [{
          id: (Date.now() + 2).toString(),
          serie: 'FC01',
          tipoComprobante: '07',
          correlativoActual: 1,
          correlativoInicial: 1,
          descripcion: 'Serie por defecto para notas de crédito',
          activo: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        }],
        notasDebito: [{
          id: (Date.now() + 3).toString(),
          serie: 'FD01',
          tipoComprobante: '08',
          correlativoActual: 1,
          correlativoInicial: 1,
          descripcion: 'Serie por defecto para notas de débito',
          activo: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        }]
      };

      configuracion.series = seriesDefecto;
      await configuracion.save();

      res.status(201).json({
        success: true,
        message: 'Series por defecto inicializadas exitosamente',
        data: seriesDefecto
      });

    } catch (error) {
      console.error('Error al inicializar series por defecto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = SeriesCorrelativosController;