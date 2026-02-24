import React, { useEffect, useState } from 'react';
import '../../styles/Series.css';
import { obtenerProductos } from '../../services/productoService';
import { obtenerSeries, crearSerie, actualizarSerie, eliminarSerie } from '../../services/serieService';

const Series = () => {
  const [showModal, setShowModal] = useState(false);
  const [series, setSeries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filterBy, setFilterBy] = useState('serie');
  const [query, setQuery] = useState('');

  const [formData, setFormData] = useState({
    serie: '',
    producto: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'Activo',
    vendido: 'No',
    observaciones: ''
  });

  const handleOpenModal = (serieItem = null) => {
    if (serieItem) {
      setEditingId(serieItem.id);
      setFormData({
        serie: serieItem.serie || '',
        producto: (serieItem.productoId || serieItem.Producto?.id || ''),
        fecha: (serieItem.fecha || new Date().toISOString().split('T')[0]),
        estado: serieItem.estado || 'Activo',
        vendido: (typeof serieItem.vendido === 'boolean') ? (serieItem.vendido ? 'Sí' : 'No') : (serieItem.vendido || 'No'),
        observaciones: serieItem.observaciones || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        serie: '',
        producto: '',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'Activo',
        vendido: 'No',
        observaciones: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        serie: formData.serie,
        productoId: formData.producto,
        fecha: formData.fecha,
        estado: formData.estado,
        vendido: formData.vendido === 'Sí',
        observaciones: formData.observaciones
      };

      if (editingId) {
        const actualizada = await actualizarSerie(editingId, payload);
        setSeries(prev => prev.map(it => it.id === actualizada.id ? actualizada : it));
      } else {
        const creada = await crearSerie(payload);
        setSeries(prev => [creada, ...prev]);
        setTotal(prev => prev + 1);
      }

      setShowModal(false);
      setEditingId(null);
    } catch (err) {
      alert(err.message || 'Error al guardar la serie');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta serie?')) return;
    try {
      await eliminarSerie(id);
      setSeries(prev => prev.filter(item => item.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.message || 'Error al eliminar la serie');
    }
  };

  const cargarProductos = async () => {
    try {
      const res = await obtenerProductos();
      setProductos(res.productos || res.data || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  const cargarSeries = async () => {
    try {
      const res = await obtenerSeries({ filterBy, query, page, limit });
      setSeries(res.series || res.data || []);
      setTotal(res.total || (res.series ? res.series.length : 0));
    } catch (err) {
      console.error('Error al cargar series:', err);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    cargarSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterBy, query, page]);

  return (
    <div className="series-container">
      <div className="series-header">
        <div className="series-title">
          <span className="series-icon">📋</span>
          <h1>SERIES</h1>
        </div>
        <button 
          className="series-btn-nuevo"
          onClick={() => handleOpenModal()}
        >
          ⊕ Nuevo
        </button>
      </div>

      <div className="series-section">
        <h2 className="series-section-title">Listado de Series</h2>

        <div className="series-filters">
          <div className="series-filter-group">
            <label>Filtrar por:</label>
            <select 
              className="series-filter-select"
              value={filterBy}
              onChange={(e) => { setPage(1); setFilterBy(e.target.value || 'serie'); }}
            >
              <option value="serie">Serie</option>
              <option value="producto">Producto</option>
              <option value="estado">Estado</option>
            </select>
          </div>
          <input 
            type="text" 
            className="series-search-input"
            placeholder="🔍 Buscar"
            value={query}
            onChange={(e) => { setPage(1); setQuery(e.target.value); }}
          />
        </div>

        <div className="series-table-wrapper">
          <table className="series-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Serie</th>
                <th>Producto</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Vendido</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {series.length === 0 ? (
                <tr>
                  <td colSpan="7" className="series-empty">
                    Total 0
                  </td>
                </tr>
              ) : (
                series.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.serie}</td>
                    <td>{item.Producto?.nombre || item.productoNombre || item.producto || '-'}</td>
                    <td>{item.fecha}</td>
                    <td>
                      <span className={`series-badge series-badge-${item.estado.toLowerCase()}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td>{typeof item.vendido === 'boolean' ? (item.vendido ? 'Sí' : 'No') : item.vendido}</td>
                    <td>
                      <div className="series-acciones">
                        <button 
                          className="series-btn-editar"
                          onClick={() => handleOpenModal(item)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button 
                          className="series-btn-eliminar"
                          onClick={() => handleDelete(item.id)}
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
          <div className="series-pagination">
            <span>Total {total}</span>
            <div className="series-pagination-buttons">
              <button 
                className="series-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹
              </button>
              <button className="series-page-btn series-active">{page}</button>
              <button 
                className="series-page-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={series.length < limit}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="series-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="series-modal" onClick={(e) => e.stopPropagation()}>
            <div className="series-modal-header">
              <h2>{editingId ? 'Editar Serie' : 'Nueva Serie'}</h2>
              <button 
                className="series-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="series-modal-body">
              <div className="series-form-content">
                <div className="series-form-row">
                  <div className="series-form-group">
                    <label>
                      Serie <span className="series-required">*</span>
                    </label>
                    <input 
                      type="text"
                      value={formData.serie}
                      onChange={(e) => setFormData({...formData, serie: e.target.value})}
                      className="series-input"
                      placeholder="Ingrese el número de serie"
                      required
                    />
                  </div>

                  <div className="series-form-group">
                    <label>
                      Producto <span className="series-required">*</span>
                    </label>
                    <select 
                      value={formData.producto}
                      onChange={(e) => setFormData({...formData, producto: e.target.value})}
                      className="series-select"
                      required
                    >
                      <option value="">Seleccionar producto</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="series-form-row">
                  <div className="series-form-group">
                    <label>
                      Fecha <span className="series-required">*</span>
                    </label>
                    <input 
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      className="series-input"
                      required
                    />
                  </div>

                  <div className="series-form-group">
                    <label>Estado</label>
                    <select 
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                      className="series-select"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="En Reparación">En Reparación</option>
                      <option value="Garantía">Garantía</option>
                    </select>
                  </div>
                </div>

                <div className="series-form-row">
                  <div className="series-form-group">
                    <label>Vendido</label>
                    <select 
                      value={formData.vendido}
                      onChange={(e) => setFormData({...formData, vendido: e.target.value})}
                      className="series-select"
                    >
                      <option value="No">No</option>
                      <option value="Sí">Sí</option>
                    </select>
                  </div>

                  <div className="series-form-group">
                    <label>Observaciones</label>
                    <textarea 
                      className="series-textarea"
                      rows="3"
                      placeholder="Ingrese observaciones adicionales (opcional)"
                      value={formData.observaciones}
                      onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="series-modal-footer">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="series-btn-cancelar"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="series-btn-guardar"
                >
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Series;