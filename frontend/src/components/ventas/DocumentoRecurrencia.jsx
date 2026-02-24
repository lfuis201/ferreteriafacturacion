import React from 'react';
import { useDocumentosRecurrencia } from '../../hooks/useDocumentosRecurrencia';
import '../../styles/DocumentoRecurrencia.css';

const DocumentoRecurrencia = () => {
  const {
    documentos,
    loading,
    error,
    filtros,
    paginacion,
    actualizarFiltros,
    buscar,
    cambiarPagina,
    refrescar
  } = useDocumentosRecurrencia();

  const handleFechaEmisionChange = (e) => {
    actualizarFiltros({ fechaEmision: e.target.value });
  };

  const handleBusquedaChange = (e) => {
    actualizarFiltros({ busqueda: e.target.value });
  };

  const handleBuscar = () => {
    buscar();
  };

  const handleRefrescar = () => {
    refrescar();
  };

  return (
    <div className="doc-recurrencia-container">
      {/* Header con alerta */}
      <div className="doc-recurrencia-header">
        <div className="doc-recurrencia-alert">
         
          <span className="doc-recurrencia-alert-text">
            DOCUMENTOS DE RECURRENCIA
          </span>
        </div>
      </div>

      {/* Título */}
      <div className="doc-recurrencia-title-section">
        <h2 className="doc-recurrencia-title">Documentos de Recurrencia</h2>
        {loading && <span className="doc-recurrencia-loading">Cargando...</span>}
        {error && <span className="doc-recurrencia-error">Error: {error}</span>}
      </div>

      {/* Filtros de búsqueda */}
      <div className="doc-recurrencia-filtros">
        <div className="doc-recurrencia-filtro-fecha">
          <select 
            className="doc-recurrencia-select"
            value={filtros.fechaEmision}
            onChange={handleFechaEmisionChange}
            disabled={loading}
          >
            <option value="">Fecha de emisión</option>
            <option value="hoy">Hoy</option>
            <option value="esta-semana">Esta semana</option>
            <option value="este-mes">Este mes</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>

        <div className="doc-recurrencia-filtro-busqueda">
          <input
            type="text"
            className="doc-recurrencia-input-buscar"
            placeholder="Buscar por serie, número o cliente"
            value={filtros.busqueda}
            onChange={handleBusquedaChange}
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
          />
        </div>

        <button 
          className="doc-recurrencia-btn-buscar"
          onClick={handleBuscar}
          disabled={loading}
        >
          🔍 {loading ? 'Buscando...' : 'Buscar'}
        </button>

        <button 
          className="doc-recurrencia-btn-refrescar"
          onClick={handleRefrescar}
          disabled={loading}
          title="Refrescar datos"
        >
          🔄 Refrescar
        </button>
      </div>

      {/* Tabla de documentos */}
      <div className="doc-recurrencia-table-wrapper">
        <table className="doc-recurrencia-table">
          <thead className="doc-recurrencia-table-head">
            <tr>
              <th className="doc-recurrencia-th">#</th>
              <th className="doc-recurrencia-th">Documento</th>
              <th className="doc-recurrencia-th">Cliente</th>
              <th className="doc-recurrencia-th">Fecha Emisión</th>
              <th className="doc-recurrencia-th">Total</th>
              <th className="doc-recurrencia-th">Estado</th>
              <th className="doc-recurrencia-th">Frecuencia</th>
              <th className="doc-recurrencia-th">Próxima Emisión</th>
            </tr>
          </thead>
          <tbody className="doc-recurrencia-table-body">
            {loading ? (
              <tr>
                <td colSpan="8" className="doc-recurrencia-empty">
                  <div className="doc-recurrencia-empty-content">
                    Cargando documentos...
                  </div>
                </td>
              </tr>
            ) : documentos.length === 0 ? (
              <tr>
                <td colSpan="8" className="doc-recurrencia-empty">
                  <div className="doc-recurrencia-empty-content">
                    {error ? 'Error al cargar documentos' : `Total: 0 documentos`}
                  </div>
                </td>
              </tr>
            ) : (
              documentos.map((doc, index) => (
                <tr key={doc.id || index} className="doc-recurrencia-table-row">
                  <td className="doc-recurrencia-td">{((paginacion.page - 1) * paginacion.limit) + index + 1}</td>
                  <td className="doc-recurrencia-td">
                    <div className="doc-recurrencia-documento">
                      <span className="doc-recurrencia-tipo">{doc.tipoDocumento === '01' ? 'Factura' : doc.tipoDocumento === '03' ? 'Boleta' : 'Documento'}</span>
                      <span className="doc-recurrencia-numero">{doc.serie}-{doc.numero}</span>
                    </div>
                  </td>
                  <td className="doc-recurrencia-td">
                    <div className="doc-recurrencia-cliente">
                      <span className="doc-recurrencia-cliente-nombre">{doc.cliente?.nombre || 'Sin cliente'}</span>
                      <span className="doc-recurrencia-cliente-doc">{doc.cliente?.documento || ''}</span>
                    </div>
                  </td>
                  <td className="doc-recurrencia-td">{new Date(doc.fechaEmision).toLocaleDateString('es-PE')}</td>
                  <td className="doc-recurrencia-td">
                    <span className="doc-recurrencia-total">S/ {doc.total.toFixed(2)}</span>
                  </td>
                  <td className="doc-recurrencia-td">
                    <span className={`doc-recurrencia-estado doc-recurrencia-estado-${doc.estado}`}>
                      {doc.estado}
                    </span>
                  </td>
                  <td className="doc-recurrencia-td">
                    <span className="doc-recurrencia-frecuencia">{doc.frecuencia}</span>
                  </td>
                  <td className="doc-recurrencia-td">
                    <span className="doc-recurrencia-proxima">
                      {doc.proximaFecha ? new Date(doc.proximaFecha).toLocaleDateString('es-PE') : 'No programada'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer con paginación */}
        <div className="doc-recurrencia-footer">
          <div className="doc-recurrencia-info">
            <span className="doc-recurrencia-total-info">
              Total: {paginacion.total} documentos | 
              Página {paginacion.page} de {paginacion.totalPages}
            </span>
          </div>
          <div className="doc-recurrencia-pagination">
            <button 
              className="doc-recurrencia-pagination-btn" 
              disabled={paginacion.page <= 1 || loading}
              onClick={() => cambiarPagina(paginacion.page - 1)}
            >
              ‹
            </button>
            
            {/* Mostrar páginas */}
            {Array.from({ length: Math.min(5, paginacion.totalPages) }, (_, i) => {
              let pageNumber;
              if (paginacion.totalPages <= 5) {
                pageNumber = i + 1;
              } else if (paginacion.page <= 3) {
                pageNumber = i + 1;
              } else if (paginacion.page >= paginacion.totalPages - 2) {
                pageNumber = paginacion.totalPages - 4 + i;
              } else {
                pageNumber = paginacion.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNumber}
                  className={`doc-recurrencia-pagination-btn ${
                    pageNumber === paginacion.page ? 'doc-recurrencia-pagination-active' : ''
                  }`}
                  onClick={() => cambiarPagina(pageNumber)}
                  disabled={loading}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button 
              className="doc-recurrencia-pagination-btn" 
              disabled={paginacion.page >= paginacion.totalPages || loading}
              onClick={() => cambiarPagina(paginacion.page + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentoRecurrencia;