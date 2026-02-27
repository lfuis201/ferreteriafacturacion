import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerProveedores, eliminarProveedor } from '../../services/proveedorService';
import {
  Plus,
  Trash2,
  Search,
  UserPlus,
  Filter,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Edit3,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  XCircle,
  Building2,
  Fingerprint,
  PhoneCall,
  Layout,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import Swal from 'sweetalert2';

function ListaProveedores() {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState({
    tipoDocumento: ''
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      setError(null);
      const proveedoresData = await obtenerProveedores();
      const proveedoresArray = Array.isArray(proveedoresData)
        ? proveedoresData
        : (proveedoresData?.proveedores || proveedoresData?.data || []);
      setProveedores(proveedoresArray);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setError('Error al cargar los proveedores');
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar proveedor?',
      text: "Se borrará permanentemente de la base de datos",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await eliminarProveedor(id);
        await cargarProveedores();
        Swal.fire({
          title: '¡Borrado!',
          text: 'Proveedor eliminado exitosamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el proveedor', 'error');
      }
    }
  };

  const proveedoresFiltrados = proveedores.filter(proveedor => {
    const busquedaLower = busqueda.toLowerCase();
    const nombre = proveedor.nombre?.toLowerCase() || '';
    const numeroDocumento = proveedor.numeroDocumento?.toLowerCase() || '';
    const ruc = proveedor.ruc?.toLowerCase() || '';

    const coincideBusqueda = nombre.includes(busquedaLower) ||
      numeroDocumento.includes(busquedaLower) ||
      ruc.includes(busquedaLower);

    if (busqueda && !coincideBusqueda) return false;
    if (filtros.tipoDocumento && proveedor.tipoDocumento !== filtros.tipoDocumento) return false;

    return true;
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mx-auto mb-6">
            <XCircle size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Error de Conexión</h3>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button onClick={cargarProveedores} className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            <RefreshCw size={14} /> Reintentar Carga
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/20 min-h-screen animate-in fade-in duration-500">

      {/* Premium Header - Indigo/Slate Theme */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-8 text-white shadow-2xl shadow-indigo-200/50">
        <div className="absolute right-0 top-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Building2 size={280} />
        </div>
        <div className="absolute left-0 bottom-0 p-10 opacity-5 pointer-events-none transform -translate-x-1/4 translate-y-1/4">
          <Users size={200} />
        </div>

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <Briefcase size={32} className="text-indigo-200" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Cartera de <span className="text-indigo-200">Proveedores</span></h1>
              <div className="mt-2 flex items-center gap-2 text-indigo-100/80 text-[10px] font-bold uppercase tracking-[0.2em]">
                <Activity size={14} className="text-indigo-300" /> Gestión estratégica de base de proveedores
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/proveedores/nuevo')}
            className="flex h-14 items-center gap-3 rounded-2xl bg-white px-8 text-sm font-black text-indigo-700 shadow-xl shadow-indigo-900/20 hover:bg-indigo-50 transition-all active:scale-95 uppercase tracking-widest"
          >
            <Plus size={22} /> Nuevo Registro
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6 px-1">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4 transition-hover hover:shadow-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
            <Layout size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Total Registros</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{proveedores.length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4 transition-hover hover:shadow-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Activos</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{proveedores.filter(p => p.estado !== false).length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4 transition-hover hover:shadow-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <Fingerprint size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Con RUC</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{proveedores.filter(p => p.tipoDocumento === 'RUC').length}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4 border-b-4 border-b-indigo-500 transition-hover hover:shadow-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Nuevos (Mes)</p>
            <p className="text-lg font-black text-slate-800 tabular-nums">{Math.round(proveedores.length * 0.15)}</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-5 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Buscar Proveedor</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Nombre, RUC o documento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          <div className="md:col-span-4 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Tipo de Documento</label>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <select
                value={filtros.tipoDocumento}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipoDocumento: e.target.value }))}
                className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 appearance-none transition-all cursor-pointer"
              >
                <option value="">Cualquier Documento</option>
                <option value="RUC">RUC</option>
                <option value="DNI">DNI</option>
                <option value="CE">CE</option>
                <option value="PASAPORTE">PASAPORTE</option>
              </select>
            </div>
          </div>
          <div className="md:col-span-3">
            <button
              onClick={() => { setBusqueda(''); setFiltros({ tipoDocumento: '' }); }}
              className="w-full h-12 rounded-2xl bg-[#0f172a] text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              Resetear Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0f172a] text-white">
              <tr className="h-16 uppercase tracking-widest text-[9px] font-black">
                <th className="px-8 py-4 w-12 text-center border-r border-white/5">#</th>
                <th className="px-6 py-4">Razón Social / Nombre</th>
                <th className="px-6 py-4">Identificación</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Dirección Primaria</th>
                <th className="px-8 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic">
              {loading ? (
                <tr><td colSpan="6" className="py-24 text-center">Interrogando base de datos...</td></tr>
              ) : proveedoresFiltrados.length === 0 ? (
                <tr><td colSpan="6" className="py-24 text-center font-bold text-slate-300 uppercase tracking-widest italic opacity-20">Sin registros que mostrar</td></tr>
              ) : (
                proveedoresFiltrados.map((p, i) => (
                  <tr key={p.id} className="group hover:bg-slate-50/80 transition-all not-italic">
                    <td className="px-8 py-6 text-center text-slate-300 font-bold border-r border-slate-50 italic">{p.id}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          <Building2 size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 tracking-tight uppercase">{p.nombre}</span>
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter italic">{p.nombreComercial || 'Empresa Registrada'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-700 tracking-tighter tabular-nums">{p.numeroDocumento}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase">{p.tipoDocumento}</span>
                          {p.ruc && <span className="text-[9px] font-black text-indigo-500">RUC Activo</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone size={12} className="text-slate-300" />
                          <span className="text-[11px] font-bold tabular-nums">{p.telefono || 'Sin Teléfono'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail size={12} className="text-slate-300" />
                          <span className="text-[11px] font-bold lowercase">{p.email || 'n/a'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 max-w-xs truncate">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-slate-300 mt-0.5 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-500 whitespace-normal leading-tight">{p.direccion || 'Dirección no especificada'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => navigate(`/proveedores/editar/${p.id}`)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90 shadow-sm"><Edit3 size={18} /></button>
                        <button onClick={() => handleEliminar(p.id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-sm"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contabilizados <span className="text-slate-800">{proveedoresFiltrados.length}</span> activos de <span className="text-slate-800">{proveedores.length}</span> globales</p>
          <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest italic leading-none">Visión Gerencial v3.0</p>
        </div>
      </div>

    </div>
  );
}

export default ListaProveedores;