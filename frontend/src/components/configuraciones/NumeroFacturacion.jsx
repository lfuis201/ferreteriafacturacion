import React, { useState, useEffect } from 'react';
import '../../styles/NumeroFacturacion.css';
import { listarConfiguraciones, guardarConfiguracion, eliminarConfiguracion } from '../../services/configuracionService';

const CATEGORIA_FACTURACION = 'FACTURACION';
const PREFIX = 'FACTURACION_NUMERACION';
const TIPOS_DOCUMENTO = ['FACTURA', 'BOLETA', 'NOTA_CREDITO', 'NOTA_DEBITO', 'RECIBO_HONORARIOS'];

const safeParseJSON = (str) => { try { return JSON.parse(str); } catch { return null; } };
const slugify = (str) => (str || '')
  .normalize('NFD')
  .replace(/[^a-zA-Z0-9]+/g, '_')
  .replace(/^_|_$/g, '')
  .toUpperCase();
const generarClave = (tipoDocumento, serie) => `${PREFIX}_${slugify(tipoDocumento)}_${slugify(serie)}`;

const NumeroFacturacion = () => {
  const [modalRegistrar, setModalRegistrar] = useState(false);
  
  const [numeraciones, setNumeraciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null); // { clave }

  const [nuevaNumeracion, setNuevaNumeracion] = useState({
    tipoComprobante: '',
    serie: '',
    numeroInicial: ''
  });

  const abrirModal = (item = null) => {
    if (item) {
      setEditando({ clave: item.clave });
      setNuevaNumeracion({
        tipoComprobante: item.tipoComprobante || 'FACTURA',
        serie: item.serie || '',
        numeroInicial: String(item.numeroInicial ?? 1),
      });
    } else {
      setEditando(null);
      setNuevaNumeracion({ tipoComprobante: '', serie: '', numeroInicial: '' });
    }
    setModalRegistrar(true);
  };
  const cerrarModal = () => {
    setModalRegistrar(false);
    setNuevaNumeracion({ tipoComprobante: '', serie: '', numeroInicial: '' });
  };

  const guardarNumeracion = async () => {
    if (!nuevaNumeracion.tipoComprobante || !nuevaNumeracion.serie || !nuevaNumeracion.numeroInicial) return;
    setLoading(true);
    setError('');
    try {
      const tipoDocumento = (nuevaNumeracion.tipoComprobante || '').trim().toUpperCase().replace(/\s+/g, '_');
      const serie = (nuevaNumeracion.serie || '').trim().toUpperCase();
      const correlativo = Number(nuevaNumeracion.numeroInicial) || 1;
      const clave = editando?.clave || generarClave(tipoDocumento, serie);
      await guardarConfiguracion({
        clave,
        valor: { tipoDocumento, serie, correlativo, activo: true },
        tipo: 'JSON',
        descripcion: `Numeración ${tipoDocumento} ${serie}`,
        categoria: CATEGORIA_FACTURACION,
        activo: true,
      });
      await cargarNumeraciones();
      cerrarModal();
    } catch (e) {
      setError(e.message || 'Error al guardar numeración');
    } finally {
      setLoading(false);
    }
  };

  const eliminarNumeracion = async (clave) => {
    if (!window.confirm('¿Eliminar esta numeración?')) return;
    setLoading(true);
    setError('');
    try {
      await eliminarConfiguracion(clave);
      await cargarNumeraciones();
    } catch (e) {
      setError(e.message || 'Error al eliminar numeración');
    } finally {
      setLoading(false);
    }
  };

  const cargarNumeraciones = async () => {
    setLoading(true);
    setError('');
    try {
      const todas = await listarConfiguraciones({ categoria: CATEGORIA_FACTURACION });
      const lista = (todas || [])
        .filter(cfg => (cfg.clave || '').startsWith(`${PREFIX}_`))
        .map(cfg => {
          const parsed = cfg.tipo === 'JSON' ? safeParseJSON(cfg.valor) : null;
          return {
            id: cfg.id,
            clave: cfg.clave,
            tipoComprobante: parsed?.tipoDocumento?.replace(/_/g, ' ') || 'DESCONOCIDO',
            serie: parsed?.serie || '',
            numeroInicial: parsed?.correlativo ?? 1,
            emisionIniciada: (parsed?.activo ?? cfg.activo ?? true) ? 'Sí' : 'No',
          };
        });
      setNumeraciones(lista);
    } catch (e) {
      setError(e.message || 'Error al cargar numeraciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNumeraciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="nf-container">
      <div className="nf-section">
        <h2 className="nf-title">
          Numeración de facturación 
        </h2>
        <br />
        <button className="nf-btn-nuevo" onClick={abrirModal}>
          <span className="nf-icon-plus">+</span> Nuevo
        </button>

        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        {loading && <div style={{ marginTop: 8 }}>Cargando...</div>}

        <table className="nf-table">
          <thead>
            <tr>
              <th className="nf-th">#</th>
              <th className="nf-th">Tipo comprobante</th>
              <th className="nf-th">Serie</th>
              <th className="nf-th">Número a iniciar</th>
              <th className="nf-th">Emisión inicializada</th>
              <th className="nf-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {numeraciones.length === 0 ? (
              <tr>
                <td colSpan="6" className="nf-td nf-empty-message">
                  No hay registros disponibles
                </td>
              </tr>
            ) : (
              numeraciones.map((numeracion, index) => (
                <tr key={numeracion.id} className="nf-tr">
                  <td className="nf-td">{index + 1}</td>
                  <td className="nf-td">{numeracion.tipoComprobante}</td>
                  <td className="nf-td">{numeracion.serie}</td>
                  <td className="nf-td">{numeracion.numeroInicial}</td>
                  <td className="nf-td">{numeracion.emisionIniciada}</td>
                  <td className="nf-td nf-td-acciones">
                    <button className="nf-btn-editar" onClick={() => abrirModal(numeracion)}>Editar</button>
                    <button className="nf-btn-eliminar" onClick={() => eliminarNumeracion(numeracion.clave)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Registrar Configuración */}
      {modalRegistrar && (
        <div className="nf-modal-overlay" onClick={cerrarModal}>
          <div className="nf-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="nf-modal-header">
              <h3 className="nf-modal-title">Registrar configuración</h3>
              <button className="nf-modal-close" onClick={cerrarModal}>×</button>
            </div>
            <div className="nf-modal-body">
              <div className="nf-form-row-dual">
                <div className="nf-form-group">
                  <label className="nf-label">Tipo comprobante</label>
                  <select 
                    className="nf-select"
                    value={nuevaNumeracion.tipoComprobante}
                    onChange={(e) => setNuevaNumeracion({...nuevaNumeracion, tipoComprobante: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    {TIPOS_DOCUMENTO.map(t => (
                      <option key={t} value={t.replace(/_/g,' ')}>{t.replace(/_/g,' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="nf-form-group">
                  <label className="nf-label">Serie</label>
                  <select 
                    className="nf-select"
                    value={nuevaNumeracion.serie}
                    onChange={(e) => setNuevaNumeracion({...nuevaNumeracion, serie: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    <option value="F001">F001</option>
                    <option value="F002">F002</option>
                    <option value="B001">B001</option>
                    <option value="B002">B002</option>
                  </select>
                </div>
              </div>
              <div className="nf-form-group">
                <label className="nf-label">Número (Correlativo a iniciar)</label>
                <input 
                  type="number" 
                  className="nf-input"
                  value={nuevaNumeracion.numeroInicial}
                  onChange={(e) => setNuevaNumeracion({...nuevaNumeracion, numeroInicial: e.target.value})}
                  placeholder="Ingrese número inicial"
                />
              </div>
            </div>
            <div className="nf-modal-footer">
              <button className="nf-btn-cancelar" onClick={cerrarModal}>
                Cancelar
              </button>
              <button className="nf-btn-guardar" onClick={guardarNumeracion}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumeroFacturacion;