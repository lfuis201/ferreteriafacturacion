import React, { useEffect, useState } from 'react';
import { obtenerCotizaciones } from '../../services/cotizacionService';
import { obtenerSucursales } from '../../services/sucursalService';
import { obtenerClientes } from '../../services/clienteService';
import '../../styles/CotizacionesReporte.css'; // Importar el CSS

// Reporte funcional de Cotizaciones sin estilos.
// Usa servicios reales y abre desde reporte.jsx al hacer clic.
const CotizacionesReporte = ({ onBack }) => {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    sucursalId: '',
    clienteId: '',
    estado: ''
  });

  const [sucursales, setSucursales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarCombos = async () => {
      try {
        const [resSucursales, resClientes] = await Promise.all([
          obtenerSucursales(),
          obtenerClientes()
        ]);
        setSucursales(resSucursales.sucursales || resSucursales.data || resSucursales || []);
        setClientes(resClientes.clientes || resClientes.data || resClientes || []);
      } catch (err) {
        console.error('Error cargando combos:', err);
      }
    };
    cargarCombos();
    cargarCotizaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarCotizaciones = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerCotizaciones({
        fechaInicio: filtros.fechaInicio || undefined,
        fechaFin: filtros.fechaFin || undefined,
        sucursalId: filtros.sucursalId || undefined,
        clienteId: filtros.clienteId || undefined,
        estado: filtros.estado || undefined
      });
      const lista = data.cotizaciones || data.data?.cotizaciones || data || [];
      setCotizaciones(lista);
    } catch (err) {
      setError(err.message || 'Error al cargar cotizaciones');
      setCotizaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (valor) => `S/ ${Number(valor || 0).toFixed(2)}`;

  return (
    <div className="cotizaciones-reporte-container">
      <div className="cotizaciones-reporte-header">
        <button onClick={onBack} className="cotizaciones-reporte-btn-back">Volver</button>
        <h2>Reporte de Cotizaciones</h2>
      </div>

      <div className="cotizaciones-reporte-filtros">
        <div className="cotizaciones-reporte-filtros-grid">
          <div className="cotizaciones-reporte-filtro-grupo">
            <label>Fecha desde: </label>
            <input type="date" value={filtros.fechaInicio} onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })} />
          </div>
          <div className="cotizaciones-reporte-filtro-grupo">
            <label>Fecha hasta: </label>
            <input type="date" value={filtros.fechaFin} onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })} />
          </div>
          <div className="cotizaciones-reporte-filtro-grupo">
            <label>Sucursal: </label>
            <select value={filtros.sucursalId} onChange={(e) => setFiltros({ ...filtros, sucursalId: e.target.value })}>
              <option value="">Todas</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div className="cotizaciones-reporte-filtro-grupo">
            <label>Cliente: </label>
            <select value={filtros.clienteId} onChange={(e) => setFiltros({ ...filtros, clienteId: e.target.value })}>
              <option value="">Todos</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="cotizaciones-reporte-filtro-grupo">
            <label>Estado: </label>
            <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Anulado">Anulado</option>
            </select>
          </div>
        </div>
        <div className="cotizaciones-reporte-filtros-acciones">
          <button onClick={cargarCotizaciones} disabled={loading} className="cotizaciones-reporte-btn-filtrar">
            {loading ? 'Cargando...' : 'Aplicar filtros'}
          </button>
        </div>
      </div>

      {error && <div className="cotizaciones-reporte-error">{error}</div>}

      <div className="cotizaciones-reporte-resumen">
        <h3>Resumen</h3>
        <div className="cotizaciones-reporte-resumen-grid">
          <div className="cotizaciones-reporte-resumen-card">
            <div className="cotizaciones-reporte-resumen-numero">{cotizaciones.length}</div>
            <div className="cotizaciones-reporte-resumen-label">Total Cotizaciones</div>
          </div>
          <div className="cotizaciones-reporte-resumen-card">
            <div className="cotizaciones-reporte-resumen-numero">
              {formatearMoneda(cotizaciones.reduce((sum, c) => sum + Number(c.total || 0), 0))}
            </div>
            <div className="cotizaciones-reporte-resumen-label">Monto Total</div>
          </div>
          <div className="cotizaciones-reporte-resumen-card">
            <div className="cotizaciones-reporte-resumen-numero">
              {cotizaciones.filter(c => c.estado === 'Activo').length}
            </div>
            <div className="cotizaciones-reporte-resumen-label">Activas</div>
          </div>
        </div>
      </div>

      <div className="cotizaciones-reporte-tabla">
        <h3>Listado de Cotizaciones</h3>
        <div className="cotizaciones-reporte-tabla-container">
          <table className="cotizaciones-reporte-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Sucursal</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Moneda</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map((c) => (
                <tr key={c.id}>
                  <td className="cotizaciones-reporte-fecha">{c.fechaEmision ? new Date(c.fechaEmision).toLocaleDateString() : '-'}</td>
                  <td className="cotizaciones-reporte-sucursal">{c.Sucursal?.nombre || '-'}</td>
                  <td className="cotizaciones-reporte-cliente">{c.Cliente?.nombre || c.cliente || '-'}</td>
                  <td className="cotizaciones-reporte-vendedor">{c.vendedor || '-'}</td>
                  <td className="cotizaciones-reporte-moneda">{c.moneda || 'SOL'}</td>
                  <td className="cotizaciones-reporte-total">{formatearMoneda(c.total)}</td>
                  <td className="cotizaciones-reporte-estado">
                    <span className={`cotizaciones-reporte-estado-badge cotizaciones-reporte-estado-${(c.estado || 'Activo').toLowerCase()}`}>
                      {c.estado || 'Activo'}
                    </span>
                  </td>
                </tr>
              ))}
              {cotizaciones.length === 0 && (
                <tr>
                  <td colSpan="7" className="cotizaciones-reporte-sin-datos">No hay cotizaciones para los filtros seleccionados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CotizacionesReporte;