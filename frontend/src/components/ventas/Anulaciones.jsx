import React, { useState, useEffect } from 'react';
import {
  FileX,
  Search,
  RefreshCcw,
  Calendar,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  ChevronFirst,
  ChevronLast,
  Clock,
  User,
  Building,
  DollarSign,
  FileText,
  Code,
  ChevronDown,
  Terminal,
  ArrowRight,
  Info,
  ShieldAlert,
  Archive,
  Layers,
  Zap,
  Tag
} from 'lucide-react';
import anulacionesService from '../../services/anulacionesService';
import Swal from 'sweetalert2';

const Anulaciones = () => {
  const [fechaEmision, setFechaEmision] = useState('');
  const [fechaInput, setFechaInput] = useState(new Date().toISOString().split('T')[0]);
  const [anulaciones, setAnulaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Cargar anulaciones al montar el componente
  useEffect(() => {
    cargarAnulaciones();
  }, [paginacion.currentPage]);

  const cargarAnulaciones = async (filtros = {}) => {
    try {
      setLoading(true);
      setError('');

      const response = await anulacionesService.obtenerAnulaciones({
        page: paginacion.currentPage,
        limit: 10,
        ...filtros
      });

      setAnulaciones(response.anulaciones || []);
      setPaginacion(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
      });
    } catch (error) {
      console.error('Error al cargar anulaciones:', error);
      setError('Error al cargar las las anulaciones');
      setAnulaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async () => {
    let filtros = {};

    if (fechaEmision === 'hoy') {
      const hoy = new Date().toISOString().split('T')[0];
      filtros = { fechaInicio: hoy, fechaFin: hoy };
    } else if (fechaEmision === 'ayer') {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      const fechaAyer = ayer.toISOString().split('T')[0];
      filtros = { fechaInicio: fechaAyer, fechaFin: fechaAyer };
    } else if (fechaEmision === 'esta-semana') {
      const hoy = new Date();
      const primerDia = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
      const ultimoDia = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 6));
      filtros = {
        fechaInicio: primerDia.toISOString().split('T')[0],
        fechaFin: ultimoDia.toISOString().split('T')[0]
      };
    } else if (fechaEmision === 'este-mes') {
      const hoy = new Date();
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      filtros = {
        fechaInicio: primerDia.toISOString().split('T')[0],
        fechaFin: ultimoDia.toISOString().split('T')[0]
      };
    } else if (fechaEmision === 'mes-anterior') {
      const hoy = new Date();
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      filtros = {
        fechaInicio: primerDia.toISOString().split('T')[0],
        fechaFin: ultimoDia.toISOString().split('T')[0]
      };
    } else if (fechaEmision === 'personalizado' && fechaInput) {
      filtros = { fechaInicio: fechaInput, fechaFin: fechaInput };
    }

    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
    await cargarAnulaciones(filtros);
  };

  const handleDescargar = async (anulacion, formato = 'pdf') => {
    try {
      setLoading(true);
      await anulacionesService.descargarDocumento(
        anulacion.tipo.toLowerCase(),
        anulacion.id,
        formato
      );
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de descarga',
        text: 'No se pudo obtener el documento solicitado.',
        confirmButtonColor: '#126171'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPages) {
      setPaginacion(prev => ({ ...prev, currentPage: nuevaPagina }));
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(monto || 0);
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-xl shadow-red-200">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Anulaciones</h2>
            <p className="text-sm font-medium text-slate-500">Gestión de documentos anulados y bajas SUNAT</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => cargarAnulaciones()}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-menta-petroleo shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 animate-in slide-in-from-top-4 duration-500">
        <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
              <FileX size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Anulados</p>
              <p className="text-2xl font-bold text-slate-800">{paginacion.totalItems}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-red-500" />
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Carga Financiera</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatearMoneda(anulaciones.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0))}
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
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">En Proceso</p>
              <p className="text-2xl font-bold text-amber-600">
                {anulaciones.filter(a => a.estado?.toLowerCase() === 'enviado' || !a.estado).length}
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
                {anulaciones.filter(a => a.estado?.toLowerCase() === 'rechazado').length}
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-red-500" />
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-in zoom-in-95 duration-300">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
          <div className="w-full lg:w-64 space-y-2">
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

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <Filter size={14} className="text-menta-turquesa" />
              <span>Fecha Específica</span>
            </div>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-100 bg-slate-50/50 py-2.5 px-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 outline-none transition disabled:opacity-30 disabled:cursor-not-allowed"
              value={fechaInput}
              onChange={(e) => setFechaInput(e.target.value)}
              disabled={fechaEmision !== 'personalizado'}
            />
          </div>

          <div className="flex items-end gap-3 min-w-[160px]">
            <button
              onClick={handleBuscar}
              disabled={loading}
              className="group w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-menta-petroleo text-white font-bold transition shadow-lg shadow-menta-petroleo/20 active:scale-95 disabled:opacity-50 uppercase tracking-tighter"
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
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Emisión / Anulación</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Identificador</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo text-center">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Cliente / Proveedor</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Total</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Estado SUNAT</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Descargas</th>
                <th className="px-6 py-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && anulaciones.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-red-600" />
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Cargando datos...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="py-20 text-center text-red-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle size={32} />
                      <p className="font-bold">{error}</p>
                      <button onClick={() => cargarAnulaciones()} className="text-sm underline">Reintentar</button>
                    </div>
                  </td>
                </tr>
              ) : anulaciones.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-4">
                      <Archive size={48} className="text-slate-200" />
                      <div className="space-y-1">
                        <p className="text-lg font-bold uppercase tracking-tighter">Sin registros</p>
                        <p className="text-xs">No se encontraron anulaciones en este periodo</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                anulaciones.map((anulacion, index) => (
                  <tr key={`${anulacion.tipo}-${anulacion.id}`} className="group transition hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                      {((paginacion.currentPage - 1) * paginacion.itemsPerPage) + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Calendar size={14} className="text-slate-300" />
                          {formatearFecha(anulacion.fechaEmision)}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                          <Clock size={12} />
                          {formatearFechaHora(anulacion.fechaAnulacion)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-menta-petroleo tracking-tighter uppercase">
                        {anulacion.identificador}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-widest text-white uppercase ${anulacion.tipo?.toLowerCase() === 'factura' ? 'bg-menta-petroleo' : 'bg-amber-500'
                        }`}>
                        {anulacion.tipoComprobante || anulacion.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                          {anulacion.tipo?.toLowerCase() === 'factura' ? <Building size={16} /> : <User size={16} />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate max-w-[200px] text-sm font-semibold text-slate-700 uppercase" title={anulacion.cliente?.razonSocial || anulacion.proveedor?.razonSocial}>
                            {anulacion.cliente?.razonSocial || anulacion.proveedor?.razonSocial || 'CONSUMIDOR FINAL'}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {anulacion.cliente?.numeroDocumento || anulacion.proveedor?.numeroDocumento || '00000000'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-slate-900 tracking-tighter">
                        {formatearMoneda(anulacion.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase ring-1 ${anulacion.estado?.toLowerCase() === 'aceptado' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' :
                        anulacion.estado?.toLowerCase() === 'rechazado' ? 'bg-red-50 text-red-600 ring-red-100' :
                          'bg-amber-50 text-amber-600 ring-amber-100'
                        }`}>
                        {anulacion.estado?.toLowerCase() === 'aceptado' ? <CheckCircle size={12} /> :
                          anulacion.estado?.toLowerCase() === 'rechazado' ? <XCircle size={12} /> : <Clock size={12} />}
                        {anulacion.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleDescargar(anulacion, 'pdf')}
                          className="flex h-9 items-center gap-2 rounded-xl bg-slate-50 px-3 text-[10px] font-bold text-slate-500 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                          title="Descargar PDF"
                          disabled={loading}
                        >
                          <FileText size={14} />
                          PDF
                        </button>
                        <button
                          onClick={() => handleDescargar(anulacion, 'xml')}
                          className="flex h-9 items-center gap-2 rounded-xl bg-slate-50 px-3 text-[10px] font-bold text-slate-500 hover:bg-menta-petroleo hover:text-white transition-all active:scale-95"
                          title="Descargar XML"
                          disabled={loading}
                        >
                          <Terminal size={14} />
                          XML
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
            Página <span className="text-menta-marino">{paginacion.currentPage}</span> de <span className="text-menta-marino">{paginacion.totalPages}</span>
            <span className="mx-2 text-slate-200">|</span>
            {paginacion.totalItems} registros totales
          </p>

          <div className="flex items-center gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20"
              onClick={() => handleCambiarPagina(1)}
              disabled={paginacion.currentPage === 1 || loading}
            >
              <ChevronFirst size={20} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20"
              onClick={() => handleCambiarPagina(paginacion.currentPage - 1)}
              disabled={paginacion.currentPage <= 1 || loading}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex h-10 min-w-[40px] items-center justify-center rounded-xl bg-menta-petroleo text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20">
              {paginacion.currentPage}
            </div>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20"
              onClick={() => handleCambiarPagina(paginacion.currentPage + 1)}
              disabled={paginacion.currentPage >= paginacion.totalPages || loading}
            >
              <ChevronRight size={20} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20"
              onClick={() => handleCambiarPagina(paginacion.totalPages)}
              disabled={paginacion.currentPage === paginacion.totalPages || loading}
            >
              <ChevronLast size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Anulaciones;