import React, { useEffect, useState } from 'react';
import '../../styles/DireccionPartidaLista.css';
import DirecciónPartida from './DirecciónPartida';
import {
  obtenerDireccionesPartida,
  buscarDireccionesPartida,
  eliminarDireccionPartida,
} from '../../services/direccionPartidaService';

const DireccionPartidaLista = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Dirección');
  const [direcciones, setDirecciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDireccion, setEditingDireccion] = useState(null);

  const cargarDirecciones = async (filtros = {}) => {
    try {
      setLoading(true);
      const { direccionesPartida = [], data } = await obtenerDireccionesPartida(filtros);
      setDirecciones(direccionesPartida.length ? direccionesPartida : (data || []));
    } catch (error) {
      console.error('Error al cargar direcciones de partida:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDirecciones();
  }, []);

  const handleBuscar = async () => {
    const filtros = {};
    if (filterType === 'Dirección' && searchTerm) filtros.direccion = searchTerm;
    if (filterType === 'Ubigeo' && searchTerm) filtros.ubigeo = searchTerm;
    try {
      setLoading(true);
      const { direccionesPartida = [], data } = await buscarDireccionesPartida(filtros);
      setDirecciones(direccionesPartida.length ? direccionesPartida : (data || []));
    } catch (error) {
      console.error('Error al buscar direcciones de partida:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (direccion) => {
    const id = direccion?.id || direccion?.direccionPartidaId || direccion?._id;
    if (!id) {
      alert('No se pudo determinar el ID de la dirección');
      return;
    }
    if (!confirm('¿Seguro que deseas eliminar esta dirección?')) return;
    try {
      await eliminarDireccionPartida(id);
      await cargarDirecciones();
    } catch (error) {
      alert(error.message || 'Error al eliminar la dirección');
    }
  };

  return (
    <div className="dp-container">
      <div className="dp-header">
        <h1 className="dp-title">
          <span className="dp-icon">📍</span>
          DIRECCIONES DE PARTIDA
        </h1>
        <button className="dp-btn dp-btn-nuevo" onClick={() => { setEditingDireccion(null); setShowModal(true); }}>
          ➕ Nuevo
        </button>
      </div>

      <div className="dp-content">
        <h2 className="dp-subtitle">Listado de Direcciones de partida</h2>

        <div className="dp-filters">
          <select 
            className="dp-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option>Dirección</option>
            <option>Ubigeo</option>
          </select>
          <div className="dp-search-box">
            <input
              type="text"
              className="dp-search-input"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleBuscar(); }}
            />
            <button className="dp-btn dp-btn-search" onClick={handleBuscar}>
              🔍 Buscar
            </button>
          </div>
        </div>

        <div className="dp-table-wrapper">
          <table className="dp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Dirección</th>
                <th>Ubigeo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="dp-empty-state">Cargando...</td>
                </tr>
              ) : direcciones.length === 0 ? (
                <tr>
                  <td colSpan="4" className="dp-empty-state">
                    No hay direcciones de partida registradas
                  </td>
                </tr>
              ) : (
                direcciones.map((direccion, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{direccion.direccion || direccion.direccionCompleta}</td>
                    <td>{direccion.ubigeo || direccion.codigo}</td>
                    <td>
                      <div className="dp-action-buttons">
                        <button
                          className="dp-btn-action dp-btn-edit"
                          onClick={() => { setEditingDireccion(direccion); setShowModal(true); }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="dp-btn-action dp-btn-delete"
                          onClick={() => handleDelete(direccion)}
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

        <div className="dp-pagination">
          <span>Total 0</span>
          <div className="dp-pagination-controls">
            <button className="dp-pagination-btn">&lt;</button>
            <button className="dp-pagination-btn dp-active">1</button>
            <button className="dp-pagination-btn">&gt;</button>
          </div>
        </div>
      </div>

      {/* Modal de Dirección de Partida */}
      <DirecciónPartida
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingDireccion(null); }}
        onDireccionCreada={async () => { setShowModal(false); setEditingDireccion(null); await cargarDirecciones(); }}
        initialData={editingDireccion || null}
        onDireccionActualizada={async () => { setShowModal(false); setEditingDireccion(null); await cargarDirecciones(); }}
        tipo={'partida'}
      />
    </div>
  );
};

export default DireccionPartidaLista;