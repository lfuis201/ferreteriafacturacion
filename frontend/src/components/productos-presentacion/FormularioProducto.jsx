import React, { useState, useEffect } from "react";
import {
  crearProducto,
  actualizarProducto,
} from "../../services/productoService";
import { obtenerCategorias } from "../../services/categoriaService";
import { obtenerSucursales } from "../../services/sucursalService";
import { obtenerPresentaciones } from "../../services/presentacionService";
import ModalAgregarPresentaciones from "./ModalAgregarPresentaciones";
import { obtenerValorConfiguracion } from "../../services/configuracionService";
import { ClipboardList, DollarSign, Package, Info, Tags, BarChart3, FileText, Image as ImageIcon, X, Check } from "lucide-react";
import Swal from "sweetalert2";

const inputBase =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-menta-turquesa focus:outline-none focus:ring-2 focus:ring-menta-turquesa";
const inputError = "border-red-500 focus:border-red-500 focus:ring-red-500/30";

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
    codigoBarras: "",
  });
  const [imagenes, setImagenes] = useState({
    imagen1: null,
    imagen2: null,
    imagen3: null,
  });
  const [previewImagenes, setPreviewImagenes] = useState({
    imagen1: null,
    imagen2: null,
    imagen3: null,
  });
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [tallerMecanicoHabilitado, setTallerMecanicoHabilitado] =
    useState(false);
  const [farmaciaElementosHabilitado, setFarmaciaElementosHabilitado] =
    useState(false);

  // Estados para modal de presentaciones
  const [
    modalAgregarPresentacionesAbierto,
    setModalAgregarPresentacionesAbierto,
  ] = useState(false);
  const [cantidadPresentaciones, setCantidadPresentaciones] = useState(0);

  // Estado para presentaciones (manejado por el modal)
  const [presentacionesIntegradas, setPresentacionesIntegradas] = useState([]);

  const esEdicion = Boolean(producto);

  useEffect(() => {
    cargarCategorias();
    cargarSucursales();
    // Cargar configuración para mostrar/ocultar sección Códigos
    (async () => {
      try {
        const habilitado = await obtenerValorConfiguracion(
          "TALLER_MECANICO_HABILITADO",
          false
        );
        setTallerMecanicoHabilitado(!!habilitado);
      } catch (e) {
        setTallerMecanicoHabilitado(false);
      }
    })();
    (async () => {
      try {
        const habilitadoFarmacia = await obtenerValorConfiguracion(
          "FARMACIA_ELEMENTOS_HABILITADO",
          false
        );
        setFarmaciaElementosHabilitado(!!habilitadoFarmacia);
      } catch (e) {
        setFarmaciaElementosHabilitado(false);
      }
    })();

    if (producto) {
      setFormData({
        nombre: producto.nombre || "",
        codigo: producto.codigo || "",
        descripcion: producto.descripcion || "",
        precioCompra: producto.precioCompra || "",
        precioVenta: producto.precioVenta || "",
        productosRelacionados: producto.productosRelacionados || "",
        codigoTipoMoneda: producto.codigoTipoMoneda || "PEN",
        codigoTipoAfectacionIgvVenta:
          producto.codigoTipoAfectacionIgvVenta || "10",
        tieneIgv: producto.tieneIgv !== undefined ? producto.tieneIgv : true,
        codigoTipoAfectacionIgvCompra:
          producto.codigoTipoAfectacionIgvCompra || "10",
        stock: producto.stock || 0,
        stockMinimo: producto.stockMinimo || 0,
        unidadMedida: producto.unidadMedida || "NIU",
        codigoBarras: producto.codigoBarras || "",
        tipodeAfectacion:
          producto.tipodeAfectacion || "Gravado_Operación_Onerosa",
        modelo: producto.modelo || "",
        marca: producto.marca || "",
        origen: producto.origen || "",
        codigosunat: producto.codigosunat || "",
        codigoprovedorOEM: producto.codigoprovedorOEM || "",
        codigoCompetencia: producto.codigoCompetencia || "",
        rangoAnos: producto.rangoAnos ? producto.rangoAnos.split("T")[0] : "",
        observaciones: producto.observaciones || "",
        categoriaId: producto.categoriaId || "",
        sucursalId: producto.sucursalId || "",
        iscActivo: producto.iscActivo || false,
        tipoAplicacionISC: producto.tipoAplicacionISC || "",
        sujetoDetraccion: producto.sujetoDetraccion || false,
        estado: producto.estado !== undefined ? producto.estado : true,
      });
      if (producto.imagen) {
        const imagenesArray = producto.imagen.split(",");
        const nuevasPreviewImagenes = {
          imagen1: null,
          imagen2: null,
          imagen3: null,
        };

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
        console.error("Error al cargar presentaciones:", error);
        setCantidadPresentaciones(0);
      }
    }
  };

  // useEffect para sincronizar precio de venta con presentaciones
  useEffect(() => {
    if (formData.precioVenta && presentacionesIntegradas.length > 0) {
      setPresentacionesIntegradas((prev) =>
        prev.map((p) => ({
          ...p,
          precio1: formData.precioVenta,
        }))
      );
      console.log(
        "💰 Precio de venta sincronizado con presentaciones:",
        formData.precioVenta
      );
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
        console.log(
          "📦 Presentaciones guardadas para creación:",
          presentacionesActualizadas
        );
      }
    }
  };

  // Función para abrir el modal de agregar presentaciones
  const abrirModalAgregarPresentaciones = () => {
    console.log(
      "🔧 FormularioProducto - Abriendo modal con producto:",
      producto
    );
    console.log(
      "🔧 FormularioProducto - productoId que se pasará:",
      producto?.id
    );

    setModalAgregarPresentacionesAbierto(true);
  };

  // Función para manejar las presentaciones agregadas
  const handleAgregarPresentaciones = (presentaciones) => {
    console.log("Presentaciones agregadas:", presentaciones);
    // Aquí puedes manejar las presentaciones como necesites
    // Por ejemplo, guardarlas en el estado o enviarlas al backend
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Si se cambia el precio de venta, actualizar también el precio de la presentación
    if (name === "precioVenta") {
      setPresentacionData((prev) => ({
        ...prev,
        precio: value,
      }));
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Función para manejar cambios en los campos de presentación
  const handlePresentacionInputChange = (e) => {
    const { name, value } = e.target;
    setPresentacionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagenChange = (e, imagenKey) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor selecciona un archivo de imagen válido",
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "La imagen no debe superar los 5MB",
        });
        return;
      }

      setImagenes((prev) => ({ ...prev, [imagenKey]: file }));

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImagenes((prev) => ({
          ...prev,
          [imagenKey]: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImagen = (imagenKey) => {
    setImagenes((prev) => ({ ...prev, [imagenKey]: null }));
    setPreviewImagenes((prev) => ({ ...prev, [imagenKey]: null }));
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
      nuevosErrors.tipoAplicacionISC =
        "Debe especificar el tipo de aplicación ISC";
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
      formDataToSend.append(
        "sujetoDetraccion",
        formData.sujetoDetraccion ? "true" : "false"
      );

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
        console.log(
          "📦 Enviando presentaciones configuradas:",
          presentacionesIntegradas
        );

        const presentacionesParaEnviar = presentacionesIntegradas.map(
          (presentacion) => ({
            descripcion: presentacion.descripcion || "Presentación",
            factor: parseFloat(presentacion.factor) || 1,
            precio: parseFloat(presentacion.precio1) || 0,
            precio1: parseFloat(presentacion.precio1) || 0,
            precio2: parseFloat(presentacion.precio2) || 0,
            precio3: parseFloat(presentacion.precio3) || 0,
            unidadMedida:
              presentacion.unidad || presentacion.unidadMedida || "NIU",
            codigoBarras: presentacion.codigoBarras || "",
            esDefecto: presentacion.esDefecto || false,
          })
        );

        formDataToSend.append(
          "presentaciones",
          JSON.stringify(presentacionesParaEnviar)
        );
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

        const cantidadPresentacionesCreadas =
          presentacionesIntegradas?.length || 1;
        Swal.fire({
          icon: "success",
          title: "¡Producto creado exitosamente!",
          text: `Producto "${
            formData.nombre
          }" creado correctamente con ${cantidadPresentacionesCreadas} presentación${
            cantidadPresentacionesCreadas > 1 ? "es" : ""
          }.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }

      if (typeof onGuardar === "function") {
        onGuardar(resultado);
      }
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <h1 className="text-xl font-semibold text-fondo">
          {esEdicion ? "Editar Producto" : "Nuevo Producto"}
        </h1>
        <button
          type="button"
          onClick={onCancelar}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-menta-petroleo transition hover:bg-slate-50"
        >
          <X size={18} /> Cerrar
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-8">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-fondo">
                <ClipboardList size={20} className="text-menta-petroleo" />
                Información Básica
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-menta-petroleo">Nombre del Producto *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`${inputBase} ${errors.nombre ? inputError : ""}`}
                    placeholder="Nombre del producto"
                  />
                  {errors.nombre && <span className="mt-1 block text-xs text-red-600">{errors.nombre}</span>}
                </div>
                <div>
                  <label htmlFor="codigo" className="mb-1 block text-sm font-medium text-menta-petroleo">Código del Producto *</label>
                  <input
                    type="text"
                    id="codigo"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    className={`${inputBase} ${errors.codigo ? inputError : ""}`}
                    placeholder="Código único del producto"
                  />
                  {errors.codigo && <span className="mt-1 block text-xs text-red-600">{errors.codigo}</span>}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="descripcion" className="mb-1 block text-sm font-medium text-menta-petroleo">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className={inputBase}
                  placeholder="Descripción detallada del producto"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="categoriaId" className="mb-1 block text-sm font-medium text-menta-petroleo">Categoría *</label>
                  <select
                    id="categoriaId"
                    name="categoriaId"
                    value={formData.categoriaId}
                    onChange={handleInputChange}
                    className={`${inputBase} ${errors.categoriaId ? inputError : ""}`}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                    ))}
                  </select>
                  {errors.categoriaId && <span className="mt-1 block text-xs text-red-600">{errors.categoriaId}</span>}
                </div>
                <div>
                  <label htmlFor="sucursalId" className="mb-1 block text-sm font-medium text-menta-petroleo">Almacen *</label>
                  <select
                    id="sucursalId"
                    name="sucursalId"
                    value={formData.sucursalId}
                    onChange={handleInputChange}
                    className={`${inputBase} ${errors.sucursalId ? inputError : ""}`}
                  >
                    <option value="">Seleccionar Almacen</option>
                    {sucursales.map((sucursal) => (
                      <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
                    ))}
                  </select>
                  {errors.sucursalId && <span className="mt-1 block text-xs text-red-600">{errors.sucursalId}</span>}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="unidadMedida" className="mb-1 block text-sm font-medium text-menta-petroleo">Unidad de Medida *</label>
                <select
                  id="unidadMedida"
                  name="unidadMedida"
                  value={formData.unidadMedida}
                  onChange={handleInputChange}
                  className={`${inputBase} max-w-xs ${errors.unidadMedida ? inputError : ""}`}
                >
                  <option value="NIU">Unidad</option>
                  <option value="KGM">Kilogramo</option>
                  <option value="MTR">Metro</option>
                  <option value="LTR">Litro</option>
                  <option value="CJA">Caja</option>
                  <option value="PQT">Paquete</option>
                </select>
                {errors.unidadMedida && <span className="mt-1 block text-xs text-red-600">{errors.unidadMedida}</span>}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-fondo">
                <DollarSign size={20} className="text-menta-petroleo" />
                Precios
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="precioCompra" className="mb-1 block text-sm font-medium text-menta-petroleo">Precio de Compra (S/.) *</label>
                  <input
                    type="number"
                    id="precioCompra"
                    name="precioCompra"
                    value={formData.precioCompra}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`${inputBase} ${errors.precioCompra ? inputError : ""}`}
                    placeholder="0.00"
                  />
                  {errors.precioCompra && <span className="mt-1 block text-xs text-red-600">{errors.precioCompra}</span>}
                </div>
                <div>
                  <label htmlFor="precioVenta" className="mb-1 block text-sm font-medium text-menta-petroleo">Precio de Venta (S/.) *</label>
                  <input
                    type="number"
                    id="precioVenta"
                    name="precioVenta"
                    value={formData.precioVenta}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`${inputBase} ${errors.precioVenta ? inputError : ""}`}
                    placeholder="0.00"
                  />
                  {errors.precioVenta && <span className="mt-1 block text-xs text-red-600">{errors.precioVenta}</span>}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="stock" className="mb-1 block text-sm font-medium text-menta-petroleo">Stock Actual</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className={inputBase}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="stockMinimo" className="mb-1 block text-sm font-medium text-menta-petroleo">Stock Mínimo</label>
                  <input
                    type="number"
                    id="stockMinimo"
                    name="stockMinimo"
                    value={formData.stockMinimo}
                    onChange={handleInputChange}
                    min="0"
                    className={inputBase}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-fondo">
                <Info size={20} className="text-menta-petroleo" />
                Información Adicional
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="productosRelacionados" className="mb-1 block text-sm font-medium text-menta-petroleo">Productos Relacionados</label>
                  <input
                    type="text"
                    id="productosRelacionados"
                    name="productosRelacionados"
                    value={formData.productosRelacionados}
                    onChange={handleInputChange}
                    className={inputBase}
                    placeholder="Códigos separados por comas"
                  />
                </div>
                <div>
                  <label htmlFor="codigoTipoMoneda" className="mb-1 block text-sm font-medium text-menta-petroleo">Código Tipo de Moneda</label>
                  <select id="codigoTipoMoneda" name="codigoTipoMoneda" value={formData.codigoTipoMoneda} onChange={handleInputChange} className={inputBase}>
                    <option value="PEN">PEN - Soles</option>
                    <option value="USD">USD - Dólares</option>
                    <option value="EUR">EUR - Euros</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="codigoTipoAfectacionIgvVenta" className="mb-1 block text-sm font-medium text-menta-petroleo">Código Tipo Afectación IGV Venta</label>
                  <select id="codigoTipoAfectacionIgvVenta" name="codigoTipoAfectacionIgvVenta" value={formData.codigoTipoAfectacionIgvVenta} onChange={handleInputChange} className={inputBase}>
                    <option value="10">10 - Gravado - Operación Onerosa</option>
                    <option value="20">20 - Exonerado - Operación Onerosa</option>
                    <option value="30">30 - Inafecto - Operación Onerosa</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="tieneIgv" className="mb-1 block text-sm font-medium text-menta-petroleo">Tiene IGV</label>
                  <select id="tieneIgv" name="tieneIgv" value={formData.tieneIgv} onChange={handleInputChange} className={inputBase}>
                    <option value={true}>Sí</option>
                    <option value={false}>No</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="codigoTipoAfectacionIgvCompra" className="mb-1 block text-sm font-medium text-menta-petroleo">Código Tipo Afectación IGV Compra</label>
                <select id="codigoTipoAfectacionIgvCompra" name="codigoTipoAfectacionIgvCompra" value={formData.codigoTipoAfectacionIgvCompra} onChange={handleInputChange} className={`${inputBase} max-w-md`}>
                  <option value="10">10 - Gravado - Operación Onerosa</option>
                  <option value="20">20 - Exonerado - Operación Onerosa</option>
                  <option value="30">30 - Inafecto - Operación Onerosa</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-fondo">
                <Package size={20} className="text-menta-petroleo" />
                Presentaciones del Producto
              </h3>

              {esEdicion ? (
                <>
                  <p className="mb-4 text-sm text-menta-petroleo">
                    {cantidadPresentaciones > 0
                      ? `Este producto tiene ${cantidadPresentaciones} presentación${cantidadPresentaciones !== 1 ? "es" : ""} configurada${cantidadPresentaciones !== 1 ? "s" : ""}.`
                      : "Sin presentaciones configuradas."}
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-menta-petroleo px-4 py-2.5 text-sm font-medium text-white transition hover:bg-menta-marino"
                    onClick={abrirModalAgregarPresentaciones}
                  >
                    <Package size={18} /> Gestionar Presentaciones
                  </button>
                </>
              ) : (
                <div>
                  <p className="mb-2 text-sm text-menta-petroleo">Configure las presentaciones del producto antes de crearlo.</p>
                  <p className="mb-4 text-sm text-menta-marino">
                    {cantidadPresentaciones > 0 ? `${cantidadPresentaciones} presentaciones configuradas.` : "No hay presentaciones configuradas."}
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-menta-petroleo px-4 py-2.5 text-sm font-medium text-white transition hover:bg-menta-marino"
                    onClick={abrirModalAgregarPresentaciones}
                  >
                    <Package size={18} /> Gestionar Presentaciones
                  </button>
                  {errors.presentaciones && <p className="mt-2 text-xs text-red-600">{errors.presentaciones}</p>}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-fondo">
                <Info size={20} className="text-menta-petroleo" />
                Información Adicional
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="codigoBarras" className="mb-1 block text-sm font-medium text-menta-petroleo">Código de Barras</label>
                  <input type="text" id="codigoBarras" name="codigoBarras" value={formData.codigoBarras} onChange={handleInputChange} className={inputBase} placeholder="Código de barras" />
                </div>
                <div>
                  <label htmlFor="modelo" className="mb-1 block text-sm font-medium text-menta-petroleo">Modelo</label>
                  <input type="text" id="modelo" name="modelo" value={formData.modelo} onChange={handleInputChange} className={inputBase} placeholder="Modelo del producto" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="marca" className="mb-1 block text-sm font-medium text-menta-petroleo">Marca</label>
                  <input type="text" id="marca" name="marca" value={formData.marca} onChange={handleInputChange} className={inputBase} placeholder="Marca del producto" />
                </div>
                <div>
                  <label htmlFor="codigosunat" className="mb-1 block text-sm font-medium text-menta-petroleo">Código SUNAT</label>
                  <input type="text" id="codigosunat" name="codigosunat" value={formData.codigosunat} onChange={handleInputChange} className={inputBase} placeholder="Código SUNAT" />
                </div>
              </div>
            </div>

            {tallerMecanicoHabilitado && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-fondo">
                  <Tags size={20} className="text-menta-petroleo" />
                  Códigos
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="origen" className="mb-1 block text-sm font-medium text-menta-petroleo">Origen</label>
                    <input type="text" id="origen" name="origen" value={formData.origen} onChange={handleInputChange} className={inputBase} placeholder="País de origen" />
                  </div>
                  <div>
                    <label htmlFor="codigoprovedorOEM" className="mb-1 block text-sm font-medium text-menta-petroleo">Código Proveedor OEM</label>
                    <input type="text" id="codigoprovedorOEM" name="codigoprovedorOEM" value={formData.codigoprovedorOEM} onChange={handleInputChange} className={inputBase} placeholder="Código del proveedor OEM" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="codigoCompetencia" className="mb-1 block text-sm font-medium text-menta-petroleo">Código Competencia</label>
                    <input type="text" id="codigoCompetencia" name="codigoCompetencia" value={formData.codigoCompetencia} onChange={handleInputChange} className={inputBase} placeholder="Código de competencia" />
                  </div>
                  <div>
                    <label htmlFor="rangoAnos" className="mb-1 block text-sm font-medium text-menta-petroleo">Rango de Años</label>
                    <input type="text" id="rangoAnos" name="rangoAnos" value={formData.rangoAnos} onChange={handleInputChange} placeholder="Ej: 2020-2025" className={`${inputBase} ${errors.rangoAnos ? inputError : ""}`} />
                    {errors.rangoAnos && <span className="mt-1 block text-xs text-red-600">{errors.rangoAnos}</span>}
                  </div>
                </div>
              </div>
            )}

            {farmaciaElementosHabilitado && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-fondo">
                  <Info size={20} className="text-menta-petroleo" />
                  Elementos de farmacia
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="codigoBarras" className="mb-1 block text-sm font-medium text-menta-petroleo">Código DIGEMID</label>
                    <input type="text" id="codigoBarras" name="codigoBarras" value={formData.codigoBarras} onChange={handleInputChange} className={inputBase} placeholder="Código DIGEMID" />
                  </div>
                  <div>
                    <label htmlFor="modelo" className="mb-1 block text-sm font-medium text-menta-petroleo">Nombre DIGEMID</label>
                    <input type="text" id="modelo" name="modelo" value={formData.modelo} onChange={handleInputChange} className={inputBase} placeholder="Nombre DIGEMID" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="marca" className="mb-1 block text-sm font-medium text-menta-petroleo">Registro Sanitario</label>
                    <input type="text" id="marca" name="marca" value={formData.marca} onChange={handleInputChange} className={inputBase} placeholder="Registro Sanitario" />
                  </div>
                  <div>
                    <label htmlFor="codigosunat" className="mb-1 block text-sm font-medium text-menta-petroleo">Laboratorio</label>
                    <input type="text" id="codigosunat" name="codigosunat" value={formData.codigosunat} onChange={handleInputChange} className={inputBase} placeholder="Laboratorio" />
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-fondo">
                <BarChart3 size={20} className="text-menta-petroleo" />
                Configuración Fiscal
              </h3>

              <div>
                <label htmlFor="tipodeAfectacion" className="mb-1 block text-sm font-medium text-menta-petroleo">Tipo de Afectación</label>
                <select id="tipodeAfectacion" name="tipodeAfectacion" value={formData.tipodeAfectacion} onChange={handleInputChange} className={`${inputBase} max-w-md`}>
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

              <div className="mt-4 flex items-center gap-2">
                <input type="checkbox" id="iscActivo" name="iscActivo" checked={formData.iscActivo} onChange={handleInputChange} className="h-4 w-4 rounded border-slate-300 text-menta-petroleo focus:ring-menta-turquesa" />
                <label htmlFor="iscActivo" className="text-sm font-medium text-menta-petroleo">ISC Activo</label>
              </div>

              {formData.iscActivo && (
                <div className="mt-4">
                  <label htmlFor="tipoAplicacionISC" className="mb-1 block text-sm font-medium text-menta-petroleo">Tipo de Aplicación ISC *</label>
                  <select id="tipoAplicacionISC" name="tipoAplicacionISC" value={formData.tipoAplicacionISC} onChange={handleInputChange} className={`${inputBase} max-w-md ${errors.tipoAplicacionISC ? inputError : ""}`}>
                    <option value="">Seleccionar tipo</option>
                    <option value="Aplicación del Monto Fijo">Aplicación del Monto Fijo</option>
                    <option value="Sistema al valor">Sistema al valor</option>
                    <option value="Sistema de Precios de Venta al Público">Sistema de Precios de Venta al Público</option>
                  </select>
                  {errors.tipoAplicacionISC && <span className="mt-1 block text-xs text-red-600">{errors.tipoAplicacionISC}</span>}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <input type="checkbox" id="sujetoDetraccion" name="sujetoDetraccion" checked={formData.sujetoDetraccion} onChange={handleInputChange} className="h-4 w-4 rounded border-slate-300 text-menta-petroleo focus:ring-menta-turquesa" />
                <label htmlFor="sujetoDetraccion" className="text-sm font-medium text-menta-petroleo">Sujeto a Detracción</label>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-fondo">
                <FileText size={20} className="text-menta-petroleo" />
                Observaciones
              </h3>
              <label htmlFor="observaciones" className="mb-1 block text-sm font-medium text-menta-petroleo">Observaciones</label>
              <textarea id="observaciones" name="observaciones" value={formData.observaciones} onChange={handleInputChange} rows={3} className={inputBase} placeholder="Observaciones adicionales" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-fondo">
                <ImageIcon size={20} className="text-menta-petroleo" />
                Imágenes del Producto
              </h3>

              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="min-w-0">
                    <div className="aspect-square w-full rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 overflow-hidden">
                      {previewImagenes[`imagen${num}`] ? (
                        <div className="relative h-full w-full">
                          <img src={previewImagenes[`imagen${num}`]} alt={`Preview ${num}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded-full bg-red-500 p-1.5 text-white transition hover:bg-red-600"
                            onClick={() => removeImagen(`imagen${num}`)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-1 text-menta-petroleo transition hover:bg-menta-claro/30">
                          <span className="text-2xl font-bold leading-none">+</span>
                          <span className="text-xs font-medium">Imagen {num}</span>
                          <input type="file" accept="image/*" onChange={(e) => handleImagenChange(e, `imagen${num}`)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">Resoluciones Full HD 1024x720. Máximo 5MB por imagen.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              onClick={onCancelar}
              disabled={loading}
            >
              ← Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-menta-petroleo px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-menta-marino disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {esEdicion ? "Actualizando..." : "Creando producto..."}
                </>
              ) : (
                <>
                  <Check size={18} />
                  {esEdicion ? "Actualizar Producto" : "Crear Producto"}
                </>
              )}
            </button>
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
