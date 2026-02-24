const { Planilla } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");

// Crear trabajador en planilla
exports.crearTrabajador = async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      puesto,
      edad,
      sexo,
      fechaIngreso,
      sueldo,
      observaciones,
    } = req.body;

    // Validar campos obligatorios
    if (
      !nombres ||
      !apellidos ||
      !puesto ||
      !edad ||
      !sexo ||
      !fechaIngreso ||
      !sueldo
    ) {
      return res.status(400).json({
        mensaje:
          "Los campos nombres, apellidos, puesto, edad, sexo, fechaIngreso y sueldo son obligatorios",
      });
    }

    // Verificar si se está intentando establecer adelantoSueldo
    if (req.body.adelantoSueldo !== undefined) {
      return res.status(400).json({
        mensaje:
          "No se puede establecer adelanto de sueldo al crear un trabajador. Use la función de actualización de adelanto después de crear el trabajador.",
      });
    }

    // Validaciones adicionales
    const sueldoNum = parseFloat(sueldo);
    const edadNum = parseInt(edad);

    if (isNaN(sueldoNum) || sueldoNum <= 0) {
      return res.status(400).json({
        mensaje: "El sueldo debe ser un número mayor a 0",
      });
    }

    if (isNaN(edadNum) || edadNum < 18 || edadNum > 70) {
      return res.status(400).json({
        mensaje: "La edad debe ser un número entre 18 y 70 años",
      });
    }

    // Validar fecha de ingreso
    if (!moment(fechaIngreso, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({
        mensaje: "La fecha de ingreso debe tener el formato YYYY-MM-DD",
      });
    }

    // Validar que la fecha de ingreso no sea futura
    if (moment(fechaIngreso).isAfter(moment())) {
      return res.status(400).json({
        mensaje: "La fecha de ingreso no puede ser una fecha futura",
      });
    }

    const trabajador = await Planilla.create({
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      puesto: puesto.trim(),
      edad: edadNum,
      sexo,
      fechaIngreso,
      sueldo: sueldoNum,
      adelantoSueldo: 0.0, // Siempre se establece en 0 al crear
      observaciones: observaciones ? observaciones.trim() : null,
      activo: true,
    });

    res.status(201).json({
      mensaje: "Trabajador agregado a planilla exitosamente",
      trabajador,
    });
  } catch (error) {
    console.error("Error al crear trabajador:", error);

    // Manejar errores de validación de Sequelize
    if (error.name === "SequelizeValidationError") {
      const errores = error.errors.map((err) => err.message);
      return res.status(400).json({
        mensaje: "Error de validación",
        errores,
      });
    }

    // Manejar errores de restricción única
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        mensaje: "Ya existe un trabajador con esos datos",
        error: error.message,
      });
    }

    res.status(500).json({
      mensaje: "Error al crear trabajador",
      error: error.message,
    });
  }
};

// Obtener todos los trabajadores
exports.obtenerTrabajadores = async (req, res) => {
  try {
    const {
      activo,
      puesto,
      sexo,
      buscar,
      fechaIngresoDesde,
      fechaIngresoHasta,
    } = req.query;
    const where = {};

    // Debug: mostrar parámetros recibidos
    console.log("Parámetros de filtro recibidos:", {
      activo,
      puesto,
      sexo,
      buscar,
      fechaIngresoDesde,
      fechaIngresoHasta,
    });

    // Filtro por estado activo
    if (activo !== undefined) {
      where.activo = activo === "true";
    }

    // Filtro por puesto
    if (puesto && puesto.trim() !== "") {
      where.puesto = {
        [Op.like]: `%${puesto.trim()}%`,
      };
    }

    // Filtro por sexo
    if (sexo && sexo.trim() !== "") {
      where.sexo = sexo.trim();
    }

    // Búsqueda general por nombres o apellidos
    if (buscar && buscar.trim() !== "") {
      where[Op.or] = [
        {
          nombres: {
            [Op.like]: `%${buscar.trim()}%`,
          },
        },
        {
          apellidos: {
            [Op.like]: `%${buscar.trim()}%`,
          },
        },
      ];
    }

    // Filtro por rango de fechas de ingreso - CORREGIDO
    if (fechaIngresoDesde || fechaIngresoHasta) {
      where.fechaIngreso = {};

      if (fechaIngresoDesde && fechaIngresoDesde.trim() !== "") {
        // Validar y parsear fecha de inicio
        const fechaDesde = moment(fechaIngresoDesde.trim(), "YYYY-MM-DD", true);
        if (fechaDesde.isValid()) {
          const fechaDesdeStart = fechaDesde.startOf("day").toDate();
          where.fechaIngreso[Op.gte] = fechaDesdeStart;
          console.log("Filtro fechaIngresoDesde aplicado:", {
            original: fechaIngresoDesde,
            parsed: fechaDesdeStart,
            iso: fechaDesdeStart.toISOString(),
          });
        } else {
          console.log("Fecha de inicio inválida:", fechaIngresoDesde);
          return res.status(400).json({
            mensaje: "Formato de fecha de inicio inválido. Use YYYY-MM-DD",
            fechaRecibida: fechaIngresoDesde,
          });
        }
      }

      if (fechaIngresoHasta && fechaIngresoHasta.trim() !== "") {
        // Validar y parsear fecha de fin
        const fechaHasta = moment(fechaIngresoHasta.trim(), "YYYY-MM-DD", true);
        if (fechaHasta.isValid()) {
          const fechaHastaEnd = fechaHasta.endOf("day").toDate();
          where.fechaIngreso[Op.lte] = fechaHastaEnd;
          console.log("Filtro fechaIngresoHasta aplicado:", {
            original: fechaIngresoHasta,
            parsed: fechaHastaEnd,
            iso: fechaHastaEnd.toISOString(),
          });
        } else {
          console.log("Fecha de fin inválida:", fechaIngresoHasta);
          return res.status(400).json({
            mensaje: "Formato de fecha de fin inválido. Use YYYY-MM-DD",
            fechaRecibida: fechaIngresoHasta,
          });
        }
      }

      // Validar que la fecha de inicio no sea mayor que la fecha de fin
      if (fechaIngresoDesde && fechaIngresoHasta) {
        const fechaDesde = moment(fechaIngresoDesde.trim(), "YYYY-MM-DD", true);
        const fechaHasta = moment(fechaIngresoHasta.trim(), "YYYY-MM-DD", true);

        if (
          fechaDesde.isValid() &&
          fechaHasta.isValid() &&
          fechaDesde.isAfter(fechaHasta)
        ) {
          return res.status(400).json({
            mensaje:
              "La fecha de inicio no puede ser mayor que la fecha de fin",
            fechaIngresoDesde,
            fechaIngresoHasta,
          });
        }
      }
    }

    console.log("Condiciones WHERE finales:", JSON.stringify(where, null, 2));

    const trabajadores = await Planilla.findAll({
      where,
      order: [["nombres", "ASC"]],
    });

    console.log("Trabajadores encontrados:", trabajadores.length);

    // Si hay filtros de fecha y no se encuentran resultados, hacer una consulta de debug
    if ((fechaIngresoDesde || fechaIngresoHasta) && trabajadores.length === 0) {
      console.log(
        "No se encontraron trabajadores con filtros de fecha, verificando datos..."
      );

      // Consultar algunos registros para ver las fechas que existen
      const ejemploFechas = await Planilla.findAll({
        attributes: ["id", "nombres", "apellidos", "fechaIngreso"],
        limit: 5,
        order: [["fechaIngreso", "DESC"]],
      });

      console.log("Ejemplos de fechas en la base de datos:");
      ejemploFechas.forEach((trabajador) => {
        console.log(
          `ID: ${trabajador.id}, Nombre: ${trabajador.nombres} ${trabajador.apellidos}, Fecha: ${trabajador.fechaIngreso}`
        );
      });
    }

    // Calcular estadísticas
    const totalTrabajadores = trabajadores.length;
    const totalSueldos = trabajadores.reduce(
      (sum, trabajador) => sum + parseFloat(trabajador.sueldo),
      0
    );
    const totalAdelantos = trabajadores.reduce(
      (sum, trabajador) => sum + parseFloat(trabajador.adelantoSueldo || 0),
      0
    );

    res.status(200).json({
      mensaje: "Trabajadores obtenidos exitosamente",
      filtrosAplicados: {
        activo: activo || null,
        puesto: puesto || null,
        sexo: sexo || null,
        buscar: buscar || null,
        fechaIngresoDesde: fechaIngresoDesde || null,
        fechaIngresoHasta: fechaIngresoHasta || null,
      },
      estadisticas: {
        totalTrabajadores,
        totalSueldos: parseFloat(totalSueldos.toFixed(2)),
        totalAdelantos: parseFloat(totalAdelantos.toFixed(2)),
        sueldoPromedio:
          totalTrabajadores > 0
            ? parseFloat((totalSueldos / totalTrabajadores).toFixed(2))
            : 0,
      },
      trabajadores,
    });
  } catch (error) {
    console.error("Error al obtener trabajadores:", error);
    res.status(500).json({
      mensaje: "Error al obtener trabajadores",
      error: error.message,
    });
  }
};
// Obtener trabajador por ID
exports.obtenerTrabajadorPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        mensaje: "ID de trabajador inválido",
      });
    }

    const trabajador = await Planilla.findByPk(id);

    if (!trabajador) {
      return res.status(404).json({
        mensaje: "Trabajador no encontrado",
      });
    }

    // Calcular años de servicio
    const añosServicio = moment().diff(
      moment(trabajador.fechaIngreso),
      "years",
      true
    );
    const saldoPendiente =
      parseFloat(trabajador.sueldo) -
      parseFloat(trabajador.adelantoSueldo || 0);

    res.status(200).json({
      mensaje: "Trabajador obtenido exitosamente",
      trabajador: {
        ...trabajador.toJSON(),
        añosServicio: parseFloat(añosServicio.toFixed(2)),
        saldoPendiente: parseFloat(saldoPendiente.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Error al obtener trabajador:", error);
    res.status(500).json({
      mensaje: "Error al obtener trabajador",
      error: error.message,
    });
  }
};

// Actualizar trabajador
exports.actualizarTrabajador = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombres,
      apellidos,
      puesto,
      edad,
      sexo,
      fechaIngreso,
      sueldo,
      adelantoSueldo,
      observaciones,
      activo,
    } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        mensaje: "ID de trabajador inválido",
      });
    }

    const trabajador = await Planilla.findByPk(id);

    if (!trabajador) {
      return res.status(404).json({
        mensaje: "Trabajador no encontrado",
      });
    }

    // Validar que el adelanto no sea mayor al sueldo
    const nuevoSueldo = sueldo
      ? parseFloat(sueldo)
      : parseFloat(trabajador.sueldo);
    const nuevoAdelanto =
      adelantoSueldo !== undefined
        ? parseFloat(adelantoSueldo)
        : parseFloat(trabajador.adelantoSueldo || 0);

    if (nuevoAdelanto > nuevoSueldo) {
      return res.status(400).json({
        mensaje: "El adelanto de sueldo no puede ser mayor al sueldo base",
      });
    }

    if (nuevoAdelanto < 0) {
      return res.status(400).json({
        mensaje: "El adelanto de sueldo no puede ser negativo",
      });
    }

    // Validar edad si se proporciona
    if (
      edad &&
      (isNaN(parseInt(edad)) || parseInt(edad) < 18 || parseInt(edad) > 70)
    ) {
      return res.status(400).json({
        mensaje: "La edad debe ser un número entre 18 y 70 años",
      });
    }

    // Validar sueldo si se proporciona
    if (sueldo && (isNaN(parseFloat(sueldo)) || parseFloat(sueldo) <= 0)) {
      return res.status(400).json({
        mensaje: "El sueldo debe ser un número mayor a 0",
      });
    }

    // Actualizar campos
    await trabajador.update({
      nombres: nombres ? nombres.trim() : trabajador.nombres,
      apellidos: apellidos ? apellidos.trim() : trabajador.apellidos,
      puesto: puesto ? puesto.trim() : trabajador.puesto,
      edad: edad ? parseInt(edad) : trabajador.edad,
      sexo: sexo || trabajador.sexo,
      fechaIngreso: fechaIngreso || trabajador.fechaIngreso,
      sueldo: nuevoSueldo,
      adelantoSueldo: nuevoAdelanto,
      observaciones:
        observaciones !== undefined
          ? observaciones
            ? observaciones.trim()
            : null
          : trabajador.observaciones,
      activo: activo !== undefined ? activo : trabajador.activo,
    });

    res.status(200).json({
      mensaje: "Trabajador actualizado exitosamente",
      trabajador,
    });
  } catch (error) {
    console.error("Error al actualizar trabajador:", error);

    // Manejar errores de validación de Sequelize
    if (error.name === "SequelizeValidationError") {
      const errores = error.errors.map((err) => err.message);
      return res.status(400).json({
        mensaje: "Error de validación",
        errores,
      });
    }

    res.status(500).json({
      mensaje: "Error al actualizar trabajador",
      error: error.message,
    });
  }
};

// Eliminar trabajador (soft delete)
exports.eliminarTrabajador = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        mensaje: "ID de trabajador inválido",
      });
    }

    const trabajador = await Planilla.findByPk(id);

    if (!trabajador) {
      return res.status(404).json({
        mensaje: "Trabajador no encontrado",
      });
    }

    // Soft delete - cambiar estado a inactivo
    await trabajador.update({ activo: false });

    res.status(200).json({
      mensaje: "Trabajador dado de baja exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar trabajador:", error);
    res.status(500).json({
      mensaje: "Error al eliminar trabajador",
      error: error.message,
    });
  }
};

// Activar trabajador
exports.activarTrabajador = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        mensaje: "ID de trabajador inválido",
      });
    }

    const trabajador = await Planilla.findByPk(id);

    if (!trabajador) {
      return res.status(404).json({
        mensaje: "Trabajador no encontrado",
      });
    }

    await trabajador.update({ activo: true });

    res.status(200).json({
      mensaje: "Trabajador reactivado exitosamente",
      trabajador,
    });
  } catch (error) {
    console.error("Error al activar trabajador:", error);
    res.status(500).json({
      mensaje: "Error al activar trabajador",
      error: error.message,
    });
  }
};

// Generar reporte de planilla
exports.generarReportePlanilla = async (req, res) => {
  try {
    const { mes, año, puesto, activo } = req.query;
    const where = {};

    // Filtro por estado activo
    if (activo !== undefined) {
      where.activo = activo === "true";
    }

    // Filtro por puesto
    if (puesto) {
      where.puesto = {
        [Op.like]: `%${puesto}%`,
      };
    }

    // Filtro por mes y año de ingreso
    if (mes && año) {
      const fechaInicio = moment(`${año}-${mes.padStart(2, "0")}-01`)
        .startOf("month")
        .toDate();
      const fechaFin = moment(`${año}-${mes.padStart(2, "0")}-01`)
        .endOf("month")
        .toDate();

      where.fechaIngreso = {
        [Op.between]: [fechaInicio, fechaFin],
      };
    }

    const trabajadores = await Planilla.findAll({
      where,
      order: [["nombres", "ASC"]],
    });

    // Calcular totales y estadísticas
    const totalTrabajadores = trabajadores.length;
    const totalSueldos = trabajadores.reduce(
      (sum, trabajador) => sum + parseFloat(trabajador.sueldo),
      0
    );
    const totalAdelantos = trabajadores.reduce(
      (sum, trabajador) => sum + parseFloat(trabajador.adelantoSueldo || 0),
      0
    );
    const totalAPagar = totalSueldos - totalAdelantos;

    // Agrupar por puesto
    const porPuesto = trabajadores.reduce((acc, trabajador) => {
      const puesto = trabajador.puesto;
      if (!acc[puesto]) {
        acc[puesto] = {
          cantidad: 0,
          totalSueldo: 0,
          totalAdelanto: 0,
        };
      }
      acc[puesto].cantidad++;
      acc[puesto].totalSueldo += parseFloat(trabajador.sueldo);
      acc[puesto].totalAdelanto += parseFloat(trabajador.adelantoSueldo || 0);
      return acc;
    }, {});

    // Agrupar por sexo
    const porSexo = trabajadores.reduce((acc, trabajador) => {
      const sexo = trabajador.sexo;
      acc[sexo] = (acc[sexo] || 0) + 1;
      return acc;
    }, {});

    const reporte = {
      filtros: {
        mes: mes || null,
        año: año || null,
        puesto: puesto || null,
        activo: activo || null,
      },
      resumen: {
        totalTrabajadores,
        totalSueldos: parseFloat(totalSueldos.toFixed(2)),
        totalAdelantos: parseFloat(totalAdelantos.toFixed(2)),
        totalAPagar: parseFloat(totalAPagar.toFixed(2)),
        sueldoPromedio:
          totalTrabajadores > 0
            ? parseFloat((totalSueldos / totalTrabajadores).toFixed(2))
            : 0,
      },
      estadisticas: {
        porPuesto,
        porSexo,
      },
      trabajadores: trabajadores.map((trabajador) => ({
        id: trabajador.id,
        nombres: trabajador.nombres,
        apellidos: trabajador.apellidos,
        puesto: trabajador.puesto,
        edad: trabajador.edad,
        sexo: trabajador.sexo,
        fechaIngreso: trabajador.fechaIngreso,
        sueldo: parseFloat(trabajador.sueldo),
        adelantoSueldo: parseFloat(trabajador.adelantoSueldo || 0),
        saldoPendiente:
          parseFloat(trabajador.sueldo) -
          parseFloat(trabajador.adelantoSueldo || 0),
        añosServicio: parseFloat(
          moment()
            .diff(moment(trabajador.fechaIngreso), "years", true)
            .toFixed(2)
        ),
        activo: trabajador.activo,
        observaciones: trabajador.observaciones,
      })),
    };

    res.status(200).json({
      mensaje: "Reporte de planilla generado exitosamente",
      reporte,
    });
  } catch (error) {
    console.error("Error al generar reporte de planilla:", error);
    res.status(500).json({
      mensaje: "Error al generar reporte de planilla",
      error: error.message,
    });
  }
};

// Actualizar adelanto de sueldo
exports.actualizarAdelanto = async (req, res) => {
  try {
    const { id } = req.params;
    const { adelantoSueldo } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        mensaje: "ID de trabajador inválido",
      });
    }

    if (adelantoSueldo === undefined || adelantoSueldo === null) {
      return res.status(400).json({
        mensaje: "El monto del adelanto es obligatorio",
      });
    }

    const trabajador = await Planilla.findByPk(id);

    if (!trabajador) {
      return res.status(404).json({
        mensaje: "Trabajador no encontrado",
      });
    }

    const nuevoAdelanto = parseFloat(adelantoSueldo);
    const sueldo = parseFloat(trabajador.sueldo);

    if (isNaN(nuevoAdelanto)) {
      return res.status(400).json({
        mensaje: "El adelanto debe ser un número válido",
      });
    }

    if (nuevoAdelanto > sueldo) {
      return res.status(400).json({
        mensaje: "El adelanto no puede ser mayor al sueldo base",
      });
    }

    if (nuevoAdelanto < 0) {
      return res.status(400).json({
        mensaje: "El adelanto no puede ser negativo",
      });
    }

    await trabajador.update({ adelantoSueldo: nuevoAdelanto });

    res.status(200).json({
      mensaje: "Adelanto de sueldo actualizado exitosamente",
      trabajador: {
        id: trabajador.id,
        nombres: trabajador.nombres,
        apellidos: trabajador.apellidos,
        sueldo: parseFloat(trabajador.sueldo),
        adelantoSueldo: nuevoAdelanto,
        saldoPendiente: sueldo - nuevoAdelanto,
      },
    });
  } catch (error) {
    console.error("Error al actualizar adelanto:", error);

    // Manejar errores de validación de Sequelize
    if (error.name === "SequelizeValidationError") {
      const errores = error.errors.map((err) => err.message);
      return res.status(400).json({
        mensaje: "Error de validación",
        errores,
      });
    }

    res.status(500).json({
      mensaje: "Error al actualizar adelanto",
      error: error.message,
    });
  }
};
