import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  User,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCcw,
  UserCheck,
  CreditCard,
  FileBadge,
  ChevronDown
} from 'lucide-react';
import ConductoresModal from './conductores.jsx';
import { obtenerConductores, buscarConductores, eliminarConductor } from '../../services/conductorService';
import Swal from 'sweetalert2';

const ConductoresLista = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Nombre');
  const [conductores, setConductores] = useState([]);
  const [conductoresAll, setConductoresAll] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingConductor, setEditingConductor] = useState(null);

  // Paginación Básica (puedes ampliarla si el backend soporta paginación real)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const cargarConductores = async () => {
    setLoading(true);
    try {
      const response = await obtenerConductores();
      const lista = response?.conductores || response?.data || [];
      const finalList = Array.isArray(lista) ? lista : [];
      setConductores(finalList);
      setConductoresAll(finalList);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConductores();
  }, []);

  const handleBuscar = async () => {
    const term = (searchTerm || '').trim();
    if (!term) {
      setConductores(conductoresAll);
      setCurrentPage(1);
      return;
    }

    try {
      setLoading(true);
      if (filterType === 'Nombre') {
        const res = await buscarConductores({ nombre: term });
        setConductores(res?.conductores || []);
      } else if (filterType === 'Tipo de documento') {
        const res = await buscarConductores({ tipoDocumento: term });
        setConductores(res?.conductores || []);
      } else if (filterType === 'Número') {
        const res = await buscarConductores({ numeroDocumento: term });
        setConductores(res?.conductores || []);
      } else if (filterType === 'Licencia') {
        const filtrados = conductoresAll.filter(c => (c.licencia || '')
          .toLowerCase().includes(term.toLowerCase()));
        setConductores(filtrados);
      }
      setCurrentPage(1);
    } catch (error) {
      console.error('Error en búsqueda de conductores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Deseas eliminar este conductor?',
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
      await eliminarConductor(id);
      setConductores(prev => prev.filter(c => c.id !== id));
      setConductoresAll(prev => prev.filter(c => c.id !== id));
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al eliminar conductor:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el conductor.'
      });
    }
  };

  // Lógica simple de paginación de cliente
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentItems = conductores.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(conductores.length / itemsPerPage);

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl shadow-emerald-200">
            <UserCheck size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Gestión de Conductores</h2>
            <p className="text-sm font-medium text-slate-500">Registro oficial de licencias y personal autorizado</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cargarConductores}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-6 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:translate-y-[-1px] active:scale-95 uppercase tracking-tighter"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            NUEVO CONDUCTOR
          </button>
        </div>
      </div>

      {/* Stats/Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Autorizados</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">{conductores.length}</p>
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
              <label>Filtrar por</label>
            </div>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option>Nombre</option>
                <option>Tipo de documento</option>
                <option>Número</option>
                <option>Licencia</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-slate-400" size={18} />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <Search size={14} className="text-menta-turquesa" />
              <label>Término de búsqueda</label>
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-12 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11"
                placeholder="Escribe para buscar conductor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleBuscar(); }}
              />
              <button
                onClick={handleBuscar}
                className="absolute right-2 top-1.5 h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-menta-petroleo hover:text-white transition-all active:scale-90"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-16">#</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Nombre Completo</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Documento</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">N° Licencia</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-menta-petroleo pr-10">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-emerald-600" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando conductores...</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-200">
                      <UserCheck size={48} />
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-800 uppercase tracking-tighter">Sin registros</p>
                        <p className="text-xs text-slate-400">No se encontraron conductores con estos criterios</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((conductor, index) => (
                  <tr key={conductor.id || index} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                      {firstIndex + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors">
                          <User size={14} />
                        </div>
                        <span className="font-bold text-slate-700 uppercase tracking-tight">{conductor.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{conductor.tipoDocumento}</span>
                        <span className="font-semibold text-slate-600">{conductor.numeroDocumento || conductor.numero}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <FileBadge size={12} />
                        {conductor.licencia}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditingConductor(conductor); setShowModal(true); }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-menta-petroleo hover:text-white transition-all active:scale-90"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(conductor.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white transition-all active:scale-90"
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
            MOSTRANDO <span className="text-slate-700">{Math.min(lastIndex, conductores.length)}</span> DE <span className="text-slate-700">{conductores.length}</span> CONDUCTORES
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-menta-petroleo transition-all disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex h-9 items-center px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600">
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

      {showModal && (
        <ConductoresModal
          initialData={editingConductor}
          onClose={() => {
            setShowModal(false);
            setEditingConductor(null);
          }}
          onConductorCreado={(nuevo) => {
            setConductores((prev) => [nuevo, ...prev]);
            setConductoresAll((prev) => [nuevo, ...prev]);
            setShowModal(false);
          }}
          onConductorActualizado={(actualizado) => {
            setConductores((prev) => prev.map(c => (c.id === actualizado.id ? actualizado : c)));
            setConductoresAll((prev) => prev.map(c => (c.id === actualizado.id ? actualizado : c)));
            setShowModal(false);
            setEditingConductor(null);
          }}
        />
      )}
    </div>
  );
};

export default ConductoresLista;