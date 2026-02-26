import React, { useEffect, useState } from 'react';
import { Layers, Plus, Pencil, Trash2, X } from 'lucide-react';
import loteService from '../../services/loteService';
import { obtenerProductos } from '../../services/productoService';
import { obtenerSucursales } from '../../services/sucursalService';

const inputBase =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-menta-turquesa focus:outline-none focus:ring-2 focus:ring-menta-turquesa';

const Lotes = () => {
  const [showModal, setShowModal] = useState(false);
  const [lotes, setLotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const totalPaginas = Math.max(1, Math.ceil(total / limit));
  const [loteEditando, setLoteEditando] = useState(null);
  const [productos, setProductos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [formData, setFormData] = useState({
    lote: '',
    producto: '',
    vencimiento: '',
    almacén: '',
    estado: 'Activo',
    stock: '0'
  });

  const cargarProductos = async () => {
    try {
      const res = await obtenerProductos({});
      const lista = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.productos) ? res.productos : []);
      setProductos(lista);
    } catch (error) {
      console.error('Error al cargar productos:', error.message);
    }
  };

  const cargarSucursales = async () => {
    try {
      const data = await obtenerSucursales();
      setSucursales(data?.sucursales || []);
    } catch (error) {
      console.error('Error al cargar sucursales:', error.message);
    }
  };

  const cargarLotes = async () => {
    try {
      const { data, total: t } = await loteService.obtenerLotes({ page, limit });
      const filas = (data || []).map((item) => ({
        id: item.id,
        lote: item.lote,
        producto: item.Producto?.nombre || '',
        productoId: item.productoId,
        vencimiento: item.vencimiento || '',
        almacén: item.Almacen?.nombre || '',
        almacenId: item.almacenId,
        estado: item.estado,
        stock: item.stock
      }));
      setLotes(filas);
      setTotal(t ?? filas.length);
    } catch (error) {
      console.error('Error al cargar lotes:', error.message);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarSucursales();
  }, []);

  useEffect(() => {
    cargarLotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const abrirModalNuevo = () => {
    setLoteEditando(null);
    setFormData({ lote: '', producto: '', vencimiento: '', almacén: '', estado: 'Activo', stock: '0' });
    setShowModal(true);
  };

  const abrirModalEditar = (lote) => {
    setLoteEditando(lote);
    setFormData({
      lote: lote?.lote || '',
      producto: String(lote?.productoId || ''),
      vencimiento: lote?.vencimiento || '',
      almacén: String(lote?.almacenId || ''),
      estado: lote?.estado || 'Activo',
      stock: String(lote?.stock ?? '0')
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setLoteEditando(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const guardarLote = async (e) => {
    if (e) e.preventDefault();
    const parseId = (valor, lista, campoNombre) => {
      if (!valor) return undefined;
      if (/^\d+$/.test(valor)) return Number(valor);
      const arr = Array.isArray(lista) ? lista : (lista?.data ?? lista?.productos ?? lista?.almacenes ?? []);
      const encontrado = arr.find((x) => String(x[campoNombre] || '').toLowerCase() === String(valor).toLowerCase());
      return encontrado?.id;
    };

    const payload = {
      lote: formData.lote,
      productoId: parseId(formData.producto, productos, 'nombre'),
      producto: (formData.producto || '').trim() || undefined,
      sucursalId: (/^\d+$/.test(formData.almacén) ? Number(formData.almacén) : undefined),
      almacen: undefined,
      vencimiento: formData.vencimiento || null,
      estado: formData.estado || 'Activo',
      stock: Number(formData.stock) || 0,
    };

    const norm = (s) => (s ?? '').toString().trim().toLowerCase();
    const productosLista = Array.isArray(productos) ? productos : (productos?.productos ?? []);
    const productoSeleccionado = productosLista.find((p) => norm(p?.nombre) === norm(formData.producto));
    if (!payload.productoId && productoSeleccionado?.id) {
      payload.productoId = productoSeleccionado.id;
    }

    try {
      if (loteEditando?.id) {
        await loteService.actualizarLote(loteEditando.id, payload);
      } else {
        await loteService.crearLote(payload);
      }
      await cargarLotes();
      cerrarModal();
    } catch (error) {
      alert(error.message || 'Error al guardar el lote');
    }
  };

  const eliminarLote = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este lote?')) return;
    try {
      await loteService.eliminarLote(id);
      await cargarLotes();
    } catch (error) {
      alert(error.message || 'Error al eliminar el lote');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-menta-suave text-menta-petroleo">
            <Layers size={24} />
          </span>
          <h1 className="text-2xl font-semibold text-fondo">Lotes</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-menta-petroleo">Total: {total}</span>
          <button
            type="button"
            onClick={abrirModalNuevo}
            className="inline-flex items-center gap-2 rounded-xl bg-menta-petroleo px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-menta-marino"
          >
            <Plus size={18} /> Nuevo
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Lote</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Vencimiento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Almacén</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {lotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-menta-petroleo">
                    No hay lotes registrados
                  </td>
                </tr>
              ) : (
                lotes.map((lote, index) => (
                  <tr key={lote.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{index + 1}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-fondo">{lote.lote}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{lote.producto}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{lote.vencimiento || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{lote.almacén || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{lote.estado}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{lote.stock}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(lote)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-menta-petroleo transition hover:bg-menta-claro"
                        >
                          <Pencil size={16} /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarLote(lote.id)}
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-3">
          <span className="text-sm text-menta-petroleo">Total: {total}</span>
          {totalPaginas > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-menta-petroleo transition hover:bg-slate-50 disabled:opacity-50"
              >
                ‹
              </button>
              <span className="px-3 py-2 text-sm text-menta-petroleo">{page} / {totalPaginas}</span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPaginas, p + 1))}
                disabled={page >= totalPaginas}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-menta-petroleo transition hover:bg-slate-50 disabled:opacity-50"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={cerrarModal}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="text-lg font-semibold text-fondo">{loteEditando ? 'Editar Lote' : 'Nuevo Lote'}</h2>
              <button
                type="button"
                onClick={cerrarModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardarLote} className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-menta-petroleo">Lote</label>
                  <input
                    type="text"
                    name="lote"
                    value={formData.lote}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-menta-petroleo">Producto</label>
                  <select
                    name="producto"
                    value={formData.producto}
                    onChange={handleInputChange}
                    className={inputBase}
                  >
                    <option value="">Seleccione producto</option>
                    {(Array.isArray(productos) ? productos : productos?.productos ?? productos?.data ?? []).map((p) => (
                      <option key={p.id} value={String(p.id)}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-menta-petroleo">Vencimiento</label>
                  <input
                    type="date"
                    name="vencimiento"
                    value={formData.vencimiento}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-menta-petroleo">Sucursal</label>
                  <select
                    name="almacén"
                    value={formData.almacén}
                    onChange={handleInputChange}
                    className={inputBase}
                  >
                    <option value="">Seleccione sucursal</option>
                    {(Array.isArray(sucursales) ? sucursales : []).map((s) => (
                      <option key={s.id} value={String(s.id)}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-menta-petroleo">Estado</label>
                  <input
                    type="text"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-menta-petroleo">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className={inputBase}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-menta-petroleo px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-menta-marino"
                >
                  {loteEditando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lotes;
