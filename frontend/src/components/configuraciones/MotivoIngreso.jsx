import React, { useEffect, useState } from 'react';
import '../../styles/MotivoIngreso.css';
import { listarConfiguraciones, guardarConfiguracion, eliminarConfiguracion } from '../../services/configuracionService';

const CATEGORIA_MOTIVOS_GASTO = 'INGRESOS_EGRESOS_MOTIVOS_GASTO';
const CATEGORIA_MOTIVOS_INGRESO = 'INGRESOS_EGRESOS_MOTIVOS_INGRESO';

const MotivoIngreso = () => {
  const [modalGastos, setModalGastos] = useState(false);
  const [modalIngresos, setModalIngresos] = useState(false);

  const [motivosGastos, setMotivosGastos] = useState([]);
  const [motivosIngresos, setMotivosIngresos] = useState([]);

  const [nuevoGasto, setNuevoGasto] = useState('');
  const [nuevoIngreso, setNuevoIngreso] = useState('');

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [editandoGasto, setEditandoGasto] = useState(null); // { clave, descripcion }
  const [editandoIngreso, setEditandoIngreso] = useState(null); // { clave, descripcion }

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
      const [cfgGasto, cfgIngreso] = await Promise.all([
        listarConfiguraciones({ categoria: CATEGORIA_MOTIVOS_GASTO }),
        listarConfiguraciones({ categoria: CATEGORIA_MOTIVOS_INGRESO })
      ]);

      const gastos = (cfgGasto || []).map(cfg => {
        const parsed = cfg.tipo === 'JSON' ? safeParseJSON(cfg.valor) : null;
        return {
          id: cfg.id,
          clave: cfg.clave,
          descripcion: parsed?.descripcion ?? cfg.descripcion ?? '',
          activo: cfg.activo ?? true,
        };
      });

      const ingresos = (cfgIngreso || []).map(cfg => {
        const parsed = cfg.tipo === 'JSON' ? safeParseJSON(cfg.valor) : null;
        return {
          id: cfg.id,
          clave: cfg.clave,
          descripcion: parsed?.descripcion ?? cfg.descripcion ?? '',
          activo: cfg.activo ?? true,
        };
      });

      setMotivosGastos(gastos);
      setMotivosIngresos(ingresos);
    } catch (e) {
      setError(e.message || 'Error al cargar motivos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarListas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirModalGastos = () => setModalGastos(true);
  const cerrarModalGastos = () => {
    setModalGastos(false);
    setEditandoGasto(null);
    setNuevoGasto('');
  };

  const abrirModalIngresos = () => setModalIngresos(true);
  const cerrarModalIngresos = () => {
    setModalIngresos(false);
    setEditandoIngreso(null);
    setNuevoIngreso('');
  };

  const guardarGasto = async () => {
    const descripcion = nuevoGasto.trim();
    if (!descripcion) return;
    setCargando(true);
    setError('');
    try {
      const clave = editandoGasto?.clave || generarClave('MOTIVO_GASTO', descripcion);
      await guardarConfiguracion({
        clave,
        valor: JSON.stringify({ descripcion }),
        tipo: 'JSON',
        descripcion,
        categoria: CATEGORIA_MOTIVOS_GASTO,
        activo: true,
      });
      await cargarListas();
      cerrarModalGastos();
    } catch (e) {
      setError(e.message || 'Error al guardar motivo de gasto');
    } finally {
      setCargando(false);
    }
  };

  const guardarIngreso = async () => {
    const descripcion = nuevoIngreso.trim();
    if (!descripcion) return;
    setCargando(true);
    setError('');
    try {
      const clave = editandoIngreso?.clave || generarClave('MOTIVO_INGRESO', descripcion);
      await guardarConfiguracion({
        clave,
        valor: JSON.stringify({ descripcion }),
        tipo: 'JSON',
        descripcion,
        categoria: CATEGORIA_MOTIVOS_INGRESO,
        activo: true,
      });
      await cargarListas();
      cerrarModalIngresos();
    } catch (e) {
      setError(e.message || 'Error al guardar motivo de ingreso');
    } finally {
      setCargando(false);
    }
  };

  const eliminarGasto = async (id) => {
    const item = motivosGastos.find(m => m.id === id);
    if (!item) return;
    if (!window.confirm('¿Eliminar motivo de gasto?')) return;
    setCargando(true);
    setError('');
    try {
      await eliminarConfiguracion(item.clave);
      await cargarListas();
    } catch (e) {
      setError(e.message || 'Error al eliminar motivo de gasto');
    } finally {
      setCargando(false);
    }
  };

  const eliminarIngreso = async (id) => {
    const item = motivosIngresos.find(m => m.id === id);
    if (!item) return;
    if (!window.confirm('¿Eliminar motivo de ingreso?')) return;
    setCargando(true);
    setError('');
    try {
      await eliminarConfiguracion(item.clave);
      await cargarListas();
    } catch (e) {
      setError(e.message || 'Error al eliminar motivo de ingreso');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mi-container">
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
      )}
      {cargando && (
        <div style={{ color: '#555', marginBottom: '10px' }}>Cargando...</div>
      )}
      {/* Sección Motivos de Gastos */}
      <div className="mi-section">
        <h2 className="mi-title">
          Motivos de gastos 
        </h2>
        <br />
        <button className="mi-btn-nuevo" onClick={abrirModalGastos}>
          <span className="mi-icon-plus">+</span> Nuevo
        </button>

        <table className="mi-table">
          <thead>
            <tr>
              <th className="mi-th">#</th>
              <th className="mi-th">Descripción</th>
              <th className="mi-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {motivosGastos.map((motivo, index) => (
              <tr key={motivo.id} className="mi-tr">
                <td className="mi-td">{index + 1}</td>
                <td className="mi-td">{motivo.descripcion}</td>
                <td className="mi-td mi-td-acciones">
                  <button
                    className="mi-btn-editar"
                    onClick={() => {
                      setEditandoGasto(motivo);
                      setNuevoGasto(motivo.descripcion);
                      abrirModalGastos();
                    }}
                  >
                    Editar
                  </button>
                  <button className="mi-btn-eliminar" onClick={() => eliminarGasto(motivo.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sección Motivos de Ingresos */}
      <div className="mi-section">
        <h2 className="mi-title">
          Motivos de ingresos 
        </h2>
        <br />
        <button className="mi-btn-nuevo" onClick={abrirModalIngresos}>
          <span className="mi-icon-plus">+</span> Nuevo
        </button>

        <table className="mi-table">
          <thead>
            <tr>
              <th className="mi-th">#</th>
              <th className="mi-th">Descripción</th>
              <th className="mi-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {motivosIngresos.map((motivo, index) => (
              <tr key={motivo.id} className="mi-tr">
                <td className="mi-td">{index + 1}</td>
                <td className="mi-td">{motivo.descripcion}</td>
                <td className="mi-td mi-td-acciones">
                  <button
                    className="mi-btn-editar"
                    onClick={() => {
                      setEditandoIngreso(motivo);
                      setNuevoIngreso(motivo.descripcion);
                      abrirModalIngresos();
                    }}
                  >
                    Editar
                  </button>
                  <button className="mi-btn-eliminar" onClick={() => eliminarIngreso(motivo.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nuevo Motivo de Gastos */}
      {modalGastos && (
        <div className="mi-modal-overlay" onClick={cerrarModalGastos}>
          <div className="mi-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mi-modal-header">
              <h3 className="mi-modal-title">{editandoGasto ? 'Editar motivo' : 'Nuevo motivo'}</h3>
              <button className="mi-modal-close" onClick={cerrarModalGastos}>×</button>
            </div>
            <div className="mi-modal-body">
              <label className="mi-label">Descripción</label>
              <input 
                type="text" 
                className="mi-input"
                value={nuevoGasto}
                onChange={(e) => setNuevoGasto(e.target.value)}
                placeholder="Ingrese descripción"
              />
            </div>
            <div className="mi-modal-footer">
              <button className="mi-btn-cancelar" onClick={cerrarModalGastos}>
                Cancelar
              </button>
              <button className="mi-btn-guardar" onClick={guardarGasto}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Motivo de Ingresos */}
      {modalIngresos && (
        <div className="mi-modal-overlay" onClick={cerrarModalIngresos}>
          <div className="mi-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mi-modal-header">
              <h3 className="mi-modal-title">{editandoIngreso ? 'Editar motivo' : 'Nuevo motivo'}</h3>
              <button className="mi-modal-close" onClick={cerrarModalIngresos}>×</button>
            </div>
            <div className="mi-modal-body">
              <label className="mi-label">Descripción</label>
              <input 
                type="text" 
                className="mi-input"
                value={nuevoIngreso}
                onChange={(e) => setNuevoIngreso(e.target.value)}
                placeholder="Ingrese descripción"
              />
            </div>
            <div className="mi-modal-footer">
              <button className="mi-btn-cancelar" onClick={cerrarModalIngresos}>
                Cancelar
              </button>
              <button className="mi-btn-guardar" onClick={guardarIngreso}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotivoIngreso;