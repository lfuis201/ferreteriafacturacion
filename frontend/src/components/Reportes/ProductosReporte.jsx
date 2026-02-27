import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Package,
  Filter,
  Download,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Search,
  Layers,
  ChevronRight,
  CheckCircle2,
  Building2,
  Calendar,
  FileText
} from 'lucide-react';
import { obtenerProductosConInventario, exportarProductosExcel } from '../../services/productoService';
import { obtenerCategorias } from '../../services/categoriaService';
import { obtenerSucursales } from '../../services/sucursalService';

const ProductosReporte = ({ onBack }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    categoriaId: '',
    sucursalId: '',
    busqueda: '',
    stockBajo: false,
    sinStock: false
  });
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);

  useEffect(() => {
    cargarInitialData();
  }, []);

  const cargarInitialData = async () => {
    try {
      setLoading(true);
      const [respCats, respSucs] = await Promise.all([
        obtenerCategorias(),
        obtenerSucursales()
      ]);
      setCategorias(respCats.categorias || respCats.data || []);
      setSucursales(respSucs.sucursales || respSucs.data || []);
      await cargarProductos();
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await obtenerProductosConInventario({
        categoriaId: filtros.categoriaId,
        sucursalId: filtros.sucursalId,
        nombre: filtros.busqueda
      });
      const productosData = response.productos || response.data || [];

      const productosTransformados = productosData.map(producto => ({
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.Categorium?.nombre || 'Sin categoría',
        marca: producto.marca || 'Sin marca',
        stockActual: producto.stock || 0,
        stockMinimo: producto.stockMinimo || 0,
        precioCompra: parseFloat(producto.precioCompra) || 0,
        precioVenta: parseFloat(producto.precioVenta) || 0,
        valorInventario: (producto.stock || 0) * (parseFloat(producto.precioCompra) || 0),
        ultimaVenta: producto.updatedAt || producto.createdAt,
        rotacion: Math.random() * 5 // Simulación
      }));

      setProductos(productosTransformados);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const filtrarProductosLocalmente = () => {
    return productos.filter(producto => {
      if (filtros.stockBajo && producto.stockActual > producto.stockMinimo) return false;
      if (filtros.sinStock && producto.stockActual > 0) return false;
      return true;
    });
  };

  const handleAplicarFiltros = () => {
    cargarProductos();
  };

  const exportarReporte = async () => {
    try {
      setLoading(true);
      await exportarProductosExcel({
        categoriaId: filtros.categoriaId,
        sucursalId: filtros.sucursalId
      });
    } catch (error) {
      console.error('Error al exportar:', error);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = filtrarProductosLocalmente();

  // Cálculos de resumen
  const totalStock = productosFiltrados.reduce((sum, p) => sum + p.stockActual, 0);
  const valorTotalInventario = productosFiltrados.reduce((sum, p) => sum + p.valorInventario, 0);
  const productosCriticos = productosFiltrados.filter(p => p.stockActual <= p.stockMinimo).length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header Visual */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 p-10 text-white shadow-2xl shadow-indigo-900/20">
          <div className="absolute right-0 top-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <Package size={300} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={onBack}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">
                <span>Reportería</span>
                <span className="h-1 w-1 rounded-full bg-indigo-500"></span>
                <span>Inventario Global</span>
              </div>
            </div>

            <h1 className="text-4xl font-black tracking-tighter uppercase mb-4 leading-none">
              Reporte de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">Existencias</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium leading-relaxed uppercase tracking-wide text-[10px]">
              Control total de stock, valoración de inventario y análisis de reposición crítica por sucursal y categoría.
            </p>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Package size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Items Registrados</p>
              <p className="text-3xl font-black text-slate-800 tabular-nums">{productosFiltrados.length}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <Building2 size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Capital en Stock</p>
              <div className="flex items-baseline gap-1 font-black text-slate-800">
                <span className="text-sm">S/</span>
                <p className="text-3xl tabular-nums">{valorTotalInventario.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md border-b-4 border-b-rose-500">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Reponer Urgente</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-slate-800 tabular-nums">{productosCriticos}</p>
                <span className="text-[10px] font-black text-rose-500 uppercase animate-pulse">Alertas</span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Unidades Totales</p>
              <p className="text-3xl font-black text-slate-800 tabular-nums">{totalStock}</p>
            </div>
          </div>
        </div>

        {/* Filtros Modernos */}
        <div className="rounded-[2.5rem] bg-white border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
          <div className="flex flex-col lg:flex-row items-end gap-6">
            <div className="w-full lg:w-1/4 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Búsqueda Directa</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Nombre o código..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700 uppercase text-xs"
                />
              </div>
            </div>

            <div className="w-full lg:w-1/5 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Categoría</label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={filtros.categoriaId}
                  onChange={(e) => setFiltros({ ...filtros, categoriaId: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-indigo-500 appearance-none font-bold text-slate-700 uppercase text-xs"
                >
                  <option value="">Todas</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>

            <div className="w-full lg:w-1/5 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Sucursal</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={filtros.sucursalId}
                  onChange={(e) => setFiltros({ ...filtros, sucursalId: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-indigo-500 appearance-none font-bold text-slate-700 uppercase text-xs"
                >
                  <option value="">Todas</option>
                  {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-3 px-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filtros.stockBajo}
                  onChange={(e) => setFiltros({ ...filtros, stockBajo: e.target.checked })}
                  className="hidden"
                />
                <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${filtros.stockBajo ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 group-hover:border-indigo-500'}`}>
                  {filtros.stockBajo && <CheckCircle2 size={14} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stock Bajo</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filtros.sinStock}
                  onChange={(e) => setFiltros({ ...filtros, sinStock: e.target.checked })}
                  className="hidden"
                />
                <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${filtros.sinStock ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-200 group-hover:border-rose-500'}`}>
                  {filtros.sinStock && <AlertTriangle size={14} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sin Stock</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAplicarFiltros}
                disabled={loading}
                className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-200 hover:bg-slate-900 transition-all flex items-center gap-3 disabled:opacity-50"
              >
                <Filter size={18} />
                Procesar
              </button>
              <button
                onClick={exportarReporte}
                className="h-14 px-6 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-3"
              >
                <Download size={18} />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center text-slate-800 font-bold uppercase tracking-tight">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-4 w-4 rounded-full bg-indigo-500"></div>
              Detalle de Inventario ({productosFiltrados.length} Items)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Item / Código</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Categoría & Marca</th>
                  <th className="px-8 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Disponibilidad</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Valores (S/)</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ult. Act.</th>
                  <th className="px-8 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rent.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 uppercase line-clamp-1">{item.nombre}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.codigo}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-600 uppercase">{item.categoria}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">{item.marca}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.stockActual === 0 ? 'bg-rose-100 text-rose-600' :
                          item.stockActual <= item.stockMinimo ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                          {item.stockActual} Unid.
                        </div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Min: {item.stockMinimo}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex flex-col text-right">
                        <span className="text-[11px] font-black text-slate-800 tabular-nums">Venta: S/ {item.precioVenta.toFixed(2)}</span>
                        <span className="text-[9px] font-bold text-slate-400 tabular-nums uppercase">Costo: S/ {item.precioCompra.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <span className="text-xs font-bold text-slate-500 tabular-nums">
                        {new Date(item.ultimaVenta).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <div className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                        <TrendingUp size={12} />
                        {item.rotacion.toFixed(1)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductosReporte;