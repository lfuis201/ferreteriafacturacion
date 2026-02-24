import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cerrarSesion } from '../../services/authService';
import FormularioVenta from '../ventas/FormularioVenta';
import ListaVentas from '../ventas/ListaVentas';
import Swal from 'sweetalert2';
import '../../styles/Dashboard.css';

function DashboardCajero() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [activeSection, setActiveSection] = useState('inicio');
  const [mostrarFormularioVenta, setMostrarFormularioVenta] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

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
    { id: 'clientes', label: 'Clientes', icon: '👤' },
    { id: 'productos', label: 'Consultar Productos', icon: '📦' },
    { id: 'ventas', label: 'Ventas', icon: '💰' },
    { id: 'guias-remision', label: 'Guías de Remisión', icon: '🚚' },
    { id: 'cotizaciones', label: 'Cotizaciones', icon: '📋' },
    { id: 'notas-venta', label: 'Notas de Venta', icon: '📄' },
    { id: 'reportes-ventas', label: 'Reportes de Ventas', icon: '📈' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <div className="dashboard-content">
            <h2>Panel de Control - Cajero</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Ventas Hoy</h3>
                <p className="stat-number">-</p>
              </div>
              <div className="stat-card">
                <h3>Cotizaciones Pendientes</h3>
                <p className="stat-number">-</p>
              </div>
              <div className="stat-card">
                <h3>Total Vendido Hoy</h3>
                <p className="stat-number">S/. -</p>
              </div>
              <div className="stat-card">
                <h3>Clientes Atendidos</h3>
                <p className="stat-number">-</p>
              </div>
            </div>
            <div className="quick-actions">
              <h3>Acciones Rápidas</h3>
              <div className="action-buttons">
                <button className="action-btn" onClick={() => setActiveSection('ventas')}>
                  💰 Nueva Venta
                </button>
                <button className="action-btn" onClick={() => setActiveSection('cotizaciones')}>
                  📋 Nueva Cotización
                </button>
                <button className="action-btn" onClick={() => setActiveSection('clientes')}>
                  👤 Registrar Cliente
                </button>
              </div>
            </div>
          </div>
        );
      case 'ventas':
        if (mostrarFormularioVenta) {
          return (
            <FormularioVenta
              onVentaCreada={(venta) => {
                setMostrarFormularioVenta(false);
                // Opcional: mostrar la venta creada o recargar la lista
              }}
              onCancelar={() => setMostrarFormularioVenta(false)}
            />
          );
        }
        return (
          <ListaVentas
            onNuevaVenta={() => setMostrarFormularioVenta(true)}
            onVerDetalle={(venta) => setVentaSeleccionada(venta)}
          />
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
          <p>Cajero</p>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  if (item.id === 'guias-remision') {
                    navigate('/guia-remision/lista');
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

export default DashboardCajero;