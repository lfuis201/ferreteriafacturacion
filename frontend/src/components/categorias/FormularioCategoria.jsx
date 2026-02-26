import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Loader2, FolderOpen } from 'lucide-react';
import { crearCategoria, actualizarCategoria } from '../../services/categoriaService';
import Swal from 'sweetalert2';

function FormularioCategoria({ categoria, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 'activo'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const esEdicion = Boolean(categoria);

  useEffect(() => {
    if (categoria) {
      setFormData({
        nombre: categoria.nombre || '',
        descripcion: categoria.descripcion || '',
        estado: categoria.estado || 'activo'
      });
    }
  }, [categoria]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrors = {};
    if (!formData.nombre.trim()) {
      nuevosErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      nuevosErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    setErrors(nuevosErrors);
    return Object.keys(nuevosErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      let resultado;
      if (esEdicion) {
        resultado = await actualizarCategoria(categoria.id, formData);
      } else {
        resultado = await crearCategoria(formData);
      }
      Swal.fire({
        icon: 'success',
        title: esEdicion ? 'Categoría actualizada' : 'Categoría creada',
        text: `La categoría ha sido ${esEdicion ? 'actualizada' : 'creada'} correctamente`
      });
      onGuardar(resultado);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-menta-turquesa focus:outline-none focus:ring-2 focus:ring-menta-turquesa';
  const inputError = 'border-red-500 focus:border-red-500 focus:ring-red-500';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-fondo sm:text-2xl">
            <FolderOpen size={28} className="text-menta-petroleo" />
            {esEdicion ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button
            type="button"
            onClick={onCancelar}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-menta-petroleo focus:outline-none focus:ring-2 focus:ring-menta-turquesa"
          >
            <X size={22} />
          </button>
        </div>
        <p className="text-sm text-menta-petroleo">
          {esEdicion ? 'Modifica los datos de la categoría' : 'Completa los datos para crear una nueva categoría'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-6 p-4 sm:p-6">
          <div>
            <label htmlFor="nombre" className="mb-1 block text-sm font-semibold text-menta-petroleo">
              Nombre *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={`${inputBase} ${errors.nombre ? inputError : ''}`}
              placeholder="Nombre de la categoría"
              maxLength={100}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm font-medium text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label htmlFor="descripcion" className="mb-1 block text-sm font-semibold text-slate-700">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={4}
              placeholder="Descripción de la categoría (opcional)"
              maxLength={500}
              className={`${inputBase} resize-none`}
            />
            <p className="mt-1 text-right text-xs text-menta-petroleo">
              {formData.descripcion.length}/500 caracteres
            </p>
          </div>

          <div>
            <label htmlFor="estado" className="mb-1 block text-sm font-semibold text-slate-700">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className={inputBase}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm text-menta-marino">
              {formData.estado === 'activo' ? (
                <span className="flex items-start gap-2">
                  <CheckCircle size={18} className="shrink-0 text-menta-esmeralda" />
                  La categoría estará disponible para asignar a productos
                </span>
              ) : (
                <span className="flex items-start gap-2">
                  <XCircle size={18} className="shrink-0 text-menta-petroleo" />
                  La categoría no estará disponible para nuevos productos
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
          <button
            type="button"
            onClick={onCancelar}
            disabled={loading}
            className="order-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:order-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-menta-petroleo px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-menta-marino focus:outline-none focus:ring-2 focus:ring-menta-turquesa focus:ring-offset-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {esEdicion ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              esEdicion ? 'Actualizar Categoría' : 'Crear Categoría'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioCategoria;
