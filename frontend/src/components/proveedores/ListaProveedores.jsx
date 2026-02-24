import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerProveedores, eliminarProveedor } from '../../services/proveedorService';
import '../../styles/ListaProveedores.css';

function ListaProveedores() {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState({
    tipoDocumento: ''
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const proveedoresData = await obtenerProveedores();
      
      // Asegurar que proveedoresData sea un array
      const proveedoresArray = Array.isArray(proveedoresData)
        ? proveedoresData
        : (proveedoresData?.proveedores || proveedoresData?.data || []);
      
      setProveedores(proveedoresArray);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setError('Error al cargar los proveedores');
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este proveedor?')) {
      try {
        await eliminarProveedor(id);
        await cargarProveedores(); // Recargar la lista
        alert('Proveedor eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        alert('Error al eliminar el proveedor: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipoDocumento: ''
    });
    setBusqueda('');
  };

  const proveedoresFiltrados = proveedores.filter(proveedor => {
    const busquedaLower = busqueda.toLowerCase();
    
    // Filtro por búsqueda
    const nombre = proveedor.nombre?.toLowerCase() || '';
    const numeroDocumento = proveedor.numeroDocumento?.toLowerCase() || '';
    const ruc = proveedor.ruc?.toLowerCase() || '';
    
    const coincideBusqueda = nombre.includes(busquedaLower) ||
                            numeroDocumento.includes(busquedaLower) ||
                            ruc.includes(busquedaLower);

    if (busqueda && !coincideBusqueda) return false;

    // Filtro por tipo de documento
    if (filtros.tipoDocumento) {
      if (proveedor.tipoDocumento !== filtros.tipoDocumento) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="proveedores-container">
        <div className="loading">Cargando proveedores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="proveedores-container">
        <div className="error">{error}</div>
        <button onClick={cargarProveedores} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="proveedores-container">
      {/* Encabezado */}
      <div className="proveedores-header">
        <h2>PROVEEDORES</h2>
        <div className="header-actions">
          <button className="btn-nuevo" onClick={() => navigate('/proveedores/nuevo')}>
            Nuevo Proveedor
          </button>
        </div>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nombre, RUC o número de documento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filtros-avanzados" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          <select 
            value={filtros.tipoDocumento} 
            onChange={(e) => handleFiltroChange('tipoDocumento', e.target.value)}
            style={{ padding: '5px' }}
          >
            <option value="">Todos los tipos de documento</option>
            <option value="RUC">RUC</option>
            <option value="DNI">DNI</option>
            <option value="CE">Carnet de Extranjería</option>
            <option value="PASAPORTE">Pasaporte</option>
          </select>

          <button 
            onClick={limpiarFiltros}
            style={{ 
              padding: '5px 10px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Tabla de proveedores */}
      <div className="tabla-container">
        <table className="tabla-proveedores">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre/Razón Social</th>
              <th>Tipo Doc.</th>
              <th>Número Documento</th>
              <th>RUC</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  {busqueda || filtros.tipoDocumento
                    ? 'No se encontraron proveedores con los filtros aplicados' 
                    : 'No hay proveedores registrados'}
                </td>
              </tr>
            ) : (
              proveedoresFiltrados.map(proveedor => (
                <tr key={proveedor.id}>
                  <td>{proveedor.id}</td>
                  <td>
                    <div className="proveedor-info">
                      <div className="proveedor-nombre">{proveedor.nombre}</div>
                      {proveedor.nombreComercial && (
                        <div className="proveedor-comercial">{proveedor.nombreComercial}</div>
                      )}
                    </div>
                  </td>
                  <td>{proveedor.tipoDocumento}</td>
                  <td>{proveedor.numeroDocumento}</td>
                  <td>{proveedor.ruc || '-'}</td>
                  <td>{proveedor.telefono || '-'}</td>
                  <td>{proveedor.direccion || '-'}</td>
                  <td>
                    <div className="acciones">
                      <button 
                        className="btn-editar"
                        onClick={() => navigate(`/proveedores/editar/${proveedor.id}`)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-eliminar"
                        onClick={() => handleEliminar(proveedor.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      <div className="resumen">
        <p>
          Mostrando {proveedoresFiltrados.length} de {proveedores.length} proveedores
        </p>
      </div>
    </div>
  );
}

export default ListaProveedores;