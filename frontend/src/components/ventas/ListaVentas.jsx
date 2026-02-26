import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  obtenerVentas,
  anularVenta,
  obtenerEstadoSunat,
  descargarXMLVenta,
  reenviarVentaSunat
} from '../../services/ventaService';
import apiClient from '../../services/apiService';
import guiaRemisionService from '../../services/guiaRemisionService';
import ModalWhatsApp from './ModalWhatsApp';
import Swal from 'sweetalert2';
import {
  FileText,
  Search,
  Trash2,
  ChevronDown,
  ClipboardList,
  RefreshCcw,
  Filter,
  Settings,
  Download,
  Send,
  Share2,
  Truck,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  DollarSign,
  User,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const ListaVentas = ({ onVerDetalle }) => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPdfDropdownId, setOpenPdfDropdownId] = useState(null);

  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    horaInicial: '',
    horaFinal: '',
    clientes: '',
    productos: '',
    categorias: '',
    lote: '',
    fechaEmision: '',
    establecimiento: '',
    estado: '',
    numeroGuia: '',
    placa: '',
    ubicado: '',
    redPago: ''
  });

  const [columnasVisibles, setColumnasVisibles] = useState({
    id: true,
    fechaVenta: true,
    createdAt: true,
    cliente: true,
    tipoComprobante: true,
    serieComprobante: true,
    numeroComprobante: true,
    estado: true,
    estadoSunat: true,
    total: true,
    metodoPago: true,
    acciones: true
  });

  const columnLabels = {
    id: 'ID',
    fechaVenta: 'Fecha Venta',
    createdAt: 'F. Registro',
    cliente: 'Cliente',
    tipoComprobante: 'Tipo',
    serieComprobante: 'Serie',
    numeroComprobante: 'Número',
    estado: 'Estado',
    estadoSunat: 'SUNAT',
    total: 'Total',
    metodoPago: 'Pago',
    acciones: 'Acciones'
  };

  const [mostrarModalWhatsApp, setMostrarModalWhatsApp] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [mostrarColumnas, setMostrarColumnas] = useState(false);

  useEffect(() => {
    cargarVentas();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-pdf-dropdown]')) setOpenPdfDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarVentas();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filtros]);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      const response = await obtenerVentas(filtros);

      let ventasData = [];
      if (Array.isArray(response)) {
        ventasData = response;
      } else if (response && Array.isArray(response.data)) {
        ventasData = response.data;
      } else if (response && Array.isArray(response.ventas)) {
        ventasData = response.ventas;
      }

      const ventasOrdenadas = ventasData.sort((a, b) => {
        return new Date(b.fechaVenta || b.createdAt) - new Date(a.fechaVenta || a.createdAt);
      });

      setVentas(ventasOrdenadas);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      horaInicial: '',
      horaFinal: '',
      clientes: '',
      productos: '',
      categorias: '',
      lote: '',
      fechaEmision: '',
      establecimiento: '',
      estado: '',
      numeroGuia: '',
      placa: '',
      ubicado: '',
      redPago: ''
    });
  };

  const toggleColumna = (columna) => {
    setColumnasVisibles(prev => ({
      ...prev,
      [columna]: !prev[columna]
    }));
  };

  const handleDescargarPDF = async (id, numeroVenta, formato = 'A4') => {
    try {
      const response = await apiClient.get(`/ventas/${id}/pdf?formato=${formato}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = formato === '80mm' ? `ticket_${numeroVenta}.pdf` : `venta_${numeroVenta}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      Swal.fire('¡Éxito!', 'Documento descargado correctamente', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo descargar el PDF', 'error');
    }
  };

  const handleDescargarXML = async (id, numeroVenta) => {
    try {
      const blob = await descargarXMLVenta(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `venta_${numeroVenta}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      Swal.fire('¡Éxito!', 'Archivo XML descargado', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo descargar el XML', 'error');
    }
  };

  const handleAnular = async (id, numeroVenta) => {
    const result = await Swal.fire({
      title: '¿Anular comprobante?',
      text: `¿Confirma la anulación de la venta #${numeroVenta}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      input: 'textarea',
      inputPlaceholder: 'Ingrese el motivo de anulación...'
    });

    if (result.isConfirmed) {
      try {
        await anularVenta(id, result.value || 'Anulación solicitada por usuario');
        Swal.fire('¡Anulado!', 'La venta ha sido anulada satisfactoriamente.', 'success');
        cargarVentas();
      } catch (error) {
        Swal.fire('Error', 'No se pudo anular: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const handleConsultarSunat = async (id, numeroVenta) => {
    try {
      const response = await obtenerEstadoSunat(id);
      Swal.fire({
        title: 'Estado SUNAT',
        html: `
          <div class="text-left space-y-2 p-2">
            <p><strong>Comprobante:</strong> ${numeroVenta}</p>
            <p><strong>Estado:</strong> ${response.estadoSunat || 'PENDIENTE'}</p>
            ${response.mensajeSunat ? `<p class="text-xs text-slate-500 bg-slate-50 p-2 rounded"><strong>Obs:</strong> ${response.mensajeSunat}</p>` : ''}
          </div>
        `,
        icon: 'info'
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo obtener el estado SUNAT', 'error');
    }
  };

  const handleReenviarSunat = async (id, numeroVenta) => {
    const result = await Swal.fire({
      title: '¿Reenviar a SUNAT?',
      text: `Se intentará enviar nuevamente el comprobante #${numeroVenta}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#126171',
      confirmButtonText: 'Reenviar ahora'
    });

    if (result.isConfirmed) {
      try {
        await reenviarVentaSunat(id);
        Swal.fire('¡Enviado!', 'Comprobante en proceso de envío.', 'success');
        cargarVentas();
      } catch (error) {
        Swal.fire('Error', 'Error al reenviar: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const handleGenerarGuia = async (venta) => {
    try {
      const guiasExistentes = await guiaRemisionService.obtenerGuiasPorVenta(venta.id);
      if (guiasExistentes && guiasExistentes.length > 0) {
        Swal.fire('Guía Existente', `Ya existe una guía vinculada: ${guiasExistentes[0].serie}-${guiasExistentes[0].numero}`, 'info');
        return;
      }
      navigate('/guia-remision/formulario', { state: { ventaData: venta, fromVenta: true } });
    } catch (error) {
      Swal.fire('Error', 'No se pudo verificar guías vinculadas', 'error');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto || 0);
  };

  const getStatusBadge = (status) => {
    const base = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ";
    switch (status?.toUpperCase()) {
      case 'COMPLETADA': return <span className={base + "bg-emerald-50 text-emerald-600"}><CheckCircle size={12} /> {status}</span>;
      case 'ANULADA': return <span className={base + "bg-red-50 text-red-600"}><XCircle size={12} /> {status}</span>;
      default: return <span className={base + "bg-amber-50 text-amber-600"}><Clock size={12} /> {status}</span>;
    }
  };

  const getSunatBadge = (status) => {
    const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ";
    switch (status?.toUpperCase()) {
      case 'ACEPTADO': return <span className={base + "bg-emerald-100 text-emerald-700"}><CheckCircle size={12} /> SUNAT OK</span>;
      case 'RECHAZADO': return <span className={base + "bg-red-100 text-red-700"}><XCircle size={12} /> RECHAZADO</span>;
      case 'ERROR': return <span className={base + "bg-red-50 text-red-500"}><AlertTriangle size={12} /> ERROR</span>;
      default: return <span className={base + "bg-slate-100 text-slate-500"}>📄 SIN ENVIAR</span>;
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/30">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-menta-suave text-menta-petroleo shadow-sm">
            <ClipboardList size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo font-bold">Listado de Comprobantes</h2>
            <p className="text-sm text-slate-500 font-bold">Facturación electrónica, boletas y notas de venta</p>
          </div>
        </div>
        <div className="flex items-center gap-3 font-bold">
          <button
            onClick={() => cargarVentas()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm font-bold"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button
            onClick={() => navigate('/ventas/nueva')}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-menta-petroleo px-5 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:bg-menta-marino active:scale-95 font-bold"
          >
            <FileText size={18} />
            NUEVA VENTA
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap lg:flex-nowrap font-bold italic">
        <div className="flex-1 min-w-[200px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm font-bold italic">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Facturado (Periodo)</p>
          <p className="text-2xl font-black text-menta-marino font-bold italic">
            {formatearMoneda(ventas.filter(v => v.estado !== 'ANULADA').reduce((s, v) => s + (parseFloat(v.total) || 0), 0))}
          </p>
        </div>
        <div className="flex-1 min-w-[200px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm font-bold italic">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Comprobantes</p>
          <p className="text-2xl font-black text-slate-800 font-bold italic">{ventas.length}</p>
        </div>
        <div className="flex-1 min-w-[200px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm font-bold italic">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Anulados</p>
          <p className="text-2xl font-black text-red-500 font-bold italic">{ventas.filter(v => v.estado === 'ANULADA').length}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm font-bold italic">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h3 className="flex items-center gap-2 font-bold text-menta-petroleo italic">
            <Filter size={18} />
            Búsqueda y Filtros Avanzados
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMostrarColumnas(!mostrarColumnas)}
              className="group flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-menta-petroleo transition font-bold"
            >
              <Settings size={14} className="group-hover:rotate-45 transition-transform" />
              Columnas
            </button>
            <button
              onClick={limpiarFiltros}
              className="text-xs font-semibold text-slate-400 hover:text-red-500 transition font-bold"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {mostrarColumnas && (
          <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3 lg:grid-cols-6 animate-in fade-in slide-in-from-top-2 duration-200 italic font-bold">
            {Object.entries(columnLabels).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-slate-600 hover:text-menta-petroleo transition font-bold">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-menta-petroleo focus:ring-menta-petroleo font-bold"
                  checked={columnasVisibles[key]}
                  onChange={() => toggleColumna(key)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 font-bold italic">
          <div className="space-y-1.5 font-bold italic">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fecha Inicio</label>
            <div className="relative font-bold italic">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="date"
                name="fechaInicio"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-sm focus:border-menta-turquesa focus:ring-2 focus:ring-menta-turquesa outline-none transition font-bold italic"
                value={filtros.fechaInicio}
                onChange={handleFiltroChange}
              />
            </div>
          </div>
          <div className="space-y-1.5 font-bold italic">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fecha Fin</label>
            <div className="relative font-bold italic">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="date"
                name="fechaFin"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-sm focus:border-menta-turquesa focus:ring-2 focus:ring-menta-turquesa outline-none transition font-bold italic"
                value={filtros.fechaFin}
                onChange={handleFiltroChange}
              />
            </div>
          </div>
          <div className="space-y-1.5 font-bold italic">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cliente / RUC</label>
            <div className="relative font-bold italic">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                name="clientes"
                placeholder="Nombre o documento..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-sm font-semibold focus:border-menta-turquesa outline-none transition font-bold italic"
                value={filtros.clientes}
                onChange={handleFiltroChange}
              />
            </div>
          </div>
          <div className="space-y-1.5 font-bold italic">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estado Pago</label>
            <select
              name="estado"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm focus:border-menta-turquesa outline-none transition font-bold italic"
              value={filtros.estado}
              onChange={handleFiltroChange}
            >
              <option value="">Todos</option>
              <option value="COMPLETADA">Completada</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ANULADA">Anulada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-100 font-bold italic">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap italic font-bold">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo font-bold">
              <tr>
                <th className="px-5 py-4 text-center font-bold">#</th>
                {columnasVisibles.id && <th className="px-5 py-4 font-bold">ID</th>}
                {columnasVisibles.fechaVenta && <th className="px-5 py-4 font-bold">Fecha</th>}
                <th className="px-5 py-4 font-bold">Comprobante</th>
                {columnasVisibles.cliente && <th className="px-5 py-4 font-bold">Cliente</th>}
                {columnasVisibles.estado && <th className="px-5 py-4 text-center font-bold">Estado</th>}
                {columnasVisibles.estadoSunat && <th className="px-5 py-4 text-center font-bold">SUNAT</th>}
                {columnasVisibles.total && <th className="px-5 py-4 text-right font-bold">Total</th>}
                {columnasVisibles.acciones && <th className="px-5 py-4 text-center font-bold">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic font-bold">
              {loading ? (
                <tr>
                  <td colSpan="20" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-menta-turquesa" />
                      <p className="font-bold text-slate-400 italic">Sincronizando registros...</p>
                    </div>
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan="20" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <ClipboardList size={48} />
                      <p className="text-lg font-bold text-slate-400 italic uppercase tracking-wider">No se encontraron ventas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                ventas.map((venta, index) => (
                  <tr key={venta.id} className="group transition hover:bg-slate-50/50 italic font-bold">
                    <td className="px-5 py-4 text-center font-bold text-slate-300 italic">
                      {index + 1}
                    </td>
                    {columnasVisibles.id && <td className="px-5 py-4 text-slate-400 italic">#{venta.id}</td>}
                    {columnasVisibles.fechaVenta && (
                      <td className="px-5 py-4 font-semibold text-slate-600 italic">
                        {formatearFecha(venta.fechaVenta || venta.createdAt)}
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-bold italic">
                        <span className="font-black text-menta-petroleo tracking-tight">{venta.serieComprobante}</span>
                        <span className="text-slate-400">/</span>
                        <span className="font-bold text-slate-700">{venta.numeroComprobante}</span>
                      </div>
                      <div className="text-[10px] font-black uppercase text-slate-400 italic tracking-wider">
                        {venta.tipoComprobante}
                      </div>
                    </td>
                    {columnasVisibles.cliente && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 font-bold italic">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-400 uppercase">
                            {(venta.Cliente?.nombre || venta.clienteNombre || 'C').substring(0, 1)}
                          </div>
                          <div className="flex flex-col font-bold italic">
                            <span className="max-w-[180px] truncate font-bold text-slate-800 italic">{venta.Cliente?.nombre || venta.clienteNombre || '-'}</span>
                            <span className="text-[10px] text-slate-400 font-bold italic tracking-wider uppercase">{venta.Cliente?.numeroDocumento}</span>
                          </div>
                        </div>
                      </td>
                    )}
                    {columnasVisibles.estado && (
                      <td className="px-5 py-4 text-center font-bold italic">
                        {getStatusBadge(venta.estado)}
                      </td>
                    )}
                    {columnasVisibles.estadoSunat && (
                      <td className="px-5 py-4 text-center font-bold italic">
                        {getSunatBadge(venta.estadoSunat)}
                      </td>
                    )}
                    {columnasVisibles.total && (
                      <td className="px-5 py-4 text-right font-black text-slate-900 italic">
                        {formatearMoneda(venta.total)}
                      </td>
                    )}
                    {columnasVisibles.acciones && (
                      <td className="px-5 py-4 text-center font-bold italic">
                        <div className="flex justify-center items-center gap-1 font-bold italic">
                          <button
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-menta-turquesa italic"
                            onClick={() => onVerDetalle?.(venta)}
                            title="Ver Detalle"
                          >
                            <Eye size={18} />
                          </button>

                          <div className="relative" data-pdf-dropdown>
                            <button
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 italic"
                              onClick={() => setOpenPdfDropdownId(openPdfDropdownId === venta.id ? null : venta.id)}
                            >
                              <Download size={18} />
                            </button>
                            {openPdfDropdownId === venta.id && (
                              <div className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 font-bold italic">
                                <button onClick={() => handleDescargarPDF(venta.id, venta.numeroComprobante, 'A4')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold hover:bg-slate-50 transition">
                                  <FileText size={14} className="text-red-500" /> PDF A4
                                </button>
                                <button onClick={() => handleDescargarPDF(venta.id, venta.numeroComprobante, '80mm')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold hover:bg-slate-50 transition">
                                  <FileText size={14} className="text-red-500" /> Ticket 80mm
                                </button>
                                <button onClick={() => handleDescargarXML(venta.id, venta.numeroComprobante)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold hover:bg-slate-50 transition border-t border-slate-50 mt-1">
                                  <div className="h-3.5 w-3.5 rounded bg-menta-petroleo text-[8px] font-black text-white flex items-center justify-center">X</div> XML Sunat
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="group/menu relative">
                            <button className="rounded-lg p-2 text-slate-300 hover:bg-slate-50 hover:text-slate-600 italic">
                              <MoreVertical size={18} />
                            </button>
                            <div className="invisible absolute right-0 top-full z-10 mt-1 min-w-[160px] rounded-xl border border-slate-200 bg-white p-2 shadow-2xl group-hover/menu:visible animate-in fade-in zoom-in-95 font-bold italic">
                              <button onClick={() => handleConsultarSunat(venta.id, venta.numeroComprobante)} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition">
                                <RefreshCcw size={14} /> Estado SUNAT
                              </button>
                              <button onClick={() => handleReenviarSunat(venta.id, venta.numeroComprobante)} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-menta-suave hover:text-menta-petroleo transition">
                                <Send size={14} /> Reenviar SUNAT
                              </button>
                              <button onClick={() => handleGenerarGuia(venta)} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition">
                                <Truck size={14} /> Generar Guía
                              </button>
                              <button onClick={() => handleEnviarWhatsApp(venta)} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition">
                                <Share2 size={14} /> WhatsApp
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button onClick={() => handleAnular(venta.id, venta.numeroComprobante)} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-red-400 hover:bg-red-50 hover:text-red-500 transition">
                                <Trash2 size={14} /> Anular Venta
                              </button>
                            </div>
                          </div>
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
          <p className="text-sm font-medium text-slate-400 italic font-bold">
            Mostrando <span className="font-black text-fondo italic font-bold">{ventas.length}</span> comprobantes encontrados
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

      {mostrarModalWhatsApp && (
        <ModalWhatsApp
          venta={ventaSeleccionada}
          onClose={() => setMostrarModalWhatsApp(false)}
        />
      )}
    </div>
  );
};

export default ListaVentas;