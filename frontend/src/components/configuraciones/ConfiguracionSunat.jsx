import React, { useState, useEffect } from 'react';
import { Upload, Save, TestTube, Settings, AlertCircle, CheckCircle, FileText, Key, Globe } from 'lucide-react';
import Swal from 'sweetalert2';
import configuracionSunatService from '../../services/configuracionSunatService';
import '../../styles/ConfiguracionSunat.css';

// URLs reales de SUNAT según ambiente
const getUrlsForAmbiente = (ambiente) => {
  if (ambiente === 'produccion') {
    return {
      urlEnvio: 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService',
      urlConsulta: 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService',
    };
  }
  return {
    urlEnvio: 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService',
    urlConsulta: 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService',
  };
};

const ConfiguracionSunat = () => {
  const [configuracion, setConfiguracion] = useState({
    certificadoPfx: null,
    passwordCertificado: '',
    ambiente: 'demo', // demo o produccion
    urlEnvio: '',
    urlConsulta: '',
    activo: true
  });

  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [configuracionExistente, setConfiguracionExistente] = useState(null);
  const [certificadoInfo, setCertificadoInfo] = useState(null);
  const [sucursalId] = useState(1); // Por defecto sucursal 1

  useEffect(() => {
    cargarConfiguracion();
  }, );

  const cargarConfiguracion = async () => {
    try {
      const data = await configuracionSunatService.obtenerConfiguracion(sucursalId);
      
      if (data.success && data.data) {
        setConfiguracionExistente(data.data);
        const ambiente = data.data.ambiente || 'demo';
        const urls = getUrlsForAmbiente(ambiente);
        setConfiguracion({
          ...configuracion,
          ambiente,
          urlEnvio: data.data.urlEnvio || urls.urlEnvio,
          urlConsulta: data.data.urlConsulta || urls.urlConsulta,
          activo: data.data.activo !== undefined ? data.data.activo : true,
        });
        
        if (data.data.certificadoPfx) {
          setCertificadoInfo({
            nombre: 'Certificado cargado',
            fechaSubida: data.data.updatedAt
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      // Si no existe configuración, no es un error crítico
      if (error.status !== 404) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Error al cargar la configuración SUNAT',
        });
      } else {
        const urls = getUrlsForAmbiente('demo');
        setConfiguracion((prev) => ({ ...prev, urlEnvio: urls.urlEnvio, urlConsulta: urls.urlConsulta }));
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.pfx') || file.name.endsWith('.p12')) {
        setConfiguracion({
          ...configuracion,
          certificadoPfx: file
        });
        setCertificadoInfo({
          nombre: file.name,
          tamaño: (file.size / 1024).toFixed(2) + ' KB',
          fechaSubida: new Date().toLocaleString()
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Archivo inválido',
          text: 'Solo se permiten archivos .pfx o .p12'
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'ambiente') {
      const urls = getUrlsForAmbiente(value);
      setConfiguracion({
        ...configuracion,
        ambiente: value,
        urlEnvio: urls.urlEnvio,
        urlConsulta: urls.urlConsulta,
      });
      return;
    }
    setConfiguracion({
      ...configuracion,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validarFormulario = () => {
    const errores = [];
    
    if (!configuracion.certificadoPfx && !configuracionExistente?.certificadoPfx) {
      errores.push('El certificado PFX es obligatorio');
    }
    
    if (!configuracion.passwordCertificado.trim() && configuracion.certificadoPfx) {
      errores.push('La contraseña del certificado es obligatoria');
    }
    
    return errores;
  };

  const guardarConfiguracion = async () => {
    const errores = validarFormulario();
    if (errores.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Errores de validación',
        html: errores.map(error => `• ${error}`).join('<br>')
      });
      return;
    }

    setLoading(true);
    
    try {
      const configuracionData = {
        ambiente: configuracion.ambiente,
        activo: configuracion.activo,
        urlEnvio: configuracion.urlEnvio,
        urlConsulta: configuracion.urlConsulta,
      };

      if (configuracionExistente) {
        await configuracionSunatService.actualizarConfiguracion(sucursalId, configuracionData);
      } else {
        await configuracionSunatService.crearConfiguracion(sucursalId, configuracionData);
      }

      // Subir certificado si existe
      if (configuracion.certificadoPfx && configuracion.passwordCertificado) {
        await configuracionSunatService.subirCertificado(
          sucursalId, 
          configuracion.certificadoPfx, 
          configuracion.passwordCertificado
        );
      }

      Swal.fire({
        icon: 'success',
        title: 'Configuración guardada',
        text: 'La configuración SUNAT se ha guardado correctamente'
      });
      
      // Recargar configuración
      await cargarConfiguracion();
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al guardar la configuración'
      });
    } finally {
      setLoading(false);
    }
  };

  const probarConexion = async () => {
    if (!configuracionExistente?.certificadoPfx && !configuracion.certificadoPfx) {
      Swal.fire({
        icon: 'warning',
        title: 'Certificado requerido',
        text: 'Debe cargar un certificado PFX para probar la conexión'
      });
      return;
    }

    if (!configuracionExistente) {
      Swal.fire({
        icon: 'warning',
        title: 'Configuración no guardada',
        text: 'Debe guardar la configuración antes de probar la conexión'
      });
      return;
    }

    setTestingConnection(true);
    
    try {
      const data = await configuracionSunatService.probarConexion(sucursalId);

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Conexión exitosa',
          text: 'La conexión con SUNAT se estableció correctamente'
        });
      } else {
        throw new Error(data.message || 'Error en la conexión');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: error.message || 'No se pudo establecer conexión con SUNAT'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="configuracion-sunat">
      <div className="configuracion-header">
        <div className="header-content">
          <Settings className="header-icon" />
          <div>
            <h1>Configuración SUNAT</h1>
            <p>Configure los parámetros para la facturación electrónica</p>
          </div>
        </div>
      </div>

      <div className="configuracion-content">


        {/* Certificado Digital */}
        <div className="config-section">
          <div className="section-header">
            <Key className="section-icon" />
            <h2>Certificado Digital</h2>
          </div>
          
          <div className="certificate-upload">
            <div className="upload-area">
              <input
                type="file"
                id="certificado"
                accept=".pfx,.p12"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              <label htmlFor="certificado" className="upload-button">
                <Upload className="upload-icon" />
                <span>Subir Certificado PFX</span>
              </label>
              
              {certificadoInfo && (
                <div className="certificate-info">
                  <CheckCircle className="success-icon" />
                  <div className="info-details">
                    <p><strong>Archivo:</strong> {certificadoInfo.nombre}</p>
                    <p><strong>Tamaño:</strong> {certificadoInfo.tamaño}</p>
                    <p><strong>Subido:</strong> {certificadoInfo.fechaSubida}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="passwordCertificado">Contraseña del Certificado</label>
              <input
                type="password"
                id="passwordCertificado"
                name="passwordCertificado"
                value={configuracion.passwordCertificado}
                onChange={handleInputChange}
                placeholder="Ingrese la contraseña del certificado"
              />
            </div>
          </div>
        </div>



        {/* Configuración de Ambiente */}
        <div className="config-section">
          <div className="section-header">
            <Globe className="section-icon" />
            <h2>Ambiente de Trabajo</h2>
          </div>
          
          <div className="ambiente-selector">
            <div className="radio-group">
              <label className={`radio-option ${configuracion.ambiente === 'demo' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="ambiente"
                  value="demo"
                  checked={configuracion.ambiente === 'demo'}
                  onChange={handleInputChange}
                />
                <span className="radio-label">
                  <TestTube className="radio-icon" />
                  <div>
                    <strong>Ambiente de Pruebas (Demo)</strong>
                    <p>Para realizar pruebas sin afectar la producción</p>
                  </div>
                </span>
              </label>
              
              <label className={`radio-option ${configuracion.ambiente === 'produccion' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="ambiente"
                  value="produccion"
                  checked={configuracion.ambiente === 'produccion'}
                  onChange={handleInputChange}
                />
                <span className="radio-label">
                  <Globe className="radio-icon" />
                  <div>
                    <strong>Ambiente de Producción</strong>
                    <p>Para emitir comprobantes reales</p>
                  </div>
                </span>
              </label>
            </div>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="urlEnvio">URL de Envío</label>
              <input
                type="url"
                id="urlEnvio"
                name="urlEnvio"
                value={configuracion.urlEnvio}
                onChange={handleInputChange}
                placeholder="URL para envío de comprobantes"
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="urlConsulta">URL de Consulta</label>
              <input
                type="url"
                id="urlConsulta"
                name="urlConsulta"
                value={configuracion.urlConsulta}
                onChange={handleInputChange}
                placeholder="URL para consulta de comprobantes"
                readOnly
              />
            </div>
          </div>
          
          <div className="info-message">
            <AlertCircle className="info-icon" />
            <p>Las URLs se configuran automáticamente según el ambiente seleccionado</p>
          </div>
        </div>

        {/* Estado */}
        <div className="config-section">
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="activo"
                checked={configuracion.activo}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              Configuración activa
            </label>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="action-buttons">
          <button
            type="button"
            className="btn btn-test"
            onClick={probarConexion}
            disabled={testingConnection}
          >
            <TestTube className="btn-icon" />
            {testingConnection ? 'Probando...' : 'Probar Conexión'}
          </button>
          
          <button
            type="button"
            className="btn btn-primary"
            onClick={guardarConfiguracion}
            disabled={loading}
          >
            <Save className="btn-icon" />
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionSunat;