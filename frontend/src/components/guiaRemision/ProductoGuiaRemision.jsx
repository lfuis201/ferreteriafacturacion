import React, { useState, useEffect } from "react";
import { productoService } from "../../services/productoService";
import { obtenerPresentaciones } from "../../services/presentacionService";
import { obtenerCategorias } from "../../services/categoriaService";
import "../../styles/FormularioVentaProducto.css";

function ProductoGuiaRemision({ onProductoSeleccionado, productosSeleccionados = [] }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [presentaciones, setPresentaciones] = useState([]);
  const [loadingPresentaciones, setLoadingPresentaciones] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState(null);
  const [peso, setPeso] = useState(0);
  const [descripcion, setDescripcion] = useState("");

  const [filtros, setFiltros] = useState({
    busqueda: "",
    categoria: "",
    marca: "",
  });

  const [inventario, setInventario] = useState({
    totalProductos: 0,
    productosActivos: 0,
    productosInactivos: 0,
  });

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await productoService.obtenerProductos();
      console.log('Respuesta de productos:', response);
      
      const productosData = response.productos || response.data || [];
      setProductos(productosData);
      
      // Calcular estadísticas del inventario
      const productosActivos = productosData.filter(p => p.iscActivo) || [];
      
      setInventario(prev => ({
        ...prev,
        totalProductos: productosData.length || 0,
        productosActivos: productosActivos.length,
        productosInactivos: productosData.length - productosActivos.length
      }));
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const categoriasData = await obtenerCategorias();
      setCategorias(Array.isArray(categoriasData) ? categoriasData : categoriasData.data || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategorias([]);
    }
  };

  const cargarPresentaciones = async (productoId) => {
    try {
      setLoadingPresentaciones(true);
      const presentacionesData = await obtenerPresentaciones(productoId);
      console.log('Presentaciones cargadas:', presentacionesData);
      
      if (presentacionesData && Array.isArray(presentacionesData) && presentacionesData.length > 0) {
        setPresentaciones(presentacionesData);
        // Seleccionar la presentación por defecto si existe
        const presentacionDefecto = presentacionesData.find(p => p.precioDefecto === 'Precio por defecto');
        if (presentacionDefecto) {
          setPresentacionSeleccionada(presentacionDefecto);
        } else {
          setPresentacionSeleccionada(presentacionesData[0]);
        }
      } else {
        // Si no hay presentaciones, crear una por defecto
        const presentacionDefecto = {
          id: 'default',
          descripcion: 'Unidad',
          unidad: 'Unidad',
          factor: 1
        };
        setPresentaciones([presentacionDefecto]);
        setPresentacionSeleccionada(presentacionDefecto);
      }
    } catch (error) {
      console.error('Error al cargar presentaciones:', error);
      setPresentaciones([]);
      setPresentacionSeleccionada(null);
    } finally {
      setLoadingPresentaciones(false);
    }
  };

  const seleccionarProducto = async (producto) => {
    console.log('Producto seleccionado:', producto);
    setProductoSeleccionado(producto);
    setCantidad(1);
    setPeso(producto.peso || 0);
    setDescripcion(producto.descripcion || "");
    
    // Cargar presentaciones del producto
    if (producto.id) {
      await cargarPresentaciones(producto.id);
    }
  };

  const agregarProductoAGuia = () => {
    if (!productoSeleccionado || !presentacionSeleccionada || cantidad <= 0) {
      alert('Por favor selecciona un producto, presentación y cantidad válida');
      return;
    }

    const productoParaGuia = {
      id: Date.now(), // ID temporal para la lista
      productoId: productoSeleccionado.id,
      presentacionId: presentacionSeleccionada.id,
      nombre: productoSeleccionado.nombre,
      codigo: productoSeleccionado.codigo,
      presentacion: presentacionSeleccionada.descripcion || presentacionSeleccionada.unidad,
      cantidad: parseFloat(cantidad),
      peso: parseFloat(peso) * parseFloat(cantidad),
      descripcion: descripcion || productoSeleccionado.nombre,
      unidadMedida: productoSeleccionado.unidadMedida || 'NIU'
    };

    onProductoSeleccionado(productoParaGuia);
    
    // Limpiar selección
    setProductoSeleccionado(null);
    setPresentacionSeleccionada(null);
    setCantidad(1);
    setPeso(0);
    setDescripcion("");
    setPresentaciones([]);
  };

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const cumpleBusqueda = !filtros.busqueda || 
      producto.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      producto.codigo?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      producto.marca?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const cumpleCategoria = !filtros.categoria || producto.categoriaId?.toString() === filtros.categoria;
    const cumpleMarca = !filtros.marca || producto.marca?.toLowerCase().includes(filtros.marca.toLowerCase());
    
    return cumpleBusqueda && cumpleCategoria && cumpleMarca;
  });

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      height: '600px',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px'
    }}>
      {/* Panel izquierdo - Lista de productos */}
      <div style={{
        flex: '1',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>📦 Seleccionar Productos</h3>
        
        {/* Filtros */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px',
          marginBottom: '15px'
        }}>
          <input
            type="text"
            name="busqueda"
            placeholder="Buscar producto..."
            value={filtros.busqueda}
            onChange={handleFiltroChange}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          />
          <select
            name="categoria"
            value={filtros.categoria}
            onChange={handleFiltroChange}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="marca"
            placeholder="Filtrar por marca..."
            value={filtros.marca}
            onChange={handleFiltroChange}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          />
        </div>

        {/* Lista de productos */}
        <div style={{
          flex: '1',
          overflow: 'auto',
          border: '1px solid #eee',
          borderRadius: '4px'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              color: '#666'
            }}>
              Cargando productos...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              color: '#666'
            }}>
              No se encontraron productos
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '10px',
              padding: '10px'
            }}>
              {productosFiltrados.map((producto, index) => (
                <div
                  key={producto.id || index}
                  onClick={() => seleccionarProducto(producto)}
                  style={{
                    border: productoSeleccionado?.id === producto.id ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '10px',
                    backgroundColor: productoSeleccionado?.id === producto.id ? '#f0f8ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '11px'
                  }}
                >
                  {/* Imagen del producto */}
                  <div style={{
                    width: '100%',
                    height: '80px',
                    marginBottom: '8px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {producto.imagen ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      display: producto.imagen ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      color: '#6c757d',
                      fontSize: '10px',
                      textAlign: 'center'
                    }}>
                      Sin imagen
                    </div>
                  </div>
                  
                  {/* Información del producto */}
                  <div style={{
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {producto.nombre}
                  </div>
                  <div style={{
                    color: '#666',
                    marginBottom: '3px',
                    fontSize: '10px'
                  }}>
                    Código: {producto.codigo}
                  </div>
                  <div style={{
                    color: '#666',
                    marginBottom: '8px',
                    fontSize: '10px'
                  }}>
                    Stock: {producto.stock || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panel derecho - Detalles del producto seleccionado */}
      <div style={{
        width: '350px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'auto'
      }}>
        {!productoSeleccionado ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#666',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📦</div>
            <div style={{ fontSize: '14px' }}>Selecciona un producto para agregar a la guía</div>
          </div>
        ) : (
          <div>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>📋 Detalles del Producto</h3>
            
            {/* Información del producto */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>
                {productoSeleccionado.nombre}
              </div>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '3px' }}>
                Código: {productoSeleccionado.codigo}
              </div>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '3px' }}>
                Stock disponible: {productoSeleccionado.stock || 0}
              </div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                Unidad: {productoSeleccionado.unidadMedida || 'NIU'}
              </div>
            </div>

            {/* Presentaciones */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                Presentación
              </label>
              {loadingPresentaciones ? (
                <div style={{ color: '#666', fontSize: '12px' }}>Cargando presentaciones...</div>
              ) : presentaciones.length === 0 ? (
                <div style={{ color: '#666', fontSize: '12px' }}>Sin presentaciones configuradas</div>
              ) : (
                <select
                  value={presentacionSeleccionada?.id || ''}
                  onChange={(e) => {
                    const presentacion = presentaciones.find(p => p.id.toString() === e.target.value);
                    setPresentacionSeleccionada(presentacion);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  <option value="">Seleccionar presentación</option>
                  {presentaciones.map(presentacion => (
                    <option key={presentacion.id} value={presentacion.id}>
                      {presentacion.descripcion || presentacion.unidad} (Factor: {presentacion.factor})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Cantidad */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                Cantidad
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Peso unitario */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                Peso unitario (kg)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                Descripción de motivo de traslado
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción de motivo de traslado..."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  minHeight: '60px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Resumen */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Resumen:</div>
              <div>Cantidad: {cantidad} {presentacionSeleccionada?.unidad || 'unidades'}</div>
              <div>Peso total: {(parseFloat(peso) * parseFloat(cantidad) || 0).toFixed(2)} kg</div>
            </div>

            {/* Botón agregar */}
            <button
              onClick={agregarProductoAGuia}
              disabled={!productoSeleccionado || !presentacionSeleccionada || cantidad <= 0}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: (!productoSeleccionado || !presentacionSeleccionada || cantidad <= 0) ? 0.6 : 1
              }}
            >
              ➕ Agregar a Guía
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductoGuiaRemision;