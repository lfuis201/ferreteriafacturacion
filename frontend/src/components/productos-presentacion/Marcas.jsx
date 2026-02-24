import React, { useEffect, useState } from 'react';
import '../../styles/Marcas.css';
import { getMarcas, createMarca, updateMarca, deleteMarca } from '../../services/marcaService';

const Marcas = () => {
  const [showModal, setShowModal] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [total, setTotal] = useState(0);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [page] = useState(1);
  const [limit] = useState(10);

  const [editingId, setEditingId] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    
  });

 

  const handleOpenModal = (marca = null) => {
    if (marca) {
      setEditingId(marca.id);
      setFormData({
        nombre: marca.nombre,
      
      });
    
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
       
      });
     
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const actualizada = await updateMarca(editingId, { nombre: formData.nombre });
        setMarcas(marcas.map(m => (m.id === actualizada.id ? actualizada : m)));
      } else {
        const creada = await createMarca({ nombre: formData.nombre });
        setMarcas([creada, ...marcas]);
        setTotal(total + 1);
      }
      setShowModal(false);
      setEditingId(null);
    } catch (err) {
      alert(err?.message || 'Error al guardar la marca');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta marca?')) return;
    try {
      await deleteMarca(id);
      setMarcas(marcas.filter(m => m.id !== id));
      setTotal(Math.max(0, total - 1));
    } catch (err) {
      alert(err?.message || 'Error al eliminar la marca');
    }
  };

  const cargarMarcas = async () => {
    try {
      const { data, total: t } = await getMarcas({ nombre: filtroNombre, page, limit });
      setMarcas(data);
      setTotal(t);
    } catch (err) {
      alert(err?.message || 'Error al cargar marcas');
    }
  };

  const handleSearch = async () => {
    await cargarMarcas();
  };

  useEffect(() => {
    cargarMarcas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="marcas-container">
      <div className="marcas-header">
        <div className="marcas-title">
          <span className="marcas-icon">🏷️</span>
          <h1>MARCAS</h1>
        </div>
        <button 
          className="marcas-btn-nuevo"
          onClick={() => handleOpenModal()}
        >
          ⊕ Nuevo
        </button>
      </div>

      <div className="marcas-section">
        <h2 className="marcas-section-title">Listado de Marcas</h2>

        <div className="marcas-filters">
          <input 
            type="text" 
            className="marcas-filter-input"
            placeholder="Nombre"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
          />
       
          <button className="marcas-btn-buscar" onClick={handleSearch}>🔍 Buscar</button>
        </div>

        <div className="marcas-table-wrapper">
          <table className="marcas-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                
                <th>Fecha creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {marcas.map((marca, index) => (
                <tr key={marca.id}>
                  <td>{index + 1}</td>
                  <td>{marca.nombre}</td>
                  <td>{marca.createdAt ? new Date(marca.createdAt).toLocaleString() : ''}</td>
                  <td>
                    <div className="marcas-acciones">
                      <button 
                        className="marcas-btn-editar"
                        onClick={() => handleOpenModal(marca)}
                      >
                        Editar
                      </button>
                      <button 
                        className="marcas-btn-eliminar"
                        onClick={() => handleDelete(marca.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="marcas-pagination">
            <span>Total {total}</span>
            <div className="marcas-pagination-buttons">
              <button className="marcas-page-btn">‹</button>
              <button className="marcas-page-btn marcas-active">1</button>
              <button className="marcas-page-btn">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="marcas-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="marcas-modal" onClick={(e) => e.stopPropagation()}>
            <div className="marcas-modal-header">
              <h2>{editingId ? 'Editar marca' : 'Nueva marca'}</h2>
              <button 
                className="marcas-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="marcas-modal-body">
              <div className="marcas-form-content">
                <div className="marcas-form-group">
                  <label>Nombre</label>
                  <input 
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="marcas-input"
                    required
                  />
                </div>

                <div className="marcas-form-group">
                 
                  
                </div>
              </div>

              <div className="marcas-modal-footer">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="marcas-btn-cancelar"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="marcas-btn-guardar"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marcas;