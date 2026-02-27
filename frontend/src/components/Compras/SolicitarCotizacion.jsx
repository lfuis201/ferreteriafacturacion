import React, { useEffect, useState } from 'react';
import {
  obtenerCotizaciones,
  eliminarCotizacion,
  cambiarEstadoCotizacion,
  crearCotizacion,
  actualizarCotizacion,
  obtenerCotizacionPorId
} from '../../services/cotizacionService';
import { obtenerClientes } from '../../services/clienteService';
import FormularioVentaProductServicio from './FormularioVentaProductServicio';
import {
  Plus,
  Trash2,
  Search,
  FileText,
  Calendar,
  ChevronRight,
  Layout,
  ShoppingBag,
  User,
  Mail,
  Clock,
  XCircle,
  ArrowLeft,
  Info,
  Package,
  Filter,
  Eye,
  Edit3,
  ChevronLeft,
  Activity,
  ClipboardCheck,
  Hash,
  Send,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';
import Swal from 'sweetalert2';

const SolicitarCotizacion = () => {
  const [showModal, setShowModal] = useState(false);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [clientes, setClientes] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [mostrarSelectorProducto, setMostrarSelectorProducto] = useState(false);
  const [editCotizacionId, setEditCotizacionId] = useState(null);
  const [formData, setFormData] = useState({
    proveedor: '',
    correo: '',
    clienteId: '',
    fechaEmision: new Date().toISOString().slice(0, 10),
    productos: []
  });

  const cargarCotizaciones = async (filtros = {}) => {
    try {
      setLoading(true);
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        if (usuario.sucursalId) filtros.sucursalId = usuario.sucursalId;
      }

      const data = await obtenerCotizaciones(filtros);
      const lista = data?.cotizaciones || [];
      setCotizaciones(lista);
    } catch (err) {
      console.error('Error:', err);
      Swal.fire('Error', 'No se pudieron cargar las cotizaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try { setUsuarioActual(JSON.parse(usuarioGuardado)); } catch { }
    }
    const cargarDatos = async () => {
      try {
        const data = await obtenerClientes();
        setClientes(data?.clientes || data?.data || data || []);
        await cargarCotizaciones();
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
      }
    };
    cargarDatos();
  }, []);

  const eliminarProducto = (index) => {
    const nuevosProductos = formData.productos.filter((_, i) => i !== index);
    setFormData({ ...formData, productos: nuevosProductos });
  };

  const handleProductoChange = (index, field, value) => {
    const nuevosProductos = [...formData.productos];
    nuevosProductos[index][field] = value;
    setFormData({ ...formData, productos: nuevosProductos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clienteId || !formData.fechaEmision || formData.productos.length === 0) {
      Swal.fire('Atención', 'Complete todos los campos obligatorios y agregue al menos un producto', 'warning');
      return;
    }

    try {
      setLoading(true);
      const totalGravado = formData.productos.reduce((sum, p) => sum + ((parseFloat(p.precioVenta) || 0) * (parseFloat(p.cantidad) || 1)), 0);
      const igv = totalGravado * 0.18;
      const total = totalGravado + igv;

      const payload = {
        ...formData,
        registradoPor: usuarioActual?.nombre || 'Admin',
        vendedor: usuarioActual?.nombre || 'Vendedor',
        tGravado: totalGravado,
        subtotal: totalGravado,
        igv,
        total,
        validezDias: 15,
        detalles: formData.productos.map(p => ({
          productoId: p.id,
          cantidad: p.cantidad || 1,
          precioUnitario: p.precioVenta || 0,
          subtotal: (p.cantidad || 1) * (p.precioVenta || 0),
          descripcion: p.nombre || p.descripcion || ''
        }))
      };

      if (editCotizacionId) {
        await actualizarCotizacion(editCotizacionId, payload);
        Swal.fire('¡Éxito!', 'Cotización actualizada', 'success');
      } else {
        await crearCotizacion(payload);
        Swal.fire('¡Éxito!', 'Cotización creada correctamente', 'success');
      }

      setShowModal(false);
      setFormData({ proveedor: '', correo: '', productos: [], clienteId: '', fechaEmision: new Date().toISOString().slice(0, 10) });
      setEditCotizacionId(null);
      await cargarCotizaciones();
    } catch (err) {
      Swal.fire('Error', 'No se pudo guardar la cotización', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductoSeleccionado = (producto) => {
    const nuevo = {
      id: producto.id,
      nombre: producto.nombre,
      precioVenta: producto.precioVenta || producto.precio || 0,
      unidad: producto.unidadMedida || 'Unidad',
      cantidad: 1,
      descripcion: producto.nombre
    };
    setFormData(prev => ({ ...prev, productos: [...prev.productos, nuevo] }));
    setMostrarSelectorProducto(false);
  };

  const handleBuscar = () => {
    cargarCotizaciones({ fechaInicio: fechaFiltro || undefined });
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar cotización?',
      text: "Esta acción no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        await eliminarCotizacion(id);
        Swal.fire('Eliminado', 'La cotización fue borrada', 'success');
        await cargarCotizaciones();
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      }
    }
  };

  const handleEditar = async (id) => {
    try {
      setLoading(true);
      const data = await obtenerCotizacionPorId(id);
      const c = data?.cotizacion;
      if (!c) return;
      setFormData({
        proveedor: '',
        correo: c.correo || '',
        clienteId: c.clienteId,
        fechaEmision: (c.fechaEmision || c.fecha || '').slice(0, 10),
        productos: (c.DetalleCotizacions || c.detalles || []).map(d => ({
          id: d.productoId,
          nombre: d.Producto?.nombre || d.descripcion || '',
          precioVenta: d.precioUnitario || 0,
          unidad: d.Producto?.unidadMedida || 'Unidad',
          cantidad: d.cantidad || 1,
          descripcion: d.descripcion || ''
        }))
      });
      setEditCotizacionId(id);
      setShowModal(true);
    } catch (err) {
      Swal.fire('Error', 'No se pudo cargar la cotización', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatearDivisa = (monto) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto || 0);
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/20 min-h-screen animate-in fade-in duration-500">

      {/* Premium Header - Rose/Pink Theme for Quotes */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-600 via-rose-700 to-pink-900 p-8 text-white shadow-2xl shadow-rose-200/50">
        <div className="absolute right-0 top-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <FileSpreadsheet size={280} />
        </div>
        <div className="absolute left-0 bottom-0 p-10 opacity-5 pointer-events-none transform -translate-x-1/4 translate-y-1/4">
          <Send size={200} />
        </div>

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <ClipboardCheck size={32} className="text-rose-200" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Gestión de <span className="text-rose-200">Cotizaciones</span></h1>
              <div className="mt-2 flex items-center gap-2 text-rose-100/80 text-[10px] font-bold uppercase tracking-[0.2em]">
                <Activity size={14} className="text-rose-300" /> Propuestas comerciales y presupuestos
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex h-14 items-center gap-3 rounded-2xl bg-white px-8 text-sm font-black text-rose-700 shadow-xl shadow-rose-900/20 hover:bg-rose-50 transition-all active:scale-95 uppercase tracking-widest"
          >
            <Plus size={22} /> Nueva Cotización
          </button>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6 px-1">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
            <Layout size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Total Emitidas</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{cotizaciones.length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Pendientes</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{cotizaciones.filter(c => c.estado === 'PENDIENTE').length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Aprobadas</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{cotizaciones.filter(c => c.estado === 'APROBADA').length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4 border-b-4 border-b-rose-500">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Monto Global</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{formatearDivisa(cotizaciones.reduce((s, c) => s + (parseFloat(c.total) || 0), 0))}</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-4 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Fecha de Emisión</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="date"
                className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 focus:border-rose-500 focus:bg-white outline-none transition-all"
                value={fechaFiltro}
                onChange={(e) => setFechaFiltro(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-5 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Referencia / Cliente</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Buscar por número o nombre..."
                className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 focus:border-rose-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <button
              onClick={handleBuscar}
              className="w-full h-12 rounded-2xl bg-[#0f172a] text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              Filtrar Cotizaciones
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0f172a] text-white">
              <tr className="h-16 uppercase tracking-widest text-[10px] font-black">
                <th className="px-8 py-4 w-12 text-center border-r border-white/5">#</th>
                <th className="px-6 py-4">F. Emisión</th>
                <th className="px-6 py-4">Documento / Ref</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Inversión Estimada</th>
                <th className="px-8 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-500/20 border-t-rose-500" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultando registro de ofertas...</p>
                    </div>
                  </td>
                </tr>
              ) : cotizaciones.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <ClipboardCheck size={80} strokeWidth={1} />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">No hay cotizaciones registradas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                cotizaciones.map((cot, index) => (
                  <tr key={cot.id || index} className="group hover:bg-slate-50/80 transition-all duration-300">
                    <td className="px-8 py-6 text-center text-slate-300 font-bold border-r border-slate-50 italic">{index + 1}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                          <Calendar size={18} />
                        </div>
                        <span className="text-slate-700 font-black tracking-tight">{cot.fechaEmision}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-black text-slate-800 tracking-tighter">
                      <div className="flex flex-col">
                        <span>{cot.numeroReferencia || `COT-${cot.id}`}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Ref. Operativa</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${cot.estado === 'APROBADA' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                        {cot.estado === 'APROBADA' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {cot.estado}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <span className="text-lg font-black text-slate-900 tabular-nums">{formatearDivisa(cot.total)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEditar(cot.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90 shadow-sm"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleEliminar(cot.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-sm"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">

            <div className="bg-gradient-to-r from-rose-700 to-rose-900 px-10 py-8 text-white relative flex-shrink-0">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <FileText size={28} className="text-rose-100" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">{editCotizacionId ? 'Modificar Presupuesto' : 'Nueva Cotización'}</h3>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Oferta comercial para clientes</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="absolute right-10 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-all"><XCircle size={24} /></button>
            </div>

            <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente Destino</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <select
                      value={formData.clienteId || ''}
                      onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                      className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-rose-500 transition-all"
                    >
                      <option value="">Seleccionar Cliente</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre || c.razonSocial || c.numeroDocumento}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correo de Contacto</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                      className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-rose-500 transition-all"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fec. Emisión</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="date"
                      name="fechaEmision"
                      value={formData.fechaEmision}
                      onChange={(e) => setFormData({ ...formData, fechaEmision: e.target.value })}
                      className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Products Table Section */}
              <div className="rounded-[2.5rem] border border-slate-100 overflow-hidden mb-8 shadow-sm">
                <table className="w-full text-left text-[11px] whitespace-nowrap">
                  <thead className="bg-[#0f172a] text-white uppercase text-[9px] font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4 w-12 text-center">ELIM.</th>
                      <th className="px-6 py-4">Descripción del Item</th>
                      <th className="px-6 py-4 text-center">U. Medida</th>
                      <th className="px-6 py-4 text-center">Cant.</th>
                      <th className="px-6 py-4 text-right">Precio Unit.</th>
                      <th className="px-6 py-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-[12px] font-bold">
                    {formData.productos.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-300 italic">No se han añadido productos</td>
                      </tr>
                    ) : (
                      formData.productos.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => eliminarProducto(i)} className="text-rose-400 hover:text-rose-600 transition-colors p-1"><Trash2 size={16} /></button>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={p.descripcion || p.nombre}
                              onChange={(e) => handleProductoChange(i, 'descripcion', e.target.value)}
                              className="bg-transparent border-none p-0 w-full focus:ring-0 text-slate-800 font-black uppercase text-xs"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-black uppercase">{p.unidad}</span>
                          </td>
                          <td className="px-6 py-4 text-center w-24">
                            <input
                              type="number"
                              value={p.cantidad}
                              onChange={(e) => handleProductoChange(i, 'cantidad', e.target.value)}
                              className="w-full bg-slate-50 border-none rounded-lg text-center font-black p-1 focus:ring-rose-500/20"
                            />
                          </td>
                          <td className="px-6 py-4 text-right w-32">
                            <input
                              type="number"
                              value={p.precioVenta}
                              onChange={(e) => handleProductoChange(i, 'precioVenta', e.target.value)}
                              className="w-full bg-slate-50 border-none rounded-lg text-right font-black p-1 focus:ring-rose-500/20"
                            />
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-900 tabular-nums">
                            {formatearDivisa((parseFloat(p.cantidad) || 1) * (parseFloat(p.precioVenta) || 0))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="flex flex-wrap gap-4 order-2 md:order-1">
                  <button
                    type="button"
                    onClick={() => setMostrarSelectorProducto(true)}
                    className="flex h-12 items-center gap-2 rounded-2xl bg-rose-600 px-6 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95"
                  >
                    <Package size={18} /> Añadir del Catálogo
                  </button>
                </div>

                <div className="w-full md:w-64 space-y-3 order-1 md:order-2">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Gravado 18%</span>
                    <span className="text-slate-700">{formatearDivisa(formData.productos.reduce((s, p) => s + ((parseFloat(p.cantidad) || 1) * (parseFloat(p.precioVenta) || 0)), 0))}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>I.G.V.</span>
                    <span className="text-slate-700">{formatearDivisa(formData.productos.reduce((s, p) => s + ((parseFloat(p.cantidad) || 1) * (parseFloat(p.precioVenta) || 0)), 0) * 0.18)}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500">Total Neto</span>
                    <span className="text-2xl font-black text-slate-900 tabular-nums">
                      {formatearDivisa(formData.productos.reduce((s, p) => s + ((parseFloat(p.cantidad) || 1) * (parseFloat(p.precioVenta) || 0)), 0) * 1.18)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="h-12 px-8 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all">Descartar</button>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSubmit}
                  className="h-14 px-12 rounded-2xl bg-[#0f172a] text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95"
                >
                  Guardar Cotización
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selector de Producto Modal */}
      {mostrarSelectorProducto && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 border-b border-white/10 px-8 py-6 flex items-center justify-between">
              <h2 className="text-white font-black uppercase text-sm tracking-widest">Catálogo de Bienes y Servicios</h2>
              <button onClick={() => setMostrarSelectorProducto(false)} className="text-white/50 hover:text-white transition-colors p-2"><XCircle size={24} /></button>
            </div>
            <div className="p-4">
              <FormularioVentaProductServicio onProductoSeleccionado={handleProductoSeleccionado} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SolicitarCotizacion;