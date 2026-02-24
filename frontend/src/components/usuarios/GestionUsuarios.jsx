// src/components/usuarios/GestionUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import {
  obtenerUsuarios,
  eliminarUsuario,
  validarPermisos
} from '../../services/usuarioService';
import { obtenerSucursales } from '../../services/sucursalService';
import '../../styles/GestionUsuarios.css';

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
    // Obtener usuario actual del localStorage
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
    } catch (error) {
      setError('Error al cargar los datos: ' + error.message);
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
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar usuario: ' + error.message,
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
      <div className="gestion-usuarios">
        <div className="cargando">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="gestion-usuarios">
      <div className="header">
        <div className="header-left">
          <button 
            className="btn-volver"
            onClick={() => {
              if (usuarioActual?.rol === 'SuperAdmin') {
                navigate('/dashboard-superadmin');
              } else if (usuarioActual?.rol === 'Admin') {
                navigate('/dashboard-admin');
              } else {
                navigate('/');
              }
            }}
          >
            ← Volver al Dashboard
          </button>
          <h1>Gestión de Usuarios</h1>
        </div>
        {puedeCrearUsuarios && (
          <button 
            className="btn-crear"
            onClick={() => navigate('/usuarios/formulario')}
          >
            <Plus size={16} />
            Crear Usuario
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="filtros">
        <div className="filtro-grupo">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o correo..."
            value={filtros.busqueda}
            onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
            className="filtro-busqueda"
          />
        </div>
        
        <div className="filtro-grupo">
          <select
            value={filtros.rol}
            onChange={(e) => setFiltros({...filtros, rol: e.target.value})}
            className="filtro-select"
          >
            <option value="">Todos los roles</option>
            <option value="SuperAdmin">Super Administrador</option>
            <option value="Admin">Administrador</option>
            <option value="Cajero">Cajero</option>
            <option value="Almacenero">Almacenero</option>
          </select>
        </div>
        
        <div className="filtro-grupo">
          <select
            value={filtros.sucursal}
            onChange={(e) => setFiltros({...filtros, sucursal: e.target.value})}
            className="filtro-select"
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

      <div className="tabla-container">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>Nombre y Apellido</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Sucursal</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="sin-datos">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map(usuario => (
                <tr key={usuario.id}>
                  <td>
                    <div className="usuario-info">
                      <div className="nombre">{usuario.nombre} {usuario.apellido}</div>
                    </div>
                  </td>
                  <td>{usuario.correo}</td>
                  <td>
                    <span className={`rol-badge rol-${usuario.rol.toLowerCase()}`}>
                      {usuario.rol === 'SuperAdmin' ? 'Super Admin' : usuario.rol}
                    </span>
                  </td>
                  <td>{obtenerNombreSucursal(usuario.sucursalId)}</td>
                  <td>
                    <span className={`estado-badge ${usuario.estado ? 'activo' : 'inactivo'}`}>
                      {usuario.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="acciones">
                      {validarPermisos(usuarioActual, 'editar_usuario', usuario) && (
                        <button
                          className="btn-editar"
                          onClick={() => manejarEditar(usuario)}
                          title="Editar usuario"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {validarPermisos(usuarioActual, 'eliminar_usuario', usuario) && (
                        <button
                          className="btn-eliminar"
                          onClick={() => manejarEliminar(usuario.id, usuario)}
                          title="Eliminar usuario"
                        >
                          <Trash2 size={16} />
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

      <div className="resumen">
        <p>Total de usuarios: {usuariosFiltrados.length}</p>
      </div>
    </div>
  );
};

export default GestionUsuarios;