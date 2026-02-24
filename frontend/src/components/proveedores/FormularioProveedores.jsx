import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crearProveedor, actualizarProveedor, obtenerProveedorPorId } from '../../services/proveedorService';
import { consultarReniec, consultarSunat } from '../../services/consultaService';
import '../../styles/FormularioProveedores.css';

function FormularioProveedores() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

  console.log('🔄 Componente FormularioProveedores renderizado - ID:', id, 'esEdicion:', esEdicion);

  const [loading, setLoading] = useState(false);
  const [consultandoDocumento, setConsultandoDocumento] = useState(false);
  const [errorConsulta, setErrorConsulta] = useState('');

  const [formData, setFormData] = useState({
    tipoDocumento: 'RUC',
    numeroDocumento: '',
    nombre: '',
    nombreComercial: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto: '',
    diasCredito: '',
    codigoInterno: '',
    codigoBarras: '',
    nacionalidad: 'Perú',
    tipoProveedor: 'Vendedor',
    esAgentePercepcion: false,
    activo: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('🚀 useEffect ejecutado - ID:', id, 'esEdicion:', esEdicion);
    if (esEdicion) {
      console.log('📝 Modo edición detectado, cargando proveedor...');
      cargarProveedor();
    } else {
      console.log('➕ Modo creación detectado');
    }
  }, [id, esEdicion]);

  // useEffect para monitorear cambios en formData
  useEffect(() => {
    console.log('🔄 FormData actualizado:', formData);
  }, [formData]);

  const cargarProveedor = async () => {
    try {
      console.log('🔍 Iniciando carga de proveedor con ID:', id);
      setLoading(true);
      const response = await obtenerProveedorPorId(id);
      console.log('📦 Respuesta completa del backend:', response);
      
      // El backend devuelve { proveedor: {...} }
      const proveedor = response.proveedor;
      console.log('📦 Datos del proveedor extraídos:', proveedor);
      
      if (!proveedor) {
        throw new Error('No se encontraron datos del proveedor');
      }
      
      // Mapear solo los campos que existen en el backend
      const nuevosFormData = {
        tipoDocumento: proveedor.tipoDocumento || 'RUC',
        numeroDocumento: proveedor.numeroDocumento || '',
        nombre: proveedor.nombre || '',
        nombreComercial: '', // Campo no existe en backend, mantener vacío
        direccion: proveedor.direccion || '',
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
        contacto: proveedor.contacto || '',
        diasCredito: '', // Campo no existe en backend, mantener vacío
        codigoInterno: '', // Campo no existe en backend, mantener vacío
        codigoBarras: '', // Campo no existe en backend, mantener vacío
        nacionalidad: 'Perú', // Campo no existe en backend, valor por defecto
        tipoProveedor: 'Vendedor', // Campo no existe en backend, valor por defecto
        esAgentePercepcion: false, // Campo no existe en backend, valor por defecto
        activo: proveedor.estado !== undefined ? proveedor.estado : true // Usar 'estado' del backend
      };
      
      console.log('📝 Nuevos datos del formulario:', nuevosFormData);
      
      // Actualizar el estado del formulario
      setFormData(nuevosFormData);
      
      console.log('✅ FormData actualizado correctamente');
      
    } catch (error) {
      console.error('❌ Error al cargar proveedor:', error);
      alert('Error al cargar los datos del proveedor: ' + (error.message || 'Error desconocido'));
      navigate('/dashboard-superadmin');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      tipoDocumento: 'RUC',
      numeroDocumento: '',
      nombre: '',
      nombreComercial: '',
      direccion: '',
      telefono: '',
      email: '',
      contacto: '',
      diasCredito: '',
      codigoInterno: '',
      codigoBarras: '',
      nacionalidad: 'Perú',
      tipoProveedor: 'Vendedor',
      esAgentePercepcion: false,
      activo: true
    });
    setErrors({});
    setErrorConsulta('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Si cambia el tipo de documento, limpiar el número de documento y mensajes
    if (name === 'tipoDocumento') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        numeroDocumento: '' // Limpiar el número de documento
      }));
      setErrorConsulta(''); // Limpiar mensajes de consulta
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Consulta automática cuando se ingresa el número de documento
    if (name === 'numeroDocumento') {
      // Limpiar mensaje anterior
      setErrorConsulta('');
      
      // Consultar automáticamente cuando tenga la longitud correcta
      if ((formData.tipoDocumento === 'DNI' && value.length === 8) ||
          (formData.tipoDocumento === 'RUC' && value.length === 11)) {
        consultarDocumento(value);
      }
    }
  };

  const consultarDocumento = async (numeroDocumento) => {
    // Validar que el número de documento tenga la longitud correcta
    if (formData.tipoDocumento === 'DNI' && numeroDocumento.length !== 8) {
      return;
    }
    if (formData.tipoDocumento === 'RUC' && numeroDocumento.length !== 11) {
      return;
    }

    try {
      setConsultandoDocumento(true);
      setErrorConsulta('🔍 Consultando datos...');

      let resultado = null;

      if (formData.tipoDocumento === 'DNI') {
        resultado = await consultarReniec(numeroDocumento);
      } else if (formData.tipoDocumento === 'RUC') {
        resultado = await consultarSunat(numeroDocumento);
      }

      if (resultado && resultado.success && resultado.datos) {
        if (formData.tipoDocumento === 'DNI') {
          const nombreCompleto = `${resultado.datos.nombres || ''} ${resultado.datos.apellidoPaterno || ''} ${resultado.datos.apellidoMaterno || ''}`.trim();
          
          setFormData(prev => ({
            ...prev,
            nombre: nombreCompleto || prev.nombre,
            direccion: resultado.datos.direccion || prev.direccion
          }));
        } else if (formData.tipoDocumento === 'RUC') {
          setFormData(prev => ({
            ...prev,
            nombre: resultado.datos.razonSocial || resultado.datos.nombre || prev.nombre,
            nombreComercial: resultado.datos.nombreComercial || prev.nombreComercial,
            direccion: resultado.datos.direccion || prev.direccion
          }));
        }

        setErrorConsulta(`✅ Datos obtenidos de ${formData.tipoDocumento === 'DNI' ? 'RENIEC' : 'SUNAT'} exitosamente`);
        
        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => {
          setErrorConsulta('');
        }, 3000);
      } else {
        setErrorConsulta(`❌ No se encontraron datos para el ${formData.tipoDocumento} consultado`);
      }
    } catch (error) {
      console.error('Error al consultar documento:', error);
      setErrorConsulta(`❌ Error al consultar ${formData.tipoDocumento === 'DNI' ? 'RENIEC' : 'SUNAT'}: ${error.message}`);
    } finally {
      setConsultandoDocumento(false);
    }
  };

  const consultarManual = () => {
    if (!formData.numeroDocumento) {
      setErrorConsulta('❌ Debe ingresar un número de documento');
      return;
    }

    if (formData.tipoDocumento === 'DNI' && formData.numeroDocumento.length !== 8) {
      setErrorConsulta('❌ El DNI debe tener 8 dígitos');
      return;
    }

    if (formData.tipoDocumento === 'RUC' && formData.numeroDocumento.length !== 11) {
      setErrorConsulta('❌ El RUC debe tener 11 dígitos');
      return;
    }

    if (formData.tipoDocumento !== 'DNI' && formData.tipoDocumento !== 'RUC') {
      setErrorConsulta('❌ Solo se puede consultar DNI y RUC');
      return;
    }

    consultarDocumento(formData.numeroDocumento);
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.numeroDocumento) {
      newErrors.numeroDocumento = 'El número de documento es obligatorio';
    }

    if (!formData.nombre) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (formData.tipoDocumento === 'RUC' && formData.numeroDocumento.length !== 11) {
      newErrors.numeroDocumento = 'El RUC debe tener 11 dígitos';
    }

    if (formData.tipoDocumento === 'DNI' && formData.numeroDocumento.length !== 8) {
      newErrors.numeroDocumento = 'El DNI debe tener 8 dígitos';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);

      // Preparar datos del proveedor - solo campos que acepta el backend
      const datosProveedor = {
        nombre: formData.nombre,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        direccion: formData.direccion || null,
        telefono: formData.telefono || null,
        email: formData.email || null,
        contacto: formData.contacto || null
        // Campos como nombreComercial, diasCredito, codigoInterno, etc. no existen en el backend
      };

      if (esEdicion) {
        await actualizarProveedor(id, datosProveedor);
        alert('Proveedor actualizado exitosamente');
        navigate('/dashboard-superadmin');
      } else {
        await crearProveedor(datosProveedor);
        alert('Proveedor creado exitosamente');
        limpiarFormulario(); // Limpiar formulario después de crear
      }
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      alert('Error al guardar el proveedor: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Removemos el renderizado condicional que oculta completamente el formulario
  // para evitar problemas con la actualización del estado

  return (
    <div className="formulario-proveedores-container">
      <div >
        <h2>
          {esEdicion ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          {loading && esEdicion && <span style={{marginLeft: '10px', fontSize: '14px', color: '#666'}}>🔄 Cargando datos...</span>}
        </h2>
      
      </div>

      <form onSubmit={handleSubmit} className="formulario-proveedor">
        <div className="form-grid">
          {/* Tipo de Documento */}
          <div className="form-group">
            <label className="form-label">Tipo de Documento <span className="required">*</span></label>
            <select
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              className="form-input"
            >
              <option value="RUC">RUC</option>
              <option value="DNI">DNI</option>
              <option value="CE">Carnet de Extranjería</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
          </div>

          {/* Número de Documento */}
          <div className="form-group">
            <label className="form-label">
              Número de Documento <span className="required">*</span>
              {(formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'RUC') && (
                <span className="consulta-info"> (Se consulta automáticamente)</span>
              )}
            </label>
            <div className="input-with-button">
              <input
                type="text"
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleChange}
                className={`form-input ${errors.numeroDocumento ? 'error' : ''}`}
                placeholder={
                  formData.tipoDocumento === 'DNI' ? 'Ingrese 8 dígitos del DNI' :
                  formData.tipoDocumento === 'RUC' ? 'Ingrese 11 dígitos del RUC' :
                  'Ingrese el número de documento'
                }
                disabled={consultandoDocumento}
                {...(formData.tipoDocumento === 'DNI' ? { maxLength: 8 } : 
                    formData.tipoDocumento === 'RUC' ? { maxLength: 11 } : {})}
              />
              {(formData.tipoDocumento === 'DNI' || formData.tipoDocumento === 'RUC') && (
                <button
                  type="button"
                  onClick={consultarManual}
                  disabled={consultandoDocumento || !formData.numeroDocumento}
                  className="btn-consultar"
                  title={`Consultar ${formData.tipoDocumento === 'DNI' ? 'RENIEC' : 'SUNAT'}`}
                >
                  {consultandoDocumento ? (
                    <>
                      <span className="spinner">⟳</span> Consultando...
                    </>
                  ) : (
                    `Consultar ${formData.tipoDocumento === 'DNI' ? 'RENIEC' : 'SUNAT'}`
                  )}
                </button>
              )}
            </div>
            {errors.numeroDocumento && <span className="error-message">{errors.numeroDocumento}</span>}
            {errorConsulta && (
              <div className={`consulta-message ${
                errorConsulta.includes('✅') ? 'success' : 
                errorConsulta.includes('🔍') ? 'info' : 'error'
              }`}>
                {errorConsulta}
              </div>
            )}
          </div>

          {/* Nombre/Razón Social */}
          <div className="form-group">
            <label className="form-label">
              {formData.tipoDocumento === 'RUC' ? 'Razón Social' : 'Nombre Completo'} 
              <span className="required">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`form-input ${errors.nombre ? 'error' : ''}`}
              placeholder={formData.tipoDocumento === 'RUC' ? 'Razón social de la empresa' : 'Nombre completo'}
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          {/* Nombre Comercial */}
          <div className="form-group">
            <label className="form-label">Nombre Comercial</label>
            <input
              type="text"
              name="nombreComercial"
              value={formData.nombreComercial}
              onChange={handleChange}
              className="form-input"
              placeholder="Nombre comercial (opcional)"
            />
          </div>

          {/* Dirección */}
          <div className="form-group ">
            <label className="form-label">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="form-input"
              placeholder="Dirección completa"
            />
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="form-input"
              placeholder="Número de teléfono"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Correo electrónico"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

      

          {/* Código Interno */}
          <div className="form-group">
            <label className="form-label">Código Interno</label>
            <input
              type="text"
              name="codigoInterno"
              value={formData.codigoInterno}
              onChange={handleChange}
              className="form-input"
              placeholder="Código interno"
            />
          </div>

          {/* Código de Barras */}
          <div className="form-group">
            <label className="form-label">Código de Barras</label>
            <input
              type="text"
              name="codigoBarras"
              value={formData.codigoBarras}
              onChange={handleChange}
              className="form-input"
              placeholder="Código de barras"
            />
          </div>

          {/* Nacionalidad */}
          <div className="form-group">
            <label className="form-label">Nacionalidad</label>
            <select
              name="nacionalidad"
              value={formData.nacionalidad}
              onChange={handleChange}
              className="form-input"
            >
              <option value="Perú">Perú</option>
              <option value="Argentina">Argentina</option>
              <option value="Bolivia">Bolivia</option>
              <option value="Brasil">Brasil</option>
              <option value="Chile">Chile</option>
              <option value="Colombia">Colombia</option>
              <option value="Ecuador">Ecuador</option>
              <option value="Paraguay">Paraguay</option>
              <option value="Uruguay">Uruguay</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Tipo de Proveedor */}
          <div className="form-group">
            <label className="form-label">Tipo de Proveedor</label>
            <select
              name="tipoProveedor"
              value={formData.tipoProveedor}
              onChange={handleChange}
              className="form-input"
            >
              <option value="Vendedor">Vendedor</option>
              <option value="Distribuidor">Distribuidor</option>
              <option value="Fabricante">Fabricante</option>
              <option value="Importador">Importador</option>
              <option value="Mayorista">Mayorista</option>
              <option value="Minorista">Minorista</option>
            </select>
          </div>

         

         
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard-superadmin')}
            className="btn-cancelar"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-guardar"
          >
            {loading ? 'Guardando...' : (esEdicion ? 'Actualizar Proveedor' : 'Crear Proveedor')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioProveedores;