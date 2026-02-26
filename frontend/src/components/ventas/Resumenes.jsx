import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  RefreshCcw,
  Calendar,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileCode,
  Archive,
  Filter,
  ChevronFirst,
  ChevronLast,
  ChevronDown,
  FileCheck,
  Zap,
  Ticket,
  Terminal,
  Info,
  Layers
} from 'lucide-react';
import resumenService from '../../services/resumenService';
import Swal from 'sweetalert2';

const Resumenes = () => {
  const [fechaEmision, setFechaEmision] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [resumenes, setResumenes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [fechaComprobantes, setFechaComprobantes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paginacion, setPaginacion] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [comprobantes, setComprobantes] = useState([]);

  // Cargar resúmenes al montar el componente
  useEffect(() => {
    cargarResumenes();
  }, [paginacion.page]);

  // Función para cargar resúmenes
  const cargarResumenes = async (filtros = {}) => {
    try {
      setLoading(true);
      setError('');

      const filtrosCompletos = {
        ...filtros,
        page: paginacion.page,
        limit: paginacion.limit
      };

      const response = await resumenService.obtenerResumenes(filtrosCompletos);

      if (response.success) {
        setResumenes(response.data.resumenes || []);
        setPaginacion(prev => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0
        }));
      } else {
        setError(response.message || 'Error al cargar resúmenes');
      }
    } catch (error) {
      console.error('Error al cargar resúmenes:', error);
      setError('Error al cargar resúmenes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    const filtros = {};
    if (fechaEmision) filtros.fechaEmision = fechaEmision;
    if (busqueda) filtros.busqueda = busqueda;

    setPaginacion(prev => ({ ...prev, page: 1 }));
    cargarResumenes(filtros);
  };

  const handleNuevo = () => {
    setMostrarModal(true);
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setFechaComprobantes('');
    setComprobantes([]);
    setError('');
  };

  const handleBuscarComprobantes = async () => {
    if (!fechaComprobantes) {
      Swal.fire({
        title: 'Atención',
        text: 'Por favor selecciona una fecha',
        icon: 'warning',
        confirmButtonColor: '#126171'
      });
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await resumenService.obtenerComprobantesPorFecha(fechaComprobantes);

      if (response.success) {
        setComprobantes(response.data || []);
        if (response.data.length === 0) {
          Swal.fire({
            title: 'Información',
            text: 'No se encontraron comprobantes para la fecha seleccionada',
            icon: 'info',
            confirmButtonColor: '#126171'
          });
        }
      } else {
        setError(response.message || 'Error al buscar comprobantes');
      }
    } catch (error) {
      setError('Error al buscar comprobantes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearResumen = async () => {
    if (!fechaComprobantes) {
      Swal.fire({
        title: 'Atención',
        text: 'Por favor selecciona una fecha',
        icon: 'warning',
        confirmButtonColor: '#126171'
      });
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await resumenService.crearResumen({ fechaComprobantes });

      if (response.success) {
        handleCerrarModal();
        cargarResumenes();
        Swal.fire({
          title: '¡Éxito!',
          text: 'Resumen creado exitosamente',
          icon: 'success',
          confirmButtonColor: '#126171'
        });
      } else {
        setError(response.message || 'Error al crear resumen');
        Swal.fire({
          title: 'Error',
          text: response.message || 'Error al crear resumen',
          icon: 'error',
          confirmButtonColor: '#126171'
        });
      }
    } catch (error) {
      setError('Error al crear resumen: ' + error.message);
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async (resumenId, formato = 'pdf') => {
    try {
      setLoading(true);
      await resumenService.descargarResumen(resumenId, formato);
    } catch (error) {
      Swal.fire('Error', 'Error al descargar: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPages) {
      setPaginacion(prev => ({ ...prev, page: nuevaPagina }));
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-menta-petroleo to-menta-marino text-white shadow-xl shadow-menta-petroleo/20">
            <Archive size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Resúmenes Diarios</h2>
            <p className="text-sm font-medium text-slate-500">Gestión de resúmenes de boletas de venta y notas vinculadas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => cargarResumenes()}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-menta-petroleo shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
          <button
            onClick={handleNuevo}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-6 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:translate-y-[-1px] active:scale-95 uppercase tracking-tighter"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            NUEVO RESUMEN
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 animate-in slide-in-from-top-4 duration-500">
        <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
              <Layers size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Generados</p>
              <p className="text-2xl font-bold text-slate-800">{paginacion.total || 0}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-menta-petroleo" />
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Aceptados SUNAT</p>
              <p className="text-2xl font-bold text-emerald-600">
                {resumenes.filter(r => r.estado?.toLowerCase() === 'aceptado').length}
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500" />
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-amber-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600">
                {resumenes.filter(r => !r.estado || r.estado?.toLowerCase() === 'enviado').length}
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-amber-500" />
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-red-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">Rechazados</p>
              <p className="text-2xl font-bold text-red-600">
                {resumenes.filter(r => r.estado?.toLowerCase() === 'rechazado').length}
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-red-500" />
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-in zoom-in-95 duration-300">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <Calendar size={14} className="text-menta-turquesa" />
              <span>Periodo de Emisión</span>
            </div>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 outline-none transition"
                value={fechaEmision}
                onChange={(e) => setFechaEmision(e.target.value)}
              >
                <option value="">Cualquier fecha</option>
                <option value="hoy">Hoy</option>
                <option value="ayer">Ayer</option>
                <option value="esta-semana">Esta semana</option>
                <option value="este-mes">Este mes</option>
                <option value="mes-anterior">Mes anterior</option>
                <option value="personalizado">Personalizado</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <Search size={14} className="text-menta-turquesa" />
              <span>Identificador / Ticket</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="RC-20251001-XXXXX..."
                className="w-full rounded-xl border border-slate-100 bg-slate-50/50 py-2.5 px-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 outline-none transition placeholder:text-slate-300"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
              />
            </div>
          </div>

          <div className="flex items-end gap-3 min-w-[140px]">
            <button
              onClick={handleBuscar}
              className="group w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-menta-petroleo text-white font-bold transition hover:bg-menta-marino shadow-lg shadow-menta-petroleo/20 active:scale-95 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Search size={18} className="group-hover:scale-110 transition-transform" />}
              BUSCAR
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">#</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Emisión</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Referencia</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Identificador</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Estado SUNAT</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">N° Ticket</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Descargas</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && resumenes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-menta-turquesa" />
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Cargando datos...</p>
                    </div>
                  </td>
                </tr>
              ) : resumenes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-4">
                      <Archive size={48} className="text-slate-200" />
                      <div className="space-y-1">
                        <p className="text-lg font-bold uppercase tracking-tighter">Sin resúmenes</p>
                        <p className="text-xs">No se detectaron registros de resúmenes diarios</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                resumenes.map((resumen, index) => (
                  <tr key={resumen.id || index} className="group transition hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                      {((paginacion.page - 1) * paginacion.limit) + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Calendar size={14} className="text-slate-300" />
                        {new Date(resumen.fechaEmision).toLocaleDateString('es-PE')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <FileCheck size={14} className="text-slate-300" />
                        {new Date(resumen.fechaReferencia).toLocaleDateString('es-PE')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-menta-petroleo tracking-tighter uppercase">{resumen.identificador}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase ring-1 ${resumen.estado?.toLowerCase() === 'aceptado' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' :
                        resumen.estado?.toLowerCase() === 'rechazado' ? 'bg-red-50 text-red-600 ring-red-100' :
                          'bg-amber-50 text-amber-600 ring-amber-100'
                        }`}>
                        {resumen.estado?.toLowerCase() === 'aceptado' ? <CheckCircle size={12} /> :
                          resumen.estado?.toLowerCase() === 'rechazado' ? <XCircle size={12} /> : <Clock size={12} />}
                        {resumen.estado || 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Ticket size={12} className="text-slate-300" />
                        <span className="text-xs font-mono font-semibold text-slate-500">{resumen.ticket || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleDescargar(resumen.id, 'pdf')}
                          className="flex h-9 items-center gap-2 rounded-xl bg-slate-50 px-3 text-[10px] font-bold text-slate-500 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                          title="Descargar PDF"
                          disabled={loading}
                        >
                          <FileText size={14} />
                          PDF
                        </button>
                        <button
                          onClick={() => handleDescargar(resumen.id, 'xml')}
                          className="group/btn flex h-9 items-center gap-2 rounded-xl bg-slate-50 px-3 text-[10px] font-bold text-slate-500 hover:bg-menta-petroleo hover:text-white transition-all active:scale-95"
                          title="Descargar XML"
                          disabled={loading}
                        >
                          <Terminal size={14} />
                          XML
                        </button>
                        <button
                          onClick={() => handleDescargar(resumen.id, 'cdr')}
                          className="group/btn flex h-9 items-center gap-2 rounded-xl bg-slate-50 px-3 text-[10px] font-bold text-slate-500 hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                          title="Descargar CDR"
                          disabled={loading}
                        >
                          <CheckCircle size={14} />
                          CDR
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all">
                        <MoreVertical size={18} />
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
            Mostrando <span className="font-bold text-menta-marino">{resumenes.length}</span> de <span className="font-bold text-menta-marino">{paginacion.total}</span> registros
          </p>
          <div className="flex items-center gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20"
              onClick={() => handleCambiarPagina(1)}
              disabled={paginacion.page === 1 || loading}
            >
              <ChevronFirst size={20} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20"
              onClick={() => handleCambiarPagina(paginacion.page - 1)}
              disabled={paginacion.page <= 1 || loading}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex h-10 min-w-[40px] items-center justify-center rounded-xl bg-menta-petroleo text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20">
              {paginacion.page}
            </div>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20"
              onClick={() => handleCambiarPagina(paginacion.page + 1)}
              disabled={paginacion.page >= paginacion.totalPages || loading}
            >
              <ChevronRight size={20} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20"
              onClick={() => handleCambiarPagina(paginacion.totalPages)}
              disabled={paginacion.page === paginacion.totalPages || loading}
            >
              <ChevronLast size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Register Summary Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-400 border border-slate-100">
            {/* Modal Header */}
            <div className="relative flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6">
              <div className="flex items-center gap-4 text-slate-700">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-menta-turquesa text-white shadow-lg shadow-menta-turquesa/20">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-menta-petroleo uppercase tracking-tight">Registrar Resumen Diario</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Sincronización masiva de documentos</p>
                </div>
              </div>
              <button
                onClick={handleCerrarModal}
                className="group flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              {error && (
                <div className="flex items-center gap-4 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 animate-in slide-in-from-top-2">
                  <AlertTriangle size={20} className="shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight">Error</p>
                    <p className="text-xs opacity-80">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                  <Calendar size={14} className="text-menta-turquesa" />
                  <span>Fecha de comprobantes</span>
                </div>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-100 bg-slate-50/50 py-3 px-4 text-sm font-semibold outline-none focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/5 transition-all shadow-inner"
                  value={fechaComprobantes}
                  onChange={(e) => setFechaComprobantes(e.target.value)}
                />
              </div>

              <button
                onClick={handleBuscarComprobantes}
                disabled={loading}
                className="group w-full flex h-12 items-center justify-center gap-3 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50 uppercase tracking-tighter"
              >
                {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Search size={18} className="group-hover:scale-110 transition-transform" />}
                BUSCAR DOCUMENTOS PENDIENTES
              </button>

              {/* Comprobantes Table/List in Modal */}
              {comprobantes.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-[10px] font-bold uppercase text-menta-marino tracking-widest">Detectados ({comprobantes.length})</h4>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-2 space-y-1 custom-scrollbar">
                    {comprobantes.slice(0, 50).map((comp, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-white p-2.5 text-xs shadow-sm border border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-1.5 rounded-full bg-menta-turquesa" />
                          <div className="flex flex-col">
                            <span className="font-bold text-menta-petroleo uppercase tracking-tight">{comp.serie}-{comp.numero}</span>
                            <span className="text-[9px] text-slate-400 font-medium uppercase">{comp.tipoComprobante}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-800 text-sm">S/ {comp.total}</span>
                      </div>
                    ))}
                    {comprobantes.length > 50 && (
                      <div className="text-center py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        y {comprobantes.length - 50} documentos más...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-8 py-5">
              <button
                onClick={handleCerrarModal}
                className="h-10 px-6 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Cancelar
              </button>
              {comprobantes.length > 0 && (
                <button
                  onClick={handleCrearResumen}
                  disabled={loading}
                  className="group flex h-12 items-center gap-3 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-8 text-sm font-bold text-white shadow-xl shadow-menta-petroleo/30 transition-all hover:translate-y-[-1px] active:scale-95 uppercase tracking-tighter"
                >
                  {loading ? <RefreshCcw size={18} className="animate-spin" /> : <FileCheck size={18} className="group-hover:scale-110 transition-transform" />}
                  GENERAR RESUMEN
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resumenes;