import React, { useEffect, useState } from 'react';
import { Tag, Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { getMarcas, createMarca, updateMarca, deleteMarca } from '../../services/marcaService';

const inputBase =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-menta-turquesa focus:outline-none focus:ring-2 focus:ring-menta-turquesa';

const Marcas = () => {
  const [showModal, setShowModal] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [total, setTotal] = useState(0);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [page] = useState(1);
  const [limit] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '' });

  const handleOpenModal = (marca = null) => {
    if (marca) {
      setEditingId(marca.id);
      setFormData({ nombre: marca.nombre });
    } else {
      setEditingId(null);
      setFormData({ nombre: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const actualizada = await updateMarca(editingId, { nombre: formData.nombre });
        setMarcas(marcas.map(m => (m.id === actualizada.id ? actualizada : m)));
      } else {
        const creada = await createMarca({ nombre: formData.nombre });
        setMarcas([creada, ...marcas]);
        setTotal(total + 1);
      }
      setShowModal(false);
      setEditingId(null);
    } catch (err) {
      alert(err?.message || 'Error al guardar la marca');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta marca?')) return;
    try {
      await deleteMarca(id);
      setMarcas(marcas.filter(m => m.id !== id));
      setTotal(Math.max(0, total - 1));
    } catch (err) {
      alert(err?.message || 'Error al eliminar la marca');
    }
  };

  const cargarMarcas = async () => {
    try {
      const { data, total: t } = await getMarcas({ nombre: filtroNombre, page, limit });
      setMarcas(data || []);
      setTotal(t ?? 0);
    } catch (err) {
      alert(err?.message || 'Error al cargar marcas');
    }
  };

  const handleSearch = async () => {
    await cargarMarcas();
  };

  useEffect(() => {
    cargarMarcas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-menta-suave text-menta-petroleo">
            <Tag size={24} />
          </span>
          <h1 className="text-2xl font-semibold text-fondo">Marcas</h1>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-xl bg-menta-petroleo px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-menta-marino"
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-fondo">Listado de Marcas</h2>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-menta-petroleo" />
            <input
              type="text"
              placeholder="Nombre"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className={`${inputBase} pl-10`}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-menta-petroleo transition hover:bg-slate-50"
          >
            <Search size={18} /> Buscar
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Fecha creación</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {marcas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-menta-petroleo">
                      No hay marcas registradas
                    </td>
                  </tr>
                ) : (
                  marcas.map((marca, index) => (
                    <tr key={marca.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{index + 1}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-fondo">{marca.nombre}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">
                        {marca.createdAt ? new Date(marca.createdAt).toLocaleString() : '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(marca)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-menta-petroleo transition hover:bg-menta-claro"
                          >
                            <Pencil size={16} /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(marca.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-4 py-3">
            <span className="text-sm text-menta-petroleo">Total: {total}</span>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-fondo">{editingId ? 'Editar marca' : 'Nueva marca'}</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-menta-petroleo">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className={inputBase}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-menta-petroleo px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-menta-marino"
                >
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marcas;
