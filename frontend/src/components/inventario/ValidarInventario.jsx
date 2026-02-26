import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Search,
  Store,
  RefreshCcw,
  Plus,
  Trash2,
  X,
  Package,
  Hash,
  AlertCircle,
  History,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Calendar,
  Save,
  MessageSquare
} from 'lucide-react';
import { obtenerSucursalesActivas, obtenerInventarioConBusqueda } from '../../services/inventarioService';
import Swal from 'sweetalert2';

const ValidarInventario = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [observations, setObservations] = useState('');
  const [sucursales, setSucursales] = useState([]);
  const [selectedSucursal, setSelectedSucursal] = useState(null);
  const [productos, setProductos] = useState([]);
  const [productosValidacion, setProductosValidacion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [validaciones, setValidaciones] = useState({});

  useEffect(() => {
    cargarSucursales();
    cargarValidaciones();
  }, []);

  const cargarSucursales = async () => {
    try {
      setLoading(true);
      const response = await obtenerSucursalesActivas();
      setSucursales(response.data || []);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las sucursales' });
    } finally {
      setLoading(false);
    }
  };

  const cargarValidaciones = () => {
    try {
      const validacionesGuardadas = localStorage.getItem('validacionesInventario');
      if (validacionesGuardadas) {
        setValidaciones(JSON.parse(validacionesGuardadas));
      }
    } catch (error) {
      console.error('Error al cargar validaciones:', error);
    }
  };

  const guardarValidacion = (sucursalId) => {
    const nuevasValidaciones = {
      ...validaciones,
      [sucursalId]: {
        fecha: new Date().toISOString(),
        usuario: 'Sistematízate Admin',
        productos: productosValidacion.length
      }
    };
    setValidaciones(nuevasValidaciones);
    localStorage.setItem('validacionesInventario', JSON.stringify(nuevasValidaciones));
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (searchProduct.trim() && selectedSucursal) {
      const timeout = setTimeout(() => {
        buscarProductos();
      }, 300);
      setSearchTimeout(timeout);
    } else {
      setProductos([]);
    }
    return () => { if (searchTimeout) clearTimeout(searchTimeout); };
  }, [searchProduct, selectedSucursal]);

  const buscarProductos = async () => {
    try {
      setLoading(true);
      const response = await obtenerInventarioConBusqueda({
        search: searchProduct,
        sucursalId: selectedSucursal.id,
        limit: 8
      });
      setProductos(response.inventario || []);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleValidarClick = (sucursal) => {
    setSelectedSucursal(sucursal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchProduct('');
    setQuantity('');
    setObservations('');
    setProductos([]);
    setProductosValidacion([]);
    setSelectedSucursal(null);
  };

  const handleAgregarProducto = (producto) => {
    if (!quantity || quantity <= 0) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'Ingresa una cantidad válida' });
      return;
    }

    const itemExistente = productosValidacion.find(p => p.id === producto.id);
    if (itemExistente) {
      setProductosValidacion(prev =>
        prev.map(p => p.id === producto.id ? { ...p, cantidadValidada: parseInt(quantity) } : p)
      );
    } else {
      setProductosValidacion(prev => [...prev, {
        id: producto.id,
        nombre: producto.Producto.nombre,
        codigo: producto.Producto.codigo,
        stockActual: producto.stock,
        cantidadValidada: parseInt(quantity)
      }]);
    }
    setQuantity('');
    setSearchProduct('');
    setProductos([]);
  };

  const handleEliminarProducto = (productoId) => {
    setProductosValidacion(prev => prev.filter(p => p.id !== productoId));
  };

  const handleValidar = async () => {
    if (productosValidacion.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Inventario Vacío', text: 'Debe agregar al menos un producto para validar' });
      return;
    }

    const diferencias = productosValidacion.filter(p => p.stockActual !== p.cantidadValidada);
    if (diferencias.length > 0) {
      const result = await Swal.fire({
        title: 'Diferencias Detectadas',
        text: `Se encontraron ${diferencias.length} inconsistencias. ¿Deseas confirmar la validación con estos datos?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#126171',
        confirmButtonText: 'Sí, validar diferencia',
        cancelButtonText: 'Revisar nuevamente'
      });
      if (!result.isConfirmed) return;
    }

    guardarValidacion(selectedSucursal.id);
    Swal.fire({ icon: 'success', title: 'Éxito', text: 'Inventario validado correctamente', timer: 1500, showConfirmButton: false });
    handleCloseModal();
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xl shadow-indigo-200">
            <ClipboardCheck size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Validación de Inventario</h2>
            <p className="text-sm font-medium text-slate-500">Confirmación de existencia física vs stock en sistema por almacén</p>
          </div>
        </div>
        <button
          onClick={cargarSucursales}
          className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          Refrescar Sucursales
        </button>
      </div>

      {/* Warehouse Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
        {loading && sucursales.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando almacenes...</div>
        ) : sucursales.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No hay almacenes activos</div>
        ) : (
          sucursales.map((sucursal) => (
            <div key={sucursal.id} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-50 hover:translate-y-[-4px]">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <Store size={24} />
                </div>
                {validaciones[sucursal.id] && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-600 uppercase tracking-tighter border border-emerald-100">
                    <CheckCircle2 size={12} /> Validado
                  </span>
                )}
              </div>

              <div className="mt-5 space-y-1">
                <h4 className="text-lg font-bold text-slate-800 uppercase tracking-tight">{sucursal.nombre}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Calendar size={14} className="text-slate-300" />
                  <span>Última revisión: <span className="text-slate-600">{validaciones[sucursal.id] ? formatearFecha(validaciones[sucursal.id].fecha) : 'Nunca'}</span></span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handleValidarClick(sucursal)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-50 py-3 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white active:scale-[0.98] shadow-sm uppercase tracking-widest"
                >
                  <ClipboardCheck size={18} /> INICIAR VALIDACIÓN
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Validation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-menta-petroleo to-menta-marino px-10 py-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">Validar: {selectedSucursal?.nombre}</h3>
                  <p className="text-[10px] font-medium text-white/70 uppercase tracking-widest text-indigo-100">Escaneo de productos activos</p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all"><X size={24} /></button>
            </div>

            {/* Modal Body */}
            <div className="p-10 space-y-8 flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {/* Search Control */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Producto / Scanner</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Busca por código o nombre..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 px-12 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition h-12"
                    />
                    <Search className="absolute left-4 top-3.5 text-slate-300" size={20} />
                    {loading && <RefreshCcw className="absolute right-4 top-3.5 animate-spin text-indigo-500" size={20} />}
                  </div>

                  {/* Floating Results Box */}
                  {productos.length > 0 && (
                    <div className="absolute z-10 mt-2 w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in slide-in-from-top-2">
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                        {productos.map((p) => (
                          <div key={p.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => handleAgregarProducto(p)}>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-indigo-500 uppercase">{p.Producto.codigo}</span>
                              <span className="text-sm font-bold text-slate-700 uppercase leading-tight truncate max-w-[180px]">{p.Producto.nombre}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-slate-300">STOCK: {p.stock}</span>
                              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white"><Plus size={16} /></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Cantidad Física</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-center text-lg font-black text-indigo-600 focus:border-indigo-500 outline-none h-12"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => productos.length > 0 && handleAgregarProducto(productos[0])}
                    disabled={!quantity || productos.length === 0}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-100 transition-all hover:translate-y-[-2px] active:scale-95 disabled:opacity-30 uppercase"
                  >
                    <Plus size={20} /> AGREGAR
                  </button>
                </div>
              </div>

              {/* Items List Table */}
              <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Producto</th>
                      <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Encontrado</th>
                      <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Sistema</th>
                      <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 pr-10">Quitar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {productosValidacion.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-20 text-center text-slate-300">
                          <div className="flex flex-col items-center gap-4">
                            <ClipboardCheck size={48} />
                            <p className="text-xs font-bold uppercase tracking-widest">Escanea el primer producto...</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      productosValidacion.map((p) => {
                        const hasDiference = p.stockActual !== p.cantidadValidada;
                        return (
                          <tr key={p.id} className="group hover:bg-slate-50 transition-colors duration-200">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-indigo-400 uppercase leading-none mb-1">#{p.codigo}</span>
                                <span className="font-bold text-slate-700 uppercase">{p.nombre}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex h-8 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                                {p.cantidadValidada}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-slate-400 font-black italic">{p.stockActual}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {hasDiference ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[10px] font-black text-red-500 uppercase border border-red-100">
                                  <AlertCircle size={12} /> Diferencia
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-500 uppercase border border-emerald-100">
                                  <CheckCircle2 size={12} /> Coincide
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right pr-6">
                              <button onClick={() => handleEliminarProducto(p.id)} className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Observations */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold px-1">
                  <MessageSquare size={14} className="text-indigo-400" />
                  <label>Comentario o Hallazgo General</label>
                </div>
                <textarea
                  rows="2"
                  placeholder="Escribe aquí cualquier observación sobre el proceso..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50/50 py-4 px-6 text-sm font-semibold text-slate-700 focus:border-indigo-500 outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
              <button
                onClick={handleCloseModal}
                className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
              >
                DESCARTAR CAMBIOS
              </button>
              <button
                onClick={handleValidar}
                disabled={productosValidacion.length === 0}
                className="flex-[2] h-12 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-menta-petroleo to-menta-marino text-white font-bold text-sm shadow-xl shadow-indigo-100 transition-all hover:translate-y-[-2px] active:scale-95 disabled:opacity-30 uppercase tracking-widest"
              >
                <Save size={20} /> FINALIZAR VALIDACIÓN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidarInventario;