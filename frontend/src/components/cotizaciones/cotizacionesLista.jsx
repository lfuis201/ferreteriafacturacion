import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Plus,
  Eye,
  EyeOff,
  ChevronDown,
  RefreshCcw,
  FileText,
  Settings2,
  X,
  Edit3,
  Trash2,
  History,
  CheckCircle2,
  FilePieChart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import CotizacionesFormulario from './cotizacionesformulario';
import { obtenerCotizaciones, eliminarCotizacion, obtenerCotizacionPorId } from '../../services/cotizacionService';
import Swal from 'sweetalert2';

const CotizacionesLista = () => {
  const [columnVisibility, setColumnVisibility] = useState({
    fechaEmision: true,
    fechaEntrega: true,
    tiempoValidez: false,
    tiempoEntrega: false,
    direccionEnvio: false,
    terminoPago: false,
    numeroCuenta: false,
    registradoPor: true,
    vendedor: true,
    cliente: true,
    estado: true,
    cotizacion: true,
    comprobantes: false,
    notasDeVenta: false,
    pedido: false,
    oportunidadVenta: false,
    infReferencial: false,
    contrato: false,
    tipoCambio: false,
    moneda: true,
    tExportacion: false,
    tGratuito: false,
    tInafecta: false,
    tExonerado: false,
    tGravado: false,
    igv: true,
    total: true,
  });

  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFormulario, setShowFormulario] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    busqueda: '',
    periodo: 'mes_actual',
    mes: new Date().getMonth() + 1,
    estado: 'todos'
  });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const cargarCotizaciones = async () => {
    try {
      setLoading(true);
      setError('');

      const usuarioGuardado = localStorage.getItem('usuario');
      let filtrosConsulta = {};

      if (usuarioGuardado) {
        try {
          const usuario = JSON.parse(usuarioGuardado);
          if (usuario.sucursalId) filtrosConsulta.sucursalId = usuario.sucursalId;
        } catch (error) {
          console.error('Error al parsear usuario:', error);
        }
      }

      const data = await obtenerCotizaciones(filtrosConsulta);

      if (!data || !data.cotizaciones || !Array.isArray(data.cotizaciones)) {
        setCotizaciones([]);
        return;
      }

      const cotizacionesFormateadas = data.cotizaciones.map(cotizacion => ({
        id: cotizacion.id,
        fechaEmision: cotizacion.fechaEmision || '-',
        fechaEntrega: cotizacion.fechaEntrega || '-',
        tiempoValidez: cotizacion.tiempoValidez || '-',
        tiempoEntrega: cotizacion.tiempoEntrega || '-',
        direccionEnvio: cotizacion.direccionEnvio || '-',
        terminoPago: cotizacion.terminoPago || '-',
        numeroCuenta: cotizacion.numeroCuenta || '-',
        registradoPor: cotizacion.registradoPor || '-',
        vendedor: cotizacion.vendedor || '-',
        cliente: cotizacion.cliente || (cotizacion.Cliente ? cotizacion.Cliente.nombre : '-'),
        estado: cotizacion.estado || 'Activo',
        cotizacion: cotizacion.numeroReferencia || cotizacion.id,
        comprobantes: cotizacion.comprobantes || '0',
        notasDeVenta: cotizacion.notasDeVenta || '0',
        pedido: cotizacion.pedido || '-',
        oportunidadVenta: cotizacion.oportunidadVenta || '-',
        infReferencial: cotizacion.infReferencial || '-',
        contrato: cotizacion.contrato || '-',
        tipoCambio: cotizacion.tipoCambio || '3.85',
        moneda: cotizacion.moneda || 'SOL',
        tExportacion: cotizacion.tExportacion || '0.00',
        tGratuito: cotizacion.tGratuito || '0.00',
        tInafecta: cotizacion.tInafecta || '0.00',
        tExonerado: cotizacion.tExonerado || '0.00',
        tGravado: cotizacion.tGravado || '0.00',
        igv: cotizacion.igv || '0.00',
        total: cotizacion.total || '0.00'
      }));

      setCotizaciones(cotizacionesFormateadas);
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
      setError(error.message || 'Error al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  const toggleColumn = (column) => {
    setColumnVisibility(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const agregarCotizacion = () => {
    cargarCotizaciones();
    setShowFormulario(false);
    setCotizacionSeleccionada(null);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Deseas eliminar esta cotización?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#126171',
      cancelButtonColor: '#ff4d4d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await eliminarCotizacion(id);
      cargarCotizaciones();
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la cotización'
      });
    }
  };

  const handleEditar = async (id) => {
    try {
      const data = await obtenerCotizacionPorId(id);
      const cot = data.cotizacion || data;
      setCotizacionSeleccionada(cot);
      setShowFormulario(true);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la cotización para editar.'
      });
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setCurrentPage(1);
  };

  const cotizacionesFiltradas = cotizaciones.filter(cotizacion => {
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      const coincide =
        cotizacion.cliente.toLowerCase().includes(busqueda) ||
        cotizacion.cotizacion.toString().toLowerCase().includes(busqueda) ||
        cotizacion.vendedor.toLowerCase().includes(busqueda);
      if (!coincide) return false;
    }
    if (filtros.estado !== 'todos' && cotizacion.estado.toLowerCase() !== filtros.estado.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cotizacionesFiltradas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(cotizacionesFiltradas.length / itemsPerPage);

  const columnLabels = {
    fechaEmision: 'Fecha Emisión',
    fechaEntrega: 'Fecha Entrega',
    tiempoValidez: 'T. Validez',
    tiempoEntrega: 'T. Entrega',
    direccionEnvio: 'Dirección Envío',
    terminoPago: 'Término Pago',
    numeroCuenta: 'N° Cuenta',
    registradoPor: 'Registrado por',
    vendedor: 'Vendedor',
    cliente: 'Cliente',
    estado: 'Estado',
    cotizacion: 'Cotización',
    comprobantes: 'Comprobantes',
    notasDeVenta: 'N. Venta',
    pedido: 'Pedido',
    oportunidadVenta: 'Oportunidad',
    infReferencial: 'Inf. Referencial',
    contrato: 'Contrato',
    tipoCambio: 'TC',
    moneda: 'Mon.',
    tExportacion: 'T. Exp',
    tGratuito: 'T. Grat',
    tInafecta: 'T. Inaf',
    tExonerado: 'T. Exon',
    tGravado: 'T. Grav',
    igv: 'IGV',
    total: 'Total',
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xl shadow-indigo-200">
            <FilePieChart size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Panel de Cotizaciones</h2>
            <p className="text-sm font-medium text-slate-500">Gestión centralizada de presupuestos y propuestas comerciales</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cargarCotizaciones}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
          <button
            onClick={() => { setCotizacionSeleccionada(null); setShowFormulario(true); }}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-6 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:translate-y-[-1px] active:scale-95 uppercase tracking-tighter"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            NUEVA COTIZACIÓN
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex flex-wrap gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Cotizaciones</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">{cotizaciones.length}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Activas / Enviadas</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">
                {cotizaciones.filter(c => c.estado === 'Activo').length}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <History size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pendientes</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">
                {cotizaciones.filter(c => c.estado === 'Pendiente').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <Search size={14} className="text-menta-turquesa" />
              <label>Búsqueda Rápida</label>
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-12 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none transition h-11"
                placeholder="Buscar por cliente, cotización o vendedor..."
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
              />
              <div className="absolute right-4 top-3 text-slate-300">
                <Search size={20} />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-48 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <Filter size={14} className="text-menta-turquesa" />
              <label>Estado</label>
            </div>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11"
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="pendiente">Pendiente</option>
                <option value="cerrado">Cerrado</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-slate-400" size={18} />
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className={`flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold transition-all border
                ${showColumnSelector
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <Settings2 size={18} />
              COLUMNAS
              <ChevronDown size={16} className={`transition-transform duration-300 ${showColumnSelector ? 'rotate-180' : ''}`} />
            </button>

            {showColumnSelector && (
              <div className="absolute right-0 bottom-full mb-2 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Configurar Vista</span>
                  <button onClick={() => setShowColumnSelector(false)} className="text-slate-300 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 gap-2">
                    {Object.keys(columnVisibility).map((key) => (
                      <label key={key} className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 cursor-pointer transition-colors">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={columnVisibility[key]}
                            onChange={() => toggleColumn(key)}
                            className="peer h-5 w-5 appearance-none rounded-md border-2 border-slate-200 bg-white transition-all checked:border-indigo-600 checked:bg-indigo-600"
                          />
                          <CheckCircle2 size={12} className="absolute left-1 hidden text-white peer-checked:block" />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{columnLabels[key] || key}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {Object.keys(columnVisibility).map((key) => (
                  columnVisibility[key] && (
                    <th key={key} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">
                      {columnLabels[key]}
                    </th>
                  )
                ))}
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-menta-petroleo pr-10">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="100" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronizando cotizaciones...</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="100" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-200">
                      <FilePieChart size={48} />
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-800 uppercase tracking-tighter">No hay registros</p>
                        <p className="text-xs text-slate-400">No se encontraron cotizaciones con los criterios actuales</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((cotizacion) => (
                  <tr key={cotizacion.id} className="group hover:bg-slate-50/50 transition-colors">
                    {columnVisibility.fechaEmision && <td className="px-6 py-4 text-slate-600 font-medium">{cotizacion.fechaEmision}</td>}
                    {columnVisibility.fechaEntrega && <td className="px-6 py-4 text-slate-600 font-medium">{cotizacion.fechaEntrega}</td>}
                    {columnVisibility.tiempoValidez && <td className="px-6 py-4 text-slate-600">{cotizacion.tiempoValidez}</td>}
                    {columnVisibility.tiempoEntrega && <td className="px-6 py-4 text-slate-600">{cotizacion.tiempoEntrega}</td>}
                    {columnVisibility.direccionEnvio && <td className="px-6 py-4 text-slate-600 text-xs max-w-xs truncate">{cotizacion.direccionEnvio}</td>}
                    {columnVisibility.terminoPago && <td className="px-6 py-4 text-slate-600">{cotizacion.terminoPago}</td>}
                    {columnVisibility.numeroCuenta && <td className="px-6 py-4 text-slate-600">{cotizacion.numeroCuenta}</td>}
                    {columnVisibility.registradoPor && <td className="px-6 py-4 text-slate-500 text-xs">{cotizacion.registradoPor}</td>}
                    {columnVisibility.vendedor && <td className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-tight">{cotizacion.vendedor}</td>}
                    {columnVisibility.cliente && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 uppercase tracking-tight">{cotizacion.cliente}</span>
                        </div>
                      </td>
                    )}
                    {columnVisibility.estado && (
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider
                          ${cotizacion.estado.toLowerCase() === 'activo' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${cotizacion.estado.toLowerCase() === 'activo' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {cotizacion.estado}
                        </span>
                      </td>
                    )}
                    {columnVisibility.cotizacion && <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{cotizacion.cotizacion}</td>}
                    {columnVisibility.comprobantes && <td className="px-6 py-4 text-center text-slate-600">{cotizacion.comprobantes}</td>}
                    {columnVisibility.notasDeVenta && <td className="px-6 py-4 text-center text-slate-600">{cotizacion.notasDeVenta}</td>}
                    {columnVisibility.pedido && <td className="px-6 py-4 text-slate-600">{cotizacion.pedido}</td>}
                    {columnVisibility.oportunidadVenta && <td className="px-6 py-4 text-slate-600">{cotizacion.oportunidadVenta}</td>}
                    {columnVisibility.infReferencial && <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{cotizacion.infReferencial}</td>}
                    {columnVisibility.contrato && <td className="px-6 py-4 text-slate-600">{cotizacion.contrato}</td>}
                    {columnVisibility.tipoCambio && <td className="px-6 py-4 font-mono text-xs">{cotizacion.tipoCambio}</td>}
                    {columnVisibility.moneda && <td className="px-6 py-4 font-bold text-slate-500 text-xs">{cotizacion.moneda}</td>}
                    {columnVisibility.tExportacion && <td className="px-6 py-4 text-slate-600">{cotizacion.tExportacion}</td>}
                    {columnVisibility.tGratuito && <td className="px-6 py-4 text-slate-600">{cotizacion.tGratuito}</td>}
                    {columnVisibility.tInafecta && <td className="px-6 py-4 text-slate-600">{cotizacion.tInafecta}</td>}
                    {columnVisibility.tExonerado && <td className="px-6 py-4 text-slate-600">{cotizacion.tExonerado}</td>}
                    {columnVisibility.tGravado && <td className="px-6 py-4 text-slate-600">{cotizacion.tGravado}</td>}
                    {columnVisibility.igv && <td className="px-6 py-4 text-slate-600">{cotizacion.igv}</td>}
                    {columnVisibility.total && (
                      <td className="px-6 py-4">
                        <span className="font-black text-slate-900 tabular-nums">{cotizacion.total}</span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 pr-4">
                        <button
                          onClick={() => handleEditar(cotizacion.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-90 shadow-sm"
                          title="Editar Cotización"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleEliminar(cotizacion.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white transition-all active:scale-90 shadow-sm"
                          title="Eliminar registro"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 gap-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            MOSTRANDO <span className="text-slate-700">{indexOfFirstItem + 1}</span> - <span className="text-slate-700">{Math.min(indexOfLastItem, cotizacionesFiltradas.length)}</span> DE <span className="text-slate-700">{cotizacionesFiltradas.length}</span> REGISTROS
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

      {/* Form Overlay Modal */}
      {showFormulario && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
            <button
              className="absolute top-6 right-8 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/10 text-slate-600 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
              onClick={() => setShowFormulario(false)}
            >
              <X size={20} />
            </button>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              <CotizacionesFormulario
                onCotizacionGuardada={agregarCotizacion}
                onCerrar={() => setShowFormulario(false)}
                cotizacionInicial={cotizacionSeleccionada}
                modoEdicion={Boolean(cotizacionSeleccionada)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CotizacionesLista;