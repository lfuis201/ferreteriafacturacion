import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  Building,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCcw,
  LayoutGrid,
  Eraser,
  ChevronFirst,
  ChevronLast
} from 'lucide-react';
import { obtenerComprobantesNoEnviados } from '../../services/ventaService';
import { obtenerSucursales } from '../../services/sucursalService';
import Swal from 'sweetalert2';

const ComprobantesNoEnviados = () => {
  // Estados para UI
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  // Estados para datos
  const [comprobantes, setComprobantes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    sucursalId: '',
    fechaInicio: '',
    fechaFin: '',
    tipoComprobante: 'TODOS',
    serie: '',
    numero: ''
  });

  // Estados para paginación
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Estados para resumen
  const [resumen, setResumen] = useState({
    totalComprobantes: 0,
    pendientes: 0,
    conError: 0,
    rechazados: 0
  });

  // Cargar sucursales al montar el componente
  useEffect(() => {
    cargarSucursales();
  }, []);

  // Cargar comprobantes cuando cambien la página
  useEffect(() => {
    cargarComprobantes();
  }, [paginacion.currentPage]);

  const cargarSucursales = async () => {
    try {
      const response = await obtenerSucursales();
      setSucursales(response.data || []);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  const cargarComprobantes = async () => {
    try {
      setLoading(true);
      setError('');

      const filtrosConPaginacion = {
        ...filtros,
        page: paginacion.currentPage,
        limit: paginacion.itemsPerPage
      };

      const response = await obtenerComprobantesNoEnviados(filtrosConPaginacion);

      if (response.success) {
        setComprobantes(response.data || []);
        setPaginacion(response.pagination || paginacion);
        setResumen(response.resumen || resumen);
      } else {
        setError(response.mensaje || 'Error al cargar comprobantes');
        setComprobantes([]);
      }
    } catch (error) {
      console.error('Error al cargar comprobantes:', error);
      setError('Error al cargar comprobantes no enviados');
      setComprobantes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const aplicarFiltros = () => {
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
    cargarComprobantes();
  };

  const limpiarFiltros = () => {
    setFiltros({
      sucursalId: '',
      fechaInicio: '',
      fechaFin: '',
      tipoComprobante: 'TODOS',
      serie: '',
      numero: ''
    });
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
    setTimeout(() => cargarComprobantes(), 100);
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPages) {
      setPaginacion(prev => ({ ...prev, currentPage: nuevaPagina }));
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatearMoneda = (monto, moneda = 'PEN') => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: moneda === 'USD' ? 'USD' : 'PEN'
    }).format(monto || 0);
  };

  const handleReenviarComprobante = async (comprobante) => {
    const result = await Swal.fire({
      title: '¿Reenviar a SUNAT?',
      text: `Se intentará enviar el comprobante ${comprobante.comprobante} nuevamente.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      confirmButtonColor: '#126171'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Enviando...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        // Simular envío
        setTimeout(() => {
          Swal.fire('¡Éxito!', 'Comprobante enviado correctamente', 'success');
          cargarComprobantes();
        }, 1500);
      } catch (error) {
        Swal.fire('Error', 'No se pudo reenviar el comprobante', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/30">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo">Comprobantes no Enviados</h2>
          <p className="text-sm text-slate-500">Documentos pendientes de sincronización con SUNAT</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cargarComprobantes}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm font-bold"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Alert logic */}
      {resumen.totalComprobantes > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 shadow-sm font-bold italic">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Atención: Tiene <span className="font-bold">{resumen.totalComprobantes}</span> comprobantes pendientes de envío. Revise los motivos de error.
          </p>
        </div>
      )}

      {/* Resumen Cards */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap lg:flex-nowrap">
        <div className="flex-1 min-w-[160px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm font-bold italic">
          <div className="flex items-center justify-between">
            <div className="text-slate-400"><FileText size={20} /></div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase text-slate-400">Total Pendientes</p>
              <p className="text-2xl font-bold text-slate-800">{resumen.totalComprobantes}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-[160px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm font-bold italic">
          <div className="flex items-center justify-between">
            <div className="text-amber-400"><Clock size={20} /></div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase text-amber-400">Solo Pendientes</p>
              <p className="text-2xl font-bold text-amber-600">{resumen.pendientes}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-[160px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm font-bold italic">
          <div className="flex items-center justify-between">
            <div className="text-red-400"><AlertTriangle size={20} /></div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase text-red-400">Con Error</p>
              <p className="text-2xl font-bold text-red-600">{resumen.conError}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-[160px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm font-bold italic">
          <div className="flex items-center justify-between">
            <div className="text-red-600"><XCircle size={20} /></div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase text-red-400">Rechazados</p>
              <p className="text-2xl font-bold text-red-700">{resumen.rechazados}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm font-bold italic">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h3 className="flex items-center gap-2 font-bold text-menta-petroleo">
            <Filter size={18} />
            Filtros de Búsqueda
          </h3>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="text-xs font-semibold text-slate-400 hover:text-menta-petroleo transition"
          >
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {mostrarFiltros && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6 animate-in fade-in duration-300 font-bold italic">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sucursal</label>
              <select
                className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm focus:border-menta-turquesa focus:ring-2 focus:ring-menta-turquesa outline-none transition font-bold"
                value={filtros.sucursalId}
                onChange={(e) => handleFiltroChange('sucursalId', e.target.value)}
              >
                <option value="">Todas</option>
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Desde</label>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm focus:border-menta-turquesa focus:ring-2 focus:ring-menta-turquesa outline-none transition font-bold"
                value={filtros.fechaInicio}
                onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hasta</label>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm focus:border-menta-turquesa focus:ring-2 focus:ring-menta-turquesa outline-none transition font-bold"
                value={filtros.fechaFin}
                onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tipo Doc.</label>
              <select
                className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm focus:border-menta-turquesa focus:ring-2 focus:ring-menta-turquesa outline-none transition font-bold"
                value={filtros.tipoComprobante}
                onChange={(e) => handleFiltroChange('tipoComprobante', e.target.value)}
              >
                <option value="TODOS">Todos</option>
                <option value="FACTURA">Facturas</option>
                <option value="BOLETA">Boletas</option>
              </select>
            </div>

            <div className="space-y-1.5 font-bold">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Serie/Núm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="F001-..."
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-menta-turquesa focus:ring-2 focus:ring-menta-turquesa outline-none transition font-bold"
                  value={filtros.numero}
                  onChange={(e) => handleFiltroChange('numero', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                />
              </div>
            </div>

            <div className="flex items-end gap-2 font-bold">
              <button
                onClick={aplicarFiltros}
                className="flex-1 h-10 rounded-lg bg-menta-petroleo text-white transition hover:bg-menta-marino shadow-sm font-bold"
              >
                Buscar
              </button>
              <button
                onClick={limpiarFiltros}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200 font-bold"
                title="Limpiar"
              >
                <Eraser size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm font-bold italic">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap italic">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-menta-petroleo font-bold">
              <tr>
                <th className="px-5 py-4 text-center font-bold">#</th>
                <th className="px-5 py-4 font-bold">F. Emisión</th>
                <th className="px-5 py-4 font-bold">Comprobante</th>
                <th className="px-5 py-4 font-bold">Cliente</th>
                <th className="px-5 py-4 text-right font-bold">Total</th>
                <th className="px-5 py-4 text-center font-bold">Estado</th>
                <th className="px-5 py-4 font-bold">Motivo Error</th>
                <th className="px-5 py-4 text-center font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic font-bold">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center font-bold">
                    <div className="flex flex-col items-center gap-3 font-bold">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-menta-turquesa font-bold" />
                      <p className="font-semibold text-slate-400 font-bold">Buscando pendientes...</p>
                    </div>
                  </td>
                </tr>
              ) : comprobantes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center gap-2 font-bold">
                      <CheckCircle size={40} className="text-emerald-500 font-bold" />
                      <p className="font-bold">No se encontraron comprobantes pendientes de envío.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                comprobantes.map((comp, index) => (
                  <tr key={comp.id || index} className="group transition hover:bg-slate-50/50 font-bold italic">
                    <td className="px-5 py-4 text-center font-medium text-slate-400 font-bold">
                      {((paginacion.currentPage - 1) * paginacion.itemsPerPage) + index + 1}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-bold italic">
                      {formatearFecha(comp.fechaEmision)}
                    </td>
                    <td className="px-5 py-4 font-bold italic">
                      <div className="flex items-center gap-2 font-bold italic">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest text-white font-bold italic ${comp.tipoComprobante === 'FACTURA' ? 'bg-fondo' : 'bg-menta-petroleo'
                          }`}>
                          {comp.tipoComprobante}
                        </span>
                        <span className="font-bold text-slate-800">{comp.comprobante}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold italic">
                      <div className="flex flex-col font-bold italic">
                        <span className="font-bold text-slate-800 truncate max-w-[200px]" title={comp.cliente}>{comp.cliente || '-'}</span>
                        <span className="text-[10px] text-slate-400">{comp.clienteDocumento || '-'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-black text-slate-900 font-bold italic">
                      {formatearMoneda(comp.total, comp.moneda)}
                    </td>
                    <td className="px-5 py-4 text-center font-bold italic">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase font-bold italic ${comp.estadoSunat === 'RECHAZADO' ? 'bg-red-50 text-red-600' :
                          comp.estadoSunat === 'ERROR' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {comp.estadoSunat === 'RECHAZADO' ? <XCircle size={12} /> :
                          comp.estadoSunat === 'ERROR' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                        {comp.estadoSunat}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold italic">
                      <p className="truncate max-w-[250px] text-[10px] text-slate-400 italic" title={comp.motivoError}>
                        {comp.motivoError || 'Sin detalles'}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-bold italic">
                      <div className="flex justify-center gap-2 font-bold italic">
                        <button
                          onClick={() => handleReenviarComprobante(comp)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-menta-petroleo hover:text-white font-bold italic"
                          title="Reenviar"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-menta-petroleo font-bold italic"
                          title="Ver"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row font-bold italic">
          <p className="text-sm text-slate-500 font-bold">
            Mostrando <span className="font-bold text-slate-800">{comprobantes.length}</span> de <span className="font-bold text-slate-800">{paginacion.totalItems}</span> registros
          </p>
          <div className="flex items-center gap-2 font-bold italic">
            <button
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition hover:bg-slate-50 disabled:opacity-30 font-bold italic"
              onClick={() => cambiarPagina(1)}
              disabled={paginacion.currentPage === 1 || loading}
            >
              <ChevronFirst size={18} />
            </button>
            <button
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition hover:bg-slate-50 disabled:opacity-30 font-bold italic"
              onClick={() => cambiarPagina(paginacion.currentPage - 1)}
              disabled={!paginacion.hasPrevPage || loading}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex h-9 min-w-[36px] items-center justify-center rounded-lg bg-menta-petroleo px-3 text-sm font-bold text-white shadow-sm font-bold italic">
              {paginacion.currentPage}
            </div>
            <button
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition hover:bg-slate-50 disabled:opacity-30 font-bold italic"
              onClick={() => cambiarPagina(paginacion.currentPage + 1)}
              disabled={!paginacion.hasNextPage || loading}
            >
              <ChevronRight size={18} />
            </button>
            <button
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition hover:bg-slate-50 disabled:opacity-30 font-bold italic"
              onClick={() => cambiarPagina(paginacion.totalPages)}
              disabled={paginacion.currentPage === paginacion.totalPages || loading}
            >
              <ChevronLast size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprobantesNoEnviados;