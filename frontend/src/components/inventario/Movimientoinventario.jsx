import React, { useState, useEffect } from 'react';
import '../../styles/Movimientoinventario.css';
import { Plus, Trash2 } from 'lucide-react';
import {
  obtenerInventario,
  obtenerProductosActivos,
  obtenerSucursalesActivas,
  obtenerReferenciasActivas,
  trasladarProducto,
  removerProducto,
  ajustarStockProducto,
  ingresarProducto
} from '../../services/inventarioService';
const Movimientoinventario = () => {
  const [showDropdown, setShowDropdown] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showIngressModal, setShowIngressModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Estados para datos reales
  const [inventoryData, setInventoryData] = useState([]);
  const [productos, setProductos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [referencias, setReferencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para formularios
  const [transferForm, setTransferForm] = useState({
    sucursalDestinoId: '',
    cantidad: 0,
    observacion: '',
    comentarios: '',
    fechaRegistro: '',
    referenciaId: ''
  });

  const [removeForm, setRemoveForm] = useState({
    cantidad: 0,
    observacion: '',
    comentarios: '',
    fechaRegistro: '',
    referenciaId: ''
  });

  const [adjustForm, setAdjustForm] = useState({
    stockReal: 0,
    observacion: '',
    comentarios: '',
    fechaRegistro: '',
    referenciaId: ''
  });

  const [ingressForm, setIngressForm] = useState({
    productoId: '',
    sucursalId: '',
    cantidad: 0,
    stockActual: 0,
    motivo: '',
    observacion: '',
    comentarios: '',
    fechaRegistro: '',
    referenciaId: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      const [inventarioRes, productosRes, sucursalesRes, referenciasRes] = await Promise.all([
        obtenerInventario(),
        obtenerProductosActivos(),
        obtenerSucursalesActivas(),
        obtenerReferenciasActivas()
      ]);

      console.log('Respuesta inventario:', inventarioRes);
      console.log('Datos inventario:', inventarioRes?.inventario);
      
      // El servicio ya devuelve el objeto completo, no necesitamos .data
      setInventoryData(inventarioRes?.inventario || []);
      setProductos(productosRes.data || []);
      setSucursales(sucursalesRes.data || []);
      setReferencias(referenciasRes.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const buscarInventario = async () => {
    if (!searchTerm.trim()) {
      cargarDatosIniciales();
      return;
    }

    setLoading(true);
    try {
      const response = await obtenerInventario({ search: searchTerm });
      console.log('Respuesta búsqueda:', response);
      setInventoryData(response?.inventario || []);
    } catch (error) {
      console.error('Error al buscar:', error);
      alert('Error en la búsqueda: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (id) => {
    setShowDropdown(showDropdown === id ? null : id);
  };

  const openModal = (modalType, product) => {
    setSelectedProduct(product);
    setShowDropdown(null);
    
    switch(modalType) {
      case 'transfer':
        setShowTransferModal(true);
        break;
      case 'remove':
        setShowRemoveModal(true);
        break;
      case 'adjust':
        setShowAdjustModal(true);
        break;
      case 'ingress':
        setShowIngressModal(true);
        break;
      default:
        break;
    }
  };

  const closeAllModals = () => {
    setShowTransferModal(false);
    setShowRemoveModal(false);
    setShowAdjustModal(false);
    setShowIngressModal(false);
    setSelectedProduct(null);
    // Resetear formularios
    setTransferForm({
      sucursalDestinoId: '',
      cantidad: 0,
      observacion: '',
      comentarios: '',
      fechaRegistro: '',
      referenciaId: ''
    });
    setRemoveForm({
      cantidad: 0,
      observacion: '',
      comentarios: '',
      fechaRegistro: '',
      referenciaId: ''
    });
    setAdjustForm({
      stockReal: 0,
      observacion: '',
      comentarios: '',
      fechaRegistro: '',
      referenciaId: ''
    });
    setIngressForm({
      productoId: '',
      sucursalId: '',
      cantidad: 0,
      motivo: '',
      observacion: '',
      comentarios: '',
      fechaRegistro: '',
      referenciaId: ''
    });
  };

  const handleTransfer = async () => {
    if (!selectedProduct || !transferForm.sucursalDestinoId || transferForm.cantidad <= 0) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      await trasladarProducto({
        productoId: selectedProduct.productoId,
        sucursalOrigenId: selectedProduct.sucursalId,
        sucursalDestinoId: transferForm.sucursalDestinoId,
        cantidad: transferForm.cantidad,
        observacion: transferForm.observacion,
        comentarios: transferForm.comentarios,
        fechaRegistro: transferForm.fechaRegistro,
        referenciaId: transferForm.referenciaId
      });

      alert('Traslado realizado exitosamente');
      closeAllModals();
      cargarDatosIniciales();
    } catch (error) {
      console.error('Error al trasladar:', error);
      alert('Error al realizar el traslado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedProduct || removeForm.cantidad <= 0) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      await removerProducto({
        productoId: selectedProduct.productoId,
        sucursalId: selectedProduct.sucursalId,
        cantidad: removeForm.cantidad,
        observacion: removeForm.observacion,
        comentarios: removeForm.comentarios,
        fechaRegistro: removeForm.fechaRegistro,
        referenciaId: removeForm.referenciaId
      });

      alert('Producto removido exitosamente');
      closeAllModals();
      cargarDatosIniciales();
    } catch (error) {
      console.error('Error al remover:', error);
      alert('Error al remover el producto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async () => {
    if (!selectedProduct) {
      alert('No hay producto seleccionado');
      return;
    }

    setLoading(true);
    try {
      await ajustarStockProducto({
        productoId: selectedProduct.productoId,
        sucursalId: selectedProduct.sucursalId,
        stockReal: adjustForm.stockReal,
        observacion: adjustForm.observacion,
        comentarios: adjustForm.comentarios,
        fechaRegistro: adjustForm.fechaRegistro,
        referenciaId: adjustForm.referenciaId
      });

      alert('Ajuste de stock realizado exitosamente');
      closeAllModals();
      cargarDatosIniciales();
    } catch (error) {
      console.error('Error al ajustar:', error);
      alert('Error al ajustar el stock: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIngress = async () => {
    if (!ingressForm.productoId || !ingressForm.sucursalId || ingressForm.cantidad <= 0) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      await ingresarProducto({
        productoId: ingressForm.productoId,
        sucursalId: ingressForm.sucursalId,
        cantidad: ingressForm.cantidad,
        motivo: ingressForm.motivo,
        observacion: ingressForm.observacion,
        comentarios: ingressForm.comentarios,
        fechaRegistro: ingressForm.fechaRegistro,
        referenciaId: ingressForm.referenciaId
      });

      alert('Producto ingresado exitosamente');
      closeAllModals();
      cargarDatosIniciales();
    } catch (error) {
      console.error('Error al ingresar:', error);
      alert('Error al ingresar el producto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inventario-container">
      <div className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🏪</span>
            <span className="logo-text">INVENTARIO</span>
          </div>
        </div>
        <div className="header-right"> 
            {/* <button className="header-btn success">📥 Imp. Ajuste de stock</button>
          <button className="header-btn success">📄 Reporte Aj. stock</button>
          <button className="header-btn success">📊 Reporte</button>
          <button className="header-btn danger">📤 Importar</button> 
          <button className="header-btn danger">📤 Salida</button>*/}
         



          <button 
            className="header-btn danger"
            onClick={() => openModal('ingress', null)}
          >
            <Plus /> 
          </button>
          
        </div>
      </div>

      <div className="content">
        <h2>Listado de Inventario</h2>
        
        <div className="search-section">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Producto" 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && buscarInventario()}
            />
            <button 
              className="search-btn" 
              onClick={buscarInventario}
              disabled={loading}
            >
              🔍 {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>i</th>
                <th>Producto</th>
                <th>Sucursal</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    Cargando inventario...
                  </td>
                </tr>
              ) : inventoryData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    No se encontraron productos en el inventario
                  </td>
                </tr>
              ) : (
                inventoryData.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>
                      <div className="product-info">
                        <div className="product-code">{item.Producto?.codigo || item.codigo}</div>
                        <div className="product-name">{item.Producto?.nombre || item.producto}</div>
                      </div>
                    </td>
                    <td>{item.Sucursal?.nombre || item.almacen}</td>
                    <td className={`stock ${item.stock < 0 ? 'negative' : item.stock === 0 ? 'zero' : 'positive'}`}>
                      {item.stock}
                    </td>
                    <td>
                      <div className="actions-container">
                        <button 
                          className="action-btn primary"
                          onClick={() => openModal('transfer', item)}
                          disabled={loading}
                        >
                          Trasladar
                        </button>
                        <button 
                          className="action-btn warning"
                          onClick={() => openModal('remove', item)}
                          disabled={loading}
                        >
                           <Trash2 />Remover
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => openModal('adjust', item)}
                          disabled={loading}
                        >
                          Ajuste ⓘ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Trasladar */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header danger">
              <h3>Trasladar múltiples productos entre almacenes</h3>
              <button className="close-btn" onClick={closeAllModals}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Producto</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={selectedProduct ? `${selectedProduct.Producto?.codigo || selectedProduct.codigo} - ${selectedProduct.Producto?.nombre || selectedProduct.producto}` : ''}
                    readOnly 
                  />
                </div>
                <div className="form-group">
                  <label>Almacén local</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={selectedProduct ? selectedProduct.Sucursal?.nombre || selectedProduct.almacen : ''}
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Cantidad actual</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={selectedProduct ? selectedProduct.stock : 0}
                    readOnly 
                  />
                </div>
                <div className="form-group">
                  <label>Almacén final</label>
                  <select 
                    className="form-select"
                    value={transferForm.sucursalDestinoId}
                    onChange={(e) => setTransferForm({...transferForm, sucursalDestinoId: e.target.value})}
                  >
                    <option value="">Seleccionar almacén</option>
                    {sucursales.filter(s => s.id !== selectedProduct?.sucursalId).map(sucursal => (
                      <option key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Cantidad a trasladar</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="0"
                    value={transferForm.cantidad}
                    onChange={(e) => setTransferForm({...transferForm, cantidad: parseInt(e.target.value) || 0})}
                    min="1"
                    max={selectedProduct?.stock || 0}
                  />
                </div>
                <div className="form-group">
                  <label>Motivo de traslado</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Motivo"
                    value={transferForm.observacion}
                    onChange={(e) => setTransferForm({...transferForm, observacion: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn danger" onClick={closeAllModals}>Cerrar</button>
              <button className="btn secondary" onClick={closeAllModals}>Cancelar</button>
              <button 
                className="btn primary" 
                onClick={handleTransfer}
                disabled={loading || !transferForm.cantidad || !transferForm.sucursalDestinoId}
              >
                {loading ? 'Procesando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Remover */}
      {showRemoveModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header danger">
              <h3>Retirar producto de almacén 3</h3>
              <button className="close-btn" onClick={closeAllModals}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Producto</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={selectedProduct ? `${selectedProduct.Producto?.codigo || selectedProduct.codigo} - ${selectedProduct.Producto?.nombre || selectedProduct.producto}` : ''}
                    readOnly 
                  />
                </div>
                <div className="form-group">
                  <label>Almacén inicial</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={selectedProduct ? selectedProduct.Sucursal?.nombre || selectedProduct.almacen : ''}
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Cantidad actual</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={selectedProduct ? selectedProduct.stock : 0}
                    readOnly 
                  />
                </div>
                <div className="form-group">
                  <label>Cantidad a retirar</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="0"
                    value={removeForm.cantidad}
                    onChange={(e) => setRemoveForm({...removeForm, cantidad: parseInt(e.target.value) || 0})}
                    min="1"
                    max={selectedProduct?.stock || 0}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Motivo</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Motivo de la remoción"
                    value={removeForm.observacion}
                    onChange={(e) => setRemoveForm({...removeForm, observacion: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Comentarios</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Comentarios adicionales"
                    value={removeForm.comentarios}
                    onChange={(e) => setRemoveForm({...removeForm, comentarios: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={closeAllModals}>Cancelar</button>
              <button 
                className="btn danger" 
                onClick={handleRemove}
                disabled={loading || !removeForm.cantidad}
              >
                {loading ? 'Procesando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ajustar Stock */}
      {showAdjustModal && (
        <div className="modal-overlay">
          <div className="modal adjust-modal">
            <div className="modal-header danger">
              <h3>Ajuste de stock</h3>
              <button className="close-btn" onClick={closeAllModals}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Producto</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={selectedProduct ? `${selectedProduct.Producto?.codigo || selectedProduct.codigo} - ${selectedProduct.Producto?.nombre || selectedProduct.producto}` : ''}
                    readOnly 
                  />
                </div>
                <div className="form-group">
                  <label>Stock en el sistema</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={selectedProduct ? selectedProduct.stock : 0}
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Almacén</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={selectedProduct ? selectedProduct.Sucursal?.nombre || selectedProduct.almacen : ''}
                    readOnly 
                  />
                </div>
                <div className="form-group">
                  <label>Stock real</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="0"
                    value={adjustForm.stockReal}
                    onChange={(e) => setAdjustForm({...adjustForm, stockReal: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Observación</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Motivo del ajuste"
                    value={adjustForm.observacion}
                    onChange={(e) => setAdjustForm({...adjustForm, observacion: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Comentarios</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Comentarios adicionales"
                    value={adjustForm.comentarios}
                    onChange={(e) => setAdjustForm({...adjustForm, comentarios: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={closeAllModals}>Cancelar</button>
              <button 
                className="btn danger" 
                onClick={handleAdjust}
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ingreso */}
      {showIngressModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header danger">
              <h3>Ingreso de producto al almacén</h3>
              <button className="close-btn" onClick={closeAllModals}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Producto</label>
                  <select 
                    className="form-select"
                    value={ingressForm.productoId}
                    onChange={(e) => {
                      const producto = productos.find(p => p.id === parseInt(e.target.value));
                      setIngressForm({
                        ...ingressForm, 
                        productoId: e.target.value,
                        stockActual: producto ? producto.stock || 0 : 0
                      });
                      setSelectedProduct(producto);
                    }}
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map(producto => (
                      <option key={producto.id} value={producto.id}>
                        {producto.codigo} - {producto.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cantidad</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="0"
                    value={ingressForm.cantidad}
                    onChange={(e) => setIngressForm({...ingressForm, cantidad: parseInt(e.target.value) || 0})}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Stock actual</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="0"
                    value={ingressForm.stockActual}
                    onChange={(e) => setIngressForm({...ingressForm, stockActual: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>

              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Sucursal</label>
                  <select 
                    className="form-select"
                    value={ingressForm.sucursalId}
                    onChange={(e) => setIngressForm({...ingressForm, sucursalId: e.target.value})}
                  >
                    <option value="">Seleccionar Sucursal</option>
                    {sucursales.map(sucursal => (
                      <option key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Referencias</label>
                  <select 
                    className="form-select"
                    value={ingressForm.referenciaId}
                    onChange={(e) => setIngressForm({...ingressForm, referenciaId: e.target.value})}
                  >
                    <option value="">Seleccionar referencia</option>
                    {referencias.map(referencia => (
                      <option key={referencia.id} value={referencia.id}>
                        {referencia.codigo} - {referencia.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Motivo</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Motivo del ingreso"
                    value={ingressForm.observacion}
                    onChange={(e) => setIngressForm({...ingressForm, observacion: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha registro</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={ingressForm.fechaRegistro}
                    onChange={(e) => setIngressForm({...ingressForm, fechaRegistro: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Comentarios</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Comentarios adicionales"
                    value={ingressForm.comentarios}
                    onChange={(e) => setIngressForm({...ingressForm, comentarios: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {/*<button className="btn success">Descargar formato</button> */ }
              {/* <button className="btn success">Importar 📤</button>*/ }
             
              <button className="btn secondary" onClick={closeAllModals}>Cancelar</button>
              <button 
                className="btn danger" 
                onClick={handleIngress}
                disabled={loading || !ingressForm.productoId || !ingressForm.sucursalId || !ingressForm.cantidad}
              >
                {loading ? 'Procesando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movimientoinventario;