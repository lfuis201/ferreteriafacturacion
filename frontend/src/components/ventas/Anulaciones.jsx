import React, { useState, useEffect } from 'react';
import anulacionesService from '../../services/anulacionesService';
import '../../styles/Anulaciones.css';

const Anulaciones = () => {
  const [fechaEmision, setFechaEmision] = useState('');
  const [fechaInput, setFechaInput] = useState('2025-09-10');
  const [anulaciones, setAnulaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Cargar anulaciones al montar el componente
  useEffect(() => {
    cargarAnulaciones();
  }, []);

  const cargarAnulaciones = async (filtros = {}) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await anulacionesService.obtenerAnulaciones({
        page: paginacion.currentPage,
        limit: 10,
        ...filtros
      });
      
      setAnulaciones(response.anulaciones || []);
      setPaginacion(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
      });
    } catch (error) {
      console.error('Error al cargar anulaciones:', error);
      setError('Error al cargar las anulaciones');
      setAnulaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async () => {
    try {
      setLoading(true);
      setError('');
      
      let filtros = {};
      
      // Aplicar filtros según la selección
      if (fechaEmision === 'hoy') {
        const hoy = new Date().toISOString().split('T')[0];
        filtros = { fechaInicio: hoy, fechaFin: hoy };
      } else if (fechaEmision === 'ayer') {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        const fechaAyer = ayer.toISOString().split('T')[0];
        filtros = { fechaInicio: fechaAyer, fechaFin: fechaAyer };
      } else if (fechaEmision === 'esta-semana') {
        const hoy = new Date();
        const primerDia = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
        const ultimoDia = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 6));
        filtros = { 
          fechaInicio: primerDia.toISOString().split('T')[0],
          fechaFin: ultimoDia.toISOString().split('T')[0]
        };
      } else if (fechaEmision === 'este-mes') {
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        filtros = { 
          fechaInicio: primerDia.toISOString().split('T')[0],
          fechaFin: ultimoDia.toISOString().split('T')[0]
        };
      } else if (fechaEmision === 'mes-anterior') {
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        filtros = { 
          fechaInicio: primerDia.toISOString().split('T')[0],
          fechaFin: ultimoDia.toISOString().split('T')[0]
        };
      } else if (fechaEmision === 'personalizado' && fechaInput) {
        filtros = { fechaInicio: fechaInput, fechaFin: fechaInput };
      }
      
      await cargarAnulaciones(filtros);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setError('Error al realizar la búsqueda');
    }
  };

  const handleConsultarDocumentos = () => {
    console.log('Consultar documentos');
  };

  const handleDescargar = async (anulacion, formato = 'pdf') => {
    try {
      setLoading(true);
      await anulacionesService.descargarDocumento(
        anulacion.tipo.toLowerCase(), 
        anulacion.id, 
        formato
      );
    } catch (error) {
      console.error('Error al descargar:', error);
      setError('Error al descargar el documento');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPagina = async (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPages) {
      try {
        setLoading(true);
        const response = await anulacionesService.obtenerAnulaciones({
          page: nuevaPagina,
          limit: 10
        });
        
        setAnulaciones(response.anulaciones || []);
        setPaginacion(response.pagination || paginacion);
      } catch (error) {
        console.error('Error al cambiar página:', error);
        setError('Error al cargar la página');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="anulaciones-container">
      {/* Header con alerta */}
      <div className="anulaciones-header">
        <div className="anulaciones-alert">
          <span className="anulaciones-alert-text">ANULACIONES</span>
        </div> 

       {/* <button className="anulaciones-btn-consultar" onClick={handleConsultarDocumentos}>
          Consultar documentos
        </button>*/ }
      </div>

      {/* Título */}
      <div className="anulaciones-title-section">
        <h2 className="anulaciones-title">Listado de anulaciones</h2>
        {loading && <div className="anulaciones-loading">Cargando...</div>}
        {error && <div className="anulaciones-error">{error}</div>}
      </div>

      {/* Filtros de búsqueda */}
      <div className="anulaciones-filtros">
        <div className="anulaciones-filtro-fecha-select">
          <select 
            className="anulaciones-select"
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

        <div className="anulaciones-filtro-fecha-input">
          <input
            type="date"
            className="anulaciones-input-fecha"
            value={fechaInput}
            onChange={(e) => setFechaInput(e.target.value)}
            disabled={fechaEmision !== 'personalizado'}
          />
        </div>

        <button 
          className="anulaciones-btn-buscar"
          onClick={handleBuscar}
          disabled={loading}
        >
          🔍 {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* Tabla de anulaciones */}
      <div className="anulaciones-table-wrapper">
        <table className="anulaciones-table">
          <thead className="anulaciones-table-head">
            <tr>
              <th className="anulaciones-th">#</th>
              <th className="anulaciones-th">F.Emisión</th>
              <th className="anulaciones-th">F.Anulación</th>
              <th className="anulaciones-th">Identificador</th>
              <th className="anulaciones-th">Tipo</th>
              <th className="anulaciones-th">Cliente/Proveedor</th>
              <th className="anulaciones-th">Total</th>
              <th className="anulaciones-th">Estado</th>
              <th className="anulaciones-th">Descargas</th>
              <th className="anulaciones-th">Acciones</th>
            </tr>
          </thead>
          <tbody className="anulaciones-table-body">
            {anulaciones.length === 0 ? (
              <tr>
                <td colSpan="10" className="anulaciones-empty">
                  <div className="anulaciones-empty-content">
                    {loading ? 'Cargando...' : `Total ${paginacion.totalItems || 0}`}
                  </div>
                </td>
              </tr>
            ) : (
              anulaciones.map((anulacion, index) => (
                <tr key={`${anulacion.tipo}-${anulacion.id}`} className="anulaciones-table-row">
                  <td className="anulaciones-td">{((paginacion.currentPage - 1) * paginacion.itemsPerPage) + index + 1}</td>
                  <td className="anulaciones-td">{formatearFecha(anulacion.fechaEmision)}</td>
                  <td className="anulaciones-td">{formatearFechaHora(anulacion.fechaAnulacion)}</td>
                  <td className="anulaciones-td">{anulacion.identificador}</td>
                  <td className="anulaciones-td">
                    <span className={`anulaciones-tipo anulaciones-tipo-${anulacion.tipo?.toLowerCase()}`}>
                      {anulacion.tipoComprobante}
                    </span>
                  </td>
                  <td className="anulaciones-td">
                    {anulacion.cliente?.razonSocial || anulacion.proveedor?.razonSocial || 'N/A'}
                  </td>
                  <td className="anulaciones-td">
                    S/ {anulacion.total ? parseFloat(anulacion.total).toFixed(2) : '0.00'}
                  </td>
                  <td className="anulaciones-td">
                    <span className={`anulaciones-estado anulaciones-estado-${anulacion.estado?.toLowerCase()}`}>
                      {anulacion.estado}
                    </span>
                  </td>
                  <td className="anulaciones-td">
                    <div className="anulaciones-descargas">
                      <button 
                        className="anulaciones-btn-descarga"
                        onClick={() => handleDescargar(anulacion, 'pdf')}
                        title="Descargar PDF"
                        disabled={loading}
                      >
                        📄
                      </button>
                      <button 
                        className="anulaciones-btn-descarga"
                        onClick={() => handleDescargar(anulacion, 'xml')}
                        title="Descargar XML"
                        disabled={loading}
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td className="anulaciones-td">
                    <button className="anulaciones-btn-accion" title="Más opciones">⋮</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer con paginación */}
        <div className="anulaciones-footer">
          <div className="anulaciones-info">
            Página {paginacion.currentPage} de {paginacion.totalPages} - 
            Total: {paginacion.totalItems} anulaciones
          </div>
          <div className="anulaciones-pagination">
            <button 
              className="anulaciones-pagination-btn" 
              disabled={paginacion.currentPage <= 1 || loading}
              onClick={() => handleCambiarPagina(paginacion.currentPage - 1)}
            >
              ‹
            </button>
            <button className="anulaciones-pagination-btn anulaciones-pagination-active">
              {paginacion.currentPage}
            </button>
            <button 
              className="anulaciones-pagination-btn" 
              disabled={paginacion.currentPage >= paginacion.totalPages || loading}
              onClick={() => handleCambiarPagina(paginacion.currentPage + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Anulaciones;