import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crearProveedor, actualizarProveedor, obtenerProveedorPorId } from '../../services/proveedorService';
import { consultarReniec, consultarSunat } from '../../services/consultaService';
import {
  Plus,
  Trash2,
  Search,
  UserPlus,
  Filter,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Edit3,
  Users,
  Activity,
  XCircle,
  Building2,
  Fingerprint,
  PhoneCall,
  Layout,
  TrendingUp,
  Briefcase,
  ChevronLeft,
  ArrowLeft,
  Save,
  User,
  Info,
  ExternalLink,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Hash
} from 'lucide-react';
import Swal from 'sweetalert2';

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
    <div className="flex flex-col space-y-8 p-4 md:p-8 bg-slate-50/50 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate('/dashboard-superadmin')} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm active:scale-90">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">
              {esEdicion ? 'Actualizar' : 'Registrar'} <span className="text-indigo-600">Proveedor</span>
            </h2>
            <div className="mt-2 flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <ClipboardCheck size={14} className="text-indigo-400" /> Expediente administrativo de la entidad
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard-superadmin')} className="px-6 h-12 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-3 px-10 h-14 rounded-2xl bg-[#0f172a] text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95">
            {loading ? 'Sincronizando...' : <><Save size={18} /> {esEdicion ? 'Guardar Cambios' : 'Confirmar Registro'}</>}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Essential Info */}
        <div className="lg:col-span-8 space-y-8">
          <div className="rounded-[3rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-500"><Building2 size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Identificación y Razón Social</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  <Fingerprint size={12} /> Tipo de Documento <span className="text-rose-500">*</span>
                </label>
                <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-6 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer">
                  <option value="RUC">RUC</option>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="PASAPORTE">PASAPORTE</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  <Hash size={12} /> Número de Identidad <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={handleChange}
                    disabled={consultandoDocumento}
                    className={`w-full h-14 rounded-2xl border ${errors.numeroDocumento ? 'border-rose-200 bg-rose-50/10' : 'border-slate-100 bg-slate-50/50'} px-6 text-sm font-black text-slate-800 outline-none focus:border-indigo-500 transition-all`}
                    placeholder="..."
                    {...(formData.tipoDocumento === 'DNI' ? { maxLength: 8 } : formData.tipoDocumento === 'RUC' ? { maxLength: 11 } : {})}
                  />
                  {consultandoDocumento && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm border border-slate-100 text-[8px] font-black uppercase text-indigo-500">
                      <RefreshCw size={10} className="animate-spin" /> Buscando...
                    </div>
                  )}
                </div>
                {errors.numeroDocumento && <p className="text-[10px] font-bold text-rose-500 px-1">{errors.numeroDocumento}</p>}
                {errorConsulta && (
                  <p className={`text-[10px] font-bold px-1 ${errorConsulta.includes('✅') ? 'text-emerald-500' : 'text-slate-400 italic'}`}>{errorConsulta}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  <User size={12} /> {formData.tipoDocumento === 'RUC' ? 'Razón Social Oficial' : 'Nombre Completo del Titular'} <span className="text-rose-500">*</span>
                </label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className={`w-full h-14 rounded-2xl border ${errors.nombre ? 'border-rose-200 bg-rose-50/10' : 'border-slate-100 bg-slate-50/50'} px-6 text-sm font-black text-slate-800 outline-none focus:border-indigo-500 transition-all uppercase`} placeholder="Ingrese nombre o razón social..." />
                {errors.nombre && <p className="text-[10px] font-bold text-rose-500 px-1">{errors.nombre}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nombre Comercial (Fantasía)</label>
                  <input type="text" name="nombreComercial" value={formData.nombreComercial} onChange={handleChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-6 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Persona de Contacto</label>
                  <input type="text" name="contacto" value={formData.contacto} onChange={handleChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-6 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[3rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-500"><MapPin size={20} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Ubicación y Logística</h3>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Dirección Fiscal / Principal</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-6 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" placeholder="Av. Ejemplo 123, Ciudad..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1"><Globe size={12} /> País de Origen</label>
                  <select name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-6 text-sm font-bold text-slate-700 outline-none">
                    <option value="Perú">Perú</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1"><PhoneCall size={12} /> Central Telefónica</label>
                  <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-6 text-sm font-bold text-slate-700 outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Meta Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 border-b border-white/5 pb-4 flex items-center gap-2">
              <Info size={14} /> Atributos de Negocio
            </h4>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full h-12 rounded-xl bg-white/5 border ${errors.email ? 'border-rose-500' : 'border-white/10'} pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-indigo-500`} />
                </div>
                {errors.email && <p className="text-[9px] font-bold text-rose-400">{errors.email}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Categoría Operativa</label>
                <select name="tipoProveedor" value={formData.tipoProveedor} onChange={handleChange} className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm font-bold text-white outline-none focus:border-indigo-500 appearance-none">
                  <option value="Vendedor">Comercializador / Vendedor</option>
                  <option value="Distribuidor">Distribuidor Master</option>
                  <option value="Fabricante">Fabricante Directo</option>
                  <option value="Importador">Importador / Aduanas</option>
                </select>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Estado Activo</span>
                    <span className="text-[8px] font-bold text-white/40 uppercase">Habilitar en transacciones</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.activo} onChange={e => setFormData({ ...formData, activo: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Agente Percepción</span>
                    <span className="text-[8px] font-bold text-white/40 uppercase">Regímenes tributarios</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.esAgentePercepcion} onChange={e => setFormData({ ...formData, esAgentePercepcion: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[3rem] border border-slate-200 bg-white p-8 space-y-4">
            <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Layout size={12} /> Gestión de Códigos
            </h5>
            <div className="space-y-2">
              <input type="text" name="codigoInterno" value={formData.codigoInterno} onChange={handleChange} placeholder="Código Interno..." className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50/50 px-4 text-xs font-bold text-slate-600 outline-none focus:border-indigo-500 transition-all font-mono" />
              <input type="text" name="codigoBarras" value={formData.codigoBarras} onChange={handleChange} placeholder="GTI / Barra..." className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50/50 px-4 text-xs font-bold text-slate-600 outline-none focus:border-indigo-500 transition-all font-mono" />
            </div>
          </div>
        </div>
      </form>

      <div className="flex justify-center flex-col items-center gap-4 text-slate-400 mt-10 pb-10">
        <div className="h-10 w-px bg-slate-200"></div>
        <p className="text-[8px] font-black uppercase tracking-[0.3em]">Gestión de Activos Estratégicos © Sistematizate 2024</p>
      </div>

    </div>
  );
}

export default FormularioProveedores;