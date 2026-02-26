// src/components/sucursales/GestionSucursales.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Mail, Users, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { obtenerSucursales, eliminarSucursal } from '../../services/sucursalService';
import AsignarAdministrador from './AsignarAdministrador';
import StatCard from '../dashboards/StatCard';

const MENSAJES_ERROR = {
  ERROR_SERVIDOR: 'Error del servidor. Por favor, intenta más tarde.',
  ERROR_CONEXION: 'Error de conexión. Verifica tu conexión a internet.',
  ERROR_PERMISOS: 'No tienes permisos para realizar esta acción.'
};

const GestionSucursales = () => {
  const navigate = useNavigate();
  const [sucursales, setSucursales] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [intentosRecarga, setIntentosRecarga] = useState(0);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    departamento: '',
    provincia: '',
    estado: ''
  });
  const [mostrarAsignarAdmin, setMostrarAsignarAdmin] = useState(false);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuarioActual(JSON.parse(usuarioGuardado));
    }
    cargarDatos();
  }, []);

  const cargarDatos = async (mostrarCarga = true) => {
    try {
      if (mostrarCarga) setCargando(true);
      setError('');
      const sucursalesData = await obtenerSucursales();
      setSucursales(sucursalesData.sucursales || []);
      setIntentosRecarga(0);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      let mensajeError = MENSAJES_ERROR.ERROR_SERVIDOR;
      if (err.message) {
        if (err.message.includes('conexión') || err.message.includes('network')) {
          mensajeError = MENSAJES_ERROR.ERROR_CONEXION;
        } else if (err.message.includes('permisos') || err.message.includes('autorizado')) {
          mensajeError = MENSAJES_ERROR.ERROR_PERMISOS;
        } else {
          mensajeError = err.message;
        }
      }
      setError(mensajeError);
      setIntentosRecarga(prev => prev + 1);
    } finally {
      if (mostrarCarga) setCargando(false);
    }
  };

  const obtenerAdministrador = (sucursalId) => {
    const sucursal = sucursales.find(s => s.id === sucursalId);
    if (sucursal?.Usuarios?.length > 0) {
      return `${sucursal.Usuarios[0].nombre} ${sucursal.Usuarios[0].apellido}`;
    }
    return 'Sin asignar';
  };

  const manejarAsignarAdmin = (sucursal) => {
    setSucursalSeleccionada(sucursal);
    setMostrarAsignarAdmin(true);
  };

  const cerrarModalAsignar = () => {
    setMostrarAsignarAdmin(false);
    setSucursalSeleccionada(null);
  };

  const onAsignacionExitosa = () => {
    cerrarModalAsignar();
    cargarDatos(false);
  };

  const sucursalesFiltradas = sucursales.filter(sucursal => {
    const coincideBusqueda = filtros.busqueda === '' ||
      sucursal.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      sucursal.ubicacion?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      sucursal.direccion?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const coincideDepartamento = filtros.departamento === '' || sucursal.departamento === filtros.departamento;
    const coincideProvincia = filtros.provincia === '' || sucursal.provincia === filtros.provincia;
    const coincideEstado = filtros.estado === '' ||
      (filtros.estado === 'activo' && (sucursal.estado === true || sucursal.estado === 1)) ||
      (filtros.estado === 'inactivo' && (sucursal.estado === false || sucursal.estado === 0));
    return coincideBusqueda && coincideDepartamento && coincideProvincia && coincideEstado;
  });

  const departamentosUnicos = [...new Set(sucursales.map(s => s.departamento))].filter(Boolean).sort();
  const provinciasUnicas = [...new Set(
    sucursales
      .filter(s => filtros.departamento === '' || s.departamento === filtros.departamento)
      .map(s => s.provincia)
  )].filter(Boolean).sort();

  const manejarEliminar = async (sucursalId, nombreSucursal) => {
    const tieneAdministrador = obtenerAdministrador(sucursalId) !== 'Sin asignar';
    let textoAdvertencia = `¿Deseas eliminar la sucursal "${nombreSucursal}"? Esta acción no se puede deshacer.`;
    if (tieneAdministrador) {
      textoAdvertencia += `\n\nAdvertencia: Esta sucursal tiene un administrador asignado (${obtenerAdministrador(sucursalId)}).`;
    }
    const resultado = await Swal.fire({
      title: '¿Estás seguro?',
      text: textoAdvertencia,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (resultado.isConfirmed) {
      try {
        await eliminarSucursal(sucursalId);
        await cargarDatos();
        Swal.fire({
          icon: 'success',
          title: 'Sucursal eliminada',
          text: 'La sucursal ha sido eliminada correctamente',
          confirmButtonColor: '#10b981'
        });
      } catch (err) {
        let mensajeError = 'No se pudo eliminar la sucursal. Intenta nuevamente.';
        if (err.message?.includes('referencia') || err.message?.includes('constraint')) {
          mensajeError = 'No se puede eliminar la sucursal porque tiene datos relacionados.';
        } else if (err.message?.includes('permisos')) {
          mensajeError = 'No tienes permisos para eliminar esta sucursal.';
        } else if (err.message) mensajeError = err.message;
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: mensajeError,
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  if (cargando) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-menta-petroleo border-t-transparent" />
          <span className="text-sm text-menta-petroleo">Cargando sucursales...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-menta-esmeralda bg-white px-4 py-3 text-sm text-menta-petroleo">
          {error}
        </div>
        <button
          type="button"
          onClick={() => cargarDatos()}
          className="rounded-xl bg-menta-petroleo px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-menta-marino"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-fondo">
            <Building2 size={28} className="text-menta-petroleo" />
            Gestión de Sucursales
          </h1>
          <p className="mt-1 text-sm text-menta-petroleo">
            Administra las sucursales del sistema
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/sucursales/formulario')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-menta-petroleo px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-menta-marino"
        >
          <Plus size={18} />
          Nueva Sucursal
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-menta-petroleo" />
            <input
              type="text"
              placeholder="Nombre, ubicación o dirección..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-menta-turquesa focus:bg-white focus:outline-none focus:ring-2 focus:ring-menta-turquesa/20"
            />
          </div>
          <select
            value={filtros.departamento}
            onChange={(e) => setFiltros({ ...filtros, departamento: e.target.value, provincia: '' })}
            className="rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-800 focus:border-menta-turquesa focus:bg-white focus:outline-none focus:ring-2 focus:ring-menta-turquesa/20"
          >
            <option value="">Todos los departamentos</option>
            {departamentosUnicos.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
          <select
            value={filtros.provincia}
            onChange={(e) => setFiltros({ ...filtros, provincia: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-800 focus:border-menta-turquesa focus:bg-white focus:outline-none focus:ring-2 focus:ring-menta-turquesa/20"
          >
            <option value="">Todas las provincias</option>
            {provinciasUnicas.map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-800 focus:border-menta-turquesa focus:bg-white focus:outline-none focus:ring-2 focus:ring-menta-turquesa/20"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Stats en una fila con iconos */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard
          icon={<Building2 size={22} />}
          label="Total filtradas"
          value={sucursalesFiltradas.length}
        />
        <StatCard
          icon={<Users size={22} />}
          label="Con administrador"
          value={sucursalesFiltradas.filter(s => s.Usuarios?.length > 0).length}
        />
        <StatCard
          icon={<MapPin size={22} />}
          label="Departamentos"
          value={departamentosUnicos.length}
        />
      </div>

      {/* Lista de sucursales */}
      {sucursalesFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
          <Building2 className="mb-4 h-14 w-14 text-menta-medio" />
          <h3 className="text-lg font-medium text-fondo">
            {sucursales.length === 0 ? 'No hay sucursales registradas' : 'No se encontraron sucursales'}
          </h3>
          <p className="mt-1 text-sm text-menta-petroleo">
            {sucursales.length === 0 ? 'Comienza agregando tu primera sucursal' : 'Ajusta los filtros para ver resultados.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sucursalesFiltradas.map(sucursal => (
            <div
              key={sucursal.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between border-b border-slate-100 p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-fondo">{sucursal.nombre}</h3>
                  <span
                    className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${
                      (sucursal.estado === true || sucursal.estado === 1)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {(sucursal.estado === true || sucursal.estado === 1) ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/sucursales/editar/${sucursal.id}`)}
                    title="Editar sucursal"
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-menta-claro hover:text-menta-petroleo"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => manejarEliminar(sucursal.id, sucursal.nombre)}
                    title="Eliminar sucursal"
                    className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-2 p-4 text-sm">
                <div className="flex items-start gap-2 text-menta-marino">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-menta-petroleo" />
                  <span>{sucursal.direccion || sucursal.ubicacion || '—'}</span>
                </div>
                {sucursal.telefono && (
                  <div className="flex items-center gap-2 text-menta-marino">
                    <Phone size={16} className="shrink-0 text-menta-petroleo" />
                    <span>{sucursal.telefono}</span>
                  </div>
                )}
                {sucursal.email && (
                  <div className="flex items-center gap-2 text-menta-marino">
                    <Mail size={16} className="shrink-0 text-menta-petroleo" />
                    <span>{sucursal.email}</span>
                  </div>
                )}
                {sucursal.ruc && (
                  <div className="text-menta-marino">
                    <span className="font-medium text-menta-petroleo">RUC: </span>
                    {sucursal.ruc}
                  </div>
                )}
                {sucursal.departamento && (
                  <div className="text-menta-marino">
                    <span className="font-medium text-menta-petroleo">Ubicación: </span>
                    {[sucursal.distrito, sucursal.provincia, sucursal.departamento].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 p-3">
                <div className="flex items-center gap-2 text-sm text-menta-marino">
                  <Users size={16} className="shrink-0 text-menta-petroleo" />
                  {sucursal.Usuarios?.length > 0 ? (
                    <span className="truncate">
                      {sucursal.Usuarios[0].nombre} {sucursal.Usuarios[0].apellido}
                    </span>
                  ) : (
                    <span className="text-menta-petroleo">Sin administrador</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => manejarAsignarAdmin(sucursal)}
                  title="Asignar administrador"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-menta-petroleo transition-colors hover:border-menta-turquesa hover:bg-menta-claro hover:text-menta-marino"
                >
                  <Users size={14} />
                  Asignar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarAsignarAdmin && (
        <AsignarAdministrador
          sucursal={sucursalSeleccionada}
          onClose={cerrarModalAsignar}
          onSuccess={onAsignacionExitosa}
        />
      )}
    </div>
  );
};

export default GestionSucursales;
