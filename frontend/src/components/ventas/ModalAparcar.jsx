import React, { useState, useEffect } from 'react';
import '../../styles/ModalAparcar.css';

function ModalAparcar({ isOpen, onClose, onAparcar, onRestaurar, ventaActual, modoInicial = 'aparcar' }) {
  const [ventasAparcadas, setVentasAparcadas] = useState([]);
  const [referencia, setReferencia] = useState('');
  const [modo, setModo] = useState(modoInicial); // 'aparcar' o 'ver'

  useEffect(() => {
    if (isOpen) {
      cargarVentasAparcadas();
      setModo(modoInicial);
    }
  }, [isOpen, modoInicial]);

  useEffect(() => {
    setModo(modoInicial);
  }, [modoInicial]);

  const cargarVentasAparcadas = () => {
    try {
      const ventasGuardadas = JSON.parse(localStorage.getItem('ventasAparcadas') || '[]');
      setVentasAparcadas(ventasGuardadas);
    } catch (error) {
      console.error('Error al cargar ventas aparcadas:', error);
      setVentasAparcadas([]);
    }
  };

  const handleAparcar = () => {
    if (!referencia.trim()) {
      alert('Por favor ingrese una referencia para la venta');
      return;
    }

    const nuevaVentaAparcada = {
      id: Date.now(),
      referencia: referencia.trim(),
      fecha: new Date().toLocaleString(),
      datosVenta: ventaActual
    };

    try {
      const ventasExistentes = JSON.parse(localStorage.getItem('ventasAparcadas') || '[]');
      const ventasActualizadas = [...ventasExistentes, nuevaVentaAparcada];
      localStorage.setItem('ventasAparcadas', JSON.stringify(ventasActualizadas));
      
      onAparcar(nuevaVentaAparcada);
      setReferencia('');
      onClose();
      alert('Venta aparcada exitosamente');
    } catch (error) {
      console.error('Error al aparcar venta:', error);
      alert('Error al aparcar la venta');
    }
  };

  const handleRestaurar = (ventaAparcada) => {
    if (window.confirm(`¿Desea restaurar la venta "${ventaAparcada.referencia}"?`)) {
      try {
        // Eliminar la venta aparcada del localStorage
        const ventasActualizadas = ventasAparcadas.filter(venta => venta.id !== ventaAparcada.id);
        localStorage.setItem('ventasAparcadas', JSON.stringify(ventasActualizadas));
        setVentasAparcadas(ventasActualizadas);
        
        // Restaurar la venta
        onRestaurar(ventaAparcada.datosVenta);
        onClose();
      } catch (error) {
        console.error('Error al restaurar venta:', error);
        alert('Error al restaurar la venta');
      }
    }
  };

  const handleEliminar = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta venta aparcada?')) {
      try {
        const ventasActualizadas = ventasAparcadas.filter(venta => venta.id !== id);
        localStorage.setItem('ventasAparcadas', JSON.stringify(ventasActualizadas));
        setVentasAparcadas(ventasActualizadas);
      } catch (error) {
        console.error('Error al eliminar venta aparcada:', error);
        alert('Error al eliminar la venta');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-aparcar">
        <div className="modal-header">
          <h3>{modo === 'aparcar' ? 'Aparcar Ventas' : 'Ventas Aparcadas'}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {modo === 'aparcar' ? (
            <div className="aparcar-section">
              <div className="form-group">
                <label htmlFor="referencia">Referencia:</label>
                <input
                  type="text"
                  id="referencia"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ingrese una referencia para identificar la venta"
                  maxLength={50}
                />
              </div>
              <div className="modal-actions">
                <button className="btn-cancelar" onClick={onClose}>
                  Cancelar
                </button>
                <button className="btn-guardar" onClick={handleAparcar}>
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="ver-aparcados-section">
              {ventasAparcadas.length === 0 ? (
                <div className="sin-datos">
                  <p>Sin Datos</p>
                </div>
              ) : (
                <div className="tabla-aparcados">
                  <table>
                    <thead>
                      <tr>
                        <th>Referencia</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventasAparcadas.map((venta) => (
                        <tr key={venta.id}>
                          <td>{venta.referencia}</td>
                          <td>{venta.fecha}</td>
                          <td>
                            <button 
                              className="btn-restaurar"
                              onClick={() => handleRestaurar(venta)}
                            >
                              Restaurar
                            </button>
                            <button 
                              className="btn-eliminar"
                              onClick={() => handleEliminar(venta.id)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/*<div className="modal-actions">
                <button className="btn-cerrar" onClick={onClose}>
                  Cerrar
                </button>
              </div> NO SE USA POR AHORA*/}
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalAparcar;