import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Package, X } from 'lucide-react';
import ModalNuevoTraslado from './ModalNuevoTraslado';
import { obtenerTraslados, descargarPdfTraslado } from '../../services/inventarioService';
import '../../styles/TrasladoInventario.css';

const TrasladoInventario = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [selectedTraslado, setSelectedTraslado] = useState(null);
  const [traslados, setTraslados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar traslados al montar el componente
  useEffect(() => {
    cargarTraslados();
  }, []);

  // Función para cargar traslados desde el backend
  const cargarTraslados = async () => {
    setLoading(true);
    try {
      const response = await obtenerTraslados();
      if (response.success) {
        // Transformar los datos del backend al formato esperado por el componente
        const trasladosFormateados = response.data.map(movimiento => ({
          id: movimiento.id,
          fecha: new Date(movimiento.createdAt).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          almacenInicial: movimiento.SucursalOrigen?.nombre || 'No especificado',
          almacenDestino: movimiento.SucursalDestino?.nombre || 'No especificado',
          detalle: movimiento.observacion || 'Sin observaciones',
          detalleProductos: movimiento.Producto?.nombre || 'Producto no especificado',
          cantidadTotalProductos: movimiento.cantidad || 0,
          // Datos adicionales del movimiento original
          movimientoOriginal: movimiento
        }));
        setTraslados(trasladosFormateados);
      }
    } catch (error) {
      console.error('Error al cargar traslados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la descarga del PDF
  const handleDescargarPdf = async (traslado) => {
    try {
      setLoading(true);
      await descargarPdfTraslado(traslado.id);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el PDF del traslado');
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para obtener solo la fecha (sin hora) de una fecha
  const obtenerSoloFecha = (fecha) => {
    if (!fecha) return null;
    const dateObj = new Date(fecha);
    // Asegurarse de que la fecha sea válida
    if (isNaN(dateObj.getTime())) return null;
    
    // Obtener año, mes y día en formato YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const filteredTraslados = traslados.filter(traslado => {
    // Filtro por texto
    const matchesSearch = !searchTerm || 
      traslado.almacenInicial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traslado.almacenDestino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traslado.detalle.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por fecha mejorado
    const matchesDate = !fechaFiltro || (() => {
      try {
        // Obtener la fecha del traslado desde el movimiento original
        const fechaTraslado = traslado.movimientoOriginal?.createdAt;
        if (!fechaTraslado) return false;
        
        // Obtener solo la parte de la fecha (sin hora) de ambas fechas
        const fechaTrasladoSolo = obtenerSoloFecha(fechaTraslado);
        
        // Comparar las fechas
        const coincideFecha = fechaTrasladoSolo === fechaFiltro;
        
        // Debug para verificar las comparaciones
        console.log('Comparando fechas:', {
          fechaFiltro,
          fechaTraslado,
          fechaTrasladoSolo,
          coincide: coincideFecha
        });
        
        return coincideFecha;
      } catch (error) {
        console.error('Error al comparar fechas:', error);
        return false;
      }
    })();

    return matchesSearch && matchesDate;
  });

  const handleShowDetalle = (traslado) => {
    setSelectedTraslado(traslado);
    setIsDetalleModalOpen(true);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setSearchTerm('');
    setFechaFiltro('');
  };

  // Modal Detalle Productos Component
  const ModalDetalleProductos = () => {
    // Usar datos reales del traslado seleccionado
    const productosDetalle = selectedTraslado ? [
      {
        id: selectedTraslado.id,
        producto: selectedTraslado.detalleProductos || 'Sin detalle',
        cantidad: selectedTraslado.cantidadTotalProductos || 0
      }
    ] : [];

    if (!isDetalleModalOpen) return null;

    return (
      <div className="modal-overlay-detalle">
        <div className="modal-container-detalle">
          {/* Header */}
          <div className="modal-header-detalle">
            <h2>Detalle Productos</h2>
            <button className="close-btn-detalle" onClick={() => setIsDetalleModalOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body-detalle">
            <div className="detalle-table-container">
              <table className="detalle-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {productosDetalle.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                        No hay datos del traslado seleccionado
                      </td>
                    </tr>
                  ) : (
                    productosDetalle.map((producto, index) => (
                      <tr key={producto.id}>
                        <td>{producto.id}</td>
                        <td>{producto.producto}</td>
                        <td>{producto.cantidad}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="traslados-container">
      {/* Header */}
      <div className="traslados-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">
              <Package size={14} />
            </span>
            <span className="logo-text">TRASLADOS</span>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-nuevo" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Nuevo
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="traslados-content">
        <div className="content-header">
          <h2>Listado de Traslados</h2>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Filtrar por:</label>
            <select className="filter-select">
              <option>Fecha de emisión</option>
            </select>
          </div>


           <div className="search-group">
            <div className="search-container">
              <input
                type="date"
                placeholder="Seleccionar fecha"
                className="search-input"
                value={fechaFiltro}
                onChange={(e) => setFechaFiltro(e.target.value)}
              />
            </div>
          </div>
          
          <div className="search-group">
            <div className="search-container">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por almacén o detalle..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

         

          {/* Botón para limpiar filtros */}
          <div className="search-group">
            <button 
              className="btn-limpiar-filtros"
              onClick={limpiarFiltros}
              style={{
                padding: '8px 16px',
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

        {/* Debug info - puedes remover esto en producción */}
        {fechaFiltro && (
          <div style={{ padding: '10px', backgroundColor: '#f8f9fa', margin: '10px 0', fontSize: '12px' }}>
            <strong>Debug:</strong> Filtro de fecha activo: {fechaFiltro} | 
            Traslados encontrados: {filteredTraslados.length} de {traslados.length}
          </div>
        )}

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Cargando traslados...
            </div>
          ) : (
            <table className="traslados-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Almacen Inicial</th>
                  <th>Almacen Destino</th>
                  <th>Detalle</th>
                  <th>Detalle Productos</th>
                  <th>Cantidad Total Productos</th>


  {/* <th>Acciones</th>*/}
                 



                </tr>
              </thead>
              <tbody>
                {filteredTraslados.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                      {fechaFiltro || searchTerm ? 'No se encontraron traslados con los filtros aplicados' : 'No se encontraron traslados'}
                    </td>
                  </tr>
                ) : (
                  filteredTraslados.map((traslado) => (
                    <tr key={traslado.id}>
                      <td>{traslado.id}</td>
                      <td>{traslado.fecha}</td>
                      <td>{traslado.almacenInicial}</td>
                      <td>{traslado.almacenDestino}</td>
                      <td>{traslado.detalle}</td>
                      <td>
                        <span 
                          className="detalle-productos"
                          onClick={() => handleShowDetalle(traslado)}
                        >
                          <Package size={16} />
                        </span>
                      </td>
                      <td>{traslado.cantidadTotalProductos}</td>


{/*
                      <td>
                        <button 
                          className="btn-pdf"
                          onClick={() => handleDescargarPdf(traslado)}
                          disabled={loading}
                        >
                          <FileText size={14} />
                          PDF
                        </button>
                      </td> */}




                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="table-footer">
          <span>Total: {filteredTraslados.length}</span>
          <span>{filteredTraslados.length}</span>
        </div>
      </div>

      {/* Modals */}
      <ModalNuevoTraslado 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onTrasladoCreado={cargarTraslados}
      />
      
      <ModalDetalleProductos />
    </div>
  );
};

export default TrasladoInventario;