import React, { useEffect, useState } from 'react';
import '../../styles/ComprobanteIngresoGasto.css';
import { listarConfiguraciones, guardarConfiguracion, eliminarConfiguracion } from '../../services/configuracionService';

const CATEGORIA_COMPROBANTES_INGRESO = 'INGRESOS_EGRESOS_COMPROBANTES_INGRESO';
const CATEGORIA_COMPROBANTES_GASTO = 'INGRESOS_EGRESOS_COMPROBANTES_GASTO';

const ComprobanteIngresoGasto = () => {
  const [modalIngresos, setModalIngresos] = useState(false);
  const [modalGastos, setModalGastos] = useState(false);
  
  const [tiposIngresos, setTiposIngresos] = useState([]);

  const [tiposGastos, setTiposGastos] = useState([]);

  const [nuevoIngreso, setNuevoIngreso] = useState('');
  const [nuevoGasto, setNuevoGasto] = useState('');

  const [editandoIngreso, setEditandoIngreso] = useState(null); // { id, clave, descripcion }
  const [editandoGasto, setEditandoGasto] = useState(null); // { id, clave, descripcion }
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const safeParseJSON = (str) => {
    try { return JSON.parse(str); } catch { return null; }
  };

  const slugify = (str) => {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .toUpperCase();
  };

  const generarClave = (prefix, descripcion) => {
    const base = slugify(descripcion);
    return `${prefix}_${base}_${Date.now()}`;
  };

  const cargarListas = async () => {
    setCargando(true);
    setError('');
    try {
      const [cfgIngresos, cfgGastos] = await Promise.all([
        listarConfiguraciones({ categoria: CATEGORIA_COMPROBANTES_INGRESO }),
        listarConfiguraciones({ categoria: CATEGORIA_COMPROBANTES_GASTO })
      ]);

      const ingresos = (cfgIngresos || []).map(cfg => {
        const parsed = cfg.tipo === 'JSON' ? safeParseJSON(cfg.valor) : null;
        return {
          id: cfg.id,
          clave: cfg.clave,
          descripcion: parsed?.descripcion ?? cfg.descripcion ?? '',
          activo: cfg.activo ?? true,
        };
      });

      const gastos = (cfgGastos || []).map(cfg => {
        const parsed = cfg.tipo === 'JSON' ? safeParseJSON(cfg.valor) : null;
        return {
          id: cfg.id,
          clave: cfg.clave,
          descripcion: parsed?.descripcion ?? cfg.descripcion ?? '',
          activo: cfg.activo ?? true,
        };
      });

      setTiposIngresos(ingresos);
      setTiposGastos(gastos);
    } catch (e) {
      setError(e.message || 'Error al cargar tipos de comprobantes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarListas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirModalIngresos = () => setModalIngresos(true);
  const cerrarModalIngresos = () => {
    setModalIngresos(false);
    setEditandoIngreso(null);
    setNuevoIngreso('');
  };

  const abrirModalGastos = () => setModalGastos(true);
  const cerrarModalGastos = () => {
    setModalGastos(false);
    setEditandoGasto(null);
    setNuevoGasto('');
  };

  const guardarIngreso = async () => {
    const descripcion = nuevoIngreso.trim();
    if (!descripcion) return;
    setCargando(true);
    setError('');
    try {
      const clave = editandoIngreso?.clave || generarClave('COMPROBANTE_INGRESO', descripcion);
      await guardarConfiguracion({
        clave,
        valor: JSON.stringify({ descripcion }),
        tipo: 'JSON',
        descripcion,
        categoria: CATEGORIA_COMPROBANTES_INGRESO,
        activo: true,
      });
      await cargarListas();
      cerrarModalIngresos();
    } catch (e) {
      setError(e.message || 'Error al guardar comprobante de ingreso');
    } finally {
      setCargando(false);
    }
  };

  const guardarGasto = async () => {
    const descripcion = nuevoGasto.trim();
    if (!descripcion) return;
    setCargando(true);
    setError('');
    try {
      const clave = editandoGasto?.clave || generarClave('COMPROBANTE_GASTO', descripcion);
      await guardarConfiguracion({
        clave,
        valor: JSON.stringify({ descripcion }),
        tipo: 'JSON',
        descripcion,
        categoria: CATEGORIA_COMPROBANTES_GASTO,
        activo: true,
      });
      await cargarListas();
      cerrarModalGastos();
    } catch (e) {
      setError(e.message || 'Error al guardar comprobante de gasto');
    } finally {
      setCargando(false);
    }
  };

  const eliminarIngreso = async (id) => {
    const item = tiposIngresos.find(t => t.id === id);
    if (!item) return;
    if (!window.confirm('¿Eliminar comprobante de ingreso?')) return;
    setCargando(true);
    setError('');
    try {
      await eliminarConfiguracion(item.clave);
      await cargarListas();
    } catch (e) {
      setError(e.message || 'Error al eliminar comprobante de ingreso');
    } finally {
      setCargando(false);
    }
  };

  const eliminarGasto = async (id) => {
    const item = tiposGastos.find(t => t.id === id);
    if (!item) return;
    if (!window.confirm('¿Eliminar comprobante de gasto?')) return;
    setCargando(true);
    setError('');
    try {
      await eliminarConfiguracion(item.clave);
      await cargarListas();
    } catch (e) {
      setError(e.message || 'Error al eliminar comprobante de gasto');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="cig-container">
      {error && (<div style={{ color: 'red', marginBottom: 10 }}>{error}</div>)}
      {cargando && (<div style={{ color: '#555', marginBottom: 10 }}>Cargando...</div>)}
      {/* Sección Tipos de comprobantes - Ingresos */}
      <div className="cig-section">
        <h2 className="cig-title">
          Tipos de comprobantes 
        </h2>
        <br />
        <button className="cig-btn-nuevo" onClick={abrirModalIngresos}>
          <span className="cig-icon-plus">+</span> Nuevo
        </button>

        <table className="cig-table">
          <thead>
            <tr>
              <th className="cig-th">#</th>
              <th className="cig-th">Descripción</th>
              <th className="cig-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tiposIngresos.map((tipo, index) => (
              <tr key={tipo.id} className="cig-tr">
                <td className="cig-td">{index + 1}</td>
                <td className="cig-td">{tipo.descripcion}</td>
                <td className="cig-td cig-td-acciones">
                  <button
                    className="cig-btn-editar"
                    onClick={() => {
                      setEditandoIngreso(tipo);
                      setNuevoIngreso(tipo.descripcion);
                      abrirModalIngresos();
                    }}
                  >
                    Editar
                  </button>
                  <button className="cig-btn-eliminar" onClick={() => eliminarIngreso(tipo.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sección Tipos de comprobantes - Gastos */}
      <div className="cig-section">
        <h2 className="cig-title">
          Tipos de comprobantes 
        </h2>
        <br />
        <button className="cig-btn-nuevo" onClick={abrirModalGastos}>
          <span className="cig-icon-plus">+</span> Nuevo
        </button>

        <table className="cig-table">
          <thead>
            <tr>
              <th className="cig-th">#</th>
              <th className="cig-th">Descripción</th>
              <th className="cig-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tiposGastos.map((tipo, index) => (
              <tr key={tipo.id} className="cig-tr">
                <td className="cig-td">{index + 1}</td>
                <td className="cig-td">{tipo.descripcion}</td>
                <td className="cig-td cig-td-acciones">
                  <button
                    className="cig-btn-editar"
                    onClick={() => {
                      setEditandoGasto(tipo);
                      setNuevoGasto(tipo.descripcion);
                      abrirModalGastos();
                    }}
                  >
                    Editar
                  </button>
                  <button className="cig-btn-eliminar" onClick={() => eliminarGasto(tipo.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nuevo Tipo de Comprobante - Ingresos */}
      {modalIngresos && (
        <div className="cig-modal-overlay" onClick={cerrarModalIngresos}>
          <div className="cig-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cig-modal-header">
              <h3 className="cig-modal-title">{editandoIngreso ? 'Editar tipo de comprobante' : 'Nuevo tipo de comprobante'}</h3>
              <button className="cig-modal-close" onClick={cerrarModalIngresos}>×</button>
            </div>
            <div className="cig-modal-body">
              <label className="cig-label">Descripción</label>
              <input 
                type="text" 
                className="cig-input"
                value={nuevoIngreso}
                onChange={(e) => setNuevoIngreso(e.target.value)}
                placeholder="Ingrese descripción"
              />
            </div>
            <div className="cig-modal-footer">
              <button className="cig-btn-cancelar" onClick={cerrarModalIngresos}>
                Cancelar
              </button>
              <button className="cig-btn-guardar" onClick={guardarIngreso}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Tipo de Comprobante - Gastos */}
      {modalGastos && (
        <div className="cig-modal-overlay" onClick={cerrarModalGastos}>
          <div className="cig-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cig-modal-header">
              <h3 className="cig-modal-title">{editandoGasto ? 'Editar tipo de comprobante' : 'Nuevo tipo de comprobante'}</h3>
              <button className="cig-modal-close" onClick={cerrarModalGastos}>×</button>
            </div>
            <div className="cig-modal-body">
              <label className="cig-label">Descripción</label>
              <input 
                type="text" 
                className="cig-input"
                value={nuevoGasto}
                onChange={(e) => setNuevoGasto(e.target.value)}
                placeholder="Ingrese descripción"
              />
            </div>
            <div className="cig-modal-footer">
              <button className="cig-btn-cancelar" onClick={cerrarModalGastos}>
                Cancelar
              </button>
              <button className="cig-btn-guardar" onClick={guardarGasto}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprobanteIngresoGasto;