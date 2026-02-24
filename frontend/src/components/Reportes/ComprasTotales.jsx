import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Filter, Calendar, Building2, CheckCircle } from 'lucide-react';
import { obtenerReporteComprasTotales } from '../../services/compraService';
import { obtenerProveedores } from '../../services/proveedorService';
import '../../styles/ReporteComprastotales.css';

const ComprasTotales = ({ onBack }) => {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    totalCompras: 0,
    montoTotal: 0,
    promedioPorCompra: 0
  });
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    proveedorId: '',
    estado: ''
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar proveedores para el filtro
      const responseProveedores = await obtenerProveedores();
      setProveedores(responseProveedores.proveedores || []);
      
      // Cargar compras iniciales
      await cargarCompras();
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      setError('Error al cargar los datos. Verifique la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const cargarCompras = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar filtros para la API
      const filtrosApi = {};
      if (filtros.fechaInicio) filtrosApi.fechaInicio = filtros.fechaInicio;
      if (filtros.fechaFin) filtrosApi.fechaFin = filtros.fechaFin;
      if (filtros.proveedorId) filtrosApi.proveedorId = filtros.proveedorId;
      if (filtros.estado) filtrosApi.estado = filtros.estado;
      
      const response = await obtenerReporteComprasTotales(filtrosApi);
      
      setCompras(response.compras || []);
      setEstadisticas(response.estadisticas || {
        totalCompras: 0,
        montoTotal: 0,
        promedioPorCompra: 0
      });
    } catch (error) {
      console.error('Error al cargar compras:', error);
      setError('Error al cargar las compras. Verifique la conexión con el servidor.');
      // En caso de error, mostrar datos vacíos
      setCompras([]);
      setEstadisticas({
        totalCompras: 0,
        montoTotal: 0,
        promedioPorCompra: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const aplicarFiltros = async () => {
    await cargarCompras();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      proveedorId: '',
      estado: ''
    });
    // Recargar datos sin filtros
    setTimeout(() => cargarCompras(), 100);
  };

  const exportarReporte = () => {
    try {
      // Crear CSV con los datos actuales
      const headers = ['Número', 'Fecha', 'Proveedor', 'Estado', 'Subtotal', 'IGV', 'Total'];
      const csvContent = [
        headers.join(','),
        ...compras.map(compra => [
          compra.numero || compra.numeroComprobante || '',
          compra.fechaCompra || compra.fecha || '',
          compra.Proveedor?.nombre || compra.proveedor || '',
          compra.estado || '',
          compra.subtotal || '',
          compra.igv || '',
          compra.total || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_compras_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar reporte:', error);
    }
  };

  if (loading) {
    return (
      <div className="compras-reportes-container">
        <div className="compras-loading-spinner">Cargando reporte de compras...</div>
      </div>
    );
  }

  return (
    <div className="compras-reportes-container">
      {/* Header */}
      <div className="compras-reportes-header">
        <button onClick={onBack} className="compras-back-button">
          <ArrowLeft size={20} />
        </button>
        <span className="compras-home-icon">🏠</span>
        <span className="compras-breadcrumb">REPORTES</span>
        <span className="compras-separator">/</span>
        <span className="compras-breadcrumb">COMPRAS</span>
        <span className="compras-separator">/</span>
        <span className="compras-breadcrumb active">COMPRAS TOTALES</span>
      </div>

      {/* Filtros */}
      <div className="compras-filtros-section">
        <h3>Filtros de Búsqueda</h3>
        <div className="compras-filtros-grid">
          <div className="compras-filtro-item">
            <label>Fecha Inicio:</label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
            />
          </div>
          <div className="compras-filtro-item">
            <label>Fecha Fin:</label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
            />
          </div>
          <div className="compras-filtro-item">
            <label>Proveedor:</label>
            <select
              value={filtros.proveedorId}
              onChange={(e) => handleFiltroChange('proveedorId', e.target.value)}
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map(proveedor => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="compras-filtro-item">
            <label>Estado:</label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="COMPLETADA">Completada</option>
              <option value="ANULADA">Anulada</option>
              <option value="EN_PROCESO">En Proceso</option>
            </select>
          </div>
        </div>
        <div className="compras-filtros-actions">
          <button onClick={aplicarFiltros} className="compras-btn-filtrar" disabled={loading}>
            <Filter size={16} /> {loading ? 'Aplicando...' : 'Aplicar Filtros'}
          </button>
          <button onClick={limpiarFiltros} className="compras-btn-limpiar" disabled={loading}>
            Limpiar
          </button>
          <button onClick={exportarReporte} className="compras-btn-exportar" disabled={loading || compras.length === 0}>
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="compras-error-message">
          <p>{error}</p>
          <button onClick={cargarDatosIniciales} className="compras-btn-reintentar">
            Reintentar
          </button>
        </div>
      )}

      {/* Resumen */}
      <div className="compras-resumen-section">
        <div className="compras-resumen-card">
          <div className="compras-resumen-icon">
            <CheckCircle size={24} />
          </div>
          <div className="compras-resumen-content">
            <h4>Total de Compras</h4>
            <p className="compras-resumen-numero">{estadisticas.totalCompras}</p>
          </div>
        </div>
        <div className="compras-resumen-card">
          <div className="compras-resumen-icon">
            <Building2 size={24} />
          </div>
          <div className="compras-resumen-content">
            <h4>Monto Total</h4>
            <p className="compras-resumen-numero">S/ {estadisticas.montoTotal.toFixed(2)}</p>
          </div>
        </div>
        <div className="compras-resumen-card">
          <div className="compras-resumen-icon">
            <Calendar size={24} />
          </div>
          <div className="compras-resumen-content">
            <h4>Promedio por Compra</h4>
            <p className="compras-resumen-numero">
              S/ {estadisticas.promedioPorCompra.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Compras */}
      <div className="compras-tabla-section">
        <h3>Detalle de Compras ({compras.length})</h3>
        {loading ? (
          <div className="compras-loading-tabla">
            <div className="compras-loading-spinner"></div>
            <p>Cargando compras...</p>
          </div>
        ) : (
          <div className="compras-tabla-container">
            <table className="compras-reportes-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Subtotal</th>
                  <th>IGV</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {compras.map(compra => (
                  <tr key={compra.id}>
                    <td>{compra.numeroComprobante || compra.numero || `${compra.serieComprobante || ''}-${compra.numeroComprobante || ''}`}</td>
                    <td>{new Date(compra.fechaCompra || compra.fecha).toLocaleDateString('es-PE')}</td>
                    <td>{compra.Proveedor?.nombre || compra.proveedor || 'Sin proveedor'}</td>
                    <td>{compra.tipoComprobante || 'N/A'}</td>
                    <td>
                      <span className={`compras-estado-badge compras-estado-${(compra.estado || '').toLowerCase().replace('_', '-')}`}>
                        {compra.estado || 'Sin estado'}
                      </span>
                    </td>
                    <td>S/ {parseFloat(compra.subtotal || 0).toFixed(2)}</td>
                    <td>S/ {parseFloat(compra.igv || 0).toFixed(2)}</td>
                    <td className="compras-total-cell">S/ {parseFloat(compra.total || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {compras.length === 0 && !loading && (
              <div className="compras-no-data">
                <p>No se encontraron compras con los filtros aplicados.</p>
                {error && (
                  <button onClick={cargarDatosIniciales} className="compras-btn-reintentar">
                    Reintentar carga
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprasTotales;