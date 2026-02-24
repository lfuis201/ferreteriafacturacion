import React, { useState, useEffect } from 'react';
import '../../styles/ConductoresLista.css';
import ConductoresModal from './conductores.jsx';
import { obtenerConductores, buscarConductores, eliminarConductor } from '../../services/conductorService';

const ConductoresLista = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Nombre');
  const [conductores, setConductores] = useState([]);
  const [conductoresAll, setConductoresAll] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingConductor, setEditingConductor] = useState(null);

  const cargarConductores = async () => {
    setLoading(true);
    try {
      const response = await obtenerConductores();
      const lista = response?.conductores || response?.data || [];
      const finalList = Array.isArray(lista) ? lista : [];
      setConductores(finalList);
      setConductoresAll(finalList);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConductores();
  }, []);

  const handleBuscar = async () => {
    const term = (searchTerm || '').trim();
    if (!term) {
      setConductores(conductoresAll);
      return;
    }

    try {
      setLoading(true);
      if (filterType === 'Nombre') {
        const res = await buscarConductores({ nombre: term });
        setConductores(res?.conductores || []);
      } else if (filterType === 'Tipo de documento') {
        const res = await buscarConductores({ tipoDocumento: term });
        setConductores(res?.conductores || []);
      } else if (filterType === 'Número') {
        const res = await buscarConductores({ numeroDocumento: term });
        setConductores(res?.conductores || []);
      } else if (filterType === 'Licencia') {
        const filtrados = conductoresAll.filter(c => (c.licencia || '')
          .toLowerCase().includes(term.toLowerCase()));
        setConductores(filtrados);
      }
    } catch (error) {
      console.error('Error en búsqueda de conductores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm('¿Desea eliminar este conductor?');
    if (!confirmar) return;

    try {
      await eliminarConductor(id);
      setConductores(prev => prev.filter(c => c.id !== id));
      setConductoresAll(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error al eliminar conductor:', error);
      alert('No se pudo eliminar el conductor.');
    }
  };

  return (
    <div className="cl-container">
      <div className="cl-header">
        <h1 className="cl-title">
          <span className="cl-icon">🚗</span>
          CONDUCTORES
        </h1>
        <button className="cl-btn cl-btn-nuevo" onClick={() => setShowModal(true)}>
          ➕ Nuevo
        </button>
      </div>

      <div className="cl-content">
        <h2 className="cl-subtitle">Listado de Conductores</h2>

        <div className="cl-filters">
          <select 
            className="cl-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option>Nombre</option>
            <option>Tipo de documento</option>
            <option>Número</option>
            <option>Licencia</option>
          </select>
          <div className="cl-search-box">
            <input
              type="text"
              className="cl-search-input"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="cl-btn cl-btn-search" onClick={handleBuscar}>
              🔍 Buscar
            </button>
          </div>
        </div>

        <div className="cl-table-wrapper">
          <table className="cl-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Tipo de documento</th>
                <th>Número</th>
                <th>Licencia</th>
                
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="cl-empty-state">Cargando...</td>
                </tr>
              ) : conductores.length === 0 ? (
                <tr>
                  <td colSpan="7" className="cl-empty-state">
                    No hay conductores registrados
                  </td>
                </tr>
              ) : (
                conductores.map((conductor, index) => (
                  <tr key={conductor.id || index}>
                    <td>{index + 1}</td>
                    <td>{conductor.nombre}</td>
                    <td>{conductor.tipoDocumento}</td>
                    <td>{conductor.numeroDocumento || conductor.numero}</td>
                    <td>{conductor.licencia}</td>
                  
                    <td>
                      <div className="cl-action-buttons">
                        <button
                          className="cl-btn-action cl-btn-edit"
                          onClick={() => {
                            setEditingConductor(conductor);
                            setShowModal(true);
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="cl-btn-action cl-btn-delete"
                          onClick={() => handleDelete(conductor.id)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="cl-pagination">
          <span>Total {conductores.length}</span>
          <div className="cl-pagination-controls">
            <button className="cl-pagination-btn">&lt;</button>
            <button className="cl-pagination-btn cl-active">1</button>
            <button className="cl-pagination-btn">&gt;</button>
          </div>
        </div>
      </div>

      {showModal && (
        <ConductoresModal
          initialData={editingConductor}
          onClose={() => {
            setShowModal(false);
            setEditingConductor(null);
          }}
          onConductorCreado={(nuevo) => {
            setConductores((prev) => [...prev, nuevo]);
            setConductoresAll((prev) => [...prev, nuevo]);
            setShowModal(false);
          }}
          onConductorActualizado={(actualizado) => {
            setConductores((prev) => prev.map(c => (c.id === actualizado.id ? actualizado : c)));
            setConductoresAll((prev) => prev.map(c => (c.id === actualizado.id ? actualizado : c)));
            setShowModal(false);
            setEditingConductor(null);
          }}
        />
      )}
    </div>
  );
};

export default ConductoresLista;