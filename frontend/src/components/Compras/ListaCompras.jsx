import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Search,
  FileText,
  Calendar,
  UserPlus,
  ChevronRight,
  Layout,
  ShoppingBag,
  Truck,
  Building,
  CreditCard,
  DollarSign,
  Clock,
  RefreshCcw,
  Settings,
  Download,
  FileDown,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ArrowLeft,
  Info,
  Package,
  FileDigit,
  User,
  Hash,
  ArrowRight,
  Filter,
  Eye,
  Edit3,
  Upload,
  ChevronLeft,
  ChevronFirst,
  ChevronLast,
  Briefcase,
  Layers,
  Activity,
  AlertCircle
} from 'lucide-react';
import { obtenerCompras, eliminarCompra, subirXmlCompra, obtenerCompraPorId } from '../../services/compraService';
import { obtenerProveedores } from '../../services/proveedorService';
import Swal from 'sweetalert2';

// Funciones auxiliares
const formatearNumero = (valor, decimales = 2) => {
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(numero) || numero === null || numero === undefined) return '0.00';
  return numero.toFixed(decimales);
};

const formatearDivisa = (monto, moneda = 'PEN') => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: moneda === 'PEN' ? 'PEN' : 'USD',
    minimumFractionDigits: 2
  }).format(monto || 0);
};

const ListaCompras = () => {
  const navigate = useNavigate();
  const [modalPagos, setModalPagos] = useState(false);
  const [modalProductos, setModalProductos] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [archivoXml, setArchivoXml] = useState(null);
  const [cargandoImportacion, setCargandoImportacion] = useState(false);
  const [compras, setCompras] = useState([]);
  const [comprasFiltradas, setComprasFiltradas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [filtros, setFiltros] = useState({
    busqueda: '',
    proveedor: '',
    estado: '',
    estadoPago: '',
    numero: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [compras, filtros]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [comprasData, proveedoresData] = await Promise.all([
        obtenerCompras(),
        obtenerProveedores()
      ]);

      const comprasArray = comprasData.compras || comprasData || [];
      const comprasProcesadas = comprasArray.map(compra => ({
        ...compra,
        total: parseFloat(compra.total) || 0,
        pagos: compra.pagos || [],
        detalles: compra.detalles || []
      }));

      setCompras(comprasProcesadas);
      setProveedores(Array.isArray(proveedoresData) ? proveedoresData : (proveedoresData?.proveedores || []));
      setError(null);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar las compras');
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las compras' });
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...compras];

    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(compra => {
        const proveedor = getProveedorNombre(compra.proveedorId).toLowerCase();
        const numero = compra.numeroComprobante?.toLowerCase() || '';
        return proveedor.includes(busqueda) || numero.includes(busqueda);
      });
    }

    if (filtros.proveedor) {
      resultado = resultado.filter(compra => compra.proveedorId === parseInt(filtros.proveedor));
    }

    setComprasFiltradas(resultado);
  };

  const getProveedorNombre = (proveedorId) => {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    return proveedor ? proveedor.nombre : 'Proveedor S/N';
  };

  const getProveedorRuc = (proveedorId) => {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    return proveedor ? proveedor.ruc : '';
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const limpiarFiltros = () => {
    setFiltros({ busqueda: '', proveedor: '', estado: '', estadoPago: '', numero: '' });
  };

  const abrirModalPagos = async (item) => {
    try {
      setCargando(true);
      const response = await obtenerCompraPorId(item.id);
      setSelectedItem(response.compra || response);
      setModalPagos(true);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los pagos', 'error');
    } finally {
      setCargando(false);
    }
  };

  const abrirModalProductos = async (item) => {
    try {
      setCargando(true);
      const response = await obtenerCompraPorId(item.id);
      setSelectedItem(response.compra || response);
      setModalProductos(true);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
    } finally {
      setCargando(false);
    }
  };

  const handleImportarXml = async () => {
    if (!archivoXml) {
      Swal.fire('Atención', 'Seleccione un archivo XML', 'warning');
      return;
    }

    try {
      setCargandoImportacion(true);
      const formData = new FormData();
      formData.append('xmlFile', archivoXml);
      await subirXmlCompra(formData);
      Swal.fire('¡Éxito!', 'XML importado correctamente', 'success');
      await cargarDatos();
      setModalImportar(false);
      setArchivoXml(null);
    } catch (error) {
      Swal.fire('Error', 'No se pudo importar el XML', 'error');
    } finally {
      setCargandoImportacion(false);
    }
  };

  const handleEliminarCompra = async (compra) => {
    const result = await Swal.fire({
      title: '¿Eliminar Compra?',
      text: `Se eliminará el registro ${compra.numeroComprobante}. Esta acción es irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await eliminarCompra(compra.id);
        Swal.fire('Eliminado', 'La compra ha sido eliminada', 'success');
        await cargarDatos();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la compra', 'error');
      }
    }
  };

  const totalMontoCompras = comprasFiltradas.reduce((sum, c) => sum + (parseFloat(c.total) || 0), 0);

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/20 min-h-screen animate-in fade-in duration-500">

      {/* Premium Header - Different Color (Cyan/Teal) but same structure */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-cyan-700 via-cyan-800 to-teal-900 p-8 text-white shadow-2xl shadow-cyan-200/50">
        <div className="absolute right-0 top-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <ShoppingBag size={280} />
        </div>
        <div className="absolute left-0 bottom-0 p-10 opacity-5 pointer-events-none transform -translate-x-1/4 translate-y-1/4">
          <Truck size={200} />
        </div>

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <ShoppingBag size={32} className="text-cyan-300" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Bitácora de <span className="text-cyan-300">Compras</span></h1>
              <div className="mt-2 flex items-center gap-2 text-cyan-200/80 text-[10px] font-bold uppercase tracking-[0.2em]">
                <Activity size={14} className="text-cyan-400" /> Listado Centralizado de Adquisiciones
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setModalImportar(true)}
              className="flex h-12 items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-6 text-sm font-bold border border-white/10 hover:bg-white/20 transition-all border-dashed"
            >
              <Upload size={20} className="text-cyan-300" /> CARGAR XML
            </button>
            <div className="h-10 w-px bg-white/10 hidden sm:block mx-1" />
            <button
              onClick={() => navigate('/compras/nuevo')}
              className="flex h-14 items-center gap-3 rounded-2xl bg-cyan-500 px-8 text-sm font-black text-slate-900 shadow-xl shadow-cyan-500/20 hover:bg-cyan-400 transition-all active:scale-95 uppercase tracking-widest"
            >
              <Plus size={22} /> Nueva Registro
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <Layers size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Transacciones</p>
            <p className="text-2xl font-black text-slate-800 tracking-tighter">{comprasFiltradas.length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Monto Global</p>
            <p className="text-2xl font-black text-slate-800 tracking-tighter">{formatearDivisa(totalMontoCompras)}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <Truck size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Proveedores</p>
            <p className="text-2xl font-black text-slate-800 tracking-tighter">{proveedores.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-50 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
            <Filter size={20} />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Filtros de Búsqueda</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-5 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Buscar por Referencia</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Razon social, RUC o número..."
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all"
              />
            </div>
          </div>
          <div className="md:col-span-4 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Filtrar por Proveedor</label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <select
                value={filtros.proveedor}
                onChange={(e) => handleFiltroChange('proveedor', e.target.value)}
                className="w-full h-12 appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-10 text-sm font-bold text-slate-700 focus:border-cyan-500 focus:bg-white outline-none transition-all"
              >
                <option value="">Todos los Proveedores</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90" size={18} />
            </div>
          </div>
          <div className="md:col-span-3">
            <button
              onClick={limpiarFiltros}
              className="w-full h-12 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-all active:scale-95 shadow-sm"
            >
              Limpiar Búsqueda
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Table Card */}
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0f172a] text-white">
              <tr className="h-16 uppercase tracking-widest text-[10px] font-black">
                <th className="px-8 py-4 w-12 text-center border-r border-white/5">#</th>
                <th className="px-6 py-4">F. Registro</th>
                <th className="px-6 py-4">Empresa Proveedora</th>
                <th className="px-6 py-4">Serie / Correlativo</th>
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4 text-right">Monto Total</th>
                <th className="px-8 py-4 text-center">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr>
                  <td colSpan="7" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Obteniendo registros...</p>
                    </div>
                  </td>
                </tr>
              ) : comprasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <ShoppingBag size={80} strokeWidth={1} />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">No hay datos que coincidan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                comprasFiltradas.map((compra, index) => (
                  <tr key={compra.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                    <td className="px-8 py-6 text-center text-slate-300 font-bold border-r border-slate-50 italic">{index + 1}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-sm">
                          <Calendar size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-black tracking-tight">{new Date(compra.fechaCompra).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-slate-700 uppercase leading-snug truncate max-w-[220px]">{getProveedorNombre(compra.proveedorId)}</span>
                        <span className="text-[9px] font-black text-slate-400">RUC: {getProveedorRuc(compra.proveedorId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-[13px] tracking-tight">{compra.numeroComprobante}</span>
                        <span className="text-[10px] font-black text-cyan-600 uppercase mt-0.5 tracking-widest">{compra.tipoComprobante}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button
                        onClick={() => abrirModalProductos(compra)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100"
                      >
                        <Eye size={14} /> Detalle
                      </button>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-slate-900 tracking-tighter tabular-nums">{formatearDivisa(compra.total, compra.moneda)}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{compra.moneda || 'PEN'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => navigate(`/compras/editar/${compra.id}`)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90 shadow-sm"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleEliminarCompra(compra)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
                ))}
            </tbody>
          </table>
        </div>

        {/* Custom Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-10 py-6 gap-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Página 1 de 1 - <span className="text-slate-800">{comprasFiltradas.length}</span> registros hallados
          </div>
          <div className="flex items-center gap-3">
            <button disabled className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-300 transition-all opacity-50 cursor-not-allowed shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <div className="flex h-10 min-w-[40px] items-center justify-center rounded-xl bg-cyan-600 px-3 shadow-lg shadow-cyan-600/20">
              <span className="text-xs font-black text-white">1</span>
            </div>
            <button disabled className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-300 transition-all opacity-50 cursor-not-allowed shadow-sm">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {modalProductos && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-cyan-700 to-teal-800 px-10 py-8 text-white relative">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <Package size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Carga de Documento</h3>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">ID COMPRA: {selectedItem.numeroComprobante}</p>
                </div>
              </div>
              <button onClick={() => setModalProductos(false)} className="absolute right-10 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all"><XCircle size={24} /></button>
            </div>

            <div className="p-10 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <table className="w-full text-left text-[11px] whitespace-nowrap">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4 w-12 text-center">#</th>
                    <th className="px-6 py-4">Descripción del Bien</th>
                    <th className="px-6 py-4 text-center">Cant.</th>
                    <th className="px-6 py-4 text-right">P. Unitario</th>
                    <th className="px-6 py-4 text-right">Total Bruto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedItem.DetalleCompras?.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-300 font-bold">{i + 1}</td>
                      <td className="px-6 py-4">
                        <span className="font-black text-slate-700 uppercase tracking-tight">{d.Producto?.nombre || 'Item No Identificado'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex rounded-lg bg-cyan-50 px-3 py-1 font-black text-cyan-600 uppercase ">{d.cantidad}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-500">{formatearDivisa(d.precioUnitario, selectedItem.moneda)}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">{formatearDivisa(d.cantidad * d.precioUnitario, selectedItem.moneda)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Suma Total Documento</span>
                <p className="text-xl font-black text-slate-600 uppercase tracking-tight">{formatearDivisa(selectedItem.total, selectedItem.moneda)}</p>
              </div>
              <button onClick={() => setModalProductos(false)} className="h-12 px-10 rounded-2xl bg-cyan-600 text-[10px] font-black uppercase text-white hover:bg-cyan-700 shadow-sm transition-all active:scale-95 tracking-widest">Cerrar Visor</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Importar XML */}
      {modalImportar && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 px-8 py-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">
                  <Upload size={24} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">Cargar XML</h3>
              </div>
              <button onClick={() => setModalImportar(false)} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-all"><XCircle size={20} /></button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Archivo .XML de facturación</p>
                <div className="group relative">
                  <input
                    type="file"
                    accept=".xml"
                    onChange={(e) => setArchivoXml(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center h-48 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 group-hover:bg-cyan-50/50 group-hover:border-cyan-200 transition-all duration-300">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${archivoXml ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-400'} shadow-sm transition-colors`}>
                      <FileDigit size={24} />
                    </div>
                    <p className={`mt-4 text-xs font-black uppercase tracking-widest text-center px-6 ${archivoXml ? 'text-cyan-700' : 'text-slate-400'}`}>
                      {archivoXml ? archivoXml.name : 'Click o arrastra para cargar'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleImportarXml}
                  disabled={cargandoImportacion || !archivoXml}
                  className="h-14 w-full rounded-2xl bg-cyan-600 text-white font-black uppercase tracking-widest shadow-xl shadow-cyan-600/20 hover:bg-cyan-700 disabled:opacity-30 transition-all active:scale-[0.98]"
                >
                  {cargandoImportacion ? 'Sincronizando...' : 'Ejecutar Carga'}
                </button>
                <button
                  onClick={() => setModalImportar(false)}
                  className="h-12 w-full rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all tracking-widest"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListaCompras;