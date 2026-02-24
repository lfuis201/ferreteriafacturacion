import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerVentas, anularVenta, obtenerEstadoSunat, descargarXMLVenta, reenviarVentaSunat } from '../../services/ventaService';
import whatsappService from '../../services/whatsappService';
import apiClient from '../../services/apiService';
import guiaRemisionService from '../../services/guiaRemisionService';
import ModalWhatsApp from './ModalWhatsApp';
import Swal from 'sweetalert2';
import './ListaVentas.css';

// Estilos CSS para el dropdown del PDF
const dropdownStyles = `
  .dropdown-pdf {
    position: relative;
    display: inline-block;
  }
  
  .dropdown-menu-pdf {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 1000;
    min-width: 120px;
  }
  
  .dropdown-item {
    display: block;
    width: 100%;
    padding: 8px 12px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    font-size: 12px;
    color: #333;
  }
  
  .dropdown-item:hover {
    background-color: #f8f9fa;
  }
  
  .dropdown-toggle::after {
    margin-left: 4px;
  }
  
  .btn-accion:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
  }
  
  .btn-pdf { background-color: #dc3545; }
  .btn-xml { background-color: #28a745; }
  .btn-cdr { background-color: #17a2b8; }
  .btn-whatsapp { background-color: #25d366; }
  .btn-detalle { background-color: #6c757d; }
  .btn-anular { background-color: #fd7e14; }
`; 
// fin de css dropdown

// Inyectar estilos en el head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = dropdownStyles;
  document.head.appendChild(styleElement);
}

function ListaVentas({ onVerDetalle }) {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    horaInicial: '',
    horaFinal: '',
    clientes: '',
    productos: '',
    categorias: '',
    lote: '',
    fechaEmision: '',
    establecimiento: '',
    estado: '',
    numeroGuia: '',
    placa: '',
    ubicado: '',
    redPago: ''
  });
  const [columnasVisibles, setColumnasVisibles] = useState({
    id: true,
    fechaVenta: true,
    createdAt: true,
    updatedAt: false,
    cliente: true,
    tipoComprobante: true,
    serieComprobante: true,
    numeroComprobante: true,
    estado: true,
    estadoSunat: false,
    subtotal: true,
    igv: true,
    total: true,
    metodoPago: true,
    formaPago: false,
    moneda: false,
    fechaVencimiento: false,
    observacion: false,
    tipoOperacion: false,
    codigoVin: false,
    tallerId: false,
    motivoAnulacion: false,
    fechaAnulacion: false,
    usuarioAnulacionId: false,
    codigoHash: false,
    xmlUrl: false,
    cdrUrl: false,
    pdfUrl: false,
    ticketUrl: false,
    sunatError: false
  });
  const [mostrarModalWhatsApp, setMostrarModalWhatsApp] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [mostrarColumnas, setMostrarColumnas] = useState(false);

  useEffect(() => {
    cargarVentas();
    
    // Cerrar dropdowns al hacer click fuera
    const handleClickOutside = (event) => {
      const dropdowns = document.querySelectorAll('.dropdown-menu-pdf');
      dropdowns.forEach(dropdown => {
        if (!dropdown.parentElement.contains(event.target)) {
          dropdown.style.display = 'none';
        }
      });
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarVentas();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filtros]);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando ventas con filtros:', filtros);
      
      // Verificar autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No hay token de autenticación');
        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: 'Por favor, inicia sesión nuevamente'
        });
        return;
      }

      const response = await obtenerVentas(filtros);
      console.log('✅ Respuesta del servidor:', response);
      
      // Manejar diferentes formatos de respuesta
      let ventasData = [];
      if (Array.isArray(response)) {
        ventasData = response;
      } else if (response && Array.isArray(response.data)) {
        ventasData = response.data;
      } else if (response && Array.isArray(response.ventas)) {
        ventasData = response.ventas;
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', response);
        ventasData = [];
      }
      
      // Ordenar del más antiguo al más reciente
      const ventasOrdenadas = ventasData.sort((a, b) => {
        return new Date(a.fechaVenta || a.createdAt) - new Date(b.fechaVenta || b.createdAt);
      });
      
      setVentas(ventasOrdenadas);
      console.log(`✅ ${ventasOrdenadas.length} ventas cargadas exitosamente`);
      
    } catch (error) {
      console.error('❌ Error al cargar ventas:', error);
      setVentas([]);
      
      let mensajeError = 'Error desconocido';
      if (error.message) {
        mensajeError = error.message;
      } else if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar ventas',
        text: mensajeError,
        confirmButtonText: 'Reintentar'
      }).then((result) => {
        if (result.isConfirmed) {
          cargarVentas();
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      horaInicial: '',
      horaFinal: '',
      clientes: '',
      productos: '',
      categorias: '',
      lote: '',
      fechaEmision: '',
      establecimiento: '',
      estado: '',
      numeroGuia: '',
      placa: '',
      ubicado: '',
      redPago: ''
    });
  };

  const toggleColumna = (columna) => {
    setColumnasVisibles(prev => ({
      ...prev,
      [columna]: !prev[columna]
    }));
  };

  const handleDescargarPDF = async (id, numeroVenta, formato = 'A4') => {
    try {
      // Implementar descarga de PDF
      const response = await apiClient.get(`/ventas/${id}/pdf?formato=${formato}`, {
        responseType: 'blob'
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const fileName = formato === '80mm' ? `ticket_${numeroVenta}.pdf` : `venta_${numeroVenta}.pdf`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      const formatoTexto = formato === '80mm' ? 'Ticket 80mm' : 'PDF A4';
      Swal.fire('¡Descargado!', `El ${formatoTexto} se ha descargado correctamente.`, 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo descargar el PDF: ' + error.message, 'error');
    }
  };

  const handleDescargarCDR = async (id, numeroVenta) => {
    try {
      // Implementar descarga de CDR
      const response = await apiClient.get(`/ventas/${id}/cdr`, {
        responseType: 'blob'
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `venta_${numeroVenta}_cdr.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      Swal.fire('¡Descargado!', 'El CDR se ha descargado correctamente.', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo descargar el CDR: ' + error.message, 'error');
    }
  };

  const handleAnular = async (id, numeroVenta) => {
    const result = await Swal.fire({
      title: '¿Anular venta?',
      text: `¿Estás seguro de anular la venta #${numeroVenta}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      input: 'textarea',
      inputPlaceholder: 'Motivo de anulación (opcional)'
    });

    if (result.isConfirmed) {
      try {
        await anularVenta(id, result.value || 'Anulación solicitada por usuario');
        Swal.fire('¡Anulada!', 'La venta ha sido anulada.', 'success');
        cargarVentas();
      } catch (error) {
        Swal.fire('Error', 'No se pudo anular la venta: ' + error.message, 'error');
      }
    }
  };

  const handleGenerarPDF = async (id, numeroVenta) => {
    try {
      const response = await obtenerEstadoSunat(id);
      
      Swal.fire({
        title: 'Estado SUNAT',
        html: `
          <div style="text-align: left;">
            <p><strong>Venta:</strong> #${numeroVenta}</p>
            <p><strong>Estado SUNAT:</strong> ${response.estadoSunat || 'Sin enviar'}</p>
            <p><strong>Número Comprobante:</strong> ${response.numeroComprobante || 'N/A'}</p>
            ${response.mensajeSunat ? `<p><strong>Mensaje:</strong> ${response.mensajeSunat}</p>` : ''}
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar'
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo obtener el estado SUNAT: ' + error.message, 'error');
    }
  };

  const handleDescargarXML = async (id, numeroVenta) => {
    try {
      const blob = await descargarXMLVenta(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `venta_${numeroVenta}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      Swal.fire('¡Descargado!', 'El archivo XML se ha descargado correctamente.', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo descargar el XML: ' + error.message, 'error');
    }
  };

  const handleReenviarSunat = async (id, numeroVenta) => {
    const result = await Swal.fire({
      title: '¿Reenviar a SUNAT?',
      text: `¿Deseas reenviar la venta #${numeroVenta} a SUNAT?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reenviar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await reenviarVentaSunat(id);
        Swal.fire('¡Reenviado!', 'La venta ha sido reenviada a SUNAT.', 'success');
        cargarVentas();
      } catch (error) {
        Swal.fire('Error', 'No se pudo reenviar a SUNAT: ' + error.message, 'error');
      }
    }
  };

  const handleEnviarWhatsApp = (venta) => {
    setVentaSeleccionada(venta);
    setMostrarModalWhatsApp(true);
  };

  const handleGenerarGuia = async (venta) => {
    try {
      // Verificar si ya existe una guía para esta venta
      const guiasExistentes = await guiaRemisionService.obtenerGuiasPorVenta(venta.id);
      
      if (guiasExistentes && guiasExistentes.length > 0) {
        Swal.fire({
          title: 'Guía ya existe',
          text: `Ya existe una guía de remisión para esta venta: ${guiasExistentes[0].serie}-${guiasExistentes[0].numero}`,
          icon: 'info',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      // Navegar al formulario de guía con los datos de la venta
      navigate('/guia-remision/formulario', { 
        state: { 
          ventaData: venta,
          fromVenta: true 
        } 
      });
    } catch (error) {
      console.error('Error al verificar guías existentes:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al verificar guías existentes',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    }
  };



  

  const formatearFecha = (fecha, fechaFormateada) => {
    // Usar la fecha formateada del backend si está disponible
    if (fechaFormateada) {
      try {
        const [año, mes, dia] = fechaFormateada.split('-');
        return `${dia}/${mes}/${año}`;
      } catch (error) {
        console.error('Error al formatear fecha formateada:', error);
      }
    }
    
    if (!fecha) return 'N/A';
    try {
      // Crear fecha sin problemas de zona horaria
      const fechaObj = new Date(fecha);
      
      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        return 'Fecha inválida';
      }
      
      // Formatear la fecha en formato local
      const dia = fechaObj.getDate().toString().padStart(2, '0');
      const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
      const año = fechaObj.getFullYear();
      
      return `${dia}/${mes}/${año}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en fecha';
    }
  };

  const formatearMoneda = (monto) => {
    if (!monto || isNaN(monto)) return 'S/ 0.00';
    const valor = parseFloat(monto);
    if (isNaN(valor)) return 'S/ 0.00';
    return `S/ ${valor.toFixed(2)}`;
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'COMPLETADA': return 'estado-completada';
      case 'ANULADA': return 'estado-anulada';
      case 'PENDIENTE': return 'estado-pendiente';
      default: return '';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'COMPLETADA': return '✅ Completada';
      case 'ANULADA': return '❌ Anulada';
      case 'PENDIENTE': return '⏳ Pendiente';
      default: return estado || 'Sin estado';
    }
  };

  const getEstadoSunatClass = (estadoSunat) => {
    switch (estadoSunat) {
      case 'ACEPTADO': return 'sunat-aceptado';
      case 'RECHAZADO': return 'sunat-rechazado';
      case 'PENDIENTE': return 'sunat-pendiente';
      case 'ERROR': return 'sunat-error';
      default: return 'sunat-sin-enviar';
    }
  };

  const getEstadoSunatTexto = (estadoSunat) => {
    switch (estadoSunat) {
      case 'ACEPTADO': return '✅ SUNAT OK';
      case 'RECHAZADO': return '❌ SUNAT Rechazado';
      case 'PENDIENTE': return '⏳ SUNAT Pendiente';
      case 'ERROR': return '⚠️ Error SUNAT';
      default: return '📄 Sin enviar';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando ventas...</p>
      </div>
    );
  }

  return (
    <div className="lista-ventas-container">
      <div className="header-section">
        <h2>📊 Gestión de Comprobantes</h2>
        <div className="header-actions">
         
        </div>
      </div>

      <div className="filtros-section">
        <div className="filtros-header">
          <h3>🔍 Filtros de búsqueda</h3>
          <button 
            className="btn-toggle-filtros"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            {mostrarFiltros ? '{ Ver menos }' : '{ Ver más }'}
          </button>
        </div>
        
        {mostrarFiltros && (
          <div className="filtros-grid-compact">
            <div className="filtro-row">
              <div className="filtro-group">
                <label>Fecha inicio</label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={filtros.fechaInicio}
                  onChange={handleFiltroChange}
                />
              </div>
              <div className="filtro-group">
                <label>Fecha fin</label>
                <input
                  type="date"
                  name="fechaFin"
                  value={filtros.fechaFin}
                  onChange={handleFiltroChange}
                />
              </div>
              <div className="filtro-group">
                <label>Estado</label>
                <select name="estado" value={filtros.estado} onChange={handleFiltroChange}>
                  <option value="">Todos</option>
                  <option value="COMPLETADA">Completada</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="ANULADA">Anulada</option>
                </select>
              </div>
              <div className="filtro-group">
                <label>Cliente</label>
                <input 
                  type="text" 
                  name="clientes" 
                  value={filtros.clientes} 
                  onChange={handleFiltroChange}
                  placeholder="Buscar cliente..."
                />
              </div>
              <div className="filtro-actions">
                <button className="btn-buscar" onClick={cargarVentas}>
                  🔍 Buscar
                </button>
                <button className="btn-limpiar" onClick={limpiarFiltros}>
                  🗑️ Limpiar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ventas-table-container">
        {ventas.length === 0 ? (
          <div className="no-ventas">
            <div className="no-ventas-icon">📋</div>
            <p>No se encontraron ventas</p>
            <button className="btn-recargar" onClick={cargarVentas}>
              🔄 Recargar
            </button>
          </div>
        ) : (
          <>
            <div className="ventas-header">
              <div className="ventas-count">
                <span>📊 Total: {ventas.length}  Comprobantes encontradas</span>
              </div>



              {/* <div className="ventas-actions">

                <button 
                  className="btn-mostrar-columnas"
                  onClick={() => setMostrarColumnas(!mostrarColumnas)}
                >
                  📋 Mostrar/Ocultar columnas
                </button>
              </div>*/}
             


            </div>
            
            {mostrarColumnas && (
              <div className="columnas-selector">
                <h4>Seleccionar columnas a mostrar:</h4>
                <div className="columnas-grid">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.id} 
                      onChange={() => toggleColumna('id')}
                    />
                    ID
                  </label>

                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.fechaVenta} 
                       onChange={() => toggleColumna('fechaVenta')}
                    />
                    Fecha Venta
                  </label> 

                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.createdAt} 
                      onChange={() => toggleColumna('createdAt')}
                    />
                    Creado
                  </label>
                  
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.updatedAt} 
                      onChange={() => toggleColumna('updatedAt')}
                    />
                    Actualizado
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.cliente} 
                      onChange={() => toggleColumna('cliente')}
                    />
                    Cliente
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.tipoComprobante} 
                      onChange={() => toggleColumna('tipoComprobante')}
                    />
                    Tipo Comprobante
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.serieComprobante} 
                      onChange={() => toggleColumna('serieComprobante')}
                    />
                    Serie
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.numeroComprobante} 
                      onChange={() => toggleColumna('numeroComprobante')}
                    />
                    Número
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.estado} 
                      onChange={() => toggleColumna('estado')}
                    />
                    Estado
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.estadoSunat} 
                      onChange={() => toggleColumna('estadoSunat')}
                    />
                    Estado SUNAT
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.subtotal} 
                      onChange={() => toggleColumna('subtotal')}
                    />
                    Subtotal
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.igv} 
                      onChange={() => toggleColumna('igv')}
                    />
                    IGV
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.total} 
                      onChange={() => toggleColumna('total')}
                    />
                    Total
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.metodoPago} 
                      onChange={() => toggleColumna('metodoPago')}
                    />
                    Método Pago
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.formaPago} 
                      onChange={() => toggleColumna('formaPago')}
                    />
                    Forma Pago
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.moneda} 
                      onChange={() => toggleColumna('moneda')}
                    />
                    Moneda
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.fechaVencimiento} 
                      onChange={() => toggleColumna('fechaVencimiento')}
                    />
                    Fecha Vencimiento
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.observacion} 
                      onChange={() => toggleColumna('observacion')}
                    />
                    Observación
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.tipoOperacion} 
                      onChange={() => toggleColumna('tipoOperacion')}
                    />
                    Tipo Operación
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.codigoVin} 
                      onChange={() => toggleColumna('codigoVin')}
                    />
                    Código VIN
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.tallerId} 
                      onChange={() => toggleColumna('tallerId')}
                    />
                    Taller ID
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.motivoAnulacion} 
                      onChange={() => toggleColumna('motivoAnulacion')}
                    />
                    Motivo Anulación
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.fechaAnulacion} 
                      onChange={() => toggleColumna('fechaAnulacion')}
                    />
                    Fecha Anulación
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.usuarioAnulacionId} 
                      onChange={() => toggleColumna('usuarioAnulacionId')}
                    />
                    Usuario Anulación
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.codigoHash} 
                      onChange={() => toggleColumna('codigoHash')}
                    />
                    Código Hash
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.xmlUrl} 
                      onChange={() => toggleColumna('xmlUrl')}
                    />
                    XML URL
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.cdrUrl} 
                      onChange={() => toggleColumna('cdrUrl')}
                    />
                    CDR URL
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.pdfUrl} 
                      onChange={() => toggleColumna('pdfUrl')}
                    />
                    PDF URL
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.ticketUrl} 
                      onChange={() => toggleColumna('ticketUrl')}
                    />
                    Ticket URL
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={columnasVisibles.sunatError} 
                      onChange={() => toggleColumna('sunatError')}
                    />
                    Error SUNAT
                  </label>
                </div>
              </div>
            )}
            <table className="ventas-table">
               <thead>
                <tr>
                  {columnasVisibles.id && <th>ID</th>}
                  {columnasVisibles.fechaVenta && <th>Fecha Venta</th>}
                  {columnasVisibles.createdAt && <th>Creado</th>}
                  {columnasVisibles.updatedAt && <th>Actualizado</th>}
                  {columnasVisibles.cliente && <th>Cliente</th>}
                  {columnasVisibles.tipoComprobante && <th>Tipo Comprobante</th>}
                  {columnasVisibles.serieComprobante && <th>Serie</th>}
                  {columnasVisibles.numeroComprobante && <th>Número</th>}
                  {columnasVisibles.estado && <th>Estado</th>}
                  {columnasVisibles.estadoSunat && <th>Estado SUNAT</th>}
                  {columnasVisibles.subtotal && <th>Subtotal</th>}
                  {columnasVisibles.igv && <th>IGV</th>}
                  {columnasVisibles.total && <th>Total</th>}
                  {columnasVisibles.metodoPago && <th>Método Pago</th>}
                  {columnasVisibles.formaPago && <th>Forma Pago</th>}
                  {columnasVisibles.moneda && <th>Moneda</th>}
                  {columnasVisibles.fechaVencimiento && <th>Fecha Vencimiento</th>}
                  {columnasVisibles.observacion && <th>Observación</th>}
                  {columnasVisibles.tipoOperacion && <th>Tipo Operación</th>}
                  {columnasVisibles.codigoVin && <th>Código VIN</th>}
                  {columnasVisibles.tallerId && <th>Taller ID</th>}
                  {columnasVisibles.motivoAnulacion && <th>Motivo Anulación</th>}
                  {columnasVisibles.fechaAnulacion && <th>Fecha Anulación</th>}
                  {columnasVisibles.usuarioAnulacionId && <th>Usuario Anulación</th>}
                  {columnasVisibles.codigoHash && <th>Código Hash</th>}
                  {columnasVisibles.xmlUrl && <th>XML URL</th>}
                  {columnasVisibles.cdrUrl && <th>CDR URL</th>}
                  {columnasVisibles.pdfUrl && <th>PDF URL</th>}
                  {columnasVisibles.ticketUrl && <th>Ticket URL</th>}
                  {columnasVisibles.sunatError && <th>Error SUNAT</th>}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                 {ventas.map(venta => (
                   <tr key={venta.id}>
                     {columnasVisibles.id && <td>{venta.id}</td>}
                     {columnasVisibles.fechaVenta && <td>{formatearFecha(venta.fechaVenta, venta.fechaFormateada)}</td>}
                     {columnasVisibles.createdAt && <td>{formatearFecha(venta.createdAt)}</td>}
                     {columnasVisibles.updatedAt && <td>{formatearFecha(venta.updatedAt)}</td>}
                     {columnasVisibles.cliente && (
                       <td>
                         <div className="cliente-info">
                           <span className="cliente-nombre">
                             {venta.Cliente?.nombre || venta.clienteNombre || 'Cliente General'}
                           </span>
                           {(venta.Cliente?.documento || venta.clienteDocumento) && (
                             <small className="cliente-documento">
                               {venta.Cliente?.documento || venta.clienteDocumento}
                             </small>
                           )}
                         </div>
                       </td>
                     )}
                     {columnasVisibles.tipoComprobante && <td>{venta.tipoComprobante || 'BOLETA'}</td>}
                     {columnasVisibles.serieComprobante && <td>{venta.serieComprobante || 'N/A'}</td>}
                     {columnasVisibles.numeroComprobante && <td>{venta.numeroComprobante || venta.numeroVenta || venta.id}</td>}
                     {columnasVisibles.estado && (
                       <td>
                         <span className={`estado ${getEstadoClass(venta.estado)}`}>
                           {getEstadoTexto(venta.estado)}
                         </span>
                       </td>
                     )}
                     {columnasVisibles.estadoSunat && (
                       <td>
                         <span className={`estado-sunat ${getEstadoSunatClass(venta.estadoSunat)}`}>
                           {getEstadoSunatTexto(venta.estadoSunat)}
                         </span>
                       </td>
                     )}
                     {columnasVisibles.subtotal && <td className="total">{formatearMoneda(venta.subtotal)}</td>}
                     {columnasVisibles.igv && <td className="total">{formatearMoneda(venta.igv)}</td>}
                     {columnasVisibles.total && <td className="total"><strong>{formatearMoneda(venta.total)}</strong></td>}
                     {columnasVisibles.metodoPago && <td>{venta.metodoPago || 'N/A'}</td>}
                     {columnasVisibles.formaPago && <td>{venta.formaPago || 'N/A'}</td>}
                     {columnasVisibles.moneda && <td>{venta.moneda || 'PEN'}</td>}
                     {columnasVisibles.fechaVencimiento && <td>{venta.fechaVencimiento ? formatearFecha(venta.fechaVencimiento) : 'N/A'}</td>}
                     {columnasVisibles.observacion && <td>{venta.observacion || 'N/A'}</td>}
                     {columnasVisibles.tipoOperacion && <td>{venta.tipoOperacion || 'N/A'}</td>}
                     {columnasVisibles.codigoVin && <td>{venta.codigoVin || 'N/A'}</td>}
                     {columnasVisibles.tallerId && <td>{venta.tallerId || 'N/A'}</td>}
                     {columnasVisibles.motivoAnulacion && <td>{venta.motivoAnulacion || 'N/A'}</td>}
                     {columnasVisibles.fechaAnulacion && <td>{venta.fechaAnulacion ? formatearFecha(venta.fechaAnulacion) : 'N/A'}</td>}
                     {columnasVisibles.usuarioAnulacionId && <td>{venta.usuarioAnulacionId || 'N/A'}</td>}
                     {columnasVisibles.codigoHash && <td>{venta.codigoHash || 'N/A'}</td>}
                     {columnasVisibles.xmlUrl && <td>{venta.xmlUrl ? 'Disponible' : 'N/A'}</td>}
                     {columnasVisibles.cdrUrl && <td>{venta.cdrUrl ? 'Disponible' : 'N/A'}</td>}
                     {columnasVisibles.pdfUrl && <td>{venta.pdfUrl ? 'Disponible' : 'N/A'}</td>}
                     {columnasVisibles.ticketUrl && <td>{venta.ticketUrl ? 'Disponible' : 'N/A'}</td>}
                     {columnasVisibles.sunatError && <td>{venta.sunatError || 'N/A'}</td>}
                   
                    <td>
                       <div className="acciones-compactas">
                         <div className="dropdown-pdf">
                           <button 
                             className="btn-accion btn-pdf dropdown-toggle"
                             onClick={(e) => {
                               e.stopPropagation();
                               const dropdown = e.target.nextElementSibling;
                               dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                             }}
                             title="Descargar PDF"
                           >
                             📄 ▼
                           </button>
                           <div className="dropdown-menu-pdf" style={{display: 'none'}}>
                             <button 
                               className="dropdown-item"
                               onClick={() => handleDescargarPDF(venta.id, venta.numeroVenta || venta.id, 'A4')}
                             >
                               📄 PDF A4
                             </button>
                             <button 
                               className="dropdown-item"
                               onClick={() => handleDescargarPDF(venta.id, venta.numeroVenta || venta.id, '80mm')}
                             >
                               🎫 Ticket 80mm
                             </button>
                           </div>
                         </div>
                         {(venta.estadoSunat === 'ACEPTADO' || venta.xmlUrl || venta.xmlBase64) && (
                           <button 
                             className="btn-accion btn-xml"
                             onClick={() => handleDescargarXML(venta.id, venta.numeroVenta || venta.id)}
                             title="Descargar XML"
                           >
                             📋
                           </button>
                         )}
                         {(venta.estadoSunat === 'ACEPTADO' || venta.cdrUrl || venta.cdrBase64) && (
                           <button 
                             className="btn-accion btn-cdr"
                             onClick={() => handleDescargarCDR(venta.id, venta.numeroVenta || venta.id)}
                             title="Descargar CDR"
                           >
                             📥
                           </button>
                         )}
                         {venta.estado === 'COMPLETADA' && (
                           <button 
                             className="btn-accion btn-whatsapp"
                             onClick={() => handleEnviarWhatsApp(venta)}
                             title="Enviar por WhatsApp"
                           >
                             📱
                           </button>
                         )}
                         {venta.estado === 'COMPLETADA' && (
                           <button 
                             className="btn-accion btn-guia"
                             onClick={() => handleGenerarGuia(venta)}
                             title="Generar Guía de Remisión"
                           >
                             📦
                           </button>
                         )}
                         {onVerDetalle && (
                           <button 
                             className="btn-accion btn-detalle"
                             onClick={() => onVerDetalle(venta)}
                             title="Ver detalle"
                           >
                             👁️
                           </button>
                         )}
                         {(venta.estadoSunat === 'ERROR' || venta.estadoSunat === 'RECHAZADO') && venta.estado === 'COMPLETADA' && (
                           <button 
                             className="btn-accion btn-reenviar"
                             onClick={() => handleReenviarSunat(venta.id, venta.numeroVenta || venta.id)}
                             title="Reenviar SUNAT"
                           >
                             🔄
                           </button>
                         )}
                         <button 
                           className="btn-accion btn-estado"
                           onClick={() => handleGenerarPDF(venta.id, venta.numeroVenta || venta.id)}
                           title="Ver estado SUNAT"
                         >
                           📊
                         </button>
                         {venta.estado === 'COMPLETADA' && (
                           <button 
                             className="btn-accion btn-anular"
                             onClick={() => handleAnular(venta.id, venta.numeroVenta || venta.id)}
                             title="Anular venta"
                           >
                             ❌
                           </button>
                         )}
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="ventas-stats">
        <div className="stat-item">
          <span className="stat-number">{ventas.length}</span>
          <span className="stat-label">📊 Total de ventas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {formatearMoneda(
              ventas
                .filter(v => v.estado === 'COMPLETADA')
                .reduce((sum, v) => sum + parseFloat(v.total || 0), 0)
            )}
          </span>
          <span className="stat-label">💰 Total vendido</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {ventas.filter(v => v.estado === 'COMPLETADA').length}
          </span>
          <span className="stat-label">✅ Completadas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {ventas.filter(v => v.estado === 'PENDIENTE').length}
          </span>
          <span className="stat-label">⏳ Pendientes</span>
        </div>
      </div>

      {mostrarModalWhatsApp && ventaSeleccionada && (
        <ModalWhatsApp
          venta={ventaSeleccionada}
          cliente={ventaSeleccionada.Cliente || { nombre: ventaSeleccionada.clienteNombre }}
          onClose={() => {
            setMostrarModalWhatsApp(false);
            setVentaSeleccionada(null);
          }}
        />
      )}


    </div>
  );
}

export default ListaVentas;