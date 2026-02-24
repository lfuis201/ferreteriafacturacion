import React, { useState } from 'react';
import useComprobanteContingencia from '../../hooks/useComprobanteContingencia';
import '../../styles/ComprobanteContingencia.css';

const ComprobanteContingencia = () => {
  // Hook para manejar datos de comprobantes de contingencia
  const {
    comprobantes,
    loading,
    error,
    filtros,
    paginacion,
    resumen,
    actualizarFiltros,
    buscar,
    cambiarPagina,
    refrescar,
    reenviarComprobante,
    descargarArchivo
  } = useComprobanteContingencia();

  // Estados locales para UI
  const [mostrarMenuColumnas, setMostrarMenuColumnas] = useState(false);
  
  // Estado para controlar visibilidad de columnas
  const [columnasVisibles, setColumnasVisibles] = useState({
    usuario: true,
    exportacion: true,
    gratuita: true,
    inafecta: true,
    exonerado: true
  });

  // Manejadores de eventos
  const handleTipoComprobanteChange = (e) => {
    actualizarFiltros({ tipoComprobante: e.target.value });
  };

  const handleBusquedaChange = (e) => {
    actualizarFiltros({ busqueda: e.target.value });
  };

  const handleBuscar = () => {
    console.log('Buscando con filtros:', filtros);
    buscar();
  };

  const handleRefrescar = () => {
    refrescar();
  };

  const handleReenviarComprobante = async (comprobanteId) => {
    if (window.confirm('¿Está seguro de que desea reenviar este comprobante a SUNAT?')) {
      const resultado = await reenviarComprobante(comprobanteId);
      if (resultado.success) {
        alert('Comprobante reenviado exitosamente');
      } else {
        alert(`Error: ${resultado.mensaje}`);
      }
    }
  };

  const handleDescargarArchivo = async (comprobanteId, tipo) => {
    const resultado = await descargarArchivo(comprobanteId, tipo);
    if (!resultado.success) {
      alert(`Error: ${resultado.mensaje}`);
    }
  };

  const toggleColumna = (columna) => {
    setColumnasVisibles(prev => ({
      ...prev,
      [columna]: !prev[columna]
    }));
  };

  // Calcular número de columnas para el colspan
  const calcularColspan = () => {
    let count = 10; // Columnas base: #, Fecha, Cliente, Número, Estado, Moneda, T.Gravado, T.Igv, Total, Descargas, Acciones
    if (columnasVisibles.usuario) count++;
    if (columnasVisibles.exportacion) count++;
    if (columnasVisibles.gratuita) count++;
    if (columnasVisibles.inafecta) count++;
    if (columnasVisibles.exonerado) count++;
    return count;
  };

  return (
    <div className="contingencia-container">
      {/* Header con alerta */}
      <div className="contingencia-header">
        <div className="contingencia-alert">
          <span className="contingencia-alert-text">
            COMPROBANTES / FACTURAS - BOLETAS DE CONTINGENCIA
          </span>
        </div>
      </div>

      {/* Mostrar estado de carga y errores */}
      {loading && (
        <div className="contingencia-loading">
          <p>Cargando comprobantes...</p>
        </div>
      )}

      {error && (
        <div className="contingencia-error">
          <p>Error: {error}</p>
          <button onClick={handleRefrescar} className="contingencia-btn-refrescar">
            Reintentar
          </button>
        </div>
      )}

      {/* Filtros de búsqueda */}
      <div className="contingencia-filtros">
        <div className="contingencia-filtro-numero">
          <select 
            className="contingencia-select"
            value={filtros.tipoComprobante}
            onChange={handleTipoComprobanteChange}
            disabled={loading}
          >
            <option value="">Todos los tipos</option>
            <option value="FACTURA">Factura</option>
            <option value="BOLETA">Boleta</option>
          </select>
        </div>

        <div className="contingencia-filtro-busqueda">
          <input
            type="text"
            className="contingencia-input-buscar"
            placeholder="🔍 Buscar por serie o número"
            value={filtros.busqueda}
            onChange={handleBusquedaChange}
            disabled={loading}
          />
        </div>

        <button 
          className="contingencia-btn-buscar"
          onClick={handleBuscar}
          disabled={loading}
        >
          🔍 Buscar
        </button>

        <button 
          className="contingencia-btn-refrescar"
          onClick={handleRefrescar}
          disabled={loading}
        >
          🔄 Refrescar
        </button>

        {/* Botón para mostrar/ocultar columnas */}
        <div className="contingencia-columnas-wrapper">
          <button 
            className="contingencia-btn-columnas"
            onClick={() => setMostrarMenuColumnas(!mostrarMenuColumnas)}
          >
            Mostrar/Ocultar columnas ⌄
          </button>
          
          {mostrarMenuColumnas && (
            <div className="contingencia-menu-columnas">
              <label className="contingencia-columna-item">
                <input
                  type="checkbox"
                  checked={columnasVisibles.usuario}
                  onChange={() => toggleColumna('usuario')}
                />
                <span>Usuario</span>
              </label>
              <label className="contingencia-columna-item">
                <input
                  type="checkbox"
                  checked={columnasVisibles.exportacion}
                  onChange={() => toggleColumna('exportacion')}
                />
                <span>T.Exportación</span>
              </label>
              <label className="contingencia-columna-item">
                <input
                  type="checkbox"
                  checked={columnasVisibles.gratuita}
                  onChange={() => toggleColumna('gratuita')}
                />
                <span>T.Gratuita</span>
              </label>
              <label className="contingencia-columna-item">
                <input
                  type="checkbox"
                  checked={columnasVisibles.inafecta}
                  onChange={() => toggleColumna('inafecta')}
                />
                <span>T.Inafecta</span>
              </label>
              <label className="contingencia-columna-item">
                <input
                  type="checkbox"
                  checked={columnasVisibles.exonerado}
                  onChange={() => toggleColumna('exonerado')}
                />
                <span>T.Exonerado</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Resumen de comprobantes */}
      {resumen && Object.keys(resumen).length > 0 && (
        <div className="contingencia-resumen">
          <p>
            Total: {resumen.totalComprobantes || 0} | 
            Pendientes: {resumen.pendientes || 0} | 
            Con Error: {resumen.conError || 0} | 
            Rechazados: {resumen.rechazados || 0}
          </p>
        </div>
      )}

      {/* Tabla de comprobantes */}
      <div className="contingencia-table-wrapper">
        <table className="contingencia-table">
          <thead className="contingencia-table-head">
            <tr>
              <th className="contingencia-th">#</th>
              <th className="contingencia-th">Fecha Emisión</th>
              <th className="contingencia-th">Cliente</th>
              <th className="contingencia-th">Número</th>
              <th className="contingencia-th">Estado</th>
              {columnasVisibles.usuario && <th className="contingencia-th">Usuario</th>}
              <th className="contingencia-th">Moneda</th>
              {columnasVisibles.exportacion && <th className="contingencia-th">T.Exportación</th>}
              {columnasVisibles.gratuita && <th className="contingencia-th">T.Gratuita</th>}
              {columnasVisibles.inafecta && <th className="contingencia-th">T.Inafecta</th>}
              {columnasVisibles.exonerado && <th className="contingencia-th">T.Exonerado</th>}
              <th className="contingencia-th">T.Gravado</th>
              <th className="contingencia-th">T.Igv</th>
              <th className="contingencia-th">Total</th>
              <th className="contingencia-th">Descargas</th>
              <th className="contingencia-th">Acciones</th>
            </tr>
          </thead>
          <tbody className="contingencia-table-body">
            {comprobantes.length === 0 ? (
              <tr>
                <td colSpan={calcularColspan()} className="contingencia-empty">
                  <div className="contingencia-empty-content">
                    {loading ? 'Cargando...' : `Total ${paginacion.totalItems || 0} comprobantes`}
                  </div>
                </td>
              </tr>
            ) : (
              comprobantes.map((comp, index) => (
                <tr key={comp.id} className="contingencia-table-row">
                  <td className="contingencia-td">{((paginacion.page - 1) * paginacion.limit) + index + 1}</td>
                  <td className="contingencia-td">{new Date(comp.fechaEmision).toLocaleDateString()}</td>
                  <td className="contingencia-td">{comp.cliente || 'Sin cliente'}</td>
                  <td className="contingencia-td">{comp.comprobante || `${comp.serie}-${comp.numero}`}</td>
                  <td className="contingencia-td">
                    <span className={`contingencia-estado ${comp.estadoSunat?.toLowerCase()}`}>
                      {comp.estadoSunat || 'PENDIENTE'}
                    </span>
                  </td>
                  {columnasVisibles.usuario && <td className="contingencia-td">{comp.usuario || '-'}</td>}
                  <td className="contingencia-td">{comp.moneda || 'PEN'}</td>
                  {columnasVisibles.exportacion && <td className="contingencia-td">0.00</td>}
                  {columnasVisibles.gratuita && <td className="contingencia-td">0.00</td>}
                  {columnasVisibles.inafecta && <td className="contingencia-td">0.00</td>}
                  {columnasVisibles.exonerado && <td className="contingencia-td">0.00</td>}
                  <td className="contingencia-td">{comp.subtotal || '0.00'}</td>
                  <td className="contingencia-td">{comp.igv || '0.00'}</td>
                  <td className="contingencia-td">{comp.total || '0.00'}</td>
                  <td className="contingencia-td">
                    <div className="contingencia-descargas">
                      <button 
                        onClick={() => handleDescargarArchivo(comp.id, 'xml')}
                        className="contingencia-btn-descarga"
                        title="Descargar XML"
                      >
                        XML
                      </button>
                      <button 
                        onClick={() => handleDescargarArchivo(comp.id, 'pdf')}
                        className="contingencia-btn-descarga"
                        title="Descargar PDF"
                      >
                        PDF
                      </button>
                      <button 
                        onClick={() => handleDescargarArchivo(comp.id, 'cdr')}
                        className="contingencia-btn-descarga"
                        title="Descargar CDR"
                      >
                        CDR
                      </button>
                    </div>
                  </td>
                  <td className="contingencia-td">
                    <div className="contingencia-acciones">
                      <button 
                        onClick={() => handleReenviarComprobante(comp.id)}
                        className="contingencia-btn-accion"
                        title="Reenviar a SUNAT"
                        disabled={loading}
                      >
                        📤
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer con paginación */}
        <div className="contingencia-footer">
          <div className="contingencia-info">
            <span>
              Mostrando {comprobantes.length} de {paginacion.totalItems || 0} comprobantes
              {paginacion.totalPages > 0 && ` - Página ${paginacion.page} de ${paginacion.totalPages}`}
            </span>
          </div>
          <div className="contingencia-pagination">
            <button 
              className="contingencia-pagination-btn" 
              disabled={!paginacion.hasPrevPage || loading}
              onClick={() => cambiarPagina(paginacion.page - 1)}
            >
              ‹
            </button>
            <button className="contingencia-pagination-btn contingencia-pagination-active">
              {paginacion.page}
            </button>
            <button 
              className="contingencia-pagination-btn" 
              disabled={!paginacion.hasNextPage || loading}
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

export default ComprobanteContingencia;