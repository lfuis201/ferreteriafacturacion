import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { obtenerConsolidadoItemsVentas } from '../../services/ventaService';
import '../../styles/VentasConsolidadoItems.css'; // Importar el CSS

const VentasConsolidadoItems = ({ onBack }) => {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    sucursalId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await obtenerConsolidadoItemsVentas({
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
        sucursalId: filtros.sucursalId || undefined
      });
      setItems(response.items || []);
    } catch (err) {
      setError(err.message || 'Error al cargar consolidado de ítems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar inmediatamente sin filtros para mostrar datos por defecto
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const totalCantidad = items.reduce((sum, it) => sum + Number(it.cantidadVendida || 0), 0);
  const totalSubtotal = items.reduce((sum, it) => sum + Number(it.montoSubtotal || 0), 0);
  const totalIgv = items.reduce((sum, it) => sum + Number(it.montoIgv || 0), 0);
  const totalMonto = items.reduce((sum, it) => sum + Number(it.montoTotal || 0), 0);

  return (
    <div className="ventas-consolidado-container">
      <div className="ventas-consolidado-header">
        <button onClick={onBack} className="ventas-consolidado-btn-back">
          <ArrowLeft size={20} />
          Volver
        </button>
        <h2>Ventas / Consolidado de Ítems</h2>
      </div>

      <div className="ventas-consolidado-filtros">
        <div className="ventas-consolidado-filtros-grid">
          <div className="ventas-consolidado-filtro-grupo">
            <label>Fecha Inicio</label>
            <input type="date" value={filtros.fechaInicio} onChange={(e) => handleInput('fechaInicio', e.target.value)} />
          </div>
          <div className="ventas-consolidado-filtro-grupo">
            <label>Fecha Fin</label>
            <input type="date" value={filtros.fechaFin} onChange={(e) => handleInput('fechaFin', e.target.value)} />
          </div>
        </div>
        <div className="ventas-consolidado-filtros-acciones">
          <button className="ventas-consolidado-btn-filtrar" onClick={cargarDatos} disabled={loading}>
            {loading ? 'Cargando...' : 'Aplicar filtros'}
          </button>
        </div>
      </div>

      {error && (
        <div className="ventas-consolidado-error">{error}</div>
      )}

      <div className="ventas-consolidado-resumen">
        <h3>Resumen General</h3>
        <div className="ventas-consolidado-resumen-grid">
          <div className="ventas-consolidado-resumen-card">
            <div className="ventas-consolidado-resumen-numero">{items.length}</div>
            <div className="ventas-consolidado-resumen-label">Productos Vendidos</div>
          </div>
          <div className="ventas-consolidado-resumen-card">
            <div className="ventas-consolidado-resumen-numero">{totalCantidad.toLocaleString()}</div>
            <div className="ventas-consolidado-resumen-label">Unidades Vendidas</div>
          </div>
          <div className="ventas-consolidado-resumen-card">
            <div className="ventas-consolidado-resumen-numero">S/ {totalMonto.toFixed(2)}</div>
            <div className="ventas-consolidado-resumen-label">Total Ventas</div>
          </div>
        </div>
      </div>

      <div className="ventas-consolidado-tabla">
        <h3>Detalle de Ítems Vendidos</h3>
        <div className="ventas-consolidado-tabla-container">
          <table className="ventas-consolidado-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Cantidad Vendida</th>
                <th>Subtotal</th>
                <th>IGV</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.productoId}>
                  <td className="ventas-consolidado-producto">{it.productoNombre}</td>
                  <td className="ventas-consolidado-codigo">{it.productoCodigo}</td>
                  <td className="ventas-consolidado-cantidad">{Number(it.cantidadVendida || 0).toLocaleString()}</td>
                  <td className="ventas-consolidado-subtotal">S/ {Number(it.montoSubtotal || 0).toFixed(2)}</td>
                  <td className="ventas-consolidado-igv">S/ {Number(it.montoIgv || 0).toFixed(2)}</td>
                  <td className="ventas-consolidado-total">S/ {Number(it.montoTotal || 0).toFixed(2)}</td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="ventas-consolidado-sin-datos">
                    No hay datos para los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="ventas-consolidado-totales">
                <td colSpan="2" className="ventas-consolidado-totales-label">Totales</td>
                <td className="ventas-consolidado-totales-cantidad">{totalCantidad.toLocaleString()}</td>
                <td className="ventas-consolidado-totales-subtotal">S/ {totalSubtotal.toFixed(2)}</td>
                <td className="ventas-consolidado-totales-igv">S/ {totalIgv.toFixed(2)}</td>
                <td className="ventas-consolidado-totales-monto">S/ {totalMonto.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VentasConsolidadoItems;