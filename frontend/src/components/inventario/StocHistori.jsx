import React, { useState } from 'react';
import { Search, FileDown } from 'lucide-react';
import { obtenerStockHistorico, exportarStockHistoricoExcel } from '../../services/inventarioService';
import '../../styles/StockHistorico.css';

const StockHistorico = () => {
  const [desdelaFecha, setDesdelaFecha] = useState('');
  const [hastaFecha, setHastaFecha] = useState('');
  const [showHistorialResults, setShowHistorialResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [stockHistoricoData, setStockHistoricoData] = useState([]);



  const handleBuscarHistorico = async () => {
    // Validar que las fechas estén completas
    if (!desdelaFecha || !hastaFecha) {
      setError('Por favor, ingrese ambas fechas para realizar la búsqueda');
      return;
    }

    // Convertir fechas del formato dd/mm/yyyy a yyyy-mm-dd
    const convertirFecha = (fecha) => {
      const partes = fecha.split('/');
      if (partes.length === 3) {
        return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      }
      return fecha;
    };

    try {
      setLoading(true);
      setError('');
      
      const filtros = {
        fechaDesde: convertirFecha(desdelaFecha),
        fechaHasta: convertirFecha(hastaFecha),
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };

      const response = await obtenerStockHistorico(filtros);
      
      if (response && response.stockHistorico) {
        setStockHistoricoData(response.stockHistorico);
        setPagination({
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || 0,
          itemsPerPage: response.pagination?.itemsPerPage || 20
        });
        setShowHistorialResults(true);
      } else {
        setError('No se encontraron datos para el rango de fechas seleccionado');
        setStockHistoricoData([]);
        setShowHistorialResults(false);
      }
    } catch (error) {
      console.error('Error al obtener stock histórico:', error);
      setError('Error al obtener los datos del stock histórico: ' + error.message);
      setStockHistoricoData([]);
      setShowHistorialResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargaExcel = async () => {
    // Validar que las fechas estén completas
    if (!desdelaFecha || !hastaFecha) {
      setError('Por favor, ingrese ambas fechas para exportar a Excel');
      return;
    }

    // Convertir fechas del formato dd/mm/yyyy a yyyy-mm-dd
    const convertirFecha = (fecha) => {
      const partes = fecha.split('/');
      if (partes.length === 3) {
        return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      }
      return fecha;
    };

    try {
      setLoading(true);
      setError('');
      
      const filtros = {
        fechaDesde: convertirFecha(desdelaFecha),
        fechaHasta: convertirFecha(hastaFecha)
      };

      await exportarStockHistoricoExcel(filtros);
      
      // Mostrar mensaje de éxito
      console.log('Excel exportado exitosamente');
      
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      setError('Error al exportar archivo Excel: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPagina = async (nuevaPagina) => {
    if (nuevaPagina === pagination.currentPage || nuevaPagina < 1 || nuevaPagina > pagination.totalPages) {
      return;
    }

    // Actualizar la página en el estado de paginación
    setPagination(prev => ({
      ...prev,
      currentPage: nuevaPagina
    }));

    // Realizar nueva búsqueda con la nueva página
    if (desdelaFecha && hastaFecha) {
      const convertirFecha = (fecha) => {
        const partes = fecha.split('/');
        if (partes.length === 3) {
          return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
        }
        return fecha;
      };

      try {
        setLoading(true);
        setError('');
        
        const filtros = {
          fechaDesde: convertirFecha(desdelaFecha),
          fechaHasta: convertirFecha(hastaFecha),
          page: nuevaPagina,
          limit: pagination.itemsPerPage
        };

        const response = await obtenerStockHistorico(filtros);
        
        if (response && response.stockHistorico) {
          setStockHistoricoData(response.stockHistorico);
          setPagination({
            currentPage: response.pagination?.currentPage || nuevaPagina,
            totalPages: response.pagination?.totalPages || 1,
            totalItems: response.pagination?.totalItems || 0,
            itemsPerPage: response.pagination?.itemsPerPage || 20
          });
        }
      } catch (error) {
        console.error('Error al cambiar página:', error);
        setError('Error al cargar la página: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="stock-historico-container">
      {/* Header */}
      <div className="stock-historico-header">
       
        <p>STOCK HISTÓRICO</p>
      </div>

      {/* Content */}
      <div className="stock-historico-content">
        
        
        <div className="stock-historico-filters-section">
          <div className="stock-historico-date-filters">
            <div className="stock-historico-date-group">
              <label>Desde la fecha</label>
              <input
                type="date"
                value={desdelaFecha}
                onChange={(e) => setDesdelaFecha(e.target.value)}
                className="stock-historico-date-input"
                placeholder="dd/mm/yyyy"
              />
            </div>

            <div className="stock-historico-date-group">
              <label>Hasta la fecha</label>
              <input
                type="date"
                value={hastaFecha}
                onChange={(e) => setHastaFecha(e.target.value)}
                className="stock-historico-date-input"
                placeholder="dd/mm/yyyy"
              />
            </div>
          </div>

          <div className="stock-historico-search-container">
            <button 
              className="stock-historico-search-btn"
              onClick={handleBuscarHistorico}
              disabled={loading}
            >
              <Search size={16} /> {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="stock-historico-error-message" style={{
            color: '#dc3545',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            padding: '10px',
            margin: '10px 0',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Loading Message */}
        {loading && (
          <div className="stock-historico-loading-message" style={{
            color: '#0066cc',
            backgroundColor: '#e7f3ff',
            border: '1px solid #b3d9ff',
            borderRadius: '4px',
            padding: '10px',
            margin: '10px 0',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Cargando datos del stock histórico...
          </div>
        )}

        {/* Results Table */}
        {showHistorialResults && (
          <div className="stock-historico-results-section">
            <div className="stock-historico-action-buttons">
              
              <button 
                className="stock-historico-action-btn stock-historico-excel-btn"
                onClick={handleDescargaExcel}
              >
                <FileDown size={16} /> Reporte en Excel
              </button>
            </div>

            <div className="stock-historico-table-container">
              <table className="stock-historico-table">
                <thead>
                  <tr>
                    <th rowSpan="2" className="stock-historico-th-producto">#</th>
                    <th rowSpan="2" className="stock-historico-th-producto">Producto</th>
                    <th colSpan="5" className="stock-historico-th-section">FÍSICO</th>
                    <th colSpan="5" className="stock-historico-th-section">VALORIZADO</th>
                  </tr>
                  <tr>
                    <th className="stock-historico-th-subsection">INGRESO</th>
                    <th className="stock-historico-th-subsection">SALIDA</th>
                    <th className="stock-historico-th-subsection">SALDO</th>
                    <th className="stock-historico-th-subsection">SALDO ANTERIOR</th>
                    <th className="stock-historico-th-subsection">SALDO TOTAL</th>
                    <th className="stock-historico-th-subsection">INGRESO</th>
                    <th className="stock-historico-th-subsection">SALIDA</th>
                    <th className="stock-historico-th-subsection">SALDO</th>
                    <th className="stock-historico-th-subsection">SALDO ANTERIOR</th>
                    <th className="stock-historico-th-subsection">SALDO TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {stockHistoricoData && stockHistoricoData.length > 0 ? (
                    stockHistoricoData.map((item, index) => (
                      <tr key={item.id} className="stock-historico-table-row">
                        <td className="stock-historico-td">{((pagination.currentPage - 1) * pagination.itemsPerPage) + index + 1}</td>
                        <td className="stock-historico-td stock-historico-producto-cell">
                          <div>
                            <strong>{item.codigo || 'N/A'}</strong>
                            <br />
                            <span style={{ fontSize: '12px', color: '#666' }}>{item.producto || 'Sin nombre'}</span>
                          </div>
                        </td>
                        <td className="stock-historico-td stock-historico-number-cell">{(item.fisico?.ingreso || 0).toFixed(2)}</td>
                        <td className="stock-historico-td stock-historico-number-cell">{(item.fisico?.salida || 0).toFixed(2)}</td>
                        <td className="stock-historico-td stock-historico-number-cell">{(item.fisico?.saldo || 0).toFixed(2)}</td>
                        <td className="stock-historico-td stock-historico-number-cell">{(item.fisico?.saldoAnterior || 0).toFixed(2)}</td>
                        <td className="stock-historico-td stock-historico-number-cell">{(item.fisico?.saldoTotal || 0).toFixed(2)}</td>
                        <td className="stock-historico-td stock-historico-number-cell">{(item.valorizado?.ingreso || 0).toFixed(2)}</td>
                        <td className="stock-historico-td stock-historico-number-cell">{(item.valorizado?.salida || 0).toFixed(2)}</td>
                        <td className="stock-historico-td stock-historico-number-cell">{(item.valorizado?.saldo || 0).toFixed(2)}</td>
                        <td className="stock-historico-td stock-historico-number-cell">{(item.valorizado?.saldoAnterior || 0).toFixed(2)}</td>
                        <td className="stock-historico-td stock-historico-number-cell">{(item.valorizado?.saldoTotal || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    !loading && (
                      <tr>
                        <td colSpan="12" className="stock-historico-td" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                          {showHistorialResults ? 'No se encontraron datos para el rango de fechas seleccionado' : 'Seleccione un rango de fechas y haga clic en "Buscar" para ver los resultados'}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="stock-historico-pagination">
              <span className="stock-historico-pagination-info">
                Total {pagination.totalItems} elementos - Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              {pagination.totalPages > 1 && (
                <>
                  {pagination.currentPage > 1 && (
                    <button 
                      className="stock-historico-page-number"
                      onClick={() => handleCambiarPagina(pagination.currentPage - 1)}
                      style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                    >
                      Anterior
                    </button>
                  )}
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNumber = Math.max(1, pagination.currentPage - 2) + i;
                    if (pageNumber <= pagination.totalPages) {
                      return (
                        <button
                          key={pageNumber}
                          className={`stock-historico-page-number ${pageNumber === pagination.currentPage ? 'active' : ''}`}
                          onClick={() => handleCambiarPagina(pageNumber)}
                          style={{ 
                            cursor: 'pointer', 
                            border: 'none', 
                            background: pageNumber === pagination.currentPage ? '#007bff' : 'transparent',
                            color: pageNumber === pagination.currentPage ? 'white' : 'inherit'
                          }}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  {pagination.currentPage < pagination.totalPages && (
                    <button 
                      className="stock-historico-page-number"
                      onClick={() => handleCambiarPagina(pagination.currentPage + 1)}
                      style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                    >
                      Siguiente
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockHistorico;