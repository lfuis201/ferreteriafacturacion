const { Taller, Cliente, Usuario, Venta, Sucursal, Operario } = require('../models');
const { Op } = require('sequelize'); 
const moment = require('moment'); // Importar moment para manejar fechas


exports.crearTaller = async (req, res) => {
  try {
    // Verificar si se ha subido al menos una imagen
    if (!req.files || !req.files.imagen1 || req.files.imagen1.length === 0) {
      return res.status(400).json({ mensaje: 'La primera imagen es obligatoria' });
    }

    const {
      clienteId,
      descripcion,
      motivoIngreso,
      estado,
      numeroSerie,
      marca,
      equipo,
      modelo,
      placa,
      quilometraje,
      operarioId,
      categoria,
      checklist,
      precioMantenimiento,
      placaChecklist,
      colorChecklist,
      chasisChecklist,
      numeroFlotaChecklist,
      kilometrajeChecklist,
      añoChecklist,
      vencimientoSoatChecklist,
      vencimientoRevisionTecChecklist
    } = req.body;

    // Obtener información del cliente
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    // Obtener información del operario
    const operario = await Operario.findByPk(operarioId);
    if (!operario) {
      return res.status(404).json({ mensaje: 'Operario no encontrado' });
    }

    // Obtener información del usuario autenticado
    const usuarioId = req.usuario.id; // ID del usuario autenticado
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Generar URLs completas para las imágenes
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imagenesUrls = [];

    // Agregar la primera imagen (obligatoria)
    imagenesUrls.push(`${baseUrl}/uploads/${req.files.imagen1[0].filename}`);

    // Agregar la segunda imagen (opcional)
    if (req.files.imagen2 && req.files.imagen2.length > 0) {
      imagenesUrls.push(`${baseUrl}/uploads/${req.files.imagen2[0].filename}`);
    }

    // Agregar la tercera imagen (opcional)
    if (req.files.imagen3 && req.files.imagen3.length > 0) {
      imagenesUrls.push(`${baseUrl}/uploads/${req.files.imagen3[0].filename}`);
    }

    // Crear el taller
    const taller = await Taller.create({
      clienteId,
      nombreCliente: cliente.nombre, // Nombre del cliente
      telefonoCliente: cliente.telefono, // Teléfono del cliente
      descripcion,
      motivoIngreso,
      estado,
      numeroSerie,
      marca,
      equipo,
      modelo,
      placa,
      quilometraje,
      operarioId, // ID del operario
      categoria,
      imagen: imagenesUrls.join(','), // Guardar las URLs completas separadas por comas
      usuarioId, // ID del usuario autenticado
      nombreUsuario: usuario.nombre, // Nombre del usuario
      checklist,
      precioMantenimiento,
      placaChecklist,
      colorChecklist,
      chasisChecklist,
      numeroFlotaChecklist,
      kilometrajeChecklist,
      añoChecklist,
      vencimientoSoatChecklist,
      vencimientoRevisionTecChecklist
    });

    // Preparar respuesta con información completa
    const tallerRespuesta = {
      ...taller.toJSON(),
      nombreOperario: `${operario.nombres} ${operario.apellidos}`,
      puestoOperario: operario.puesto,
      especialidadOperario: operario.especialidad
    };

    res.status(201).json({
      mensaje: 'Cliente creado exitosamente en el taller',
      taller: tallerRespuesta
    });
  } catch (error) {
    console.error('Error al crear el Cliente en el taller:', error);
    res.status(500).json({ mensaje: 'Error al crear el Cliente en el taller', error: error.message });
  }
};



exports.obtenerTalleres = async (req, res) => {
  try {
    const talleres = await Taller.findAll({
      include: [
        { model: Cliente, as: 'cliente' },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido'] // Solo incluir estos campos del usuario
        },
        {
          model: Operario,
          as: 'operarioAsignado',
          attributes: ['id', 'nombres', 'apellidos', 'puesto', 'especialidad'],
          required: false
        }
      ]
    });
    res.status(200).json({
      mensaje: 'Clientes en el taller obtenidos exitosamente',
      talleres
    });
  } catch (error) {
    console.error('Error al obtener los clientes en el taller:', error);
    res.status(500).json({ mensaje: 'Error al obtener los clientes en el taller', error: error.message });
  }
};





exports.obtenerTallerPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const taller = await Taller.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuario' },
        {
          model: Operario,
          as: 'operarioAsignado',
          attributes: ['id', 'nombres', 'apellidos', 'puesto', 'especialidad'],
          required: false
        }
      ]
    });
    if (!taller) {
      return res.status(404).json({ mensaje: 'Taller no encontrado' });
    }
    res.json(taller);
  } catch (error) {
    console.error('Error al obtener el taller:', error);
    res.status(500).json({ mensaje: 'Error al obtener el taller', error: error.message });
  }
};






exports.actualizarTaller = async (req, res) => {
  const { id } = req.params;
  const {
    clienteId,
    nombreCliente,
    telefonoCliente,
    descripcion,
    motivoIngreso,
    estado,
    numeroSerie,
    marca,
    equipo,
    modelo,
    placa,
    quilometraje,
    operario,
    categoria,
    checklist,
    precioMantenimiento,
    placaChecklist,
    colorChecklist,
    chasisChecklist,
    numeroFlotaChecklist,
    kilometrajeChecklist,
    añoChecklist,
    vencimientoSoatChecklist,
    vencimientoRevisionTecChecklist
    
  } = req.body;

  try {
    // Verificar permisos (solo SuperAdmin, Admin y Trabajador pueden actualizar talleres)
    if (req.usuario &&
        req.usuario.rol !== 'SuperAdmin' &&
        req.usuario.rol !== 'Admin' &&
        req.usuario.rol !== 'Trabajador') {
      return res.status(403).json({ mensaje: 'No tiene permisos para actualizar talleres' });
    }

    // Verificar si el taller existe
    const taller = await Taller.findByPk(id);
    if (!taller) {
      return res.status(404).json({ mensaje: 'Taller no encontrado' });
    }

    // Verificar si el cliente existe (si se está actualizando)
    if (clienteId) {
      const clienteExiste = await Cliente.findOne({
        where: { id: clienteId, estado: true }
      });
      if (!clienteExiste) {
        return res.status(400).json({ mensaje: 'El cliente seleccionado no existe o está inactivo' });
      }
    }

    // Generar URLs completas para las imágenes
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imagenesUrls = [];

    // Agregar la primera imagen (opcional)
    if (req.files && req.files.imagen1 && req.files.imagen1.length > 0) {
      imagenesUrls.push(`${baseUrl}/uploads/${req.files.imagen1[0].filename}`);
    }

    // Agregar la segunda imagen (opcional)
    if (req.files && req.files.imagen2 && req.files.imagen2.length > 0) {
      imagenesUrls.push(`${baseUrl}/uploads/${req.files.imagen2[0].filename}`);
    }

    // Agregar la tercera imagen (opcional)
    if (req.files && req.files.imagen3 && req.files.imagen3.length > 0) {
      imagenesUrls.push(`${baseUrl}/uploads/${req.files.imagen3[0].filename}`);
    }

    // Actualizar el taller (sin incluir usuarioId)
    await taller.update({
      clienteId: clienteId || taller.clienteId,
      nombreCliente: nombreCliente || taller.nombreCliente,
      telefonoCliente: telefonoCliente || taller.telefonoCliente,
      descripcion: descripcion !== undefined ? descripcion : taller.descripcion,
      motivoIngreso: motivoIngreso !== undefined ? motivoIngreso : taller.motivoIngreso,
      estado: estado || taller.estado,
      numeroSerie: numeroSerie !== undefined ? numeroSerie : taller.numeroSerie,
      marca: marca !== undefined ? marca : taller.marca,
      equipo: equipo !== undefined ? equipo : taller.equipo,
      modelo: modelo !== undefined ? modelo : taller.modelo,
      placa: placa !== undefined ? placa : taller.placa,
      quilometraje: quilometraje !== undefined ? quilometraje : taller.quilometraje,
      operario: operario !== undefined ? operario : taller.operario,
      categoria: categoria || taller.categoria,
      checklist: checklist !== undefined ? checklist : taller.checklist,
      precioMantenimiento: precioMantenimiento !== undefined ? precioMantenimiento : taller.precioMantenimiento,
      placaChecklist: placaChecklist !== undefined ? placaChecklist : taller.placaChecklist,
      colorChecklist: colorChecklist !== undefined ? colorChecklist : taller.colorChecklist,
      chasisChecklist: chasisChecklist !== undefined ? chasisChecklist : taller.chasisChecklist,
      numeroFlotaChecklist: numeroFlotaChecklist !== undefined ? numeroFlotaChecklist : taller.numeroFlotaChecklist,
      kilometrajeChecklist: kilometrajeChecklist !== undefined ? kilometrajeChecklist : taller.kilometrajeChecklist,
      añoChecklist: añoChecklist !== undefined ? añoChecklist : taller.añoChecklist,
      vencimientoSoatChecklist: vencimientoSoatChecklist !== undefined ? vencimientoSoatChecklist : taller.vencimientoSoatChecklist,
      vencimientoRevisionTecChecklist: vencimientoRevisionTecChecklist !== undefined ? vencimientoRevisionTecChecklist : taller.vencimientoRevisionTecChecklist,
      imagen: imagenesUrls.length > 0 ? imagenesUrls.join(',') : taller.imagen
      // usuarioId se mantiene sin cambios (no se actualiza)
    });

    // Obtener el taller actualizado con la información del usuario y operario
    const tallerActualizado = await Taller.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido'] // Solo incluir estos campos del usuario
        },
        {
          model: Operario,
          as: 'operarioAsignado',
          attributes: ['id', 'nombres', 'apellidos', 'puesto', 'especialidad'],
          required: false
        }
      ]
    });

    res.json({
      mensaje: 'cliente actualizado exitosamente en el taller',
      taller: tallerActualizado // Incluir la información del usuario en la respuesta
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el taller', error: error.message });
  }
};




exports.eliminarTaller = async (req, res) => {
  const { id } = req.params;
  try {
    const taller = await Taller.findByPk(id);
    if (!taller) {
      return res.status(404).json({ mensaje: 'Cliente en el Taller no encontrado' });
    }

    await taller.destroy();
    res.json({ mensaje: ' Cliente en el Taller eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el taller:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el taller', error: error.message });
  }
};






exports.generarReporteTalleres = async (req, res) => {
  const { operario, fechaInicio, estado, categoria, marca, placa } = req.query;
  try {
    const totalTalleres = await Taller.count();

    const where = {};

    // Solo agregar filtros si tienen valores válidos
    if (operario && operario.trim() !== '') {
      // Filtrar por operarioId (ID del operario)
      where.operarioId = parseInt(operario.trim());
    }

    if (fechaInicio && fechaInicio.trim() !== '') {
      // Usar moment para manejar la fecha de manera más robusta
      const fechaInicioMoment = moment(fechaInicio, 'YYYY-MM-DD', true);
      if (fechaInicioMoment.isValid()) {
        // Crear un rango de fechas para el día completo
        const startOfDay = fechaInicioMoment.startOf('day').toDate();
        const endOfDay = fechaInicioMoment.endOf('day').toDate();

        where.createdAt = {
          [Op.between]: [startOfDay, endOfDay]
        };
      }
    }

    if (estado && estado.trim() !== '') {
      where.estado = estado.trim();
    }

    if (categoria && categoria.trim() !== '') {
      where.categoria = categoria.trim();
    }

    if (marca && marca.trim() !== '') {
      where.marca = {
        [Op.like]: `%${marca.trim()}%`
      };
    }

    if (placa && placa.trim() !== '') {
      where.placa = {
        [Op.like]: `%${placa.trim()}%`
      };
    }

    const talleres = await Taller.findAll({
      where,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          required: false
        },
        {
          model: Usuario,
          as: 'usuario',
          required: false
        },
        {
          model: Operario,
          as: 'operarioAsignado',
          attributes: ['id', 'nombres', 'apellidos', 'puesto', 'especialidad'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']] // Ordenar del más reciente al más antiguo
    });

    if (talleres.length === 0) {
      return res.status(404).json({
        mensaje: 'No se encontraron registros de atención en el taller con los filtros aplicados',
        debug: {
          totalRegistrosEnTabla: totalTalleres,
          filtrosAplicados: where,
          parametrosRecibidos: { operario, fechaInicio, estado, categoria, marca, placa }
        },
        filtros: {
          operario: operario || null,
          fechaInicio: fechaInicio || null,
          estado: estado || null,
          categoria: categoria || null,
          marca: marca || null,
          placa: placa || null
        },
        totalRegistros: 0,
        totalPrecioMantenimiento: 0,
        registros: []
      });
    }

    const totalRegistros = talleres.length;
    const totalPrecioMantenimiento = talleres.reduce((sum, taller) => {
      return sum + (parseFloat(taller.precioMantenimiento) || 0);
    }, 0);

    // Calcular total específico del operario si se filtró por operario
    let totalOperario = null;
    if (operario && operario.trim() !== '') {
      totalOperario = {
        operarioId: parseInt(operario.trim()),
        totalPrecioMantenimiento: parseFloat(totalPrecioMantenimiento.toFixed(2)),
        cantidadTrabajos: totalRegistros
      };
    }

    const reporte = {
      filtros: {
        operario: operario || null,
        fechaInicio: fechaInicio || null,
        estado: estado || null,
        categoria: categoria || null,
        marca: marca || null,
        placa: placa || null
      },
      totalRegistros,
      totalPrecioMantenimiento: parseFloat(totalPrecioMantenimiento.toFixed(2)),
      acumuladoOperario: totalOperario,
      registros: talleres.map(taller => ({
        id: taller.id,
        cliente: taller.cliente ? {
          id: taller.cliente.id,
          nombre: taller.cliente.nombre,
          telefono: taller.cliente.telefono
        } : null,
        operario: taller.operario, // Campo de texto legacy
        operarioAsignado: taller.operarioAsignado ? {
          id: taller.operarioAsignado.id,
          nombres: taller.operarioAsignado.nombres,
          apellidos: taller.operarioAsignado.apellidos,
          nombreCompleto: `${taller.operarioAsignado.nombres} ${taller.operarioAsignado.apellidos}`,
          puesto: taller.operarioAsignado.puesto,
          especialidad: taller.operarioAsignado.especialidad
        } : null,
        fechaRegistro: taller.createdAt,
        estado: taller.estado,
        categoria: taller.categoria,
        marca: taller.marca,
        modelo: taller.modelo,
        placa: taller.placa,
        precioMantenimiento: parseFloat(taller.precioMantenimiento) || 0,
        responsable: taller.usuario ? {
          id: taller.usuario.id,
          nombre: taller.usuario.nombre,
          apellido: taller.usuario.apellido
        } : null
      }))
    };

    res.json(reporte);
  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({
      mensaje: 'Error al generar el reporte de atención en el taller',
      error: error.message,
      stack: error.stack
    });
  }
};



 


// Método para obtener las ventas asociadas a un taller
exports.obtenerVentasPorTaller = async (req, res) => {
  const { id } = req.params;
  try {
    const taller = await Taller.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuario' },
        {
          model: Operario,
          as: 'operarioAsignado',
          attributes: ['id', 'nombres', 'apellidos', 'puesto', 'especialidad'],
          required: false
        },
        {
          model: Venta,
          as: 'ventas',
          include: [
            { model: Cliente, attributes: ['id', 'nombre', 'numeroDocumento'] },
            { model: Sucursal, attributes: ['id', 'nombre'] },
            { model: Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'apellido'] }
          ]
        }
      ]
    });

    if (!taller) {
      return res.status(404).json({ mensaje: 'Taller no encontrado' });
    }

    res.json({
      mensaje: 'Ventas asociadas al taller obtenidas exitosamente',
      taller,
      ventas: taller.ventas
    });
  } catch (error) {
    console.error('Error al obtener las ventas asociadas al taller:', error);
    res.status(500).json({ mensaje: 'Error al obtener las ventas asociadas al taller', error: error.message });
  }
};

// Método para asociar una venta a un taller
exports.asociarVentaATaller = async (req, res) => {
  const { tallerId, ventaId } = req.params;
  try {
    // Verificar si el taller existe
    const taller = await Taller.findByPk(tallerId);
    if (!taller) {
      return res.status(404).json({ mensaje: 'Taller no encontrado' });
    }

    // Verificar si la venta existe
    const venta = await Venta.findByPk(ventaId);
    if (!venta) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    // Verificar si la venta ya está asociada a otro taller
    if (venta.tallerId && venta.tallerId !== parseInt(tallerId)) {
      return res.status(400).json({ mensaje: 'La venta ya está asociada a otro taller' });
    }

    // Asociar la venta al taller
    await venta.update({ tallerId });

    // Obtener el taller actualizado con la información de la venta
    const tallerActualizado = await Taller.findByPk(tallerId, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuario' },
        {
          model: Operario,
          as: 'operarioAsignado',
          attributes: ['id', 'nombres', 'apellidos', 'puesto', 'especialidad'],
          required: false
        },
        {
          model: Venta,
          as: 'ventas',
          include: [
            { model: Cliente, attributes: ['id', 'nombre', 'numeroDocumento'] },
            { model: Sucursal, attributes: ['id', 'nombre'] },
            { model: Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'apellido'] }
          ]
        }
      ]
    });

    res.json({
      mensaje: 'Venta asociada al taller exitosamente',
      taller: tallerActualizado
    });
  } catch (error) {
    console.error('Error al asociar la venta al taller:', error);
    res.status(500).json({ mensaje: 'Error al asociar la venta al taller', error: error.message });
  }
};

// Método para desasociar una venta de un taller
exports.desasociarVentaDeTaller = async (req, res) => {
  const { tallerId, ventaId } = req.params;
  try {
    // Verificar si el taller existe
    const taller = await Taller.findByPk(tallerId);
    if (!taller) {
      return res.status(404).json({ mensaje: 'Taller no encontrado' });
    }

    // Verificar si la venta existe
    const venta = await Venta.findByPk(ventaId);
    if (!venta) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    // Verificar si la venta está asociada al taller
    if (venta.tallerId !== parseInt(tallerId)) {
      return res.status(400).json({ mensaje: 'La venta no está asociada al taller' });
    }

    // Desasociar la venta del taller
    await venta.update({ tallerId: null });

    // Obtener el taller actualizado sin la información de la venta
    const tallerActualizado = await Taller.findByPk(tallerId, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuario' },
        {
          model: Operario,
          as: 'operarioAsignado',
          attributes: ['id', 'nombres', 'apellidos', 'puesto', 'especialidad'],
          required: false
        }
      ]
    });

    res.json({
      mensaje: 'Venta desasociada del taller exitosamente',
      taller: tallerActualizado
    });
  } catch (error) {
    console.error('Error al desasociar la venta del taller:', error);
    res.status(500).json({ mensaje: 'Error al desasociar la venta del taller', error: error.message });
  }
};