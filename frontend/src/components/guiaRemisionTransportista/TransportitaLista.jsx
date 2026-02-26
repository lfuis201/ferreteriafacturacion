import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Truck,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  RefreshCcw,
  Hash,
  Users,
  Building,
  FileText,
  ChevronDown
} from 'lucide-react';
import TransportistasModal from './transportistas.jsx';
import { obtenerTransportistas, buscarTransportistas, eliminarTransportista } from '../../services/transportistaService';
import Swal from 'sweetalert2';

const TransportistaLista = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Nombre');

  const [transportistas, setTransportistas] = useState([]);
  const [transportistasAll, setTransportistasAll] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTransportista, setEditingTransportista] = useState(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const cargarTransportistas = async () => {
    try {
      setLoading(true);
      const response = await obtenerTransportistas();
      const lista = response.transportistas || response.data || [];
      setTransportistasAll(lista);
      setTransportistas(lista);
      setTotalItems(lista.length);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error al cargar transportistas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTransportistas();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransportistas = transportistas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transportistas.length / itemsPerPage);

  const handleBuscar = async () => {
    const termino = (searchTerm || '').trim();
    if (!termino) {
      setTransportistas(transportistasAll);
      setTotalItems(transportistasAll.length);
      setCurrentPage(1);
      return;
    }
    try {
      setLoading(true);
      let resultados = [];

      if (filterType === 'Nombre') {
        const res = await buscarTransportistas({ razonSocial: termino });
        resultados = res.transportistas || [];
      } else if (filterType === 'Tipo de documento') {
        const res = await buscarTransportistas({ tipoDocumento: termino });
        resultados = res.transportistas || [];
      } else if (filterType === 'Número') {
        const res = await buscarTransportistas({ numeroDocumento: termino });
        resultados = res.transportistas || [];
      } else if (filterType === 'MTC') {
        resultados = transportistasAll.filter(t =>
          (t.mtc || '').toLowerCase().includes(termino.toLowerCase())
        );
      }

      setTransportistas(resultados);
      setTotalItems(resultados.length);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error al buscar transportistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Deseas eliminar este transportista?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#126171',
      cancelButtonColor: '#ff4d4d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      borderRadius: '1rem'
    });

    if (!result.isConfirmed) return;

    try {
      await eliminarTransportista(id);
      const nuevaListaAll = transportistasAll.filter(t => t.id !== id);
      const nuevaLista = transportistas.filter(t => t.id !== id);

      setTransportistasAll(nuevaListaAll);
      setTransportistas(nuevaLista);
      setTotalItems(nuevaLista.length);

      if (currentTransportistas.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El transportista ha sido eliminado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al eliminar transportista:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el transportista',
        confirmButtonColor: '#126171'
      });
    }
  };

  // Funciones para cambiar de página
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToPage = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
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
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Gestión de Transportistas</h2>
            <p className="text-sm font-medium text-slate-500">Administra las empresas y conductores para el traslado de carga</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => cargarTransportistas()}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-700 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-6 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:translate-y-[-1px] active:scale-95 uppercase tracking-tighter"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            NUEVO TRANSPORTISTA
          </button>
        </div>
      </div>

      {/* Stats/Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Registrados</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">{totalItems}</p>
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
              <label>Criterio de Búsqueda</label>
            </div>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none transition h-11"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option>Nombre</option>
                <option>Tipo de documento</option>
                <option>Número</option>
                <option>MTC</option>
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
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-12 text-sm font-semibold text-slate-700 focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 outline-none transition h-11"
                placeholder="Escribe aquí para buscar..."
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
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Razon Social / Nombre</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Tipo Doc.</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Número Doc.</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Certificado MTC</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-menta-petroleo pr-10">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando datos...</p>
                    </div>
                  </td>
                </tr>
              ) : currentTransportistas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Truck size={48} className="text-slate-200" />
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-800 tracking-tighter uppercase">No hay transportistas</p>
                        <p className="text-xs text-slate-400">Intenta cambiar los filtros o agrega un nuevo registro</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentTransportistas.map((transportista, index) => (
                  <tr key={transportista.id || index} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <Building size={14} />
                        </div>
                        <span className="uppercase">{transportista.razonSocial || transportista.nombre || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {transportista.tipoDocumento}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600 tracking-tight">
                      {transportista.numeroDocumento || transportista.numero || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase">
                        <FileText size={12} />
                        {transportista.mtc || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingTransportista(transportista);
                            setShowModal(true);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(transportista.id)}
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

        {/* Improved Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 gap-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            MOSTRANDO <span className="text-slate-700">{Math.min(indexOfLastItem, totalItems)}</span> DE <span className="text-slate-700">{totalItems}</span> TRANSPORTISTAS
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-30 disabled:hover:border-slate-200"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex gap-1 px-2">
              {getPageNumbers().map((pageNumber, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNumber === 'number' && goToPage(pageNumber)}
                  disabled={pageNumber === '...'}
                  className={`flex h-9 min-w-[36px] items-center justify-center rounded-xl text-xs font-bold transition-all
                    ${pageNumber === currentPage
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                    } ${pageNumber === '...' ? 'cursor-default border-none bg-transparent' : ''}`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-30 disabled:hover:border-slate-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            PÁGINA {currentPage} DE {totalPages || 1}
          </div>
        </div>
      </div>

      {showModal && (
        <TransportistasModal
          isOpen={showModal}
          initialData={editingTransportista}
          onClose={() => {
            setShowModal(false);
            setEditingTransportista(null);
          }}
          onSave={(item) => {
            if (editingTransportista && item?.id === editingTransportista.id) {
              const updatedAll = transportistasAll.map(t => t.id === item.id ? { ...t, ...item } : t);
              const updatedFiltered = transportistas.map(t => t.id === item.id ? { ...t, ...item } : t);
              setTransportistasAll(updatedAll);
              setTransportistas(updatedFiltered);
            } else {
              setTransportistasAll(prev => [item, ...prev]);
              setTransportistas(prev => [item, ...prev]);
              setTotalItems(prev => prev + 1);
            }
            setShowModal(false);
            setEditingTransportista(null);
            cargarTransportistas(); // Recargar para asegurar consistencia
          }}
        />
      )}
    </div>
  );
};

export default TransportistaLista;