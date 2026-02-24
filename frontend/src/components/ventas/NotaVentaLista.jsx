import React, { useState, useEffect } from 'react';
import { X, FileText} from 'lucide-react'; 
import '../../styles/NotaVentaLista.css';
import NotaVentaFormulario from './NotaVentaFormulario';
import { obtenerNotasVenta, anularNotaVenta } from '../../services/notaVentaService';

const NotaVentaLista = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [selectedNota, setSelectedNota] = useState(null);
  const [showFormulario, setShowFormulario] = useState(false);
  const [paymentData, setPaymentData] = useState({
    fechaPago: '30/08/2025',
    metodoPago: '',
    destino: '',
    referencia: '',
    archivo: null,
    monto: 0
  });

  // Estados para datos reales
  const [notasVenta, setNotasVenta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    fechaEmision: '',
    buscar: '',
    serie: '',
    numero: '',
    estado: '',
    cliente: ''
  });

  const [visibleColumns, setVisibleColumns] = useState({
    // Campos principales del modelo NotaVenta
    id: true,
    fecha: true,
    serieComprobante: true,
    numeroComprobante: true,
    cliente: true,
    usuario: true,
    sucursal: true,
    subtotal: true,
    igv: true,
    total: true,
    estado: true,
    // Campos adicionales del modelo
    direccionCliente: true,
    establecimiento: true,
    moneda: true,
    tipoCambio: true,
    placa: false,
    ordenCompra: true,
    vendedor: true,
    fechaVencimiento: true,
    direccionEnvio: false,
    tipoPeriodo: false,
    observacion: true,
    // Campos de anulación
    motivoAnulacion: false,
    usuarioAnulacion: false,
    fechaAnulacion: false,
    // Campos de auditoría
    createdAt: false,
    updatedAt: false,
    // Acciones
    acciones: true
  });

  // Función para cargar notas de venta
  const cargarNotasVenta = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await obtenerNotasVenta(filtros);
      setNotasVenta(response.notasVenta || []);
    } catch (error) {
      console.error('Error al cargar notas de venta:', error);
      setError('Error al cargar las notas de venta');
      setNotasVenta([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarNotasVenta();
  }, []);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarNotasVenta();
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [filtros]);

  const columnLabels = {
    // Campos principales del modelo NotaVenta
    id: 'ID',
    fecha: 'Fecha',
    serieComprobante: 'Serie',
    numeroComprobante: 'Número',
    cliente: 'Cliente',
    usuario: 'Usuario',
    sucursal: 'Sucursal',
    subtotal: 'Subtotal',
    igv: 'IGV',
    total: 'Total',
    estado: 'Estado',
    // Campos adicionales del modelo
    direccionCliente: 'Dirección Cliente',
    establecimiento: 'Establecimiento',
    moneda: 'Moneda',
    tipoCambio: 'Tipo Cambio',
    placa: 'Placa',
    ordenCompra: 'Orden Compra',
    vendedor: 'Vendedor',
    fechaVencimiento: 'Fecha Vencimiento',
    direccionEnvio: 'Dirección Envío',
    tipoPeriodo: 'Tipo Periodo',
    observacion: 'Observación',
    // Campos de anulación
    motivoAnulacion: 'Motivo Anulación',
    usuarioAnulacion: 'Usuario Anulación',
    fechaAnulacion: 'Fecha Anulación',
    // Campos de auditoría
    createdAt: 'Fecha Creación',
    updatedAt: 'Fecha Actualización',
    // Acciones
    acciones: 'Acciones'
  };

  const handleOpenPaymentModal = (nota) => {
    setSelectedNota(nota);
    setShowPaymentModal(true);
    setPaymentData({
      fechaPago: '30/08/2025',
      metodoPago: '',
      destino: '',
      referencia: '',
      archivo: null,
      monto: 0
    });
  };

  const handleSavePayment = () => {
    console.log('Guardando pago:', paymentData);
    setShowPaymentModal(false);
  };

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Función para manejar cambios en filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      fechaEmision: '',
      buscar: '',
      serie: '',
      numero: '',
      estado: '',
      cliente: ''
    });
  };

  // Función para anular nota de venta
  const handleAnularNota = async (notaId) => {
    if (window.confirm('¿Está seguro de que desea anular esta nota de venta?')) {
      try {
        const motivo = prompt('Ingrese el motivo de anulación:');
        if (motivo) {
          await anularNotaVenta(notaId, motivo);
          alert('Nota de venta anulada exitosamente');
          cargarNotasVenta(); // Recargar la lista
        }
      } catch (error) {
        console.error('Error al anular nota de venta:', error);
        alert('Error al anular la nota de venta: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para formatear moneda
  const formatearMoneda = (monto) => {
    return parseFloat(monto || 0).toFixed(2);
  };

  return (
    <div className="nv-lista-container">
      <div className="nv-lista-header">
        <div className="nv-lista-title">
          <FileText className="nv-lista-icon" />
          <h2>NOTAS DE VENTA</h2>
        </div>
        <div className="nv-lista-actions">
          <button 
            className="nv-btn nv-btn-primary"
            onClick={() => setShowFormulario(true)}
          >
            Nuevo
          </button> 

          {/*  <button className="nv-btn nv-btn-secondary">Generar comprobante desde múltiples Notas</button>
          <button className="nv-btn nv-btn-secondary">Generar guía desde múltiples Notas</button>*/}
         
          <button 
            className="nv-btn nv-btn-icon"
            onClick={() => setShowColumnSettings(!showColumnSettings)}
          >
            Mostrar/Ocultar columnas
          </button>
        </div>
      </div>

      {showColumnSettings && (
        <div className="nv-column-settings">
          <div className="nv-column-grid">
            {Object.entries(columnLabels).map(([key, label]) => (
              <label key={key} className="nv-column-checkbox">
                <input
                  type="checkbox"
                  checked={visibleColumns[key]}
                  onChange={() => toggleColumn(key)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="nv-lista-filters">
        <div className="nv-filter-row">
          <input 
            type="date" 
            placeholder="Fecha de emisión" 
            className="nv-input"
            value={filtros.fechaEmision}
            onChange={(e) => handleFiltroChange('fechaEmision', e.target.value)}
          />
          <button 
            className="nv-btn-clear"
            onClick={limpiarFiltros}
            title="Limpiar filtros"
          >
            ✕
          </button>
          <input 
            type="text" 
            placeholder="Buscar cliente, vendedor..." 
            className="nv-input"
            value={filtros.buscar}
            onChange={(e) => handleFiltroChange('buscar', e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Serie" 
            className="nv-input"
            value={filtros.serie}
            onChange={(e) => handleFiltroChange('serie', e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Número" 
            className="nv-input"
            value={filtros.numero}
            onChange={(e) => handleFiltroChange('numero', e.target.value)}
          />
          <select 
            className="nv-input"
            value={filtros.estado}
            onChange={(e) => handleFiltroChange('estado', e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="anulado">Anulado</option>
          </select>
          <button 
            className="nv-btn nv-btn-search"
            onClick={cargarNotasVenta}
            title="Buscar"
          >
            🔍
          </button>
        </div>
        {loading && (
          <div className="nv-loading" style={{ textAlign: 'center', padding: '10px' }}>
            Cargando notas de venta...
          </div>
        )}
        {error && (
          <div className="nv-error" style={{ textAlign: 'center', padding: '10px', color: 'red' }}>
            {error}
          </div>
        )}
      </div>

      <div className="nv-table-wrapper">
        <table className="nv-table">
          <thead>
            <tr>
              <th>#</th>
              {visibleColumns.id && <th>ID</th>}
              {visibleColumns.fecha && <th>Fecha</th>}
              {visibleColumns.serieComprobante && <th>Serie</th>}
              {visibleColumns.numeroComprobante && <th>Número</th>}
              {visibleColumns.cliente && <th>Cliente</th>}
              {visibleColumns.usuario && <th>Usuario</th>}
              {visibleColumns.sucursal && <th>Sucursal</th>}
              {visibleColumns.subtotal && <th>Subtotal</th>}
              {visibleColumns.igv && <th>IGV</th>}
              {visibleColumns.total && <th>Total</th>}
              {visibleColumns.estado && <th>Estado</th>}
              {visibleColumns.direccionCliente && <th>Dirección Cliente</th>}
              {visibleColumns.establecimiento && <th>Establecimiento</th>}
              {visibleColumns.moneda && <th>Moneda</th>}
              {visibleColumns.tipoCambio && <th>Tipo Cambio</th>}
              {visibleColumns.placa && <th>Placa</th>}
              {visibleColumns.ordenCompra && <th>Orden Compra</th>}
              {visibleColumns.vendedor && <th>Vendedor</th>}
              {visibleColumns.fechaVencimiento && <th>Fecha Vencimiento</th>}
              {visibleColumns.direccionEnvio && <th>Dirección Envío</th>}
              {visibleColumns.tipoPeriodo && <th>Tipo Periodo</th>}
              {visibleColumns.observacion && <th>Observación</th>}
              {visibleColumns.motivoAnulacion && <th>Motivo Anulación</th>}
              {visibleColumns.usuarioAnulacion && <th>Usuario Anulación</th>}
              {visibleColumns.fechaAnulacion && <th>Fecha Anulación</th>}
              {visibleColumns.createdAt && <th>Fecha Creación</th>}
              {visibleColumns.updatedAt && <th>Fecha Actualización</th>}
              {visibleColumns.acciones && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {notasVenta.length === 0 ? (
              <tr>
                <td colSpan="20" style={{ textAlign: 'center', padding: '20px' }}>
                  {loading ? 'Cargando...' : 'No se encontraron notas de venta'}
                </td>
              </tr>
            ) : (
              notasVenta.map((nota, index) => (
                <tr key={nota.id}>
                  <td>{index + 1}</td>
                  {visibleColumns.id && <td>{nota.id}</td>}
                  {visibleColumns.fecha && <td>{formatearFecha(nota.fecha)}</td>}
                  {visibleColumns.serieComprobante && <td>{nota.serieComprobante}</td>}
                  {visibleColumns.numeroComprobante && <td>{nota.numeroComprobante}</td>}
                  {visibleColumns.cliente && <td>{nota.Cliente?.nombre || nota.clienteNombre || '-'}</td>}
                  {visibleColumns.usuario && <td>{nota.Usuario?.nombre || nota.usuarioNombre || '-'}</td>}
                  {visibleColumns.sucursal && <td>{nota.Sucursal?.nombre || nota.sucursalNombre || '-'}</td>}
                  {visibleColumns.subtotal && <td>S/. {formatearMoneda(nota.subtotal)}</td>}
                  {visibleColumns.igv && <td>S/. {formatearMoneda(nota.igv)}</td>}
                  {visibleColumns.total && <td>S/. {formatearMoneda(nota.total)}</td>}
                  {visibleColumns.estado && (
                    <td>
                      <span className={`nv-badge ${nota.estado === 'anulada' ? 'nv-badge-danger' : 'nv-badge-success'}`}>
                        {nota.estado}
                      </span>
                    </td>
                  )}
                  {visibleColumns.direccionCliente && <td>{nota.direccionCliente || '-'}</td>}
                  {visibleColumns.establecimiento && <td>{nota.establecimiento || '-'}</td>}
                  {visibleColumns.moneda && <td>{nota.moneda === 'soles' ? 'Soles' : 'Dólares'}</td>}
                  {visibleColumns.tipoCambio && <td>{formatearMoneda(nota.tipoCambio)}</td>}
                  {visibleColumns.placa && <td>{nota.placa || '-'}</td>}
                  {visibleColumns.ordenCompra && <td>{nota.ordenCompra || '-'}</td>}
                  {visibleColumns.vendedor && <td>{nota.vendedor || '-'}</td>}
                  {visibleColumns.fechaVencimiento && <td>{nota.fechaVencimiento ? formatearFecha(nota.fechaVencimiento) : '-'}</td>}
                  {visibleColumns.direccionEnvio && <td>{nota.direccionEnvio || '-'}</td>}
                  {visibleColumns.tipoPeriodo && <td>{nota.tipoPeriodo || '-'}</td>}
                  {visibleColumns.observacion && <td>{nota.observacion || '-'}</td>}
                  {visibleColumns.motivoAnulacion && <td>{nota.motivoAnulacion || '-'}</td>}
                  {visibleColumns.usuarioAnulacion && <td>{nota.UsuarioAnulacion?.nombre || nota.usuarioAnulacionNombre || '-'}</td>}
                  {visibleColumns.fechaAnulacion && <td>{nota.fechaAnulacion ? formatearFecha(nota.fechaAnulacion) : '-'}</td>}
                  {visibleColumns.createdAt && <td>{formatearFecha(nota.createdAt)}</td>}
                  {visibleColumns.updatedAt && <td>{formatearFecha(nota.updatedAt)}</td>}
                  {visibleColumns.acciones && (
                    <td>
                      {nota.estado !== 'anulada' && (
                        <button 
                          className="nv-btn-table nv-btn-red-solid"
                          onClick={() => handleAnularNota(nota.id)}
                          title="Anular nota de venta"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="nv-footer">
        <div className="nv-totals">
          <span>
            Total notas de venta en soles S/. {formatearMoneda(
              notasVenta
                .filter(nota => nota.estado !== 'anulada')
                .reduce((sum, nota) => sum + (parseFloat(nota.total) || 0), 0)
            )}
          </span>
          <span>
            Total subtotal S/. {formatearMoneda(
              notasVenta
                .filter(nota => nota.estado !== 'anulada')
                .reduce((sum, nota) => sum + (parseFloat(nota.subtotal) || 0), 0)
            )}
          </span>
          <span>
            Total IGV S/. {formatearMoneda(
              notasVenta
                .filter(nota => nota.estado !== 'anulada')
                .reduce((sum, nota) => sum + (parseFloat(nota.igv) || 0), 0)
            )}
          </span>
        </div>
        <div className="nv-pagination">
          <span>Total: {notasVenta.length}</span>
          <button className="nv-btn-pagination">◀</button>
          <button className="nv-btn-pagination">▶</button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="nv-modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="nv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nv-modal-header">
              <h3>Pagos del comprobante: {selectedNota?.serieComprobante}-{selectedNota?.numeroComprobante}</h3>
              <button 
                className="nv-modal-close"
                onClick={() => setShowPaymentModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="nv-modal-body">
              <table className="nv-modal-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha de pago</th>
                    <th>Método de pago</th>
                    <th>Destino</th>
                    <th>Referencia</th>
                    <th>Archivo</th>
                    <th>Monto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>
                      <input 
                        type="text" 
                        value={paymentData.fechaPago}
                        onChange={(e) => setPaymentData({...paymentData, fechaPago: e.target.value})}
                        className="nv-modal-input"
                      />
                    </td>
                    <td>
                      <select 
                        className="nv-modal-select"
                        value={paymentData.metodoPago}
                        onChange={(e) => setPaymentData({...paymentData, metodoPago: e.target.value})}
                      >
                        <option value="">Seleccionar</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                      </select>
                    </td>
                    <td>
                      <select 
                        className="nv-modal-select"
                        value={paymentData.destino}
                        onChange={(e) => setPaymentData({...paymentData, destino: e.target.value})}
                      >
                        <option value="">Seleccionar</option>
                        <option value="caja">Caja</option>
                        <option value="banco">Banco</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="text"
                        value={paymentData.referencia}
                        onChange={(e) => setPaymentData({...paymentData, referencia: e.target.value})}
                        className="nv-modal-input"
                      />
                    </td>
                    <td>
                      <button className="nv-btn-upload">📁</button>
                    </td>
                    <td>
                      <input 
                        type="number"
                        value={paymentData.monto}
                        onChange={(e) => setPaymentData({...paymentData, monto: e.target.value})}
                        className="nv-modal-input"
                      />
                    </td>
                    <td>
                      <button className="nv-btn-save" onClick={handleSavePayment}>✓</button>
                      <button className="nv-btn-delete">✗</button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="nv-modal-summary">
                <div className="nv-summary-item">
                  <span>SUBTOTAL</span>
                  <span className="nv-summary-value">S/. {formatearMoneda(selectedNota?.subtotal || 0)}</span>
                </div>
                <div className="nv-summary-item">
                  <span>IGV</span>
                  <span className="nv-summary-value">S/. {formatearMoneda(selectedNota?.igv || 0)}</span>
                </div>
                <div className="nv-summary-item">
                  <span>TOTAL</span>
                  <span className="nv-summary-value">S/. {formatearMoneda(selectedNota?.total || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar formulario cuando showFormulario sea true */}
      {showFormulario && (
        <div className="nv-formulario-overlay">
          <div className="nv-formulario-container">
            <div className="nv-formulario-header">
              <button 
                className="nv-btn-close"
                onClick={() => setShowFormulario(false)}
              >
                ✕
              </button>
            </div>
            <NotaVentaFormulario />
          </div>
        </div>
      )}
    
    </div>
  );
};

export default NotaVentaLista