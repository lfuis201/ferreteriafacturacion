const { Proveedor } = require('../models');
const { Op } = require('sequelize');
const RENIECService = require('../services/reniecService');

// Obtener todos los proveedores
exports.obtenerProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({
      where: { estado: true }
    });

    res.json({ proveedores });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener proveedores', error: error.message });
  }
};

// Buscar proveedores por nombre o número de documento
exports.buscarProveedores = async (req, res) => {
  const { nombre, numeroDocumento } = req.query;
  if (!nombre && !numeroDocumento) {
    return res.status(400).json({ mensaje: 'Debe proporcionar al menos un término de búsqueda' });
  }
  try {
    const whereClause = { estado: true };
    if (nombre) {
      whereClause.nombre = { [Op.like]: `%${nombre}%` };
    }
    if (numeroDocumento) {
      whereClause.numeroDocumento = { [Op.like]: `%${numeroDocumento}%` };
    }
    const proveedores = await Proveedor.findAll({
      where: whereClause
    });
    res.json({ proveedores });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar proveedores', error: error.message });
  }
};

// Obtener un proveedor por ID
exports.obtenerProveedorPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const proveedor = await Proveedor.findOne({
      where: { id, estado: true }
    });

    if (!proveedor) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }

    res.json({ proveedor });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el proveedor', error: error.message });
  }
};

// Crear un nuevo proveedor
exports.crearProveedor = async (req, res) => {
  const { nombre, tipoDocumento, numeroDocumento, direccion, telefono, email, contacto } = req.body;

  try {
    // Verificar permisos (solo SuperAdmin y Admin pueden crear proveedores)
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin') {
      return res.status(403).json({ mensaje: 'No tiene permisos para crear proveedores' });
    }

    // Validar campos requeridos
    if (!nombre || !tipoDocumento || !numeroDocumento) {
      return res.status(400).json({ mensaje: 'Los campos nombre, tipoDocumento y numeroDocumento son requeridos' });
    }

    // Verificar si ya existe un proveedor con el mismo número de documento
    const proveedorExistente = await Proveedor.findOne({ where: { numeroDocumento } });
    if (proveedorExistente) {
      return res.status(400).json({ mensaje: 'Ya existe un proveedor con ese número de documento' });
    }

    // Crear el proveedor
    const nuevoProveedor = await Proveedor.create({
      nombre,
      tipoDocumento,
      numeroDocumento,
      direccion,
      telefono,
      email,
      contacto
    });

    res.status(201).json({
      mensaje: 'Proveedor creado exitosamente',
      proveedor: nuevoProveedor
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el proveedor', error: error.message });
  }
};

// Actualizar un proveedor
exports.actualizarProveedor = async (req, res) => {
  const { id } = req.params;
  const { nombre, tipoDocumento, numeroDocumento, direccion, telefono, email, contacto, estado } = req.body;

  try {
    // Verificar permisos (solo SuperAdmin y Admin pueden actualizar proveedores)
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin') {
      return res.status(403).json({ mensaje: 'No tiene permisos para actualizar proveedores' });
    }

    // Verificar si el proveedor existe
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }

    // Verificar si ya existe otro proveedor con el mismo número de documento
    if (numeroDocumento && numeroDocumento !== proveedor.numeroDocumento) {
      const proveedorExistente = await Proveedor.findOne({ 
        where: { 
          numeroDocumento,
          id: { [Op.ne]: id }
        } 
      });
      
      if (proveedorExistente) {
        return res.status(400).json({ mensaje: 'Ya existe otro proveedor con ese número de documento' });
      }
    }

    // Actualizar el proveedor
    await proveedor.update({
      nombre: nombre || proveedor.nombre,
      tipoDocumento: tipoDocumento || proveedor.tipoDocumento,
      numeroDocumento: numeroDocumento || proveedor.numeroDocumento,
      direccion: direccion !== undefined ? direccion : proveedor.direccion,
      telefono: telefono !== undefined ? telefono : proveedor.telefono,
      email: email !== undefined ? email : proveedor.email,
      contacto: contacto !== undefined ? contacto : proveedor.contacto, 
      estado: estado !== undefined ? estado : proveedor.estado
    });

    res.json({
      mensaje: 'Proveedor actualizado exitosamente',
      proveedor
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el proveedor', error: error.message });
  }
};

// Eliminar un proveedor
exports.eliminarProveedor = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar permisos (solo SuperAdmin y Admin pueden eliminar proveedores)
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin') {
      return res.status(403).json({ mensaje: 'No tiene permisos para eliminar proveedores' });
    }

    // Verificar si el proveedor existe
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }

    // Eliminar el proveedor
    await proveedor.destroy();

    res.json({ mensaje: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el proveedor', error: error.message });
  }
};

// Consultar datos de RENIEC/SUNAT para proveedores
exports.consultarRENIEC = async (req, res) => {
  const { numeroDocumento, tipoDocumento } = req.params;

  if (!numeroDocumento) {
    return res.status(400).json({
      mensaje: "Debe proporcionar un número de documento",
    });
  }

  if (!tipoDocumento) {
    return res.status(400).json({
      mensaje: "Debe proporcionar un tipo de documento (DNI o RUC)",
    });
  }

  try {
    let datosRENIEC;

    if (tipoDocumento === "DNI") {
      // Validar formato del DNI
      if (!RENIECService.validarDNI(numeroDocumento)) {
        return res.status(400).json({
          mensaje: "El DNI debe tener 8 dígitos numéricos",
        });
      }

      datosRENIEC = await RENIECService.consultarPorDNI(numeroDocumento);

      res.json({
        mensaje: "Consulta exitosa",
        tipoDocumento: "DNI",
        datos: datosRENIEC,
        nombreCompleto: [
          datosRENIEC.nombres,
          datosRENIEC.apellidoPaterno,
          datosRENIEC.apellidoMaterno,
        ]
          .filter(Boolean)
          .join(" "),
      });
    } else if (tipoDocumento === "RUC") {
      // Validar formato del RUC
      if (!RENIECService.validarRUC(numeroDocumento)) {
        return res.status(400).json({
          mensaje: "El RUC debe tener 11 dígitos numéricos",
        });
      }

      datosRENIEC = await RENIECService.consultarPorRUC(numeroDocumento);

      res.json({
        mensaje: "Consulta exitosa",
        tipoDocumento: "RUC",
        datos: datosRENIEC,
        nombreCompleto: datosRENIEC.razonSocial || datosRENIEC.nombre || "",
      });
    } else {
      return res.status(400).json({
        mensaje: "Tipo de documento no válido. Use DNI o RUC",
      });
    }
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar RENIEC/SUNAT",
      error: error.message,
      sugerencia: "Verifique que el documento sea válido o intente más tarde",
    });
  }
};