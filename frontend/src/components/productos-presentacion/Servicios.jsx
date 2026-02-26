import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Settings, Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { servicioService } from '../../services/servicioService';

const inputBase =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-menta-turquesa focus:outline-none focus:ring-2 focus:ring-menta-turquesa';

const Servicios = () => {
  const [showModal, setShowModal] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [buscarNombre, setBuscarNombre] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('Precio');

  const [formData, setFormData] = useState({
    codigoInterno: '',
    unidad: '-',
    nombre: '',
    descripcion: '',
    modelo: '',
    moneda: 'Soles',
    precioUnitarioVenta: '0',
    tipoAfectacion: 'Gravado - Operación Onerosa',
    codigoSunat: '',
    categoria: '',
    marca: ''
  });

  const formatoPrecio = (moneda, valor) => {
    const num = Number(valor || 0);
    const pref = moneda === 'Dólares' ? '$' : 'S/';
    return `${pref} ${num.toFixed(2)}`;
  };

  const cargarServicios = useCallback(async (filtroNombre = '') => {
    try {
      setCargando(true);
      setError('');
      const { servicios: data } = await servicioService.obtenerServicios({ nombre: filtroNombre });
      const mapeados = (data || []).map(s => ({
        id: s.id,
        codigoInterno: s.codigo || '',
        unidad: s.unidadMedida || '-',
        nombre: s.nombre,
        stock: '',
        precioUnitarioVenta: formatoPrecio('Soles', s.precioVenta),
        tieneIgv: s.tieneIgv ? 'Si' : 'No',
        raw: s
      }));
      setServicios(mapeados);
    } catch (e) {
      setError(e.message || 'Error al cargar servicios');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarServicios();
  }, [cargarServicios]);

  const handleOpenModal = (servicio = null) => {
    if (servicio) {
      setEditingId(servicio.id);
      setFormData({
        codigoInterno: servicio.codigoInterno,
        unidad: servicio.unidad,
        nombre: servicio.nombre,
        descripcion: '',
        modelo: '',
        moneda: 'Soles',
        precioUnitarioVenta: String(servicio.precioUnitarioVenta || '').replace('S/ ', ''),
        tipoAfectacion: 'Gravado - Operación Onerosa',
        codigoSunat: '',
        categoria: '',
        marca: ''
      });
    } else {
      setEditingId(null);
      setFormData({
        codigoInterno: '',
        unidad: '-',
        nombre: '',
        descripcion: '',
        modelo: '',
        moneda: 'Soles',
        precioUnitarioVenta: '0',
        tipoAfectacion: 'Gravado - Operación Onerosa',
        codigoSunat: '',
        categoria: '',
        marca: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formData.nombre,
        codigo: formData.codigoInterno,
        descripcion: formData.descripcion || '',
        precioVenta: parseFloat(formData.precioUnitarioVenta || '0'),
        unidadMedida: formData.unidad || '-',
        tipodeAfectacion:
          formData.tipoAfectacion === 'Gravado - Operación Onerosa'
            ? 'Gravado_Operación_Onerosa'
            : formData.tipoAfectacion === 'Exonerado'
            ? 'Exonerado_Operación_Onerosa'
            : formData.tipoAfectacion === 'Inafecto'
            ? 'Inafecto_Operación_Onerosa'
            : null,
        codigosunat: formData.codigoSunat || '',
        modelo: formData.modelo || '',
        marca: formData.marca || '',
        tieneIgv: formData.tipoAfectacion.includes('Gravado')
      };

      if (editingId) {
        await servicioService.actualizarServicio(editingId, payload);
      } else {
        await servicioService.crearServicio(payload);
      }

      await cargarServicios();
      setShowModal(false);
      setEditingId(null);
    } catch (err) {
      const serverMsg = err?.response?.data?.mensaje || err?.response?.data?.error;
      alert(serverMsg || err.message || 'Error al guardar el servicio');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este servicio?')) return;
    try {
      await servicioService.eliminarServicio(id);
      await cargarServicios();
    } catch (err) {
      alert(err.message || 'Error al eliminar el servicio');
    }
  };

  const serviciosOrdenados = useMemo(() => {
    const copia = [...servicios];
    if (ordenarPor === 'Nombre') {
      copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (ordenarPor === 'Código') {
      copia.sort((a, b) => (a.codigoInterno || '').localeCompare(b.codigoInterno || ''));
    } else {
      const parsePrecio = (p) => Number(String(p).replace(/[^0-9.]/g, '')) || 0;
      copia.sort((a, b) => parsePrecio(a.precioUnitarioVenta) - parsePrecio(b.precioUnitarioVenta));
    }
    return copia;
  }, [servicios, ordenarPor]);

  const handleBuscar = async () => {
    await cargarServicios(buscarNombre);
  };

  if (cargando && servicios.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-menta-petroleo border-t-transparent" />
          <span className="text-sm text-menta-petroleo">Cargando servicios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-menta-suave text-menta-petroleo">
            <Settings size={24} />
          </span>
          <h1 className="text-2xl font-semibold text-fondo">Servicios</h1>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-menta-petroleo px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-menta-marino"
        >
          <Plus size={18} />
          Nuevo
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-menta-esmeralda bg-white px-4 py-3 text-sm text-menta-petroleo">
          {error}
        </div>
      )}

      {/* Filtros y orden */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-fondo">Listado de servicios</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-menta-petroleo" />
            <input
              type="text"
              placeholder="Nombre"
              value={buscarNombre}
              onChange={(e) => setBuscarNombre(e.target.value)}
              className={`${inputBase} pl-10`}
            />
          </div>
          <button
            type="button"
            onClick={handleBuscar}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-menta-petroleo transition-colors hover:bg-slate-50"
          >
            <Search size={18} />
            Buscar
          </button>
          <select
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value)}
            className={`${inputBase} w-full sm:w-48`}
          >
            <option value="Precio">Ordenar por Precio</option>
            <option value="Nombre">Ordenar por Nombre</option>
            <option value="Código">Ordenar por Código</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Cód. Interno</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Unidad</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">P.Unitario (Venta)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Tiene Igv</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {serviciosOrdenados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-menta-petroleo">
                    No hay servicios registrados
                  </td>
                </tr>
              ) : (
                serviciosOrdenados.map((servicio, index) => (
                  <tr key={servicio.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{index + 1}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{servicio.id}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{servicio.codigoInterno}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{servicio.unidad}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-fondo">{servicio.nombre}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{servicio.precioUnitarioVenta}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{servicio.tieneIgv}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(servicio)}
                          title="Editar"
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-menta-claro hover:text-menta-petroleo"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(servicio.id)}
                          title="Eliminar"
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
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
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-4 py-3">
          <span className="text-sm text-menta-petroleo">Total: {serviciosOrdenados.length}</span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="text-lg font-semibold text-fondo">{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
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
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Nombre *</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className={inputBase}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Código Interno</label>
                    <input
                      type="text"
                      value={formData.codigoInterno}
                      onChange={(e) => setFormData({ ...formData, codigoInterno: e.target.value })}
                      className={inputBase}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-menta-petroleo">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className={`${inputBase} resize-none`}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Modelo</label>
                    <input
                      type="text"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Unidad</label>
                    <select
                      value={formData.unidad}
                      onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                      className={inputBase}
                    >
                      <option value="-">- Servicio</option>
                      <option value="NIU">NIU - Unidad</option>
                      <option value="HUR">HUR - Hora</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Moneda</label>
                    <select
                      value={formData.moneda}
                      onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                      className={inputBase}
                    >
                      <option value="Soles">Soles</option>
                      <option value="Dólares">Dólares</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Precio Unitario (Venta) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precioUnitarioVenta}
                      onChange={(e) => setFormData({ ...formData, precioUnitarioVenta: e.target.value })}
                      className={inputBase}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Tipo de afectación (Venta)</label>
                    <select
                      value={formData.tipoAfectacion}
                      onChange={(e) => setFormData({ ...formData, tipoAfectacion: e.target.value })}
                      className={inputBase}
                    >
                      <option value="Gravado - Operación Onerosa">Gravado - Operación Onerosa</option>
                      <option value="Exonerado">Exonerado</option>
                      <option value="Inafecto">Inafecto</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Código Sunat</label>
                    <input
                      type="text"
                      value={formData.codigoSunat}
                      onChange={(e) => setFormData({ ...formData, codigoSunat: e.target.value })}
                      className={inputBase}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-menta-petroleo">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className={inputBase}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Consultoría">Consultoría</option>
                    <option value="Soporte">Soporte</option>
                  </select>
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

export default Servicios;
