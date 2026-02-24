import React, { useState, useEffect } from 'react';
import { obtenerComprobantesNoEnviados } from '../../services/ventaService';
import { obtenerSucursales } from '../../services/sucursalService';
import '../../styles/ComprobantesNoEnviados.css';

const ComprobantesNoEnviados = () => {
  // Estados para UI
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Estados para datos
  const [comprobantes, setComprobantes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    sucursalId: '',
    fechaInicio: '',
    fechaFin: '',
    tipoComprobante: 'TODOS',
    serie: '',
    numero: ''
  });
  
  // Estados para paginación
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Estados para resumen
  const [resumen, setResumen] = useState({
    totalComprobantes: 0,
    pendientes: 0,
    conError: 0,
    rechazados: 0
  });

  // Cargar sucursales al montar el componente
  useEffect(() => {
    cargarSucursales();
  }, []);

  // Cargar comprobantes cuando cambien los filtros o la página
  useEffect(() => {
    cargarComprobantes();
  }, [filtros, paginacion.currentPage]);

  const cargarSucursales = async () => {
    try {
      const response = await obtenerSucursales();
      setSucursales(response.data || []);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  const cargarComprobantes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filtrosConPaginacion = {
        ...filtros,
        page: paginacion.currentPage,
        limit: paginacion.itemsPerPage
      };
      
      const response = await obtenerComprobantesNoEnviados(filtrosConPaginacion);
      
      if (response.success) {
        setComprobantes(response.data || []);
        setPaginacion(response.pagination || paginacion);
        setResumen(response.resumen || resumen);
      } else {
        setError(response.mensaje || 'Error al cargar comprobantes');
        setComprobantes([]);
      }
    } catch (error) {
      console.error('Error al cargar comprobantes:', error);
      setError('Error al cargar comprobantes no enviados');
      setComprobantes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    // Resetear a la primera página cuando cambien los filtros
    setPaginacion(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      sucursalId: '',
      fechaInicio: '',
      fechaFin: '',
      tipoComprobante: 'TODOS',
      serie: '',
      numero: ''
    });
    setPaginacion(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPages) {
      setPaginacion(prev => ({
        ...prev,
        currentPage: nuevaPagina
      }));
    }
  };

  const obtenerBadgeEstado = (estado) => {
    const badges = {
      'PENDIENTE': 'estado-pendiente',
      'ERROR': 'estado-error',
      'RECHAZADO': 'estado-rechazado',
      'ENVIADO': 'estado-enviado'
    };
    return badges[estado] || 'estado-desconocido';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE');
  };

  const formatearMoneda = (monto, moneda = 'PEN') => {
    const simbolo = moneda === 'USD' ? '$' : 'S/';
    return `${simbolo} ${parseFloat(monto || 0).toFixed(2)}`;
  };

  const handleReenviarComprobante = async (comprobanteId) => {
    try {
      // TODO: Implementar servicio de reenvío
      console.log('Reenviando comprobante:', comprobanteId);
      alert(`Reenviando comprobante ${comprobanteId} a SUNAT...`);
    } catch (error) {
      console.error('Error al reenviar comprobante:', error);
      alert('Error al reenviar comprobante');
    }
  };

  const handleVerDetalles = (comprobante) => {
    // TODO: Implementar modal de detalles
    console.log('Ver detalles:', comprobante);
    alert(`Detalles del comprobante: ${comprobante.comprobante}`);
  };

  return (
    <div className="comprobantes-container">
      {/* Header con alerta 
      <div className="comprobantes-header">
        <div className="comprobantes-alert">
          <span className="comprobantes-alert-icon">⚠️</span>
          <span className="comprobantes-alert-text">
            COMPROBANTES NO ENVIADOS A SUNAT - Revise los errores y tome las acciones necesarias
          </span>
        </div>
      </div>*/}

      {/* Sección de filtros */}
      <div className="comprobantes-filtros-section">
        <div className="comprobantes-filtros-header">
          <h3 className="comprobantes-filtros-title">Filtros de búsqueda</h3>
          <button 
            className="comprobantes-filtros-toggle"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            {mostrarFiltros ? '[-' : '[+'} Ver más]
          </button>
        </div>

        {mostrarFiltros && (
          <div className="comprobantes-filtros-content">
            <div className="filtros-grid">
              {/* Sucursal */}
              <div className="filtro-group">
                <label className="filtro-label">Sucursal</label>
                <select 
                  className="filtro-select"
                  value={filtros.sucursalId}
                  onChange={(e) => handleFiltroChange('sucursalId', e.target.value)}
                >
                  <option value="">Todas las sucursales</option>
                  {sucursales.map(sucursal => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha Inicio */}
              <div className="filtro-group">
                <label className="filtro-label">Fecha Inicio</label>
                <input 
                  type="date" 
                  className="filtro-input"
                  value={filtros.fechaInicio}
                  onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                />
              </div>

              {/* Fecha Fin */}
              <div className="filtro-group">
                <label className="filtro-label">Fecha Fin</label>
                <input 
                  type="date" 
                  className="filtro-input"
                  value={filtros.fechaFin}
                  onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                />
              </div>

              {/* Tipo Comprobante */}
              <div className="filtro-group">
                <label className="filtro-label">Tipo</label>
                <select 
                  className="filtro-select"
                  value={filtros.tipoComprobante}
                  onChange={(e) => handleFiltroChange('tipoComprobante', e.target.value)}
                >
                  <option value="TODOS">Todos</option>
                  <option value="FACTURA">Facturas</option>
                  <option value="BOLETA">Boletas</option>
                </select>
              </div>

              {/* Serie */}
              <div className="filtro-group">
                <label className="filtro-label">Serie</label>
                <input 
                  type="text" 
                  className="filtro-input"
                  placeholder="F001"
                  value={filtros.serie}
                  onChange={(e) => handleFiltroChange('serie', e.target.value)}
                />
              </div>

              {/* Número */}
              <div className="filtro-group">
                <label className="filtro-label">Número</label>
                <div className="filtro-input-group">
                  <input 
                    type="text" 
                    className="filtro-input"
                    placeholder="123456"
                    value={filtros.numero}
                    onChange={(e) => handleFiltroChange('numero', e.target.value)}
                  />
                  <button 
                    className="filtro-limpiar" 
                    onClick={limpiarFiltros}
                    title="Limpiar filtros"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resumen de estados */}
      {resumen.totalComprobantes > 0 && (
        <div className="comprobantes-resumen">
          <div className="resumen-grid">
            <div className="resumen-item resumen-total">
              <div className="resumen-content">
                <div className="resumen-texto">
                  <div className="resumen-valor">{resumen.totalComprobantes}</div>
                  <div className="resumen-label">Total</div>
                </div>
                <div className="resumen-icono">📄</div>
              </div>
            </div>
            <div className="resumen-item resumen-pendientes">
              <div className="resumen-content">
                <div className="resumen-texto">
                  <div className="resumen-valor">{resumen.pendientes}</div>
                  <div className="resumen-label">Pendientes</div>
                </div>
                <div className="resumen-icono">⏰</div>
              </div>
            </div>
            <div className="resumen-item resumen-error">
              <div className="resumen-content">
                <div className="resumen-texto">
                  <div className="resumen-valor">{resumen.conError}</div>
                  <div className="resumen-label">Con Error</div>
                </div>
                <div className="resumen-icono">⚠️</div>
              </div>
            </div>
            <div className="resumen-item resumen-rechazados">
              <div className="resumen-content">
                <div className="resumen-texto">
                  <div className="resumen-valor">{resumen.rechazados}</div>
                  <div className="resumen-label">Rechazados</div>
                </div>
                <div className="resumen-icono">❌</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de comprobantes */}
      <div className="comprobantes-table-wrapper">
        {loading && (
          <div className="comprobantes-loading">
            <div className="loading-spinner"></div>
            <span>Cargando comprobantes...</span>
          </div>
        )}

        {error && (
          <div className="comprobantes-error">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        <table className="comprobantes-table">
          <thead className="comprobantes-table-head">
            <tr>
              <th className="comprobantes-th">#</th>
              <th className="comprobantes-th">F. Emisión</th>
              <th className="comprobantes-th">Tipo</th>
              <th className="comprobantes-th">Comprobante</th>
              <th className="comprobantes-th">Cliente</th>
              <th className="comprobantes-th">RUC Emisor</th>
              <th className="comprobantes-th">Total</th>
              <th className="comprobantes-th">Estado SUNAT</th>
              <th className="comprobantes-th">Detalle Error</th>
              <th className="comprobantes-th">Acciones</th>
            </tr>
          </thead>
          <tbody className="comprobantes-table-body">
            {!loading && !error && comprobantes.length === 0 ? (
              <tr>
                <td colSpan="10" className="comprobantes-empty">
                  <div className="comprobantes-empty-content">
                    <span>✅ No hay comprobantes pendientes de envío a SUNAT</span>
                  </div>
                </td>
              </tr>
            ) : (
              comprobantes.map((comp, index) => (
                <tr key={comp.id} className="comprobantes-table-row">
                  <td className="comprobantes-td">
                    {((paginacion.currentPage - 1) * paginacion.itemsPerPage) + index + 1}
                  </td>
                  <td className="comprobantes-td">{formatearFecha(comp.fechaEmision)}</td>
                  <td className="comprobantes-td">
                    <span className={`badge-tipo ${comp.tipoComprobante === 'FACTURA' ? 'badge-factura' : 'badge-boleta'}`}>
                      {comp.tipoComprobante}
                    </span>
                  </td>
                  <td className="comprobantes-td">
                    <strong>{comp.comprobante}</strong>
                  </td>
                  <td className="comprobantes-td">
                    <div className="cliente-info">
                      <div className="cliente-nombre">{comp.cliente}</div>
                      <small className="cliente-documento">{comp.clienteDocumento}</small>
                    </div>
                  </td>
                  <td className="comprobantes-td">
                    <div className="emisor-info">
                      <div className="emisor-ruc">{comp.rucEmisor}</div>
                      <small className="emisor-razon-social">{comp.razonSocialEmisor}</small>
                    </div>
                  </td>
                  <td className="comprobantes-td comprobantes-td-monto">
                    {formatearMoneda(comp.total, comp.moneda)}
                  </td>
                  <td className="comprobantes-td">
                    <span className={`estado-badge ${obtenerBadgeEstado(comp.estadoSunat)}`}>
                      {comp.estadoSunat}
                    </span>
                  </td>
                  <td className="comprobantes-td">
                    <div className="detalle-error" title={comp.motivoError}>
                      {comp.motivoError}
                    </div>
                  </td>
                  <td className="comprobantes-td">
                    <div className="acciones-group">
                      <button 
                        className="comprobantes-btn-enviar"
                        onClick={() => handleReenviarComprobante(comp.id)}
                        title="Reenviar a SUNAT"
                      >
                        Enviar
                      </button>
                      <button 
                        className="comprobantes-btn-detalles"
                        onClick={() => handleVerDetalles(comp)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer con paginación */}
        <div className="comprobantes-footer">
          <div className="comprobantes-pagination-info">
            Mostrando {((paginacion.currentPage - 1) * paginacion.itemsPerPage) + 1} a{' '}
            {Math.min(paginacion.currentPage * paginacion.itemsPerPage, paginacion.totalItems)} de{' '}
            {paginacion.totalItems} registros
          </div>
          <div className="comprobantes-pagination">
            <button 
              className="comprobantes-pagination-btn" 
              onClick={() => cambiarPagina(paginacion.currentPage - 1)}
              disabled={!paginacion.hasPrevPage}
            >
              ‹
            </button>
            
            {/* Páginas */}
            {Array.from({ length: Math.min(5, paginacion.totalPages) }, (_, i) => {
              let pageNum;
              if (paginacion.totalPages <= 5) {
                pageNum = i + 1;
              } else if (paginacion.currentPage <= 3) {
                pageNum = i + 1;
              } else if (paginacion.currentPage >= paginacion.totalPages - 2) {
                pageNum = paginacion.totalPages - 4 + i;
              } else {
                pageNum = paginacion.currentPage - 2 + i;
              }
              
              return (
                <button 
                  key={pageNum}
                  className={`comprobantes-pagination-btn ${
                    paginacion.currentPage === pageNum ? 'comprobantes-pagination-active' : ''
                  }`}
                  onClick={() => cambiarPagina(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              className="comprobantes-pagination-btn" 
              onClick={() => cambiarPagina(paginacion.currentPage + 1)}
              disabled={!paginacion.hasNextPage}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprobantesNoEnviados;