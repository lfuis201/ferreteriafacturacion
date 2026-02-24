const { Remitente } = require("../models");
const { Op } = require("sequelize");
const RENIECService = require("../services/reniecService");

// Obtener todos los remitentes
exports.obtenerRemitentes = async (req, res) => {
  try {
    const remitentes = await Remitente.findAll({
      where: { estado: true },
      attributes: { exclude: ['sucursalId'] },
      order: [["nombre", "ASC"]],
    });

    res.json({
      mensaje: "Remitentes obtenidos exitosamente",
      remitentes,
    });
  } catch (error) {
    console.error("Error al obtener remitentes:", error);
    res.status(500).json({
      mensaje: "Error al obtener los remitentes",
      error: error.message,
    });
  }
};

// Buscar remitentes por nombre, documento
exports.buscarRemitentes = async (req, res) => {
  const { nombre, tipoDocumento, numeroDocumento } = req.query;
  if (!nombre && !tipoDocumento && !numeroDocumento) {
    return res
      .status(400)
      .json({ mensaje: "Debe proporcionar al menos un término de búsqueda" });
  }
  try {
    const whereClause = { estado: true };
    if (nombre) {
      whereClause.nombre = { [Op.like]: `%${nombre}%` };
    }
    if (tipoDocumento) {
      whereClause.tipoDocumento = tipoDocumento;
    }
    if (numeroDocumento) {
      whereClause.numeroDocumento = { [Op.like]: `%${numeroDocumento}%` };
    }
    const remitentes = await Remitente.findAll({
      where: whereClause,
      attributes: { exclude: ['sucursalId'] },
    });
    res.json({ remitentes });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al buscar remitentes", error: error.message });
  }
};

// Obtener un remitente por ID
exports.obtenerRemitentePorId = async (req, res) => {
  const { id } = req.params;
  try {
    const remitente = await Remitente.findByPk(id, {
      attributes: { exclude: ['sucursalId'] }
    });
    if (!remitente) {
      return res.status(404).json({ mensaje: "Remitente no encontrado" });
    }
    res.json({ remitente });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener el remitente", error: error.message });
  }
};

// Consultar RENIEC/SUNAT
exports.consultarRENIEC = async (req, res) => {
  const { tipoDocumento, numeroDocumento } = req.params;

  try {
    // Validar tipo de documento
    if (!["DNI", "RUC"].includes(tipoDocumento)) {
      return res.status(400).json({
        mensaje: "Solo se puede consultar DNI o RUC",
      });
    }

    // Validar número de documento
    if (tipoDocumento === "DNI" && numeroDocumento.length !== 8) {
      return res.status(400).json({
        mensaje: "El DNI debe tener 8 dígitos",
      });
    }

    if (tipoDocumento === "RUC" && numeroDocumento.length !== 11) {
      return res.status(400).json({
        mensaje: "El RUC debe tener 11 dígitos",
      });
    }

    let datos;
    let nombreCompleto;

    if (tipoDocumento === "DNI") {
      datos = await RENIECService.consultarDNI(numeroDocumento);
      if (datos && datos.nombres) {
        nombreCompleto = `${datos.apellidoPaterno} ${datos.apellidoMaterno} ${datos.nombres}`.trim();
      }
    } else if (tipoDocumento === "RUC") {
      datos = await RENIECService.consultarRUC(numeroDocumento);
      if (datos && datos.razonSocial) {
        nombreCompleto = datos.razonSocial;
      }
    }

    if (!datos) {
      return res.status(404).json({
        mensaje: `No se encontraron datos para el ${tipoDocumento} ${numeroDocumento}`,
      });
    }

    res.json({
      mensaje: `Datos obtenidos de ${tipoDocumento === "DNI" ? "RENIEC" : "SUNAT"}`,
      tipoDocumento,
      datos,
      nombreCompleto,
    });
  } catch (error) {
    console.error(`Error al consultar ${tipoDocumento}:`, error);
    res.status(500).json({
      mensaje: `Error al consultar ${tipoDocumento === "DNI" ? "RENIEC" : "SUNAT"}`,
      error: error.message,
    });
  }
};

// Crear un nuevo remitente
exports.crearRemitente = async (req, res) => {
  try {
    const {
      tipoDocumento,
      numeroDocumento,
      nombre,
      telefono,
      direccion,
      departamento,
      provincia,
      distrito,
      ubigeo,
      consultarRENIEC = true,
    } = req.body;

    // Validaciones básicas
    if (!tipoDocumento || !numeroDocumento) {
      return res.status(400).json({
        mensaje: "Tipo de documento y número de documento son requeridos",
      });
    }

    // Verificar si ya existe un remitente con el mismo documento
    const remitenteExistente = await Remitente.findOne({
      where: {
        tipoDocumento,
        numeroDocumento,
        estado: true
      },
    });

    if (remitenteExistente) {
      return res.status(400).json({
        mensaje: "Ya existe un remitente con este documento",
        remitente: remitenteExistente,
      });
    }

    // Preparar datos del remitente
    let datosRemitente = {
      tipoDocumento,
      numeroDocumento,
      nombre: nombre || "",
      telefono,
      direccion,
      departamento,
      provincia,
      distrito,
      ubigeo,
    };

    let consultaRENIECRealizada = false;
    let consultaRENIECExitosa = false;
    let datosRENIEC = null;

    // Consultar RENIEC/SUNAT si está habilitado y es DNI o RUC
    if (consultarRENIEC && ["DNI", "RUC"].includes(tipoDocumento)) {
      try {
        consultaRENIECRealizada = true;

        if (tipoDocumento === "DNI" && numeroDocumento.length === 8) {
          datosRENIEC = await RENIECService.consultarDNI(numeroDocumento);
          if (datosRENIEC && datosRENIEC.nombres) {
            consultaRENIECExitosa = true;
            // Solo sobrescribir si no se proporcionó nombre
            if (!nombre || nombre.trim() === "") {
              datosRemitente.nombre = `${datosRENIEC.apellidoPaterno} ${datosRENIEC.apellidoMaterno} ${datosRENIEC.nombres}`.trim();
            }
            datosRemitente.apellidoPaterno = datosRENIEC.apellidoPaterno;
            datosRemitente.apellidoMaterno = datosRENIEC.apellidoMaterno;
            datosRemitente.nombres = datosRENIEC.nombres;
            
            // Solo sobrescribir dirección si no se proporcionó
            if (!direccion && datosRENIEC.direccion) {
              datosRemitente.direccion = datosRENIEC.direccion;
            }
          }
        } else if (tipoDocumento === "RUC" && numeroDocumento.length === 11) {
          datosRENIEC = await RENIECService.consultarRUC(numeroDocumento);
          if (datosRENIEC && datosRENIEC.razonSocial) {
            consultaRENIECExitosa = true;
            // Solo sobrescribir si no se proporcionó nombre
            if (!nombre || nombre.trim() === "") {
              datosRemitente.nombre = datosRENIEC.razonSocial;
            }
            datosRemitente.razonSocial = datosRENIEC.razonSocial;
            datosRemitente.nombreComercial = datosRENIEC.nombreComercial;
            
            // Solo sobrescribir dirección si no se proporcionó
            if (!direccion && datosRENIEC.direccion) {
              datosRemitente.direccion = datosRENIEC.direccion;
            }
            
            // Datos de ubigeo de SUNAT
            if (datosRENIEC.departamento) datosRemitente.departamento = datosRENIEC.departamento;
            if (datosRENIEC.provincia) datosRemitente.provincia = datosRENIEC.provincia;
            if (datosRENIEC.distrito) datosRemitente.distrito = datosRENIEC.distrito;
            if (datosRENIEC.ubigeo) datosRemitente.ubigeo = datosRENIEC.ubigeo;
          }
        }
      } catch (error) {
        console.error("Error al consultar RENIEC/SUNAT:", error);
        // No fallar la creación si la consulta falla
      }
    }

    // Validar que se tenga al menos un nombre
    if (!datosRemitente.nombre || datosRemitente.nombre.trim() === "") {
      return res.status(400).json({
        mensaje: "El nombre es requerido",
      });
    }

    // Crear el remitente
    const nuevoRemitente = await Remitente.create(datosRemitente);

    res.status(201).json({
      mensaje: "Remitente creado exitosamente",
      remitente: nuevoRemitente,
      consultaRENIECRealizada,
      consultaRENIECExitosa,
      datosRENIEC,
    });
  } catch (error) {
    console.error("Error al crear remitente:", error);
    res.status(500).json({
      mensaje: "Error al crear el remitente",
      error: error.message,
    });
  }
};

// Actualizar un remitente
exports.actualizarRemitente = async (req, res) => {
  const { id } = req.params;
  try {
    const remitente = await Remitente.findByPk(id);
    if (!remitente) {
      return res.status(404).json({ mensaje: "Remitente no encontrado" });
    }

    const {
      nombre,
      tipoDocumento,
      numeroDocumento,
      telefono,
      direccion,
      departamento,
      provincia,
      distrito,
      ubigeo,
    } = req.body;

    // Verificar si se está cambiando el documento y si ya existe otro remitente con ese documento
    if (
      (tipoDocumento && tipoDocumento !== remitente.tipoDocumento) ||
      (numeroDocumento && numeroDocumento !== remitente.numeroDocumento)
    ) {
      const remitenteExistente = await Remitente.findOne({
        where: {
          tipoDocumento: tipoDocumento || remitente.tipoDocumento,
          numeroDocumento: numeroDocumento || remitente.numeroDocumento,
          id: { [Op.ne]: id },
        },
      });

      if (remitenteExistente) {
        return res.status(400).json({
          mensaje: "Ya existe otro remitente con este documento",
        });
      }
    }

    await remitente.update({
      nombre: nombre || remitente.nombre,
      tipoDocumento: tipoDocumento || remitente.tipoDocumento,
      numeroDocumento: numeroDocumento || remitente.numeroDocumento,
      telefono: telefono !== undefined ? telefono : remitente.telefono,
      direccion: direccion !== undefined ? direccion : remitente.direccion,
      departamento: departamento !== undefined ? departamento : remitente.departamento,
      provincia: provincia !== undefined ? provincia : remitente.provincia,
      distrito: distrito !== undefined ? distrito : remitente.distrito,
      ubigeo: ubigeo !== undefined ? ubigeo : remitente.ubigeo,
    });

    res.json({
      mensaje: "Remitente actualizado exitosamente",
      remitente,
    });
  } catch (error) {
    console.error("Error al actualizar remitente:", error);
    res.status(500).json({
      mensaje: "Error al actualizar el remitente",
      error: error.message,
    });
  }
};

// Eliminar un remitente (soft delete)
exports.eliminarRemitente = async (req, res) => {
  const { id } = req.params;
  try {
    const remitente = await Remitente.findByPk(id);
    if (!remitente) {
      return res.status(404).json({ mensaje: "Remitente no encontrado" });
    }

    await remitente.update({ estado: false });

    res.json({
      mensaje: "Remitente eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar remitente:", error);
    res.status(500).json({
      mensaje: "Error al eliminar el remitente",
      error: error.message,
    });
  }
};