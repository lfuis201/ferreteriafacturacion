const { Sucursal, Usuario } = require('../models');

// Obtener todas las sucursales
exports.obtenerSucursales = async (req, res) => {
  try {
    const sucursales = await Sucursal.findAll({
      where: { estado: true },
      include: [{
        model: Usuario,
        attributes: ['id', 'nombre', 'apellido', 'rol'],
        where: { rol: 'Admin', estado: true },
        required: false
      }]
    });

    res.json({ sucursales });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener sucursales', error: error.message });
  }
};

// Obtener una sucursal por ID
exports.obtenerSucursalPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const sucursal = await Sucursal.findOne({
      where: { id, estado: true },
      include: [{
        model: Usuario,
        attributes: ['id', 'nombre', 'apellido', 'rol'],
        where: { estado: true },
        required: false
      }]
    });

    if (!sucursal) {
      return res.status(404).json({ mensaje: 'Sucursal no encontrada' });
    }

    res.json({ sucursal });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la sucursal', error: error.message });
  }
};

// Crear una nueva sucursal
exports.crearSucursal = async (req, res) => {
  const {
    nombre,
    ubicacion,
    telefono,
    email,
    ruc,
    razonSocial,
    nombreComercial,
    direccion,
    ubigeo,
    urbanizacion,
    distrito,
    provincia,
    departamento
  } = req.body;

  try {
    // Verificar si ya existe una sucursal con el mismo nombre
    const sucursalExistente = await Sucursal.findOne({ where: { nombre } });
    if (sucursalExistente) {
      return res.status(400).json({ mensaje: 'Ya existe una sucursal con ese nombre' });
    }

    // Permitir RUCs duplicados - comentado para permitir múltiples sucursales con el mismo RUC
    // const sucursalConRUC = await Sucursal.findOne({ where: { ruc } });
    // if (sucursalConRUC) {
    //   return res.status(400).json({ mensaje: 'Ya existe una sucursal con ese RUC' });
    // }

    // Validar campos requeridos para SUNAT
    const camposRequeridos = [
      { nombre: 'ruc', valor: ruc },
      { nombre: 'razonSocial', valor: razonSocial },
      { nombre: 'nombreComercial', valor: nombreComercial },
      { nombre: 'direccion', valor: direccion },
      { nombre: 'ubigeo', valor: ubigeo },
      { nombre: 'urbanizacion', valor: urbanizacion },
      { nombre: 'distrito', valor: distrito },
      { nombre: 'provincia', valor: provincia },
      { nombre: 'departamento', valor: departamento }
    ];

    const camposFaltantes = camposRequeridos.filter(campo => !campo.valor);

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        mensaje: 'Faltan campos requeridos para la integración con SUNAT',
        camposFaltantes: camposFaltantes.map(campo => campo.nombre)
      });
    }

    // Validar formato del RUC (11 dígitos)
    if (!/^[0-9]{11}$/.test(ruc)) {
      return res.status(400).json({
        mensaje: 'El RUC debe tener 11 dígitos numéricos'
      });
    }

    // Validar formato del UBIGEO (6 dígitos)
    if (!/^[0-9]{6}$/.test(ubigeo)) {
      return res.status(400).json({
        mensaje: 'El código UBIGEO debe tener 6 dígitos numéricos'
      });
    }

    // Crear la sucursal
    const nuevaSucursal = await Sucursal.create({
      nombre,
      ubicacion,
      telefono,
      email,
      ruc,
      razonSocial,
      nombreComercial,
      direccion,
      ubigeo,
      urbanizacion,
      distrito,
      provincia,
      departamento
    });

    res.status(201).json({
      mensaje: 'Sucursal creada exitosamente',
      sucursal: nuevaSucursal
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al crear la sucursal',
      error: error.message
    });
  }
};


// Actualizar una sucursal
exports.actualizarSucursal = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    ubicacion,
    telefono,
    email,
    ruc,
    razonSocial,
    nombreComercial,
    direccion,
    ubigeo,
    urbanizacion,
    distrito,
    provincia,
    departamento
  } = req.body;

  try {
    // Verificar si la sucursal existe
    const sucursal = await Sucursal.findByPk(id);
    if (!sucursal) {
      return res.status(404).json({ mensaje: 'Sucursal no encontrada' });
    }

    // Verificar si ya existe otra sucursal con el mismo nombre
    if (nombre && nombre !== sucursal.nombre) {
      const sucursalExistente = await Sucursal.findOne({ where: { nombre } });
      if (sucursalExistente) {
        return res.status(400).json({ mensaje: 'Ya existe otra sucursal con ese nombre' });
      }
    }

    // Permitir RUCs duplicados - comentado para permitir múltiples sucursales con el mismo RUC
    // if (ruc && ruc !== sucursal.ruc) {
    //   const sucursalConRUC = await Sucursal.findOne({ where: { ruc } });
    //   if (sucursalConRUC) {
    //     return res.status(400).json({ mensaje: 'Ya existe otra sucursal con ese RUC' });
    //   }
    // }

    // Validar formato del RUC (11 dígitos) si se proporciona
    if (ruc && !/^[0-9]{11}$/.test(ruc)) {
      return res.status(400).json({
        mensaje: 'El RUC debe tener 11 dígitos numéricos'
      });
    }

    // Validar formato del UBIGEO (6 dígitos) si se proporciona
    if (ubigeo && !/^[0-9]{6}$/.test(ubigeo)) {
      return res.status(400).json({
        mensaje: 'El código UBIGEO debe tener 6 dígitos numéricos'
      });
    }

    // Validar campos requeridos para SUNAT si se proporcionan
    if (ruc || razonSocial || nombreComercial || direccion || ubigeo ||
        urbanizacion || distrito || provincia || departamento) {
      const camposRequeridos = [
        { nombre: 'ruc', valor: ruc },
        { nombre: 'razonSocial', valor: razonSocial },
        { nombre: 'nombreComercial', valor: nombreComercial },
        { nombre: 'direccion', valor: direccion },
        { nombre: 'ubigeo', valor: ubigeo },
        { nombre: 'urbanizacion', valor: urbanizacion },
        { nombre: 'distrito', valor: distrito },
        { nombre: 'provincia', valor: provincia },
        { nombre: 'departamento', valor: departamento }
      ];

      const camposFaltantes = camposRequeridos.filter(campo => !campo.valor);
      if (camposFaltantes.length > 0) {
        return res.status(400).json({
          mensaje: 'Faltan campos requeridos para la integración con SUNAT',
          camposFaltantes: camposFaltantes.map(campo => campo.nombre)
        });
      }
    }

    // Actualizar la sucursal
    await sucursal.update({
      nombre: nombre || sucursal.nombre,
      ubicacion: ubicacion || sucursal.ubicacion,
      telefono: telefono || sucursal.telefono,
      email: email || sucursal.email,
      ruc: ruc || sucursal.ruc,
      razonSocial: razonSocial || sucursal.razonSocial,
      nombreComercial: nombreComercial || sucursal.nombreComercial,
      direccion: direccion || sucursal.direccion,
      ubigeo: ubigeo || sucursal.ubigeo,
      urbanizacion: urbanizacion || sucursal.urbanizacion,
      distrito: distrito || sucursal.distrito,
      provincia: provincia || sucursal.provincia,
      departamento: departamento || sucursal.departamento
    });

    res.json({
      mensaje: 'Sucursal actualizada exitosamente',
      sucursal
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la sucursal', error: error.message });
  }
};

// Eliminar una sucursal 
exports.eliminarSucursal = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si la sucursal existe
    const sucursal = await Sucursal.findByPk(id);
    if (!sucursal) {
      return res.status(404).json({ mensaje: 'Sucursal no encontrada' });
    }
    // Eliminar la sucursal
    await sucursal.destroy();
    res.json({ mensaje: 'Sucursal eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la sucursal', error: error.message });
  }
};

// Asignar administrador a una sucursal
exports.asignarAdministrador = async (req, res) => {
  const { sucursalId, usuarioId } = req.body;

  try {
    // Verificar si la sucursal existe
    const sucursal = await Sucursal.findByPk(sucursalId);
    if (!sucursal) {
      return res.status(404).json({ mensaje: 'Sucursal no encontrada' });
    }

    // Verificar si el usuario existe
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Actualizar el rol del usuario a Admin y asignar a la sucursal
    await usuario.update({
      rol: 'Admin',
      sucursalId
    });

    res.json({
      mensaje: 'Administrador asignado exitosamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol,
        sucursalId: usuario.sucursalId
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al asignar administrador', error: error.message });
  }
};