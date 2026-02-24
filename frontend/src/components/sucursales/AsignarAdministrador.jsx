// src/components/sucursales/AsignarAdministrador.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, Users, Search, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import { asignarAdministrador } from '../../services/sucursalService';
import { obtenerUsuarios } from '../../services/usuarioService';
import '../../styles/AsignarAdministrador.css';

const AsignarAdministrador = ({ sucursal, onClose, onSuccess }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [adminSeleccionado, setAdminSeleccionado] = useState(null);
  const [asignando, setAsignando] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      
      const usuariosData = await obtenerUsuarios();
      
      // Asegurar que usuariosData sea un array
      const usuariosArray = Array.isArray(usuariosData) ? usuariosData : (usuariosData?.usuarios || []);
      
      // Filtrar todos los administradores activos
      const todosLosAdmins = usuariosArray.filter(usuario => 
        usuario.rol === 'Admin' && 
        usuario.estado
      );
      
      setUsuarios(todosLosAdmins);
      
      // Si hay un admin ya asignado a esta sucursal, seleccionarlo
      const adminActual = todosLosAdmins.find(u => u.sucursalId === sucursal.id);
      if (adminActual) {
        setAdminSeleccionado(adminActual);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar los administradores disponibles');
    } finally {
      setCargando(false);
    }
  }, [sucursal.id]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const usuariosFiltrados = usuarios.filter(usuario =>
    `${usuario.nombre} ${usuario.apellido} ${usuario.correo}`.toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const manejarAsignacion = async () => {
    if (!adminSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Selección requerida',
        text: 'Debes seleccionar un administrador',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    // Verificar si el admin ya está asignado a otra sucursal
    const yaAsignado = adminSeleccionado.sucursalId && adminSeleccionado.sucursalId !== sucursal.id;
    
    let textoConfirmacion = `¿Deseas asignar a ${adminSeleccionado.nombre} ${adminSeleccionado.apellido} como administrador de ${sucursal.nombre}?`;
    
    if (yaAsignado) {
      textoConfirmacion += '\n\nAdvertencia: Este administrador ya está asignado a otra sucursal. Al confirmar, será reasignado a esta sucursal.';
    }

    const resultado = await Swal.fire({
      title: '¿Confirmar asignación?',
      text: textoConfirmacion,
      icon: yaAsignado ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, asignar',
      cancelButtonText: 'Cancelar'
    });

    if (resultado.isConfirmed) {
      try {
        setAsignando(true);
        await asignarAdministrador(sucursal.id, adminSeleccionado.id);
        
        Swal.fire({
          icon: 'success',
          title: 'Administrador asignado',
          text: 'El administrador ha sido asignado correctamente',
          confirmButtonColor: '#10b981'
        });
        
        onSuccess();
        onClose();
      } catch (error) {
        console.error('Error al asignar administrador:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo asignar el administrador. Intenta nuevamente.',
          confirmButtonColor: '#dc2626'
        });
      } finally {
        setAsignando(false);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-info">
            <Users className="header-icon" />
            <div>
              <h2>Asignar Administrador</h2>
              <p>Sucursal: {sucursal.nombre}</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <div className="busqueda-container">
            <div className="busqueda-input">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Buscar administrador por nombre o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {cargando ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando administradores...</p>
            </div>
          ) : (
            <div className="usuarios-lista">
              {usuariosFiltrados.length === 0 ? (
                <div className="sin-usuarios">
                  <Users size={48} />
                  <p>No hay administradores disponibles</p>
                  <span>Todos los administradores ya están asignados a otras sucursales</span>
                </div>
              ) : (
                usuariosFiltrados.map(usuario => (
                  <div
                    key={usuario.id}
                    className={`usuario-item ${
                      adminSeleccionado?.id === usuario.id ? 'seleccionado' : ''
                    }`}
                    onClick={() => setAdminSeleccionado(usuario)}
                  >
                    <div className="usuario-info">
                      <div className="usuario-avatar">
                        {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                      </div>
                      <div className="usuario-detalles">
                        <div className="nombre">
                          {usuario.nombre} {usuario.apellido}
                        </div>
                        <div className="correo">{usuario.correo}</div>
                        {usuario.sucursalId === sucursal.id ? (
                          <div className="asignado-actual">
                            <Check size={14} />
                            Administrador actual
                          </div>
                        ) : usuario.sucursalId ? (
                          <div className="asignado-otra">
                            Asignado a otra sucursal
                          </div>
                        ) : (
                          <div className="disponible">
                            Disponible
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="usuario-estado">
                      {adminSeleccionado?.id === usuario.id && (
                        <div className="check-icon">
                          <Check size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancelar"
            onClick={onClose}
            disabled={asignando}
          >
            Cancelar
          </button>
          <button
            className="btn-asignar"
            onClick={manejarAsignacion}
            disabled={!adminSeleccionado || asignando || cargando}
          >
            {asignando ? (
              <>
                <div className="btn-spinner"></div>
                Asignando...
              </>
            ) : (
              <>
                <Users size={16} />
                Asignar Administrador
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignarAdministrador;