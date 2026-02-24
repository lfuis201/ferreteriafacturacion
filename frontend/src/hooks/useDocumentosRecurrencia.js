// src/hooks/useDocumentosRecurrencia.js
import { useState, useEffect, useCallback } from 'react';
import { obtenerDocumentosRecurrencia } from '../services/documentoRecurrenciaService';

export const useDocumentosRecurrencia = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    fechaEmision: '',
    busqueda: '',
    page: 1,
    limit: 10
  });
  const [paginacion, setPaginacion] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 10
  });

  // Función para cargar documentos
  const cargarDocumentos = useCallback(async (filtrosActuales = filtros) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando documentos de recurrencia con filtros:', filtrosActuales);
      
      // Preparar filtros para la API
      const filtrosAPI = { ...filtrosActuales };
      
      // Convertir fecha de emisión a rango de fechas
      if (filtrosAPI.fechaEmision) {
        const hoy = new Date();
        let fechaInicio, fechaFin;
        
        switch (filtrosAPI.fechaEmision) {
          case 'hoy':
            fechaInicio = fechaFin = hoy.toISOString().split('T')[0];
            break;
          case 'esta-semana':
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - hoy.getDay());
            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);
            fechaInicio = inicioSemana.toISOString().split('T')[0];
            fechaFin = finSemana.toISOString().split('T')[0];
            break;
          case 'este-mes':
            fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
            fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
            break;
          default:
            // Para 'personalizado' o valores específicos, usar como está
            break;
        }
        
        if (fechaInicio && fechaFin) {
          filtrosAPI.fechaInicio = fechaInicio;
          filtrosAPI.fechaFin = fechaFin;
        }
        
        // Remover fechaEmision ya que usamos fechaInicio/fechaFin
        delete filtrosAPI.fechaEmision;
      }
      
      const response = await obtenerDocumentosRecurrencia(filtrosAPI);
      
      console.log('✅ Documentos de recurrencia cargados:', response);
      
      setDocumentos(response.documentos || []);
      setPaginacion({
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 1,
        limit: response.limit || 10
      });
      
    } catch (error) {
      console.error('❌ Error al cargar documentos de recurrencia:', error);
      setError(error.message || 'Error al cargar documentos de recurrencia');
      setDocumentos([]);
      setPaginacion({
        total: 0,
        page: 1,
        totalPages: 1,
        limit: 10
      });
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Función para actualizar filtros
  const actualizarFiltros = useCallback((nuevosFiltros) => {
    console.log('🔧 Actualizando filtros:', nuevosFiltros);
    setFiltros(prevFiltros => ({
      ...prevFiltros,
      ...nuevosFiltros,
      // Resetear página cuando cambian los filtros (excepto cuando se cambia la página)
      page: nuevosFiltros.page !== undefined ? nuevosFiltros.page : 1
    }));
  }, []);

  // Función para buscar
  const buscar = useCallback(() => {
    console.log('🔍 Ejecutando búsqueda con filtros actuales:', filtros);
    cargarDocumentos(filtros);
  }, [filtros, cargarDocumentos]);

  // Función para cambiar página
  const cambiarPagina = useCallback((nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPages) {
      console.log('📄 Cambiando a página:', nuevaPagina);
      const nuevosFiltros = { ...filtros, page: nuevaPagina };
      setFiltros(nuevosFiltros);
      cargarDocumentos(nuevosFiltros);
    }
  }, [filtros, paginacion.totalPages, cargarDocumentos]);

  // Función para refrescar datos
  const refrescar = useCallback(() => {
    console.log('🔄 Refrescando datos...');
    cargarDocumentos(filtros);
  }, [filtros, cargarDocumentos]);

  // Cargar datos iniciales
  useEffect(() => {
    console.log('🚀 Cargando datos iniciales de documentos de recurrencia');
    cargarDocumentos();
  }, []); // Solo ejecutar una vez al montar el componente

  return {
    // Estado
    documentos,
    loading,
    error,
    filtros,
    paginacion,
    
    // Funciones
    actualizarFiltros,
    buscar,
    cambiarPagina,
    refrescar,
    cargarDocumentos
  };
};