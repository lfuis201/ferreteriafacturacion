import React, { useEffect, useState } from 'react';
import '../../styles/ListadoUnidades.css'
import { listarConfiguraciones, guardarConfiguracion, eliminarConfiguracion } from '../../services/configuracionService';

const CATEGORIA_UNIDADES = 'SUNAT_UNIDADES';

const ListadoUnidades = () => {
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [nuevaUnidad, setNuevaUnidad] = useState({
    descripcion: '',
    codigo: '',
    simbolo: '',
    sistema: '',
    activo: false
  });

  const handleNuevoClick = () => {
    setEditandoId(null);
    setNuevaUnidad({
      descripcion: '',
      codigo: '',
      simbolo: '',
      sistema: '',
      activo: false
    });
    setShowModal(true);
  };

  const safeParseJSON = (str) => {
    try { return JSON.parse(str); } catch { return null; }
  };

  const cargarUnidades = async () => {
    setCargando(true);
    setError(null);
    try {
      const configs = await listarConfiguraciones({ categoria: CATEGORIA_UNIDADES });
      const data = (configs || []).map(cfg => {
        const parsed = cfg.tipo === 'JSON' ? safeParseJSON(cfg.valor) : null;
        return {
          id: cfg.id,
          clave: cfg.clave,
          codigo: parsed?.codigo ?? (cfg.clave?.replace(/^SUNAT_UNIDAD_/, '') || ''),
          descripcion: parsed?.descripcion ?? cfg.descripcion ?? '',
          simbolo: parsed?.simbolo ?? '',
          sistema: parsed?.sistema ?? '',
          activo: cfg.activo ? 'S' : 'N',
        };
      });
      setUnidades(data);
    } catch (e) {
      setError(e.message || 'Error al cargar unidades');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUnidades();
  }, []);

  const handleEditarClick = (unidad) => {
    setEditandoId(unidad.id);
    setNuevaUnidad({
      descripcion: unidad.descripcion,
      codigo: unidad.codigo,
      simbolo: unidad.simbolo || '',
      sistema: unidad.sistema,
      activo: unidad.activo === 'S'
    });
    setShowModal(true);
  };

  const handleEliminarClick = (id) => {
    const item = unidades.find(u => u.id === id);
    if (!item) return;
    if (window.confirm('¿Está seguro de que desea eliminar esta unidad?')) {
      eliminarConfiguracion(encodeURIComponent(item.clave))
        .then(() => cargarUnidades())
        .catch(err => setError(err.message || 'Error al eliminar unidad'));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditandoId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevaUnidad(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGuardar = async () => {
    try {
      const claveExistente = editandoId ? unidades.find(u => u.id === editandoId)?.clave : null;
      const payload = {
        clave: claveExistente || `SUNAT_UNIDAD_${String(nuevaUnidad.codigo).trim()}`,
        valor: {
          codigo: String(nuevaUnidad.codigo).trim(),
          descripcion: String(nuevaUnidad.descripcion).trim(),
          simbolo: String(nuevaUnidad.simbolo || '').trim(),
          sistema: String(nuevaUnidad.sistema || '').trim(),
          activo: !!nuevaUnidad.activo,
        },
        tipo: 'JSON',
        descripcion: String(nuevaUnidad.descripcion).trim(),
        categoria: CATEGORIA_UNIDADES,
      };

      await guardarConfiguracion(payload);
      await cargarUnidades();
      handleCloseModal();
    } catch (e) {
      setError(e.message || 'Error al guardar unidad');
    }
  };

  return (
    <div className="unidadContainer">
      <div className="unidadHeader">
        <div>
          <h1 className="unidadTitle">Mostrar unidades</h1>
         
        </div>
        <button 
          className="unidadButton"
          onClick={handleNuevoClick}
        >
          Nuevo
        </button>
      </div>

      {error && (<div className="error-message">{error}</div>)}
      {cargando ? (
        <div className="loading">Cargando unidades...</div>
      ) : (
      <table className="unidadTable">
        <thead>
          <tr>
            <th>#</th>
            <th>Código</th>
            <th>Descripción</th>
            <th>Símbolo</th>
           
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {unidades.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', color: '#666' }}>
                No hay unidades configuradas.
              </td>
            </tr>
          ) : unidades.map((unidad) => (
            <tr key={unidad.id}>
              <td>{unidad.id}</td>
              <td>{unidad.codigo}</td>
              <td>{unidad.descripcion}</td>
              <td>{unidad.simbolo || unidad.sistema}</td>
          
              <td>
                <div className="unidadActions">
                  <button 
                    className="unidadActionBtn unidadActionEdit"
                    onClick={() => handleEditarClick(unidad)}
                  >
                    Editar
                  </button>
                  <button 
                    className="unidadActionBtn unidadActionDelete"
                    onClick={() => handleEliminarClick(unidad.id)}
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

      {/* Modal para Nueva/Editar Unidad */}
      {showModal && (
        <div className="unidadModalOverlay">
          <div className="unidadModal">
            <div className="unidadModalHeader">
              <h2 className="unidadModalTitle">
                {editandoId ? 'Editar Unidad' : 'Nueva Unidad'}
              </h2>
            </div>
            
            <div className="unidadModalBody">
              <div className="unidadFormGroup">
                <label className="unidadFormLabel">Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  value={nuevaUnidad.descripcion}
                  onChange={handleInputChange}
                  className="unidadFormInput"
                  placeholder="Ingrese la descripción"
                />
               
              </div>

            

              <div className="unidadFormGroup">
                <label className="unidadFormLabel">Código</label>
                <input
                  type="text"
                  name="codigo"
                  value={nuevaUnidad.codigo}
                  onChange={handleInputChange}
                  className="unidadFormInput"
                  placeholder="Ingrese el código"
                />
              </div>

              <div className="unidadFormGroup">
                <label className="unidadFormLabel">Símbolo</label>
                <input
                  type="text"
                  name="simbolo"
                  value={nuevaUnidad.simbolo}
                  onChange={handleInputChange}
                  className="unidadFormInput"
                  placeholder="Ingrese el símbolo"
                />
              </div>

             

              <hr className="unidadDivider" />

             
            </div>

            <div className="unidadModalFooter">
              <button 
                className="unidadButton unidadButtonSecondary"
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button 
                className="unidadButton unidadButtonSuccess"
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

export default ListadoUnidades;