import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cerrarSesion } from '../../services/authService';
import Swal from 'sweetalert2';
import '../../styles/Dashboard.css';

function DashboardAlmacenero() {
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
    { id: 'inventario', label: 'Gestión de Inventario', icon: '📊' },
    { id: 'productos', label: 'Productos', icon: '📦' },
    { id: 'movimientos', label: 'Movimientos de Stock', icon: '🔄' },
    { id: 'compras', label: 'Recepción de Compras', icon: '🛒' },
    { id: 'guias-remision', label: 'Guías de Remisión', icon: '🚚' },
    { id: 'proveedores', label: 'Proveedores', icon: '🚚' },
    { id: 'reportes-inventario', label: 'Reportes de Inventario', icon: '📈' },
    { id: 'alertas-stock', label: 'Alertas de Stock', icon: '⚠️' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <div className="dashboard-content">
            <h2>Panel de Control - Almacenero</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Productos en Stock</h3>
                <p className="stat-number">-</p>
              </div>
              <div className="stat-card">
                <h3>Stock Bajo</h3>
                <p className="stat-number alert">-</p>
              </div>
              <div className="stat-card">
                <h3>Compras Pendientes</h3>
                <p className="stat-number">-</p>
              </div>
              <div className="stat-card">
                <h3>Movimientos Hoy</h3>
                <p className="stat-number">-</p>
              </div>
            </div>
            <div className="quick-actions">
              <h3>Acciones Rápidas</h3>
              <div className="action-buttons">
                <button className="action-btn" onClick={() => navigate('/inventario/gestion')}>
                  📊 Gestionar Inventario
                </button>
                <button className="action-btn" onClick={() => setActiveSection('movimientos')}>
                  🔄 Registrar Movimiento
                </button>
                <button className="action-btn" onClick={() => setActiveSection('compras')}>
                  🛒 Recibir Compra
                </button>
                <button className="action-btn" onClick={() => setActiveSection('alertas-stock')}>
                  ⚠️ Ver Alertas
                </button>
              </div>
            </div>
            <div className="alerts-section">
              <h3>Alertas de Stock Bajo</h3>
              <div className="alert-list">
                <p>No hay alertas de stock bajo en este momento.</p>
              </div>
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
          <p>Almacenero</p>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  if (item.id === 'guias-remision') {
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

export default DashboardAlmacenero;