import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Search,
  RefreshCcw,
  ArrowRightLeft,
  History,
  AlertCircle,
  Package,
  Store,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Calendar,
  Layers,
  FileText,
  Save,
  Tag
} from 'lucide-react';
import {
  obtenerInventario,
  obtenerProductosActivos,
  obtenerSucursalesActivas,
  obtenerReferenciasActivas,
  trasladarProducto,
  removerProducto,
  ajustarStockProducto,
  ingresarProducto
} from '../../services/inventarioService';
import Swal from 'sweetalert2';

const Movimientoinventario = () => {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showIngressModal, setShowIngressModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [inventoryData, setInventoryData] = useState([]);
  const [productos, setProductos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [referencias, setReferencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Paginación (Simulada para la vista)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para formularios
  const [transferForm, setTransferForm] = useState({
    sucursalDestinoId: '',
    cantidad: 0,
    observacion: '',
    comentarios: '',
    fechaRegistro: new Date().toISOString().split('T')[0],
    referenciaId: ''
  });

  const [removeForm, setRemoveForm] = useState({
    cantidad: 0,
    observacion: '',
    comentarios: '',
    fechaRegistro: new Date().toISOString().split('T')[0],
    referenciaId: ''
  });

  const [adjustForm, setAdjustForm] = useState({
    stockReal: 0,
    observacion: '',
    comentarios: '',
    fechaRegistro: new Date().toISOString().split('T')[0],
    referenciaId: ''
  });

  const [ingressForm, setIngressForm] = useState({
    productoId: '',
    sucursalId: '',
    cantidad: 0,
    stockActual: 0,
    motivo: '',
    observacion: '',
    comentarios: '',
    fechaRegistro: new Date().toISOString().split('T')[0],
    referenciaId: ''
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      const [inventarioRes, productosRes, sucursalesRes, referenciasRes] = await Promise.all([
        obtenerInventario(),
        obtenerProductosActivos(),
        obtenerSucursalesActivas(),
        obtenerReferenciasActivas()
      ]);
      setInventoryData(inventarioRes?.inventario || []);
      setProductos(Array.isArray(productosRes?.data) ? productosRes.data : []);
      setSucursales(Array.isArray(sucursalesRes?.data) ? sucursalesRes.data : []);
      setReferencias(Array.isArray(referenciasRes?.data) ? referenciasRes.data : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la información del inventario' });
    } finally {
      setLoading(false);
    }
  };

  const buscarInventario = async () => {
    setLoading(true);
    try {
      const response = await obtenerInventario({ search: searchTerm });
      setInventoryData(response?.inventario || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error al buscar:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'La búsqueda falló' });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (modalType, product) => {
    setSelectedProduct(product);
    if (modalType === 'ingress') setShowIngressModal(true);
    else if (modalType === 'transfer') setShowTransferModal(true);
    else if (modalType === 'remove') setShowRemoveModal(true);
    else if (modalType === 'adjust') {
      setAdjustForm(prev => ({ ...prev, stockReal: product?.stock || 0 }));
      setShowAdjustModal(true);
    }
  };

  const closeAllModals = () => {
    setShowTransferModal(false);
    setShowRemoveModal(false);
    setShowAdjustModal(false);
    setShowIngressModal(false);
    setSelectedProduct(null);
    setTransferForm(prev => ({ ...prev, sucursalDestinoId: '', cantidad: 0, observacion: '', comentarios: '', referenciaId: '' }));
    setRemoveForm(prev => ({ ...prev, cantidad: 0, observacion: '', comentarios: '', referenciaId: '' }));
    setAdjustForm(prev => ({ ...prev, stockReal: 0, observacion: '', comentarios: '', referenciaId: '' }));
    setIngressForm({ productoId: '', sucursalId: '', cantidad: 0, stockActual: 0, motivo: '', observacion: '', comentarios: '', fechaRegistro: new Date().toISOString().split('T')[0], referenciaId: '' });
  };

  const handleTransfer = async () => {
    if (!selectedProduct || !transferForm.sucursalDestinoId || transferForm.cantidad <= 0) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'Complete todos los campos requeridos' });
      return;
    }
    setLoading(true);
    try {
      await trasladarProducto({
        productoId: selectedProduct.productoId,
        sucursalOrigenId: selectedProduct.sucursalId,
        sucursalDestinoId: transferForm.sucursalDestinoId,
        cantidad: transferForm.cantidad,
        observacion: transferForm.observacion,
        comentarios: transferForm.comentarios,
        fechaRegistro: transferForm.fechaRegistro,
        referenciaId: transferForm.referenciaId
      });
      Swal.fire({ icon: 'success', title: 'Traslado exitoso', timer: 1500, showConfirmButton: false });
      closeAllModals();
      cargarDatosIniciales();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedProduct || removeForm.cantidad <= 0) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'Especifique la cantidad a retirar' });
      return;
    }
    setLoading(true);
    try {
      await removerProducto({
        productoId: selectedProduct.productoId,
        sucursalId: selectedProduct.sucursalId,
        cantidad: removeForm.cantidad,
        observacion: removeForm.observacion,
        comentarios: removeForm.comentarios,
        fechaRegistro: removeForm.fechaRegistro,
        referenciaId: removeForm.referenciaId
      });
      Swal.fire({ icon: 'success', title: 'Retiro exitoso', timer: 1500, showConfirmButton: false });
      closeAllModals();
      cargarDatosIniciales();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async () => {
    setLoading(true);
    try {
      await ajustarStockProducto({
        productoId: selectedProduct.productoId,
        sucursalId: selectedProduct.sucursalId,
        stockReal: adjustForm.stockReal,
        observacion: adjustForm.observacion,
        comentarios: adjustForm.comentarios,
        fechaRegistro: adjustForm.fechaRegistro,
        referenciaId: adjustForm.referenciaId
      });
      Swal.fire({ icon: 'success', title: 'Stock ajustado', timer: 1500, showConfirmButton: false });
      closeAllModals();
      cargarDatosIniciales();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleIngress = async () => {
    if (!ingressForm.productoId || !ingressForm.sucursalId || ingressForm.cantidad <= 0) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Complete producto, sucursal y cantidad' });
      return;
    }
    setLoading(true);
    try {
      await ingresarProducto({
        productoId: ingressForm.productoId,
        sucursalId: ingressForm.sucursalId,
        cantidad: ingressForm.cantidad,
        motivo: ingressForm.motivo,
        observacion: ingressForm.observacion,
        comentarios: ingressForm.comentarios,
        fechaRegistro: ingressForm.fechaRegistro,
        referenciaId: ingressForm.referenciaId
      });
      Swal.fire({ icon: 'success', title: 'Ingreso confirmado', timer: 1500, showConfirmButton: false });
      closeAllModals();
      cargarDatosIniciales();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Paginación lógica
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = inventoryData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(inventoryData.length / itemsPerPage);

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xl shadow-indigo-200">
            <Layers size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Gestión de Stock</h2>
            <p className="text-sm font-medium text-slate-500">Control de inventario, traslados y ajustes de almacén</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cargarDatosIniciales}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
          <button
            onClick={() => openModal('ingress', null)}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-6 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:translate-y-[-1px] active:scale-95 uppercase tracking-tighter"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            NUEVO INGRESO
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex flex-wrap gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Items en Inventario</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">{inventoryData.length}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock Saludable</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">
                {inventoryData.filter(i => i.stock > 10).length}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock Crítico / 0</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">
                {inventoryData.filter(i => i.stock <= 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
            <Search size={14} className="text-menta-turquesa" />
            <label>Filtrar por Producto</label>
          </div>
          <div className="relative group">
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-12 text-sm font-semibold text-slate-700 focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 outline-none h-11 transition shadow-sm group-hover:border-slate-300"
              placeholder="Ingresa el nombre o código del producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') buscarInventario(); }}
            />
            <button
              onClick={buscarInventario}
              className="absolute right-2 top-1.5 h-8 w-8 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:bg-menta-petroleo hover:text-white transition-all active:scale-90 shadow-sm border border-slate-100"
            >
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-16">#</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Producto</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Sucursal / Almacén</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Stock Actual</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-menta-petroleo pr-10">Operaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && inventoryData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronizando inventarios...</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-200">
                      <Layers size={48} />
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-800 uppercase tracking-tighter">Inventario Vacío</p>
                        <p className="text-xs text-slate-400">No se encontraron productos en stock</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                          <Package size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{item.Producto?.codigo || item.codigo}</span>
                          <span className="font-bold text-slate-700 uppercase tracking-tight truncate max-w-xs">{item.Producto?.nombre || item.producto}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Store size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          {item.Sucursal?.nombre || item.almacen}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-12 items-center justify-center rounded-lg font-black text-xs shadow-sm
                          ${item.stock <= 0 ? 'bg-red-50 text-red-600 border border-red-100' :
                            item.stock <= 10 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                          {item.stock}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">unidades</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 pr-4">
                        <button
                          onClick={() => openModal('transfer', item)}
                          className="flex h-9 items-center gap-2 rounded-xl bg-slate-50 px-3 text-[10px] font-bold uppercase text-slate-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm"
                        >
                          <ArrowRightLeft size={14} /> Trasladar
                        </button>
                        <button
                          onClick={() => openModal('remove', item)}
                          className="flex h-9 items-center gap-2 rounded-xl bg-slate-50 px-3 text-[10px] font-bold uppercase text-slate-400 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
                        >
                          <Trash2 size={14} /> Retiro
                        </button>
                        <button
                          onClick={() => openModal('adjust', item)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-amber-500 hover:text-white transition-all active:scale-95 shadow-sm"
                          title="Ajuste Manual"
                        >
                          <Info size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 gap-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            MOSTRANDO <span className="text-slate-700">{Math.min(indexOfFirstItem + 1, inventoryData.length)}</span> - <span className="text-slate-700">{Math.min(indexOfLastItem, inventoryData.length)}</span> DE <span className="text-slate-700">{inventoryData.length}</span> PRODUCTOS
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-30 active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex h-9 items-center px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm min-w-[60px] justify-center">
              {currentPage} / {totalPages || 1}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-30 active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Modal Trasladar */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-10 py-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                    <ArrowRightLeft size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">Trasladar Producto</h3>
                    <p className="text-[10px] font-medium text-white/70 uppercase tracking-widest">Movimiento entre almacenes</p>
                  </div>
                </div>
                <button onClick={closeAllModals} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-10 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item a Trasladar</p>
                  <p className="text-sm font-bold text-slate-700 uppercase">{selectedProduct?.Producto?.nombre || selectedProduct?.producto}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stock Actual</p>
                  <p className="text-xl font-black text-indigo-600">{selectedProduct?.stock}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                    <Store size={14} className="text-menta-turquesa" />
                    <label>Almacén Local</label>
                  </div>
                  <input readOnly className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 px-4 text-sm font-semibold text-slate-500 outline-none"
                    value={selectedProduct?.Sucursal?.nombre || selectedProduct?.almacen} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                    <ArrowDownRight size={14} className="text-emerald-500" />
                    <label>Sucursal Destino</label>
                  </div>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition"
                      value={transferForm.sucursalDestinoId}
                      onChange={(e) => setTransferForm({ ...transferForm, sucursalDestinoId: e.target.value })}>
                      <option value="">Seleccionar destino</option>
                      {sucursales.filter(s => s.id !== selectedProduct?.sucursalId).map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 text-slate-400" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                    <Hash size={14} className="text-menta-turquesa" />
                    <label>Cantidad a Enviar</label>
                  </div>
                  <input type="number" className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition"
                    placeholder="0" value={transferForm.cantidad} onChange={(e) => setTransferForm({ ...transferForm, cantidad: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                    <Calendar size={14} className="text-indigo-400" />
                    <label>Fecha de Operación</label>
                  </div>
                  <input type="date" className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none"
                    value={transferForm.fechaRegistro} onChange={(e) => setTransferForm({ ...transferForm, fechaRegistro: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                  <FileText size={14} className="text-menta-turquesa" />
                  <label>Observaciones / Motivo</label>
                </div>
                <textarea rows="2" className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-semibold text-slate-700 focus:border-indigo-500 outline-none transition resize-none"
                  placeholder="Detalla el motivo del traslado..." value={transferForm.observacion} onChange={(e) => setTransferForm({ ...transferForm, observacion: e.target.value })} />
              </div>
            </div>

            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button onClick={closeAllModals} className="flex-1 h-12 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-400 hover:bg-slate-100 transition-all">CANCELAR</button>
              <button onClick={handleTransfer} disabled={loading} className="flex-[2] h-12 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:translate-y-[-1px] transition-all active:scale-95 disabled:opacity-50">
                {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />} PROCESAR TRASLADO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Retiro */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="bg-gradient-to-r from-red-600 to-red-800 px-8 py-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight">Retirar Producto</h3>
                  <p className="text-[10px] font-medium text-white/70 uppercase tracking-widest">Baja de inventario</p>
                </div>
              </div>
              <button onClick={closeAllModals} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between rounded-xl bg-red-50 p-4 border border-red-100">
                <div className="flex items-center gap-3">
                  <Package className="text-red-600" size={20} />
                  <span className="text-xs font-bold text-slate-700 uppercase truncate max-w-[200px]">{selectedProduct?.Producto?.nombre || selectedProduct?.producto}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-red-400 uppercase">En stock</p>
                  <p className="text-lg font-black text-red-600">{selectedProduct?.stock}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold"><Hash size={14} className="text-red-500" /><label>Cantidad</label></div>
                  <input type="number" className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-bold text-slate-700 focus:border-red-500 outline-none"
                    placeholder="0" value={removeForm.cantidad} onChange={(e) => setRemoveForm({ ...removeForm, cantidad: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold"><Calendar size={14} className="text-red-500" /><label>Fecha</label></div>
                  <input type="date" className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-bold text-slate-700 focus:border-red-500 outline-none"
                    value={removeForm.fechaRegistro} onChange={(e) => setRemoveForm({ ...removeForm, fechaRegistro: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold"><FileText size={14} className="text-red-500" /><label>Motivo del Retiro</label></div>
                <input type="text" className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-semibold text-slate-700 focus:border-red-500 outline-none"
                  placeholder="Ej: Producto dañado, Vencimiento..." value={removeForm.observacion} onChange={(e) => setRemoveForm({ ...removeForm, observacion: e.target.value })} />
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button onClick={closeAllModals} className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-400 hover:bg-slate-100">CANCELAR</button>
              <button onClick={handleRemove} className="flex-[2] h-11 flex items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white shadow-lg shadow-red-200 active:scale-95 transition-all">
                <Trash2 size={18} /> CONFIRMAR RETIRO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajuste */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="bg-gradient-to-r from-amber-500 to-amber-700 px-8 py-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                  <RefreshCcw size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight">Ajuste Manual</h3>
                  <p className="text-[10px] font-medium text-white/70 uppercase tracking-widest">Sincronización de stock físico</p>
                </div>
              </div>
              <button onClick={closeAllModals} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-amber-50 p-4 border border-amber-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-amber-600 uppercase">Stock Sistema</p>
                  <p className="text-2xl font-black text-slate-800 tabular-nums">{selectedProduct?.stock}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold text-amber-600 uppercase text-right">Nueva Cantidad Real</p>
                  <input type="number" className="w-24 text-right bg-white rounded-lg border-2 border-amber-200 py-1 px-2 text-2xl font-black text-amber-700 focus:border-amber-500 outline-none transition"
                    value={adjustForm.stockReal} onChange={(e) => setAdjustForm({ ...adjustForm, stockReal: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold"><FileText size={14} className="text-amber-500" /><label>Explicación del Ajuste</label></div>
                  <input type="text" className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-semibold text-slate-700 focus:border-amber-500 outline-none"
                    placeholder="Ej: Error de digitación, auditoría..." value={adjustForm.observacion} onChange={(e) => setAdjustForm({ ...adjustForm, observacion: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={closeAllModals} className="flex-1 h-11 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-400">CANCELAR</button>
              <button onClick={handleAdjust} className="flex-[2] h-11 flex items-center justify-center gap-2 rounded-xl bg-amber-600 text-sm font-bold text-white shadow-lg shadow-amber-200 active:scale-95 transition-all">
                <Save size={18} /> APLICAR CAMBIOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ingreso */}
      {showIngressModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 px-10 py-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                    <ArrowUpRight size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Nuevo Ingreso</h3>
                    <p className="text-[10px] font-medium text-white/70 uppercase tracking-widest">Entrada de stock a almacén</p>
                  </div>
                </div>
                <button onClick={closeAllModals} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-10 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Producto */}
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                    <Package size={14} className="text-emerald-500" />
                    <label>Seleccionar Producto</label>
                  </div>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none transition h-12"
                      value={ingressForm.productoId}
                      onChange={(e) => {
                        const pId = parseInt(e.target.value);
                        const p = productos.find(x => x.id === pId);
                        setIngressForm({ ...ingressForm, productoId: e.target.value, stockActual: p?.stock || 0 });
                      }}>
                      <option value="">Buscar producto...</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-4 text-slate-400" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold"><Hash size={14} className="text-emerald-500" /><label>Cantidad a Ingresar</label></div>
                  <input type="number" className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-lg font-black text-emerald-600 focus:border-emerald-500 outline-none h-12"
                    placeholder="0" value={ingressForm.cantidad} onChange={(e) => setIngressForm({ ...ingressForm, cantidad: parseInt(e.target.value) || 0 })} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold"><Store size={14} className="text-emerald-500" /><label>Almacén de Destino</label></div>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none transition h-12"
                      value={ingressForm.sucursalId} onChange={(e) => setIngressForm({ ...ingressForm, sucursalId: e.target.value })}>
                      <option value="">Seleccionar Sucursal</option>
                      {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-4 text-slate-400" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold"><Tag size={14} className="text-indigo-400" /><label>Referencia / Documento</label></div>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-700 focus:border-emerald-500 outline-none transition h-12"
                      value={ingressForm.referenciaId} onChange={(e) => setIngressForm({ ...ingressForm, referenciaId: e.target.value })}>
                      <option value="">Seleccionar referencia</option>
                      {referencias.map(r => <option key={r.id} value={r.id}>{r.codigo} - {r.descripcion}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-4 text-slate-400" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold"><Calendar size={14} className="text-indigo-400" /><label>Fecha Registro</label></div>
                  <input type="date" className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-700 h-12 focus:border-emerald-500 outline-none"
                    value={ingressForm.fechaRegistro} onChange={(e) => setIngressForm({ ...ingressForm, fechaRegistro: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold"><FileText size={14} className="text-emerald-500" /><label>Comentarios Internos</label></div>
                <textarea rows="2" className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-semibold text-slate-700 focus:border-emerald-500 outline-none resize-none"
                  placeholder="Detalles adicionales sobre el ingreso..." value={ingressForm.comentarios} onChange={(e) => setIngressForm({ ...ingressForm, comentarios: e.target.value })} />
              </div>
            </div>

            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button onClick={closeAllModals} className="flex-1 h-12 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-400 hover:bg-slate-50">CANCELAR</button>
              <button onClick={handleIngress} disabled={loading} className="flex-[2] h-12 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50">
                <CheckCircle2 size={20} /> FINALIZAR INGRESO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movimientoinventario;