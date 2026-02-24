const sequelize = require('../config/database');

// Importar todos los modelos PRIMERO
const Usuario = require('./Usuario');
const Sucursal = require('./Sucursal');
const Categoria = require('./Categoria');
const Producto = require('./Producto');
const Presentacion = require('./Presentacion');
const Inventario = require('./Inventario');
const MovimientoInventario = require('./MovimientoInventario');
const Cliente = require('./Cliente');
const Conductor = require('./Conductor');
const Proveedor = require('./Proveedor');
const Compra = require('./Compra');
const DetalleCompra = require('./DetalleCompra');
const PagoCompra = require('./PagoCompra');
const Venta = require('./Venta');
const DetalleVenta = require('./DetalleVenta');
// Productos compuestos (packs/promociones)
const ProductoCompuesto = require('./ProductoCompuesto');
const ProductoCompuestoItem = require('./ProductoCompuestoItem');
// Nuevos modelos
const Cotizacion = require('./Cotizacion');
const DetalleCotizacion = require('./DetalleCotizacion');
const NotaVenta = require('./NotaVenta');
const DetalleNotaVenta = require('./DetalleNotaVenta');
// Pedidos
const Pedido = require('./Pedido');
const DetallePedido = require('./DetallePedido');
// Modelo de Caja Nuevos modelos
const Caja = require('./Caja');
const Taller = require('./Taller');
const Operario = require('./Operario');
const Planilla = require('./Planilla');
// Gastos Diversos
const GastoDiverso = require('./GastoDiverso');
const DetalleGastoDiverso = require('./DetalleGastoDiverso');
const MetodoGastoDiverso = require('./MetodoGastoDiverso');
// Modelos de Contabilidad
const PlanCuentas = require('./PlanCuentas');
const AsientoContable = require('./AsientoContable');
const DetalleAsiento = require('./DetalleAsiento');
const LibroMayor = require('./LibroMayor');
const CuentasPorCobrar = require('./CuentasPorCobrar');
const Configuracion = require('./Configuracion');
// Modelos de Configuración SUNAT y WhatsApp
const ConfiguracionSunat = require('./ConfiguracionSunat');
const ConfiguracionWhatsapp = require('./ConfiguracionWhatsapp');
// Modelos de Almacén
const Almacen = require('./Almacen');
const InventarioAlmacen = require('./InventarioAlmacen');
const LiquidacionCompra = require('./LiquidacionCompra');
const Servicio = require('./Servicio');
const Marca = require('./Marca');
const Serie = require('./Serie');
const Lote = require('./Lote');


const GuiaRemision = require('./GuiaRemision');
const DetalleGuiaRemision = require('./DetalleGuiaRemision');
// Modelos de Transporte
const Vehiculo = require('./Vehiculo');
const Transportista = require('./Transportista');
const PagadorFlete = require('./PagadorFlete'); 
const Remitente = require('./Remitente');
const DireccionPartida = require('./DireccionPartida');
//const ActivoFijo = require('./ActivoFijo');


// Función para definir todas las relaciones
function defineRelaciones() {
  // Relaciones de Usuario
  Usuario.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(Usuario, { foreignKey: 'sucursalId' });
  

  // Relaciones de Producto
  Producto.belongsTo(Categoria, { foreignKey: 'categoriaId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
  Categoria.hasMany(Producto, { foreignKey: 'categoriaId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

  Producto.belongsTo(Sucursal, { foreignKey: 'sucursalId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
  Sucursal.hasMany(Producto, { foreignKey: 'sucursalId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

  Producto.hasMany(Presentacion, { foreignKey: 'productoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  Presentacion.belongsTo(Producto, { foreignKey: 'productoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

  // Relaciones de Servicio (sin inventario ni presentaciones)
  Servicio.belongsTo(Categoria, { foreignKey: 'categoriaId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
  Categoria.hasMany(Servicio, { foreignKey: 'categoriaId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

  Servicio.belongsTo(Sucursal, { foreignKey: 'sucursalId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
  Sucursal.hasMany(Servicio, { foreignKey: 'sucursalId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

  // Relaciones de Producto Compuesto
  ProductoCompuesto.belongsTo(Categoria, { foreignKey: 'categoriaId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
  Categoria.hasMany(ProductoCompuesto, { foreignKey: 'categoriaId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

  ProductoCompuesto.belongsTo(Sucursal, { foreignKey: 'sucursalId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
  Sucursal.hasMany(ProductoCompuesto, { foreignKey: 'sucursalId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

  ProductoCompuesto.hasMany(ProductoCompuestoItem, { foreignKey: 'productoCompuestoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  ProductoCompuestoItem.belongsTo(ProductoCompuesto, { foreignKey: 'productoCompuestoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

  ProductoCompuestoItem.belongsTo(Producto, { foreignKey: 'productoId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  Producto.hasMany(ProductoCompuestoItem, { foreignKey: 'productoId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

  // Relaciones de Inventario
  Inventario.belongsTo(Producto, { foreignKey: 'productoId' });
  Producto.hasMany(Inventario, { foreignKey: 'productoId' });

  Inventario.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(Inventario, { foreignKey: 'sucursalId' });

  // Relaciones de Lote
  Lote.belongsTo(Producto, { foreignKey: 'productoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  Producto.hasMany(Lote, { foreignKey: 'productoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

  Lote.belongsTo(Almacen, { foreignKey: 'almacenId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  Almacen.hasMany(Lote, { foreignKey: 'almacenId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

  // Relaciones de MovimientoInventario
  MovimientoInventario.belongsTo(Producto, { foreignKey: 'productoId' });
  Producto.hasMany(MovimientoInventario, { foreignKey: 'productoId' });

  MovimientoInventario.belongsTo(Sucursal, { as: 'SucursalOrigen', foreignKey: 'sucursalOrigenId' });
  Sucursal.hasMany(MovimientoInventario, { as: 'MovimientosOrigen', foreignKey: 'sucursalOrigenId' });

  MovimientoInventario.belongsTo(Sucursal, { as: 'SucursalDestino', foreignKey: 'sucursalDestinoId' });
  Sucursal.hasMany(MovimientoInventario, { as: 'MovimientosDestino', foreignKey: 'sucursalDestinoId' });

  MovimientoInventario.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  Usuario.hasMany(MovimientoInventario, { foreignKey: 'usuarioId' });

  MovimientoInventario.belongsTo(Usuario, { as: 'AutorizadoPor', foreignKey: 'autorizadoPorId' });
  Usuario.hasMany(MovimientoInventario, { as: 'MovimientosAutorizados', foreignKey: 'autorizadoPorId' });

  // Relaciones de Almacén
  Almacen.belongsTo(Sucursal, { foreignKey: 'sucursalId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  Sucursal.hasMany(Almacen, { foreignKey: 'sucursalId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

  // Relaciones de InventarioAlmacen
  InventarioAlmacen.belongsTo(Producto, { foreignKey: 'productoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  Producto.hasMany(InventarioAlmacen, { foreignKey: 'productoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

  InventarioAlmacen.belongsTo(Almacen, { foreignKey: 'almacenId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  Almacen.hasMany(InventarioAlmacen, { foreignKey: 'almacenId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });


  // Relaciones de Compra
  Compra.belongsTo(Proveedor, { foreignKey: 'proveedorId' });
  Proveedor.hasMany(Compra, { foreignKey: 'proveedorId' });

  // Relaciones de LiquidacionCompra
  LiquidacionCompra.belongsTo(Proveedor, { foreignKey: 'proveedorId' });
  Proveedor.hasMany(LiquidacionCompra, { foreignKey: 'proveedorId' });

  Compra.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(Compra, { foreignKey: 'sucursalId' });

  Compra.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  Usuario.hasMany(Compra, { foreignKey: 'usuarioId' });

  Compra.hasMany(DetalleCompra, { foreignKey: 'compraId' });
  DetalleCompra.belongsTo(Compra, { foreignKey: 'compraId' });

  DetalleCompra.belongsTo(Producto, { foreignKey: 'productoId' });
  Producto.hasMany(DetalleCompra, { foreignKey: 'productoId' });

  // Relaciones de PagoCompra
  Compra.hasMany(PagoCompra, { foreignKey: 'compraId' });
  PagoCompra.belongsTo(Compra, { foreignKey: 'compraId' });

 
  // Relaciones de Venta
  Venta.belongsTo(Cliente, { foreignKey: 'clienteId' });
  Cliente.hasMany(Venta, { foreignKey: 'clienteId' });

  Venta.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(Venta, { foreignKey: 'sucursalId' });

  Venta.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  Usuario.hasMany(Venta, { foreignKey: 'usuarioId' });

  Venta.belongsTo(Usuario, { as: 'UsuarioAnulacion', foreignKey: 'usuarioAnulacionId' });
  Usuario.hasMany(Venta, { as: 'VentasAnuladas', foreignKey: 'usuarioAnulacionId' });

  Venta.hasMany(DetalleVenta, { foreignKey: 'ventaId' });
  DetalleVenta.belongsTo(Venta, { foreignKey: 'ventaId' });

  DetalleVenta.belongsTo(Producto, { foreignKey: 'productoId' });
  Producto.hasMany(DetalleVenta, { foreignKey: 'productoId' });

  DetalleVenta.belongsTo(Presentacion, { foreignKey: 'presentacionId' });
  Presentacion.hasMany(DetalleVenta, { foreignKey: 'presentacionId' });

  // Relaciones de Cotizacion
  Cotizacion.belongsTo(Cliente, { foreignKey: 'clienteId' });
  Cliente.hasMany(Cotizacion, { foreignKey: 'clienteId' });

  Cotizacion.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  Usuario.hasMany(Cotizacion, { foreignKey: 'usuarioId' });

  Cotizacion.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(Cotizacion, { foreignKey: 'sucursalId' });

  Cotizacion.hasMany(DetalleCotizacion, { foreignKey: 'cotizacionId' });
  DetalleCotizacion.belongsTo(Cotizacion, { foreignKey: 'cotizacionId' });

  DetalleCotizacion.belongsTo(Producto, { foreignKey: 'productoId' });
  Producto.hasMany(DetalleCotizacion, { foreignKey: 'productoId' });

  


  // Relaciones de NotaVenta
  NotaVenta.belongsTo(Cliente, { foreignKey: 'clienteId' });
  Cliente.hasMany(NotaVenta, { foreignKey: 'clienteId' });

  NotaVenta.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  Usuario.hasMany(NotaVenta, { foreignKey: 'usuarioId' });

  NotaVenta.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(NotaVenta, { foreignKey: 'sucursalId' });

  NotaVenta.belongsTo(Usuario, { as: 'UsuarioAnulacion', foreignKey: 'usuarioAnulacionId' });
  Usuario.hasMany(NotaVenta, { as: 'NotasVentaAnuladas', foreignKey: 'usuarioAnulacionId' });

  NotaVenta.hasMany(DetalleNotaVenta, { foreignKey: 'notaVentaId' });
  DetalleNotaVenta.belongsTo(NotaVenta, { foreignKey: 'notaVentaId' });

  DetalleNotaVenta.belongsTo(Producto, { foreignKey: 'productoId' });
  Producto.hasMany(DetalleNotaVenta, { foreignKey: 'productoId' });

  // Relaciones de Pedido
  Pedido.belongsTo(Cliente, { foreignKey: 'clienteId' });
  Cliente.hasMany(Pedido, { foreignKey: 'clienteId' });

  Pedido.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(Pedido, { foreignKey: 'sucursalId' });

  Pedido.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  Usuario.hasMany(Pedido, { foreignKey: 'usuarioId' });

  Pedido.hasMany(DetallePedido, { foreignKey: 'pedidoId' });
  DetallePedido.belongsTo(Pedido, { foreignKey: 'pedidoId' });

  DetallePedido.belongsTo(Producto, { foreignKey: 'productoId' });
  Producto.hasMany(DetallePedido, { foreignKey: 'productoId' });
  
  // Relaciones de Gastos Diversos
  GastoDiverso.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(GastoDiverso, { foreignKey: 'sucursalId' });

  GastoDiverso.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  Usuario.hasMany(GastoDiverso, { foreignKey: 'usuarioId' });

  GastoDiverso.belongsTo(Proveedor, { foreignKey: 'proveedorId' });
  Proveedor.hasMany(GastoDiverso, { foreignKey: 'proveedorId' });

  GastoDiverso.hasMany(DetalleGastoDiverso, { foreignKey: 'gastoDiversoId' });
  DetalleGastoDiverso.belongsTo(GastoDiverso, { foreignKey: 'gastoDiversoId' });

  GastoDiverso.hasMany(MetodoGastoDiverso, { foreignKey: 'gastoDiversoId' });
  MetodoGastoDiverso.belongsTo(GastoDiverso, { foreignKey: 'gastoDiversoId' });


// Relaciones de Caja
 Caja.belongsTo(Usuario, { foreignKey: 'usuarioId' });
 Usuario.hasMany(Caja, { foreignKey: 'usuarioId' }); 
 // Relación entre Sucursal y Caja
  Caja.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(Caja, { foreignKey: 'sucursalId' });
// Relación entre Usuario y Caja
Caja.belongsTo(Usuario, { foreignKey: 'usuarioId' }); 
Usuario.hasMany(Caja, { foreignKey: 'usuarioId' });


// Relaciones de Taller
  Taller.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });
  Cliente.hasMany(Taller, { foreignKey: 'clienteId', as: 'talleres' }); 


// Asociación entre Taller y Usuario
  Taller.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
  Usuario.hasMany(Taller, { foreignKey: 'usuarioId', as: 'talleres' });

  Taller.belongsTo(Operario, { foreignKey: 'operarioId', as: 'operarioAsignado' });
  Operario.hasMany(Taller, { foreignKey: 'operarioId', as: 'talleres' });

// Relaciones entre Taller y Venta
  Taller.hasMany(Venta, { foreignKey: 'tallerId', as: 'ventas' });
  Venta.belongsTo(Taller, { foreignKey: 'tallerId', as: 'taller' });

// Relaciones de Contabilidad
  // Plan de Cuentas - Relación jerárquica
  PlanCuentas.belongsTo(PlanCuentas, { as: 'CuentaPadre', foreignKey: 'cuentaPadreId' });
  PlanCuentas.hasMany(PlanCuentas, { as: 'CuentasHijas', foreignKey: 'cuentaPadreId' });

  // Asiento Contable
  AsientoContable.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(AsientoContable, { foreignKey: 'sucursalId' });

  AsientoContable.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  Usuario.hasMany(AsientoContable, { foreignKey: 'usuarioId' });

  AsientoContable.belongsTo(Venta, { foreignKey: 'ventaId' });
  Venta.hasMany(AsientoContable, { foreignKey: 'ventaId' });

  AsientoContable.belongsTo(Compra, { foreignKey: 'compraId' });
  Compra.hasMany(AsientoContable, { foreignKey: 'compraId' });

  AsientoContable.belongsTo(Caja, { foreignKey: 'cajaId' });
  Caja.hasMany(AsientoContable, { foreignKey: 'cajaId' });

  // Detalle Asiento
  DetalleAsiento.belongsTo(AsientoContable, { foreignKey: 'asientoContableId' });
  AsientoContable.hasMany(DetalleAsiento, { foreignKey: 'asientoContableId' });

  DetalleAsiento.belongsTo(PlanCuentas, { foreignKey: 'planCuentasId' });
  PlanCuentas.hasMany(DetalleAsiento, { foreignKey: 'planCuentasId' });

  DetalleAsiento.belongsTo(Cliente, { foreignKey: 'clienteId' });
  Cliente.hasMany(DetalleAsiento, { foreignKey: 'clienteId' });

  DetalleAsiento.belongsTo(Proveedor, { foreignKey: 'proveedorId' });
  Proveedor.hasMany(DetalleAsiento, { foreignKey: 'proveedorId' });

  // Libro Mayor
  LibroMayor.belongsTo(PlanCuentas, { foreignKey: 'planCuentasId' });
  PlanCuentas.hasMany(LibroMayor, { foreignKey: 'planCuentasId' });

  LibroMayor.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(LibroMayor, { foreignKey: 'sucursalId' });

  // Cuentas por Cobrar
  CuentasPorCobrar.belongsTo(Cliente, { foreignKey: 'clienteId' });
  Cliente.hasMany(CuentasPorCobrar, { foreignKey: 'clienteId' });

  CuentasPorCobrar.belongsTo(Venta, { foreignKey: 'ventaId' });
  Venta.hasMany(CuentasPorCobrar, { foreignKey: 'ventaId' });

  CuentasPorCobrar.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(CuentasPorCobrar, { foreignKey: 'sucursalId' });

  // Relaciones de Configuración SUNAT
  ConfiguracionSunat.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  Usuario.hasMany(ConfiguracionSunat, { foreignKey: 'usuarioId' });

  ConfiguracionSunat.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(ConfiguracionSunat, { foreignKey: 'sucursalId' });

  // Relaciones de Configuración WhatsApp
  ConfiguracionWhatsapp.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  Usuario.hasMany(ConfiguracionWhatsapp, { foreignKey: 'usuarioId' });

  ConfiguracionWhatsapp.belongsTo(Sucursal, { foreignKey: 'sucursalId' });
  Sucursal.hasMany(ConfiguracionWhatsapp, { foreignKey: 'sucursalId' });











  



  // Relaciones de GuiaRemision 
  GuiaRemision.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });
  Cliente.hasMany(GuiaRemision, { foreignKey: 'clienteId' });

  GuiaRemision.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
  Usuario.hasMany(GuiaRemision, { foreignKey: 'usuarioId' });

  GuiaRemision.belongsTo(Sucursal, { foreignKey: 'sucursalId', as: 'sucursal' });
  Sucursal.hasMany(GuiaRemision, { foreignKey: 'sucursalId' });

  GuiaRemision.belongsTo(Venta, { foreignKey: 'ventaId', as: 'venta' });
  Venta.hasMany(GuiaRemision, { foreignKey: 'ventaId' });

  GuiaRemision.hasMany(DetalleGuiaRemision, { foreignKey: 'guiaId', as: 'detalles' });
  DetalleGuiaRemision.belongsTo(GuiaRemision, { foreignKey: 'guiaId', as: 'guia' });

  DetalleGuiaRemision.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });
  Producto.hasMany(DetalleGuiaRemision, { foreignKey: 'productoId' });

  DetalleGuiaRemision.belongsTo(Presentacion, { foreignKey: 'presentacionId', as: 'presentacion' }); 
  Presentacion.hasMany(DetalleGuiaRemision, { foreignKey: 'presentacionId' }); 

  // Relaciones de Series (Serie de producto)
  Serie.belongsTo(Producto, { foreignKey: 'productoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  Producto.hasMany(Serie, { foreignKey: 'productoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

  // Relaciones de Remitente
  Remitente.belongsTo(Sucursal, { foreignKey: 'sucursalId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
  Sucursal.hasMany(Remitente, { foreignKey: 'sucursalId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

  // Relaciones de ActivoFijo
  //ActivoFijo.belongsTo(Sucursal, { foreignKey: 'sucursalId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
  //Sucursal.hasMany(ActivoFijo, { foreignKey: 'sucursalId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

}

// Ejecutar la definición de relaciones
defineRelaciones();

// Exportar modelos y sequelize
module.exports = {
  sequelize,
  Usuario,
  Sucursal,
  Categoria,
  Producto,
  Servicio,
  Marca,
  Serie,
  Lote,
  Presentacion,
  Inventario,
  MovimientoInventario,
  Cliente,
  Conductor,
  Proveedor,
  Compra,
  DetalleCompra,
  PagoCompra,
  Venta,
  DetalleVenta,
  // Productos compuestos
  ProductoCompuesto,
  ProductoCompuestoItem,
  // Gastos Diversos
  GastoDiverso,
  DetalleGastoDiverso,
  MetodoGastoDiverso,
  // Nuevos modelos
  Cotizacion,
  DetalleCotizacion,
  NotaVenta,
  DetalleNotaVenta,
  Caja, 
  Taller,
  Operario,
  Planilla,
  // Modelos de Contabilidad
  PlanCuentas,
  AsientoContable,
  DetalleAsiento,
  LibroMayor,
  CuentasPorCobrar,
  Configuracion,
  // Modelos de Configuración SUNAT y WhatsApp
  ConfiguracionSunat,
  ConfiguracionWhatsapp,
  // Modelos de Almacén
  Almacen,
  InventarioAlmacen,
  // Modelos de Guía de Remisión
  GuiaRemision,
  DetalleGuiaRemision,
  // Modelos de Transporte
  Vehiculo,
  Transportista,
  PagadorFlete,
  Remitente,
  DireccionPartida,
  LiquidacionCompra,
  // Pedidos
  Pedido,
  DetallePedido,
  //ActivoFijo
};