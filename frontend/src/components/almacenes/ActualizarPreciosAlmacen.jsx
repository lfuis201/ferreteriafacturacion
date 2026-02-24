import React, { useState, useEffect } from 'react';
import { obtenerAlmacenes, obtenerInventarioAlmacen, actualizarPreciosAlmacen } from '../../services/almacenService';
import Swal from 'sweetalert2';
import '../../styles/ActualizarPreciosAlmacen.css';

const ActualizarPreciosAlmacen = () => {
  const [almacenes, setAlmacenes] = useState([]);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState('');
  const [inventario, setInventario] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [aplicarATodos, setAplicarATodos] = useState(false);
  const [precioGeneral, setPrecioGeneral] = useState('');
  const [porcentajeAumento, setPorcentajeAumento] = useState('');
  const [tipoActualizacion, setTipoActualizacion] = useState('individual'); // 'individual', 'general', 'porcentaje'
  const [cargando, setCargando] = useState(false);
  const [cargandoInventario, setCargandoInventario] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarAlmacenes();
  }, []);

  useEffect(() => {
    if (almacenSeleccionado) {
      cargarInventarioAlmacen();
    }
  }, [almacenSeleccionado]);

  const cargarAlmacenes = async () => {
    try {
      const response = await obtenerAlmacenes();
      setAlmacenes(response.data || []);
    } catch (error) {
      setError('Error al cargar almacenes: ' + error.message);
    }
  };

  const cargarInventarioAlmacen = async () => {
    setCargandoInventario(true);
    try {
      const response = await obtenerInventarioAlmacen(almacenSeleccionado);
      setInventario(response.data.inventario || []);
      setProductosSeleccionados([]);
    } catch (error) {
      setError('Error al cargar inventario: ' + error.message);
    } finally {
      setCargandoInventario(false);
    }
  };

  const manejarSeleccionProducto = (productoId, precioActual) => {
    setProductosSeleccionados(prev => {
      const existe = prev.find(p => p.productoId === productoId);
      if (existe) {
        return prev.filter(p => p.productoId !== productoId);
      } else {
        return [...prev, { productoId, precioVenta: precioActual || 0 }];
      }
    });
  };

  const actualizarPrecioProducto = (productoId, nuevoPrecio) => {
    setProductosSeleccionados(prev =>
      prev.map(p =>
        p.productoId === productoId
          ? { ...p, precioVenta: parseFloat(nuevoPrecio) || 0 }
          : p
      )
    );
  };

  const validarFormulario = () => {
    if (!almacenSeleccionado) {
      setError('Debe seleccionar un almacén');
      return false;
    }

    if (tipoActualizacion === 'individual' && productosSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un producto para actualización individual');
      return false;
    }

    if (tipoActualizacion === 'general' && (!precioGeneral || parseFloat(precioGeneral) <= 0)) {
      setError('Debe especificar un precio general válido');
      return false;
    }

    if (tipoActualizacion === 'porcentaje' && (!porcentajeAumento || isNaN(parseFloat(porcentajeAumento)))) {
      setError('Debe especificar un porcentaje válido');
      return false;
    }

    if (tipoActualizacion === 'individual') {
      const preciosInvalidos = productosSeleccionados.some(p => p.precioVenta <= 0);
      if (preciosInvalidos) {
        setError('Todos los precios deben ser mayores a 0');
        return false;
      }
    }

    return true;
  };

  const manejarActualizacion = async () => {
    if (!validarFormulario()) {
      return;
    }

    const resultado = await Swal.fire({
      title: '¿Confirmar actualización de precios?',
      text: `Se actualizarán los precios en el almacén seleccionado`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    });

    if (!resultado.isConfirmed) {
      return;
    }

    setCargando(true);
    setError('');

    try {
      let datosActualizacion = {};

      if (tipoActualizacion === 'individual') {
        datosActualizacion = {
          productos: productosSeleccionados,
          aplicarATodos: false
        };
      } else if (tipoActualizacion === 'general') {
        datosActualizacion = {
          aplicarATodos: true,
          precioGeneral: parseFloat(precioGeneral)
        };
      } else if (tipoActualizacion === 'porcentaje') {
        datosActualizacion = {
          aplicarATodos: true,
          porcentajeAumento: parseFloat(porcentajeAumento)
        };
      }

      const response = await actualizarPreciosAlmacen(almacenSeleccionado, datosActualizacion);

      await Swal.fire({
        title: '¡Éxito!',
        text: response.message,
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });

      // Recargar inventario para mostrar los nuevos precios
      await cargarInventarioAlmacen();
      
      // Limpiar formulario
      setProductosSeleccionados([]);
      setPrecioGeneral('');
      setPorcentajeAumento('');
      setTipoActualizacion('individual');

    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setCargando(false);
    }
  };

  const almacenActual = almacenes.find(a => a.id === parseInt(almacenSeleccionado));

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            📦 Actualizar Precios por Almacén
          </h2>
        </div>
        <div className="card-content space-y-6">
          {error && (
            <div className="alert alert-error">
              ⚠️ {error}
            </div>
          )}

          {mensaje && (
            <div className="alert alert-success">
              ✅ {mensaje}
            </div>
          )}

          {/* Selección de Almacén */}
           <div className="space-y-2">
             <label htmlFor="almacen">Seleccionar Almacén</label>
             <select 
               id="almacen"
               className="form-select"
               value={almacenSeleccionado} 
               onChange={(e) => setAlmacenSeleccionado(e.target.value)}
             >
               <option value="">Seleccione un almacén</option>
               {almacenes.map((almacen) => (
                 <option key={almacen.id} value={almacen.id.toString()}>
                   {almacen.nombre}
                 </option>
               ))}
             </select>
           </div>

          {almacenActual && (
            <div className="info-box">
              <h3 className="info-title">Almacén Seleccionado</h3>
              <p className="info-text">
                <strong>{almacenActual.nombre}</strong> - {almacenActual.Sucursal?.nombre}
              </p>
              <p className="info-description">
                Tipo: {almacenActual.tipo} | Ubicación: {almacenActual.ubicacion || 'No especificada'}
              </p>
            </div>
          )}

          {/* Tipo de Actualización */}
          {almacenSeleccionado && (
            <div className="space-y-4">
              <label>Tipo de Actualización</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`cursor-pointer transition-colors p-4 border rounded-lg text-center ${
                  tipoActualizacion === 'individual' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`} onClick={() => setTipoActualizacion('individual')}>
                  <div className="p-4 text-center">
                    <div className="text-2xl mb-2">📦</div>
                    <h4 className="font-semibold">Individual</h4>
                    <p className="text-sm text-gray-600">Actualizar productos específicos</p>
                  </div>
                </div>

                <div className={`cursor-pointer transition-colors p-4 border rounded-lg text-center ${
                  tipoActualizacion === 'general' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
                }`} onClick={() => setTipoActualizacion('general')}>
                  <div className="p-4 text-center">
                    <div className="text-2xl mb-2">💰</div>
                    <h4 className="font-semibold">Precio General</h4>
                    <p className="text-sm text-gray-600">Mismo precio para todos</p>
                  </div>
                </div>

                <div className={`cursor-pointer transition-colors p-4 border rounded-lg text-center ${
                  tipoActualizacion === 'porcentaje' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
                }`} onClick={() => setTipoActualizacion('porcentaje')}>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold mb-2 text-purple-600">%</div>
                    <h4 className="font-semibold">Porcentaje</h4>
                    <p className="text-sm text-gray-600">Aumentar/disminuir por %</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuración según tipo */}
          {tipoActualizacion === 'general' && (
            <div className="space-y-2">
              <label htmlFor="precioGeneral">Precio General (S/)</label>
              <input
                id="precioGeneral"
                type="number"
                step="0.01"
                min="0"
                value={precioGeneral}
                onChange={(e) => setPrecioGeneral(e.target.value)}
                placeholder="Ingrese el precio a aplicar a todos los productos"
                className="form-input"
              />
            </div>
          )}

          {tipoActualizacion === 'porcentaje' && (
            <div className="space-y-2">
              <label htmlFor="porcentajeAumento">Porcentaje de Aumento/Descuento (%)</label>
              <input
                id="porcentajeAumento"
                type="number"
                step="0.01"
                value={porcentajeAumento}
                onChange={(e) => setPorcentajeAumento(e.target.value)}
                placeholder="Ej: 10 para aumentar 10%, -5 para disminuir 5%"
                className="form-input"
              />
              <p className="text-sm text-gray-600">
                Valores positivos aumentan el precio, valores negativos lo disminuyen
              </p>
            </div>
          )}

          {/* Lista de Productos */}
          {almacenSeleccionado && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Inventario del Almacén</h3>
                {tipoActualizacion === 'individual' && (
                  <span className="badge badge-outline">
                    {productosSeleccionados.length} productos seleccionados
                  </span>
                )}
              </div>

              {cargandoInventario ? (
                <div className="flex items-center justify-center py-8">
                  <div className="spinner"></div>
                  <span className="ml-2">Cargando inventario...</span>
                </div>
              ) : inventario.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay productos en este almacén
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          {tipoActualizacion === 'individual' && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Seleccionar
                            </th>
                          )}
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Producto
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Código
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Precio Actual
                          </th>
                          {tipoActualizacion === 'individual' && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nuevo Precio
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventario.map((item) => {
                          const productoSeleccionado = productosSeleccionados.find(
                            p => p.productoId === item.productoId
                          );
                          const precioActual = item.precioVenta || item.Producto?.precioVenta || 0;

                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              {tipoActualizacion === 'individual' && (
                                <td className="px-4 py-4">
                                  <input
                                    type="checkbox"
                                    checked={!!productoSeleccionado}
                                    onChange={() => manejarSeleccionProducto(item.productoId, precioActual)}
                                    className="form-checkbox"
                                  />
                                </td>
                              )}
                              <td className="px-4 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.Producto?.nombre}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.Producto?.descripcion}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-900">
                                {item.Producto?.codigo}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-900">
                                <span className={`badge ${item.stock > item.stockMinimo ? 'badge-default' : 'badge-destructive'}`}>
                                  {item.stock}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-900">
                                S/ {precioActual.toFixed(2)}
                              </td>
                              {tipoActualizacion === 'individual' && (
                                <td className="px-4 py-4">
                                  {productoSeleccionado ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={productoSeleccionado.precioVenta}
                                      onChange={(e) => actualizarPrecioProducto(item.productoId, e.target.value)}
                                      className="form-input w-24"
                                    />
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botón de Actualización */}
          {almacenSeleccionado && inventario.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={manejarActualizacion}
                disabled={cargando}
                className="btn btn-primary min-w-32"
              >
                {cargando ? (
                  <>
                    <span className="spinner-sm mr-2"></span>
                    Actualizando...
                  </>
                ) : (
                  <>
                    ✅ Actualizar Precios
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActualizarPreciosAlmacen;