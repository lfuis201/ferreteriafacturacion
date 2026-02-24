import React, { useState, useEffect } from 'react';
import { X, Package, Edit3, Trash2 } from 'lucide-react';
import { obtenerPresentaciones } from '../../services/presentacionService';
import '../../styles/ModalVerPresentaciones.css';

function ModalVerPresentaciones({ onCerrar, producto }) {
  const [presentaciones, setPresentaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (producto) {
      cargarPresentaciones();
    }
  }, [producto]);

  const cargarPresentaciones = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await obtenerPresentaciones(producto.id);
      setPresentaciones(response.presentaciones || []);
    } catch (error) {
      console.error('Error al cargar presentaciones:', error);
      setError('Error al cargar las presentaciones');
    } finally {
      setLoading(false);
    }
  };

  const formatearPrecio = (precio) => {
    if (!precio || precio === 0) return '-';
    return `S/ ${parseFloat(precio).toFixed(2)}`;
  };

  const handleEditarPresentacion = (presentacion) => {
    // TODO: Implementar modal de edición de presentación
    console.log('Editar presentación:', presentacion);
    alert(`Funcionalidad de editar presentación en desarrollo.\nPresentación: ${presentacion.descripcion || 'Sin descripción'}`);
  };

  const handleEliminarPresentacion = (presentacion) => {
    // TODO: Implementar confirmación y eliminación de presentación
    console.log('Eliminar presentación:', presentacion);
    if (window.confirm(`¿Está seguro de que desea eliminar la presentación "${presentacion.descripcion || 'Sin descripción'}"?`)) {
      alert('Funcionalidad de eliminar presentación en desarrollo.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-ver-presentaciones" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Package size={20} />
            <h3>Presentaciones del Producto</h3>
          </div>
          <button className="btn-cerrar" onClick={onCerrar}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="producto-info">
            <h4>{producto?.nombre}</h4>
            <p className="producto-codigo">Código: {producto?.codigo}</p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando presentaciones...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button className="btn-reintentar" onClick={cargarPresentaciones}>
                Reintentar
              </button>
            </div>
          ) : presentaciones.length === 0 ? (
            <div className="no-presentaciones">
              <Package size={48} className="icon-empty" />
              <h4>Sin presentaciones</h4>
              <p>Este producto no tiene presentaciones configuradas.</p>
            </div>
          ) : (
            <div className="presentaciones-container">
              <div className="presentaciones-header">
                <h5>Total: {presentaciones.length} presentación{presentaciones.length !== 1 ? 'es' : ''}</h5>
              </div>
              
              <div className="presentaciones-table">
                <div className="table-header">
                  <div>Defecto</div>
                  <div>Descripción</div>
                  <div>Factor</div>
                  <div>Unidad</div>
                  <div>Código Barras</div>
                  <div>Precio 1</div>
                  <div>Precio 2</div>
                  <div>Precio 3</div>
                  <div>Acciones</div>
                </div>
                
                <div className="table-body">
                  {presentaciones.map((presentacion) => (
                    <div key={presentacion.id} className="table-row">
                      <div className="table-cell">
                        <span className={`badge ${presentacion.esDefecto ? 'badge-success' : 'badge-secondary'}`}>
                          {presentacion.esDefecto ? '✓ Sí' : 'No'}
                        </span>
                      </div>
                      <div className="table-cell descripcion-cell">
                        {presentacion.descripcion || '-'}
                      </div>
                      <div className="table-cell">
                        {presentacion.factor || 1}
                      </div>
                      <div className="table-cell">
                        {presentacion.unidadMedida || '-'}
                      </div>
                      <div className="table-cell">
                        {presentacion.codigoBarras || '-'}
                      </div>
                      <div className="table-cell precio-cell">
                        {formatearPrecio(presentacion.precio1)}
                      </div>
                      <div className="table-cell precio-cell">
                        {formatearPrecio(presentacion.precio2)}
                      </div>
                      <div className="table-cell precio-cell">
                        {formatearPrecio(presentacion.precio3)}
                      </div>
                      <div className="table-cell acciones-cell">
                        <div className="acciones-buttons">
                          <button 
                            className="btn-accion btn-editar"
                            onClick={() => handleEditarPresentacion(presentacion)}
                            title="Editar presentación"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            className="btn-accion btn-eliminar"
                            onClick={() => handleEliminarPresentacion(presentacion)}
                            title="Eliminar presentación"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalVerPresentaciones;