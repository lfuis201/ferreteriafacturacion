import React, { useEffect, useState } from 'react';
import { obtenerReporteNotasVenta, obtenerNotasVenta } from '../../services/notaVentaService';
import { obtenerSucursales } from '../../services/sucursalService';
import { obtenerUsuarios } from '../../services/usuarioService';
import '../../styles/NotasVentaReporte.css'; // Importar el CSS

// Reporte funcional de Notas de Venta sin estilos.
// Usa servicios reales y abre desde reporte.jsx al hacer clic.
const NotasVentaReporte = ({ onBack }) => {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    sucursalId: '',
    usuarioId: '',
    estado: ''
  });

  const [sucursales, setSucursales] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [notas, setNotas] = useState([]);
  const [reporte, setReporte] = useState({ cantidad: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarCombos = async () => {
      try {
        const [resSucursales, resUsuarios] = await Promise.all([
          obtenerSucursales(),
          obtenerUsuarios()
        ]);
        setSucursales(resSucursales.sucursales || resSucursales.data || resSucursales || []);
        setUsuarios(resUsuarios.usuarios || resUsuarios.data || resUsuarios || []);
      } catch (err) {
        console.error('Error cargando combos:', err);
      }
    };
    cargarCombos();
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      // Listado general
      const lista = await obtenerNotasVenta({
        fechaEmision: filtros.fechaInicio || undefined,
        sucursalId: filtros.sucursalId || undefined,
        estado: filtros.estado || undefined
      });
      const notasData = lista.notas || lista.data?.notas || lista?.notasVenta || lista || [];
      setNotas(notasData);

      // Resumen por rango (intenta servicio; si falla, calcula del listado)
      try {
        const rep = await obtenerReporteNotasVenta({
          fechaInicio: filtros.fechaInicio || undefined,
          fechaFin: filtros.fechaFin || undefined,
          sucursalId: filtros.sucursalId || undefined,
          usuarioId: filtros.usuarioId || undefined
        });
        const resumen = {
          cantidad: rep.cantidad || rep.data?.cantidad || notasData.length || 0,
          total: rep.total || rep.data?.total || notasData.reduce((s, n) => s + Number(n.total || 0), 0)
        };
        setReporte(resumen);
      } catch (errRep) {
        console.warn('NotasVentaReporte: reporte no disponible, usando cálculo local:', errRep?.message);
        const resumenLocal = {
          cantidad: notasData.length,
          total: notasData.reduce((s, n) => s + Number(n.total || 0), 0)
        };
        setReporte(resumenLocal);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar notas de venta');
      setNotas([]);
      setReporte({ cantidad: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (valor) => `S/ ${Number(valor || 0).toFixed(2)}`;

  return (
    <div className="notas-venta-container">
      <div className="notas-venta-header">
        <button onClick={onBack} className="notas-venta-btn-back">Volver</button>
        <h2>Reporte de Notas de Venta</h2>
      </div>

      <div className="notas-venta-filtros">
        <div className="notas-venta-filtros-grid">
          <div className="notas-venta-filtro-grupo">
            <label>Fecha desde: </label>
            <input type="date" value={filtros.fechaInicio} onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })} />
          </div>
          <div className="notas-venta-filtro-grupo">
            <label>Fecha hasta: </label>
            <input type="date" value={filtros.fechaFin} onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })} />
          </div>
          <div className="notas-venta-filtro-grupo">
            <label>Sucursal: </label>
            <select value={filtros.sucursalId} onChange={(e) => setFiltros({ ...filtros, sucursalId: e.target.value })}>
              <option value="">Todas</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div className="notas-venta-filtro-grupo">
            <label>Vendedor: </label>
            <select value={filtros.usuarioId} onChange={(e) => setFiltros({ ...filtros, usuarioId: e.target.value })}>
              <option value="">Todos</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.usuario || u.nombre}</option>
              ))}
            </select>
          </div>
          <div className="notas-venta-filtro-grupo">
            <label>Estado: </label>
            <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Anulado">Anulado</option>
            </select>
          </div>
        </div>
        <div className="notas-venta-filtros-acciones">
          <button onClick={cargarDatos} disabled={loading} className="notas-venta-btn-filtrar">
            {loading ? 'Cargando...' : 'Aplicar filtros'}
          </button>
        </div>
      </div>

      {error && <div className="notas-venta-error">{error}</div>}

      <div className="notas-venta-resumen">
        <h3>Resumen General</h3>
        <div className="notas-venta-resumen-grid">
          <div className="notas-venta-resumen-card">
            <div className="notas-venta-resumen-numero">{reporte.cantidad}</div>
            <div className="notas-venta-resumen-label">Total Notas</div>
          </div>
          <div className="notas-venta-resumen-card">
            <div className="notas-venta-resumen-numero">{formatearMoneda(reporte.total)}</div>
            <div className="notas-venta-resumen-label">Monto Total</div>
          </div>
          <div className="notas-venta-resumen-card">
            <div className="notas-venta-resumen-numero">
              {notas.filter(n => n.estado === 'Activo').length}
            </div>
            <div className="notas-venta-resumen-label">Notas Activas</div>
          </div>
        </div>
      </div>

      <div className="notas-venta-tabla">
        <h3>Listado de Notas de Venta</h3>
        <div className="notas-venta-tabla-container">
          <table className="notas-venta-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Sucursal</th>
                <th>Vendedor</th>
                <th>Cliente</th>
                <th>Serie-Número</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {notas.map((n) => (
                <tr key={n.id}>
                  <td className="notas-venta-fecha">{n.fechaEmision ? new Date(n.fechaEmision).toLocaleDateString() : '-'}</td>
                  <td className="notas-venta-sucursal">{n.Sucursal?.nombre || '-'}</td>
                  <td className="notas-venta-vendedor">{n.Usuario?.usuario || n.Usuario?.nombre || '-'}</td>
                  <td className="notas-venta-cliente">{n.Cliente?.nombre || n.cliente || '-'}</td>
                  <td className="notas-venta-serie">{`${n.serie || ''}-${n.numero || ''}`}</td>
                  <td className="notas-venta-total">{formatearMoneda(n.total)}</td>
                  <td className="notas-venta-estado">
                    <span className={`notas-venta-estado-badge notas-venta-estado-${(n.estado || 'Activo').toLowerCase()}`}>
                      {n.estado || 'Activo'}
                    </span>
                  </td>
                </tr>
              ))}
              {notas.length === 0 && (
                <tr>
                  <td colSpan="7" className="notas-venta-sin-datos">
                    No hay notas de venta para los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NotasVentaReporte;