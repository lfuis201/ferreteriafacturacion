import React, { useState } from 'react';
import { ArrowLeft, Building } from 'lucide-react';

const VentasPorSucursal = ({ onBack }) => {
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: ''
  });

  const [ventasSucursales] = useState([
    { sucursal: 'Principal', cantidadVentas: 156, totalVentas: 28500.00 },
    { sucursal: 'Sucursal Norte', cantidadVentas: 89, totalVentas: 15200.00 },
    { sucursal: 'Sucursal Sur', cantidadVentas: 67, totalVentas: 12800.00 }
  ]);

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <button onClick={onBack} className="btn-back">
          <ArrowLeft size={20} />
          Volver
        </button>
        <h2>Reporte de Ventas por Sucursal</h2>
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
        <h3>Ventas por Sucursal</h3>
        <table>
          <thead>
            <tr>
              <th>Sucursal</th>
              <th>Cantidad Ventas</th>
              <th>Total Ventas</th>
              <th>Promedio</th>
            </tr>
          </thead>
          <tbody>
            {ventasSucursales.map((item, index) => (
              <tr key={index}>
                <td>{item.sucursal}</td>
                <td>{item.cantidadVentas}</td>
                <td>S/ {item.totalVentas.toFixed(2)}</td>
                <td>S/ {(item.totalVentas / item.cantidadVentas).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VentasPorSucursal;