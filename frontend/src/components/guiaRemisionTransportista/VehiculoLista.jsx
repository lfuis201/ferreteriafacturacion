import React, { useState, useEffect } from 'react';
import '../../styles/VehiculoLista.css';
import VehiculosModal from './vehiculos.jsx';
import { obtenerVehiculos, eliminarVehiculo } from '../../services/vehiculoService';

const VehiculoLista = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Nro. de Placa');
  const [vehiculos, setVehiculos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);

  const cargarVehiculos = async () => {
    setLoading(true);
    try {
      const response = await obtenerVehiculos();
      const lista = response?.vehiculos || response?.data || [];
      setVehiculos(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const getId = (v) => v?._id || v?.id;

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const term = (searchTerm || '').trim();
      const filters = {};
      if (term) {
        switch (filterType) {
          case 'Nro. de Placa':
            filters.placa = term;
            break;
          case 'Autorización placa principal':
            filters.autorizacionPrincipal = term;
            break;
          case 'T.U.C.':
            filters.tuc = term;
            break;
          case 'Nro. de Placa secundaria':
            filters.placaSecundaria = term;
            break;
          case 'Autorización placa secundaria':
            filters.autorizacionSecundaria = term;
            break;
          case 'T.U.C. (placa secundaria)':
            filters.tucSecundaria = term;
            break;
          case 'Modelo':
            filters.modelo = term;
            break;
          case 'Marca':
            filters.marca = term;
            break;
          default:
            break;
        }
      }
      const response = await obtenerVehiculos(filters);
      const lista = response?.vehiculos || response?.data || [];
      setVehiculos(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error('Error al buscar vehículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehiculo) => {
    const id = getId(vehiculo);
    if (!id) return;
    const confirmar = window.confirm('¿Desea eliminar este vehículo?');
    if (!confirmar) return;
    try {
      await eliminarVehiculo(id);
      setVehiculos((prev) => prev.filter((v) => getId(v) !== id));
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      alert('No se pudo eliminar el vehículo');
    }
  };

  return (
    <div className="vl-container">
      <div className="vl-header">
        <h1 className="vl-title">
          <span className="vl-icon">🚙</span>
          VEHÍCULOS
        </h1>
        <button className="vl-btn vl-btn-nuevo" onClick={() => setShowModal(true)}>
          ➕ Nuevo
        </button>
      </div>

      <div className="vl-content">
        <h2 className="vl-subtitle">Listado de Vehículos</h2>

        <div className="vl-filters">
          <select 
            className="vl-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option>Nro. de Placa</option>
            <option>Autorización placa principal</option>
            <option>T.U.C.</option>
            <option>Nro. de Placa secundaria</option>
            <option>Modelo</option>
            <option>Marca</option>
          </select>
          <div className="vl-search-box">
            <input
              type="text"
              className="vl-search-input"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleBuscar(); }}
            />
            <button className="vl-btn vl-btn-search" onClick={handleBuscar}>
              🔍 Buscar
            </button>
          </div>
        </div>

        <div className="vl-table-wrapper">
          <table className="vl-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nro. de Placa</th>
                <th>Autorización placa principal</th>
                <th>
                  T.U.C. 
                  <span className="vl-info-icon" title="Tarjeta Única de Circulación">ⓘ</span>
                </th>
                <th>Nro. de Placa secundaria</th>
                <th>Autorización placa secundaria</th>
                <th>
                  T.U.C. (placa secundaria)
                  <span className="vl-info-icon" title="Tarjeta Única de Circulación">ⓘ</span>
                </th>
                <th>Modelo</th>
                <th>Marca</th>
               
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" className="vl-empty-state">Cargando...</td>
                </tr>
              ) : vehiculos.length === 0 ? (
                <tr>
                  <td colSpan="12" className="vl-empty-state">
                    No hay vehículos registrados
                  </td>
                </tr>
              ) : (
                vehiculos.map((vehiculo, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{vehiculo.nroPlacaId || vehiculo.nroPlaca || vehiculo.placa}</td>
                    <td>{vehiculo.autorizacionMTCPlacaPrincipal || vehiculo.autorizacionPrincipal}</td>
                    <td>{vehiculo.tucId || vehiculo.tuc}</td>
                    <td>{vehiculo.nroPlacaSecundariaId || vehiculo.nroPlacaSecundaria}</td>
                    <td>{vehiculo.autorizacionMTCPlacaSecundaria || vehiculo.autorizacionSecundaria}</td>
                    <td>{vehiculo.tucPlacaSecundariaId || vehiculo.tucSecundaria}</td>
                    <td>{vehiculo.modeloVehiculo || vehiculo.modelo}</td>
                    <td>{vehiculo.marcaVehiculo || vehiculo.marca}</td>
                
                 
                     
                     <td>
                       <div className="vl-action-buttons">
                         <button className="vl-btn-action vl-btn-edit" onClick={() => { setEditingVehiculo(vehiculo); setShowModal(true); }}>✏️ Editar</button>
                         <button className="vl-btn-action vl-btn-delete" onClick={() => handleDelete(vehiculo)}>🗑️ Eliminar</button>
                       </div>
                     </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="vl-pagination">
          <span>Total {vehiculos.length}</span>
          <div className="vl-pagination-controls">
            <button className="vl-pagination-btn">&lt;</button>
            <button className="vl-pagination-btn vl-active">1</button>
            <button className="vl-pagination-btn">&gt;</button>
          </div>
        </div>
      </div>
      {showModal && (
        <VehiculosModal
          initialData={editingVehiculo}
          onClose={() => { setShowModal(false); setEditingVehiculo(null); }}
          onVehiculoCreado={(nuevo) => {
            setVehiculos((prev) => [...prev, nuevo]);
            setShowModal(false);
          }}
          onVehiculoActualizado={(actualizado) => {
            const id = getId(actualizado);
            setVehiculos((prev) => prev.map((v) => (getId(v) === id ? { ...v, ...actualizado } : v)));
            setShowModal(false);
            setEditingVehiculo(null);
          }}
        />
      )}
    </div>
  );
};

export default VehiculoLista;