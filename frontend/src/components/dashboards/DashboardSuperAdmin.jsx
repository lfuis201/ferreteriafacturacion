import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cerrarSesion } from '../../services/authService';
import Swal from 'sweetalert2';
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
  Menu,
  X,
} from 'lucide-react';
import { Sidebar } from '../ui';
import ListaGuiasRemision from '../guiaRemision/ListaGuiasRemision';
import FormularioGuiaRemisionTrans from '../guiaRemisionTransportista/FormularioGuiaRemuionTrans';
import ReferenciaInventario from '../inventario/referenciaInventario';
import TrasladoInventario from '../inventario/TrasladoInventario';
import MovimientoInventario from '../inventario/Movimientoinventario';
import CotizacionesLista from '../cotizaciones/cotizacionesLista';
import ListaClientes from '../clientes/listaclientes';
import ValidarInventario from '../inventario/ValidarInventario';
import RevicionInventario from '../inventario/RevicionInventario';
import StocHistori from '../inventario/StocHistori';
import Consultakardex from '../inventario/Consultakardex';
import FormularioCompras from '../Compras/FormularioCompras';
import ListaCompras from '../Compras/ListaCompras';
import ListaProveedores from '../proveedores/ListaProveedores';
import FormularioProveedores from '../proveedores/FormularioProveedores';






import ListaProductos from '../productos-presentacion/ListaProductos';
import FormularioProducto from '../productos-presentacion/FormularioProducto';
import PacksPromociones from '../productos-presentacion/PacksPromociones';
import Servicios from '../productos-presentacion/Servicios';
import Marcas from '../productos-presentacion/Marcas';
import Series from '../productos-presentacion/Series';
import Lotes from '../productos-presentacion/Lotes';

// Modales de importar/exportar para ListaProductos
import ImportarExcel from '../productos-presentacion/ImportarExcel';
import ImportarPresentacionesExcel from '../productos-presentacion/ImportarPresentacionesExcel';
import ExportarExcel from '../productos-presentacion/ExportarExcel';
import ExportarPresentacionesExcel from '../productos-presentacion/ExportarPresentacionesExcel';
import ExportarEtiquetas from '../productos-presentacion/ExportarEtiquetas';








import FormularioVenta from '../ventas/FormularioVenta';
import ListaVentas from '../ventas/ListaVentas';
import NotaVentaLista from '../ventas/NotaVentaLista';
import ComprobantesNoEnviados from '../ventas/ComprobantesNoEnviados';
import CPErectificar from '../ventas/CPErectificar';
import Resumenes from '../ventas/Resumenes';
import Anulaciones from '../ventas/Anulaciones';

import Pedidos from '../ventas/Pedidos';



import DocumentoRecurrencia from '../ventas/DocumentoRecurrencia';


import ComprobanteContingencia from '../ventas/ComprobanteContingencia';


import LiquidacionCompras from '../Compras/LiquidacionCompras';
import SolicitarCotizacion from '../Compras/SolicitarCotizacion';
import OrdenesCompra from '../Compras/OrdenesCompra';

import GastosDiversos from '../Compras/GastosDiversos';







import Reportes from '../Reportes/reporte';
import Configuraciones from '../configuraciones/configuraciones';
import ListaCaja from '../caja/ListaCaja';
import TransportistaLista from '../guiaRemisionTransportista/TransportitaLista';
import ConductoresLista from '../guiaRemisionTransportista/ConductoresLista';
import VehiculoLista from '../guiaRemisionTransportista/VehiculoLista';
import DirecciónPartidaLista from '../guiaRemision/DirecciónPartidaLista';
import InicioOverview from './InicioOverview';

// Servicios para métricas del dashboard
import { obtenerUsuarios } from '../../services/usuarioService';
import { obtenerSucursales } from '../../services/sucursalService';
import { obtenerProductos } from '../../services/productoService';
import { obtenerPresentaciones } from '../../services/presentacionService';
import { obtenerVentas } from '../../services/ventaService';








import '../../styles/Dashboard.css';

function DashboardSuperAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);
  const [activeSection, setActiveSection] = useState('inicio');
  const [guiaRemisionExpanded, setGuiaRemisionExpanded] = useState(false);
  const [guiaRemisionSubsection, setGuiaRemisionSubsection] = useState('');
  const [inventarioExpanded, setInventarioExpanded] = useState(false);
  const [inventarioSubsection, setInventarioSubsection] = useState('');
  const [comprasExpanded, setComprasExpanded] = useState(false);
  const [comprasSubsection, setComprasSubsection] = useState('');
  const [proveedoresExpanded, setProveedoresExpanded] = useState(false);
  const [proveedoresSubsection, setProveedoresSubsection] = useState('');
  const [ventasExpanded, setVentasExpanded] = useState(false);
  const [ventasSubsection, setVentasSubsection] = useState('');






  const [productosExpanded, setProductosExpanded] = useState(false);
  const [productosSubsection, setProductosSubsection] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados para modales de importar/exportar en Productos
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [modalImportarPresentacionesAbierto, setModalImportarPresentacionesAbierto] = useState(false);
  const [modalExportarAbierto, setModalExportarAbierto] = useState(false);
  const [modalExportarPresentacionesAbierto, setModalExportarPresentacionesAbierto] = useState(false);
  const [modalEtiquetasAbierto, setModalEtiquetasAbierto] = useState(false);
  const [recargarProductos, setRecargarProductos] = useState(0);

  const handleImportarExcel = () => setModalImportarAbierto(true);
  const handleImportarPresentaciones = () => setModalImportarPresentacionesAbierto(true);
  const handleExportarExcel = () => setModalExportarAbierto(true);
  const handleExportarPresentaciones = () => setModalExportarPresentacionesAbierto(true);
  const handleExportarEtiquetas = () => setModalEtiquetasAbierto(true);
  const handleImportComplete = () => {
    // Forzar recarga de productos en ListaProductos
    setRecargarProductos((prev) => prev + 1);
  };






  useEffect(() => {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Al llegar desde DashboardLayout con state (ej. clic en Ventas en otra página)
  useEffect(() => {
    const state = location.state;
    if (!state?.activeSection) return;
    setActiveSection(state.activeSection);
    if (state.subsection) {
      if (state.activeSection === 'guiaRemision') setGuiaRemisionSubsection(state.subsection);
      if (state.activeSection === 'ventas') setVentasSubsection(state.subsection);
      if (state.activeSection === 'productos, presentaciones') setProductosSubsection(state.subsection);
      if (state.activeSection === 'inventario') setInventarioSubsection(state.subsection);
      if (state.activeSection === 'compras') setComprasSubsection(state.subsection);
      if (state.activeSection === 'proveedores') setProveedoresSubsection(state.subsection);
    }
    setGuiaRemisionExpanded(state.activeSection === 'guiaRemision');
    setVentasExpanded(state.activeSection === 'ventas');
    setProductosExpanded(state.activeSection === 'productos, presentaciones');
    setInventarioExpanded(state.activeSection === 'inventario');
    setComprasExpanded(state.activeSection === 'compras');
    setProveedoresExpanded(state.activeSection === 'proveedores');
    window.history.replaceState({}, document.title, location.pathname);
  }, [location.state, location.pathname]);

  // Estados para métricas del dashboard de Inicio
  const [stats, setStats] = useState({
    usuarios: '-',
    sucursales: '-',
    productosYPresentaciones: '-',
    ventasMes: '-'
  });
  const [cargandoStats, setCargandoStats] = useState(false);
  const [errorStats, setErrorStats] = useState('');

  // Cargar métricas reales para la sección Inicio
  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        setCargandoStats(true);
        setErrorStats('');

        // Rango del mes actual (YYYY-MM-DD)
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
        const fechaInicio = inicioMes.toISOString().split('T')[0];
        const fechaFin = finMes.toISOString().split('T')[0];

        const [usuariosData, sucursalesData, productosData, ventasData, presentacionesData] = await Promise.all([
          obtenerUsuarios(),
          obtenerSucursales(),
          obtenerProductos(),
          obtenerVentas({ fechaInicio, fechaFin }),
          obtenerPresentaciones() // todas las presentaciones
        ]);

        const countFrom = (data, key) => {
          if (Array.isArray(data)) return data.length;
          if (data && Array.isArray(data[key])) return data[key].length;
          if (data && Array.isArray(data.data)) return data.data.length;
          return 0;
        };

        const usuariosCount = countFrom(usuariosData, 'usuarios');
        const sucursalesCount = countFrom(sucursalesData, 'sucursales');
        const productosCount = countFrom(productosData, 'productos');
        const presentacionesCount = countFrom(presentacionesData, 'presentaciones');
        const ventasCount = countFrom(ventasData, 'ventas');

        setStats({
          usuarios: usuariosCount,
          sucursales: sucursalesCount,
          productosYPresentaciones: productosCount + presentacionesCount,
          ventasMes: ventasCount
        });
      } catch (error) {
        setErrorStats(error.message || 'Error al cargar métricas');
        setStats({ usuarios: '-', sucursales: '-', productosYPresentaciones: '-', ventasMes: '-' });
      } finally {
        setCargandoStats(false);
      }
    };

    cargarMetricas();
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que quieres cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      cerrarSesion();
      navigate('/');
    }
  };

  const menuItems = [
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

  // Módulos visibles por rol y filtrado del menú
  const MODULOS_POR_ROL = {
    SuperAdmin: ['inicio', 'usuarios', 'sucursales', 'categorias', 'productos, presentaciones', 'ventas', 'guiaRemision', 'cotizaciones', 'clientes', 'inventario', 'compras', 'proveedores', 'reportes', 'configuracion', 'caja', 'servicios'],







    Admin: ['inicio', 'usuarios', 'categorias', 'productos, presentaciones', 'ventas', 'guiaRemision', 'cotizaciones', 'clientes', 'inventario', 'compras', 'proveedores', 'reportes', 'configuracion', 'caja'],



    Cajero: ['inicio', 'clientes', 'ventas', 'guiaRemision', 'reportes'],
    Almacenero: ['inicio', 'inventario', 'compras', 'proveedores', 'guiaRemision', 'reportes']
  };

  const filtrarMenuItemsPorRol = (rol, items) => {
    const permitidos = MODULOS_POR_ROL[rol] || MODULOS_POR_ROL['SuperAdmin'];
    return items.filter(i => permitidos.includes(i.id));
  };

  const visibleMenuItems = filtrarMenuItemsPorRol(usuario?.rol, menuItems);

  // Submenús para el Sidebar reutilizable
  const SIDEBAR_SUBMENUS = {
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

  const closeSidebar = () => setSidebarOpen(false);

  const handleModuleNavigation = (moduleId) => {
    closeSidebar();
    switch (moduleId) {
      case 'usuarios':
        navigate('/usuarios/gestion');
        break;

      case 'sucursales':
        navigate('/sucursales/gestion');
        break;

      case 'categorias':
        navigate('/categorias/gestion');
        break;

      case 'productos, presentaciones':
        setProductosExpanded(!productosExpanded);
        setGuiaRemisionExpanded(false);
        setGuiaRemisionSubsection('');
        setInventarioExpanded(false);
        setInventarioSubsection('');
        setComprasExpanded(false);
        setComprasSubsection('');
        setProveedoresExpanded(false);
        setProveedoresSubsection('');
        setVentasExpanded(false);
        setVentasSubsection('');
        if (!productosExpanded) {
          setProductosSubsection('');
        }
        break;







      case 'caja':
        setActiveSection('caja');
        setGuiaRemisionExpanded(false);
        setGuiaRemisionSubsection('');
        setInventarioExpanded(false);
        setInventarioSubsection('');
        setComprasExpanded(false);
        setComprasSubsection('');
        setProveedoresExpanded(false);
        setProveedoresSubsection('');
        setVentasExpanded(false);
        setVentasSubsection('');
        break;




      case 'servicios':
        setActiveSection('servicios');
        setGuiaRemisionExpanded(false);
        setGuiaRemisionSubsection('');
        setInventarioExpanded(false);
        setInventarioSubsection('');
        setComprasExpanded(false);
        setComprasSubsection('');
        setProveedoresExpanded(false);
        setProveedoresSubsection('');
        setVentasExpanded(false);
        setVentasSubsection('');
        break;

      case 'ventas':
        setVentasExpanded(!ventasExpanded);
        setGuiaRemisionExpanded(false);
        setGuiaRemisionSubsection('');
        setInventarioExpanded(false);
        setInventarioSubsection('');
        setComprasExpanded(false);
        setComprasSubsection('');
        setProveedoresExpanded(false);
        setProveedoresSubsection('');
        if (!ventasExpanded) {
          setVentasSubsection('');
        }
        break;

      case 'guiaRemision':
        setGuiaRemisionExpanded(!guiaRemisionExpanded);
        setInventarioExpanded(false);
        setInventarioSubsection('');
        setComprasExpanded(false);
        setComprasSubsection('');
        setProveedoresExpanded(false);
        setProveedoresSubsection('');
        setVentasExpanded(false);
        setVentasSubsection('');
        if (!guiaRemisionExpanded) {
          setGuiaRemisionSubsection('');
        }
        break;

      case 'inventario':
        setInventarioExpanded(!inventarioExpanded);
        setGuiaRemisionExpanded(false);
        setGuiaRemisionSubsection('');
        setComprasExpanded(false);
        setComprasSubsection('');
        setProveedoresExpanded(false);
        setProveedoresSubsection('');
        setVentasExpanded(false);
        setVentasSubsection('');
        if (!inventarioExpanded) {
          setInventarioSubsection('');
        }
        break;

      case 'compras':
        setComprasExpanded(!comprasExpanded);
        setGuiaRemisionExpanded(false);
        setGuiaRemisionSubsection('');
        setInventarioExpanded(false);
        setInventarioSubsection('');
        setProveedoresExpanded(false);
        setProveedoresSubsection('');
        setVentasExpanded(false);
        setVentasSubsection('');
        if (!comprasExpanded) {
          setComprasSubsection('');
        }
        break;

      case 'proveedores':
        setProveedoresExpanded(!proveedoresExpanded);
        setGuiaRemisionExpanded(false);
        setGuiaRemisionSubsection('');
        setInventarioExpanded(false);
        setInventarioSubsection('');
        setComprasExpanded(false);
        setComprasSubsection('');
        setVentasExpanded(false);
        setVentasSubsection('');
        if (!proveedoresExpanded) {
          setProveedoresSubsection('');
        }
        break;




      case 'configuracion':
        setActiveSection('configuracion');
        setGuiaRemisionExpanded(false);
        setGuiaRemisionSubsection('');
        setInventarioExpanded(false);
        setInventarioSubsection('');
        setComprasExpanded(false);
        setComprasSubsection('');
        setProveedoresExpanded(false);
        setProveedoresSubsection('');
        setVentasExpanded(false);
        setVentasSubsection('');
        break;

      case 'cotizaciones':
        setActiveSection('cotizaciones');
        setGuiaRemisionExpanded(false);
        setGuiaRemisionSubsection('');
        setInventarioExpanded(false);
        setInventarioSubsection('');
        setComprasExpanded(false);
        setComprasSubsection('');
        setProveedoresExpanded(false);
        setProveedoresSubsection('');
        setVentasExpanded(false);
        setVentasSubsection('');
        break;

      case 'clientes':
        setActiveSection('clientes');
        setGuiaRemisionExpanded(false);
        setGuiaRemisionSubsection('');
        setInventarioExpanded(false);
        setInventarioSubsection('');
        setComprasExpanded(false);
        setComprasSubsection('');
        setProveedoresExpanded(false);
        setProveedoresSubsection('');
        setVentasExpanded(false);
        setVentasSubsection('');
        break;

      case 'reportes':
        setActiveSection('reportes');
        setGuiaRemisionExpanded(false);
        setGuiaRemisionSubsection('');
        setInventarioExpanded(false);
        setInventarioSubsection('');
        setComprasExpanded(false);
        setComprasSubsection('');
        setProveedoresExpanded(false);
        setProveedoresSubsection('');
        setVentasExpanded(false);
        setVentasSubsection('');
        break;






      default:
        setActiveSection(moduleId);
        setGuiaRemisionExpanded(false);
        setGuiaRemisionSubsection('');
        setInventarioExpanded(false);
        setInventarioSubsection('');
        setComprasExpanded(false);
        setComprasSubsection('');
        setProveedoresExpanded(false);
        setProveedoresSubsection('');
        setVentasExpanded(false);
        setVentasSubsection('');
    }
  };

  const handleGuiaRemisionSubsection = (subsection) => {
    setGuiaRemisionSubsection(subsection);
    setActiveSection('guiaRemision');
  };

  const handleInventarioSubsection = (subsection) => {
    setInventarioSubsection(subsection);
    setActiveSection('inventario');
  };

  const handleComprasSubsection = (subsection) => {
    setComprasSubsection(subsection);
    setActiveSection('compras');
  };

  const handleProveedoresSubsection = (subsection) => {
    setProveedoresSubsection(subsection);
    setActiveSection('proveedores');
  };

  const handleVentasSubsection = (subsection) => {
    setVentasSubsection(subsection);
    setActiveSection('ventas');
  };


  const handleProductosSubsection = (subsection) => {
    setProductosSubsection(subsection);
    setActiveSection('productos, presentaciones');
  };

  const handleSubItemClick = (parentId, subId) => {
    closeSidebar();
    if (parentId === 'guiaRemision') handleGuiaRemisionSubsection(subId);
    else if (parentId === 'ventas') handleVentasSubsection(subId);
    else if (parentId === 'productos, presentaciones') handleProductosSubsection(subId);
    else if (parentId === 'inventario') handleInventarioSubsection(subId);
    else if (parentId === 'compras') handleComprasSubsection(subId);
    else if (parentId === 'proveedores') handleProveedoresSubsection(subId);
  };







  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <InicioOverview
            cargandoStats={cargandoStats}
            stats={stats}
            errorStats={errorStats}
            onNavigate={navigate}
          />
        );

      case 'categorias':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-fondo">Gestión de Categorías</h2>
            <div className="module-actions">
              <button
                className="primary-btn"
                onClick={() => navigate('/categorias/gestion')}
              >
                Ir a Gestión de Categorías
              </button>
            </div>
          </div>
        );







      case 'productos, presentaciones':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-fondo">Gestión de Productos y Servicios</h2>
            {productosSubsection === 'lista-productos' && (
              <>
                <ListaProductos
                  onImportarExcel={handleImportarExcel}
                  onImportarPresentaciones={handleImportarPresentaciones}
                  onExportarExcel={handleExportarExcel}
                  onExportarPresentaciones={handleExportarPresentaciones}
                  onExportarEtiquetas={handleExportarEtiquetas}
                  recargarProductos={recargarProductos}
                />

                {/* Modales de Importación/Exportación */}
                <ImportarExcel
                  isOpen={modalImportarAbierto}
                  onClose={() => setModalImportarAbierto(false)}
                  onImportComplete={handleImportComplete}
                />
                <ImportarPresentacionesExcel
                  isOpen={modalImportarPresentacionesAbierto}
                  onClose={() => setModalImportarPresentacionesAbierto(false)}
                  onImportComplete={handleImportComplete}
                />
                <ExportarExcel
                  isOpen={modalExportarAbierto}
                  onClose={() => setModalExportarAbierto(false)}
                />
                <ExportarPresentacionesExcel
                  isOpen={modalExportarPresentacionesAbierto}
                  onClose={() => setModalExportarPresentacionesAbierto(false)}
                />
                {modalEtiquetasAbierto && (
                  <ExportarEtiquetas onCerrar={() => setModalEtiquetasAbierto(false)} />
                )}
              </>
            )}
            {productosSubsection === 'nuevo-producto' && <FormularioProducto />}
            {productosSubsection === 'packs-promociones' && <PacksPromociones />}
            {productosSubsection === 'servicios' && <Servicios />}
            {productosSubsection === 'marcas' && <Marcas />}
            {productosSubsection === 'series' && <Series />}
            {productosSubsection === 'lotes' && <Lotes />}

            {!productosSubsection && (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 py-12">
                <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-menta-suave text-menta-petroleo">
                  <Package size={28} />
                </span>
                <p className="text-center text-sm font-medium text-menta-petroleo">
                  Selecciona una opción del submenú de Productos.
                </p>
                <p className="mt-1 text-center text-xs text-slate-500">
                  Lista de productos, nuevo producto, servicios, marcas, series o lotes.
                </p>
              </div>
            )}
          </div>
        );








      case 'usuarios':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-fondo">Gestión de Usuarios</h2>
            <div className="module-actions">
              <button
                className="primary-btn"
                onClick={() => navigate('/usuarios/gestion')}
              >
                Ir a Gestión de Usuarios
              </button>
            </div>
          </div>
        );

      case 'caja':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-fondo">Gestión de Caja</h2>
            <ListaCaja />
          </div>
        );





      case 'servicios':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-fondo">Gestión de Caja</h2>
            <Servicios />
          </div>
        )






      case 'guiaRemision':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-fondo">Gestión de Guías de Remisión</h2>
            {guiaRemisionSubsection === '' && (
              <div className="module-actions">
                <p>Selecciona una opción del menú lateral para comenzar.</p>
              </div>
            )}
            {guiaRemisionSubsection === 'remitente' && <ListaGuiasRemision />}
            {guiaRemisionSubsection === 'transportista' && <FormularioGuiaRemisionTrans />}

            {guiaRemisionSubsection === 'transportistas' && <TransportistaLista />}
            {guiaRemisionSubsection === 'conductores' && <ConductoresLista />}
            {guiaRemisionSubsection === 'vehiculos' && <VehiculoLista />}
            {guiaRemisionSubsection === 'direccion-partida' && <DirecciónPartidaLista />}

          </div>
        );

      case 'inventario':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-fondo">Gestión de Inventario</h2>
            {inventarioSubsection === 'referencias' && <ReferenciaInventario />}
            {inventarioSubsection === 'movimientos' && <MovimientoInventario />}
            {inventarioSubsection === 'traslados' && <TrasladoInventario />}
            {inventarioSubsection === 'validar-inventario' && <ValidarInventario />}
            {inventarioSubsection === 'revision-inventario' && <RevicionInventario />}
            {inventarioSubsection === 'stock-historico' && <StocHistori />}
            {inventarioSubsection === 'kardex-costo-promedio' && <Consultakardex />}
            {!inventarioSubsection && (
              <div>
                <p>Selecciona una opción del menú de inventario</p>
              </div>
            )}
          </div>
        );






      case 'ventas':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-fondo">Gestión de Comprobantes</h2>
            {ventasSubsection === 'nueva-venta' && <FormularioVenta />}
            {ventasSubsection === 'lista-ventas' && <ListaVentas />}








            {ventasSubsection === 'Nota de venta' && (
              <NotaVentaLista />
            )}




            {ventasSubsection === 'Comprobantes no enviados' && (
              <ComprobantesNoEnviados />

            )}



            {ventasSubsection === 'cpe-rectificar' && (
              <CPErectificar />
            )}

            {ventasSubsection === 'documento-recurrencia' && (
              <DocumentoRecurrencia />
            )}

            {ventasSubsection === 'comprobante-contingencia' && (
              <ComprobanteContingencia />
            )}

            {ventasSubsection === 'resumenes' && (
              <Resumenes />
            )}


            {ventasSubsection === 'anulaciones' && (
              <Anulaciones />
            )}

            {ventasSubsection === 'pedidos' && (
              <Pedidos />
            )}

















            {ventasSubsection === 'creditos' && (
              <div>
                <h3>Créditos</h3>
                <p>Gestión de créditos y notas de crédito</p>
              </div>
            )}

            {ventasSubsection === 'comisiones' && (
              <div>
                <h3>Comisiones</h3>
                <p>Gestión de comisiones de vendedores</p>
              </div>
            )}



            {ventasSubsection === 'seguimiento' && (
              <div>
                <h3>Seguimiento de Ventas</h3>
                <p>Seguimiento y análisis de ventas</p>
              </div>
            )}



            {!ventasSubsection && (
              <div>
                <p>Selecciona una opción del menú de ventas</p>
              </div>
            )}






          </div>
        );

      case 'compras':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-fondo">Gestión de Compras</h2>
            {comprasSubsection === 'ordenes-compra' && <FormularioCompras />}
            {comprasSubsection === 'lista-compras' && <ListaCompras />}
            {comprasSubsection === 'liquidacion-compras' && <LiquidacionCompras />}
            {comprasSubsection === 'solicitar-cotizacion' && <SolicitarCotizacion />}
            {comprasSubsection === 'ordenes-compras' && <OrdenesCompra />}
            {comprasSubsection === 'gastos-diversos' && <GastosDiversos />}


            {!comprasSubsection && (
              <div>
                <p>Selecciona una opción del menú de compras</p>
              </div>
            )}
          </div>
        );

      case 'proveedores':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-fondo">Gestión de Proveedores</h2>
            {proveedoresSubsection === '' && (
              <div className="module-actions">
                <p>Selecciona una opción del menú lateral para comenzar.</p>
              </div>
            )}
            {proveedoresSubsection === 'nuevo-proveedor' && <FormularioProveedores />}
            {proveedoresSubsection === 'lista-proveedores' && <ListaProveedores />}
          </div>
        );

      case 'cotizaciones':
        return (
          <div className="content-section">
            <h2>Gestión de Cotizaciones</h2>
            <CotizacionesLista />
          </div>
        );

      case 'clientes':
        return (
          <div className="content-section">
            <h2>Gestión de Clientes</h2>
            <ListaClientes />
          </div>
        );

      case 'reportes':
        return (
          <div className="content-section">
            <Reportes />
          </div>
        );






        {/*  CONFIGURACION*/ }
      case 'configuracion':
        return (
          <div className="content-section">
            <Configuraciones />
          </div>
        );

      default:
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-fondo">{menuItems.find(item => item.id === activeSection)?.label}</h2>
            <p className="mt-2 text-menta-petroleo">Funcionalidad en desarrollo...</p>
          </div>
        );
    }
  };

  if (!usuario) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="font-medium text-menta-marino">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-white">
      {/* Overlay en móvil cuando el sidebar está abierto */}
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={closeSidebar}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      {/* Sidebar: drawer en móvil, fijo en md+ */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-out
          md:relative md:translate-x-0 md:shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar
          title="Ferretería"
          roleLabel={usuario?.rol || 'SuperAdmin'}
          items={visibleMenuItems}
          submenus={SIDEBAR_SUBMENUS}
          activeSection={activeSection}
          expanded={{
            'guiaRemision': guiaRemisionExpanded,
            'ventas': ventasExpanded,
            'productos, presentaciones': productosExpanded,
            'inventario': inventarioExpanded,
            'compras': comprasExpanded,
            'proveedores': proveedoresExpanded,
          }}
          subsection={{
            'guiaRemision': guiaRemisionSubsection,
            'ventas': ventasSubsection,
            'productos, presentaciones': productosSubsection,
            'inventario': inventarioSubsection,
            'compras': comprasSubsection,
            'proveedores': proveedoresSubsection,
          }}
          onItemClick={handleModuleNavigation}
          onSubItemClick={handleSubItemClick}
          user={usuario || {}}
          onLogout={handleLogout}
        />
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={closeSidebar}
          className="absolute right-3 top-4 rounded-lg p-1.5 text-white hover:bg-white/20 md:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            className="rounded-lg p-2 text-menta-marino hover:bg-slate-100"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-fondo">Ferretería</span>
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default DashboardSuperAdmin;