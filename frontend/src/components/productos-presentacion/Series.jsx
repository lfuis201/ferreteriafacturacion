import React, { useEffect, useState } from 'react';
import { ClipboardList, Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { obtenerProductos } from '../../services/productoService';
import { obtenerSeries, crearSerie, actualizarSerie, eliminarSerie } from '../../services/serieService';

const inputBase =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-menta-turquesa focus:outline-none focus:ring-2 focus:ring-menta-turquesa';

const badgeEstado = (estado) => {
  const e = (estado || '').toLowerCase();
  if (e.includes('activo')) return 'border-green-200 bg-green-100 text-green-800';
  if (e.includes('inactivo')) return 'border-slate-200 bg-slate-100 text-slate-600';
  if (e.includes('reparación') || e.includes('reparacion')) return 'border-amber-200 bg-amber-100 text-amber-800';
  if (e.includes('garantía') || e.includes('garantia')) return 'border-blue-200 bg-blue-100 text-blue-800';
  return 'border-slate-200 bg-slate-100 text-slate-600';
};

const Series = () => {
  const [showModal, setShowModal] = useState(false);
  const [series, setSeries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filterBy, setFilterBy] = useState('serie');
  const [query, setQuery] = useState('');

  const [formData, setFormData] = useState({
    serie: '',
    producto: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'Activo',
    vendido: 'No',
    observaciones: ''
  });

  const handleOpenModal = (serieItem = null) => {
    if (serieItem) {
      setEditingId(serieItem.id);
      setFormData({
        serie: serieItem.serie || '',
        producto: String(serieItem.productoId || serieItem.Producto?.id || ''),
        fecha: serieItem.fecha || new Date().toISOString().split('T')[0],
        estado: serieItem.estado || 'Activo',
        vendido: typeof serieItem.vendido === 'boolean' ? (serieItem.vendido ? 'Sí' : 'No') : (serieItem.vendido || 'No'),
        observaciones: serieItem.observaciones || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        serie: '',
        producto: '',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'Activo',
        vendido: 'No',
        observaciones: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        serie: formData.serie,
        productoId: formData.producto,
        fecha: formData.fecha,
        estado: formData.estado,
        vendido: formData.vendido === 'Sí',
        observaciones: formData.observaciones
      };

      if (editingId) {
        const actualizada = await actualizarSerie(editingId, payload);
        setSeries(prev => prev.map(it => (it.id === actualizada.id ? actualizada : it)));
      } else {
        const creada = await crearSerie(payload);
        setSeries(prev => [creada, ...prev]);
        setTotal(prev => prev + 1);
      }

      setShowModal(false);
      setEditingId(null);
    } catch (err) {
      alert(err.message || 'Error al guardar la serie');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta serie?')) return;
    try {
      await eliminarSerie(id);
      setSeries(prev => prev.filter(item => item.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.message || 'Error al eliminar la serie');
    }
  };

  const cargarProductos = async () => {
    try {
      const res = await obtenerProductos();
      setProductos(res.productos || res.data || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  const cargarSeries = async () => {
    try {
      const res = await obtenerSeries({ filterBy, query, page, limit });
      setSeries(res.series || res.data || []);
      setTotal(res.total ?? (res.series ? res.series.length : 0));
    } catch (err) {
      console.error('Error al cargar series:', err);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    cargarSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterBy, query, page]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-menta-suave text-menta-petroleo">
            <ClipboardList size={24} />
          </span>
          <h1 className="text-2xl font-semibold text-fondo">Series</h1>
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
        <h2 className="mb-4 text-base font-semibold text-fondo">Listado de Series</h2>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-menta-petroleo">Filtrar por:</label>
            <select
              value={filterBy}
              onChange={(e) => { setPage(1); setFilterBy(e.target.value || 'serie'); }}
              className={`${inputBase} w-auto min-w-[140px]`}
            >
              <option value="serie">Serie</option>
              <option value="producto">Producto</option>
              <option value="estado">Estado</option>
            </select>
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-menta-petroleo" />
            <input
              type="text"
              placeholder="Buscar"
              value={query}
              onChange={(e) => { setPage(1); setQuery(e.target.value); }}
              className={`${inputBase} pl-10`}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Serie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Vendido</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {series.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-menta-petroleo">
                      No hay series registradas
                    </td>
                  </tr>
                ) : (
                  series.map((item, index) => (
                    <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{index + 1}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-fondo">{item.serie}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">
                        {item.Producto?.nombre || item.productoNombre || item.producto || '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{item.fecha}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${badgeEstado(item.estado)}`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">
                        {typeof item.vendido === 'boolean' ? (item.vendido ? 'Sí' : 'No') : item.vendido}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(item)}
                            title="Editar"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-menta-claro hover:text-menta-petroleo"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            title="Eliminar"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-3">
            <span className="text-sm text-menta-petroleo">Total: {total}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-menta-petroleo transition hover:bg-slate-50 disabled:opacity-50"
              >
                ‹
              </button>
              <span className="rounded-lg border border-slate-200 bg-menta-petroleo px-3 py-2 text-sm font-medium text-white">
                {page}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => p + 1)}
                disabled={series.length < limit}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-menta-petroleo transition hover:bg-slate-50 disabled:opacity-50"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="text-lg font-semibold text-fondo">{editingId ? 'Editar Serie' : 'Nueva Serie'}</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Serie *</label>
                    <input
                      type="text"
                      value={formData.serie}
                      onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                      className={inputBase}
                      placeholder="Ingrese el número de serie"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Producto *</label>
                    <select
                      value={formData.producto}
                      onChange={(e) => setFormData({ ...formData, producto: e.target.value })}
                      className={inputBase}
                      required
                    >
                      <option value="">Seleccionar producto</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Fecha *</label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className={inputBase}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className={inputBase}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="En Reparación">En Reparación</option>
                      <option value="Garantía">Garantía</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Vendido</label>
                    <select
                      value={formData.vendido}
                      onChange={(e) => setFormData({ ...formData, vendido: e.target.value })}
                      className={inputBase}
                    >
                      <option value="No">No</option>
                      <option value="Sí">Sí</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Observaciones</label>
                    <textarea
                      rows={3}
                      placeholder="Ingrese observaciones adicionales (opcional)"
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
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

export default Series;
