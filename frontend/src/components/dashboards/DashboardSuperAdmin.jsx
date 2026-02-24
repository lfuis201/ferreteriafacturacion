import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LogOut,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  TrendingUp,
  ServerCrash,
} from 'lucide-react';
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

// Servicios para métricas del dashboard
import { obtenerUsuarios } from '../../services/usuarioService';
import { obtenerSucursales } from '../../services/sucursalService';
import { obtenerProductos } from '../../services/productoService';
import { obtenerPresentaciones } from '../../services/presentacionService';
import { obtenerVentas } from '../../services/ventaService';








import '../../styles/Dashboard.css';

function DashboardSuperAdmin() {
  const navigate = useNavigate();
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
    SuperAdmin: ['inicio','usuarios','sucursales','categorias','productos, presentaciones','ventas','guiaRemision','cotizaciones','clientes','inventario','compras','proveedores','reportes','configuracion','caja','servicios'], 







    Admin: ['inicio','usuarios','categorias','productos, presentaciones','ventas','guiaRemision','cotizaciones','clientes','inventario','compras','proveedores','reportes','configuracion','caja'],



    Cajero: ['inicio','clientes','ventas','guiaRemision','reportes'],
    Almacenero: ['inicio','inventario','compras','proveedores','guiaRemision','reportes']
  };

  const filtrarMenuItemsPorRol = (rol, items) => {
    const permitidos = MODULOS_POR_ROL[rol] || MODULOS_POR_ROL['SuperAdmin'];
    return items.filter(i => permitidos.includes(i.id));
  };

  const visibleMenuItems = filtrarMenuItemsPorRol(usuario?.rol, menuItems);

  const handleModuleNavigation = (moduleId) => {
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
        setActiveSection('productos, presentaciones');
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
        setActiveSection('ventas');
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
        setActiveSection('guiaRemision');
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
        setActiveSection('inventario');
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
        setActiveSection('compras');
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
        setActiveSection('proveedores');
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







  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <div className="dashboard-content">
            <h2>Panel de Control - SuperAdmin</h2> 
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Usuarios Totales</h3>
                <p className="stat-number">{cargandoStats ? '...' : stats.usuarios}</p>
              </div>
              <div className="stat-card">
                <h3>Sucursales</h3>
                <p className="stat-number">{cargandoStats ? '...' : stats.sucursales}</p>
              </div>
              <div className="stat-card">
                <h3>Productos y Presentaciones</h3>
                <p className="stat-number">{cargandoStats ? '...' : stats.productosYPresentaciones}</p>
              </div>
              <div className="stat-card">
                <h3>Ventas del Mes</h3>
                <p className="stat-number">{cargandoStats ? '...' : stats.ventasMes}</p>
              </div>
            </div>

            {errorStats && (
              <div className="error-message" style={{ marginTop: '8px' }}>
                {errorStats}
              </div>
            )}

            <div className="quick-actions">
              <h3>Acciones Rápidas</h3>
              <div className="action-buttons">
                <button 
                  className="action-btn"
                  onClick={() => navigate('/usuarios/gestion')}
                >
                  <Users size={20} /> Gestionar Usuarios
                </button>
                <button 
                  className="action-btn"
                  onClick={() => navigate('/sucursales/gestion')}
                >
                  <Building2 size={20} /> Gestionar Sucursales
                </button>
                <button 
                  className="action-btn"
                  onClick={() => navigate('/categorias/gestion')}
                >
                  <FolderOpen size={20} /> Gestionar Categorías
                </button>
                <button 
                  className="action-btn"
                  onClick={() => navigate('/productos/gestion')}
                >
                  <Package size={20} /> Gestionar Productos y Presentaciones
                </button>
                <button 
                  className="action-btn"
                  onClick={() => navigate('/inventario/gestion')}
                >
                  <BarChart3 size={20} /> Gestionar Inventario
                </button>
                <button 
                  className="action-btn"
                  onClick={() => navigate('/ventas/lista')}
                >
                  <DollarSign size={20} /> Ver Ventas
                </button>
                <button 
                  className="action-btn"
                  onClick={() => navigate('/configuraciones')}
                >
                  <Settings size={20} /> Configuraciones
                </button>
              </div>
            </div>
          </div>
        );

      case 'categorias':
        return (
          <div className="dashboard-content">
            <h2>Gestión de Categorías</h2>
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
          <div className="dashboard-content">
            <h2>Gestión de Productos y Servicios</h2>
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
              <div>
                <p>Selecciona una opción del submenú de Productos.</p>
              </div>
            )}
         
         
          </div>
        );








      case 'usuarios':
        return (
          <div className="dashboard-content">
            <h2>Gestión de Usuarios</h2>
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
          <div className="dashboard-content">
            <h2>Gestión de Caja</h2>
            <ListaCaja />
          </div>
        );  





        case 'servicios':
        return (
         <div className="dashboard-content">
            <h2>Gestión de Caja</h2>
            <Servicios />
          </div>
        )


     

       

      case 'guiaRemision':
        return (
          <div className="dashboard-content">
            <h2>Gestión de Guías de Remisión</h2>
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
          <div className="dashboard-content">
            <h2>Gestión de Inventario</h2>
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
          <div className="dashboard-content">
            <h2>Gestión de Comprobantes</h2>
            {ventasSubsection === 'nueva-venta' && <FormularioVenta />}
            {ventasSubsection === 'lista-ventas' &&  <ListaVentas />}








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
          <div className="dashboard-content">
            <h2>Gestión de Compras</h2>
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
          <div className="dashboard-content">
            <h2>Gestión de Proveedores</h2>
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






        {/*  CONFIGURACION*/}
      case 'configuracion':
        return (
          <div className="content-section">
            <Configuraciones />
          </div>
        );

      default:
        return (
          <div className="dashboard-content">
            <h2>{menuItems.find(item => item.id === activeSection)?.label}</h2>
            <p>Funcionalidad en desarrollo...</p>
          </div>
        );
    }
  };

  if (!usuario) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h3>Ferretería</h3>
          <p>SuperAdmin</p>
        </div>
        <ul className="sidebar-menu">
          {visibleMenuItems.map(item => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button
                  className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => handleModuleNavigation(item.id)}
                >
                  <span className="menu-icon">
                    <IconComponent size={20} />
                  </span>
                  {item.label}
                  {(item.id === 'guiaRemision' || item.id === 'inventario' || item.id === 'compras' || item.id === 'proveedores' || item.id === 'ventas' || item.id === 'productos, presentaciones') && (
                    <span className="expand-icon">
                      {(item.id === 'guiaRemision' && guiaRemisionExpanded) || 
                       (item.id === 'inventario' && inventarioExpanded) ||
                       (item.id === 'compras' && comprasExpanded) ||
                       (item.id === 'proveedores' && proveedoresExpanded) ||
                       (item.id === 'ventas' && ventasExpanded) ||
                       (item.id === 'productos, presentaciones' && productosExpanded) ? 
                        <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                  )}
                </button>

                {item.id === 'guiaRemision' && guiaRemisionExpanded && (
                  <ul className="submenu">
                    <li 
                      className={`submenu-item ${guiaRemisionSubsection === 'remitente' ? 'active' : ''}`}
                      onClick={() => handleGuiaRemisionSubsection('remitente')}
                    >
                      <span>G.R. Remitente</span>
                    </li>

                    <li 
                      className={`submenu-item ${guiaRemisionSubsection === 'transportista' ? 'active' : ''}`}
                      onClick={() => handleGuiaRemisionSubsection('transportista')}
                    >
                      <span>G.R. Transportista</span>
                    </li>

                    <li 
                      className={`submenu-item ${guiaRemisionSubsection === 'transportistas' ? 'active' : ''}`}
                      onClick={() => handleGuiaRemisionSubsection('transportistas')}
                    >
                      <span>Transportistas</span>
                    </li> 
                    
                    <li 
                      className={`submenu-item ${guiaRemisionSubsection === 'conductores' ? 'active' : ''}`}
                      onClick={() => handleGuiaRemisionSubsection('conductores')}
                    >
                      <span>Conductores</span>
                    </li>  

                    <li 
                      className={`submenu-item ${guiaRemisionSubsection === 'vehiculos' ? 'active' : ''}`}
                      onClick={() => handleGuiaRemisionSubsection('vehiculos')}
                    >
                      <span>Vehículos</span>
                    </li>   

                    <li 
                      className={`submenu-item ${guiaRemisionSubsection === 'direccion-partida' ? 'active' : ''}`}
                      onClick={() => handleGuiaRemisionSubsection('direccion-partida')}
                    >
                      <span>Dirección Partida</span>
                    </li>   
                    



                  </ul>
                )}





                {/*menu desplegable de ventas*/ }
                {item.id === 'ventas' && ventasExpanded && (
                  <ul className="submenu">
                    <li 
                      className={`submenu-item ${ventasSubsection === 'nueva-venta' ? 'active' : ''}`}
                      onClick={() => handleVentasSubsection('nueva-venta')}
                    >
                      <span>Nueva Comprobante</span>
                    </li>


                    <li 
                      className={`submenu-item ${ventasSubsection === 'lista-ventas' ? 'active' : ''}`}
                      onClick={() => handleVentasSubsection('lista-ventas')}
                    >
                      <span>Lista de Comprobantes</span>
                    </li>

                   


                    <li 
                      className={`submenu-item ${ventasSubsection === 'Nota de venta' ? 'active' : ''}`}
                      onClick={() => handleVentasSubsection('Nota de venta')}
                    >
                      <span>Nota de venta</span>
                    </li>




                    <li 
                      className={`submenu-item ${ventasSubsection === 'Comprobantes no enviados' ? 'active' : ''}`}
                      onClick={() => handleVentasSubsection('Comprobantes no enviados')}
                    >
                      <span>Comprobantes no enviados</span>
                    </li>



                  
                    <li 
                      className={`submenu-item ${ventasSubsection === 'cpe-rectificar' ? 'active' : ''}`}
                      onClick={() => handleVentasSubsection('cpe-rectificar')}
                    >
                      <span>CPE Rectificar</span>
                    </li> 


                    <li 
                      className={`submenu-item ${ventasSubsection === 'documento-recurrencia' ? 'active' : ''}`}
                      onClick={() => handleVentasSubsection('documento-recurrencia')}
                    >
                      <span>Listado Recurrencia</span>
                    </li> 

                    <li 
                      className={`submenu-item ${ventasSubsection === 'comprobante-contingencia' ? 'active' : ''}`}
                      onClick={() => handleVentasSubsection('comprobante-contingencia')}
                    >
                      <span>Comprobante Contingencia</span>
                    </li>  

                    <li 
                      className={`submenu-item ${ventasSubsection === 'resumenes' ? 'active' : ''}`}
                      onClick={() => handleVentasSubsection('resumenes')}
                    >
                      <span>Resumenes</span>
                    </li>   

                    <li 
                      className={`submenu-item ${ventasSubsection === 'anulaciones' ? 'active' : ''}`}
                      onClick={() => handleVentasSubsection('anulaciones')}
                    >
                      <span>Anulaciones</span>
                    </li>    

                    <li 
                      className={`submenu-item ${ventasSubsection === 'pedidos' ? 'active' : ''}`}
                      onClick={() => handleVentasSubsection('pedidos')}
                    >
                      <span>Pedidos</span>
                    </li>    







                    
                  </ul>
                )}









                {/* menú desplegable de productos y presentaciones */}
                {item.id === 'productos, presentaciones' && productosExpanded && (
                  <ul className="submenu">
                    <li 
                      className={`submenu-item ${productosSubsection === 'lista-productos' ? 'active' : ''}`}
                      onClick={() => handleProductosSubsection('lista-productos')}
                    >
                      <span>Lista de Productos</span>
                    </li>
                    <li 
                      className={`submenu-item ${productosSubsection === 'nuevo-producto' ? 'active' : ''}`}
                      onClick={() => handleProductosSubsection('nuevo-producto')}
                    >
                      <span>Nuevo Producto</span>
                    </li>  

                    <li 
                      className={`submenu-item ${productosSubsection === 'packs-promociones' ? 'active' : ''}`}
                      onClick={() => handleProductosSubsection('packs-promociones')}
                    >
                      <span>Packs y Promociones</span>
                    </li> 

                   

                    <li 
                      className={`submenu-item ${productosSubsection === 'marcas' ? 'active' : ''}`}
                      onClick={() => handleProductosSubsection('marcas')}
                    >
                      <span>Marcas</span>
                    </li>   

                    <li 
                      className={`submenu-item ${productosSubsection === 'series' ? 'active' : ''}`}
                      onClick={() => handleProductosSubsection('series')}
                    >
                      <span>Series</span>
                    </li>   
                    <li 
                      className={`submenu-item ${productosSubsection === 'lotes' ? 'active' : ''}`}
                      onClick={() => handleProductosSubsection('lotes')}
                    >
                      <span>Lotes</span>
                    </li>  











                  </ul>
                )}









                
                {item.id === 'inventario' && inventarioExpanded && (
                  <ul className="submenu">
                    <li 
                      className={`submenu-item ${inventarioSubsection === 'referencias' ? 'active' : ''}`}
                      onClick={() => handleInventarioSubsection('referencias')}
                    >
                      <span>Referencias</span>
                    </li>
                    <li 
                      className={`submenu-item ${inventarioSubsection === 'movimientos' ? 'active' : ''}`}
                      onClick={() => handleInventarioSubsection('movimientos')}
                    >
                      <span>Movimientos</span>
                    </li>
                    <li 
                      className={`submenu-item ${inventarioSubsection === 'traslados' ? 'active' : ''}`}
                      onClick={() => handleInventarioSubsection('traslados')}
                    >
                      <span>Traslados</span>
                    </li>
                    <li 
                      className={`submenu-item ${inventarioSubsection === 'validar-inventario' ? 'active' : ''}`}
                      onClick={() => handleInventarioSubsection('validar-inventario')}
                    >
                      <span>Validar inventario</span>
                    </li>
                    <li 
                      className={`submenu-item ${inventarioSubsection === 'revision-inventario' ? 'active' : ''}`}
                      onClick={() => handleInventarioSubsection('revision-inventario')}
                    >
                      <span>Revisión de inventario</span>
                    </li>
                    <li 
                      className={`submenu-item ${inventarioSubsection === 'stock-historico' ? 'active' : ''}`}
                      onClick={() => handleInventarioSubsection('stock-historico')}
                    >
                      <span>Stock histórico</span>
                    </li>
                    <li 
                      className={`submenu-item ${inventarioSubsection === 'kardex-costo-promedio' ? 'active' : ''}`}
                      onClick={() => handleInventarioSubsection('kardex-costo-promedio')}
                    >
                      <span>Kardex costo promedio</span>
                    </li>
                  </ul>
                )}

                {item.id === 'compras' && comprasExpanded && (
                  <ul className="submenu">
                    <li 
                      className={`submenu-item ${comprasSubsection === 'ordenes-compra' ? 'active' : ''}`}
                      onClick={() => handleComprasSubsection('ordenes-compra')}
                    >
                      <span>Nueva Compra</span>
                    </li>
                    <li 
                      className={`submenu-item ${comprasSubsection === 'lista-compras' ? 'active' : ''}`}
                      onClick={() => handleComprasSubsection('lista-compras')}
                    >
                      <span>Lista de Compras</span>
                    </li> 

                    <li 
                      className={`submenu-item ${comprasSubsection === 'liquidacion-compras' ? 'active' : ''}`}
                      onClick={() => handleComprasSubsection('liquidacion-compras')}
                    >
                      <span>Liquidación de Compras</span>
                    </li>   

                    <li 
                      className={`submenu-item ${comprasSubsection === 'solicitar-cotizacion' ? 'active' : ''}`}
                      onClick={() => handleComprasSubsection('solicitar-cotizacion')}
                    >
                      <span>Solicitar Cotización</span>
                    </li>    

                    <li 
                      className={`submenu-item ${comprasSubsection === 'ordenes-compras' ? 'active' : ''}`}
                      onClick={() => handleComprasSubsection('ordenes-compras')}
                    >
                      <span>Órdenes de Compra</span>
                    </li>  

                    <li 
                      className={`submenu-item ${comprasSubsection === 'gastos-diversos' ? 'active' : ''}`}
                      onClick={() => handleComprasSubsection('gastos-diversos')}
                    >
                      <span>Gastos Diversos</span>
                    </li>   



                    
                  </ul>
                )}

                {item.id === 'proveedores' && proveedoresExpanded && (
                  <ul className="submenu">
                    <li 
                      className={`submenu-item ${proveedoresSubsection === 'nuevo-proveedor' ? 'active' : ''}`}
                      onClick={() => handleProveedoresSubsection('nuevo-proveedor')}
                    >
                      <span>Nuevo Proveedor</span>
                    </li>
                    <li 
                      className={`submenu-item ${proveedoresSubsection === 'lista-proveedores' ? 'active' : ''}`}
                      onClick={() => handleProveedoresSubsection('lista-proveedores')}
                    >
                      <span>Lista de Proveedores</span>
                    </li>
                  </ul>
                )}
              </li>
            );
          })}
        </ul> 

        <div className="sidebar-footer">
          <div className="user-info">
            <p>{usuario.nombre} {usuario.apellido}</p>
            <small>{usuario.correo}</small>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </nav>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default DashboardSuperAdmin;