const Configuracion = require('../models/Configuracion');
const { Op } = require('sequelize');

// Obtener todas las configuraciones
exports.obtenerConfiguraciones = async (req, res) => {
  try {
    const { categoria, activo } = req.query;
    
    const whereClause = {};
    if (categoria) {
      whereClause.categoria = categoria;
    }
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }
    
    const configuraciones = await Configuracion.findAll({
      where: whereClause,
      order: [['categoria', 'ASC'], ['clave', 'ASC']]
    });
    
    res.json({
      mensaje: 'Configuraciones obtenidas exitosamente',
      configuraciones
    });
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener una configuración específica
exports.obtenerConfiguracion = async (req, res) => {
  try {
    const { clave } = req.params;
    
    const configuracion = await Configuracion.findOne({
      where: { clave }
    });
    
    if (!configuracion) {
      return res.status(404).json({
        mensaje: 'Configuración no encontrada'
      });
    }
    
    res.json({
      mensaje: 'Configuración obtenida exitosamente',
      configuracion
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener valor de una configuración
exports.obtenerValorConfiguracion = async (req, res) => {
  try {
    const { clave } = req.params;
    const { valorPorDefecto } = req.query;
    
    const valor = await Configuracion.obtenerValor(clave, valorPorDefecto);
    
    res.json({
      mensaje: 'Valor obtenido exitosamente',
      clave,
      valor
    });
  } catch (error) {
    console.error('Error al obtener valor de configuración:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear o actualizar configuración
exports.establecerConfiguracion = async (req, res) => {
  try {
    // Verificar permisos
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin') {
      return res.status(403).json({
        mensaje: 'No tiene permisos para modificar configuraciones'
      });
    }
    
    const { clave, valor, tipo, descripcion, categoria } = req.body;
    
    if (!clave || valor === undefined) {
      return res.status(400).json({
        mensaje: 'La clave y el valor son requeridos'
      });
    }
    
    const configuracion = await Configuracion.establecerValor(
      clave,
      valor,
      tipo || 'STRING',
      descripcion,
      categoria
    );
    
    res.json({
      mensaje: 'Configuración establecida exitosamente',
      configuracion
    });
  } catch (error) {
    console.error('Error al establecer configuración:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Activar/desactivar configuración
exports.toggleConfiguracion = async (req, res) => {
  try {
    // Verificar permisos
    if (req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin') {
      return res.status(403).json({
        mensaje: 'No tiene permisos para modificar configuraciones'
      });
    }
    
    const { clave } = req.params;
    const { activo } = req.body;
    
    const configuracion = await Configuracion.findOne({
      where: { clave }
    });
    
    if (!configuracion) {
      return res.status(404).json({
        mensaje: 'Configuración no encontrada'
      });
    }
    
    await configuracion.update({
      activo: activo !== undefined ? activo : !configuracion.activo
    });
    
    res.json({
      mensaje: 'Estado de configuración actualizado exitosamente',
      configuracion
    });
  } catch (error) {
    console.error('Error al cambiar estado de configuración:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar configuración
exports.eliminarConfiguracion = async (req, res) => {
  try {
    // Verificar permisos
    if (req.usuario.rol !== 'SuperAdmin') {
      return res.status(403).json({
        mensaje: 'Solo SuperAdmin puede eliminar configuraciones'
      });
    }
    
    const { clave } = req.params;
    
    const configuracion = await Configuracion.findOne({
      where: { clave }
    });
    
    if (!configuracion) {
      return res.status(404).json({
        mensaje: 'Configuración no encontrada'
      });
    }
    
    await configuracion.destroy();
    
    res.json({
      mensaje: 'Configuración eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar configuración:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Inicializar configuraciones por defecto
exports.inicializarConfiguracionesPorDefecto = async () => {
  try {
    const configuracionesPorDefecto = [
      {
        clave: 'IGV_VISIBLE',
        valor: true,
        tipo: 'BOOLEAN',
        descripcion: 'Controla si el IGV se muestra en las facturas y documentos',
        categoria: 'FACTURACION'
      },
      {
        clave: 'PORCENTAJE_IGV',
        valor: 18,
        tipo: 'NUMBER',
        descripcion: 'Porcentaje del IGV aplicado a las ventas',
        categoria: 'FACTURACION'
      },
      {
        clave: 'MONEDA_DEFECTO',
        valor: 'PEN',
        tipo: 'STRING',
        descripcion: 'Moneda por defecto para las transacciones',
        categoria: 'GENERAL'
      },
      {
        clave: 'EMPRESA_NOMBRE',
        valor: 'Mi Empresa',
        tipo: 'STRING',
        descripcion: 'Nombre de la empresa',
        categoria: 'EMPRESA'
      },
      {
        clave: 'MULTI_EMPRESA',
        valor: false,
        tipo: 'BOOLEAN',
        descripcion: 'Habilita la gestión multiempresa',
        categoria: 'EMPRESA'
      },
      {
        clave: 'GIRO_NEGOCIO',
        valor: 'Comercial',
        tipo: 'STRING',
        descripcion: 'Giro de negocio de la empresa',
        categoria: 'EMPRESA'
      },
      // Configuraciones de listas para "General" (sistema)
      {
        clave: 'BANCOS',
        valor: [],
        tipo: 'JSON',
        descripcion: 'Listado de bancos del sistema',
        categoria: 'GENERAL'
      },
      {
        clave: 'CUENTAS_BANCARIAS',
        valor: [],
        tipo: 'JSON',
        descripcion: 'Listado de cuentas bancarias del sistema',
        categoria: 'GENERAL'
      },
      {
        clave: 'MONEDAS',
        valor: [],
        tipo: 'JSON',
        descripcion: 'Lista de monedas admitidas por el sistema',
        categoria: 'GENERAL'
      },
      {
        clave: 'TARJETAS',
        valor: [],
        tipo: 'JSON',
        descripcion: 'Listado de tarjetas aceptadas',
        categoria: 'GENERAL'
      },
      {
        clave: 'ALMACENES',
        valor: [],
        tipo: 'JSON',
        descripcion: 'Lista de almacenes del sistema',
        categoria: 'GENERAL'
      },
      {
        clave: 'AGENCIAS',
        valor: [],
        tipo: 'JSON',
        descripcion: 'Lista de agencias del sistema',
        categoria: 'GENERAL'
      }
    ];
    
    for (const config of configuracionesPorDefecto) {
      await Configuracion.establecerValor(
        config.clave,
        config.valor,
        config.tipo,
        config.descripcion,
        config.categoria
      );
    }
    
    // Crear datos básicos necesarios para el funcionamiento
    const { Sucursal, Proveedor, Producto, Categoria } = require('../models');
    
    // Crear sucursal por defecto si no existe
    const [sucursal] = await Sucursal.findOrCreate({
      where: { id: 1 },
      defaults: {
        nombre: 'Sucursal Principal',
        direccion: 'Dirección Principal',
        telefono: '123456789',
        estado: true
      }
    });
    
    // Crear proveedor por defecto si no existe
    const [proveedor] = await Proveedor.findOrCreate({
      where: { id: 1 },
      defaults: {
        nombre: 'Proveedor de Prueba',
        numeroDocumento: '12345678901',
        tipoDocumento: 'RUC',
        direccion: 'Dirección del Proveedor',
        telefono: '987654321',
        email: 'proveedor@test.com',
        estado: true
      }
    });
    
    // Crear categoría por defecto si no existe
    const [categoria] = await Categoria.findOrCreate({
      where: { id: 1 },
      defaults: {
        nombre: 'General',
        descripcion: 'Categoría general',
        estado: true
      }
    });
    
    // Crear producto por defecto si no existe
    const [producto] = await Producto.findOrCreate({
      where: { id: 1 },
      defaults: {
        nombre: 'Producto de Prueba',
        codigo: 'PROD001',
        descripcion: 'Producto para pruebas',
        precioCompra: 10.00,
        precioVenta: 15.00,
        unidadMedida: 'unidad',
        categoriaId: 1,
        iscActivo: 0,
        sujetoDetraccion: 0,
        estado: true
      }
    });
    
    console.log('✅ Configuraciones y datos básicos inicializados');
  } catch (error) {
    console.error('Error al inicializar configuraciones por defecto:', error);
  }
};