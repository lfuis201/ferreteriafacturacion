import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../../styles/ModalAgregarPresentaciones.css';
import { obtenerPresentaciones, eliminarPresentacion, crearPresentacion, actualizarPresentacion } from '../../services/presentacionService';

function ModalAgregarPresentaciones({ isOpen, onClose, productoId, onPresentacionesChange, presentacionesIniciales = [], precioVenta = '' }) {
  const [presentaciones, setPresentaciones] = useState([]);
  const [presentacionesOriginales, setPresentacionesOriginales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editandoPresentacion, setEditandoPresentacion] = useState(null);

  const unidadesDisponibles = [
    'Unidad', 'Kilogramo', 'Metro', 'Litro', 'Metro cuadrado', 
    'Metro cúbico', 'Caja', 'Paquete', 'Docena', 'Gramo'
  ];

  const opcionesPrecioDefecto = ['Precio 1', 'Precio 2', 'Precio 3'];

  // Cargar presentaciones del producto
  const cargarPresentaciones = async () => {
    if (!productoId) {
      console.log('No hay productoId, cancelando carga');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Cargando presentaciones para producto:', productoId);
      const data = await obtenerPresentaciones(productoId);
      console.log('Datos recibidos completos:', JSON.stringify(data, null, 2));
      
      // Manejar diferentes formatos de respuesta
      let presentacionesData = [];
      
      if (Array.isArray(data)) {
        // Si data es directamente un array
        presentacionesData = data;
        console.log('Formato: Array directo');
      } else if (data && data.presentaciones && Array.isArray(data.presentaciones)) {
        // Si data tiene la propiedad presentaciones (formato actual)
        presentacionesData = data.presentaciones;
        console.log('Formato: Objeto con propiedad presentaciones');
      } else if (data && data.data && Array.isArray(data.data)) {
        // Si data tiene la propiedad data
        presentacionesData = data.data;
        console.log('Formato: Objeto con propiedad data');
      } else if (data && data.success && data.presentaciones) {
        // Si data tiene success y presentaciones
        presentacionesData = data.presentaciones;
        console.log('Formato: Objeto con success y presentaciones');
      } else {
        console.log('Formato no reconocido, usando array vacío');
        presentacionesData = [];
      }
      
      console.log('Presentaciones extraídas:', presentacionesData);
      console.log('Cantidad de presentaciones:', presentacionesData.length);
      
      if (presentacionesData.length > 0) {
        console.log('Primera presentación:', JSON.stringify(presentacionesData[0], null, 2));
      }
      
      const presentacionesFormateadas = presentacionesData.map((p, index) => {
        console.log(`Procesando presentación ${index}:`, p);
        
        // Si el objeto tiene dataValues (Sequelize), usar esos datos
        const datos = p.dataValues || p;
        console.log(`Datos extraídos para presentación ${index}:`, datos);
        
        return {
          id: datos.id || `temp-${Date.now()}-${index}`,
          codigoBarras: datos.codigoBarras || '',
          unidad: datos.unidadMedida === 'NIU' ? 'Unidad' :
                  datos.unidadMedida === 'KGM' ? 'Kilogramo' :
                  datos.unidadMedida === 'MTR' ? 'Metro' :
                  datos.unidadMedida === 'LTR' ? 'Litro' :
                  datos.unidadMedida === 'M2' ? 'Metro cuadrado' :
                  datos.unidadMedida === 'M3' ? 'Metro cúbico' :
                  datos.unidadMedida === 'CJA' ? 'Caja' :
                  datos.unidadMedida === 'PQT' ? 'Paquete' : 'Unidad',
          descripcion: datos.descripcion || '',
          factor: datos.factor || 1,
          precio1: datos.precio1 || datos.precio || 0,
          precio2: datos.precio2 || 0,
          precio3: datos.precio3 || 0,
          precioDefecto: datos.precioDefecto || 'Precio 1',
          isDefault: datos.esDefecto || false,
          isNew: false
        };
      });
      
      console.log('Presentaciones formateadas:', presentacionesFormateadas);
      
      setPresentaciones(presentacionesFormateadas);
      setPresentacionesOriginales(JSON.parse(JSON.stringify(presentacionesFormateadas)));
      
    } catch (error) {
      console.error('Error al cargar presentaciones:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las presentaciones del producto'
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar presentaciones cuando se abre el modal o cambia el productoId
  useEffect(() => {
    if (isOpen && productoId) {
      console.log('Modal abierto, cargando presentaciones para producto:', productoId);
      cargarPresentaciones();
    } else if (isOpen && presentacionesIniciales.length > 0) {
      console.log('Usando presentaciones iniciales:', presentacionesIniciales);
      setPresentaciones(presentacionesIniciales);
      setPresentacionesOriginales(JSON.parse(JSON.stringify(presentacionesIniciales)));
    } else if (isOpen) {
      console.log('Modal abierto sin productoId ni presentaciones iniciales');
      setPresentaciones([]);
      setPresentacionesOriginales([]);
    }
  }, [isOpen, productoId, presentacionesIniciales]);

  // Agregar nueva presentación
  const agregarNuevaPresentacion = () => {
    const nuevaPresentacion = {
      id: `temp-${Date.now()}`,
      codigoBarras: '',
      unidad: 'Unidad',
      descripcion: '',
      factor: 1,
      precio1: parseFloat(precioVenta) || 0,
      precio2: 0,
      precio3: 0,
      precioDefecto: 'Precio 1',
      isDefault: presentaciones.length === 0,
      isNew: true
    };
    
    setPresentaciones([...presentaciones, nuevaPresentacion]);
  };

  // Actualizar presentación
  const actualizarPresentacionLocal = (id, campo, valor) => {
    setPresentaciones(presentaciones.map(p => {
      if (p.id === id) {
        const presentacionActualizada = { ...p, [campo]: valor };
        
        // Si se marca como default, desmarcar las demás
        if (campo === 'isDefault' && valor === true) {
          setPresentaciones(prev => prev.map(presentacion => ({
            ...presentacion,
            isDefault: presentacion.id === id
          })));
          return presentacionActualizada;
        }
        
        return presentacionActualizada;
      }
      return p;
    }));
  };

  // Eliminar presentación
  const eliminarPresentacionLocal = async (id) => {
    const presentacion = presentaciones.find(p => p.id === id);
    
    if (!presentacion) return;
    
    // Si es una presentación nueva (temporal), eliminar directamente
    if (presentacion.isNew || id.toString().startsWith('temp-')) {
      setPresentaciones(presentaciones.filter(p => p.id !== id));
      return;
    }
    
    // Si es una presentación existente, confirmar eliminación
    const result = await Swal.fire({
      title: '¿Eliminar presentación?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
      try {
        await eliminarPresentacion(id);
        setPresentaciones(presentaciones.filter(p => p.id !== id));
        
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Presentación eliminada correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al eliminar presentación:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la presentación'
        });
      }
    }
  };

  // Guardar cambios
  const handleGuardar = async () => {
    // Validar que haya al menos una presentación
    if (presentaciones.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Debe agregar al menos una presentación'
      });
      return;
    }
    
    // Validar que haya una presentación por defecto
    const tieneDefault = presentaciones.some(p => p.isDefault);
    if (!tieneDefault) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Debe marcar una presentación como predeterminada'
      });
      return;
    }
    
    // Validar campos requeridos
    const presentacionesInvalidas = presentaciones.filter(p => 
      !p.unidad || p.factor <= 0 || p.precio1 < 0
    );
    
    if (presentacionesInvalidas.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Todas las presentaciones deben tener unidad, factor mayor a 0 y precio válido'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Separar presentaciones nuevas y existentes
      const presentacionesNuevas = presentaciones.filter(p => p.isNew || p.id.toString().startsWith('temp-'));
      const presentacionesExistentes = presentaciones.filter(p => !p.isNew && !p.id.toString().startsWith('temp-'));
      
      console.log('Presentaciones nuevas:', presentacionesNuevas);
      console.log('Presentaciones existentes:', presentacionesExistentes);
      
      // Crear nuevas presentaciones
      for (const presentacion of presentacionesNuevas) {
        const datosParaEnviar = {
          productoId: productoId,
          factor: parseFloat(presentacion.factor) || 1,
          precio: parseFloat(presentacion.precio1) || 0,
          precio1: parseFloat(presentacion.precio1) || 0,
          precio2: parseFloat(presentacion.precio2) || 0,
          precio3: parseFloat(presentacion.precio3) || 0,
          unidadMedida: presentacion.unidad === 'Unidad' ? 'NIU' : 
                       presentacion.unidad === 'Kilogramo' ? 'KGM' :
                       presentacion.unidad === 'Metro' ? 'MTR' :
                       presentacion.unidad === 'Litro' ? 'LTR' :
                       presentacion.unidad === 'Metro cuadrado' ? 'M2' :
                       presentacion.unidad === 'Metro cúbico' ? 'M3' :
                       presentacion.unidad === 'Caja' ? 'CJA' :
                       presentacion.unidad === 'Paquete' ? 'PQT' : 'NIU',
          codigoBarras: presentacion.codigoBarras || null,
          descripcion: presentacion.descripcion || null,
          esDefecto: presentacion.isDefault
        };
        
        await crearPresentacion(datosParaEnviar);
      }
      
      // Actualizar presentaciones existentes
      for (const presentacion of presentacionesExistentes) {
        const presentacionOriginal = presentacionesOriginales.find(p => p.id === presentacion.id);
        
        // Solo actualizar si hay cambios
        if (JSON.stringify(presentacion) !== JSON.stringify(presentacionOriginal)) {
          const datosParaEnviar = {
            descripcion: presentacion.descripcion,
            factor: parseFloat(presentacion.factor) || 1,
            precio: parseFloat(presentacion.precio1) || 0,
            precio1: parseFloat(presentacion.precio1) || 0,
            precio2: parseFloat(presentacion.precio2) || 0,
            precio3: parseFloat(presentacion.precio3) || 0,
            unidadMedida: presentacion.unidad === 'Unidad' ? 'NIU' : 
                         presentacion.unidad === 'Kilogramo' ? 'KGM' :
                         presentacion.unidad === 'Metro' ? 'MTR' :
                         presentacion.unidad === 'Litro' ? 'LTR' :
                         presentacion.unidad === 'Metro cuadrado' ? 'M2' :
                         presentacion.unidad === 'Metro cúbico' ? 'M3' :
                         presentacion.unidad === 'Caja' ? 'CJA' :
                         presentacion.unidad === 'Paquete' ? 'PQT' : 'NIU',
            codigoBarras: presentacion.codigoBarras || null,
            esDefecto: presentacion.isDefault
          };
          
          await actualizarPresentacion(presentacion.id, datosParaEnviar);
        }
      }
      
      // Notificar cambios al componente padre
      if (onPresentacionesChange) {
        onPresentacionesChange(presentaciones);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Guardado',
        text: 'Presentaciones guardadas correctamente',
        timer: 1500,
        showConfirmButton: false
      });
      
      onClose();
      
    } catch (error) {
      console.error('Error al guardar presentaciones:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron guardar las presentaciones'
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancelar y cerrar modal
  const handleCancelar = () => {
    // Restaurar presentaciones originales si hay cambios
    const hayCambios = JSON.stringify(presentaciones) !== JSON.stringify(presentacionesOriginales);
    
    if (hayCambios && presentaciones.length > 0) {
      Swal.fire({
        title: '¿Descartar cambios?',
        text: 'Los cambios no guardados se perderán',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'Continuar editando'
      }).then((result) => {
        if (result.isConfirmed) {
          setPresentaciones([]);
          setPresentacionesOriginales([]);
          onClose();
        }
      });
    } else {
      setPresentaciones([]);
      setPresentacionesOriginales([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  console.log('🎨 RENDERIZANDO MODAL');
  console.log('- isOpen:', isOpen);
  console.log('- productoId:', productoId);
  console.log('- loading:', loading);
  console.log('- presentaciones.length:', presentaciones.length);
  console.log('- presentaciones:', presentaciones);

  return (
    <div className="modal-overlay-presentaciones">
      <div className="modal-agregar-presentaciones">
        <div className="modal-header-presentaciones">
          <h2>📦 Presentaciones</h2>
          <button className="btn-close-modal" onClick={handleCancelar}>
            ✕
          </button>
        </div>

        <div className="modal-content-presentaciones">
          <div className="presentaciones-header">
            <h3>Gestionar Presentaciones del Producto</h3>
            <div className="info-icon">ℹ️</div>
          </div>

          {loading ? (
            <div className="loading-presentaciones">
              <div className="spinner"></div>
              <p>Cargando presentaciones...</p>
            </div>
          ) : presentaciones.length === 0 ? (
            <div className="no-presentaciones-mensaje">
              <p>No hay presentaciones configuradas.</p>
              <button
                onClick={agregarNuevaPresentacion}
                className="btn-agregar-primera"
              >
                📦 Agregar Primera Presentación
              </button>
            </div>
          ) : (
            <>
              <div className="tabla-presentaciones-container">
                <table className="tabla-presentaciones">
                  <thead>
                    <tr>
                      <th>Default</th>
                      <th>Código de barra</th>
                      <th>Unidad</th>
                      <th>Descripción</th>
                      <th>Factor <span className="info-icon">ℹ️</span></th>
                      <th>Precio 1</th>
                      <th>Precio 2</th>
                      <th>Precio 3</th>
                      <th>P. Defecto</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presentaciones.map((presentacion) => {
                      return (
                        <tr key={presentacion.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={presentacion.isDefault}
                              onChange={(e) => actualizarPresentacionLocal(presentacion.id, 'isDefault', e.target.checked)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={presentacion.codigoBarras}
                              onChange={(e) => actualizarPresentacionLocal(presentacion.id, 'codigoBarras', e.target.value)}
                              className="input-tabla"
                              placeholder="Código de barras"
                            />
                          </td>
                          <td>
                            <select
                              value={presentacion.unidad}
                              onChange={(e) => actualizarPresentacionLocal(presentacion.id, 'unidad', e.target.value)}
                              className="select-tabla"
                            >
                              {unidadesDisponibles.map(unidad => (
                                <option key={unidad} value={unidad}>{unidad}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={presentacion.descripcion}
                              onChange={(e) => actualizarPresentacionLocal(presentacion.id, 'descripcion', e.target.value)}
                              className="input-tabla"
                              placeholder="Descripción"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={presentacion.factor}
                              onChange={(e) => actualizarPresentacionLocal(presentacion.id, 'factor', parseFloat(e.target.value) || 1)}
                              className="input-tabla"
                              min="0.01"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={presentacion.precio1}
                              onChange={(e) => actualizarPresentacionLocal(presentacion.id, 'precio1', parseFloat(e.target.value) || 0)}
                              className="input-tabla"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={presentacion.precio2}
                              onChange={(e) => actualizarPresentacionLocal(presentacion.id, 'precio2', parseFloat(e.target.value) || 0)}
                              className="input-tabla"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={presentacion.precio3}
                              onChange={(e) => actualizarPresentacionLocal(presentacion.id, 'precio3', parseFloat(e.target.value) || 0)}
                              className="input-tabla"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <select
                              value={presentacion.precioDefecto}
                              onChange={(e) => actualizarPresentacionLocal(presentacion.id, 'precioDefecto', e.target.value)}
                              className="select-tabla"
                            >
                              {opcionesPrecioDefecto.map(precio => (
                                <option key={precio} value={precio}>{precio}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button
                              onClick={() => eliminarPresentacionLocal(presentacion.id)}
                              className="btn-eliminar"
                              title="Eliminar presentación"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            
              <div className="acciones-tabla">
                <button
                  onClick={agregarNuevaPresentacion}
                  className="btn-agregar-fila"
                  disabled={loading}
                >
                  [+ Agregar]
                </button>
              </div>
            </>
          )}

          <div className="modal-footer-presentaciones">
            <button
              onClick={handleCancelar}
              className="btn-cancelar"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              className="btn-guardar"
              disabled={loading || presentaciones.length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Guardando...
                </>
              ) : (
                'Guardar Presentaciones'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalAgregarPresentaciones;