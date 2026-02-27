import React, { useState } from 'react';
import {
  Home,
  ShoppingCart,
  DollarSign,
  ClipboardList,
  Truck,
  TrendingUp,
  ChevronRight,
  Package,
  Users,
  Search,
  FileText,
  Briefcase
} from 'lucide-react';
// import '../../styles/Reportes.css'; // Removed legacy CSS
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
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-10 text-white shadow-2xl shadow-indigo-900/20">
          <div className="absolute right-0 top-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <TrendingUp size={300} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-12 rounded-full bg-indigo-500"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Panel de Inteligencia</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-4 leading-none">
              Centro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Reportes</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium leading-relaxed">
              Analiza el rendimiento de tu negocio con reportes detallados de ventas, compras e inventario. Selecciona una categoría para comenzar.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">

          {/* Category: Compras */}
          <div className="group rounded-[2.5rem] border border-slate-200 bg-white p-2 shadow-sm transition-all hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-200">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Compras</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Abastecimiento & Gastos</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'compras-totales', label: 'Compras Totales', icon: TrendingUp },
                  { id: 'producto-busqueda', label: 'Búsqueda de Producto', icon: Search },
                  { id: 'productos', label: 'Reporte de Productos', icon: Package },
                  { id: 'ordenes-compra', label: 'Órdenes de Compra', icon: FileText },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleReporteClick(item.id)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-200 transition-all group/item"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-emerald-500 group-hover/item:text-white transition-colors" />
                      <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category: Ventas */}
          <div className="group rounded-[2.5rem] border border-slate-200 bg-white p-2 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Ventas</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ingresos & Clientes</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'ventas-resumidas', label: 'Ventas Resumidas', icon: TrendingUp },
                  { id: 'ventas-por-cliente', label: 'Top de Clientes', icon: Users },
                  { id: 'ventas-por-vendedor', label: 'Reporte Vendedores', icon: Briefcase },
                  { id: 'cotizaciones', label: 'Cotizaciones', icon: FileText },
                  { id: 'notas-venta', label: 'Notas de Venta', icon: FileText },
                  { id: 'consolidado-items-ventas', label: 'Consolidado Ítems', icon: Package },
                  { id: 'ventas-consolidado', label: 'Ventas Consolidado', icon: ClipboardList },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleReporteClick(item.id)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-200 transition-all group/item"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-indigo-500 group-hover/item:text-white transition-colors" />
                      <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category: Comisiones & Utilidad */}
          <div className="group rounded-[2.5rem] border border-slate-200 bg-white p-2 shadow-sm transition-all hover:shadow-xl hover:shadow-violet-500/5 hover:border-violet-200">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition-transform group-hover:scale-110">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Comisiones</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rentabilidad & Incentivos</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'utilidad-ventas', label: 'Utilidad de Ventas', icon: TrendingUp },
                  { id: 'ventas-comisiones', label: 'Comisiones Ventas', icon: DollarSign },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleReporteClick(item.id)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-violet-600 hover:text-white hover:border-violet-500 hover:shadow-lg hover:shadow-violet-200 transition-all group/item"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-violet-500 group-hover/item:text-white transition-colors" />
                      <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category: Operatividad */}
          <div className="group rounded-[2.5rem] border border-slate-200 bg-white p-2 shadow-sm transition-all hover:shadow-xl hover:shadow-cyan-500/5 hover:border-cyan-200">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 transition-transform group-hover:scale-110">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Logística</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pedidos & Guías</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'pedidos-general', label: 'Pedidos General', icon: ClipboardList },
                  { id: 'pedidos-consolidado-items', label: 'Pedidos Consolidado', icon: Package },
                  { id: 'guias-consolidado-items', label: 'Guías Consolidado', icon: Truck },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleReporteClick(item.id)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-cyan-600 hover:text-white hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-200 transition-all group/item"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-cyan-500 group-hover/item:text-white transition-colors" />
                      <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Reportes;