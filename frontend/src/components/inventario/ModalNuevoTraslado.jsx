import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Plus,
  Download,
  Info,
  ArrowRightLeft,
  Store,
  Package,
  TrendingDown,
  AlertCircle,
  Hash,
  Trash2,
  CheckCircle2,
  ChevronDown,
  RefreshCcw,
  FileText
} from 'lucide-react';
import { obtenerSucursalesActivas, obtenerProductosActivos, trasladarProducto } from '../../services/inventarioService';
import { obtenerProductosConInventario } from '../../services/productoService';
import FormularioVentaProductServicio from './FormularioVentaProductServicio';
import Swal from 'sweetalert2';

const ModalNuevoTraslado = ({ isOpen, onClose, onTrasladoCreado }) => {
  const [formData, setFormData] = useState({
    sucursalOrigenId: '',
    sucursalDestinoId: '',
    motivoTraslado: '',
    cantidadActual: 0,
    cantidadTraslado: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [productosEncontrados, setProductosEncontrados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    if (isOpen) {
      cargarDatosIniciales();
    }
  }, [isOpen]);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      const [sucursalesRes, productosRes] = await Promise.all([
        obtenerSucursalesActivas(),
        obtenerProductosActivos()
      ]);

      setSucursales(sucursalesRes.data || []);
      setProductosDisponibles(productosRes.data || []);

      if (sucursalesRes.data && sucursalesRes.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          sucursalOrigenId: sucursalesRes.data[0].id
        }));
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductoSeleccionado = (producto) => {
    setProductoSeleccionado(producto);
    setFormData(prev => ({
      ...prev,
      cantidadActual: producto.stock || 0,
      cantidadTraslado: 1
    }));
    setMostrarFormularioProducto(false);
  };

  const agregarProductoALista = () => {
    if (!productoSeleccionado) return;

    if (formData.cantidadTraslado <= 0) {
      Swal.fire('Atención', 'La cantidad debe ser mayor a 0', 'warning');
      return;
    }

    if (formData.cantidadTraslado > formData.cantidadActual) {
      Swal.fire('Atención', 'No hay suficiente stock disponible', 'warning');
      return;
    }

    const nuevoProducto = {
      id: Date.now(),
      productoId: productoSeleccionado.productoId || productoSeleccionado.id,
      codigo: productoSeleccionado.Producto?.codigo || productoSeleccionado.codigo,
      nombre: productoSeleccionado.Producto?.nombre || productoSeleccionado.nombre,
      cantidad: parseInt(formData.cantidadTraslado),
      stockActual: formData.cantidadActual
    };

    setProducts(prev => [...prev, nuevoProducto]);
    setProductoSeleccionado(null);
    setFormData(prev => ({ ...prev, cantidadActual: 0, cantidadTraslado: 0 }));
  };

  const eliminarProducto = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async () => {
    if (!formData.sucursalOrigenId || !formData.sucursalDestinoId) {
      Swal.fire('Atención', 'Seleccione sucursales de origen y destino', 'warning');
      return;
    }

    if (formData.sucursalOrigenId == formData.sucursalDestinoId) {
      Swal.fire('Atención', 'Las sucursales deben ser diferentes', 'warning');
      return;
    }

    if (products.length === 0) {
      Swal.fire('Atención', 'Agregue al menos un producto', 'warning');
      return;
    }

    try {
      setLoading(true);
      for (const producto of products) {
        await trasladarProducto({
          productoId: producto.productoId,
          sucursalOrigenId: parseInt(formData.sucursalOrigenId),
          sucursalDestinoId: parseInt(formData.sucursalDestinoId),
          cantidad: producto.cantidad,
          observacion: formData.motivoTraslado || 'Traslado entre sucursales'
        });
      }

      Swal.fire('¡Éxito!', 'Traslado registrado correctamente', 'success');
      onTrasladoCreado?.();
      handleCancel();
    } catch (error) {
      Swal.fire('Error', 'No se pudo completar el traslado', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      sucursalOrigenId: '',
      sucursalDestinoId: '',
      motivoTraslado: '',
      cantidadActual: 0,
      cantidadTraslado: 0
    });
    setProducts([]);
    setProductoSeleccionado(null);
    setMostrarFormularioProducto(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-violet-900 px-10 py-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <ArrowRightLeft size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Nueva Operación de Traslado</h2>
                <div className="flex items-center gap-2 text-indigo-200 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                  <TrendingDown size={14} /> Logística Interna de Inventarios
                </div>
              </div>
            </div>
            <button onClick={onClose} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-10 space-y-8 overflow-y-auto max-h-[75vh] custom-scrollbar bg-slate-50/30">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Config Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                  <Store size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Configuración de Ruta</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Sucursal Origen</label>
                  <div className="relative">
                    <select
                      value={formData.sucursalOrigenId}
                      onChange={(e) => handleInputChange('sucursalOrigenId', e.target.value)}
                      className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none"
                    >
                      <option value="">Seleccione origen...</option>
                      {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Sucursal Destino</label>
                  <div className="relative">
                    <select
                      value={formData.sucursalDestinoId}
                      onChange={(e) => handleInputChange('sucursalDestinoId', e.target.value)}
                      className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none"
                    >
                      <option value="">Seleccione destino...</option>
                      {sucursales.filter(s => s.id != formData.sucursalOrigenId).map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Motivo / Observación</label>
                <textarea
                  value={formData.motivoTraslado}
                  onChange={(e) => handleInputChange('motivoTraslado', e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 py-4 px-5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none"
                  placeholder="Detalle el motivo del movimiento logístico..."
                  rows="2"
                />
              </div>
            </div>

            {/* Product Selection Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
                    <Package size={20} />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Seleccionar Item</h3>
                </div>
                <button
                  onClick={() => setMostrarFormularioProducto(true)}
                  className="flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-800 transition-all uppercase tracking-widest"
                >
                  <Search size={16} /> BUSCAR PRODUCTO
                </button>
              </div>

              {productoSeleccionado ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="rounded-2xl bg-indigo-50 p-6 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Producto Seleccionado</span>
                      <p className="text-sm font-bold text-slate-700 uppercase mt-1">{productoSeleccionado.Producto?.nombre || productoSeleccionado.nombre}</p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">CÓD: {productoSeleccionado.Producto?.codigo || productoSeleccionado.codigo}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Disponible</span>
                      <p className="text-xl font-black text-indigo-600 tabular-nums">{formData.cantidadActual}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Cant. Traslado</label>
                      <input
                        type="number"
                        value={formData.cantidadTraslado}
                        onChange={(e) => handleInputChange('cantidadTraslado', e.target.value)}
                        className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-center text-xl font-black text-indigo-600 focus:border-indigo-500 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={agregarProductoALista}
                        className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={20} /> AGREGAR
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[180px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300">
                  <Package size={48} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4">Sin producto seleccionado</p>
                  <button
                    onClick={() => setMostrarFormularioProducto(true)}
                    className="mt-4 px-6 py-2 rounded-xl bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                  >
                    Vincular Item
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table Card */}
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col">
            <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
                  <FileText size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Resumen de Traslado</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{products.length} Items Listados</span>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-8 py-4 w-12 text-center">#</th>
                    <th className="px-6 py-4">Descripción del Producto</th>
                    <th className="px-6 py-4 text-center">Disponible</th>
                    <th className="px-6 py-4 text-center">A Trasladar</th>
                    <th className="px-8 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-200 group transition-all duration-500 hover:text-indigo-200">
                          <ArrowRightLeft size={80} strokeWidth={1} className="transition-transform group-hover:scale-110" />
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-black uppercase tracking-[0.3em]">Lista de Carga Vacía</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agregue productos para iniciar el traslado</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((p, idx) => (
                      <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-center font-bold text-slate-300">{idx + 1}</td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-700 uppercase">{p.nombre}</span>
                            <div className="flex items-center gap-2">
                              <Hash size={12} className="text-indigo-400" />
                              <span className="text-[10px] text-slate-400 font-bold tracking-widest">{p.codigo || 'S/C'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex rounded-lg bg-amber-50 px-3 py-1 text-[10px] font-black text-amber-600 uppercase border border-amber-100">{p.stockActual} UNI</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-black text-white shadow-sm">{p.cantidad} UNI</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <button
                            onClick={() => eliminarProducto(p.id)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-400 transition-all hover:bg-red-500 hover:text-white active:scale-95 shadow-sm mx-auto"
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
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumen de Carga</span>
            <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">{products.length} Productos por trasladar</p>
          </div>
          <div className="flex items-center gap-4 flex-1 md:flex-initial">
            <button
              onClick={handleCancel}
              className="px-10 h-14 rounded-2xl font-black text-[10px] text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all uppercase tracking-[0.3em]"
            >
              Descartar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || products.length === 0}
              className="flex-1 md:flex-initial px-12 h-14 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <RefreshCcw size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
              {loading ? 'PROCESANDO...' : 'EJECUTAR TRASLADO'}
            </button>
          </div>
        </div>
      </div>

      {/* Nested Product Search Modal */}
      {mostrarFormularioProducto && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col border border-white/50">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                  <Search size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Seleccionar Producto</h3>
              </div>
              <button
                onClick={() => setMostrarFormularioProducto(false)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-10 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar bg-slate-50/20">
              <FormularioVentaProductServicio
                onProductoSeleccionado={handleProductoSeleccionado}
                productos={productosDisponibles}
                contexto="traslado"
                sucursalOrigenId={formData.sucursalOrigenId}
              />
            </div>

            <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setMostrarFormularioProducto(false)}
                className="h-12 px-10 rounded-2xl text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
              >
                Cerrar Búsqueda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalNuevoTraslado;