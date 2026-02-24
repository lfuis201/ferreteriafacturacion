import React, { useEffect, useMemo, useState } from 'react';
import { obtenerReporteVentas } from '../../services/ventaService';
import { obtenerUsuarios } from '../../services/usuarioService';
import { obtenerSucursales } from '../../services/sucursalService';
import '../../styles/VentasConsolidado.css'; // Importar el CSS

// Componente funcional sin estilos: Ventas Consolidado
// Usa servicios reales del backend para obtener el reporte consolidado de ventas.
const VentasConsolidado = ({ onBack }) => {
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

  const [resumen, setResumen] = useState({
    totalVentas: 0,
    montoTotal: 0,
    promedioVenta: 0,
    ventasPorSucursal: [],
    ventasPorMetodoPago: []
  });

  // Cargar listas de filtros (vendedores y sucursales)
  useEffect(() => {
    const cargarListas = async () => {
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
        console.error('Error cargando listas:', err);
      }
    };
    cargarListas();
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

      // Flexibilidad de respuesta del backend
      const ventasData = data.ventas || data.reporte?.ventas || data.data?.ventas || [];
      setVentas(ventasData);

      const totalVentas = data.totalVentas || data.reporte?.totalVentas || ventasData.length || 0;
      const montoTotal = data.montoTotal || data.reporte?.montoTotal || ventasData.reduce((s, v) => s + Number(v.total || 0), 0);
      const promedioVenta = totalVentas > 0 ? montoTotal / totalVentas : 0;
      const ventasPorSucursal = data.ventasPorSucursal || data.reporte?.ventasPorSucursal || [];
      const ventasPorMetodoPago = data.ventasPorMetodoPago || data.reporte?.ventasPorMetodoPago || [];

      setResumen({ totalVentas, montoTotal, promedioVenta, ventasPorSucursal, ventasPorMetodoPago });
    } catch (err) {
      console.error('Error cargando reporte de ventas:', err);
      setError(err.message || 'Error al cargar el reporte');
      setVentas([]);
      setResumen({ totalVentas: 0, montoTotal: 0, promedioVenta: 0, ventasPorSucursal: [], ventasPorMetodoPago: [] });
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar (sin filtros) para ver datos iniciales del día/mes según backend
  useEffect(() => {
    cargarReporte();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exportación simple a Excel
  const exportarExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const hojaResumen = XLSX.utils.json_to_sheet([
        {
          totalVentas: resumen.totalVentas,
          montoTotal: resumen.montoTotal,
          promedioVenta: resumen.promedioVenta
        }
      ]);
      const hojaVentas = XLSX.utils.json_to_sheet(
        ventas.map(v => ({
          fechaVenta: v.fechaVenta,
          comprobante: `${v.tipoComprobante || ''} ${v.serieComprobante || ''}-${v.numeroComprobante || ''}`,
          cliente: v.Cliente?.nombre || '-',
          vendedor: v.Usuario ? `${v.Usuario.nombre || ''} ${v.Usuario.apellido || ''}`.trim() : '-',
          total: v.total
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, hojaResumen, 'Resumen');
      XLSX.utils.book_append_sheet(wb, hojaVentas, 'Ventas');
      XLSX.writeFile(wb, 'ventas_consolidado.xlsx');
    } catch (err) {
      console.error('Error exportando Excel:', err);
      alert('No se pudo exportar el Excel');
    }
  };

  const formatearMoneda = (valor) => `S/ ${Number(valor || 0).toFixed(2)}`;

  return (
    <div className="ventas-consolidado-container">
      {/* Header */}
      <div className="ventas-consolidado-header">
        <button onClick={onBack} className="ventas-consolidado-btn-back">Volver</button>
        <h2>Reporte Consolidado de Ventas</h2>
      </div>

      {/* Filtros */}
      <div className="ventas-consolidado-filtros">
        <div className="ventas-consolidado-filtros-grid">
          <div className="ventas-consolidado-filtro-grupo">
            <label>Fecha desde: </label>
            <input type="date" value={filtros.fechaInicio} onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })} />
          </div>
          <div className="ventas-consolidado-filtro-grupo">
            <label>Fecha hasta: </label>
            <input type="date" value={filtros.fechaFin} onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })} />
          </div>
          <div className="ventas-consolidado-filtro-grupo">
            <label>Sucursal: </label>
            <select value={filtros.sucursalId} onChange={(e) => setFiltros({ ...filtros, sucursalId: e.target.value })}>
              <option value="">Todas</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div className="ventas-consolidado-filtro-grupo">
            <label>Vendedor: </label>
            <select value={filtros.usuarioId} onChange={(e) => setFiltros({ ...filtros, usuarioId: e.target.value })}>
              <option value="">Todos</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{`${u.nombre || ''} ${u.apellido || ''}`.trim()}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="ventas-consolidado-filtros-acciones">
          <button onClick={cargarReporte} disabled={loading} className="ventas-consolidado-btn-filtrar">
            {loading ? 'Cargando...' : 'Aplicar filtros'}
          </button>
          <button onClick={exportarExcel} disabled={ventas.length === 0} className="ventas-consolidado-btn-exportar">
            Exportar Excel
          </button>
        </div>
      </div>

      {error && <div className="ventas-consolidado-error">{error}</div>}

      {/* Resumen */}
      <div className="ventas-consolidado-resumen">
        <h3>Resumen General</h3>
        <div className="ventas-consolidado-resumen-grid">
          <div className="ventas-consolidado-resumen-card">
            <div className="ventas-consolidado-resumen-numero">{resumen.totalVentas}</div>
            <div className="ventas-consolidado-resumen-label">Total Ventas</div>
          </div>
          <div className="ventas-consolidado-resumen-card">
            <div className="ventas-consolidado-resumen-numero">{formatearMoneda(resumen.montoTotal)}</div>
            <div className="ventas-consolidado-resumen-label">Monto Total</div>
          </div>
          <div className="ventas-consolidado-resumen-card">
            <div className="ventas-consolidado-resumen-numero">{formatearMoneda(resumen.promedioVenta)}</div>
            <div className="ventas-consolidado-resumen-label">Promedio por Venta</div>
          </div>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="ventas-consolidado-tabla">
        <h3>Listado de Ventas ({ventas.length} registros)</h3>
        <div className="ventas-consolidado-tabla-container">
          <table className="ventas-consolidado-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Comprobante</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id}>
                  <td className="ventas-consolidado-fecha">{new Date(v.fechaVenta).toLocaleDateString()}</td>
                  <td className="ventas-consolidado-comprobante">{`${v.tipoComprobante || ''} ${v.serieComprobante || ''}-${v.numeroComprobante || ''}`}</td>
                  <td className="ventas-consolidado-cliente">{v.Cliente?.nombre || '-'}</td>
                  <td className="ventas-consolidado-vendedor">{v.Usuario ? `${v.Usuario.nombre || ''} ${v.Usuario.apellido || ''}`.trim() : '-'}</td>
                  <td className="ventas-consolidado-total">{formatearMoneda(v.total)}</td>
                </tr>
              ))}
              {ventas.length === 0 && (
                <tr>
                  <td colSpan="5" className="ventas-consolidado-sin-datos">
                    No hay ventas para los filtros seleccionados
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

export default VentasConsolidado;