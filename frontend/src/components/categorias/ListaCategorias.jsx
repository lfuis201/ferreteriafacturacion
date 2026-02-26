import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, CheckCircle, XCircle, FolderOpen } from 'lucide-react';
import { obtenerCategorias, eliminarCategoria } from '../../services/categoriaService';
import Swal from 'sweetalert2';

function ListaCategorias({ onEditarCategoria, onNuevaCategoria }) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    if (Array.isArray(categorias)) {
      const filtradas = categorias.filter(categoria =>
        categoria.nombre && categoria.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
      );
      setCategoriasFiltradas(filtradas);
    } else {
      setCategoriasFiltradas([]);
    }
  }, [categorias, filtroNombre]);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const categoriasData = await obtenerCategorias();
      const categoriasArray = Array.isArray(categoriasData) ? categoriasData :
        (categoriasData?.data && Array.isArray(categoriasData.data)) ? categoriasData.data : [];
      setCategorias(categoriasArray);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategorias([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: `¿Estás seguro de que quieres eliminar "${nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      try {
        await eliminarCategoria(id);
        Swal.fire({
          icon: 'success',
          title: 'Categoría eliminada',
          text: 'La categoría ha sido eliminada correctamente'
        });
        cargarCategorias();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 shadow-sm">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-menta-petroleo" />
        <p className="mt-4 text-menta-petroleo">Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen size={28} className="text-menta-petroleo" />
          <h2 className="text-xl font-bold text-fondo sm:text-2xl">Gestión de Categorías</h2>
        </div>
        <button
          type="button"
          onClick={onNuevaCategoria}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-menta-petroleo px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-menta-marino focus:outline-none focus:ring-2 focus:ring-menta-turquesa focus:ring-offset-2"
        >
          <Plus size={20} />
          Nueva Categoría
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <label htmlFor="filtro-categoria" className="mb-2 block text-sm font-medium text-menta-petroleo">
          Buscar categoría
        </label>
        <input
          id="filtro-categoria"
          type="text"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          placeholder="Nombre de la categoría..."
          className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-menta-turquesa focus:outline-none focus:ring-2 focus:ring-menta-turquesa"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoriasFiltradas.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center">
            <FolderOpen size={48} className="text-menta-medio" />
            <p className="mt-3 font-medium text-fondo">No se encontraron categorías</p>
            <p className="mt-1 text-sm text-menta-petroleo">
              {filtroNombre ? 'Prueba con otro término de búsqueda' : 'Crea una nueva categoría para comenzar'}
            </p>
          </div>
        ) : (
          categoriasFiltradas.map(categoria => (
            <div
              key={categoria.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="min-w-0 flex-1 truncate text-lg font-semibold text-fondo">
                  {categoria.nombre}
                </h3>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => onEditarCategoria(categoria)}
                    title="Editar categoría"
                    className="rounded-lg p-2 text-slate-600 transition hover:bg-menta-claro hover:text-menta-petroleo focus:outline-none focus:ring-2 focus:ring-menta-turquesa"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(categoria.id, categoria.nombre)}
                    title="Eliminar categoría"
                    className="rounded-lg p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {categoria.descripcion && (
                <p className="mt-2 line-clamp-2 text-sm text-menta-marino">
                  {categoria.descripcion}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
                <span className="inline-flex items-center gap-1.5 text-sm text-menta-petroleo">
                  <Package size={16} />
                  {categoria.Productos?.length || 0} productos
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    categoria.estado === 'activo'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {categoria.estado === 'activo' ? (
                    <>
                      <CheckCircle size={14} />
                      Activa
                    </>
                  ) : (
                    <>
                      <XCircle size={14} />
                      Inactiva
                    </>
                  )}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-fondo">{categorias.length}</p>
          <p className="text-sm font-medium text-menta-petroleo">Total de categorías</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-menta-esmeralda">
            {categorias.filter(c => c.estado === 'activo').length}
          </p>
          <p className="text-sm font-medium text-menta-petroleo">Categorías activas</p>
        </div>
        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1">
          <p className="text-2xl font-bold text-menta-marino">{categoriasFiltradas.length}</p>
          <p className="text-sm font-medium text-menta-petroleo">Mostrando</p>
        </div>
      </div>
    </div>
  );
}

export default ListaCategorias;
