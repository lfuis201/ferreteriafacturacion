import React, { useState } from 'react';
import {
  Repeat,
  RefreshCcw,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  LayoutGrid,
  Filter,
  X
} from 'lucide-react';
import { useDocumentosRecurrencia } from '../../hooks/useDocumentosRecurrencia';
import Swal from 'sweetalert2';

const DocumentoRecurrencia = () => {
  const {
    documentos,
    loading,
    error,
    filtros,
    paginacion,
    actualizarFiltros,
    buscar,
    cambiarPagina,
    refrescar
  } = useDocumentosRecurrencia();

  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  const handleFechaEmisionChange = (e) => {
    actualizarFiltros({ fechaEmision: e.target.value });
  };

  const handleBusquedaChange = (e) => {
    actualizarFiltros({ busqueda: e.target.value });
  };

  const handleBuscar = () => {
    buscar();
  };

  const handleRefrescar = () => {
    refrescar();
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto || 0);
  };

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col space-y-8 p-1 md:p-6">
      {/* Header & Title */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-menta-suave text-menta-petroleo shadow-sm">
              <Clock size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-fondo">Documentos Recurrentes</h2>
              <p className="text-sm font-medium text-slate-500">Gestión de comprobantes con emisión programada</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefrescar}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
              REFRESCAR
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-xl bg-menta-petroleo px-6 py-3 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:bg-menta-marino active:scale-95"
            >
              <div className="bg-white/20 p-1 rounded-md"><Clock size={16} /></div>
              NUEVA RECURRENCIA
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-800">
            <AlertTriangle size={24} className="shrink-0" />
            <p className="text-sm font-bold">Error: {error}</p>
          </div>
        )}
      </div>

      {/* Summary Row (Simulated stats as they aren't provided by the hook directly in UI) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap lg:flex-nowrap">
        <div className="flex-1 min-w-[200px] group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 transition hover:shadow-md text-center sm:text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Programados</p>
          <div className="mt-1 flex items-baseline justify-center sm:justify-start gap-2">
            <p className="text-3xl font-black text-fondo leading-tight">{paginacion.total || 0}</p>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">Activados</span>
          </div>
        </div>
        <div className="flex-1 min-w-[200px] group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 transition hover:shadow-md text-center sm:text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Próximos 7 días</p>
          <div className="mt-1 flex items-baseline justify-center sm:justify-start gap-2">
            <p className="text-3xl font-black text-menta-petroleo leading-tight">-</p>
            <span className="text-[10px] font-bold text-slate-400">Sin datos</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-menta-petroleo font-bold">
            <Filter size={20} />
            <span>CRITERIOS DE FILTRADO</span>
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="text-xs font-bold uppercase tracking-tighter text-slate-400 hover:text-menta-turquesa"
          >
            {mostrarFiltros ? 'Contraer' : 'Expandir'}
          </button>
        </div>

        {mostrarFiltros && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Periodo de Emisión</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-3 text-sm focus:border-menta-turquesa"
                  value={filtros.fechaEmision}
                  onChange={handleFechaEmisionChange}
                  disabled={loading}
                >
                  <option value="">Cualquier fecha</option>
                  <option value="hoy">Hoy</option>
                  <option value="esta-semana">Esta semana</option>
                  <option value="este-mes">Este mes</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Buscador Inteligente</label>
              <div className="relative font-semibold">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Serie, número o nombre del cliente..."
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-3 text-sm focus:border-menta-turquesa"
                  value={filtros.busqueda}
                  onChange={handleBusquedaChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleBuscar}
                disabled={loading}
                className="w-full flex h-[42px] items-center justify-center gap-2 rounded-xl bg-fondo px-8 text-sm font-bold text-white shadow-lg shadow-fondo/20 transition hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? <RefreshCcw size={16} className="animate-spin" /> : <Search size={18} />}
                BUSCAR DOCUMENTOS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Documents Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-xs font-bold uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-5 text-center">#</th>
                <th className="px-6 py-5">Comprobante Base</th>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5">Última Emisión</th>
                <th className="px-6 py-5 text-right">Total</th>
                <th className="px-6 py-5 text-center">Frecuencia</th>
                <th className="px-6 py-5">Estado</th>
                <th className="px-6 py-5">Próxima Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-menta-petroleo" />
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Cargando recurrencias...</p>
                    </div>
                  </td>
                </tr>
              ) : documentos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                        <Repeat size={32} />
                      </div>
                      <div>
                        <p className="text-xl font-black text-fondo">No hay recurrencias</p>
                        <p className="text-sm text-slate-400">Total: 0 documentos encontrados con los filtros actuales.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                documentos.map((doc, index) => (
                  <tr key={doc.id || index} className="group transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-5 text-center font-bold text-slate-300">
                      {((paginacion.page - 1) * paginacion.limit) + index + 1}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-menta-petroleo">
                          {doc.tipoDocumento === '01' ? 'FACTURA' : doc.tipoDocumento === '03' ? 'BOLETA' : 'VENTA'}
                        </span>
                        <span className="font-black text-slate-700 tracking-tight">{doc.serie}-{doc.numero}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <User size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="truncate max-w-[180px] font-bold text-slate-800">{doc.cliente?.nombre || 'S/N'}</span>
                          <span className="text-[10px] font-medium text-slate-400">{doc.cliente?.documento}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-medium text-slate-600">
                        <Calendar size={14} className="text-slate-300" />
                        {formatearFecha(doc.fechaEmision)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-menta-marino whitespace-nowrap">
                      {formatearMoneda(doc.total)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500 uppercase">
                        {doc.frecuencia}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-tight ${doc.estado?.toLowerCase() === 'activo' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {doc.estado?.toLowerCase() === 'activo' ? <CheckCircle size={12} /> : <X size={12} />}
                        {doc.estado || 'INACTIVO'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 font-black text-fondo">
                        <Clock size={14} className="text-menta-petroleo animate-pulse" />
                        {doc.proximaFecha ? formatearFecha(doc.proximaFecha) : 'NO PROGRAMADA'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: Pagination */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-100 bg-slate-50/30 px-8 py-6 sm:flex-row">
          <div className="text-sm font-medium text-slate-400">
            Mostrando <span className="font-black text-fondo">{documentos.length}</span> de <span className="font-black text-fondo">{paginacion.total || 0}</span> recurrencias
          </div>

          <div className="flex items-center gap-1.5">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 disabled:opacity-30"
              onClick={() => cambiarPagina(paginacion.page - 1)}
              disabled={paginacion.page <= 1 || loading}
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: Math.min(5, paginacion.totalPages) }, (_, i) => {
              let pageNumber;
              if (paginacion.totalPages <= 5) pageNumber = i + 1;
              else if (paginacion.page <= 3) pageNumber = i + 1;
              else if (paginacion.page >= paginacion.totalPages - 2) pageNumber = paginacion.totalPages - 4 + i;
              else pageNumber = paginacion.page - 2 + i;

              if (pageNumber < 1 || pageNumber > paginacion.totalPages) return null;

              return (
                <button
                  key={pageNumber}
                  className={`flex h-10 min-w-[40px] items-center justify-center rounded-xl px-2 text-sm font-black transition ${paginacion.page === pageNumber
                      ? 'bg-menta-petroleo text-white shadow-lg shadow-menta-petroleo/20'
                      : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'
                    }`}
                  onClick={() => cambiarPagina(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 disabled:opacity-30"
              onClick={() => cambiarPagina(paginacion.page + 1)}
              disabled={paginacion.page >= paginacion.totalPages || loading}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentoRecurrencia;