import React, { useState, useEffect } from 'react';
import { obtenerSucursalesActivas, obtenerInventarioConBusqueda } from '../../services/inventarioService';
import '../../styles/ValidarInventario.css';

const ValidarInventario = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [observations, setObservations] = useState('');
  const [sucursales, setSucursales] = useState([]);
  const [selectedSucursal, setSelectedSucursal] = useState(null);
  const [productos, setProductos] = useState([]);
  const [productosValidacion, setProductosValidacion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [validaciones, setValidaciones] = useState({}); // Para almacenar fechas de validación

  // Cargar sucursales al montar el componente
  useEffect(() => {
    cargarSucursales();
    cargarValidaciones();
  }, []);

  const cargarSucursales = async () => {
    try {
      setLoading(true);
      const response = await obtenerSucursalesActivas();
      setSucursales(response.data || []);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar validaciones desde localStorage (simulando base de datos)
  const cargarValidaciones = () => {
    try {
      const validacionesGuardadas = localStorage.getItem('validacionesInventario');
      if (validacionesGuardadas) {
        setValidaciones(JSON.parse(validacionesGuardadas));
      }
    } catch (error) {
      console.error('Error al cargar validaciones:', error);
    }
  };

  // Guardar validación en localStorage
  const guardarValidacion = (sucursalId) => {
    const nuevasValidaciones = {
      ...validaciones,
      [sucursalId]: {
        fecha: new Date().toISOString(),
        usuario: 'Usuario Actual', // Aquí se podría obtener del contexto de autenticación
        productos: productosValidacion.length
      }
    };
    
    setValidaciones(nuevasValidaciones);
    localStorage.setItem('validacionesInventario', JSON.stringify(nuevasValidaciones));
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    
    const fecha = new Date(fechaISO);
    const opciones = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return fecha.toLocaleDateString('es-PE', opciones);
  };

  // Buscar productos con debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchProduct.trim() && selectedSucursal) {
      const timeout = setTimeout(() => {
        buscarProductos();
      }, 300);
      setSearchTimeout(timeout);
    } else {
      setProductos([]);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchProduct, selectedSucursal]);

  const buscarProductos = async () => {
    try {
      setLoading(true);
      const response = await obtenerInventarioConBusqueda({
        search: searchProduct,
        sucursalId: selectedSucursal.id,
        limit: 10
      });
      setProductos(response.inventario || []);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleValidarClick = (sucursal) => {
    setSelectedSucursal(sucursal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchProduct('');
    setQuantity('');
    setObservations('');
    setProductos([]);
    setProductosValidacion([]);
    setSelectedSucursal(null);
  };

  const handleAgregarProducto = (producto) => {
    if (!quantity || quantity <= 0) {
      alert('Por favor ingrese una cantidad válida');
      return;
    }

    const productoExistente = productosValidacion.find(p => p.id === producto.id);
    
    if (productoExistente) {
      // Actualizar cantidad si ya existe
      setProductosValidacion(prev => 
        prev.map(p => 
          p.id === producto.id 
            ? { ...p, cantidadValidada: parseInt(quantity) }
            : p
        )
      );
    } else {
      // Agregar nuevo producto
      const nuevoProducto = {
        id: producto.id,
        nombre: producto.Producto.nombre,
        codigo: producto.Producto.codigo,
        stockActual: producto.stock,
        cantidadValidada: parseInt(quantity)
      };
      setProductosValidacion(prev => [...prev, nuevoProducto]);
    }

    setQuantity('');
    setSearchProduct('');
    setProductos([]);
  };

  const handleEliminarProducto = (productoId) => {
    setProductosValidacion(prev => prev.filter(p => p.id !== productoId));
  };

  const handleValidar = async () => {
    if (productosValidacion.length === 0) {
      alert('Debe agregar al menos un producto para validar');
      return;
    }

    try {
      // Aquí se implementaría la lógica de validación real
      // Por ahora solo mostramos un mensaje de éxito
      const diferencias = productosValidacion.filter(p => p.stockActual !== p.cantidadValidada);
      
      if (diferencias.length > 0) {
        const mensaje = `Se encontraron ${diferencias.length} diferencias en el inventario. ¿Desea continuar con la validación?`;
        if (!window.confirm(mensaje)) {
          return;
        }
      }

      // Guardar la validación
      guardarValidacion(selectedSucursal.id);
      
      alert('Inventario validado exitosamente');
      handleCloseModal();
    } catch (error) {
      console.error('Error al validar inventario:', error);
      alert('Error al validar el inventario');
    }
  };

  return (
    <div className="validar-inventario">
      <div className="header">
        <p>VALIDAR INVENTARIO</p>
      </div>

      <div className="content">
        <h3>Almacenes</h3>
        
        <div className="table-container">
          <table className="almacenes-table">
            <thead>
              <tr>
                <th>Sucursal</th>
                <th>Última validación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && sucursales.length === 0 ? (
                <tr>
                  <td colSpan="3">Cargando sucursales...</td>
                </tr>
              ) : (
                sucursales.map((sucursal) => (
                  <tr key={sucursal.id}>
                    <td>{sucursal.nombre}</td>
                    <td>
                      {validaciones[sucursal.id] ? (
                        <div>
                          <div>{formatearFecha(validaciones[sucursal.id].fecha)}</div>
                          <small style={{ color: '#666' }}>
                            {validaciones[sucursal.id].productos} productos validados
                          </small>
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>Sin validaciones</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="validar-btn"
                        onClick={() => handleValidarClick(sucursal)}
                      >
                        Validar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Validar inventario del {selectedSucursal?.nombre}</h3>
              <button 
                className="close-btn"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="search-section">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Buscar producto"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="search-input"
                  />
                  <div className="quantity-container">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="quantity-input"
                      placeholder="0"
                    />
                    <button 
                      className="add-btn"
                      onClick={() => productos.length > 0 && handleAgregarProducto(productos[0])}
                      disabled={!quantity || productos.length === 0}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Lista de productos encontrados */}
                {productos.length > 0 && (
                  <div className="productos-encontrados">
                    {productos.map((producto) => (
                      <div 
                        key={producto.id} 
                        className="producto-item"
                        onClick={() => handleAgregarProducto(producto)}
                        style={{ 
                          padding: '8px', 
                          border: '1px solid #ddd', 
                          margin: '2px 0', 
                          cursor: 'pointer',
                          backgroundColor: '#f9f9f9'
                        }}
                      >
                        <strong>{producto.Producto.codigo}</strong> - {producto.Producto.nombre} 
                        <span style={{ color: '#666', marginLeft: '10px' }}>
                          (Stock: {producto.stock})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="table-section">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosValidacion.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: '#666' }}>
                          No hay productos agregados
                        </td>
                      </tr>
                    ) : (
                      productosValidacion.map((producto) => (
                        <tr key={producto.id}>
                          <td>{producto.codigo} - {producto.nombre}</td>
                          <td>{producto.cantidadValidada}</td>
                          <td style={{ 
                            color: producto.stockActual !== producto.cantidadValidada ? '#e74c3c' : '#27ae60' 
                          }}>
                            {producto.stockActual}
                          </td>
                          <td>
                            <button 
                              onClick={() => handleEliminarProducto(producto.id)}
                              style={{
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="observations-section">
                <textarea
                  placeholder="Observación"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="observations-textarea"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button 
                className="validate-btn"
                onClick={handleValidar}
                disabled={productosValidacion.length === 0}
              >
                Validar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidarInventario;