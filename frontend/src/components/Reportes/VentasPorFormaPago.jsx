import React, { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';

const VentasPorFormaPago = ({ onBack }) => {
  const [filtros, setFiltros] = useState({ fechaDesde: '', fechaHasta: '' });
  const [ventasFormaPago] = useState([
    { formaPago: 'Efectivo', cantidadVentas: 125, totalVentas: 18500.00, porcentaje: 45.2 },
    { formaPago: 'Tarjeta de Crédito', cantidadVentas: 89, totalVentas: 15200.00, porcentaje: 37.1 },
    { formaPago: 'Transferencia', cantidadVentas: 34, totalVentas: 7200.00, porcentaje: 17.7 }
  ]);

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <button onClick={onBack} className="btn-back"><ArrowLeft size={20} />Volver</button>
        <h2>Reporte de Ventas por Forma de Pago</h2>
      </div>
      <div className="reportes-filtros">
        <div className="filtros-grid">
          <div className="filtro-grupo">
            <label>Fecha Desde:</label>
            <input type="date" value={filtros.fechaDesde} onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})} />
          </div>
          <div className="filtro-grupo">
            <label>Fecha Hasta:</label>
            <input type="date" value={filtros.fechaHasta} onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})} />
          </div>
        </div>
        <div className="filtros-acciones">
          <button className="btn-filtrar">Aplicar Filtros</button>
          <button className="btn-exportar">Exportar Excel</button>
        </div>
      </div>
      <div className="reportes-tabla">
        <h3>Ventas por Forma de Pago</h3>
        <table>
          <thead>
            <tr><th>Forma de Pago</th><th>Cantidad</th><th>Total</th><th>%</th></tr>
          </thead>
          <tbody>
            {ventasFormaPago.map((item, index) => (
              <tr key={index}>
                <td>{item.formaPago}</td>
                <td>{item.cantidadVentas}</td>
                <td>S/ {item.totalVentas.toFixed(2)}</td>
                <td>{item.porcentaje}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VentasPorFormaPago;