import React, { useEffect, useState } from 'react';
import '../../styles/ListadoAtributos.css';
import { listarConfiguraciones, guardarConfiguracion, eliminarConfiguracion } from '../../services/configuracionService';

const CATEGORIA_ATRIBUTOS = 'SUNAT_ATRIBUTOS';

const ListadoAtributos = () => {
  const [showModal, setShowModal] = useState(false);
  const [atributos, setAtributos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  
  const [nuevoAtributo, setNuevoAtributo] = useState({
    codigo: '',
    descripcion: '',
  
 
  });

  const [editandoId, setEditandoId] = useState(null);

  const safeParseJSON = (str) => {
    try { return JSON.parse(str); } catch { return null; }
  };

  const cargarAtributos = async () => {
    setCargando(true);
    setError(null);
    try {
      const configs = await listarConfiguraciones({ categoria: CATEGORIA_ATRIBUTOS });
      const data = (configs || []).map(cfg => {
        const parsed = cfg.tipo === 'JSON' ? safeParseJSON(cfg.valor) : null;
        return {
          id: cfg.id,
          clave: cfg.clave,
          codigo: parsed?.codigo ?? (cfg.clave?.replace(/^SUNAT_ATRIBUTO_/, '') || ''),
          descripcion: parsed?.descripcion ?? cfg.descripcion ?? '',
       
        
        };
      });
      setAtributos(data);
    } catch (e) {
      setError(e.message || 'Error al cargar atributos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAtributos();
  }, []);

  const handleNuevoClick = () => {
    setEditandoId(null);
    setNuevoAtributo({
      codigo: '',
      descripcion: '',
    
   
    });
    setShowModal(true);
  };

  const handleEditarClick = (atributo) => {
    setEditandoId(atributo.id);
    setNuevoAtributo({
      codigo: atributo.codigo,
      descripcion: atributo.descripcion,
    
    
    });
    setShowModal(true);
  };

  const handleEliminarClick = (id) => {
    const atributo = atributos.find(a => a.id === id);
    if (!atributo) return;
    if (window.confirm('¿Está seguro de que desea eliminar este atributo?')) {
      eliminarConfiguracion(encodeURIComponent(atributo.clave))
        .then(() => cargarAtributos())
        .catch(err => setError(err.message || 'Error al eliminar atributo'));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditandoId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoAtributo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGuardar = async () => {
    try {
      const payload = {
        clave: editandoId
          ? atributos.find(a => a.id === editandoId)?.clave
          : `SUNAT_ATRIBUTO_${String(nuevoAtributo.codigo).trim()}`,
        valor: {
          codigo: String(nuevoAtributo.codigo).trim(),
          descripcion: String(nuevoAtributo.descripcion).trim(),
         
         
        },
        tipo: 'JSON',
        descripcion: String(nuevoAtributo.descripcion).trim(),
        categoria: CATEGORIA_ATRIBUTOS,
      };

      await guardarConfiguracion(payload);
      await cargarAtributos();
      handleCloseModal();
    } catch (e) {
      setError(e.message || 'Error al guardar atributo');
    }
  };

  return (
    <div className="listadoContainer">
      <div className="listadoHeader">
        <h1 className="listadoTitle">Listado de Atributos</h1>
        <button 
          className="listadoButton"
          onClick={handleNuevoClick}
        >
          Nuevo
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}
      {cargando ? (
        <div className="loading">Cargando atributos...</div>
      ) : (
      <table className="listadoTable">
        <thead>
          <tr>
            <th>#</th>
            <th>Código</th>
            <th>Descripción</th>
           
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {atributos.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', color: '#666' }}>
                No hay atributos configurados.
              </td>
            </tr>
          ) : atributos.map((atributo) => (
            <tr key={atributo.id}>
              <td>{atributo.id}</td>
              <td>{atributo.codigo}</td>
              <td>{atributo.descripcion}</td>
           
              <td>
                <div className="listadoActions">
                  <button 
                    className="listadoActionBtn listadoActionEdit"
                    onClick={() => handleEditarClick(atributo)}
                  >
                    Editar
                  </button>
                  <button 
                    className="listadoActionBtn listadoActionDelete"
                    onClick={() => handleEliminarClick(atributo.id)}
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

      {/* Modal para Nuevo/Editar Atributo */}
      {showModal && (
        <div className="listadoModalOverlay">
          <div className="listadoModal">
            <div className="listadoModalHeader">
              <h2 className="listadoModalTitle">
                {editandoId ? 'Editar Atributo' : 'Nuevo Atributo'}
              </h2>
            </div>
            
            <div className="listadoModalBody">
              <div className="listadoFormGroup">
                <label className="listadoFormLabel">Código</label>
                <input
                  type="text"
                  name="codigo"
                  value={nuevoAtributo.codigo}
                  onChange={handleInputChange}
                  className="listadoFormInput"
                  placeholder="Ingrese el código"
                />
              </div>

              <div className="listadoFormGroup">
                <label className="listadoFormLabel">Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  value={nuevoAtributo.descripcion}
                  onChange={handleInputChange}
                  className="listadoFormInput"
                  placeholder="Ingrese la descripción"
                />
              </div>

              

             

              
            </div>

            <div className="listadoModalFooter">
              <button 
                className="listadoButton listadoButtonSecondary"
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button 
                className="listadoButton listadoButtonSuccess"
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

export default ListadoAtributos;