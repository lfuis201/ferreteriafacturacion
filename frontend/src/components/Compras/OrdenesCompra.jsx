import React, { useState, useEffect } from 'react';
import {
  obtenerCompras,
  obtenerCompraPorId,
  crearCompra,
  actualizarCompra,
  eliminarCompra
} from '../../services/compraService';
import { obtenerProveedores } from '../../services/proveedorService';
import { obtenerProductos } from '../../services/productoService';
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
  FileSpreadsheet,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Building2,
  DollarSign
} from 'lucide-react';
import Swal from 'sweetalert2';

const OrdenesCompra = () => {
  const [showModal, setShowModal] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroTermino, setFiltroTermino] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    proveedor: '',
    formaPago: '',
    tipoCambio: '3.465',
    codigoCliente: '',
    tipo: '',
    tipoComprobante: 'FACTURA ELECTRÓNICA',
    serie: '',
    numero: '',
    ordenVenta: '',
    fechaEmision: new Date().toISOString().slice(0, 10),
    fechaVencimiento: new Date().toISOString().slice(0, 10),
    moneda: 'Soles',
    cliente: '',
    cotizacion: '',
    creadoPor: '',
    aprobadoPor: '',
    observacion: '',
    productos: []
  });

  const [clientes, setClientes] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [mostrarSelectorProductos, setMostrarSelectorProductos] = useState(false);

  const cargarProveedores = async () => {
    try {
      const resp = await obtenerProveedores();
      setProveedores(resp.proveedores || resp.data || []);
    } catch (e) { console.error('Error proveedores', e); }
  };

  const cargarClientes = async () => {
    try {
      const resp = await obtenerClientes();
      setClientes(resp.clientes || resp.data || []);
    } catch (e) { console.error('Error clientes', e); }
  };

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const filtros = {};
      if (filtroFecha) {
        filtros.fechaInicio = filtroFecha;
        filtros.fechaFin = filtroFecha;
      }
      const resp = await obtenerCompras(filtros);
      setOrdenes(resp.compras || []);
    } catch (e) {
      setError('No se pudieron cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    cargarOrdenes();
  };

  useEffect(() => {
    cargarProveedores();
    cargarClientes();
    cargarOrdenes();
    const usu = localStorage.getItem('usuario');
    if (usu) setUsuarioActual(JSON.parse(usu));
  }, []);

  const handleProductoChange = (index, field, value) => {
    const nuevos = [...formData.productos];
    nuevos[index][field] = value;
    if (field === 'cantidad' || field === 'precio') {
      nuevos[index].subtotal = (parseFloat(nuevos[index].cantidad) || 0) * (parseFloat(nuevos[index].precio) || 0);
    }
    setFormData({ ...formData, productos: nuevos });
  };

  const eliminarProducto = (index) => {
    setFormData({ ...formData, productos: formData.productos.filter((_, i) => i !== index) });
  };

  const onProductoSeleccionado = (p) => {
    const precio = parseFloat(p?.precioCompra ?? p?.precioVenta ?? 0);
    const nueva = {
      productoId: p.id,
      descripcion: p.nombre || p.descripcion || '',
      cantidad: 1,
      precio: isNaN(precio) ? 0 : precio,
      subtotal: isNaN(precio) ? 0 : precio
    };
    setFormData(prev => ({ ...prev, productos: [...prev.productos, nueva] }));
    setMostrarSelectorProductos(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.proveedor || formData.productos.length === 0) {
      Swal.fire('Atención', 'Seleccione un proveedor y agregue productos', 'warning');
      return;
    }

    try {
      setLoading(true);
      const detalles = formData.productos.map(p => ({
        productoId: p.productoId,
        cantidad: parseFloat(p.cantidad) || 0,
        precioUnitario: parseFloat(p.precio) || 0,
        subtotal: (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio) || 0)
      }));

      const sub = detalles.reduce((s, d) => s + d.subtotal, 0);
      const igv = sub * 0.18;
      const tot = sub + igv;

      const payload = {
        proveedorId: parseInt(formData.proveedor),
        tipoComprobante: formData.tipoComprobante,
        serie: formData.serie,
        numero: formData.numero,
        fechaEmision: formData.fechaEmision,
        fechaVencimiento: formData.fechaVencimiento,
        moneda: formData.moneda,
        tipoCambio: parseFloat(formData.tipoCambio) || 3.465,
        observaciones: formData.observacion,
        sucursalId: usuarioActual?.sucursalId,
        detalles,
        subtotal: sub,
        igv,
        total: tot
      };

      if (editandoId) await actualizarCompra(editandoId, payload);
      else await crearCompra(payload);

      Swal.fire('¡Éxito!', `Orden ${editandoId ? 'actualizada' : 'creada'} correctamente`, 'success');
      setShowModal(false);
      setEditandoId(null);
      await cargarOrdenes();
    } catch (e) {
      Swal.fire('Error', 'No se pudo guardar la orden', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = async (id) => {
    try {
      setLoading(true);
      const resp = await obtenerCompraPorId(id);
      const c = resp.compra || {};
      setFormData({
        proveedor: c.proveedorId || '',
        tipoComprobante: c.tipoComprobante || 'FACTURA ELECTRÓNICA',
        serie: c.serieComprobante || '',
        numero: c.numeroComprobante || '',
        fechaEmision: (c.fechaCompra || '').slice(0, 10),
        fechaVencimiento: (c.fechaVencimiento || '').slice(0, 10),
        moneda: c.moneda || 'Soles',
        tipoCambio: c.tipoCambio || '3.465',
        observacion: c.observaciones || '',
        productos: (c.DetalleCompras || []).map(d => ({
          productoId: d.productoId,
          descripcion: d.Producto?.nombre || d.descripcion || '',
          cantidad: d.cantidad || 0,
          precio: d.precioUnitario || 0,
          subtotal: (d.cantidad || 0) * (d.precioUnitario || 0)
        }))
      });
      setEditandoId(id);
      setShowModal(true);
    } catch (e) {
      Swal.fire('Error', 'No se pudo cargar la orden', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar orden?',
      text: "Se borrará permanentemente el registro",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar'
    });
    if (result.isConfirmed) {
      try {
        await eliminarCompra(id);
        Swal.fire('¡Borrado!', 'La orden ha sido eliminada', 'success');
        await cargarOrdenes();
      } catch (e) { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
    }
  };

  const formatearDivisa = (m) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(m || 0);

  const ordenesFiltradas = ordenes.filter(o => {
    if (!filtroTermino) return true;
    const t = filtroTermino.toLowerCase();
    return o.Proveedor?.nombre?.toLowerCase().includes(t) || o.numeroComprobante?.toLowerCase().includes(t);
  });

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/20 min-h-screen animate-in fade-in duration-500">

      {/* Premium Header - Violet/Indigo Theme */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-950 p-8 text-white shadow-2xl shadow-indigo-200/50">
        <div className="absolute right-0 top-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <ShoppingCart size={280} />
        </div>
        <div className="absolute left-0 bottom-0 p-10 opacity-5 pointer-events-none transform -translate-x-1/4 translate-y-1/4">
          <TrendingUp size={200} />
        </div>

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <ClipboardCheck size={32} className="text-indigo-200" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Órdenes de <span className="text-indigo-200">Compra</span></h1>
              <div className="mt-2 flex items-center gap-2 text-indigo-100/80 text-[10px] font-bold uppercase tracking-[0.2em]">
                <Activity size={14} className="text-indigo-300" /> Gestión centralizada de abastecimiento
              </div>
            </div>
          </div>

          <button
            onClick={() => { setEditandoId(null); setFormData({ ...formData, productos: [] }); setShowModal(true); }}
            className="flex h-14 items-center gap-3 rounded-2xl bg-white px-8 text-sm font-black text-indigo-700 shadow-xl shadow-indigo-900/20 hover:bg-indigo-50 transition-all active:scale-95 uppercase tracking-widest"
          >
            <Plus size={22} /> Nueva Orden
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6 px-1">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
            <Layout size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Total Órdenes</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{ordenes.length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Proveedores Activos</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{[...new Set(ordenes.map(o => o.proveedorId))].length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Total Inversión</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{formatearDivisa(ordenes.reduce((s, o) => s + parseFloat(o.total || 0), 0))}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4 border-b-4 border-b-indigo-500">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Promedio x Orden</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">
              {formatearDivisa(ordenes.length > 0 ? (ordenes.reduce((s, o) => s + parseFloat(o.total || 0), 0) / ordenes.length) : 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" />
            </div>
          </div>
          <div className="md:col-span-6 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Buscar Orden / Proveedor</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Escriba proveedor o número de orden..." value={filtroTermino} onChange={e => setFiltroTermino(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" />
            </div>
          </div>
          <div className="md:col-span-3">
            <button onClick={handleBuscar} className="w-full h-12 rounded-2xl bg-[#0f172a] text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95">Sincronizar Datos</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0f172a] text-white">
              <tr className="h-16 uppercase tracking-widest text-[9px] font-black">
                <th className="px-8 py-4 w-12 text-center border-r border-white/5">#</th>
                <th className="px-6 py-4">F. Emisión</th>
                <th className="px-6 py-4">Orden / Comprobante</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4 text-right">Monto Total</th>
                <th className="px-8 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="py-24 text-center">Cargando órdenes...</td></tr>
              ) : ordenesFiltradas.length === 0 ? (
                <tr><td colSpan="6" className="py-24 text-center opacity-30 italic">No se encontraron registros</td></tr>
              ) : (
                ordenesFiltradas.map((o, i) => (
                  <tr key={o.id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-8 py-6 text-center text-slate-300 font-bold">{i + 1}</td>
                    <td className="px-6 py-6 font-bold text-slate-600">{(o.fechaCompra || '').slice(0, 10)}</td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 tracking-tight">{o.numeroComprobante || `OC-${o.id}`}</span>
                        <span className="text-[9px] font-black uppercase text-indigo-400">{o.tipoComprobante}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-black text-slate-700">{o.Proveedor?.nombre || 'S/N'}</td>
                    <td className="px-6 py-6 text-right font-black text-slate-900 tabular-nums">{formatearDivisa(o.total)}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleEditar(o.id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"><Edit3 size={18} /></button>
                        <button onClick={() => handleEliminar(o.id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
            <div className="bg-gradient-to-r from-indigo-800 to-indigo-950 px-10 py-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <ShoppingCart size={28} className="text-indigo-100" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">{editandoId ? 'Editar Orden' : 'Generar Orden de Compra'}</h3>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Abastecimiento de inventario</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-all text-white"><XCircle size={24} /></button>
            </div>

            <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Proveedor</label>
                  <select value={formData.proveedor} onChange={e => setFormData({ ...formData, proveedor: e.target.value })} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all">
                    <option value="">Seleccionar...</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">F. Emisión</label>
                  <input type="date" value={formData.fechaEmision} onChange={e => setFormData({ ...formData, fechaEmision: e.target.value })} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">F. Vencimiento</label>
                  <input type="date" value={formData.fechaVencimiento} onChange={e => setFormData({ ...formData, fechaVencimiento: e.target.value })} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Moneda</label>
                  <select value={formData.moneda} onChange={e => setFormData({ ...formData, moneda: e.target.value })} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none">
                    <option value="Soles">Soles (S/)</option>
                    <option value="Dólares">Dólares ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Documento</label>
                  <select value={formData.tipoComprobante} onChange={e => setFormData({ ...formData, tipoComprobante: e.target.value })} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none">
                    <option value="FACTURA ELECTRÓNICA">FACTURA ELECTRÓNICA</option>
                    <option value="BOLETA DE VENTA ELECTRONICA">BOLETA DE VENTA ELECTRONICA</option>
                    <option value="NOTA DE VENTA">NOTA DE VENTA</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Serie</label>
                  <input type="text" value={formData.serie} onChange={e => setFormData({ ...formData, serie: e.target.value })} placeholder="Ej: F001" className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Número</label>
                  <input type="text" value={formData.numero} onChange={e => setFormData({ ...formData, numero: e.target.value })} placeholder="Ej: 000123" className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none" />
                </div>
              </div>

              <div className="mb-8 rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left text-[11px] whitespace-nowrap">
                  <thead className="bg-[#0f172a] text-white uppercase text-[9px] font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4 w-12 text-center">BORR.</th>
                      <th className="px-6 py-4">Descripción del Item</th>
                      <th className="px-6 py-4 text-center">Cant.</th>
                      <th className="px-6 py-4 text-right">Costo Unit.</th>
                      <th className="px-6 py-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-[12px] font-bold">
                    {formData.productos.length === 0 ? (
                      <tr><td colSpan="5" className="py-12 text-center text-slate-300 italic">Haga clic en 'Añadir Producto' para comenzar</td></tr>
                    ) : (
                      formData.productos.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => eliminarProducto(i)} className="text-rose-400 hover:text-rose-600 p-1"><Trash2 size={16} /></button>
                          </td>
                          <td className="px-6 py-4"><span className="font-black text-slate-800 uppercase line-clamp-1">{p.descripcion}</span></td>
                          <td className="px-6 py-4 text-center w-24">
                            <input type="number" value={p.cantidad} onChange={e => handleProductoChange(i, 'cantidad', e.target.value)} className="w-full bg-slate-50 border-none rounded-lg text-center font-black p-1 focus:ring-2 focus:ring-indigo-500/20" />
                          </td>
                          <td className="px-6 py-4 text-right w-32">
                            <input type="number" value={p.precio} onChange={e => handleProductoChange(i, 'precio', e.target.value)} className="w-full bg-slate-50 border-none rounded-lg text-right font-black p-1 focus:ring-2 focus:ring-indigo-500/20" />
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-900 tabular-nums">{formatearDivisa(p.subtotal)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <button type="button" onClick={() => setMostrarSelectorProductos(true)} className="flex h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-8 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                  <Package size={18} /> Añadir del Inventario
                </button>
                <div className="w-full md:w-64 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Gravado (18%)</span>
                    <span className="text-slate-700">{formatearDivisa(formData.productos.reduce((s, p) => s + p.subtotal, 0))}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest text-indigo-500">Gasto Total</span>
                    <span className="text-2xl font-black text-slate-900 tabular-nums">
                      {formatearDivisa(formData.productos.reduce((s, p) => s + p.subtotal, 0) * 1.18)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setShowModal(false)} className="h-12 px-8 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase text-slate-400 hover:text-slate-600">Descartar</button>
              <button onClick={handleSubmit} className="h-14 px-12 rounded-2xl bg-[#0f172a] text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 shadow-xl transition-all active:scale-95">
                {editandoId ? 'Guardar Cambios' : 'Generar Orden'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Selector */}
      {mostrarSelectorProductos && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 px-8 py-6 flex items-center justify-between text-white">
              <h2 className="font-black uppercase text-xs tracking-widest">Seleccionar Item de Catálogo</h2>
              <button onClick={() => setMostrarSelectorProductos(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><XCircle size={24} /></button>
            </div>
            <div className="p-4"><FormularioVentaProductServicio onProductoSeleccionado={onProductoSeleccionado} /></div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrdenesCompra;