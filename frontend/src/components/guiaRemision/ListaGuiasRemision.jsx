import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  FileText,
  Calendar,
  User,
  Package,
  Truck,
  RefreshCcw,
  Clock,
  ChevronDown,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MapPin,
  ArrowRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import guiaRemisionService from '../../services/guiaRemisionService';

const ListaGuiasRemision = () => {
  const navigate = useNavigate();
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    cliente: '',
    serie: '',
    numero: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [guiasPorPagina] = useState(10);

  useEffect(() => {
    cargarGuias();
  }, [paginaActual]);

  const cargarGuias = async () => {
    try {
      setLoading(true);
      const response = await guiaRemisionService.obtenerGuias(filtros);
      setGuias(response.guiasRemision || []);
    } catch (error) {
      console.error('Error al cargar guías:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar guías',
        text: 'No se pudieron cargar las guías de remisión',
        confirmButtonColor: '#126171'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = () => {
    setPaginaActual(1);
    cargarGuias();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      estado: '',
      cliente: '',
      serie: '',
      numero: ''
    });
    setPaginaActual(1);
    cargarGuias();
  };

  const verDetalleGuia = (id) => {
    navigate(`/guias-remision/detalle/${id}`);
  };

  const editarGuia = (id) => {
    navigate(`/guia-remision/editar/${id}`);
  };

  const eliminarGuia = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await guiaRemisionService.eliminarGuiaRemision(id);
        Swal.fire({
          icon: 'success',
          title: 'Guía eliminada',
          text: 'La guía de remisión ha sido eliminada exitosamente',
          confirmButtonColor: '#126171'
        });
        cargarGuias();
      } catch (error) {
        console.error('Error al eliminar guía:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: error.response?.data?.mensaje || 'No se pudo eliminar la guía',
          confirmButtonColor: '#126171'
        });
      }
    }
  };

  const descargarPDF = async (id) => {
    try {
      await guiaRemisionService.generarPDFGuia(id);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al descargar',
        text: 'No se pudo generar el PDF de la guía',
        confirmButtonColor: '#126171'
      });
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await guiaRemisionService.cambiarEstadoGuia(id, nuevoEstado);
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La guía ha sido ${nuevoEstado.toLowerCase()}`,
        timer: 1500,
        showConfirmButton: false
      });
      cargarGuias();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cambiar estado',
        text: error.response?.data?.mensaje || 'No se pudo cambiar el estado',
        confirmButtonColor: '#126171'
      });
    }
  };

  // Paginación
  const totalPaginas = Math.ceil(guias.length / guiasPorPagina);
  const indiceUltimaGuia = paginaActual * guiasPorPagina;
  const indicePrimeraGuia = indiceUltimaGuia - guiasPorPagina;
  const guiasActuales = guias.slice(indicePrimeraGuia, indiceUltimaGuia);

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xl shadow-indigo-200">
            <Truck size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Guías de Remisión</h2>
            <p className="text-sm font-medium text-slate-500">Gestión de traslados y despacho de mercancías</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => cargarGuias()}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-menta-petroleo shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
          <button
            onClick={() => navigate('/guia-remision/formulario')}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-6 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:translate-y-[-1px] active:scale-95 uppercase tracking-tighter"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            NUEVA GUÍA
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <FileText size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Guías</p>
              <p className="text-2xl font-bold text-slate-800">{guias.length}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-200" />
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-amber-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600">{guias.filter(g => g.estado === 'Pendiente').length}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-amber-500" />
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Truck size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">En Tránsito</p>
              <p className="text-2xl font-bold text-indigo-600">{guias.filter(g => g.estado === 'En tránsito').length}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-indigo-500" />
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Package size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Entregadas</p>
              <p className="text-2xl font-bold text-emerald-600">{guias.filter(g => g.estado === 'Entregado').length}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500" />
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-in zoom-in-95 duration-300">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-menta-turquesa">
              <Filter size={18} />
            </div>
            <h3 className="text-sm font-bold text-menta-petroleo uppercase tracking-tight">Filtros de Búsqueda</h3>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={limpiarFiltros}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
            >
              Limpiar Todo
            </button>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-menta-marino transition-colors"
            >
              {mostrarFiltros ? 'Contraer' : 'Expandir'}
            </button>
          </div>
        </div>

        {mostrarFiltros && (
          <div className="flex flex-row items-end gap-4 animate-in fade-in duration-300 overflow-x-auto pb-2">
            <div className="w-48 shrink-0 space-y-2">
              <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                <Calendar size={14} className="text-menta-turquesa" />
                <label>Fecha Inicio</label>
              </div>
              <input
                type="date"
                name="fechaInicio"
                className="w-full rounded-xl border border-slate-100 bg-slate-50/50 py-2.5 px-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa"
                value={filtros.fechaInicio}
                onChange={handleFiltroChange}
              />
            </div>

            <div className="w-48 shrink-0 space-y-2">
              <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                <Filter size={14} className="text-menta-turquesa" />
                <label>Estado</label>
              </div>
              <div className="relative">
                <select
                  name="estado"
                  className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none"
                  value={filtros.estado}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En tránsito">En tránsito</option>
                  <option value="Entregado">Entregado</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400" />
              </div>
            </div>

            <div className="flex-1 min-w-[200px] space-y-2">
              <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                <Search size={14} className="text-menta-turquesa" />
                <label>Búsqueda de Cliente / Serie</label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="cliente"
                  placeholder="Cliente..."
                  className="flex-1 rounded-xl border border-slate-100 bg-slate-50/50 py-2.5 px-4 text-sm font-semibold text-slate-700 outline-none"
                  value={filtros.cliente}
                  onChange={handleFiltroChange}
                />
                <input
                  type="text"
                  name="serie"
                  placeholder="GR-001"
                  className="w-24 rounded-xl border border-slate-100 bg-slate-50/50 py-2.5 px-4 text-sm font-semibold text-slate-700 outline-none"
                  value={filtros.serie}
                  onChange={handleFiltroChange}
                />
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={aplicarFiltros}
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

      {/* Main Content: Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Comprobante</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Emisión</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Detalle Cliente</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Ruta de Traslado</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Estado</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Items</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && guiasActuales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-500" />
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Cargando guías...</p>
                    </div>
                  </td>
                </tr>
              ) : guiasActuales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-4">
                      <Truck size={48} className="text-slate-200" />
                      <div className="space-y-1">
                        <p className="text-lg font-bold uppercase tracking-tighter">Sin guías</p>
                        <p className="text-xs">No se encontraron registros de traslado</p>
                      </div>
                      <button onClick={() => navigate('/guia-remision/formulario')} className="mt-2 flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-all">
                        <Plus size={14} /> Crearr primera guía
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                guiasActuales.map((guia) => (
                  <tr key={guia.id} className="group transition hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-menta-petroleo tracking-tighter uppercase whitespace-nowrap">
                          {guia.serieComprobante}-{guia.numeroComprobante}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">ID: {guia.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Calendar size={14} className="text-slate-300" />
                          {formatearFecha(guia.fechaSalida)}
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 uppercase">Salida Programada</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                          <User size={16} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate max-w-[180px] text-sm font-semibold text-slate-700 uppercase">
                            {guia.cliente?.nombre || guia.Cliente?.nombre || 'SIN CLIENTE'}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {guia.cliente?.numeroDocumento || guia.Cliente?.numeroDocumento}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 text-[10px] font-medium text-slate-400">
                        <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                          <MapPin size={10} className="text-slate-300" />
                          <span>{guia.puntoPartida}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                          <ArrowRight size={10} className="text-indigo-400" />
                          <span className="font-bold text-slate-600">{guia.puntoLlegada}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase ring-1 ${guia.estado === 'Entregado' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' :
                        guia.estado === 'En tránsito' ? 'bg-indigo-50 text-indigo-600 ring-indigo-100' :
                          guia.estado === 'Anulado' ? 'bg-red-50 text-red-600 ring-red-100' :
                            'bg-amber-50 text-amber-600 ring-amber-100'
                        }`}>
                        {guia.estado === 'Entregado' ? <CheckCircle size={12} /> :
                          guia.estado === 'En tránsito' ? <Truck size={12} /> :
                            guia.estado === 'Anulado' ? <XCircle size={12} /> : <Clock size={12} />}
                        {guia.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Package size={14} className="text-slate-300" />
                        <span className="text-xs font-bold text-slate-600">
                          {guia.detalles?.length ?? guia.DetalleGuiaRemisions?.length ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => verDetalleGuia(guia.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>

                        {guia.estado !== 'Anulado' && (
                          <button
                            onClick={() => editarGuia(guia.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-menta-petroleo hover:text-white transition-all active:scale-90"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => descargarPDF(guia.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white transition-all active:scale-90"
                          title="Descargar PDF"
                        >
                          <Download size={16} />
                        </button>

                        <div className="relative group/more">
                          <button className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all">
                            <MoreVertical size={16} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 hidden group-hover/more:block z-20 w-48 rounded-xl border border-slate-100 bg-white p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                            {guia.estado === 'Pendiente' && (
                              <button
                                onClick={() => cambiarEstado(guia.id, 'En tránsito')}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                              >
                                <Truck size={14} /> Marcar en tránsito
                              </button>
                            )}
                            {guia.estado === 'En tránsito' && (
                              <button
                                onClick={() => cambiarEstado(guia.id, 'Entregado')}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                              >
                                <Package size={14} /> Marcar como entregado
                              </button>
                            )}
                            {guia.estado !== 'Anulado' && (
                              <button
                                onClick={() => eliminarGuia(guia.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2 size={14} /> Eliminar guía
                              </button>
                            )}
                          </div>
                        </div>
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
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Página <span className="font-bold text-menta-marino">{paginaActual}</span> de <span className="font-bold text-menta-marino">{totalPaginas}</span>
            <span className="mx-2 text-slate-200">|</span>
            {guias.length} guías registradas
          </p>
          <div className="flex items-center gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20 active:scale-90"
              onClick={() => setPaginaActual(1)}
              disabled={paginaActual === 1 || loading}
            >
              <ChevronFirst size={20} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20 active:scale-90"
              onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
              disabled={paginaActual <= 1 || loading}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex h-10 min-w-[40px] items-center justify-center rounded-xl bg-menta-petroleo text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20">
              {paginaActual}
            </div>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20 active:scale-90"
              onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual >= totalPaginas || loading}
            >
              <ChevronRight size={20} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-100 disabled:opacity-20 active:scale-90"
              onClick={() => setPaginaActual(totalPaginas)}
              disabled={paginaActual === totalPaginas || loading}
            >
              <ChevronLast size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaGuiasRemision;