import React, { useEffect, useMemo, useState } from 'react';
import { obtenerReporteVentas } from '../../services/ventaService';
import { obtenerUsuarios } from '../../services/usuarioService';
import { obtenerSucursales } from '../../services/sucursalService';
import '../../styles/VentasPorVendedor.css'; // Importar el CSS

// Componente funcional sin estilos: Ventas por Vendedor (Detallado y Consolidado)
// Usa servicios reales, filtros por fecha, sucursal y vendedor.
const VentasPorVendedor = ({ onBack }) => {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    sucursalId: '',
    usuarioId: ''
  });

  const [usuarios, setUsuarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarCombos = async () => {
      try {
        const [resUsuarios, resSucursales] = await Promise.all([
          obtenerUsuarios(),
          obtenerSucursales()
        ]);

        const listaUsuarios = resUsuarios.usuarios || resUsuarios.data || resUsuarios || [];
        const listaSucursales = resSucursales.sucursales || resSucursales.data || resSucursales || [];
        setUsuarios(listaUsuarios);
        setSucursales(listaSucursales);
      } catch (err) {
        console.error('Error cargando combos:', err);
      }
    };
    cargarCombos();
    cargarVentas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarVentas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerReporteVentas({
        fechaInicio: filtros.fechaInicio || undefined,
        fechaFin: filtros.fechaFin || undefined,
        sucursalId: filtros.sucursalId || undefined,
        usuarioId: filtros.usuarioId || undefined
      });
      const ventasData = data.ventas || data.data?.ventas || [];
      setVentas(ventasData);
    } catch (err) {
      setError(err.message || 'Error al cargar ventas por vendedor');
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  const consolidadoPorVendedor = useMemo(() => {
    const mapa = new Map();
    ventas.forEach(v => {
      const id = v.Usuario?.id || 'sin_usuario';
      const nombre = v.Usuario?.usuario || v.Usuario?.nombre || 'Sin vendedor';
      const total = Number(v.total || 0);
      const cantidadItems = Array.isArray(v.DetalleVentas) ? v.DetalleVentas.reduce((s, d) => s + Number(d.cantidad || 0), 0) : 0;
      const entry = mapa.get(id) || { id, vendedor: nombre, cantidadVentas: 0, cantidadItems: 0, totalVentas: 0 };
      entry.cantidadVentas += 1;
      entry.cantidadItems += cantidadItems;
      entry.totalVentas += total;
      mapa.set(id, entry);
    });
    return Array.from(mapa.values()).sort((a, b) => b.totalVentas - a.totalVentas);
  }, [ventas]);

  const resumen = useMemo(() => {
    const cantidadVentas = ventas.length;
    const totalVentas = ventas.reduce((s, v) => s + Number(v.total || 0), 0);
    const cantidadItems = ventas.reduce((s, v) => s + (Array.isArray(v.DetalleVentas) ? v.DetalleVentas.reduce((s2, d) => s2 + Number(d.cantidad || 0), 0) : 0), 0);
    return { cantidadVentas, cantidadItems, totalVentas };
  }, [ventas]);

  const formatearMoneda = (valor) => `S/ ${Number(valor || 0).toFixed(2)}`;

  return (
    <div className="ventas-vendedor-container">
      <div className="ventas-vendedor-header">
        <button onClick={onBack} className="ventas-vendedor-btn-back">Volver</button>
        <h2>Ventas por Vendedor</h2>
      </div>

      <div className="ventas-vendedor-filtros">
        <div className="ventas-vendedor-filtros-grid">
          <div className="ventas-vendedor-filtro-grupo">
            <label>Fecha desde: </label>
            <input type="date" value={filtros.fechaInicio} onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })} />
          </div>
          <div className="ventas-vendedor-filtro-grupo">
            <label>Fecha hasta: </label>
            <input type="date" value={filtros.fechaFin} onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })} />
          </div>
          <div className="ventas-vendedor-filtro-grupo">
            <label>Sucursal: </label>
            <select value={filtros.sucursalId} onChange={(e) => setFiltros({ ...filtros, sucursalId: e.target.value })}>
              <option value="">Todas</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div className="ventas-vendedor-filtro-grupo">
            <label>Vendedor: </label>
            <select value={filtros.usuarioId} onChange={(e) => setFiltros({ ...filtros, usuarioId: e.target.value })}>
              <option value="">Todos</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.usuario || u.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="ventas-vendedor-filtros-acciones">
          <button onClick={cargarVentas} disabled={loading} className="ventas-vendedor-btn-filtrar">
            {loading ? 'Cargando...' : 'Aplicar filtros'}
          </button>
        </div>
      </div>

      {error && <div className="ventas-vendedor-error">{error}</div>}

      <div className="ventas-vendedor-resumen">
        <h3>Resumen General</h3>
        <div className="ventas-vendedor-resumen-grid">
          <div className="ventas-vendedor-resumen-card">
            <div className="ventas-vendedor-resumen-numero">{resumen.cantidadVentas}</div>
            <div className="ventas-vendedor-resumen-label">Ventas</div>
          </div>
         
          <div className="ventas-vendedor-resumen-card">
            <div className="ventas-vendedor-resumen-numero">{formatearMoneda(resumen.totalVentas)}</div>
            <div className="ventas-vendedor-resumen-label">Total Ventas</div>
          </div>
        </div>
      </div>

      <div className="ventas-vendedor-consolidado">
        <h3>Consolidado por Vendedor</h3>
        <div className="ventas-vendedor-tabla-container">
          <table className="ventas-vendedor-table">
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Cantidad Ventas</th>
               
                <th>Total Ventas</th>
              </tr>
            </thead>
            <tbody>
              {consolidadoPorVendedor.map((c) => (
                <tr key={c.id}>
                  <td className="ventas-vendedor-nombre">{c.vendedor}</td>
                  <td className="ventas-vendedor-cantidad">{c.cantidadVentas}</td>
                 
                  <td className="ventas-vendedor-total">{formatearMoneda(c.totalVentas)}</td>
                </tr>
              ))}
              {consolidadoPorVendedor.length === 0 && (
                <tr>
                  <td colSpan="4" className="ventas-vendedor-sin-datos">No hay datos para los filtros seleccionados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ventas-vendedor-detalle">
        <h3>Detalle de Ventas</h3>
        <div className="ventas-vendedor-tabla-container">
          <table className="ventas-vendedor-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Vendedor</th>
                <th>Cliente</th>
                <th>Sucursal</th>
                <th>Comprobante</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id}>
                  <td className="ventas-vendedor-fecha">{v.fechaVenta ? new Date(v.fechaVenta).toLocaleString() : '-'}</td>
                  <td className="ventas-vendedor-vendedor">{v.Usuario?.usuario || v.Usuario?.nombre || '-'}</td>
                  <td className="ventas-vendedor-cliente">{v.Cliente?.nombre || '-'}</td>
                  <td className="ventas-vendedor-sucursal">{v.Sucursal?.nombre || '-'}</td>
                  <td className="ventas-vendedor-comprobante">{`${v.serie || ''}-${v.numero || ''}`}</td>
                  <td className="ventas-vendedor-total-detalle">{formatearMoneda(v.total)}</td>
                </tr>
              ))}
              {ventas.length === 0 && (
                <tr>
                  <td colSpan="6" className="ventas-vendedor-sin-datos">No hay ventas para los filtros seleccionados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VentasPorVendedor;