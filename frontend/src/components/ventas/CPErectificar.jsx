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
  Download,
  Info,
  Server,
  User,
  Eraser,
  ChevronFirst,
  ChevronLast,
  Plus,
  ChevronDown,
  Terminal,
  Zap,
  ArrowRight
} from 'lucide-react';
import { obtenerComprobantesPendientesRectificacion, reenviarVentaSunat } from '../../services/ventaService';
import { obtenerSucursales } from '../../services/sucursalService';
import apiClient from '../../services/apiService';
import Swal from 'sweetalert2';

const CPErectificar = () => {
  // Obtener datos del usuario desde localStorage
  const getUsuario = () => {
    const usuarioData = localStorage.getItem('usuario');
    return usuarioData ? JSON.parse(usuarioData) : null;
  };

  const usuario = getUsuario();
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sucursales, setSucursales] = useState([]);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    sucursalId: '',
    fechaInicio: '',
    fechaFin: '',
    tipoComprobante: '',
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

  // Estado para resumen
  const [resumen, setResumen] = useState({
    totalComprobantes: 0,
    rechazados: 0,
    conError: 0,
    facturas: 0,
    boletas: 0
  });

  // Cargar sucursales al montar el componente
  useEffect(() => {
    cargarSucursales();
    cargarComprobantes();
  }, []);

  // Cargar comprobantes cuando cambien los filtros o la página
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
      const filtrosConPaginacion = {
        ...filtros,
        page: paginacion.currentPage,
        limit: paginacion.itemsPerPage
      };

      const response = await obtenerComprobantesPendientesRectificacion(filtrosConPaginacion);

      if (response.success) {
        setComprobantes(response.data || []);
        setPaginacion(response.pagination || paginacion);
        setResumen(response.resumen || resumen);
      } else {
        setComprobantes([]);
        console.error(response.mensaje || 'Error al cargar comprobantes');
      }
    } catch (error) {
      console.error('Error al cargar comprobantes:', error);
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
      tipoComprobante: '',
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

  const consultarCDR = async (comprobante) => {
    try {
      if (!comprobante.id) {
        Swal.fire('Error', 'ID de comprobante no válido', 'error');
        return;
      }

      Swal.fire({
        title: 'Descargando CDR...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const response = await apiClient.get(`/ventas/${comprobante.id}/cdr`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `CDR_${comprobante.serie}-${comprobante.numero}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        title: '¡Éxito!',
        text: 'CDR descargado exitosamente',
        icon: 'success',
        confirmButtonColor: '#126171'
      });
    } catch (error) {
      console.error('Error al consultar CDR:', error);
      if (error.response?.status === 404) {
        Swal.fire({
          title: 'No disponible',
          text: 'CDR no disponible para este comprobante',
          icon: 'info',
          confirmButtonColor: '#126171'
        });
      } else {
        Swal.fire('Error', 'No se pudo descargar el CDR', 'error');
      }
    }
  };

  const enviarComprobante = async (comprobante) => {
    const result = await Swal.fire({
      title: '¿Reenviar a SUNAT?',
      text: `Se intentará enviar el comprobante ${comprobante.serie}-${comprobante.numero} nuevamente.`,
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

        const response = await reenviarVentaSunat(comprobante.id);

        if (response.success || response.mensaje?.includes('exitoso')) {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Comprobante reenviado exitosamente a SUNAT',
            icon: 'success',
            confirmButtonColor: '#126171'
          });
          setTimeout(() => cargarComprobantes(), 1000);
        } else {
          Swal.fire('Error', response.mensaje || 'Error al reenviar comprobante', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'No se pudo reenviar el comprobante', 'error');
      }
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/30 animate-in fade-in duration-500 font-bold italic">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-200">
            <Eraser size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-menta-petroleo uppercase italic">Rectificación de CPE</h2>
            <p className="text-sm font-medium text-slate-500 italic">Gestión de comprobantes rechazados o con errores de SUNAT</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cargarComprobantes}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-menta-petroleo shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Resumen Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 animate-in slide-in-from-top-4 duration-500">
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
              <FileText size={20} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pendiente</p>
              <p className="text-2xl font-black text-slate-800 tracking-tighter italic">{resumen.totalComprobantes}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-100" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <XCircle size={20} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Rechazados</p>
              <p className="text-2xl font-black text-red-600 tracking-tighter italic">{resumen.rechazados}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-red-500" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <AlertTriangle size={20} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Con Error</p>
              <p className="text-2xl font-black text-amber-600 tracking-tighter italic">{resumen.conError}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-amber-500" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-menta-petroleo">
              <Building size={20} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Facturas</p>
              <p className="text-2xl font-black text-slate-800 tracking-tighter italic">{resumen.facturas}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-menta-petroleo" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-menta-turquesa">
              <FileText size={20} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Boletas</p>
              <p className="text-2xl font-black text-slate-800 tracking-tighter italic">{resumen.boletas}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-menta-turquesa" />
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-menta-turquesa">
              <Filter size={18} />
            </div>
            <h3 className="text-sm font-black text-menta-petroleo uppercase tracking-tight italic">Panel de Filtrado Avanzado</h3>
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-menta-marino transition-colors"
          >
            {mostrarFiltros ? 'Contraer' : 'Expandir'}
          </button>
        </div>

        {mostrarFiltros && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                <Building size={14} className="text-menta-turquesa" />
                <span>Establecimiento</span>
              </div>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-4 pr-10 text-sm font-black italic text-slate-700 focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 outline-none transition"
                  value={filtros.sucursalId}
                  onChange={(e) => handleFiltroChange('sucursalId', e.target.value)}
                >
                  <option value="">Todas las sucursales</option>
                  {sucursales.map(suc => (
                    <option key={suc.id} value={suc.id}>{suc.nombre}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                <Calendar size={14} className="text-menta-turquesa" />
                <span>Fecha Inicio</span>
              </div>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 px-4 text-sm font-black italic text-slate-700 focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 outline-none transition"
                value={filtros.fechaInicio}
                onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                <Calendar size={14} className="text-menta-turquesa" />
                <span>Fecha Fin</span>
              </div>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 px-4 text-sm font-black italic text-slate-700 focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 outline-none transition"
                value={filtros.fechaFin}
                onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                <FileText size={14} className="text-menta-turquesa" />
                <span>Tipo</span>
              </div>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-4 pr-10 text-sm font-black italic text-slate-700 focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 outline-none transition"
                  value={filtros.tipoComprobante}
                  onChange={(e) => handleFiltroChange('tipoComprobante', e.target.value)}
                >
                  <option value="">Cualquier tipo</option>
                  <option value="FACTURA">Facturas</option>
                  <option value="BOLETA">Boletas</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                <Search size={14} className="text-menta-turquesa" />
                <span>Número</span>
              </div>
              <input
                type="text"
                placeholder="Ej: 0001..."
                className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 px-4 text-sm font-black italic text-slate-700 focus:border-menta-turquesa outline-none transition placeholder:text-slate-300"
                value={filtros.numero}
                onChange={(e) => handleFiltroChange('numero', e.target.value)}
              />
            </div>

            <div className="flex items-end gap-3">
              <button
                onClick={limpiarFiltros}
                className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 shadow-sm"
                title="Limpiar"
              >
                <Eraser size={20} />
              </button>
              <button
                onClick={aplicarFiltros}
                disabled={loading}
                className="flex-1 h-11 flex items-center justify-center gap-3 rounded-xl bg-menta-petroleo text-white font-black italic transition hover:bg-menta-marino shadow-lg shadow-menta-petroleo/20 active:scale-95 disabled:opacity-50 uppercase tracking-tighter"
              >
                {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Search size={18} />}
                BUSCAR
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap italic font-bold">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">#</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-menta-petroleo">Usuario / Entorno</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-menta-petroleo">F. Emisión</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-menta-petroleo">Cliente</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-menta-petroleo">Comprobante</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-menta-petroleo">Estado Sunat</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-menta-petroleo text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && comprobantes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-100 border-t-red-600" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Rastreando comprobantes con incidencias...</p>
                    </div>
                  </td>
                </tr>
              ) : comprobantes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                        <CheckCircle size={48} className="text-emerald-200" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-slate-400 tracking-tighter uppercase">Todo al día</p>
                        <p className="text-xs font-bold text-slate-300 italic">No se hallaron comprobantes pendientes de rectificación</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                comprobantes.map((comp, index) => (
                  <tr key={comp.id || index} className="group transition hover:bg-slate-50/70 font-bold italic">
                    <td className="px-6 py-5 text-center text-xs font-black text-slate-300 group-hover:text-red-500 transition-colors">
                      {((paginacion.currentPage - 1) * paginacion.itemsPerPage) + index + 1}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-700 italic">
                          <User size={14} className="text-slate-300" />
                          {comp.usuario || 'SISTEMA'}
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{comp.entorno || 'PRODUCCIÓN'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-500 italic">
                        <Calendar size={14} className="text-slate-300" />
                        {formatearFecha(comp.fechaEmision)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[200px] text-sm font-black text-slate-700 italic uppercase" title={comp.clienteNombre}>
                          {comp.clienteNombre || 'CLIENTE SIN NOMBRE'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 font-black italic">
                        <span className="text-sm font-black text-menta-petroleo tracking-tighter uppercase">{comp.tipoComprobante}</span>
                        <span className="text-sm font-black text-slate-500">{comp.serie}-{comp.numero}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold italic">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase transition-all duration-300 ring-1 ${comp.estadoSunat?.toLowerCase().includes('rechazado') ? 'bg-red-50 text-red-600 ring-red-100 group-hover:ring-red-200' : 'bg-amber-50 text-amber-600 ring-amber-100'
                          }`}>
                          {comp.estadoSunat?.toLowerCase().includes('rechazado') ? <XCircle size={12} className="shrink-0" /> : <AlertTriangle size={12} className="shrink-0" />}
                          {comp.estadoSunat || 'ERROR'}
                        </span>
                        {comp.descripcionError && (
                          <div className="flex items-center gap-1 max-w-[250px] overflow-hidden">
                            <Info size={10} className="text-slate-300 shrink-0" />
                            <p className="truncate text-[10px] font-bold text-slate-400 italic" title={comp.descripcionError}>
                              {comp.descripcionError}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-bold italic">
                      <div className="flex justify-center gap-2 font-bold italic">
                        <button
                          onClick={() => enviarComprobante(comp)}
                          className="group/btn flex h-9 items-center gap-2 rounded-xl bg-menta-petroleo px-4 text-[10px] font-black text-white hover:bg-menta-marino transition-all shadow-lg shadow-menta-petroleo/20 active:scale-95 italic font-bold"
                          title="Reenviar a SUNAT"
                        >
                          <Send size={14} className="group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                          REENVIAR
                        </button>
                        <button
                          onClick={() => consultarCDR(comp)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-menta-petroleo active:scale-95 italic font-bold"
                          title="Consultar CDR"
                        >
                          <Terminal size={16} />
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
        <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-100 bg-slate-50/30 px-8 py-6 sm:flex-row">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic font-bold italic">
            Mostrando <span className="font-black text-menta-marino italic font-bold italic font-bold italic">{comprobantes.length}</span> de <span className="font-black text-menta-marino italic font-bold italic font-bold italic">{paginacion.totalItems}</span> registros
          </p>
          <div className="flex items-center gap-2 font-bold italic">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-amber-500 disabled:opacity-20 active:scale-90 italic font-bold italic"
              onClick={() => cambiarPagina(1)}
              disabled={paginacion.currentPage === 1 || loading}
            >
              <ChevronFirst size={20} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-amber-500 disabled:opacity-20 active:scale-90 italic font-bold italic"
              onClick={() => cambiarPagina(paginacion.currentPage - 1)}
              disabled={!paginacion.hasPrevPage || loading}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex h-10 min-w-[40px] items-center justify-center rounded-xl bg-menta-petroleo px-4 text-sm font-black text-white shadow-lg shadow-menta-petroleo/20 italic font-bold italic">
              {paginacion.currentPage}
            </div>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-amber-500 disabled:opacity-20 active:scale-90 italic font-bold italic"
              onClick={() => cambiarPagina(paginacion.currentPage + 1)}
              disabled={!paginacion.hasNextPage || loading}
            >
              <ChevronRight size={20} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-amber-500 disabled:opacity-20 active:scale-90 italic font-bold italic"
              onClick={() => cambiarPagina(paginacion.totalPages)}
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

export default CPErectificar;