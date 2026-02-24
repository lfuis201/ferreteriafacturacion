import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Package, BarChart3, TrendingUp, Eye } from 'lucide-react';
import { obtenerProductosConInventario } from '../../services/productoService';
import { obtenerMovimientosInventario } from '../../services/inventarioService';
import '../../styles/ProductoBusquedaIndividual.css'; // Importar el CSS

const ProductoBusquedaIndividual = ({ onBack }) => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await obtenerProductosConInventario();
      const productosData = response.productos || response.data || [];
      
      // Transformar los datos para que coincidan con la estructura esperada
      const productosTransformados = productosData.map(producto => ({
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.Categoria?.nombre || 'Sin categoría',
        marca: producto.marca || 'Sin marca',
        stockActual: producto.Inventarios?.[0]?.cantidad || 0,
        stockMinimo: producto.stockMinimo || 0,
        precioCompra: parseFloat(producto.precioCompra) || 0,
        precioVenta: parseFloat(producto.precioVenta) || 0,
        proveedor: producto.Proveedor?.nombre || 'Sin proveedor'
      }));
      
      setProductos(productosTransformados);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      // En caso de error, mantener un array vacío
      setProductos([]);
    }
  };

  const cargarMovimientosProducto = async (productoId) => {
    try {
      setLoading(true);
      
      // Obtener movimientos de los últimos 30 días
      const fechaFin = new Date();
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaFin.getDate() - 30);
      
      const filtros = {
        productoId: productoId,
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0]
      };
      
      const response = await obtenerMovimientosInventario(filtros);
      const movimientosData = response.movimientos || response.data || [];
      
      // Transformar los datos para que coincidan con la estructura esperada
      const movimientosTransformados = movimientosData.map((movimiento, index) => {
        // Calcular stock anterior y nuevo basado en el tipo de movimiento
        const stockAnterior = movimiento.stockAnterior || 0;
        let stockNuevo = stockAnterior;
        
        if (movimiento.tipoMovimiento === 'ENTRADA') {
          stockNuevo = stockAnterior + movimiento.cantidad;
        } else if (movimiento.tipoMovimiento === 'SALIDA') {
          stockNuevo = stockAnterior - movimiento.cantidad;
        } else if (movimiento.tipoMovimiento === 'AJUSTE') {
          stockNuevo = stockAnterior + movimiento.cantidad;
        }
        
        return {
          id: movimiento.id || index + 1,
          fecha: movimiento.fechaRegistro || movimiento.createdAt,
          tipo: movimiento.tipoMovimiento === 'ENTRADA' ? 'Entrada' : 
                movimiento.tipoMovimiento === 'SALIDA' ? 'Salida' : 
                movimiento.tipoMovimiento === 'AJUSTE' ? 'Ajuste' : 'Otro',
          cantidad: movimiento.cantidad,
          motivo: movimiento.motivo || movimiento.tipoMovimiento,
          documento: movimiento.documentoRelacionadoId || movimiento.numeroDocumento || '-',
          stockAnterior: stockAnterior,
          stockNuevo: stockNuevo
        };
      });
      
      setMovimientos(movimientosTransformados);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      // En caso de error, mantener un array vacío
      setMovimientos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    cargarMovimientosProducto(producto.id);
  };

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    producto.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    producto.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const calcularRotacion = () => {
    if (!productoSeleccionado || movimientos.length === 0) return 0;
    const salidas = movimientos.filter(m => m.tipo === 'Salida').reduce((sum, m) => sum + m.cantidad, 0);
    return salidas / 30; // Rotación diaria aproximada
  };

  return (
    <div className="prod-busq-ind-container">
      {/* Header */}
      <div className="prod-busq-ind-header">
        <button onClick={onBack} className="prod-busq-ind-back-button">
          <ArrowLeft size={20} />
        </button>
        <span className="prod-busq-ind-home-icon">🏠</span>
        <span className="prod-busq-ind-breadcrumb">REPORTES</span>
        <span className="prod-busq-ind-separator">/</span>
        <span className="prod-busq-ind-breadcrumb">COMPRAS</span>
        <span className="prod-busq-ind-separator">/</span>
        <span className="prod-busq-ind-breadcrumb prod-busq-ind-active">PRODUCTO - BÚSQUEDA INDIVIDUAL</span>
      </div>

      {/* Búsqueda de Productos */}
      <div className="prod-busq-ind-section">
        <h3>Buscar Producto</h3>
        <div className="prod-busq-ind-input">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, código o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="prod-busq-ind-contenido">
        {/* Lista de Productos */}
        <div className="prod-busq-ind-lista">
          <h4>Productos Encontrados ({productosFiltrados.length})</h4>
          <div className="prod-busq-ind-grid">
            {productosFiltrados.map(producto => (
              <div 
                key={producto.id} 
                className={`prod-busq-ind-card ${productoSeleccionado?.id === producto.id ? 'prod-busq-ind-selected' : ''}`}
                onClick={() => handleSeleccionarProducto(producto)}
              >
                <div className="prod-busq-ind-card-header">
                  <h5>{producto.nombre}</h5>
                  <span className="prod-busq-ind-codigo">{producto.codigo}</span>
                </div>
                <div className="prod-busq-ind-card-info">
                  <p><strong>Categoría:</strong> {producto.categoria}</p>
                  <p><strong>Marca:</strong> {producto.marca}</p>
                  <p><strong>Stock:</strong> {producto.stockActual} unidades</p>
                  <p><strong>Precio Venta:</strong> S/ {(parseFloat(producto.precioVenta) || 0).toFixed(2)}</p>
                </div>
                <button className="prod-busq-ind-btn-detalle">
                  <Eye size={16} /> Ver Detalle
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Detalle del Producto Seleccionado */}
        {productoSeleccionado && (
          <div className="prod-busq-ind-detalle">
            <h4>Detalle del Producto</h4>
            
            {/* Información General */}
            <div className="prod-busq-ind-general">
              <div className="prod-busq-ind-info-card">
                <h5>Información General</h5>
                <div className="prod-busq-ind-info-grid">
                  <div><strong>Código:</strong> {productoSeleccionado.codigo}</div>
                  <div><strong>Nombre:</strong> {productoSeleccionado.nombre}</div>
                  <div><strong>Categoría:</strong> {productoSeleccionado.categoria}</div>
                  <div><strong>Marca:</strong> {productoSeleccionado.marca}</div>
                  <div><strong>Proveedor:</strong> {productoSeleccionado.proveedor}</div>
                </div>
              </div>

              <div className="prod-busq-ind-info-card">
                <h5>Stock e Inventario</h5>
                <div className="prod-busq-ind-info-grid">
                  <div><strong>Stock Actual:</strong> {productoSeleccionado.stockActual} unidades</div>
                  <div><strong>Stock Mínimo:</strong> {productoSeleccionado.stockMinimo} unidades</div>
                  <div><strong>Estado:</strong> 
                    <span className={`prod-busq-ind-stock-status ${productoSeleccionado.stockActual <= productoSeleccionado.stockMinimo ? 'prod-busq-ind-stock-bajo' : 'prod-busq-ind-stock-normal'}`}>
                      {productoSeleccionado.stockActual <= productoSeleccionado.stockMinimo ? 'Stock Bajo' : 'Normal'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="prod-busq-ind-info-card">
                <h5>Precios y Rentabilidad</h5>
                <div className="prod-busq-ind-info-grid">
                  <div><strong>Precio Compra:</strong> S/ {(parseFloat(productoSeleccionado.precioCompra) || 0).toFixed(2)}</div>
                <div><strong>Precio Venta:</strong> S/ {(parseFloat(productoSeleccionado.precioVenta) || 0).toFixed(2)}</div>
                  <div><strong>Margen:</strong> {(() => {
                    const precioVenta = parseFloat(productoSeleccionado.precioVenta) || 0;
                    const precioCompra = parseFloat(productoSeleccionado.precioCompra) || 0;
                    if (precioCompra === 0) return '0.0';
                    return (((precioVenta - precioCompra) / precioCompra) * 100).toFixed(1);
                  })()}%</div>
                  <div><strong>Rotación Diaria:</strong> {calcularRotacion().toFixed(2)} unidades</div>
                </div>
              </div>
            </div>

            {/* Movimientos del Producto */}
            <div className="prod-busq-ind-movimientos-section">
              <h5>Últimos Movimientos</h5>
              {loading ? (
                <div className="prod-busq-ind-loading-spinner">Cargando movimientos...</div>
              ) : (
                <div className="prod-busq-ind-tabla-container">
                  <table className="prod-busq-ind-reportes-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Motivo</th>
                        <th>Documento</th>
                        <th>Stock Anterior</th>
                        <th>Stock Nuevo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientos.map(movimiento => (
                        <tr key={movimiento.id}>
                          <td>{new Date(movimiento.fecha).toLocaleDateString()}</td>
                          <td>
                            <span className={`prod-busq-ind-tipo-badge prod-busq-ind-tipo-${movimiento.tipo.toLowerCase()}`}>
                              {movimiento.tipo}
                            </span>
                          </td>
                          <td>{movimiento.cantidad}</td>
                          <td>{movimiento.motivo}</td>
                          <td>{movimiento.documento}</td>
                          <td>{movimiento.stockAnterior}</td>
                          <td>{movimiento.stockNuevo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductoBusquedaIndividual;