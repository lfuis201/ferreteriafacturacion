import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Search,
  FileText,
  Calendar,
  ChevronRight,
  Layout,
  ShoppingBag,
  Truck,
  Building,
  DollarSign,
  RefreshCcw,
  XCircle,
  ArrowLeft,
  Info,
  Package,
  Filter,
  Eye,
  Edit3,
  ChevronLeft,
  Activity,
  ClipboardList,
  User,
  Hash,
  Coins
} from 'lucide-react';
import {
  obtenerLiquidaciones,
  crearLiquidacion,
  actualizarLiquidacion,
  eliminarLiquidacion,
  buscarLiquidaciones
} from '../../services/liquidacionCompraService';
import { obtenerProveedores } from '../../services/proveedorService';
import FormularioVentaProductServicio from './FormularioVentaProductServicio';
import Swal from 'sweetalert2';

const LiquidacionCompras = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Número');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [mostrarVentaForm, setMostrarVentaForm] = useState(false);
  const [formData, setFormData] = useState({
    tipoComprobante: 'LIQUIDACIÓN DE COMPRA',
    serie: 'L001',
    fechaEmision: new Date().toISOString().slice(0, 10),
    proveedor: '',
    moneda: 'Soles',
    tipoCambio: '3.468',
    observaciones: '',
    condicionPago: ''
  });

  // Cargar proveedores y liquidaciones iniciales
  useEffect(() => {
    cargarInicial();
  }, []);

  const cargarInicial = async () => {
    try {
      setLoading(true);
      const [provRes, lqRes] = await Promise.all([
        obtenerProveedores(),
        obtenerLiquidaciones()
      ]);
      setProveedores(provRes.proveedores || provRes || []);
      setLiquidaciones(lqRes.liquidaciones || lqRes || []);
    } catch (error) {
      console.error('Error cargando inicial:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setEditingItem(null);
    setFormData({
      tipoComprobante: 'LIQUIDACIÓN DE COMPRA',
      serie: 'L001',
      fechaEmision: new Date().toISOString().slice(0, 10),
      proveedor: '',
      moneda: 'Soles',
      tipoCambio: '3.468',
      observaciones: '',
      condicionPago: ''
    });
    setMostrarVentaForm(false);
    setShowModal(true);
  };

  const handleProductoAgregado = async (producto) => {
    try {
      setLoading(true);
      const precio = parseFloat(producto?.precioVenta || 0);
      const aplicaIgv = !!producto?.tieneIgv;
      const tGravado = aplicaIgv ? (precio / 1.18) : precio;
      const tIgv = aplicaIgv ? (precio - tGravado) : 0;
      const total = parseFloat((tGravado + tIgv).toFixed(2));

      const vendedorNombre = (proveedores.find(p => p.id === parseInt(formData.proveedor))?.nombre) || '—';
      const numeroGenerado = `${formData.serie || 'L001'}-${Date.now().toString().slice(-6)}`;

      const payload = {
        tipoComprobante: formData.tipoComprobante,
        serie: formData.serie,
        numero: numeroGenerado,
        fechaEmision: formData.fechaEmision,
        proveedorId: formData.proveedor || null,
        vendedor: vendedorNombre,
        moneda: formData.moneda === 'Soles' ? 'PEN' : 'USD',
        tipoCambio: formData.tipoCambio,
        observaciones: formData.observaciones,
        condicionPago: formData.condicionPago,
        estado: 'PENDIENTE',
        tInafecto: 0,
        tExonerado: 0,
        tGravado,
        tIgv,
        total
      };

      if (editingItem?.id) {
        await actualizarLiquidacion(editingItem.id, payload);
        Swal.fire('¡Éxito!', 'Liquidación actualizada correctamente', 'success');
      } else {
        await crearLiquidacion(payload);
        Swal.fire('¡Éxito!', 'Liquidación generada con éxito', 'success');
      }

      await cargarInicial();
      setShowModal(false);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudo procesar la liquidación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBuscar = async () => {
    try {
      setLoading(true);
      const filtros = {};
      if (filterType === 'Número') filtros.numero = searchTerm;
      if (filterType === 'Fecha Emisión') filtros.fechaEmision = searchTerm;
      if (filterType === 'Vendedor') filtros.vendedor = searchTerm;

      const res = await buscarLiquidaciones(filtros);
      setLiquidaciones(res.liquidaciones || res || []);
    } catch (error) {
      Swal.fire('Error', 'Error en la búsqueda', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (item) => {
    setEditingItem(item);
    setFormData({
      tipoComprobante: item.tipoComprobante || 'LIQUIDACIÓN DE COMPRA',
      serie: item.serie || 'L001',
      fechaEmision: (item.fechaEmision || '').slice(0, 10),
      proveedor: item.proveedorId || '',
      moneda: item.moneda === 'USD' ? 'Dólares' : 'Soles',
      tipoCambio: item.tipoCambio || '3.468',
      observaciones: item.observaciones || '',
      condicionPago: item.condicionPago || ''
    });
    setMostrarVentaForm(false);
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Confirmar eliminación?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await eliminarLiquidacion(id);
        Swal.fire('Eliminado', 'Registro borrado exitosamente', 'success');
        await cargarInicial();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatearDivisa = (monto, moneda = 'PEN') => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: moneda === 'PEN' ? 'PEN' : 'USD',
      minimumFractionDigits: 2
    }).format(monto || 0);
  };

  const totalEmbolsado = liquidaciones.reduce((sum, l) => sum + (parseFloat(l.total) || 0), 0);

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/20 min-h-screen animate-in fade-in duration-500">

      {/* Premium Header - Matching the Slate/Dark Amber style for Liquidations */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-800 via-slate-900 to-[#020617] p-8 text-white shadow-2xl shadow-slate-200/50">
        <div className="absolute right-0 top-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <ClipboardList size={280} />
        </div>
        <div className="absolute left-0 bottom-0 p-10 opacity-5 pointer-events-none transform -translate-x-1/4 translate-y-1/4">
          <DollarSign size={200} />
        </div>

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <Coins size={32} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Gestión de <span className="text-amber-400">Liquidaciones</span></h1>
              <div className="mt-2 flex items-center gap-2 text-slate-300/80 text-[10px] font-bold uppercase tracking-[0.2em]">
                <Activity size={14} className="text-amber-500" /> Control de Desembolsos Internos
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col text-right mr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Monto Acumulado</span>
              <span className="text-2xl font-black text-amber-400 tabular-nums">{formatearDivisa(totalEmbolsado)}</span>
            </div>
            <div className="h-10 w-px bg-white/10 hidden sm:block mx-1" />
            <button
              onClick={handleOpenModal}
              className="flex h-14 items-center gap-3 rounded-2xl bg-amber-500 px-8 text-sm font-black text-slate-900 shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition-all active:scale-95 uppercase tracking-widest"
            >
              <Plus size={22} /> Generar Liquidación
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Mini-Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-1">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
              <Layout size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Registros</p>
              <p className="text-xl font-black text-slate-800 tabular-nums">{liquidaciones.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-400">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">T. Gravado</p>
              <p className="text-xl font-black text-slate-800 tabular-nums">{formatearDivisa(liquidaciones.reduce((s, l) => s + parseFloat(l.tGravado || 0), 0))}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-400">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">IGV Generado</p>
              <p className="text-xl font-black text-slate-800 tabular-nums">{formatearDivisa(liquidaciones.reduce((s, l) => s + parseFloat(l.tIgv || 0), 0))}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between border-b-4 border-b-amber-500">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Coins size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Gasto Total</p>
              <p className="text-xl font-black text-slate-800 tabular-nums">{formatearDivisa(totalEmbolsado)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-3 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Criterio</label>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <select
                className="w-full h-12 appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 focus:border-amber-500 focus:bg-white outline-none transition-all"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option>Número</option>
                <option>Fecha Emisión</option>
                <option>Vendedor</option>
              </select>
            </div>
          </div>
          <div className="md:col-span-6 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Búsqueda de Liquidación</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Escriba para filtrar registros..."
                className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <button
              onClick={handleBuscar}
              className="w-full h-12 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Ejecutar Búsqueda
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0f172a] text-white">
              <tr className="h-16 uppercase tracking-widest text-[10px] font-black">
                <th className="px-8 py-4 w-12 text-center border-r border-white/5">#</th>
                <th className="px-6 py-4">F. Emisión</th>
                <th className="px-6 py-4">Vendedor / Responsable</th>
                <th className="px-6 py-4">N° Liquidación</th>
                <th className="px-6 py-4 text-right">Monto Bruto</th>
                <th className="px-6 py-4 text-right">I.G.V.</th>
                <th className="px-6 py-4 text-right">Neto Total</th>
                <th className="px-8 py-4 text-center">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando con base de datos...</p>
                    </div>
                  </td>
                </tr>
              ) : liquidaciones.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <ClipboardList size={80} strokeWidth={1} />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">No se registran liquidaciones</p>
                    </div>
                  </td>
                </tr>
              ) : (
                liquidaciones.map((l, index) => (
                  <tr key={l.id || index} className="group hover:bg-slate-50/80 transition-all duration-300">
                    <td className="px-8 py-6 text-center text-slate-300 font-bold border-r border-slate-50 italic">{index + 1}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-amber-600 group-hover:text-white transition-all">
                          <Calendar size={18} />
                        </div>
                        <span className="text-slate-700 font-black tracking-tight">{(l.fechaEmision || '').slice(0, 10)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 uppercase text-xs">{l.vendedor || 'S/N'}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Personal de Operaciones</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-black text-slate-800 tabular-nums tracking-tighter">{l.numero || '-'}</td>
                    <td className="px-6 py-6 text-right font-bold text-slate-500 tabular-nums">{formatearDivisa(l.tGravado)}</td>
                    <td className="px-6 py-6 text-right font-bold text-slate-500 tabular-nums">{formatearDivisa(l.tIgv)}</td>
                    <td className="px-6 py-6 text-right">
                      <span className="text-lg font-black text-slate-900 tabular-nums">{formatearDivisa(l.total)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEditar(l)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleEliminar(l.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-300 hover:bg-red-500 hover:text-white transition-all active:scale-90"
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

      {/* NEW/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

            <div className="bg-gradient-to-r from-slate-800 to-slate-950 px-10 py-8 text-white relative">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Coins size={28} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">{editingItem ? 'Modificar Liquidación' : 'Apertura de Liquidación'}</h3>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Documento Sustentatorio de Operación</p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="absolute right-10 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-all"><XCircle size={24} /></button>
            </div>

            <div className="p-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo Documento</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <select name="tipoComprobante" value={formData.tipoComprobante} onChange={handleInputChange} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none">
                      <option>LIQUIDACIÓN DE COMPRA</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Serie Operativa</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="text" name="serie" value={formData.serie} onChange={handleInputChange} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fec. Emisión</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="date" name="fechaEmision" value={formData.fechaEmision} onChange={handleInputChange} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vendedor / Proveedor</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <select name="proveedor" value={formData.proveedor} onChange={handleInputChange} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none">
                      <option value="">Seleccionar Responsable</option>
                      {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre || p.razonSocial}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Divisa</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <select name="moneda" value={formData.moneda} onChange={handleInputChange} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none">
                      <option>Soles</option>
                      <option>Dólares</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">T. Cambio</label>
                  <div className="relative">
                    <RefreshCcw className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="text" name="tipoCambio" value={formData.tipoCambio} onChange={handleInputChange} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-10">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Glosa / Observaciones</label>
                <textarea name="observaciones" value={formData.observaciones} onChange={handleInputChange} rows="2" className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-bold text-slate-700 outline-none" placeholder="Motivo de la liquidación..."></textarea>
              </div>

              <div className="rounded-3xl bg-slate-900 p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transform translate-x-1/4">
                  <Package size={120} />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Asignación de Bien/Servicio</h4>

                  {!mostrarVentaForm ? (
                    <button
                      onClick={() => setMostrarVentaForm(true)}
                      className="group flex h-16 items-center gap-4 rounded-2xl bg-amber-500 px-10 text-[10px] font-black uppercase tracking-widest text-slate-950 hover:bg-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                    >
                      <Plus size={24} /> Agregar Producto / Servicio
                    </button>
                  ) : (
                    <div className="w-full text-slate-900 bg-white rounded-[2rem] p-8 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selector de inventario / catálogo</span>
                        <button onClick={() => setMostrarVentaForm(false)} className="text-red-500 font-bold text-[10px] uppercase underline">Cerrar buscador</button>
                      </div>
                      <FormularioVentaProductServicio onProductoSeleccionado={handleProductoAgregado} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button onClick={handleCloseModal} className="h-12 px-8 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all">Cancelar Proceso</button>
              <div className="flex items-center gap-3">
                <Info size={16} className="text-amber-500" />
                <span className="text-[9px] font-medium text-slate-400 max-w-[200px] leading-tight uppercase">Los cálculos tributarios se ejecutarán automáticamente al confirmar el item.</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LiquidacionCompras;