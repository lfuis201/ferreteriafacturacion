import React, { useState, useEffect } from "react";
import {
  crearProducto,
  actualizarProducto,
} from "../../services/productoService";
import { obtenerCategorias } from "../../services/categoriaService";
import { obtenerSucursales } from "../../services/sucursalService";
import { obtenerPresentaciones } from "../../services/presentacionService";
import ModalAgregarPresentaciones from "./ModalAgregarPresentaciones";

import Swal from "sweetalert2";
import "../../styles/FormularioProducto.css";

function FormularioProducto({ producto, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
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
    estado: true,
  });
  
  // Estado para datos de presentación
  const [presentacionData, setPresentacionData] = useState({
    nombre: "Unidad",
    factor: "1",
    precio: "",
    unidadMedida: "NIU",
    codigoBarras: ""
  });
  const [imagenes, setImagenes] = useState({
    imagen1: null,
    imagen2: null,
    imagen3: null
  });
  const [previewImagenes, setPreviewImagenes] = useState({
    imagen1: null,
    imagen2: null,
    imagen3: null
  });
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Estados para modal de presentaciones
  const [modalAgregarPresentacionesAbierto, setModalAgregarPresentacionesAbierto] = useState(false);
  const [cantidadPresentaciones, setCantidadPresentaciones] = useState(0);
  
  // Estado para presentaciones (manejado por el modal)
  const [presentacionesIntegradas, setPresentacionesIntegradas] = useState([]);

  const esEdicion = Boolean(producto);

  useEffect(() => {
    cargarCategorias();
    cargarSucursales();
    if (producto) {
      setFormData({
        nombre: producto.nombre || "",
        codigo: producto.codigo || "",
        descripcion: producto.descripcion || "",
        precioCompra: producto.precioCompra || "",
        precioVenta: producto.precioVenta || "",
        productosRelacionados: producto.productosRelacionados || "",
        codigoTipoMoneda: producto.codigoTipoMoneda || "PEN",
        codigoTipoAfectacionIgvVenta: producto.codigoTipoAfectacionIgvVenta || "10",
        tieneIgv: producto.tieneIgv !== undefined ? producto.tieneIgv : true,
        codigoTipoAfectacionIgvCompra: producto.codigoTipoAfectacionIgvCompra || "10",
        stock: producto.stock || 0,
        stockMinimo: producto.stockMinimo || 0,
        unidadMedida: producto.unidadMedida || "NIU",
        codigoBarras: producto.codigoBarras || "",
        tipodeAfectacion: producto.tipodeAfectacion || "Gravado_Operación_Onerosa",
        modelo: producto.modelo || "",
        marca: producto.marca || "",
        origen: producto.origen || "",
        codigosunat: producto.codigosunat || "",
        codigoprovedorOEM: producto.codigoprovedorOEM || "",
        codigoCompetencia: producto.codigoCompetencia || "",
        rangoAnos: producto.rangoAnos ? producto.rangoAnos.split('T')[0] : "",
        observaciones: producto.observaciones || "",
        categoriaId: producto.categoriaId || "",
        sucursalId: producto.sucursalId || "",
        iscActivo: producto.iscActivo || false,
        tipoAplicacionISC: producto.tipoAplicacionISC || "",
        sujetoDetraccion: producto.sujetoDetraccion || false,
        estado: producto.estado !== undefined ? producto.estado : true,
      });
      if (producto.imagen) {
        const imagenesArray = producto.imagen.split(',');
        const nuevasPreviewImagenes = { imagen1: null, imagen2: null, imagen3: null };
        
        imagenesArray.forEach((img, index) => {
          if (index < 3) {
            const key = `imagen${index + 1}`;
            nuevasPreviewImagenes[key] = img;
          }
        });
        
        setPreviewImagenes(nuevasPreviewImagenes);
      }
      // Cargar cantidad de presentaciones si es edición
      cargarCantidadPresentaciones();
    } else {
      // Si es un producto nuevo, inicializar contador de presentaciones
      setCantidadPresentaciones(0);
    }
  }, [producto]);

  const cargarCategorias = async () => {
    try {
      const categoriasData = await obtenerCategorias();
      setCategorias(categoriasData);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las categorías",
      });
    }
  };

  const cargarSucursales = async () => {
    try {
      const sucursalesData = await obtenerSucursales();
      setSucursales(sucursalesData.sucursales || []);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las sucursales",
      });
    }
  };

  // Función para cargar cantidad de presentaciones
  const cargarCantidadPresentaciones = async () => {
    if (producto && producto.id) {
      try {
        const data = await obtenerPresentaciones(producto.id);
        setCantidadPresentaciones(data.length || 0);
      } catch (error) {
        console.error('Error al cargar presentaciones:', error);
        setCantidadPresentaciones(0);
      }
    }
  };

  // useEffect para sincronizar precio de venta con presentaciones
  useEffect(() => {
    if (formData.precioVenta && presentacionesIntegradas.length > 0) {
      setPresentacionesIntegradas(prev => prev.map(p => ({
        ...p,
        precio1: formData.precioVenta
      })));
      console.log('💰 Precio de venta sincronizado con presentaciones:', formData.precioVenta);
    }
  }, [formData.precioVenta]);

  // Función para manejar cambios en las presentaciones
  const handlePresentacionesChange = (presentacionesActualizadas) => {
    if (producto?.id) {
      // Modo edición: recargar cantidad de presentaciones
      cargarCantidadPresentaciones();
    } else {
      // Modo creación: actualizar cantidad de presentaciones y guardar en estado
      if (presentacionesActualizadas) {
        setCantidadPresentaciones(presentacionesActualizadas.length);
        setPresentacionesIntegradas(presentacionesActualizadas);
        console.log('📦 Presentaciones guardadas para creación:', presentacionesActualizadas);
      }
    }
  };

  // Función para abrir el modal de agregar presentaciones
  const abrirModalAgregarPresentaciones = () => {
    console.log('🔧 FormularioProducto - Abriendo modal con producto:', producto);
    console.log('🔧 FormularioProducto - productoId que se pasará:', producto?.id);
    
    setModalAgregarPresentacionesAbierto(true);
  };

  // Función para manejar las presentaciones agregadas
  const handleAgregarPresentaciones = (presentaciones) => {
    console.log('Presentaciones agregadas:', presentaciones);
    // Aquí puedes manejar las presentaciones como necesites
    // Por ejemplo, guardarlas en el estado o enviarlas al backend
  };



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Si se cambia el precio de venta, actualizar también el precio de la presentación
    if (name === 'precioVenta') {
      setPresentacionData(prev => ({
        ...prev,
        precio: value
      }));
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Función para manejar cambios en los campos de presentación
  const handlePresentacionInputChange = (e) => {
    const { name, value } = e.target;
    setPresentacionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagenChange = (e, imagenKey) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor selecciona un archivo de imagen válido'
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La imagen no debe superar los 5MB'
        });
        return;
      }

      setImagenes(prev => ({ ...prev, [imagenKey]: file }));
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImagenes(prev => ({ ...prev, [imagenKey]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImagen = (imagenKey) => {
    setImagenes(prev => ({ ...prev, [imagenKey]: null }));
    setPreviewImagenes(prev => ({ ...prev, [imagenKey]: null }));
  };

  const validarFormulario = () => {
    const nuevosErrors = {};

    // Campos requeridos según el modelo del backend
    if (!formData.nombre.trim()) {
      nuevosErrors.nombre = "El nombre es requerido";
    }

    if (!formData.codigo.trim()) {
      nuevosErrors.codigo = "El código es requerido";
    }

    if (!formData.precioCompra || parseFloat(formData.precioCompra) <= 0) {
      nuevosErrors.precioCompra = "El precio de compra debe ser mayor a 0";
    }

    if (!formData.precioVenta || parseFloat(formData.precioVenta) <= 0) {
      nuevosErrors.precioVenta = "El precio de venta debe ser mayor a 0";
    }

    if (!formData.unidadMedida) {
      nuevosErrors.unidadMedida = "Debe seleccionar una unidad de medida";
    }

    // La categoría ahora es opcional
    // if (!formData.categoriaId) {
    //   nuevosErrors.categoriaId = "Debe seleccionar una categoría";
    // }

    // La sucursal ahora es opcional
    // if (!formData.sucursalId) {
    //   nuevosErrors.sucursalId = "Debe seleccionar una sucursal";
    // }

    // Validar que si ISC está activo, se proporcione el tipo de aplicación
    if (formData.iscActivo && !formData.tipoAplicacionISC) {
      nuevosErrors.tipoAplicacionISC = "Debe especificar el tipo de aplicación ISC";
    }

    // Validar formato de fecha si se proporciona
     if (formData.rangoAnos && !/^\d{4}-\d{4}$/.test(formData.rangoAnos)) {
      nuevosErrors.rangoAnos = "El formato debe ser YYYY-YYYY";
    }

    // Para productos nuevos, las presentaciones se validan en el modal

    setErrors(nuevosErrors);
    return Object.keys(nuevosErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Agregar campos requeridos del producto
      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("codigo", formData.codigo);
      formDataToSend.append("precioCompra", formData.precioCompra);
      formDataToSend.append("precioVenta", formData.precioVenta);
      formDataToSend.append("unidadMedida", formData.unidadMedida);
      
      // Agregar campos de stock
      formDataToSend.append("stock", formData.stock || "0");
      formDataToSend.append("stockMinimo", formData.stockMinimo || "0");
      
      // Agregar categoriaId solo si tiene valor
      if (formData.categoriaId) {
        formDataToSend.append("categoriaId", formData.categoriaId);
      }
      
      // Agregar sucursalId solo si tiene valor
      if (formData.sucursalId) {
        formDataToSend.append("sucursalId", formData.sucursalId);
      }
      

      
      // Agregar campos opcionales solo si tienen valor
      if (formData.descripcion) {
        formDataToSend.append("descripcion", formData.descripcion);
      }
      if (formData.codigoBarras) {
        formDataToSend.append("codigoBarras", formData.codigoBarras);
      }
      if (formData.tipodeAfectacion) {
        formDataToSend.append("tipodeAfectacion", formData.tipodeAfectacion);
      }
      if (formData.modelo) {
        formDataToSend.append("modelo", formData.modelo);
      }
      if (formData.marca) {
        formDataToSend.append("marca", formData.marca);
      }
      if (formData.origen) {
        formDataToSend.append("origen", formData.origen);
      }
      if (formData.codigosunat) {
        formDataToSend.append("codigosunat", formData.codigosunat);
      }
      if (formData.codigoprovedorOEM) {
        formDataToSend.append("codigoprovedorOEM", formData.codigoprovedorOEM);
      }
      if (formData.codigoCompetencia) {
        formDataToSend.append("codigoCompetencia", formData.codigoCompetencia);
      }
      if (formData.rangoAnos) {
        formDataToSend.append("rangoAnos", formData.rangoAnos);
      }
      if (formData.observaciones) {
        formDataToSend.append("observaciones", formData.observaciones);
      }
      
      // Campos booleanos - enviar siempre (requeridos por el modelo)
      formDataToSend.append("iscActivo", formData.iscActivo ? "true" : "false");
      formDataToSend.append("sujetoDetraccion", formData.sujetoDetraccion ? "true" : "false");
      
      // Solo enviar tipoAplicacionISC si iscActivo es true y tiene valor
      if (formData.iscActivo && formData.tipoAplicacionISC) {
        formDataToSend.append("tipoAplicacionISC", formData.tipoAplicacionISC);
      }
      
      // NO enviar el campo 'estado' - se maneja automáticamente en el backend

      // Agregar imágenes si existen
      if (imagenes.imagen1) {
        formDataToSend.append("imagen1", imagenes.imagen1);
      }
      if (imagenes.imagen2) {
        formDataToSend.append("imagen2", imagenes.imagen2);
      }
      if (imagenes.imagen3) {
        formDataToSend.append("imagen3", imagenes.imagen3);
      }

      // Agregar presentaciones si existen (tanto en creación como en edición)
      if (presentacionesIntegradas && presentacionesIntegradas.length > 0) {
        console.log('📦 Enviando presentaciones configuradas:', presentacionesIntegradas);
        
        const presentacionesParaEnviar = presentacionesIntegradas.map(presentacion => ({
          descripcion: presentacion.descripcion || 'Presentación',
          factor: parseFloat(presentacion.factor) || 1,
          precio: parseFloat(presentacion.precio1) || 0,
          precio1: parseFloat(presentacion.precio1) || 0,
          precio2: parseFloat(presentacion.precio2) || 0,
          precio3: parseFloat(presentacion.precio3) || 0,
          unidadMedida: presentacion.unidad || presentacion.unidadMedida || 'NIU',
          codigoBarras: presentacion.codigoBarras || '',
          esDefecto: presentacion.esDefecto || false
        }));
        
        formDataToSend.append('presentaciones', JSON.stringify(presentacionesParaEnviar));
      }

      let resultado;
      if (esEdicion) {
        resultado = await actualizarProducto(producto.id, formDataToSend);
        Swal.fire({
          icon: "success",
          title: "Producto actualizado",
          text: "El producto ha sido actualizado correctamente",
        });
      } else {
        resultado = await crearProducto(formDataToSend);
        
        const cantidadPresentacionesCreadas = presentacionesIntegradas?.length || 1;
        Swal.fire({
          icon: "success",
          title: "¡Producto creado exitosamente!",
          text: `Producto "${formData.nombre}" creado correctamente con ${cantidadPresentacionesCreadas} presentación${cantidadPresentacionesCreadas > 1 ? 'es' : ''}.`,
          timer: 2000,
          showConfirmButton: false
        });
      }

      onGuardar(resultado);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-producto-container">
      {/* Header del formulario */}
      <div className="form-header">
        <div className="header-content">
          <h1 className="form-title">
            {esEdicion ? "Editar Producto" : "Nuevo Producto"}
          </h1>
          <button 
            className="btn-close-form" 
            onClick={onCancelar}
            type="button"
          >
            ✕ Cerrar
          </button>
        </div>
      </div>

      {/* Contenido del formulario */}
      <div className="form-wrapper">
        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-grid">
            {/* Información básica */}
            <div className="form-section">
              <h3>📋 Información Básica</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre del Producto *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={errors.nombre ? "error" : ""}
                    placeholder="Nombre del producto"
                  />
                  {errors.nombre && (
                    <span className="error-message">{errors.nombre}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="codigo">Código del Producto *</label>
                  <input
                    type="text"
                    id="codigo"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    className={errors.codigo ? "error" : ""}
                    placeholder="Código único del producto"
                  />
                  {errors.codigo && (
                    <span className="error-message">{errors.codigo}</span>
                  )}
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Descripción detallada del producto"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoriaId">Categoría *</label>
                  <select
                    id="categoriaId"
                    name="categoriaId"
                    value={formData.categoriaId}
                    onChange={handleInputChange}
                    className={errors.categoriaId ? "error" : ""}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.categoriaId && (
                    <span className="error-message">{errors.categoriaId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="sucursalId">Almacen *</label>
                  <select
                    id="sucursalId"
                    name="sucursalId"
                    value={formData.sucursalId}
                    onChange={handleInputChange}
                    className={errors.sucursalId ? "error" : ""}
                  >
                    <option value="">Seleccionar Almacen</option>
                    {sucursales.map((sucursal) => (
                      <option key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.sucursalId && (
                    <span className="error-message">{errors.sucursalId}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="unidadMedida">Unidad de Medida *</label>
                  <select
                    id="unidadMedida"
                    name="unidadMedida"
                    value={formData.unidadMedida}
                    onChange={handleInputChange}
                    className={errors.unidadMedida ? "error" : ""}
                  >
                    <option value="NIU">Unidad</option>
                    <option value="KGM">Kilogramo</option>
                    <option value="MTR">Metro</option>
                    <option value="LTR">Litro</option>
                    <option value="CJA">Caja</option>
                    <option value="PQT">Paquete</option>
                  </select>
                  {errors.unidadMedida && (
                    <span className="error-message">{errors.unidadMedida}</span>
                  )}
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
                    value={formData.precioCompra}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={errors.precioCompra ? "error" : ""}
                    placeholder="0.00"
                  />
                  {errors.precioCompra && (
                    <span className="error-message">{errors.precioCompra}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="precioVenta">Precio de Venta (S/.) *</label>
                  <input
                    type="number"
                    id="precioVenta"
                    name="precioVenta"
                    value={formData.precioVenta}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={errors.precioVenta ? "error" : ""}
                    placeholder="0.00"
                  />
                  {errors.precioVenta && (
                    <span className="error-message">{errors.precioVenta}</span>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="stock">Stock Actual</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
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
                    value={formData.stockMinimo}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="form-section">
              <h3>📋 Información Adicional</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="productosRelacionados">Productos Relacionados</label>
                  <input
                    type="text"
                    id="productosRelacionados"
                    name="productosRelacionados"
                    value={formData.productosRelacionados}
                    onChange={handleInputChange}
                    placeholder="Códigos de productos relacionados separados por comas"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="codigoTipoMoneda">Código Tipo de Moneda</label>
                  <select
                    id="codigoTipoMoneda"
                    name="codigoTipoMoneda"
                    value={formData.codigoTipoMoneda}
                    onChange={handleInputChange}
                  >
                    <option value="PEN">PEN - Soles</option>
                    <option value="USD">USD - Dólares</option>
                    <option value="EUR">EUR - Euros</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="codigoTipoAfectacionIgvVenta">Código Tipo Afectación IGV Venta</label>
                  <select
                    id="codigoTipoAfectacionIgvVenta"
                    name="codigoTipoAfectacionIgvVenta"
                    value={formData.codigoTipoAfectacionIgvVenta}
                    onChange={handleInputChange}
                  >
                    <option value="10">10 - Gravado - Operación Onerosa</option>
                    <option value="20">20 - Exonerado - Operación Onerosa</option>
                    <option value="30">30 - Inafecto - Operación Onerosa</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="tieneIgv">Tiene IGV</label>
                  <select
                    id="tieneIgv"
                    name="tieneIgv"
                    value={formData.tieneIgv}
                    onChange={handleInputChange}
                  >
                    <option value={true}>Sí</option>
                    <option value={false}>No</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="codigoTipoAfectacionIgvCompra">Código Tipo Afectación IGV Compra</label>
                  <select
                    id="codigoTipoAfectacionIgvCompra"
                    name="codigoTipoAfectacionIgvCompra"
                    value={formData.codigoTipoAfectacionIgvCompra}
                    onChange={handleInputChange}
                  >
                    <option value="10">10 - Gravado - Operación Onerosa</option>
                    <option value="20">20 - Exonerado - Operación Onerosa</option>
                    <option value="30">30 - Inafecto - Operación Onerosa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Presentaciones */}
            <div className="form-section">
              <h3>📦 Presentaciones del Producto</h3>
              
              {esEdicion ? (
                <>
                  <div className="presentaciones-info">
                    {cantidadPresentaciones > 0 ? (
                      <p className="presentaciones-count">
                        Este producto tiene <strong>{cantidadPresentaciones}</strong> presentación{cantidadPresentaciones !== 1 ? 'es' : ''} configurada{cantidadPresentaciones !== 1 ? 's' : ''}.
                      </p>
                    ) : (
                      <p className="no-presentaciones">
                        presentaciones configuradas.
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
                </>
              ) : (
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
                  
                  {errors.presentaciones && (
                    <div className="error-message">
                      {errors.presentaciones}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="form-section">
              <h3>ℹ️ Información Adicional</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="codigoBarras">Código de Barras</label>
                  <input
                    type="text"
                    id="codigoBarras"
                    name="codigoBarras"
                    value={formData.codigoBarras}
                    onChange={handleInputChange}
                    placeholder="Código de barras"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modelo">Modelo</label>
                  <input
                    type="text"
                    id="modelo"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleInputChange}
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
                    value={formData.marca}
                    onChange={handleInputChange}
                    placeholder="Marca del producto"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="origen">Origen</label>
                  <input
                    type="text"
                    id="origen"
                    name="origen"
                    value={formData.origen}
                    onChange={handleInputChange}
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
                    value={formData.codigosunat}
                    onChange={handleInputChange}
                    placeholder="Código SUNAT"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="codigoprovedorOEM">Código Proveedor OEM</label>
                  <input
                    type="text"
                    id="codigoprovedorOEM"
                    name="codigoprovedorOEM"
                    value={formData.codigoprovedorOEM}
                    onChange={handleInputChange}
                    placeholder="Código del proveedor OEM"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="codigoCompetencia">Código Competencia</label>
                  <input
                    type="text"
                    id="codigoCompetencia"
                    name="codigoCompetencia"
                    value={formData.codigoCompetencia}
                    onChange={handleInputChange}
                    placeholder="Código de competencia"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rangoAnos">Rango de Años</label>
                  <input
                    type="text"
                    id="rangoAnos"
                    name="rangoAnos"
                    value={formData.rangoAnos}
                    onChange={handleInputChange}
                    placeholder="Ej: 2020-2025"
                    className={errors.rangoAnos ? "error" : ""}
                  />
                  {errors.rangoAnos && (
                    <span className="error-message">{errors.rangoAnos}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Configuración fiscal */}
            <div className="form-section">
              <h3>📊 Configuración Fiscal</h3>
              
              <div className="form-group">
                <label htmlFor="tipodeAfectacion">Tipo de Afectación</label>
                <select
                  id="tipodeAfectacion"
                  name="tipodeAfectacion"
                  value={formData.tipodeAfectacion}
                  onChange={handleInputChange}
                >
                  <option value="Gravado_Operación_Onerosa">Gravado - Operación Onerosa</option>
                  <option value="Gravado_Retiro_por_premio">Gravado - Retiro por Premio</option>
                  <option value="Gravado_Retiro_por_donación">Gravado - Retiro por Donación</option>
                  <option value="Gravado_Retiro">Gravado - Retiro</option>
                  <option value="Gravado_Retiro_por_publicidad">Gravado - Retiro por Publicidad</option>
                  <option value="Gravado_Bonificaciones">Gravado - Bonificaciones</option>
                  <option value="Gravado_Retiro_por_entrega_a_trabajadores">Gravado - Retiro por Entrega a Trabajadores</option>
                  <option value="Exonerado_Operación_Onerosa">Exonerado - Operación Onerosa</option>
                  <option value="Exonerado_Retiro">Exonerado - Retiro</option>
                  <option value="Inafecto_Operación_Onerosa">Inafecto - Operación Onerosa</option>
                  <option value="Inafecto_Retiro_por_Bonificación">Inafecto - Retiro por Bonificación</option>
                  <option value="Inafecto_Retiro">Inafecto - Retiro</option>
                  <option value="Exonerado_Transferencia_Gratuita">Exonerado - Transferencia Gratuita</option>
                </select>
              </div>

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="iscActivo"
                    checked={formData.iscActivo}
                    onChange={handleInputChange}
                  />
                  ISC Activo
                </label>
              </div>

              {formData.iscActivo && (
                <div className="form-group">
                  <label htmlFor="tipoAplicacionISC">Tipo de Aplicación ISC *</label>
                  <select
                    id="tipoAplicacionISC"
                    name="tipoAplicacionISC"
                    value={formData.tipoAplicacionISC}
                    onChange={handleInputChange}
                    className={errors.tipoAplicacionISC ? "error" : ""}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Aplicación del Monto Fijo">Aplicación del Monto Fijo</option>
                    <option value="Sistema al valor">Sistema al valor</option>
                    <option value="Sistema de Precios de Venta al Público">Sistema de Precios de Venta al Público</option>
                  </select>
                  {errors.tipoAplicacionISC && (
                    <span className="error-message">{errors.tipoAplicacionISC}</span>
                  )}
                </div>
              )}

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="sujetoDetraccion"
                    checked={formData.sujetoDetraccion}
                    onChange={handleInputChange}
                  />
                  Sujeto a Detracción
                </label>
              </div>
            </div>

            {/* Observaciones */}
            <div className="form-section">
              <h3>📝 Observaciones</h3>
              
              <div className="form-group full-width">
                <label htmlFor="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Observaciones adicionales"
                />
              </div>
            </div>

            {/* Imágenes */}
            <div className="form-section">
              <h3>🖼️ Imágenes del Producto</h3>
              
              <div className="image-upload-grid">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="image-upload-item">
                    <div className="image-upload-box">
                      {previewImagenes[`imagen${num}`] ? (
                        <div className="image-preview">
                          <img 
                            src={previewImagenes[`imagen${num}`]} 
                            alt={`Preview ${num}`}
                          />
                          <button 
                            type="button"
                            className="remove-image"
                            onClick={() => removeImagen(`imagen${num}`)}
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
                            onChange={(e) => handleImagenChange(e, `imagen${num}`)}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="upload-note">Se recomienda resoluciones Full HD 1024x720. Máximo 5MB por imagen.</p>
            </div>


          </div>

          {/* Botones de acción fijos */}
          <div>
            <div className="actions-container">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancelar}
                disabled={loading}
              >
                ← Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    {esEdicion ? "Actualizando..." : "Creando producto..."}
                  </>
                ) : (
                  <>
                    {esEdicion ? "✓ Actualizar Producto" : "✓ Crear Producto"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Modal de Agregar Presentaciones */}
      <ModalAgregarPresentaciones
        isOpen={modalAgregarPresentacionesAbierto}
        onClose={() => setModalAgregarPresentacionesAbierto(false)}
        productoId={producto?.id}
        onPresentacionesChange={handlePresentacionesChange}
        precioVenta={formData.precioVenta}
        presentacionesIniciales={presentacionesIntegradas}
      />
    </div>
  );
}

export default FormularioProducto;