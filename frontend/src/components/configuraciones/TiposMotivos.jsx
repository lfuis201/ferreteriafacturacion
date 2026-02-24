import React, { useEffect, useState } from 'react';
import '../../styles/TiposMotivos.css';
import { listarConfiguraciones, guardarConfiguracion, eliminarConfiguracion } from '../../services/configuracionService';

const CATEGORIA_MOTIVOS = 'SUNAT_MOTIVOS';

const TiposMotivos = () => {
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [motivos, setMotivos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [nuevoMotivo, setNuevoMotivo] = useState({
    codigo: '',
    descripcion: '',
    descuentaStock: false,
    activo: false
  });

  const safeParseJSON = (str) => {
    try { return JSON.parse(str); } catch { return null; }
  };

  const cargarMotivos = async () => {
    setCargando(true);
    setError(null);
    try {
      const configs = await listarConfiguraciones({ categoria: CATEGORIA_MOTIVOS });
      const data = (configs || []).map(cfg => {
        const parsed = cfg.tipo === 'JSON' ? safeParseJSON(cfg.valor) : null;
        return {
          id: cfg.id,
          clave: cfg.clave,
          codigo: parsed?.codigo ?? (cfg.clave?.replace(/^SUNAT_MOTIVO_/, '') || ''),
          descripcion: parsed?.descripcion ?? cfg.descripcion ?? '',
          descuentaStock: parsed?.descuentaStock ?? false,
          activo: cfg.activo ? 'S' : 'N',
        };
      });
      setMotivos(data);
    } catch (e) {
      setError(e.message || 'Error al cargar motivos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMotivos();
  }, []);

  const handleNuevoClick = () => {
    setEditandoId(null);
    setNuevoMotivo({
      codigo: '',
      descripcion: '',
      descuentaStock: false,
      activo: false
    });
    setShowModal(true);
  };

  const handleEditarClick = (motivo) => {
    setEditandoId(motivo.id);
    setNuevoMotivo({
      codigo: motivo.codigo,
      descripcion: motivo.descripcion,
      descuentaStock: !!motivo.descuentaStock,
      activo: motivo.activo === 'S'
    });
    setShowModal(true);
  };

  const handleEliminarClick = (id) => {
    const item = motivos.find(m => m.id === id);
    if (!item) return;
    if (window.confirm('¿Está seguro de que desea eliminar este motivo de traslado?')) {
      eliminarConfiguracion(encodeURIComponent(item.clave))
        .then(() => cargarMotivos())
        .catch(err => setError(err.message || 'Error al eliminar motivo'));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditandoId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoMotivo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGuardar = async () => {
    try {
      const claveExistente = editandoId ? motivos.find(m => m.id === editandoId)?.clave : null;
      const payload = {
        clave: claveExistente || `SUNAT_MOTIVO_${String(nuevoMotivo.codigo).trim()}`,
        valor: {
          codigo: String(nuevoMotivo.codigo).trim(),
          descripcion: String(nuevoMotivo.descripcion).trim(),
          descuentaStock: !!nuevoMotivo.descuentaStock,
          activo: !!nuevoMotivo.activo,
        },
        tipo: 'JSON',
        descripcion: String(nuevoMotivo.descripcion).trim(),
        categoria: CATEGORIA_MOTIVOS,
      };

      await guardarConfiguracion(payload);
      await cargarMotivos();
      handleCloseModal();
    } catch (e) {
      setError(e.message || 'Error al guardar motivo');
    }
  };

  return (
    <div className="motivoContainer">
      <div className="motivoHeader">
        <h1 className="motivoTitle">Tipos de motivos de traslado</h1>
        <button 
          className="motivoButton"
          onClick={handleNuevoClick}
        >
          Nuevo
        </button>
      </div>

      {error && (<div className="error-message">{error}</div>)}
      {cargando ? (
        <div className="loading">Cargando motivos...</div>
      ) : (
        <table className="motivoTable">
          <thead>
            <tr>
              <th>#</th>
              <th>Código</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {motivos.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: '#666' }}>
                  No hay motivos configurados.
                </td>
              </tr>
            ) : motivos.map((motivo) => (
              <tr key={motivo.id}>
                <td>{motivo.id}</td>
                <td>{motivo.codigo}</td>
                <td>{motivo.descripcion}</td>
                <td>
                  <div className="motivoActions">
                    <button 
                      className="motivoActionBtn motivoActionEdit"
                      onClick={() => handleEditarClick(motivo)}
                    >
                      Editar
                    </button>
                    <button 
                      className="motivoActionBtn motivoActionDelete"
                      onClick={() => handleEliminarClick(motivo.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal para Nuevo/Editar Motivo de Traslado */}
      {showModal && (
        <div className="motivoModalOverlay">
          <div className="motivoModal">
            <div className="motivoModalHeader">
              <h2 className="motivoModalTitle">Descripción</h2>
              <h3 className="motivoModalSubtitle">
                {editandoId ? 'Editar motivo de traslado' : 'Nuevo motivo de traslado'}
              </h3>
            </div>
            
            <div className="motivoModalBody">
            

              <div className="motivoFormGrid">
                <div className="motivoFormGroup">
                  <label className="motivoFormLabel">Código</label>
                  <input
                    type="text"
                    name="codigo"
                    value={nuevoMotivo.codigo}
                    onChange={handleInputChange}
                    className="motivoFormInput"
                    placeholder="Ingrese el código"
                  />
                </div>

                <div className="motivoFormGroup">
                  <label className="motivoFormLabel">Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={nuevoMotivo.descripcion}
                    onChange={handleInputChange}
                    className="motivoFormInput"
                    placeholder="Ingrese la descripción"
                  />
                </div>
              
          
              </div> 
              
            </div>

            <div className="motivoModalFooter">
              <button 
                className="motivoButton motivoButtonSecondary"
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button 
                className="motivoButton motivoButtonSuccess"
                onClick={handleGuardar}
              >
                {editandoId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiposMotivos;