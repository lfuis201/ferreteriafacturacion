import React, { useState, useEffect } from 'react';
import { obtenerComprobantesPendientesRectificacion, reenviarVentaSunat } from '../../services/ventaService';
import { obtenerSucursales } from '../../services/sucursalService';
import apiClient from '../../services/apiService';
import '../../styles/CPErectificar.css';

const CPErectificar = () => {
  // Obtener datos del usuario desde localStorage
  const getUsuario = () => {
    const usuarioData = localStorage.getItem('usuario');
    return usuarioData ? JSON.parse(usuarioData) : null;
  };
  
  const usuario = getUsuario();
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    sucursalId: '',
    fechaInicio: '',
    fechaFin: '',
    tipoComprobante: '',
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

  // Estado para resumen
  const [resumen, setResumen] = useState({
    totalComprobantes: 0,
    rechazados: 0,
    conError: 0,
    facturas: 0,
    boletas: 0
  });

  // Cargar sucursales al montar el componente
  useEffect(() => {
    cargarSucursales();
    cargarComprobantes();
  }, []);

  // Cargar comprobantes cuando cambien los filtros o la página
  useEffect(() => {
    cargarComprobantes();
  }, [paginacion.currentPage]);

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
      const filtrosConPaginacion = {
        ...filtros,
        page: paginacion.currentPage,
        limit: paginacion.itemsPerPage
      };

      const response = await obtenerComprobantesPendientesRectificacion(filtrosConPaginacion);
      
      if (response.success) {
        setComprobantes(response.data || []);
        setPaginacion(response.pagination || paginacion);
        setResumen(response.resumen || resumen);
      } else {
        setComprobantes([]);
        console.error(response.mensaje || 'Error al cargar comprobantes');
      }
    } catch (error) {
      console.error('Error al cargar comprobantes:', error);
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
  };

  const aplicarFiltros = () => {
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
    cargarComprobantes();
  };

  const limpiarFiltros = () => {
    setFiltros({
      sucursalId: '',
      fechaInicio: '',
      fechaFin: '',
      tipoComprobante: '',
      serie: '',
      numero: ''
    });
    setPaginacion(prev => ({ ...prev, currentPage: 1 }));
    setTimeout(() => cargarComprobantes(), 100);
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPages) {
      setPaginacion(prev => ({ ...prev, currentPage: nuevaPagina }));
    }
  };

  const consultarCDR = async (comprobante) => {
    try {
      if (!comprobante.id) {
        alert('ID de comprobante no válido');
        return;
      }

      console.log(`Descargando CDR para ${comprobante.tipoComprobante} ${comprobante.serie}-${comprobante.numero}...`);
      
      // Descargar CDR usando la API existente
      const response = await apiClient.get(`/ventas/${comprobante.id}/cdr`, {
        responseType: 'blob'
      });

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `CDR_${comprobante.serie}-${comprobante.numero}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('CDR descargado exitosamente');
    } catch (error) {
      console.error('Error al consultar CDR:', error);
      if (error.response?.status === 404) {
        alert('CDR no disponible para este comprobante');
      } else {
        alert('Error al descargar CDR: ' + (error.response?.data?.mensaje || error.message));
      }
    }
  };

  const enviarComprobante = async (comprobante) => {
    try {
      if (!comprobante.id) {
        alert('ID de comprobante no válido');
        return;
      }

      // Confirmar acción
      if (!window.confirm(`¿Está seguro de reenviar el comprobante ${comprobante.tipoComprobante} ${comprobante.serie}-${comprobante.numero} a SUNAT?`)) {
        return;
      }

      console.log(`Reenviando ${comprobante.tipoComprobante} ${comprobante.serie}-${comprobante.numero} a SUNAT...`);
      
      // Reenviar usando el servicio existente
      const response = await reenviarVentaSunat(comprobante.id);
      
      if (response.success || response.mensaje?.includes('exitoso')) {
        alert('Comprobante reenviado exitosamente a SUNAT');
        // Recargar la lista para actualizar estados
        setTimeout(() => {
          cargarComprobantes();
        }, 1000);
      } else {
        alert(response.mensaje || 'Error al reenviar comprobante');
      }
    } catch (error) {
      console.error('Error al enviar comprobante:', error);
      alert('Error al reenviar comprobante: ' + (error.response?.data?.mensaje || error.message));
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="cpe-rectificar-container">
      {/* Header con alerta */}
      <div className="cpe-rectificar-header">
        <div className="cpe-rectificar-alert">
          <span className="cpe-rectificar-alert-icon">⚠️</span>
          <span className="cpe-rectificar-alert-text">
            COMPROBANTES PENDIENTES DE RECTIFICACIÓN
          </span>
        </div>
      </div>

      {/* Sección de filtros */}
      <div className="cpe-rectificar-filtros-section">
        <div className="cpe-rectificar-filtros-header">
          <h3 className="cpe-rectificar-filtros-title">Filtros de búsqueda</h3>
          <button 
            className="cpe-rectificar-filtros-toggle"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            {mostrarFiltros ? '[-' : '[+'} Ver más]
          </button>
        </div>

        {mostrarFiltros && (
          <div className="cpe-rectificar-filtros-content">
            <div className="cpe-rectificar-filtros-grid">
              {/* Sucursal */}
              <div className="cpe-rectificar-filtro-grupo">
                <label className="cpe-rectificar-filtro-label">Sucursal:</label>
                <select
                  className="cpe-rectificar-filtro-input"
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
              <div className="cpe-rectificar-filtro-grupo">
                <label className="cpe-rectificar-filtro-label">Fecha Inicio:</label>
                <input
                  type="date"
                  className="cpe-rectificar-filtro-input"
                  value={filtros.fechaInicio}
                  onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                />
              </div>

              {/* Fecha Fin */}
              <div className="cpe-rectificar-filtro-grupo">
                <label className="cpe-rectificar-filtro-label">Fecha Fin:</label>
                <input
                  type="date"
                  className="cpe-rectificar-filtro-input"
                  value={filtros.fechaFin}
                  onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                />
              </div>

              {/* Tipo Comprobante */}
              <div className="cpe-rectificar-filtro-grupo">
                <label className="cpe-rectificar-filtro-label">Tipo:</label>
                <select
                  className="cpe-rectificar-filtro-input"
                  value={filtros.tipoComprobante}
                  onChange={(e) => handleFiltroChange('tipoComprobante', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="FACTURA">Factura</option>
                  <option value="BOLETA">Boleta</option>
                </select>
              </div>

              {/* Serie */}
              <div className="cpe-rectificar-filtro-grupo">
                <label className="cpe-rectificar-filtro-label">Serie:</label>
                <input
                  type="text"
                  className="cpe-rectificar-filtro-input"
                  placeholder="Ej: FTR1"
                  value={filtros.serie}
                  onChange={(e) => handleFiltroChange('serie', e.target.value)}
                />
              </div>

              {/* Número */}
              <div className="cpe-rectificar-filtro-grupo">
                <label className="cpe-rectificar-filtro-label">Número:</label>
                <input
                  type="text"
                  className="cpe-rectificar-filtro-input"
                  placeholder="Ej: 000001"
                  value={filtros.numero}
                  onChange={(e) => handleFiltroChange('numero', e.target.value)}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="cpe-rectificar-filtros-acciones">
              <button 
                className="cpe-rectificar-btn-aplicar"
                onClick={aplicarFiltros}
                disabled={loading}
              >
                {loading ? 'Buscando...' : 'Aplicar Filtros'}
              </button>
              <button 
                className="cpe-rectificar-btn-limpiar"
                onClick={limpiarFiltros}
                disabled={loading}
              >
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de comprobantes */}
      <div className="cpe-rectificar-table-wrapper">
        {loading && (
          <div className="cpe-rectificar-loading">
            <div className="cpe-rectificar-loading-spinner"></div>
            <span>Cargando comprobantes...</span>
          </div>
        )}

        <table className="cpe-rectificar-table">
          <thead className="cpe-rectificar-table-head">
            <tr>
              <th className="cpe-rectificar-th">#</th>
              <th className="cpe-rectificar-th">Entorno</th>
              <th className="cpe-rectificar-th">Usuario</th>
              <th className="cpe-rectificar-th">F. Emisión</th>
              <th className="cpe-rectificar-th">Cliente</th>
              <th className="cpe-rectificar-th">Comprobante</th>
              <th className="cpe-rectificar-th">Descripción</th>
              <th className="cpe-rectificar-th">
                Consultar CDR 
                <span className="cpe-rectificar-info-icon" title="Consultar Constancia de Recepción">ℹ</span>
              </th>
              <th className="cpe-rectificar-th">Enviar</th>
            </tr>
          </thead>
          <tbody className="cpe-rectificar-table-body">
            {!loading && comprobantes.length === 0 ? (
              <tr>
                <td colSpan="9" className="cpe-rectificar-empty">
                  <div className="cpe-rectificar-empty-content">
                    Total 0
                  </div>
                </td>
              </tr>
            ) : (
              comprobantes.map((comp, index) => (
                <tr key={comp.id || index} className="cpe-rectificar-table-row">
                  <td className="cpe-rectificar-td">{((paginacion.currentPage - 1) * paginacion.itemsPerPage) + index + 1}</td>
                  <td className="cpe-rectificar-td">{comp.entorno || 'PRODUCCIÓN'}</td>
                  <td className="cpe-rectificar-td">{comp.usuario || '-'}</td>
                  <td className="cpe-rectificar-td">{formatearFecha(comp.fechaEmision)}</td>
                  <td className="cpe-rectificar-td" title={comp.clienteNombre}>
                    {comp.clienteNombre ? 
                      (comp.clienteNombre.length > 30 ? 
                        comp.clienteNombre.substring(0, 30) + '...' : 
                        comp.clienteNombre
                      ) : '-'
                    }
                  </td>
                  <td className="cpe-rectificar-td">
                    {comp.tipoComprobante} {comp.serie}-{comp.numero}
                  </td>
                  <td className="cpe-rectificar-td" title={comp.descripcionError}>
                    <span className={`cpe-rectificar-estado ${comp.estadoSunat?.toLowerCase()}`}>
                      {comp.estadoSunat || 'ERROR'}
                    </span>
                    {comp.descripcionError && (
                      <div className="cpe-rectificar-error-desc">
                        {comp.descripcionError.length > 50 ? 
                          comp.descripcionError.substring(0, 50) + '...' : 
                          comp.descripcionError
                        }
                      </div>
                    )}
                  </td>
                  <td className="cpe-rectificar-td">
                    <button 
                      className="cpe-rectificar-btn-consultar"
                      onClick={() => consultarCDR(comp)}
                      disabled={loading}
                    >
                      Consultar
                    </button>
                  </td>
                  <td className="cpe-rectificar-td">
                    <button 
                      className="cpe-rectificar-btn-enviar"
                      onClick={() => enviarComprobante(comp)}
                      disabled={loading}
                    >
                      Enviar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer con paginación */}
        <div className="cpe-rectificar-footer">
          <div className="cpe-rectificar-resumen">
            <span>
              Total: {resumen.totalComprobantes} | 
              Rechazados: {resumen.rechazados} | 
              Con Error: {resumen.conError} | 
              Facturas: {resumen.facturas} | 
              Boletas: {resumen.boletas}
            </span>
          </div>
          
          <div className="cpe-rectificar-pagination">
            <button 
              className="cpe-rectificar-pagination-btn"
              onClick={() => cambiarPagina(1)}
              disabled={paginacion.currentPage === 1 || loading}
            >
              ‹‹
            </button>
            <button 
              className="cpe-rectificar-pagination-btn"
              onClick={() => cambiarPagina(paginacion.currentPage - 1)}
              disabled={!paginacion.hasPrevPage || loading}
            >
              ‹
            </button>
            
            <span className="cpe-rectificar-pagination-info">
              Página {paginacion.currentPage} de {paginacion.totalPages}
              {paginacion.totalItems > 0 && (
                <span> ({paginacion.totalItems} registros)</span>
              )}
            </span>
            
            <button 
              className="cpe-rectificar-pagination-btn"
              onClick={() => cambiarPagina(paginacion.currentPage + 1)}
              disabled={!paginacion.hasNextPage || loading}
            >
              ›
            </button>
            <button 
              className="cpe-rectificar-pagination-btn"
              onClick={() => cambiarPagina(paginacion.totalPages)}
              disabled={paginacion.currentPage === paginacion.totalPages || loading}
            >
              ››
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CPErectificar;