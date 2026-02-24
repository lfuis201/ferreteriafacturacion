import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cerrarSesion } from '../../services/authService';
import Swal from 'sweetalert2';
import '../../styles/Dashboard.css';

function DashboardAdmin() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que quieres cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      cerrarSesion();
      navigate('/');
    }
  };

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: '🏠' },
    { id: 'usuarios', label: 'Gestión de Usuarios', icon: '👥' },
    { id: 'categorias', label: 'Categorías', icon: '📂' },
    { id: 'productos', label: 'Productos', icon: '📦' },
    { id: 'inventario', label: 'Inventario', icon: '📊' },
    { id: 'proveedores', label: 'Proveedores', icon: '🚚' },
    { id: 'clientes', label: 'Clientes', icon: '👤' },
    { id: 'compras', label: 'Compras', icon: '🛒' },
    { id: 'ventas', label: 'Ventas', icon: '💰' },
    { id: 'guias-remision', label: 'Guías de Remisión', icon: '📋' },
    { id: 'cotizaciones', label: 'Cotizaciones', icon: '📋' },
    { id: 'configuraciones', label: 'Configuraciones', icon: '⚙️' },
    { id: 'reportes', label: 'Reportes', icon: '📈' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <div className="dashboard-content">
            <h2>Panel de Control - Administrador</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Productos</h3>
                <p className="stat-number">-</p>
              </div>
              <div className="stat-card">
                <h3>Ventas Hoy</h3>
                <p className="stat-number">-</p>
              </div>
              <div className="stat-card">
                <h3>Stock Bajo</h3>
                <p className="stat-number">-</p>
              </div>
              <div className="stat-card">
                <h3>Clientes</h3>
                <p className="stat-number">-</p>
              </div>
            </div>
          </div>
        );
      case 'usuarios':
        return (
          <div className="dashboard-content">
            <h2>Gestión de Usuarios</h2>
            <div className="module-actions">
              <button 
                className="primary-btn"
                onClick={() => navigate('/usuarios/gestion')}
              >
                Ir a Gestión de Usuarios
              </button>
            </div>
          </div>
        );
      case 'inventario':
        return (
          <div className="dashboard-content">
            <h2>Gestión de Inventario</h2>
            <div className="module-actions">
              <button 
                className="primary-btn"
                onClick={() => navigate('/inventario/gestion')}
              >
                Ir a Gestión de Inventario
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="dashboard-content">
            <h2>{menuItems.find(item => item.id === activeSection)?.label}</h2>
            <p>Funcionalidad en desarrollo...</p>
          </div>
        );
    }
  };

  if (!usuario) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h3>Ferretería</h3>
          <p>Administrador</p>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  if (item.id === 'configuraciones') {
                    navigate('/configuraciones');
                  } else if (item.id === 'usuarios') {
                    navigate('/usuarios/gestion');
                  } else if (item.id === 'guias-remision') {
                    navigate('/guia-remision/gestion');
                  } else {
                    setActiveSection(item.id);
                  }
                }}
              >
                <span className="menu-icon">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <div className="user-info">
            <p>{usuario.nombre} {usuario.apellido}</p>
            <small>{usuario.correo}</small>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </nav>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default DashboardAdmin;