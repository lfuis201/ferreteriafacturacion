const { Conductor } = require("../models");
const { Op } = require("sequelize");
const RENIECService = require("../services/reniecService");

// Obtener todos los conductores
exports.obtenerConductores = async (req, res) => {
  try {
    const { modoTraslado } = req.query;
    
    let whereCondition = { estado: true };
    
    // Filtrar por modo de traslado si se especifica
    if (modoTraslado) {
      whereCondition.modoTraslado = modoTraslado;
    }

    const conductores = await Conductor.findAll({
      where: whereCondition,
      order: [["nombre", "ASC"]],
    });

    res.json({
      mensaje: "Conductores obtenidos exitosamente",
      conductores,
      filtros: {
        modoTraslado: modoTraslado || 'todos'
      }
    });
  } catch (error) {
    console.error("Error al obtener conductores:", error);
    res.status(500).json({
      mensaje: "Error al obtener los conductores",
      error: error.message,
    });
  }
};

// Buscar conductores por nombre, documento
exports.buscarConductores = async (req, res) => {
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
    const conductores = await Conductor.findAll({
      where: whereClause,
    });
    res.json({ conductores });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al buscar conductores", error: error.message });
  }
};

// Obtener un conductor por ID
exports.obtenerConductorPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const conductor = await Conductor.findOne({
      where: { id, estado: true },
    });

    if (!conductor) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    res.json({ conductor });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener el conductor", error: error.message });
  }
};

// Consultar RENIEC por DNI
exports.consultarRENIEC = async (req, res) => {
  const { tipoDocumento, numeroDocumento } = req.params;

  if (!numeroDocumento || !tipoDocumento) {
    return res
      .status(400)
      .json({ mensaje: "Debe proporcionar tipo y número de documento" });
  }

  // Validar formato según el tipo de documento
  if (tipoDocumento === 'DNI') {
    if (!RENIECService.validarDNI(numeroDocumento)) {
      return res.status(400).json({
        mensaje: "El DNI debe tener 8 dígitos numéricos",
      });
    }
  } else if (tipoDocumento === 'RUC') {
    // Aquí podrías agregar validación para RUC si es necesario
    if (numeroDocumento.length !== 11) {
      return res.status(400).json({
        mensaje: "El RUC debe tener 11 dígitos",
      });
    }
  } else {
    return res.status(400).json({
      mensaje: "Tipo de documento no válido. Use DNI o RUC",
    });
  }

  try {
    let datosRENIEC;
    
    if (tipoDocumento === 'DNI') {
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
    } else if (tipoDocumento === 'RUC') {
      datosRENIEC = await RENIECService.consultarPorRUC(numeroDocumento);
      
      res.json({
        mensaje: "Consulta exitosa",
        tipoDocumento: "RUC",
        datos: datosRENIEC,
        nombreCompleto: datosRENIEC.nombre || datosRENIEC.razonSocial || "",
      });
    }
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar RENIEC",
      error: error.message,
      sugerencia: "Verifique que el número de documento sea válido y que el servicio RENIEC esté disponible"
    });
  }
};

// Crear un nuevo conductor
exports.crearConductor = async (req, res) => {
  const {
    nombre,
    tipoDocumento,
    numeroDocumento,
    telefono,
    email,
    categoria,
    direccion,
    consultarRENIEC,
    modoTraslado, // Agregar modoTraslado
    licencia,
  } = req.body;

  try {
    // Validar campos requeridos
    if (!tipoDocumento || !numeroDocumento) {
      return res.status(400).json({
        mensaje: "Los campos tipoDocumento y numeroDocumento son requeridos",
      });
    }

    // Validar y asignar valor por defecto a modoTraslado
    const modoTrasladoFinal = modoTraslado || 'Transporte privado';
    if (!['Transporte privado', 'Transporte público'].includes(modoTrasladoFinal)) {
      return res.status(400).json({
        mensaje: "El campo modoTraslado debe ser 'Transporte privado' o 'Transporte público'",
      });
    }

    // Verificar si ya existe un conductor con el mismo número de documento
    const conductorExistente = await Conductor.findOne({
      where: { numeroDocumento, tipoDocumento },
    });

    if (conductorExistente) {
      return res.status(400).json({
        mensaje: "Ya existe un conductor con ese número de documento",
        conductorExistente: {
          id: conductorExistente.id,
          nombre: conductorExistente.nombre,
          tipoDocumento: conductorExistente.tipoDocumento,
          numeroDocumento: conductorExistente.numeroDocumento,
        },
      });
    }

    let datosConductor = {
      nombre: nombre || null,
      tipoDocumento,
      numeroDocumento,
      telefono: telefono || null,
      email: email || null,
      categoria: categoria || null,
      direccion: direccion || null,
      modoTraslado: modoTrasladoFinal, // Usar el valor con defecto
      licencia: licencia || null,
    };

    let datosRENIECConsultados = null;
    let consultaRENIECExitosa = false;

    // Consultar automáticamente RENIEC si es DNI o RUC
    if ((tipoDocumento === "DNI" || tipoDocumento === "RUC") && numeroDocumento) {
      try {
        if (tipoDocumento === "DNI") {
          // Validar formato del DNI
          if (!RENIECService.validarDNI(numeroDocumento)) {
            return res.status(400).json({
              mensaje: "El DNI debe tener 8 dígitos numéricos",
            });
          }

          datosRENIECConsultados = await RENIECService.consultarPorDNI(
            numeroDocumento
          );

          // Actualizar datos con información de RENIEC
          if (
            datosRENIECConsultados.nombres &&
            datosRENIECConsultados.apellidoPaterno
          ) {
            const nombreCompleto = [
              datosRENIECConsultados.nombres,
              datosRENIECConsultados.apellidoPaterno,
              datosRENIECConsultados.apellidoMaterno,
            ]
              .filter(Boolean)
              .join(" ");

            // Solo actualizar el nombre si no se proporcionó uno
            if (!nombre || nombre.trim() === "") {
              datosConductor.nombre = nombreCompleto;
            }
            consultaRENIECExitosa = true;
          }

          // Solo actualizar la dirección si no se proporcionó una
          if (datosRENIECConsultados.direccion && (!direccion || direccion.trim() === "")) {
            datosConductor.direccion = datosRENIECConsultados.direccion;
          }

        } else if (tipoDocumento === "RUC") {
          // Validar formato del RUC
          if (!RENIECService.validarRUC(numeroDocumento)) {
            return res.status(400).json({
              mensaje: "El RUC debe tener 11 dígitos numéricos",
            });
          }

          datosRENIECConsultados = await RENIECService.consultarPorRUC(
            numeroDocumento
          );

          // Actualizar datos con información de RENIEC
          if (datosRENIECConsultados.nombre) {
            // Solo actualizar el nombre si no se proporcionó uno
            if (!nombre || nombre.trim() === "") {
              datosConductor.nombre = datosRENIECConsultados.nombre;
            }
            consultaRENIECExitosa = true;
          }

          // Solo actualizar la dirección si no se proporcionó una
          if (datosRENIECConsultados.direccion && (!direccion || direccion.trim() === "")) {
            datosConductor.direccion = datosRENIECConsultados.direccion;
          }
        }
      } catch (reniecError) {
        // Si falla la consulta a RENIEC, continuar con los datos proporcionados
        console.log("Error al consultar RENIEC:", reniecError.message);
        consultaRENIECExitosa = false;
      }
    }

    console.log('Datos finales para crear conductor:', datosConductor);
    
    // Crear el conductor
    const nuevoConductor = await Conductor.create(datosConductor);
    
    console.log('Conductor creado exitosamente:', nuevoConductor.toJSON());

    res.status(201).json({
      mensaje: "Conductor creado exitosamente",
      conductor: nuevoConductor,
      consultaRENIECRealizada: (tipoDocumento === "DNI" || tipoDocumento === "RUC") && numeroDocumento,
      consultaRENIECExitosa,
      datosRENIEC: datosRENIECConsultados,
      nombreOriginal: nombre,
    });
  } catch (error) {
    console.error("Error al crear conductor:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor al crear conductor",
      error: error.message,
    });
  }
};

// Actualizar un conductor
exports.actualizarConductor = async (req, res) => {
  const { id } = req.params;
  const {
    tipoDocumento,
    numeroDocumento,
    nombre,
    modoTraslado,
    // Campos específicos para transporte público
    direccionFiscal,
    mtc,
    // Campos específicos para transporte privado
    telefono,
    licencia,
    // Campos de datos del vehículo
    nroPlaca,
    tuc,
    autorizacionMTC,
    nroPlacaSecundaria,
    tucSecundaria,
    autorizacionMTCSecundaria,
    modeloVehiculo,
    marcaVehiculo,
    configuracion,
  } = req.body;

  try {
    const conductor = await Conductor.findByPk(id);

    if (!conductor) {
      return res.status(404).json({
        mensaje: "Conductor no encontrado",
      });
    }

    // Verificar si el número de documento ya existe en otro conductor
    if (numeroDocumento && numeroDocumento !== conductor.numeroDocumento) {
      const conductorExistente = await Conductor.findOne({
        where: {
          numeroDocumento,
          tipoDocumento: tipoDocumento || conductor.tipoDocumento,
          id: { [Op.ne]: id },
        },
      });

      if (conductorExistente) {
        return res.status(400).json({
          mensaje: "Ya existe otro conductor con ese número de documento",
        });
      }
    }

    // Preparar datos para actualización
    const datosActualizacion = {};
    
    // Solo actualizar campos que se proporcionaron
    if (tipoDocumento !== undefined) datosActualizacion.tipoDocumento = tipoDocumento;
    if (numeroDocumento !== undefined) datosActualizacion.numeroDocumento = numeroDocumento;
    if (nombre !== undefined) datosActualizacion.nombre = nombre;
    if (modoTraslado !== undefined) datosActualizacion.modoTraslado = modoTraslado;
    if (direccionFiscal !== undefined) datosActualizacion.direccionFiscal = direccionFiscal;
    if (mtc !== undefined) datosActualizacion.mtc = mtc;
    if (telefono !== undefined) datosActualizacion.telefono = telefono;
    if (licencia !== undefined) datosActualizacion.licencia = licencia;
    if (nroPlaca !== undefined) datosActualizacion.nroPlaca = nroPlaca;
    if (tuc !== undefined) datosActualizacion.tuc = tuc;
    if (autorizacionMTC !== undefined) datosActualizacion.autorizacionMTC = autorizacionMTC;
    if (nroPlacaSecundaria !== undefined) datosActualizacion.nroPlacaSecundaria = nroPlacaSecundaria;
    if (tucSecundaria !== undefined) datosActualizacion.tucSecundaria = tucSecundaria;
    if (autorizacionMTCSecundaria !== undefined) datosActualizacion.autorizacionMTCSecundaria = autorizacionMTCSecundaria;
    if (modeloVehiculo !== undefined) datosActualizacion.modeloVehiculo = modeloVehiculo;
    if (marcaVehiculo !== undefined) datosActualizacion.marcaVehiculo = marcaVehiculo;
    if (configuracion !== undefined) datosActualizacion.configuracion = configuracion;

    // Actualizar el conductor
    await conductor.update(datosActualizacion);

    res.json({
      mensaje: "Conductor actualizado exitosamente",
      conductor,
    });
  } catch (error) {
    console.error("Error al actualizar conductor:", error);
    res.status(500).json({
      mensaje: "Error al actualizar el conductor",
      error: error.message,
    });
  }
};

// Buscar conductor por número de documento
exports.buscarPorDocumento = async (req, res) => {
  const { numeroDocumento } = req.params;
  const { tipoDocumento } = req.query;

  try {
    let whereCondition = {
      numeroDocumento,
      estado: true,
    };

    // Si se especifica el tipo de documento, incluirlo en la búsqueda
    if (tipoDocumento) {
      whereCondition.tipoDocumento = tipoDocumento;
    }

    const conductor = await Conductor.findOne({
      where: whereCondition,
    });

    if (!conductor) {
      return res.status(404).json({
        mensaje: "Conductor no encontrado",
      });
    }

    res.json({
      mensaje: "Conductor encontrado",
      conductor,
    });
  } catch (error) {
    console.error("Error al buscar conductor:", error);
    res.status(500).json({
      mensaje: "Error al buscar el conductor",
      error: error.message,
    });
  }
};

// Buscar conductor por placa de vehículo
exports.buscarPorPlaca = async (req, res) => {
  const { placa } = req.params;

  try {
    const conductores = await Conductor.findAll({
      where: {
        [Op.or]: [
          { nroPlaca: { [Op.like]: `%${placa}%` } },
          { nroPlacaSecundaria: { [Op.like]: `%${placa}%` } }
        ],
        estado: true
      }
    });

    if (conductores.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontraron conductores con esa placa",
      });
    }

    res.json({
      mensaje: "Conductores encontrados",
      conductores,
      total: conductores.length,
    });
  } catch (error) {
    console.error("Error al buscar conductor por placa:", error);
    res.status(500).json({
      mensaje: "Error al buscar el conductor por placa",
      error: error.message,
    });
  }
};

// Consultar datos de RENIEC/SUNAT por documento
exports.consultarDocumento = async (req, res) => {
  const { tipoDocumento, numeroDocumento } = req.params;

  try {
    let datosConsultados = null;
    let tipoConsulta = null;

    if (tipoDocumento === "DNI") {
      // Validar formato del DNI
      if (!RENIECService.validarDNI(numeroDocumento)) {
        return res.status(400).json({
          mensaje: "El DNI debe tener 8 dígitos numéricos",
        });
      }

      datosConsultados = await RENIECService.consultarPorDNI(numeroDocumento);
      tipoConsulta = "RENIEC";

    } else if (tipoDocumento === "RUC") {
      // Validar formato del RUC
      if (!RENIECService.validarRUC(numeroDocumento)) {
        return res.status(400).json({
          mensaje: "El RUC debe tener 11 dígitos numéricos",
        });
      }

      datosConsultados = await RENIECService.consultarPorRUC(numeroDocumento);
      tipoConsulta = "SUNAT";

    } else {
      return res.status(400).json({
        mensaje: "Solo se puede consultar DNI o RUC",
      });
    }

    if (!datosConsultados || (!datosConsultados.nombres && !datosConsultados.nombre)) {
      return res.status(404).json({
        mensaje: `No se encontraron datos para el ${tipoDocumento} proporcionado`,
      });
    }

    res.json({
      mensaje: `Datos de ${tipoConsulta} obtenidos exitosamente`,
      tipoConsulta,
      datos: datosConsultados,
    });
  } catch (error) {
    console.error(`Error al consultar ${tipoDocumento}:`, error);
    res.status(500).json({
      mensaje: `Error al consultar los datos de ${tipoDocumento}`,
      error: error.message,
    });
  }
};

// Eliminar un conductor
exports.eliminarConductor = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el conductor existe
    const conductor = await Conductor.findByPk(id);
    if (!conductor) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    // Eliminar el conductor (soft delete)
    await conductor.update({ estado: false });

    res.json({ mensaje: "Conductor eliminado exitosamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al eliminar el conductor", error: error.message });
  }
};