import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  RefreshCcw,
  Layers,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hash,
  FileText,
  Save,
  Tag
} from 'lucide-react';
import {
  obtenerReferenciasInventario,
  crearReferencia,
  actualizarReferencia,
  eliminarReferencia
} from '../../services/inventarioService';
import Swal from 'sweetalert2';

const ReferenciaInventario = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState({ codigo: '', descripcion: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inventarioData, setInventarioData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    cargarReferencias();
  }, [pagination.page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        cargarReferencias();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const cargarReferencias = async () => {
    try {
      setLoading(true);
      setError('');

      const filtros = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined
      };

      const response = await obtenerReferenciasInventario(filtros);

      setInventarioData(response.referencias || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      }));
    } catch (error) {
      console.error('Error al cargar referencias:', error);
      setError('Error al cargar las referencias de inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem({ codigo: '', descripcion: '' });
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem({
      codigo: item.codigo,
      descripcion: item.descripcion
    });
    setIsEditing(true);
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta referencia se eliminará permanentemente",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#126171',
      cancelButtonColor: '#ff4d4d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await eliminarReferencia(id);
      await cargarReferencias();
      Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error('Error al eliminar referencia:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la referencia' });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingItem({ codigo: '', descripcion: '' });
    setIsEditing(false);
    setEditingId(null);
    setError('');
  };

  const handleModalAccept = async () => {
    if (!editingItem.codigo || !editingItem.descripcion) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isEditing) {
        await actualizarReferencia(editingId, {
          codigo: editingItem.codigo,
          descripcion: editingItem.descripcion
        });
        Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1500, showConfirmButton: false });
      } else {
        await crearReferencia({
          codigo: editingItem.codigo,
          descripcion: editingItem.descripcion
        });
        Swal.fire({ icon: 'success', title: 'Creado', timer: 1500, showConfirmButton: false });
      }

      await cargarReferencias();
      handleModalClose();
    } catch (error) {
      console.error('Error al guardar referencia:', error);
      setError(error.message || 'Error al guardar la referencia');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    cargarReferencias();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const startIndex = (pagination.page - 1) * pagination.limit;

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl shadow-emerald-200">
            <Layers size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Referencias de Inventario</h2>
            <p className="text-sm font-medium text-slate-500">Administra los códigos y descripciones maestras de tus productos</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cargarReferencias}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
          <button
            onClick={handleCreate}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-6 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:translate-y-[-1px] active:scale-95 uppercase tracking-tighter"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            NUEVA REFERENCIA
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex flex-wrap gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Package size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Referencias</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">{pagination.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
            <Search size={14} className="text-menta-turquesa" />
            <label>Búsqueda Maestra</label>
          </div>
          <div className="relative group">
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-12 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11 transition shadow-sm group-hover:border-slate-300"
              placeholder="Buscar por código o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1.5 h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-menta-petroleo hover:text-white transition-all active:scale-90"
            >
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-16">#</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Código</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Descripción</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-menta-petroleo pr-10">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && inventarioData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-emerald-600" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consultando inventario...</p>
                    </div>
                  </td>
                </tr>
              ) : inventarioData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-200">
                      <Package size={48} />
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-800 uppercase tracking-tighter">Sin registros</p>
                        <p className="text-xs text-slate-400">No se encontraron referencias que coincidan</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                inventarioData.map((item, index) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                          <Hash size={14} />
                        </div>
                        <span className="font-bold text-slate-700 uppercase tracking-tight">{item.codigo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-indigo-400" />
                        <span className="font-medium text-slate-600 uppercase text-xs">{item.descripcion}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 pr-4">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all active:scale-90 shadow-sm"
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleEliminar(item.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white transition-all active:scale-90 shadow-sm"
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
            MOSTRANDO <span className="text-slate-700">{Math.min(startIndex + 1, pagination.total)}</span> - <span className="text-slate-700">{Math.min(startIndex + pagination.limit, pagination.total)}</span> DE <span className="text-slate-700">{pagination.total}</span> REFERENCIAS
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 transition-all disabled:opacity-30 active:scale-95 shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex h-9 items-center px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm min-w-[60px] justify-center">
              {pagination.page} / {pagination.totalPages || 1}
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 transition-all disabled:opacity-30 active:scale-95 shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-menta-petroleo to-menta-marino px-8 py-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight">
                    {isEditing ? 'Editar Referencia' : 'Nueva Referencia'}
                  </h3>
                  <p className="text-[10px] font-medium text-white/70 uppercase tracking-widest">Maestro de Inventario</p>
                </div>
              </div>
              <button
                onClick={handleModalClose}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              {error && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-center gap-3 text-red-600 animate-in shake duration-500">
                  <X size={18} />
                  <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                    <Hash size={14} className="text-menta-turquesa" />
                    <label>Código Interno</label>
                  </div>
                  <input
                    type="text"
                    value={editingItem.codigo}
                    onChange={(e) => setEditingItem({ ...editingItem, codigo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 outline-none transition"
                    placeholder="Ej: ART-001"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                    <Tag size={14} className="text-menta-turquesa" />
                    <label>Descripción del Producto</label>
                  </div>
                  <textarea
                    rows="3"
                    value={editingItem.descripcion}
                    onChange={(e) => setEditingItem({ ...editingItem, descripcion: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 outline-none transition resize-none"
                    placeholder="Describe el producto o referencia..."
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button
                className="flex-1 h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
                onClick={handleModalClose}
                disabled={loading}
              >
                CANCELAR
              </button>
              <button
                className="flex-[2] h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 hover:translate-y-[-1px] transition-all active:scale-95 disabled:opacity-50"
                onClick={handleModalAccept}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCcw size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {isEditing ? 'ACTUALIZAR DATOS' : 'GUARDAR REFERENCIA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenciaInventario;