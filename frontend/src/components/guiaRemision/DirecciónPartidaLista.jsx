import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  MapPin,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCcw,
  Navigation,
  ChevronDown,
  Globe
} from 'lucide-react';
import DirecciónPartida from './DirecciónPartida';
import {
  obtenerDireccionesPartida,
  buscarDireccionesPartida,
  eliminarDireccionPartida,
} from '../../services/direccionPartidaService';
import Swal from 'sweetalert2';

const DireccionPartidaLista = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Dirección');
  const [direcciones, setDirecciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDireccion, setEditingDireccion] = useState(null);

  // Paginación (simulada en cliente por ahora)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const cargarDirecciones = async (filtros = {}) => {
    try {
      setLoading(true);
      const { direccionesPartida = [], data } = await obtenerDireccionesPartida(filtros);
      setDirecciones(direccionesPartida.length ? direccionesPartida : (data || []));
      setCurrentPage(1);
    } catch (error) {
      console.error('Error al cargar direcciones de partida:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDirecciones();
  }, []);

  const handleBuscar = async () => {
    const filtros = {};
    if (filterType === 'Dirección' && searchTerm) filtros.direccion = searchTerm;
    if (filterType === 'Ubigeo' && searchTerm) filtros.ubigeo = searchTerm;
    try {
      setLoading(true);
      const { direccionesPartida = [], data } = await buscarDireccionesPartida(filtros);
      setDirecciones(direccionesPartida.length ? direccionesPartida : (data || []));
      setCurrentPage(1);
    } catch (error) {
      console.error('Error al buscar direcciones de partida:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (direccion) => {
    const id = direccion?.id || direccion?.direccionPartidaId || direccion?._id;
    if (!id) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo determinar el ID de la dirección' });
      return;
    }

    const result = await Swal.fire({
      title: '¿Deseas eliminar esta dirección?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#126171',
      cancelButtonColor: '#ff4d4d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await eliminarDireccionPartida(id);
      await cargarDirecciones();
      Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Error al eliminar la dirección' });
    }
  };

  // Lógica de paginación básica
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentItems = direcciones.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(direcciones.length / itemsPerPage);

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-xl shadow-orange-200">
            <Navigation size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Puntos de Partida</h2>
            <p className="text-sm font-medium text-slate-500">Administra las direcciones de origen para tus guías de remisión</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => cargarDirecciones()}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
          <button
            onClick={() => { setEditingDireccion(null); setShowModal(true); }}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-6 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:translate-y-[-1px] active:scale-95 uppercase tracking-tighter"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            NUEVA DIRECCIÓN
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Direcciones</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">{direcciones.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-64 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <Filter size={14} className="text-menta-turquesa" />
              <label>Buscar por</label>
            </div>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11 transition"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option>Dirección</option>
                <option>Ubigeo</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-slate-400" size={18} />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <Search size={14} className="text-menta-turquesa" />
              <label>Término a buscar</label>
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-12 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11 transition"
                placeholder="Escribe la dirección o el código ubigeo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleBuscar(); }}
              />
              <button
                onClick={handleBuscar}
                className="absolute right-2 top-1.5 h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-menta-petroleo hover:text-white transition-all"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-16">#</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Dirección Completa</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Ubicación / Ubigeo</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-menta-petroleo pr-10">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-orange-600" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando ubicaciones...</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-200">
                      <MapPin size={48} />
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-800 uppercase tracking-tighter">Sin registros</p>
                        <p className="text-xs text-slate-400">No hay direcciones de partida configuradas aún</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((direccion, index) => (
                  <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                      {firstIndex + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                          <Navigation size={14} />
                        </div>
                        <span className="font-bold text-slate-700 uppercase tracking-tight">
                          {direccion.direccion || direccion.direccionCompleta}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-indigo-500" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          {direccion.ubigeo || direccion.codigo || 'S/U'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 pr-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditingDireccion(direccion); setShowModal(true); }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-menta-petroleo hover:text-white transition-all active:scale-90"
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(direccion)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white transition-all active:scale-90"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 gap-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            MOSTRANDO <span className="text-slate-700">{Math.min(lastIndex, direcciones.length)}</span> DE <span className="text-slate-700">{direcciones.length}</span> DIRECCIONES
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-menta-petroleo transition-all disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex h-9 items-center px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
              {currentPage} / {totalPages || 1}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-menta-petroleo transition-all disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <DirecciónPartida
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingDireccion(null); }}
        onDireccionCreada={async () => { setShowModal(false); setEditingDireccion(null); await cargarDirecciones(); }}
        initialData={editingDireccion || null}
        onDireccionActualizada={async () => { setShowModal(false); setEditingDireccion(null); await cargarDirecciones(); }}
        tipo={'partida'}
      />
    </div>
  );
};

export default DireccionPartidaLista;