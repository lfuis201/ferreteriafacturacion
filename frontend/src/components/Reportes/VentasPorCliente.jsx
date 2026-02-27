import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Users,
  Filter,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  Search,
  ChevronRight,
  TrendingDown,
  Activity,
  Award,
  CreditCard,
  FileText,
  UserCheck
} from 'lucide-react';
import { obtenerReporteVentas } from '../../services/ventaService';
import { obtenerClientes } from '../../services/clienteService';

const VentasPorCliente = ({ onBack }) => {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    clienteId: '',
    ordenarPor: 'total'
  });

  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consolidado, setConsolidado] = useState([]);

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const res = await obtenerClientes();
        const lista = res.clientes || res.data || res || [];
        setClientes(lista);
      } catch (err) {
        console.error('Error cargando clientes:', err);
      }
    };
    cargarClientes();
    cargarReporte();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarReporte = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerReporteVentas({
        fechaInicio: filtros.fechaInicio || undefined,
        fechaFin: filtros.fechaFin || undefined,
        clienteId: filtros.clienteId || undefined
      });
      const ventasData = data.ventas || data.data?.ventas || [];
      setVentas(ventasData);
      const agrupado = agruparPorCliente(ventasData);
      setConsolidado(ordenarConsolidado(agrupado, filtros.ordenarPor));
    } catch (err) {
      setError(err.message || 'Error al cargar ventas por cliente');
      setVentas([]);
      setConsolidado([]);
    } finally {
      setLoading(false);
    }
  };

  const agruparPorCliente = (ventasData) => {
    const mapa = new Map();
    ventasData.forEach(v => {
      const id = v.Cliente?.id || 'sin_cliente';
      const nombre = v.Cliente?.nombre || 'Sin cliente';
      const documento = v.Cliente?.numeroDocumento || '';
      const total = Number(v.total || 0);
      const fecha = v.fechaVenta ? new Date(v.fechaVenta) : null;
      const entry = mapa.get(id) || { id, cliente: nombre, documento, cantidadCompras: 0, totalCompras: 0, ultimaCompra: null };
      entry.cantidadCompras += 1;
      entry.totalCompras += total;
      if (!entry.ultimaCompra || (fecha && fecha > entry.ultimaCompra)) {
        entry.ultimaCompra = fecha;
      }
      mapa.set(id, entry);
    });
    return Array.from(mapa.values()).map(e => ({
      ...e,
      promedioCompra: e.cantidadCompras > 0 ? e.totalCompras / e.cantidadCompras : 0
    }));
  };

  const ordenarConsolidado = (datos, criterio) => {
    const copia = [...datos];
    switch (criterio) {
      case 'cantidad':
        copia.sort((a, b) => b.cantidadCompras - a.cantidadCompras);
        break;
      case 'promedio':
        copia.sort((a, b) => b.promedioCompra - a.promedioCompra);
        break;
      case 'cliente':
        copia.sort((a, b) => a.cliente.localeCompare(b.cliente));
        break;
      case 'total':
      default:
        copia.sort((a, b) => b.totalCompras - a.totalCompras);
        break;
    }
    return copia;
  };

  const aplicarOrden = (criterio) => {
    setFiltros({ ...filtros, ordenarPor: criterio });
    setConsolidado(ordenarConsolidado(consolidado, criterio));
  };

  const formatearMoneda = (valor) => `S/ ${Number(valor || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalCarteraVentas = consolidado.reduce((s, c) => s + c.totalCompras, 0);
  const clienteTop = consolidado.length > 0 ? consolidado.reduce((prev, current) => (prev.totalCompras > current.totalCompras) ? prev : current) : null;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header Visual con Gradiente Premium */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 p-10 text-white shadow-2xl shadow-blue-900/20">
          <div className="absolute right-0 top-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <Users size={300} />
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
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">
                <span>Reportería Comercial</span>
                <span className="h-1 w-1 rounded-full bg-blue-500"></span>
                <span>Fidelización y Cartera</span>
              </div>
            </div>

            <h1 className="text-4xl font-black tracking-tighter uppercase mb-4 leading-none">
              Ventas por <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">Cliente</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium leading-relaxed uppercase tracking-wide text-[10px]">
              Analiza el comportamiento de compra de tus clientes, identifica a tus compradores estrella y optimiza tu estrategia de fidelización.
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
          <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md border-b-4 border-b-blue-500">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UserCheck size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Clientes Activos</p>
              <p className="text-3xl font-black text-slate-800 tabular-nums">{consolidado.length}</p>
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md border-b-4 border-b-indigo-500">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <CreditCard size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Monto de Cartera</p>
              <div className="flex items-baseline gap-1 font-black text-slate-800">
                <span className="text-sm text-slate-400">S/</span>
                <p className="text-3xl tabular-nums">{totalCarteraVentas.toLocaleString('es-PE', { minimumFractionDigits: 1 })}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <Award size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Cliente Top</p>
              <p className="text-sm font-black text-slate-700 uppercase line-clamp-1">{clienteTop ? clienteTop.cliente : 'N/A'}</p>
              <p className="text-[10px] font-bold text-indigo-500">{clienteTop ? formatearMoneda(clienteTop.totalCompras) : ''}</p>
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Promedio General</p>
              <div className="flex items-baseline gap-1 font-black text-slate-800">
                <span className="text-sm text-slate-400">S/</span>
                <p className="text-3xl tabular-nums">{(totalCarteraVentas / (consolidado.length || 1)).toLocaleString('es-PE', { minimumFractionDigits: 1 })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Modernos */}
        <div className="rounded-[2.5rem] bg-white border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                <Calendar size={14} /> Fecha Inicio
              </label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-blue-500 transition-all font-bold text-slate-700 text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                <Calendar size={14} /> Fecha Fin
              </label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-blue-500 transition-all font-bold text-slate-700 text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                <User size={14} /> Cliente
              </label>
              <div className="relative">
                <select
                  value={filtros.clienteId}
                  onChange={(e) => setFiltros({ ...filtros, clienteId: e.target.value })}
                  className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-blue-500 appearance-none font-bold text-slate-700 uppercase text-xs"
                >
                  <option value="">Todos los clientes</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                <Filter size={14} /> Mostrar primero
              </label>
              <div className="relative">
                <select
                  value={filtros.ordenarPor}
                  onChange={(e) => aplicarOrden(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-blue-500 appearance-none font-bold text-slate-700 uppercase text-xs"
                >
                  <option value="total">Mayor Facturación</option>
                  <option value="cantidad">Mayor Frecuencia</option>
                  <option value="promedio">Mejor Promedio</option>
                  <option value="cliente">Orden Alfabético</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={18} />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cargarReporte}
                disabled={loading}
                className="flex-1 h-14 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-100 hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Activity size={16} className="animate-spin" /> : <Search size={16} />}
                Consultar
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center gap-4">
            <TrendingDown size={24} />
            <p className="font-bold text-sm uppercase">{error}</p>
          </div>
        )}

        {/* Tabla de Consolidado */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              Rank de Consumo por Cliente ({consolidado.length})
            </h3>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="h-12 w-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analizando cartera...</p>
              </div>
            ) : consolidado.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identidad Cliente</th>
                    <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Frecuencia</th>
                    <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Volumen Compra</th>
                    <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ticket Promedio</th>
                    <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Última Operación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {consolidado.map((item, index) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-10 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all font-black text-xs">
                            {index + 1}
                          </div>
                          <div>
                            <span className="text-sm font-black text-slate-800 block uppercase">{item.cliente}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">DOC: {item.documento || 'No Registrado'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-5 text-center">
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                          <FileText size={12} />
                          {item.cantidadCompras} Pedidos
                        </div>
                      </td>
                      <td className="px-10 py-5 text-right">
                        <span className="text-lg font-black text-slate-800 tabular-nums">
                          {formatearMoneda(item.totalCompras)}
                        </span>
                      </td>
                      <td className="px-10 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-indigo-600 tabular-nums">{formatearMoneda(item.promedioCompra)}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Por Operación</span>
                        </div>
                      </td>
                      <td className="px-10 py-5 text-right">
                        <span className="text-xs font-bold text-slate-500 tabular-nums">
                          {item.ultimaCompra ? item.ultimaCompra.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-32 px-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] m-8">
                <Users size={60} className="mx-auto text-slate-100 mb-6" />
                <h4 className="text-xl font-black text-slate-300 uppercase tracking-tighter mb-2">Sin actividad comercial</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">
                  No se registran ventas para los criterios seleccionados. Intenta ampliar el rango de fechas.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VentasPorCliente;