import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  Search,
  Filter,
  Download,
  BarChart3,
  Building2,
  Users,
  ChevronRight,
  TrendingDown,
  Activity,
  Award
} from 'lucide-react';
import { obtenerReporteVentas } from '../../services/ventaService';
import { obtenerSucursales } from '../../services/sucursalService';
import { obtenerUsuarios } from '../../services/usuarioService';

const VentasResumidas = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    sucursal: '',
    vendedor: ''
  });

  const [sucursales, setSucursales] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [datos, setDatos] = useState({
    totalVentas: 0,
    cantidadDocumentos: 0,
    promedioVenta: 0,
    ventasPorPeriodo: []
  });

  useEffect(() => {
    cargarCombos();
    cargarDatos();
  }, []);

  const cargarCombos = async () => {
    try {
      const [resSucursales, resUsuarios] = await Promise.all([
        obtenerSucursales(),
        obtenerUsuarios()
      ]);
      const listaSucursales = resSucursales.sucursales || resSucursales.data || resSucursales || [];
      const listaUsuarios = resUsuarios.usuarios || resUsuarios.data || resUsuarios || [];
      setSucursales(listaSucursales);
      setUsuarios(listaUsuarios);
    } catch (error) {
      console.error('Error cargando sucursales/usuarios:', error);
    } finally {
      setLoadingInit(false);
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const resp = await obtenerReporteVentas({
        fechaInicio: filtros.fechaDesde || undefined,
        fechaEnd: filtros.fechaHasta || undefined, // Nota: el servicio suele esperar 'fechaFin' o 'fechaEnd' según convención
        sucursalId: filtros.sucursal || undefined,
        usuarioId: filtros.vendedor || undefined
      });
      const ventas = resp.ventas || resp.data?.ventas || [];

      const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total || 0), 0);
      const cantidadDocumentos = ventas.length;
      const promedioVenta = cantidadDocumentos > 0 ? totalVentas / cantidadDocumentos : 0;

      const porDia = new Map();
      ventas.forEach(v => {
        const fechaRaw = v.fechaVenta || v.createdAt;
        const fecha = fechaRaw ? new Date(fechaRaw) : null;
        const key = fecha ? fecha.toISOString().slice(0, 10) : 'Sin fecha';
        const monto = Number(v.total || 0);
        porDia.set(key, (porDia.get(key) || 0) + monto);
      });

      const ventasPorPeriodo = Array.from(porDia.entries())
        .map(([fecha, ventas]) => ({ fecha, ventas }))
        .sort((a, b) => (a.fecha > b.fecha ? 1 : -1));

      setDatos({ totalVentas, cantidadDocumentos, promedioVenta, ventasPorPeriodo });
    } catch (error) {
      console.error('Error al cargar ventas resumidas:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarDatos();
  };

  const exportarReporte = () => {
    console.log('Exportando reporte de ventas resumidas...');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header Superior con Gradiente de Éxito */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-emerald-950 to-slate-900 p-10 text-white shadow-2xl shadow-emerald-900/10">
          <div className="absolute right-0 top-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 rotate-12">
            <TrendingUp size={320} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={onBack}
                className="flex items-center gap-2 h-11 px-5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md border border-white/5 font-bold text-xs uppercase tracking-widest group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>Volver</span>
              </button>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">
                <span>Reportería</span>
                <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                <span>Desempeño Comercial</span>
              </div>
            </div>

            <h1 className="text-4xl font-black tracking-tighter uppercase mb-4 leading-none">
              Resumen de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">Ingresos</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium leading-relaxed uppercase tracking-wide text-[10px]">
              Análisis consolidado de facturación, volumen de documentos y rendimiento por sucursal para la toma de decisiones estratégicas.
            </p>
          </div>
        </div>

        {/* Analytics Grid de Alto Impacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
          <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md border-b-4 border-b-emerald-500">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ingreso Total</p>
              <div className="flex items-baseline gap-1 font-black text-slate-800">
                <span className="text-sm text-slate-400">S/</span>
                <p className="text-3xl tabular-nums">{datos.totalVentas.toLocaleString('es-PE', { minimumFractionDigits: 1 })}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Operaciones</p>
              <p className="text-3xl font-black text-slate-800 tabular-nums">{datos.cantidadDocumentos}</p>
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <Award size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ticket Promedio</p>
              <div className="flex items-baseline gap-1 font-black text-slate-800">
                <span className="text-sm text-slate-400">S/</span>
                <p className="text-3xl tabular-nums">{datos.promedioVenta.toLocaleString('es-PE', { minimumFractionDigits: 1 })}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md overflow-hidden relative">
            <div className="absolute right-0 top-0 p-4 opacity-5">
              <Activity size={80} />
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
              <Activity size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Estado de Meta</p>
              <p className="text-sm font-black text-emerald-600 uppercase">Crecimiento Postivo</p>
            </div>
          </div>
        </div>

        {/* Filtros de Precisión */}
        <div className="rounded-[2.5rem] bg-white border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                <Calendar size={14} /> Inicio
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-emerald-500 transition-all font-bold text-slate-700 text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                <Calendar size={14} /> Fin
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-emerald-500 transition-all font-bold text-slate-700 text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                <Building2 size={14} /> Sucursal
              </label>
              <select
                value={filtros.sucursal}
                onChange={(e) => setFiltros({ ...filtros, sucursal: e.target.value })}
                className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-emerald-500 appearance-none font-bold text-slate-700 uppercase text-xs"
              >
                <option value="">Todas</option>
                {sucursales.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                <Users size={14} /> Vendedor
              </label>
              <select
                value={filtros.vendedor}
                onChange={(e) => setFiltros({ ...filtros, vendedor: e.target.value })}
                className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-emerald-500 appearance-none font-bold text-slate-700 uppercase text-xs"
              >
                <option value="">Todos</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.usuario || u.nombre}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={aplicarFiltros}
                disabled={loading}
                className="flex-1 h-14 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-100 hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Activity size={16} className="animate-spin" /> : <Filter size={16} />}
                Actualizar
              </button>
              <button
                onClick={exportarReporte}
                className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Cronología de Ventas */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              Histórico Consolidado por Período
            </h3>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {loading && !datos.ventasPorPeriodo.length ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="h-12 w-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analizando facturación...</p>
              </div>
            ) : datos.ventasPorPeriodo.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fecha de Operación</th>
                    <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rendimiento Visual</th>
                    <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ventas Totales (S/)</th>
                    <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {datos.ventasPorPeriodo.map((item, index) => (
                    <tr key={index} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="px-10 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                            <Calendar size={18} />
                          </div>
                          <span className="text-sm font-black text-slate-700 uppercase">
                            {new Date(item.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min((item.ventas / (datos.promedioVenta || 1)) * 50, 100)}%` }}
                            ></div>
                          </div>
                          <TrendingUp size={14} className="text-emerald-500" />
                        </div>
                      </td>
                      <td className="px-10 py-5 text-right">
                        <span className="text-lg font-black text-slate-800 tabular-nums">
                          S/ {item.ventas.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-10 py-5 text-right">
                        <button className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center mx-auto lg:ml-auto lg:mr-0">
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-32 px-10">
                <BarChart3 size={60} className="mx-auto text-slate-100 mb-6" />
                <h4 className="text-xl font-black text-slate-300 uppercase tracking-tighter mb-2">Sin datos disponibles</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">
                  Ajusta los filtros temporales para visualizar el resumen de ingresos.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VentasResumidas;