// src/components/usuarios/GestionUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import {
  obtenerUsuarios,
  eliminarUsuario,
  validarPermisos
} from '../../services/usuarioService';
import { obtenerSucursales } from '../../services/sucursalService';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [filtros, setFiltros] = useState({
    rol: '',
    sucursal: '',
    busqueda: ''
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [usuarioActual, setUsuarioActual] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuarioActual(JSON.parse(usuarioGuardado));
    }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [usuariosData, sucursalesData] = await Promise.all([
        obtenerUsuarios(),
        obtenerSucursales()
      ]);
      setUsuarios(usuariosData.usuarios || []);
      setSucursales(sucursalesData.sucursales || []);
    } catch (err) {
      setError('Error al cargar los datos: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  const manejarEliminar = async (id, usuario) => {
    const tienePermisos = validarPermisos(usuarioActual, 'eliminar_usuario', usuario);
    if (!usuarioActual || !tienePermisos) {
      Swal.fire({
        icon: 'error',
        title: 'Sin permisos',
        text: 'No tienes permisos para eliminar este usuario',
        confirmButtonColor: '#d33'
      });
      return;
    }
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await eliminarUsuario(id);
        setUsuarios(usuarios.filter(u => u.id !== id));
        setError('');
        Swal.fire({
          icon: 'success',
          title: 'Usuario eliminado',
          text: 'El usuario ha sido eliminado exitosamente',
          confirmButtonColor: '#3085d6'
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar usuario: ' + err.message,
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  const manejarEditar = (usuario) => {
    const tienePermisos = validarPermisos(usuarioActual, 'editar_usuario', usuario);
    if (!usuarioActual || !tienePermisos) {
      Swal.fire({
        icon: 'error',
        title: 'Sin permisos',
        text: 'No tienes permisos para editar este usuario',
        confirmButtonColor: '#d33'
      });
      return;
    }
    navigate(`/usuarios/formulario/${usuario.id}`);
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = !filtros.busqueda ||
      `${usuario.nombre} ${usuario.apellido} ${usuario.correo}`.toLowerCase()
        .includes(filtros.busqueda.toLowerCase());
    const coincidenRol = !filtros.rol || usuario.rol === filtros.rol;
    const coincideSucursal = !filtros.sucursal ||
      usuario.sucursalId?.toString() === filtros.sucursal;
    return coincideBusqueda && coincidenRol && coincideSucursal;
  });

  const obtenerNombreSucursal = (sucursalId) => {
    if (!sucursalId) return 'Sin asignar';
    const sucursal = sucursales.find(s => s.id === sucursalId);
    return sucursal ? sucursal.nombre : 'Desconocida';
  };

  const puedeCrearUsuarios = usuarioActual && validarPermisos(usuarioActual, 'crear_usuario');

  if (cargando) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-menta-petroleo border-t-transparent" />
          <span className="text-sm text-menta-petroleo">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-fondo">
            <Users size={28} className="text-menta-petroleo" />
            Gestión de Usuarios
          </h1>
          <p className="mt-1 text-sm text-menta-petroleo">
            Lista y administra los usuarios del sistema
          </p>
        </div>
        {puedeCrearUsuarios && (
          <button
            type="button"
            onClick={() => navigate('/usuarios/formulario')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-menta-petroleo px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-menta-marino"
          >
            <Plus size={18} />
            Crear Usuario
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-menta-esmeralda bg-white px-4 py-3 text-sm text-menta-petroleo">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-menta-petroleo" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o correo..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-menta-turquesa focus:bg-white focus:outline-none focus:ring-2 focus:ring-menta-turquesa/20"
            />
          </div>
          <select
            value={filtros.rol}
            onChange={(e) => setFiltros({ ...filtros, rol: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-800 focus:border-menta-turquesa focus:bg-white focus:outline-none focus:ring-2 focus:ring-menta-turquesa/20"
          >
            <option value="">Todos los roles</option>
            <option value="SuperAdmin">Super Administrador</option>
            <option value="Admin">Administrador</option>
            <option value="Cajero">Cajero</option>
            <option value="Almacenero">Almacenero</option>
          </select>
          <select
            value={filtros.sucursal}
            onChange={(e) => setFiltros({ ...filtros, sucursal: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-800 focus:border-menta-turquesa focus:bg-white focus:outline-none focus:ring-2 focus:ring-menta-turquesa/20"
          >
            <option value="">Todas las sucursales</option>
            {sucursales.map(sucursal => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">
                  Nombre y Apellido
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">
                  Correo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">
                  Rol
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">
                  Sucursal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-menta-petroleo">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-sm text-menta-petroleo">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario, index) => (
                  <tr
                    key={usuario.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-menta-marino">
                        {usuario.nombre} {usuario.apellido}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-menta-marino">{usuario.correo}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${
                          usuario.rol === 'SuperAdmin'
                            ? 'bg-blue-100 text-blue-800'
                            : usuario.rol === 'Admin'
                            ? 'bg-sky-100 text-sky-800'
                            : usuario.rol === 'Cajero'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {usuario.rol === 'SuperAdmin' ? 'Super Admin' : usuario.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-menta-marino">
                      {obtenerNombreSucursal(usuario.sucursalId)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${
                          usuario.estado
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {usuario.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {validarPermisos(usuarioActual, 'editar_usuario', usuario) && (
                          <button
                            type="button"
                            onClick={() => manejarEditar(usuario)}
                            title="Editar usuario"
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-menta-claro hover:text-menta-petroleo"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {validarPermisos(usuarioActual, 'eliminar_usuario', usuario) && (
                          <button
                            type="button"
                            onClick={() => manejarEliminar(usuario.id, usuario)}
                            title="Eliminar usuario"
                            className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-menta-petroleo">
          Total de usuarios: <span className="font-semibold text-fondo">{usuariosFiltrados.length}</span>
        </p>
      </div>
    </div>
  );
};

export default GestionUsuarios;
