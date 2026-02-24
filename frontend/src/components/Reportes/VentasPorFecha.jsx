import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, BarChart3 } from 'lucide-react';

const VentasPorFecha = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    agrupacion: 'dia'
  });

  const [ventasFechas, setVentasFechas] = useState([
    { fecha: '2024-01-15', cantidadVentas: 25, totalVentas: 12500.00 },
    { fecha: '2024-01-16', cantidadVentas: 18, totalVentas: 9800.00 },
    { fecha: '2024-01-17', cantidadVentas: 32, totalVentas: 15600.00 }
  ]);

  const aplicarFiltros = () => {
    console.log('Aplicando filtros...');
  };

  const exportarReporte = () => {
    console.log('Exportando reporte de ventas por fecha...');
  };

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <button onClick={onBack} className="btn-back">
          <ArrowLeft size={20} />
          Volver
        </button>
        <h2>Reporte de Ventas por Fecha</h2>
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
          <div className="filtro-grupo">
            <label>Agrupar por:</label>
            <select
              value={filtros.agrupacion}
              onChange={(e) => setFiltros({...filtros, agrupacion: e.target.value})}
            >
              <option value="dia">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
            </select>
          </div>
        </div>
        <div className="filtros-acciones">
          <button onClick={aplicarFiltros} className="btn-filtrar">
            Aplicar Filtros
          </button>
          <button onClick={exportarReporte} className="btn-exportar">
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="reportes-tabla">
        <h3>Ventas por Fecha</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cantidad Ventas</th>
              <th>Total Ventas</th>
              <th>Promedio por Venta</th>
            </tr>
          </thead>
          <tbody>
            {ventasFechas.map((item, index) => (
              <tr key={index}>
                <td>{new Date(item.fecha).toLocaleDateString()}</td>
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

export default VentasPorFecha;