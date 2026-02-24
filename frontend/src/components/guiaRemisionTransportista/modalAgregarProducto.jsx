import React, { useState, useEffect } from 'react';
import '../../styles/ModalAgregarProducto.css';
import FormularioVentaProductServicio from './FormularioVentaProductServicio';
import { obtenerProductos } from '../../services/productoService';

const ModalAgregarProducto = ({ isOpen, onClose, onSave }) => {
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState('1.0');
  const [peso, setPeso] = useState('1');
  const [mostrarFormularioVenta, setMostrarFormularioVenta] = useState(false);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);

  // Cargar productos desde la BD cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarProductosDeBD();
    }
  }, [isOpen]);

  const cargarProductosDeBD = async () => {
    try {
      setCargandoProductos(true);
      const response = await obtenerProductos();
      
      // Verificar si la respuesta tiene productos
      const productos = response.productos || response.data || [];
      
      // Filtrar solo productos activos
      const productosActivos = productos.filter(prod => prod.estado === 'activo');
      
      setProductosDisponibles(productosActivos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      // En caso de error, mantener la lista vacía
      setProductosDisponibles([]);
    } finally {
      setCargandoProductos(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (producto.trim()) {
      // Buscar el producto seleccionado para obtener su ID
      const productoSeleccionado = productosDisponibles.find(prod => prod.nombre === producto);
      
      onSave({
        producto: producto.trim(),
        productoId: productoSeleccionado ? productoSeleccionado.id : null, // Agregar productoId
        cantidad: parseFloat(cantidad),
        peso: parseFloat(peso)
      });
      // Reset form
      setProducto('');
      setCantidad('1.0');
      setPeso('1');
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form on close
    setProducto('');
    setCantidad('1.0');
    setPeso('1');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Agregar Producto</h2>
          
          <button 
            className="close-button"
            onClick={handleClose}
            type="button"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group producto-group">
              <label htmlFor="producto">Producto</label> 

              <button type="button" className="nuevo-link" onClick={() => setMostrarFormularioVenta(true)}>
                  [+ Nuevo]
                </button>
              <div className="input-with-link">
                <select
                  id="producto"
                  value={producto}
                  onChange={(e) => setProducto(e.target.value)}
                  required
                  disabled={cargandoProductos}
                >
                  <option value="">
                    {cargandoProductos ? 'Cargando productos...' : 'Seleccionar producto'}
                  </option>
                  {productosDisponibles.map((prod) => (
                    <option key={prod.id} value={prod.nombre}>
                      {prod.codigo} - {prod.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="cantidad">Cantidad</label>
              <input
                type="number"
                id="cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                step="0.1"
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="peso">Peso</label>
              <input
                type="number"
                id="peso"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                step="1"
                min="0"
                required
              />
            </div>
          </div>
          
         <div className="modal-actions">
  <button 
    type="button" 
    className="btn-cerrar"
    onClick={handleClose}
  >
    Cerrar
  </button>
  <button 
    type="submit" 
    className="btn-agregar"
  >
    Agregar
  </button>
</div>
        </form>

        {/* Modal del FormularioVentaProductServicio */}
        {mostrarFormularioVenta && (
          <div className="modal-overlay">
            <div className="modal-container" style={{ width: '90%', maxWidth: '1200px', height: '90%' }}>
              <div className="modal-header">
                <h2>Seleccionar Producto</h2>
                <button 
                  className="close-button"
                  onClick={() => setMostrarFormularioVenta(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <div style={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
                <FormularioVentaProductServicio 
                   onProductoSeleccionado={(productoSeleccionado) => {
                     // Agregar el producto a la lista de productos disponibles
                     setProductosDisponibles(prev => [...prev, productoSeleccionado]);
                     // Seleccionar automáticamente el producto recién creado
                     setProducto(productoSeleccionado.nombre || productoSeleccionado.codigo);
                     setMostrarFormularioVenta(false);
                   }}
                 />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalAgregarProducto;