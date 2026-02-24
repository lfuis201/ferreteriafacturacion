import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, BarChart3, Search } from 'lucide-react';
import { obtenerConsolidadoItemsVentas } from '../../services/ventaService';
  import '../../styles/VentasPorProducto.css';

const VentasPorProducto = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    producto: '',
    categoria: '',
    ordenarPor: 'cantidad'
  });

  const [ventasProductos, setVentasProductos] = useState([]);

  useEffect(() => {
    cargarVentasPorProducto();
  }, []);

  const cargarVentasPorProducto = async () => {
    setLoading(true);
    try {
      const resp = await obtenerConsolidadoItemsVentas({
        fechaInicio: filtros.fechaDesde || undefined,
        fechaFin: filtros.fechaHasta || undefined,
        // Nota: el servicio soporta sucursalId y productoId; mantenemos búsqueda por texto client-side
      });

      const items = resp.items || resp.data?.items || [];

      // Mapear respuesta del backend a la estructura usada por la tabla
      let productos = items.map((it) => {
        const cantidad = Number(it.cantidadVendida || 0);
        const montoTotal = Number(it.montoTotal || it.total || 0);
        const costoTotal = Number(it.costoTotal || 0);
        const precioPromedio = cantidad > 0 ? (montoTotal / cantidad) : 0;
        const margenPct = montoTotal > 0 ? (((montoTotal - costoTotal) / montoTotal) * 100) : 0;

        return {
          id: it.productoId || it.id || Math.random().toString(36).slice(2),
          codigo: it.productoCodigo || it.codigo || '-',
          nombre: it.productoNombre || it.nombre || '-',
          categoria: it.productoCategoria || it.categoria || '',
          cantidadVendida: cantidad,
          precioPromedio,
          totalVentas: montoTotal,
          stock: Number(it.stockActual ?? it.stock ?? 0),
          margen: Number.isFinite(margenPct) ? margenPct : 0
        };
      });

      // Filtros client-side por texto de producto y categoría (si disponible)
      if (filtros.producto) {
        const q = filtros.producto.toLowerCase();
        productos = productos.filter(p =>
          String(p.nombre || '').toLowerCase().includes(q) ||
          String(p.codigo || '').toLowerCase().includes(q)
        );
      }
      if (filtros.categoria) {
        const cat = filtros.categoria.toLowerCase();
        productos = productos.filter(p => String(p.categoria || '').toLowerCase() === cat);
      }

      setVentasProductos(productos);
      // Mantener el criterio de orden seleccionado
      ordenarDatos(filtros.ordenarPor);
    } catch (error) {
      console.error('Error al cargar ventas por producto:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarVentasPorProducto();
  };

  const exportarReporte = () => {
    console.log('Exportando reporte de ventas por producto...');
  };

  const ordenarDatos = (criterio) => {
    const datosOrdenados = [...ventasProductos].sort((a, b) => {
      switch (criterio) {
        case 'cantidad':
          return b.cantidadVendida - a.cantidadVendida;
        case 'total':
          return b.totalVentas - a.totalVentas;
        case 'margen':
          return b.margen - a.margen;
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        default:
          return 0;
      }
    });
    setVentasProductos(datosOrdenados);
  };

  if (loading) {
    return (
      <div className="ventas-producto-loading">
        <div className="ventas-producto-loading-spinner"></div>
        <p>Cargando reporte de ventas por producto...</p>
      </div>
    );
  }

  return (
    <div className="ventas-producto-container">
      {/* Header */}
      <div className="ventas-producto-header">
        <button onClick={onBack} className="ventas-producto-btn-back">
          <ArrowLeft size={20} />
          Volver
        </button>
        <h2>Reporte de Ventas por Producto</h2>
      </div>

      {/* Filtros */}
      <div className="ventas-producto-filtros">
        <div className="ventas-producto-filtros-grid">
          <div className="ventas-producto-filtro-grupo">
            <label>Fecha Desde:</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
            />
          </div>
          <div className="ventas-producto-filtro-grupo">
            <label>Fecha Hasta:</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
            />
          </div>
          <div className="ventas-producto-filtro-grupo">
            <label>Producto:</label>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={filtros.producto}
              onChange={(e) => setFiltros({...filtros, producto: e.target.value})}
            />
          </div>
          <div className="ventas-producto-filtro-grupo">
            <label>Categoría:</label>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
            >
              <option value="">Todas las categorías</option>
              <option value="herramientas">Herramientas</option>
              <option value="ferreteria">Ferretería</option>
              <option value="electricidad">Electricidad</option>
            </select>
          </div>
          <div className="ventas-producto-filtro-grupo">
            <label>Ordenar por:</label>
            <select
              value={filtros.ordenarPor}
              onChange={(e) => {
                setFiltros({...filtros, ordenarPor: e.target.value});
                ordenarDatos(e.target.value);
              }}
            >
              <option value="cantidad">Cantidad Vendida</option>
              <option value="total">Total Ventas</option>
              <option value="margen">Margen</option>
              <option value="nombre">Nombre Producto</option>
            </select>
          </div>
        </div>
        <div className="ventas-producto-filtros-acciones">
          <button onClick={aplicarFiltros} className="ventas-producto-btn-filtrar">
            <Search size={16} />
            Buscar
          </button>
          <button onClick={exportarReporte} className="ventas-producto-btn-exportar">
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="ventas-producto-resumen">
        <div className="ventas-producto-resumen-card">
          <Package className="ventas-producto-resumen-icon" />
          <div className="ventas-producto-resumen-info">
            <h3>{ventasProductos.length}</h3>
            <p>Productos Vendidos</p>
          </div>
        </div>
        <div className="ventas-producto-resumen-card">
          <BarChart3 className="ventas-producto-resumen-icon" />
          <div className="ventas-producto-resumen-info">
            <h3>{ventasProductos.reduce((sum, producto) => sum + producto.cantidadVendida, 0)}</h3>
            <p>Unidades Vendidas</p>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="ventas-producto-tabla">
        <h3>Ventas por Producto ({ventasProductos.length} productos)</h3>
        <div className="ventas-producto-tabla-container">
          <table className="ventas-producto-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Cantidad Vendida</th>
                <th>Precio Promedio</th>
                <th>Total Ventas</th>
                <th>Stock Actual</th>
                <th>Margen %</th>
              </tr>
            </thead>
            <tbody>
              {ventasProductos.map((producto) => (
                <tr key={producto.id}>
                  <td className="ventas-producto-codigo">{producto.codigo}</td>
                  <td className="ventas-producto-nombre">{producto.nombre}</td>
                  <td className="ventas-producto-categoria">{producto.categoria}</td>
                  <td className="ventas-producto-cantidad">{producto.cantidadVendida}</td>
                  <td className="ventas-producto-precio">S/ {producto.precioPromedio.toFixed(2)}</td>
                  <td className="ventas-producto-total">S/ {producto.totalVentas.toFixed(2)}</td>
                  <td className="ventas-producto-stock">{producto.stock}</td>
                  <td className="ventas-producto-margen">{producto.margen.toFixed(1)}%</td>
                </tr>
              ))}
              {ventasProductos.length === 0 && (
                <tr>
                  <td colSpan="8" className="ventas-producto-sin-datos">
                    No hay productos para los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VentasPorProducto;