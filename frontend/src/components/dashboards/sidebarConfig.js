import {
  Home,
  Users,
  Building2,
  FolderOpen,
  Package,
  DollarSign,
  Truck,
  Settings,
  BarChart3,
  ShoppingCart,
  TrendingUp,
  ServerCrash,
} from 'lucide-react';

export const menuItems = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'usuarios', label: 'Gestión de Usuarios', icon: Users },
  { id: 'sucursales', label: 'Gestión de Sucursales', icon: Building2 },
  { id: 'categorias', label: 'Categorías', icon: FolderOpen },
  { id: 'caja', label: 'Caja', icon: DollarSign },
  { id: 'servicios', label: 'Servicios', icon: ServerCrash },
  { id: 'productos, presentaciones', label: 'Productos y Presentaciones', icon: Package },
  { id: 'ventas', label: 'Ventas', icon: DollarSign },
  { id: 'guiaRemision', label: 'Guía de Remisión', icon: Truck },
  { id: 'cotizaciones', label: 'Cotizaciones', icon: Package },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'inventario', label: 'Inventario', icon: BarChart3 },
  { id: 'compras', label: 'Compras', icon: ShoppingCart },
  { id: 'proveedores', label: 'Proveedores', icon: Truck },
  { id: 'reportes', label: 'Reportes', icon: TrendingUp },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export const MODULOS_POR_ROL = {
  SuperAdmin: ['inicio', 'usuarios', 'sucursales', 'categorias', 'productos, presentaciones', 'ventas', 'guiaRemision', 'cotizaciones', 'clientes', 'inventario', 'compras', 'proveedores', 'reportes', 'configuracion', 'caja', 'servicios'],
  Admin: ['inicio', 'usuarios', 'categorias', 'productos, presentaciones', 'ventas', 'guiaRemision', 'cotizaciones', 'clientes', 'inventario', 'compras', 'proveedores', 'reportes', 'configuracion', 'caja'],
  Cajero: ['inicio', 'clientes', 'ventas', 'guiaRemision', 'reportes'],
  Almacenero: ['inicio', 'inventario', 'compras', 'proveedores', 'guiaRemision', 'reportes'],
};

export const SIDEBAR_SUBMENUS = {
  'guiaRemision': [
    { id: 'remitente', label: 'G.R. Remitente' },
    { id: 'transportista', label: 'G.R. Transportista' },
    { id: 'transportistas', label: 'Transportistas' },
    { id: 'conductores', label: 'Conductores' },
    { id: 'vehiculos', label: 'Vehículos' },
    { id: 'direccion-partida', label: 'Dirección Partida' },
  ],
  'ventas': [
    { id: 'nueva-venta', label: 'Nueva Comprobante' },
    { id: 'lista-ventas', label: 'Lista de Comprobantes' },
    { id: 'Nota de venta', label: 'Nota de venta' },
    { id: 'Comprobantes no enviados', label: 'Comprobantes no enviados' },
    { id: 'cpe-rectificar', label: 'CPE Rectificar' },
    { id: 'documento-recurrencia', label: 'Listado Recurrencia' },
    { id: 'comprobante-contingencia', label: 'Comprobante Contingencia' },
    { id: 'resumenes', label: 'Resumenes' },
    { id: 'anulaciones', label: 'Anulaciones' },
    { id: 'pedidos', label: 'Pedidos' },
  ],
  'productos, presentaciones': [
    { id: 'lista-productos', label: 'Lista de Productos' },
    { id: 'nuevo-producto', label: 'Nuevo Producto' },
    { id: 'packs-promociones', label: 'Packs y Promociones' },
    { id: 'marcas', label: 'Marcas' },
    { id: 'series', label: 'Series' },
    { id: 'lotes', label: 'Lotes' },
  ],
  'inventario': [
    { id: 'referencias', label: 'Referencias' },
    { id: 'movimientos', label: 'Movimientos' },
    { id: 'traslados', label: 'Traslados' },
    { id: 'validar-inventario', label: 'Validar inventario' },
    { id: 'revision-inventario', label: 'Revisión de inventario' },
    { id: 'stock-historico', label: 'Stock histórico' },
    { id: 'kardex-costo-promedio', label: 'Kardex costo promedio' },
  ],
  'compras': [
    { id: 'ordenes-compra', label: 'Nueva Compra' },
    { id: 'lista-compras', label: 'Lista de Compras' },
    { id: 'liquidacion-compras', label: 'Liquidación de Compras' },
    { id: 'solicitar-cotizacion', label: 'Solicitar Cotización' },
    { id: 'ordenes-compras', label: 'Órdenes de Compra' },
    { id: 'gastos-diversos', label: 'Gastos Diversos' },
  ],
  'proveedores': [
    { id: 'nuevo-proveedor', label: 'Nuevo Proveedor' },
    { id: 'lista-proveedores', label: 'Lista de Proveedores' },
  ],
};

export function filtrarMenuItemsPorRol(rol, items) {
  const permitidos = MODULOS_POR_ROL[rol] || MODULOS_POR_ROL.SuperAdmin;
  return items.filter((i) => permitidos.includes(i.id));
}

/** Devuelve la sección activa según la ruta actual (para usar en layout con rutas) */
export function getActiveSectionFromPath(pathname) {
  if (pathname.startsWith('/usuarios')) return 'usuarios';
  if (pathname.startsWith('/sucursales')) return 'sucursales';
  if (pathname.startsWith('/categorias')) return 'categorias';
  if (pathname.startsWith('/dashboard')) return 'inicio';
  return '';
}
