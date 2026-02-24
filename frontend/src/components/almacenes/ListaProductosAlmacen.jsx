import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, MapPin, DollarSign, AlertTriangle, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import { obtenerAlmacenes, obtenerInventarioAlmacen } from '../../services/almacenService';
import '../../styles/ListaProductos.css';
import '../../styles/ListaProductosAlmacen.css';

function ListaProductosAlmacen() {
  const [almacenes, setAlmacenes] = useState([]);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState('');
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    nombre: '',
    codigo: '',
    conStock: false,
    stockBajo: false
  });
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 10,
    total: 0
  });

  // Cargar almacenes al montar el componente
  useEffect(() => {
    cargarAlmacenes();
  }, []);

  // Cargar inventario cuando se selecciona un almacén
  useEffect(() => {
    if (almacenSeleccionado) {
      cargarInventarioAlmacen();
    } else {
      setInventario([]);
    }
  }, [almacenSeleccionado]);

  const cargarAlmacenes = async () => {
    try {
      const response = await obtenerAlmacenes();
      setAlmacenes(response.data || []);
    } catch (error) {
      console.error('Error al cargar almacenes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los almacenes'
      });
    }
  };

  const cargarInventarioAlmacen = async () => {
    if (!almacenSeleccionado) return;
    
    try {
      setLoading(true);
      const response = await obtenerInventarioAlmacen(almacenSeleccionado);
      setInventario(response.data?.inventario || []);
      setPaginacion(prev => ({ ...prev, total: response.data?.inventario?.length || 0 }));
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el inventario del almacén'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setPaginacion(prev => ({ ...prev, pagina: 1 }));
  };

  const handleAlmacenChange = (e) => {
    setAlmacenSeleccionado(e.target.value);
    setFiltros({
      nombre: '',
      codigo: '',
      conStock: false,
      stockBajo: false
    });
    setPaginacion({ pagina: 1, limite: 10, total: 0 });
  };

  // Filtrar inventario según los filtros aplicados
  const inventarioFiltrado = inventario.filter(item => {
    const producto = item.Producto;
    
    // Filtro por nombre
    if (filtros.nombre && !producto.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) {
      return false;
    }
    
    // Filtro por código
    if (filtros.codigo && !producto.codigo.toLowerCase().includes(filtros.codigo.toLowerCase())) {
      return false;
    }
    
    // Filtro por stock
    if (filtros.conStock && item.stock <= 0) {
      return false;
    }
    
    // Filtro por stock bajo
    if (filtros.stockBajo && item.stock > item.stockMinimo) {
      return false;
    }
    
    return true;
  });

  // Paginación
  const inicio = (paginacion.pagina - 1) * paginacion.limite;
  const fin = inicio + paginacion.limite;
  const inventarioPaginado = inventarioFiltrado.slice(inicio, fin);
  const totalPaginas = Math.ceil(inventarioFiltrado.length / paginacion.limite);

  const formatearPrecio = (precio) => {
    return precio ? `S/ ${parseFloat(precio).toFixed(2)}` : 'No definido';
  };

  const getEstadoStock = (stock, stockMinimo) => {
    if (stock <= 0) return { clase: 'sin-stock', texto: 'Sin stock' };
    if (stock <= stockMinimo) return { clase: 'stock-bajo', texto: 'Stock bajo' };
    return { clase: 'stock-normal', texto: 'Stock normal' };
  };

  return (
    <div className="lista-productos-container">
      <div className="lista-productos-header">
        <div className="header-title">
          <Package size={24} />
          <h2>Productos por Almacén</h2>
        </div>
      </div>

      {/* Selector de almacén */}
      <div className="filtros-container">
        <div className="filtros-header">
          <h3>Seleccionar Almacén</h3>
        </div>
        
        <div className="filtros-grid">
          <div className="filtro-group">
            <label>Almacén:</label>
            <select
              value={almacenSeleccionado}
              onChange={handleAlmacenChange}
              className="select-almacen"
            >
              <option value="">Seleccione un almacén</option>
              {almacenes.map(almacen => (
                <option key={almacen.id} value={almacen.id}>
                  {almacen.nombre} - {almacen.Sucursal?.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filtros de productos */}
      {almacenSeleccionado && (
        <div className="filtros-container">
          <div className="filtros-header">
            <h3>Filtros de Productos</h3>
          </div>
          
          <div className="filtros-grid">
            <div className="filtro-group">
              <label>Buscar por nombre:</label>
              <input
                type="text"
                name="nombre"
                value={filtros.nombre}
                onChange={handleFiltroChange}
                placeholder="Nombre del producto..."
              />
            </div>
            
            <div className="filtro-group">
              <label>Buscar por código:</label>
              <input
                type="text"
                name="codigo"
                value={filtros.codigo}
                onChange={handleFiltroChange}
                placeholder="Código del producto..."
              />
            </div>
            
            <div className="filtro-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="conStock"
                  checked={filtros.conStock}
                  onChange={handleFiltroChange}
                />
                Solo productos con stock
              </label>
            </div>
            
            <div className="filtro-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="stockBajo"
                  checked={filtros.stockBajo}
                  onChange={handleFiltroChange}
                />
                Solo productos con stock bajo
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de productos */}
      {almacenSeleccionado && (
        <div className="productos-table-container">
          {loading ? (
            <div className="loading-container">
              <p>Cargando inventario...</p>
            </div>
          ) : inventarioPaginado.length === 0 ? (
            <div className="no-productos">
              <p>No se encontraron productos en este almacén</p>
            </div>
          ) : (
            <>
              <div className="productos-table">
                <div className="table-header">
                  <div>N°</div>
                  <div>CÓDIGO</div>
                  <div>NOMBRE</div>
                  <div>DESCRIPCIÓN</div>
                  <div>UNIDAD</div>
                  <div>STOCK</div>
                  <div>STOCK MÍN.</div>
                  <div>STOCK MÁX.</div>
                  <div>PRECIO VENTA</div>
                  <div>UBICACIÓN</div>
                  <div>ESTADO</div>
                </div>
                
                {inventarioPaginado.map((item, index) => {
                  const producto = item.Producto;
                  const estadoStock = getEstadoStock(item.stock, item.stockMinimo);
                  const numeroFila = inicio + index + 1;
                  
                  return (
                    <div key={`${item.productoId}-${item.almacenId}`} className="table-row">
                      <div>{numeroFila}</div>
                      <div className="codigo-cell">{producto.codigo}</div>
                      <div className="nombre-cell">{producto.nombre}</div>
                      <div className="descripcion-cell">{producto.descripcion || 'Sin descripción'}</div>
                      <div>{producto.unidadMedida}</div>
                      <div className={`stock-cell ${estadoStock.clase}`}>
                        {item.stock}
                      </div>
                      <div>{item.stockMinimo}</div>
                      <div>{item.stockMaximo || 'No definido'}</div>
                      <div className="precio-cell">
                        {formatearPrecio(item.precioVenta)}
                      </div>
                      <div>{item.ubicacionFisica || 'No definida'}</div>
                      <div className={`estado-cell ${estadoStock.clase}`}>
                        {estadoStock.texto}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="paginacion">
                  <button
                    onClick={() => setPaginacion(prev => ({ ...prev, pagina: Math.max(1, prev.pagina - 1) }))}
                    disabled={paginacion.pagina === 1}
                  >
                    Anterior
                  </button>
                  
                  <span>
                    Página {paginacion.pagina} de {totalPaginas}
                  </span>
                  
                  <button
                    onClick={() => setPaginacion(prev => ({ ...prev, pagina: Math.min(totalPaginas, prev.pagina + 1) }))}
                    disabled={paginacion.pagina === totalPaginas}
                  >
                    Siguiente
                  </button>
                </div>
              )}
              
              {/* Información de resultados */}
              <div className="resultados-info">
                <p>
                  Mostrando {inventarioPaginado.length} de {inventarioFiltrado.length} productos
                  {inventarioFiltrado.length !== inventario.length && ` (${inventario.length} total)`}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ListaProductosAlmacen;