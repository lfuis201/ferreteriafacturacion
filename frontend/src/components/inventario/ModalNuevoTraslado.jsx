import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Download, Info } from 'lucide-react';
import '../../styles/ModalNuevoTraslado.css';
import { obtenerSucursalesActivas, obtenerProductosActivos, trasladarProducto } from '../../services/inventarioService';
import { obtenerProductosConInventario } from '../../services/productoService';
import FormularioVentaProductServicio from './FormularioVentaProductServicio';

const ModalNuevoTraslado = ({ isOpen, onClose, onTrasladoCreado }) => {
  const [formData, setFormData] = useState({
    sucursalOrigenId: '',
    sucursalDestinoId: '',
    motivoTraslado: '',
    cantidadActual: 0,
    cantidadTraslado: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [productosEncontrados, setProductosEncontrados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      cargarDatosIniciales();
    }
  }, [isOpen]);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      const [sucursalesRes, productosRes] = await Promise.all([
        obtenerSucursalesActivas(),
        obtenerProductosActivos()
      ]);
      
      setSucursales(sucursalesRes.data || []);
      setProductosDisponibles(productosRes.data || []);
      
      // Establecer primera sucursal como origen por defecto
      if (sucursalesRes.data && sucursalesRes.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          sucursalOrigenId: sucursalesRes.data[0].id
        }));
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddProduct = () => {
    setMostrarFormularioProducto(true);
  };

  const buscarProductos = async (termino) => {
    if (!termino.trim()) {
      setProductosEncontrados([]);
      setMostrarResultados(false);
      return;
    }

    if (!formData.sucursalOrigenId) {
      alert('Por favor selecciona una sucursal origen primero');
      return;
    }

    try {
      setLoading(true);
      const response = await obtenerProductosConInventario({
        nombre: termino,
        sucursalId: formData.sucursalOrigenId
      });
      
      console.log('Respuesta obtenerProductosConInventario en ModalNuevoTraslado:', response);
      
      // Filtrar productos que tengan stock disponible
      const productosConStock = response.productos?.filter(producto => 
        producto.stock > 0
      ) || [];
      
      console.log('Productos con stock en ModalNuevoTraslado:', productosConStock);
      
      setProductosEncontrados(productosConStock);
      setMostrarResultados(productosConStock.length > 0);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setProductosEncontrados([]);
      setMostrarResultados(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProductoSeleccionado = (producto) => {
    setProductoSeleccionado(producto);
    setFormData(prev => ({
      ...prev,
      cantidadActual: producto.stock || 0,
      cantidadTraslado: 0
    }));
    setMostrarFormularioProducto(false);
  };

  const seleccionarProductoDeBusqueda = (producto) => {
    if (producto.stock <= 0) {
      alert(`El producto "${producto.Producto?.nombre || producto.nombre}" no tiene stock disponible para trasladar`);
      return;
    }
    
    setProductoSeleccionado(producto);
    setFormData(prev => ({
      ...prev,
      cantidadActual: producto.stock || 0,
      cantidadTraslado: 1 // Establecer 1 como valor inicial
    }));
    setSearchTerm(producto.Producto?.nombre || producto.nombre || '');
    setMostrarResultados(false);
    setProductosEncontrados([]);
  };

  const agregarProductoALista = () => {
    if (!productoSeleccionado) {
      alert('Por favor seleccione un producto de la búsqueda');
      return;
    }

    if (formData.cantidadTraslado <= 0) {
      alert('La cantidad a trasladar debe ser mayor a 0');
      return;
    }

    if (formData.cantidadTraslado > formData.cantidadActual) {
      alert(`La cantidad a trasladar (${formData.cantidadTraslado}) no puede ser mayor al stock disponible (${formData.cantidadActual})`);
      return;
    }

    if (formData.cantidadActual <= 0) {
      alert('Este producto no tiene stock disponible para trasladar');
      return;
    }

    const nuevoProducto = {
      id: Date.now(), // ID temporal para la tabla
      productoId: productoSeleccionado.productoId || productoSeleccionado.id,
      codigo: productoSeleccionado.Producto?.codigo || productoSeleccionado.codigo,
      nombre: productoSeleccionado.Producto?.nombre || productoSeleccionado.nombre,
      cantidad: parseInt(formData.cantidadTraslado),
      stockActual: formData.cantidadActual
    };

    setProducts(prev => [...prev, nuevoProducto]);
    
    // Limpiar selección
    setProductoSeleccionado(null);
    setFormData(prev => ({
      ...prev,
      cantidadActual: 0,
      cantidadTraslado: 0
    }));
  };

  const eliminarProducto = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const editarProducto = (producto) => {
    // Cargar el producto en el formulario para editar
    setProductoSeleccionado({
      ...producto,
      Producto: {
        codigo: producto.codigo,
        nombre: producto.nombre
      }
    });
    setFormData(prev => ({
      ...prev,
      cantidadActual: producto.stockActual,
      cantidadTraslado: producto.cantidad
    }));
    setSearchTerm(producto.nombre);
    
    // Eliminar el producto de la lista para que se pueda volver a agregar editado
    eliminarProducto(producto.id);
  };

  const handleSubmit = async () => {
    if (!formData.sucursalOrigenId || !formData.sucursalDestinoId) {
      alert('Seleccione las sucursales de origen y destino');
      return;
    }

    if (formData.sucursalOrigenId === formData.sucursalDestinoId) {
      alert('La sucursal de origen debe ser diferente a la de destino');
      return;
    }

    if (products.length === 0) {
      alert('Agregue al menos un producto al traslado');
      return;
    }

    try {
      setLoading(true);
      
      // Procesar cada producto del traslado
      for (const producto of products) {
        const datosTraslado = {
          productoId: producto.productoId,
          sucursalOrigenId: parseInt(formData.sucursalOrigenId),
          sucursalDestinoId: parseInt(formData.sucursalDestinoId),
          cantidad: producto.cantidad,
          observacion: formData.motivoTraslado || 'Traslado entre sucursales'
        };

        await trasladarProducto(datosTraslado);
      }

      alert('Traslado realizado exitosamente');
      
      // Notificar al componente padre que se creó un traslado
      if (onTrasladoCreado) {
        onTrasladoCreado();
      }
      
      handleCancel();
    } catch (error) {
      console.error('Error al realizar traslado:', error);
      alert('Error al realizar el traslado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      sucursalOrigenId: '',
      sucursalDestinoId: '',
      motivoTraslado: '',
      cantidadActual: 0,
      cantidadTraslado: 0
    });
    setProducts([]);
    setSucursales([]);
    setProductosDisponibles([]);
    setProductoSeleccionado(null);
    setMostrarFormularioProducto(false);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-traslado-overlay">
      <div className="modal-traslado-container">
        {/* Header */}
        <div className="modal-traslado-header">
          <h2>Nuevo Traslado</h2>
          <button className="modal-traslado-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-traslado-body">
          {/* Almacenes Row */}
          <div className="traslado-form-row">
            <div className="traslado-form-group">
              <label>Sucursal Inicial</label>
              <select 
                value={formData.sucursalOrigenId}
                onChange={(e) => handleInputChange('sucursalOrigenId', e.target.value)}
                className="traslado-form-select"
                disabled={loading}
              >
                <option value="">Seleccionar sucursal</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="traslado-form-group">
              <label>Sucursal Final</label>
              <select 
                value={formData.sucursalDestinoId}
                onChange={(e) => handleInputChange('sucursalDestinoId', e.target.value)}
                className="traslado-form-select"
                disabled={loading}
              >
                <option value="">Seleccionar sucursal</option>
                {sucursales.filter(s => s.id !== parseInt(formData.sucursalOrigenId)).map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Motivo de Traslado */}
          <div className="traslado-form-group full-width">
            <label>Motivo de Traslado</label>
            <textarea
              value={formData.motivoTraslado}
              onChange={(e) => handleInputChange('motivoTraslado', e.target.value)}
              className="traslado-form-textarea"
              placeholder="Ingrese el motivo del traslado..."
              rows="3"
            />
          </div>

          {/* Producto Section */}
          <div className="traslado-producto-section">
            <div className="traslado-producto-header">
              <div className="traslado-producto-title">
                <label>Producto</label>
                <Info size={16} className="traslado-info-icon" />
              </div>
              <div className="traslado-cantidad-inputs">
                <div className="traslado-search-container" style={{ position: 'relative' }}>

                  {/*  <input
                    type="text"
                    placeholder="Escribe para buscar por nombre o código de barras"
                    className="traslado-search-input-modal"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      buscarProductos(e.target.value);
                    }}
                    disabled={!formData.sucursalOrigenId || loading}
                  />*/}
                
                  
                  {/* Lista de resultados de búsqueda */}
                  {mostrarResultados && productosEncontrados.length > 0 && (
                    <div className="traslado-search-results" style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderTop: 'none',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {productosEncontrados.map((producto, index) => (
                        <div
                          key={index}
                          className="traslado-search-result-item"
                          style={{
                            padding: '10px',
                            borderBottom: '1px solid #eee',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          onClick={() => seleccionarProductoDeBusqueda(producto)}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                          <div style={{ fontWeight: 'bold', color: '#333' }}>
                             {producto.Producto?.nombre || producto.nombre}
                           </div>
                           <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>
                             Código: {producto.Producto?.codigo || producto.codigo}
                           </div>
                           <div style={{ 
                             color: producto.stock > 0 ? '#28a745' : '#dc3545', 
                             fontSize: '11px', 
                             fontWeight: 'bold',
                             marginTop: '2px'
                           }}>
                             Stock Disponible: {producto.stock} unidades
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {productoSeleccionado && (
                  <div className="producto-seleccionado mb-3">
                    <strong>Producto seleccionado:</strong> {productoSeleccionado.Producto?.nombre || productoSeleccionado.nombre}
                    <br />
                    <small>Código: {productoSeleccionado.Producto?.codigo || productoSeleccionado.codigo}</small>
                  </div>
                )}

                <div className="traslado-cantidad-group">
                  <label style={{ color: '#28a745', fontWeight: 'bold' }}>
                    Stock Disponible para Trasladar
                  </label>
                  <input
                    type="number"
                    value={formData.cantidadActual}
                    onChange={(e) => handleInputChange('cantidadActual', e.target.value)}
                    className="traslado-cantidad-input"
                    readOnly
                    style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold', color: '#28a745' }}
                  />
                </div>

                <div className="traslado-cantidad-group">
                  <label style={{ color: '#007bff', fontWeight: 'bold' }}>
                    Cantidad a Trasladar (máx: {formData.cantidadActual})
                  </label>
                  <input
                    type="number"
                    value={formData.cantidadTraslado}
                    onChange={(e) => handleInputChange('cantidadTraslado', e.target.value)}
                    className="traslado-cantidad-input"
                    max={formData.cantidadActual}
                    min="1"
                    placeholder={`Máximo ${formData.cantidadActual} unidades`}
                  />
                </div>

                <div className="traslado-action-buttons">
                  <button 
                    className="traslado-btn-add-product" 
                    onClick={handleAddProduct}
                    disabled={loading}
                  >
                    Agregar Producto
                  </button> 
                </div>

                {productoSeleccionado && (
                  <div className="mt-2">
                    <button 
                      type="button" 
                      className="btn btn-success btn-sm"
                      onClick={agregarProductoALista}
                      disabled={!formData.cantidadTraslado || formData.cantidadTraslado <= 0}
                    >
                      Confirmar Producto
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Products Table */}
            <div className="traslado-products-table-container">
              <table className="traslado-products-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cod. Barras</th>
                    <th>Producto</th>
                    <th style={{ color: '#007bff' }}>Cant. a Trasladar</th>
                    <th style={{ color: '#28a745' }}>Stock Disponible</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="traslado-no-products">
                        No hay productos agregados
                      </td>
                    </tr>
                  ) : (
                    products.map((product, index) => (
                      <tr key={product.id}>
                        <td>{index + 1}</td>
                        <td>{product.codigo}</td>
                        <td>{product.nombre}</td>
                        <td style={{ color: '#007bff', fontWeight: 'bold' }}>
                          {product.cantidad} unidades
                        </td>
                        <td style={{ color: '#28a745', fontWeight: 'bold' }}>
                          {product.stockActual} disponibles
                        </td>
                        <td> 


                          {/*    <button
                            type="button"
                            className="btn btn-primary btn-sm me-2"
                            onClick={() => editarProducto(product)}
                            title="Editar producto"
                            style={{ marginRight: '5px' }}
                          >
                            <i className="fas fa-edit"></i>
                          </button> */}
                      


                          
                          <button
                            
                            onClick={() => eliminarProducto(product.id)}
                            title="Eliminar producto"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-traslado-footer">
          <button 
            className="traslado-btn-cancel" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            className="traslado-btn-save" 
            onClick={handleSubmit}
            disabled={loading || products.length === 0}
          >
            {loading ? 'Procesando...' : 'Guardar'}
          </button>
        </div>
      </div>







      

      {/* Modal para FormularioVentaProductServicio */}




      {mostrarFormularioProducto && (
        <div >
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Seleccionar Producto</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMostrarFormularioProducto(false)}
                ></button>
              </div>
              <div className="modal-body">
                 <FormularioVentaProductServicio
                   onProductoSeleccionado={handleProductoSeleccionado}
                   productos={productosDisponibles}
                 />
               </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMostrarFormularioProducto(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalNuevoTraslado;