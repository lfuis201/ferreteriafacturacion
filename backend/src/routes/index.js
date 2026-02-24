// routes/index.js
const express = require("express");
const router = express.Router();

// Importación de rutas individuales
const usuarioRoutes = require("./usuario.routes");
const categoriaRoutes = require("./categoria.routes");
const productoRoutes = require("./producto.routes");
const productoCompuestoRoutes = require("./productoCompuesto.routes");
const presentacionRoutes = require("./presentacion.routes");
const inventarioRoutes = require("./inventario.routes");
const referenciaInventarioRoutes = require("./referenciaInventario.Routes");
const clienteRoutes = require("./cliente.routes");
const conductorRoutes = require("./conductor.routes");
const proveedorRoutes = require("./proveedor.routes");
const compraRoutes = require("./compra.routes");
const liquidacionCompraRoutes = require("./liquidacionCompra.routes");
const ventaRoutes = require("./venta.routes"); 
const sucursalRoutes = require("./sucursal.routes");

// Nuevas rutas
const cotizacionRoutes = require("./cotizacion.routes");
const notaVentaRoutes = require("./notaVenta.routes");
const pedidoRoutes = require("./pedido.routes");
//const facturaGratuitaRoutes = require("./facturaGratuita.routes");
const authCtrl = require("../controllers/auth.controller"); 
const cajaRoutes = require("./caja.Routes"); 
const taller = require("./taller.routes");
const operarioRoutes = require("./operario.routes");
const planillaRoutes = require("./planilla.routes");
const contabilidadRoutes = require("./contabilidad.routes");
const cuentasPorCobrarRoutes = require("./cuentasPorCobrar.routes");
const gastosDiversosRoutes = require("./gastosDiversos.routes");
const configuracionRoutes = require("./configuracion.routes");
const resumenesRoutes = require("./resumenes.routes");
const anulacionesRoutes = require("./anulaciones.routes");
// Rutas de configuración SUNAT y WhatsApp
const configuracionSunatRoutes = require("./configuracionSunat.routes");
const configuracionWhatsappRoutes = require("./configuracionWhatsapp.routes");
const seriesCorrelativosRoutes = require("./seriesCorrelativos.routes");
const almacenRoutes = require("./almacen.routes");
const etiquetasRoutes = require("./etiquetas.routes");
const migracionRoutes = require("./migracion.routes");
const documentoRecurrenciaRoutes = require("./documentoRecurrencia.routes");
const servicioRoutes = require("./servicio.routes");
const marcaRoutes = require("./marca.routes");
const serieRoutes = require("./serie.routes");
const loteRoutes = require("./lote.routes");

const guiaRemisionRoutes = require("./guiaRemision.routes");
const vehiculoRoutes = require("./vehiculo.routes");
const transportistaRoutes = require("./transportista.routes");
const pagadorFleteRoutes = require("./pagadorFlete.routes");
const remitenteRoutes = require("./remitente.routes");
const direccionPartidaRoutes = require("./direccionPartida.routes");
//const activosFijosRoutes = require("./activosFijos.routes");

// Ruta de autenticación
router.post("/login", authCtrl.login);

// Asociación de rutas con prefijos
router.use("/usuarios", usuarioRoutes); // /api/usuarios
router.use("/categorias", categoriaRoutes); // /api/categorias
router.use("/productos", productoRoutes); // /api/productos
router.use("/productos-compuestos", productoCompuestoRoutes); // /api/productos-compuestos
router.use("/presentaciones", presentacionRoutes); // /api/presentaciones
router.use("/inventario", inventarioRoutes); // /api/inventario
router.use("/referencias-inventario", referenciaInventarioRoutes); // /api/referencias-inventario
router.use("/clientes", clienteRoutes); // /api/clientes
router.use("/conductores", conductorRoutes); // /api/conductores
router.use("/proveedores", proveedorRoutes); // /api/proveedores
router.use("/compras", compraRoutes); // /api/compras
router.use("/liquidacion-compras", liquidacionCompraRoutes); // /api/liquidacion-compras
router.use("/ventas", ventaRoutes); // /api/ventas

// Rutas para sucursales
router.use("/sucursales", sucursalRoutes); // /api/sucursales




// Nuevas rutas
router.use("/cotizaciones", cotizacionRoutes); // /api/cotizaciones
router.use("/notas-venta", notaVentaRoutes); // /api/notas-venta
router.use("/pedidos", pedidoRoutes); // /api/pedidos

router.use("/cajas", cajaRoutes); // /api/cajas 

router.use("/talleres", taller); // /api/talleres
router.use("/operarios", operarioRoutes); // /api/operarios
router.use("/planilla", planillaRoutes); // /api/planilla

router.use("/contabilidad", contabilidadRoutes); // /api/contabilidad
router.use("/cuentas-por-cobrar", cuentasPorCobrarRoutes); // /api/cuentas-por-cobrar
router.use("/gastos-diversos", gastosDiversosRoutes); // /api/gastos-diversos
router.use("/configuraciones", configuracionRoutes); // /api/configuraciones
router.use("/resumenes", resumenesRoutes); // /api/resumenes
router.use("/anulaciones", anulacionesRoutes); // /api/anulaciones

// Rutas de configuración SUNAT y WhatsApp
router.use("/configuracion-sunat", configuracionSunatRoutes); // /api/configuracion-sunat
router.use("/configuracion-whatsapp", configuracionWhatsappRoutes); // /api/configuracion-whatsapp
router.use("/series-correlativos", seriesCorrelativosRoutes); // /api/series-correlativos

// Rutas de almacenes
router.use("/almacenes", almacenRoutes); // /api/almacenes

// Rutas de etiquetas
router.use("/etiquetas", etiquetasRoutes); // /api/etiquetas

// Rutas de migración
router.use("/migracion", migracionRoutes); // /api/migracion

// Rutas de documentos de recurrencia
router.use("/documentos-recurrencia", documentoRecurrenciaRoutes); // /api/documentos-recurrencia

// Rutas de servicios
router.use("/servicios", servicioRoutes); // /api/servicios

// Rutas de marcas
router.use("/marcas", marcaRoutes); // /api/marcas

// Rutas de series de productos
router.use("/series", serieRoutes); // /api/series

// Rutas de lotes
router.use("/lotes", loteRoutes); // /api/lotes

//router.use("/facturas-gratuitas", facturaGratuitaRoutes); // /api/facturas-gratuitas






router.use("/guias-remision", guiaRemisionRoutes); // /api/guias-remision 
router.use("/vehiculos", vehiculoRoutes); // /api/vehiculos
router.use("/transportistas", transportistaRoutes); // /api/transportistas
router.use("/pagadores-flete", pagadorFleteRoutes); // /api/pagadores-flete
router.use("/remitentes", remitenteRoutes); // /api/remitentes
router.use("/direcciones-partida", direccionPartidaRoutes); // /api/direcciones-partida
//router.use("/activos-fijos", activosFijosRoutes); // /api/activos-fijos

module.exports = router;
