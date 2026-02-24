import React, { useState, useEffect } from 'react';
import '../../styles/ExportarEtiquetas.css';
import { obtenerProductosParaEtiquetas, exportarEtiquetas as exportarEtiquetasService } from '../../services/etiquetaService';
import { obtenerCategorias } from '../../services/categoriaService';
import { obtenerSucursales } from '../../services/sucursalService';
import { obtenerAlmacenes } from '../../services/almacenService';

import Swal from 'sweetalert2';

const ExportarEtiquetas = ({ onCerrar }) => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  
  // Filtros
  const [filtros, setFiltros] = useState({
    categoriaId: '',
    sucursalId: '',
    almacenId: '',
    conStock: false
  });
  
  // Configuración de etiquetas
  const [configuracion, setConfiguracion] = useState({
    tamanoEtiqueta: 'mediana',
    incluirPrecio: true,
    incluirCodigo: true,
    incluirNombre: true,
    incluirSucursal: true
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (filtros.sucursalId) {
      cargarAlmacenes(filtros.sucursalId);
    } else {
      setAlmacenes([]);
      setFiltros(prev => ({ ...prev, almacenId: '' }));
    }
  }, [filtros.sucursalId]);

  useEffect(() => {
    cargarProductos();
  }, [filtros, busqueda]);

  const cargarDatosIniciales = async () => {
    try {
      const [categoriasData, sucursalesData] = await Promise.all([
        obtenerCategorias(),
        obtenerSucursales()
      ]);
      
      setCategorias(categoriasData.data || []);
      setSucursales(sucursalesData.data || []);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      Swal.fire('Error', 'Error al cargar los datos iniciales', 'error');
    }
  };

  const cargarAlmacenes = async (sucursalId) => {
    try {
      const response = await obtenerAlmacenes({ sucursalId });
      setAlmacenes(response.data || []);
    } catch (error) {
      console.error('Error al cargar almacenes:', error);
      Swal.fire('Error', 'Error al cargar almacenes', 'error');
    }
  };

  const cargarProductos = async () => {
    try {
      const filtrosCompletos = {
        ...filtros,
        buscar: busqueda.trim()
      };
      
      const response = await obtenerProductosParaEtiquetas(filtrosCompletos);
      
      if (response.success) {
        setProductos(response.data || []);
      } else {
        setProductos([]);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductos([]);
    }
  };

  const manejarSeleccionProducto = (producto, cantidad = 1) => {
    setProductosSeleccionados(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (existe) {
        return prev.map(p => 
          p.id === producto.id 
            ? { ...p, cantidad: Math.max(1, cantidad) }
            : p
        );
      } else {
        return [...prev, { ...producto, cantidad }];
      }
    });
  };

  const removerProductoSeleccionado = (productoId) => {
    setProductosSeleccionados(prev => 
      prev.filter(p => p.id !== productoId)
    );
  };

  const seleccionarTodosLosProductos = () => {
    const nuevosSeleccionados = productos.map(producto => ({
      ...producto,
      cantidad: 1
    }));
    setProductosSeleccionados(nuevosSeleccionados);
  };

  const limpiarSeleccion = () => {
    setProductosSeleccionados([]);
  };

  const exportarEtiquetas = async () => {
    if (productosSeleccionados.length === 0) {
      Swal.fire('Advertencia', 'Debe seleccionar al menos un producto', 'warning');
      return;
    }

    setCargando(true);
    
    try {
      const productosParaExportar = productosSeleccionados.map(p => ({
        id: p.id,
        cantidad: p.cantidad
      }));

      await exportarEtiquetasService(productosParaExportar, configuracion, filtros);
      
      Swal.fire('Éxito', 'Etiquetas exportadas correctamente', 'success');
    } catch (error) {
      console.error('Error al exportar etiquetas:', error);
      Swal.fire('Error', error.message || 'Error al exportar etiquetas', 'error');
    } finally {
      setCargando(false);
    }
  };



  return (
    <div className="modal-overlay">
      <div className="modal-exportar-etiquetas">
        <div className="modal-header">
          <h2>Exportar Etiquetas con Códigos de Barras</h2>
          <button className="btn-cerrar" onClick={onCerrar}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Filtros */}
          <div className="seccion-filtros">
            <h3>Filtros de Productos</h3>
            <div className="filtros-grid">
              <div className="campo">
                <label>Buscar:</label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Nombre o código del producto"
                />
              </div>
              
              {/* <div className="campo">
                <label>Categoría:</label>
                <select
                  value={filtros.categoriaId}
                  onChange={(e) => setFiltros(prev => ({ ...prev, categoriaId: e.target.value }))}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>*/ }
             
              {/*
              <div className="campo">
                <label>Sucursal:</label>
                <select
                  value={filtros.sucursalId}
                  onChange={(e) => setFiltros(prev => ({ ...prev, sucursalId: e.target.value }))}
                >
                  <option value="">Todas las sucursales</option>
                  {sucursales.map(sucursal => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </select>
              </div>
              */ }
              
              {almacenes.length > 0 && (
                <div className="campo">
                  <label>Almacén:</label>
                  <select
                    value={filtros.almacenId}
                    onChange={(e) => setFiltros(prev => ({ ...prev, almacenId: e.target.value }))}
                  >
                    <option value="">Todos los almacenes</option>
                    {almacenes.map(almacen => (
                      <option key={almacen.id} value={almacen.id}>
                        {almacen.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              
               {/* <div className="campo-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={filtros.conStock}
                    onChange={(e) => setFiltros(prev => ({ ...prev, conStock: e.target.checked }))}
                  />
                  Solo productos con stock
                </label>
              </div> */}

            </div>
          </div>

          {/* Configuración de etiquetas */}
          <div className="seccion-configuracion">
            <h3>Configuración de Etiquetas</h3>
            <div className="configuracion-grid">
              <div className="campo">
                <label>Tamaño de etiqueta:</label>
                <select
                  value={configuracion.tamanoEtiqueta}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, tamanoEtiqueta: e.target.value }))}
                >
                  <option value="pequena">Pequeña</option>
                  <option value="mediana">Mediana</option>
                  <option value="grande">Grande</option>
                </select>
              </div>
              
              <div className="opciones-incluir">
                <label>
                  <input
                    type="checkbox"
                    checked={configuracion.incluirNombre}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, incluirNombre: e.target.checked }))}
                  />
                  Incluir nombre
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    checked={configuracion.incluirCodigo}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, incluirCodigo: e.target.checked }))}
                  />
                  Incluir código
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    checked={configuracion.incluirPrecio}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, incluirPrecio: e.target.checked }))}
                  />
                  Incluir precio
                </label>
                
                {/* <label>
                  <input
                    type="checkbox"
                    checked={configuracion.incluirSucursal}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, incluirSucursal: e.target.checked }))}
                  />
                  Incluir sucursal
                </label>*/}
               



              </div>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="seccion-productos">
            <div className="productos-header">
              <h3>Productos Disponibles ({productos.length})</h3>
              <div className="acciones-productos">
                <button 
                  className="btn-seleccionar-todos"
                  onClick={seleccionarTodosLosProductos}
                  disabled={productos.length === 0}
                >
                  Seleccionar Todos
                </button>
                <button 
                  className="btn-limpiar"
                  onClick={limpiarSeleccion}
                  disabled={productosSeleccionados.length === 0}
                >
                  Limpiar Selección
                </button>
              </div>
            </div>
            
            <div className="productos-lista">
              {productos.map(producto => {
                const seleccionado = productosSeleccionados.find(p => p.id === producto.id);
                return (
                  <div key={producto.id} className={`producto-item ${seleccionado ? 'seleccionado' : ''}`}>
                    <div className="producto-info">
                      <div className="producto-nombre">{producto.nombre}</div>
                      <div className="producto-codigo">Código: {producto.codigo}</div>
                      <div className="producto-precio">S/ {parseFloat(producto.precioVenta).toFixed(2)}</div>
                      {producto.Categoria && (
                        <div className="producto-categoria">{producto.Categoria.nombre}</div>
                      )}
                    </div>
                    
                    <div className="producto-acciones">
                      {seleccionado ? (
                        <div className="cantidad-control">
                          <input
                            type="number"
                            min="1"
                            value={seleccionado.cantidad}
                            onChange={(e) => manejarSeleccionProducto(producto, parseInt(e.target.value) || 1)}
                            className="input-cantidad"
                          />
                          <button 
                            className="btn-remover"
                            onClick={() => removerProductoSeleccionado(producto.id)}
                          >
                            Remover
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn-agregar"
                          onClick={() => manejarSeleccionProducto(producto)}
                        >
                          Agregar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Productos seleccionados */}
          {productosSeleccionados.length > 0 && (
            <div className="seccion-seleccionados">
              <h3>Productos Seleccionados ({productosSeleccionados.length})</h3>
              <div className="resumen-seleccionados">
                <div className="total-etiquetas">
                  Total de etiquetas: {productosSeleccionados.reduce((total, p) => total + p.cantidad, 0)}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onCerrar}>
            Cancelar
          </button>

          <button 
            className="btn-exportar" 
            onClick={exportarEtiquetas}
            disabled={cargando || productosSeleccionados.length === 0}
          >
            {cargando ? (
              <>
                <span className="spinner"></span>
                Generando PDF...
              </>
            ) : (
              'Exportar Etiquetas'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportarEtiquetas;