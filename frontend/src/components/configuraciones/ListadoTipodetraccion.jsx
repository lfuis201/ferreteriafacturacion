import React, { useEffect, useState } from 'react';
import '../../styles/ListadoTipodetraccion.css';
import { listarConfiguraciones, guardarConfiguracion, eliminarConfiguracion } from '../../services/configuracionService';

const CATEGORIA_DETRACCIONES = 'SUNAT_DETRACCIONES';

const ListadoTipodetraccion = () => {
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [detracciones, setDetracciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [nuevaDetraccion, setNuevaDetraccion] = useState({
    tipoOperacion: '',
    codigo: '',
    descripcion: '',
    porcentaje: '',
    activo: false
  });

  const handleNuevoClick = () => {
    setEditandoId(null);
    setNuevaDetraccion({
      tipoOperacion: '',
      codigo: '',
      descripcion: '',
      porcentaje: '',
      activo: false
    });
    setShowModal(true);
  };

  const safeParseJSON = (str) => {
    try { return JSON.parse(str); } catch { return null; }
  };

  const cargarDetracciones = async () => {
    setCargando(true);
    setError(null);
    try {
      const configs = await listarConfiguraciones({ categoria: CATEGORIA_DETRACCIONES });
      const data = (configs || []).map(cfg => {
        const parsed = cfg.tipo === 'JSON' ? safeParseJSON(cfg.valor) : null;
        return {
          id: cfg.id,
          clave: cfg.clave,
          tipoOperacion: parsed?.tipoOperacion ?? '',
          codigo: parsed?.codigo ?? (cfg.clave?.replace(/^SUNAT_DETRACCION_/, '') || ''),
          descripcion: parsed?.descripcion ?? cfg.descripcion ?? '',
          porcentaje: parsed?.porcentaje ?? '',
          activo: cfg.activo ?? true,
        };
      });
      setDetracciones(data);
    } catch (e) {
      setError(e.message || 'Error al cargar detracciones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDetracciones();
  }, []);

  const handleEditarClick = (detraccion) => {
    setEditandoId(detraccion.id);
    setNuevaDetraccion({
      tipoOperacion: detraccion.tipoOperacion,
      codigo: detraccion.codigo,
      descripcion: detraccion.descripcion,
      porcentaje: String(detraccion.porcentaje || ''),
      activo: false
    });
    setShowModal(true);
  };

  const handleEliminarClick = (id) => {
    const item = detracciones.find(d => d.id === id);
    if (!item) return;
    if (window.confirm('¿Está seguro de que desea eliminar este tipo de detracción?')) {
      eliminarConfiguracion(encodeURIComponent(item.clave))
        .then(() => cargarDetracciones())
        .catch(err => setError(err.message || 'Error al eliminar detracción'));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditandoId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevaDetraccion(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGuardar = async () => {
    try {
      const claveExistente = editandoId ? detracciones.find(d => d.id === editandoId)?.clave : null;
      const payload = {
        clave: claveExistente || `SUNAT_DETRACCION_${String(nuevaDetraccion.codigo).trim()}`,
        valor: {
          tipoOperacion: String(nuevaDetraccion.tipoOperacion).trim(),
          codigo: String(nuevaDetraccion.codigo).trim(),
          descripcion: String(nuevaDetraccion.descripcion).trim(),
          porcentaje: Number(nuevaDetraccion.porcentaje) || 0,
          activo: !!nuevaDetraccion.activo,
        },
        tipo: 'JSON',
        descripcion: String(nuevaDetraccion.descripcion).trim(),
        categoria: CATEGORIA_DETRACCIONES,
      };

      await guardarConfiguracion(payload);
      await cargarDetracciones();
      handleCloseModal();
    } catch (e) {
      setError(e.message || 'Error al guardar detracción');
    }
  };

  return (
    <div className="detraccionContainer">
      <div className="detraccionHeader">
        <h1 className="detraccionTitle">Listado de tipos de detracciones</h1>
        <button 
          className="detraccionButton"
          onClick={handleNuevoClick}
        >
          Nuevo
        </button>
      </div>

      {error && (<div className="error-message">{error}</div>)}
      {cargando ? (
        <div className="loading">Cargando detracciones...</div>
      ) : (
      <table className="detraccionTable">
        <thead>
          <tr>
            <th>#</th>
            <th>T. Operación</th>
            <th>Código</th>
            <th>Descripción</th>
            <th>Porcentaje</th>
          
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {detracciones.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', color: '#666' }}>
                No hay detracciones configuradas.
              </td>
            </tr>
          ) : detracciones.map((detraccion) => (
            <tr key={detraccion.id}>
              <td>{detraccion.id}</td>
              <td>{detraccion.tipoOperacion}</td>
              <td>{detraccion.codigo}</td>
              <td>{detraccion.descripcion}</td>
              <td>{detraccion.porcentaje}</td>
           
              <td>
                <div className="detraccionActions">
                  <button 
                    className="detraccionActionBtn detraccionActionEdit"
                    onClick={() => handleEditarClick(detraccion)}
                  >
                    Editar
                  </button>
                  <button 
                    className="detraccionActionBtn detraccionActionDelete"
                    onClick={() => handleEliminarClick(detraccion.id)}
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

      {/* Modal para Nuevo/Editar Tipo Detracción */}
      {showModal && (
        <div className="detraccionModalOverlay">
          <div className="detraccionModal">
            <div className="detraccionModalHeader">
              <h2 className="detraccionModalTitle">
                {editandoId ? 'Editar tipo detracción' : 'Nuevo tipo detracción'}
              </h2>
            </div>
            
            <div className="detraccionModalBody">
              <div className="detraccionFormGrid">
                <div className="detraccionFormGroup">
                  <label className="detraccionFormLabel">Tipo operación</label>
                  <select 
                    name="tipoOperacion"
                    value={nuevaDetraccion.tipoOperacion}
                    onChange={handleInputChange}
                    className="detraccionFormSelect"
                  >
                    <option value="">Seleccione</option>
                    <option value="Operación Sujeta a Detracción">Operación Sujeta a Detracción</option>
                    <option value="Operación Sujeta a Detracción- Servicios de Transporte Carga">Operación Sujeta a Detracción- Servicios de Transporte Carga</option>
                    
                  </select>
                </div>

                <div className="detraccionFormGroup">
                  <label className="detraccionFormLabel">Código</label>
                  <input
                    type="text"
                    name="codigo"
                    value={nuevaDetraccion.codigo}
                    onChange={handleInputChange}
                    className="detraccionFormInput"
                    placeholder="Ingrese el código"
                  />
                </div>
              </div>

              <div className="detraccionFormGroup">
                <label className="detraccionFormLabel">Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  value={nuevaDetraccion.descripcion}
                  onChange={handleInputChange}
                  className="detraccionFormInput"
                  placeholder="Ingrese la descripción"
                />
              </div>

              <div className="detraccionFormGrid">
                <div className="detraccionFormGroup">
                  <label className="detraccionFormLabel">Porcentaje</label>
                  <input
                    type="number"
                    name="porcentaje"
                    value={nuevaDetraccion.porcentaje}
                    onChange={handleInputChange}
                    className="detraccionFormInput"
                    placeholder="0"
                  />
                </div>

               
              </div>

              <hr className="detraccionDivider" />

            
            </div>

            <div className="detraccionModalFooter">
              <button 
                className="detraccionButton detraccionButtonSecondary"
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button 
                className="detraccionButton detraccionButtonSuccess"
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

export default ListadoTipodetraccion;