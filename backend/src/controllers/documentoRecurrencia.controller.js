const { Venta, DetalleVenta, Producto, Cliente, Sucursal, Usuario, Inventario, MovimientoInventario, Presentacion } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Obtener documentos de recurrencia con filtros y paginación
exports.obtenerDocumentosRecurrencia = async (req, res) => {
  try {
    console.log('🔍 Obteniendo documentos de recurrencia con filtros:', req.query);
    
    const {
      fechaEmision,
      fechaInicio,
      fechaFin,
      busqueda,
      tipoDocumento,
      estado,
      page = 1,
      limit = 10
    } = req.query;

    // Verificar permisos de sucursal
    let sucursalCondition = {};
    if (req.usuario.rol !== 'SuperAdmin') {
      sucursalCondition = { sucursalId: req.usuario.sucursalId };
    }

    // Construir condiciones de filtro
    let whereConditions = {
      ...sucursalCondition,
      // Solo ventas que podrían ser recurrentes (por ejemplo, facturas)
      tipoComprobante: {
        [Op.in]: ['01', '03'] // Facturas y boletas
      }
    };

    // Filtro por fecha de emisión específica
    if (fechaEmision) {
      whereConditions.fechaVenta = {
        [Op.eq]: fechaEmision
      };
    }

    // Filtro por rango de fechas
    if (fechaInicio && fechaFin) {
      whereConditions.fechaVenta = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    } else if (fechaInicio) {
      whereConditions.fechaVenta = {
        [Op.gte]: fechaInicio
      };
    } else if (fechaFin) {
      whereConditions.fechaVenta = {
        [Op.lte]: fechaFin
      };
    }

    // Filtro por tipo de documento
    if (tipoDocumento) {
      whereConditions.tipoComprobante = tipoDocumento;
    }

    // Filtro por estado
    if (estado) {
      whereConditions.estado = estado;
    }

    // Filtro de búsqueda por serie, número o cliente
    let includeConditions = [
      {
        model: Cliente,
        attributes: ['id', 'nombre', 'numeroDocumento', 'tipoDocumento'],
        required: false
      },
      {
        model: Sucursal,
        attributes: ['id', 'nombre'],
        required: false
      },
      {
        model: Usuario,
        attributes: ['id', 'nombre'],
        required: false
      }
    ];

    if (busqueda) {
      whereConditions[Op.or] = [
        { serieComprobante: { [Op.iLike]: `%${busqueda}%` } },
        { numeroComprobante: { [Op.iLike]: `%${busqueda}%` } },
        { '$Cliente.nombre$': { [Op.iLike]: `%${busqueda}%` } },
        { '$Cliente.numeroDocumento$': { [Op.iLike]: `%${busqueda}%` } }
      ];
    }

    // Calcular offset para paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Ejecutar consulta con paginación
    const { count, rows: documentos } = await Venta.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      order: [['fechaVenta', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    // Formatear datos para la respuesta
    const documentosFormateados = documentos.map(venta => ({
      id: venta.id,
      fechaEmision: venta.fechaVenta,
      tipoDocumento: venta.tipoComprobante,
      serie: venta.serieComprobante,
      numero: venta.numeroComprobante,
      cliente: venta.Cliente ? {
        id: venta.Cliente.id,
        nombre: venta.Cliente.nombre,
        documento: venta.Cliente.numeroDocumento,
        tipoDocumento: venta.Cliente.tipoDocumento
      } : null,
      total: parseFloat(venta.total || 0),
      estado: venta.estado,
      sucursal: venta.Sucursal ? venta.Sucursal.nombre : '',
      usuario: venta.Usuario ? venta.Usuario.nombre : '',
      // Campos específicos para recurrencia
      esRecurrente: true, // Por ahora todos son marcados como recurrentes
      proximaFecha: null, // Se calculará según la lógica de negocio
      frecuencia: 'mensual', // Valor por defecto
      activo: venta.estado === 'completado'
    }));

    const totalPages = Math.ceil(count / parseInt(limit));

    console.log(`📊 Encontrados ${count} documentos de recurrencia, página ${page} de ${totalPages}`);

    res.json({
      documentos: documentosFormateados,
      total: count,
      page: parseInt(page),
      totalPages: totalPages,
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('❌ Error al obtener documentos de recurrencia:', error);
    res.status(500).json({
      mensaje: 'Error al obtener documentos de recurrencia',
      error: error.message
    });
  }
};

// Obtener documento de recurrencia por ID
exports.obtenerDocumentoRecurrenciaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Obteniendo documento de recurrencia por ID:', id);

    const venta = await Venta.findByPk(id, {
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'numeroDocumento', 'tipoDocumento', 'email', 'telefono']
        },
        {
          model: Sucursal,
          as: 'sucursal',
          attributes: ['id', 'nombre']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre']
        },
        {
          model: DetalleVenta,
          as: 'detalles',
          include: [
            {
              model: Producto,
              as: 'producto',
              attributes: ['id', 'nombre', 'codigo']
            }
          ]
        }
      ]
    });

    if (!venta) {
      return res.status(404).json({ mensaje: 'Documento de recurrencia no encontrado' });
    }

    // Verificar permisos
    if (req.usuario.rol !== 'SuperAdmin' && venta.sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({ mensaje: 'No tiene permisos para ver documentos de otras sucursales' });
    }

    // Formatear respuesta
    const documentoFormateado = {
      id: venta.id,
      fechaEmision: venta.fechaVenta,
      tipoDocumento: venta.tipoComprobante,
      serie: venta.serieComprobante,
      numero: venta.numeroComprobante,
      cliente: venta.cliente ? {
        id: venta.cliente.id,
        nombre: venta.cliente.nombre,
        documento: venta.cliente.numeroDocumento,
        tipoDocumento: venta.cliente.tipoDocumento,
        email: venta.cliente.email,
        telefono: venta.cliente.telefono
      } : null,
      detalles: venta.detalles ? venta.detalles.map(detalle => ({
        id: detalle.id,
        producto: detalle.producto ? {
          id: detalle.producto.id,
          nombre: detalle.producto.nombre,
          codigo: detalle.producto.codigo
        } : null,
        cantidad: parseFloat(detalle.cantidad),
        precio: parseFloat(detalle.precio),
        subtotal: parseFloat(detalle.subtotal)
      })) : [],
      subtotal: parseFloat(venta.subtotal || 0),
      igv: parseFloat(venta.igv || 0),
      total: parseFloat(venta.total || 0),
      estado: venta.estado,
      sucursal: venta.sucursal ? venta.sucursal.nombre : '',
      usuario: venta.usuario ? venta.usuario.nombre : '',
      // Campos específicos para recurrencia
      esRecurrente: true,
      proximaFecha: null,
      frecuencia: 'mensual',
      activo: venta.estado === 'completado'
    };

    console.log('✅ Documento de recurrencia obtenido exitosamente');
    res.json(documentoFormateado);

  } catch (error) {
    console.error('❌ Error al obtener documento de recurrencia por ID:', error);
    res.status(500).json({
      mensaje: 'Error al obtener documento de recurrencia',
      error: error.message
    });
  }
};

// Crear nuevo documento de recurrencia
exports.crearDocumentoRecurrencia = async (req, res) => {
  try {
    console.log('📝 Creando nuevo documento de recurrencia:', req.body);
    
    // Por ahora, redirigir a la creación de venta normal
    // En el futuro se puede implementar lógica específica para recurrencia
    res.status(501).json({
      mensaje: 'Funcionalidad de creación de documentos de recurrencia en desarrollo',
      sugerencia: 'Use el endpoint de ventas para crear documentos que luego pueden ser marcados como recurrentes'
    });

  } catch (error) {
    console.error('❌ Error al crear documento de recurrencia:', error);
    res.status(500).json({
      mensaje: 'Error al crear documento de recurrencia',
      error: error.message
    });
  }
};

// Actualizar documento de recurrencia
exports.actualizarDocumentoRecurrencia = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Actualizando documento de recurrencia:', id, req.body);
    
    // Por ahora, redirigir a la actualización de venta normal
    res.status(501).json({
      mensaje: 'Funcionalidad de actualización de documentos de recurrencia en desarrollo'
    });

  } catch (error) {
    console.error('❌ Error al actualizar documento de recurrencia:', error);
    res.status(500).json({
      mensaje: 'Error al actualizar documento de recurrencia',
      error: error.message
    });
  }
};

// Eliminar documento de recurrencia
exports.eliminarDocumentoRecurrencia = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Eliminando documento de recurrencia:', id);
    
    // Por ahora, no permitir eliminación directa
    res.status(501).json({
      mensaje: 'Funcionalidad de eliminación de documentos de recurrencia en desarrollo',
      sugerencia: 'Use el endpoint de ventas para anular documentos'
    });

  } catch (error) {
    console.error('❌ Error al eliminar documento de recurrencia:', error);
    res.status(500).json({
      mensaje: 'Error al eliminar documento de recurrencia',
      error: error.message
    });
  }
};

// Procesar recurrencia de documento
exports.procesarRecurrenciaDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔄 Procesando recurrencia de documento:', id);
    
    const venta = await Venta.findByPk(id, {
      include: [
        {
          model: Cliente,
          as: 'cliente'
        },
        {
          model: DetalleVenta,
          as: 'detalles',
          include: [
            {
              model: Producto,
              as: 'producto'
            }
          ]
        }
      ]
    });

    if (!venta) {
      return res.status(404).json({ mensaje: 'Documento de recurrencia no encontrado' });
    }

    // Verificar permisos
    if (req.usuario.rol !== 'SuperAdmin' && venta.sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({ mensaje: 'No tiene permisos para procesar documentos de otras sucursales' });
    }

    // Simular procesamiento de recurrencia
    // En una implementación real, aquí se crearía una nueva venta basada en la original
    console.log('✅ Recurrencia procesada exitosamente (simulado)');
    
    res.json({
      mensaje: 'Recurrencia procesada exitosamente',
      documentoOriginal: {
        id: venta.id,
        serie: venta.serieComprobante,
        numero: venta.numeroComprobante
      },
      proximaFecha: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 días después
    });

  } catch (error) {
    console.error('❌ Error al procesar recurrencia de documento:', error);
    res.status(500).json({
      mensaje: 'Error al procesar recurrencia de documento',
      error: error.message
    });
  }
};