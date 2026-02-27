import React, { useEffect, useState } from 'react';
import {
  listarGastosDiversos,
  crearGastoDiverso,
  actualizarGastoDiverso,
  eliminarGastoDiverso
} from '../../services/gastosDiversosService';
import { obtenerProveedores } from '../../services/proveedorService';
import {
  Plus,
  Trash2,
  Search,
  FileText,
  Calendar,
  Layout,
  User,
  Mail,
  Clock,
  XCircle,
  Package,
  Edit3,
  Activity,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Receipt,
  TrendingDown,
  Banknote,
  Building2,
  Minimize2,
  ExternalLink,
  CreditCard,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';

const GastosDiversos = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [gastos, setGastos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
  const [filtros, setFiltros] = useState({ fecha: '', q: '', page: 1 });
  const [detalleTemp, setDetalleTemp] = useState({ descripcion: '', total: '' });
  const [proveedores, setProveedores] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    tipoComprobante: 'GASTO POR DEFECTO',
    numero: '',
    moneda: 'Soles',
    fechaEmision: new Date().toISOString().slice(0, 10),
    tipoCambio: '',
    proveedorId: '',
    motivo: '',
    periodo: '',
    metodosGasto: [
      { metodo: 'CAJA GENERAL', destino: '', referencia: '', glosa: '', monto: 0 }
    ],
    detalles: []
  });

  useEffect(() => {
    const init = async () => {
      try {
        const provRes = await obtenerProveedores();
        setProveedores(provRes?.proveedores || []);
      } catch (e) { console.error(e); }
      await cargarGastos();
    };
    init();
  }, []);

  const cargarGastos = async (page = filtros.page) => {
    try {
      setLoading(true);
      const res = await listarGastosDiversos({ fecha: filtros.fecha, q: filtros.q, page, limit: pagination.limit });
      setGastos(res?.gastos || []);
      if (res?.pagination) setPagination(res.pagination);
    } catch (e) {
      Swal.fire('Error', 'No se pudieron cargar los gastos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMetodoChange = (index, field, value) => {
    const nuevosMetodos = [...formData.metodosGasto];
    nuevosMetodos[index][field] = value;
    setFormData({ ...formData, metodosGasto: nuevosMetodos });
  };

  const agregarMetodoGasto = () => {
    setFormData({
      ...formData,
      metodosGasto: [...formData.metodosGasto, { metodo: 'CAJA GENERAL', destino: '', referencia: '', glosa: '', monto: 0 }]
    });
  };

  const eliminarMetodoGasto = (index) => {
    setFormData({ ...formData, metodosGasto: formData.metodosGasto.filter((_, i) => i !== index) });
  };

  const agregarDetalle = () => {
    if (detalleTemp.descripcion && detalleTemp.total) {
      setFormData({
        ...formData,
        detalles: [...formData.detalles, { ...detalleTemp }]
      });
      setDetalleTemp({ descripcion: '', total: '' });
      setShowDetalleModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.detalles.length === 0) {
      Swal.fire('Atención', 'Debe agregar al menos un detalle de gasto', 'warning');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        moneda: formData.moneda === 'Dólares' ? 'USD' : 'PEN',
        tipoCambio: formData.moneda === 'Dólares' ? parseFloat(formData.tipoCambio || 0) : null,
        metodosGasto: formData.metodosGasto.map(m => ({ ...m, monto: parseFloat(m.monto || 0) })),
        detalles: formData.detalles.map(d => ({ ...d, total: parseFloat(d.total || 0) }))
      };

      if (editId) await actualizarGastoDiverso(editId, payload);
      else await crearGastoDiverso(payload);

      Swal.fire('¡Éxito!', `Gasto ${editId ? 'actualizado' : 'registrado'} correctamente`, 'success');
      setShowModal(false);
      setEditId(null);
      setFormData({
        tipoComprobante: 'GASTO POR DEFECTO',
        numero: '',
        moneda: 'Soles',
        fechaEmision: new Date().toISOString().slice(0, 10),
        tipoCambio: '',
        proveedorId: '',
        motivo: '',
        periodo: '',
        metodosGasto: [{ metodo: 'CAJA GENERAL', destino: '', referencia: '', glosa: '', monto: 0 }],
        detalles: []
      });
      await cargarGastos();
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo guardar el gasto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const abrirEdicion = (gasto) => {
    setEditId(gasto.id);
    setFormData({
      tipoComprobante: gasto.tipoComprobante || 'GASTO POR DEFECTO',
      numero: gasto.numero || '',
      moneda: gasto.moneda === 'USD' ? 'Dólares' : 'Soles',
      fechaEmision: (gasto.fechaEmision || '').slice(0, 10),
      tipoCambio: gasto.tipoCambio || '',
      proveedorId: gasto.proveedorId || '',
      motivo: gasto.motivo || '',
      periodo: gasto.periodo || '',
      metodosGasto: (gasto.MetodoGastoDiversos || []).map(m => ({ ...m })),
      detalles: (gasto.DetalleGastoDiversos || []).map(d => ({ ...d }))
    });
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar gasto?',
      text: "Esta operación es irreversible",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar'
    });
    if (result.isConfirmed) {
      try {
        await eliminarGastoDiverso(id);
        Swal.fire('Eliminado', 'El gasto ha sido borrado', 'success');
        await cargarGastos();
      } catch (e) { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
    }
  };

  const formatearDivisa = (m) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(m || 0);

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/20 min-h-screen animate-in fade-in duration-500">

      {/* Premium Header - Teal/Emerald Theme */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-900 p-8 text-white shadow-2xl shadow-teal-200/50">
        <div className="absolute right-0 top-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Wallet size={280} />
        </div>
        <div className="absolute left-0 bottom-0 p-10 opacity-5 pointer-events-none transform -translate-x-1/4 translate-y-1/4">
          <TrendingDown size={200} />
        </div>

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <Receipt size={32} className="text-teal-200" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase leading-none text-white">Gastos <span className="text-teal-200">Diversos</span></h1>
              <div className="mt-2 flex items-center gap-2 text-teal-100/80 text-[10px] font-bold uppercase tracking-[0.2em]">
                <Activity size={14} className="text-teal-300" /> Control de egresos y desembolsos operativos
              </div>
            </div>
          </div>

          <button
            onClick={() => { setEditId(null); setShowModal(true); }}
            className="flex h-14 items-center gap-3 rounded-2xl bg-white px-8 text-sm font-black text-teal-700 shadow-xl shadow-teal-900/20 hover:bg-teal-50 transition-all active:scale-95 uppercase tracking-widest"
          >
            <Plus size={22} /> Registrar Gasto
          </button>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6 px-1">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4 transition-hover hover:shadow-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-500">
            <Layout size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Total Registros</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{pagination.total}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4 transition-hover hover:shadow-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
            <Banknote size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Gasto Semanal</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{formatearDivisa(gastos.reduce((a, b) => a + parseFloat(b.total || 0), 0))}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4 transition-hover hover:shadow-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-500">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Proveedores</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{proveedores.length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4 border-b-4 border-b-teal-500 transition-hover hover:shadow-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Monto Global</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{formatearDivisa(gastos.reduce((s, g) => s + parseFloat(g.total || 0), 0))}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-4 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Fecha Emisión</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="date" value={filtros.fecha} onChange={e => setFiltros({ ...filtros, fecha: e.target.value })} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-teal-500 transition-all font-mono" />
            </div>
          </div>
          <div className="md:col-span-5 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Concepto / Proveedor</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Escriba motivo, número o proveedor..." value={filtros.q} onChange={e => setFiltros({ ...filtros, q: e.target.value })} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-teal-500 transition-all" />
            </div>
          </div>
          <div className="md:col-span-3">
            <button onClick={() => cargarGastos(1)} className="w-full h-12 rounded-2xl bg-[#0f172a] text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95">Sincronizar Egresos</button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0f172a] text-white">
              <tr className="h-16 uppercase tracking-widest text-[9px] font-black">
                <th className="px-8 py-4 w-12 text-center border-r border-white/5">#</th>
                <th className="px-6 py-4">F. Emisión</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Proveedor / Concepto</th>
                <th className="px-6 py-4 text-right">Inversión</th>
                <th className="px-8 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic">
              {loading ? (
                <tr><td colSpan="6" className="py-24 text-center">Consultando caja de gastos...</td></tr>
              ) : gastos.length === 0 ? (
                <tr><td colSpan="6" className="py-24 text-center font-bold text-slate-300 uppercase tracking-widest italic opacity-20">Sin movimientos registrados</td></tr>
              ) : (
                gastos.map((g, i) => (
                  <tr key={g.id} className="group hover:bg-slate-50/80 transition-all not-italic">
                    <td className="px-8 py-6 text-center text-slate-300 font-bold border-r border-slate-50 italic">{i + 1 + (pagination.page - 1) * pagination.limit}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm"><Calendar size={18} /></div>
                        <span className="font-bold text-slate-600 tracking-tight">{(g.fechaEmision || '').slice(0, 10)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-black text-slate-800 tracking-tighter">
                      <div className="flex flex-col">
                        <span>{g.numero || 'S/N'}</span>
                        <span className="text-[9px] font-bold text-teal-500 uppercase">{g.tipoComprobante}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-700">{g.Proveedor?.nombre || 'Gasto General'}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{g.motivo || 'Sin glosa específica'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right font-black text-slate-900 tabular-nums">
                      {formatearDivisa(g.total)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => abrirEdicion(g)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90 shadow-sm"><Edit3 size={18} /></button>
                        <button onClick={() => handleEliminar(g.id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-sm"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Página <span className="text-slate-800">{pagination.page}</span> de <span className="text-slate-800">{pagination.totalPages}</span></p>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => cargarGastos(pagination.page - 1)} className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all disabled:opacity-30"><ChevronLeft size={18} /></button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => cargarGastos(pagination.page + 1)} className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {/* Main Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[95vh]">

            <div className="bg-gradient-to-r from-teal-700 to-emerald-900 px-10 py-8 text-white relative flex-shrink-0">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Banknote size={28} className="text-teal-100" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">{editId ? 'Modificar Egreso' : 'Nuevo Registro de Gasto'}</h3>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Liquidación de gastos operativos</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="absolute right-10 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-all text-white"><XCircle size={24} /></button>
            </div>

            <div className="p-10 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comprobante</label>
                  <select value={formData.tipoComprobante} onChange={e => setFormData({ ...formData, tipoComprobante: e.target.value })} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-teal-500 transition-all">
                    <option value="GASTO POR DEFECTO">GASTO POR DEFECTO</option>
                    <option value="RECIBO POR HONORARIOS">RECIBO POR HONORARIOS</option>
                    <option value="FACTURA">FACTURA</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Número *</label>
                  <input type="text" value={formData.numero} onChange={e => setFormData({ ...formData, numero: e.target.value })} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-teal-500 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Moneda</label>
                  <select value={formData.moneda} onChange={e => setFormData({ ...formData, moneda: e.target.value })} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none">
                    <option value="Soles">Soles (S/)</option>
                    <option value="Dólares">Dólares ($)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">F. Emisión</label>
                  <input type="date" value={formData.fechaEmision} onChange={e => setFormData({ ...formData, fechaEmision: e.target.value })} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="md:col-span-1 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Proveedor / Emisor</label>
                  <select value={formData.proveedorId} onChange={e => setFormData({ ...formData, proveedorId: e.target.value })} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none">
                    <option value="">Ninguno / General</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div className="md:col-span-1 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Motivo del Gasto</label>
                  <input type="text" value={formData.motivo} onChange={e => setFormData({ ...formData, motivo: e.target.value })} placeholder="Ej: Pago de luz local 1" className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none transition-all" />
                </div>
                <div className="md:col-span-1 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Periodo</label>
                  <input type="text" value={formData.periodo} onChange={e => setFormData({ ...formData, periodo: e.target.value })} placeholder="Ej: Octubre 2023" className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 outline-none" />
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-600 flex items-center gap-2">
                    <CreditCard size={14} /> Métodos de Pago
                  </h4>
                  <button type="button" onClick={agregarMetodoGasto} className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100 transition-colors">+ Añadir Método</button>
                </div>
                <div className="rounded-[2rem] border border-slate-50 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#0f172a] text-white uppercase text-[8px] font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-3">Medio</th>
                        <th className="px-6 py-3">Referencia</th>
                        <th className="px-6 py-3">Glosa Bancaria</th>
                        <th className="px-6 py-3 text-right">Monto Asignado</th>
                        <th className="px-6 py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold border-b border-slate-50">
                      {formData.metodosGasto.map((m, i) => (
                        <tr key={i} className="bg-slate-50/30">
                          <td className="px-6 py-3">
                            <select value={m.metodo} onChange={e => handleMetodoChange(i, 'metodo', e.target.value)} className="bg-transparent border-none p-0 focus:ring-0 text-slate-700 font-bold uppercase text-[10px]">
                              <option value="CAJA GENERAL">CAJA GENERAL</option>
                              <option value="BANCO">BANCO / TRANF.</option>
                            </select>
                          </td>
                          <td className="px-6 py-3">
                            <input type="text" value={m.referencia} onChange={e => handleMetodoChange(i, 'referencia', e.target.value)} className="bg-transparent border-none p-0 w-full focus:ring-0 text-slate-600" placeholder="..." />
                          </td>
                          <td className="px-6 py-3">
                            <input type="text" value={m.glosa} onChange={e => handleMetodoChange(i, 'glosa', e.target.value)} className="bg-transparent border-none p-0 w-full focus:ring-0 text-slate-600" placeholder="..." />
                          </td>
                          <td className="px-6 py-3 text-right">
                            <input type="number" value={m.monto} onChange={e => handleMetodoChange(i, 'monto', e.target.value)} className="bg-transparent border-none p-0 text-right w-24 focus:ring-0 font-black text-teal-600" />
                          </td>
                          <td className="px-6 py-3 text-center">
                            {formData.metodosGasto.length > 1 && <button onClick={() => eliminarMetodoGasto(i)} className="text-rose-400 hover:text-rose-600"><Trash2 size={14} /></button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Details Section */}
              <div>
                <div className="flex items-center justify-between mb-4 px-2">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                    <Package size={14} /> Detalles del Comprobante
                  </h4>
                  <button type="button" onClick={() => setShowDetalleModal(true)} className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors">+ Añadir Ítem</button>
                </div>
                <div className="rounded-[2.5rem] border border-slate-50 overflow-hidden mb-6 shadow-sm">
                  <table className="w-full text-left text-[11px] whitespace-nowrap">
                    <thead className="bg-[#0f172a] text-white uppercase text-[8px] font-black tracking-widest">
                      <tr>
                        <th className="px-8 py-4 w-12 text-center">#</th>
                        <th className="px-6 py-4">Descripción del Gasto</th>
                        <th className="px-6 py-4 text-right">Monto Parcial</th>
                        <th className="px-8 py-4 w-12 text-center">Elim.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-[12px]">
                      {formData.detalles.length === 0 ? (
                        <tr><td colSpan="4" className="py-12 text-center text-slate-300 italic">No se han registrado ítems de gasto</td></tr>
                      ) : (
                        formData.detalles.map((d, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="px-8 py-4 text-center text-slate-300 italic">{i + 1}</td>
                            <td className="px-6 py-4 text-slate-700 font-black uppercase">{d.descripcion}</td>
                            <td className="px-6 py-4 text-right tabular-nums text-slate-900">{formatearDivisa(d.total)}</td>
                            <td className="px-8 py-4 text-center">
                              <button onClick={() => setFormData({ ...formData, detalles: formData.detalles.filter((_, idx) => idx !== i) })} className="text-rose-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col items-end gap-3 px-6">
                  <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Subtotal Estimado</span>
                    <span className="text-slate-700">{formatearDivisa(formData.detalles.reduce((s, d) => s + parseFloat(d.total || 0), 0))}</span>
                  </div>
                  <div className="flex gap-10 items-center">
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-teal-600 italic">Total Egresado</span>
                    <span className="text-3xl font-black text-slate-950 tabular-nums">
                      {formatearDivisa(formData.detalles.reduce((s, d) => s + parseFloat(d.total || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="h-12 px-8 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all font-bold">Descartar</button>
              <button onClick={handleSubmit} className="h-14 px-12 rounded-2xl bg-[#0f172a] text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95">
                {editId ? 'Sincronizar Cambios' : 'Confirmar Gasto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Input Modal */}
      {showDetalleModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 px-8 py-5 flex items-center justify-between text-white flex-shrink-0">
              <h4 className="text-[9px] font-black uppercase tracking-widest">Especificar Concepto</h4>
              <button onClick={() => setShowDetalleModal(false)}><XCircle size={18} /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Descripción / Motivo</label>
                <textarea value={detalleTemp.descripcion} onChange={e => setDetalleTemp({ ...detalleTemp, descripcion: e.target.value })} className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all" rows="3" placeholder="..." />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Importe Parcial</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="number" value={detalleTemp.total} onChange={e => setDetalleTemp({ ...detalleTemp, total: e.target.value })} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-lg font-black text-slate-800 outline-none focus:border-emerald-500" placeholder="0.00" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowDetalleModal(false)} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase text-slate-400 border border-slate-100 hover:bg-slate-50">Cerrar</button>
                <button onClick={agregarDetalle} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase bg-emerald-600 text-white shadow-lg shadow-emerald-100 active:scale-95">Agregar Ítem</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GastosDiversos;