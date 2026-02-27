import React, { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  Calendar,
  Box,
  Download,
  FileDown,
  RefreshCcw,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Layout,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Filter,
  Package,
  Clock,
  Info
} from 'lucide-react';
import {
  consultarKardex,
  obtenerProductosActivos,
  exportarKardexExcel,
  exportarKardexPdf
} from '../../services/inventarioService';
import Swal from 'sweetalert2';

const ConsultaKardex = () => {
  const [producto, setProducto] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaTermino, setFechaTermino] = useState('');
  const [showKardexResults, setShowKardexResults] = useState(false);
  const [kardexData, setKardexData] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await obtenerProductosActivos();
      setProductos(response.data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
    }
  };

  const handleBuscarKardex = async () => {
    if (!producto) {
      Swal.fire('Atención', 'Por favor seleccione un producto', 'warning');
      return;
    }

    if (!fechaInicio || !fechaTermino) {
      Swal.fire('Atención', 'Por favor seleccione el rango de fechas', 'warning');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const filtros = {
        productoId: producto,
        fechaInicio: fechaInicio,
        fechaFin: fechaTermino
      };

      const response = await consultarKardex(filtros);

      const movimientosTransformados = response.movimientos?.map((movimiento, index) => ({
        id: movimiento.id || index + 1,
        fechaHoraTransaccion: new Date(movimiento.createdAt).toLocaleString('es-ES'),
        tipoTransaccion: movimiento.tipoMovimiento || '-',
        numero: movimiento.numeroDocumento || '-',
        nvAsociada: movimiento.notaVentaId || '-',
        docAsociado: movimiento.documentoAsociado || '-',
        fechaEmision: movimiento.fechaEmision ? new Date(movimiento.fechaEmision).toLocaleDateString('es-ES') : '-',
        entrada: movimiento.tipoMovimiento === 'ENTRADA' ? movimiento.cantidad : 0,
        precio: movimiento.precioUnitario || 0,
        totalCompra: movimiento.tipoMovimiento === 'ENTRADA' ? (movimiento.cantidad * movimiento.precioUnitario) : 0,
        salida: movimiento.tipoMovimiento === 'SALIDA' ? movimiento.cantidad : 0,
        precioVenta: movimiento.tipoMovimiento === 'SALIDA' ? (movimiento.precioUnitario || 0) : 0,
        totalVenta: movimiento.tipoMovimiento === 'SALIDA' ? (movimiento.cantidad * (movimiento.precioUnitario || 0)) : 0,
        saldo: movimiento.saldoActual || 0,
        costoUnit: movimiento.costoUnitario || 0,
        saldoFinal: movimiento.valorSaldo || 0
      })) || [];

      setKardexData(movimientosTransformados);
      setShowKardexResults(true);

      if (movimientosTransformados.length === 0) {
        Swal.fire('Información', 'No se encontraron movimientos para los criterios seleccionados', 'info');
      }
    } catch (error) {
      console.error('Error al consultar kardex:', error);
      Swal.fire('Error', 'Ocurrió un error al consultar el Kardex', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportarPDF = async () => {
    try {
      setLoading(true);
      const filtros = {
        productoId: producto,
        fechaInicio: fechaInicio,
        fechaFin: fechaTermino
      };
      await exportarKardexPdf(filtros);
      Swal.fire('¡Éxito!', 'Kardex exportado a PDF correctamente', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo exportar el PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportarExcel = async () => {
    try {
      setLoading(true);
      const filtros = {
        productoId: producto,
        fechaInicio: fechaInicio,
        fechaFin: fechaTermino
      };
      await exportarKardexExcel(filtros);
      Swal.fire('¡Éxito!', 'Kardex exportado a Excel correctamente', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo exportar el Excel', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(monto || 0);
  };

  const getTipoBadge = (tipo) => {
    const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ";
    if (tipo?.toUpperCase() === 'ENTRADA') {
      return <span className={base + "bg-emerald-50 text-emerald-600"}><ArrowUpRight size={12} /> ENTRADA</span>;
    }
    return <span className={base + "bg-blue-50 text-blue-600"}><ArrowDownRight size={12} /> SALIDA</span>;
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/30 min-h-screen">

      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-menta-petroleo to-menta-marino p-8 text-white shadow-2xl shadow-menta-petroleo/20">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-menta-turquesa/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
              <Layout size={32} className="text-menta-turquesa" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase">Kardex <span className="text-menta-turquesa">Analítico</span></h1>
              <p className="text-sm font-medium text-menta-claro/80 tracking-widest uppercase">Consulta de Costo Promedio y Movimientos</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-md border border-white/10">
            <Activity size={18} className="text-menta-turquesa animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Estado: <span className="text-emerald-400">En línea</span></span>
          </div>
        </div>
      </div>

      {/* Search & Filters Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-8 flex items-center gap-3 border-b border-slate-50 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Filter size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-[0.15em]">Criterios de Búsqueda</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="md:col-span-6 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Producto</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <select
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
                className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 focus:border-menta-turquesa focus:bg-white focus:ring-4 focus:ring-menta-turquesa/10 outline-none transition-all appearance-none"
              >
                <option value="">Seleccione un producto para analizar...</option>
                {productos.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.codigo} - {prod.nombre} (Stock: {prod.stock})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-3 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Fecha Inicial</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 focus:border-menta-turquesa focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-3 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Fecha Final</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="date"
                value={fechaTermino}
                onChange={(e) => setFechaTermino(e.target.value)}
                className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 focus:border-menta-turquesa focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-12 pt-4">
            <button
              onClick={handleBuscarKardex}
              disabled={loading}
              className="group flex w-full h-14 items-center justify-center gap-3 rounded-2xl bg-menta-petroleo text-white font-bold text-sm shadow-xl shadow-menta-petroleo/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em]"
            >
              {loading ? (
                <RefreshCcw size={22} className="animate-spin" />
              ) : (
                <>
                  <Search size={22} className="group-hover:scale-110 transition-transform" />
                  EJECUTAR AUDITORÍA KARDEX
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Info Alert */}
      {!showKardexResults && (
        <div className="flex items-center gap-4 rounded-2xl bg-amber-50 p-6 border border-amber-100 animate-in fade-in zoom-in duration-500">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-200">
            <Info size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 uppercase">Instrucciones de Consulta</h4>
            <p className="text-xs font-medium text-amber-800/80 leading-relaxed">
              Seleccione un producto y un rango de fechas para visualizar el historial detallado de movimientos, ingresos, salidas y la valorización del inventario bajo el método de costo promedio ponderado.
            </p>
          </div>
        </div>
      )}

      {/* Results View */}
      {showKardexResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 items-center gap-3 rounded-2xl bg-indigo-50 px-5 text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100 shadow-sm">
                <Clock size={14} /> Total Movimientos: {kardexData.length}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportarPDF}
                className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-xs font-bold text-slate-600 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 shadow-sm"
              >
                <FileText size={18} /> PDF
              </button>
              <button
                onClick={handleExportarExcel}
                className="flex h-11 items-center gap-2 rounded-2xl bg-emerald-600 px-6 text-xs font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
              >
                <FileDown size={18} /> EXCEL
              </button>
            </div>
          </div>

          {/* Master Table */}
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="bg-slate-900 text-white uppercase tracking-widest h-16">
                    <th className="px-6 py-4 text-center border-r border-white/10 font-black w-12">#</th>
                    <th className="px-6 py-4 border-r border-white/10 font-black">Información de Transacción</th>
                    <th className="px-6 py-4 border-r border-white/10 text-center font-black bg-emerald-500/10 text-emerald-400">Entradas (Compras)</th>
                    <th className="px-6 py-4 border-r border-white/10 text-center font-black bg-blue-500/10 text-blue-400">Salidas (Ventas)</th>
                    <th className="px-6 py-4 text-center font-black bg-orange-500/10 text-orange-400">Stock & Valorización</th>
                  </tr>
                  <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    <td className="px-6 py-3 border-r border-slate-200"></td>
                    <td className="px-6 py-3 border-r border-slate-200">Fecha | Documento | Motivo</td>
                    <td className="px-0 py-0 border-r border-slate-200">
                      <div className="grid grid-cols-3 divide-x divide-slate-200">
                        <div className="px-3 py-3 text-center">Cant.</div>
                        <div className="px-3 py-3 text-center">Prec.</div>
                        <div className="px-3 py-3 text-center">Total</div>
                      </div>
                    </td>
                    <td className="px-0 py-0 border-r border-slate-200">
                      <div className="grid grid-cols-3 divide-x divide-slate-200">
                        <div className="px-3 py-3 text-center">Cant.</div>
                        <div className="px-3 py-3 text-center">Prec.</div>
                        <div className="px-3 py-3 text-center">Total</div>
                      </div>
                    </td>
                    <td className="px-0 py-0">
                      <div className="grid grid-cols-3 divide-x divide-slate-200">
                        <div className="px-3 py-3 text-center">S. Físico</div>
                        <div className="px-3 py-3 text-center">C. Prom</div>
                        <div className="px-3 py-3 text-center">S. Valor</div>
                      </div>
                    </td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kardexData.map((item, index) => (
                    <tr key={item.id} className="group transition hover:bg-slate-50/80">
                      <td className="px-6 py-5 text-center text-slate-300 font-bold border-r border-slate-50 italic">
                        {index + 1}
                      </td>
                      <td className="px-6 py-5 border-r border-slate-50">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-800 font-bold">{item.fechaHoraTransaccion}</span>
                            {getTipoBadge(item.tipoTransaccion)}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-bold">
                            <span className="flex items-center gap-1 text-slate-400"><FileText size={12} /> {item.numero}</span>
                            <span className="text-slate-200">|</span>
                            <span className="text-slate-500 uppercase">{item.nvAsociada !== '-' ? `NV: ${item.nvAsociada}` : item.docAsociado}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-0 py-0 border-r border-slate-50 bg-emerald-50/10">
                        <div className="grid grid-cols-3 h-full divide-x divide-slate-50">
                          <div className={`px-3 py-5 text-center font-bold ${item.entrada > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                            {item.entrada || '-'}
                          </div>
                          <div className="px-3 py-5 text-center text-slate-500 font-medium">
                            {item.entrada > 0 ? formatearMoneda(item.precio) : '-'}
                          </div>
                          <div className="px-3 py-5 text-center font-black text-emerald-700">
                            {item.totalCompra > 0 ? formatearMoneda(item.totalCompra) : '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-0 py-0 border-r border-slate-50 bg-blue-50/10">
                        <div className="grid grid-cols-3 h-full divide-x divide-slate-50">
                          <div className={`px-3 py-5 text-center font-bold ${item.salida > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                            {item.salida || '-'}
                          </div>
                          <div className="px-3 py-5 text-center text-slate-500 font-medium">
                            {item.salida > 0 ? formatearMoneda(item.precioVenta) : '-'}
                          </div>
                          <div className="px-3 py-5 text-center font-black text-blue-700">
                            {item.totalVenta > 0 ? formatearMoneda(item.totalVenta) : '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-0 py-0 bg-orange-50/10">
                        <div className="grid grid-cols-3 h-full divide-x divide-slate-50">
                          <div className="px-3 py-5 text-center font-black text-slate-900 border-l border-slate-200/50">
                            {item.saldo}
                          </div>
                          <div className="px-3 py-5 text-center text-slate-600 font-bold">
                            {formatearMoneda(item.costoUnit)}
                          </div>
                          <div className="px-3 py-5 text-center font-black text-orange-600">
                            {formatearMoneda(item.saldoFinal)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-8 py-6">
              <span className="text-xs font-bold text-slate-400">
                AUDITORÍA COMPLETADA - <span className="text-slate-800">{kardexData.length}</span> REGISTROS ANALIZADOS
              </span>
              <div className="flex items-center gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-300 transition-colors hover:bg-slate-50 disabled:opacity-30" disabled>
                  <ChevronFirst size={18} />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-300 transition-colors hover:bg-slate-50 disabled:opacity-30" disabled>
                  <ChevronLeft size={18} />
                </button>
                <div className="flex h-9 min-w-[36px] items-center justify-center rounded-xl bg-menta-petroleo px-3 text-xs font-black text-white shadow-lg shadow-menta-petroleo/20">
                  1
                </div>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-300 transition-colors hover:bg-slate-50 disabled:opacity-30" disabled>
                  <ChevronRight size={18} />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-300 transition-colors hover:bg-slate-50 disabled:opacity-30" disabled>
                  <ChevronLast size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultaKardex;