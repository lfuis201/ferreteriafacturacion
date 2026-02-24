import React, { useState, useEffect } from 'react';
import { Search, FileText, Table } from 'lucide-react';
import { obtenerInventarioConBusqueda, obtenerSucursalesActivas, exportarRevisionInventarioExcel, exportarRevisionInventarioPdf } from '../../services/inventarioService';
import { obtenerCategorias } from '../../services/categoriaService';
import '../../styles/RevisionInventario.css';

const RevisionInventario = () => {
  const [sucursal, setSucursal] = useState('');
  const [categoria, setCategoria] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estados para datos reales
  const [sucursales, setSucursales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [stockContado, setStockContado] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // Cargar sucursales
      const responseSucursales = await obtenerSucursalesActivas();
      setSucursales(responseSucursales.data || []);
      
      // Cargar categorías
      const responseCategorias = await obtenerCategorias();
      setCategorias(responseCategorias || []);
      
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async () => {
    try {
      setLoading(true);
      setShowResults(true);
      
      // Construir filtros
      const filtros = {
        page: 1,
        limit: pagination.limit
      };
      
      if (sucursal) {
        filtros.sucursalId = sucursal;
      }
      
      if (categoria) {
        filtros.categoriaId = categoria;
      }
      
      // Obtener inventario con filtros
      const response = await obtenerInventarioConBusqueda(filtros);
      
      setProductos(response.inventario || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      });
      
      // Inicializar stock contado
      const initialStockContado = {};
      (response.inventario || []).forEach(item => {
        initialStockContado[item.id] = 0;
      });
      setStockContado(initialStockContado);
      
    } catch (error) {
      console.error('Error al buscar productos:', error);
      alert('Error al buscar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = (inventarioId, newValue) => {
    setStockContado(prev => ({
      ...prev,
      [inventarioId]: parseInt(newValue) || 0
    }));
  };

  const calcularDiferencia = (inventarioId, stockSistema) => {
    const contado = stockContado[inventarioId] || 0;
    return stockSistema - contado;
  };

  const handleCambiarPagina = async (nuevaPagina) => {
    try {
      setLoading(true);
      
      const filtros = {
        page: nuevaPagina,
        limit: pagination.limit
      };
      
      if (sucursal) {
        filtros.sucursalId = sucursal;
      }
      
      if (categoria) {
        filtros.categoriaId = categoria;
      }
      
      const response = await obtenerInventarioConBusqueda(filtros);
      
      setProductos(response.inventario || []);
      setPagination(response.pagination || pagination);
      
      // Actualizar stock contado para los nuevos productos
      const newStockContado = { ...stockContado };
      (response.inventario || []).forEach(item => {
        if (!(item.id in newStockContado)) {
          newStockContado[item.id] = 0;
        }
      });
      setStockContado(newStockContado);
      
    } catch (error) {
      console.error('Error al cambiar página:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportarExcel = async () => {
    try {
      setLoading(true);
      
      const filtros = {};
      if (sucursal) {
        filtros.sucursalId = sucursal;
      }
      if (categoria) {
        filtros.categoriaId = categoria;
      }
      
      await exportarRevisionInventarioExcel(filtros);
      
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al exportar archivo Excel: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportarPdf = async () => {
    try {
      setLoading(true);
      
      const filtros = {};
      if (sucursal) {
        filtros.sucursalId = sucursal;
      }
      if (categoria) {
        filtros.categoriaId = categoria;
      }
      
      await exportarRevisionInventarioPdf(filtros);
      
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al exportar archivo PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="revision-inventario">
      {/* Header */}
      <div className="header">
        <p>REVISIÓN DE INVENTARIO</p>
      </div>

      {/* Content */}
      <div className="content">
        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group">
              <label>Sucursal</label>
              <select 
                value={sucursal} 
                onChange={(e) => setSucursal(e.target.value)}
                className="filter-select"
                disabled={loading}
              >
                <option value="">Todas las sucursales</option>
                {sucursales.map((suc) => (
                  <option key={suc.id} value={suc.id}>
                    {suc.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Categoría</label>
              <select 
                value={categoria} 
                onChange={(e) => setCategoria(e.target.value)}
                className="filter-select"
                disabled={loading}
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-button-container">
            <button 
              className="search-btn"
              onClick={handleBuscar}
              disabled={loading}
            >
              <Search size={16} /> {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Results Table */}
        {showResults && (
          <div className="results-section">
            <div className="action-buttons">
              <button 
                className="action-btn export-btn" 
                onClick={handleExportarPdf}
                disabled={loading}
              >
                <FileText size={16} /> Exportar en PDF
              </button>
              <button 
                className="action-btn report-btn" 
                onClick={handleExportarExcel}
                disabled={loading}
              >
                <Table size={16} /> Exportar en Excel
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                Cargando productos...
              </div>
            ) : productos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                No se encontraron productos con los filtros seleccionados
              </div>
            ) : (
              <>
                <div className="table-container">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Cód. Barras</th>
                        <th>Producto</th>
                        <th>Stock Sistema</th> 

                       {/* <th>Stock Escaneado</th>*/ }
                       

                        <th>Diferencia Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((item, index) => {
                        const numeroFila = (pagination.page - 1) * pagination.limit + index + 1;
                        const diferencia = calcularDiferencia(item.id, item.stock);
                        
                        return (
                          <tr key={item.id}>
                            <td>{numeroFila}</td>
                            <td>{item.Producto?.codigo || ''}</td>
                            <td>{item.Producto?.nombre || ''}</td>
                            <td>{item.stock}</td>



    {/*  <td>
                              <input
                                type="number"
                                value={stockContado[item.id] || 88}
                                onChange={(e) => handleUpdateStock(item.id, e.target.value)}
                                className="stock-input"
                                min="8"
                              />
                            </td>*/}
                          



                            <td style={{ 
                              color: diferencia !== 0 ? (diferencia > 0 ? '#e74c3c' : '#27ae60') : '#333'
                            }}>
                              {diferencia}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="pagination">
                  {/* Botones de paginación */}
                  {pagination.totalPages > 1 && (
                    <>
                      {pagination.page > 1 && (
                        <span 
                          onClick={() => handleCambiarPagina(pagination.page - 1)}
                          style={{ cursor: 'pointer', marginRight: '5px' }}
                        >
                          ‹
                        </span>
                      )}
                      
                      {/* Mostrar páginas */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <span
                            key={pageNum}
                            onClick={() => handleCambiarPagina(pageNum)}
                            style={{
                              cursor: 'pointer',
                              margin: '0 2px',
                              fontWeight: pageNum === pagination.page ? 'bold' : 'normal',
                              textDecoration: pageNum === pagination.page ? 'underline' : 'none'
                            }}
                          >
                            {pageNum}
                          </span>
                        );
                      })}
                      
                      {pagination.page < pagination.totalPages && (
                        <span 
                          onClick={() => handleCambiarPagina(pagination.page + 1)}
                          style={{ cursor: 'pointer', marginLeft: '5px' }}
                        >
                          ›
                        </span>
                      )}
                    </>
                  )}
                  
                  <span className="pagination-info">
                     Registros Totales {pagination.total}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisionInventario;