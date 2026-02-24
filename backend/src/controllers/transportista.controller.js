const { Transportista } = require("../models");
const { Op } = require("sequelize");
const RENIECService = require("../services/reniecService");

// Obtener todos los transportistas
exports.obtenerTransportistas = async (req, res) => {
  try {
    const { tipoTransportista } = req.query;
    
    let whereCondition = { estado: true };
    
    // Filtrar por tipo de transportista si se especifica
    if (tipoTransportista) {
      whereCondition.tipoTransportista = tipoTransportista;
    }

    const transportistas = await Transportista.findAll({
      where: whereCondition,
      order: [["razonSocial", "ASC"]],
    });

    res.json({
      mensaje: "Transportistas obtenidos exitosamente",
      transportistas,
      filtros: {
        tipoTransportista: tipoTransportista || 'todos'
      }
    });
  } catch (error) {
    console.error("Error al obtener transportistas:", error);
    res.status(500).json({
      mensaje: "Error al obtener los transportistas",
      error: error.message,
    });
  }
};

// Buscar transportistas por razón social, documento
exports.buscarTransportistas = async (req, res) => {
  const { razonSocial, tipoDocumento, numeroDocumento } = req.query;
  
  if (!razonSocial && !tipoDocumento && !numeroDocumento) {
    return res
      .status(400)
      .json({ mensaje: "Debe proporcionar al menos un término de búsqueda" });
  }
  
  try {
    const whereClause = { estado: true };
    
    if (razonSocial) {
      whereClause[Op.or] = [
        { razonSocial: { [Op.like]: `%${razonSocial}%` } },
        { nombreComercial: { [Op.like]: `%${razonSocial}%` } }
      ];
    }
    if (tipoDocumento) {
      whereClause.tipoDocumento = tipoDocumento;
    }
    if (numeroDocumento) {
      whereClause.numeroDocumento = { [Op.like]: `%${numeroDocumento}%` };
    }
    
    const transportistas = await Transportista.findAll({
      where: whereClause,
      order: [["razonSocial", "ASC"]],
    });
    
    res.json({ 
      mensaje: "Búsqueda completada exitosamente",
      transportistas 
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al buscar transportistas", error: error.message });
  }
};

// Obtener un transportista por ID
exports.obtenerTransportistaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const transportista = await Transportista.findOne({
      where: { id, estado: true },
    });

    if (!transportista) {
      return res.status(404).json({ mensaje: "Transportista no encontrado" });
    }

    res.json({ 
      mensaje: "Transportista obtenido exitosamente",
      transportista 
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener el transportista", error: error.message });
  }
};

// Crear un nuevo transportista
exports.crearTransportista = async (req, res) => {
  try {
    const {
      tipoDocumento,
      numeroDocumento,
      razonSocial,
      nombreComercial,
      direccionFiscal,
      telefono,
      email,
      mtc,
      autorizacionMTC,
      tipoTransportista
    } = req.body;

    // Validaciones básicas
    if (!tipoDocumento || !numeroDocumento || !razonSocial) {
      return res.status(400).json({
        mensaje: "Los campos tipo de documento, número de documento y razón social son obligatorios",
      });
    }

    // Verificar si ya existe un transportista con ese documento
    const transportistaExistente = await Transportista.findOne({
      where: { 
        tipoDocumento,
        numeroDocumento: numeroDocumento.trim()
      },
    });

    if (transportistaExistente) {
      return res.status(400).json({
        mensaje: "Ya existe un transportista con este tipo y número de documento",
      });
    }

    // Crear el transportista
    const nuevoTransportista = await Transportista.create({
      tipoDocumento,
      numeroDocumento,
      razonSocial,
      nombreComercial,
      direccionFiscal,
      telefono,
      email,
      mtc,
      autorizacionMTC,
      tipoTransportista: tipoTransportista || 'Empresa de transporte',
      estado: true,
    });

    res.status(201).json({
      mensaje: "Transportista creado exitosamente",
      transportista: nuevoTransportista,
    });
  } catch (error) {
    console.error("Error al crear transportista:", error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        mensaje: "Error de validación",
        errores: error.errors.map(err => ({
          campo: err.path,
          mensaje: err.message
        }))
      });
    }

    res.status(500).json({
      mensaje: "Error al crear el transportista",
      error: error.message,
    });
  }
};

// Actualizar un transportista
exports.actualizarTransportista = async (req, res) => {
  const { id } = req.params;
  
  try {
    const transportista = await Transportista.findOne({
      where: { id, estado: true },
    });

    if (!transportista) {
      return res.status(404).json({ mensaje: "Transportista no encontrado" });
    }

    const {
      tipoDocumento,
      numeroDocumento,
      razonSocial,
      nombreComercial,
      direccionFiscal,
      telefono,
      email,
      mtc,
      autorizacionMTC,
      tipoTransportista
    } = req.body;

    // Si se está actualizando el documento, verificar que no exista otro
    if ((tipoDocumento && tipoDocumento !== transportista.tipoDocumento) || 
        (numeroDocumento && numeroDocumento.trim() !== transportista.numeroDocumento)) {
      const transportistaConDocumento = await Transportista.findOne({
        where: { 
          tipoDocumento: tipoDocumento || transportista.tipoDocumento,
          numeroDocumento: (numeroDocumento || transportista.numeroDocumento).trim(),
          id: { [Op.ne]: id }
        },
      });

      if (transportistaConDocumento) {
        return res.status(400).json({
          mensaje: "Ya existe otro transportista con este tipo y número de documento",
        });
      }
    }

    // Actualizar el transportista
    await transportista.update({
      tipoDocumento: tipoDocumento || transportista.tipoDocumento,
      numeroDocumento: numeroDocumento || transportista.numeroDocumento,
      razonSocial: razonSocial || transportista.razonSocial,
      nombreComercial: nombreComercial !== undefined ? nombreComercial : transportista.nombreComercial,
      direccionFiscal: direccionFiscal !== undefined ? direccionFiscal : transportista.direccionFiscal,
      telefono: telefono !== undefined ? telefono : transportista.telefono,
      email: email !== undefined ? email : transportista.email,
      mtc: mtc !== undefined ? mtc : transportista.mtc,
      autorizacionMTC: autorizacionMTC !== undefined ? autorizacionMTC : transportista.autorizacionMTC,
      tipoTransportista: tipoTransportista || transportista.tipoTransportista,
    });

    res.json({
      mensaje: "Transportista actualizado exitosamente",
      transportista,
    });
  } catch (error) {
    console.error("Error al actualizar transportista:", error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        mensaje: "Error de validación",
        errores: error.errors.map(err => ({
          campo: err.path,
          mensaje: err.message
        }))
      });
    }

    res.status(500).json({
      mensaje: "Error al actualizar el transportista",
      error: error.message,
    });
  }
};

// Buscar transportista por documento
exports.buscarPorDocumento = async (req, res) => {
  const { tipoDocumento, numeroDocumento } = req.params;

  if (!tipoDocumento || !numeroDocumento) {
    return res.status(400).json({ 
      mensaje: "Debe proporcionar tipo y número de documento" 
    });
  }

  try {
    const transportista = await Transportista.findOne({
      where: { 
        tipoDocumento,
        numeroDocumento: numeroDocumento.trim(),
        estado: true 
      },
    });

    if (!transportista) {
      return res.status(404).json({ mensaje: "Transportista no encontrado" });
    }

    res.json({ 
      mensaje: "Transportista encontrado",
      transportista 
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al buscar el transportista",
      error: error.message,
    });
  }
};

// Obtener transportistas por tipo
exports.obtenerPorTipo = async (req, res) => {
  const { tipo } = req.params;

  try {
    const transportistas = await Transportista.findAll({
      where: { 
        tipoTransportista: tipo,
        estado: true 
      },
      order: [["razonSocial", "ASC"]],
    });

    res.json({
      mensaje: `Transportistas de tipo ${tipo} obtenidos exitosamente`,
      transportistas,
      tipo
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener transportistas por tipo",
      error: error.message,
    });
  }
};


// Eliminar un transportista
exports.eliminarTransportista = async (req, res) => {
  const { id } = req.params;

  try {
    const transportista = await Transportista.findOne({
      where: { id },
    });

    if (!transportista) {
      return res.status(404).json({ mensaje: "Transportista no encontrado" });
    }

    await transportista.destroy();

    res.json({
      mensaje: "Transportista eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar el transportista",
      error: error.message,
    });
  }
};

// Consultar datos de RENIEC por DNI o RUC
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
        nombreCompleto: datosRENIEC.nombre,
      });
    } else {
      return res.status(400).json({
        mensaje: "Tipo de documento no válido. Debe ser DNI o RUC",
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