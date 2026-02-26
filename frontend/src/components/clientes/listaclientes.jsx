import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Users,
  UserPlus,
  Filter,
  RefreshCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building2,
  FileText
} from 'lucide-react';
import { obtenerClientes, eliminarCliente as eliminarClienteAPI } from '../../services/clienteService';
import ModalCliente from './ModalCliente';
import ModalClienteEdit from './ModalClienteEdit';
import Swal from 'sweetalert2';

const ListaClientes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedName, setSelectedName] = useState('Nombre');
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdit, setMostrarModalEdit] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 10;

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, []);

  // Filtrar clientes cuando cambie el término de búsqueda
  useEffect(() => {
    filtrarClientes();
  }, [searchTerm, selectedName, clientes]);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const response = await obtenerClientes();
      const clientesData = response.clientes || [];
      setClientes(clientesData);
      setError(null);
    } catch (error) {
      console.error('❌ Error al cargar clientes:', error);
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const filtrarClientes = () => {
    if (!searchTerm.trim()) {
      setClientesFiltrados(clientes);
      return;
    }

    const filtrados = clientes.filter(cliente => {
      const termino = searchTerm.toLowerCase();
      switch (selectedName) {
        case 'Nombre':
          return cliente.nombre?.toLowerCase().includes(termino);
        case 'Documento':
          return cliente.numeroDocumento?.toLowerCase().includes(termino);
        default:
          return cliente.nombre?.toLowerCase().includes(termino);
      }
    });

    setClientesFiltrados(filtrados);
    setPaginaActual(1);
  };

  const handleClienteCreado = (nuevoCliente) => {
    setClientes(prev => [nuevoCliente, ...prev]);
    setMostrarModal(false);
    setClienteEditando(null);
    Swal.fire({ icon: 'success', title: 'Cliente creado', timer: 1500, showConfirmButton: false });
  };

  const handleClienteActualizado = (clienteActualizado) => {
    setClientes(prev => prev.map(c => c.id === clienteActualizado.id ? clienteActualizado : c));
    setMostrarModalEdit(false);
    setClienteEditando(null);
    Swal.fire({ icon: 'success', title: 'Cliente actualizado', timer: 1500, showConfirmButton: false });
  };

  const abrirModalNuevo = () => {
    setClienteEditando(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (cliente) => {
    setClienteEditando(cliente);
    setMostrarModalEdit(true);
  };

  const eliminarCliente = async (clienteId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
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
      setLoading(true);
      await eliminarClienteAPI(clienteId);
      setClientes(prev => prev.filter(c => c.id !== clienteId));
      Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El cliente ha sido eliminado correctamente', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Paginación
  const indexOfLastItem = paginaActual * clientesPorPagina;
  const indexOfFirstItem = indexOfLastItem - clientesPorPagina;
  const currentItems = clientesFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPaginas; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/40 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xl shadow-indigo-200">
            <Users size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-menta-petroleo uppercase">Cartera de Clientes</h2>
            <p className="text-sm font-medium text-slate-500">Gestión de contactos, documentos y direcciones de facturación</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cargarClientes}
            disabled={loading}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualizar
          </button>
          <button
            onClick={abrirModalNuevo}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-menta-petroleo to-menta-marino px-6 text-sm font-bold text-white shadow-lg shadow-menta-petroleo/20 transition hover:translate-y-[-1px] active:scale-95 uppercase tracking-tighter"
          >
            <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
            NUEVO CLIENTE
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex flex-wrap gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Clientes</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">{clientes.length}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Empresas (RUC)</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">
                {clientes.filter(c => c.tipoDocumento === 'RUC' || c.tipoDocumento === '6').length}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-[240px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Personas (DNI)</p>
              <p className="text-xl font-bold text-slate-800 tracking-tighter">
                {clientes.filter(c => c.tipoDocumento === 'DNI' || c.tipoDocumento === '1').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-64 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <Filter size={14} className="text-menta-turquesa" />
              <label>Buscar por</label>
            </div>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11 transition"
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
              >
                <option>Nombre</option>
                <option>Documento</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-slate-400" size={18} />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <Search size={14} className="text-menta-turquesa" />
              <label>Término de búsqueda</label>
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-12 text-sm font-semibold text-slate-700 focus:border-menta-turquesa outline-none h-11 transition"
                placeholder="Escribe el nombre o documento del cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-4 top-3 text-slate-300">
                <Search size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-16">#</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Razón Social / Nombre</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Documento</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Contacto</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-menta-petroleo">Ubicación</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-menta-petroleo pr-10">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando base de datos...</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-200">
                      <Users size={48} />
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-slate-800 uppercase tracking-tighter">Sin resultados</p>
                        <p className="text-xs text-slate-400">No se encontraron clientes con esos criterios</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((cliente, index) => (
                  <tr
                    key={cliente.id}
                    className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => abrirModalEditar(cliente)}
                  >
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                          <Building2 size={14} />
                        </div>
                        <span className="font-bold text-slate-700 uppercase tracking-tight truncate max-w-xs">{cliente.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{cliente.tipoDocumento || 'DOC'}</span>
                        <span className="font-semibold text-slate-600">{cliente.numeroDocumento}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail size={12} className="text-indigo-400" />
                          <span className="truncate max-w-[150px]">{cliente.email || 'Sin correo'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone size={12} className="text-emerald-400" />
                          <span>{cliente.telefono || 'Sin teléfono'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{cliente.departamento} - {cliente.provincia}</span>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <MapPin size={12} className="text-orange-400" />
                          <span className="truncate max-w-xs">{cliente.direccion}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 px-10">
                      <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => abrirModalEditar(cliente)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-90 shadow-sm"
                          title="Editar Cliente"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => eliminarCliente(cliente.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white transition-all active:scale-90 shadow-sm"
                          title="Eliminar Cliente"
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

        {/* Improved Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 gap-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            MOSTRANDO <span className="text-slate-700">{indexOfFirstItem + 1}</span> - <span className="text-slate-700">{Math.min(indexOfLastItem, clientesFiltrados.length)}</span> DE <span className="text-slate-700">{clientesFiltrados.length}</span> CLIENTES
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
              disabled={paginaActual === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-30 active:scale-95 shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex h-9 items-center px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm min-w-[60px] justify-center">
              {paginaActual} / {totalPaginas || 1}
            </div>
            <button
              onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
              disabled={paginaActual === totalPaginas || totalPaginas === 0}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-30 active:scale-95 shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {mostrarModal && (
        <ModalCliente
          onClose={() => {
            setMostrarModal(false);
            setClienteEditando(null);
          }}
          onClienteCreado={handleClienteCreado}
          clienteEditando={clienteEditando}
        />
      )}

      {mostrarModalEdit && (
        <ModalClienteEdit
          cliente={clienteEditando}
          onClose={() => {
            setMostrarModalEdit(false);
            setClienteEditando(null);
          }}
          onClienteActualizado={handleClienteActualizado}
        />
      )}
    </div>
  );
};

export default ListaClientes;