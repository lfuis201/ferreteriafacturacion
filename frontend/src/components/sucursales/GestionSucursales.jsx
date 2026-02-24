// src/components/sucursales/GestionSucursales.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, Edit, Trash2, MapPin, Phone, Mail, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import { obtenerSucursales, eliminarSucursal } from '../../services/sucursalService';
import AsignarAdministrador from './AsignarAdministrador';
import '../../styles/GestionSucursales.css';

// Constantes para mensajes de error
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
    // Obtener usuario actual del localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      setUsuarioActual(usuario);
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
    } catch (error) {
      console.error('Error al cargar datos:', error);
      
      let mensajeError = MENSAJES_ERROR.ERROR_SERVIDOR;
      
      if (error.message) {
        if (error.message.includes('conexión') || error.message.includes('network')) {
          mensajeError = MENSAJES_ERROR.ERROR_CONEXION;
        } else if (error.message.includes('permisos') || error.message.includes('autorizado')) {
          mensajeError = MENSAJES_ERROR.ERROR_PERMISOS;
        } else {
          mensajeError = error.message;
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
    if (sucursal && sucursal.Usuarios && sucursal.Usuarios.length > 0) {
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
    cargarDatos(false); // Recargar sin mostrar loading
  };

  // Funciones de filtrado
  const sucursalesFiltradas = sucursales.filter(sucursal => {
    const coincideBusqueda = filtros.busqueda === '' || 
      sucursal.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      sucursal.ubicacion.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      sucursal.direccion.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const coincideDepartamento = filtros.departamento === '' || sucursal.departamento === filtros.departamento;
    const coincideProvincia = filtros.provincia === '' || sucursal.provincia === filtros.provincia;
    const coincideEstado = filtros.estado === '' || 
      (filtros.estado === 'activo' && (sucursal.estado === true || sucursal.estado === 1)) ||
      (filtros.estado === 'inactivo' && (sucursal.estado === false || sucursal.estado === 0));
    
    return coincideBusqueda && coincideDepartamento && coincideProvincia && coincideEstado;
  });

  // Obtener departamentos únicos
  const departamentosUnicos = [...new Set(sucursales.map(s => s.departamento))].filter(Boolean).sort();
  
  // Obtener provincias únicas (filtradas por departamento si hay uno seleccionado)
  const provinciasUnicas = [...new Set(
    sucursales
      .filter(s => filtros.departamento === '' || s.departamento === filtros.departamento)
      .map(s => s.provincia)
  )].filter(Boolean).sort();

  const manejarEliminar = async (sucursalId, nombreSucursal) => {
    // Verificar si la sucursal tiene usuarios asignados
    const tieneAdministrador = obtenerAdministrador(sucursalId) !== 'Sin asignar';
    
    let textoAdvertencia = `¿Deseas eliminar la sucursal "${nombreSucursal}"? Esta acción no se puede deshacer.`;
    
    if (tieneAdministrador) {
      textoAdvertencia += `\n\nAdvertencia: Esta sucursal tiene un administrador asignado (${obtenerAdministrador(sucursalId)}). Al eliminar la sucursal, el administrador quedará sin asignación.`;
    }
    
    const resultado = await Swal.fire({
      title: '¿Estás seguro?',
      text: textoAdvertencia,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-wide'
      }
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
      } catch (error) {
        console.error('Error al eliminar sucursal:', error);
        
        let mensajeError = 'No se pudo eliminar la sucursal. Intenta nuevamente.';
        
        if (error.message) {
          if (error.message.includes('referencia') || error.message.includes('constraint')) {
            mensajeError = 'No se puede eliminar la sucursal porque tiene datos relacionados. Primero debe eliminar o reasignar los elementos asociados.';
          } else if (error.message.includes('permisos')) {
            mensajeError = 'No tienes permisos para eliminar esta sucursal.';
          } else {
            mensajeError = error.message;
          }
        }
        
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
      <div className="gestion-sucursales">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando sucursales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gestion-sucursales">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={cargarDatos} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-sucursales">
      <div className="header-section">
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
        </div>

        <div className="title-section">
          <h2>
            <Building className="icon" />
            Gestión de Sucursales
          </h2>
          <p className="subtitle">Administra las sucursales del sistema</p>
        </div>
        
        <button 
          className="btn-primary btn-nuevo"
          onClick={() => navigate('/sucursales/formulario')}
        >
          <Plus className="icon" />
          Nueva Sucursal
        </button>
      </div>

      <div className="filtros-section">
        <div className="filtros-grid">
          <div className="filtro-grupo">
            <label>Buscar:</label>
            <input
              type="text"
              placeholder="Nombre, ubicación o dirección..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
              className="input-filtro"
            />
          </div>
          
          <div className="filtro-grupo">
            <label>Departamento:</label>
            <select
              value={filtros.departamento}
              onChange={(e) => setFiltros({...filtros, departamento: e.target.value, provincia: ''})}
              className="select-filtro"
            >
              <option value="">Todos</option>
              {departamentosUnicos.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>
          
          <div className="filtro-grupo">
            <label>Provincia:</label>
            <select
              value={filtros.provincia}
              onChange={(e) => setFiltros({...filtros, provincia: e.target.value})}
              className="select-filtro"
            >
              <option value="">Todas</option>
              {provinciasUnicas.map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>
          
          <div className="filtro-grupo">
            <label>Estado:</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              className="select-filtro"
            >
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="contenido-section">
        {sucursalesFiltradas.length === 0 ? (
          <div className="empty-state">
            <Building className="empty-icon" />
            <h3>{sucursales.length === 0 ? 'No hay sucursales registradas' : 'No se encontraron sucursales'}</h3>
            <p>{sucursales.length === 0 ? 'Comienza agregando tu primera sucursal' : 'No hay sucursales que coincidan con los filtros aplicados.'}</p>
          </div>
        ) : (
          <div className="sucursales-grid">
            {sucursalesFiltradas.map(sucursal => (
              <div key={sucursal.id} className="sucursal-card">
                <div className="card-header">
                  <div className="sucursal-info">
                    <h3 className="sucursal-nombre">{sucursal.nombre}</h3>
                    <span className={`estado-badge ${(sucursal.estado === true || sucursal.estado === 1) ? 'activo' : 'inactivo'}`}>
                      {(sucursal.estado === true || sucursal.estado === 1) ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn-gestion-sucursal-editar"
                      onClick={() => navigate(`/sucursales/editar/${sucursal.id}`)}
                      title="Editar sucursal"
                    >
                      <Edit className="icon" />
                    </button>
                    <button
                      className="btn-gestion-sucursal-eliminar"
                      onClick={() => manejarEliminar(sucursal.id, sucursal.nombre)}
                      title="Eliminar sucursal"
                    >
                      <Trash2 className="icon" />
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="info-item">
                    <MapPin className="info-icon" />
                    <span>{sucursal.direccion || sucursal.ubicacion}</span>
                  </div>
                  
                  {sucursal.telefono && (
                    <div className="info-item">
                      <Phone className="info-icon" />
                      <span>{sucursal.telefono}</span>
                    </div>
                  )}
                  
                  {sucursal.email && (
                    <div className="info-item">
                      <Mail className="info-icon" />
                      <span>{sucursal.email}</span>
                    </div>
                  )}
                  
                  {sucursal.ruc && (
                    <div className="info-item">
                      <span className="info-label">RUC:</span>
                      <span>{sucursal.ruc}</span>
                    </div>
                  )}
                  
                  {sucursal.departamento && (
                    <div className="info-item">
                      <span className="info-label">Ubicación:</span>
                      <span>{sucursal.distrito}, {sucursal.provincia}, {sucursal.departamento}</span>
                    </div>
                  )}
                </div>
                
                <div className="card-footer">
                  <div className="admin-info">
                    <Users className="info-icon" />
                    {sucursal.Usuarios && sucursal.Usuarios.length > 0 ? (
                      <div className="admin-asignado">
                        <span className="admin-label">Admin:</span>
                        <span className="admin-nombre">
                          {sucursal.Usuarios[0].nombre} {sucursal.Usuarios[0].apellido}
                        </span>
                      </div>
                    ) : (
                      <span className="sin-admin">Sin administrador</span>
                    )}
                  </div>
                  
                  <button
                    className="btn-secondary btn-asignar"
                    onClick={() => manejarAsignarAdmin(sucursal)}
                    title="Asignar administrador"
                  >
                    <Users className="icon" />
                    Asignar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="stats-section mb-6">
        <div className="stat-card">
          <span className="stat-number">{sucursalesFiltradas.length}</span>
          <span className="stat-label">Total Filtradas</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{sucursalesFiltradas.filter(s => s.Usuarios && s.Usuarios.length > 0).length}</span>
          <span className="stat-label">Con Administrador</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{departamentosUnicos.length}</span>
          <span className="stat-label">Departamentos</span>
        </div>
      </div>
      
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