import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

// Template genérico para reportes simples
const ReporteTemplate = ({ onBack, titulo, datos = [], columnas = [] }) => {
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: ''
  });

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <button onClick={onBack} className="btn-back">
          <ArrowLeft size={20} />
          Volver
        </button>
        <h2>{titulo}</h2>
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
        <h3>{titulo}</h3>
        <table>
          <thead>
            <tr>
              {columnas.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((valor, idx) => (
                  <td key={idx}>{valor}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReporteTemplate;