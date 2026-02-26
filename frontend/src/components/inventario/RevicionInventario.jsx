import React, { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  Table as TableIcon,
  RefreshCcw,
  Filter,
  Store,
  Layers,
  AlertTriangle,
  FileBarChart,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Package,
  CheckCircle2,
  XCircle,
  Hash
} from 'lucide-react';
import {
  obtenerInventarioConBusqueda,
  obtenerSucursalesActivas,
  exportarRevisionInventarioExcel,
  exportarRevisionInventarioPdf
} from '../../services/inventarioService';
import { obtenerCategorias } from '../../services/categoriaService';
import Swal from 'sweetalert2';

const RevisionInventario = () => {
  const [sucursal, setSucursal] = useState('');
  const [categoria, setCategoria] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const [sucursales, setSucursales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [stockContado, setStockContado] = useState({});

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      const [responseSuc, responseCat] = await Promise.all([
        obtenerSucursalesActivas(),
        obtenerCategorias()
      ]);
      setSucursales(responseSuc.data || []);
      setCategorias(responseCat || []);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar los listados maestros' });
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async () => {
    try {
      setLoading(true);
      setShowResults(true);

      const filtros = {
        page: 1,
        limit: pagination.limit
      };
      if (sucursal) filtros.sucursalId = sucursal;
      if (categoria) filtros.categoriaId = categoria;

      const response = await obtenerInventarioConBusqueda(filtros);
      setProductos(response.inventario || []);
      setPagination(response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });

      const initialStockContado = {};
      (response.inventario || []).forEach(item => { initialStockContado[item.id] = 0; });
      setStockContado(initialStockContado);
    } catch (error) {
      console.error('Error al buscar:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'La consulta falló' });
    } finally {
      setLoading(false);
    }
  };

  const calcularDiferencia = (inventarioId, stockSistema) => {
    const contado = stockContado[inventarioId] || 0;
    return stockSistema - contado;
  };

  const handleCambiarPagina = async (nuevaPagina) => {
    try {
      setLoading(true);
      const filtros = { page: nuevaPagina, limit: pagination.limit };
      if (sucursal) filtros.sucursalId = sucursal;
      if (categoria) filtros.categoriaId = categoria;

      const response = await obtenerInventarioConBusqueda(filtros);
      setProductos(response.inventario || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error('Error al cambiar página:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async (tipo) => {
    try {
      setLoading(true);
      const filtros = {};
      if (sucursal) filtros.sucursalId = sucursal;
      if (categoria) filtros.categoriaId = categoria;

      if (tipo === 'pdf') {
        await exportarRevisionInventarioPdf(filtros);
      } else {
        await exportarRevisionInventarioExcel(filtros);
      }
      Swal.fire({ icon: 'success', title: 'Exportación Exitosa', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al generar el archivo: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xl shadow-indigo-200">
            <FileBarChart size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Auditoría de Inventario</h2>
            <p className="text-sm font-medium text-slate-500">Reportes de revisión y control de discrepancias de stock</p>
          </div>
        </div>
        <button
          onClick={handleBuscar}
          disabled={loading}
          className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          Sincronizar Datos
        </button>
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold px-1">
              <Store size={14} className="text-menta-turquesa" />
              <label>Punto de Almacén</label>
            </div>
            <div className="relative">
              <select
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 pr-10 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none h-11 transition"
                disabled={loading}
              >
                <option value="">Todas las sucursales</option>
                {sucursales.map((suc) => <option key={suc.id} value={suc.id}>{suc.nombre}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-slate-400" size={16} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold px-1">
              <Layers size={14} className="text-indigo-400" />
              <label>Categoría Producto</label>
            </div>
            <div className="relative">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 pr-10 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none h-11 transition"
                disabled={loading}
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-slate-400" size={16} />
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              className="group flex w-full h-11 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-menta-petroleo to-indigo-800 text-white font-bold text-sm shadow-lg shadow-indigo-100 transition-all hover:translate-y-[-2px] active:scale-95 disabled:opacity-50 uppercase tracking-widest"
              onClick={handleBuscar}
              disabled={loading}
            >
              <Search size={20} className="group-hover:scale-110 transition-transform" />
              {loading ? 'Generando Reporte...' : 'GENERAR REVISIÓN ANALÍTICA'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Export Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <Package size={14} className="text-indigo-400" />
              Resultado: <span className="text-slate-700">{pagination.total}</span> Items Encontrados
            </div>
            <div className="flex items-center gap-3">
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
                onClick={() => handleExportar('pdf')}
                disabled={loading}
              >
                <FileText size={16} /> PDF
              </button>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                onClick={() => handleExportar('excel')}
                disabled={loading}
              >
                <Download size={16} /> EXCEL
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-16">#</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Código / Barras</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Descripción del Producto</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Stock Sistema</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-menta-petroleo pr-8">Discrepancia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading && productos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-24 text-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600 mx-auto" />
                      </td>
                    </tr>
                  ) : productos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-200">
                          <AlertTriangle size={48} />
                          <p className="text-sm font-bold uppercase tracking-widest">Sin Coincidencias</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    productos.map((item, index) => {
                      const rowNum = (pagination.page - 1) * pagination.limit + index + 1;
                      const diferencia = calcularDiferencia(item.id, item.stock);
                      return (
                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                            {rowNum}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-400 font-bold text-[10px]">
                                <Hash size={14} />
                              </div>
                              <span className="font-bold text-indigo-600 text-xs tracking-widest uppercase">{item.Producto?.codigo || 'S/C'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-700 uppercase text-xs truncate max-w-sm block">{item.Producto?.nombre}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex h-8 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-500 font-black text-xs border border-slate-100">
                              {item.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center pr-8">
                            <div className="flex items-center justify-center">
                              {diferencia === 0 ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-600 uppercase border border-emerald-100">
                                  <CheckCircle2 size={12} /> Correcto
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase border
                                  ${diferencia > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                  <XCircle size={12} /> {diferencia > 0 ? `Faltan ${diferencia}` : `Sobran ${Math.abs(diferencia)}`}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Grid */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-8 py-4 gap-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                PÁGINA <span className="text-slate-800">{pagination.page}</span> DE <span className="text-slate-800">{pagination.totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCambiarPagina(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-30 active:scale-95 shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
                    let pageNum = pagination.page;
                    if (pagination.page <= 2) pageNum = i + 1;
                    else if (pagination.page >= pagination.totalPages - 1) pageNum = pagination.totalPages - 2 + i;
                    else pageNum = pagination.page - 1 + i;

                    if (pageNum > 0 && pageNum <= pagination.totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handleCambiarPagina(pageNum)}
                          className={`h-10 w-10 rounded-xl text-xs font-black transition-all shadow-sm
                            ${pagination.page === pageNum ? 'bg-indigo-600 text-white border-transparent' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-200'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => handleCambiarPagina(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-30 active:scale-95 shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisionInventario;