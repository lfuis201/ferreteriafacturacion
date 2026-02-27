import React, { useState, useEffect } from "react";
//import "../../styles/FormularioVenta.css";
import "../../styles/FormularioVentaProducto.css";
import { productoService, obtenerProductosConInventario } from "../../services/productoService";
import { obtenerPresentaciones } from "../../services/presentacionService";
import { obtenerCategorias } from "../../services/categoriaService";
import { obtenerSucursales } from "../../services/sucursalService";
import ModalAgregarPresentaciones from "./ModalAgregarPresentaciones";
import ModalUbicacionProducto from "./ModalUbicacionProducto";

function ProductoDetalle({ onProductoSeleccionado, productos: productosProps, sucursalOrigenId, contexto }) {
  const [productos, setProductos] = useState(productosProps || []);
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [loadingPresentaciones, setLoadingPresentaciones] = useState(false);
  const [presentaciones, setPresentaciones] = useState([]);
  const [modalEditarPrecios, setModalEditarPrecios] = useState(false);
  const [presentacionesEditables, setPresentacionesEditables] = useState([]);
  const [mostrarModalUbicacion, setMostrarModalUbicacion] = useState(false);
  const [productoParaUbicacion, setProductoParaUbicacion] = useState(null);

  const [producto, setProducto] = useState({
    codigo: '',
    marca: '',
    modelo: '',
    categoria: '',
    origen: '',
    referencia: '',
    stock: 0,
    precioSinPrecio: 'Sin precio',
    descripcion: ''
  });

  const [filtros, setFiltros] = useState({
    busqueda: "",
    categoria: "",
    precioMin: "",
    precioMax: "",
    marca: '',
  });

  const [nuevoProducto, setNuevoProducto] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precioCompra: "",
    precioVenta: "",
    productosRelacionados: "",
    codigoTipoMoneda: "PEN",
    codigoTipoAfectacionIgvVenta: "10",
    tieneIgv: true,
    codigoTipoAfectacionIgvCompra: "10",
    stock: 0,
    stockMinimo: 0,
    unidadMedida: "NIU",
    codigoBarras: "",
    tipodeAfectacion: "Gravado_Operación_Onerosa",
    modelo: "",
    marca: "",
    origen: "",
    codigosunat: "",
    codigoprovedorOEM: "",
    codigoCompetencia: "",
    rangoAnos: "",
    observaciones: "",
    categoriaId: "",
    sucursalId: "",
    iscActivo: false,
    tipoAplicacionISC: "",
    sujetoDetraccion: false,
    estado: true
  });

  // Estados para manejo de imágenes en nuevo producto
  const [imagenesNuevoProducto, setImagenesNuevoProducto] = useState({
    imagen1: null,
    imagen2: null,
    imagen3: null
  });
  const [previewImagenesNuevoProducto, setPreviewImagenesNuevoProducto] = useState({
    imagen1: null,
    imagen2: null,
    imagen3: null
  });

  const [inventario, setInventario] = useState({
    totalProductos: 0,
    valorTotal: 0,
    productosActivos: 0,
    productosInactivos: 0,
    almacen: 'Si almacen - Operacion Comercial',
    cantidad: 1,
    precioCompra: 0,
    precioUnitario: 100.00,
    total: 0
  });

  const [atributos, setAtributos] = useState('');

  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [loadingRelacionados, setLoadingRelacionados] = useState(false);
  const [mostrarModalProductosRelacionados, setMostrarModalProductosRelacionados] = useState(false);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [mostrarFormularioNuevoProducto, setMostrarFormularioNuevoProducto] = useState(false);
  const [busquedaModal, setBusquedaModal] = useState('');
  const [cargandoCreacion, setCargandoCreacion] = useState(false);

  // Estados para modal de presentaciones
  const [modalAgregarPresentacionesAbierto, setModalAgregarPresentacionesAbierto] = useState(false);
  const [cantidadPresentaciones, setCantidadPresentaciones] = useState(0);
  const [presentacionesIntegradas, setPresentacionesIntegradas] = useState([]);
  const [imagenActual, setImagenActual] = useState(0);

  // Resetear imagen actual cuando cambie el producto seleccionado
  useEffect(() => {
    setImagenActual(0);
  }, [productoSeleccionado]);

  // Obtener usuario actual y establecer sucursalId en filtros
  useEffect(() => {
    if (sucursalOrigenId) {
      setFiltros(prev => ({
        ...prev,
        sucursalId: sucursalOrigenId,
      }));
      console.log("✅ SucursalId recibida por props establecido en filtros:", sucursalOrigenId);
      return;
    }

    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      if (usuario.sucursalId) {
        setFiltros(prev => ({
          ...prev,
          sucursalId: usuario.sucursalId,
        }));
        console.log("✅ SucursalId del usuario establecido en filtros:", usuario.sucursalId);
      } else {
        // Si el usuario no tiene sucursalId, usar la sucursal principal (ID: 1)
        setFiltros(prev => ({
          ...prev,
          sucursalId: 1,
        }));
        console.log("⚠️ Usuario sin sucursalId, usando sucursal por defecto en filtros: 1");
      }
    } else {
      // Si no hay usuario, usar sucursal por defecto
      setFiltros(prev => ({
        ...prev,
        sucursalId: 1,
      }));
      console.log("⚠️ Sin usuario en localStorage, usando sucursal por defecto en filtros: 1");
    }
  }, [sucursalOrigenId]);

  // Recargar productos cuando cambien los filtros (especialmente sucursalId)
  useEffect(() => {
    if (filtros.sucursalId) {
      console.log("🔄 Recargando productos por cambio en filtros:", filtros);
      cargarProductos();
    }
  }, [filtros.sucursalId, filtros.categoria, filtros.busqueda]);

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    if (section === 'producto') {
      setProducto(prev => ({ ...prev, [name]: value }));
    } else if (section === 'filtros') {
      setFiltros(prev => ({ ...prev, [name]: value }));
    } else if (section === 'inventario') {
      setInventario(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleNuevoProductoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoProducto(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Función para manejar cambios en las imágenes del nuevo producto
  const handleImagenNuevoProductoChange = (e, imagenKey) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      setImagenesNuevoProducto(prev => ({ ...prev, [imagenKey]: file }));

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImagenesNuevoProducto(prev => ({ ...prev, [imagenKey]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImagenNuevoProducto = (imagenKey) => {
    setImagenesNuevoProducto(prev => ({ ...prev, [imagenKey]: null }));
    setPreviewImagenesNuevoProducto(prev => ({ ...prev, [imagenKey]: null }));
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);

      // USAR obtenerProductosConInventario para obtener productos con stock real
      console.log('🔍 Filtros usados para cargar productos:', filtros);
      console.log('🏢 Sucursal ID específica:', filtros.sucursalId);

      const response = await obtenerProductosConInventario({
        categoriaId: filtros.categoria,
        nombre: filtros.busqueda,
        sucursalId: filtros.sucursalId || "1" // Usar sucursal por defecto
      });

      console.log('📦 Respuesta completa de productos con inventario:', response);
      console.log('📦 Estructura de response.productos:', response.productos);

      const productosData = response.productos || response.data || [];
      console.log('📊 Total productos recibidos:', productosData.length);
      console.log('📊 Primer producto completo:', JSON.stringify(productosData[0], null, 2));

      // Verificar si algún producto tiene stock > 0
      const productosConStockReal = productosData.filter(p => p.stock > 0);
      console.log('📈 Productos con stock > 0:', productosConStockReal.length);
      console.log('📈 Productos con stock real:', productosConStockReal.map(p => ({
        nombre: p.nombre,
        codigo: p.codigo,
        stock: p.stock,
        stockOriginal: p.stock,
        inventarios: p.Inventarios
      })));

      // Mapear productos para asegurar que tengan la estructura correcta
      const productosConStock = productosData.map(producto => {
        console.log(`🔍 Procesando producto ${producto.nombre}:`, {
          stockOriginal: producto.stock,
          stockMinimo: producto.stockMinimo,
          precioVenta: producto.precioVenta,
          precioVentaInventario: producto.precioVentaInventario,
          inventarios: producto.Inventarios
        });

        return {
          ...producto,
          stock: producto.stock || 0,
          stockMinimo: producto.stockMinimo || 0,
          precioVenta: producto.precioVenta || producto.precioVentaInventario || 0
        };
      });

      console.log('🎯 Productos mapeados con stock:', productosConStock.map(p => ({
        nombre: p.nombre,
        codigo: p.codigo,
        stock: p.stock,
        stockMinimo: p.stockMinimo,
        precioVenta: p.precioVenta
      })));

      setProductos(productosConStock);

      // Calcular estadísticas del inventario
      const productosActivos = productosConStock.filter(p => p.iscActivo) || [];
      const valorTotal = productosActivos.reduce((sum, p) => sum + (parseFloat(p.precioVenta) || 0), 0);

      setInventario(prev => ({
        ...prev,
        totalProductos: productosConStock.length || 0,
        valorTotal: valorTotal,
        productosActivos: productosActivos.length,
        productosInactivos: productosConStock.length - productosActivos.length
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

  const cargarSucursales = async () => {
    try {
      const sucursalesData = await obtenerSucursales();
      setSucursales(sucursalesData.sucursales || []);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      setSucursales([]);
    }
  };

  // Funciones para manejar productos relacionados
  const handleProductoRelacionadoToggle = (producto) => {
    setProductosSeleccionados(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (existe) {
        return prev.filter(p => p.id !== producto.id);
      } else {
        return [...prev, producto];
      }
    });
  };

  const confirmarProductosRelacionados = () => {
    const nombresProductos = productosSeleccionados.map(p => p.nombre).join(', ');
    setNuevoProducto(prev => ({
      ...prev,
      productosRelacionados: nombresProductos
    }));
    setMostrarModalProductosRelacionados(false);
  };

  const limpiarProductosRelacionados = () => {
    setProductosSeleccionados([]);
    setNuevoProducto(prev => ({
      ...prev,
      productosRelacionados: ''
    }));
  };

  const abrirModalProductosRelacionados = async () => {
    setMostrarModalProductosRelacionados(true);
    setBusquedaModal(''); // Limpiar búsqueda anterior

    // Cargar todos los productos disponibles
    try {
      const response = await productoService.obtenerProductos({});
      console.log('Productos cargados para modal:', response);
      if (response && response.productos) {
        // Actualizar la lista de productos disponibles
        setProductos(response.productos);
      } else {
        console.log('No se encontraron productos en la respuesta');
        setProductos([]);
      }
    } catch (error) {
      console.error('Error al cargar productos para el modal:', error);
      setProductos([]);
    }
  };

  // Funciones para manejar presentaciones
  const abrirModalAgregarPresentaciones = () => {
    console.log('Abriendo modal de presentaciones');
    console.log('Precio de venta actual:', nuevoProducto.precioVenta);
    setModalAgregarPresentacionesAbierto(true);
  };

  const handlePresentacionesChange = (presentaciones) => {
    console.log('Presentaciones recibidas:', presentaciones);
    setPresentacionesIntegradas(presentaciones);
    setCantidadPresentaciones(presentaciones.length);
  };

  useEffect(() => {
    if (productosProps) {
      setProductos(productosProps);
    } else {
      cargarProductos();
    }
    cargarCategorias();
    cargarSucursales();
  }, [productosProps]);

  const crearProducto = async () => {
    try {
      // Validar campos requeridos
      if (!nuevoProducto.codigo || !nuevoProducto.nombre || !nuevoProducto.precioVenta) {
        alert('Por favor complete los campos obligatorios: Código, Nombre y Precio de Venta');
        return;
      }

      setCargandoCreacion(true);
      const formData = new FormData();
      Object.keys(nuevoProducto).forEach(key => {
        if (nuevoProducto[key] !== null && nuevoProducto[key] !== '') {
          formData.append(key, nuevoProducto[key]);
        }
      });

      // Agregar imágenes si existen
      if (imagenesNuevoProducto.imagen1) {
        formData.append("imagen1", imagenesNuevoProducto.imagen1);
      }
      if (imagenesNuevoProducto.imagen2) {
        formData.append("imagen2", imagenesNuevoProducto.imagen2);
      }
      if (imagenesNuevoProducto.imagen3) {
        formData.append("imagen3", imagenesNuevoProducto.imagen3);
      }

      // Agregar presentaciones si existen
      if (presentacionesIntegradas && presentacionesIntegradas.length > 0) {
        formData.append('presentaciones', JSON.stringify(presentacionesIntegradas));
        console.log('📦 Enviando presentaciones al backend:', presentacionesIntegradas);
      }

      const response = await productoService.crearProducto(formData);
      alert('Producto creado exitosamente');
      setMostrarFormularioNuevoProducto(false);
      setNuevoProducto({
        codigo: "",
        nombre: "",
        descripcion: "",
        precioCompra: "",
        precioVenta: "",
        unidadMedida: "NIU",
        codigoBarras: "",
        marca: "",
        modelo: "",
        origen: "",
        referencia: "",
        stock: "",
        stockMinimo: "",
        categoriaId: "",
        sucursalId: "",
        codigoTipoMoneda: "PEN",
        codigoTipoAfectacionIgvVenta: "10",
        tieneIgv: true,
        codigoTipoAfectacionIgvCompra: "10",
        productosRelacionados: "",
        aplicacion: "",
        codigosunat: "",
        codigoprovedorOEM: "",
        codigoCompetencia: "",
        rangoAnos: "",
        observaciones: "",
        imagen: null
      });

      // Resetear estados de imágenes
      setImagenesNuevoProducto({
        imagen1: null,
        imagen2: null,
        imagen3: null
      });
      setPreviewImagenesNuevoProducto({
        imagen1: null,
        imagen2: null,
        imagen3: null
      });

      await cargarProductos();
    } catch (error) {
      console.error('Error al crear producto:', error);
      alert('Error al crear el producto: ' + (error.response?.data?.message || error.message || 'Error desconocido'));
    } finally {
      setCargandoCreacion(false);
    }
  };

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    cargarPresentaciones(producto.id);
    cargarProductosRelacionados(producto.productosRelacionados);
    // No llamar inmediatamente a onProductoSeleccionado
    // El usuario podrá ver los detalles primero
  };

  const confirmarSeleccionProducto = (producto) => {
    if (onProductoSeleccionado) {
      onProductoSeleccionado(producto);
    }
  };

  const cargarPresentaciones = async (productoId) => {
    try {
      setLoadingPresentaciones(true);
      const response = await obtenerPresentaciones(productoId);

      let presentacionesData = [];
      if (Array.isArray(response)) {
        presentacionesData = response;
      } else if (response && response.presentaciones && Array.isArray(response.presentaciones)) {
        presentacionesData = response.presentaciones;
      } else if (response && response.data && Array.isArray(response.data)) {
        presentacionesData = response.data;
      }

      // Formatear presentaciones para la tabla
      const presentacionesFormateadas = presentacionesData.map(p => ({
        unidad: p.unidadMedida || 'UNI',
        descripcion: p.descripcion || 'Sin descripción',
        factor: parseFloat(p.factor || 1).toFixed(4),
        precio1: parseFloat(p.precio1 || 0).toFixed(4),
        precio2: parseFloat(p.precio2 || 0).toFixed(4),
        precio3: parseFloat(p.precio3 || 0).toFixed(4),
        precioDefecto: p.esDefecto ? 'Precio por defecto' : 'Precio alternativo',
        codigoBarras: p.codigoBarras || ''
      }));

      setPresentaciones(presentacionesFormateadas);
    } catch (error) {
      console.error('Error al cargar presentaciones:', error);
      setPresentaciones([]);
    } finally {
      setLoadingPresentaciones(false);
    }
  };

  const cargarProductosRelacionados = async (productosRelacionadosStr) => {
    if (!productosRelacionadosStr || productosRelacionadosStr.trim() === '') {
      setProductosRelacionados([]);
      return;
    }

    setLoadingRelacionados(true);
    try {
      // Dividir la cadena de productos relacionados por comas
      const nombresProductos = productosRelacionadosStr.split(',').map(nombre => nombre.trim());
      const productosEncontrados = [];

      // Buscar cada producto por nombre
      for (const nombre of nombresProductos) {
        if (nombre) {
          try {
            const response = await productoService.obtenerProductos({ nombre });
            if (response && response.productos && response.productos.length > 0) {
              // Tomar el primer producto que coincida
              const producto = response.productos[0];
              productosEncontrados.push({
                id: producto.id,
                nombre: producto.nombre,
                codigo: producto.codigo,
                precio: parseFloat(producto.precioVenta || 0).toFixed(2),
                imagen: producto.imagen,
                categoria: producto.Categoria?.nombre || 'Sin categoría',
                descripcion: producto.descripcion
              });
            }
          } catch (error) {
            console.error(`Error al buscar producto ${nombre}:`, error);
          }
        }
      }

      setProductosRelacionados(productosEncontrados);
    } catch (error) {
      console.error('Error al cargar productos relacionados:', error);
      setProductosRelacionados([]);
    } finally {
      setLoadingRelacionados(false);
    }
  };

  const abrirModalEditarPrecios = () => {
    if (!productoSeleccionado) {
      alert('Selecciona un producto primero');
      return;
    }
    // Copiar presentaciones actuales para edición
    setPresentacionesEditables([...presentaciones]);
    setModalEditarPrecios(true);
  };

  const cerrarModalEditarPrecios = () => {
    setModalEditarPrecios(false);
    setPresentacionesEditables([]);
  };

  const agregarPresentacion = () => {
    const nuevaPresentacion = {
      unidad: 'UNI',
      descripcion: '',
      factor: '1.0000',
      precio1: '0.0000',
      precio2: '0.0000',
      precio3: '0.0000',
      precioDefecto: 'Precio alternativo',
      codigoBarras: ''
    };
    setPresentacionesEditables([...presentacionesEditables, nuevaPresentacion]);
  };

  const eliminarPresentacion = (index) => {
    const nuevasPresentaciones = presentacionesEditables.filter((_, i) => i !== index);
    setPresentacionesEditables(nuevasPresentaciones);
  };

  const actualizarPresentacion = (index, campo, valor) => {
    const nuevasPresentaciones = [...presentacionesEditables];
    nuevasPresentaciones[index][campo] = valor;
    setPresentacionesEditables(nuevasPresentaciones);
  };

  const guardarPresentaciones = async () => {
    try {
      // Aquí iría la lógica para guardar las presentaciones en el backend
      console.log('Guardando presentaciones:', presentacionesEditables);

      // Actualizar las presentaciones mostradas
      setPresentaciones([...presentacionesEditables]);

      // Cerrar modal
      cerrarModalEditarPrecios();

      alert('Presentaciones guardadas correctamente');
    } catch (error) {
      console.error('Error al guardar presentaciones:', error);
      alert('Error al guardar las presentaciones');
    }
  };

  useEffect(() => {
    if (!productosProps || productosProps.length === 0) {
      cargarProductos();
    } else {
      setProductos(productosProps);
    }
    cargarCategorias();
    cargarSucursales();
  }, [productosProps]);

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const cumpleBusqueda = !filtros.busqueda ||
      producto.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      producto.codigo?.toLowerCase().includes(filtros.busqueda.toLowerCase());

    // Filtro de categoría corregido para usar la estructura del backend
    const cumpleCategoria = !filtros.categoria ||
      (producto.Categorium && producto.Categorium.nombre === filtros.categoria);

    const cumplePrecioMin = !filtros.precioMin || parseFloat(producto.precioVenta) >= parseFloat(filtros.precioMin);

    const cumplePrecioMax = !filtros.precioMax || parseFloat(producto.precioVenta) <= parseFloat(filtros.precioMax);

    return cumpleBusqueda && cumpleCategoria && cumplePrecioMin && cumplePrecioMax;
  });

  // Solo mostrar productos si hay filtros aplicados
  const mostrarProductos = filtros.busqueda || filtros.categoria || filtros.marca;
  const productosAMostrar = mostrarProductos ? productosFiltrados : [];

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: '0'
    }}>
      {/* Header rojo */}
      <div style={{
        backgroundColor: '#d32f2f',
        color: 'white',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>Agregue Productos / Servicios</div>
        <button style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer'
        }}>×</button>
      </div>

      {/* Contenido principal */}
      <div style={{
        backgroundColor: 'white',
        margin: '0',
        padding: '20px'
      }}>



        {/* Barra de búsqueda y filtros */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            name="busqueda"
            value={filtros.busqueda}
            onChange={handleFiltroChange}
            placeholder="Buscar por código o nombre..."
            style={{
              flex: 1,
              minWidth: '200px',
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
              fontSize: '12px',
              minWidth: '120px'
            }}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.nombre}>{categoria.nombre}</option>
            ))}
          </select>






          <button
            onClick={() => setMostrarFormularioNuevo(true)}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            + Nuevo Producto
          </button>
        </div>

        {/* Lista de productos filtrados */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Cargando productos...</div>
        ) : productosAMostrar.length === 0 && mostrarProductos ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No se encontraron productos con los filtros aplicados
          </div>
        ) : !mostrarProductos ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Aplica un filtro para ver los productos disponibles
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '30px'
          }}>
            {/* Header de la tabla */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '50px 200px 120px 150px 100px 120px 80px',
              backgroundColor: '#f8f9fa',
              padding: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#333',
              borderBottom: '2px solid #dee2e6'
            }}>
              <div style={{ textAlign: 'center' }}>#</div>
              <div>Producto</div>
              <div>Código</div>
              <div>Categoría</div>
              <div style={{ textAlign: 'center' }}>Stock</div>
              <div style={{ textAlign: 'right' }}>Precio</div>
              <div style={{ textAlign: 'center' }}>Acción</div>
            </div>

            {/* Filas de productos */}
            {productosAMostrar.map((prod, index) => {
              // Procesar las imágenes del producto
              const imagenes = prod.imagen ? prod.imagen.split(',') : [];

              return (
                <div
                  key={prod.id || index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '50px 200px 120px 150px 100px 120px 80px',
                    padding: '12px',
                    fontSize: '12px',
                    borderBottom: index < productosAMostrar.length - 1 ? '1px solid #eee' : 'none',
                    backgroundColor: 'white',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => seleccionarProducto(prod)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  {/* Número */}
                  <div style={{
                    textAlign: 'center',
                    color: '#666',
                    fontWeight: '500'
                  }}>
                    {index + 1}
                  </div>

                  {/* Nombre del producto con hover para imágenes */}
                  <div style={{
                    position: 'relative',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    <span
                      style={{
                        cursor: 'pointer',
                        color: '#007bff',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (imagenes.length > 0) {
                          const tooltip = document.createElement('div');
                          tooltip.id = `tooltip-${prod.id}`;
                          tooltip.style.cssText = `
                            position: fixed;
                            background: white;
                            border: 2px solid #ddd;
                            border-radius: 8px;
                            padding: 10px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                            z-index: 1000;
                            max-width: 300px;
                          `;

                          const imageContainer = document.createElement('div');
                          imageContainer.style.cssText = `
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                            gap: 8px;
                          `;

                          imagenes.slice(0, 4).forEach(img => {
                            const imgElement = document.createElement('img');
                            imgElement.src = img;
                            imgElement.style.cssText = `
                              width: 80px;
                              height: 80px;
                              object-fit: cover;
                              border-radius: 4px;
                              border: 1px solid #eee;
                            `;
                            imageContainer.appendChild(imgElement);
                          });

                          tooltip.appendChild(imageContainer);

                          if (imagenes.length > 4) {
                            const moreText = document.createElement('div');
                            moreText.textContent = `+${imagenes.length - 4} más`;
                            moreText.style.cssText = `
                              text-align: center;
                              margin-top: 8px;
                              font-size: 11px;
                              color: #666;
                            `;
                            tooltip.appendChild(moreText);
                          }

                          document.body.appendChild(tooltip);

                          const rect = e.target.getBoundingClientRect();
                          tooltip.style.left = `${rect.right + 10}px`;
                          tooltip.style.top = `${rect.top}px`;
                        }
                      }}
                      onMouseLeave={() => {
                        const tooltip = document.getElementById(`tooltip-${prod.id}`);
                        if (tooltip) {
                          tooltip.remove();
                        }
                      }}
                    >
                      {prod.nombre || prod.codigo}
                      {imagenes.length > 0 && (
                        <span style={{
                          marginLeft: '5px',
                          fontSize: '10px',
                          color: '#28a745'
                        }}>
                          📷 ({imagenes.length})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Código */}
                  <div style={{
                    color: '#666',
                    fontFamily: 'monospace'
                  }}>
                    {prod.codigo}
                  </div>

                  {/* Categoría */}
                  <div style={{
                    color: '#666'
                  }}>
                    {prod.Categorium?.nombre || prod.categoria || 'Sin categoría'}
                  </div>

                  {/* Stock */}
                  <div style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: (prod.stock || 0) === 0 ? '#dc3545' : (prod.stock || 0) < 5 ? '#ffc107' : '#28a745'
                  }}>
                    {prod.stock || 0}
                  </div>

                  {/* Precio */}
                  <div style={{
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: '#28a745'
                  }}>
                    S/ {parseFloat(prod.precioVenta || 0).toFixed(2)}
                  </div>

                  {/* Acción - Lupa para ver ubicación */}
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductoParaUbicacion(prod);
                        setMostrarModalUbicacion(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '16px',
                        cursor: 'pointer',
                        color: '#007bff',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                      title="Ver ubicación en sucursales"
                    >
                      🔍
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Formulario para nuevo producto */}
        {mostrarFormularioNuevo && (
          <div className="formulario-producto-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>


            <div className="form-wrapper" >
              {/* Header del formulario */}
              <div className="form-header">
                <div className="header-content">
                  <h1 className="form-title">📦 Crear Nuevo Producto</h1>
                  <button
                    className="btn-close-form"
                    onClick={() => setMostrarFormularioNuevo(false)}
                    type="button"
                  >
                    ✕ Cerrar
                  </button>
                </div>
              </div>

              {/* Contenido del formulario */}
              <div style={{ maxHeight: 'calc(90vh - 80px)', overflow: 'auto' }}>
                <form className="form-content">
                  <div className="form-grid">
                    {/* Información básica */}
                    <div className="form-section">
                      <h3>📋 Información Básica</h3>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="codigo">Código del Producto *</label>
                          <input
                            type="text"
                            id="codigo"
                            name="codigo"
                            value={nuevoProducto.codigo}
                            onChange={handleNuevoProductoChange}
                            required
                            placeholder="Ej: PROD-001"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="nombre">Nombre del Producto *</label>
                          <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={nuevoProducto.nombre}
                            onChange={handleNuevoProductoChange}
                            required
                            placeholder="Nombre del producto"
                          />
                        </div>
                      </div>

                      <div className="form-group full-width">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                          id="descripcion"
                          name="descripcion"
                          value={nuevoProducto.descripcion}
                          onChange={handleNuevoProductoChange}
                          rows="3"
                          placeholder="Descripción detallada del producto"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="categoriaId">Categoría</label>
                          <select
                            id="categoriaId"
                            name="categoriaId"
                            value={nuevoProducto.categoriaId}
                            onChange={handleNuevoProductoChange}
                          >
                            <option value="">Seleccionar categoría</option>
                            {categorias.map(categoria => (
                              <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="sucursalId">Almacén *</label>
                          <select
                            id="sucursalId"
                            name="sucursalId"
                            value={nuevoProducto.sucursalId}
                            onChange={handleNuevoProductoChange}
                          >
                            <option value="">Seleccionar Almacén</option>
                            {sucursales.map(sucursal => (
                              <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="unidadMedida">Unidad de Medida *</label>
                          <select
                            id="unidadMedida"
                            name="unidadMedida"
                            value={nuevoProducto.unidadMedida}
                            onChange={handleNuevoProductoChange}
                            required
                          >
                            <option value="NIU">Unidad</option>
                            <option value="KGM">Kilogramo</option>
                            <option value="MTR">Metro</option>
                            <option value="LTR">Litro</option>
                            <option value="SET">Juego</option>
                            <option value="PAR">Par</option>
                            <option value="DOZ">Docena</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Precios */}
                    <div className="form-section">
                      <h3>💰 Precios</h3>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="precioCompra">Precio de Compra (S/.) *</label>
                          <input
                            type="number"
                            id="precioCompra"
                            name="precioCompra"
                            value={nuevoProducto.precioCompra}
                            onChange={handleNuevoProductoChange}
                            step="0.01"
                            min="0"
                            required
                            placeholder="0.00"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="precioVenta">Precio de Venta (S/.) *</label>
                          <input
                            type="number"
                            id="precioVenta"
                            name="precioVenta"
                            value={nuevoProducto.precioVenta}
                            onChange={handleNuevoProductoChange}
                            step="0.01"
                            min="0"
                            required
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="stock">Stock Inicial</label>
                          <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={nuevoProducto.stock}
                            onChange={handleNuevoProductoChange}
                            min="0"
                            placeholder="0"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="stockMinimo">Stock Mínimo</label>
                          <input
                            type="number"
                            id="stockMinimo"
                            name="stockMinimo"
                            value={nuevoProducto.stockMinimo}
                            onChange={handleNuevoProductoChange}
                            min="0"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Información Adicional */}
                    <div className="form-section">
                      <h3>ℹ️ Información Adicional</h3>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="codigoBarras">Código de Barras</label>
                          <input
                            type="text"
                            id="codigoBarras"
                            name="codigoBarras"
                            value={nuevoProducto.codigoBarras}
                            onChange={handleNuevoProductoChange}
                            placeholder="Código de barras"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="modelo">Modelo</label>
                          <input
                            type="text"
                            id="modelo"
                            name="modelo"
                            value={nuevoProducto.modelo}
                            onChange={handleNuevoProductoChange}
                            placeholder="Modelo del producto"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="marca">Marca</label>
                          <input
                            type="text"
                            id="marca"
                            name="marca"
                            value={nuevoProducto.marca}
                            onChange={handleNuevoProductoChange}
                            placeholder="Marca del producto"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="origen">Origen</label>
                          <input
                            type="text"
                            id="origen"
                            name="origen"
                            value={nuevoProducto.origen}
                            onChange={handleNuevoProductoChange}
                            placeholder="País de origen"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Códigos */}
                    <div className="form-section">
                      <h3>🏷️ Códigos</h3>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="codigosunat">Código SUNAT</label>
                          <input
                            type="text"
                            id="codigosunat"
                            name="codigosunat"
                            value={nuevoProducto.codigosunat}
                            onChange={handleNuevoProductoChange}
                            placeholder="Código SUNAT"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="codigoprovedorOEM">Código Proveedor OEM</label>
                          <input
                            type="text"
                            id="codigoprovedorOEM"
                            name="codigoprovedorOEM"
                            value={nuevoProducto.codigoprovedorOEM}
                            onChange={handleNuevoProductoChange}
                            placeholder="Código del proveedor OEM"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Productos Relacionados */}
                    <div className="form-section">
                      <h3>🔗 Productos Relacionados</h3>

                      <div className="form-group full-width">
                        <label>Productos Relacionados</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {/* Chips de productos relacionados */}
                          {nuevoProducto.productosRelacionados && nuevoProducto.productosRelacionados.trim() !== '' ? (
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '8px',
                              padding: '14px 16px',
                              border: '2px solid #e1e8ed',
                              borderRadius: '8px',
                              backgroundColor: '#fafbfc',
                              minHeight: '50px',
                              alignItems: 'flex-start',
                              alignContent: 'flex-start'
                            }}>
                              {nuevoProducto.productosRelacionados.split(',').map((producto, index) => {
                                const nombreProducto = producto.trim();
                                if (!nombreProducto) return null;
                                return (
                                  <span
                                    key={index}
                                    style={{
                                      backgroundColor: '#28a745',
                                      color: 'white',
                                      padding: '6px 12px',
                                      borderRadius: '16px',
                                      fontSize: '0.85rem',
                                      fontWeight: '500',
                                      display: 'inline-block',
                                      maxWidth: '200px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title={nombreProducto}
                                  >
                                    {nombreProducto}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <div style={{
                              padding: '14px 16px',
                              border: '2px solid #e1e8ed',
                              borderRadius: '8px',
                              backgroundColor: '#fafbfc',
                              fontSize: '0.95rem',
                              color: '#718096',
                              fontStyle: 'italic',
                              minHeight: '50px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              Seleccione productos relacionados
                            </div>
                          )}

                          {/* Botón de seleccionar */}
                          <button
                            type="button"
                            onClick={abrirModalProductosRelacionados}
                            className="btn btn-primary"
                            style={{ alignSelf: 'flex-start' }}
                          >
                            🔍 Seleccionar Productos
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Presentaciones */}
                    <div className="form-section">
                      <h3>📦 Presentaciones</h3>

                      <div className="presentaciones-creacion">
                        <div className="presentaciones-info">
                          <h4>📦 Configurar Presentaciones</h4>
                          <p>Configure las presentaciones del producto antes de crearlo.</p>
                          {cantidadPresentaciones > 0 ? (
                            <p className="presentaciones-count">
                              {cantidadPresentaciones} presentaciones configuradas.
                            </p>
                          ) : (
                            <p className="no-presentaciones">
                              No hay presentaciones configuradas.
                            </p>
                          )}
                        </div>

                        <div className="presentaciones-buttons">
                          <button
                            type="button"
                            className="btn btn-primary btn-gestionar-presentaciones"
                            onClick={abrirModalAgregarPresentaciones}
                          >
                            📦 Gestionar Presentaciones
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Imágenes */}
                    <div className="form-section">
                      <h3>🖼️ Imágenes del Producto</h3>

                      <div className="image-upload-grid">
                        {[1, 2, 3].map((num) => {
                          const imagenKey = `imagen${num}`;
                          return (
                            <div key={num} className="image-upload-item">
                              <div className="image-upload-box">
                                {previewImagenesNuevoProducto[imagenKey] ? (
                                  <div className="image-preview">
                                    <img
                                      src={previewImagenesNuevoProducto[imagenKey]}
                                      alt={`Preview ${num}`}
                                    />
                                    <button
                                      type="button"
                                      className="remove-image"
                                      onClick={() => removeImagenNuevoProducto(imagenKey)}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <label className="upload-label">
                                    <span className="upload-icon">+</span>
                                    <span className="upload-text">Imagen {num}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImagenNuevoProductoChange(e, imagenKey)}
                                      style={{ display: 'none' }}
                                    />
                                  </label>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="upload-note">Se recomienda resoluciones Full HD 1024x720. Máximo 5MB por imagen.</p>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="actions-container">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setMostrarFormularioNuevo(false)}
                    >
                      ← Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={crearProducto}
                      disabled={cargandoCreacion}
                    >
                      {cargandoCreacion ? (
                        <>
                          <span className="spinner-small"></span>
                          Creando producto...
                        </>
                      ) : (
                        "✓ Crear Producto"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>




          </div>
        )}



        {/* Contenido principal con imagen y detalles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '350px 1fr',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Carrusel de imágenes del producto */}
          <div style={{
            backgroundColor: '#f9f9f9',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            {(() => {
              // Si no hay producto seleccionado, mostrar placeholder
              if (!productoSeleccionado) {
                return (
                  <>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      border: '2px dashed #ccc',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '15px',
                      color: '#666'
                    }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>📷</div>
                    </div>
                    <div style={{ color: '#666', fontSize: '11px', marginBottom: '5px' }}>
                      Selecciona un producto para ver sus detalles
                    </div>
                  </>
                );
              }

              // Si no tiene imagen, mostrar placeholder pero continuar con los detalles
              if (!productoSeleccionado.imagen) {
                return (
                  <>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      border: '2px dashed #ccc',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '15px',
                      color: '#666'
                    }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>📷</div>
                    </div>
                    <div style={{ color: '#666', fontSize: '11px', marginBottom: '5px' }}>
                      Sin imagen disponible
                    </div>
                  </>
                );
              }

              const imagenes = productoSeleccionado.imagen.split(',').filter(img => img.trim());

              return (
                <>
                  <div style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '15px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}>
                    <img
                      src={imagenes[imagenActual]}
                      alt={`${productoSeleccionado.nombre || 'Producto'} - Imagen ${imagenActual + 1}`}
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
                    <div style={{
                      width: '100%',
                      height: '100%',
                      border: '2px dashed #ccc',
                      borderRadius: '8px',
                      display: 'none',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>📷</div>
                      <div style={{ fontSize: '11px' }}>Error al cargar imagen</div>
                    </div>

                    {/* Controles del carrusel */}
                    {imagenes.length > 1 && (
                      <>
                        <button
                          onClick={() => setImagenActual(prev => prev === 0 ? imagenes.length - 1 : prev - 1)}
                          style={{
                            position: 'absolute',
                            left: '5px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '25px',
                            height: '25px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => setImagenActual(prev => prev === imagenes.length - 1 ? 0 : prev + 1)}
                          style={{
                            position: 'absolute',
                            right: '5px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '25px',
                            height: '25px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                        >
                          ›
                        </button>

                        {/* Indicadores */}
                        <div style={{
                          position: 'absolute',
                          bottom: '5px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          gap: '3px'
                        }}>
                          {imagenes.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setImagenActual(index)}
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                border: 'none',
                                backgroundColor: index === imagenActual ? '#007bff' : 'rgba(255,255,255,0.7)',
                                cursor: 'pointer'
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ color: '#666', fontSize: '11px', marginBottom: '5px' }}>
                    {imagenes.length > 1 ? `Imagen ${imagenActual + 1} de ${imagenes.length}` : 'Imagen del producto'}
                  </div>
                </>
              );
            })()}
            <div style={{ color: '#999', fontSize: '10px' }}>
              {productoSeleccionado ? productoSeleccionado.nombre || 'Sin nombre' : '750 x 750 píxeles'}
            </div>
          </div>

          {/* Detalles del producto */}
          <div>
            {productoSeleccionado && (
              <>
                <div style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  marginBottom: '15px',
                  fontSize: '11px',
                  color: '#856404'
                }}>
                  <strong>{productoSeleccionado.codigo || 'Sin código'}</strong>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '15px',
                  fontSize: '11px'
                }}>
                  <div>
                    <strong>Código:</strong> <span style={{ color: '#666' }}>{productoSeleccionado.codigo || 'Sin código'}</span>
                  </div>
                  <div>
                    <strong>Marca:</strong> <span style={{ color: '#666' }}>{productoSeleccionado.marca || 'Sin marca'}</span>
                  </div>
                  <div>
                    <strong>Modelo:</strong> <span style={{ color: '#666' }}>{productoSeleccionado.modelo || 'Sin modelo'}</span>
                  </div>
                  <div>
                    <strong>Categoría:</strong> <span style={{ color: '#666' }}>{productoSeleccionado.Categorium?.nombre || productoSeleccionado.categoria || 'Sin categoría'}</span>
                  </div>
                  <div>
                    <strong>Origen:</strong> <span style={{ color: '#666' }}>{productoSeleccionado.origen || 'Sin origen'}</span>
                  </div>
                  <div>
                    <strong>Referencia:</strong> <span style={{ color: '#666' }}>{productoSeleccionado.codigoprovedorOEM || productoSeleccionado.referencia || 'Sin referencia'}</span>
                  </div>
                  <div>
                    <strong>Stock:</strong> <span style={{ color: '#666' }}>{productoSeleccionado.stock || '0'}</span>
                  </div>
                  <div>
                    <strong>Precio de venta:</strong> <span style={{ color: '#666' }}>S/ {parseFloat(productoSeleccionado.precioVenta || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <div style={{ fontSize: '11px', marginBottom: '5px' }}>
                    <strong>Descripción:</strong>
                  </div>
                  <div style={{ color: '#666', fontSize: '11px' }}>
                    {productoSeleccionado.descripcion || productoSeleccionado.nombre || 'Sin descripción'}
                  </div>
                </div>

                {/* Botón para agregar a la venta */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <button
                    onClick={() => confirmarSeleccionProducto(productoSeleccionado)}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '10px 20px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                  >
                    Agregar a la venta
                  </button>
                </div>
              </>
            )}

            {!productoSeleccionado && (
              <div style={{
                textAlign: 'center',
                color: '#666',
                fontSize: '12px',
                padding: '40px 20px'
              }}>
                Selecciona un producto para ver sus detalles
              </div>
            )}
          </div>
        </div>

























































        {/* Sección de inventario  
        
         <div style={{
          display: 'grid',
          gridTemplateColumns: '200px 80px 100px 100px 100px',
          gap: '15px',
          alignItems: 'end',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '10px', fontWeight: 'bold' }}>
              Cantidad
            </label>
            <input 
              type="number"
              name="cantidad"
              value={inventario.cantidad}
              onChange={(e) => handleInputChange(e, 'inventario')}
              style={{
                width: '100%',
                padding: '5px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '10px',
                textAlign: 'center'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '10px', fontWeight: 'bold' }}>
              Precio de compra
            </label>
            <input 
              type="number"
              name="precioCompra"
              value={inventario.precioCompra}
              onChange={(e) => handleInputChange(e, 'inventario')}
              style={{
                width: '100%',
                padding: '5px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '10px',
                textAlign: 'right'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '10px', fontWeight: 'bold' }}>
              Precio Unitario
            </label>
            <input 
              type="number"
              name="precioUnitario"
              value={inventario.precioUnitario}
              onChange={(e) => handleInputChange(e, 'inventario')}
              style={{
                width: '100%',
                padding: '5px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '10px',
                textAlign: 'right'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '10px', fontWeight: 'bold' }}>
              Total
            </label>
            <input 
              type="number"
              name="total"
              value={inventario.total}
              onChange={(e) => handleInputChange(e, 'inventario')}
              style={{
                width: '100%',
                padding: '5px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '10px',
                textAlign: 'right'
              }}
            />
          </div>
        </div>
        
        */}







        {/* Lista de Precios */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
              Lista de Precios
            </div>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#666',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              cursor: 'help'
            }}>
              ?
            </div>
            <button
              onClick={() => abrirModalEditarPrecios()}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#007bff',
                fontSize: '11px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Editar
            </button>
          </div>

          {/* Tabla de precios */}
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '10px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Unidad</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Descripción</th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Factor</th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Precio 1</th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Precio 2</th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Precio 3</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Precio Defecto</th>
                  <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}></th>
                </tr>
              </thead>
              <tbody>
                {loadingPresentaciones ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      Cargando presentaciones...
                    </td>
                  </tr>
                ) : presentaciones.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      {productoSeleccionado ? 'No hay presentaciones configuradas para este producto' : 'Selecciona un producto para ver sus presentaciones'}
                    </td>
                  </tr>
                ) : (
                  presentaciones.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.unidad}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.descripcion}</td>
                      <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{item.factor}</td>
                      <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{item.precio1}</td>
                      <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{item.precio2}</td>
                      <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{item.precio3}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.precioDefecto}</td>
                      <td style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: item.precioDefecto === 'Precio por defecto' ? '#28a745' : '#6c757d',
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '10px',
                          cursor: 'pointer',
                          title: item.codigoBarras ? `Código de barras: ${item.codigoBarras}` : 'Sin código de barras'
                        }}>
                          {item.precioDefecto === 'Precio por defecto' ? '✓' : '○'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Productos relacionados - Solo mostrar si hay un producto seleccionado */}
        {productoSeleccionado && (
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#333'
            }}>
              Productos relacionados
            </div>
            {loadingRelacionados ? (
              <div style={{
                fontSize: '12px',
                color: '#666',
                padding: '10px',
                textAlign: 'center'
              }}>
                Cargando productos relacionados...
              </div>
            ) : productosRelacionados.length === 0 ? (
              <div style={{
                fontSize: '12px',
                color: '#666'
              }}>
                Sin productos relacionados
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '15px',
                marginTop: '10px'
              }}>
                {productosRelacionados.map((producto, index) => (
                  <div
                    key={producto.id || index}
                    onClick={() => seleccionarProducto(producto)}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '12px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '11px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      ':hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {/* Imagen del producto */}
                    <div style={{
                      width: '100%',
                      height: '120px',
                      marginBottom: '10px',
                      borderRadius: '6px',
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
                      {producto.categoria}
                    </div>
                    <div style={{
                      fontWeight: 'bold',
                      color: '#28a745',
                      fontSize: '12px'
                    }}>
                      S/ {producto.precio}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para editar lista de precios */}
      {modalEditarPrecios && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #eee',
              paddingBottom: '10px'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                Editar Lista de Precios - {productoSeleccionado?.nombre}
              </h3>

            </div>

            <div style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                onClick={agregarPresentacion}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                + Agregar Presentación
              </button>
            </div>

            <div style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '20px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '11px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Unidad</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Descripción</th>
                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Factor</th>
                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Precio 1</th>
                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Precio 2</th>
                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Precio 3</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Defecto</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {presentacionesEditables.map((presentacion, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        <input
                          type="text"
                          value={presentacion.unidad}
                          onChange={(e) => actualizarPresentacion(index, 'unidad', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                            fontSize: '11px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        <input
                          type="text"
                          value={presentacion.descripcion}
                          onChange={(e) => actualizarPresentacion(index, 'descripcion', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                            fontSize: '11px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        <input
                          type="number"
                          step="0.0001"
                          value={presentacion.factor}
                          onChange={(e) => actualizarPresentacion(index, 'factor', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                            fontSize: '11px',
                            textAlign: 'right'
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        <input
                          type="number"
                          step="0.0001"
                          value={presentacion.precio1}
                          onChange={(e) => actualizarPresentacion(index, 'precio1', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                            fontSize: '11px',
                            textAlign: 'right'
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        <input
                          type="number"
                          step="0.0001"
                          value={presentacion.precio2}
                          onChange={(e) => actualizarPresentacion(index, 'precio2', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                            fontSize: '11px',
                            textAlign: 'right'
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        <input
                          type="number"
                          step="0.0001"
                          value={presentacion.precio3}
                          onChange={(e) => actualizarPresentacion(index, 'precio3', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                            fontSize: '11px',
                            textAlign: 'right'
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        <select
                          value={presentacion.precioDefecto}
                          onChange={(e) => actualizarPresentacion(index, 'precioDefecto', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                            fontSize: '11px'
                          }}
                        >
                          <option value="Precio alternativo">Alternativo</option>
                          <option value="Precio por defecto">Por defecto</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                        <button
                          onClick={() => eliminarPresentacion(index)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '10px'
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={cerrarModalEditarPrecios}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={guardarPresentaciones}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para seleccionar productos relacionados */}
      {mostrarModalProductosRelacionados && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #eee',
              paddingBottom: '10px'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Seleccionar Productos Relacionadossss</h3>
              <button
                onClick={() => setMostrarModalProductosRelacionados(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            {/* Campo de búsqueda en el modal */}
            <div style={{
              marginBottom: '15px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busquedaModal}
                onChange={(e) => setBusquedaModal(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
              <button
                onClick={limpiarProductosRelacionados}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Limpiar Selección
              </button>
            </div>

            <div style={{
              marginBottom: '15px'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                Seleccionados: {productosSeleccionados.length} productos
              </p>
            </div>

            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Seleccionar</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Código</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Nombre</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Marca</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Filtrar productos según la búsqueda
                    const productosFiltrados = productos.filter(producto => {
                      if (!busquedaModal) return true;
                      const busqueda = busquedaModal.toLowerCase();
                      return (
                        producto.nombre?.toLowerCase().includes(busqueda) ||
                        producto.codigo?.toLowerCase().includes(busqueda) ||
                        producto.marca?.toLowerCase().includes(busqueda)
                      );
                    });

                    if (productosFiltrados.length === 0) {
                      return (
                        <tr>
                          <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                            {busquedaModal ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos disponibles'}
                          </td>
                        </tr>
                      );
                    }

                    return productosFiltrados.map((producto) => {
                      const isSelected = productosSeleccionados.find(p => p.id === producto.id);
                      return (
                        <tr
                          key={producto.id}
                          style={{
                            backgroundColor: isSelected ? '#e3f2fd' : 'white',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleProductoRelacionadoToggle(producto)}
                        >
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => handleProductoRelacionadoToggle(producto)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '8px', fontSize: '12px' }}>{producto.codigo}</td>
                          <td style={{ padding: '8px', fontSize: '12px' }}>{producto.nombre}</td>
                          <td style={{ padding: '8px', fontSize: '12px' }}>{producto.marca || 'Sin marca'}</td>
                          <td style={{ padding: '8px', fontSize: '12px' }}>S/ {parseFloat(producto.precioVenta || 0).toFixed(2)}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setMostrarModalProductosRelacionados(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarProductosRelacionados}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Confirmar Selección ({productosSeleccionados.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agregar Presentaciones */}
      <ModalAgregarPresentaciones
        isOpen={modalAgregarPresentacionesAbierto}
        onClose={() => setModalAgregarPresentacionesAbierto(false)}
        productoId={null} // Para productos nuevos no hay ID aún
        onPresentacionesChange={handlePresentacionesChange}
        precioVenta={nuevoProducto.precioVenta}
        presentacionesIniciales={presentacionesIntegradas}
      />

      {/* Modal de Ubicación del Producto */}
      <ModalUbicacionProducto
        isOpen={mostrarModalUbicacion}
        onClose={() => {
          setMostrarModalUbicacion(false);
          setProductoParaUbicacion(null);
        }}
        producto={productoParaUbicacion}
      />
    </div>
  );
}

export default ProductoDetalle;