import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Plus, Minus, RotateCcw, Eye, AlertTriangle, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import { 
  obtenerInventario, 
  actualizarStock, 
  obtenerMovimientosInventario,
  obtenerProductosStockBajo 
} from '../../services/inventarioService';
import { obtenerSucursales } from '../../services/sucursalService';
import { obtenerProductos } from '../../services/productoService';
import '../../styles/GestionInventario.css';

const GestionInventario = () => {
  const [inventario, setInventario] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosStockBajo, setProductosStockBajo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventario');
  const [filtros, setFiltros] = useState({
    sucursalId: '',
    productoId: '',
    stockMinimo: false,
    fechaInicio: '',
    fechaFin: ''
  });
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    productoId: '',
    sucursalId: '',
    stock: '',
    stockMinimo: '',
    precioVenta: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (activeTab === 'inventario') {
      cargarInventario();
    } else if (activeTab === 'movimientos') {
      cargarMovimientos();
    } else if (activeTab === 'stock-bajo') {
      cargarProductosStockBajo();
    }
  }, [filtros, activeTab]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [sucursalesRes, productosRes] = await Promise.all([
        obtenerSucursales(),
        obtenerProductos()
      ]);
      setSucursales(sucursalesRes.sucursales || []);
      setProductos(productosRes.productos || []);
      await cargarInventario();
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire('Error', 'Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarInventario = async () => {
    try {
      const response = await obtenerInventario(filtros);
      setInventario(response.inventario || []);
    } catch (error) {
      console.error('Error cargando inventario:', error);
    }
  };

  const cargarMovimientos = async () => {
    try {
      const response = await obtenerMovimientosInventario(filtros);
      setMovimientos(response.movimientos || []);
    } catch (error) {
      console.error('Error cargando movimientos:', error);
    }
  };

  const cargarProductosStockBajo = async () => {
    try {
      if (filtros.sucursalId) {
        const response = await obtenerProductosStockBajo(filtros.sucursalId);
        setProductosStockBajo(response.productosStockBajo || []);
      }
    } catch (error) {
      console.error('Error cargando productos con stock bajo:', error);
    }
  };

  const handleActualizarStock = async () => {
    try {
      if (!modalData.productoId || !modalData.sucursalId || modalData.stock === '') {
        Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
        return;
      }

      await actualizarStock({
        productoId: modalData.productoId,
        sucursalId: modalData.sucursalId,
        stock: parseFloat(modalData.stock),
        stockMinimo: parseFloat(modalData.stockMinimo) || 0,
        precioVenta: parseFloat(modalData.precioVenta) || 0
      });

      Swal.fire('Éxito', 'Stock actualizado correctamente', 'success');
      setShowModal(false);
      setModalData({
        productoId: '',
        sucursalId: '',
        stock: '',
        stockMinimo: '',
        precioVenta: ''
      });
      cargarInventario();
    } catch (error) {
      console.error('Error actualizando stock:', error);
      Swal.fire('Error', 'Error al actualizar el stock', 'error');
    }
  };

  const abrirModalActualizar = (item = null) => {
    if (item) {
      setModalData({
        productoId: item.productoId,
        sucursalId: item.sucursalId,
        stock: item.stock,
        stockMinimo: item.stockMinimo,
        precioVenta: item.precioVenta
      });
    } else {
      setModalData({
        productoId: '',
        sucursalId: '',
        stock: '',
        stockMinimo: '',
        precioVenta: ''
      });
    }
    setShowModal(true);
  };

  const inventarioFiltrado = inventario.filter(item => {
    const producto = item.Producto;
    if (!producto) return false;
    
    const busquedaLower = busqueda.toLowerCase();
    return (
      producto.nombre.toLowerCase().includes(busquedaLower) ||
      producto.codigo.toLowerCase().includes(busquedaLower)
    );
  });

  const movimientosFiltrados = movimientos.filter(mov => {
    const producto = mov.Producto;
    if (!producto) return false;
    
    // Filtro por búsqueda de texto
    const busquedaLower = busqueda.toLowerCase();
    const coincideBusqueda = (
      producto.nombre.toLowerCase().includes(busquedaLower) ||
      producto.codigo.toLowerCase().includes(busquedaLower)
    );
    
    // Filtro por rango de fechas
    let coincideFecha = true;
    if (filtros.fechaInicio || filtros.fechaFin) {
      const fechaMovimiento = new Date(mov.createdAt);
      fechaMovimiento.setHours(0, 0, 0, 0); // Normalizar a medianoche
      
      if (filtros.fechaInicio) {
        const fechaInicio = new Date(filtros.fechaInicio);
        fechaInicio.setHours(0, 0, 0, 0);
        coincideFecha = coincideFecha && fechaMovimiento >= fechaInicio;
      }
      
      if (filtros.fechaFin) {
        const fechaFin = new Date(filtros.fechaFin);
        fechaFin.setHours(23, 59, 59, 999); // Incluir todo el día final
        coincideFecha = coincideFecha && fechaMovimiento <= fechaFin;
      }
    }
    
    return coincideBusqueda && coincideFecha;
  });

  if (loading) {
    return (
      <div className="gestion-inventario">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-inventario">
      <div className="header">
        <h1>
          <Package className="icon" />
          Gestión de Inventario
        </h1>
        <button 
          className="btn-primary"
          onClick={() => abrirModalActualizar()}
        >
          <Plus className="icon" />
          Actualizar Stock
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'inventario' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventario')}
        >
          <Package className="icon" />
          Inventario
        </button>
        <button 
          className={`tab ${activeTab === 'movimientos' ? 'active' : ''}`}
          onClick={() => setActiveTab('movimientos')}
        >
          <RotateCcw className="icon" />
          Movimientos
        </button>
        <button 
          className={`tab ${activeTab === 'stock-bajo' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock-bajo')}
        >
          <AlertTriangle className="icon" />
          Stock Bajo
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search className="icon" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        
        <select
          value={filtros.sucursalId}
          onChange={(e) => setFiltros({...filtros, sucursalId: e.target.value})}
        >
          <option value="">Todas las sucursales</option>
          {sucursales.map(sucursal => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </select>

        {activeTab === 'inventario' && (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filtros.stockMinimo}
              onChange={(e) => setFiltros({...filtros, stockMinimo: e.target.checked})}
            />
            Solo stock bajo
          </label>
        )}

        {activeTab === 'movimientos' && (
          <div className="date-filters">
            <div className="date-input-group">
              <label>
                <Calendar className="icon" />
                Fecha inicio:
              </label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
              />
            </div>
            <div className="date-input-group">
              <label>
                <Calendar className="icon" />
                Fecha fin:
              </label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
              />
            </div>
          </div>
        )}
      </div>

      <div className="content">
        {activeTab === 'inventario' && (
          <div className="inventario-table">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Sucursal</th>
                  <th>Stock</th>
                  <th>Stock Mín.</th>
                  <th>Precio Venta</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventarioFiltrado.map((item, index) => (
                  <tr key={index}>
                    <td>{item.Producto?.nombre || 'N/A'}</td>
                    <td>{item.Producto?.codigo || 'N/A'}</td>
                    <td>{item.Sucursal?.nombre || 'N/A'}</td>
                    <td className={item.stock <= item.stockMinimo ? 'stock-bajo' : ''}>
                      {item.stock}
                    </td>
                    <td>{item.stockMinimo}</td>
                    <td>S/ {parseFloat(item.precioVenta || 0).toFixed(2)}</td>
                    <td>
                      {item.stock <= item.stockMinimo ? (
                        <span className="badge badge-danger">Stock Bajo</span>
                      ) : (
                        <span className="badge badge-success">Normal</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn-icon"
                        onClick={() => abrirModalActualizar(item)}
                        title="Actualizar stock"
                      >
                        <Package className="icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inventarioFiltrado.length === 0 && (
              <div className="no-data">
                <Package className="icon" />
                <p>No se encontraron registros de inventario</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'movimientos' && (
          <div className="movimientos-table">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Sucursal Origen</th>
                  <th>Sucursal Destino</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                {movimientosFiltrados.map((mov, index) => (
                  <tr key={index}>
                    <td>{new Date(mov.createdAt).toLocaleDateString()}</td>
                    <td>{mov.Producto?.nombre || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${mov.tipoMovimiento.toLowerCase()}`}>
                        {mov.tipoMovimiento}
                      </span>
                    </td>
                    <td>{mov.cantidad}</td>
                    <td>{mov.SucursalOrigen?.nombre || 'N/A'}</td>
                    <td>{mov.SucursalDestino?.nombre || 'N/A'}</td>
                    <td>{mov.observacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {movimientosFiltrados.length === 0 && (
              <div className="no-data">
                <RotateCcw className="icon" />
                <p>No se encontraron movimientos</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stock-bajo' && (
          <div className="stock-bajo-table">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Diferencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosStockBajo.map((item, index) => (
                  <tr key={index}>
                    <td>{item.Producto?.nombre || 'N/A'}</td>
                    <td>{item.Producto?.codigo || 'N/A'}</td>
                    <td className="stock-bajo">{item.stock}</td>
                    <td>{item.stockMinimo}</td>
                    <td className="diferencia-negativa">
                      {item.stockMinimo - item.stock}
                    </td>
                    <td>
                      <button 
                        className="btn-icon"
                        onClick={() => abrirModalActualizar(item)}
                        title="Actualizar stock"
                      >
                        <Plus className="icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productosStockBajo.length === 0 && (
              <div className="no-data">
                <AlertTriangle className="icon" />
                <p>No hay productos con stock bajo</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para actualizar stock */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Actualizar Stock</h3>
              <button 
                className="btn-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Producto:</label>
                <select
                  value={modalData.productoId}
                  onChange={(e) => setModalData({...modalData, productoId: e.target.value})}
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map(producto => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre} - {producto.codigo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Sucursal:</label>
                <select
                  value={modalData.sucursalId}
                  onChange={(e) => setModalData({...modalData, sucursalId: e.target.value})}
                >
                  <option value="">Seleccionar sucursal</option>
                  {sucursales.map(sucursal => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Stock:</label>
                <input
                  type="number"
                  value={modalData.stock}
                  onChange={(e) => setModalData({...modalData, stock: parseFloat(e.target.value) || 0})}
                  placeholder="Cantidad en stock"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Stock Mínimo:</label>
                <input
                  type="number"
                  value={modalData.stockMinimo}
                  onChange={(e) => setModalData({...modalData, stockMinimo: parseFloat(e.target.value) || 0})}
                  placeholder="Stock mínimo"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Precio de Venta:</label>
                <input
                  type="number"
                  value={modalData.precioVenta}
                  onChange={(e) => setModalData({...modalData, precioVenta: parseFloat(e.target.value) || 0})}
                  placeholder="Precio de venta"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={handleActualizarStock}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionInventario;