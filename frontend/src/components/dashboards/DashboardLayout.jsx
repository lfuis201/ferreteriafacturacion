import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cerrarSesion } from '../../services/authService';
import Swal from 'sweetalert2';
import { Sidebar } from '../ui';
import {
  menuItems,
  SIDEBAR_SUBMENUS,
  filtrarMenuItemsPorRol,
  getActiveSectionFromPath,
} from './sidebarConfig';

/**
 * Layout reutilizable: Sidebar (mismo que dashboard) + área principal con children.
 * Responsive: en móvil el sidebar es drawer (botón menú); en md+ siempre visible.
 */
function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [guiaRemisionExpanded, setGuiaRemisionExpanded] = useState(false);
  const [guiaRemisionSubsection, setGuiaRemisionSubsection] = useState('');
  const [ventasExpanded, setVentasExpanded] = useState(false);
  const [ventasSubsection, setVentasSubsection] = useState('');
  const [productosExpanded, setProductosExpanded] = useState(false);
  const [productosSubsection, setProductosSubsection] = useState('');
  const [inventarioExpanded, setInventarioExpanded] = useState(false);
  const [inventarioSubsection, setInventarioSubsection] = useState('');
  const [comprasExpanded, setComprasExpanded] = useState(false);
  const [comprasSubsection, setComprasSubsection] = useState('');
  const [proveedoresExpanded, setProveedoresExpanded] = useState(false);
  const [proveedoresSubsection, setProveedoresSubsection] = useState('');

  const activeSection = getActiveSectionFromPath(location.pathname);

  useEffect(() => {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que quieres cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      cerrarSesion();
      navigate('/');
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  const handleModuleNavigation = (moduleId) => {
    closeSidebar();
    switch (moduleId) {
      case 'inicio':
        navigate('/dashboard');
        return;
      case 'usuarios':
        navigate('/usuarios/gestion');
        return;
      case 'sucursales':
        navigate('/sucursales/gestion');
        return;
      case 'categorias':
        navigate('/categorias/gestion');
        return;
      case 'productos, presentaciones':
        setProductosExpanded(!productosExpanded);
        navigate('/dashboard', { state: { activeSection: 'productos, presentaciones' } });
        return;
      case 'ventas':
        setVentasExpanded(!ventasExpanded);
        navigate('/dashboard', { state: { activeSection: 'ventas' } });
        return;
      case 'guiaRemision':
        setGuiaRemisionExpanded(!guiaRemisionExpanded);
        navigate('/dashboard', { state: { activeSection: 'guiaRemision' } });
        return;
      case 'inventario':
        setInventarioExpanded(!inventarioExpanded);
        navigate('/dashboard', { state: { activeSection: 'inventario' } });
        return;
      case 'compras':
        setComprasExpanded(!comprasExpanded);
        navigate('/dashboard', { state: { activeSection: 'compras' } });
        return;
      case 'proveedores':
        setProveedoresExpanded(!proveedoresExpanded);
        navigate('/dashboard', { state: { activeSection: 'proveedores' } });
        return;
      case 'caja':
      case 'servicios':
      case 'cotizaciones':
      case 'clientes':
      case 'reportes':
      case 'configuracion':
        navigate('/dashboard', { state: { activeSection: moduleId } });
        return;
      default:
        navigate('/dashboard', { state: { activeSection: moduleId } });
    }
  };

  const handleSubItemClick = (parentId, subId) => {
    closeSidebar();
    navigate('/dashboard', { state: { activeSection: parentId, subsection: subId } });
  };

  const visibleMenuItems = filtrarMenuItemsPorRol(usuario?.rol, menuItems);

  if (!usuario) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-slate-100">
      {/* Overlay en móvil cuando el sidebar está abierto */}
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={closeSidebar}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      {/* Sidebar: drawer en móvil, fijo en md+ */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-out
          md:relative md:translate-x-0 md:shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar
          title="Ferretería"
          roleLabel={usuario?.rol || 'SuperAdmin'}
          items={visibleMenuItems}
          submenus={SIDEBAR_SUBMENUS}
          activeSection={activeSection}
          expanded={{
            'guiaRemision': guiaRemisionExpanded,
            'ventas': ventasExpanded,
            'productos, presentaciones': productosExpanded,
            'inventario': inventarioExpanded,
            'compras': comprasExpanded,
            'proveedores': proveedoresExpanded,
          }}
          subsection={{
            'guiaRemision': guiaRemisionSubsection,
            'ventas': ventasSubsection,
            'productos, presentaciones': productosSubsection,
            'inventario': inventarioSubsection,
            'compras': comprasSubsection,
            'proveedores': proveedoresSubsection,
          }}
          onItemClick={handleModuleNavigation}
          onSubItemClick={handleSubItemClick}
          user={usuario}
          onLogout={handleLogout}
        />
        {/* Botón cerrar dentro del drawer en móvil */}
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={closeSidebar}
          className="absolute right-3 top-4 rounded-lg p-1.5 text-white hover:bg-white/20 md:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Barra superior móvil: botón menú */}
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-slate-800">Ferretería</span>
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-slate-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
