import React, { useState } from 'react';
import '../../styles/Reportes.css';
import ComprasTotales from './ComprasTotales';
import ActivosFijos from './ActivosFijos';
import ProductoBusquedaIndividual from './ProductoBusquedaIndividual';
import ProductosReporte from './ProductosReporte';
import OrdenesCompraReporte from './OrdenesCompraReporte';

// Importar todos los componentes de reportes de Ventas
import VentasResumidas from './VentasResumidas';
import VentasDetalladas from './VentasDetalladas';
import VentasPorCliente from './VentasPorCliente';
import VentasPorProducto from './VentasPorProducto';
import VentasPorVendedor from './VentasPorVendedor';
import VentasPorFecha from './VentasPorFecha';
import VentasPorCategoria from './VentasPorCategoria';
import VentasPorSucursal from './VentasPorSucursal';
import VentasPorFormaPago from './VentasPorFormaPago';
import VentasAnuladas from './VentasAnuladas';
import VentasPorHora from './VentasPorHora';
import VentasPorMarca from './VentasPorMarca';
import VentasCredito from './VentasCredito';
import VentasContado from './VentasContado';
import VentasPorTipoDocumento from './VentasPorTipoDocumento';
import VentasConsolidadoItems from './VentasConsolidadoItems';
import VentasConsolidado from './VentasConsolidado';
import CotizacionesReporte from './CotizacionesReporte';
import NotasVentaReporte from './NotasVentaReporte';

// Importar componentes de Comisiones
import ComisionesVendedores from './ComisionesVendedores';
import ComisionesDetalladas from './ComisionesDetalladas';
import ComisionesPorPeriodo from './ComisionesPorPeriodo'; 



import ComisionesVentas from './ComisionesVentas';

// Importar componentes de Pedidos
import PedidosGeneral from './PedidosGeneral';
import PedidosConsolidadoItems from './PedidosConsolidadoItems';

// Importar componentes de Guías
import GuiasConsolidadoItems from './GuiasConsolidadoItems';

const Reportes = () => {
  const [reporteActivo, setReporteActivo] = useState(null);

  const handleReporteClick = (tipoReporte) => {
    setReporteActivo(tipoReporte);
  };

  const handleVolver = () => {
    setReporteActivo(null);
  };

  // Si hay un reporte activo, mostrar ese componente
  if (reporteActivo) {
    switch (reporteActivo) {
      // Reportes de Compras
      case 'compras-totales':
        return <ComprasTotales onBack={handleVolver} />;

      case 'activos-fijos':
        return <ActivosFijos onBack={handleVolver} />;

      case 'producto-busqueda':
        return <ProductoBusquedaIndividual onBack={handleVolver} />;

      case 'productos':
        return <ProductosReporte onBack={handleVolver} />;

      case 'ordenes-compra':
        return <OrdenesCompraReporte onBack={handleVolver} />;
        
      // Reportes de Ventas
      case 'ventas-resumidas':
        return <VentasResumidas onBack={handleVolver} />;
      case 'ventas-detalladas':
        return <VentasDetalladas onBack={handleVolver} />;
      case 'ventas-por-cliente':
        return <VentasPorCliente onBack={handleVolver} />;
      case 'ventas-por-producto':
        return <VentasPorProducto onBack={handleVolver} />;
      case 'ventas-por-vendedor':
        return <VentasPorVendedor onBack={handleVolver} />;
      case 'ventas-por-fecha':
        return <VentasPorFecha onBack={handleVolver} />;
      case 'ventas-por-categoria':
        return <VentasPorCategoria onBack={handleVolver} />;
      case 'ventas-por-sucursal':
        return <VentasPorSucursal onBack={handleVolver} />;
      case 'ventas-por-forma-pago':
        return <VentasPorFormaPago onBack={handleVolver} />;
      case 'ventas-anuladas':
        return <VentasAnuladas onBack={handleVolver} />;
      case 'ventas-por-hora':
        return <VentasPorHora onBack={handleVolver} />;
      case 'ventas-por-marca':
        return <VentasPorMarca onBack={handleVolver} />;
      case 'ventas-credito':
        return <VentasCredito onBack={handleVolver} />;
      case 'ventas-contado':
        return <VentasContado onBack={handleVolver} />;
      case 'ventas-por-tipo-documento':
        return <VentasPorTipoDocumento onBack={handleVolver} />;
      case 'consolidado-items-ventas':
        return <VentasConsolidadoItems onBack={handleVolver} />;
      case 'ventas-consolidado':
        return <VentasConsolidado onBack={handleVolver} />;
      case 'productos-ventas':
        return <VentasPorProducto onBack={handleVolver} />;
      case 'cotizaciones':
        return <CotizacionesReporte onBack={handleVolver} />;
      case 'notas-venta':
        return <NotasVentaReporte onBack={handleVolver} />;
        
      // Reportes de Comisiones
      case 'ventas-comisiones':
        return <ComisionesVentas onBack={handleVolver} />;
      case 'utilidad-ventas':
        // Por ahora, reutilizamos el mismo componente para habilitar navegación.
        // Si se requiere cálculo de utilidad específico, se implementa en un componente aparte.
        return <ComisionesVentas onBack={handleVolver} />;
      case 'comisiones-vendedores':
        return <ComisionesVendedores onBack={handleVolver} />;
      case 'comisiones-detalladas':
        return <ComisionesDetalladas onBack={handleVolver} />;
      case 'comisiones-por-periodo':
        return <ComisionesPorPeriodo onBack={handleVolver} />;
        
      // Reportes de Pedidos
      case 'pedidos-general':
        return <PedidosGeneral onBack={handleVolver} />;
      case 'pedidos-consolidado-items':
        return <PedidosConsolidadoItems onBack={handleVolver} />;
        
      // Reportes de Guías
      case 'guias-consolidado-items':
        return <GuiasConsolidadoItems onBack={handleVolver} />;
        
      default:
        return null;
    }
  }

  return (
    <div className="reportes-container">
      {/* Header */}
      <div className="reportes-header">
        <span className="home-icon">🏠</span>
        <span className="breadcrumb">DASHBOARD</span>
        <span className="separator">/</span>
        <span className="breadcrumb active">REPORTES</span>
      </div>

      {/* Grid de secciones */}
      <div className="reportes-grid">
        {/* Sección General 
        <div className="reporte-section">
          <h3 className="section-title">General</h3>
          <ul className="section-list"> 
              <li><a href="#" className="section-link">Consistencia documentos</a></li>
           
            <li><a href="#" className="section-link">Validador de documentos</a></li>
            <li><a href="#" className="section-link">Análisis comercial</a></li>
            <li><a href="#" className="section-link">Descarga masiva - documentos</a></li>
            <li><a href="#" className="section-link">Bandeja descarga de reportes</a></li>
            <li><a href="#" className="section-link">Actividades del sistema</a></li>
          </ul>
        </div>*/}

        {/* Sección Compras */}
        <div className="reporte-section">
          <h3 className="section-title">Compras</h3>
          <ul className="section-list">
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('compras-totales');
                }}
              >
                Compras totales
              </a>
            </li>
{/*
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('activos-fijos');
                }}
              >
                Activos fijos
              </a>
            </li>
*/ }
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('producto-busqueda');
                }}
              >
                Producto - búsqueda individual
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('productos');
                }}
              >
                Productos
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('ordenes-compra');
                }}
              >
                Órdenes de compra
              </a>
            </li>
          </ul>
        </div>












        

        {/* Sección Ventas */}
        <div className="reporte-section">
          <h3 className="section-title">Ventas</h3>
          <ul className="section-list">
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('ventas-resumidas');
                }}
              >
                Ventas resumidas
              </a>
            </li> 



         
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('ventas-por-cliente');
                }}
              >
                Clientes
              </a>
            </li>



            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('ventas-por-vendedor');
                }}
              >
                Ventas por Vendedor - Detallado - Consolidado
              </a>
            </li> 


            
           
           
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('producto-busqueda');
                }}
              >
                Producto - búsqueda individual
              </a>
            </li>



            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('productos-ventas');
                }}
              >
                Productos
              </a>
            </li>



            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('cotizaciones');
                }}
              >
                Cotizaciones
              </a>
            </li>



            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('notas-venta');
                }}
              >
                Notas de Venta
              </a>
            </li>



           
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('consolidado-items-ventas');
                }}
              >
                Consolidado de ítems
              </a>
            </li>



            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('ventas-consolidado');
                }}
              >
                Ventas consolidado
              </a>
            </li>
          </ul>
        </div>








        {/* Sección Ventas/Comisiones */}
        <div className="reporte-section">
          <h3 className="section-title">Ventas/Comisiones</h3>
          <ul className="section-list">
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('utilidad-ventas');
                }}
              >
                Utilidad ventas
              </a>
            </li>


            
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('ventas-comisiones');
                }}
              >
                Ventas
              </a>
            </li>
         
          </ul>
        </div>





        

        {/* Sección Pedidos */}
        <div className="reporte-section">
          <h3 className="section-title">Pedidos</h3>
          <ul className="section-list">
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('pedidos-general');
                }}
              >
                General
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('pedidos-consolidado-items');
                }}
              >
                Consolidado de ítems
              </a>
            </li>
          </ul>
        </div>









        {/* Sección Guías */}
        <div className="reporte-section">
          <h3 className="section-title">Guías</h3>
          <ul className="section-list">
            <li>
              <a 
                href="#" 
                className="section-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleReporteClick('guias-consolidado-items');
                }}
              >
                Consolidado de ítems
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reportes;