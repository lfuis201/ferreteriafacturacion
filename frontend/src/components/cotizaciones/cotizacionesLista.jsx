import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, MoreVertical, Plus, Eye, EyeOff, ChevronDown } from 'lucide-react';
import CotizacionesFormulario from './cotizacionesformulario';
import { obtenerCotizaciones, eliminarCotizacion, obtenerCotizacionPorId } from '../../services/cotizacionService';

import "../../styles/cotizacionesLista.css";
const CotizacionesLista = () => {
  const [columnVisibility, setColumnVisibility] = useState({
    fechaEmision: true,
    fechaEntrega: true,
    tiempoValidez: false,
    tiempoEntrega: false,
    direccionEnvio: false,
    terminoPago: false,
    numeroCuenta: false,
    registradoPor: true,
    vendedor: true,
    cliente: true,
    estado: true,
    cotizacion: true,
    comprobantes: true,
    notasDeVenta: true,
    pedido: true,
    oportunidadVenta: true,
    infReferencial: true,
    contrato: true,
    tipoCambio: true,
    moneda: true,
    tExportacion: true,
    tGratuito: true,
    tInafecta: true,
    tExonerado: true,
    tGravado: true,
    igv: true,
    total: true,
    //pdf: true
  });

  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFormulario, setShowFormulario] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    busqueda: '',
    periodo: 'mes_actual',
    mes: new Date().getMonth() + 1,
    estado: 'todos'
  });

  // Cargar cotizaciones desde el backend usando el servicio
  const cargarCotizaciones = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener usuario actual para filtrar por sucursal si es necesario
      const usuarioGuardado = localStorage.getItem('usuario');
      let filtrosConsulta = {};
      
      if (usuarioGuardado) {
        try {
          const usuario = JSON.parse(usuarioGuardado);
          // Si el usuario tiene sucursal asignada, incluirla en los filtros
          if (usuario.sucursalId) {
            filtrosConsulta.sucursalId = usuario.sucursalId;
          }
        } catch (error) {
          console.error('Error al parsear usuario del localStorage:', error);
        }
      }
      
      console.log('🔍 INICIANDO CARGA DE COTIZACIONES...');
      console.log('📋 Filtros enviados:', filtrosConsulta);
      
      const data = await obtenerCotizaciones(filtrosConsulta);
      
      console.log('📦 RESPUESTA COMPLETA DEL BACKEND:', JSON.stringify(data, null, 2));
      console.log('📊 Tipo de data:', typeof data);
      console.log('🔢 Cotizaciones en data:', data?.cotizaciones);
      console.log('📏 Longitud de cotizaciones:', data?.cotizaciones?.length);
      
      // Verificar si data.cotizaciones existe y es un array
      if (!data) {
        console.error('❌ ERROR: No se recibieron datos del backend');
        setCotizaciones([]);
        return;
      }
      
      if (!data.cotizaciones) {
        console.error('❌ ERROR: No existe la propiedad cotizaciones en la respuesta');
        console.error('🔍 Propiedades disponibles:', Object.keys(data));
        setCotizaciones([]);
        return;
      }
      
      if (!Array.isArray(data.cotizaciones)) {
        console.error('❌ ERROR: cotizaciones no es un array');
        console.error('🔍 Tipo de cotizaciones:', typeof data.cotizaciones);
        setCotizaciones([]);
        return;
      }
      
      if (data.cotizaciones.length === 0) {
        console.warn('⚠️ ADVERTENCIA: El array de cotizaciones está vacío');
        setCotizaciones([]);
        return;
      }
      
      console.log('📊 METADATOS:', data.metadatos);
      
      console.log('✅ PROCESANDO COTIZACIONES...');
      console.log('📊 Total de cotizaciones a procesar:', data.cotizaciones.length);
      
      // Transformar los datos para que coincidan con el formato esperado
      const cotizacionesFormateadas = data.cotizaciones.map((cotizacion, index) => {
        console.log(`🔄 Procesando cotización ${index + 1}:`, cotizacion.id);
        
        const cotizacionFormateada = {
          id: cotizacion.id,
          fechaEmision: cotizacion.fechaEmision || '-',
          fechaEntrega: cotizacion.fechaEntrega || '-',
          tiempoValidez: cotizacion.tiempoValidez || '-',
          tiempoEntrega: cotizacion.tiempoEntrega || '-',
          direccionEnvio: cotizacion.direccionEnvio || '-',
          terminoPago: cotizacion.terminoPago || '-',
          numeroCuenta: cotizacion.numeroCuenta || '-',
          registradoPor: cotizacion.registradoPor || '-',
          vendedor: cotizacion.vendedor || '-',
          cliente: cotizacion.cliente || (cotizacion.Cliente ? cotizacion.Cliente.nombre : '-'),
          estado: cotizacion.estado || 'Activo',
          cotizacion: cotizacion.numeroReferencia || cotizacion.id,
          comprobantes: cotizacion.comprobantes || '0',
          notasDeVenta: cotizacion.notasDeVenta || '0',
          pedido: cotizacion.pedido || '-',
          oportunidadVenta: cotizacion.oportunidadVenta || '-',
          infReferencial: cotizacion.infReferencial || '-',
          contrato: cotizacion.contrato || '-',
          tipoCambio: cotizacion.tipoCambio || '3.85',
          moneda: cotizacion.moneda || 'SOL',
          tExportacion: cotizacion.tExportacion || '0.00',
          tGratuito: cotizacion.tGratuito || '0.00',
          tInafecta: cotizacion.tInafecta || '0.00',
          tExonerado: cotizacion.tExonerado || '0.00',
          tGravado: cotizacion.tGravado || '0.00',
          igv: cotizacion.igv || '0.00',
          total: cotizacion.total || '0.00'
        };
        
        console.log(`✅ Cotización ${index + 1} formateada:`, cotizacionFormateada);
        return cotizacionFormateada;
      });

      console.log('🎉 COTIZACIONES FORMATEADAS COMPLETAMENTE:', cotizacionesFormateadas);
      console.log('📊 Total de cotizaciones formateadas:', cotizacionesFormateadas.length);
      
      setCotizaciones(cotizacionesFormateadas);
      console.log('💾 COTIZACIONES GUARDADAS EN EL ESTADO');
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
      setError(error.message || 'Error al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  // Cargar cotizaciones al montar el componente
  useEffect(() => {
    cargarCotizaciones();
  }, []);

  const toggleColumn = (column) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  // Función para agregar nueva cotización
  const agregarCotizacion = (nuevaCotizacion) => {
    // Recargar las cotizaciones desde el backend para obtener los datos actualizados
    cargarCotizaciones();
    setShowFormulario(false);
  };

  // Handler: eliminar cotización
  const handleEliminar = async (id) => {
    if (!id) return;
    const confirmar = window.confirm('¿Desea eliminar esta cotización?');
    if (!confirmar) return;
    try {
      await eliminarCotizacion(id);
      cargarCotizaciones();
    } catch (err) {
      console.error('Error al eliminar cotización:', err);
      alert('No se pudo eliminar la cotización');
    }
  };

  // Handler: editar cotización
  const handleEditar = async (id) => {
    try {
      const data = await obtenerCotizacionPorId(id);
      const cot = data.cotizacion || data;
      setCotizacionSeleccionada(cot);
      setShowFormulario(true);
    } catch (err) {
      console.error('Error al cargar cotización para edición:', err);
      alert('No se pudo cargar la cotización para editar.');
    }
  };

  // Función para manejar cambios en filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Filtrar cotizaciones según los criterios
  const cotizacionesFiltradas = cotizaciones.filter(cotizacion => {
    console.log('🔍 FILTRANDO COTIZACIÓN:', cotizacion.id, cotizacion.cliente);
    
    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      const coincide = 
        cotizacion.cliente.toLowerCase().includes(busqueda) ||
        cotizacion.cotizacion.toLowerCase().includes(busqueda) ||
        cotizacion.vendedor.toLowerCase().includes(busqueda);
      if (!coincide) return false;
    }

    // Filtro por estado
    if (filtros.estado !== 'todos' && cotizacion.estado.toLowerCase() !== filtros.estado.toLowerCase()) {
      return false;
    }

    return true;
  });

  console.log('🎯 RESULTADO DEL FILTRADO:');
  console.log('📋 Total cotizaciones originales:', cotizaciones.length);
  console.log('🔍 Filtros aplicados:', filtros);
  console.log('✅ Cotizaciones filtradas:', cotizacionesFiltradas.length);
  console.log('📊 Cotizaciones filtradas completas:', cotizacionesFiltradas);

  return (
    <div className="cotizaciones-lista-container">
      {/* Mostrar errores */}
      {error && (
        <div className="error-message" style={{
          backgroundColor: '#fee', 
          color: '#c33', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      <div className="header-container">
        <h1>Cotizaciones</h1> 

         <button onClick={() => setShowFormulario(true)}>
            <Plus size={20} /> Nuevo
          </button> 

        <div className="controls">
          <div className="search-container">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar por cliente, cotización o vendedor..." 
              value={filtros.busqueda}
              onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
            />
          </div>
          
          <div className="filter-container">
           
            
            <div className="column-selector">
              <button 
                className="column-toggle-btn"
                onClick={() => setShowColumnSelector(!showColumnSelector)}
              >
                <Eye size={18} />
                Mostrar/Ocultar columnas
                <ChevronDown size={16} />
              </button>
              
              {showColumnSelector && (
                <div className="column-menu">
                  <div className="column-menu-header">
                    <span>Seleccionar columnas</span>
                  </div>
                  <div className="column-options">
                    {Object.entries(columnVisibility).map(([key, visible]) => {
                      const labels = {
                        fechaEmision: 'Fecha Emisión',
                        fechaEntrega: 'Fecha Entrega',
                        tiempoValidez: 'Tiempo Validez',
                        tiempoEntrega: 'Tiempo Entrega',
                        direccionEnvio: 'Dirección Envío',
                        terminoPago: 'Término Pago',
                        numeroCuenta: 'Número Cuenta',
                        registradoPor: 'Registrado Por',
                        vendedor: 'Vendedor',
                        cliente: 'Cliente',
                        estado: 'Estado',
                        cotizacion: 'Cotización',
                        comprobantes: 'Comprobantes',
                        notasDeVenta: 'Notas de Venta',
                        pedido: 'Pedido',
                        oportunidadVenta: 'Oportunidad Venta',
                        infReferencial: 'Inf. Referencial',
                        contrato: 'Contrato',
                        tipoCambio: 'Tipo Cambio',
                        moneda: 'Moneda',
                        tExportacion: 'T. Exportación',
                        tGratuito: 'T. Gratuito',
                        tInafecta: 'T. Inafecta',
                        tExonerado: 'T. Exonerado',
                        tGravado: 'T. Gravado',
                        igv: 'IGV',
                        total: 'Total',
                        pdf: 'PDF'
                      };
                      
                      return (
                        <label key={key} className="column-option">
                          <input
                            type="checkbox"
                            checked={visible}
                            onChange={() => toggleColumn(key)}
                          />
                          <span className="checkmark"></span>
                          {labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div> 


      

    

      {/* Mostrar estado de carga */}
      {loading && (
        <div className="loading-message" style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          Cargando cotizaciones...
        </div>
      )}

      {!loading && (
        <div className="table-container">
          <table className="cotizaciones-table">
            <thead>
              <tr>
                {columnVisibility.fechaEmision && <th>Fecha Emisión</th>}
                {columnVisibility.fechaEntrega && <th>Fecha Entrega</th>}
                {columnVisibility.tiempoValidez && <th>Tiempo Validez</th>}
                {columnVisibility.tiempoEntrega && <th>Tiempo Entrega</th>}
                {columnVisibility.direccionEnvio && <th>Dirección Envío</th>}
                {columnVisibility.terminoPago && <th>Término Pago</th>}
                {columnVisibility.numeroCuenta && <th>Número Cuenta</th>}
                {columnVisibility.registradoPor && <th>Registrado por</th>}
                {columnVisibility.vendedor && <th>Vendedor</th>}
                {columnVisibility.cliente && <th>Cliente</th>}
                {columnVisibility.estado && <th>Estado</th>}
                {columnVisibility.cotizacion && <th>Cotización</th>}
                {columnVisibility.comprobantes && <th>Comprobantes</th>}
                {columnVisibility.notasDeVenta && <th>Notas de venta</th>}
                {columnVisibility.pedido && <th>Pedido</th>}
                {columnVisibility.oportunidadVenta && <th>Oportunidad Venta</th>}
                {columnVisibility.infReferencial && <th>Inf. Referencial</th>}
                {columnVisibility.contrato && <th>Contrato</th>}
                {columnVisibility.tipoCambio && <th>TC</th>}
                {columnVisibility.moneda && <th>Moneda</th>}
                {columnVisibility.tExportacion && <th>T. Exportación</th>}
                {columnVisibility.tGratuito && <th>T. Gratuito</th>}
                {columnVisibility.tInafecta && <th>T. Inafecta</th>}
                {columnVisibility.tExonerado && <th>T. Exonerado</th>}
                {columnVisibility.tGravado && <th>T. Gravado</th>}
                {columnVisibility.igv && <th>IGV</th>}
                {columnVisibility.total && <th>Total</th>}
               
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="25" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    {filtros.busqueda || filtros.estado !== 'todos' 
                      ? 'No se encontraron cotizaciones que coincidan con los filtros'
                      : 'No hay cotizaciones registradas'
                    }
                  </td>
                </tr>
              ) : (
                cotizacionesFiltradas.map(cotizacion => (
                  <tr key={cotizacion.id}>
                    {columnVisibility.fechaEmision && <td>{cotizacion.fechaEmision || '-'}</td>}
                    {columnVisibility.fechaEntrega && <td>{cotizacion.fechaEntrega || '-'}</td>}
                    {columnVisibility.tiempoValidez && <td>{cotizacion.tiempoValidez || '-'}</td>}
                    {columnVisibility.tiempoEntrega && <td>{cotizacion.tiempoEntrega || '-'}</td>}
                    {columnVisibility.direccionEnvio && <td>{cotizacion.direccionEnvio || '-'}</td>}
                    {columnVisibility.terminoPago && <td>{cotizacion.terminoPago || '-'}</td>}
                    {columnVisibility.numeroCuenta && <td>{cotizacion.numeroCuenta || '-'}</td>}
                    {columnVisibility.registradoPor && <td>{cotizacion.registradoPor}</td>}
                    {columnVisibility.vendedor && <td>{cotizacion.vendedor}</td>}
                    {columnVisibility.cliente && <td>{cotizacion.cliente}</td>}
                    {columnVisibility.estado && <td><span className={`status-badge ${cotizacion.estado.toLowerCase()}`}>{cotizacion.estado}</span></td>}
                    {columnVisibility.cotizacion && <td>{cotizacion.cotizacion}</td>}
                    {columnVisibility.comprobantes && <td>{cotizacion.comprobantes}</td>}
                    {columnVisibility.notasDeVenta && <td>{cotizacion.notasDeVenta}</td>}
                    {columnVisibility.pedido && <td>{cotizacion.pedido || '-'}</td>}
                    {columnVisibility.oportunidadVenta && <td>{cotizacion.oportunidadVenta || '-'}</td>}
                    {columnVisibility.infReferencial && <td>{cotizacion.infReferencial || '-'}</td>}
                    {columnVisibility.contrato && <td>{cotizacion.contrato || '-'}</td>}
                    {columnVisibility.tipoCambio && <td>{cotizacion.tipoCambio}</td>}
                    {columnVisibility.moneda && <td>{cotizacion.moneda}</td>}
                    {columnVisibility.tExportacion && <td>{cotizacion.tExportacion}</td>}
                    {columnVisibility.tGratuito && <td>{cotizacion.tGratuito}</td>}
                    {columnVisibility.tInafecta && <td>{cotizacion.tInafecta}</td>}
                    {columnVisibility.tExonerado && <td>{cotizacion.tExonerado}</td>}
                    {columnVisibility.tGravado && <td>{cotizacion.tGravado}</td>}
                    {columnVisibility.igv && <td>{cotizacion.igv}</td>}
                    {columnVisibility.total && <td><strong>{cotizacion.total}</strong></td>}
                  
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="action-btn"
                          title="Editar"
                          onClick={() => handleEditar(cotizacion.id)}
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn"
                          title="Eliminar"
                          onClick={() => handleEliminar(cotizacion.id)}
                          style={{ color: '#e74c3c' }}
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
      )}

      <div className="table-footer">
        <div className="pagination-info">
          Mostrando {cotizacionesFiltradas.length > 0 ? '1' : '0'}-{cotizacionesFiltradas.length} de {cotizacionesFiltradas.length} registros
        </div>
        <div className="pagination-controls">
          <button className="pagination-btn" disabled>Anterior</button>
          <span className="pagination-page">1</span>
          <button className="pagination-btn" disabled>Siguiente</button>
        </div>
      </div>
      
      {showFormulario && (
        <div className="formulario-overlay">
          <div className="formulario-container">
            <button 
              className="close-formulario-btn"
              onClick={() => setShowFormulario(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              ×
            </button>
            <CotizacionesFormulario 
              onCotizacionGuardada={agregarCotizacion}
              onCerrar={() => setShowFormulario(false)}
              cotizacionInicial={cotizacionSeleccionada}
              modoEdicion={Boolean(cotizacionSeleccionada)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CotizacionesLista;