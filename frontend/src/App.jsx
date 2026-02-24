import { Routes, Route } from "react-router-dom";
import RutaProtegidaPorRol from './components/rolespermisos/RutaProtegidaPorRol';

// Importar  login y registro de usuarios desde los componentes
import LoginUsuario from "./components/loginRegsitro/LoginUsuario";
import RegistroSuperAdmin from "./components/loginRegsitro/RegistroSuperAdmin";

// Importar dashboards desde los componentes
import DashboardSuperAdmin from "./components/dashboards/DashboardSuperAdmin";

// importar categorias desde los componentes
import FormularioCategoria from "./components/categorias/FormularioCategoria";
import ListaCategorias from "./components/categorias/ListaCategorias";
import GestionCategorias from "./components/categorias/GestionCategorias";

// importar productos desde los componentes
import FormularioProducto from "./components/productos-presentacion/FormularioProducto";
import ListaProductos from "./components/productos-presentacion/ListaProductos";
import GestionProductos from "./components/productos-presentacion/GestionProductos";

// importar ventas desde los componentes
import ListaVentas from "./components/ventas/ListaVentas";
import FormularioVenta from "./components/ventas/FormularioVenta";

// importar configuraciones desde los componentes
import GestionConfiguraciones from "./components/configuraciones/GestionConfiguraciones";
import ConfiguracionSunat from "./components/configuraciones/ConfiguracionSunat";
import ConfiguracionWhatsapp from "./components/configuraciones/ConfiguracionWhatsapp";

// importar usuarios desde los componentes
import GestionUsuarios from "./components/usuarios/GestionUsuarios";
import FormularioUsuario from "./components/usuarios/FormularioUsuario";

// importar sucursales desde los componentes
import GestionSucursales from "./components/sucursales/GestionSucursales";
import FormularioSucursal from "./components/sucursales/FormularioSucursal";

// importar almacenes desde los componentes
import ActualizarPreciosAlmacen from "./components/almacenes/ActualizarPreciosAlmacen";
import ListaProductosAlmacen from "./components/almacenes/ListaProductosAlmacen";

// importar inventario desde los componentes
import GestionInventario from "./components/inventario/GestionInventario"; 


//importar Guia de Remision desde los componentes

import ListaGuiasRemision from "./components/guiaRemision/ListaGuiasRemision";
import FormularioGuiaCompleto from "./components/guiaRemision/FormularioGuiaCompleto";
import DetalleGuiaRemision from "./components/guiaRemision/DetalleGuiaRemision";

// importar compras desde los componentes
import ListaCompras from "./components/Compras/ListaCompras";
import EditarCompras from "./components/Compras/editarCompras";

// importar proveedores desde los componentes
import ListaProveedores from "./components/proveedores/ListaProveedores";
import FormularioProveedores from "./components/proveedores/FormularioProveedores";




function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<LoginUsuario />} />
      <Route path="/register-superadmin" element={<RegistroSuperAdmin />} />

      {/* Rutas protegidas por ROL */}
      {/* Ruta unificada para todos los roles */}
      <Route 
        path="/dashboard" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Cajero', 'Almacenero']}>
            <DashboardSuperAdmin /> 
          </RutaProtegidaPorRol>
        } 
      />

      {/* Mantener rutas legacy apuntando al dashboard unificado */}
      <Route 
        path="/dashboard-superadmin" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Cajero', 'Almacenero']}>
            <DashboardSuperAdmin /> 
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/dashboard-admin" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Cajero', 'Almacenero']}>
            <DashboardSuperAdmin /> 
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/dashboard-cajero" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Cajero', 'Almacenero']}>
            <DashboardSuperAdmin /> 
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/dashboard-almacenero" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Cajero', 'Almacenero']}>
            <DashboardSuperAdmin /> 
          </RutaProtegidaPorRol>
        } 
      />

      {/* Rutas para categorías */}
      <Route 
        path="/categorias/formulario" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin']}>
            <FormularioCategoria />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/categorias/lista" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin']}>
            <ListaCategorias />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/categorias/gestion" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin']}>
            <GestionCategorias />
          </RutaProtegidaPorRol>
        } 
      />

      {/* Rutas para productos */}
      <Route 
        path="/productos/formulario" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero']}>
            <FormularioProducto />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/productos/lista" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero']}>
            <ListaProductos />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/productos/gestion" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero']}>
            <GestionProductos />
          </RutaProtegidaPorRol>
        } 
      />

      {/* Rutas para ventas */}
      <Route 
        path="/ventas/FormularioVenta" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Cajero']}>
            <FormularioVenta />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/ventas/lista" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Cajero']}>
            <ListaVentas />
          </RutaProtegidaPorRol>
        } 
      />
      

      {/* Rutas para configuraciones */}
      <Route 
        path="/configuraciones" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin']}>
            <GestionConfiguraciones />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/configuraciones/sunat" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin']}>
            <ConfiguracionSunat />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/configuraciones/whatsapp" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin']}>
            <ConfiguracionWhatsapp />
          </RutaProtegidaPorRol>
        } 
      />

      {/* Rutas para usuarios */}
      <Route 
        path="/usuarios/gestion" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin']}>
            <GestionUsuarios />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/usuarios/formulario" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin']}>
            <FormularioUsuario />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/usuarios/formulario/:id" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin']}>
            <FormularioUsuario />
          </RutaProtegidaPorRol>
        } 
      />

      {/* Rutas para sucursales */}
      <Route 
        path="/sucursales" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin']}>
            <GestionSucursales />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/sucursales/gestion" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin']}>
            <GestionSucursales />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/sucursales/formulario" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin']}>
            <FormularioSucursal />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/sucursales/formulario/:id" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin']}>
            <FormularioSucursal />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/sucursales/editar/:id" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin']}>
            <FormularioSucursal />
          </RutaProtegidaPorRol>
        } 
      />

      {/* Rutas para almacenes */}
      <Route 
        path="/almacenes/actualizar-precios" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin']}>
            <ActualizarPreciosAlmacen />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/almacenes/productos" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero']}>
            <ListaProductosAlmacen />
          </RutaProtegidaPorRol>
        } 
      />

      {/* Rutas para inventario */}
      <Route 
        path="/inventario/gestion" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero']}>
            <GestionInventario />
          </RutaProtegidaPorRol>
        } 
      />
     

      {/* Rutas para guia de remision */}
    
      <Route 
        path="/guia-remision/gestion" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero']}>
            <ListaGuiasRemision />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/guia-remision/lista" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero', 'Cajero']}>
            <ListaGuiasRemision />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/guia-remision/formulario" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Cajero']}>
            <FormularioGuiaCompleto />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/guia-remision/editar/:id" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Cajero']}>
            <FormularioGuiaCompleto />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/guias-remision/detalle/:id" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero', 'Cajero']}>
            <DetalleGuiaRemision />
          </RutaProtegidaPorRol>
        } 
      />

      {/* Rutas para compras */}
      <Route 
        path="/compras/lista" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero']}>
            <ListaCompras />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/compras/editar/:id" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero']}>
            <EditarCompras />
          </RutaProtegidaPorRol>
        } 
      />

      {/* Rutas para proveedores */}
      <Route 
        path="/proveedores/lista" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero']}>
            <ListaProveedores />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/proveedores/nuevo" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero']}>
            <FormularioProveedores />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/proveedores/formulario" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero']}>
            <FormularioProveedores />
          </RutaProtegidaPorRol>
        } 
      />
      <Route 
        path="/proveedores/editar/:id" 
        element={
          <RutaProtegidaPorRol rolesPermitidos={['SuperAdmin', 'Admin', 'Almacenero']}>
            <FormularioProveedores />
          </RutaProtegidaPorRol>
        } 
      />

      </Routes>
  );
}

export default App;