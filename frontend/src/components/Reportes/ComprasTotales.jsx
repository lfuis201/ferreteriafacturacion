import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Filter, Calendar, Building2, CheckCircle, TrendingUp, X, ShoppingCart } from 'lucide-react';
import { obtenerReporteComprasTotales } from '../../services/compraService';
import { obtenerProveedores } from '../../services/proveedorService';
import { bg, text, border, themeClasses } from '../../theme';

const ComprasTotales = ({ onBack }) => {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    totalCompras: 0,
    montoTotal: 0,
    promedioPorCompra: 0
  });
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    proveedorId: '',
    estado: ''
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      setError(null);

      const responseProveedores = await obtenerProveedores();
      setProveedores(responseProveedores.proveedores || []);

      await cargarCompras();
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      setError('Error al cargar los datos. Verifique la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const cargarCompras = async () => {
    try {
      setLoading(true);
      setError(null);

      const filtrosApi = {};
      if (filtros.fechaInicio) filtrosApi.fechaInicio = filtros.fechaInicio;
      if (filtros.fechaFin) filtrosApi.fechaFin = filtros.fechaFin;
      if (filtros.proveedorId) filtrosApi.proveedorId = filtros.proveedorId;
      if (filtros.estado) filtrosApi.estado = filtros.estado;

      const response = await obtenerReporteComprasTotales(filtrosApi);

      setCompras(response.compras || []);
      setEstadisticas(response.estadisticas || {
        totalCompras: 0,
        montoTotal: 0,
        promedioPorCompra: 0
      });
    } catch (error) {
      console.error('Error al cargar compras:', error);
      setError('Error al cargar las compras. Verifique la conexión con el servidor.');
      setCompras([]);
      setEstadisticas({
        totalCompras: 0,
        montoTotal: 0,
        promedioPorCompra: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const aplicarFiltros = async () => {
    await cargarCompras();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      proveedorId: '',
      estado: ''
    });
    setTimeout(() => cargarCompras(), 100);
  };

  const exportarReporte = () => {
    try {
      const headers = ['Número', 'Fecha', 'Proveedor', 'Estado', 'Subtotal', 'IGV', 'Total'];
      const csvContent = [
        headers.join(','),
        ...compras.map(compra => [
          compra.numero || compra.numeroComprobante || '',
          compra.fechaCompra || compra.fecha || '',
          compra.Proveedor?.nombre || compra.proveedor || '',
          compra.estado || '',
          compra.subtotal || '',
          compra.igv || '',
          compra.total || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_compras_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar reporte:', error);
    }
  };

  const getEstadoBadgeClass = (estado) => {
    const estadoLower = (estado || '').toLowerCase();
    switch (estadoLower) {
      case 'completada':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'anulada':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading && compras.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-menta-petroleo mx-auto mb-4"></div>
              <p className={`${text.mentaPetroleo} text-lg font-medium`}>Cargando reporte de compras...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Premium Header - Emerald & Slate Theme */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-8 text-white shadow-2xl shadow-emerald-200/50">
          <div className="absolute right-0 top-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <ShoppingCart size={280} />
          </div>
          <div className="absolute left-0 bottom-0 p-10 opacity-5 pointer-events-none transform -translate-x-1/4 translate-y-1/4">
            <TrendingUp size={200} />
          </div>

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={onBack}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all active:scale-95 shadow-lg"
              >
                <ArrowLeft size={22} />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300/80">Reportes Generales</span>
                  <span className="h-1 w-1 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300/80">Compras</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Reporte de <span className="text-emerald-300">Compras Totales</span></h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportarReporte}
                disabled={loading || compras.length === 0}
                className="flex h-14 items-center gap-3 rounded-2xl bg-white px-8 text-sm font-black text-emerald-700 shadow-xl shadow-emerald-900/20 hover:bg-emerald-50 transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} /> Exportar Reporte
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Mini-Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:border-emerald-100">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-inner">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Volumen de Compras</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-slate-800 tabular-nums">{estadisticas.totalCompras}</p>
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Ordenes</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:border-emerald-100">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Building2 size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Inversión Total</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-emerald-600">S/</span>
                <p className="text-3xl font-black text-slate-800 tabular-nums">
                  {estadisticas.montoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:border-emerald-100 border-b-4 border-b-emerald-500">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-inner">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Costo Promedio</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-emerald-600">S/</span>
                <p className="text-3xl font-black text-slate-800 tabular-nums">
                  {estadisticas.promedioPorCompra.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-50 opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 mb-8 flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Filter size={16} />
            </div>
            Parámetros de Filtrado
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Fecha Inicio</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                  className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Fecha Fin</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                  className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Proveedor</label>
              <select
                value={filtros.proveedorId}
                onChange={(e) => handleFiltroChange('proveedorId', e.target.value)}
                className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-6 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 appearance-none transition-all cursor-pointer"
              >
                <option value="">Todos los proveedores</option>
                {proveedores.map(proveedor => (
                  <option key={proveedor.id} value={proveedor.id}>{proveedor.nombre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-6 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 appearance-none transition-all cursor-pointer"
              >
                <option value="">Cualquier estado</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="COMPLETADA">Completada</option>
                <option value="ANULADA">Anulada</option>
                <option value="EN_PROCESO">En Proceso</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={aplicarFiltros}
              disabled={loading}
              className="flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <Filter size={14} /> {loading ? 'Sincronizando...' : 'Aplicar Parámetros'}
            </button>
            <button
              onClick={limpiarFiltros}
              disabled={loading}
              className="flex h-12 items-center gap-2 rounded-2xl bg-white border border-slate-200 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all active:scale-95 disabled:opacity-50"
            >
              <X size={14} /> Reestablecer
            </button>
          </div>
        </div>

        {/* Tabla de Compras */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
              Log de Transacciones <span className="text-emerald-500 ml-2">({compras.length} Registros)</span>
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-menta-petroleo mx-auto mb-3"></div>
                <p className={`${text.mentaPetroleo}`}>Cargando compras...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${bg.mentaSuave} border-b-2 ${border.mentaMedio}`}>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-menta-petroleo">Número</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-menta-petroleo">Fecha</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-menta-petroleo">Proveedor</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-menta-petroleo">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-menta-petroleo">Estado</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-menta-petroleo">Subtotal</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-menta-petroleo">IGV</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-menta-petroleo">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map((compra, index) => (
                    <tr
                      key={compra.id}
                      className={`border-b ${border.mentaMedio} hover:bg-menta-claro/30 transition-colors`}
                    >
                      <td className="px-4 py-3 text-sm">
                        {compra.numeroComprobante || compra.numero || `${compra.serieComprobante || ''}-${compra.numeroComprobante || ''}`}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(compra.fechaCompra || compra.fecha).toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {compra.Proveedor?.nombre || compra.proveedor || 'Sin proveedor'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {compra.tipoComprobante || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadgeClass(compra.estado)}`}>
                          {compra.estado || 'Sin estado'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        S/ {parseFloat(compra.subtotal || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        S/ {parseFloat(compra.igv || 0).toFixed(2)}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-semibold ${text.mentaPetroleo}`}>
                        S/ {parseFloat(compra.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {compras.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No se encontraron compras con los filtros aplicados.</p>
                  {error && (
                    <button
                      onClick={cargarDatosIniciales}
                      className={`${themeClasses.btnPrimary} px-6 py-2 rounded-lg`}
                    >
                      Reintentar carga
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprasTotales;
