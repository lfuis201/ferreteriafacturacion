import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit, Trash2, X } from 'lucide-react';
import '../../styles/ReferenciaInventario.css';
import { 
  obtenerReferenciasInventario, 
  crearReferencia, 
  actualizarReferencia, 
  eliminarReferencia 
} from '../../services/inventarioService';

const ReferenciaInventario = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState({ codigo: '', descripcion: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inventarioData, setInventarioData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [error, setError] = useState('');

  // Cargar referencias al montar el componente
  useEffect(() => {
    cargarReferencias();
  }, [pagination.page]);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        cargarReferencias();
      }
    }, 500); // Esperar 500ms después del último cambio

    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para cargar referencias desde el backend
  const cargarReferencias = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filtros = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined
      };

      const response = await obtenerReferenciasInventario(filtros);
      
      setInventarioData(response.referencias || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      }));
    } catch (error) {
      console.error('Error al cargar referencias:', error);
      setError('Error al cargar las referencias de inventario');
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir modal de creación (botón Ingreso)
  const handleCreate = () => {
    setEditingItem({ codigo: '', descripcion: '' });
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  // Función para abrir modal de edición
  const handleEdit = (item) => {
    setEditingItem({ 
      codigo: item.codigo, 
      descripcion: item.descripcion
    });
    setIsEditing(true);
    setEditingId(item.id);
    setShowModal(true);
  };

  // Función para eliminar
  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta referencia?')) {
      try {
        setLoading(true);
        await eliminarReferencia(id);
        await cargarReferencias(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar referencia:', error);
        setError('Error al eliminar la referencia');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingItem({ codigo: '', descripcion: '' });
    setIsEditing(false);
    setEditingId(null);
    setError('');
  };

  const handleModalAccept = async () => {
    if (!editingItem.codigo || !editingItem.descripcion) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isEditing) {
        // Actualizar item existente
        await actualizarReferencia(editingId, {
          codigo: editingItem.codigo,
          descripcion: editingItem.descripcion
        });
      } else {
        // Crear nuevo item
        await crearReferencia({
          codigo: editingItem.codigo,
          descripcion: editingItem.descripcion
        });
      }

      await cargarReferencias(); // Recargar la lista
      handleModalClose();
    } catch (error) {
      console.error('Error al guardar referencia:', error);
      setError(error.message || 'Error al guardar la referencia');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar búsqueda manual (botón buscar)
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    cargarReferencias();
  };

  // Función para cambiar página
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };



  return (
    <div className="referencia-inventario-container">
      {/* Header - Manteniendo el diseño del primer componente */}
      <div className="header">
        <div className="header-left">
          <div>
            <Package className="icon" size={24} />
          </div>
          <p>REFERENCIAS DE INVENTARIO</p>
        </div>
        <button 
          className="btn-ingreso" 
          onClick={handleCreate}
          disabled={loading}
        >
          <Plus size={16} style={{ marginRight: '8px' }} />
          Ingreso
        </button>
      </div>

      {/* Content */}
      <div className="content">
        <h3>Listado de Referencias de Inventario</h3>
        
        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="loading">
            Cargando referencias...
          </div>
        )}

        {/* Search Section - Manteniendo el diseño del primer componente */}
        <div className="search-section">
          <div className="search-group">
        
            <input
              type="text"
              placeholder="Buscar..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className="btn-buscar" 
              onClick={handleSearch}
              disabled={loading}
            >
              <Search size={16} style={{ marginRight: '8px' }} />
              Buscar
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Código</th>
                <th>Descripción</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inventarioData.length === 0 && !loading ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    No se encontraron referencias de inventario
                  </td>
                </tr>
              ) : (
                inventarioData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                    <td>{item.codigo}</td>
                    <td>{item.descripcion}</td>
                    <td className="action-buttons">
                      <button 
                        className="btn-editarr icon-button"
                        onClick={() => handleEdit(item)}
                        title="Editar"
                        disabled={loading}
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="btn-eliminar icon-button"
                        onClick={() => handleEliminar(item.id)}
                        title="Eliminar"
                        disabled={loading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination - Mejorada con funcionalidad real */}
          <div className="pagination">
            <span>Total: {pagination.total} registros</span>
            <div className="page-numbers">
              {pagination.page > 1 && (
                <button 
                  className="page-button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={loading}
                >
                  Anterior
                </button>
              )}
              
              <span className="page-active">{pagination.page}</span>
              
              {pagination.page < pagination.totalPages && (
                <button 
                  className="page-button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={loading}
                >
                  Siguiente
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Manteniendo el diseño del primer componente pero con funcionalidad real */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{isEditing ? 'Editar referencia de inventario' : 'Nueva referencia de inventario'}</h3>
              <button className="modal-close" onClick={handleModalClose}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Código</label>
                  <input
                    type="text"
                    value={editingItem.codigo}
                    onChange={(e) => setEditingItem({...editingItem, codigo: e.target.value})}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <input
                    type="text"
                    value={editingItem.descripcion}
                    onChange={(e) => setEditingItem({...editingItem, descripcion: e.target.value})}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Campo activo agregado */}
             
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancelar" 
                onClick={handleModalClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="btn-aceptar" 
                onClick={handleModalAccept}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenciaInventario;