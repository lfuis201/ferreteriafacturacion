import React, { useState, useEffect } from "react";
import "../../styles/FormularioVenta.css";
import { productoService } from "../../services/productoService";
import { clienteService } from "../../services/clienteService";
import { ventaService, generarPdfVenta } from "../../services/ventaService";
import FormularioVentaProductServicio from "./FormularioVentaProductServicio";
import ModalCliente from "./ModalCliente";
import ModalHistorialCliente from "./ModalHistorialCliente";
import ModalAparcar from "./ModalAparcar";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Camera,
  Calendar,
  UserPlus,
  Plus,
  FileText,
  Archive,
  Eye,
  X,
  HelpCircle,
  Truck,
} from "lucide-react";

function FormularioVenta({ onVentaCreada, onCancelar }) {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([
    { id: 1, nombre: "Sucursal Principal" },
    { id: 2, nombre: "Sucursal Lima" },
  ]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
  const [mostrarModalHistorialCliente, setMostrarModalHistorialCliente] =
    useState(false);
  const [mostrarModalAparcar, setMostrarModalAparcar] = useState(false);
  const [modoModalAparcar, setModoModalAparcar] = useState("aparcar");
  const [showPreviewVenta, setShowPreviewVenta] = useState(false);
  const [previewVentaPdfUrl, setPreviewVentaPdfUrl] = useState("");
  const [ventaGuardadaInfo, setVentaGuardadaInfo] = useState(null);

  const [formData, setFormData] = useState({
    clienteId: "",
    sucursalId: "1",
    tipoComprobante: "FACTURA",
    serieComprobante: "FTR1",
    numeroComprobante: "",
    fechaVenta: new Date().toISOString().split("T")[0],
    fechaVencimiento: new Date().toISOString().split("T")[0],
    observacion: "",
    metodoPago: "EFECTIVO",
    formaPago: "CONTADO",
    moneda: "PEN",
    tipoOperacion: "Venta interna",
    tipoDocumento: "FACTURA",
    placaVehiculo: "",
    tipoCambio: "3.534",
    tipoGravado: "1",
    tipoVenta: "01",
    direccion: "",
  });

  const [detalles, setDetalles] = useState([]);
  const [totales, setTotales] = useState({
    subtotal: 0,
    igv: 0,
    total: 0,
  });

  // Función para resetear el formulario
  const resetearFormulario = () => {
    setFormData({
      clienteId: "",
      sucursalId: "1",
      tipoComprobante: "FACTURA",
      serieComprobante: "FTR1",
      numeroComprobante: "",
      fechaVenta: new Date().toISOString().split("T")[0],
      fechaVencimiento: new Date().toISOString().split("T")[0],
      observacion: "",
      metodoPago: "EFECTIVO",
      formaPago: "CONTADO",
      moneda: "PEN",
      tipoOperacion: "Venta interna",
      tipoDocumento: "FACTURA",
      placaVehiculo: "",
      tipoCambio: "3.534",
      tipoGravado: "1",
      tipoVenta: "01",
      direccion: "",
    });
    setDetalles([]);
    setBusquedaProducto("");
    setProductosFiltrados([]);
    setMostrarSugerencias(false);
  };

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [productosData, clientesData] = await Promise.all([
          productoService.obtenerProductos(),
          clienteService.obtenerClientes(),
        ]);
        setProductos(productosData.productos || []);
        setClientes(clientesData.clientes || []);
      } catch (error) {
        // console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // Obtener usuario actual y establecer sucursalId
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      if (usuario.sucursalId) {
        setFormData((prev) => ({
          ...prev,
          sucursalId: usuario.sucursalId,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          sucursalId: 1,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        sucursalId: 1,
      }));
    }
  }, []);

  useEffect(() => {
    calcularTotales();
  }, [detalles]);

  useEffect(() => {
    if (busquedaProducto.length > 0) {
      const filtrados = productos.filter(
        (producto) =>
          (producto.nombre &&
            producto.nombre
              .toLowerCase()
              .includes(busquedaProducto.toLowerCase())) ||
          (producto.codigo &&
            producto.codigo
              .toLowerCase()
              .includes(busquedaProducto.toLowerCase()))
      );
      setProductosFiltrados(filtrados);
      setMostrarSugerencias(true);
    } else {
      setProductosFiltrados([]);
      setMostrarSugerencias(false);
    }
  }, [busquedaProducto, productos]);

  // Generar número de comprobante automáticamente
  useEffect(() => {
    const generarNumeroComprobante = async () => {
      if (formData.serieComprobante && formData.sucursalId) {
        try {
          const response = await ventaService.obtenerSiguienteNumero(
            formData.serieComprobante,
            formData.sucursalId
          );
          setFormData((prev) => ({
            ...prev,
            numeroComprobante: response.siguienteNumero,
          }));
        } catch (error) {
          setFormData((prev) => ({
            ...prev,
            numeroComprobante: "000001",
          }));
        }
      }
    };

    generarNumeroComprobante();
  }, [formData.serieComprobante, formData.sucursalId]);

  const calcularTotales = () => {
    const subtotal = detalles.reduce(
      (sum, detalle) => sum + detalle.subtotal,
      0
    );
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    setTotales({
      subtotal: parseFloat(subtotal.toFixed(2)),
      igv: parseFloat(igv.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    });
  };

  const validarPlacaVehiculo = (placa) => {
    if (!placa) return true;
    const patron = /^[A-Z0-9]{3}-?[A-Z0-9]{3}$/;
    return patron.test(placa);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "clienteId" && value) {
      const clienteSeleccionado = clientes.find(
        (cliente) => cliente.id === parseInt(value)
      );
      if (clienteSeleccionado) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          direccion: clienteSeleccionado.direccion || "",
        }));
        return;
      }
    }

    if (name === "tipoComprobante") {
      let nuevaSerie = "";
      if (value === "FACTURA") {
        nuevaSerie = "FTR1";
      } else if (value === "BOLETA") {
        nuevaSerie = "BLT1";
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        serieComprobante: nuevaSerie,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const agregarProducto = (producto) => {
    const productoExistente = detalles.find(
      (d) => d.productoId === producto.id
    );

    if (productoExistente) {
      setDetalles((prev) =>
        prev.map((d) =>
          d.productoId === producto.id
            ? {
                ...d,
                cantidad: d.cantidad + 1,
                subtotal: (d.cantidad + 1) * d.precioUnitario,
              }
            : d
        )
      );
    } else {
      const cantidadInicial = parseFloat(producto.cantidadSeleccionada || 1);
      const precioInicial = parseFloat(producto.precioVenta);
      const nuevoDetalle = {
        productoId: producto.id,
        producto: producto,
        cantidad: cantidadInicial,
        precioUnitario: precioInicial,
        subtotal: cantidadInicial * precioInicial,
        unidad: producto.unidadSeleccionada || "Servicio",
      };
      setDetalles((prev) => [...prev, nuevoDetalle]);
    }

    setBusquedaProducto("");
    setMostrarSugerencias(false);
  };

  const actualizarDetalle = (index, campo, valor) => {
    setDetalles((prev) =>
      prev.map((detalle, i) => {
        if (i === index) {
          const nuevoDetalle = { ...detalle, [campo]: parseFloat(valor) || 0 };
          if (campo === "cantidad" || campo === "precioUnitario") {
            nuevoDetalle.subtotal =
              nuevoDetalle.cantidad * nuevoDetalle.precioUnitario;
          }
          return nuevoDetalle;
        }
        return detalle;
      })
    );
  };

  const eliminarDetalle = (index) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (detalles.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Advertencia",
        text: "Debe agregar al menos un producto",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setLoading(true);

    try {
      const ventaData = {
        ...formData,
        clienteId:
          formData.clienteId === "" ? null : parseInt(formData.clienteId),
        sucursalId: parseInt(formData.sucursalId),
        numeroComprobante:
          formData.numeroComprobante === ""
            ? "000001"
            : formData.numeroComprobante,
        observacion: formData.observacion === "" ? null : formData.observacion,
        fechaVenta: undefined,
        detalles: detalles.map((detalle) => ({
          productoId: parseInt(detalle.productoId),
          cantidad: parseFloat(detalle.cantidad),
          precioUnitario: parseFloat(detalle.precioUnitario),
          subtotal: parseFloat(detalle.subtotal),
        })),
        total: parseFloat(totales.total),
        subtotal: parseFloat(totales.subtotal),
        igv: parseFloat(totales.igv),
      };

      const response = await ventaService.crearVenta(ventaData);
      const info = response?.venta || response?.data?.venta || response;

      // Generar PDF en A4 y mostrar previsualización
      try {
        const blob = await generarPdfVenta(info.id, "A4");
        const url = window.URL.createObjectURL(blob);
        setPreviewVentaPdfUrl(url);
        setVentaGuardadaInfo({
          id: info.id,
          serieComprobante: info.serieComprobante,
          numeroComprobante: info.numeroComprobante,
        });
        setShowPreviewVenta(true);
      } catch (pdfError) {
        console.error("No se pudo generar el PDF de la venta:", pdfError);
      }

      if (onVentaCreada) {
        onVentaCreada(response.data);
      }

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Venta creada exitosamente",
        confirmButtonColor: "#28a745",
      });

      resetearFormulario();
    } catch (error) {
      const mensajeError =
        error?.response?.data?.mensaje ??
        error?.response?.data?.error ??
        error?.message ??
        "Error al crear la venta. Intente nuevamente.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: mensajeError,
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductoSeleccionado = (producto) => {
    agregarProducto(producto);
    setMostrarModalProducto(false);
  };

  const handleNuevoCliente = () => {
    setMostrarModalCliente(true);
  };

  const handleClienteCreado = (nuevoCliente) => {
    setClientes((prev) => [nuevoCliente, ...prev]);
    setFormData((prev) => ({
      ...prev,
      clienteId: nuevoCliente.id,
      direccion: nuevoCliente.direccion || "",
    }));
  };

  const handleAparcarVenta = (ventaAparcada) => {
    resetearFormulario();
  };

  const handleRestaurarVenta = (datosVenta) => {
    try {
      console.log("Datos recibidos para restaurar:", datosVenta);

      if (!datosVenta || !datosVenta.formData) {
        throw new Error("Estructura de datos inválida");
      }

      setFormData({
        ...datosVenta.formData,
        fechaVenta: new Date().toISOString().split("T")[0],
        fechaVencimiento: new Date().toISOString().split("T")[0],
      });

      if (datosVenta.detalles && datosVenta.detalles.length > 0) {
        setDetalles(datosVenta.detalles);
        setTimeout(() => calcularTotales(), 100);
      } else {
        setDetalles([]);
      }

      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Venta restaurada exitosamente",
        confirmButtonColor: "#28a745",
        timer: 2000,
        showConfirmButton: false,
      });

      console.log("Venta restaurada exitosamente");
    } catch (error) {
      console.error("Error al restaurar venta:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al restaurar la venta: " + error.message,
        confirmButtonColor: "#dc3545",
      });
    }
  };

  const obtenerDatosVentaActual = () => {
    return {
      formData: formData,
      detalles: detalles,
      totales: totales,
    };
  };

  return (
    <div className="formulario-venta-container">
      <div className="">
        {/* Header */}
        <div className="header-principal">
          <h1 className="titulo-principal">Gestión de Comprobantes</h1>
        </div>

        {/* Encabezado con logo y datos empresa */}
        <div className="encabezado-empresa">
          <div className="logo-placeholder">
            <Camera size={24} />
            <span className="logo-text">Logo empresa</span>
          </div>

          <div className="datos-empresa">
            <h1 className="">QUISPE NINA AMILCAR</h1>
            <p className="direccion-empresa">
              CAL. HUAYRANCAYLLE MZ. E. LT 1-B- LA KANTUTA
            </p>
          </div>

          <div className="info-adicional">
            <div className="info-item">
              <label className="info-label">Vendedor</label>
              <span className="info-value">Administrador</span>
            </div>
            <div className="info-item">
              <label className="info-label">
                <Calendar size={12} /> Fec. emisión
              </label>
              <span className="info-value">{formData.fechaVenta}</span>
            </div>
            <div className="info-item">
              <label className="info-label">
                <Calendar size={12} /> Fec. vencimiento
              </label>
              <span className="info-value">{formData.fechaVencimiento}</span>
            </div>
          </div>
        </div>

        {/* Placa de vehículo */}
        <div className="seccion-placa">
          <div className="placa-header">
            <Truck size={14} />
            <span className="placa-label">PLACA DE VEHICULO</span>
            <HelpCircle
              size={14}
              className="placa-tooltip"
              title="Formato: ABC-123 o ABC123"
            />
          </div>
          <input
            type="text"
            name="placaVehiculo"
            value={formData.placaVehiculo}
            onChange={(e) => {
              const valor = e.target.value.toUpperCase();
              setFormData((prev) => ({ ...prev, placaVehiculo: valor }));
            }}
            placeholder="Ej: ABC-123"
            maxLength="8"
            className="input-placa"
          />
        </div> 

        <br />   <br />  

        {/* Campos del formulario */}
        <div className="seccion-formulario">
          <div className="campos-grid">
            <div className="campo">
              <label>Tipo comprobante</label>
              <select
                name="tipoComprobante"
                value={formData.tipoComprobante}
                onChange={handleInputChange}
              >
                <option value="FACTURA">FACTURA</option>
                <option value="BOLETA">BOLETA</option>
              </select>
            </div>

            <div className="campo">
              <label>Serie</label>
              <input
                type="text"
                name="serieComprobante"
                value={formData.serieComprobante}
                onChange={handleInputChange}
                placeholder="F001"
              />
            </div>

            <div className="campo">
              <label>Número</label>
              <input
                type="text"
                name="numeroComprobante"
                value={formData.numeroComprobante}
                readOnly
                className="input-readonly"
                placeholder="Automático"
              />
            </div>

            <div className="campo">
              <label>Tipo de operación</label>
              <select
                name="tipoOperacion"
                value={formData.tipoOperacion}
                onChange={handleInputChange}
              >
                <option value="Venta interna">Venta interna</option>
                <option value="Exportación de Bienes">
                  Exportación de Bienes
                </option>
                <option value="Ventas no domiciliados que no califican como exportación">
                  Ventas no domiciliados que no califican como exportación
                </option>
                <option value="Operación Sujeta a Detracción">
                  Operación Sujeta a Detracción
                </option>
                <option value="Operación Sujeta a Detracción - Servicios de Transporte Carga">
                  Operación Sujeta a Detracción - Servicios de Transporte Carga
                </option>
                <option value="Operación Sujeta a Percepción">
                  Operación Sujeta a Percepción
                </option>
                <option value="Compra interna">Compra interna</option>
              </select>
            </div>

            <div className="campo">
              <label>Moneda</label>
              <select
                name="moneda"
                value={formData.moneda}
                onChange={handleInputChange}
              >
                <option value="PEN">PEN</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div className="campo">
              <label>Método de pago</label>
              <select
                name="metodoPago"
                value={formData.metodoPago}
                onChange={handleInputChange}
              >
                <option value="EFECTIVO">EFECTIVO</option>
                <option value="TARJETA_DEBITO">TARJETA DÉBITO</option>
                <option value="TARJETA_CREDITO">TARJETA CRÉDITO</option>
                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                <option value="YAPE">YAPE</option>
                <option value="PLIN">PLIN</option>
                <option value="CONTRAENTREGA">CONTRAENTREGA</option>
              </select>
            </div>

            <div className="campo">
              <label>
                Tipo de cambio
                <HelpCircle
                  size={14}
                  style={{ marginLeft: "5px", cursor: "help" }}
                  title="Tipo de cambio actual del dólar"
                />
              </label>
              <input
                type="number"
                name="tipoCambio"
                value={formData.tipoCambio}
                onChange={handleInputChange}
                step="0.001"
                placeholder="3.534"
              />
            </div>

            <div className="campo">
              <label>Forma de pago</label>
              <select
                name="formaPago"
                value={formData.formaPago}
                onChange={handleInputChange}
              >
                <option value="CONTADO">CONTADO</option>
                <option value="CREDITO">CRÉDITO</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección Cliente */}
        <div className="seccion-cliente">
          <div className="campo">
            <label className="label-con-accion">
              Cliente
              <span onClick={handleNuevoCliente} className="link-nuevo">
                <UserPlus size={12} /> Nuevo
              </span>
            </label>
            <select
              name="clienteId"
              value={formData.clienteId}
              onChange={handleInputChange}
            >
             
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} - {cliente.numeroDocumento}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Botones de acciones */}
        <div className="botones-acciones">
          <button
            type="button"
            
            onClick={() => setMostrarModalProducto(true)}
          >
            <Plus size={14} /> Agregar producto
          </button> 

          <br />  <br /> 
        
          <button
            type="button"
            onClick={() => {
              setModoModalAparcar("aparcar");
              setMostrarModalAparcar(true);
            }}
            className=""
          >
            <Archive size={14} /> Aparcar
          </button>
          
          <button
            type="button"
            onClick={() => {
              setModoModalAparcar("ver");
              setMostrarModalAparcar(true);
            }}
            className=""
          >
            <Eye size={14} /> Ver aparcados
          </button>
        </div>

        {/* Tabla de productos */}
        <div className="tabla-detalles">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Productos o Servicios</th>
                <th>Unidad</th>
                <th>Cantidad</th>
                <th>Valor U.</th>
                <th>Precio U.</th>
                <th>Subtotal</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {detalles.length === 0 ? (
                <tr>
                  <td colSpan="9" className="tabla-vacia">
                    No hay productos agregados
                  </td>
                </tr>
              ) : (
                detalles.map((detalle, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{detalle.producto.nombre}</td>
                    <td className="text-center">{detalle.unidad || "Servicio"}</td>
                    <td className="text-center">
                      <input
                        type="number"
                        value={detalle.cantidad}
                        onChange={(e) =>
                          actualizarDetalle(index, "cantidad", e.target.value)
                        }
                        className="input-cantidad"
                      />
                    </td>
                    <td className="text-right">
                      {detalle.precioUnitario.toFixed(2)}
                    </td>
                    <td className="text-right">
                      <input
                        type="number"
                        value={detalle.precioUnitario}
                        onChange={(e) =>
                          actualizarDetalle(
                            index,
                            "precioUnitario",
                            e.target.value
                          )
                        }
                        className="input-precio"
                      />
                    </td>
                    <td className="text-right">{detalle.subtotal.toFixed(2)}</td>
                    <td className="text-right">{detalle.subtotal.toFixed(2)}</td>
                    <td className="text-center">
                      <button
                        onClick={() => eliminarDetalle(index)}
                        className="btn-eliminar"
                      >
                        <X size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        {detalles.length > 0 && (
          <div className="seccion-totales">
            <div className="totales-grid">
              <div className="total-item">
                <span>Subtotal:</span>
                <span>S/ {totales.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-item">
                <span>IGV (18%):</span>
                <span>S/ {totales.igv.toFixed(2)}</span>
              </div>
              <div className="total-item total-final">
                <span>Total:</span>
                <span>S/ {totales.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Botones finales */}
        <div className="botones-formulario">
          <button
            type="button"
            onClick={onCancelar}
            className="btn-cancelar-form"
          >
            <X size={14} /> Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || detalles.length === 0}
            className="btn-guardar"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Procesando...
              </>
            ) : (
              <>
                <Plus size={14} />
                Crear Venta
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de Productos */}
      {mostrarModalProducto && (
        <div className="modal-overlay">
          <div >
            <button
              onClick={() => setMostrarModalProducto(false)}
              className="modal-cerrar"
            >
              <X size={16} />
            </button>
            <FormularioVentaProductServicio
              onProductoSeleccionado={handleProductoSeleccionado}
              productos={productos}
            />
          </div>
        </div>
      )}

      {/* Modal de Cliente */}
      {mostrarModalCliente && (
        <ModalCliente
          onClose={() => setMostrarModalCliente(false)}
          onClienteCreado={handleClienteCreado}
        />
      )}

      {/* Modal de WhatsApp eliminado: se muestra solo la vista previa PDF */}

      {/* Modal de Historial del Cliente */}
      <ModalHistorialCliente
        isOpen={mostrarModalHistorialCliente && !!formData.clienteId}
        clienteId={formData.clienteId}
        clienteNombre={
          clientes.find((c) => c.id === parseInt(formData.clienteId))?.nombre ||
          ""
        }
        onClose={() => setMostrarModalHistorialCliente(false)}
      />

      {/* Modal de Aparcar */}
      <ModalAparcar
        isOpen={mostrarModalAparcar}
        onClose={() => setMostrarModalAparcar(false)}
        onAparcar={handleAparcarVenta}
        onRestaurar={handleRestaurarVenta}
        ventaActual={obtenerDatosVentaActual()}
        modoInicial={modoModalAparcar}
      />

      {/* Vista previa de Venta con opciones de impresión */}
      {showPreviewVenta && (
        <div className="modal-overlay" style={{ zIndex: 1600 }}>
          <div className="modal-content-large" style={{ width: "90%", maxWidth: "1100px" }}>
            <div className="modal-header" style={{ backgroundColor: "#e74c3c", color: "white" }}>
              <h3 style={{ margin: 0 }}>
                {`Venta registrada: ${ventaGuardadaInfo?.serieComprobante || ""}-${ventaGuardadaInfo?.numeroComprobante || ""}`}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowPreviewVenta(false);
                  if (previewVentaPdfUrl) {
                    window.URL.revokeObjectURL(previewVentaPdfUrl);
                    setPreviewVentaPdfUrl("");
                  }
                }}
                style={{ color: "white", borderColor: "white" }}
              >
                ×
              </button>
            </div>

            {/* Barra de acciones */}
            <div style={{ display: "flex", gap: "12px", padding: "10px 12px" }}>
              <button
                onClick={async () => {
                  const blob = await generarPdfVenta(ventaGuardadaInfo.id, "A4");
                  const url = window.URL.createObjectURL(blob);
                  setPreviewVentaPdfUrl((old) => { if (old) window.URL.revokeObjectURL(old); return url; });
                }}
                style={{ background: "transparent", color: "#e74c3c", border: "none", cursor: "pointer" }}
              >
                Imprimir A4
              </button>
              <button
                onClick={async () => {
                  const blob = await generarPdfVenta(ventaGuardadaInfo.id, "80mm");
                  const url = window.URL.createObjectURL(blob);
                  setPreviewVentaPdfUrl((old) => { if (old) window.URL.revokeObjectURL(old); return url; });
                }}
                style={{ background: "transparent", color: "#e74c3c", border: "none", cursor: "pointer" }}
              >
                Imprimir Ticket
              </button>
              <button
                onClick={async () => {
                  // A5 no está soportado explícitamente en el backend; usamos A4 como alternativa
                  const blob = await generarPdfVenta(ventaGuardadaInfo.id, "A4");
                  const url = window.URL.createObjectURL(blob);
                  setPreviewVentaPdfUrl((old) => { if (old) window.URL.revokeObjectURL(old); return url; });
                }}
                style={{ background: "transparent", color: "#e74c3c", border: "none", cursor: "pointer" }}
              >
                Imprimir A5
              </button>
            </div>

            {/* Visor PDF */}
            <div style={{ height: "70vh", borderTop: "1px solid #eee" }}>
              {previewVentaPdfUrl ? (
                <iframe
                  src={previewVentaPdfUrl}
                  title="Vista previa de Venta"
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              ) : (
                <div style={{ padding: 20 }}>Generando vista previa...</div>
              )}
            </div>

            {/* Acciones de descarga */}
            <div style={{ display: "flex", gap: 16, padding: "12px" }}>
              <button
                onClick={async () => {
                  const blob = await generarPdfVenta(ventaGuardadaInfo.id, "A4");
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${ventaGuardadaInfo?.serieComprobante || "VENTA"}-${ventaGuardadaInfo?.numeroComprobante || ""}.pdf`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="nvf-btn-guardar"
                style={{ backgroundColor: "#3498db", color: "white" }}
              >
                Descargar A4
              </button>
              <button
                onClick={async () => {
                  const blob = await generarPdfVenta(ventaGuardadaInfo.id, "80mm");
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${ventaGuardadaInfo?.serieComprobante || "VENTA"}-${ventaGuardadaInfo?.numeroComprobante || ""}-80mm.pdf`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="nvf-btn-guardar"
                style={{ backgroundColor: "#3498db", color: "white" }}
              >
                Descargar 80mm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormularioVenta;