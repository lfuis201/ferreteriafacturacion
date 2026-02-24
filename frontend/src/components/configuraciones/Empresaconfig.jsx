import React, { useEffect, useState } from 'react';
import '../../styles/EmpresaConfig.css';
import { obtenerValorConfiguracion, guardarConfiguracion } from '../../services/configuracionService';
import ConfiguracionSunatService from '../../services/configuracionSunatService';
import ConfiguracionSunat from './ConfiguracionSunat';

const EmpresaConfig = () => {
  const [formData, setFormData] = useState({
    // Sección: Datos Básicos
    nombre: '',
    numero: '',
    nombreComercial: '',
    idEmpresa: '',
    
   
    
    // Sección: Entorno del Sistema
    entornoSistema: '',
    soapTipo: 'Domo',
    enviarDocumentoPSE: false,
    url: '',
    token: '',
    certificado: '',
    firmaDigitalPSE: '',
    enviarDocumentoServicioExterno: false,
    
    // Sección: Guías Electrónicas
    usuarioSecundarioSunat: '',
    soapUsuario: '',
    rucUsuario: '',
    clientId: '',
    soapPassword: '',
    clientSecret: '',
    
    // Sección: Correo
    correoRecepcion: '',
    correoElectronico: '',
    contrasenaAplicaciones: '',
    direccionCorreo: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sunatTest, setSunatTest] = useState(null);

  // Mapeo de campos del formulario a claves reales del backend
  const FIELD_MAP = {
    // Empresa - básicos
    nombre:                 { clave: 'EMPRESA_NOMBRE', tipo: 'STRING', categoria: 'EMPRESA' },
    numero:                 { clave: 'EMPRESA_NUMERO', tipo: 'STRING', categoria: 'EMPRESA' },
    nombreComercial:        { clave: 'EMPRESA_NOMBRE_COMERCIAL', tipo: 'STRING', categoria: 'EMPRESA' },
    idEmpresa:              { clave: 'EMPRESA_ID', tipo: 'STRING', categoria: 'EMPRESA' },

    // Empresa - logos/imágenes
    logo:                   { clave: 'EMPRESA_LOGO_URL', tipo: 'STRING', categoria: 'EMPRESA' },
    rusticaFirma:           { clave: 'EMPRESA_RUSTICA_FIRMA', tipo: 'STRING', categoria: 'EMPRESA' },
    fecha:                  { clave: 'EMPRESA_FECHA', tipo: 'STRING', categoria: 'EMPRESA' },
    logoPagina:             { clave: 'EMPRESA_LOGO_PAGINA_URL', tipo: 'STRING', categoria: 'EMPRESA' },

    // Entorno del sistema / SUNAT
    entornoSistema:         { clave: 'EMPRESA_ENTORNO_SISTEMA', tipo: 'STRING', categoria: 'EMPRESA' },
    soapTipo:               { clave: 'SUNAT_SOAP_TIPO', tipo: 'STRING', categoria: 'SUNAT' },
    enviarDocumentoPSE:     { clave: 'SUNAT_ENVIAR_DOCUMENTO_PSE', tipo: 'BOOLEAN', categoria: 'SUNAT' },
    url:                    { clave: 'SUNAT_URL', tipo: 'STRING', categoria: 'SUNAT' },
    token:                  { clave: 'SUNAT_TOKEN', tipo: 'STRING', categoria: 'SUNAT' },
    certificado:            { clave: 'SUNAT_CERTIFICADO', tipo: 'STRING', categoria: 'SUNAT' },
    firmaDigitalPSE:        { clave: 'SUNAT_FIRMA_DIGITAL_PSE', tipo: 'STRING', categoria: 'SUNAT' },
    enviarDocumentoServicioExterno: { clave: 'SUNAT_ENVIAR_DOCUMENTO_SERVICIO_EXTERNO', tipo: 'BOOLEAN', categoria: 'SUNAT' },

    // Guías electrónicas / credenciales
    usuarioSecundarioSunat: { clave: 'SUNAT_USUARIO_SECUNDARIO', tipo: 'STRING', categoria: 'SUNAT' },
    soapUsuario:            { clave: 'SUNAT_SOAP_USUARIO', tipo: 'STRING', categoria: 'SUNAT' },
    rucUsuario:             { clave: 'SUNAT_RUC_USUARIO', tipo: 'STRING', categoria: 'SUNAT' },
    clientId:               { clave: 'SUNAT_CLIENT_ID', tipo: 'STRING', categoria: 'SUNAT' },
    soapPassword:           { clave: 'SUNAT_SOAP_PASSWORD', tipo: 'STRING', categoria: 'SUNAT' },
    clientSecret:           { clave: 'SUNAT_CLIENT_SECRET', tipo: 'STRING', categoria: 'SUNAT' },

    // Correo
    correoRecepcion:        { clave: 'EMPRESA_CORREO_RECEPCION', tipo: 'STRING', categoria: 'EMPRESA' },
    correoElectronico:      { clave: 'EMPRESA_CORREO_ELECTRONICO', tipo: 'STRING', categoria: 'EMPRESA' },
    contrasenaAplicaciones: { clave: 'EMPRESA_CONTRASENA_APLICACIONES', tipo: 'STRING', categoria: 'EMPRESA' },
    direccionCorreo:        { clave: 'EMPRESA_DIRECCION_CORREO', tipo: 'STRING', categoria: 'EMPRESA' },
  };

  const parseByType = (valor, tipo) => {
    if (tipo === 'NUMBER') return Number(valor ?? 0);
    if (tipo === 'BOOLEAN') return valor === true || valor === 'true';
    return valor ?? '';
  };

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const nuevos = { ...formData };
      for (const [field, meta] of Object.entries(FIELD_MAP)) {
        try {
          const valor = await obtenerValorConfiguracion(meta.clave);
          nuevos[field] = parseByType(valor, meta.tipo);
        } catch (e) {
          // Si no existe, mantener valor por defecto
          nuevos[field] = formData[field];
        }
      }
      setFormData(nuevos);
    } catch (e) {
      setError(e.message || 'Error al cargar configuración de empresa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSunatTest(null);
    try {
      await Promise.all(
        Object.entries(FIELD_MAP).map(async ([field, meta]) => {
          const payload = {
            clave: meta.clave,
            valor: meta.tipo === 'NUMBER' ? Number(formData[field])
                 : meta.tipo === 'BOOLEAN' ? !!formData[field]
                 : String(formData[field] ?? ''),
            tipo: meta.tipo,
            descripcion: '',
            categoria: meta.categoria,
          };
          return guardarConfiguracion(payload);
        })
      );
      alert('Configuración guardada exitosamente');
    } catch (e) {
      setError(e.message || 'Error al guardar configuración de empresa');
    } finally {
      setLoading(false);
    }
  };

  const probarConexionSunat = async () => {
    setLoading(true);
    setError('');
    setSunatTest(null);
    try {
      const sucursalId = Number(localStorage.getItem('sucursalId')) || 1;
      const resultado = await ConfiguracionSunatService.probarConexion(sucursalId);
      setSunatTest({ success: resultado.success, mensaje: resultado.mensaje || resultado.message, detalle: resultado });
    } catch (e) {
      setSunatTest({ success: false, mensaje: e.message || 'Error al probar conexión con SUNAT' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (fieldName) => {
    // Simulación de selección de archivo
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.png,.jpg,.jpeg';
    fileInput.onchange = (e) => {
      if (e.target.files.length > 0) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: e.target.files[0].name
        }));
      }
    };
    fileInput.click();
  };

  return (
    <div className="empresa-config">
      <div className="empresa-config__header">
        <div className="empresa-config__breadcrumb">
          <span className="empresa-config__breadcrumb-icon">🏠</span>
          <span className="empresa-config__breadcrumb-text">CONTROLADOCOM</span>
          <span className="empresa-config__breadcrumb-separator">/</span>
          <span className="empresa-config__breadcrumb-current">EMPRESA</span>
        </div>
      </div>

      <div className="empresa-config__content">
        <div className="empresa-config__title-section">
          <h2 className="empresa-config__title">Datos de la Empresa</h2>
        </div>

        {error && (<div style={{ color: 'red' }}>{error}</div>)}
        {loading && (<div>Cargando...</div>)}

        <form onSubmit={handleSubmit} className="empresa-config__form">
          {/* Sección 1: Datos Básicos */}
          <div className="empresa-config__section">
            <h3 className="empresa-config__subtitle">Datos Básicos</h3>
            
            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="260/321/320"
                />
              </div>

              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Número <span className="empresa-config__required">*</span>
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="5"
                />
              </div>
            </div>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Nombre comercial <span className="empresa-config__required">*</span>
                </label>
                <input
                  type="text"
                  name="nombreComercial"
                  value={formData.nombreComercial}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="Avaluación NTC"
                />
              </div>

              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  ID
                </label>
                <input
                  type="text"
                  name="idEmpresa"
                  value={formData.idEmpresa}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="ID de la empresa"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Logos e Imágenes
          <div className="empresa-config__section">
            <h3 className="empresa-config__subtitle">Logos e Imágenes</h3>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Logo
                </label>
                <div className="empresa-config__file-group">
                  <button 
                    type="button" 
                    className="empresa-config__btn-select"
                    onClick={() => handleFileSelect('logo')}
                  >
                    Seleccionar
                  </button>
                  <span className="empresa-config__file-text">
                    {formData.logo || 'Logo_2642312520.png'}
                  </span>
                </div>
                <div className="empresa-config__help-text">
                  Se recomienda mantenerse 760.000 con todos los páginos
                </div>
              </div>
            </div>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Rústica (Firma digital)
                </label>
                <div className="empresa-config__file-group">
                  <button 
                    type="button" 
                    className="empresa-config__btn-select"
                    onClick={() => handleFileSelect('rusticaFirma')}
                  >
                    Seleccionar
                  </button>
                </div>
                <div className="empresa-config__help-text">
                  Se recomienda mantenerse 760.000
                </div>
              </div>
            </div>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Fecha
                </label>
                <input
                  type="text"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="Configuración de fecha"
                />
                <div className="empresa-config__help-text">
                  Se recomienda una imagen con todas las palabras y cuantas se forman IPXG
                </div>
              </div>
            </div>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Logo p/a de página
                </label>
                <div className="empresa-config__file-group">
                  <button 
                    type="button" 
                    className="empresa-config__btn-select"
                    onClick={() => handleFileSelect('logoPagina')}
                  >
                    Seleccionar
                  </button>
                </div>
                <div className="empresa-config__help-text">
                  Se recomienda color blanco
                </div>
              </div>
            </div>
          </div> */}

          {/* Sección 3: Entorno del Sistema */}
          <div className="empresa-config__section">
            <h3 className="empresa-config__subtitle">Entorno del sistema</h3>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Entorno del sistema
                </label>
                <input
                  type="text"
                  name="entornoSistema"
                  value={formData.entornoSistema}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="Configuración del entorno"
                />
              </div>

              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  SOAP Tipo
                </label>
                <select
                  name="soapTipo"
                  value={formData.soapTipo}
                  onChange={handleChange}
                  className="empresa-config__select"
                >
                  <option value="Demo">Demo</option>
                  <option value="Produccion">Producción</option>
                  <option value="Desarrollo">Desarrollo</option>
                </select>
              </div>
            </div>

            <div className="empresa-config__checkbox-group">
              <input
                type="checkbox"
                name="enviarDocumentoPSE"
                checked={formData.enviarDocumentoPSE}
                onChange={handleChange}
                className="empresa-config__checkbox"
                id="enviarPSE"
              />
              <label htmlFor="enviarPSE" className="empresa-config__checkbox-label">
                Enviar documento PSE - Enviar a servicio web externo
              </label>
            </div>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  URL
                </label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="URL del servicio"
                />
              </div>

              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Token
                </label>
                <input
                  type="text"
                  name="token"
                  value={formData.token}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="Token de autenticación"
                />
              </div>
            </div>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Certificado
                </label>
                <input
                  type="text"
                  name="certificado"
                  value={formData.certificado}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="Certificado digital"
                />
              </div>

              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Firma digital PSE
                </label>
                <input
                  type="text"
                  name="firmaDigitalPSE"
                  value={formData.firmaDigitalPSE}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="Firma digital PSE"
                />
              </div>
            </div>

            <div className="empresa-config__checkbox-group">
              <input
                type="checkbox"
                name="enviarDocumentoServicioExterno"
                checked={formData.enviarDocumentoServicioExterno}
                onChange={handleChange}
                className="empresa-config__checkbox"
                id="enviarExterno"
              />
              <label htmlFor="enviarExterno" className="empresa-config__checkbox-label">
                Enviar documento a servicio externo
              </label>
            </div>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <button type="button" onClick={probarConexionSunat} className="empresa-config__btn-submit">
                  Probar conexión SUNAT
                </button>
              </div>
              {sunatTest && (
                <div className="empresa-config__field">
                  <div className="empresa-config__help-text" style={{ color: sunatTest.success ? 'green' : 'red' }}>
                    {sunatTest.mensaje}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sección 4: Guías Electrónicas */}
          <div className="empresa-config__section">
            <h3 className="empresa-config__subtitle">Guías electrónicas</h3>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Usuario Secundario Sunat
                </label>
                <input
                  type="text"
                  name="usuarioSecundarioSunat"
                  value={formData.usuarioSecundarioSunat}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="Usuario secundario"
                />
              </div>

              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  SOAP Usuario
                </label>
                <input
                  type="text"
                  name="soapUsuario"
                  value={formData.soapUsuario}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="Usuario SOAP"
                />
              </div>
            </div>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  RUC + Usuario
                </label>
                <input
                  type="text"
                  name="rucUsuario"
                  value={formData.rucUsuario}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="Ejemplo: 01234567890ELUSUARIO"
                />
              </div>

              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Client ID
                </label>
                <input
                  type="text"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="ID del cliente"
                />
              </div>
            </div>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  SOAP Password
                </label>
                <input
                  type="password"
                  name="soapPassword"
                  value={formData.soapPassword}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="Contraseña SOAP"
                />
              </div>

              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Client Secret (Clave)
                </label>
                <input
                  type="password"
                  name="clientSecret"
                  value={formData.clientSecret}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="Clave secreta del cliente"
                />
              </div>
            </div>
          </div>

          {/* Sección 5: Correo */}
          <div className="empresa-config__section">
            <h3 className="empresa-config__subtitle">Correo de recepción</h3>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="correoElectronico"
                  value={formData.correoElectronico}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="correo@empresa.com"
                />
              </div>

              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Contraseña de aplicaciones
                </label>
                <input
                  type="password"
                  name="contrasenaAplicaciones"
                  value={formData.contrasenaAplicaciones}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="Contraseña de aplicaciones"
                />
              </div>
            </div>

            <div className="empresa-config__row">
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Dirección de correo
                </label>
                <input
                  type="text"
                  name="direccionCorreo"
                  value={formData.direccionCorreo}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="Dirección completa"
                />
              </div>
              
              <div className="empresa-config__field">
                <label className="empresa-config__label">
                  Correo de recepción
                </label>
                <input
                  type="email"
                  name="correoRecepcion"
                  value={formData.correoRecepcion}
                  onChange={handleChange}
                  className="empresa-config__input"
                  placeholder="correo@recepcion.com"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="empresa-config__actions">
            <button type="submit" className="empresa-config__btn-submit">
              Guardar
            </button>
            <button type="button" className="empresa-config__btn-cancel">
              Cancelar
            </button>
          </div>
        </form>
        {/* Integración: Configuración SUNAT dentro de Empresa */}
        <div style={{ marginTop: '24px' }}>
          <h3 className="empresa-config__subtitle">Configuración SUNAT</h3>
          <ConfiguracionSunat />
        </div>
      </div>
    </div>
  );
};

export default EmpresaConfig;