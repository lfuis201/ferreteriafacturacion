import React, { useState, useRef } from 'react';
import { FaDownload, FaUpload, FaFileExcel } from 'react-icons/fa';
import { X } from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import '../../styles/ImportarExcel.css';

const ImportarPresentacionesExcel = ({ isOpen, onClose, onImportSuccess, onImportComplete }) => {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);

  const archivoInputRef = useRef(null);

  // Generar plantilla Excel para presentaciones
  const generarPlantilla = () => {
    const encabezados = [
      'Código Interno',
      'Descripción - 1',
      'Factor - 1',
      'Unidad de medida - 1',
      'Precio - 1',
      'Código Barras - 1',
      'Descripción - 2',
      'Factor - 2',
      'Unidad de medida - 2',
      'Precio - 2',
      'Código Barras - 2',
      'Descripción - 3',
      'Factor - 3',
      'Unidad de medida - 3',
      'Precio - 3',
      'Código Barras - 3'
    ];

    const datosEjemplo = [
      [
        'PROD001',
        'Presentación Unidad',
        1,
        'Unidad',
        10.5,
        '1234567890123',
        'Presentación Caja',
        12,
        'Caja',
        120,
        '1234567890124',
        'Presentación Paquete',
        6,
        'Paquete',
        60,
        '1234567890125'
      ]
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([encabezados, ...datosEjemplo]);
    
    // Ajustar ancho de columnas
    const colWidths = encabezados.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Presentaciones');
    XLSX.writeFile(wb, 'plantilla_presentaciones.xlsx');
    
    Swal.fire({
      icon: 'success',
      title: '¡Plantilla descargada!',
      text: 'La plantilla se ha descargado exitosamente',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Manejar selección de archivo
  const manejarSeleccionArchivo = (evento) => {
    const archivoSeleccionado = evento.target.files[0];
    if (archivoSeleccionado) {
      if (archivoSeleccionado.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          archivoSeleccionado.type === 'application/vnd.ms-excel') {
        setArchivo(archivoSeleccionado);
        
        Swal.fire({
          icon: 'info',
          title: 'Archivo seleccionado',
          text: `Archivo: ${archivoSeleccionado.name}`,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Archivo no válido',
          text: 'Por favor selecciona un archivo Excel válido (.xlsx o .xls)'
        });
        evento.target.value = '';
      }
    }
  };

  // Procesar archivo Excel
  const procesarArchivo = async () => {
    if (!archivo) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo requerido',
        text: 'Por favor selecciona un archivo Excel'
      });
      return;
    }

    // Mostrar loading
    Swal.fire({
      title: 'Procesando archivo...',
      text: 'Por favor espera mientras se importan las presentaciones',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setCargando(true);
    
    try {
      await enviarArchivo(archivo);
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al procesar',
        text: 'Error al procesar el archivo Excel',
        footer: error.message || 'Error desconocido'
      });
    } finally {
      setCargando(false);
    }
  };

  // Enviar archivo al backend
  const enviarArchivo = async (archivo) => {
    try {
      const { importarPresentacionesExcel } = await import('../../services/presentacionService');
      const resultado = await importarPresentacionesExcel(archivo);

      console.log('Resultado de importación:', resultado);

      // Cerrar el loading
      Swal.close();

      // Mostrar resultado detallado
      if (resultado.filasProcessadas > 0) {
        // Importación exitosa (total o parcial)
        let mensajeDetalle = `
          <div style="text-align: left; margin: 10px 0;">
            <p><strong>📊 Resumen de importación:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>✅ Filas procesadas: ${resultado.filasProcessadas}</li>
              <li>📦 Presentaciones creadas: ${resultado.presentacionesCreadas}</li>
              <li>📄 Total de filas: ${resultado.totalFilas}</li>
              ${resultado.errores > 0 ? `<li>⚠️ Errores encontrados: ${resultado.errores}</li>` : ''}
            </ul>
          </div>
        `;

        if (resultado.errores > 0) {
          // Importación parcial con errores
          mensajeDetalle += `
            <div style="text-align: left; margin: 10px 0;">
              <p><strong>⚠️ Errores encontrados:</strong></p>
              <div style="max-height: 200px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 12px;">
                ${resultado.detalles_errores.map(error => `<p style="margin: 2px 0;">• ${error}</p>`).join('')}
              </div>
            </div>
          `;

          await Swal.fire({
            icon: 'warning',
            title: 'Importación completada con errores',
            html: mensajeDetalle,
            width: '600px',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#f59e0b'
          });
        } else {
          // Importación completamente exitosa
          await Swal.fire({
            icon: 'success',
            title: '¡Importación exitosa!',
            html: mensajeDetalle,
            width: '500px',
            confirmButtonText: 'Excelente',
            confirmButtonColor: '#10b981'
          });
        }

        // Limpiar archivo y notificar éxito
        setArchivo(null);
        if (archivoInputRef.current) {
          archivoInputRef.current.value = '';
        }
        
        if (onImportSuccess) {
          onImportSuccess();
        }
        if (onImportComplete) {
          onImportComplete();
        }

      } else {
        // No se procesó ninguna fila
        let mensajeError = `
          <div style="text-align: left; margin: 10px 0;">
            <p><strong>❌ No se pudieron procesar las presentaciones</strong></p>
            <p><strong>📊 Detalles:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>📄 Total de filas: ${resultado.totalFilas}</li>
              <li>⚠️ Errores encontrados: ${resultado.errores}</li>
            </ul>
          </div>
        `;

        if (resultado.detalles_errores && resultado.detalles_errores.length > 0) {
          mensajeError += `
            <div style="text-align: left; margin: 10px 0;">
              <p><strong>🔍 Errores específicos:</strong></p>
              <div style="max-height: 200px; overflow-y: auto; background: #fef2f2; padding: 10px; border-radius: 5px; font-size: 12px; border: 1px solid #fecaca;">
                ${resultado.detalles_errores.map(error => `<p style="margin: 2px 0; color: #dc2626;">• ${error}</p>`).join('')}
              </div>
            </div>
          `;
        }

        await Swal.fire({
          icon: 'error',
          title: 'Error en la importación',
          html: mensajeError,
          width: '600px',
          confirmButtonText: 'Revisar datos',
          confirmButtonColor: '#dc2626'
        });
      }

    } catch (error) {
      console.error('Error al enviar archivo:', error);
      
      // Cerrar loading si está abierto
      Swal.close();
      
      // Mostrar error detallado
      let mensajeError = 'Error al importar presentaciones';
      
      if (error.response && error.response.data) {
        mensajeError = error.response.data.mensaje || error.response.data.error || mensajeError;
      } else if (error.message) {
        mensajeError = error.message;
      }

      await Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        html: `
          <div style="text-align: left;">
            <p><strong>❌ No se pudo completar la importación</strong></p>
            <p><strong>Detalle del error:</strong></p>
            <div style="background: #fef2f2; padding: 10px; border-radius: 5px; border: 1px solid #fecaca; margin: 10px 0;">
              <code style="color: #dc2626; font-size: 12px;">${mensajeError}</code>
            </div>
            <p style="font-size: 14px; color: #6b7280;">
              💡 <strong>Sugerencias:</strong><br>
              • Verifica que el archivo Excel tenga el formato correcto<br>
              • Asegúrate de que los códigos de productos existan<br>
              • Revisa que no haya códigos de barras duplicados
            </p>
          </div>
        `,
        width: '600px',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-importar-excel">
        <div className="modal-header">
          <h2>Importar Presentaciones desde Excel</h2>
          <button className="btn-cerrar" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="importar-paso">
            <div className="importar-header">
              <FaFileExcel className="importar-icon" size={48} />
              <h3>Importar Presentaciones desde Excel</h3>
              <p>Descarga la plantilla, completa los datos y sube el archivo para importar presentaciones</p>
            </div>
            
            <div className="importar-acciones">
              <button
                onClick={generarPlantilla}
                className="btn-descargar-plantilla"
              >
                <FaDownload />
                Descargar Plantilla
              </button>
            </div>
            
            <div className="importar-upload">
              <div 
                className="upload-area"
                onClick={() => archivoInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={archivoInputRef}
                  onChange={manejarSeleccionArchivo}
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                />
                <FaUpload size={32} />
                <span>
                  {archivo ? 'Archivo seleccionado' : 'Selecciona un archivo Excel'}
                </span>
                <small>Formatos soportados: .xlsx, .xls</small>
              </div>
            </div>

            {archivo && (
              <div style={{ 
                background: '#f8fafc', 
                padding: '16px', 
                borderRadius: '8px', 
                marginTop: '16px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>
                  <strong>Archivo seleccionado:</strong> {archivo.name}
                </p>
                <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                  Tamaño: {(archivo.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
            
            {archivo && (
              <div className="importar-acciones">
                <button
                  onClick={procesarArchivo}
                  disabled={cargando}
                  className="btn-primario"
                >
                  <FaUpload />
                  {cargando ? 'Importando...' : 'Importar Presentaciones'}
                </button>
              </div>
            )}

            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '24px'
            }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                color: '#1e40af', 
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>Instrucciones:</h4>
              <ul style={{ 
                margin: '0', 
                paddingLeft: '20px', 
                color: '#1e40af',
                fontSize: '0.8rem',
                lineHeight: '1.5'
              }}>
                <li>1. Descarga la plantilla Excel haciendo clic en "Descargar Plantilla"</li>
                <li>2. Completa los datos de las presentaciones en la plantilla</li>
                <li>3. El campo "Código Interno" debe corresponder a un producto existente</li>
                <li>4. Solo el "Código Interno" es obligatorio, los demás campos son opcionales</li>
                <li>5. Puedes crear hasta 3 presentaciones por producto en una sola fila</li>
                <li>6. Los códigos de barras deben ser únicos si los incluyes</li>
                <li>7. Guarda el archivo y súbelo usando el área de carga</li>
                <li>8. Haz clic en "Importar Presentaciones" para procesar los datos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportarPresentacionesExcel;