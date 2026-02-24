import React, { useEffect, useState } from 'react';
import '../../styles/ListadoMetodPago.css';
import { listarConfiguraciones, guardarConfiguracion, eliminarConfiguracion } from '../../services/configuracionService';

const CATEGORIA_METODOS_PAGO = 'INGRESOS_EGRESOS_METODOS_PAGO';

const ListadoMetodPago = () => {
  const [modalNuevo, setModalNuevo] = useState(false);
  
  const [metodosPago, setMetodosPago] = useState([]);

  const [nuevoMetodo, setNuevoMetodo] = useState({
    codigo: '',
    descripcion: '',
    activo: true,
  });

  const [editando, setEditando] = useState(null); // { id, clave }
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

  const generarClave = (descripcion, codigo) => {
    const base = slugify(`${descripcion}_${codigo}`);
    return `METODO_PAGO_${base}_${Date.now()}`;
  };

  const cargarMetodos = async () => {
    setCargando(true);
    setError('');
    try {
      const lista = await listarConfiguraciones({ categoria: CATEGORIA_METODOS_PAGO });
      const data = (lista || []).map(cfg => {
        const parsed = cfg.tipo === 'JSON' ? safeParseJSON(cfg.valor) : null;
        return {
          id: cfg.id,
          clave: cfg.clave,
          codigo: parsed?.codigo ?? '',
          descripcion: parsed?.descripcion ?? cfg.descripcion ?? '',
          activo: cfg.activo ?? true,
        };
      });
      setMetodosPago(data);
    } catch (e) {
      setError(e.message || 'Error al cargar métodos de pago');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMetodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirModal = () => setModalNuevo(true);
  const cerrarModal = () => {
    setModalNuevo(false);
    setEditando(null);
    setNuevoMetodo({ codigo: '', descripcion: '', activo: true });
  };

  const guardarMetodo = async () => {
    const codigo = (nuevoMetodo.codigo || '').trim();
    const descripcion = (nuevoMetodo.descripcion || '').trim();
    if (!codigo || !descripcion) return;
    setCargando(true);
    setError('');
    try {
      const clave = editando?.clave || generarClave(descripcion, codigo);
      await guardarConfiguracion({
        clave,
        valor: JSON.stringify({ codigo, descripcion }),
        tipo: 'JSON',
        descripcion,
        categoria: CATEGORIA_METODOS_PAGO,
        activo: true,
      });
      await cargarMetodos();
      cerrarModal();
    } catch (e) {
      setError(e.message || 'Error al guardar método de pago');
    } finally {
      setCargando(false);
    }
  };

  const eliminarMetodo = async (id) => {
    const item = metodosPago.find(m => m.id === id);
    if (!item) return;
    if (!window.confirm('¿Eliminar método de pago?')) return;
    setCargando(true);
    setError('');
    try {
      await eliminarConfiguracion(item.clave);
      await cargarMetodos();
    } catch (e) {
      setError(e.message || 'Error al eliminar método de pago');
    } finally {
      setCargando(false);
    }
  };

  const abrirEdicion = (metodo) => {
    setEditando(metodo);
    setNuevoMetodo({ codigo: metodo.codigo, descripcion: metodo.descripcion, activo: metodo.activo });
    abrirModal();
  };

  return (
    <div className="lmp-container">
      {error && (<div style={{ color: 'red', marginBottom: 10 }}>{error}</div>)}
      {cargando && (<div style={{ color: '#555', marginBottom: 10 }}>Cargando...</div>)}
      <div className="lmp-section">
        <h2 className="lmp-title">
          Listado de métodos de pago 
        </h2>
        <br />
        <button className="lmp-btn-nuevo" onClick={abrirModal}>
          <span className="lmp-icon-plus">+</span> Nuevo
        </button>

        <table className="lmp-table">
          <thead>
            <tr>
              <th className="lmp-th">#</th>
              <th className="lmp-th">Código</th>
              <th className="lmp-th">Descripción</th>
              
              <th className="lmp-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {metodosPago.map((metodo, index) => (
              <tr key={metodo.id} className="lmp-tr">
                <td className="lmp-td">{index + 1}</td>
                <td className="lmp-td">{metodo.codigo}</td>
                <td className="lmp-td">{metodo.descripcion}</td>
              
                <td className="lmp-td lmp-td-acciones">
                  <button className="lmp-btn-editar" onClick={() => abrirEdicion(metodo)}>Editar</button>
                  <button className="lmp-btn-eliminar" onClick={() => eliminarMetodo(metodo.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nueva Método de Pago */}
      {modalNuevo && (
        <div className="lmp-modal-overlay" onClick={cerrarModal}>
          <div className="lmp-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="lmp-modal-header">
              <h3 className="lmp-modal-title">{editando ? 'Editar método de pago' : 'Nuevo método de pago'}</h3>
              <button className="lmp-modal-close" onClick={cerrarModal}>×</button>
            </div>
            <div className="lmp-modal-body">
              <div className="lmp-form-row">
                <div className="lmp-form-group">
                  <label className="lmp-label">Código</label>
                  <input 
                    type="text" 
                    className="lmp-input"
                    value={nuevoMetodo.codigo}
                    onChange={(e) => setNuevoMetodo({...nuevoMetodo, codigo: e.target.value})}
                    placeholder="Ingrese código"
                  />
                </div>
                <div className="lmp-form-group">
                  <label className="lmp-label">Descripción</label>
                  <input 
                    type="text" 
                    className="lmp-input"
                    value={nuevoMetodo.descripcion}
                    onChange={(e) => setNuevoMetodo({...nuevoMetodo, descripcion: e.target.value})}
                    placeholder="Ingrese descripción"
                  />
                </div>
              
              </div>
            </div>
            <div className="lmp-modal-footer">
              <button className="lmp-btn-cancelar" onClick={cerrarModal}>
                Cancelar
              </button>
              <button className="lmp-btn-guardar" onClick={guardarMetodo}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListadoMetodPago;