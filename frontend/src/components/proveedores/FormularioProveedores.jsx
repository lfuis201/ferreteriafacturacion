import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crearProveedor, actualizarProveedor, obtenerProveedorPorId } from '../../services/proveedorService';
import { consultarReniec, consultarSunat } from '../../services/consultaService';
import {
  ArrowLeft,
  Save,
  Building2,
  Fingerprint,
  Hash,
  User,
  MapPin,
  Globe,
  PhoneCall,
  Mail,
  Info,
  Layout,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { bg, text, border, themeClasses } from '../../theme';

function FormularioProveedores() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

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
    if (esEdicion) {
      cargarProveedor();
    }
  }, [id, esEdicion]);

  const cargarProveedor = async () => {
    try {
      setLoading(true);
      const response = await obtenerProveedorPorId(id);
      const proveedor = response.proveedor;

      if (!proveedor) throw new Error('No se encontraron datos del proveedor');

      setFormData({
        tipoDocumento: proveedor.tipoDocumento || 'RUC',
        numeroDocumento: proveedor.numeroDocumento || '',
        nombre: proveedor.nombre || '',
        nombreComercial: '',
        direccion: proveedor.direccion || '',
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
        contacto: proveedor.contacto || '',
        diasCredito: '',
        codigoInterno: '',
        codigoBarras: '',
        nacionalidad: 'Perú',
        tipoProveedor: 'Vendedor',
        esAgentePercepcion: false,
        activo: proveedor.estado !== undefined ? proveedor.estado : true
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
      navigate('/dashboard-superadmin');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'tipoDocumento') {
      setFormData(prev => ({ ...prev, [name]: value, numeroDocumento: '' }));
      setErrorConsulta('');
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'numeroDocumento') {
      setErrorConsulta('');
      if ((formData.tipoDocumento === 'DNI' && value.length === 8) ||
        (formData.tipoDocumento === 'RUC' && value.length === 11)) {
        consultarDocumento(value);
      }
    }
  };

  const consultarDocumento = async (numeroDocumento) => {
    if (formData.tipoDocumento === 'DNI' && numeroDocumento.length !== 8) return;
    if (formData.tipoDocumento === 'RUC' && numeroDocumento.length !== 11) return;

    try {
      setConsultandoDocumento(true);
      setErrorConsulta('Consultando entidades...');

      let resultado = null;
      if (formData.tipoDocumento === 'DNI') resultado = await consultarReniec(numeroDocumento);
      else if (formData.tipoDocumento === 'RUC') resultado = await consultarSunat(numeroDocumento);

      if (resultado && resultado.success && resultado.datos) {
        if (formData.tipoDocumento === 'DNI') {
          const nombreCompleto = `${resultado.datos.nombres || ''} ${resultado.datos.apellidoPaterno || ''} ${resultado.datos.apellidoMaterno || ''}`.trim();
          setFormData(prev => ({ ...prev, nombre: nombreCompleto || prev.nombre, direccion: resultado.datos.direccion || prev.direccion }));
        } else if (formData.tipoDocumento === 'RUC') {
          setFormData(prev => ({
            ...prev,
            nombre: resultado.datos.razonSocial || resultado.datos.nombre || prev.nombre,
            nombreComercial: resultado.datos.nombreComercial || prev.nombreComercial,
            direccion: resultado.datos.direccion || prev.direccion
          }));
        }
        setErrorConsulta('✅ Identidad validada correctamente');
        setTimeout(() => setErrorConsulta(''), 3000);
      } else {
        setErrorConsulta('❌ No se hallaron registros oficiales');
      }
    } catch (error) {
      setErrorConsulta('❌ Error en el servicio de consulta');
    } finally {
      setConsultandoDocumento(false);
    }
  };

  const validarFormulario = () => {
    const newErrors = {};
    if (!formData.numeroDocumento) newErrors.numeroDocumento = 'Requerido';
    if (!formData.nombre) newErrors.nombre = 'Requerido';
    if (formData.tipoDocumento === 'RUC' && formData.numeroDocumento.length !== 11) newErrors.numeroDocumento = 'Debe tener 11 dígitos';
    if (formData.tipoDocumento === 'DNI' && formData.numeroDocumento.length !== 8) newErrors.numeroDocumento = 'Debe tener 8 dígitos';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      const datosProveedor = {
        nombre: formData.nombre,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        direccion: formData.direccion || null,
        telefono: formData.telefono || null,
        email: formData.email || null,
        contacto: formData.contacto || null
      };

      if (esEdicion) {
        await actualizarProveedor(id, datosProveedor);
        Swal.fire('¡Actualizado!', 'Proveedor modificado correctamente', 'success');
        navigate('/dashboard-superadmin');
      } else {
        await crearProveedor(datosProveedor);
        Swal.fire('¡Éxito!', 'Nuevo proveedor registrado', 'success');
        navigate('/dashboard-superadmin');
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la información', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header con breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard-superadmin')}
              className={`${themeClasses.btnPrimary} px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:shadow-md focus:outline-none focus:ring-2`}
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">🏠</span>
              <span className={text.mentaPetroleo}>PROVEEDORES</span>
              <span className="text-gray-400">/</span>
              <span className={`${text.mentaTurquesa} font-semibold`}>
                {esEdicion ? 'ACTUALIZAR' : 'REGISTRAR'} PROVEEDOR
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`${themeClasses.btnPrimary} px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md focus:outline-none focus:ring-2`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                {esEdicion ? 'Actualizar' : 'Registrar'}
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Principal - Información Esencial */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card: Identificación */}
            <div className={`${themeClasses.cardMenta} p-6`}>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-menta-medio">
                <div className={`${bg.mentaSuave} p-2.5 rounded-lg`}>
                  <Building2 size={22} className={text.mentaPetroleo} />
                </div>
                <h3 className={`text-lg font-semibold ${text.mentaPetroleo}`}>
                  Identificación y Razón Social
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={`block text-sm font-medium ${text.mentaMarino} mb-2 flex items-center gap-2`}>
                    <Fingerprint size={14} />
                    Tipo de Documento
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${border.mentaMedio} rounded-lg focus:outline-none focus:ring-2 focus:ring-menta-turquesa transition-all bg-white`}
                  >
                    <option value="RUC">RUC</option>
                    <option value="DNI">DNI</option>
                    <option value="CE">CE</option>
                    <option value="PASAPORTE">PASAPORTE</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${text.mentaMarino} mb-2 flex items-center gap-2`}>
                    <Hash size={14} />
                    Número de Identidad
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="numeroDocumento"
                      value={formData.numeroDocumento}
                      onChange={handleChange}
                      disabled={consultandoDocumento}
                      className={`w-full px-4 py-3 border ${
                        errors.numeroDocumento ? 'border-red-300 bg-red-50' : border.mentaMedio
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-menta-turquesa transition-all ${
                        consultandoDocumento ? 'bg-gray-100' : 'bg-white'
                      }`}
                      placeholder="Ingrese el número..."
                      {...(formData.tipoDocumento === 'DNI' ? { maxLength: 8 } : formData.tipoDocumento === 'RUC' ? { maxLength: 11 } : {})}
                    />
                    {consultandoDocumento && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 size={18} className={`${text.mentaTurquesa} animate-spin`} />
                      </div>
                    )}
                  </div>
                  {errors.numeroDocumento && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <XCircle size={12} />
                      {errors.numeroDocumento}
                    </p>
                  )}
                  {errorConsulta && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${
                      errorConsulta.includes('✅') ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {errorConsulta.includes('✅') && <CheckCircle size={12} />}
                      {errorConsulta}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${text.mentaMarino} mb-2 flex items-center gap-2`}>
                    <User size={14} />
                    {formData.tipoDocumento === 'RUC' ? 'Razón Social' : 'Nombre Completo'}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${
                      errors.nombre ? 'border-red-300 bg-red-50' : border.mentaMedio
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-menta-turquesa transition-all uppercase`}
                    placeholder="Ingrese nombre o razón social..."
                  />
                  {errors.nombre && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <XCircle size={12} />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium ${text.mentaMarino} mb-2`}>
                      Nombre Comercial
                    </label>
                    <input
                      type="text"
                      name="nombreComercial"
                      value={formData.nombreComercial}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${border.mentaMedio} rounded-lg focus:outline-none focus:ring-2 focus:ring-menta-turquesa transition-all`}
                      placeholder="Nombre fantasía..."
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${text.mentaMarino} mb-2`}>
                      Persona de Contacto
                    </label>
                    <input
                      type="text"
                      name="contacto"
                      value={formData.contacto}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${border.mentaMedio} rounded-lg focus:outline-none focus:ring-2 focus:ring-menta-turquesa transition-all`}
                      placeholder="Nombre del contacto..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Ubicación */}
            <div className={`${themeClasses.cardMenta} p-6`}>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-menta-medio">
                <div className={`${bg.mentaMedio} p-2.5 rounded-lg`}>
                  <MapPin size={22} className="text-white" />
                </div>
                <h3 className={`text-lg font-semibold ${text.mentaPetroleo}`}>
                  Ubicación y Contacto
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${text.mentaMarino} mb-2`}>
                    Dirección Fiscal / Principal
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${border.mentaMedio} rounded-lg focus:outline-none focus:ring-2 focus:ring-menta-turquesa transition-all`}
                    placeholder="Av. Ejemplo 123, Ciudad..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium ${text.mentaMarino} mb-2 flex items-center gap-2`}>
                      <Globe size={14} />
                      País de Origen
                    </label>
                    <select
                      name="nacionalidad"
                      value={formData.nacionalidad}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${border.mentaMedio} rounded-lg focus:outline-none focus:ring-2 focus:ring-menta-turquesa transition-all bg-white`}
                    >
                      <option value="Perú">Perú</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Chile">Chile</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${text.mentaMarino} mb-2 flex items-center gap-2`}>
                      <PhoneCall size={14} />
                      Teléfono
                    </label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${border.mentaMedio} rounded-lg focus:outline-none focus:ring-2 focus:ring-menta-turquesa transition-all`}
                      placeholder="999 999 999"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Lateral - Configuración */}
          <div className="space-y-6">
            
            {/* Card: Configuración */}
            <div className={`${bg.mentaPetroleo} rounded-xl p-6 text-white shadow-lg`}>
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                <Info size={18} className={text.mentaClaro} />
                <h4 className={`text-sm font-semibold ${text.mentaClaro} uppercase tracking-wide`}>
                  Configuración
                </h4>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-menta-claro/70 mb-2 flex items-center gap-2">
                    <Mail size={12} />
                    Email Corporativo
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg bg-white/10 border ${
                      errors.email ? 'border-red-400' : 'border-white/20'
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-menta-claro transition-all`}
                    placeholder="correo@empresa.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-300 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-menta-claro/70 mb-2">
                    Categoría Operativa
                  </label>
                  <select
                    name="tipoProveedor"
                    value={formData.tipoProveedor}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-menta-claro transition-all"
                  >
                    <option value="Vendedor" className="bg-menta-petroleo">Vendedor</option>
                    <option value="Distribuidor" className="bg-menta-petroleo">Distribuidor</option>
                    <option value="Fabricante" className="bg-menta-petroleo">Fabricante</option>
                    <option value="Importador" className="bg-menta-petroleo">Importador</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <span className="block text-xs font-semibold text-menta-claro">Estado Activo</span>
                      <span className="text-[10px] text-menta-claro/50">Habilitar en transacciones</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <span className="block text-xs font-semibold text-menta-claro">Agente Percepción</span>
                      <span className="text-[10px] text-menta-claro/50">Regímenes tributarios</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.esAgentePercepcion}
                        onChange={(e) => setFormData({ ...formData, esAgentePercepcion: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-menta-turquesa"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Códigos */}
            <div className={`${themeClasses.cardMenta} p-6`}>
              <div className="flex items-center gap-2 mb-4">
                <Layout size={16} className={text.mentaPetroleo} />
                <h5 className={`text-sm font-semibold ${text.mentaPetroleo}`}>
                  Gestión de Códigos
                </h5>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  name="codigoInterno"
                  value={formData.codigoInterno}
                  onChange={handleChange}
                  placeholder="Código Interno..."
                  className={`w-full px-4 py-2.5 border ${border.mentaMedio} rounded-lg focus:outline-none focus:ring-2 focus:ring-menta-turquesa transition-all font-mono text-sm`}
                />
                <input
                  type="text"
                  name="codigoBarras"
                  value={formData.codigoBarras}
                  onChange={handleChange}
                  placeholder="Código de Barras..."
                  className={`w-full px-4 py-2.5 border ${border.mentaMedio} rounded-lg focus:outline-none focus:ring-2 focus:ring-menta-turquesa transition-all font-mono text-sm`}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormularioProveedores;
