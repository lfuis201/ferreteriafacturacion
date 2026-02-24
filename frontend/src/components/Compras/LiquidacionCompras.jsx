import React, { useState, useEffect } from 'react';
import '../../styles/LiquidacionCompras.css';
import { 
  obtenerLiquidaciones, 
  crearLiquidacion, 
  actualizarLiquidacion, 
  eliminarLiquidacion, 
  buscarLiquidaciones 
} from '../../services/liquidacionCompraService';
import { obtenerProveedores } from '../../services/proveedorService';
import FormularioVentaProductServicio from './FormularioVentaProductServicio';

const LiquidacionCompras = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Número');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [mostrarVentaForm, setMostrarVentaForm] = useState(false);
  const [formData, setFormData] = useState({
    tipoComprobante: 'LIQUIDACIÓN DE COMPRA',
    serie: 'L001',
    fechaEmision: '2025-10-06',
    proveedor: '',
    moneda: 'Soles',
    tipoCambio: '3.468',
    observaciones: '',
    condicionPago: ''
  });

  // Cargar proveedores y liquidaciones iniciales
  useEffect(() => {
    const cargarInicial = async () => {
      try {
        setLoading(true);
        const [provRes, lqRes] = await Promise.all([
          obtenerProveedores(),
          obtenerLiquidaciones()
        ]);
        setProveedores(provRes.proveedores || provRes || []);
        setLiquidaciones(lqRes.liquidaciones || lqRes || []);
      } catch (error) {
        console.error('Error cargando inicial Liquidaciones/Proveedores:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarInicial();
  }, []);

  const handleOpenModal = () => {
    setEditingItem(null);
    setFormData({
      tipoComprobante: 'LIQUIDACIÓN DE COMPRA',
      serie: 'L001',
      fechaEmision: new Date().toISOString().slice(0, 10),
      proveedor: '',
      moneda: 'Soles',
      tipoCambio: '3.468',
      observaciones: '',
      condicionPago: ''
    });
    setMostrarVentaForm(false);
    setShowModal(true);
  };

  // Cuando el formulario de producto/servicio confirma agregar
  const handleProductoAgregado = async (producto) => {
    try {
      setLoading(true);
      // Calcular totales simples a partir del precio del producto
      const precio = parseFloat(producto?.precioVenta || 0);
      const aplicaIgv = !!producto?.tieneIgv; // si existe ese flag
      const tGravado = aplicaIgv ? (precio / 1.18) : precio;
      const tIgv = aplicaIgv ? (precio - tGravado) : 0;
      const total = parseFloat((tGravado + tIgv).toFixed(2));

      // Datos visibles en la tabla
      const vendedorNombre = (proveedores.find(p => p.id === parseInt(formData.proveedor))?.nombre) || '—';
      const numeroGenerado = `${formData.serie || 'L001'}-${Date.now().toString().slice(-6)}`;

      const payload = {
        tipoComprobante: formData.tipoComprobante,
        serie: formData.serie,
        numero: numeroGenerado,
        fechaEmision: formData.fechaEmision,
        proveedorId: formData.proveedor || null,
        vendedor: vendedorNombre,
        moneda: formData.moneda === 'Soles' ? 'PEN' : 'USD',
        tipoCambio: formData.tipoCambio,
        observaciones: formData.observaciones,
        condicionPago: formData.condicionPago,
        estado: 'PENDIENTE',
       
        tInafecto: 0,
        tExonerado: 0,
        tGravado,
        tIgv,
        total
      };

      if (editingItem?.id) {
        await actualizarLiquidacion(editingItem.id, payload);
      } else {
        await crearLiquidacion(payload);
      }

      const lqRes = await obtenerLiquidaciones();
      setLiquidaciones(lqRes.liquidaciones || lqRes || []);
      setMostrarVentaForm(false);
      handleCloseModal();
    } catch (error) {
      console.error('Error agregando a la liquidación:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAbrirFormularioProducto = async () => {
    // Usamos este botón para registrar la liquidación (sin cambiar estilos)
    try {
      setMostrarVentaForm(true);
    } catch (error) {
      console.error('Error abriendo formulario de producto/servicio:', error);
    }
  };

  const handleCancelar = () => {
    handleCloseModal();
  };

  const handleBuscar = async () => {
    try {
      setLoading(true);
      const filtros = {};
      if (filterType === 'Número') filtros.numero = searchTerm;
      if (filterType === 'Fecha Emisión') filtros.fechaEmision = searchTerm;
      if (filterType === 'Vendedor') filtros.vendedor = searchTerm;
    
      const res = await buscarLiquidaciones(filtros);
      setLiquidaciones(res.liquidaciones || res || []);
    } catch (error) {
      console.error('Error buscando liquidaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (item) => {
    setEditingItem(item);
    setFormData({
      tipoComprobante: item.tipoComprobante || 'LIQUIDACIÓN DE COMPRA',
      serie: item.serie || 'L001',
      fechaEmision: (item.fechaEmision || '').slice(0, 10),
      proveedor: item.proveedorId || '',
      moneda: item.moneda === 'USD' ? 'Dólares' : 'Soles',
      tipoCambio: item.tipoCambio || '3.468',
      observaciones: item.observaciones || '',
      condicionPago: item.condicionPago || ''
    });
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    const ok = window.confirm('¿Eliminar esta liquidación?');
    if (!ok) return;
    try {
      setLoading(true);
      await eliminarLiquidacion(id);
      const lqRes = await obtenerLiquidaciones();
      setLiquidaciones(lqRes.liquidaciones || lqRes || []);
    } catch (error) {
      console.error('Error eliminando liquidación:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lq-container">
      <div className="lq-header">
        <h1 className="lq-title">
          <span className="lq-icon">📋</span>
          LIQUIDACIONES DE COMPRAS
        </h1>
        <button className="lq-btn lq-btn-nuevo" onClick={handleOpenModal}>
          ➕ Nuevo
        </button>
      </div>

      <div className="lq-content">
        <div className="lq-filters">
          <select 
            className="lq-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option>Número</option>
            <option>Fecha Emisión</option>
            <option>Vendedor</option>
          
          </select>
          <div className="lq-search-box">
            <input
              type="text"
              className="lq-search-input"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="lq-btn lq-btn-search" onClick={handleBuscar}>
              🔍 Buscar
            </button>
          </div>
        </div>

        <div className="lq-table-wrapper">
          <table className="lq-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha Emisión</th>
                <th>Vendedor</th>
                <th>Número</th>
       
                <th>T.Inafecto</th>
                <th>T.Exonerado</th>
                <th>T.Gravado</th>
                <th>T.Igv</th>
                <th>Total</th>
                <th>Acciones</th>
                
              </tr>
            </thead>
            <tbody>
              {liquidaciones.length === 0 ? (
                <tr>
                  <td colSpan="11" className="lq-empty-state">
                    No hay liquidaciones de compras registradas
                  </td>
                </tr>
              ) : (
                liquidaciones.map((liquidacion, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{(liquidacion.fechaEmision || '').slice(0,10)}</td>
                    <td>{liquidacion.vendedor || '-'}</td>
                    <td>{liquidacion.numero || '-'}</td>
                 
                    <td className="lq-amount">{liquidacion.tInafecto || '0.00'}</td>
                    <td className="lq-amount">{liquidacion.tExonerado || '0.00'}</td>
                    <td className="lq-amount">{liquidacion.tGravado || '0.00'}</td>
                    <td className="lq-amount">{liquidacion.tIgv || '0.00'}</td>
                    <td className="lq-amount lq-total">{liquidacion.total || '0.00'}</td>
                    <td>
                      <div className="lq-action-buttons">
                        <button className="lq-btn-action" onClick={() => handleEditar(liquidacion)}>Editar</button>
                        <button className="lq-btn-action" onClick={() => handleEliminar(liquidacion.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="lq-pagination">
          <span>Total 0</span>
          <div className="lq-pagination-controls">
            <button className="lq-pagination-btn">&lt;</button>
            <button className="lq-pagination-btn lq-active">1</button>
            <button className="lq-pagination-btn">&gt;</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="lq-modal-overlay" onClick={handleCloseModal}>
          <div className="lq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lq-modal-header">
              <h3>Nuevo Liquidacion de Compra</h3>
              <button className="lq-modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="lq-modal-body">
              <div className="lq-form-group">
                <label className="lq-label">Tipo comprobante</label>
                <select 
                  className="lq-input"
                  name="tipoComprobante"
                  value={formData.tipoComprobante}
                  onChange={handleInputChange}
                >
                  <option>LIQUIDACIÓN DE COMPRA</option>
                 
                </select>
              </div>

              <div className="lq-form-group">
                <label className="lq-label">Serie</label>
                <input
                  type="text"
                  className="lq-input"
                  name="serie"
                  value={formData.serie}
                  onChange={handleInputChange}
                />
              </div>

              <div className="lq-form-group">
                <label className="lq-label">Fec Emisión</label>
                <input
                  type="date"
                  className="lq-input"
                  name="fechaEmision"
                  value={formData.fechaEmision}
                  onChange={handleInputChange}
                />
              </div>

              <div className="lq-form-row">
                <div className="lq-form-group">
                  <label className="lq-label">
                    Proveedor 
                   
                  </label>
                  <select 
                  className="lq-input"
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleInputChange}
                  >
                    <option value="">Seleccionar</option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre || p.razonSocial}</option>
                    ))}
                  </select>
                </div>

                <div className="lq-form-group">
                  <label className="lq-label">Moneda</label>
                  <select 
                    className="lq-input"
                    name="moneda"
                    value={formData.moneda}
                    onChange={handleInputChange}
                  >
                    <option>Soles</option>
                    <option>Dólares</option>
                  </select>
                </div>

                <div className="lq-form-group">
                  <label className="lq-label">
                    Tipo de cambio 
                    <span className="lq-info-icon" title="Tipo de cambio">ⓘ</span>
                  </label>
                  <input
                    type="text"
                    className="lq-input"
                    name="tipoCambio"
                    value={formData.tipoCambio}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="lq-form-group">
                <label className="lq-label">Observaciones</label>
                <textarea
                  className="lq-textarea"
                  name="observaciones"
                  placeholder="Observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="lq-form-group">
                <label className="lq-label">Condicion de pago</label>
                <select 
                  className="lq-input"
                  name="condicionPago"
                  value={formData.condicionPago}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar</option>
                  <option>Contado</option>
                  <option>Crédito</option>
                </select>
              </div>

              <div className="lq-modal-actions">
                <button className="lq-btn lq-btn-agregar" onClick={handleAbrirFormularioProducto}>
                  + Agregar Producto
                </button>
              </div>
              {mostrarVentaForm && (
                <div style={{ marginTop: '16px' }}>
                  <FormularioVentaProductServicio onProductoSeleccionado={handleProductoAgregado} />
                </div>
              )}
            </div>
            <div className="lq-modal-footer">
              <button className="lq-btn lq-btn-cancelar" onClick={handleCancelar}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiquidacionCompras;