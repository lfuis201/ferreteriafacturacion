import React, { useState, useEffect } from 'react';
import { obtenerProductos, eliminarProducto, buscarProductos } from '../../services/productoService';
import { obtenerCategorias } from '../../services/categoriaService';
import { Plus, Search, Trash2, Package, Edit3, Filter, X, Settings, Eye, EyeOff, FileSpreadsheet, Tag, ArrowRightLeft } from 'lucide-react';
import FormularioProducto from './FormularioProducto';
import Swal from 'sweetalert2';
import GaleriaImagenes from './GaleriaImagenes';
import ModalVerPresentaciones from './ModalVerPresentaciones';
import '../../styles/ListaProductos.css';

// Estilos CSS adicionales para badges y configuración de columnas
const additionalStyles = `
  .config-columnas-panel {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .config-header h3 {
    margin: 0;
    font-size: 16px;
    color: #495057;
  }

  .config-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .btn-toggle-all {
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: background-color 0.2s ease;
  }

  .btn-toggle-all:hover {
    background: #0056b3;
  }

  .btn-cerrar-config {
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: background-color 0.2s ease;
  }

  .btn-cerrar-config:hover {
    background: #545b62;
  }

  .columnas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }

  .columna-item {
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .columna-item:hover {
    background: #e9ecef;
  }

  .columna-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .columna-checkbox input[type="checkbox"] {
    margin: 0;
  }

  .columna-label {
    font-size: 14px;
    color: #495057;
    user-select: none;
  }

  .columna-label.obligatoria {
    color: #6c757d;
    font-weight: 500;
  }

  .obligatoria-badge {
    color: #dc3545;
    font-weight: bold;
    margin-left: 4px;
  }

  .badge {
    display: inline-block;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
    text-align: center;
    white-space: nowrap;
  }

  .badge-success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .badge-danger {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  .badge-warning {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  }

  .badge-secondary {
    background-color: #e2e3e5;
    color: #383d41;
    border: 1px solid #d6d8db;
  }

  /* Estilos para expandir la tabla y mejorar el espaciado */
  .productos-table {
    width: 100%;
    overflow-x: auto;
    min-height: 400px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .table {
    width: 100%;
    min-width: 1600px;
    border-collapse: separate;
    border-spacing: 0;
  }

  .table-header {
    display: grid;
    gap: 1px;
    background:rgb(4, 100, 243);
    color: white;
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0;
    min-height: 55px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .table-header > div {
    padding: 15px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-right: 1px solid rgba(255,255,255,0.2);
    word-wrap: break-word;
    hyphens: auto;
    line-height: 1.2;
    background:rgb(4, 100, 243);
  }

  .table-header > div:last-child {
    border-right: none;
  }

  .table-row {
    display: grid;
    gap: 1px;
    border-bottom: 1px solid #e9ecef;
    transition: all 0.2s ease;
    min-height: 70px;
    background: white;
  }

  .table-row:hover {
    background-color: #f8f9fa;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .table-cell {
    padding: 15px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-right: 1px solid #e9ecef;
    font-size: 13px;
    word-wrap: break-word;
    hyphens: auto;
    line-height: 1.4;
    background: white;
    transition: background-color 0.2s ease;
    min-width: 120px;
  }

  .table-cell:last-child {
    border-right: none;
  }

  .table-row:hover .table-cell {
    background-color: #f8f9fa;
  }

  .nombre-cell {
    justify-content: flex-start !important;
    text-align: left !important;
    font-weight: 500;
    color: #2c3e50;
    min-width: 200px;
  }

  .nombre-link {
    cursor: pointer;
    color: #007bff;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .nombre-link:hover {
    color: #0056b3;
    text-decoration: underline;
  }

  .descripcion-cell {
    justify-content: flex-start !important;
    text-align: left !important;
    max-width: 300px;
    min-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #6c757d;
  }

  .precio-cell {
    font-weight: 600;
    color: #28a745;
    font-family: 'Courier New', monospace;
    min-width: 140px;
  }

  .acciones-cell {
    position: sticky;
    right: 0;
    background: white;
    min-width: 100px;
    z-index: 5;
    border-left: 2px solid #dee2e6;
  }

  .table-row:hover .acciones-cell {
    background-color: #f8f9fa;
  }

  .table-header .acciones-header {
    position: sticky;
    right: 0;
    background: rgb(4, 100, 243);
    z-index: 15;
    border-left: 2px solid rgba(255,255,255,0.3);
  }

  /* Responsive adjustments */
  @media (max-width: 1200px) {
    .table-header > div,
    .table-cell {
      padding: 8px 6px;
      font-size: 11px;
    }
  }
`;

// Inyectar estilos adicionales
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = additionalStyles;
  document.head.appendChild(styleElement);
}

function ListaProductos({ onNuevoProducto, onEditarProducto, onImportarExcel, onExportarExcel, onExportarPresentaciones, onExportarEtiquetas, onMigrarProductos, onImportarPresentaciones, recargarProductos }) {
  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false);

  const handleNuevoProducto = () => {
    // Si el padre provee un handler, se ejecuta también
    if (typeof onNuevoProducto === 'function') {
      try { onNuevoProducto(); } catch {}
    }
    setMostrarFormularioProducto(true);
  };
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    nombre: '',
    categoriaId: '',
    codigo: '',
    estado: ''
  });
  const [busquedaAvanzada, setBusquedaAvanzada] = useState(false);
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 10,
    total: 0
  });
  const [galeriaAbierta, setGaleriaAbierta] = useState(false);
  const [modalVerPresentacionesAbierto, setModalVerPresentacionesAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarConfigColumnas, setMostrarConfigColumnas] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(null);
  
  // Estado para controlar qué columnas están visibles
  const [columnasVisibles, setColumnasVisibles] = useState({
    numero: true,
    id: true,
    codigo: true,
    unidad: true,
    nombre: true,
    descripcion: true,
    categoria: true,
    sucursal: true,
    marca: false,
    modelo: false,
    codigoSunat: false,
    codigoBarras: false,
    tipodeAfectacion: false,
    origen: false,
    codigoprovedorOEM: false,
    codigoCompetencia: false,
    rangoAnos: false,
    observaciones: false,
    precioVenta: true,
    precioCompra: true,
    productosRelacionados: false,
    codigoTipoMoneda: false,
    codigoTipoAfectacionIgvVenta: false,
    tieneIgv: false,
    codigoTipoAfectacionIgvCompra: false,
    stock: true,
    stockMinimo: true,
    iscActivo: false,
    tipoAplicacionISC: false,
    sujetoDetraccion: false,
    estado: false,
    acciones: true
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  // Efecto para recargar productos cuando se complete una importación
  useEffect(() => {
    if (recargarProductos > 0) {
      cargarProductos();
    }
  }, [recargarProductos]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.acciones-dropdown')) {
        setDropdownAbierto(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [filtros, paginacion.pagina]);

  useEffect(() => {
    // Resetear página cuando cambien los filtros
    if (paginacion.pagina !== 1) {
      setPaginacion(prev => ({ ...prev, pagina: 1 }));
    }
  }, [filtros.nombre, filtros.categoriaId, filtros.codigo, filtros.estado]);

  const cargarDatos = async () => {
    try {
      const [productosData, categoriasData] = await Promise.all([
        obtenerProductos(),
        obtenerCategorias()
      ]);
      
      // Asegurar que los datos sean arrays
      let productosArray = Array.isArray(productosData) ? productosData : 
                          (productosData?.data && Array.isArray(productosData.data)) ? productosData.data : [];
      const categoriasArray = Array.isArray(categoriasData) ? categoriasData : 
                             (categoriasData?.data && Array.isArray(categoriasData.data)) ? categoriasData.data : [];
      
      // Ordenar productos del más reciente al más antiguo
      productosArray = productosArray.sort((a, b) => {
        const fechaA = new Date(a.createdAt || a.fechaCreacion || a.created_at || 0);
        const fechaB = new Date(b.createdAt || b.fechaCreacion || b.created_at || 0);
        return fechaB - fechaA; // Orden descendente (más reciente primero)
      });
      
      // Establecer el total para la paginación
      setPaginacion(prev => ({
        ...prev,
        total: productosArray.length
      }));
      
      // Aplicar paginación inicial
      const inicio = (paginacion.pagina - 1) * paginacion.limite;
      const fin = inicio + paginacion.limite;
      const productosPaginados = productosArray.slice(inicio, fin);
      
      setProductos(productosPaginados);
      setCategorias(categoriasArray);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setProductos([]);
      setCategorias([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      let productosData;
      
      // Si hay filtros activos, usar búsqueda
      const hayFiltros = Object.values(filtros).some(valor => valor !== '');
      
      if (hayFiltros) {
        const parametrosBusqueda = {
          ...filtros,
          pagina: paginacion.pagina,
          limite: paginacion.limite
        };
        productosData = await buscarProductos(parametrosBusqueda);
      } else {
        productosData = await obtenerProductos();
      }
      
      // Asegurar que productosData sea un array
      let productosArray = Array.isArray(productosData) ? productosData : 
                          (productosData?.data && Array.isArray(productosData.data)) ? productosData.data : [];
      
      console.log('Datos de productos recibidos:', productosData);
      if (productosArray && productosArray.length > 0) {
        console.log('Primer producto:', productosArray[0]);
        console.log('¿Tiene categoría?', productosArray[0].Categorium ? 'Sí' : 'No', productosArray[0].Categorium);
        console.log('¿Tiene sucursal?', productosArray[0].Sucursal ? 'Sí' : 'No', productosArray[0].Sucursal);
      }
      
      // Ordenar productos del más reciente al más antiguo
      productosArray = productosArray.sort((a, b) => {
        const fechaA = new Date(a.createdAt || a.fechaCreacion || a.created_at || 0);
        const fechaB = new Date(b.createdAt || b.fechaCreacion || b.created_at || 0);
        return fechaB - fechaA; // Orden descendente (más reciente primero)
      });
      
      // Si no hay filtros, implementar paginación manual
      if (!hayFiltros && productosArray.length > 0) {
        const total = productosArray.length;
        const inicio = (paginacion.pagina - 1) * paginacion.limite;
        const fin = inicio + paginacion.limite;
        productosArray = productosArray.slice(inicio, fin);
        
        setPaginacion(prev => ({
          ...prev,
          total: total
        }));
      } else if (productosData?.total) {
        // Actualizar información de paginación si está disponible desde el backend
        setPaginacion(prev => ({
          ...prev,
          total: productosData.total
        }));
      }
      
      setProductos(productosArray);
      
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductos([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al cargar productos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de que quieres eliminar "${nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      try {
        await eliminarProducto(id);
        Swal.fire({
          icon: 'success',
          title: 'Producto eliminado',
          text: 'El producto ha sido eliminado correctamente'
        });
        cargarProductos();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message
        });
      }
    }
  };

  const toggleDropdown = (productoId) => {
    setDropdownAbierto(dropdownAbierto === productoId ? null : productoId);
  };

  const cerrarDropdown = () => {
    setDropdownAbierto(null);
  };

  const abrirModalVerPresentaciones = (producto) => {
    setProductoSeleccionado(producto);
    setModalVerPresentacionesAbierto(true);
    cerrarDropdown();
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      nombre: '',
      categoriaId: '',
      codigo: '',
      estado: ''
    });
    setPaginacion(prev => ({ ...prev, pagina: 1 }));
  };

  const cambiarPagina = (nuevaPagina) => {
    setPaginacion(prev => ({ ...prev, pagina: nuevaPagina }));
  };

  const toggleBusquedaAvanzada = () => {
    setBusquedaAvanzada(!busquedaAvanzada);
  };

  const aplicarFiltros = () => {
    setPaginacion(prev => ({ ...prev, pagina: 1 }));
    cargarProductos();
  };

  const totalPaginas = Math.ceil(paginacion.total / paginacion.limite);

  // Función para alternar la visibilidad de una columna
  const toggleColumna = (columna) => {
    setColumnasVisibles(prev => ({
      ...prev,
      [columna]: !prev[columna]
    }));
  };

  // Función para mostrar/ocultar todas las columnas
  const toggleTodasColumnas = (mostrar) => {
    const nuevasColumnas = { ...columnasVisibles };
    Object.keys(nuevasColumnas).forEach(key => {
      if (key !== 'numero' && key !== 'nombre' && key !== 'acciones') {
        nuevasColumnas[key] = mostrar;
      }
    });
    setColumnasVisibles(nuevasColumnas);
  };

  // Definición de todas las columnas disponibles
  const todasLasColumnas = [
    { key: 'numero', label: '#', obligatoria: true },
    { key: 'id', label: 'ID' },
    { key: 'codigo', label: 'Cód. Interno' },
    { key: 'unidad', label: 'Unidad' },
    { key: 'nombre', label: 'Nombre', obligatoria: true },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'sucursal', label: 'Sucursal' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'codigoSunat', label: 'Cód. SUNAT' },
    { key: 'codigoBarras', label: 'Cód. Barras' },
    { key: 'tipodeAfectacion', label: 'Tipo Afectación' },
    { key: 'origen', label: 'Origen' },
    { key: 'codigoprovedorOEM', label: 'Cód. Proveedor OEM' },
    { key: 'codigoCompetencia', label: 'Cód. Competencia' },
    { key: 'rangoAnos', label: 'Rango Años' },
    { key: 'observaciones', label: 'Observaciones' },
    { key: 'precioVenta', label: 'P.Unitario (Venta)' },
    { key: 'precioCompra', label: 'P.Unitario (Compra)' },
    { key: 'productosRelacionados', label: 'Productos Relacionados' },
    { key: 'codigoTipoMoneda', label: 'Código Tipo Moneda' },
    { key: 'codigoTipoAfectacionIgvVenta', label: 'Código Afectación IGV Venta' },
    { key: 'tieneIgv', label: 'Tiene IGV' },
    { key: 'codigoTipoAfectacionIgvCompra', label: 'Código Afectación IGV Compra' },
    { key: 'stock', label: 'Stock' },
    { key: 'stockMinimo', label: 'Stock Mínimo' },
    { key: 'iscActivo', label: 'ISC Activo' },
    { key: 'tipoAplicacionISC', label: 'Tipo Aplicación ISC' },
    { key: 'sujetoDetraccion', label: 'Sujeto Detracción' },
    { key: 'estado', label: 'Estado' },
    { key: 'acciones', label: 'Acciones', obligatoria: true }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="lista-productos-container">
      <div className="header-section">
        <h2>Gestión de Productos y Presentaciones</h2>
        <div className="header-actions">
          <button 
            className="btn-config-columnas" 
            onClick={() => setMostrarConfigColumnas(!mostrarConfigColumnas)}
            title="Configurar columnas"
          >
            <Settings size={20} /> Columnas
          </button>
          
          {/* Acciones en Select */}
          <select
            className="acciones-select"
            defaultValue=""
            onChange={(e) => {
              const value = e.target.value;
              switch (value) {
                case 'importar_productos':
                  if (typeof onImportarExcel === 'function') onImportarExcel();
                  break;
                case 'importar_presentaciones':
                  if (typeof onImportarPresentaciones === 'function') onImportarPresentaciones();
                  break;
                case 'exportar_productos':
                  if (typeof onExportarExcel === 'function') onExportarExcel();
                  break;
                case 'exportar_presentaciones':
                  if (typeof onExportarPresentaciones === 'function') onExportarPresentaciones();
                  break;
                case 'exportar_etiquetas':
                  if (typeof onExportarEtiquetas === 'function') onExportarEtiquetas();
                  break;
                default:
                  break;
              }
              e.target.value = '';
            }}
            title="Opciones de archivo"
          >
            <option value="" disabled>Selecciona una opción…</option>
            <option value="importar_productos">Importar: Productos en Excel</option>
            <option value="importar_presentaciones">Importar: Presentaciones en Excel</option>
            <option value="exportar_productos">Exportar: Productos en Excel</option>
            <option value="exportar_presentaciones">Exportar: Presentaciones en Excel</option>
            <option value="exportar_etiquetas">Exportar: Etiquetas de productos</option>
          </select>


           {/*no se usa por ahora */}
           {/*  <button className="btn-migracion" onClick={onMigrarProductos}>
            <ArrowRightLeft size={20} /> Migrar Productos
          </button>*/}
         



           <button className="btn-nuevo" onClick={handleNuevoProducto}>
            <Plus size={20} /> Nuevo Producto
          </button> 



        </div>
      </div>

      {mostrarFormularioProducto && (
        <FormularioProducto
          onGuardar={() => {
            setMostrarFormularioProducto(false);
            if (typeof recargarProductos === 'function') {
              try { recargarProductos(); } catch {}
            }
          }}
          onCancelar={() => setMostrarFormularioProducto(false)}
        />
      )}

      <div className="filtros-section">
        <div className="filtros-header">
          <h3>Filtros de búsqueda</h3>
          <button 
            className="btn-toggle-avanzada" 
            onClick={toggleBusquedaAvanzada}
          >
            <Filter size={16} /> {busquedaAvanzada ? 'Búsqueda Simple' : 'Búsqueda Avanzada'}
          </button>
        </div>
        
        <div className="filtros-grid">
          <div className="filtro-group">
            <label>Buscar por nombre:</label>
            <input
              type="text"
              name="nombre"
              value={filtros.nombre}
              onChange={handleFiltroChange}
              placeholder="Nombre del producto..."
            />
          </div>
          
          <div className="filtro-group">
            <label>Categoría:</label>
            <select
              name="categoriaId"
              value={filtros.categoriaId}
              onChange={handleFiltroChange}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
          
          {busquedaAvanzada && (
            <>
              <div className="filtro-group">
                <label>Código:</label>
                <input
                  type="text"
                  name="codigo"
                  value={filtros.codigo}
                  onChange={handleFiltroChange}
                  placeholder="Código del producto..."
                />
              </div>
              
              <div className="filtro-group">
                <label>Estado:</label>
                <select
                  name="estado"
                  value={filtros.estado}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
              

            </>
          )}
          
          <div className="filtro-actions">
            <button className="btn-aplicar" onClick={aplicarFiltros}>
              <Search size={16} /> Buscar
            </button>
            <button className="btn-limpiar" onClick={limpiarFiltros}>
              <X size={16} /> Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Panel de configuración de columnas */}
      {mostrarConfigColumnas && (
        <div className="config-columnas-panel">
          <div className="config-header">
            <h3>Configurar Columnas</h3>
            <div className="config-actions">
              <button 
                className="btn-toggle-all"
                onClick={() => toggleTodasColumnas(true)}
              >
                <Eye size={14} /> Mostrar Todas
              </button>
              <button 
                className="btn-toggle-all"
                onClick={() => toggleTodasColumnas(false)}
                style={{background: '#6c757d'}}
              >
                <EyeOff size={14} /> Ocultar Todas
              </button>
              <button 
                className="btn-cerrar-config"
                onClick={() => setMostrarConfigColumnas(false)}
              >
                ✕ Cerrar
              </button>
            </div>
          </div>
          
          <div className="columnas-grid">
            {todasLasColumnas.map(columna => {
              const esObligatoria = ['numero', 'acciones'].includes(columna.key);
              return (
                <div key={columna.key} className="columna-item">
                  <label className="columna-checkbox">
                    <input
                      type="checkbox"
                      checked={columnasVisibles[columna.key]}
                      onChange={() => !esObligatoria && toggleColumna(columna.key)}
                      disabled={esObligatoria}
                    />
                    <span className={`columna-label ${esObligatoria ? 'obligatoria' : ''}`}>
                      {columna.label}
                      {esObligatoria && <span className="obligatoria-badge"> *</span>}
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="productos-table-container">
        {productos.length === 0 ? (
          <div className="no-productos">
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div className="productos-table">
            <div 
               className="table-header"
               style={{
                 gridTemplateColumns: `repeat(${Object.values(columnasVisibles).filter(Boolean).length}, minmax(150px, 1fr))`
               }}
             >
              {columnasVisibles.numero && <div>N°</div>}
               {columnasVisibles.id && <div>ID</div>}
               {columnasVisibles.codigo && <div>CÓD. INTERNO</div>}
               {columnasVisibles.unidad && <div>UNIDAD</div>}
               {columnasVisibles.nombre && <div>NOMBRE</div>}
               {columnasVisibles.descripcion && <div>DESCRIPCIÓN</div>}
               {columnasVisibles.categoria && <div>CATEGORÍA</div>}
               {columnasVisibles.sucursal && <div>SUCURSAL</div>}
               {columnasVisibles.marca && <div>MARCA</div>}
               {columnasVisibles.modelo && <div>MODELO</div>}
               {columnasVisibles.codigoSunat && <div>CÓD. SUNAT</div>}
               {columnasVisibles.codigoBarras && <div>CÓD. BARRAS</div>}
               {columnasVisibles.tipodeAfectacion && <div>TIPO AFECTACIÓN</div>}
               {columnasVisibles.origen && <div>ORIGEN</div>}
               {columnasVisibles.codigoprovedorOEM && <div>CÓD. PROVEEDOR OEM</div>}
               {columnasVisibles.codigoCompetencia && <div>CÓD. COMPETENCIA</div>}
               {columnasVisibles.rangoAnos && <div>RANGO AÑOS</div>}
               {columnasVisibles.observaciones && <div>OBSERVACIONES</div>}
               {columnasVisibles.precioVenta && <div>P.UNITARIO (VENTA)</div>}
               {columnasVisibles.precioCompra && <div>P.UNITARIO (COMPRA)</div>}
               {columnasVisibles.productosRelacionados && <div>PRODUCTOS RELACIONADOS</div>}
               {columnasVisibles.codigoTipoMoneda && <div>CÓDIGO TIPO MONEDA</div>}
               {columnasVisibles.codigoTipoAfectacionIgvVenta && <div>CÓDIGO AFECTACIÓN IGV VENTA</div>}
               {columnasVisibles.tieneIgv && <div>TIENE IGV</div>}
               {columnasVisibles.codigoTipoAfectacionIgvCompra && <div>CÓDIGO AFECTACIÓN IGV COMPRA</div>}
               {columnasVisibles.stock && <div>STOCK</div>}
               {columnasVisibles.stockMinimo && <div>STOCK MÍNIMO</div>}
               {columnasVisibles.iscActivo && <div>ISC ACTIVO</div>}
               {columnasVisibles.tipoAplicacionISC && <div>TIPO APLICACIÓN ISC</div>}
               {columnasVisibles.sujetoDetraccion && <div>SUJETO DETRACCIÓN</div>}
               {columnasVisibles.estado && <div>ESTADO</div>}
               {columnasVisibles.acciones && <div className="acciones-header">ACCIONES</div>}
            </div>
            
            {productos.map((producto, index) => (
              <div 
                 key={producto.id} 
                 className="table-row"
                 style={{
                   gridTemplateColumns: `repeat(${Object.values(columnasVisibles).filter(Boolean).length}, minmax(150px, 1fr))`
                 }}
               >
                {columnasVisibles.numero && <div className="table-cell">{index + 1}</div>}
                {columnasVisibles.id && <div className="table-cell">{producto.id}</div>}
                {columnasVisibles.codigo && <div className="table-cell">{producto.codigo || '-'}</div>}
                {columnasVisibles.unidad && <div className="table-cell">{producto.unidadMedida || 'NIU'}</div>}
                {columnasVisibles.nombre && (
                  <div className="table-cell nombre-cell" 
                       onClick={() => {
                         setProductoSeleccionado(producto);
                         setGaleriaAbierta(true);
                       }}>
                    <span className="nombre-link">{producto.nombre}</span>
                  </div>
                )}
                {columnasVisibles.descripcion && <div className="table-cell descripcion-cell">{producto.descripcion || '-'}</div>}
                {columnasVisibles.categoria && <div className="table-cell">{producto.Categorium?.nombre || producto.categoria?.nombre || producto.categoriaNombre || '-'}</div>}
                {columnasVisibles.sucursal && <div className="table-cell">{producto.Sucursal?.nombre || producto.sucursal?.nombre || producto.sucursalNombre || '-'}</div>}
                {columnasVisibles.marca && <div className="table-cell">{producto.marca || '-'}</div>}
                {columnasVisibles.modelo && <div className="table-cell">{producto.modelo || '-'}</div>}
                {columnasVisibles.codigoSunat && <div className="table-cell">{producto.codigosunat || '-'}</div>}
                {columnasVisibles.codigoBarras && <div className="table-cell">{producto.codigoBarras || '-'}</div>}
                {columnasVisibles.tipodeAfectacion && <div className="table-cell">{producto.tipodeAfectacion || '-'}</div>}
                {columnasVisibles.origen && <div className="table-cell">{producto.origen || '-'}</div>}
                {columnasVisibles.codigoprovedorOEM && <div className="table-cell">{producto.codigoprovedorOEM || '-'}</div>}
                {columnasVisibles.codigoCompetencia && <div className="table-cell">{producto.codigoCompetencia || '-'}</div>}
                {columnasVisibles.rangoAnos && (
                  <div className="table-cell">
                    {producto.rangoAnos || '-'}
                  </div>
                )}
                {columnasVisibles.observaciones && <div className="table-cell">{producto.observaciones || '-'}</div>}
                {columnasVisibles.precioVenta && <div className="table-cell precio-cell">S/ {parseFloat(producto.precioVenta || 0).toFixed(2)}</div>}
                {columnasVisibles.precioCompra && <div className="table-cell precio-cell">S/ {parseFloat(producto.precioCompra || 0).toFixed(2)}</div>}
                {columnasVisibles.productosRelacionados && <div className="table-cell">{producto.productos_relacionados || '-'}</div>}
                {columnasVisibles.codigoTipoMoneda && <div className="table-cell">{producto.codigo_tipo_moneda || '-'}</div>}
                {columnasVisibles.codigoTipoAfectacionIgvVenta && <div className="table-cell">{producto.codigo_tipo_afectacion_igv_venta || '-'}</div>}
                {columnasVisibles.tieneIgv && (
                  <div className="table-cell">
                    <span className={`badge ${producto.tiene_igv ? 'badge-success' : 'badge-secondary'}`}>
                      {producto.tiene_igv ? 'Sí' : 'No'}
                    </span>
                  </div>
                )}
                {columnasVisibles.codigoTipoAfectacionIgvCompra && <div className="table-cell">{producto.codigo_tipo_afectacion_igv_compra || '-'}</div>}
                {columnasVisibles.stock && <div className="table-cell">{producto.stock || 0}</div>}
                {columnasVisibles.stockMinimo && <div className="table-cell">{producto.stockMinimo || 0}</div>}
                {columnasVisibles.iscActivo && (
                  <div className="table-cell">
                    <span className={`badge ${producto.iscActivo ? 'badge-success' : 'badge-secondary'}`}>
                      {producto.iscActivo ? 'Sí' : 'No'}
                    </span>
                  </div>
                )}
                {columnasVisibles.tipoAplicacionISC && <div className="table-cell">{producto.tipoAplicacionISC || '-'}</div>}
                {columnasVisibles.sujetoDetraccion && (
                  <div className="table-cell">
                    <span className={`badge ${producto.sujetoDetraccion ? 'badge-warning' : 'badge-secondary'}`}>
                      {producto.sujetoDetraccion ? 'Sí' : 'No'}
                    </span>
                  </div>
                )}
                {columnasVisibles.estado && (
                  <div className="table-cell">
                    <span className={`badge ${producto.estado ? 'badge-success' : 'badge-danger'}`}>
                      {producto.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                )}
                {columnasVisibles.acciones && (
                  <div className="table-cell acciones-cell">
                    <div className="acciones-dropdown">
                      <button 
                        className="btn-acciones"
                        onClick={() => toggleDropdown(producto.id)}
                      >
                        ⋮
                      </button>
                      {dropdownAbierto === producto.id && (
                        <div className="dropdown-menu show">
                          <button 
                            className="dropdown-item"
                            onClick={() => {
                              onEditarProducto(producto);
                              cerrarDropdown();
                            }}
                          >
                            <Edit3 size={14} /> Editar
                          </button>
                          <button 
                            className="dropdown-item"
                            onClick={() => abrirModalVerPresentaciones(producto)}
                          >
                            <Package size={14} /> Ver Presentaciones
                          </button>
                          <button 
                            className="dropdown-item eliminar"
                            onClick={() => {
                              handleEliminar(producto.id, producto.nombre);
                              cerrarDropdown();
                            }}
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="productos-stats">
        <p>Total de productos: {productos.length}</p>
        {paginacion.total > 0 && (
          <p>Mostrando página {paginacion.pagina} de {totalPaginas}</p>
        )}
      </div>
      
      {totalPaginas > 1 && (
        <div className="paginacion">
          <button 
            className="btn-paginacion" 
            onClick={() => cambiarPagina(paginacion.pagina - 1)}
            disabled={paginacion.pagina === 1}
          >
            ← Anterior
          </button>
          
          <div className="numeros-pagina">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numeroPagina => (
              <button
                key={numeroPagina}
                className={`btn-numero-pagina ${
                  numeroPagina === paginacion.pagina ? 'activa' : ''
                }`}
                onClick={() => cambiarPagina(numeroPagina)}
              >
                {numeroPagina}
              </button>
            ))}
          </div>
          
          <button 
            className="btn-paginacion" 
            onClick={() => cambiarPagina(paginacion.pagina + 1)}
            disabled={paginacion.pagina === totalPaginas}
          >
            Siguiente →
          </button>
        </div>
      )}
      
      {galeriaAbierta && productoSeleccionado && (
        <GaleriaImagenes
          producto={productoSeleccionado}
          onCerrar={() => {
            setGaleriaAbierta(false);
            setProductoSeleccionado(null);
          }}
        />
      )}
      
      {modalVerPresentacionesAbierto && productoSeleccionado && (
        <ModalVerPresentaciones
          producto={productoSeleccionado}
          onCerrar={() => {
            setModalVerPresentacionesAbierto(false);
            setProductoSeleccionado(null);
          }}
        />
      )}
    </div>
  );
}

export default ListaProductos;