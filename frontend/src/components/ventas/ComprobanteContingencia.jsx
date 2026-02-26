import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCcw,
  Download,
  Settings,
  User,
  ChevronFirst,
  ChevronLast,
  LayoutGrid,
  FileCode,
  FilePieChart,
  ChevronDown,
  Code
} from 'lucide-react';
import useComprobanteContingencia from '../../hooks/useComprobanteContingencia';
import Swal from 'sweetalert2';

const ComprobanteContingencia = () => {
  // Hook para manejar datos de comprobantes de contingencia
  const {
    comprobantes,
    loading,
    error,
    filtros,
    paginacion,
    resumen,
    actualizarFiltros,
    buscar,
    cambiarPagina,
    refrescar,
    reenviarComprobante,
    descargarArchivo
  } = useComprobanteContingencia();

  // Estados locales para UI
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [mostrarMenuColumnas, setMostrarMenuColumnas] = useState(false);

  // Estado para controlar visibilidad de columnas
  const [columnasVisibles, setColumnasVisibles] = useState({
    usuario: true,
    exportacion: false,
    gratuita: false,
    inafecta: false,
    exonerado: false
  });

  // Manejadores de eventos
  const handleTipoComprobanteChange = (e) => {
    actualizarFiltros({ tipoComprobante: e.target.value });
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

  const handleReenviarComprobante = async (comprobanteId) => {
    const result = await Swal.fire({
      title: '¿Reenviar a SUNAT?',
      text: '¿Está seguro de que desea reenviar este comprobante de contingencia?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reenviar',
      confirmButtonColor: '#126171',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Reenviando...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      const resultado = await reenviarComprobante(comprobanteId);
      if (resultado.success) {
        Swal.fire('¡Éxito!', 'Comprobante reenviado exitosamente', 'success');
      } else {
        Swal.fire('Error', resultado.mensaje, 'error');
      }
    }
  };

  const handleDescargarArchivo = async (comprobanteId, tipo) => {
    const resultado = await descargarArchivo(comprobanteId, tipo);
    if (!resultado.success) {
      Swal.fire('Error', resultado.mensaje, 'error');
    }
  };

  const toggleColumna = (columna) => {
    setColumnasVisibles(prev => ({
      ...prev,
      [columna]: !prev[columna]
    }));
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-200">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Comprobantes de Contingencia</h2>
            <p className="text-sm font-medium text-slate-500">Gestión de facturas y boletas emitidas por contingencia</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefrescar}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-menta-petroleo shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Alert logic */}
      {resumen?.pendientes > 0 && (
        <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-amber-800 shadow-sm border-l-4 border-l-amber-500 animate-in slide-in-from-left duration-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-tight">Atención: Pendientes de Envío</p>
            <p className="text-xs font-medium text-amber-700/80">Tiene <span className="font-bold underline">{resumen.pendientes}</span> comprobantes pendientes de informar a SUNAT.</p>
          </div>
        </div>
      )}

      {/* Resumen Cards Row */}
      <div className="grid grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-menta-petroleo group-hover:text-white transition-colors">
              <FilePieChart size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Casos</p>
              <p className="text-2xl font-bold text-slate-800">{resumen?.totalComprobantes || 0}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-200" />
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-amber-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
              <Clock size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600">{resumen?.pendientes || 0}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-amber-500" />
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-red-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-500 group-hover:text-white">
              <AlertTriangle size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">Con Error</p>
              <p className="text-2xl font-bold text-red-600">{resumen?.conError || 0}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-red-500" />
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-red-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700 transition-colors group-hover:bg-red-700 group-hover:text-white">
              <XCircle size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-700 mb-1">Rechazados</p>
              <p className="text-2xl font-bold text-red-800">{resumen?.rechazados || 0}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-red-700" />
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-in zoom-in-95 duration-300">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-menta-turquesa">
              <Filter size={18} />
            </div>
            <h3 className="text-sm font-bold text-menta-petroleo uppercase tracking-tight">Panel de Búsqueda</h3>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMostrarMenuColumnas(!mostrarMenuColumnas)}
              className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-menta-petroleo transition-colors"
            >
              <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
              Columnas
            </button>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-menta-marino transition-colors"
            >
              {mostrarFiltros ? 'Contraer' : 'Expandir'}
            </button>
          </div>
        </div>

        {mostrarMenuColumnas && (
          <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-5 animate-in fade-in slide-in-from-top-2 duration-200">
            {Object.keys(columnasVisibles).map((col) => (
              <label key={col} className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600 hover:text-menta-petroleo transition-colors px-2 py-1.5 rounded-lg hover:bg-white">
                <input
                  type="checkbox"
                  checked={columnasVisibles[col]}
                  onChange={() => toggleColumna(col)}
                  className="h-4 w-4 rounded border-slate-300 text-menta-petroleo focus:ring-menta-petroleo/20 transition-all"
                />
                <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        )}

        {mostrarFiltros && (
          <div className="flex flex-row items-end gap-4 animate-in fade-in duration-300 overflow-x-auto pb-2">
            <div className="w-64 shrink-0 space-y-2">
              <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                <FileText size={14} className="text-menta-turquesa" />
                <label>Tipo de Documento</label>
              </div>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 outline-none transition"
                  value={filtros.tipoComprobante}
                  onChange={handleTipoComprobanteChange}
                  disabled={loading}
                >
                  <option value="">Todos los documentos</option>
                  <option value="FACTURA">Facturas</option>
                  <option value="BOLETA">Boletas</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-[200px] space-y-2">
              <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                <Search size={14} className="text-menta-turquesa" />
                <label>Búsqueda General</label>
              </div>
              <input
                type="text"
                placeholder="Serie o correlativo (ej. F001-234)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 outline-none transition placeholder:text-slate-300"
                value={filtros.busqueda}
                onChange={handleBusquedaChange}
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
              />
            </div>

            <div className="shrink-0">
              <button
                onClick={handleBuscar}
                disabled={loading}
                className="group h-11 flex items-center justify-center gap-2 rounded-xl bg-menta-petroleo text-white px-6 font-bold transition shadow-lg shadow-menta-petroleo/20 active:scale-95 disabled:opacity-50 uppercase tracking-tighter"
              >
                {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Search size={18} className="group-hover:scale-110 transition-transform" />}
                BUSCAR
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">#</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Emisión</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Detalle Cliente</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">N° Comprobante</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Estado SUNAT</th>
                {columnasVisibles.usuario && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Usuario</th>}
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Impuestos</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Total</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Documentos</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && comprobantes.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-amber-500" />
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Sincronizando contingencia...</p>
                    </div>
                  </td>
                </tr>
              ) : comprobantes.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-4">
                      <FilePieChart size={48} className="text-slate-200" />
                      <div className="space-y-1">
                        <p className="text-lg font-bold uppercase tracking-tighter">Sin registros</p>
                        <p className="text-xs">No se detectaron comprobantes registrados</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                comprobantes.map((comp, index) => (
                  <tr key={comp.id || index} className="group transition hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                      {((paginacion.page - 1) * paginacion.limit) + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Calendar size={14} className="text-slate-300" />
                        {new Date(comp.fechaEmision).toLocaleDateString('es-PE')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col overflow-hidden max-w-[200px]">
                        <span className="truncate text-sm font-semibold text-slate-700 uppercase" title={comp.cliente}>
                          {comp.cliente || 'CONSUMIDOR FINAL'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">CONTINGENCIA EMITIDA</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-menta-petroleo tracking-tighter uppercase">
                        {comp.comprobante || `${comp.serie}-${comp.numero}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase ring-1 ${comp.estadoSunat?.toLowerCase() === 'aceptado' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' :
                        comp.estadoSunat?.toLowerCase() === 'rechazado' ? 'bg-red-50 text-red-600 ring-red-100' :
                          'bg-amber-50 text-amber-600 ring-amber-100'
                        }`}>
                        {comp.estadoSunat?.toLowerCase() === 'aceptado' ? <CheckCircle size={12} className="shrink-0" /> :
                          comp.estadoSunat?.toLowerCase() === 'rechazado' ? <XCircle size={12} className="shrink-0" /> : <Clock size={12} className="shrink-0" />}
                        {comp.estadoSunat || 'PENDIENTE'}
                      </span>
                    </td>
                    {columnasVisibles.usuario && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <User size={12} className="text-slate-300" />
                          {comp.usuario || '-'}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 text-[10px]">
                        <div className="flex justify-between gap-4 text-slate-400">
                          <span>Gravado:</span>
                          <span className="font-bold text-slate-600">S/. {comp.subtotal || '0.00'}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-400 border-t border-slate-50 pt-0.5">
                          <span>IGV (18%):</span>
                          <span className="font-bold text-slate-600">S/. {comp.igv || '0.00'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-slate-900 tracking-tighter">
                        S/. {comp.total || '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleDescargarArchivo(comp.id, 'xml')}
                          className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-50 px-2 text-[10px] font-bold text-slate-500 hover:bg-menta-petroleo hover:text-white transition-all active:scale-95"
                          title="Descargar XML"
                        >
                          <FileCode size={12} />
                          XML
                        </button>
                        <button
                          onClick={() => handleDescargarArchivo(comp.id, 'pdf')}
                          className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-50 px-2 text-[10px] font-bold text-slate-500 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                          title="Descargar PDF"
                        >
                          <FileText size={12} />
                          PDF
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleReenviarComprobante(comp.id)}
                        className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 hover:bg-menta-turquesa hover:text-white hover:shadow-lg hover:shadow-menta-turquesa/20 transition-all active:scale-95"
                        title="Reenviar a SUNAT"
                        disabled={loading}
                      >
                        <Send size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-100 bg-slate-50/30 px-8 py-6 sm:flex-row">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Mostrando <span className="font-bold text-menta-marino">{comprobantes.length}</span> de <span className="font-bold text-menta-marino">{paginacion.totalItems || 0}</span> documentos
          </p>
          <div className="flex items-center gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20 active:scale-90"
              onClick={() => cambiarPagina(1)}
              disabled={paginacion.page === 1 || loading}
            >
              <ChevronFirst size={20} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20 active:scale-90"
              onClick={() => cambiarPagina(paginacion.page - 1)}
              disabled={!paginacion.hasPrevPage || loading}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex h-10 min-w-[40px] items-center justify-center rounded-xl bg-amber-500 px-4 text-sm font-bold text-white shadow-lg shadow-amber-500/20">
              {paginacion.page}
            </div>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20 active:scale-90"
              onClick={() => cambiarPagina(paginacion.page + 1)}
              disabled={!paginacion.hasNextPage || loading}
            >
              <ChevronRight size={20} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20 active:scale-90"
              onClick={() => cambiarPagina(paginacion.totalPages)}
              disabled={paginacion.page === paginacion.totalPages || loading}
            >
              <ChevronLast size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprobanteContingencia;