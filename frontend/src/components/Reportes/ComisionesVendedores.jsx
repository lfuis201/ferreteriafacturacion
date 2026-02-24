import React, { useState } from 'react';
import { ArrowLeft, DollarSign } from 'lucide-react';

const ComisionesVendedores = ({ onBack }) => {
  const [filtros, setFiltros] = useState({ fechaDesde: '', fechaHasta: '', vendedor: '' });
  const [comisiones] = useState([
    { vendedor: 'Carlos López', ventasTotales: 25600.00, porcentajeComision: 5, comisionTotal: 1280.00 },
    { vendedor: 'Ana Rodríguez', ventasTotales: 22100.00, porcentajeComision: 5, comisionTotal: 1105.00 }
  ]);

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <button onClick={onBack} className="btn-back"><ArrowLeft size={20} />Volver</button>
        <h2>Reporte de Comisiones de Vendedores</h2>
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
          <div className="filtro-grupo">
            <label>Vendedor:</label>
            <select value={filtros.vendedor} onChange={(e) => setFiltros({...filtros, vendedor: e.target.value})}>
              <option value="">Todos</option>
              <option value="carlos">Carlos López</option>
              <option value="ana">Ana Rodríguez</option>
            </select>
          </div>
        </div>
        <div className="filtros-acciones">
          <button className="btn-filtrar">Aplicar Filtros</button>
          <button className="btn-exportar">Exportar Excel</button>
        </div>
      </div>
      <div className="reportes-tabla">
        <h3>Comisiones de Vendedores</h3>
        <table>
          <thead>
            <tr><th>Vendedor</th><th>Ventas Totales</th><th>% Comisión</th><th>Comisión Total</th></tr>
          </thead>
          <tbody>
            {comisiones.map((item, index) => (
              <tr key={index}>
                <td>{item.vendedor}</td>
                <td>S/ {item.ventasTotales.toFixed(2)}</td>
                <td>{item.porcentajeComision}%</td>
                <td>S/ {item.comisionTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComisionesVendedores;