import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, FileText, User, Calendar } from 'lucide-react';

const VentasDetalladas = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    cliente: '',
    vendedor: '',
    tipoDocumento: ''
  });

  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      // Aquí irá la llamada al servicio real
      // const response = await obtenerVentasDetalladas(filtros);
      
      // Datos de ejemplo por ahora
      setVentas([
        {
          id: 1,
          fecha: '2024-01-15',
          documento: 'F001-00001',
          cliente: 'Juan Pérez',
          vendedor: 'Carlos López',
          subtotal: 850.00,
          igv: 153.00,
          total: 1003.00,
          estado: 'Pagado'
        },
        {
          id: 2,
          fecha: '2024-01-15',
          documento: 'B001-00025',
          cliente: 'María García',
          vendedor: 'Ana Rodríguez',
          subtotal: 420.00,
          igv: 75.60,
          total: 495.60,
          estado: 'Pendiente'
        }
      ]);
    } catch (error) {
      console.error('Error al cargar ventas detalladas:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarVentas();
  };

  const exportarReporte = () => {
    console.log('Exportando reporte de ventas detalladas...');
  };

  if (loading) {
    return (
      <div className="reportes-loading">
        <div className="loading-spinner"></div>
        <p>Cargando reporte de ventas detalladas...</p>
      </div>
    );
  }

  return (
    <div className="reportes-container">
      {/* Header */}
      <div className="reportes-header">
        <button onClick={onBack} className="btn-back">
          <ArrowLeft size={20} />
          Volver
        </button>
        <h2>Reporte de Ventas Detalladas</h2>
      </div>

      {/* Filtros */}
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
            <label>Cliente:</label>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={filtros.cliente}
              onChange={(e) => setFiltros({...filtros, cliente: e.target.value})}
            />
          </div>
          <div className="filtro-grupo">
            <label>Vendedor:</label>
            <select
              value={filtros.vendedor}
              onChange={(e) => setFiltros({...filtros, vendedor: e.target.value})}
            >
              <option value="">Todos los vendedores</option>
              <option value="carlos">Carlos López</option>
              <option value="ana">Ana Rodríguez</option>
            </select>
          </div>
          <div className="filtro-grupo">
            <label>Tipo Documento:</label>
            <select
              value={filtros.tipoDocumento}
              onChange={(e) => setFiltros({...filtros, tipoDocumento: e.target.value})}
            >
              <option value="">Todos</option>
              <option value="factura">Factura</option>
              <option value="boleta">Boleta</option>
            </select>
          </div>
        </div>
        <div className="filtros-acciones">
          <button onClick={aplicarFiltros} className="btn-filtrar">
            <Search size={16} />
            Buscar
          </button>
          <button onClick={exportarReporte} className="btn-exportar">
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="reportes-tabla">
        <h3>Ventas Detalladas ({ventas.length} registros)</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Documento</th>
              <th>Cliente</th>
              <th>Vendedor</th>
              <th>Subtotal</th>
              <th>IGV</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id}>
                <td>{new Date(venta.fecha).toLocaleDateString()}</td>
                <td>{venta.documento}</td>
                <td>{venta.cliente}</td>
                <td>{venta.vendedor}</td>
                <td>S/ {venta.subtotal.toFixed(2)}</td>
                <td>S/ {venta.igv.toFixed(2)}</td>
                <td>S/ {venta.total.toFixed(2)}</td>
                <td>
                  <span className={`estado ${venta.estado.toLowerCase()}`}>
                    {venta.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VentasDetalladas;