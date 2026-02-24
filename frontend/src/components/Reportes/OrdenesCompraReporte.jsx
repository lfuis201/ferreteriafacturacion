import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Filter, Download, Calendar, DollarSign, Package, Clock } from 'lucide-react';
import '../../styles/ReporteOrdenesCompra.css';
import { obtenerReporteComprasTotales, exportarComprasExcel } from '../../services/compraService';
import { obtenerProveedores } from '../../services/proveedorService';

const OrdenesCompraReporte = ({ onBack }) => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    proveedor: '',
    estado: '',
    montoMinimo: '',
    montoMaximo: ''
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  useEffect(() => {
    cargarOrdenes();
  }, [filtros.fechaDesde, filtros.fechaHasta, filtros.proveedor, filtros.estado]);

  const cargarProveedores = async () => {
    try {
      const response = await obtenerProveedores({ activo: true });
      setProveedores(response.proveedores || []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setError('Error al cargar proveedores');
    }
  };

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar filtros para el servicio
      const filtrosServicio = {};
      if (filtros.fechaDesde) filtrosServicio.fechaInicio = filtros.fechaDesde;
      if (filtros.fechaHasta) filtrosServicio.fechaFin = filtros.fechaHasta;
      if (filtros.proveedor) filtrosServicio.proveedor = filtros.proveedor;
      if (filtros.estado) filtrosServicio.estado = filtros.estado;
      
      // Llamar al servicio real
      const response = await obtenerReporteComprasTotales(filtrosServicio);
      
      // Mapear los datos del backend al formato esperado por el componente
      const ordenesFormateadas = response.compras.map(compra => ({
        id: compra.id,
        numero: compra.numeroComprobante || `OC-${compra.id}`,
        fecha: compra.fechaCompra,
        proveedor: compra.Proveedor?.nombre || 'Proveedor no especificado',
        estado: compra.estado,
        montoTotal: parseFloat(compra.total || 0),
        cantidadItems: compra.DetalleCompras?.length || 0,
        fechaEntrega: compra.fechaEntrega || compra.fechaCompra,
        fechaVencimiento: compra.fechaVencimiento || compra.fechaCompra,
        responsable: compra.responsable || 'No asignado',
        observaciones: compra.observaciones || 'Sin observaciones'
      }));
      
      setOrdenes(ordenesFormateadas);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      setError('Error al cargar las órdenes de compra');
      // En caso de error, mantener array vacío
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    return ordenes.filter(orden => {
      if (filtros.fechaDesde && orden.fecha < filtros.fechaDesde) return false;
      if (filtros.fechaHasta && orden.fecha > filtros.fechaHasta) return false;
      if (filtros.proveedor && orden.proveedorId !== parseInt(filtros.proveedor)) return false;
      if (filtros.estado && orden.estado !== filtros.estado) return false;
      if (filtros.montoMinimo && orden.montoTotal < parseFloat(filtros.montoMinimo)) return false;
      if (filtros.montoMaximo && orden.montoTotal > parseFloat(filtros.montoMaximo)) return false;
      return true;
    });
  };

  const exportarReporte = async () => {
    try {
      // Preparar filtros para la exportación
      const filtrosExportacion = {};
      if (filtros.fechaDesde) filtrosExportacion.fechaInicio = filtros.fechaDesde;
      if (filtros.fechaHasta) filtrosExportacion.fechaFin = filtros.fechaHasta;
      if (filtros.proveedor) filtrosExportacion.proveedor = filtros.proveedor;
      if (filtros.estado) filtrosExportacion.estado = filtros.estado;
      
      // Llamar al servicio de exportación
      await exportarComprasExcel(filtrosExportacion);
      alert('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      alert('Error al exportar el reporte');
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
      proveedor: '',
      estado: '',
      montoMinimo: '',
      montoMaximo: ''
    });
  };

  const ordenesFiltradas = aplicarFiltros();
  
  // Estados disponibles para el filtro
  const estadosDisponibles = ['PENDIENTE', 'COMPLETADA', 'ANULADA'];

  // Cálculos de resumen
  const totalOrdenes = ordenesFiltradas.length;
  const montoTotalOrdenes = ordenesFiltradas.reduce((sum, o) => sum + o.montoTotal, 0);
  const ordenesPendientes = ordenesFiltradas.filter(o => o.estado === 'PENDIENTE').length;
  const ordenesCompletadas = ordenesFiltradas.filter(o => o.estado === 'COMPLETADA').length;
  const ordenesAnuladas = ordenesFiltradas.filter(o => o.estado === 'ANULADA').length;
  const promedioMonto = totalOrdenes > 0 ? montoTotalOrdenes / totalOrdenes : 0;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'COMPLETADA': return 'completada';
      case 'PENDIENTE': return 'pendiente';
      case 'ANULADA': return 'cancelada';
      default: return 'default';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'COMPLETADA': return 'Completada';
      case 'PENDIENTE': return 'Pendiente';
      case 'ANULADA': return 'Anulada';
      default: return estado;
    }
  };

  if (loading) {
    return (
      <div className="ordenes-compra-container">
        <div className="ordenes-compra-loading-spinner">Cargando reporte de órdenes de compra...</div>
      </div>
    );
  }

  return (
    <div className="ordenes-compra-container">
      {/* Header */}
      <div className="ordenes-compra-header">
        <button onClick={onBack} className="ordenes-compra-back-button">
          <ArrowLeft size={20} />
        </button>
        <span className="ordenes-compra-home-icon">🏠</span>
        <span className="ordenes-compra-breadcrumb">REPORTES</span>
        <span className="ordenes-compra-separator">/</span>
        <span className="ordenes-compra-breadcrumb">COMPRAS</span>
        <span className="ordenes-compra-separator">/</span>
        <span className="ordenes-compra-breadcrumb active">ÓRDENES DE COMPRA</span>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="ordenes-compra-error">
          <p>{error}</p>
          <button onClick={cargarOrdenes} className="ordenes-compra-btn-reintentar">
            Reintentar
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="ordenes-compra-filtros-section">
        <h3><Filter size={20} /> Filtros</h3>
        <div className="ordenes-compra-filtros-grid">
          <div className="ordenes-compra-filtro-grupo">
            <label>Fecha Desde:</label>
            <input 
              type="date" 
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
            />
          </div>

          <div className="ordenes-compra-filtro-grupo">
            <label>Fecha Hasta:</label>
            <input 
              type="date" 
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
            />
          </div>

          <div className="ordenes-compra-filtro-grupo">
            <label>Proveedor:</label>
            <select 
              value={filtros.proveedor} 
              onChange={(e) => setFiltros({...filtros, proveedor: e.target.value})}
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map(proveedor => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="ordenes-compra-filtro-grupo">
            <label>Estado:</label>
            <select 
              value={filtros.estado} 
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
            >
              <option value="">Todos los estados</option>
              {estadosDisponibles.map(estado => (
                <option key={estado} value={estado}>
                  {getEstadoTexto(estado)}
                </option>
              ))}
            </select>
          </div>

        
          
        </div>

        <div className="ordenes-compra-filtros-acciones">
          <button onClick={limpiarFiltros} className="ordenes-compra-btn-limpiar">
            Limpiar Filtros
          </button>
          <button onClick={exportarReporte} className="ordenes-compra-btn-exportar" disabled={ordenes.length === 0}>
            <Download size={16} /> Exportar Excel
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="ordenes-compra-resumen-section">
        <div className="ordenes-compra-resumen-card">
          <div className="ordenes-compra-resumen-item">
            <ShoppingCart className="ordenes-compra-resumen-icon" />
            <div>
              <span className="ordenes-compra-resumen-valor">{totalOrdenes}</span>
              <span className="ordenes-compra-resumen-label">Total Órdenes</span>
            </div>
          </div>
          <div className="ordenes-compra-resumen-item">
            <DollarSign className="ordenes-compra-resumen-icon" />
            <div>
              <span className="ordenes-compra-resumen-valor">S/ {montoTotalOrdenes.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
              <span className="ordenes-compra-resumen-label">Monto Total</span>
            </div>
          </div>
          <div className="ordenes-compra-resumen-item">
            <Clock className="ordenes-compra-resumen-icon warning" />
            <div>
              <span className="ordenes-compra-resumen-valor">{ordenesPendientes}</span>
              <span className="ordenes-compra-resumen-label">Pendientes</span>
            </div>
          </div>
          <div className="ordenes-compra-resumen-item">
            <Package className="ordenes-compra-resumen-icon success" />
            <div>
              <span className="ordenes-compra-resumen-valor">{ordenesCompletadas}</span>
              <span className="ordenes-compra-resumen-label">Completadas</span>
            </div>
          </div>
          <div className="ordenes-compra-resumen-item">
            <Calendar className="ordenes-compra-resumen-icon" />
            <div>
              <span className="ordenes-compra-resumen-valor">S/ {promedioMonto.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
              <span className="ordenes-compra-resumen-label">Promedio por Orden</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Órdenes */}
      <div className="ordenes-compra-tabla-section">
        <h3>Detalle de Órdenes de Compra ({ordenesFiltradas.length})</h3>
        <div className="ordenes-compra-tabla-container">
          {ordenesFiltradas.length === 0 ? (
            <div className="ordenes-compra-no-data">
              <p>No se encontraron órdenes de compra con los filtros aplicados.</p>
              {error && (
                <button onClick={cargarOrdenes} className="ordenes-compra-btn-reintentar">
                  Reintentar carga
                </button>
              )}
            </div>
          ) : (
            <table className="ordenes-compra-reportes-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Estado</th>
                  <th>Monto Total</th>
                  <th>Items</th>
                  <th>Fecha Entrega</th>
                  <th>Fecha Vencimiento</th>
                  <th>Responsable</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenesFiltradas.map(orden => (
                  <tr key={orden.id}>
                    <td><strong>{orden.numero}</strong></td>
                    <td>{new Date(orden.fecha).toLocaleDateString('es-PE')}</td>
                    <td>{orden.proveedor}</td>
                    <td>
                      <span className={`ordenes-compra-estado-badge ordenes-compra-estado-${getEstadoColor(orden.estado)}`}>
                        {getEstadoTexto(orden.estado)}
                      </span>
                    </td>
                    <td>S/ {orden.montoTotal.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                    <td>{orden.cantidadItems}</td>
                    <td>{new Date(orden.fechaEntrega).toLocaleDateString('es-PE')}</td>
                    <td>{new Date(orden.fechaVencimiento).toLocaleDateString('es-PE')}</td>
                    <td>{orden.responsable}</td>
                    <td>{orden.observaciones}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdenesCompraReporte;