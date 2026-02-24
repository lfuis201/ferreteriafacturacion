import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { exportarPresentacionesExcel } from '../../services/presentacionService';
import { obtenerProductos } from '../../services/productoService';
import '../../styles/ExportarPresentacionesExcel.css';

const ExportarPresentacionesExcel = ({ isOpen, onClose }) => {
  const [filtros, setFiltros] = useState({
    productoId: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarProductos();
    }
  }, [isOpen]);

  const cargarProductos = async () => {
    try {
      const productosData = await obtenerProductos();
      setProductos(productosData.data || productosData || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar productos',
        text: 'No se pudo cargar la lista de productos. Por favor, intenta nuevamente.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExportar = async () => {
    // Validar fechas si ambas están presentes
    if (filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas inválidas',
        text: 'La fecha "desde" no puede ser mayor que la fecha "hasta"',
        confirmButtonText: 'Corregir',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    // Mostrar confirmación antes de exportar
    const result = await Swal.fire({
      icon: 'question',
      title: '¿Exportar presentaciones?',
      html: `
        <div style="text-align: left; margin: 10px 0;">
          <p><strong>📊 Se exportarán las presentaciones con los siguientes filtros:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
            <li><strong>Producto:</strong> ${filtros.productoId ? 
              productos.find(p => p.id == filtros.productoId)?.nombre || 'Producto seleccionado' : 
              'Todos los productos'}</li>
            <li><strong>Fecha desde:</strong> ${filtros.fechaDesde || 'Sin filtro'}</li>
            <li><strong>Fecha hasta:</strong> ${filtros.fechaHasta || 'Sin filtro'}</li>
          </ul>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, exportar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280'
    });

    if (!result.isConfirmed) return;

    // Mostrar loading
    Swal.fire({
      title: 'Generando archivo Excel...',
      text: 'Por favor espera mientras se prepara la exportación',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setCargando(true);
    
    try {
      // Filtrar valores vacíos
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) => value !== '')
      );
      
      console.log('Filtros enviados:', filtrosLimpios);

      await exportarPresentacionesExcel(filtrosLimpios);
      
      // Cerrar loading
      Swal.close();
      
      // Mostrar éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Exportación exitosa!',
        html: `
          <div style="text-align: center; margin: 10px 0;">
            <p><strong>📁 El archivo Excel se ha descargado correctamente</strong></p>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #bbf7d0;">
              <p style="margin: 0; color: #166534; font-size: 14px;">
                💡 <strong>El archivo se encuentra en tu carpeta de descargas</strong><br>
                Nombre: presentaciones_${new Date().toISOString().split('T')[0]}.xlsx
              </p>
            </div>
          </div>
        `,
        confirmButtonText: 'Perfecto',
        confirmButtonColor: '#10b981',
        timer: 3000
      });
      
      onClose();
    } catch (error) {
      console.error('Error en exportación:', error);
      
      // Cerrar loading si está abierto
      Swal.close();
      
      // Mostrar error detallado
      let mensajeError = 'Error al exportar presentaciones';
      let detalleError = 'Error desconocido';
      
      if (error.response && error.response.data) {
        mensajeError = error.response.data.mensaje || mensajeError;
        detalleError = error.response.data.error || error.response.data.mensaje || detalleError;
      } else if (error.message) {
        detalleError = error.message;
      }

      await Swal.fire({
        icon: 'error',
        title: 'Error en la exportación',
        html: `
          <div style="text-align: left;">
            <p><strong>❌ No se pudo completar la exportación</strong></p>
            <div style="background: #fef2f2; padding: 10px; border-radius: 5px; border: 1px solid #fecaca; margin: 10px 0;">
              <p style="margin: 0; color: #dc2626; font-size: 12px;"><strong>Detalle del error:</strong></p>
              <code style="color: #dc2626; font-size: 11px;">${detalleError}</code>
            </div>
            <div style="background: #eff6ff; padding: 10px; border-radius: 5px; border: 1px solid #bfdbfe; margin: 10px 0;">
              <p style="margin: 0; font-size: 13px; color: #1e40af;">
                💡 <strong>Posibles soluciones:</strong><br>
                • Verifica tu conexión a internet<br>
                • Intenta con filtros diferentes<br>
                • Contacta al administrador si el problema persiste
              </p>
            </div>
          </div>
        `,
        width: '500px',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setCargando(false);
    }
  };

  const handleCerrar = () => {
    setFiltros({
      productoId: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-exportar-presentaciones">
        <div className="modal-header">
          <h2>Exportar Presentaciones a Excel</h2>
          <button
            className="btn-cerrar"
            onClick={handleCerrar}
            disabled={cargando}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
           {/*
          <div className="campo">
            <label htmlFor="productoId">
              Producto:
            </label>
            <select
              id="productoId"
              name="productoId"
              value={filtros.productoId}
              onChange={handleInputChange}
              disabled={cargando}
            >
              <option value="">Todos los productos</option>
              {productos.map(producto => (
                <option key={producto.id} value={producto.id}>
                  {producto.codigo} - {producto.nombre}
                </option>
              ))}
            </select>
          </div>
           */}

          {/*<div className="campo">
            <label htmlFor="fechaDesde">
              Fecha desde:
            </label>
            <input
              type="date"
              id="fechaDesde"
              name="fechaDesde"
              value={filtros.fechaDesde}
              onChange={handleInputChange}
              disabled={cargando}
            />
          </div>*/}
          
          {/*<div className="campo">
            <label htmlFor="fechaHasta">
              Fecha hasta:
            </label>
            <input
              type="date"
              id="fechaHasta"
              name="fechaHasta"
              value={filtros.fechaHasta}
              onChange={handleInputChange}
              disabled={cargando}
            />
          </div>*/}
          

          <div className="info-box">
            <h4>📋 Información del archivo Excel:</h4>
            <ul>
              <li>• Se incluirán todas las presentaciones de productos</li>
              <li>• El archivo se descargará automáticamente en tu carpeta de descargas</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={handleCerrar}
            disabled={cargando}
            className="btn-cancelar"
          >
            Cancelar
          </button>
          <button
            onClick={handleExportar}
            disabled={cargando}
            className="btn-exportar"
          >
            {cargando ? (
              <>
                <div className="spinner"></div>
                Exportando...
              </>
            ) : (
              <>
                <svg className="icon" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportarPresentacionesExcel;