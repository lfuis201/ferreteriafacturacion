import React, { useState, useEffect } from 'react';
import '../../styles/ConsultaKardex.css';
import { consultarKardex, obtenerProductosActivos, exportarKardexExcel, exportarKardexPdf } from '../../services/inventarioService';

const ConsultaKardex = () => {
  const [producto, setProducto] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaTermino, setFechaTermino] = useState('');
  const [showKardexResults, setShowKardexResults] = useState(false);
  const [kardexData, setKardexData] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await obtenerProductosActivos();
      setProductos(response.data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar la lista de productos');
    }
  };

  const handleBuscarKardex = async () => {
    if (!producto) {
      setError('Por favor seleccione un producto');
      return;
    }

    if (!fechaInicio || !fechaTermino) {
      setError('Por favor seleccione las fechas de inicio y término');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const filtros = {
        productoId: producto,
        fechaInicio: fechaInicio,
        fechaFin: fechaTermino
      };

      const response = await consultarKardex(filtros);
      
      // Transformar los datos para mostrar en la tabla
      const movimientosTransformados = response.movimientos?.map((movimiento, index) => ({
        id: movimiento.id || index + 1,
        fechaHoraTransaccion: new Date(movimiento.createdAt).toLocaleString('es-ES'),
        tipoTransaccion: movimiento.tipoMovimiento || '-',
        numero: movimiento.numeroDocumento || '-',
        nvAsociada: movimiento.notaVentaId || '-',
        docAsociado: movimiento.documentoAsociado || '-',
        fechaEmision: movimiento.fechaEmision ? new Date(movimiento.fechaEmision).toLocaleDateString('es-ES') : '-',
        entrada: movimiento.tipoMovimiento === 'ENTRADA' ? movimiento.cantidad.toString() : '',
        precio: movimiento.precioUnitario ? movimiento.precioUnitario.toFixed(2) : '',
        totalCompra: movimiento.tipoMovimiento === 'ENTRADA' ? (movimiento.cantidad * movimiento.precioUnitario).toFixed(2) : '-',
        salida: movimiento.tipoMovimiento === 'SALIDA' ? movimiento.cantidad.toString() : '',
        precioVenta: movimiento.tipoMovimiento === 'SALIDA' ? movimiento.precioUnitario?.toFixed(2) || '' : '',
        totalVenta: movimiento.tipoMovimiento === 'SALIDA' ? (movimiento.cantidad * (movimiento.precioUnitario || 0)).toFixed(2) : '-',
        saldo: movimiento.saldoActual?.toString() || '',
        costoUnit: movimiento.costoUnitario?.toFixed(2) || '',
        saldoFinal: movimiento.valorSaldo?.toFixed(2) || ''
      })) || [];

      setKardexData(movimientosTransformados);
      setShowKardexResults(true);
    } catch (error) {
      console.error('Error al consultar kardex:', error);
      setError('Error al consultar el kardex: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportarPDF = async () => {
    try {
      setLoading(true);
      const filtros = {
        productoId: producto,
        fechaInicio: fechaInicio,
        fechaFin: fechaTermino
      };
      
      await exportarKardexPdf(filtros);
      console.log('Kardex exportado a PDF exitosamente');
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      setError('Error al exportar el kardex a PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportarExcel = async () => {
    try {
      setLoading(true);
      const filtros = {
        productoId: producto,
        fechaInicio: fechaInicio,
        fechaFin: fechaTermino
      };
      
      await exportarKardexExcel(filtros);
      console.log('Kardex exportado a Excel exitosamente');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      setError('Error al exportar el kardex a Excel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consulta-kardex-wrapper">

      <div className="stock-historico-ConsultaKardex">
       
        <p>CONSULTA KARDEX COSTO PROMEDIO</p>
      </div>
      {/* Header con fondo rojo */}
      <div className="consulta-kardex-red-header">
        <div className="consulta-kardex-filters-row">
          <div className="consulta-kardex-filter-item">
            <label>Producto</label>
            <select
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              className="consulta-kardex-filter-input"
            >
              <option value="">Seleccione un producto</option>
              {productos.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.codigo} - {prod.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="consulta-kardex-filter-item">
            <label>Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="consulta-kardex-filter-input"
              placeholder="dd/mm/yyyy"
            />
          </div>

          <div className="consulta-kardex-filter-item">
            <label>Fecha término</label>
            <input
              type="date"
              value={fechaTermino}
              onChange={(e) => setFechaTermino(e.target.value)}
              className="consulta-kardex-filter-input"
              placeholder="dd/mm/yyyy"
            />
          </div>
        </div>

        <div className="consulta-kardex-search-section">
          <button 
            className="consulta-kardex-search-button"
            onClick={handleBuscarKardex}
            disabled={loading}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        
        {error && (
          <div className="consulta-kardex-error-message" style={{
            color: 'white',
            backgroundColor: 'rgba(220, 53, 69, 0.8)',
            padding: '10px',
            borderRadius: '4px',
            margin: '10px 0',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="consulta-kardex-content-area">
        {/* Results Table */}
        {showKardexResults && (
          <div className="consulta-kardex-results-container">
            <div className="consulta-kardex-action-bar">
             
              <button 
                className="consulta-kardex-btn consulta-kardex-btn-pdf"
                onClick={handleExportarPDF}
              >
                Exportar PDF
              </button>
              <button 
                className="consulta-kardex-btn consulta-kardex-btn-excel"
                onClick={handleExportarExcel}
              >
                Exportar Excel
              </button>
            </div>

            <div className="consulta-kardex-table-wrapper">
              <table className="consulta-kardex-data-table">
                <thead>
                  <tr className="consulta-kardex-header-row">
                    <th className="consulta-kardex-th">#</th>
                    <th className="consulta-kardex-th">Fecha y hora transacción</th>
                    <th className="consulta-kardex-th">Tipo transacción</th>
                    <th className="consulta-kardex-th">Número</th>
                    <th className="consulta-kardex-th">NV. Asociada</th>
                    <th className="consulta-kardex-th">Doc. Asociado</th>
                    <th className="consulta-kardex-th">Fecha emisión</th>
                    <th className="consulta-kardex-th">Entrada</th>
                    <th className="consulta-kardex-th">Precio</th>
                    <th className="consulta-kardex-th consulta-kardex-total-compra">Total Compra</th>
                    <th className="consulta-kardex-th">Salida</th>
                    <th className="consulta-kardex-th">Precio</th>
                    <th className="consulta-kardex-th consulta-kardex-total-venta">Total Venta</th>
                    <th className="consulta-kardex-th">Saldo</th>
                    <th className="consulta-kardex-th">Costo unit</th>
                    <th className="consulta-kardex-th">Saldo Final</th>
                  </tr>
                </thead>
                <tbody>
                  {kardexData.map((item, index) => (
                    <tr key={item.id} className="consulta-kardex-data-row">
                      <td className="consulta-kardex-cell">{index + 1}</td>
                      <td className="consulta-kardex-cell">{item.fechaHoraTransaccion}</td>
                      <td className="consulta-kardex-cell">{item.tipoTransaccion}</td>
                      <td className="consulta-kardex-cell">{item.numero}</td>
                      <td className="consulta-kardex-cell">{item.nvAsociada}</td>
                      <td className="consulta-kardex-cell">{item.docAsociado}</td>
                      <td className="consulta-kardex-cell">{item.fechaEmision}</td>
                      <td className="consulta-kardex-cell">{item.entrada}</td>
                      <td className="consulta-kardex-cell">{item.precio}</td>
                      <td className="consulta-kardex-cell consulta-kardex-compra-cell">{item.totalCompra}</td>
                      <td className="consulta-kardex-cell">{item.salida}</td>
                      <td className="consulta-kardex-cell">{item.precioVenta}</td>
                      <td className="consulta-kardex-cell consulta-kardex-venta-cell">{item.totalVenta}</td>
                      <td className="consulta-kardex-cell">{item.saldo}</td>
                      <td className="consulta-kardex-cell">{item.costoUnit}</td>
                      <td className="consulta-kardex-cell">{item.saldoFinal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="consulta-kardex-pagination-area">
              <span className="consulta-kardex-pagination-info">Total 2</span>
              <span className="consulta-kardex-page-link">1</span>
              <span className="consulta-kardex-page-link"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultaKardex;