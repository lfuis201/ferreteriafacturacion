import React from 'react';
import '../../styles/ModalDetalleVenta.css';

function ModalDetalleVenta({ isOpen, onClose, venta }) {
  // Logs de depuración
  console.log('ModalDetalleVenta renderizado:', { isOpen, venta });
  
  if (venta) {
    console.log('🔍 Campos disponibles en venta:', Object.keys(venta));
    console.log('💰 Valores de totales:', {
      subtotal: venta.subtotal,
      sub_total: venta.sub_total,
      igv: venta.igv,
      impuesto: venta.impuesto,
      total: venta.total,
      monto_total: venta.monto_total
    });
  }
  
  // Simplificar la condición - solo verificar isOpen
  if (!isOpen) {
    console.log('Modal no se muestra: isOpen es false');
    return null;
  }
  
  console.log('Modal se va a mostrar con venta:', venta);

  const formatearMonto = (monto) => {
    return parseFloat(monto || 0).toFixed(2);
  };

  return (
    <div className="modal-overlay-detalle">
      <div className="modal-content-detalle">
        <div className="modal-header-detalle">
          <h3>Detalle</h3>
          <button className="close-button-detalle" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body-detalle">
          {venta ? (
            <div className="info-venta">
              <div className="info-item">
                <strong>Cliente:</strong> {venta.Cliente ? venta.Cliente.nombre : 'Cliente no registrado'}
              </div>
              <div className="info-item">
                <strong>Fecha:</strong> {venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleDateString() : 'Fecha no disponible'}
              </div>
              <div className="info-item">
                <strong>Método de Pago:</strong> {venta.metodoPago || 'No especificado'}
              </div> 
              <br></br>
            </div>
          ) : (
            <div className="info-venta">
              <p>Cargando información de la venta...</p>
            </div>
          )}
          <div className="detalle-tabla-container"> 
            
            <table className="detalle-tabla"> 
              
              <thead>
                <tr>
                  <th>#</th>
                  <th>Descrip.</th>
                  <th>Precio unitario</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {venta && venta.DetalleVenta && venta.DetalleVenta.length > 0 ? (
                  venta.DetalleVenta.map((detalle, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{detalle.Producto ? detalle.Producto.nombre : (detalle.descripcion || 'Sin descripción')}</td>
                      <td>{formatearMonto(detalle.precioUnitario)}</td>
                      <td>{detalle.cantidad}</td>
                      <td>{formatearMonto(detalle.subtotal || (detalle.precioUnitario * detalle.cantidad))}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="sin-detalles">
                      {venta ? "No hay detalles disponibles para esta venta" : "Cargando productos..."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
 



          {/* POR AHORA NO SE UTILIZA<div className="detalle-totales">
            {venta ? (
              <>
                <div className="total-row">
                  <span className="total-label">Subtotal:</span>
                  <span className="total-value">{formatearMonto(venta.subtotal || venta.sub_total || 0)}</span>
                </div>
                <div className="total-row">
                  <span className="total-label">IGV:</span>
                  <span className="total-value">{formatearMonto(venta.igv || venta.impuesto || 0)}</span>
                </div>
                <div className="total-row">
                  <span className="total-label">Total:</span>
                  <span className="total-value">{formatearMonto(venta.total || venta.monto_total || 0)}</span>
                </div>
              </>
            ) : (
              <div className="total-row">
                <span className="total-label">Cargando totales...</span>
              </div>
            )}
          </div>*/}
          
        </div>

        <div className="modal-footer-detalle">
          <button onClick={onClose} className="btn-cerrar-detalle">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalDetalleVenta;