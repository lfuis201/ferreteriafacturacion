import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Package, BarChart3, TrendingUp, Eye, SearchCode, History, Info, Layers, Tag, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { obtenerProductosConInventario } from '../../services/productoService';
import { obtenerMovimientosInventario } from '../../services/inventarioService';
// import { text, bg, border, themeClasses } from '../../theme'; // Removed as some specific tokens might differ
// import '../../styles/ProductoBusquedaIndividual.css'; // Removed legacy CSS

const ProductoBusquedaIndividual = ({ onBack }) => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await obtenerProductosConInventario();
      const productosData = response.productos || response.data || [];

      // Transformar los datos para que coincidan con la estructura esperada
      const productosTransformados = productosData.map(producto => ({
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.Categoria?.nombre || 'Sin categoría',
        marca: producto.marca || 'Sin marca',
        stockActual: producto.Inventarios?.[0]?.cantidad || 0,
        stockMinimo: producto.stockMinimo || 0,
        precioCompra: parseFloat(producto.precioCompra) || 0,
        precioVenta: parseFloat(producto.precioVenta) || 0,
        proveedor: producto.Proveedor?.nombre || 'Sin proveedor'
      }));

      setProductos(productosTransformados);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductos([]);
    }
  };

  const cargarMovimientosProducto = async (productoId) => {
    try {
      setLoading(true);
      const fechaFin = new Date();
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaFin.getDate() - 30);

      const filtros = {
        productoId: productoId,
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0]
      };

      const response = await obtenerMovimientosInventario(filtros);
      const movimientosData = response.movimientos || response.data || [];

      const movimientosTransformados = movimientosData.map((movimiento, index) => {
        const stockAnterior = movimiento.stockAnterior || 0;
        let stockNuevo = stockAnterior;

        if (movimiento.tipoMovimiento === 'ENTRADA') {
          stockNuevo = stockAnterior + movimiento.cantidad;
        } else if (movimiento.tipoMovimiento === 'SALIDA') {
          stockNuevo = stockAnterior - movimiento.cantidad;
        } else if (movimiento.tipoMovimiento === 'AJUSTE') {
          stockNuevo = stockAnterior + movimiento.cantidad;
        }

        return {
          id: movimiento.id || index + 1,
          fecha: movimiento.fechaRegistro || movimiento.createdAt,
          tipo: movimiento.tipoMovimiento === 'ENTRADA' ? 'Entrada' :
            movimiento.tipoMovimiento === 'SALIDA' ? 'Salida' :
              movimiento.tipoMovimiento === 'AJUSTE' ? 'Ajuste' : 'Otro',
          cantidad: movimiento.cantidad,
          motivo: movimiento.motivo || movimiento.tipoMovimiento,
          documento: movimiento.documentoRelacionadoId || movimiento.numeroDocumento || '-',
          stockAnterior: stockAnterior,
          stockNuevo: stockNuevo
        };
      });

      setMovimientos(movimientosTransformados);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      setMovimientos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    cargarMovimientosProducto(producto.id);
  };

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    producto.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    producto.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const calcularRotacion = () => {
    if (!productoSeleccionado || movimientos.length === 0) return 0;
    const salidas = movimientos.filter(m => m.tipo === 'Salida').reduce((sum, m) => sum + m.cantidad, 0);
    return salidas / 30;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header con breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Reportería</span>
                <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-600">Stock Individual</span>
              </div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Análisis de <span className="text-cyan-600">Producto</span></h1>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full md:w-[400px] h-14 pl-12 pr-4 rounded-[1.25rem] border border-slate-200 bg-white shadow-sm outline-none focus:border-cyan-500 transition-all font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Panel Izquierdo: Buscador y Lista */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-cyan-500"></div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Resultados ({productosFiltrados.length})</h3>
                </div>
              </div>

              <div className="max-h-[700px] overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-3">
                  {productosFiltrados.length > 0 ? (
                    productosFiltrados.map(producto => (
                      <button
                        key={producto.id}
                        onClick={() => handleSeleccionarProducto(producto)}
                        className={`w-full text-left p-4 rounded-2xl transition-all border group relative ${productoSeleccionado?.id === producto.id
                          ? 'bg-cyan-600 border-cyan-500 shadow-lg shadow-cyan-200 text-white'
                          : 'bg-white border-slate-100 hover:border-cyan-300 hover:bg-cyan-50/50'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className={`font-black uppercase text-sm ${productoSeleccionado?.id === producto.id ? 'text-white' : 'text-slate-800'}`}>
                            {producto.nombre}
                          </h5>
                          <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${productoSeleccionado?.id === producto.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {producto.codigo}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wide opacity-80">
                          <div className="flex items-center gap-1.5">
                            <Layers size={12} /> {producto.categoria}
                          </div>
                          <div className="flex items-center gap-1.5 text-cyan-500">
                            <span className={`h-2 w-2 rounded-full ${producto.stockActual > producto.stockMinimo ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`}></span>
                            Stock: {producto.stockActual}
                          </div>
                        </div>

                        {productoSeleccionado?.id === producto.id && (
                          <div className="absolute right-4 bottom-4">
                            <ChevronRight size={20} className="text-white/40" />
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-12 px-4">
                      <SearchCode size={40} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No encontramos productos que coincidan</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Panel Derecho: Detalle */}
          <div className="lg:col-span-8 space-y-8">
            {productoSeleccionado ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-[2rem] bg-white border border-slate-200 p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                      <Package size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Disponibilidad</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-slate-800 tabular-nums">{productoSeleccionado.stockActual}</p>
                        <span className={`text-[10px] font-black uppercase ${productoSeleccionado.stockActual > productoSeleccionado.stockMinimo ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`}>
                          {productoSeleccionado.stockActual > productoSeleccionado.stockMinimo ? 'Optimo' : 'Escaso'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-slate-900 p-6 shadow-xl shadow-slate-200 flex items-center gap-5 text-white">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-400">
                      <TrendingUp size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Precio Venta</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-cyan-400">S/</span>
                        <p className="text-3xl font-black tabular-nums">{(parseFloat(productoSeleccionado.precioVenta) || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-white border border-slate-200 p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md border-b-4 border-b-cyan-500">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                      <BarChart3 size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Rotación (30d)</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-slate-800 tabular-nums">{calcularRotacion().toFixed(2)}</p>
                        <span className="text-[10px] font-black text-slate-400 uppercase">u/día</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center"><Info size={16} /></div>
                      Ficha de Identidad
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-slate-50 group hover:px-2 transition-all rounded-lg hover:bg-slate-50/50">
                        <span className="text-[10px] font-black uppercase text-slate-400">Código</span>
                        <span className="text-sm font-black text-slate-700">{productoSeleccionado.codigo}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-slate-50 group hover:px-2 transition-all rounded-lg hover:bg-slate-50/50">
                        <span className="text-[10px] font-black uppercase text-slate-400">Nombre</span>
                        <span className="text-sm font-black text-slate-700">{productoSeleccionado.nombre}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-slate-50 group hover:px-2 transition-all rounded-lg hover:bg-slate-50/50">
                        <span className="text-[10px] font-black uppercase text-slate-400">Categoría</span>
                        <span className="text-sm font-black text-slate-700">{productoSeleccionado.categoria}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-slate-50 group hover:px-2 transition-all rounded-lg hover:bg-slate-50/50">
                        <span className="text-[10px] font-black uppercase text-slate-400">Marca</span>
                        <span className="text-sm font-black text-slate-700">{productoSeleccionado.marca}</span>
                      </div>
                      <div className="flex justify-between py-3 group hover:px-2 transition-all rounded-lg hover:bg-slate-50/50">
                        <span className="text-[10px] font-black uppercase text-slate-400">Proveedor</span>
                        <span className="text-sm font-black text-slate-700">{productoSeleccionado.proveedor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center"><ShieldAlert size={16} /></div>
                      Seguridad y Márgenes
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-slate-50 bg-cyan-50/30 px-4 rounded-2xl">
                        <span className="text-[10px] font-black uppercase text-cyan-600">Stock Crítico</span>
                        <span className="text-sm font-black text-cyan-700">{productoSeleccionado.stockMinimo} unid.</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-slate-50 group hover:px-2 transition-all rounded-lg hover:bg-slate-50/50">
                        <span className="text-[10px] font-black uppercase text-slate-400">Costo de Adquisición</span>
                        <span className="text-sm font-black text-slate-700">S/ {(parseFloat(productoSeleccionado.precioCompra) || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 bg-emerald-50/30 px-4 rounded-2xl group transition-all">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-emerald-600 mb-1 leading-none">Margen Bruto</span>
                          <span className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-tighter">Sobre costo</span>
                        </div>
                        <span className="text-2xl font-black text-emerald-700">
                          {(() => {
                            const v = parseFloat(productoSeleccionado.precioVenta) || 0;
                            const c = parseFloat(productoSeleccionado.precioCompra) || 0;
                            return c === 0 ? '0.0' : (((v - c) / c) * 100).toFixed(1);
                          })()}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center"><History size={16} /></div>
                      Trazabilidad de Inventario (Últimos 30 días)
                    </h4>
                  </div>

                  <div className="overflow-x-auto min-h-[300px]">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="h-10 w-10 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analizando historial...</p>
                      </div>
                    ) : movimientos.length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fecha</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Evento</th>
                            <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cantidad</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Concepto</th>
                            <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {movimientos.map(mov => (
                            <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-8 py-4 text-xs font-bold text-slate-600 whitespace-nowrap">
                                {new Date(mov.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-8 py-4">
                                <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${mov.tipo === 'Entrada' ? 'bg-emerald-50 text-emerald-600' :
                                  mov.tipo === 'Salida' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                  {mov.tipo === 'Entrada' ? <PlusCircle size={10} /> : mov.tipo === 'Salida' ? <MinusCircle size={10} /> : <Adjust size={10} />}
                                  {mov.tipo}
                                </span>
                              </td>
                              <td className={`px-8 py-4 text-right text-sm font-black tabular-nums ${mov.tipo === 'Entrada' ? 'text-emerald-600' : mov.tipo === 'Salida' ? 'text-rose-600' : 'text-slate-800'
                                }`}>
                                {mov.tipo === 'Salida' ? '-' : '+'}{mov.cantidad}
                              </td>
                              <td className="px-8 py-4 text-xs font-bold text-slate-500 max-w-[200px] truncate uppercase group-hover:whitespace-normal group-hover:overflow-visible">
                                {mov.motivo}
                              </td>
                              <td className="px-8 py-4 text-right">
                                <div className="flex flex-col items-end">
                                  <span className="text-sm font-black text-slate-800 tabular-nums">{mov.stockNuevo}</span>
                                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Antes: {mov.stockAnterior}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-20 px-8">
                        <History size={40} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Sin movimientos registrados recientemente</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50 min-h-[600px]">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-cyan-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                  <Package size={100} className="relative text-cyan-200" />
                </div>
                <h4 className="text-2xl font-black text-slate-300 uppercase tracking-tighter mb-4">Seleccione un Producto</h4>
                <p className="text-slate-400 max-w-xs text-sm font-medium leading-relaxed">
                  Elija un ítem de la lista de la izquierda para ver su trazabilidad completa, márgenes de ganancia e historial de stock.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const PlusCircle = ({ size, className }) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
const MinusCircle = ({ size, className }) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
const Adjust = ({ size, className }) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>;

export default ProductoBusquedaIndividual;