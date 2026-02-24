import React, { useState, useEffect } from 'react';
import '../../styles/MigracionProductos.css';
import { obtenerSucursales } from '../../services/sucursalService';
import Swal from 'sweetalert2';
import { ArrowRight, Package, Warehouse, Plus, Trash2, Search } from 'lucide-react';

const MigracionProductos = ({ onCerrar }) => {
  const [sucursales, setSucursales] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [migraciones, setMigraciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [filtros, setFiltros] = useState({
    sucursalId: '',
    almacenOrigenId: '',
    conStock: true
  });

  useEffect(() => {
    cargarSucursales();
    cargarAlmacenes();
  }, []);

  useEffect(() => {
    if (filtros.almacenOrigenId) {
      cargarProductosInventario();
    } else {
      setProductos([]);
    }
  }, [filtros.almacenOrigenId, busquedaProducto]);

  const cargarSucursales = async () => {
    try {
      const response = await obtenerSucursales();
      setSucursales(response.data || []);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  const cargarAlmacenes = async () => {
    try {
      const params = filtros.sucursalId ? `?sucursalId=${filtros.sucursalId}` : '';
      const response = await fetch(`/api/migracion/almacenes${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAlmacenes(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar almacenes:', error);
    }
  };

  const cargarProductosInventario = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.almacenOrigenId) params.append('almacenId', filtros.almacenOrigenId);
      if (filtros.conStock) params.append('conStock', 'true');
      if (busquedaProducto) params.append('buscar', busquedaProducto);

      const response = await fetch(`/api/migracion/productos-inventario?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProductos(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const agregarMigracion = (producto) => {
    const nuevaMigracion = {
      id: Date.now(),
      productoId: producto.productoId,
      producto: producto.Producto,
      almacenOrigenId: filtros.almacenOrigenId,
      almacenOrigen: almacenes.find(a => a.id === parseInt(filtros.almacenOrigenId)),
      almacenDestinoId: '',
      cantidad: 1,
      stockDisponible: producto.stock,
      motivo: '',
      observaciones: ''
    };
    
    setMigraciones(prev => [...prev, nuevaMigracion]);
  };

  const actualizarMigracion = (id, campo, valor) => {
    setMigraciones(prev => 
      prev.map(m => 
        m.id === id ? { ...m, [campo]: valor } : m
      )
    );
  };

  const removerMigracion = (id) => {
    setMigraciones(prev => prev.filter(m => m.id !== id));
  };

  const validarMigraciones = () => {
    for (const migracion of migraciones) {
      if (!migracion.almacenDestinoId) {
        throw new Error('Debe seleccionar un almacén de destino para todas las migraciones');
      }
      
      if (migracion.almacenOrigenId === migracion.almacenDestinoId) {
        throw new Error('El almacén de origen no puede ser el mismo que el de destino');
      }
      
      if (!migracion.cantidad || migracion.cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }
      
      if (migracion.cantidad > migracion.stockDisponible) {
        throw new Error(`La cantidad no puede ser mayor al stock disponible (${migracion.stockDisponible})`);
      }
    }
  };

  const ejecutarMigraciones = async () => {
    if (migraciones.length === 0) {
      Swal.fire('Advertencia', 'Debe agregar al menos una migración', 'warning');
      return;
    }

    try {
      validarMigraciones();
      setCargando(true);

      const migracionesParaEnviar = migraciones.map(m => ({
        productoId: m.productoId,
        almacenOrigenId: m.almacenOrigenId,
        almacenDestinoId: m.almacenDestinoId,
        cantidad: m.cantidad,
        motivo: m.motivo,
        observaciones: m.observaciones
      }));

      const response = await fetch('/api/migracion/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migraciones: migracionesParaEnviar
        })
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          title: 'Migración Exitosa',
          text: `Se migraron ${migraciones.length} producto(s) correctamente`,
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        
        // Limpiar migraciones y recargar productos
        setMigraciones([]);
        cargarProductosInventario();
      } else {
        throw new Error(data.message || 'Error al ejecutar la migración');
      }
    } catch (error) {
      console.error('Error en migración:', error);
      Swal.fire('Error', error.message || 'Error al ejecutar la migración', 'error');
    } finally {
      setCargando(false);
    }
  };

  const almacenesDestino = almacenes.filter(a => a.id !== parseInt(filtros.almacenOrigenId));

  return (
    <div className="modal-overlay">
      <div className="modal-migracion">
        <div className="modal-header">
          <h2>Migración de Productos entre Almacenes</h2>
          <button className="btn-cerrar" onClick={onCerrar}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Filtros */}
          <div className="seccion-filtros">
            <h3>Configuración de Origen</h3>
            <div className="filtros-grid">
              <div className="campo">
                <label>Sucursal:</label>
                <select
                  value={filtros.sucursalId}
                  onChange={(e) => {
                    setFiltros(prev => ({ ...prev, sucursalId: e.target.value, almacenOrigenId: '' }));
                    cargarAlmacenes();
                  }}
                >
                  <option value="">Todas las sucursales</option>
                  {sucursales.map(sucursal => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="campo">
                <label>Almacén de Origen:</label>
                <select
                  value={filtros.almacenOrigenId}
                  onChange={(e) => setFiltros(prev => ({ ...prev, almacenOrigenId: e.target.value }))}
                >
                  <option value="">Seleccionar almacén</option>
                  {almacenes.map(almacen => (
                    <option key={almacen.id} value={almacen.id}>
                      {almacen.nombre} - {almacen.Sucursal?.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="campo-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={filtros.conStock}
                    onChange={(e) => setFiltros(prev => ({ ...prev, conStock: e.target.checked }))}
                  />
                  Solo productos con stock
                </label>
              </div>
            </div>
          </div>

          {/* Búsqueda de productos */}
          {filtros.almacenOrigenId && (
            <div className="seccion-productos">
              <div className="productos-header">
                <h3>Productos Disponibles</h3>
                <div className="busqueda-productos">
                  <div className="input-busqueda">
                    <Search size={16} />
                    <input
                      type="text"
                      value={busquedaProducto}
                      onChange={(e) => setBusquedaProducto(e.target.value)}
                      placeholder="Buscar por nombre o código"
                    />
                  </div>
                </div>
              </div>
              
              <div className="productos-lista">
                {productos.map(producto => (
                  <div key={`${producto.productoId}-${producto.almacenId}`} className="producto-item">
                    <div className="producto-info">
                      <div className="producto-nombre">{producto.Producto.nombre}</div>
                      <div className="producto-codigo">Código: {producto.Producto.codigo}</div>
                      <div className="producto-stock">Stock: {producto.stock}</div>
                      <div className="producto-precio">S/ {parseFloat(producto.Producto.precioVenta).toFixed(2)}</div>
                    </div>
                    
                    <button 
                      className="btn-agregar-migracion"
                      onClick={() => agregarMigracion(producto)}
                      disabled={migraciones.some(m => m.productoId === producto.productoId)}
                    >
                      <Plus size={16} /> Agregar
                    </button>
                  </div>
                ))}
                
                {productos.length === 0 && filtros.almacenOrigenId && (
                  <div className="no-productos">
                    <Package size={48} />
                    <p>No se encontraron productos en este almacén</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de migraciones */}
          {migraciones.length > 0 && (
            <div className="seccion-migraciones">
              <h3>Migraciones Programadas ({migraciones.length})</h3>
              
              <div className="migraciones-lista">
                {migraciones.map(migracion => (
                  <div key={migracion.id} className="migracion-item">
                    <div className="migracion-producto">
                      <div className="producto-nombre">{migracion.producto.nombre}</div>
                      <div className="producto-codigo">{migracion.producto.codigo}</div>
                      <div className="stock-info">Stock disponible: {migracion.stockDisponible}</div>
                    </div>
                    
                    <div className="migracion-flujo">
                      <div className="almacen-origen">
                        <Warehouse size={16} />
                        <span>{migracion.almacenOrigen?.nombre}</span>
                      </div>
                      
                      <ArrowRight size={20} className="flecha-migracion" />
                      
                      <div className="almacen-destino">
                        <select
                          value={migracion.almacenDestinoId}
                          onChange={(e) => actualizarMigracion(migracion.id, 'almacenDestinoId', e.target.value)}
                          className="select-destino"
                        >
                          <option value="">Seleccionar destino</option>
                          {almacenesDestino.map(almacen => (
                            <option key={almacen.id} value={almacen.id}>
                              {almacen.nombre} - {almacen.Sucursal?.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="migracion-detalles">
                      <div className="campo-cantidad">
                        <label>Cantidad:</label>
                        <input
                          type="number"
                          min="1"
                          max={migracion.stockDisponible}
                          value={migracion.cantidad}
                          onChange={(e) => actualizarMigracion(migracion.id, 'cantidad', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      
                      <div className="campo-motivo">
                        <label>Motivo:</label>
                        <input
                          type="text"
                          value={migracion.motivo}
                          onChange={(e) => actualizarMigracion(migracion.id, 'motivo', e.target.value)}
                          placeholder="Motivo de la migración"
                        />
                      </div>
                      
                      <button 
                        className="btn-remover"
                        onClick={() => removerMigracion(migracion.id)}
                        title="Remover migración"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="campo-observaciones">
                      <label>Observaciones:</label>
                      <textarea
                        value={migracion.observaciones}
                        onChange={(e) => actualizarMigracion(migracion.id, 'observaciones', e.target.value)}
                        placeholder="Observaciones adicionales (opcional)"
                        rows="2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onCerrar}>
            Cancelar
          </button>
          <button 
            className="btn-ejecutar" 
            onClick={ejecutarMigraciones}
            disabled={cargando || migraciones.length === 0}
          >
            {cargando ? (
              <>
                <span className="spinner"></span>
                Ejecutando...
              </>
            ) : (
              <>
                <ArrowRight size={16} />
                Ejecutar Migraciones ({migraciones.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MigracionProductos;