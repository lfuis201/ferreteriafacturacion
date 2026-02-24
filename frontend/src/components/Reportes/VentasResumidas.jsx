import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, FileText } from 'lucide-react';
import { obtenerReporteVentas } from '../../services/ventaService';
import { obtenerSucursales } from '../../services/sucursalService';
import { obtenerUsuarios } from '../../services/usuarioService';
import '../../styles/VentasResumidas.css'; // Importar el CSS

const VentasResumidas = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    sucursal: '',
    vendedor: ''
  });

  const [sucursales, setSucursales] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [datos, setDatos] = useState({
    totalVentas: 0,
    cantidadDocumentos: 0,
    promedioVenta: 0,
    ventasPorPeriodo: []
  });

  useEffect(() => {
    cargarCombos();
    cargarDatos();
  }, []);

  const cargarCombos = async () => {
    try {
      const [resSucursales, resUsuarios] = await Promise.all([
        obtenerSucursales(),
        obtenerUsuarios()
      ]);
      const listaSucursales = resSucursales.sucursales || resSucursales.data || resSucursales || [];
      const listaUsuarios = resUsuarios.usuarios || resUsuarios.data || resUsuarios || [];
      setSucursales(listaSucursales);
      setUsuarios(listaUsuarios);
    } catch (error) {
      console.error('Error cargando sucursales/usuarios:', error);
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const resp = await obtenerReporteVentas({
        fechaInicio: filtros.fechaDesde || undefined,
        fechaFin: filtros.fechaHasta || undefined,
        sucursalId: filtros.sucursal || undefined,
        usuarioId: filtros.vendedor || undefined
      });
      const ventas = resp.ventas || resp.data?.ventas || [];

      const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total || 0), 0);
      const cantidadDocumentos = ventas.length;
      const promedioVenta = cantidadDocumentos > 0 ? totalVentas / cantidadDocumentos : 0;

      // Agrupar ventas por día (YYYY-MM-DD)
      const porDia = new Map();
      ventas.forEach(v => {
        const fecha = v.fechaVenta ? new Date(v.fechaVenta) : null;
        const key = fecha ? fecha.toISOString().slice(0, 10) : 'Sin fecha';
        const monto = Number(v.total || 0);
        porDia.set(key, (porDia.get(key) || 0) + monto);
      });
      const ventasPorPeriodo = Array.from(porDia.entries())
        .map(([fecha, ventas]) => ({ fecha, ventas }))
        .sort((a, b) => (a.fecha > b.fecha ? 1 : -1));

      setDatos({ totalVentas, cantidadDocumentos, promedioVenta, ventasPorPeriodo });
    } catch (error) {
      console.error('Error al cargar ventas resumidas:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarDatos();
  };

  const exportarReporte = () => {
    // Aquí irá la lógica de exportación
    console.log('Exportando reporte de ventas resumidas...');
  };

  if (loading) {
    return (
      <div className="ventas-resumidas-loading">
        <div className="ventas-resumidas-loading-spinner"></div>
        <p>Cargando reporte de ventas resumidas...</p>
      </div>
    );
  }

  return (
    <div className="ventas-resumidas-container">
      {/* Header */}
      <div className="ventas-resumidas-header">
        <button onClick={onBack} className="ventas-resumidas-btn-back">
          <ArrowLeft size={20} />
          Volver
        </button>
        <h2>Reporte de Ventas Resumidas</h2>
      </div>

      {/* Filtros */}
      <div className="ventas-resumidas-filtros">
        <div className="ventas-resumidas-filtros-grid">
          <div className="ventas-resumidas-filtro-grupo">
            <label>Fecha Desde:</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
            />
          </div>
          <div className="ventas-resumidas-filtro-grupo">
            <label>Fecha Hasta:</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
            />
          </div>
          <div className="ventas-resumidas-filtro-grupo">
            <label>Sucursal:</label>
            <select
              value={filtros.sucursal}
              onChange={(e) => setFiltros({...filtros, sucursal: e.target.value})}
            >
              <option value="">Todas las sucursales</option>
              {sucursales.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div className="ventas-resumidas-filtro-grupo">
            <label>Vendedor:</label>
            <select
              value={filtros.vendedor}
              onChange={(e) => setFiltros({...filtros, vendedor: e.target.value})}
            >
              <option value="">Todos los vendedores</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.usuario || u.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="ventas-resumidas-filtros-acciones">
          <button onClick={aplicarFiltros} className="ventas-resumidas-btn-filtrar">
            Aplicar Filtros
          </button>
          <button onClick={exportarReporte} className="ventas-resumidas-btn-exportar">
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="ventas-resumidas-resumen">
        <div className="ventas-resumidas-resumen-card">
          <DollarSign className="ventas-resumidas-resumen-icon" />
          <div className="ventas-resumidas-resumen-info">
            <h3>S/ {datos.totalVentas.toLocaleString('es-PE', {minimumFractionDigits: 2})}</h3>
            <p>Total Ventas</p>
          </div>
        </div>
        <div className="ventas-resumidas-resumen-card">
          <FileText className="ventas-resumidas-resumen-icon" />
          <div className="ventas-resumidas-resumen-info">
            <h3>{datos.cantidadDocumentos}</h3>
            <p>Documentos</p>
          </div>
        </div>
        <div className="ventas-resumidas-resumen-card">
          <TrendingUp className="ventas-resumidas-resumen-icon" />
          <div className="ventas-resumidas-resumen-info">
            <h3>S/ {datos.promedioVenta.toLocaleString('es-PE', {minimumFractionDigits: 2})}</h3>
            <p>Promedio por Venta</p>
          </div>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="ventas-resumidas-tabla">
        <h3>Ventas por Período</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Ventas</th>
            </tr>
          </thead>
          <tbody>
            {datos.ventasPorPeriodo.map((item, index) => (
              <tr key={index}>
                <td>{new Date(item.fecha).toLocaleDateString()}</td>
                <td>S/ {item.ventas.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VentasResumidas;