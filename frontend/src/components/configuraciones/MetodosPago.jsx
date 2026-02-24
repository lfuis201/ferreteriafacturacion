import React, { useEffect, useState } from 'react';
import '../../styles/MetodosPago.css';
import { listarConfiguraciones, guardarConfiguracion, eliminarConfiguracion } from '../../services/configuracionService';

const CATEGORIA_METODOS_GASTO = 'INGRESOS_EGRESOS_METODOS_GASTO';
const CATEGORIA_METODOS_PAGO = 'INGRESOS_EGRESOS_METODOS_PAGO';

const safeParseJSON = (str) => {
  try { return JSON.parse(str); } catch { return null; }
};

const MetodosPago = () => {
  const [modalGasto, setModalGasto] = useState(false);
  const [modalPago, setModalPago] = useState(false);
  const [editandoGastoId, setEditandoGastoId] = useState(null);
  const [editandoPagoId, setEditandoPagoId] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  
  const [metodosGasto, setMetodosGasto] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);

  const [nuevoGasto, setNuevoGasto] = useState('');
  const [nuevoPago, setNuevoPago] = useState({
    codigo: '',
    descripcion: '',
    tipoPago: ''
  });

  const abrirModalGasto = () => setModalGasto(true);
  const cerrarModalGasto = () => {
    setModalGasto(false);
    setEditandoGastoId(null);
    setNuevoGasto('');
  };

  const abrirModalPago = () => setModalPago(true);
  const cerrarModalPago = () => {
    setModalPago(false);
    setEditandoPagoId(null);
    setNuevoPago({ codigo: '', descripcion: '', tipoPago: '' });
  };

  const cargarListas = async () => {
    setCargando(true);
    setError(null);
    try {
      const [configsGasto, configsPago] = await Promise.all([
        listarConfiguraciones({ categoria: CATEGORIA_METODOS_GASTO }),
        listarConfiguraciones({ categoria: CATEGORIA_METODOS_PAGO })
      ]);

      const gastos = (configsGasto || []).map(cfg => {
        const parsed = cfg.tipo === 'JSON' ? safeParseJSON(cfg.valor) : null;
        return {
          id: cfg.id,
          clave: cfg.clave,
          descripcion: parsed?.descripcion ?? cfg.descripcion ?? ''
        };
      });
      const pagos = (configsPago || []).map(cfg => {
        const parsed = cfg.tipo === 'JSON' ? safeParseJSON(cfg.valor) : null;
        return {
          id: cfg.id,
          clave: cfg.clave,
          codigo: parsed?.codigo ?? '',
          descripcion: parsed?.descripcion ?? cfg.descripcion ?? '',
          condicionPago: parsed?.condicionPago ?? ''
        };
      });

      setMetodosGasto(gastos);
      setMetodosPago(pagos);
    } catch (e) {
      setError(e.message || 'Error al cargar métodos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarListas();
  }, []);

  const guardarGasto = async () => {
    if (!nuevoGasto.trim()) return;
    try {
      const claveExistente = editandoGastoId ? metodosGasto.find(m => m.id === editandoGastoId)?.clave : null;
      const slug = nuevoGasto.trim().toUpperCase().replace(/\s+/g, '_');
      const payload = {
        clave: claveExistente || `METODO_GASTO_${slug}`,
        valor: { descripcion: nuevoGasto.trim() },
        tipo: 'JSON',
        descripcion: nuevoGasto.trim(),
        categoria: CATEGORIA_METODOS_GASTO,
      };
      await guardarConfiguracion(payload);
      await cargarListas();
      cerrarModalGasto();
    } catch (e) {
      setError(e.message || 'Error al guardar método de gasto');
    }
  };

  const guardarPago = async () => {
    if (!nuevoPago.codigo || !nuevoPago.descripcion || !nuevoPago.tipoPago) return;
    try {
      const claveExistente = editandoPagoId ? metodosPago.find(m => m.id === editandoPagoId)?.clave : null;
      const codigoTrim = String(nuevoPago.codigo).trim();
      const payload = {
        clave: claveExistente || `METODO_PAGO_${codigoTrim}`,
        valor: {
          codigo: codigoTrim,
          descripcion: String(nuevoPago.descripcion).trim(),
          condicionPago: String(nuevoPago.tipoPago).trim()
        },
        tipo: 'JSON',
        descripcion: String(nuevoPago.descripcion).trim(),
        categoria: CATEGORIA_METODOS_PAGO,
      };
      await guardarConfiguracion(payload);
      await cargarListas();
      cerrarModalPago();
    } catch (e) {
      setError(e.message || 'Error al guardar método de pago');
    }
  };

  const eliminarGasto = async (id) => {
    try {
      const clave = metodosGasto.find(m => m.id === id)?.clave;
      if (!clave) return;
      await eliminarConfiguracion(clave);
      await cargarListas();
    } catch (e) {
      setError(e.message || 'Error al eliminar método de gasto');
    }
  };

  const eliminarPago = async (id) => {
    try {
      const clave = metodosPago.find(m => m.id === id)?.clave;
      if (!clave) return;
      await eliminarConfiguracion(clave);
      await cargarListas();
    } catch (e) {
      setError(e.message || 'Error al eliminar método de pago');
    }
  };

  return (
    <div className="mp-container">
      {/* Sección Métodos de Gasto */}
      <div className="mp-section">
        <h2 className="mp-title">Métodos de gasto</h2> 
        <br />
        <button className="mp-btn-nuevo" onClick={abrirModalGasto}>
          <span className="mp-icon-plus">+</span> Nuevo
        </button>

        <table className="mp-table">
          <thead>
            <tr>
              <th className="mp-th">#</th>
              <th className="mp-th">Descripción</th>
              <th className="mp-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {metodosGasto.map((metodo, index) => (
              <tr key={metodo.id} className="mp-tr">
                <td className="mp-td">{index + 1}</td>
                <td className="mp-td">{metodo.descripcion}</td>
                <td className="mp-td mp-td-acciones">
                  <>
                    <button className="mp-btn-editar" onClick={() => { setEditandoGastoId(metodo.id); setNuevoGasto(metodo.descripcion); setModalGasto(true); }}>Editar</button>
                    <button className="mp-btn-eliminar" onClick={() => eliminarGasto(metodo.id)}>
                      Eliminar
                    </button>
                  </>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sección Métodos de Pago - Ingreso */}
      <div className="mp-section">
        <h2 className="mp-title">
          Métodos de pago - ingreso 
        </h2> 
        <br />
        <button className="mp-btn-nuevo" onClick={abrirModalPago}>
          <span className="mp-icon-plus">+</span> Nuevo
        </button>

        <table className="mp-table">
          <thead>
            <tr>
              <th className="mp-th">#</th>
              <th className="mp-th">Código</th>
              <th className="mp-th">Descripción</th>
              <th className="mp-th">Condición de pago</th>
              <th className="mp-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {metodosPago.map((metodo, index) => (
              <tr key={metodo.id} className="mp-tr">
                <td className="mp-td">{index + 1}</td>
                <td className="mp-td">{metodo.codigo}</td>
                <td className="mp-td">{metodo.descripcion}</td>
                <td className="mp-td">
                  <select className="mp-select" defaultValue={metodo.condicionPago}>
                    <option value="Contado">Contado</option>
                    <option value="Banco">Banco</option>
                    <option value="Crédito">Crédito</option>
                  </select>
                </td>
                <td className="mp-td mp-td-acciones">
                  <button className="mp-btn-editar" onClick={() => { setEditandoPagoId(metodo.id); setNuevoPago({ codigo: metodo.codigo, descripcion: metodo.descripcion, tipoPago: metodo.condicionPago }); setModalPago(true); }}>Editar</button>
                  <button className="mp-btn-eliminar" onClick={() => eliminarPago(metodo.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nuevo Método de Gasto */}
      {modalGasto && (
        <div className="mp-modal-overlay" onClick={cerrarModalGasto}>
          <div className="mp-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h3 className="mp-modal-title">{editandoGastoId ? 'Editar método de gasto' : 'Nuevo método de gasto'}</h3>
              <button className="mp-modal-close" onClick={cerrarModalGasto}>×</button>
            </div>
            <div className="mp-modal-body">
              <label className="mp-label">Descripción</label>
              <input 
                type="text" 
                className="mp-input"
                value={nuevoGasto}
                onChange={(e) => setNuevoGasto(e.target.value)}
                placeholder="Ingrese descripción"
              />
            </div>
            <div className="mp-modal-footer">
              <button className="mp-btn-cancelar" onClick={cerrarModalGasto}>
                Cancelar
              </button>
              <button className="mp-btn-guardar" onClick={guardarGasto}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Método de Pago */}
      {modalPago && (
        <div className="mp-modal-overlay" onClick={cerrarModalPago}>
          <div className="mp-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h3 className="mp-modal-title">{editandoPagoId ? 'Editar método de pago' : 'Nuevo método de pago'}</h3>
              <button className="mp-modal-close" onClick={cerrarModalPago}>×</button>
            </div>
            <div className="mp-modal-body mp-modal-body-grid">
              <div className="mp-form-group">
                <label className="mp-label">Código</label>
                <input 
                  type="text" 
                  className="mp-input"
                  value={nuevoPago.codigo}
                  onChange={(e) => setNuevoPago({...nuevoPago, codigo: e.target.value})}
                  placeholder="Ingrese código"
                />
              </div>
              <div className="mp-form-group">
                <label className="mp-label">Descripción</label>
                <input 
                  type="text" 
                  className="mp-input"
                  value={nuevoPago.descripcion}
                  onChange={(e) => setNuevoPago({...nuevoPago, descripcion: e.target.value})}
                  placeholder="Ingrese descripción"
                />
              </div>
              <div className="mp-form-group">
                <label className="mp-label">Tipo de pago</label>
                <select 
                  className="mp-select"
                  value={nuevoPago.tipoPago}
                  onChange={(e) => setNuevoPago({...nuevoPago, tipoPago: e.target.value})}
                >
                  <option value="">Seleccionar</option>
                  <option value="Contado">Contado</option>
                  <option value="Banco">Banco</option>
                  <option value="Crédito">Crédito</option>
                </select>
              </div>
            </div>
            <div className="mp-modal-footer">
              <button className="mp-btn-cancelar" onClick={cerrarModalPago}>
                Cancelar
              </button>
              <button className="mp-btn-guardar" onClick={guardarPago}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetodosPago;