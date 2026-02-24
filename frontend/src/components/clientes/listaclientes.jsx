import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { obtenerClientes, eliminarCliente as eliminarClienteAPI, obtenerClientePorId } from '../../services/clienteService';
import ModalCliente from './ModalCliente';
import ModalClienteEdit from './ModalClienteEdit';
import '../../styles/ListaClientes.css';

const ListaClientes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedName, setSelectedName] = useState('Nombre');
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdit, setMostrarModalEdit] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(null);
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 10;

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, []);

  // Filtrar clientes cuando cambie el término de búsqueda
  useEffect(() => {
    filtrarClientes();
  }, [searchTerm, selectedName, clientes]);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const response = await obtenerClientes();
      console.log('📊 Respuesta del backend:', response);
      
      // El backend devuelve { clientes: [...] }
      const clientesData = response.clientes || [];
      console.log('👥 Clientes obtenidos:', clientesData);
      
      setClientes(clientesData);
      setError(null);
    } catch (error) {
      console.error('❌ Error al cargar clientes:', error);
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const filtrarClientes = () => {
    if (!searchTerm.trim()) {
      setClientesFiltrados(clientes);
      return;
    }

    const clientesFiltrados = clientes.filter(cliente => {
      const termino = searchTerm.toLowerCase();
      
      switch (selectedName) {
        case 'Nombre':
          return cliente.nombre?.toLowerCase().includes(termino);
        
        case 'Documento':
          return cliente.numeroDocumento?.toLowerCase().includes(termino);
        default:
          return cliente.nombre?.toLowerCase().includes(termino);
      }
    });

    setClientesFiltrados(clientesFiltrados);
    setPaginaActual(1); // Resetear a la primera página al filtrar
  };

  const handleClienteCreado = (nuevoCliente) => {
    console.log('✅ Cliente creado:', nuevoCliente);
    // Agregar el nuevo cliente al inicio de la lista (más reciente primero)
    setClientes(prevClientes => [nuevoCliente, ...prevClientes]);
    setClientesFiltrados(prevClientes => [nuevoCliente, ...prevClientes]);
    setMostrarModal(false);
    setClienteEditando(null);
  };

  const handleClienteActualizado = (clienteActualizado) => {
    console.log('✅ Cliente actualizado:', clienteActualizado);
    // Actualizar el cliente en ambas listas
    setClientes(prevClientes => 
      prevClientes.map(cliente => 
        cliente.id === clienteActualizado.id ? clienteActualizado : cliente
      )
    );
    setClientesFiltrados(prevClientes => 
      prevClientes.map(cliente => 
        cliente.id === clienteActualizado.id ? clienteActualizado : cliente
      )
    );
    setMostrarModalEdit(false);
    setClienteEditando(null);
  };

  const abrirModalNuevo = () => {
    setClienteEditando(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (cliente) => {
    setClienteEditando(cliente);
    setMostrarModalEdit(true);
    setMenuAbierto(null);
  };

  const eliminarCliente = async (clienteId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        setLoading(true);
        // Llamada a la API para eliminar el cliente
        await eliminarClienteAPI(clienteId);
        
        // Remover el cliente de la lista local después de eliminarlo exitosamente
        setClientes(prevClientes => prevClientes.filter(c => c.id !== clienteId));
        setClientesFiltrados(prevClientes => prevClientes.filter(c => c.id !== clienteId));
        setMenuAbierto(null);
        
        console.log('✅ Cliente eliminado exitosamente:', clienteId);
        alert('Cliente eliminado exitosamente');
      } catch (error) {
        console.error('❌ Error al eliminar cliente:', error);
        alert(`Error al eliminar el cliente: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleMenu = (clienteId) => {
    setMenuAbierto(menuAbierto === clienteId ? null : clienteId);
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuAbierto(null);
    };

    if (menuAbierto) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuAbierto]);

  // Lógica de paginación
  const indiceUltimoCliente = paginaActual * clientesPorPagina;
  const indicePrimerCliente = indiceUltimoCliente - clientesPorPagina;
  const clientesActuales = clientesFiltrados.slice(indicePrimerCliente, indiceUltimoCliente);
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const renderPaginacion = () => {
    const paginas = [];
    const maxPaginasVisibles = 5;
    let paginaInicio = Math.max(1, paginaActual - Math.floor(maxPaginasVisibles / 2));
    let paginaFin = Math.min(totalPaginas, paginaInicio + maxPaginasVisibles - 1);

    // Ajustar el inicio si estamos cerca del final
    if (paginaFin - paginaInicio < maxPaginasVisibles - 1) {
      paginaInicio = Math.max(1, paginaFin - maxPaginasVisibles + 1);
    }

    // Botón anterior
    if (paginaActual > 1) {
      paginas.push(
        <button
          key="anterior"
          className="pagination-btn"
          onClick={() => cambiarPagina(paginaActual - 1)}
        >
          ‹
        </button>
      );
    }

    // Páginas numeradas
    for (let i = paginaInicio; i <= paginaFin; i++) {
      paginas.push(
        <button
          key={i}
          className={`pagination-btn ${i === paginaActual ? 'pagination-btn-active' : ''}`}
          onClick={() => cambiarPagina(i)}
        >
          {i}
        </button>
      );
    }

    // Botón siguiente
    if (paginaActual < totalPaginas) {
      paginas.push(
        <button
          key="siguiente"
          className="pagination-btn"
          onClick={() => cambiarPagina(paginaActual + 1)}
        >
          ›
        </button>
      );
    }

    return paginas;
  };

  if (loading) {
    return (
      <div className="lista-clientes-container">
        <div className="loading-message">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="lista-clientes-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-buttons">
            <button 
              className="btn btn-red"
              onClick={abrirModalNuevo}
            >
              <Plus className="btn-icon" />
              <span>Nuevo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="main-content">
        <div className="content-card">
          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
              <button onClick={cargarClientes} className="btn btn-small">
                Reintentar
              </button>
            </div>
          )}

          {/* Search and Filters */}
          <div className="search-section">
            <div className="search-controls">
              <select 
                className="form-selectt"
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
              >
                <option>Nombre</option>
                <option>Documento</option>
              </select>
              
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Buscar"
                  className="form-input search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="data-table">
              <thead className="table-headerr">
                <tr>
                  <th className="table-th">#</th>
                  <th className="table-th table-th-name">Nombre</th>
                  <th className="table-th">Cod interno</th>
                  <th className="table-th">Tipo de documento</th>
                  <th className="table-th">Número</th>
                  <th className="table-th">Correo</th>
                  <th className="table-th">Teléfono</th>
                  <th className="table-th">Departamento</th>
                  <th className="table-th">Provincia</th>
                  <th className="table-th">Dirección</th>
                  <th className="table-th">Acciones</th>
                </tr>
              </thead>
              
              <tbody className="table-body">
                {clientesActuales.length > 0 ? (
                  clientesActuales.map((cliente, index) => (
                    <tr 
                      key={cliente.id} 
                      onClick={() => abrirModalEditar(cliente)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="table-td">{indicePrimerCliente + index + 1}</td>
                      <td className="table-td table-td-name" title={cliente.nombre}>
                        {cliente.nombre}
                      </td>
                      <td className="table-td">{cliente.codInterno}</td>
                      <td className="table-td">{cliente.tipoDocumento}</td>
                      <td className="table-td">{cliente.numeroDocumento}</td>
                      <td className="table-td" title={cliente.email}>
                        {cliente.email}
                      </td>
                      <td className="table-td">{cliente.telefono}</td>
                      <td className="table-td">{cliente.departamento}</td>
                      <td className="table-td">{cliente.provincia}</td>
                      <td className="table-td table-td-address" title={cliente.direccion}>
                        {cliente.direccion}
                      </td>
                      <td className="table-td">
                        <div className="actions-container">
                          <button 
                            className="actions-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(cliente.id);
                            }}
                          >
                            ⋮
                          </button>
                          {menuAbierto === cliente.id && (
                            <div className="">
                              <button
                                className="actions-menu-item"
                                onClick={() => abrirModalEditar(cliente)}
                              >
                                <Edit size={16} />
                                Editar
                              </button>
                              <button
                                className="actions-menu-item delete"
                                onClick={() => eliminarCliente(cliente.id)}
                              >
                                <Trash2 size={16} />
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="table-td text-center">
                      {searchTerm ? 'No se encontraron clientes con ese criterio de búsqueda' : 'No hay clientes registrados'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-section">
            <div className="pagination-content">
              <div className="pagination-info">
                Total: {clientesFiltrados.length} | Página {paginaActual} de {totalPaginas || 1}
              </div>
              <div className="pagination-controls">
                {renderPaginacion()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cliente */}
      {mostrarModal && (
        <ModalCliente
          onClose={() => {
            setMostrarModal(false);
            setClienteEditando(null);
          }}
          onClienteCreado={handleClienteCreado}
          clienteEditando={clienteEditando}
        />
      )}

      {/* Modal Cliente Edit */}
      {mostrarModalEdit && (
        <ModalClienteEdit
          cliente={clienteEditando}
          onClose={() => {
            setMostrarModalEdit(false);
            setClienteEditando(null);
          }}
          onClienteActualizado={handleClienteActualizado}
        />
      )}
    </div>
  );
};

export default ListaClientes;