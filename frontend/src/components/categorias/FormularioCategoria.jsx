import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { crearCategoria, actualizarCategoria } from '../../services/categoriaService';
import Swal from 'sweetalert2';
import '../../styles/FormularioCategoria.css';

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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
    
    if (!validarFormulario()) {
      return;
    }

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

  return (
    <div className="formulario-categoria-container">
      <div className="formulario-header">
        <h2>{esEdicion ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
        <button className="btn-cerrar" onClick={onCancelar}>
          <X className="icon" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="formulario-categoria">
        <div className="form-content">
          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={errors.nombre ? 'error' : ''}
              placeholder="Nombre de la categoría"
              maxLength="100"
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows="4"
              placeholder="Descripción de la categoría (opcional)"
              maxLength="500"
            />
            <div className="char-count">
              {formData.descripcion.length}/500 caracteres
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <div className="estado-info">
              {formData.estado === 'activo' ? (
                <span className="estado-activo">
                  <CheckCircle className="icon" /> 
                  <br /> 
                  La categoría estará disponible para asignar a productos
                </span>
              ) : (
                <span className="estado-inactivo">
                  <XCircle className="icon" />
                   <br /> 
                  La categoría no estará disponible para nuevos productos
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancelar"
            onClick={onCancelar}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-guardar"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="icon animate-spin" />
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