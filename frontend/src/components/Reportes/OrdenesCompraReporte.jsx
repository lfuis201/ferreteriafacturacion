import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Package,
  Clock,
  ChevronRight,
  Search,
  FileText,
  Tags,
  User,
  AlertCircle,
  XCircle,
  CheckCircle2,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { obtenerReporteComprasTotales, exportarComprasExcel } from '../../services/compraService';
import { obtenerProveedores } from '../../services/proveedorService';

const OrdenesCompraReporte = ({ onBack }) => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    proveedor: '',
    estado: ''
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  useEffect(() => {
    cargarOrdenes();
  }, [filtros.fechaDesde, filtros.fechaHasta, filtros.proveedor, filtros.estado]);

  const cargarProveedores = async () => {
    try {
      const response = await obtenerProveedores({ activo: true });
      setProveedores(response.proveedores || []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setError('Error al cargar proveedores');
    }
  };

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      setError(null);

      const filtrosServicio = {};
      if (filtros.fechaDesde) filtrosServicio.fechaInicio = filtros.fechaDesde;
      if (filtros.fechaHasta) filtrosServicio.fechaFin = filtros.fechaHasta;
      if (filtros.proveedor) filtrosServicio.proveedor = filtros.proveedor;
      if (filtros.estado) filtrosServicio.estado = filtros.estado;

      const response = await obtenerReporteComprasTotales(filtrosServicio);

      const ordenesFormateadas = response.compras.map(compra => ({
        id: compra.id,
        numero: compra.numeroComprobante || `OC-${compra.id}`,
        fecha: compra.fechaCompra,
        proveedor: compra.Proveedor?.nombre || 'Proveedor no especificado',
        estado: compra.estado,
        montoTotal: parseFloat(compra.total || 0),
        cantidadItems: compra.DetalleCompras?.length || 0,
        responsable: compra.responsable || 'No asignado',
        observaciones: compra.observaciones || 'Sin observaciones'
      }));

      setOrdenes(ordenesFormateadas);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      setError('Error al cargar las órdenes de compra');
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  const exportarReporte = async () => {
    try {
      const filtrosExportacion = {};
      if (filtros.fechaDesde) filtrosExportacion.fechaInicio = filtros.fechaDesde;
      if (filtros.fechaHasta) filtrosExportacion.fechaFin = filtros.fechaHasta;
      if (filtros.proveedor) filtrosExportacion.proveedor = filtros.proveedor;
      if (filtros.estado) filtrosExportacion.estado = filtros.estado;

      await exportarComprasExcel(filtrosExportacion);
    } catch (error) {
      console.error('Error al exportar reporte:', error);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
      proveedor: '',
      estado: ''
    });
  };

  // Cálculos de resumen
  const totalOrdenes = ordenes.length;
  const montoTotalOrdenes = ordenes.reduce((sum, o) => sum + o.montoTotal, 0);
  const ordenesPendientes = ordenes.filter(o => o.estado === 'PENDIENTE').length;
  const ordenesCompletadas = ordenes.filter(o => o.estado === 'COMPLETADA').length;
  const promedioMonto = totalOrdenes > 0 ? montoTotalOrdenes / totalOrdenes : 0;

  const getStatusStyle = (estado) => {
    switch (estado) {
      case 'COMPLETADA': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PENDIENTE': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'ANULADA': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header Visual */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-10 text-white shadow-2xl shadow-indigo-900/20">
          <div className="absolute right-0 top-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 rotate-12">
            <ShoppingCart size={300} />
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
                <span>Logística de Compras</span>
              </div>
            </div>

            <h1 className="text-4xl font-black tracking-tighter uppercase mb-4 leading-none">
              Órdenes de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">Adquisición</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium leading-relaxed uppercase tracking-wide text-[10px]">
              Seguimiento detallado de pedidos a proveedores, estados de entrega y balances financieros por periodo.
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 px-1">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <BarChart3 size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Pedidos</p>
              <p className="text-3xl font-black text-slate-800 tabular-nums">{totalOrdenes}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Inversión Total</p>
              <div className="flex items-baseline gap-1 font-black text-slate-800">
                <span className="text-sm">S/</span>
                <p className="text-3xl tabular-nums">{montoTotalOrdenes.toLocaleString('es-PE', { minimumFractionDigits: 1 })}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md border-b-4 border-b-amber-500">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pendientes</p>
              <p className="text-3xl font-black text-slate-800 tabular-nums">{ordenesPendientes}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Completadas</p>
              <p className="text-3xl font-black text-slate-800 tabular-nums">{ordenesCompletadas}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ticket Promedio</p>
              <div className="flex items-baseline gap-1 font-black text-slate-800">
                <span className="text-sm text-slate-400">S/</span>
                <p className="text-2xl tabular-nums">{promedioMonto.toLocaleString('es-PE', { minimumFractionDigits: 1 })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Section */}
        <div className="rounded-[2.5rem] bg-white border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                <Calendar size={14} /> Fecha Inicio
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700 text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                <Calendar size={14} /> Fecha Fin
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700 text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                <User size={14} /> Proveedor
              </label>
              <div className="relative">
                <select
                  value={filtros.proveedor}
                  onChange={(e) => setFiltros({ ...filtros, proveedor: e.target.value })}
                  className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-indigo-500 appearance-none font-bold text-slate-700 uppercase text-xs"
                >
                  <option value="">Todos los proveedores</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={18} />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={limpiarFiltros}
                className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
              >
                Limpiar
              </button>
              <button
                onClick={exportarReporte}
                className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Download size={16} /> Excel
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
              Historial de Órdenes ({ordenes.length})
            </h3>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Procesando datos...</p>
              </div>
            ) : ordenes.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Documento</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">F. Compra</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Proveedor</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Estado</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inversión</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ordenes.map((orden) => (
                    <tr key={orden.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                            <FileText size={18} />
                          </div>
                          <div>
                            <span className="text-sm font-black text-slate-800 block uppercase">{orden.numero}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {orden.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-600">
                        {new Date(orden.fecha).toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[11px] font-black text-slate-700 uppercase">{orden.proveedor}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusStyle(orden.estado)}`}>
                            {orden.estado}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-slate-800 tabular-nums">S/ {orden.montoTotal.toFixed(2)}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Sin Impuestos</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                          <Package size={12} />
                          {orden.cantidadItems}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-32 px-10">
                <ShoppingCart size={60} className="mx-auto text-slate-100 mb-6" />
                <h4 className="text-xl font-black text-slate-300 uppercase tracking-tighter mb-2">Sin coincidencias</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">
                  Ajusta los filtros o selecciona otro rango de fechas para visualizar las órdenes.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrdenesCompraReporte;