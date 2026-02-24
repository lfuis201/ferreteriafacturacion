
/*


const { ActivoFijo, Sucursal, sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los activos fijos
exports.obtenerActivosFijos = async (req, res) => {
  try {
    const { 
      categoria, 
      estado, 
      sucursalId, 
      fechaInicio, 
      fechaFin, 
      responsable,
      page = 1, 
      limit = 10 
    } = req.query;

    // Construir el objeto de condiciones para el filtro
    const whereConditions = {};

    if (categoria) {
      whereConditions.categoria = categoria;
    }

    if (estado) {
      whereConditions.estado = estado;
    }

    if (sucursalId) {
      whereConditions.sucursalId = sucursalId;
    }

    if (responsable) {
      whereConditions.responsable = {
        [Op.like]: `%${responsable}%`
      };
    }

    if (fechaInicio && fechaFin) {
      whereConditions.fechaCompra = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    } else if (fechaInicio) {
      whereConditions.fechaCompra = {
        [Op.gte]: fechaInicio
      };
    } else if (fechaFin) {
      whereConditions.fechaCompra = {
        [Op.lte]: fechaFin
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows: activosFijos } = await ActivoFijo.findAndCountAll({
      where: whereConditions,
      include: [
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ 
      activosFijos,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalItems: count
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener activos fijos', error: error.message });
  }
};

// Obtener un activo fijo por ID
exports.obtenerActivoFijoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const activoFijo = await ActivoFijo.findOne({
      where: { id },
      include: [
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre'],
          required: false
        }
      ]
    });

    if (!activoFijo) {
      return res.status(404).json({ mensaje: 'Activo fijo no encontrado' });
    }

    res.json({ activoFijo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el activo fijo', error: error.message });
  }
};

// Crear un nuevo activo fijo
exports.crearActivoFijo = async (req, res) => {
  try {
    // Verificar permisos (solo SuperAdmin, Admin y Contador pueden crear activos fijos)
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Contador') {
      return res.status(403).json({ mensaje: 'No tiene permisos para crear activos fijos' });
    }

    const {
      nombre,
      codigo,
      descripcion,
      categoria,
      valorCompra,
      fechaCompra,
      fechaInicioDepreciacion,
      vidaUtilAnos,
      metodoDepreciacion,
      ubicacion,
      responsable,
      numeroSerie,
      marca,
      modelo,
      proveedor,
      numeroFactura,
      estado,
      observaciones,
      sucursalId
    } = req.body;

    // Validaciones básicas
    if (!nombre || !codigo || !valorCompra || !fechaCompra || !categoria || !vidaUtilAnos) {
      return res.status(400).json({ 
        mensaje: 'Los campos nombre, código, valor de compra, fecha de compra, categoría y vida útil son obligatorios' 
      });
    }

    // Verificar que el código no exista
    const activoExistente = await ActivoFijo.findOne({ where: { codigo } });
    if (activoExistente) {
      return res.status(400).json({ mensaje: 'Ya existe un activo fijo con ese código' });
    }

    // Calcular depreciación anual
    const depreciacionAnual = parseFloat(valorCompra) / parseInt(vidaUtilAnos);

    // Crear el activo fijo
    const nuevoActivoFijo = await ActivoFijo.create({
      nombre,
      codigo,
      descripcion,
      categoria,
      valorCompra: parseFloat(valorCompra),
      valorActual: parseFloat(valorCompra), // Inicialmente igual al valor de compra
      fechaCompra,
      fechaInicioDepreciacion: fechaInicioDepreciacion || fechaCompra,
      vidaUtilAnos: parseInt(vidaUtilAnos),
      metodoDepreciacion: metodoDepreciacion || 'Lineal',
      depreciacionAcumulada: 0.00,
      depreciacionAnual,
      ubicacion,
      responsable,
      numeroSerie,
      marca,
      modelo,
      proveedor,
      numeroFactura,
      estado: estado || 'Activo',
      observaciones,
      sucursalId: sucursalId || null
    });

    // Obtener el activo creado con sus relaciones
    const activoFijoCreado = await ActivoFijo.findOne({
      where: { id: nuevoActivoFijo.id },
      include: [
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre'],
          required: false
        }
      ]
    });

    res.status(201).json({ 
      mensaje: 'Activo fijo creado exitosamente', 
      activoFijo: activoFijoCreado 
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el activo fijo', error: error.message });
  }
};

// Actualizar un activo fijo
exports.actualizarActivoFijo = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar permisos
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Contador') {
      return res.status(403).json({ mensaje: 'No tiene permisos para actualizar activos fijos' });
    }

    const activoFijo = await ActivoFijo.findByPk(id);

    if (!activoFijo) {
      return res.status(404).json({ mensaje: 'Activo fijo no encontrado' });
    }

    const {
      nombre,
      codigo,
      descripcion,
      categoria,
      valorCompra,
      fechaCompra,
      fechaInicioDepreciacion,
      vidaUtilAnos,
      metodoDepreciacion,
      ubicacion,
      responsable,
      numeroSerie,
      marca,
      modelo,
      proveedor,
      numeroFactura,
      estado,
      observaciones,
      sucursalId
    } = req.body;

    // Verificar que el código no exista en otro activo
    if (codigo && codigo !== activoFijo.codigo) {
      const activoExistente = await ActivoFijo.findOne({ 
        where: { 
          codigo,
          id: { [Op.ne]: id }
        } 
      });
      if (activoExistente) {
        return res.status(400).json({ mensaje: 'Ya existe un activo fijo con ese código' });
      }
    }

    // Preparar datos para actualizar
    const datosActualizacion = {};
    
    if (nombre !== undefined) datosActualizacion.nombre = nombre;
    if (codigo !== undefined) datosActualizacion.codigo = codigo;
    if (descripcion !== undefined) datosActualizacion.descripcion = descripcion;
    if (categoria !== undefined) datosActualizacion.categoria = categoria;
    if (valorCompra !== undefined) datosActualizacion.valorCompra = parseFloat(valorCompra);
    if (fechaCompra !== undefined) datosActualizacion.fechaCompra = fechaCompra;
    if (fechaInicioDepreciacion !== undefined) datosActualizacion.fechaInicioDepreciacion = fechaInicioDepreciacion;
    if (vidaUtilAnos !== undefined) datosActualizacion.vidaUtilAnos = parseInt(vidaUtilAnos);
    if (metodoDepreciacion !== undefined) datosActualizacion.metodoDepreciacion = metodoDepreciacion;
    if (ubicacion !== undefined) datosActualizacion.ubicacion = ubicacion;
    if (responsable !== undefined) datosActualizacion.responsable = responsable;
    if (numeroSerie !== undefined) datosActualizacion.numeroSerie = numeroSerie;
    if (marca !== undefined) datosActualizacion.marca = marca;
    if (modelo !== undefined) datosActualizacion.modelo = modelo;
    if (proveedor !== undefined) datosActualizacion.proveedor = proveedor;
    if (numeroFactura !== undefined) datosActualizacion.numeroFactura = numeroFactura;
    if (estado !== undefined) datosActualizacion.estado = estado;
    if (observaciones !== undefined) datosActualizacion.observaciones = observaciones;
    if (sucursalId !== undefined) datosActualizacion.sucursalId = sucursalId;

    // Recalcular depreciación anual si cambió el valor de compra o vida útil
    if (valorCompra !== undefined || vidaUtilAnos !== undefined) {
      const nuevoValorCompra = valorCompra !== undefined ? parseFloat(valorCompra) : activoFijo.valorCompra;
      const nuevaVidaUtil = vidaUtilAnos !== undefined ? parseInt(vidaUtilAnos) : activoFijo.vidaUtilAnos;
      datosActualizacion.depreciacionAnual = nuevoValorCompra / nuevaVidaUtil;
    }

    await activoFijo.update(datosActualizacion);

    // Obtener el activo actualizado con sus relaciones
    const activoFijoActualizado = await ActivoFijo.findOne({
      where: { id },
      include: [
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre'],
          required: false
        }
      ]
    });

    res.json({ 
      mensaje: 'Activo fijo actualizado exitosamente', 
      activoFijo: activoFijoActualizado 
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el activo fijo', error: error.message });
  }
};

// Eliminar un activo fijo
exports.eliminarActivoFijo = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar permisos
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin') {
      return res.status(403).json({ mensaje: 'No tiene permisos para eliminar activos fijos' });
    }

    const activoFijo = await ActivoFijo.findByPk(id);

    if (!activoFijo) {
      return res.status(404).json({ mensaje: 'Activo fijo no encontrado' });
    }

    await activoFijo.destroy();

    res.json({ mensaje: 'Activo fijo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el activo fijo', error: error.message });
  }
};

// Calcular depreciación de un activo fijo
exports.calcularDepreciacion = async (req, res) => {
  const { id } = req.params;

  try {
    const activoFijo = await ActivoFijo.findByPk(id);

    if (!activoFijo) {
      return res.status(404).json({ mensaje: 'Activo fijo no encontrado' });
    }

    const fechaActual = new Date();
    const fechaInicio = new Date(activoFijo.fechaInicioDepreciacion);
    
    // Calcular años transcurridos
    const anosTranscurridos = (fechaActual - fechaInicio) / (1000 * 60 * 60 * 24 * 365.25);
    
    let depreciacionAcumulada = 0;
    let valorActual = activoFijo.valorCompra;

    if (activoFijo.metodoDepreciacion === 'Lineal') {
      depreciacionAcumulada = Math.min(
        anosTranscurridos * activoFijo.depreciacionAnual,
        activoFijo.valorCompra
      );
      valorActual = Math.max(activoFijo.valorCompra - depreciacionAcumulada, 0);
    }

    // Actualizar el activo con los nuevos valores
    await activoFijo.update({
      depreciacionAcumulada: parseFloat(depreciacionAcumulada.toFixed(2)),
      valorActual: parseFloat(valorActual.toFixed(2))
    });

    res.json({
      mensaje: 'Depreciación calculada exitosamente',
      depreciacion: {
        valorCompra: activoFijo.valorCompra,
        depreciacionAcumulada: parseFloat(depreciacionAcumulada.toFixed(2)),
        valorActual: parseFloat(valorActual.toFixed(2)),
        anosTranscurridos: parseFloat(anosTranscurridos.toFixed(2)),
        anosVidaUtil: activoFijo.vidaUtilAnos,
        depreciacionAnual: activoFijo.depreciacionAnual
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al calcular la depreciación', error: error.message });
  }
};

// Obtener reporte de activos fijos
exports.obtenerReporteActivosFijos = async (req, res) => {
  try {
    // Verificar permisos
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Contador' &&
      req.usuario.rol !== 'Vendedor') {
      return res.status(403).json({ mensaje: 'No tiene permisos para ver reportes de activos fijos' });
    }

    const { 
      categoria, 
      estado, 
      sucursalId, 
      fechaInicio, 
      fechaFin 
    } = req.query;

    // Construir condiciones de búsqueda
    const whereConditions = {};

    if (categoria) {
      whereConditions.categoria = categoria;
    }

    if (estado) {
      whereConditions.estado = estado;
    }

    if (sucursalId) {
      whereConditions.sucursalId = sucursalId;
    }

    if (fechaInicio && fechaFin) {
      whereConditions.fechaCompra = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    }

    // Obtener activos fijos
    const activosFijos = await ActivoFijo.findAll({
      where: whereConditions,
      include: [
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre'],
          required: false
        }
      ],
      order: [['fechaCompra', 'DESC']]
    });

    // Calcular estadísticas
    const totalActivos = activosFijos.length;
    const valorTotalCompra = activosFijos.reduce((sum, activo) => sum + parseFloat(activo.valorCompra), 0);
    const valorTotalActual = activosFijos.reduce((sum, activo) => sum + parseFloat(activo.valorActual || activo.valorCompra), 0);
    const depreciacionTotalAcumulada = activosFijos.reduce((sum, activo) => sum + parseFloat(activo.depreciacionAcumulada), 0);

    // Agrupar por categoría
    const activosPorCategoria = activosFijos.reduce((acc, activo) => {
      const categoria = activo.categoria;
      if (!acc[categoria]) {
        acc[categoria] = {
          cantidad: 0,
          valorCompra: 0,
          valorActual: 0,
          depreciacionAcumulada: 0
        };
      }
      acc[categoria].cantidad++;
      acc[categoria].valorCompra += parseFloat(activo.valorCompra);
      acc[categoria].valorActual += parseFloat(activo.valorActual || activo.valorCompra);
      acc[categoria].depreciacionAcumulada += parseFloat(activo.depreciacionAcumulada);
      return acc;
    }, {});

    // Agrupar por estado
    const activosPorEstado = activosFijos.reduce((acc, activo) => {
      const estado = activo.estado;
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    // Agrupar por sucursal
    const activosPorSucursal = activosFijos.reduce((acc, activo) => {
      const sucursal = activo.Sucursal ? activo.Sucursal.nombre : 'Sin asignar';
      if (!acc[sucursal]) {
        acc[sucursal] = {
          cantidad: 0,
          valorCompra: 0,
          valorActual: 0
        };
      }
      acc[sucursal].cantidad++;
      acc[sucursal].valorCompra += parseFloat(activo.valorCompra);
      acc[sucursal].valorActual += parseFloat(activo.valorActual || activo.valorCompra);
      return acc;
    }, {});

    res.json({
      activosFijos,
      estadisticas: {
        totalActivos,
        valorTotalCompra: parseFloat(valorTotalCompra.toFixed(2)),
        valorTotalActual: parseFloat(valorTotalActual.toFixed(2)),
        depreciacionTotalAcumulada: parseFloat(depreciacionTotalAcumulada.toFixed(2)),
        porcentajeDepreciacion: valorTotalCompra > 0 ? parseFloat(((depreciacionTotalAcumulada / valorTotalCompra) * 100).toFixed(2)) : 0,
        activosPorCategoria,
        activosPorEstado,
        activosPorSucursal
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el reporte de activos fijos', error: error.message });
  }
};

// Obtener categorías de activos fijos
exports.obtenerCategorias = async (req, res) => {
  try {
    const categorias = [
      'Maquinaria',
      'Equipos',
      'Vehículos',
      'Muebles',
      'Inmuebles',
      'Tecnología',
      'Herramientas',
      'Otros'
    ];

    res.json({ categorias });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las categorías', error: error.message });
  }
};

// Actualizar depreciación de todos los activos fijos
exports.actualizarDepreciacionTodos = async (req, res) => {
  try {
    // Verificar permisos
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Contador') {
      return res.status(403).json({ mensaje: 'No tiene permisos para actualizar depreciaciones' });
    }

    const activosFijos = await ActivoFijo.findAll({
      where: { estado: 'Activo' }
    });

    const fechaActual = new Date();
    let activosActualizados = 0;

    for (const activo of activosFijos) {
      const fechaInicio = new Date(activo.fechaInicioDepreciacion);
      const anosTranscurridos = (fechaActual - fechaInicio) / (1000 * 60 * 60 * 24 * 365.25);
      
      let depreciacionAcumulada = 0;
      let valorActual = activo.valorCompra;

      if (activo.metodoDepreciacion === 'Lineal') {
        depreciacionAcumulada = Math.min(
          anosTranscurridos * activo.depreciacionAnual,
          activo.valorCompra
        );
        valorActual = Math.max(activo.valorCompra - depreciacionAcumulada, 0);
      }

      await activo.update({
        depreciacionAcumulada: parseFloat(depreciacionAcumulada.toFixed(2)),
        valorActual: parseFloat(valorActual.toFixed(2))
      });

      activosActualizados++;
    }

    res.json({
      mensaje: 'Depreciación actualizada exitosamente para todos los activos fijos',
      activosActualizados
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar las depreciaciones', error: error.message });
  }
}; */ 