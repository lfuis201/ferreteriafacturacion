const { Producto, Inventario, MovimientoInventario, DetalleCompra, Compra } = require('../models');
const sequelize = require('../config/database');

/**
 * Servicio para manejar actualizaciones automáticas de inventario
 * cuando se procesan compras desde XML
 */
class InventarioAutoService {
  /**
   * Procesa automáticamente el inventario basado en los datos del XML de compra
   * @param {Object} datosComprobante - Datos extraídos del XML
   * @param {number} compraId - ID de la compra
   * @param {number} sucursalId - ID de la sucursal
   * @param {number} usuarioId - ID del usuario que procesa
   * @param {Object} transaction - Transacción de base de datos (opcional)
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async procesarInventarioDesdeXml(datosComprobante, compraId, sucursalId, usuarioId, transaction = null) {
    const t = transaction || await sequelize.transaction();
    const shouldCommit = !transaction; // Solo hacer commit si creamos la transacción
    
    try {
      const resultados = {
        productosCreados: [],
        productosActualizados: [],
        inventariosActualizados: [],
        movimientosCreados: [],
        errores: []
      };

      // Procesar cada item del XML
      for (const item of datosComprobante.items) {
        try {
          // 1. Crear o actualizar producto
          const resultadoProducto = await this.crearOActualizarProducto(item, t);
          if (resultadoProducto.creado) {
            resultados.productosCreados.push(resultadoProducto.producto);
          } else {
            resultados.productosActualizados.push(resultadoProducto.producto);
          }

          // 2. Crear detalle de compra
          await this.crearDetalleCompra(compraId, resultadoProducto.producto.id, item, t);

          // 3. Actualizar inventario
          const resultadoInventario = await this.actualizarInventario(
            resultadoProducto.producto.id, 
            sucursalId, 
            item.cantidad, 
            item.precioUnitario, 
            t
          );
          resultados.inventariosActualizados.push(resultadoInventario);

          // 4. Registrar movimiento de inventario
          const movimiento = await this.registrarMovimientoInventario(
            resultadoProducto.producto.id,
            sucursalId,
            item.cantidad,
            item.precioUnitario,
            compraId,
            usuarioId,
            t
          );
          resultados.movimientosCreados.push(movimiento);

        } catch (error) {
          resultados.errores.push({
            item: item.codigo || item.descripcion,
            error: error.message
          });
        }
      }

      if (shouldCommit) {
        await t.commit();
      }
      return {
        exito: true,
        resultados
      };

    } catch (error) {
      if (shouldCommit) {
        await t.rollback();
      }
      throw new Error(`Error procesando inventario automático: ${error.message}`);
    }
  }

  /**
   * Crea o actualiza un producto basado en los datos del XML
   * @param {Object} item - Item del XML
   * @param {Object} transaction - Transacción de base de datos
   * @returns {Promise<Object>} Producto creado o actualizado
   */
  async crearOActualizarProducto(item, transaction) {
    // Generar código automático si no existe
    const codigoProducto = item.codigo || `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Buscar producto existente por código o por descripción si no hay código
    let producto;
    if (item.codigo) {
      producto = await Producto.findOne({
        where: { codigo: item.codigo },
        transaction
      });
    } else {
      // Si no hay código, buscar por descripción similar
      const { Op } = require('sequelize');
      producto = await Producto.findOne({
        where: {
          descripcion: {
            [Op.like]: `%${item.descripcion}%`
          }
        },
        transaction
      });
    }

    if (producto) {
      // Actualizar producto existente si es necesario
      const actualizaciones = {};
      if (!producto.descripcion && item.descripcion) {
        actualizaciones.descripcion = item.descripcion;
      }
      if (item.precioUnitario > 0) {
        actualizaciones.precioCompra = item.precioUnitario;
        // Calcular precio de venta con margen del 30% si no existe
        if (!producto.precioVenta || producto.precioVenta === 0) {
          actualizaciones.precioVenta = (item.precioUnitario * 1.3).toFixed(2);
        }
      }

      if (Object.keys(actualizaciones).length > 0) {
        await producto.update(actualizaciones, { transaction });
      }

      return { producto, creado: false };
    } else {
      // Crear nuevo producto
      const nuevoProducto = await Producto.create({
        nombre: item.descripcion || `Producto ${codigoProducto}`,
        codigo: codigoProducto,
        descripcion: item.descripcion,
        precioCompra: item.precioUnitario || 0,
        precioVenta: item.precioUnitario ? (item.precioUnitario * 1.3).toFixed(2) : 0,
        unidadMedida: 'unidad',
        codigoBarras: null,
        tipodeAfectacion: 'Gravado_Operación_Onerosa',
        modelo: null,
        marca: null,
        origen: 'Nacional',
        codigosunat: null,
        codigoprovedorOEM: null,
        codigoCompetencia: null,
        rangoAnos: null,
        observaciones: 'Producto creado automáticamente desde XML de compra',
        categoriaId: 1, // Categoría por defecto
        iscActivo: 0,
        tipoAplicacionISC: null,
        sujetoDetraccion: 0
      }, { transaction });

      return { producto: nuevoProducto, creado: true };
    }
  }

  /**
   * Crea el detalle de compra
   * @param {number} compraId - ID de la compra
   * @param {number} productoId - ID del producto
   * @param {Object} item - Item del XML
   * @param {Object} transaction - Transacción de base de datos
   * @returns {Promise<Object>} Detalle de compra creado
   */
  async crearDetalleCompra(compraId, productoId, item, transaction) {
    return await DetalleCompra.create({
      compraId,
      productoId,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.valorVenta
    }, { transaction });
  }

  /**
   * Actualiza el inventario del producto en la sucursal
   * @param {number} productoId - ID del producto
   * @param {number} sucursalId - ID de la sucursal
   * @param {number} cantidad - Cantidad a agregar
   * @param {number} precioUnitario - Precio unitario
   * @param {Object} transaction - Transacción de base de datos
   * @returns {Promise<Object>} Inventario actualizado
   */
  async actualizarInventario(productoId, sucursalId, cantidad, precioUnitario, transaction) {
    // Buscar inventario existente
    let inventario = await Inventario.findOne({
      where: { productoId, sucursalId },
      transaction
    });

    if (inventario) {
      // Actualizar stock existente
      await inventario.update({
        stock: inventario.stock + cantidad,
        precioVenta: precioUnitario ? (precioUnitario * 1.3).toFixed(2) : inventario.precioVenta
      }, { transaction });
    } else {
      // Crear nuevo registro de inventario
      inventario = await Inventario.create({
        productoId,
        sucursalId,
        stock: cantidad,
        stockMinimo: 5, // Stock mínimo por defecto
        precioVenta: precioUnitario ? (precioUnitario * 1.3).toFixed(2) : 0
      }, { transaction });
    }

    return inventario;
  }

  /**
   * Registra el movimiento de inventario
   * @param {number} productoId - ID del producto
   * @param {number} sucursalId - ID de la sucursal
   * @param {number} cantidad - Cantidad del movimiento
   * @param {number} precioUnitario - Precio unitario
   * @param {number} compraId - ID de la compra
   * @param {number} usuarioId - ID del usuario
   * @param {Object} transaction - Transacción de base de datos
   * @returns {Promise<Object>} Movimiento creado
   */
  async registrarMovimientoInventario(productoId, sucursalId, cantidad, precioUnitario, compraId, usuarioId, transaction) {
    return await MovimientoInventario.create({
      productoId,
      sucursalOrigenId: sucursalId,
      sucursalDestinoId: sucursalId,
      tipoMovimiento: 'ENTRADA',
      cantidad,
      precioUnitario,
      documentoRelacionadoTipo: 'COMPRA',
      documentoRelacionadoId: compraId,
      usuarioId,
      observacion: `Entrada automática por procesamiento de XML de compra #${compraId}`,
      autorizado: true,
      autorizadoPorId: usuarioId
    }, { transaction });
  }
}

module.exports = new InventarioAutoService();