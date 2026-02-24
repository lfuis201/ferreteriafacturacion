const { Cliente } = require("../models");
const { Op } = require("sequelize");
const RENIECService = require("../services/reniecService");

// Obtener todos los clientes
exports.obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      where: { estado: true },
      order: [['createdAt', 'DESC']], // Ordenar del más reciente al más antiguo
    });

    res.json({ clientes });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener clientes", error: error.message });
  }
};

// Buscar clientes por nombre o documento
exports.buscarClientes = async (req, res) => {
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
    const clientes = await Cliente.findAll({
      where: whereClause,
    });
    res.json({ clientes });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al buscar clientes", error: error.message });
  }
};

// Obtener un cliente por ID
exports.obtenerClientePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await Cliente.findOne({
      where: { id, estado: true },
    });

    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.json({ cliente });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener el cliente", error: error.message });
  }
};

// Crear un nuevo cliente
// Crear un nuevo cliente
// Crear un nuevo cliente
// Crear un nuevo cliente
exports.crearCliente = async (req, res) => {
  const {
    nombre,
    tipoDocumento,
    numeroDocumento,
    direccion,
    telefono,
    email,
    codInterno,
    pais,
    ubigeo,
    departamento,
    provincia,
    distrito,
  } = req.body;

  try {
    // Verificar si ya existe un cliente con el mismo número de documento
    if (numeroDocumento) {
      const clienteExistente = await Cliente.findOne({
        where: { numeroDocumento, tipoDocumento },
      });

      if (clienteExistente) {
        return res.status(400).json({
          mensaje: "Ya existe un cliente con ese número de documento",
          clienteExistente: {
            id: clienteExistente.id,
            nombre: clienteExistente.nombre,
            tipoDocumento: clienteExistente.tipoDocumento,
            numeroDocumento: clienteExistente.numeroDocumento,
          },
        });
      }
    }

    let datosCliente = {
      nombre: nombre || null,
      tipoDocumento,
      numeroDocumento,
      direccion: direccion || null,
      telefono: telefono || null,
      email: email || null,
      codInterno: codInterno || null,
      pais: pais || "Perú", // Por defecto Perú
      ubigeo: ubigeo || null,
      departamento: departamento || null,
      provincia: provincia || null,
      distrito: distrito || null,
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
              datosCliente.nombre = nombreCompleto;
            }
            
            datosCliente.apellidoPaterno = datosRENIECConsultados.apellidoPaterno;
            datosCliente.apellidoMaterno = datosRENIECConsultados.apellidoMaterno;
            datosCliente.nombres = datosRENIECConsultados.nombres;
            consultaRENIECExitosa = true;
          }

          // Solo actualizar la dirección si no se proporcionó una
          if (datosRENIECConsultados.direccion && (!direccion || direccion.trim() === "")) {
            datosCliente.direccion = datosRENIECConsultados.direccion;
          }

          // Actualizar datos de ubicación desde RENIEC
          if (datosRENIECConsultados.ubigeo)
            datosCliente.ubigeo = datosRENIECConsultados.ubigeo;
          if (datosRENIECConsultados.viaTipo)
            datosCliente.viaTipo = datosRENIECConsultados.viaTipo;
          if (datosRENIECConsultados.viaNombre)
            datosCliente.viaNombre = datosRENIECConsultados.viaNombre;
          if (datosRENIECConsultados.zonaCodigo)
            datosCliente.zonaCodigo = datosRENIECConsultados.zonaCodigo;
          if (datosRENIECConsultados.zonaTipo)
            datosCliente.zonaTipo = datosRENIECConsultados.zonaTipo;
          if (datosRENIECConsultados.numero)
            datosCliente.numero = datosRENIECConsultados.numero;
          if (datosRENIECConsultados.interior)
            datosCliente.interior = datosRENIECConsultados.interior;
          if (datosRENIECConsultados.lote)
            datosCliente.lote = datosRENIECConsultados.lote;
          if (datosRENIECConsultados.dpto)
            datosCliente.dpto = datosRENIECConsultados.dpto;
          if (datosRENIECConsultados.manzana)
            datosCliente.manzana = datosRENIECConsultados.manzana;
          if (datosRENIECConsultados.kilometro)
            datosCliente.kilometro = datosRENIECConsultados.kilometro;
          if (datosRENIECConsultados.distrito)
            datosCliente.distrito = datosRENIECConsultados.distrito;
          if (datosRENIECConsultados.provincia)
            datosCliente.provincia = datosRENIECConsultados.provincia;
          if (datosRENIECConsultados.departamento)
            datosCliente.departamento = datosRENIECConsultados.departamento;

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
              datosCliente.nombre = datosRENIECConsultados.nombre;
            }
            consultaRENIECExitosa = true;
          }

          // Solo actualizar la dirección si no se proporcionó una
          if (datosRENIECConsultados.direccion && (!direccion || direccion.trim() === "")) {
            datosCliente.direccion = datosRENIECConsultados.direccion;
          }

          // Actualizar datos de ubicación desde RENIEC
          if (datosRENIECConsultados.ubigeo)
            datosCliente.ubigeo = datosRENIECConsultados.ubigeo;
          if (datosRENIECConsultados.viaTipo)
            datosCliente.viaTipo = datosRENIECConsultados.viaTipo;
          if (datosRENIECConsultados.viaNombre)
            datosCliente.viaNombre = datosRENIECConsultados.viaNombre;
          if (datosRENIECConsultados.zonaCodigo)
            datosCliente.zonaCodigo = datosRENIECConsultados.zonaCodigo;
          if (datosRENIECConsultados.zonaTipo)
            datosCliente.zonaTipo = datosRENIECConsultados.zonaTipo;
          if (datosRENIECConsultados.numero)
            datosCliente.numero = datosRENIECConsultados.numero;
          if (datosRENIECConsultados.interior)
            datosCliente.interior = datosRENIECConsultados.interior;
          if (datosRENIECConsultados.lote)
            datosCliente.lote = datosRENIECConsultados.lote;
          if (datosRENIECConsultados.dpto)
            datosCliente.dpto = datosRENIECConsultados.dpto;
          if (datosRENIECConsultados.manzana)
            datosCliente.manzana = datosRENIECConsultados.manzana;
          if (datosRENIECConsultados.kilometro)
            datosCliente.kilometro = datosRENIECConsultados.kilometro;
          if (datosRENIECConsultados.distrito)
            datosCliente.distrito = datosRENIECConsultados.distrito;
          if (datosRENIECConsultados.provincia)
            datosCliente.provincia = datosRENIECConsultados.provincia;
          if (datosRENIECConsultados.departamento)
            datosCliente.departamento = datosRENIECConsultados.departamento;
        }
      } catch (reniecError) {
        // Si falla la consulta a RENIEC, continuar con los datos proporcionados
        console.log("Error al consultar RENIEC:", reniecError.message);
        consultaRENIECExitosa = false;
      }
    }

    console.log('Datos finales para crear cliente:', datosCliente);
    
    // Crear el cliente
    const nuevoCliente = await Cliente.create(datosCliente);
    
    console.log('Cliente creado exitosamente:', nuevoCliente.toJSON());

    res.status(201).json({
      mensaje: "Cliente creado exitosamente",
      cliente: nuevoCliente,
      consultaRENIECRealizada: (tipoDocumento === "DNI" || tipoDocumento === "RUC") && numeroDocumento,
      consultaRENIECExitosa,
      datosRENIEC: datosRENIECConsultados,
      nombreOriginal: nombre,
      nombreFinal: nuevoCliente.nombre,
    });
  } catch (error) {
    console.error('=== ERROR AL CREAR CLIENTE ===');
    console.error('Error completo:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    res
      .status(500)
      .json({ mensaje: "Error al crear el cliente", error: error.message, stack: error.stack });
  }
};

// Nueva función para consultar RENIEC independientemente
exports.consultarRENIEC = async (req, res) => {
  const { numeroDocumento } = req.params;

  if (!numeroDocumento) {
    return res
      .status(400)
      .json({ mensaje: "Debe proporcionar un número de documento" });
  }

  // Validar formato del DNI
  if (!RENIECService.validarDNI(numeroDocumento)) {
    return res.status(400).json({
      mensaje: "El DNI debe tener 8 dígitos numéricos",
    });
  }

  try {
    const datosRENIEC = await RENIECService.consultarPorDNI(numeroDocumento);

    res.json({
      mensaje: "Consulta exitosa",
      datos: datosRENIEC,
      nombreCompleto: [
        datosRENIEC.nombres,
        datosRENIEC.apellidoPaterno,
        datosRENIEC.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(" "),
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar RENIEC",
      error: error.message,
      sugerencia: "Verifique que el DNI sea válido o intente más tarde",
    });
  }
};

// Consultar datos de RENIEC por RUC
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
      mensaje: "Error al consultar RENIEC",
      error: error.message,
      sugerencia:
        "Verifique que el número de documento sea válido o intente más tarde",
    });
  }
};

// Nueva función para obtener información de la API
exports.obtenerInfoAPI = async (req, res) => {
  try {
    const infoAPI = RENIECService.getAPIInfo();

    res.json({
      mensaje: "Información de la API obtenida exitosamente",
      api: infoAPI,
      estado: "Activa",
      ultimaVerificacion: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener información de la API",
      error: error.message,
    });
  }
};

// Actualizar un cliente
exports.actualizarCliente = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    tipoDocumento,
    numeroDocumento,
    direccion,
    telefono,
    email,
    estado,
    apellidoPaterno,
    apellidoMaterno,
    nombres,
    ubigeo,
    viaTipo,
    viaNombre,
    zonaCodigo,
    zonaTipo,
    numero,
    interior,
    lote,
    dpto,
    manzana,
    kilometro,
    distrito,
    provincia,
    departamento,
  } = req.body;

  try {
    // Verificar si el cliente existe
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    // Verificar si ya existe otro cliente con el mismo número de documento
    if (
      numeroDocumento &&
      tipoDocumento &&
      (numeroDocumento !== cliente.numeroDocumento ||
        tipoDocumento !== cliente.tipoDocumento)
    ) {
      const clienteExistente = await Cliente.findOne({
        where: {
          numeroDocumento,
          tipoDocumento,
          id: { [Op.ne]: id },
        },
      });
      if (clienteExistente) {
        return res.status(400).json({
          mensaje: "Ya existe otro cliente con ese número de documento",
        });
      }
    }

    // Actualizar el cliente
    await cliente.update({
      nombre: nombre || cliente.nombre,
      tipoDocumento: tipoDocumento || cliente.tipoDocumento,
      numeroDocumento: numeroDocumento || cliente.numeroDocumento,
      direccion: direccion !== undefined ? direccion : cliente.direccion,
      telefono: telefono !== undefined ? telefono : cliente.telefono,
      email: email !== undefined ? email : cliente.email,
      estado: estado !== undefined ? estado : cliente.estado,
      apellidoPaterno:
        apellidoPaterno !== undefined
          ? apellidoPaterno
          : cliente.apellidoPaterno,
      apellidoMaterno:
        apellidoMaterno !== undefined
          ? apellidoMaterno
          : cliente.apellidoMaterno,
      nombres: nombres !== undefined ? nombres : cliente.nombres,
      ubigeo: ubigeo !== undefined ? ubigeo : cliente.ubigeo,
      viaTipo: viaTipo !== undefined ? viaTipo : cliente.viaTipo,
      viaNombre: viaNombre !== undefined ? viaNombre : cliente.viaNombre,
      zonaCodigo: zonaCodigo !== undefined ? zonaCodigo : cliente.zonaCodigo,
      zonaTipo: zonaTipo !== undefined ? zonaTipo : cliente.zonaTipo,
      numero: numero !== undefined ? numero : cliente.numero,
      interior: interior !== undefined ? interior : cliente.interior,
      lote: lote !== undefined ? lote : cliente.lote,
      dpto: dpto !== undefined ? dpto : cliente.dpto,
      manzana: manzana !== undefined ? manzana : cliente.manzana,
      kilometro: kilometro !== undefined ? kilometro : cliente.kilometro,
      distrito: distrito !== undefined ? distrito : cliente.distrito,
      provincia: provincia !== undefined ? provincia : cliente.provincia,
      departamento:
        departamento !== undefined ? departamento : cliente.departamento,
    });

    res.json({
      mensaje: "Cliente actualizado exitosamente",
      cliente: await Cliente.findByPk(id), // Devolver el cliente actualizado
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar el cliente",
      error: error.message,
    });
  }
};

// Eliminar un cliente
exports.eliminarCliente = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el cliente existe
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    // Eliminar el cliente
    await cliente.destroy();

    res.json({ mensaje: "Cliente eliminado exitosamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al eliminar el cliente", error: error.message });
  }
};
