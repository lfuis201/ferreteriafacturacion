import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Truck,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCcw,
  Car,
  ChevronDown,
  Info,
  Hash,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import VehiculosModal from './vehiculos.jsx';
import { obtenerVehiculos, eliminarVehiculo } from '../../services/vehiculoService';
import Swal from 'sweetalert2';

const VehiculoLista = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Nro. de Placa');
  const [vehiculos, setVehiculos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);

  // Estados para paginación (simulada)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const cargarVehiculos = async () => {
    setLoading(true);
    try {
      const response = await obtenerVehiculos();
      const lista = response?.vehiculos || response?.data || [];
      setVehiculos(Array.isArray(lista) ? lista : []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const getId = (v) => v?._id || v?.id;

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const term = (searchTerm || '').trim();
      const filters = {};
      if (term) {
        switch (filterType) {
          case 'Nro. de Placa': filters.placa = term; break;
          case 'Autorización placa principal': filters.autorizacionPrincipal = term; break;
          case 'T.U.C.': filters.tuc = term; break;
          case 'Nro. de Placa secundaria': filters.placaSecundaria = term; break;
          case 'Modelo': filters.modelo = term; break;
          case 'Marca': filters.marca = term; break;
          default: break;
        }
      }
      const response = await obtenerVehiculos(filters);
      const lista = response?.vehiculos || response?.data || [];
      setVehiculos(Array.isArray(lista) ? lista : []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error al buscar vehículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehiculo) => {
    const id = getId(vehiculo);
    if (!id) return;

    const result = await Swal.fire({
      title: '¿Deseas eliminar este vehículo?',
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
      await eliminarVehiculo(id);
      setVehiculos((prev) => prev.filter((v) => getId(v) !== id));
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el vehículo'
      });
    }
  };

  // Lógica de paginación simple
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentItems = vehiculos.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(vehiculos.length / itemsPerPage);

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl shadow-blue-200">
            <Car size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Gestión de Vehículos</h2>
            <p className="text-sm font-medium text-slate-500">Registro de unidades, placas y autorizaciones MTC</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cargarVehiculos}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-6 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:translate-y-[-1px] active:scale-95 uppercase tracking-tighter"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            NUEVO VEHÍCULO
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unidades Totales</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">{vehiculos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-72 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <Filter size={14} className="text-menta-turquesa" />
              <label>Criterio de Búsqueda</label>
            </div>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11 transition"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option>Nro. de Placa</option>
                <option>Autorización placa principal</option>
                <option>T.U.C.</option>
                <option>Nro. de Placa secundaria</option>
                <option>Modelo</option>
                <option>Marca</option>
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
                placeholder="Ingresa los datos para buscar..."
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

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-16">#</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Placa</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Autorización Principal</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">T.U.C.</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Modelo / Marca</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-menta-petroleo pr-10">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando unidades...</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-200">
                      <Car size={48} />
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-800 uppercase tracking-tighter">Sin vehículos</p>
                        <p className="text-xs text-slate-400">No se encontraron registros de unidades móviles</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((vehiculo, index) => (
                  <tr key={getId(vehiculo) || index} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                      {firstIndex + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Hash size={14} />
                        </div>
                        <span className="font-bold text-slate-700 uppercase tracking-tight">
                          {vehiculo.nroPlacaId || vehiculo.nroPlaca || vehiculo.placa}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-xs font-semibold text-slate-600 uppercase">
                          {vehiculo.autorizacionMTCPlacaPrincipal || vehiculo.autorizacionPrincipal || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-indigo-500" />
                        <span className="text-xs font-bold text-slate-600 tracking-wider">
                          {vehiculo.tucId || vehiculo.tuc || 'SIN T.U.C.'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {vehiculo.marcaVehiculo || vehiculo.marca || 'S/M'}
                        </span>
                        <span className="font-semibold text-slate-700 uppercase">
                          {vehiculo.modeloVehiculo || vehiculo.modelo || 'S/M'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditingVehiculo(vehiculo); setShowModal(true); }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-menta-petroleo hover:text-white transition-all active:scale-90"
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(vehiculo)}
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

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 gap-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            MOSTRANDO <span className="text-slate-700">{Math.min(lastIndex, vehiculos.length)}</span> DE <span className="text-slate-700">{vehiculos.length}</span> UNIDADES
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

      {showModal && (
        <VehiculosModal
          initialData={editingVehiculo}
          onClose={() => { setShowModal(false); setEditingVehiculo(null); }}
          onVehiculoCreado={(nuevo) => {
            setVehiculos((prev) => [nuevo, ...prev]);
            setShowModal(false);
            cargarVehiculos();
          }}
          onVehiculoActualizado={(actualizado) => {
            const id = getId(actualizado);
            setVehiculos((prev) => prev.map((v) => (getId(v) === id ? { ...v, ...actualizado } : v)));
            setShowModal(false);
            setEditingVehiculo(null);
            cargarVehiculos();
          }}
        />
      )}
    </div>
  );
};

export default VehiculoLista;