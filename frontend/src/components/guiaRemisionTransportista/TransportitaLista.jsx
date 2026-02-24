import React, { useEffect, useState } from 'react';
import '../../styles/TransportistaLista.css';
import TransportistasModal from './transportistas.jsx';
import { obtenerTransportistas, buscarTransportistas, eliminarTransportista } from '../../services/transportistaService';

const TransportistaLista = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Nombre');

  const [transportistas, setTransportistas] = useState([]);
  const [transportistasAll, setTransportistasAll] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTransportista, setEditingTransportista] = useState(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Puedes ajustar este número
  const [totalItems, setTotalItems] = useState(0);

  const cargarTransportistas = async () => {
    try {
      setLoading(true);
      const response = await obtenerTransportistas();
      // El backend devuelve { transportistas: [...] }
      const lista = response.transportistas || response.data || [];
      setTransportistasAll(lista);
      setTransportistas(lista);
      setTotalItems(lista.length);
      setCurrentPage(1); // Resetear a primera página cuando se cargan nuevos datos
    } catch (error) {
      console.error('Error al cargar transportistas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTransportistas();
  }, []);

  // Calcular los transportistas para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransportistas = transportistas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transportistas.length / itemsPerPage);

  const handleBuscar = async () => {
    const termino = (searchTerm || '').trim();
    if (!termino) {
      setTransportistas(transportistasAll);
      setTotalItems(transportistasAll.length);
      setCurrentPage(1);
      return;
    }
    try {
      setLoading(true);
      let resultados = [];
      
      if (filterType === 'Nombre') {
        const res = await buscarTransportistas({ razonSocial: termino });
        resultados = res.transportistas || [];
      } else if (filterType === 'Tipo de documento') {
        const res = await buscarTransportistas({ tipoDocumento: termino });
        resultados = res.transportistas || [];
      } else if (filterType === 'Número') {
        const res = await buscarTransportistas({ numeroDocumento: termino });
        resultados = res.transportistas || [];
      } else if (filterType === 'MTC') {
        resultados = transportistasAll.filter(t => 
          (t.mtc || '').toLowerCase().includes(termino.toLowerCase())
        );
      }
      
      setTransportistas(resultados);
      setTotalItems(resultados.length);
      setCurrentPage(1); // Ir a la primera página después de buscar
    } catch (error) {
      console.error('Error al buscar transportistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('¿Desea eliminar este transportista?');
    if (!ok) return;
    try {
      await eliminarTransportista(id);
      const nuevaListaAll = transportistasAll.filter(t => t.id !== id);
      const nuevaLista = transportistas.filter(t => t.id !== id);
      
      setTransportistasAll(nuevaListaAll);
      setTransportistas(nuevaLista);
      setTotalItems(nuevaLista.length);
      
      // Si la página actual queda vacía, retroceder una página
      if (currentTransportistas.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error al eliminar transportista:', error);
      alert('No se pudo eliminar el transportista');
    }
  };

  // Funciones para cambiar de página
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Máximo de números de página a mostrar
    
    if (totalPages <= maxPagesToShow) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Mostrar páginas con elipsis para muchas páginas
      if (currentPage <= 3) {
        // Al inicio
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Al final
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // En medio
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="tl-container">
      <div className="tl-header">
        <h1 className="tl-title">
          <span className="tl-icon">🚚</span>
          TRANSPORTISTAS
        </h1>
        <button className="tl-btn tl-btn-nuevo" onClick={() => setShowModal(true)}>
          ➕ Nuevo
        </button>
      </div>

      <div className="tl-content">
        <h2 className="tl-subtitle">Listado de Transportistas</h2>

        <div className="tl-filters">
          <select 
            className="tl-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option>Nombre</option>
            <option>Tipo de documento</option>
            <option>Número</option>
            <option>MTC</option>
          </select>
          <div className="tl-search-box">
            <input
              type="text"
              className="tl-search-input"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleBuscar(); }}
            />
            <button className="tl-btn tl-btn-search" onClick={handleBuscar}>
              🔍 Buscar
            </button>
          </div>
        </div>

        <div className="tl-table-wrapper">
          <table className="tl-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Tipo de documento</th>
                <th>Número</th>
                <th>MTC</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="tl-empty-state">Cargando...</td>
                </tr>
              ) : currentTransportistas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="tl-empty-state">
                    No hay transportistas registrados
                  </td>
                </tr>
              ) : (
                currentTransportistas.map((transportista, index) => (
                  <tr key={transportista.id || index}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{transportista.razonSocial || transportista.nombre || '-'}</td>
                    <td>{transportista.tipoDocumento}</td>
                    <td>{transportista.numeroDocumento || transportista.numero || '-'}</td>
                    <td>{transportista.mtc}</td>
                   
                    <td>
                      <div className="tl-action-buttons">
                        <button 
                          className="tl-btn-action tl-btn-edit" 
                          onClick={() => { 
                            setEditingTransportista(transportista); 
                            setShowModal(true); 
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="tl-btn-action tl-btn-delete" 
                          onClick={() => handleDelete(transportista.id)}
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

        <div className="tl-pagination">
          <span>Total {totalItems}</span>
          <div className="tl-pagination-controls">
            <button 
              className="tl-pagination-btn" 
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            
            {getPageNumbers().map((pageNumber, index) => (
              <button
                key={index}
                className={`tl-pagination-btn ${
                  pageNumber === currentPage ? 'tl-active' : ''
                } ${pageNumber === '...' ? 'tl-pagination-ellipsis' : ''}`}
                onClick={() => typeof pageNumber === 'number' && goToPage(pageNumber)}
                disabled={pageNumber === '...'}
              >
                {pageNumber}
              </button>
            ))}
            
            <button 
              className="tl-pagination-btn" 
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
          <span>Página {currentPage} de {totalPages}</span>
        </div>
      </div>
      
      {showModal && (
        <TransportistasModal
          isOpen={showModal}
          initialData={editingTransportista}
          onClose={() => { 
            setShowModal(false); 
            setEditingTransportista(null); 
          }}
          onSave={(item) => {
            if (editingTransportista && item?.id === editingTransportista.id) {
              // Actualizar transportista existente
              const updatedAll = transportistasAll.map(t => 
                t.id === item.id ? { ...t, ...item } : t
              );
              const updatedFiltered = transportistas.map(t => 
                t.id === item.id ? { ...t, ...item } : t
              );
              
              setTransportistasAll(updatedAll);
              setTransportistas(updatedFiltered);
            } else {
              // Agregar nuevo transportista
              setTransportistasAll(prev => [item, ...prev]);
              setTransportistas(prev => [item, ...prev]);
              setTotalItems(prev => prev + 1);
            }
            setShowModal(false);
            setEditingTransportista(null);
          }}
        />
      )}
    </div>
  );
};

export default TransportistaLista;