import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Plus,
  Settings,
  Search,
  Trash2,
  Calendar,
  User,
  Building,
  DollarSign,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  MoreVertical,
  RefreshCcw,
  ChevronFirst,
  ChevronLast,
  LayoutGrid
} from 'lucide-react';
import NotaVentaFormulario from './NotaVentaFormulario';
import { obtenerNotasVenta, anularNotaVenta } from '../../services/notaVentaService';
import Swal from 'sweetalert2';

const NotaVentaLista = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [selectedNota, setSelectedNota] = useState(null);
  const [showFormulario, setShowFormulario] = useState(false);
  const [paymentData, setPaymentData] = useState({
    fechaPago: new Date().toISOString().split('T')[0],
    metodoPago: '',
    destino: '',
    referencia: '',
    archivo: null,
    monto: 0
  });

  // Estados para datos reales
  const [notasVenta, setNotasVenta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    fechaEmision: '',
    buscar: '',
    serie: '',
    numero: '',
    estado: '',
    cliente: ''
  });

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    fecha: true,
    serieComprobante: true,
    numeroComprobante: true,
    cliente: true,
    usuario: false,
    sucursal: true,
    subtotal: false,
    igv: false,
    total: true,
    estado: true,
    vendedor: true,
    acciones: true
  });

  const columnLabels = {
    id: 'ID',
    fecha: 'Fecha',
    serieComprobante: 'Serie',
    numeroComprobante: 'Número',
    cliente: 'Cliente',
    usuario: 'Usuario',
    sucursal: 'Sucursal',
    subtotal: 'Subtotal',
    igv: 'IGV',
    total: 'Total',
    estado: 'Estado',
    vendedor: 'Vendedor',
    acciones: 'Acciones'
  };

  // Función para cargar notas de venta
  const cargarNotasVenta = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await obtenerNotasVenta(filtros);
      setNotasVenta(response.notasVenta || []);
    } catch (error) {
      console.error('Error al cargar notas de venta:', error);
      setError('Error al cargar las notas de venta');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarNotasVenta();
  }, []);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarNotasVenta();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filtros]);

  const handleOpenPaymentModal = (nota) => {
    setSelectedNota(nota);
    setShowPaymentModal(true);
    setPaymentData({
      fechaPago: new Date().toISOString().split('T')[0],
      metodoPago: '',
      destino: '',
      referencia: '',
      archivo: null,
      monto: nota.total || 0
    });
  };

  const handleSavePayment = () => {
    setShowPaymentModal(false);
    Swal.fire('¡Éxito!', 'Pago registrado correctamente', 'success');
  };

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaEmision: '',
      buscar: '',
      serie: '',
      numero: '',
      estado: '',
      cliente: ''
    });
  };

  const handleAnularNota = async (notaId) => {
    const result = await Swal.fire({
      title: '¿Anular nota de venta?',
      text: '¿Esta seguro de que desea anular esta nota de venta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#126171',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const { value: motivo } = await Swal.fire({
        title: 'Motivo de anulación',
        input: 'text',
        inputLabel: 'Ingrese el motivo de la anulación',
        inputPlaceholder: 'Ej: Error en digitación',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) return '¡Debe ingresar un motivo!';
        }
      });

      if (motivo) {
        try {
          await anularNotaVenta(notaId, motivo);
          Swal.fire('¡Anulado!', 'La nota de venta ha sido anulada.', 'success');
          cargarNotasVenta();
        } catch (error) {
          Swal.fire('Error', error.message || 'No se pudo anular la nota', 'error');
        }
      }
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto || 0);
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/30">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-menta-suave text-menta-petroleo shadow-sm">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo font-bold">Notas de Venta</h2>
            <p className="text-sm text-slate-500 font-bold">Gestión de comprobantes internos y control de ventas</p>
          </div>
        </div>
        <div className="flex items-center gap-3 font-bold">
          <button
            onClick={() => cargarNotasVenta()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm font-bold"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button
            onClick={() => setShowFormulario(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-menta-petroleo px-5 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:bg-menta-marino active:scale-95 font-bold"
          >
            <Plus size={18} />
            NUEVA NOTA
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap lg:flex-nowrap font-bold italic">
        <div className="flex-1 min-w-[200px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm font-bold italic">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Soles</p>
          <p className="text-2xl font-black text-menta-marino font-bold italic">
            {formatearMoneda(
              notasVenta.filter(n => n.estado !== 'anulada').reduce((s, n) => s + (parseFloat(n.total) || 0), 0)
            )}
          </p>
        </div>
        <div className="flex-1 min-w-[200px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm font-bold italic">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Comprobantes Activos</p>
          <p className="text-2xl font-black text-slate-800 font-bold italic">
            {notasVenta.filter(n => n.estado !== 'anulada').length}
          </p>
        </div>
        <div className="flex-1 min-w-[200px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm font-bold italic">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Anulados</p>
          <p className="text-2xl font-black text-red-500 font-bold italic">
            {notasVenta.filter(n => n.estado === 'anulada').length}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm font-bold italic">
        <div className="mb-4 flex items-center justify-between border-b pb-3 font-bold italic">
          <h3 className="flex items-center gap-2 font-bold text-menta-petroleo font-bold italic">
            <Filter size={18} />
            Configuración y Filtros
          </h3>
          <div className="flex items-center gap-4 font-bold italic">
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="group flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-menta-petroleo transition font-bold italic"
            >
              <Settings size={14} className="group-hover:rotate-45 transition-transform" />
              Columnas
            </button>
            <button
              onClick={() => limpiarFiltros()}
              className="text-xs font-semibold text-slate-400 hover:text-red-500 transition font-bold italic"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {showColumnSettings && (
          <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-4 lg:grid-cols-6 animate-in fade-in slide-in-from-top-2 duration-200 font-bold italic">
            {Object.entries(columnLabels).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-slate-600 hover:text-menta-petroleo transition font-bold italic">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-menta-petroleo focus:ring-menta-petroleo"
                  checked={visibleColumns[key]}
                  onChange={() => toggleColumn(key)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6 font-bold italic">
          <div className="space-y-1.5 font-bold italic">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fecha Emisión</label>
            <div className="relative font-bold italic">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-sm focus:border-menta-turquesa focus:ring-2 focus:ring-menta-turquesa outline-none transition font-bold italic"
                value={filtros.fechaEmision}
                onChange={(e) => handleFiltroChange('fechaEmision', e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-2 space-y-1.5 font-bold italic">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Búsqueda Inteligente</label>
            <div className="relative font-bold italic">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cliente, vendedor, observación..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-sm font-semibold focus:border-menta-turquesa focus:ring-2 focus:ring-menta-turquesa outline-none transition font-bold italic"
                value={filtros.buscar}
                onChange={(e) => handleFiltroChange('buscar', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5 font-bold italic">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Serie</label>
            <input
              type="text"
              placeholder="NV01"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm focus:border-menta-turquesa font-bold italic"
              value={filtros.serie}
              onChange={(e) => handleFiltroChange('serie', e.target.value)}
            />
          </div>
          <div className="space-y-1.5 font-bold italic">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estado</label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm focus:border-menta-turquesa font-bold italic"
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>
          <div className="flex items-end font-bold italic">
            <button
              onClick={() => cargarNotasVenta()}
              className="w-full h-10 rounded-lg bg-fondo text-white font-bold transition hover:bg-slate-800 shadow-md flex items-center justify-center gap-2 italic"
            >
              <Search size={16} />
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-100 font-bold italic">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap font-bold italic">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo font-bold">
              <tr>
                <th className="px-5 py-4 text-center font-bold">#</th>
                {visibleColumns.id && <th className="px-5 py-4 font-bold">ID</th>}
                {visibleColumns.fecha && <th className="px-5 py-4 font-bold">Fecha</th>}
                <th className="px-5 py-4 font-bold">Comprobante</th>
                {visibleColumns.cliente && <th className="px-5 py-4 font-bold">Cliente</th>}
                {visibleColumns.vendedor && <th className="px-5 py-4 font-bold">Vendedor</th>}
                {visibleColumns.total && <th className="px-5 py-4 text-right font-bold">Total</th>}
                {visibleColumns.estado && <th className="px-5 py-4 text-center font-bold">Estado</th>}
                {visibleColumns.acciones && <th className="px-5 py-4 text-center font-bold">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold italic">
              {loading ? (
                <tr>
                  <td colSpan="20" className="py-24 text-center font-bold">
                    <div className="flex flex-col items-center gap-3 font-bold">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-menta-turquesa" />
                      <p className="font-bold text-slate-400 font-bold italic">Sincronizando registros...</p>
                    </div>
                  </td>
                </tr>
              ) : notasVenta.length === 0 ? (
                <tr>
                  <td colSpan="20" className="py-24 text-center font-bold">
                    <div className="flex flex-col items-center gap-3 text-slate-300 font-bold">
                      <FileText size={48} />
                      <p className="text-lg font-bold text-slate-400 font-bold italic">No hay notas de venta registradas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                notasVenta.map((nota, index) => (
                  <tr key={nota.id} className="group transition hover:bg-slate-50/50 font-bold italic">
                    <td className="px-5 py-4 text-center font-medium text-slate-300">
                      {index + 1}
                    </td>
                    {visibleColumns.id && <td className="px-5 py-4 text-slate-400 font-bold italic">#{nota.id}</td>}
                    {visibleColumns.fecha && <td className="px-5 py-4 text-slate-600 font-bold italic">{formatearFecha(nota.fecha)}</td>}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-bold italic">
                        <span className="font-black text-menta-petroleo tracking-tight">{nota.serieComprobante}</span>
                        <span className="text-slate-400">/</span>
                        <span className="font-bold text-slate-700">{nota.numeroComprobante}</span>
                      </div>
                    </td>
                    {visibleColumns.cliente && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 font-bold italic">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-400 uppercase">
                            {(nota.Cliente?.nombre || nota.clienteNombre || 'C').substring(0, 1)}
                          </div>
                          <div className="flex flex-col font-bold italic">
                            <span className="max-w-[180px] truncate font-bold text-slate-800 italic">{nota.Cliente?.nombre || nota.clienteNombre || '-'}</span>
                            <span className="text-[10px] text-slate-400 font-bold italic">{nota.direccionCliente || '-'}</span>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.vendedor && <td className="px-5 py-4 text-slate-500 font-bold italic">{nota.vendedor || '-'}</td>}
                    {visibleColumns.total && (
                      <td className="px-5 py-4 text-right font-black text-slate-900 whitespace-nowrap italic">
                        {formatearMoneda(nota.total)}
                      </td>
                    )}
                    {visibleColumns.estado && (
                      <td className="px-5 py-4 text-center font-bold italic">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-tight transition font-bold italic ${nota.estado?.toLowerCase() === 'anulada' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                          {nota.estado?.toLowerCase() === 'anulada' ? <XCircle size={12} /> : <CheckCircle size={12} />}
                          {nota.estado}
                        </span>
                      </td>
                    )}
                    {visibleColumns.acciones && (
                      <td className="px-5 py-4 text-center font-bold italic">
                        <div className="flex justify-center gap-1 font-bold italic">
                          {nota.estado?.toLowerCase() !== 'anulada' && (
                            <button
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 font-bold italic"
                              onClick={() => handleAnularNota(nota.id)}
                              title="Anular"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          <button
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-menta-turquesa font-bold italic"
                            onClick={() => handleOpenPaymentModal(nota)}
                            title="Pagos/Cobre"
                          >
                            <DollarSign size={18} />
                          </button>
                          <button className="rounded-lg p-2 text-slate-300 hover:text-slate-500 font-bold italic">
                            <MoreVertical size={18} />
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

        {/* Footer info/Pagination */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 px-8 py-5 sm:flex-row font-bold italic">
          <p className="text-sm font-medium text-slate-400">
            Mostrando <span className="font-black text-fondo">{notasVenta.length}</span> registros cargados
          </p>
          <div className="flex items-center gap-1.5 font-bold italic">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 disabled:opacity-30">
              <ChevronFirst size={18} />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <div className="flex h-9 min-w-[36px] items-center justify-center rounded-xl bg-menta-petroleo px-3 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 font-bold italic">
              1
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 disabled:opacity-30">
              <ChevronLast size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-fondo/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-bold italic">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 font-bold italic">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 font-bold italic">
              <div className="flex items-center gap-3 font-bold italic">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold italic">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Registrar Pago</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-black">{selectedNota?.serieComprobante}-{selectedNota?.numeroComprobante}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 font-bold italic"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 font-bold italic">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 font-bold italic">
                <div className="space-y-1 font-bold italic">
                  <label className="text-xs font-bold uppercase text-slate-400">Fecha de Pago</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-bold outline-none focus:border-menta-turquesa font-bold italic"
                    value={paymentData.fechaPago}
                    onChange={(e) => setPaymentData({ ...paymentData, fechaPago: e.target.value })}
                  />
                </div>
                <div className="space-y-1 font-bold italic">
                  <label className="text-xs font-bold uppercase text-slate-400">Monto</label>
                  <div className="relative font-bold italic">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="number"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-lg font-black text-slate-800 outline-none focus:border-emerald-500 font-bold italic"
                      value={paymentData.monto}
                      onChange={(e) => setPaymentData({ ...paymentData, monto: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 font-bold italic">
                <div className="space-y-1 font-bold italic">
                  <label className="text-xs font-bold uppercase text-slate-400">Método de Pago</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-bold outline-none focus:border-menta-turquesa font-bold italic"
                    value={paymentData.metodoPago}
                    onChange={(e) => setPaymentData({ ...paymentData, metodoPago: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="yape/plin">Yape / Plin</option>
                  </select>
                </div>
                <div className="space-y-1 font-bold italic">
                  <label className="text-xs font-bold uppercase text-slate-400">Caja/Banco Destino</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-bold outline-none focus:border-menta-turquesa font-bold italic"
                    value={paymentData.destino}
                    onChange={(e) => setPaymentData({ ...paymentData, destino: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="caja">Caja General</option>
                    <option value="banco">Banco Principal</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 font-bold italic">
                <div className="flex justify-between font-bold italic">
                  <span className="text-sm font-bold text-slate-500 italic">Total del Comprobante:</span>
                  <span className="text-sm font-black text-slate-800 italic">{formatearMoneda(selectedNota?.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 font-bold italic">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-200 font-bold italic"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePayment}
                className="rounded-xl bg-menta-petroleo px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:bg-menta-marino font-bold italic"
              >
                PROCESAR PAGO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario Overlay */}
      {showFormulario && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-fondo/20 backdrop-blur-sm font-bold italic">
          <div className="min-h-screen p-4 flex items-center justify-center font-bold italic">
            <div className="w-full max-w-[1200px] overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-300 font-bold italic">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-5 font-bold italic">
                <div className="flex items-center gap-4 font-bold italic">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-menta-petroleo text-white shadow-sm font-bold italic">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-fondo italic font-bold">Nueva Nota de Venta</h2>
                    <p className="text-sm text-menta-petroleo font-bold italic uppercase tracking-widest text-[10px]">Registro de comprobante interno</p>
                  </div>
                </div>
                <button
                  className="rounded-xl p-3 text-slate-400 transition hover:bg-red-50 hover:text-red-500 font-bold italic"
                  onClick={() => setShowFormulario(false)}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-0 font-bold italic">
                <NotaVentaFormulario onCancel={() => setShowFormulario(false)} onSuccess={() => {
                  setShowFormulario(false);
                  cargarNotasVenta();
                  Swal.fire('¡Éxito!', 'Nota de venta creada satisfactoriamente', 'success');
                }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotaVentaLista;