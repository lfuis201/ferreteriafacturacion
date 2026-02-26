import React, { useState, useEffect } from 'react';
import { obtenerProductos, eliminarProducto, buscarProductos } from '../../services/productoService';
import { obtenerCategorias } from '../../services/categoriaService';
import { Plus, Search, Trash2, Package, Edit3, Filter, X, Settings, Eye, EyeOff } from 'lucide-react';
import FormularioProducto from './FormularioProducto';
import Swal from 'sweetalert2';
import GaleriaImagenes from './GaleriaImagenes';
import ModalVerPresentaciones from './ModalVerPresentaciones';

const inputBase = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-menta-turquesa focus:outline-none focus:ring-2 focus:ring-menta-turquesa';

function ListaProductos({ onNuevoProducto, onEditarProducto, onImportarExcel, onExportarExcel, onExportarPresentaciones, onExportarEtiquetas, onImportarPresentaciones, recargarProductos }) {
  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false);

  const handleNuevoProducto = () => {
    if (typeof onNuevoProducto === 'function') {
      try { onNuevoProducto(); } catch (_) { void _; }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efecto para recargar productos cuando se complete una importación
  useEffect(() => {
    if (recargarProductos > 0) {
      cargarProductos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, paginacion.pagina]);

  useEffect(() => {
    if (paginacion.pagina !== 1) {
      setPaginacion(prev => ({ ...prev, pagina: 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-menta-petroleo border-t-transparent" />
        <p className="text-sm font-medium text-menta-petroleo">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex w-full flex-nowrap items-center gap-2">
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-menta-petroleo shadow-sm transition hover:bg-menta-claro"
          onClick={() => setMostrarConfigColumnas(!mostrarConfigColumnas)}
          title="Configurar columnas"
        >
          <Settings size={18} /> Columnas
        </button>

        <select
          className={`${inputBase} w-auto min-w-[200px] shrink-0`}
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

        <button
          type="button"
          className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-xl bg-menta-petroleo px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-menta-marino"
          onClick={handleNuevoProducto}
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {mostrarFormularioProducto && (
        <FormularioProducto
          onGuardar={() => {
            setMostrarFormularioProducto(false);
            if (typeof recargarProductos === 'function') {
              try { recargarProductos(); } catch (_) { void _; }
            }
          }}
          onCancelar={() => setMostrarFormularioProducto(false)}
        />
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-fondo">Filtros de búsqueda</h3>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-menta-petroleo transition hover:bg-slate-50"
            onClick={toggleBusquedaAvanzada}
          >
            <Filter size={16} /> {busquedaAvanzada ? 'Búsqueda Simple' : 'Búsqueda Avanzada'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-menta-petroleo">Buscar por nombre</label>
            <input
              type="text"
              name="nombre"
              value={filtros.nombre}
              onChange={handleFiltroChange}
              placeholder="Nombre del producto..."
              className={inputBase}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-menta-petroleo">Categoría</label>
            <select name="categoriaId" value={filtros.categoriaId} onChange={handleFiltroChange} className={inputBase}>
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
              ))}
            </select>
          </div>

          {busquedaAvanzada && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-menta-petroleo">Código</label>
                <input
                  type="text"
                  name="codigo"
                  value={filtros.codigo}
                  onChange={handleFiltroChange}
                  placeholder="Código del producto..."
                  className={inputBase}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-menta-petroleo">Estado</label>
                <select name="estado" value={filtros.estado} onChange={handleFiltroChange} className={inputBase}>
                  <option value="">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </>
          )}

          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-menta-petroleo px-4 py-2 text-sm font-medium text-white transition hover:bg-menta-marino"
              onClick={aplicarFiltros}
            >
              <Search size={16} /> Buscar
            </button>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-menta-petroleo transition hover:bg-slate-50"
              onClick={limpiarFiltros}
            >
              <X size={16} /> Limpiar
            </button>
          </div>
        </div>
      </div>

      {mostrarConfigColumnas && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-menta-petroleo">Configurar Columnas</h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-menta-petroleo px-3 py-1.5 text-xs font-medium text-white transition hover:bg-menta-marino"
                onClick={() => toggleTodasColumnas(true)}
              >
                <Eye size={14} /> Mostrar Todas
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-600"
                onClick={() => toggleTodasColumnas(false)}
              >
                <EyeOff size={14} /> Ocultar Todas
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                onClick={() => setMostrarConfigColumnas(false)}
              >
                <X size={14} /> Cerrar
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {todasLasColumnas.map(columna => {
              const esObligatoria = ['numero', 'acciones'].includes(columna.key);
              return (
                <div key={columna.key} className="rounded-lg p-2 transition hover:bg-slate-100">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={columnasVisibles[columna.key]}
                      onChange={() => !esObligatoria && toggleColumna(columna.key)}
                      disabled={esObligatoria}
                      className="rounded border-slate-300 text-menta-petroleo focus:ring-menta-turquesa"
                    />
                    <span className={`text-sm select-none ${esObligatoria ? 'font-medium text-slate-500' : 'text-menta-petroleo'}`}>
                      {columna.label}
                      {esObligatoria && <span className="ml-0.5 font-bold text-red-500">*</span>}
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {productos.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 py-12">
            <p className="text-sm font-medium text-menta-petroleo">No se encontraron productos</p>
          </div>
        ) : (
          <div className="min-h-[400px] overflow-x-auto">
            <div
              className="sticky top-0 z-10 grid min-h-[55px] gap-px bg-menta-petroleo text-xs font-semibold uppercase tracking-wider text-white"
              style={{
                gridTemplateColumns: `repeat(${Object.values(columnasVisibles).filter(Boolean).length}, minmax(150px, 1fr))`
              }}
            >
              {columnasVisibles.numero && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">N°</div>}
              {columnasVisibles.id && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">ID</div>}
              {columnasVisibles.codigo && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">CÓD. INTERNO</div>}
              {columnasVisibles.unidad && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">UNIDAD</div>}
              {columnasVisibles.nombre && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">NOMBRE</div>}
              {columnasVisibles.descripcion && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">DESCRIPCIÓN</div>}
              {columnasVisibles.categoria && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">CATEGORÍA</div>}
              {columnasVisibles.sucursal && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">SUCURSAL</div>}
              {columnasVisibles.marca && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">MARCA</div>}
              {columnasVisibles.modelo && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">MODELO</div>}
              {columnasVisibles.codigoSunat && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">CÓD. SUNAT</div>}
              {columnasVisibles.codigoBarras && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">CÓD. BARRAS</div>}
              {columnasVisibles.tipodeAfectacion && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">TIPO AFECTACIÓN</div>}
              {columnasVisibles.origen && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">ORIGEN</div>}
              {columnasVisibles.codigoprovedorOEM && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">CÓD. PROVEEDOR OEM</div>}
              {columnasVisibles.codigoCompetencia && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">CÓD. COMPETENCIA</div>}
              {columnasVisibles.rangoAnos && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">RANGO AÑOS</div>}
              {columnasVisibles.observaciones && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">OBSERVACIONES</div>}
              {columnasVisibles.precioVenta && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">P.UNITARIO (VENTA)</div>}
              {columnasVisibles.precioCompra && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">P.UNITARIO (COMPRA)</div>}
              {columnasVisibles.productosRelacionados && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">PRODUCTOS RELACIONADOS</div>}
              {columnasVisibles.codigoTipoMoneda && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">CÓDIGO TIPO MONEDA</div>}
              {columnasVisibles.codigoTipoAfectacionIgvVenta && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">CÓDIGO AFECTACIÓN IGV VENTA</div>}
              {columnasVisibles.tieneIgv && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">TIENE IGV</div>}
              {columnasVisibles.codigoTipoAfectacionIgvCompra && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">CÓDIGO AFECTACIÓN IGV COMPRA</div>}
              {columnasVisibles.stock && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">STOCK</div>}
              {columnasVisibles.stockMinimo && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">STOCK MÍNIMO</div>}
              {columnasVisibles.iscActivo && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">ISC ACTIVO</div>}
              {columnasVisibles.tipoAplicacionISC && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">TIPO APLICACIÓN ISC</div>}
              {columnasVisibles.sujetoDetraccion && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">SUJETO DETRACCIÓN</div>}
              {columnasVisibles.estado && <div className="flex items-center justify-center border-r border-white/20 px-3 py-3.5">ESTADO</div>}
              {columnasVisibles.acciones && <div className="sticky right-0 z-[15] flex min-w-[100px] items-center justify-center border-l-2 border-white/30 bg-menta-petroleo px-3 py-3.5">ACCIONES</div>}
            </div>
            
            {productos.map((producto, index) => (
              <div
                key={producto.id}
                className="grid min-h-[70px] border-b border-slate-200 bg-white transition hover:bg-slate-50/80"
                style={{
                  gridTemplateColumns: `repeat(${Object.values(columnasVisibles).filter(Boolean).length}, minmax(150px, 1fr))`
                }}
              >
                {columnasVisibles.numero && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{index + 1}</div>}
                {columnasVisibles.id && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.id}</div>}
                {columnasVisibles.codigo && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.codigo || '-'}</div>}
                {columnasVisibles.unidad && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.unidadMedida || 'NIU'}</div>}
                {columnasVisibles.nombre && (
                  <div
                    className="flex min-w-[200px] cursor-pointer items-center justify-start border-r border-slate-200 px-3 py-3.5 text-left font-medium text-fondo transition hover:bg-menta-claro/50"
                    onClick={() => { setProductoSeleccionado(producto); setGaleriaAbierta(true); }}
                  >
                    <span className="cursor-pointer text-menta-turquesa hover:underline">{producto.nombre}</span>
                  </div>
                )}
                {columnasVisibles.descripcion && <div className="flex min-w-[250px] max-w-[300px] items-center justify-start truncate border-r border-slate-200 px-3 py-3.5 text-left text-sm text-slate-500">{producto.descripcion || '-'}</div>}
                {columnasVisibles.categoria && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.Categorium?.nombre || producto.categoria?.nombre || producto.categoriaNombre || '-'}</div>}
                {columnasVisibles.sucursal && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.Sucursal?.nombre || producto.sucursal?.nombre || producto.sucursalNombre || '-'}</div>}
                {columnasVisibles.marca && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.marca || '-'}</div>}
                {columnasVisibles.modelo && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.modelo || '-'}</div>}
                {columnasVisibles.codigoSunat && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.codigosunat || '-'}</div>}
                {columnasVisibles.codigoBarras && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.codigoBarras || '-'}</div>}
                {columnasVisibles.tipodeAfectacion && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.tipodeAfectacion || '-'}</div>}
                {columnasVisibles.origen && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.origen || '-'}</div>}
                {columnasVisibles.codigoprovedorOEM && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.codigoprovedorOEM || '-'}</div>}
                {columnasVisibles.codigoCompetencia && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.codigoCompetencia || '-'}</div>}
                {columnasVisibles.rangoAnos && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.rangoAnos || '-'}</div>}
                {columnasVisibles.observaciones && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.observaciones || '-'}</div>}
                {columnasVisibles.precioVenta && <div className="flex min-w-[140px] items-center justify-center border-r border-slate-200 px-3 py-3.5 font-mono text-sm font-semibold text-menta-esmeralda">S/ {parseFloat(producto.precioVenta || 0).toFixed(2)}</div>}
                {columnasVisibles.precioCompra && <div className="flex min-w-[140px] items-center justify-center border-r border-slate-200 px-3 py-3.5 font-mono text-sm font-semibold text-menta-esmeralda">S/ {parseFloat(producto.precioCompra || 0).toFixed(2)}</div>}
                {columnasVisibles.productosRelacionados && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.productos_relacionados || '-'}</div>}
                {columnasVisibles.codigoTipoMoneda && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.codigo_tipo_moneda || '-'}</div>}
                {columnasVisibles.codigoTipoAfectacionIgvVenta && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.codigo_tipo_afectacion_igv_venta || '-'}</div>}
                {columnasVisibles.tieneIgv && (
                  <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${producto.tiene_igv ? 'border border-green-200 bg-green-100 text-green-800' : 'border border-slate-200 bg-slate-100 text-slate-600'}`}>
                      {producto.tiene_igv ? 'Sí' : 'No'}
                    </span>
                  </div>
                )}
                {columnasVisibles.codigoTipoAfectacionIgvCompra && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.codigo_tipo_afectacion_igv_compra || '-'}</div>}
                {columnasVisibles.stock && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.stock || 0}</div>}
                {columnasVisibles.stockMinimo && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.stockMinimo || 0}</div>}
                {columnasVisibles.iscActivo && (
                  <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${producto.iscActivo ? 'border border-green-200 bg-green-100 text-green-800' : 'border border-slate-200 bg-slate-100 text-slate-600'}`}>
                      {producto.iscActivo ? 'Sí' : 'No'}
                    </span>
                  </div>
                )}
                {columnasVisibles.tipoAplicacionISC && <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5 text-sm text-menta-marino">{producto.tipoAplicacionISC || '-'}</div>}
                {columnasVisibles.sujetoDetraccion && (
                  <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${producto.sujetoDetraccion ? 'border border-amber-200 bg-amber-100 text-amber-800' : 'border border-slate-200 bg-slate-100 text-slate-600'}`}>
                      {producto.sujetoDetraccion ? 'Sí' : 'No'}
                    </span>
                  </div>
                )}
                {columnasVisibles.estado && (
                  <div className="flex min-w-[120px] items-center justify-center border-r border-slate-200 px-3 py-3.5">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${producto.estado ? 'border border-green-200 bg-green-100 text-green-800' : 'border border-red-200 bg-red-100 text-red-800'}`}>
                      {producto.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                )}
                {columnasVisibles.acciones && (
                  <div className="acciones-dropdown sticky right-0 z-[5] flex min-w-[100px] items-center justify-center border-l-2 border-slate-200 bg-white px-3 py-3.5 hover:bg-slate-50/80">
                    <div className="relative">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-menta-claro hover:text-menta-petroleo"
                        onClick={() => toggleDropdown(producto.id)}
                      >
                        <span className="text-lg leading-none">⋮</span>
                      </button>
                      {dropdownAbierto === producto.id && (
                        <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-menta-petroleo transition hover:bg-slate-50"
                            onClick={() => { onEditarProducto(producto); cerrarDropdown(); }}
                          >
                            <Edit3 size={14} /> Editar
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-menta-petroleo transition hover:bg-slate-50"
                            onClick={() => abrirModalVerPresentaciones(producto)}
                          >
                            <Package size={14} /> Ver Presentaciones
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                            onClick={() => { handleEliminar(producto.id, producto.nombre); cerrarDropdown(); }}
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

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/80 px-4 py-3">
        <p className="text-sm font-medium text-menta-petroleo">Total de productos: {productos.length}</p>
        {paginacion.total > 0 && (
          <p className="text-sm text-menta-petroleo">Mostrando página {paginacion.pagina} de {totalPaginas}</p>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 py-4">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-menta-petroleo transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
            onClick={() => cambiarPagina(paginacion.pagina - 1)}
            disabled={paginacion.pagina === 1}
          >
            ← Anterior
          </button>
          <div className="flex flex-wrap items-center gap-1">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numeroPagina => (
              <button
                key={numeroPagina}
                type="button"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  numeroPagina === paginacion.pagina
                    ? 'bg-menta-petroleo text-white'
                    : 'border border-slate-200 bg-white text-menta-petroleo hover:bg-menta-claro'
                }`}
                onClick={() => cambiarPagina(numeroPagina)}
              >
                {numeroPagina}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-menta-petroleo transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
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