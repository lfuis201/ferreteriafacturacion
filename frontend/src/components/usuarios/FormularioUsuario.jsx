// src/components/usuarios/FormularioUsuario.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  crearUsuario,
  actualizarUsuario,
  obtenerUsuarioPorId,
  obtenerRolesPermitidos,
  validarPermisos
} from '../../services/usuarioService';
import { obtenerSucursales } from '../../services/sucursalService';
import '../../styles/FormularioUsuario.css';

const FormularioUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    confirmarPassword: '',
    rol: '',
    sucursalId: ''
  });
  
  const [sucursales, setSucursales] = useState([]);
  const [rolesPermitidos, setRolesPermitidos] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [errores, setErrores] = useState({});

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      
      // Cargar sucursales
      const sucursalesData = await obtenerSucursales();
      setSucursales(sucursalesData.sucursales || []);
      
      // Si es edición, cargar datos del usuario
      if (esEdicion) {
        const usuarioData = await obtenerUsuarioPorId(id);
        const usuario = usuarioData.usuario;
        
        setFormData({
          nombre: usuario.nombre || '',
          apellido: usuario.apellido || '',
          correo: usuario.correo || '',
          password: '',
          confirmarPassword: '',
          rol: usuario.rol || '',
          sucursalId: usuario.sucursalId?.toString() || ''
        });
      }
    } catch (error) {
      setError('Error al cargar los datos: ' + error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar datos',
        text: error.message,
        confirmButtonColor: '#d33'
      });
    } finally {
      setCargando(false);
    }
  }, [esEdicion, id]);

  useEffect(() => {
    // Obtener usuario actual del localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      setUsuarioActual(usuario);
      setRolesPermitidos(obtenerRolesPermitidos(usuario));
    }
    
    cargarDatos();
  }, [cargarDatos]);

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es requerido';
    }
    
    if (!formData.correo.trim()) {
      nuevosErrores.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      nuevosErrores.correo = 'El correo no tiene un formato válido';
    }
    
    if (!esEdicion) {
      if (!formData.password) {
        nuevosErrores.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      
      if (formData.password !== formData.confirmarPassword) {
        nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
      }
    } else if (formData.password && formData.password !== formData.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.rol) {
      nuevosErrores.rol = 'El rol es requerido';
    }
    
    if (formData.rol !== 'SuperAdmin' && !formData.sucursalId) {
      nuevosErrores.sucursalId = 'La sucursal es requerida para este rol';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, corrige los errores en el formulario',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    
    try {
      setCargando(true);
      setError('');
      
      const datosEnvio = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        correo: formData.correo.trim(),
        rol: formData.rol,
        sucursalId: formData.rol === 'SuperAdmin' ? null : parseInt(formData.sucursalId)
      };
      
      // Solo incluir password si no está vacío
      if (formData.password) {
        datosEnvio.password = formData.password;
      }
      
      if (esEdicion) {
        await actualizarUsuario(id, datosEnvio);
        Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado',
          text: 'El usuario ha sido actualizado exitosamente',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          navigate('/usuarios/gestion');
        });
      } else {
        await crearUsuario(datosEnvio);
        Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: 'El usuario ha sido creado exitosamente',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          navigate('/usuarios/gestion');
        });
      }
    } catch (error) {
      setError(error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#d33'
      });
    } finally {
      setCargando(false);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Si cambia el rol a SuperAdmin, limpiar sucursal
    if (name === 'rol' && value === 'SuperAdmin') {
      setFormData(prev => ({
        ...prev,
        sucursalId: ''
      }));
    }
  };

  const manejarCancelar = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se perderán todos los cambios no guardados',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Continuar editando'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/usuarios/gestion');
      }
    });
  };

  const puedeGestionarUsuarios = usuarioActual && 
    (esEdicion ? 
      validarPermisos(usuarioActual, 'editar_usuario') : 
      validarPermisos(usuarioActual, 'crear_usuario')
    );

  if (!puedeGestionarUsuarios) {
    return (
      <div className="formulario-usuario">
        <div className="error-permisos">
          No tienes permisos para {esEdicion ? 'editar' : 'crear'} usuarios.
        </div>
      </div>
    );
  }

  return (
    <div className="formulario-usuario">
      <div className="header">
        <h1>{esEdicion ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h1>
        <button 
          className="btn-volver"
          onClick={() => navigate('/usuarios/gestion')}
        >
          ← Volver
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={manejarSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={manejarCambio}
              className={errores.nombre ? 'error' : ''}
              disabled={cargando}
            />
            {errores.nombre && <span className="error-text">{errores.nombre}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="apellido">Apellido *</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={manejarCambio}
              className={errores.apellido ? 'error' : ''}
              disabled={cargando}
            />
            {errores.apellido && <span className="error-text">{errores.apellido}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="correo">Correo Electrónico *</label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={manejarCambio}
            className={errores.correo ? 'error' : ''}
            disabled={cargando}
          />
          {errores.correo && <span className="error-text">{errores.correo}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">
              {esEdicion ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={manejarCambio}
              className={errores.password ? 'error' : ''}
              disabled={cargando}
              placeholder={esEdicion ? 'Dejar vacío para mantener la actual' : ''}
            />
            {errores.password && <span className="error-text">{errores.password}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmarPassword">
              {esEdicion ? 'Confirmar Nueva Contraseña' : 'Confirmar Contraseña *'}
            </label>
            <input
              type="password"
              id="confirmarPassword"
              name="confirmarPassword"
              value={formData.confirmarPassword}
              onChange={manejarCambio}
              className={errores.confirmarPassword ? 'error' : ''}
              disabled={cargando}
            />
            {errores.confirmarPassword && <span className="error-text">{errores.confirmarPassword}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rol">Rol *</label>
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={manejarCambio}
              className={errores.rol ? 'error' : ''}
              disabled={cargando}
            >
              <option value="">Seleccionar rol</option>
              {rolesPermitidos.map(rol => (
                <option key={rol.value} value={rol.value}>
                  {rol.label}
                </option>
              ))}
            </select>
            {errores.rol && <span className="error-text">{errores.rol}</span>}
          </div>
          
          {formData.rol !== 'SuperAdmin' && (
            <div className="form-group">
              <label htmlFor="sucursalId">Sucursal *</label>
              <select
                id="sucursalId"
                name="sucursalId"
                value={formData.sucursalId}
                onChange={manejarCambio}
                className={errores.sucursalId ? 'error' : ''}
                disabled={cargando}
              >
                <option value="">Seleccionar sucursal</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
              {errores.sucursalId && <span className="error-text">{errores.sucursalId}</span>}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancelar"
            onClick={manejarCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-guardar"
            disabled={cargando}
          >
            {cargando ? 'Guardando...' : (esEdicion ? 'Actualizar' : 'Crear Usuario')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioUsuario;