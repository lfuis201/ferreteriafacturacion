import React, { useState, useEffect } from 'react';
import resumenService from '../../services/resumenService';
import '../../styles/Resumenes.css';

const Resumenes = () => {
  const [fechaEmision, setFechaEmision] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [resumenes, setResumenes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [fechaComprobantes, setFechaComprobantes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paginacion, setPaginacion] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [comprobantes, setComprobantes] = useState([]);

  // Cargar resúmenes al montar el componente
  useEffect(() => {
    cargarResumenes();
  }, []);

  // Función para cargar resúmenes
  const cargarResumenes = async (filtros = {}) => {
    try {
      setLoading(true);
      setError('');
      
      const filtrosCompletos = {
        ...filtros,
        page: paginacion.page,
        limit: paginacion.limit
      };

      const response = await resumenService.obtenerResumenes(filtrosCompletos);
      
      if (response.success) {
        setResumenes(response.data.resumenes || []);
        setPaginacion(prev => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0
        }));
      } else {
        setError(response.message || 'Error al cargar resúmenes');
      }
    } catch (error) {
      console.error('Error al cargar resúmenes:', error);
      setError('Error al cargar resúmenes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    console.log('Buscando con:', { fechaEmision, busqueda });
    
    const filtros = {};
    if (fechaEmision) filtros.fechaEmision = fechaEmision;
    if (busqueda) filtros.busqueda = busqueda;
    
    cargarResumenes(filtros);
  };

  const handleNuevo = () => {
    setMostrarModal(true);
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setFechaComprobantes('');
    setComprobantes([]);
    setError('');
  };

  const handleBuscarComprobantes = async () => {
    if (!fechaComprobantes) {
      setError('Por favor selecciona una fecha');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await resumenService.obtenerComprobantesPorFecha(fechaComprobantes);
      
      if (response.success) {
        setComprobantes(response.data || []);
        if (response.data.length === 0) {
          setError('No se encontraron comprobantes para la fecha seleccionada');
        }
      } else {
        setError(response.message || 'Error al buscar comprobantes');
      }
    } catch (error) {
      console.error('Error al buscar comprobantes:', error);
      setError('Error al buscar comprobantes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearResumen = async () => {
    if (!fechaComprobantes) {
      setError('Por favor selecciona una fecha');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const resumenData = {
        fechaComprobantes: fechaComprobantes
      };

      const response = await resumenService.crearResumen(resumenData);
      
      if (response.success) {
        handleCerrarModal();
        cargarResumenes(); // Recargar la lista
        alert('Resumen creado exitosamente');
      } else {
        setError(response.message || 'Error al crear resumen');
      }
    } catch (error) {
      console.error('Error al crear resumen:', error);
      setError('Error al crear resumen: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar descargas
  const handleDescargar = async (resumenId, formato = 'pdf') => {
    try {
      setLoading(true);
      await resumenService.descargarResumen(resumenId, formato);
    } catch (error) {
      console.error('Error al descargar:', error);
      setError('Error al descargar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar página
  const handleCambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPages) {
      setPaginacion(prev => ({ ...prev, page: nuevaPagina }));
      cargarResumenes();
    }
  };

  return (
    <div className="resumenes-container">
      {/* Header con alerta */}
      <div className="resumenes-header">
        <div className="resumenes-alert">
          
          <span className="resumenes-alert-text">RESÚMENES</span>
        </div>
        <button className="resumenes-btn-nuevo" onClick={handleNuevo}>
          ➕ Nuevo
        </button>
      </div>

      {/* Título */}
      <div className="resumenes-title-section">
        <h2 className="resumenes-title">Listado de resúmenes</h2>
        {loading && <div className="resumenes-loading">Cargando...</div>}
        {error && <div className="resumenes-error">{error}</div>}
      </div>

      {/* Filtros de búsqueda */}
      <div className="resumenes-filtros">
        <div className="resumenes-filtro-fecha">
          <select 
            className="resumenes-select"
            value={fechaEmision}
            onChange={(e) => setFechaEmision(e.target.value)}
          >
            <option value="">Fecha de emisión</option>
            <option value="hoy">Hoy</option>
            <option value="ayer">Ayer</option>
            <option value="esta-semana">Esta semana</option>
            <option value="este-mes">Este mes</option>
            <option value="mes-anterior">Mes anterior</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>

        <div className="resumenes-filtro-busqueda">
          <input
            type="text"
            className="resumenes-input-buscar"
            placeholder="🔍 Buscar"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <button 
          className="resumenes-btn-buscar"
          onClick={handleBuscar}
        >
          🔍 Buscar
        </button>
      </div>

      {/* Tabla de resúmenes */}
      <div className="resumenes-table-wrapper">
        <table className="resumenes-table">
          <thead className="resumenes-table-head">
            <tr>
              <th className="resumenes-th">#</th>
              <th className="resumenes-th">Fecha Emisión</th>
              <th className="resumenes-th">Fecha Referencia</th>
              <th className="resumenes-th">Identificador</th>
              <th className="resumenes-th">Estado</th>
              <th className="resumenes-th">Ticket</th>
              <th className="resumenes-th">Descargas</th>
              <th className="resumenes-th">Acciones</th>
            </tr>
          </thead>
          <tbody className="resumenes-table-body">
            {resumenes.length === 0 ? (
              <tr>
                <td colSpan="8" className="resumenes-empty">
                  <div className="resumenes-empty-content">
                    Total {paginacion.total}
                  </div>
                </td>
              </tr>
            ) : (
              resumenes.map((resumen, index) => (
                <tr key={resumen.id || index} className="resumenes-table-row">
                  <td className="resumenes-td">{((paginacion.page - 1) * paginacion.limit) + index + 1}</td>
                  <td className="resumenes-td">{new Date(resumen.fechaEmision).toLocaleDateString()}</td>
                  <td className="resumenes-td">{new Date(resumen.fechaReferencia).toLocaleDateString()}</td>
                  <td className="resumenes-td">{resumen.identificador}</td>
                  <td className="resumenes-td">
                    <span className={`resumenes-estado resumenes-estado-${resumen.estado?.toLowerCase()}`}>
                      {resumen.estado}
                    </span>
                  </td>
                  <td className="resumenes-td">{resumen.ticket || '-'}</td>
                  <td className="resumenes-td">
                    <div className="resumenes-descargas">
                      <button 
                        className="resumenes-btn-descarga" 
                        onClick={() => handleDescargar(resumen.id, 'pdf')}
                        title="Descargar PDF"
                      >
                        📄
                      </button>
                      <button 
                        className="resumenes-btn-descarga" 
                        onClick={() => handleDescargar(resumen.id, 'xml')}
                        title="Descargar XML"
                      >
                        📋
                      </button>
                      <button 
                        className="resumenes-btn-descarga" 
                        onClick={() => handleDescargar(resumen.id, 'cdr')}
                        title="Descargar CDR"
                      >
                        📦
                      </button>
                    </div>
                  </td>
                  <td className="resumenes-td">
                    <button className="resumenes-btn-accion">⋮</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer con paginación */}
        <div className="resumenes-footer">
          <div className="resumenes-pagination">
            <button 
              className="resumenes-pagination-btn" 
              disabled={paginacion.page <= 1}
              onClick={() => handleCambiarPagina(paginacion.page - 1)}
            >
              ‹
            </button>
            <span className="resumenes-pagination-info">
              Página {paginacion.page} de {paginacion.totalPages} ({paginacion.total} total)
            </span>
            <button 
              className="resumenes-pagination-btn" 
              disabled={paginacion.page >= paginacion.totalPages}
              onClick={() => handleCambiarPagina(paginacion.page + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Modal para registrar resumen */}
      {mostrarModal && (
        <div className="resumenes-modal-overlay" onClick={handleCerrarModal}>
          <div className="resumenes-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="resumenes-modal-header">
              <h3 className="resumenes-modal-title">Registrar Resumen</h3>
              <button className="resumenes-modal-close" onClick={handleCerrarModal}>
                ✕
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="resumenes-modal-body">
              {error && <div className="resumenes-modal-error">{error}</div>}
              
              <div className="resumenes-modal-form-group">
                <label className="resumenes-modal-label">
                  Fecha de emisión de comprobantes
                </label>
                <input
                  type="date"
                  className="resumenes-modal-input"
                  value={fechaComprobantes}
                  onChange={(e) => setFechaComprobantes(e.target.value)}
                  placeholder="2025-10-01"
                />
              </div>

              <div className="resumenes-modal-actions">
                <button 
                  className="resumenes-modal-btn-buscar"
                  onClick={handleBuscarComprobantes}
                  disabled={loading}
                >
                  {loading ? 'Buscando...' : 'Buscar comprobantes'}
                </button>
              </div>

              {/* Mostrar comprobantes encontrados */}
              {comprobantes.length > 0 && (
                <div className="resumenes-modal-comprobantes">
                  <h4>Comprobantes encontrados ({comprobantes.length})</h4>
                  <div className="resumenes-modal-comprobantes-lista">
                    {comprobantes.slice(0, 5).map((comprobante, index) => (
                      <div key={index} className="resumenes-modal-comprobante-item">
                        <span>{comprobante.serie}-{comprobante.numero}</span>
                        <span>{comprobante.tipoComprobante}</span>
                        <span>S/ {comprobante.total}</span>
                      </div>
                    ))}
                    {comprobantes.length > 5 && (
                      <div className="resumenes-modal-comprobante-item">
                        <span>... y {comprobantes.length - 5} más</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="resumenes-modal-footer">
              <button 
                className="resumenes-modal-btn-cancelar"
                onClick={handleCerrarModal}
              >
                Cancelar
              </button>
              {comprobantes.length > 0 && (
                <button 
                  className="resumenes-modal-btn-crear"
                  onClick={handleCrearResumen}
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Resumen'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resumenes;