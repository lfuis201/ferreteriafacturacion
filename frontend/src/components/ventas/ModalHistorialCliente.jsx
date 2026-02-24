import React, { useState, useEffect } from "react";
import "../../styles/ModalHistorialCliente.css";
import { ventaService } from "../../services/ventaService";
import ModalDetalleVenta from "./ModalDetalleVenta";

function ModalHistorialCliente({ isOpen, onClose, clienteId, clienteNombre }) {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState("Por mes");
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  useEffect(() => {
    if (isOpen && clienteId) {
      cargarHistorialCliente();
    }
  }, [isOpen, clienteId, periodo, mes]);

  const cargarHistorialCliente = async () => {
    try {
      setLoading(true);
      const response = await ventaService.obtenerVentasPorCliente(clienteId, {
        periodo,
        mes
      });
      setVentas(response.data || []);
    } catch (error) {
      console.error("Error al cargar historial del cliente:", error);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE');
  };

  const formatearMonto = (monto) => {
    return parseFloat(monto).toFixed(2);
  };

  const abrirModalDetalle = async (venta) => {
    console.log('🔍 Función abrirModalDetalle ejecutada con venta:', venta);
    console.log('📊 Estado actual modalDetalleOpen:', modalDetalleOpen);
    try {
      // Obtener los detalles de la venta
      console.log('🌐 Llamando a ventaService.obtenerVentaPorId con ID:', venta.id);
      const response = await ventaService.obtenerVentaPorId(venta.id);
      console.log('📦 Respuesta completa del servicio:', response);
      
      // El backend devuelve { venta: {...} }
      const ventaCompleta = response.venta || response.data?.venta || response;
      console.log('✅ Venta completa procesada:', ventaCompleta);
      console.log('🔍 Estructura de la venta:', {
        id: ventaCompleta.id,
        Cliente: ventaCompleta.Cliente,
        total: ventaCompleta.total,
        DetalleVenta: ventaCompleta.DetalleVenta,
        cantidadDetalles: ventaCompleta.DetalleVenta ? ventaCompleta.DetalleVenta.length : 0
      });
      
      if (ventaCompleta.DetalleVenta && ventaCompleta.DetalleVenta.length > 0) {
        console.log('📋 Detalles de productos encontrados:', ventaCompleta.DetalleVenta.map(d => ({
          producto: d.Producto ? d.Producto.nombre : 'Sin nombre',
          cantidad: d.cantidad,
          precio: d.precioUnitario
        })));
      } else {
        console.log('⚠️ No se encontraron detalles de productos en la venta');
      }
      
      setVentaSeleccionada(ventaCompleta);
      setModalDetalleOpen(true);
      console.log('🎯 Estados actualizados - modalDetalleOpen: true');
    } catch (error) {
      console.error('❌ Error al obtener detalles de la venta:', error);
      console.error('❌ Error completo:', error.response || error.message);
      // Si no se pueden obtener los detalles, mostrar la venta básica
      console.log('🔄 Usando venta básica:', venta);
      setVentaSeleccionada(venta);
      setModalDetalleOpen(true);
      console.log('🎯 Estados actualizados con venta básica - modalDetalleOpen: true');
    }
  };

  const cerrarModalDetalle = () => {
    setModalDetalleOpen(false);
    setVentaSeleccionada(null);
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="modal-overlay-historial">
      <div className="modal-content-historial">
        <div className="modal-header-historial">
          <h3>Consulta de documentos</h3>
          <button className="close-button-historial" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body-historial">
          {/* Información del cliente */}
          <div className="cliente-info">
            <div className="cliente-label">Cliente</div>
            <div className="cliente-nombre">{clienteNombre || 'Cliente no seleccionado'}</div>
          </div>

          {/* Filtros */}
          <div className="filtros-historial">
            <div className="filtro-grupo">
              <label>Período</label>
              <select 
                value={periodo} 
                onChange={(e) => setPeriodo(e.target.value)}
                className="select-filtro"
              >
                <option value="Por mes">Por mes</option>
                <option value="Por año">Por año</option>
                <option value="Todos">Todos</option>
              </select>
            </div>
            
            <div className="filtro-grupo">
              <label>Mes de</label>
              <input 
                type="month" 
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="input-mes"
              />
            </div>

            <button 
              onClick={cargarHistorialCliente}
              className="btn-buscar"
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button> 

            {/*<button className="btn-exportar">
              📊 Exportar Excel
            </button>*/}

            
          </div>

          {/* Tabla de resultados */}
          <div className="tabla-container">
            <table className="tabla-historial">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Tipo Documento</th>
                  <th>Detalle</th>
                  <th>Estado</th>
                  {/*<th>Nota C/D</th>*/}
                  <th>Moneda</th>
                  <th>Número de Placa</th>
                  <th>Serie</th>
                  <th>Número</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="11" className="loading-cell">
                      Cargando historial...
                    </td>
                  </tr>
                ) : ventas.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="empty-cell">
                      No se encontraron documentos para este cliente
                    </td>
                  </tr>
                ) : (
                  ventas.map((venta, index) => (
                    <tr key={venta.id}>
                      <td>{index + 1}</td>
                      <td>{formatearFecha(venta.fechaVenta)}</td>
                      <td>{venta.tipoComprobante}</td>
                      <td>
                        <button 
                          className="btn-detalle" 
                          title="Ver detalles"
                          onClick={() => abrirModalDetalle(venta)}
                        >
                          🔍
                        </button>
                      </td>
                      <td>
                        <span className={`estado ${venta.estadoSunat?.toLowerCase() || 'aceptado'}`}>
                          {venta.estadoSunat || 'ACEPTADO'}
                        </span>
                      </td> 
                      {/*<td>{venta.notaCredito}</td>*/}
                     
                      <td>{venta.moneda}</td>
                      <td>{venta.placaVehiculo}</td>
                      <td>{venta.serieComprobante}</td>
                      <td>{venta.numeroComprobante}</td>
                      <td>S/ {formatearMonto(venta.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          {ventas.length > 0 && (
            <div className="totales-historial">
              <span>Total {ventas.length}</span>
            </div>
          )}
        </div>

        <div className="modal-footer-historial">
          <button onClick={onClose} className="btn-cerrar">
            Cerrar
          </button>
        </div>
      </div>
    </div>
    
    {/* Modal de Detalle de Venta - Fuera del modal principal */}
    <ModalDetalleVenta 
       isOpen={modalDetalleOpen}
       onClose={cerrarModalDetalle}
       venta={ventaSeleccionada}
     />
     </>
   );
}

export default ModalHistorialCliente;