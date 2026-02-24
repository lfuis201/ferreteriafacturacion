import React, { useState, useEffect } from 'react';
import { MessageCircle, Save, TestTube, Settings, AlertCircle, CheckCircle, Phone, Globe, Zap } from 'lucide-react';
import Swal from 'sweetalert2';
import '../../styles/ConfiguracionWhatsapp.css';
import whatsappService from '../../services/whatsappService';

const ConfiguracionWhatsapp = () => {
  const [configuracion, setConfiguracion] = useState({
    tipoApi: 'baileys', // whatsapp-web-js, baileys, ultramsg, generic
    apiKey: '',
    apiUrl: '',
    numeroTelefono: '',
    nombreInstancia: '',
    limiteDiario: 100,
    mensajePersonalizado: 'Estimado cliente, adjuntamos su comprobante de pago. Gracias por su preferencia.',
    incluirPdf: true,
    activo: true,
    configuracionEspecifica: {}
  });

  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [configuracionExistente, setConfiguracionExistente] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  const tiposApi = [
 
    {
      value: 'baileys',
      label: 'Baileys',
      description: 'Librería de WhatsApp para Node.js',
      icon: Zap,
      gratuita: true
    },
   
    {
      value: 'generic',
      label: 'API Genérica',
      description: 'Configuración personalizada',
      icon: Settings,
      gratuita: false
    }
  ];

  useEffect(() => {
    cargarConfiguracion();
    cargarEstadisticas();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const sucursalId = Number(localStorage.getItem('sucursalId')) || 1;
      const data = await whatsappService.obtenerConfiguracion(sucursalId);
      const cfg = data?.configuracion || data?.data || data;
      if (cfg) {
        setConfiguracionExistente(cfg);
        setConfiguracion({
          ...configuracion,
          ...cfg,
          configuracionEspecifica: cfg.configuracionEspecifica || {}
        });
      }
    } catch (error) {
      console.error('Error al cargar configuración WhatsApp:', error);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const sucursalId = Number(localStorage.getItem('sucursalId')) || 1;
      const data = await whatsappService.obtenerEstadisticas(sucursalId);
      setEstadisticas(data?.estadisticas || data || null);
    } catch (error) {
      console.error('Error al cargar estadísticas WhatsApp:', error);
      setEstadisticas(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfiguracion({
      ...configuracion,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    });
  };

  const handleTipoApiChange = (tipoApi) => {
    setConfiguracion({
      ...configuracion,
      tipoApi,
      apiKey: '',
      apiUrl: '',
      configuracionEspecifica: {}
    });
  };

  const validarFormulario = () => {
    const errores = [];
    
    if (!configuracion.numeroTelefono.trim()) {
      errores.push('El número de teléfono es obligatorio');
    }
    
    if (configuracion.numeroTelefono && !/^\+?[1-9]\d{1,14}$/.test(configuracion.numeroTelefono.replace(/\s/g, ''))) {
      errores.push('El número de teléfono no tiene un formato válido');
    }
    
    if (!configuracion.mensajePersonalizado.trim()) {
      errores.push('El mensaje personalizado es obligatorio');
    }
    
    if (configuracion.limiteDiario < 1 || configuracion.limiteDiario > 1000) {
      errores.push('El límite diario debe estar entre 1 y 1000');
    }
    
    // Validaciones específicas por tipo de API
    if (configuracion.tipoApi === 'ultramsg' || configuracion.tipoApi === 'generic') {
      if (!configuracion.apiKey.trim()) {
        errores.push('La API Key es obligatoria para este tipo de servicio');
      }
      if (!configuracion.apiUrl.trim()) {
        errores.push('La URL de la API es obligatoria para este tipo de servicio');
      }
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
      const sucursalId = Number(localStorage.getItem('sucursalId')) || 1;
      let data;
      if (configuracionExistente) {
        data = await whatsappService.actualizarConfiguracion(sucursalId, configuracion);
      } else {
        data = await whatsappService.crearConfiguracion(sucursalId, configuracion);
      }

      if (data) {
        Swal.fire({
          icon: 'success',
          title: 'Configuración guardada',
          text: 'La configuración de WhatsApp se ha guardado correctamente'
        });
        
        // Recargar configuración
        await cargarConfiguracion();
      }
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
    if (!configuracion.numeroTelefono) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Complete el número de teléfono para probar la conexión'
      });
      return;
    }

    setTestingConnection(true);
    
    try {
      const sucursalId = Number(localStorage.getItem('sucursalId')) || 1;
      const data = await whatsappService.probarConexion(sucursalId);

      const ok = data && (data.success === true || data.exito === true);
      const payload = data?.data || data;

      if (ok) {
        if (payload?.requiereQR) {
          if (payload?.qrCode) {
            Swal.fire({
              icon: 'info',
              title: 'Escanea el QR para conectar',
              html: `<div style="display:flex;flex-direction:column;align-items:center;gap:12px">
                      <img src="${payload.qrCode}" alt="QR WhatsApp" style="max-width:240px;border:1px solid #e5e7eb;border-radius:8px" />
                      <div style="font-size:12px;color:#6b7280">Abre WhatsApp > Dispositivos vinculados > Vincular dispositivo</div>
                     </div>`,
              confirmButtonText: 'Listo'
            });
          } else {
            // Iniciar polling para obtener QR cuando esté disponible
            let attempts = 0;
            const maxAttempts = 40; // ~60s si intervalo es 1.5s
            Swal.fire({
              icon: 'info',
              title: 'Generando QR...',
              html: '<div style="font-size:12px;color:#6b7280">Esperando código QR. Mantén abierta esta ventana.</div>',
              showConfirmButton: false,
              allowOutsideClick: false,
              didOpen: () => {
                const interval = setInterval(async () => {
                  attempts++;
                  try {
                    const qrResp = await whatsappService.obtenerCodigoQR(sucursalId);
                    const qrOk = qrResp && (qrResp.success === true || qrResp.exito === true);
                    const qrData = qrResp?.data || qrResp;
                    if (qrOk) {
                      if (qrData?.qrCode) {
                        Swal.update({
                          title: 'Escanea el QR para conectar',
                          html: `<div style="display:flex;flex-direction:column;align-items:center;gap:12px">
                                  <img src="${qrData.qrCode}" alt="QR WhatsApp" style="max-width:240px;border:1px solid #e5e7eb;border-radius:8px" />
                                  <div style="font-size:12px;color:#6b7280">Abre WhatsApp > Dispositivos vinculados > Vincular dispositivo</div>
                                 </div>`,
                          showConfirmButton: true,
                        });
                        clearInterval(interval);
                      } else if (qrData?.requiereQR === false || qrData?.estado === 'Conectado') {
                        clearInterval(interval);
                        Swal.fire({
                          icon: 'success',
                          title: 'Conexión exitosa',
                          text: 'WhatsApp está conectado y listo para enviar mensajes'
                        });
                      }
                    }
                  } catch (err) {
                    console.error('Error al obtener QR:', err);
                  }
                  if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    Swal.fire({
                      icon: 'warning',
                      title: 'QR no disponible',
                      text: 'No se pudo generar el QR a tiempo. Intente nuevamente.'
                    });
                  }
                }, 1500);
              }
            });
          }
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Conexión exitosa',
            text: 'WhatsApp está conectado y listo para enviar mensajes'
          });
        }
      } else {
        throw new Error(data?.message || data?.mensaje || 'Error en la conexión');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: error.message || 'No se pudo establecer conexión con WhatsApp'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const renderConfiguracionEspecifica = () => {
    switch (configuracion.tipoApi) {
      
      
      case 'baileys':
        return (
          <div className="config-especifica">
            <div className="alert alert-info">
              <AlertCircle className="alert-icon" />
              <div>
                <strong>API Baileys:</strong> Se conecta directamente a WhatsApp.
                Requiere autenticación inicial mediante código QR.
              </div>
            </div>
          </div>
        );
      
    
      
      case 'generic':
        return (
          <div className="config-especifica">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="apiKey">API Key *</label>
                <input
                  type="text"
                  id="apiKey"
                  name="apiKey"
                  value={configuracion.apiKey}
                  onChange={handleInputChange}
                  placeholder="Ingrese su API Key"
                />
              </div>
              <div className="form-group">
                <label htmlFor="apiUrl">URL de la API *</label>
                <input
                  type="url"
                  id="apiUrl"
                  name="apiUrl"
                  value={configuracion.apiUrl}
                  onChange={handleInputChange}
                  placeholder="https://api.ejemplo.com/whatsapp"
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="configuracion-whatsapp">
      <div className="configuracion-header">
        <div className="header-content">
          <MessageCircle className="header-icon" />
          <div>
            <h1>Configuración WhatsApp</h1>
            <p>Configure el envío automático de comprobantes por WhatsApp</p>
          </div>
        </div>
      </div>

      <div className="configuracion-content">
    

        {/* Tipo de API */}
        <div className="config-section">
          <div className="section-header">
            <Settings className="section-icon" />
            <h2>Tipo de API de WhatsApp</h2>
          </div>
          
          <div className="api-selector">
            {tiposApi.map((tipo) => {
              const IconComponent = tipo.icon;
              return (
                <label 
                  key={tipo.value} 
                  className={`api-option ${configuracion.tipoApi === tipo.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="tipoApi"
                    value={tipo.value}
                    checked={configuracion.tipoApi === tipo.value}
                    onChange={() => handleTipoApiChange(tipo.value)}
                  />
                  <div className="api-content">
                    <div className="api-header">
                      <IconComponent className="api-icon" />
                      <div className="api-info">
                        <strong>{tipo.label}</strong>
                        {tipo.gratuita && <span className="badge-gratuita">Gratuita</span>}
                      </div>
                    </div>
                    <p>{tipo.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Configuración específica */}
        {renderConfiguracionEspecifica()}

        {/* Configuración General */}
        <div className="config-section">
          <div className="section-header">
            <Phone className="section-icon" />
            <h2>Configuración General</h2>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="numeroTelefono">Número de Teléfono *</label>
              <input
                type="tel"
                id="numeroTelefono"
                name="numeroTelefono"
                value={configuracion.numeroTelefono}
                onChange={handleInputChange}
                placeholder="+51987654321"
              />
              <small>Incluya el código de país (ej: +51 para Perú)</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="limiteDiario">Límite Diario de Envíos</label>
              <input
                type="number"
                id="limiteDiario"
                name="limiteDiario"
                value={configuracion.limiteDiario}
                onChange={handleInputChange}
                min="1"
                max="1000"
              />
              <small>Máximo número de mensajes por día</small>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="mensajePersonalizado">Mensaje Personalizado *</label>
            <textarea
              id="mensajePersonalizado"
              name="mensajePersonalizado"
              value={configuracion.mensajePersonalizado}
              onChange={handleInputChange}
              rows="4"
              placeholder="Mensaje que acompañará al comprobante..."
            />
            <small>Este mensaje se enviará junto con el comprobante PDF</small>
          </div>
          
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="incluirPdf"
                checked={configuracion.incluirPdf}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              Incluir PDF del comprobante
            </label>
          </div>
          
          <div className="checkbox-group">
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

export default ConfiguracionWhatsapp;