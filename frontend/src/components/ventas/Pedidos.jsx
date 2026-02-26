import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  RefreshCcw,
  Filter,
  Settings,
  Calendar,
  User,
  Building,
  Truck,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  X,
  UserPlus,
  ShoppingCart,
  Hash,
  Briefcase,
  Eye,
  Trash2,
  FileText,
  AlertTriangle,
  LayoutGrid,
  Save,
  ChevronDown,
  MapPin,
  ArrowRight
} from 'lucide-react';
import ModalCliente from './ModalCliente';
import FormularioVentaProductServicio from './FormularioVentaProductServicio';
import { obtenerClientes } from '../../services/clienteService';
import { listarPedidos, crearPedido } from '../../services/pedidoService';
import Swal from 'sweetalert2';

const Pedidos = () => {
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    fechaEmision: true,
    fechaEntrega: true,
    vendedor: true,
    cliente: true,
    pedido: true,
    moneda: true,
    total: true,
    acciones: true
  });

  const columnLabels = {
    fechaEmision: 'F. Emisión',
    fechaEntrega: 'F. Entrega',
    vendedor: 'Vendedor',
    cliente: 'Cliente',
    pedido: 'N° Pedido',
    moneda: 'Moneda',
    total: 'Total',
    acciones: 'Acciones'
  };

  const [pedidosData, setPedidosData] = useState([]);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const resp = await listarPedidos();
      setPedidosData(resp.pedidos || []);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE');
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto || 0);
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-200">
            <ClipboardList size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Gestión de Pedidos</h2>
            <p className="text-sm font-medium text-slate-500">Control de preventas y órdenes de despacho</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => cargarPedidos()}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-menta-petroleo shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-6 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:translate-y-[-1px] active:scale-95 uppercase tracking-tighter"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            NUEVO PEDIDO
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Hash size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Pedidos</p>
              <p className="text-2xl font-bold text-slate-800">{pedidosData.length}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-200" />
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Monto Proyectado</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatearMoneda(pedidosData.reduce((s, p) => s + (parseFloat(p.total) || 0), 0))}
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500" />
        </div>

        <div className="relative group overflow-hidden rounded-2xl border border-menta-marino/10 bg-white p-6 shadow-sm transition-all hover:shadow-md col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-menta-marino">
              <Briefcase size={22} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Promedio por Pedido</p>
              <p className="text-2xl font-bold text-menta-marino">
                {formatearMoneda(pedidosData.length > 0 ? (pedidosData.reduce((s, p) => s + (parseFloat(p.total) || 0), 0) / pedidosData.length) : 0)}
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-menta-marino" />
        </div>
      </div>

      {/* Filters & Config */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-menta-turquesa">
              <Filter size={18} />
            </div>
            <h3 className="text-sm font-bold text-menta-petroleo uppercase tracking-tight">Filtros y Configuración</h3>
          </div>
          <button
            onClick={() => setShowColumnModal(!showColumnModal)}
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-menta-petroleo transition-colors"
          >
            <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
            Configurar Columnas
          </button>
        </div>

        {showColumnModal && (
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-4 lg:grid-cols-6 animate-in fade-in slide-in-from-top-2 duration-200">
            {Object.entries(columnLabels).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600 hover:text-menta-petroleo transition-colors px-2 py-1.5 rounded-lg hover:bg-white">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-menta-petroleo focus:ring-menta-petroleo/20 transition-all font-bold"
                  checked={visibleColumns[key]}
                  onChange={() => toggleColumn(key)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">#</th>
                {visibleColumns.fechaEmision && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Emisión</th>}
                {visibleColumns.pedido && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">N° Pedido</th>}
                {visibleColumns.cliente && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Cliente</th>}
                {visibleColumns.vendedor && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Vendedor</th>}
                {visibleColumns.moneda && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Moneda</th>}
                {visibleColumns.total && <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Total</th>}
                {visibleColumns.acciones && <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="20" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-orange-500" />
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Cargando pedidos...</p>
                    </div>
                  </td>
                </tr>
              ) : pedidosData.length === 0 ? (
                <tr>
                  <td colSpan="20" className="py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-4">
                      <ClipboardList size={48} className="text-slate-200" />
                      <div className="space-y-1">
                        <p className="text-lg font-bold uppercase tracking-tighter">Sin pedidos</p>
                        <p className="text-xs">No se encontraron registros de preventa</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                pedidosData.map((pedido, index) => (
                  <tr key={pedido.id || index} className="group transition hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">{index + 1}</td>
                    {visibleColumns.fechaEmision && (
                      <td className="px-6 py-4 font-semibold text-slate-700">{formatearFecha(pedido.fechaEmision)}</td>
                    )}
                    {visibleColumns.pedido && (
                      <td className="px-6 py-4 font-bold text-menta-petroleo tracking-tighter uppercase font-bold">
                        {pedido.numeroPedido || `PED-${pedido.id}`}
                      </td>
                    )}
                    {visibleColumns.cliente && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                            <User size={14} />
                          </div>
                          <span className="max-w-[180px] truncate font-bold text-slate-700 uppercase">{pedido.Cliente?.nombre || pedido.clienteNombre || 'SIN CLIENTE'}</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.vendedor && <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight">{pedido.vendedor || '-'}</td>}
                    {visibleColumns.moneda && <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{pedido.moneda}</td>}
                    {visibleColumns.total && (
                      <td className="px-6 py-4 text-right font-bold text-slate-900 tracking-tighter">
                        {formatearMoneda(pedido.total)}
                      </td>
                    )}
                    {visibleColumns.acciones && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90">
                            <Eye size={18} />
                          </button>
                          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white transition-all active:scale-90">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNewOrderModal && (
        <NewOrderModal
          onClose={() => setShowNewOrderModal(false)}
          onSaved={(pedidoCreado) => {
            setShowNewOrderModal(false);
            if (pedidoCreado) {
              setPedidosData(prev => [pedidoCreado, ...prev]);
              Swal.fire({
                title: '¡Éxito!',
                text: 'Pedido registrado correctamente.',
                icon: 'success',
                confirmButtonColor: '#126171'
              });
            }
          }}
        />
      )}
    </div>
  );
};

const NewOrderModal = ({ onClose, onSaved }) => {
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    cliente: '',
    direccionEnvio: '',
    vendedor: 'Administrador',
    condicionPago: 'Contado',
    observacion: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    fechaEntrega: '',
    terminoPago: 'Contado',
    moneda: 'Soles',
    tipoCambio: '3.848',
    empresaTransporte: ''
  });

  const [productos, setProductos] = useState([]);
  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await obtenerClientes();
      setClientes(response.clientes || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'cliente') filtrarClientes(value);
  };

  const filtrarClientes = (termino) => {
    if (!termino.trim()) {
      setClientesFiltrados([]);
      setMostrarSugerencias(false);
      return;
    }
    const filtrados = clientes.filter(c =>
      c.nombre?.toLowerCase().includes(termino.toLowerCase()) ||
      c.numeroDocumento?.includes(termino)
    );
    setClientesFiltrados(filtrados);
    setMostrarSugerencias(filtrados.length > 0);
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData(prev => ({
      ...prev,
      cliente: `${cliente.nombre} - ${cliente.numeroDocumento}`,
      direccionEnvio: cliente.direccion || ''
    }));
    setMostrarSugerencias(false);
  };

  const onProductoSeleccionado = (producto) => {
    const precio = Number(producto.precio_venta || producto.precio || 0);
    setProductos(prev => ([
      ...prev,
      {
        id: Date.now(),
        productoId: producto.id,
        descripcion: producto.nombre || producto.descripcion || 'S/N',
        unidad: producto.unidad_medida || 'UND',
        cantidad: 1,
        precioUnitario: precio,
        subtotal: precio,
        total: precio
      }
    ]));
    setMostrarFormularioProducto(false);
  };

  const handleGuardar = async () => {
    if (!clienteSeleccionado) {
      Swal.fire({ title: 'Atención', text: 'Por favor seleccione un cliente.', icon: 'warning', confirmButtonColor: '#126171' });
      return;
    }
    if (productos.length === 0) {
      Swal.fire({ title: 'Atención', text: 'Debe agregar al menos un producto.', icon: 'warning', confirmButtonColor: '#126171' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        clienteId: clienteSeleccionado.id,
        productos: productos.map(p => ({
          ...p,
          cantidad: Number(p.cantidad),
          precioUnitario: Number(p.precioUnitario),
          subtotal: Number(p.cantidad) * Number(p.precioUnitario),
          total: Number(p.cantidad) * Number(p.precioUnitario)
        }))
      };
      const resp = await crearPedido(payload);
      if (resp.pedido) onSaved(resp.pedido);
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'No se pudo registrar el pedido.', icon: 'error', confirmButtonColor: '#126171' });
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto || 0);
  };

  const handleClienteCreado = (nuevoCliente) => {
    setClientes(prev => [...prev, nuevoCliente]);
    seleccionarCliente(nuevoCliente);
    setShowModalCliente(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Nuevo Pedido Preventa</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Registro de orden comercial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Section 1: Client & Logistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <label className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  IDENTIFICACIÓN CLIENTE
                  <button onClick={() => setShowModalCliente(true)} className="text-menta-turquesa flex items-center gap-1 hover:underline">
                    <UserPlus size={14} /> NUEVO
                  </button>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/30 py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none transition"
                    placeholder="Documento o Nombre..."
                    value={formData.cliente}
                    onChange={(e) => handleInputChange('cliente', e.target.value)}
                    onFocus={() => { if (clientesFiltrados.length > 0) setMostrarSugerencias(true); }}
                    onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                  />
                  {mostrarSugerencias && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-slate-100 bg-white shadow-xl max-h-48 overflow-y-auto">
                      {clientesFiltrados.map(c => (
                        <button
                          key={c.id}
                          className="w-full p-3 text-left hover:bg-slate-50 flex flex-col transition border-b last:border-0"
                          onClick={() => seleccionarCliente(c)}
                        >
                          <span className="font-bold text-slate-800">{c.nombre}</span>
                          <span className="text-[10px] text-slate-400">{c.numeroDocumento}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">DIRECCIÓN DE ENTREGA</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none transition"
                    value={formData.direccionEnvio}
                    onChange={(e) => handleInputChange('direccionEnvio', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">FECHA EMISIÓN</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none transition"
                  value={formData.fechaEmision}
                  onChange={(e) => handleInputChange('fechaEmision', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">FECHA ENTREGA</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none transition"
                  value={formData.fechaEntrega}
                  onChange={(e) => handleInputChange('fechaEntrega', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">VENDEDOR</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-slate-200 py-3 px-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none transition h-11"
                    value={formData.vendedor}
                    onChange={(e) => handleInputChange('vendedor', e.target.value)}
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Ventas 1">Ventas 1</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-slate-400" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">MONEDA</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-slate-200 py-3 px-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none transition h-11"
                    value={formData.moneda}
                    onChange={(e) => handleInputChange('moneda', e.target.value)}
                  >
                    <option value="Soles">Soles (S/.)</option>
                    <option value="Dolares">Dólares ($)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-slate-400" size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">OBSERVACIONES INTERNAS</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none transition"
              rows="2"
              placeholder="Detalles sobre el transporte o condiciones especiales..."
              value={formData.observacion}
              onChange={(e) => handleInputChange('observacion', e.target.value)}
            />
          </div>

          {/* Table Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="flex items-center gap-2 text-sm font-bold text-menta-petroleo uppercase tracking-tight">
                <ShoppingCart size={18} /> DETALLE DEL PEDIDO
              </h4>
              <button
                onClick={() => setMostrarFormularioProducto(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 shadow-md shadow-orange-200 transition-all font-bold"
              >
                <Plus size={14} /> AGREGAR PRODUCTO
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Producto</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Cant.</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Precio Unit.</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Total</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-300 font-semibold uppercase tracking-widest text-xs">Sin items agregados</td>
                    </tr>
                  ) : (
                    productos.map((p, idx) => (
                      <tr key={p.id} className="group hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-700 uppercase">{p.descripcion}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            className="w-16 rounded-lg border-none bg-slate-100/50 py-1 text-center font-bold text-slate-700 outline-none"
                            value={p.cantidad}
                            onChange={(e) => {
                              const newArr = [...productos];
                              newArr[idx].cantidad = e.target.value;
                              newArr[idx].total = Number(e.target.value) * Number(newArr[idx].precioUnitario);
                              setProductos(newArr);
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-600">{formatearMoneda(p.precioUnitario)}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">{formatearMoneda(p.total)}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setProductos(prev => prev.filter(x => x.id !== p.id))}
                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex flex-col items-end gap-2">
              <div className="w-full max-w-[320px] space-y-3 rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-200">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>Subtotal Gravado</span>
                  <span className="text-white">{formatearMoneda(productos.reduce((s, p) => s + (Number(p.total) || 0), 0) / 1.18)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>Impuesto (18%)</span>
                  <span className="text-white">{formatearMoneda(productos.reduce((s, p) => s + (Number(p.total) || 0), 0) - (productos.reduce((s, p) => s + (Number(p.total) || 0), 0) / 1.18))}</span>
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-[2px] text-menta-turquesa underline underline-offset-8 decoration-menta-turquesa/30">TOTAL PEDIDO</span>
                  <span className="text-3xl font-bold tracking-tighter">{formatearMoneda(productos.reduce((s, p) => s + (Number(p.total) || 0), 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose} className="px-6 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">DESCARTAR</button>
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="group inline-flex items-center gap-2 rounded-xl bg-menta-petroleo px-8 py-3 text-sm font-bold text-white shadow-xl shadow-menta-petroleo/20 hover:bg-menta-marino transition-all hover:translate-y-[-1px] active:scale-95 disabled:opacity-50 uppercase tracking-tighter"
          >
            {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : <><Save size={18} className="group-hover:scale-110 transition-transform" /> GENERAR PEDIDO</>}
          </button>
        </div>

      </div>

      {showModalCliente && (
        <ModalCliente onClose={() => setShowModalCliente(false)} onClienteCreado={handleClienteCreado} />
      )}
      {mostrarFormularioProducto && (
        <FormularioVentaProductServicio onClose={() => setMostrarFormularioProducto(false)} onProductoSeleccionado={onProductoSeleccionado} />
      )}
    </div>
  );
};

export default Pedidos;