const { Cotizacion, DetalleCotizacion, Producto, Cliente, Sucursal, Usuario } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Obtener todas las cotizaciones
exports.obtenerCotizaciones = async (req, res) => {
  const { sucursalId, estado, fechaInicio } = req.query;
  try {
    // Construir condiciones de búsqueda
    const where = {};
    
    // Manejo de filtrado por fecha
    if (fechaInicio) {
      // Parsear la fecha de manera precisa
      const [año, mes, dia] = fechaInicio.split('-').map(Number);
      
      // Validar la fecha
      if (!año || !mes || !dia) {
        return res.status(400).json({ mensaje: 'Formato de fecha inválido. Use YYYY-MM-DD' });
      }

      // Crear fechaInicio y fechaFin sin modificar la hora original
      const fechaInicioConsulta = new Date(año, mes - 1, dia, 0, 0, 0, 0);
      const fechaFinConsulta = new Date(año, mes - 1, dia, 23, 59, 59, 999);

      // Usar el campo de fecha correcto para la cotización
      where.fecha = {
        [Op.between]: [fechaInicioConsulta, fechaFinConsulta]
      };
    }

    // Filtro por estado si se proporciona
    if (estado) {
      where.estado = estado;
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Si no es SuperAdmin, solo puede ver cotizaciones de su sucursal
      if (sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res.status(403).json({ mensaje: 'No tiene permisos para ver cotizaciones de otras sucursales' });
      }
      // Filtrar por sucursal del usuario
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      // Si es SuperAdmin y se especifica sucursalId, filtrar por esa sucursal
      where.sucursalId = sucursalId;
    }

    const cotizaciones = await Cotizacion.findAll({
      where,
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'numeroDocumento'] },
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Usuario, attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calcular algunos metadatos adicionales
    const totalCotizaciones = cotizaciones.length;
    const cotizacionesPorEstado = cotizaciones.reduce((acc, cotizacion) => {
      acc[cotizacion.estado] = (acc[cotizacion.estado] || 0) + 1;
      return acc;
    }, {});

    res.json({ 
      cotizaciones,
      metadatos: {
        totalCotizaciones,
        cotizacionesPorEstado,
        fechaConsultada: fechaInicio
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener cotizaciones', error: error.message });
  }
};


// Obtener una cotización por ID
exports.obtenerCotizacionPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const cotizacion = await Cotizacion.findByPk(id, {
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'numeroDocumento', 'direccion', 'telefono', 'email'] },
        { model: Sucursal, attributes: ['id', 'nombre', 'ubicacion'] },
        { model: Usuario, attributes: ['id', 'nombre', 'apellido'] },
        {
          model: DetalleCotizacion,
          include: [
            {
              model: Producto,
              attributes: ['id', 'nombre', 'codigo', 'unidadMedida']
            }
          ]
        }
      ]
    });
    if (!cotizacion) {
      return res.status(404).json({ mensaje: 'Cotización no encontrada' });
    }
    res.json({ cotizacion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la cotización', error: error.message });
  }
};

// Crear una nueva cotización
exports.crearCotizacion = async (req, res) => {
  const {
    clienteId,
    fechaEmision,
    fechaEntrega,
    tiempoValidez,
    tiempoEntrega,
    direccionEnvio,
    terminoPago,
    numeroCuenta,
    registradoPor,
    vendedor,
    cliente,
    comprobantes,
    notasDeVenta,
    pedido,
    oportunidadVenta,
    infReferencial,
    contrato,
    tipoCambio,
    moneda,
    tExportacion,
    tGratuito,
    tInafecta,
    tExonerado,
    tGravado,
    subtotal,
    igv,
    total,
    observacion,
    validezDias,
    productos,
    pagos,
    detalles
  } = req.body;
  const t = await sequelize.transaction();
  try {
    // Verificar que el usuario tenga una sucursal asignada
    if (!req.usuario.sucursalId) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'El usuario no tiene una sucursal asignada' });
    }

    // Verificar que los productos existan y estén activos
    for (const detalle of detalles) {
      const producto = await Producto.findOne({
        where: { id: detalle.productoId, estado: true }
      });
      if (!producto) {
        await t.rollback();
        return res.status(400).json({ mensaje: `El producto con ID ${detalle.productoId} no existe o está inactivo` });
      }
    }

    // Generar número de referencia único
    const fecha = new Date();
    const anio = fecha.getFullYear().toString().substr(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');

    // Obtener el último número de cotización
    const ultimaCotizacion = await Cotizacion.findOne({
      order: [['createdAt', 'DESC']]
    });
    let correlativo = 1;
    if (ultimaCotizacion) {
      const ultimoNumero = ultimaCotizacion.numeroReferencia;
      if (ultimoNumero && ultimoNumero.length >= 4) {
        correlativo = parseInt(ultimoNumero.slice(-4)) + 1;
      }
    }
    const numeroReferencia = `COT-${anio}${mes}${dia}-${correlativo.toString().padStart(4, '0')}`;

    // Crear la cotización
    const cotizacion = await Cotizacion.create({
      clienteId,
      usuarioId: req.usuario.id,
      sucursalId: req.usuario.sucursalId,
      fecha: new Date(),
      fechaEmision,
      fechaEntrega,
      tiempoValidez,
      tiempoEntrega,
      direccionEnvio,
      terminoPago,
      numeroCuenta,
      registradoPor,
      vendedor,
      cliente,
      numeroReferencia,
      comprobantes: comprobantes || '0',
      notasDeVenta: notasDeVenta || '0',
      pedido,
      oportunidadVenta,
      infReferencial,
      contrato,
      tipoCambio: tipoCambio || '3.85',
      moneda: moneda || 'SOL',
      tExportacion: tExportacion || 0.00,
      tGratuito: tGratuito || 0.00,
      tInafecta: tInafecta || 0.00,
      tExonerado: tExonerado || 0.00,
      tGravado: tGravado || 0.00,
      subtotal,
      igv,
      total,
      estado: 'Activo',
      observacion,
      validezDias: validezDias || 15,
      productos: productos || [],
      pagos: pagos || []
    }, { transaction: t });

    // Crear los detalles de la cotización
    if (detalles && detalles.length > 0) {
      const detallesCotizacion = detalles.map(detalle => ({
        cotizacionId: cotizacion.id,
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        subtotal: detalle.subtotal,
        descripcion: detalle.descripcion
      }));
      await DetalleCotizacion.bulkCreate(detallesCotizacion, { transaction: t });
    }

    await t.commit();
    res.status(201).json({
      mensaje: 'Cotización creada exitosamente',
      cotizacion: {
        id: cotizacion.id,
        numeroReferencia: cotizacion.numeroReferencia
      }
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al crear la cotización', error: error.message });
  }
};







// Actualizar el estado de una cotización
exports.actualizarEstadoCotizacion = async (req, res) => {
  const { id } = req.params;
  const { estado, observacion } = req.body;

  if (!['Activo', 'Pendiente', 'Rechazada', 'Aceptada'].includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado no válido' });
  }

  try {
    const cotizacion = await Cotizacion.findByPk(id);

    if (!cotizacion) {
      return res.status(404).json({ mensaje: 'Cotización no encontrada' });
    }

    // Actualizar el estado
    cotizacion.estado = estado;
    if (observacion) {
      cotizacion.observacion = observacion;
    }

    await cotizacion.save();

    res.json({ mensaje: 'Estado de cotización actualizado', cotizacion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el estado', error: error.message });
  }
};



// Actualizar una cotización completa
exports.actualizarCotizacion = async (req, res) => {
  const { id } = req.params;
  const {
    clienteId,
    fechaEntrega,
    registradoPor,
    vendedor,
    cliente,
    comprobantes,
    notasDeVenta,
    pedido,
    oportunidadVenta,
    infReferencial,
    contrato,
    tipoCambio,
    moneda,
    tExportacion,
    tGratuito,
    tInafecta,
    tExonerado,
    tGravado,
    subtotal,
    igv,
    total,
    estado,
    observacion,
    validezDias,
    productos,
    pagos,
    detalles
  } = req.body;

  const t = await sequelize.transaction();
  try {
    const cotizacion = await Cotizacion.findByPk(id);

    if (!cotizacion) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Cotización no encontrada' });
    }

    // Verificar permisos
    if (req.usuario.rol !== 'SuperAdmin' && cotizacion.sucursalId !== req.usuario.sucursalId) {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para actualizar esta cotización' });
    }

    // Actualizar la cotización
    await cotizacion.update({
      clienteId,
      fechaEntrega,
      registradoPor,
      vendedor,
      cliente,
      comprobantes: comprobantes || cotizacion.comprobantes,
      notasDeVenta: notasDeVenta || cotizacion.notasDeVenta,
      pedido,
      oportunidadVenta,
      infReferencial,
      contrato,
      tipoCambio: tipoCambio || cotizacion.tipoCambio,
      moneda: moneda || cotizacion.moneda,
      tExportacion: tExportacion !== undefined ? tExportacion : cotizacion.tExportacion,
      tGratuito: tGratuito !== undefined ? tGratuito : cotizacion.tGratuito,
      tInafecta: tInafecta !== undefined ? tInafecta : cotizacion.tInafecta,
      tExonerado: tExonerado !== undefined ? tExonerado : cotizacion.tExonerado,
      tGravado: tGravado !== undefined ? tGravado : cotizacion.tGravado,
      subtotal,
      igv,
      total,
      estado: estado || cotizacion.estado,
      observacion,
      validezDias: validezDias || cotizacion.validezDias,
      productos: productos || cotizacion.productos,
      pagos: pagos || cotizacion.pagos
    }, { transaction: t });

    // Si se proporcionan detalles, actualizar también los detalles
    if (detalles && detalles.length > 0) {
      // Eliminar detalles existentes
      await DetalleCotizacion.destroy({
        where: { cotizacionId: id },
        transaction: t
      });

      // Crear nuevos detalles
      const detallesCotizacion = detalles.map(detalle => ({
        cotizacionId: id,
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        subtotal: detalle.subtotal,
        descripcion: detalle.descripcion
      }));
      await DetalleCotizacion.bulkCreate(detallesCotizacion, { transaction: t });
    }

    await t.commit();
    res.json({
      mensaje: 'Cotización actualizada exitosamente',
      cotizacion: {
        id: cotizacion.id,
        numeroReferencia: cotizacion.numeroReferencia
      }
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al actualizar la cotización', error: error.message });
  }
};

// Eliminar una cotización
exports.eliminarCotizacion = async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();

  try {
    const cotizacion = await Cotizacion.findByPk(id);

    if (!cotizacion) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Cotización no encontrada' });
    }

    // Eliminar los detalles asociados
    await DetalleCotizacion.destroy({
      where: { cotizacionId: id },
      transaction: t
    });

    // Eliminar la cotización
    await cotizacion.destroy({ transaction: t });

    await t.commit();
    res.json({ mensaje: 'Cotización eliminada correctamente' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al eliminar la cotización', error: error.message });
  }
};

// Generar PDF de una cotización
exports.generarPDFCotizacion = async (req, res) => {
  const { id } = req.params;
  try {
    const cotizacion = await Cotizacion.findByPk(id, {
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'numeroDocumento', 'direccion', 'telefono', 'email'] },
        { model: Sucursal, attributes: ['id', 'nombre', 'razonSocial', 'ruc', 'ubicacion', 'direccion', 'ubigeo'] },
        { model: Usuario, attributes: ['id', 'nombre', 'apellido'] },
        {
          model: DetalleCotizacion,
          include: [
            { model: Producto, attributes: ['id', 'nombre', 'codigo', 'unidadMedida'] }
          ]
        }
      ]
    });

    if (!cotizacion) {
      return res.status(404).json({ mensaje: 'Cotización no encontrada' });
    }

    const PDFDocument = require('pdfkit');
    const formato = (req.query.formato || 'A4').toLowerCase();

    // Formato Ticket / 80mm
    if (formato === 'ticket' || formato === '80mm') {
      const doc = new PDFDocument({ margin: 15, size: [226, 700] }); // 80mm de ancho

      const fileName = `cotizacion-ticket-${cotizacion.numeroReferencia || cotizacion.id}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

      // Pipe hacia la respuesta HTTP
      doc.pipe(res);

      const primaryColor = '#000000';
      let y = 15;

      // Encabezado empresa
      doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold');
      doc.text(cotizacion.Sucursal?.razonSocial || cotizacion.Sucursal?.nombre || 'EMPRESA', 10, y, {
        width: 206,
        align: 'center'
      });
      y += 16;
      doc.font('Helvetica').fontSize(9);
      doc.text(`RUC ${cotizacion.Sucursal?.ruc || ''}`, 10, y, { width: 206, align: 'center' });
      y += 14;
      doc.text(cotizacion.Sucursal?.direccion || cotizacion.Sucursal?.ubicacion || '', 10, y, { width: 206, align: 'center' });
      y += 18;

      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('COTIZACIÓN', 10, y, { width: 206, align: 'center' });
      y += 14;
      doc.font('Helvetica').fontSize(9);
      doc.text(`N° ${cotizacion.numeroReferencia || cotizacion.id}`, 10, y, { width: 206, align: 'center' });
      y += 14;
      doc.text(`Fecha: ${new Date(cotizacion.fecha || cotizacion.createdAt).toLocaleDateString('es-PE')}`, 10, y, { width: 206, align: 'center' });
      y += 16;

      // Datos del cliente
      doc.font('Helvetica-Bold').fontSize(9).text('Cliente:', 10, y);
      doc.font('Helvetica').fontSize(9).text(cotizacion.Cliente?.nombre || cotizacion.cliente || '', 60, y, { width: 156 });
      y += 12;
      doc.font('Helvetica-Bold').text('Doc:', 10, y);
      doc.font('Helvetica').text(cotizacion.Cliente?.numeroDocumento || '', 60, y);
      y += 12;
      if (cotizacion.Cliente?.direccion) {
        doc.font('Helvetica-Bold').text('Dir:', 10, y);
        doc.font('Helvetica').text(cotizacion.Cliente.direccion, 60, y, { width: 156 });
        y += 12;
      }

      // Separador
      doc.moveTo(10, y).lineTo(216, y).stroke();
      y += 8;

      // Items
      doc.font('Helvetica-Bold').text('Detalle', 10, y);
      y += 12;
      doc.font('Helvetica').fontSize(9);
      let subtotalCalc = 0;
      (cotizacion.DetalleCotizacions || cotizacion.DetalleCotizacion || []).forEach((det) => {
        const cantidad = Number(det.cantidad || 1);
        const precio = Number(det.precioUnitario || 0);
        const descripcion = (det.Producto?.nombre || det.descripcion || '').slice(0, 28);
        doc.text(`${cantidad} x ${descripcion}`, 10, y, { width: 150 });
        doc.text(`S/ ${(cantidad * precio).toFixed(2)}`, 160, y, { width: 56, align: 'right' });
        y += 12;
        subtotalCalc += cantidad * precio;
      });

      const igvCalc = +(subtotalCalc * 0.18).toFixed(2);
      const totalCalc = +(subtotalCalc + igvCalc).toFixed(2);

      // Separador y totales
      doc.moveTo(10, y).lineTo(216, y).stroke();
      y += 8;
      doc.font('Helvetica-Bold').text('Subtotal', 10, y);
      doc.font('Helvetica').text(`S/ ${subtotalCalc.toFixed(2)}`, 120, y, { width: 96, align: 'right' });
      y += 12;
      doc.font('Helvetica-Bold').text('IGV (18%)', 10, y);
      doc.font('Helvetica').text(`S/ ${igvCalc.toFixed(2)}`, 120, y, { width: 96, align: 'right' });
      y += 12;
      doc.font('Helvetica-Bold').text('TOTAL', 10, y);
      doc.font('Helvetica-Bold').text(`S/ ${totalCalc.toFixed(2)}`, 120, y, { width: 96, align: 'right' });
      y += 14;

      // Pie
      doc.font('Helvetica').fontSize(8).text('Representación impresa de la COTIZACIÓN', 10, y, { width: 206, align: 'center' });
      y += 12;
      doc.text('Gracias por su preferencia', 10, y, { width: 206, align: 'center' });

      doc.end();
      return; // ya enviamos la respuesta
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    // Configurar cabeceras para visualización en el navegador
    const fileName = `cotizacion-${cotizacion.numeroReferencia || cotizacion.id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    // Pipe hacia la respuesta HTTP
    doc.pipe(res);

    const primaryColor = '#000000';
    const headerColor = '#8B0000';
    let currentY = 30;

    // Encabezado: Datos de la empresa
    doc
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(cotizacion.Sucursal?.razonSocial || cotizacion.Sucursal?.nombre || 'EMPRESA', 30, currentY, {
        width: 350,
        align: 'left'
      });

    doc
      .font('Helvetica')
      .fontSize(10)
      .text(`RUC ${cotizacion.Sucursal?.ruc || ''}`, 30, currentY + 20)
      .text(cotizacion.Sucursal?.direccion || cotizacion.Sucursal?.ubicacion || '', 30, currentY + 35, { width: 350 });

    // Caja del tipo de documento a la derecha
    doc
      .rect(420, currentY, 150, 60)
      .strokeColor(headerColor)
      .lineWidth(1.2)
      .stroke();
    doc
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('COTIZACIÓN', 420, currentY + 10, { width: 150, align: 'center' });
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(cotizacion.numeroReferencia || `ID ${cotizacion.id}`, 420, currentY + 30, { width: 150, align: 'center' });

    currentY += 90;

    // Datos del cliente y cotización
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('Cliente:', 30, currentY);
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(
        `${cotizacion.Cliente?.nombre || cotizacion.cliente || ''} - ${cotizacion.Cliente?.numeroDocumento || ''}`,
        90,
        currentY
      );

    currentY += 16;
    doc.font('Helvetica-Bold').text('Fecha:', 30, currentY);
    doc.font('Helvetica').text(new Date(cotizacion.fecha || cotizacion.createdAt).toLocaleDateString('es-PE'), 90, currentY);

    currentY += 16;
    doc.font('Helvetica-Bold').text('Moneda:', 30, currentY);
    doc.font('Helvetica').text(cotizacion.moneda || 'PEN', 90, currentY);

    currentY += 24;

    // Tabla de detalles
    const tableTop = currentY;
    const colX = [30, 120, 350, 420, 500];
    const colTitles = ['Código', 'Descripción', 'Cant.', 'PU', 'Importe'];

    doc.font('Helvetica-Bold').fontSize(10);
    colTitles.forEach((t, i) => {
      doc.text(t, colX[i], tableTop);
    });

    doc.moveTo(30, tableTop + 14).lineTo(570, tableTop + 14).strokeColor(primaryColor).lineWidth(0.8).stroke();

    let y = tableTop + 22;
    doc.font('Helvetica').fontSize(9);
    (cotizacion.DetalleCotizacions || cotizacion.DetalleCotizacion || []).forEach((det) => {
      const codigo = det.Producto?.codigo || det.Producto?.id || det.productoId;
      const descripcion = det.descripcion || det.Producto?.nombre || '';
      const cantidad = Number(det.cantidad || 0).toFixed(2);
      const precio = Number(det.precioUnitario || 0).toFixed(2);
      const importe = Number(det.subtotal || (det.cantidad * det.precioUnitario)).toFixed(2);

      doc.text(String(codigo || ''), colX[0], y, { width: 80 });
      doc.text(String(descripcion || ''), colX[1], y, { width: 220 });
      doc.text(String(cantidad), colX[2], y, { width: 50, align: 'right' });
      doc.text(String(precio), colX[3], y, { width: 60, align: 'right' });
      doc.text(String(importe), colX[4], y, { width: 60, align: 'right' });

      y += 16;
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });

    // Totales (si existen)
    y += 10;
    const subtotal = Number(cotizacion.subtotal || 0).toFixed(2);
    const igv = Number(cotizacion.igv || 0).toFixed(2);
    const total = Number(cotizacion.total || 0).toFixed(2);

    const totalsX = 420;
    doc.font('Helvetica-Bold').fontSize(10).text('Importe bruto', totalsX, y);
    doc.font('Helvetica').text(`S/ ${subtotal}`, totalsX + 120, y, { align: 'right', width: 80 });
    y += 14;
    doc.font('Helvetica-Bold').text('IGV (18%)', totalsX, y);
    doc.font('Helvetica').text(`S/ ${igv}`, totalsX + 120, y, { align: 'right', width: 80 });
    y += 14;
    doc.font('Helvetica-Bold').text('Total precio', totalsX, y);
    doc.font('Helvetica').text(`S/ ${total}`, totalsX + 120, y, { align: 'right', width: 80 });

    y += 24;
    doc.fillColor(primaryColor).font('Helvetica').fontSize(8).text(
      'Representación impresa de la COTIZACIÓN',
      30,
      y,
      { width: 500, align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF de cotización:', error);
    res.status(500).json({ mensaje: 'Error al generar PDF de la cotización', error: error.message });
  }
};