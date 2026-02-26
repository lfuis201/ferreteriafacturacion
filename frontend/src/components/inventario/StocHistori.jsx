import React, { useState } from 'react';
import {
  Search,
  FileDown,
  RefreshCcw,
  Calendar,
  History,
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  Activity,
  TrendingUp,
  DollarSign,
  Package,
  Hash,
  AlertCircle
} from 'lucide-react';
import { obtenerStockHistorico, exportarStockHistoricoExcel } from '../../services/inventarioService';
import Swal from 'sweetalert2';

const StockHistorico = () => {
  const [desdelaFecha, setDesdelaFecha] = useState('');
  const [hastaFecha, setHastaFecha] = useState('');
  const [showHistorialResults, setShowHistorialResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15
  });
  const [stockHistoricoData, setStockHistoricoData] = useState([]);

  const handleBuscarHistorico = async () => {
    if (!desdelaFecha || !hastaFecha) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas Requeridas',
        text: 'Por favor, ingrese el rango de fechas completo para la auditoría.'
      });
      return;
    }

    try {
      setLoading(true);
      setError('');

      const filtros = {
        fechaDesde: desdelaFecha,
        fechaHasta: hastaFecha,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };

      const response = await obtenerStockHistorico(filtros);

      if (response && response.stockHistorico && response.stockHistorico.length > 0) {
        setStockHistoricoData(response.stockHistorico);
        setPagination({
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || 0,
          itemsPerPage: response.pagination?.itemsPerPage || 15
        });
        setShowHistorialResults(true);
      } else {
        setShowHistorialResults(true);
        setStockHistoricoData([]);
        setPagination(prev => ({ ...prev, totalItems: 0, totalPages: 1 }));
      }
    } catch (error) {
      console.error('Error al obtener stock histórico:', error);
      Swal.fire({ icon: 'error', title: 'Error de Consulta', text: error.message });
      setStockHistoricoData([]);
      setShowHistorialResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargaExcel = async () => {
    if (!desdelaFecha || !hastaFecha) {
      Swal.fire({ icon: 'warning', title: 'Rango de Fecha Vacío', text: 'Especifique las fechas antes de exportar.' });
      return;
    }

    try {
      setLoading(true);
      const filtros = { fechaDesde: desdelaFecha, fechaHasta: hastaFecha };
      await exportarStockHistoricoExcel(filtros);
      Swal.fire({ icon: 'success', title: 'Exportación Exitosa', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error de Exportación', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPagina = async (nuevaPagina) => {
    if (nuevaPagina === pagination.currentPage || nuevaPagina < 1 || nuevaPagina > pagination.totalPages) return;

    setPagination(prev => ({ ...prev, currentPage: nuevaPagina }));

    // Ejecutar búsqueda inmediata para la nueva página
    try {
      setLoading(true);
      const filtros = {
        fechaDesde: desdelaFecha,
        fechaHasta: hastaFecha,
        page: nuevaPagina,
        limit: pagination.itemsPerPage
      };
      const response = await obtenerStockHistorico(filtros);
      if (response && response.stockHistorico) {
        setStockHistoricoData(response.stockHistorico);
        setPagination(prev => ({
          ...prev,
          currentPage: response.pagination?.currentPage || nuevaPagina,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || 0
        }));
      }
    } catch (error) {
      console.error('Error al cambiar página:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-200">
            <History size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Kardex Histórico Valorizado</h2>
            <p className="text-sm font-medium text-slate-500">Auditoría detallada de movimientos físicos y contables</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBuscarHistorico}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Sincronizar
          </button>
        </div>
      </div>

      {/* Date Range Selection Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold px-1">
              <Calendar size={14} className="text-indigo-500" />
              <label>Fecha de Apertura</label>
            </div>
            <input
              type="date"
              value={desdelaFecha}
              onChange={(e) => setDesdelaFecha(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none h-12 transition shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold px-1">
              <Calendar size={14} className="text-indigo-500" />
              <label>Fecha de Cierre</label>
            </div>
            <input
              type="date"
              value={hastaFecha}
              onChange={(e) => setHastaFecha(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none h-12 transition shadow-sm"
            />
          </div>

          <div>
            <button
              className="group flex w-full h-12 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-menta-petroleo to-menta-marino text-white font-bold text-sm shadow-xl shadow-menta-petroleo/20 transition-all hover:translate-y-[-2px] active:scale-95 disabled:opacity-50 uppercase tracking-tight"
              onClick={handleBuscarHistorico}
              disabled={loading}
            >
              <Search size={20} className="group-hover:scale-110 transition-transform" />
              {loading ? 'Consultando...' : 'EJECUTAR ANÁLISIS DE STOCK'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {showHistorialResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Export & Info Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 items-center gap-2 rounded-2xl bg-indigo-50 px-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100/50">
                <Activity size={14} /> Total SKUs Analizados: {pagination.totalItems}
              </div>
            </div>
            <button
              className="group inline-flex h-11 items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-6 text-xs font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
              onClick={handleDescargaExcel}
              disabled={loading}
            >
              <FileDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
              DESCARGAR REPORTE EXCEL
            </button>
          </div>

          {/* Master Kardex Table */}
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm scrollbar-hide">
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left text-[11px] whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th rowSpan="2" className="px-5 py-4 text-center font-bold uppercase tracking-widest text-slate-400 w-12 border-r border-slate-100">#</th>
                    <th rowSpan="2" className="px-6 py-4 font-bold uppercase tracking-widest text-menta-petroleo border-r border-slate-100">Información del Producto</th>
                    <th colSpan="5" className="px-6 py-3 font-black text-center text-indigo-600 bg-indigo-50/30 uppercase tracking-[0.2em] border-r border-indigo-100/30">
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp size={14} /> MOVIMIENTO FÍSICO (UNIDADES)
                      </div>
                    </th>
                    <th colSpan="5" className="px-6 py-3 font-black text-center text-emerald-600 bg-emerald-50/30 uppercase tracking-[0.2em]">
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign size={14} /> CONTROL VALORIZADO (S/.)
                      </div>
                    </th>
                  </tr>
                  <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    <th className="px-4 py-3 text-center border-r border-slate-100">Ingreso</th>
                    <th className="px-4 py-3 text-center border-r border-slate-100">Salida</th>
                    <th className="px-4 py-3 text-center border-r border-slate-100">Saldo Periodo</th>
                    <th className="px-4 py-3 text-center border-r border-slate-100 bg-slate-100/50">S. Anterior</th>
                    <th className="px-4 py-3 text-center border-r border-indigo-100/30 font-bold text-indigo-700">S. Total</th>

                    <th className="px-4 py-3 text-center border-r border-slate-100">Ingreso</th>
                    <th className="px-4 py-3 text-center border-r border-slate-100">Salida</th>
                    <th className="px-4 py-3 text-center border-r border-slate-100">Saldo Periodo</th>
                    <th className="px-4 py-3 text-center border-r border-slate-100 bg-slate-100/50">S. Anterior</th>
                    <th className="px-4 py-3 text-center font-bold text-emerald-700">S. Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && stockHistoricoData.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generando análisis analítico...</p>
                        </div>
                      </td>
                    </tr>
                  ) : stockHistoricoData.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-200">
                          <AlertCircle size={48} />
                          <div className="space-y-1">
                            <p className="text-lg font-bold text-slate-800 uppercase tracking-tighter">Sin Movimientos</p>
                            <p className="text-xs text-slate-400 font-medium">No hay registros históricos para este rango de fechas</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    stockHistoricoData.map((item, index) => {
                      const rowNum = ((pagination.currentPage - 1) * pagination.itemsPerPage) + index + 1;
                      return (
                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 text-center font-bold text-slate-300 border-r border-slate-50/50">
                            {rowNum}
                          </td>
                          <td className="px-6 py-4 border-r border-slate-50/50">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <Hash size={14} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider leading-none mb-1">{item.codigo || 'N/A'}</span>
                                <span className="font-bold text-slate-700 uppercase leading-snug truncate max-w-[200px]">{item.producto || 'Sin descripción'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Físico */}
                          <td className="px-4 py-4 text-center font-bold text-slate-600 border-r border-slate-50/50">{(item.fisico?.ingreso || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 text-center font-bold text-slate-600 border-r border-slate-50/50">{(item.fisico?.salida || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 text-center font-bold text-slate-600 border-r border-slate-50/50">{(item.fisico?.saldo || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 text-center font-medium text-slate-400 bg-slate-50/30 border-r border-slate-50/50">{(item.fisico?.saldoAnterior || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 text-center font-black text-indigo-600 bg-indigo-50/20 border-r border-indigo-100/30">{(item.fisico?.saldoTotal || 0).toFixed(2)}</td>

                          {/* Valorizado */}
                          <td className="px-4 py-4 text-center font-bold text-slate-600 border-r border-slate-50/50">{(item.valorizado?.ingreso || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 text-center font-bold text-slate-600 border-r border-slate-50/50">{(item.valorizado?.salida || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 text-center font-bold text-slate-600 border-r border-slate-50/50">{(item.valorizado?.saldo || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 text-center font-medium text-slate-400 bg-slate-50/30 border-r border-slate-50/50">{(item.valorizado?.saldoAnterior || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 text-center font-black text-emerald-600 bg-emerald-50/20">{(item.valorizado?.saldoTotal || 0).toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-8 py-5 gap-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileBarChart size={14} className="text-slate-300" />
                MOSTRANDO <span className="text-slate-800">PAG {pagination.currentPage} / {pagination.totalPages}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCambiarPagina(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-30 active:scale-95 shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
                    let pageNum = pagination.currentPage;
                    if (pagination.currentPage <= 2) pageNum = i + 1;
                    else if (pagination.currentPage >= pagination.totalPages - 1) pageNum = pagination.totalPages - 2 + i;
                    else pageNum = pagination.currentPage - 1 + i;

                    if (pageNum > 0 && pageNum <= pagination.totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handleCambiarPagina(pageNum)}
                          className={`h-10 w-10 rounded-2xl text-xs font-black transition-all shadow-sm
                            ${pagination.currentPage === pageNum ? 'bg-indigo-600 text-white border-transparent' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-200'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => handleCambiarPagina(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                  className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-30 active:scale-95 shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome / Instruction State */}
      {!showHistorialResults && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in duration-1000">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-10 animate-pulse" />
            <div className="relative flex h-32 w-32 items-center justify-center rounded-[3rem] bg-white shadow-2xl border border-slate-100">
              <Activity size={64} className="text-indigo-500" />
            </div>
          </div>
          <div className="max-w-sm space-y-2">
            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">Auditoría Histórica de Stock</h3>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">
              Seleccione un rango de fechas en la parte superior para generar el análisis de movimientos físicos y valorizados de su inventario.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockHistorico;