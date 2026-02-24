import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Filter, Download } from 'lucide-react';
import { obtenerReporteVentas } from '../../services/ventaService';
import { obtenerUsuarios } from '../../services/usuarioService';
import { obtenerSucursales } from '../../services/sucursalService';
import '../../styles/ComisionesVentas.css'; // Importar el CSS

const ComisionesVentas = ({ onBack }) => {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    sucursalId: '',
    usuarioId: ''
  });
  const [porcentajeComision, setPorcentajeComision] = useState(5);

  const [usuarios, setUsuarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarFiltros = async () => {
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
        console.error('Error cargando filtros:', err);
      }
    };
    cargarFiltros();
  }, []);

  const cargarReporte = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerReporteVentas({
        fechaInicio: filtros.fechaInicio || undefined,
        fechaFin: filtros.fechaFin || undefined,
        sucursalId: filtros.sucursalId || undefined,
        usuarioId: filtros.usuarioId || undefined
      });

      const ventasData = data.ventas || data.reporte?.ventas || data.data?.ventas || [];
      setVentas(ventasData);
    } catch (err) {
      console.error('Error cargando reporte de ventas:', err);
      setError(err.message || 'Error al cargar el reporte');
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  const resumenPorVendedor = useMemo(() => {
    const mapa = new Map();
    for (const v of ventas) {
      const vendedorId = v.Usuario?.id || v.usuarioId || 'sin-vendedor';
      const vendedorNombre = v.Usuario ? `${v.Usuario.nombre || ''} ${v.Usuario.apellido || ''}`.trim() : 'Sin vendedor';
      const acumulado = mapa.get(vendedorId) || { vendedorId, vendedorNombre, ventasTotales: 0 };
      acumulado.ventasTotales += Number(v.total || 0);
      mapa.set(vendedorId, acumulado);
    }
    return Array.from(mapa.values()).map(item => ({
      ...item,
      porcentajeComision,
      comisionTotal: (item.ventasTotales * porcentajeComision) / 100
    }));
  }, [ventas, porcentajeComision]);

  const resumenPorPeriodo = useMemo(() => {
    const mapa = new Map();
    for (const v of ventas) {
      const fecha = new Date(v.fechaVenta);
      if (isNaN(fecha)) continue;
      const periodoKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const vendedorNombre = v.Usuario ? `${v.Usuario.nombre || ''} ${v.Usuario.apellido || ''}`.trim() : 'Sin vendedor';
      const clave = `${periodoKey}|${vendedorNombre}`;
      const acumulado = mapa.get(clave) || { periodo: periodoKey, vendedor: vendedorNombre, ventasTotales: 0 };
      acumulado.ventasTotales += Number(v.total || 0);
      mapa.set(clave, acumulado);
    }
    return Array.from(mapa.values()).map(item => ({
      ...item,
      porcentajeComision,
      comisionTotal: (item.ventasTotales * porcentajeComision) / 100
    }));
  }, [ventas, porcentajeComision]);

  const exportarExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const hoja1 = XLSX.utils.json_to_sheet(resumenPorVendedor);
      const hoja2 = XLSX.utils.json_to_sheet(resumenPorPeriodo);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, hoja1, 'Comisiones por Vendedor');
      XLSX.utils.book_append_sheet(wb, hoja2, 'Comisiones por Período');
      XLSX.writeFile(wb, 'comisiones_ventas.xlsx');
    } catch (err) {
      console.error('Error exportando Excel:', err);
      alert('No se pudo exportar el Excel');
    }
  };

  const formatearMoneda = (valor) => `S/ ${Number(valor || 0).toFixed(2)}`;

  return (
    <div className="comisiones-ventas-container">
      <div className="comisiones-ventas-header">
        <button onClick={onBack} className="comisiones-ventas-btn-back">
          <ArrowLeft size={20} />
          Volver
        </button>
        <h2>Ventas / Comisiones</h2>
      </div>

      {/* Filtros de búsqueda */}
      <div className="comisiones-ventas-filtros">
        <div className="comisiones-ventas-filtros-grid">
          <div className="comisiones-ventas-filtro-grupo">
            <label>Fecha Desde:</label>
            <input type="date" value={filtros.fechaInicio} onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })} />
          </div>
          <div className="comisiones-ventas-filtro-grupo">
            <label>Fecha Hasta:</label>
            <input type="date" value={filtros.fechaFin} onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })} />
          </div>
          <div className="comisiones-ventas-filtro-grupo">
            <label>Sucursal:</label>
            <select value={filtros.sucursalId} onChange={(e) => setFiltros({ ...filtros, sucursalId: e.target.value })}>
              <option value="">Todas</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div className="comisiones-ventas-filtro-grupo">
            <label>Vendedor:</label>
            <select value={filtros.usuarioId} onChange={(e) => setFiltros({ ...filtros, usuarioId: e.target.value })}>
              <option value="">Todos</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{`${u.nombre || ''} ${u.apellido || ''}`.trim()}</option>
              ))}
            </select>
          </div>
          <div className="comisiones-ventas-filtro-grupo">
            <label>% Comisión (global):</label>
            <input type="number" min="0" max="100" step="0.1" value={porcentajeComision} onChange={(e) => setPorcentajeComision(Number(e.target.value))} />
          </div>
        </div>
        <div className="comisiones-ventas-filtros-acciones">
          <button className="comisiones-ventas-btn-filtrar" onClick={cargarReporte} disabled={loading}>
            <Filter size={18} />
            {loading ? 'Cargando...' : 'Aplicar Filtros'}
          </button>
          <button className="comisiones-ventas-btn-exportar" onClick={exportarExcel} disabled={ventas.length === 0}>
            <Download size={18} />
            Exportar Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="comisiones-ventas-alert-error">{error}</div>
      )}

      {/* Tabla de comisiones por vendedor */}
      <div className="comisiones-ventas-tabla">
        <h3>Comisiones por Vendedor</h3>
        <table>
          <thead>
            <tr>
              <th>Vendedor</th>
              <th>Ventas Totales</th>
              <th>% Comisión</th>
              <th>Comisión Total</th>
            </tr>
          </thead>
          <tbody>
            {resumenPorVendedor.map((item) => (
              <tr key={item.vendedorId}>
                <td>{item.vendedorNombre}</td>
                <td>{formatearMoneda(item.ventasTotales)}</td>
                <td>{item.porcentajeComision}%</td>
                <td>{formatearMoneda(item.comisionTotal)}</td>
              </tr>
            ))}
            {resumenPorVendedor.length === 0 && (
              <tr>
                <td colSpan="4">No hay datos para mostrar</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tabla detallada */}
      <div className="comisiones-ventas-tabla">
        <h3>Comisiones Detalladas</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Comprobante</th>
              <th>Cliente</th>
              <th>Vendedor</th>
              <th>Total Venta</th>
              <th>Comisión</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => {
              const vendedorNombre = v.Usuario ? `${v.Usuario.nombre || ''} ${v.Usuario.apellido || ''}`.trim() : 'Sin vendedor';
              const comision = (Number(v.total || 0) * porcentajeComision) / 100;
              return (
                <tr key={v.id}>
                  <td>{new Date(v.fechaVenta).toLocaleDateString()}</td>
                  <td>{`${v.tipoComprobante || ''} ${v.serieComprobante || ''}-${v.numeroComprobante || ''}`}</td>
                  <td>{v.Cliente?.nombre || '-'}</td>
                  <td>{vendedorNombre}</td>
                  <td>{formatearMoneda(v.total)}</td>
                  <td>{formatearMoneda(comision)}</td>
                </tr>
              );
            })}
            {ventas.length === 0 && (
              <tr>
                <td colSpan="6">No hay ventas para los filtros seleccionados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tabla por período */}
      <div className="comisiones-ventas-tabla">
        <h3>Comisiones por Período</h3>
        <table>
          <thead>
            <tr>
              <th>Período</th>
              <th>Vendedor</th>
              <th>Ventas Totales</th>
              <th>Comisión Total</th>
            </tr>
          </thead>
          <tbody>
            {resumenPorPeriodo.map((item, idx) => (
              <tr key={`${item.periodo}-${item.vendedor}-${idx}`}>
                <td>{item.periodo}</td>
                <td>{item.vendedor}</td>
                <td>{formatearMoneda(item.ventasTotales)}</td>
                <td>{formatearMoneda(item.comisionTotal)}</td>
              </tr>
            ))}
            {resumenPorPeriodo.length === 0 && (
              <tr>
                <td colSpan="4">No hay datos consolidados para mostrar</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComisionesVentas;