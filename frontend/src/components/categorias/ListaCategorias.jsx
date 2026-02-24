import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, CheckCircle, XCircle } from 'lucide-react';
import { obtenerCategorias, eliminarCategoria } from '../../services/categoriaService';
import Swal from 'sweetalert2';
import '../../styles/ListaCategorias.css';

function ListaCategorias({ onEditarCategoria, onNuevaCategoria }) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    // Filtrar categorías cuando cambie el filtro
    if (Array.isArray(categorias)) {
      const filtradas = categorias.filter(categoria =>
        categoria.nombre && categoria.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
      );
      setCategoriasFiltradas(filtradas);
    } else {
      setCategoriasFiltradas([]);
    }
  }, [categorias, filtroNombre]);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const categoriasData = await obtenerCategorias();
      // Asegurar que categoriasData sea un array
      const categoriasArray = Array.isArray(categoriasData) ? categoriasData : 
                             (categoriasData?.data && Array.isArray(categoriasData.data)) ? categoriasData.data : [];
      setCategorias(categoriasArray);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategorias([]); // Establecer array vacío en caso de error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: `¿Estás seguro de que quieres eliminar "${nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      try {
        await eliminarCategoria(id);
        Swal.fire({
          icon: 'success',
          title: 'Categoría eliminada',
          text: 'La categoría ha sido eliminada correctamente'
        });
        cargarCategorias();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="lista-categorias-container">
      <div className="header-section">
        <h2>Gestión de Categorías</h2>
        <button className="btn-nueva" onClick={onNuevaCategoria}>
          <Plus className="icon" />
          Nueva Categoría
        </button>
      </div>

      <div className="filtros-section">
        <div className="filtro-busqueda">
          <label>Buscar categoría:</label>
          <input
            type="text"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            placeholder="Nombre de la categoría..."
          />
        </div>
      </div>

      <div className="categorias-grid">
        {categoriasFiltradas.length === 0 ? (
          <div className="no-categorias">
            <p>No se encontraron categorías</p>
          </div>
        ) : (
          categoriasFiltradas.map(categoria => (
            <div key={categoria.id} className="categoria-card">
              <div className="categoria-header">
                <h3>{categoria.nombre}</h3>
                <div className="categoria-actions">
                  <button 
                    className="btn-editar"
                    onClick={() => onEditarCategoria(categoria)}
                    title="Editar categoría"
                  >
                    <Edit className="icon" />
                  </button>
                  <button 
                    className="btn-eliminar"
                    onClick={() => handleEliminar(categoria.id, categoria.nombre)}
                    title="Eliminar categoría"
                  >
                    <Trash2 className="icon" />
                  </button>
                </div>
              </div>
              
              {categoria.descripcion && (
                <p className="categoria-descripcion">{categoria.descripcion}</p>
              )}
              
              <div className="categoria-stats">
                <span className="productos-count">
                  <Package className="icon" />
                  {categoria.Productos?.length || 0} productos
                </span>
                <span className={`estado ${categoria.estado}`}>
                  {categoria.estado === 'activo' ? (
                    <>
                      <CheckCircle className="icon" />
                      Activa
                    </>
                  ) : (
                    <>
                      <XCircle className="icon" />
                      Inactiva
                    </>
                  )}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="categorias-stats">
        <div className="stat-item">
          <span className="stat-number">{categorias.length}</span>
          <span className="stat-label">Total de categorías</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {categorias.filter(c => c.estado === 'activo').length}
          </span>
          <span className="stat-label">Categorías activas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {categoriasFiltradas.length}
          </span>
          <span className="stat-label">Mostrando</span>
        </div>
      </div>
    </div>
  );
}

export default ListaCategorias;