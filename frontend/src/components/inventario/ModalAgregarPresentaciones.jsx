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
        console.log('Formato de datos no reconocido:', data);
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
        
        // Mapear unidades del backend al frontend
        const mapearUnidad = (unidadBackend) => {
          const mapeoUnidades = {
            'NIU': 'Unidad',
            'KGM': 'Kilogramo', 
            'MTR': 'Metro',
            'LTR': 'Litro',
            'M2': 'Metro cuadrado',
            'M3': 'Metro cúbico',
            'CJA': 'Caja',
            'PQT': 'Paquete',
            'unidad': 'Unidad'
          };
          return mapeoUnidades[unidadBackend] || 'Unidad';
        };
        
        const presentacionFormateada = {
          id: datos.id,
          codigoBarras: datos.codigoBarras || datos.codigoBarra || '',
          unidad: mapearUnidad(datos.unidadMedida || datos.unidad),
          descripcion: datos.descripcion || '',
          factor: datos.factor?.toString() || '1',
          precio1: datos.precio1?.toString() || datos.precio?.toString() || '0',
          precio2: datos.precio2?.toString() || '0',
          precio3: datos.precio3?.toString() || '0',
          precioDefecto: datos.precioDefecto || 'Precio 1',
          isDefault: datos.esDefecto || datos.isDefault || false,
          esNueva: false
        };
        
        console.log(`Presentación formateada ${index}:`, presentacionFormateada);
        return presentacionFormateada;
      });
      
      console.log('Todas las presentaciones formateadas:', presentacionesFormateadas);
      
      // Actualizar estado
      setPresentaciones(presentacionesFormateadas);
      setPresentacionesOriginales([...presentacionesFormateadas]);
      
      console.log('Estado actualizado con presentaciones:', presentacionesFormateadas.length);
      
    } catch (error) {
      console.error('Error al cargar presentaciones:', error);
      setPresentaciones([]);
      setPresentacionesOriginales([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las presentaciones del producto'
      });
    } finally {
      setLoading(false);
    }
  };

  // useEffect para cargar presentaciones cuando se abre el modal
  useEffect(() => {
    console.log('useEffect ejecutado - isOpen:', isOpen, 'productoId:', productoId);
    if (isOpen) {
      // Limpiar estado anterior
      setPresentaciones([]);
      setPresentacionesOriginales([]);
      setEditandoPresentacion(null);
      
      if (productoId) {
        // Modo edición: cargar presentaciones del producto
        console.log('Modal abierto en modo edición, cargando presentaciones para producto:', productoId);
        cargarPresentaciones();
      } else {
        // Modo creación: usar presentaciones iniciales o crear una por defecto
        console.log('Modal abierto en modo creación');
        if (presentacionesIniciales && presentacionesIniciales.length > 0) {
          console.log('Usando presentaciones iniciales:', presentacionesIniciales);
          setPresentaciones([...presentacionesIniciales]);
          setPresentacionesOriginales([]);
        } else {
          const presentacionDefecto = {
            id: `temp_${Date.now()}`,
            codigoBarras: '',
            unidad: 'Unidad',
            descripcion: '',
            factor: '1',
            precio1: precioVenta || '',
            precio2: '',
            precio3: '',
            precioDefecto: 'Precio 1',
            isDefault: true,
            esNueva: true
          };
          setPresentaciones([presentacionDefecto]);
          setPresentacionesOriginales([]);
        }
      }
    }
  }, [isOpen, productoId]);

  // useEffect para actualizar precio1 cuando cambie precioVenta (tanto en creación como edición)
  useEffect(() => {
    if (precioVenta && presentaciones.length > 0) {
      setPresentaciones(prev => prev.map(p => ({
        ...p,
        precio1: precioVenta
      })));
      console.log('💰 Precio sincronizado en modal:', precioVenta);
    }
  }, [precioVenta]);

  // Función para mapear unidades del backend al frontend
  const mapearUnidadBackendAFrontend = (unidadBackend) => {
    const mapeoUnidades = {
      'NIU': 'Unidad',
      'KGM': 'Kilogramo', 
      'MTR': 'Metro',
      'LTR': 'Litro',
      'M2': 'Metro cuadrado',
      'M3': 'Metro cúbico',
      'CJA': 'Caja',
      'PQT': 'Paquete',
      'unidad': 'Unidad'
    };
    return mapeoUnidades[unidadBackend] || 'Unidad';
  };

  const agregarNuevaPresentacion = () => {
    const nuevaPresentacion = {
      id: `temp_${Date.now()}`,
      codigoBarras: '',
      unidad: 'Unidad',
      descripcion: '',
      factor: '1',
      precio1: '',
      precio2: '',
      precio3: '',
      precioDefecto: 'Precio 1',
      isDefault: false,
      esNueva: true
    };
    console.log('Agregando nueva presentación:', nuevaPresentacion);
    setPresentaciones(prev => {
      const nuevaLista = [...prev, nuevaPresentacion];
      console.log('Lista actualizada con nueva presentación:', nuevaLista);
      return nuevaLista;
    });
  };

  const eliminarPresentacion = async (id) => {
    if (presentaciones.length === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede eliminar',
        text: 'Debe haber al menos una presentación'
      });
      return;
    }

    const presentacion = presentaciones.find(p => p.id === id);
    
    // Si es una presentación nueva (temporal), solo la eliminamos del estado
    if (presentacion.esNueva) {
      setPresentaciones(prev => prev.filter(p => p.id !== id));
      return;
    }

    // Confirmar eliminación
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la presentación "${presentacion.descripcion || 'Sin descripción'}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await eliminarPresentacion(id);
      
      setPresentaciones(prev => prev.filter(p => p.id !== id));
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'La presentación ha sido eliminada correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar presentación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la presentación'
      });
    }
  };

  const actualizarPresentacion = (id, campo, valor) => {
    console.log(`Actualizando presentación ${id}, campo: ${campo}, valor: ${valor}`);
    setPresentaciones(prev => {
      const nuevaLista = prev.map(p => 
        p.id === id ? { ...p, [campo]: valor } : p
      );
      console.log('Lista actualizada:', nuevaLista);
      return nuevaLista;
    });
  };

  const marcarComoDefecto = (id) => {
    setPresentaciones(prev => prev.map(p => ({
      ...p,
      isDefault: p.id === id
    })));
  };

  const validarPresentaciones = () => {
    // Validar que todas las presentaciones tengan factor válido
    for (let presentacion of presentaciones) {
      if (!presentacion.factor || presentacion.factor <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'Todos los factores deben ser números mayores a 0'
        });
        return false;
      }
    }
    return true;
  };

  const handleGuardar = async () => {
    if (!validarPresentaciones()) return;
    
    setLoading(true);
    
    try {
      // Usar todas las presentaciones
      const presentacionesValidas = presentaciones;
      
      if (!productoId) {
        // Modo creación: convertir presentaciones al formato para el formulario de producto
        const presentacionesParaFormulario = presentacionesValidas.map(presentacion => ({
          codigoBarras: presentacion.codigoBarras || '',
          unidadMedida: presentacion.unidad === 'Unidad' ? 'NIU' : 
                       presentacion.unidad === 'Kilogramo' ? 'KGM' :
                       presentacion.unidad === 'Metro' ? 'MTR' :
                       presentacion.unidad === 'Litro' ? 'LTR' :
                       presentacion.unidad === 'Metro cuadrado' ? 'M2' :
                       presentacion.unidad === 'Metro cúbico' ? 'M3' :
                       presentacion.unidad === 'Caja' ? 'CJA' :
                       presentacion.unidad === 'Paquete' ? 'PQT' : 'NIU',
          descripcion: presentacion.descripcion || '',
          factor: parseFloat(presentacion.factor) || 1,
          precio1: parseFloat(presentacion.precio1) || 0,
          precio2: parseFloat(presentacion.precio2) || 0,
          precio3: parseFloat(presentacion.precio3) || 0,
          esDefecto: presentacion.isDefault
        }));
        
        // Notificar al componente padre con las presentaciones configuradas
        if (onPresentacionesChange) {
          onPresentacionesChange(presentacionesParaFormulario);
        }
        
        onClose();
        return;
      }
      
      // Modo edición: guardar en la base de datos
      // Separar presentaciones nuevas y existentes
      const presentacionesNuevas = presentacionesValidas.filter(p => p.esNueva);
      const presentacionesExistentes = presentacionesValidas.filter(p => !p.esNueva);
      
      // Guardar presentaciones nuevas
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
      
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Las presentaciones han sido guardadas correctamente'
      });
      
      // Notificar al componente padre que las presentaciones han cambiado
      if (onPresentacionesChange) {
        onPresentacionesChange();
      }
      
      onClose();
    } catch (error) {
      console.error('Error al guardar presentaciones:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudieron guardar las presentaciones'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    if (productoId) {
      // Modo edición: restaurar presentaciones originales
      setPresentaciones([...presentacionesOriginales]);
    } else {
      // Modo creación: mantener las presentaciones actuales y notificar al padre
      const presentacionesParaFormulario = presentaciones.map(presentacion => ({
        id: presentacion.id,
        codigoBarras: presentacion.codigoBarras || '',
        unidad: presentacion.unidad || 'Unidad',
        descripcion: presentacion.descripcion || '',
        factor: parseFloat(presentacion.factor) || 1,
        precio1: parseFloat(presentacion.precio1) || 0,
        precio2: parseFloat(presentacion.precio2) || 0,
        precio3: parseFloat(presentacion.precio3) || 0,
        esDefecto: presentacion.isDefault
      }));
      
      if (onPresentacionesChange) {
        onPresentacionesChange(presentacionesParaFormulario);
      }
    }
    
    setEditandoPresentacion(null);
    onClose();
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
              <p>presentaciones configuradas.</p>
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
                      console.log('Renderizando fila para presentación:', presentacion);
                      return (
                        <tr key={presentacion.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={presentacion.isDefault}
                              onChange={() => marcarComoDefecto(presentacion.id)}
                              className="checkbox-default"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={presentacion.codigoBarras}
                              onChange={(e) => actualizarPresentacion(presentacion.id, 'codigoBarras', e.target.value)}
                              className="input-tabla"
                              placeholder="Código"
                            />
                          </td>
                          <td>
                            <select
                              value={presentacion.unidad}
                              onChange={(e) => actualizarPresentacion(presentacion.id, 'unidad', e.target.value)}
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
                              onChange={(e) => actualizarPresentacion(presentacion.id, 'descripcion', e.target.value)}
                              className="input-tabla"
                              placeholder="Descripción"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={presentacion.factor}
                              onChange={(e) => actualizarPresentacion(presentacion.id, 'factor', e.target.value)}
                              className="input-tabla input-number"
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={presentacion.precio1}
                              onChange={(e) => actualizarPresentacion(presentacion.id, 'precio1', e.target.value)}
                              className="input-tabla input-number"
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={presentacion.precio2}
                              onChange={(e) => actualizarPresentacion(presentacion.id, 'precio2', e.target.value)}
                              className="input-tabla input-number"
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={presentacion.precio3}
                              onChange={(e) => actualizarPresentacion(presentacion.id, 'precio3', e.target.value)}
                              className="input-tabla input-number"
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <select
                              value={presentacion.precioDefecto}
                              onChange={(e) => actualizarPresentacion(presentacion.id, 'precioDefecto', e.target.value)}
                              className="select-tabla select-precio"
                            >
                              {opcionesPrecioDefecto.map(precio => (
                                <option key={precio} value={precio}>{precio}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button
                              onClick={() => eliminarPresentacion(presentacion.id)}
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