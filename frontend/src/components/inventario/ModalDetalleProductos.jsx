import React from 'react';
import { X } from 'lucide-react';
import '../../styles/ModalDetalleProductos.css';

const ModalDetalleProductos = ({ isOpen, onClose, traslado }) => {
  // Obtener datos reales del traslado seleccionado
  const productosDetalle = traslado ? [
    {
      id: traslado.id,
      producto: traslado.detalleProductos,
      cantidad: traslado.cantidadTotalProductos
    }
  ] : [];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-detalle">
      <div className="modal-container-detalle">
        {/* Header */}
        <div className="modal-header-detalle">
          <h2>Detalle Productos</h2>
          <button className="close-btn-detalle" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-detalle">
          <div className="detalle-table-container">
            <table className="detalle-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {productosDetalle.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                      No hay datos del traslado seleccionado
                    </td>
                  </tr>
                ) : (
                  productosDetalle.map((producto, index) => (
                    <tr key={producto.id}>
                      <td>{producto.id}</td>
                      <td>{producto.producto}</td>
                      <td>{producto.cantidad}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleProductos;