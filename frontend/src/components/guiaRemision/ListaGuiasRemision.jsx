import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  FileText,
  Calendar,
  User,
  Package,
  Truck
} from 'lucide-react';
import Swal from 'sweetalert2';
import guiaRemisionService from '../../services/guiaRemisionService';
import '../../styles/ListaGuias.css';

function ListaGuiasRemision() {
  const navigate = useNavigate();
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    cliente: '',
    serie: '',
    numero: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [guiasPorPagina] = useState(10);

  useEffect(() => {
    cargarGuias();
  }, []);

  const cargarGuias = async () => {
    try {
      setLoading(true);
      const response = await guiaRemisionService.obtenerGuias(filtros);
      setGuias(response.guiasRemision || []);
    } catch (error) {
      console.error('Error al cargar guías:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar guías',
        text: 'No se pudieron cargar las guías de remisión'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = () => {
    setPaginaActual(1);
    cargarGuias();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      estado: '',
      cliente: '',
      serie: '',
      numero: ''
    });
    setPaginaActual(1);
    cargarGuias();
  };

  const verDetalleGuia = (id) => {
    navigate(`/guias-remision/detalle/${id}`);
  };

  const editarGuia = (id) => {
    navigate(`/guia-remision/editar/${id}`);
  };

  const eliminarGuia = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await guiaRemisionService.eliminarGuiaRemision(id);
        Swal.fire({
          icon: 'success',
          title: 'Guía eliminada',
          text: 'La guía de remisión ha sido eliminada exitosamente'
        });
        cargarGuias();
      } catch (error) {
        console.error('Error al eliminar guía:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: error.response?.data?.mensaje || 'No se pudo eliminar la guía'
        });
      }
    }
  };

  const descargarPDF = async (id) => {
    try {
      await guiaRemisionService.generarPDFGuia(id);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al descargar',
        text: 'No se pudo generar el PDF de la guía'
      });
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await guiaRemisionService.cambiarEstadoGuia(id, nuevoEstado);
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La guía ha sido ${nuevoEstado.toLowerCase()}`,
        timer: 1500,
        showConfirmButton: false
      });
      cargarGuias();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cambiar estado',
        text: error.response?.data?.mensaje || 'No se pudo cambiar el estado'
      });
    }
  };

  const exportarExcel = async () => {
    try {
      await guiaRemisionService.exportarExcel(filtros);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al exportar',
        text: 'No se pudo exportar el archivo Excel'
      });
    }
  };

  // Paginación
  const indiceUltimaGuia = paginaActual * guiasPorPagina;
  const indicePrimeraGuia = indiceUltimaGuia - guiasPorPagina;
  const guiasActuales = guias.slice(indicePrimeraGuia, indiceUltimaGuia);
  const totalPaginas = Math.ceil(guias.length / guiasPorPagina);

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'Pendiente': return '#ffc107';
      case 'En tránsito': return '#17a2b8';
      case 'Entregado': return '#28a745';
      case 'Anulado': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="lista-guias-container">
      {/* Header */}
      <div className="lista-guias-header">
        <div className="header-titulo">
          <Truck size={32} />
          <div>
            <h1>Guías de Remisión</h1>
            <p>Gestión de guías de remisión y traslados</p>
          </div>
        </div>
        
        <div className="header-acciones"> 



{/* <button
            onClick={exportarExcel}
            className="btn-exportar"
            title="Exportar a Excel"
          >
            <Download size={20} />
            Excel
          </button> */ }
         



          
          <button
            onClick={() => navigate('/guia-remision/formulario')}
            className="btn-nueva-guia"
          >
            <Plus size={20} />
            Nueva Guía
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros-header">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="btn-toggle-filtros"
          >
            <Filter size={20} />
            Filtros
          </button>
          
          {mostrarFiltros && (
            <div className="filtros-acciones">
              <button onClick={aplicarFiltros} className="btn-aplicar">
                <Search size={16} />
                Buscar
              </button>
              <button onClick={limpiarFiltros} className="btn-limpiar">
                Limpiar
              </button>
            </div>
          )}
        </div>
        
        {mostrarFiltros && (
          <div className="filtros-grid">
            <div className="filtro-grupo">
              <label>Fecha</label>
              <input
                type="date"
                name="fechaInicio"
                value={filtros.fechaInicio}
                onChange={handleFiltroChange}
              />
            </div>
            
           
            
            <div className="filtro-grupo">
              <label>Estado</label>
              <select
                name="estado"
                value={filtros.estado}
                onChange={handleFiltroChange}
              >
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En tránsito">En tránsito</option>
                <option value="Entregado">Entregado</option> 
                {/*<option value="Anulado">Anulado</option>*/}
                
              </select>
            </div>
            
            <div className="filtro-grupo">
              <label>Cliente</label>
              <input
                type="text"
                name="cliente"
                value={filtros.cliente}
                onChange={handleFiltroChange}
                placeholder="Buscar por cliente..."
              />
            </div>
            
            <div className="filtro-grupo">
              <label>Serie</label>
              <input
                type="text"
                name="serie"
                value={filtros.serie}
                onChange={handleFiltroChange}
                placeholder="GR-001"
              />
            </div>
            
            <div className="filtro-grupo">
              <label>Número</label>
              <input
                type="text"
                name="numero"
                value={filtros.numero}
                onChange={handleFiltroChange}
                placeholder="00000001"
              />
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="estadisticas-rapidas">
        <div className="estadistica-card">
          <div className="estadistica-icono pendiente">
            <Calendar size={24} />
          </div>
          <div className="estadistica-info">
            <h3>{guias.filter(g => g.estado === 'Pendiente').length}</h3>
            <p>Pendientes</p>
          </div>
        </div>
        
        <div className="estadistica-card">
          <div className="estadistica-icono transito">
            <Truck size={24} />
          </div>
          <div className="estadistica-info">
            <h3>{guias.filter(g => g.estado === 'En tránsito').length}</h3>
            <p>En Tránsito</p>
          </div>
        </div>
        
        <div className="estadistica-card">
          <div className="estadistica-icono entregado">
            <Package size={24} />
          </div>
          <div className="estadistica-info">
            <h3>{guias.filter(g => g.estado === 'Entregado').length}</h3>
            <p>Entregadas</p>
          </div>
        </div>
        
        <div className="estadistica-card">
          <div className="estadistica-icono total">
            <FileText size={24} />
          </div>
          <div className="estadistica-info">
            <h3>{guias.length}</h3>
            <p>Total</p>
          </div>
        </div>
      </div>

      {/* Tabla de guías */}
      <div className="tabla-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando guías de remisión...</p>
          </div>
        ) : guiasActuales.length === 0 ? (
          <div className="no-datos">
            <FileText size={48} />
            <h3>No hay guías de remisión</h3>
            <p>No se encontraron guías con los filtros aplicados</p>
            <button
              onClick={() => navigate('/guia-remision/formulario')}
              className="btn-crear-primera"
            >
              <Plus size={20} />
              Crear primera guía
            </button>
          </div>
        ) : (
          <>
            <table className="tabla-guias">
              <thead>
                <tr>
                  <th>Comprobante</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Destino</th>
                  <th>Estado</th>
                  <th>Productos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {guiasActuales.map((guia) => (
                  <tr key={guia.id}>
                    <td>
                      <div className="comprobante-info">
                        <strong>{guia.serieComprobante}-{guia.numeroComprobante}</strong>
                        <small>ID: {guia.id}</small>
                      </div>
                    </td>
                    <td>
                      <div className="fecha-info">
                        <strong>{formatearFecha(guia.fechaSalida)}</strong>
                        <small>Salida</small>
                      </div>
                    </td>
                    <td>
                      <div className="cliente-info">
                        <User size={16} />
                        <div>
                          <strong>{guia.cliente?.nombre || guia.Cliente?.nombre || 'Sin cliente'}</strong>
                          <small>{guia.cliente?.numeroDocumento || guia.Cliente?.numeroDocumento}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="destino-info">
                        <small>Desde: {guia.puntoPartida}</small>
                        <strong>Hasta: {guia.puntoLlegada}</strong>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="estado-badge"
                        style={{ backgroundColor: obtenerColorEstado(guia.estado) }}
                      >
                        {guia.estado}
                      </span>
                    </td>
                    <td>
                      <div className="productos-info">
                        <Package size={16} />
                        <span>{
                          guia.detalles?.length ?? guia.DetalleGuiaRemisions?.length ?? 0
                        }</span>
                      </div>
                    </td>
                    <td>
                      <div className="acciones-grupo">
                        <button
                          onClick={() => verDetalleGuia(guia.id)}
                          className="btn-accion ver"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {guia.estado !== 'Anulado' && (
                          <button
                            onClick={() => editarGuia(guia.id)}
                            className="btn-accion editar"
                            title="Actualizar"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => descargarPDF(guia.id)}
                          className="btn-accion descargar"
                          title="Descargar PDF"
                        >
                          <Download size={16} />
                        </button>
                        
                        {guia.estado === 'Pendiente' && (
                          <button
                            onClick={() => cambiarEstado(guia.id, 'En tránsito')}
                            className="btn-accion transito"
                            title="Marcar en tránsito"
                          >
                            <Truck size={16} />
                          </button>
                        )}
                        
                        {guia.estado === 'En tránsito' && (
                          <button
                            onClick={() => cambiarEstado(guia.id, 'Entregado')}
                            className="btn-accion entregar"
                            title="Marcar como entregado"
                          >
                            <Package size={16} />
                          </button>
                        )}
                        
                        {guia.estado !== 'Anulado' && (
                          <button
                            onClick={() => eliminarGuia(guia.id)}
                            className="btn-accion eliminar"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="paginacion">
                <button
                  onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                  disabled={paginaActual === 1}
                  className="btn-paginacion"
                >
                  Anterior
                </button>
                
                <div className="paginas-numeros">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
                    <button
                      key={numero}
                      onClick={() => setPaginaActual(numero)}
                      className={`btn-pagina ${paginaActual === numero ? 'activa' : ''}`}
                    >
                      {numero}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                  disabled={paginaActual === totalPaginas}
                  className="btn-paginacion"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ListaGuiasRemision;