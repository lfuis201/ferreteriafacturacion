import React, { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  Info,
  X,
  Truck,
  Save,
  Undo2,
  FileText,
  Package,
  User,
  MapPin,
  HelpCircle,
  Hash,
  Scale,
  Trash2,
  ChevronDown,
  Building,
  UserPlus,
  ArrowRight,
  RefreshCcw
} from 'lucide-react';
import { obtenerSucursales } from '../../services/sucursalService';
import guiaRemisionService, { crearGuiaTransportista } from '../../services/guiaRemisionService';
import { obtenerPagadoresFlete } from '../../services/pagadorFleteService';
import { obtenerRemitentes } from '../../services/remitenteService';
import { obtenerClientes } from '../../services/clienteService';
import { obtenerVehiculos } from '../../services/vehiculoService';
import { obtenerConductores } from '../../services/conductorService';
import ModalPegadorFlete from './ModalPegadorFlete';
import RemitenteModal from './RemitenteModal';
import Empresasubcontratada from './Empresasubcontratada';
import ModalNuevaDireccion from './ModalNuevaDireccion';
import DestinatarioModal from './destinatarioModal';
import NuevoVehículo from './NuevoVehículo';
import ModalConductor from './ModalConductor';
import ModalAgregarProducto from './modalAgregarProducto';
import Swal from 'sweetalert2';

const FormularioGuiaRemisionTrans = () => {
  const [formData, setFormData] = useState({
    establecimiento: '',
    serie: 'VT01',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaTraslado: new Date().toISOString().split('T')[0],
    unidadMedida: 'KGM',
    pesoTotal: '0.00',
    numeroPaquetes: 0,
    ordenCompra: '',
    observaciones: '',
    empresaPagadora: '',
    empresaSubcontratada: '',
    remitente: '',
    destinatario: '',
    puntoPartida: '',
    puntoLlegada: '',
    datosVehiculo: '',
    datosVehiculoSecundario: '',
    datosConductor: '',
    datosConductorSecundario: '',
    productos: []
  });

  const [establecimientos, setEstablecimientos] = useState([]);
  const [guiasRelacionadas, setGuiasRelacionadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarModalPagador, setMostrarModalPagador] = useState(false);
  const [mostrarModalRemitente, setMostrarModalRemitente] = useState(false);
  const [mostrarModalDestinatario, setMostrarModalDestinatario] = useState(false);
  const [mostrarModalVehiculo, setMostrarModalVehiculo] = useState(false);
  const [mostrarModalConductor, setMostrarModalConductor] = useState(false);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [mostrarModalEmpresaSubcontratada, setMostrarModalEmpresaSubcontratada] = useState(false);
  const [mostrarModalDireccionPartida, setMostrarModalDireccionPartida] = useState(false);
  const [mostrarModalDireccionLlegada, setMostrarModalDireccionLlegada] = useState(false);
  const [pagadoresFlete, setPagadoresFlete] = useState([]);
  const [remitentes, setRemitentes] = useState([]);
  const [destinatarios, setDestinatarios] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [empresasSubcontratadas, setEmpresasSubcontratadas] = useState([]);
  const [direccionesPartida, setDireccionesPartida] = useState([]);
  const [direccionesLlegada, setDireccionesLlegada] = useState([]);

  useEffect(() => {
    cargarEstablecimientos();
    cargarPagadoresFlete();
    cargarRemitentes();
    cargarDestinatarios();
    cargarVehiculos();
    cargarConductores();
  }, []);

  const cargarEstablecimientos = async () => {
    try {
      const response = await obtenerSucursales();
      setEstablecimientos(response.sucursales || []);
      if (response.sucursales && response.sucursales.length > 0) {
        setFormData(prev => ({
          ...prev,
          establecimiento: response.sucursales[0].id.toString()
        }));
      }
    } catch (error) {
      console.error('Error al cargar establecimientos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los establecimientos',
        confirmButtonColor: '#126171'
      });
    }
  };

  const cargarPagadoresFlete = async () => {
    try {
      const response = await obtenerPagadoresFlete();
      setPagadoresFlete(response.pagadoresFlete || []);
      setEmpresasSubcontratadas(response.pagadoresFlete || []);
    } catch (error) {
      console.error('Error al cargar pagadores de flete:', error);
    }
  };

  const cargarRemitentes = async () => {
    try {
      const response = await obtenerRemitentes();
      setRemitentes(response.remitentes || []);
    } catch (error) {
      console.error('Error al cargar remitentes:', error);
    }
  };

  const cargarDestinatarios = async () => {
    try {
      const response = await obtenerClientes();
      setDestinatarios(response.clientes || []);
    } catch (error) {
      console.error('Error al cargar destinatarios:', error);
    }
  };

  const cargarVehiculos = async () => {
    try {
      const response = await obtenerVehiculos();
      setVehiculos(response.vehiculos || []);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    }
  };

  const cargarConductores = async () => {
    try {
      const response = await obtenerConductores();
      setConductores(response.conductores || []);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const incrementPaquetes = () => {
    setFormData(prev => ({ ...prev, numeroPaquetes: (prev.numeroPaquetes || 0) + 1 }));
  };

  const decrementPaquetes = () => {
    setFormData(prev => ({ ...prev, numeroPaquetes: Math.max(0, (prev.numeroPaquetes || 0) - 1) }));
  };

  const incrementPeso = () => {
    setFormData(prev => ({ ...prev, pesoTotal: (parseFloat(prev.pesoTotal || 0) + 0.01).toFixed(2) }));
  };

  const agregarProducto = () => {
    setMostrarModalProducto(true);
  };

  const eliminarProducto = (productoId) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter(producto => producto.id !== productoId)
    }));
    Swal.fire({
      icon: 'success',
      title: 'Producto eliminado',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const agregarGuiaRelacionada = () => {
    const nuevaGuia = { id: Date.now(), serie: '', numero: '', ruc: '' };
    setGuiasRelacionadas(prev => [...prev, nuevaGuia]);
  };

  const eliminarGuiaRelacionada = (id) => {
    setGuiasRelacionadas(prev => prev.filter(guia => guia.id !== id));
  };

  const actualizarGuiaRelacionada = (id, campo, valor) => {
    setGuiasRelacionadas(prev => prev.map(guia => guia.id === id ? { ...guia, [campo]: valor } : guia));
  };

  const handleDireccionCreada = (nuevaDireccion, tipo) => {
    const direccionConId = { id: Date.now(), ...nuevaDireccion };
    if (tipo === 'partida') {
      setDireccionesPartida(prev => [...prev, direccionConId]);
      setFormData(prev => ({ ...prev, puntoPartida: direccionConId.id.toString() }));
      setMostrarModalDireccionPartida(false);
    } else {
      setDireccionesLlegada(prev => [...prev, direccionConId]);
      setFormData(prev => ({ ...prev, puntoLlegada: direccionConId.id.toString() }));
      setMostrarModalDireccionLlegada(false);
    }
    Swal.fire({ icon: 'success', title: 'Éxito', text: `Dirección de ${tipo} creada`, timer: 2000, showConfirmButton: false });
  };

  const handlePagadorFleteCreado = (nuevoPagador) => {
    setPagadoresFlete(prev => [...prev, nuevoPagador]);
    setFormData(prev => ({ ...prev, empresaPagadora: nuevoPagador.id.toString() }));
    setMostrarModalPagador(false);
    cargarPagadoresFlete();
    Swal.fire({ icon: 'success', title: 'Éxito', text: 'Pagador de flete creado', timer: 2000, showConfirmButton: false });
  };

  const handleRemitenteCreado = (nuevoRemitente) => {
    setRemitentes(prev => [...prev, nuevoRemitente]);
    setFormData(prev => ({ ...prev, remitente: nuevoRemitente.id.toString() }));
    setMostrarModalRemitente(false);
    cargarRemitentes();
    Swal.fire({ icon: 'success', title: 'Éxito', text: 'Remitente creado', timer: 2000, showConfirmButton: false });
  };

  const handleDestinatarioCreado = (nuevoDestinatario) => {
    setDestinatarios(prev => [...prev, nuevoDestinatario]);
    setFormData(prev => ({ ...prev, destinatario: nuevoDestinatario.id.toString() }));
    setMostrarModalDestinatario(false);
    cargarDestinatarios();
    Swal.fire({ icon: 'success', title: 'Éxito', text: 'Destinatario creado', timer: 2000, showConfirmButton: false });
  };

  const handleVehiculoCreado = (nuevoVehiculo) => {
    setVehiculos(prev => [...prev, nuevoVehiculo]);
    setFormData(prev => ({ ...prev, datosVehiculo: nuevoVehiculo.id.toString() }));
    setMostrarModalVehiculo(false);
    cargarVehiculos();
    Swal.fire({ icon: 'success', title: 'Vehículo creado', timer: 2000, showConfirmButton: false });
  };

  const handleConductorCreado = (nuevoConductor) => {
    setConductores(prev => [...prev, nuevoConductor]);
    setFormData(prev => ({ ...prev, datosConductor: nuevoConductor.id.toString() }));
    setMostrarModalConductor(false);
    cargarConductores();
    Swal.fire({ icon: 'success', title: 'Conductor creado', timer: 2000, showConfirmButton: false });
  };

  const handleProductoAgregado = (nuevoProducto) => {
    const productoConId = { ...nuevoProducto, id: Date.now(), unidad: 'UND' };
    setFormData(prev => ({ ...prev, productos: [...prev.productos, productoConId] }));
    setMostrarModalProducto(false);
    Swal.fire({ icon: 'success', title: 'Producto agregado', timer: 1500, showConfirmButton: false });
  };

  const handleEmpresaSubcontratadaCreada = (nuevaEmpresa) => {
    setEmpresasSubcontratadas(prev => [...prev, nuevaEmpresa]);
    setFormData(prev => ({ ...prev, empresaSubcontratada: nuevaEmpresa.id.toString() }));
    setMostrarModalEmpresaSubcontratada(false);
    Swal.fire({ icon: 'success', title: 'Éxito', text: 'Empresa creada', timer: 2000, showConfirmButton: false });
  };

  const guardarGuiaRemision = async () => {
    if (loading) return;
    try {
      setLoading(true);
      if (!formData.establecimiento) throw new Error('Seleccione un establecimiento');
      if (!formData.remitente) throw new Error('Ingrese el remitente');
      if (!formData.destinatario) throw new Error('Ingrese el destinatario');
      if (!formData.puntoPartida) throw new Error('Ingrese el punto de partida');
      if (!formData.puntoLlegada) throw new Error('Ingrese el punto de llegada');
      if (!formData.datosVehiculo) throw new Error('Seleccione un vehículo');
      if (!formData.datosConductor) throw new Error('Seleccione un conductor');
      if (formData.productos.length === 0) throw new Error('Agregue al menos un producto');

      const vehiculoSeleccionado = vehiculos.find(v => v.id.toString() === formData.datosVehiculo.toString());
      const conductorSeleccionado = conductores.find(c => c.id.toString() === formData.datosConductor.toString());

      const datosGuia = {
        clienteId: parseInt(formData.destinatario),
        conductor: conductorSeleccionado ? `${conductorSeleccionado.nombre} ${conductorSeleccionado.apellido}` : '',
        dniConductor: conductorSeleccionado?.numeroDocumento || '',
        marca: vehiculoSeleccionado?.marcaVehiculo || '',
        modelo: vehiculoSeleccionado?.modeloVehiculo || '',
        rutaVehiculo: `${formData.puntoPartida} - ${formData.puntoLlegada}`,
        observacion: formData.observaciones || 'Guía de remisión de transportista',
        detalles: formData.productos.map(producto => ({
          productoId: producto.productoId || null,
          cantidad: parseFloat(producto.cantidad) || 0,
          descripcion: producto.producto || '',
          peso: parseFloat(producto.peso) || 0
        }))
      };

      await crearGuiaTransportista(datosGuia);
      setLoading(false);
      Swal.fire({ icon: 'success', title: 'Éxito', text: 'Guía creada correctamente', confirmButtonColor: '#126171' });
      resetForm();
    } catch (error) {
      setLoading(false);
      Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#126171' });
    }
  };

  const resetForm = () => {
    setFormData({
      establecimiento: establecimientos.length > 0 ? establecimientos[0].id.toString() : '',
      serie: 'VT01',
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaTraslado: new Date().toISOString().split('T')[0],
      unidadMedida: 'KGM',
      pesoTotal: '0.00',
      numeroPaquetes: 0,
      ordenCompra: '',
      observaciones: '',
      empresaPagadora: '',
      empresaSubcontratada: '',
      remitente: '',
      destinatario: '',
      puntoPartida: '',
      puntoLlegada: '',
      datosVehiculo: '',
      datosConductor: '',
      productos: []
    });
    setGuiasRelacionadas([]);
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xl shadow-indigo-200">
            <Truck size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Nueva G.R. Transportista</h1>
            <p className="text-sm font-medium text-slate-500">Formulario oficial para registro de traslados locales</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Info size={18} className="text-menta-turquesa" />
              <h3 className="text-sm font-bold text-menta-petroleo uppercase tracking-tight">Información General</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Establecimiento</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11"
                    value={formData.establecimiento}
                    onChange={(e) => handleInputChange('establecimiento', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {establecimientos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-3 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Serie</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11"
                    value={formData.serie}
                    onChange={(e) => handleInputChange('serie', e.target.value)}
                  >
                    <option value="VT01">VT01</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-3 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fecha Emisión</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-3 text-slate-300" />
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11"
                    value={formData.fechaEmision}
                    onChange={(e) => handleInputChange('fechaEmision', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fecha Traslado</label>
                <div className="relative">
                  <Truck size={16} className="absolute left-3 top-3 text-slate-300" />
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11"
                    value={formData.fechaTraslado}
                    onChange={(e) => handleInputChange('fechaTraslado', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Peso Total (KGM)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Scale size={16} className="absolute left-3 top-3 text-slate-300" />
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11"
                      value={formData.pesoTotal}
                      onChange={(e) => handleInputChange('pesoTotal', e.target.value)}
                    />
                  </div>
                  <button onClick={incrementPeso} className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">N° Paquetes</label>
                <div className="flex gap-2">
                  <button onClick={decrementPaquetes} className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    <Undo2 size={16} className="-rotate-90" />
                  </button>
                  <input
                    type="number"
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 px-4 text-sm font-semibold text-center text-slate-700 focus:border-menta-turquesa outline-none h-11"
                    value={formData.numeroPaquetes}
                    onChange={(e) => handleInputChange('numeroPaquetes', parseInt(e.target.value) || 0)}
                  />
                  <button onClick={incrementPaquetes} className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Logistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Remitente & Punto Partida */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-orange-500" />
                  <h3 className="text-xs font-bold text-menta-petroleo uppercase">Remitente y Partida</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Remitente
                    <button onClick={() => setMostrarModalRemitente(true)} className="text-indigo-600 hover:underline">Nuevo</button>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none h-11"
                      value={formData.remitente}
                      onChange={(e) => handleInputChange('remitente', e.target.value)}
                    >
                      <option value="">Seleccionar remitente...</option>
                      {remitentes.map(r => <option key={r.id} value={r.id}>{r.numeroDocumento} - {r.nombre}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-3 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Punto de Partida
                    <button onClick={setMostrarModalDireccionPartida} className="text-indigo-600 hover:underline">Nueva Dirección</button>
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-slate-300" />
                    <select
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm font-semibold text-slate-700 outline-none h-11"
                      value={formData.puntoPartida}
                      onChange={(e) => handleInputChange('puntoPartida', e.target.value)}
                    >
                      <option value="">Dirección de partida...</option>
                      {direccionesPartida.map(d => <option key={d.id} value={d.id}>{d.direccionCompleta}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-3 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Destinatario & Punto Llegada */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus size={18} className="text-emerald-500" />
                  <h3 className="text-xs font-bold text-menta-petroleo uppercase">Destinatario y Llegada</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Destinatario
                    <button onClick={() => setMostrarModalDestinatario(true)} className="text-indigo-600 hover:underline">Nuevo</button>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none h-11"
                      value={formData.destinatario}
                      onChange={(e) => handleInputChange('destinatario', e.target.value)}
                    >
                      <option value="">Seleccionar destinatario...</option>
                      {destinatarios.map(d => <option key={d.id} value={d.id}>{d.numeroDocumento} - {d.nombre}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-3 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Punto de Llegada
                    <button onClick={setMostrarModalDireccionLlegada} className="text-indigo-600 hover:underline">Nueva Dirección</button>
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-slate-300" />
                    <select
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm font-semibold text-slate-700 outline-none h-11"
                      value={formData.puntoLlegada}
                      onChange={(e) => handleInputChange('puntoLlegada', e.target.value)}
                    >
                      <option value="">Dirección de llegada...</option>
                      {direccionesLlegada.map(d => <option key={d.id} value={d.id}>{d.direccionCompleta}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-3 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transport & Secondary Column */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Truck size={18} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-menta-petroleo uppercase tracking-tight">Vehículo y Conductor</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Vehículo Principal
                  <button onClick={() => setMostrarModalVehiculo(true)} className="text-indigo-600 hover:underline">Nuevo</button>
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none"
                    value={formData.datosVehiculo}
                    onChange={(e) => handleInputChange('datosVehiculo', e.target.value)}
                  >
                    <option value="">Seleccionar vehículo...</option>
                    {vehiculos.map(v => <option key={v.id} value={v.id}>{v.nroPlacaId} - {v.modeloVehiculo}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-2.5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Conductor Principal
                  <button onClick={() => setMostrarModalConductor(true)} className="text-indigo-600 hover:underline">Nuevo</button>
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none"
                    value={formData.datosConductor}
                    onChange={(e) => handleInputChange('datosConductor', e.target.value)}
                  >
                    <option value="">Seleccionar conductor...</option>
                    {conductores.map(c => <option key={c.id} value={c.id}>{c.numeroDocumento} - {c.nombre}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-2.5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pagador del Flete</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none"
                    value={formData.empresaPagadora}
                    onChange={(e) => handleInputChange('empresaPagadora', e.target.value)}
                  >
                    <option value="">Seleccionar pagador...</option>
                    {pagadoresFlete.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-2.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Plus size={18} className="text-slate-400" />
              <h3 className="text-sm font-bold text-menta-petroleo uppercase tracking-tight">Guías Relacionadas</h3>
            </div>

            <div className="space-y-4">
              {guiasRelacionadas.map((guia) => (
                <div key={guia.id} className="relative rounded-xl border border-slate-100 bg-slate-50/50 p-4 animate-in slide-in-from-right-4 duration-300">
                  <button
                    onClick={() => eliminarGuiaRelacionada(guia.id)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Serie"
                      className="rounded-lg border border-slate-200 py-2 px-3 text-xs font-semibold focus:border-indigo-500 outline-none"
                      value={guia.serie}
                      onChange={(e) => actualizarGuiaRelacionada(guia.id, 'serie', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Número"
                      className="rounded-lg border border-slate-200 py-2 px-3 text-xs font-semibold focus:border-indigo-500 outline-none"
                      value={guia.numero}
                      onChange={(e) => actualizarGuiaRelacionada(guia.id, 'numero', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={agregarGuiaRelacionada}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-4 text-xs font-bold text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-[0.98]"
              >
                <Plus size={16} /> AGREGAR GUÍA RELACIONADA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-menta-petroleo uppercase tracking-tight">Detalle de Productos</h3>
          </div>
          <button
            onClick={agregarProducto}
            className="group inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
            AGREGAR PRODUCTO
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">#</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Descripción</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Cantidad</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Peso</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {formData.productos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">Sin productos agregados</td>
                </tr>
              ) : (
                formData.productos.map((producto, index) => (
                  <tr key={producto.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-700 uppercase">{producto.producto}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600">{producto.cantidad} {producto.unidad}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600">{producto.peso} KGM</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => eliminarProducto(producto.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Observations and Submit */}
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Observaciones Adicionales
          </label>
          <textarea
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 p-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none transition h-32"
            placeholder="Ingrese cualquier detalle adicional sobre el transporte o la carga..."
            value={formData.observaciones}
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            className="px-8 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
            onClick={resetForm}
          >
            LIMPIAR FORMULARIO
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-10 py-4 text-sm font-bold text-white shadow-xl shadow-menta-petroleo/20 hover:translate-y-[-2px] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-tighter"
            onClick={guardarGuiaRemision}
            disabled={loading}
          >
            {loading ? <RefreshCcw size={18} className="animate-spin" /> : <><Save size={20} /> GENERAR GUÍA DE TRANSPORTE</>}
          </button>
        </div>
      </div>

      {/* Modals */}
      {mostrarModalPagador && (
        <ModalPegadorFlete onClose={() => setMostrarModalPagador(false)} onPagadorFleteCreado={handlePagadorFleteCreado} />
      )}
      {mostrarModalRemitente && (
        <RemitenteModal onClose={() => setMostrarModalRemitente(false)} onRemitenteCreado={handleRemitenteCreado} />
      )}
      {mostrarModalDestinatario && (
        <DestinatarioModal onClose={() => setMostrarModalDestinatario(false)} onRemitenteCreado={handleDestinatarioCreado} />
      )}
      {mostrarModalVehiculo && (
        <NuevoVehículo onClose={() => setMostrarModalVehiculo(false)} onVehiculoCreado={handleVehiculoCreado} />
      )}
      {mostrarModalConductor && (
        <ModalConductor onClose={() => setMostrarModalConductor(false)} onConductorCreado={handleConductorCreado} />
      )}
      {mostrarModalProducto && (
        <ModalAgregarProducto isOpen={mostrarModalProducto} onClose={() => setMostrarModalProducto(false)} onSave={handleProductoAgregado} />
      )}
      {mostrarModalEmpresaSubcontratada && (
        <Empresasubcontratada onClose={() => setMostrarModalEmpresaSubcontratada(false)} onPagadorFleteCreado={handleEmpresaSubcontratadaCreada} />
      )}
      {mostrarModalDireccionPartida && (
        <ModalNuevaDireccion isOpen={mostrarModalDireccionPartida} onClose={() => setMostrarModalDireccionPartida(false)} onDireccionCreada={(d) => handleDireccionCreada(d, 'partida')} tipo="partida" />
      )}
      {mostrarModalDireccionLlegada && (
        <ModalNuevaDireccion isOpen={mostrarModalDireccionLlegada} onClose={() => setMostrarModalDireccionLlegada(false)} onDireccionCreada={(d) => handleDireccionCreada(d, 'llegada')} tipo="llegada" />
      )}
    </div>
  );
};

export default FormularioGuiaRemisionTrans;