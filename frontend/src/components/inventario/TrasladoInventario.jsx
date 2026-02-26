import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  FileText,
  Package,
  X,
  RefreshCcw,
  ArrowRightLeft,
  Calendar,
  Store,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  CheckCircle2,
  FileBarChart
} from 'lucide-react';
import ModalNuevoTraslado from './ModalNuevoTraslado';
import { obtenerTraslados, descargarPdfTraslado } from '../../services/inventarioService';
import Swal from 'sweetalert2';

const TrasladoInventario = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [selectedTraslado, setSelectedTraslado] = useState(null);
  const [traslados, setTraslados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar traslados al montar el componente
  useEffect(() => {
    cargarTraslados();
  }, []);

  const cargarTraslados = async () => {
    setLoading(true);
    try {
      const response = await obtenerTraslados();
      if (response.success) {
        const trasladosFormateados = response.data.map(movimiento => ({
          id: movimiento.id,
          fecha: new Date(movimiento.createdAt).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          almacenInicial: movimiento.SucursalOrigen?.nombre || 'No especificado',
          almacenDestino: movimiento.SucursalDestino?.nombre || 'No especificado',
          detalle: movimiento.observacion || 'Sin observaciones',
          detalleProductos: movimiento.Producto?.nombre || 'Producto no especificado',
          cantidadTotalProductos: movimiento.cantidad || 0,
          movimientoOriginal: movimiento
        }));
        setTraslados(trasladosFormateados);
      }
    } catch (error) {
      console.error('Error al cargar traslados:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los traslados' });
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPdf = async (traslado) => {
    try {
      setLoading(true);
      await descargarPdfTraslado(traslado.id);
      Swal.fire({ icon: 'success', title: 'PDF Generado', timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al descargar el PDF' });
    } finally {
      setLoading(false);
    }
  };

  const obtenerSoloFecha = (fecha) => {
    if (!fecha) return null;
    const dateObj = new Date(fecha);
    if (isNaN(dateObj.getTime())) return null;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredTraslados = traslados.filter(traslado => {
    const matchesSearch = !searchTerm ||
      traslado.almacenInicial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traslado.almacenDestino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traslado.detalle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !fechaFiltro || (() => {
      const fechaTraslado = traslado.movimientoOriginal?.createdAt;
      if (!fechaTraslado) return false;
      const fechaTrasladoSolo = obtenerSoloFecha(fechaTraslado);
      return fechaTrasladoSolo === fechaFiltro;
    })();

    return matchesSearch && matchesDate;
  });

  const handleShowDetalle = (traslado) => {
    setSelectedTraslado(traslado);
    setIsDetalleModalOpen(true);
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFechaFiltro('');
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-menta-petroleo to-menta-marino text-white shadow-xl shadow-menta-petroleo/20">
            <ArrowRightLeft size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Traslados de Almacén</h2>
            <p className="text-sm font-medium text-slate-500">Historial de movimientos logísticos entre sucursales</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cargarTraslados}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-6 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:translate-y-[-1px] active:scale-95 uppercase tracking-tighter"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            NUEVO TRASLADO
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="flex flex-wrap gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-menta-turquesa/10 text-menta-petroleo">
              <FileBarChart size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Operaciones</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">{traslados.length}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Filtrados</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">{filteredTraslados.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <Calendar size={14} className="text-menta-turquesa" />
              <label>Fecha de Emisión</label>
            </div>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11 transition"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <Search size={14} className="text-menta-turquesa" />
              <label>Buscar Movimiento</label>
            </div>
            <div className="relative group">
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11 transition shadow-sm group-hover:border-slate-300"
                placeholder="Almacén, detalle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-3 text-slate-300" size={20} />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={limpiarFiltros}
              className="group h-11 px-6 rounded-xl border border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
            >
              LIMPIAR FILTROS
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-16">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Fecha Hoja</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Ruta Logística</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Concepto / Motivo</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Items</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo pr-10">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && traslados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consultando registros logísticos...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTraslados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-200">
                      <ArrowRightLeft size={48} />
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-800 uppercase tracking-tighter">Sin Traslados</p>
                        <p className="text-xs text-slate-400">Prueba ajustando los filtros de fecha o búsqueda</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTraslados.map((traslado) => (
                  <tr key={traslado.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                      #{traslado.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Calendar size={16} />
                        </div>
                        <span className="font-bold text-slate-700 tracking-tight uppercase text-xs">{traslado.fecha}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Desde</span>
                          <span className="font-bold text-slate-600 text-xs">{traslado.almacenInicial}</span>
                        </div>
                        <ArrowRightLeft size={14} className="text-slate-300" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hacia</span>
                          <span className="font-bold text-emerald-600 text-xs">{traslado.almacenDestino}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-slate-500 uppercase italic truncate max-w-xs">{traslado.detalle}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleShowDetalle(traslado)}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase text-slate-500 hover:bg-menta-petroleo hover:text-white transition-all shadow-sm"
                      >
                        <Package size={14} /> {traslado.cantidadTotalProductos}
                      </button>
                    </td>
                    <td className="px-6 py-4 px-10">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleShowDetalle(traslado)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm"
                          title="Ver Detalle"
                        >
                          <Info size={16} />
                        </button>
                        <button
                          onClick={() => handleDescargarPdf(traslado)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-sm"
                          title="Descargar Comprobante"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            TOTAL TRASLADOS REGISTRADOS: <span className="text-slate-700">{filteredTraslados.length}</span>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      <ModalNuevoTraslado
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTrasladoCreado={cargarTraslados}
      />

      {/* Rediseño del Modal de Detalle */}
      {isDetalleModalOpen && selectedTraslado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="bg-gradient-to-r from-menta-petroleo to-menta-marino px-8 py-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight">Detalle de Productos</h3>
                  <p className="text-[10px] font-medium text-white/70 uppercase tracking-widest">Operación #{selectedTraslado.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetalleModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Producto / Referencia</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Cant.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 uppercase text-xs">{selectedTraslado.detalleProductos}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="inline-flex h-8 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs border border-emerald-100">
                          {selectedTraslado.cantidadTotalProductos}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                  <Info size={14} className="text-indigo-400" />
                  <label>Observaciones Logisticas</label>
                </div>
                <p className="text-xs font-semibold text-slate-600 italic">"{selectedTraslado.detalle}"</p>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDetalleModalOpen(false)}
                className="h-11 px-8 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-400 hover:bg-slate-100 active:scale-95 transition-all"
              >
                CERRAR VENTANA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrasladoInventario;