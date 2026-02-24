const { PagadorFlete } = require("../models");
const { Op } = require("sequelize");
const RENIECService = require("../services/reniecService");

// Obtener todos los pagadores de flete
exports.obtenerPagadoresFlete = async (req, res) => {
  try {
    const pagadoresFlete = await PagadorFlete.findAll({
      where: { estado: true },
      order: [["nombre", "ASC"]],
    });

    res.json({
      mensaje: "Pagadores de flete obtenidos exitosamente",
      pagadoresFlete,
    });
  } catch (error) {
    console.error("Error al obtener pagadores de flete:", error);
    res.status(500).json({
      mensaje: "Error al obtener los pagadores de flete",
      error: error.message,
    });
  }
};

// Buscar pagadores de flete por nombre, documento
exports.buscarPagadoresFlete = async (req, res) => {
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
    const pagadoresFlete = await PagadorFlete.findAll({
      where: whereClause,
    });
    res.json({ pagadoresFlete });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al buscar pagadores de flete", error: error.message });
  }
};

// Obtener un pagador de flete por ID
exports.obtenerPagadorFletePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const pagadorFlete = await PagadorFlete.findOne({
      where: { id, estado: true },
    });

    if (!pagadorFlete) {
      return res.status(404).json({ mensaje: "Pagador de flete no encontrado" });
    }

    res.json({ pagadorFlete });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener el pagador de flete", error: error.message });
  }
};

// Consultar RENIEC por DNI o SUNAT por RUC
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
      mensaje: "Error al consultar RENIEC/SUNAT",
      error: error.message,
      sugerencia: "Verifique que el número de documento sea válido y que el servicio esté disponible"
    });
  }
};

// Crear un nuevo pagador de flete
exports.crearPagadorFlete = async (req, res) => {
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
    consultarRENIEC,
  } = req.body;

  try {
    // Validar campos requeridos
    if (!tipoDocumento || !numeroDocumento) {
      return res.status(400).json({
        mensaje: "Los campos tipoDocumento y numeroDocumento son requeridos",
      });
    }

    // Verificar si ya existe un pagador de flete con el mismo número de documento
    const pagadorFleteExistente = await PagadorFlete.findOne({
      where: { numeroDocumento, tipoDocumento },
    });

    if (pagadorFleteExistente) {
      return res.status(400).json({
        mensaje: "Ya existe un pagador de flete con ese número de documento",
        pagadorFleteExistente: {
          id: pagadorFleteExistente.id,
          nombre: pagadorFleteExistente.nombre,
          tipoDocumento: pagadorFleteExistente.tipoDocumento,
          numeroDocumento: pagadorFleteExistente.numeroDocumento,
        },
      });
    }

    let datosPagadorFlete = {
      nombre: nombre || null,
      tipoDocumento,
      numeroDocumento,
      telefono: telefono || null,
      direccion: direccion || null,
      departamento: departamento || null,
      provincia: provincia || null,
      distrito: distrito || null,
      ubigeo: ubigeo || null,
    };

    let datosRENIECConsultados = null;
    let consultaRENIECExitosa = false;

    // Consultar RENIEC/SUNAT automáticamente si se especifica
    if (consultarRENIEC && (tipoDocumento === "DNI" || tipoDocumento === "RUC")) {
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
          if (datosRENIECConsultados.nombres && datosRENIECConsultados.apellidoPaterno) {
            // Solo actualizar el nombre si no se proporcionó uno
            if (!nombre || nombre.trim() === "") {
              datosPagadorFlete.nombre = [
                datosRENIECConsultados.nombres,
                datosRENIECConsultados.apellidoPaterno,
                datosRENIECConsultados.apellidoMaterno,
              ]
                .filter(Boolean)
                .join(" ");
            }
            
            // Guardar datos individuales de RENIEC
            datosPagadorFlete.nombres = datosRENIECConsultados.nombres;
            datosPagadorFlete.apellidoPaterno = datosRENIECConsultados.apellidoPaterno;
            datosPagadorFlete.apellidoMaterno = datosRENIECConsultados.apellidoMaterno;
            
            consultaRENIECExitosa = true;
          }

          // Solo actualizar la dirección si no se proporcionó una
          if (datosRENIECConsultados.direccion && (!direccion || direccion.trim() === "")) {
            datosPagadorFlete.direccion = datosRENIECConsultados.direccion;
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

          // Actualizar datos con información de SUNAT
          if (datosRENIECConsultados.nombre || datosRENIECConsultados.razonSocial) {
            // Solo actualizar el nombre si no se proporcionó uno
            if (!nombre || nombre.trim() === "") {
              datosPagadorFlete.nombre = datosRENIECConsultados.nombre || datosRENIECConsultados.razonSocial;
            }
            
            // Guardar datos individuales de SUNAT
            datosPagadorFlete.razonSocial = datosRENIECConsultados.razonSocial || datosRENIECConsultados.nombre;
            datosPagadorFlete.nombreComercial = datosRENIECConsultados.nombreComercial;
            
            consultaRENIECExitosa = true;
          }

          // Solo actualizar la dirección si no se proporcionó una
          if (datosRENIECConsultados.direccion && (!direccion || direccion.trim() === "")) {
            datosPagadorFlete.direccion = datosRENIECConsultados.direccion;
          }
        }
      } catch (reniecError) {
        // Si falla la consulta a RENIEC/SUNAT, continuar con los datos proporcionados
        console.log("Error al consultar RENIEC/SUNAT:", reniecError.message);
        consultaRENIECExitosa = false;
      }
    }

    console.log('Datos finales para crear pagador de flete:', datosPagadorFlete);
    
    // Crear el pagador de flete
    const nuevoPagadorFlete = await PagadorFlete.create(datosPagadorFlete);
    
    console.log('Pagador de flete creado exitosamente:', nuevoPagadorFlete.toJSON());

    res.status(201).json({
      mensaje: "Pagador de flete creado exitosamente",
      pagadorFlete: nuevoPagadorFlete,
      consultaRENIECRealizada: (tipoDocumento === "DNI" || tipoDocumento === "RUC") && numeroDocumento,
      consultaRENIECExitosa,
      datosRENIEC: datosRENIECConsultados,
      nombreOriginal: nombre,
    });
  } catch (error) {
    console.error("Error al crear pagador de flete:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor al crear pagador de flete",
      error: error.message,
    });
  }
};

// Actualizar un pagador de flete
exports.actualizarPagadorFlete = async (req, res) => {
  const { id } = req.params;
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
  } = req.body;

  try {
    const pagadorFlete = await PagadorFlete.findByPk(id);

    if (!pagadorFlete) {
      return res.status(404).json({
        mensaje: "Pagador de flete no encontrado",
      });
    }

    // Verificar si el nuevo número de documento ya existe en otro registro
    if (numeroDocumento && numeroDocumento !== pagadorFlete.numeroDocumento) {
      const pagadorFleteExistente = await PagadorFlete.findOne({
        where: {
          numeroDocumento,
          tipoDocumento: tipoDocumento || pagadorFlete.tipoDocumento,
          id: { [Op.ne]: id },
        },
      });

      if (pagadorFleteExistente) {
        return res.status(400).json({
          mensaje: "Ya existe otro pagador de flete con ese número de documento",
        });
      }
    }

    // Actualizar los campos
    await pagadorFlete.update({
      tipoDocumento: tipoDocumento || pagadorFlete.tipoDocumento,
      numeroDocumento: numeroDocumento || pagadorFlete.numeroDocumento,
      nombre: nombre || pagadorFlete.nombre,
      telefono: telefono || pagadorFlete.telefono,
      direccion: direccion || pagadorFlete.direccion,
      departamento: departamento || pagadorFlete.departamento,
      provincia: provincia || pagadorFlete.provincia,
      distrito: distrito || pagadorFlete.distrito,
      ubigeo: ubigeo || pagadorFlete.ubigeo,
    });

    res.json({
      mensaje: "Pagador de flete actualizado exitosamente",
      pagadorFlete,
    });
  } catch (error) {
    console.error("Error al actualizar pagador de flete:", error);
    res.status(500).json({
      mensaje: "Error al actualizar el pagador de flete",
      error: error.message,
    });
  }
};

// Eliminar un pagador de flete (soft delete)
exports.eliminarPagadorFlete = async (req, res) => {
  const { id } = req.params;

  try {
    const pagadorFlete = await PagadorFlete.findByPk(id);

    if (!pagadorFlete) {
      return res.status(404).json({
        mensaje: "Pagador de flete no encontrado",
      });
    }

    await pagadorFlete.update({ estado: false });

    res.json({
      mensaje: "Pagador de flete eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar pagador de flete:", error);
    res.status(500).json({
      mensaje: "Error al eliminar el pagador de flete",
      error: error.message,
    });
  }
};