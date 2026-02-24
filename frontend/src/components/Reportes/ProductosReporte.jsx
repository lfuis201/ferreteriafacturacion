import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Filter, Download, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { obtenerProductosConInventario, exportarProductosExcel } from '../../services/productoService';
import { obtenerCategorias } from '../../services/categoriaService';
import { obtenerSucursales } from '../../services/sucursalService';
import '../../styles/ProductosReporte.css';

const ProductosReporte = ({ onBack }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    categoria: '',
    marca: '',
    stockBajo: false,
    sinStock: false,
    fechaDesde: '',
    fechaHasta: ''
  });
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarSucursales();
  }, []);

  const cargarProductos = async (filtrosAplicados = {}) => {
    try {
      setLoading(true);
      
      // Preparar filtros para el servicio
      const filtrosServicio = {};
      if (filtrosAplicados.categoria) filtrosServicio.categoriaId = filtrosAplicados.categoria;
      if (filtrosAplicados.sucursal) filtrosServicio.sucursalId = filtrosAplicados.sucursal;
      if (filtrosAplicados.busqueda) filtrosServicio.nombre = filtrosAplicados.busqueda;
      
      const response = await obtenerProductosConInventario(filtrosServicio);
      const productosData = response.productos || response.data || [];
      
      // Transformar los datos para que coincidan con la estructura esperada del componente
      const productosTransformados = productosData.map(producto => ({
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.Categorium?.nombre || 'Sin categoría',
        marca: producto.marca || 'Sin marca',
        stockActual: producto.stock || 0,
        stockMinimo: producto.stockMinimo || 0,
        precioCompra: parseFloat(producto.precioCompra) || 0,
        precioVenta: parseFloat(producto.precioVenta) || 0,
        valorInventario: (producto.stock || 0) * (parseFloat(producto.precioCompra) || 0),
        ultimaCompra: producto.updatedAt || producto.createdAt,
        ultimaVenta: producto.updatedAt || producto.createdAt,
        ventasMes: Math.floor(Math.random() * 100), // Placeholder - necesitaría endpoint específico
        rotacion: Math.random() * 5 // Placeholder - necesitaría cálculo específico
      }));
      
      setProductos(productosTransformados);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      // En caso de error, mantener un array vacío
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await obtenerCategorias();
      setCategorias(response.categorias || response.data || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategorias([]);
    }
  };

  const cargarSucursales = async () => {
    try {
      const response = await obtenerSucursales();
      setSucursales(response.sucursales || response.data || []);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      setSucursales([]);
    }
  };

  const aplicarFiltros = async () => {
    await cargarProductos(filtros);
  };

  const filtrarProductosLocalmente = () => {
    return productos.filter(producto => {
      if (filtros.categoria && producto.categoria !== filtros.categoria) return false;
      if (filtros.marca && producto.marca !== filtros.marca) return false;
      if (filtros.stockBajo && producto.stockActual > producto.stockMinimo) return false;
      if (filtros.sinStock && producto.stockActual > 0) return false;
      return true;
    });
  };

  const exportarReporte = async () => {
    try {
      setLoading(true);
      
      // Preparar filtros para la exportación
      const filtrosExportacion = {};
      if (filtros.categoria) filtrosExportacion.categoriaId = filtros.categoria;
      if (filtros.sucursal) filtrosExportacion.sucursalId = filtros.sucursal;
      
      await exportarProductosExcel(filtrosExportacion);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar el archivo. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = filtrarProductosLocalmente();
  const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];
  const marcas = [...new Set(productos.map(p => p.marca))];

  // Cálculos de resumen
  const totalProductos = productosFiltrados.length;
  const valorTotalInventario = productosFiltrados.reduce((sum, p) => sum + p.valorInventario, 0);
  const productosStockBajo = productosFiltrados.filter(p => p.stockActual <= p.stockMinimo).length;
  const productosSinStock = productosFiltrados.filter(p => p.stockActual === 0).length;
  const rotacionPromedio = productosFiltrados.reduce((sum, p) => sum + p.rotacion, 0) / totalProductos || 0;

  if (loading) {
    return (
      <div className="productos-reporte-container">
        <div className="productos-reporte-loading-spinner">Cargando reporte de productos...</div>
      </div>
    );
  }

  return (
    <div className="productos-reporte-container">
      {/* Header */}
      <div className="productos-reporte-header">
        <button onClick={onBack} className="productos-reporte-back-button">
          <ArrowLeft size={20} />
        </button>
        <span className="productos-reporte-home-icon">🏠</span>
        <span className="productos-reporte-breadcrumb">REPORTES</span>
        <span className="productos-reporte-separator">/</span>
        <span className="productos-reporte-breadcrumb">COMPRAS</span>
        <span className="productos-reporte-separator">/</span>
        <span className="productos-reporte-breadcrumb active">PRODUCTOS</span>
      </div>

      {/* Filtros */}
      <div className="productos-reporte-filtros-section">
        <h3><Filter size={20} /> Filtros</h3>
        <div className="productos-reporte-filtros-grid">
          <div className="productos-reporte-filtro-grupo">
            <label>Categoría:</label>
            <select 
              value={filtros.categoria} 
              onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="productos-reporte-filtro-grupo">
            <label>Sucursal:</label>
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

          <div className="productos-reporte-filtro-grupo">
            <label>Marca:</label>
            <select 
              value={filtros.marca} 
              onChange={(e) => setFiltros({...filtros, marca: e.target.value})}
            >
              <option value="">Todas las marcas</option>
              {marcas.map(marca => (
                <option key={marca} value={marca}>{marca}</option>
              ))}
            </select>
          </div>

          <div className="productos-reporte-filtro-grupo">
            <label>
              <input 
                type="checkbox" 
                checked={filtros.stockBajo}
                onChange={(e) => setFiltros({...filtros, stockBajo: e.target.checked})}
              />
              Solo stock bajo
            </label>
          </div>

          <div className="productos-reporte-filtro-grupo">
            <label>
              <input 
                type="checkbox" 
                checked={filtros.sinStock}
                onChange={(e) => setFiltros({...filtros, sinStock: e.target.checked})}
              />
              Solo sin stock
            </label>
          </div>
        </div>

        <div className="productos-reporte-filtros-acciones">
          <button 
            onClick={aplicarFiltros}
            className="productos-reporte-btn-aplicar"
            disabled={loading}
          >
            {loading ? 'Aplicando...' : 'Aplicar Filtros'}
          </button>    
           












          
          <button onClick={exportarReporte} className="productos-reporte-btn-exportar">
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="productos-reporte-resumen-section">
        <div className="productos-reporte-resumen-card">
          <div className="productos-reporte-resumen-item">
            <Package className="productos-reporte-resumen-icon" />
            <div>
              <span className="productos-reporte-resumen-valor">{totalProductos}</span>
              <span className="productos-reporte-resumen-label">Total Productos</span>
            </div>
          </div>
          <div className="productos-reporte-resumen-item">
            <BarChart3 className="productos-reporte-resumen-icon" />
            <div>
              <span className="productos-reporte-resumen-valor">S/ {valorTotalInventario.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
              <span className="productos-reporte-resumen-label">Valor Inventario</span>
            </div>
          </div>
          <div className="productos-reporte-resumen-item">
            <AlertTriangle className="productos-reporte-resumen-icon warning" />
            <div>
              <span className="productos-reporte-resumen-valor">{productosStockBajo}</span>
              <span className="productos-reporte-resumen-label">Stock Bajo</span>
            </div>
          </div>
          <div className="productos-reporte-resumen-item">
            <AlertTriangle className="productos-reporte-resumen-icon danger" />
            <div>
              <span className="productos-reporte-resumen-valor">{productosSinStock}</span>
              <span className="productos-reporte-resumen-label">Sin Stock</span>
            </div>
          </div>
          <div className="productos-reporte-resumen-item">
            <TrendingUp className="productos-reporte-resumen-icon" />
            <div>
              <span className="productos-reporte-resumen-valor">{rotacionPromedio.toFixed(1)}</span>
              <span className="productos-reporte-resumen-label">Rotación Promedio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="productos-reporte-tabla-section">
        <h3>Detalle de Productos ({productosFiltrados.length})</h3>
        <div className="productos-reporte-tabla-container">
          <table className="productos-reporte-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
                <th>Precio Compra</th>
                <th>Precio Venta</th>
                <th>Valor Inventario</th>
                <th>Última Compra</th>
                <th>Última Venta</th>
                <th>Ventas Mes</th>
                <th>Rotación</th>
              </tr>
            </thead>
            <tbody>
              {filtrarProductosLocalmente().map(producto => (
                <tr key={producto.id}>
                  <td>{producto.codigo}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.categoria}</td>
                  <td>{producto.marca}</td>
                  <td>{producto.stockActual}</td>
                  <td>{producto.stockMinimo}</td>
                  <td>
                    <span className={`productos-reporte-stock-status ${
                      producto.stockActual === 0 ? 'productos-reporte-stock-sin-stock' :
                      producto.stockActual <= producto.stockMinimo ? 'productos-reporte-stock-bajo' : 'productos-reporte-stock-normal'
                    }`}>
                      {producto.stockActual === 0 ? 'Sin Stock' :
                       producto.stockActual <= producto.stockMinimo ? 'Stock Bajo' : 'Normal'}
                    </span>
                  </td>
                  <td>S/ {(parseFloat(producto.precioCompra) || 0).toFixed(2)}</td>
                  <td>S/ {(parseFloat(producto.precioVenta) || 0).toFixed(2)}</td>
                  <td>S/ {(parseFloat(producto.valorInventario) || 0).toFixed(2)}</td>
                  <td>{producto.ultimaCompra ? new Date(producto.ultimaCompra).toLocaleDateString() : 'N/A'}</td>
                  <td>{producto.ultimaVenta ? new Date(producto.ultimaVenta).toLocaleDateString() : 'N/A'}</td>
                  <td>{producto.ventasMes}</td>
                  <td>{(parseFloat(producto.rotacion) || 0).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductosReporte;