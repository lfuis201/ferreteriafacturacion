import React, { useState } from 'react';
import { ArrowLeft, Tag } from 'lucide-react';

const VentasPorCategoria = ({ onBack }) => {
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: ''
  });

  const [ventasCategorias] = useState([
    { categoria: 'Herramientas', cantidadVentas: 125, totalVentas: 18500.00, porcentaje: 45.2 },
    { categoria: 'Ferretería', cantidadVentas: 89, totalVentas: 12300.00, porcentaje: 30.1 },
    { categoria: 'Electricidad', cantidadVentas: 67, totalVentas: 10100.00, porcentaje: 24.7 }
  ]);

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <button onClick={onBack} className="btn-back">
          <ArrowLeft size={20} />
          Volver
        </button>
        <h2>Reporte de Ventas por Categoría</h2>
      </div>

      <div className="reportes-filtros">
        <div className="filtros-grid">
          <div className="filtro-grupo">
            <label>Fecha Desde:</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
            />
          </div>
          <div className="filtro-grupo">
            <label>Fecha Hasta:</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
            />
          </div>
        </div>
        <div className="filtros-acciones">
          <button className="btn-filtrar">Aplicar Filtros</button>
          <button className="btn-exportar">Exportar Excel</button>
        </div>
      </div>

      <div className="reportes-tabla">
        <h3>Ventas por Categoría</h3>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Cantidad Ventas</th>
              <th>Total Ventas</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {ventasCategorias.map((item, index) => (
              <tr key={index}>
                <td>{item.categoria}</td>
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

export default VentasPorCategoria;