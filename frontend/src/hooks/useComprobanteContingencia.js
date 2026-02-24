import { useState, useEffect, useCallback } from 'react';
import comprobanteContingenciaService from '../services/comprobanteContingenciaService';

const useComprobanteContingencia = () => {
  // Estados principales
  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    tipoComprobante: '',
    busqueda: '',
    fechaInicio: '',
    fechaFin: '',
    sucursalId: '',
    serie: '',
    numero: ''
  });

  // Estados de paginación
  const [paginacion, setPaginacion] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Estado de resumen
  const [resumen, setResumen] = useState({
    totalComprobantes: 0,
    pendientes: 0,
    conError: 0,
    rechazados: 0
  });

  // Función para cargar comprobantes
  const cargarComprobantes = useCallback(async (filtrosPersonalizados = null, paginaPersonalizada = null) => {
    try {
      setLoading(true);
      setError(null);

      const filtrosAUsar = filtrosPersonalizados || filtros;
      const paginaAUsar = paginaPersonalizada || paginacion.page;

      const parametros = {
        ...filtrosAUsar,
        page: paginaAUsar,
        limit: paginacion.limit
      };

      console.log('🔍 Cargando comprobantes con parámetros:', parametros);

      const response = await comprobanteContingenciaService.obtenerComprobantes(parametros);

      if (response.success) {
        setComprobantes(response.data || []);
        setPaginacion(prev => ({
          ...prev,
          ...response.pagination,
          page: paginaAUsar
        }));
        setResumen(response.resumen || {});
        console.log('✅ Comprobantes cargados exitosamente:', response.data?.length || 0);
      } else {
        throw new Error(response.mensaje || 'Error al cargar comprobantes');
      }
    } catch (err) {
      console.error('❌ Error al cargar comprobantes:', err);
      setError(err.mensaje || err.message || 'Error al cargar comprobantes de contingencia');
      setComprobantes([]);
      setPaginacion(prev => ({ ...prev, totalPages: 0, totalItems: 0 }));
      setResumen({});
    } finally {
      setLoading(false);
    }
  }, [filtros, paginacion.page, paginacion.limit]);

  // Función para actualizar filtros
  const actualizarFiltros = useCallback((nuevosFiltros) => {
    console.log('🔧 Actualizando filtros:', nuevosFiltros);
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    setPaginacion(prev => ({ ...prev, page: 1 })); // Resetear a página 1 cuando cambian los filtros
  }, []);

  // Función para buscar
  const buscar = useCallback(async () => {
    console.log('🔍 Iniciando búsqueda con filtros:', filtros);
    await cargarComprobantes(filtros, 1);
  }, [filtros, cargarComprobantes]);

  // Función para cambiar página
  const cambiarPagina = useCallback(async (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPages) {
      console.log('📄 Cambiando a página:', nuevaPagina);
      setPaginacion(prev => ({ ...prev, page: nuevaPagina }));
      await cargarComprobantes(filtros, nuevaPagina);
    }
  }, [filtros, paginacion.totalPages, cargarComprobantes]);

  // Función para refrescar datos
  const refrescar = useCallback(async () => {
    console.log('🔄 Refrescando datos...');
    await cargarComprobantes();
  }, [cargarComprobantes]);

  // Función para reenviar comprobante a SUNAT
  const reenviarComprobante = useCallback(async (comprobanteId) => {
    try {
      setLoading(true);
      console.log('📤 Reenviando comprobante:', comprobanteId);
      
      const response = await comprobanteContingenciaService.reenviarComprobante(comprobanteId);
      
      if (response.success) {
        console.log('✅ Comprobante reenviado exitosamente');
        // Refrescar la lista después del reenvío
        await cargarComprobantes();
        return { success: true, mensaje: response.mensaje };
      } else {
        throw new Error(response.mensaje || 'Error al reenviar comprobante');
      }
    } catch (err) {
      console.error('❌ Error al reenviar comprobante:', err);
      const mensaje = err.mensaje || err.message || 'Error al reenviar comprobante';
      setError(mensaje);
      return { success: false, mensaje };
    } finally {
      setLoading(false);
    }
  }, [cargarComprobantes]);

  // Función para descargar archivos
  const descargarArchivo = useCallback(async (comprobanteId, tipo) => {
    try {
      console.log(`📄 Descargando ${tipo}:`, comprobanteId);
      
      let blob;
      let nombreArchivo;
      
      switch (tipo) {
        case 'xml':
          blob = await comprobanteContingenciaService.descargarXML(comprobanteId);
          nombreArchivo = `comprobante_${comprobanteId}.xml`;
          break;
        case 'cdr':
          blob = await comprobanteContingenciaService.descargarCDR(comprobanteId);
          nombreArchivo = `cdr_${comprobanteId}.zip`;
          break;
        case 'pdf':
          blob = await comprobanteContingenciaService.descargarPDF(comprobanteId);
          nombreArchivo = `comprobante_${comprobanteId}.pdf`;
          break;
        default:
          throw new Error('Tipo de archivo no válido');
      }

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ ${tipo.toUpperCase()} descargado exitosamente`);
      return { success: true, mensaje: `${tipo.toUpperCase()} descargado exitosamente` };
    } catch (err) {
      console.error(`❌ Error al descargar ${tipo}:`, err);
      const mensaje = err.mensaje || err.message || `Error al descargar ${tipo}`;
      setError(mensaje);
      return { success: false, mensaje };
    }
  }, []);

  // Función para obtener estado SUNAT
  const obtenerEstadoSunat = useCallback(async (comprobanteId) => {
    try {
      console.log('📊 Obteniendo estado SUNAT:', comprobanteId);
      
      const response = await comprobanteContingenciaService.obtenerEstadoSunat(comprobanteId);
      
      if (response.success) {
        console.log('✅ Estado SUNAT obtenido:', response.data);
        return { success: true, data: response.data, mensaje: response.mensaje };
      } else {
        throw new Error(response.mensaje || 'Error al obtener estado SUNAT');
      }
    } catch (err) {
      console.error('❌ Error al obtener estado SUNAT:', err);
      const mensaje = err.mensaje || err.message || 'Error al obtener estado SUNAT';
      setError(mensaje);
      return { success: false, mensaje };
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarComprobantes();
  }, []); // Solo cargar una vez al montar el componente

  return {
    // Estados
    comprobantes,
    loading,
    error,
    filtros,
    paginacion,
    resumen,

    // Funciones
    actualizarFiltros,
    buscar,
    cambiarPagina,
    refrescar,
    reenviarComprobante,
    descargarArchivo,
    obtenerEstadoSunat,
    cargarComprobantes
  };
};

export default useComprobanteContingencia;