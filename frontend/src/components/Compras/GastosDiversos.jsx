import React, { useEffect, useState } from 'react';
import '../../styles/GastosDiversos.css';
import { listarGastosDiversos, crearGastoDiverso, actualizarGastoDiverso, eliminarGastoDiverso } from '../../services/gastosDiversosService';
import { obtenerProveedores } from '../../services/proveedorService';

const GastosDiversos = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [gastos, setGastos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
  const [filtros, setFiltros] = useState({ fecha: '', q: '', page: 1 });
  const [detalleTemp, setDetalleTemp] = useState({ descripcion: '', total: '' });
  const [proveedores, setProveedores] = useState([]);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    tipoComprobante: 'GASTO POR DEFECTO',
    numero: '',
    moneda: 'Soles',
    fechaEmision: '',
    tipoCambio: '',
    proveedorId: '',
    motivo: '',
    periodo: '',
    metodosGasto: [
      { metodo: 'CAJA GENERAL', destino: '', referencia: '', glosa: '', monto: 0 }
    ],
    detalles: []
  });

  useEffect(() => {
    const init = async () => {
      try {
        const provRes = await obtenerProveedores();
        setProveedores(provRes?.proveedores || []);
      } catch (e) {
        console.error('Error cargando proveedores', e.message);
      }
      await cargarGastos();
    };
    init();
  }, []);

  const cargarGastos = async (page = filtros.page) => {
    try {
      const res = await listarGastosDiversos({ fecha: filtros.fecha, q: filtros.q, page, limit: pagination.limit });
      setGastos(res?.gastos || []);
      if (res?.pagination) setPagination(res.pagination);
    } catch (e) {
      console.error('Error al listar gastos diversos', e.message);
    }
  };

  const agregarMetodoGasto = () => {
    setFormData({
      ...formData,
      metodosGasto: [
        ...formData.metodosGasto,
        { metodo: 'CAJA GENERAL', destino: '', referencia: '', glosa: '', monto: 0 }
      ]
    });
  };

  const eliminarMetodoGasto = (index) => {
    const nuevosMetodos = formData.metodosGasto.filter((_, i) => i !== index);
    setFormData({ ...formData, metodosGasto: nuevosMetodos });
  };

  const handleMetodoChange = (index, field, value) => {
    const nuevosMetodos = [...formData.metodosGasto];
    nuevosMetodos[index][field] = value;
    setFormData({ ...formData, metodosGasto: nuevosMetodos });
  };

  const agregarDetalle = () => {
    if (detalleTemp.descripcion && detalleTemp.total) {
      setFormData({
        ...formData,
        detalles: [...formData.detalles, { ...detalleTemp }]
      });
      setDetalleTemp({ descripcion: '', total: '' });
      setShowDetalleModal(false);
    }
  };

  const eliminarDetalle = (index) => {
    const nuevosDetalles = formData.detalles.filter((_, i) => i !== index);
    setFormData({ ...formData, detalles: nuevosDetalles });
  };

  const calcularTotal = () => {
    return formData.detalles.reduce((acc, det) => acc + parseFloat(det.total || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tipoComprobante: formData.tipoComprobante,
        numero: formData.numero || null,
        moneda: formData.moneda === 'Dólares' ? 'USD' : 'PEN',
        tipoCambio: formData.moneda === 'Dólares' ? parseFloat(formData.tipoCambio || 0) : null,
        fechaEmision: formData.fechaEmision,
        proveedorId: formData.proveedorId ? parseInt(formData.proveedorId) : null,
        motivo: formData.motivo || null,
        periodo: formData.periodo || null,
        metodosGasto: formData.metodosGasto.map(m => ({
          metodo: m.metodo,
          destino: m.destino || null,
          referencia: m.referencia || null,
          glosa: m.glosa || null,
          monto: parseFloat(m.monto || 0)
        })),
        detalles: formData.detalles.map(d => ({
          descripcion: d.descripcion,
          total: parseFloat(d.total || 0)
        }))
      };

      if (editId) {
        await actualizarGastoDiverso(editId, payload);
      } else {
        await crearGastoDiverso(payload);
      }
      setShowModal(false);
      setEditId(null);
      // Reset form
      setFormData({
        tipoComprobante: 'GASTO POR DEFECTO',
        numero: '',
        moneda: 'Soles',
        fechaEmision: '',
        tipoCambio: '',
        proveedorId: '',
        motivo: '',
        periodo: '',
        metodosGasto: [
          { metodo: 'CAJA GENERAL', destino: '', referencia: '', glosa: '', monto: 0 }
        ],
        detalles: []
      });
      await cargarGastos();
    } catch (error) {
      alert(error.message || 'No se pudo guardar el gasto diverso');
    }
  };

  const abrirEdicion = (gasto) => {
    setEditId(gasto.id);
    setFormData({
      tipoComprobante: gasto.tipoComprobante || 'GASTO POR DEFECTO',
      numero: gasto.numero || '',
      moneda: gasto.moneda === 'USD' ? 'Dólares' : 'Soles',
      fechaEmision: gasto.fechaEmision || '',
      tipoCambio: gasto.tipoCambio || '',
      proveedorId: gasto.proveedorId || gasto.Proveedor?.id || '',
      motivo: gasto.motivo || '',
      periodo: gasto.periodo || '',
      metodosGasto: (gasto.MetodoGastoDiversos || gasto.metodosGasto || []).map(m => ({
        metodo: m.metodo,
        destino: m.destino || '',
        referencia: m.referencia || '',
        glosa: m.glosa || '',
        monto: m.monto || 0
      })),
      detalles: (gasto.DetalleGastoDiversos || gasto.detalles || []).map(d => ({
        descripcion: d.descripcion,
        total: d.total
      }))
    });
    setShowModal(true);
  };

  const eliminarGasto = async (id) => {
    if (!confirm('¿Eliminar gasto diverso?')) return;
    try {
      await eliminarGastoDiverso(id);
      await cargarGastos();
    } catch (error) {
      alert(error.message || 'No se pudo eliminar');
    }
  };

  return (
    <div className="gastos-diversos-container">
      <div className="gastos-diversos-header">
        <div className="gastos-diversos-title">
          <span className="gastos-diversos-icon">💰</span>
          <h1>GASTOS DIVERSOS</h1>
        </div>
        <button className="gastos-diversos-btn-nuevo" onClick={() => setShowModal(true)}>
          ⊕ Nuevo
        </button>
      </div>

      <div className="gastos-diversos-filters">
        <input 
          type="date" 
          className="gastos-diversos-date-input"
          placeholder="Fecha de emisión"
          value={filtros.fecha}
          onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
        />
        <input 
          type="text" 
          className="gastos-diversos-search-input"
          placeholder="🔍 Buscar"
          value={filtros.q}
          onChange={(e) => setFiltros({ ...filtros, q: e.target.value })}
        />
        <button className="gastos-diversos-btn-buscar" onClick={() => cargarGastos(1)}>🔍 Buscar</button>
      </div>

      <div className="gastos-diversos-table-wrapper">
        <table className="gastos-diversos-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Tipo</th>
              <th>Número</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.length === 0 ? (
              <tr>
                <td colSpan="8" className="gastos-diversos-empty">
                  Total 0
                </td>
              </tr>
            ) : (
              gastos.map((gasto, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{gasto.fechaEmision}</td>
                  <td>{gasto.Proveedor?.nombre || '-'}</td>
                  <td>{gasto.tipoComprobante}</td>
                  <td>{gasto.numero}</td>
                  <td>{gasto.total}</td>
                  <td>{gasto.estado}</td>
                  <td>
                    <button className="gastos-diversos-page-btn" onClick={() => abrirEdicion(gasto)}>Editar</button>
                    <button className="gastos-diversos-page-btn" onClick={() => eliminarGasto(gasto.id)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="gastos-diversos-pagination">
          <button className="gastos-diversos-page-btn" disabled={pagination.page <= 1} onClick={() => { setFiltros({ ...filtros, page: Math.max(1, pagination.page - 1) }); cargarGastos(Math.max(1, pagination.page - 1)); }}>‹</button>
          <button className="gastos-diversos-page-btn gastos-diversos-active">{pagination.page}</button>
          <button className="gastos-diversos-page-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => { const next = Math.min(pagination.totalPages, pagination.page + 1); setFiltros({ ...filtros, page: next }); cargarGastos(next); }}>›</button>
        </div>
      </div>

      {/* Modal Principal */}
      {showModal && (
        <div className="gastos-diversos-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="gastos-diversos-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gastos-diversos-modal-header">
              <h2>Nuevo Gasto</h2>
              <button 
                className="gastos-diversos-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="gastos-diversos-modal-body">
              <div className="gastos-diversos-form-section">
                <div className="gastos-diversos-form-row">
                  <div className="gastos-diversos-form-group">
                    <label>Tipo comprobante</label>
                    <select 
                      value={formData.tipoComprobante}
                      onChange={(e) => setFormData({...formData, tipoComprobante: e.target.value})}
                      className="gastos-diversos-select"
                    >
                      <option value="GASTO POR DEFECTO">GASTO POR DEFECTO</option>
                      
                    </select>
                  </div>

                  <div className="gastos-diversos-form-group">
                    <label>Número *</label>
                    <input 
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData({...formData, numero: e.target.value})}
                      className="gastos-diversos-input"
                    />
                  </div>

                  <div className="gastos-diversos-form-group">
                    <label>Moneda</label>
                    <select 
                      value={formData.moneda}
                      onChange={(e) => setFormData({...formData, moneda: e.target.value})}
                      className="gastos-diversos-select"
                    >
                      <option value="Soles">Soles</option>
                      <option value="Dólares">Dólares</option>
                    </select>
                  </div>

                  <div className="gastos-diversos-form-group">
                    <label>Fec Emisión</label>
                    <input 
                      type="date"
                      value={formData.fechaEmision}
                      onChange={(e) => setFormData({...formData, fechaEmision: e.target.value})}
                      className="gastos-diversos-input"
                    />
                  </div>

                  <div className="gastos-diversos-form-group">
                    <label>
                      Tipo de cambio <span className="gastos-diversos-info-icon">ⓘ</span>
                    </label>
                    <input 
                      type="text"
                      value={formData.tipoCambio}
                      onChange={(e) => setFormData({...formData, tipoCambio: e.target.value})}
                      className="gastos-diversos-input"
                    />
                  </div>
                </div>

                <div className="gastos-diversos-form-row">
                  <div className="gastos-diversos-form-group">
                    <label>
                      Proveedor
                    </label>
                    <select 
                      value={formData.proveedorId}
                      onChange={(e) => setFormData({...formData, proveedorId: e.target.value})}
                      className="gastos-diversos-select"
                    >
                      <option value="">Seleccionar</option>
                      {proveedores.map(p => (
                        <option key={p.id} value={p.id}>{p.numeroDocumento} - {p.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="gastos-diversos-form-group">
                    <label>
                      Motivo
                    </label>
                    <input 
                      type="text"
                      value={formData.motivo}
                      onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                      className="gastos-diversos-input"
                    />
                  </div>

                  <div className="gastos-diversos-form-group">
                    <label>Periodo</label>
                    <input 
                      type="text"
                      value={formData.periodo}
                      onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                      className="gastos-diversos-input"
                      placeholder="Periodo"
                    />
                  </div>
                </div>

                {/* Sección de Métodos de Gasto */}
                <div className="gastos-diversos-metodos-section">
                  <table className="gastos-diversos-metodos-table">
                    <thead>
                      <tr>
                        <th>Método de gasto</th>
                       {/* <th>Destino</th>*/}
                        <th>Referencia</th>
                        <th>Glosa</th>
                        <th>Monto</th>
                        <th>
                          <span 
                            className="gastos-diversos-link-agregar"
                            onClick={agregarMetodoGasto}
                          >
                            [+ Agregar]
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.metodosGasto.map((metodo, index) => (
                        <tr key={index}>
                          <td>
                            <select 
                              value={metodo.metodo}
                              onChange={(e) => handleMetodoChange(index, 'metodo', e.target.value)}
                              className="gastos-diversos-select-table"
                            >
                              <option value="CAJA GENERAL">CAJA GENERAL</option>
                              <option value="BANCO">BANCO</option>
                            </select>
                          </td> 


                          {/*
                          <td> 
                            <select 
                              value={metodo.destino}
                              onChange={(e) => handleMetodoChange(index, 'destino', e.target.value)}
                              className="gastos-diversos-select-table"
                            >
                              <option value="">Seleccionar</option>
                            </select> 
                          </td> */ }


                          <td>
                            <input 
                              type="text"
                              value={metodo.referencia}
                              onChange={(e) => handleMetodoChange(index, 'referencia', e.target.value)}
                              className="gastos-diversos-input-table"
                            />
                          </td>
                          <td>
                            <input 
                              type="text"
                              value={metodo.glosa}
                              onChange={(e) => handleMetodoChange(index, 'glosa', e.target.value)}
                              className="gastos-diversos-input-table"
                            />
                          </td>
                          <td>
                            <input 
                              type="number"
                              value={metodo.monto}
                              onChange={(e) => handleMetodoChange(index, 'monto', e.target.value)}
                              className="gastos-diversos-input-table"
                            />
                          </td>
                          <td>
                            {formData.metodosGasto.length > 1 && (
                              <button 
                                type="button"
                                onClick={() => eliminarMetodoGasto(index)}
                                className="gastos-diversos-btn-delete-small"
                              >
                                🗑️
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Botón Agregar Detalle */}
                <button 
                  type="button"
                  onClick={() => setShowDetalleModal(true)}
                  className="gastos-diversos-btn-agregar-detalle"
                >
                  + Agregar detalle
                </button>

                {/* Tabla de Detalles */}
                {formData.detalles.length > 0 && (
                  <div className="gastos-diversos-detalles-section">
                    <table className="gastos-diversos-detalles-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Descripción</th>
                          <th>Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.detalles.map((detalle, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{detalle.descripcion}</td>
                            <td>S/ {parseFloat(detalle.total).toFixed(2)}</td>
                            <td>
                              <button 
                                type="button"
                                onClick={() => eliminarDetalle(index)}
                                className="gastos-diversos-btn-delete-detalle"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="gastos-diversos-total">
                      <strong>TOTAL: S/ {calcularTotal().toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="gastos-diversos-modal-footer">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="gastos-diversos-btn-cancelar"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="gastos-diversos-btn-generar"
                >
                  Generar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Detalle */}
      {showDetalleModal && (
        <div className="gastos-diversos-detalle-modal-overlay" onClick={() => setShowDetalleModal(false)}>
          <div className="gastos-diversos-detalle-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gastos-diversos-detalle-modal-header">
              <h3>Agregar Detalle</h3>
              <button 
                className="gastos-diversos-modal-close"
                onClick={() => setShowDetalleModal(false)}
              >
                ×
              </button>
            </div>

            <div className="gastos-diversos-detalle-modal-body">
              <div className="gastos-diversos-detalle-form-group">
                <label>Descripción</label>
                <textarea 
                  value={detalleTemp.descripcion}
                  onChange={(e) => setDetalleTemp({...detalleTemp, descripcion: e.target.value})}
                  className="gastos-diversos-textarea-detalle"
                  rows="3"
                />
              </div>

              <div className="gastos-diversos-detalle-form-group">
                <label>Total</label>
                <input 
                  type="number"
                  step="0.01"
                  value={detalleTemp.total}
                  onChange={(e) => setDetalleTemp({...detalleTemp, total: e.target.value})}
                  className="gastos-diversos-input-detalle"
                  placeholder="S/"
                />
              </div>
            </div>

            <div className="gastos-diversos-detalle-modal-footer">
              <button 
                type="button"
                onClick={() => setShowDetalleModal(false)}
                className="gastos-diversos-btn-cancelar-detalle"
              >
                Cerrar
              </button>
              <button 
                type="button"
                onClick={agregarDetalle}
                className="gastos-diversos-btn-agregar-confirmado"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GastosDiversos;