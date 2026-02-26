import React, { useState, useEffect } from "react";
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
  ShoppingCart,
  User,
  Settings,
  DollarSign,
  Building,
  RefreshCcw,
  Search,
  CheckCircle,
  XCircle,
  Hash,
  Briefcase,
  Layers,
  Save,
  Trash2,
  Info
} from "lucide-react";

const FormularioVenta = ({ onVentaCreada, onCancelar }) => {
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
  const [mostrarModalHistorialCliente, setMostrarModalHistorialCliente] = useState(false);
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
    tipoCambio: "3.848",
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
      tipoCambio: "3.848",
      tipoGravado: "1",
      tipoVenta: "01",
      direccion: "",
    });
    setDetalles([]);
    setBusquedaProducto("");
    setProductosFiltrados([]);
    setMostrarSugerencias(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

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
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      setFormData(prev => ({ ...prev, sucursalId: usuario.sucursalId || 1 }));
    } else {
      setFormData(prev => ({ ...prev, sucursalId: 1 }));
    }
  }, []);

  useEffect(() => {
    calcularTotales();
  }, [detalles]);

  useEffect(() => {
    if (busquedaProducto.length > 0) {
      const filtrados = productos.filter(p =>
        p.nombre?.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(busquedaProducto.toLowerCase())
      );
      setProductosFiltrados(filtrados);
      setMostrarSugerencias(true);
    } else {
      setProductosFiltrados([]);
      setMostrarSugerencias(false);
    }
  }, [busquedaProducto, productos]);

  useEffect(() => {
    const generarNumeroComprobante = async () => {
      if (formData.serieComprobante && formData.sucursalId) {
        try {
          const response = await ventaService.obtenerSiguienteNumero(
            formData.serieComprobante,
            formData.sucursalId
          );
          setFormData(prev => ({ ...prev, numeroComprobante: response.siguienteNumero }));
        } catch (error) {
          setFormData(prev => ({ ...prev, numeroComprobante: "000001" }));
        }
      }
    };
    generarNumeroComprobante();
  }, [formData.serieComprobante, formData.sucursalId]);

  const calcularTotales = () => {
    const totalVenta = detalles.reduce((sum, d) => sum + (parseFloat(d.subtotal) || 0), 0);
    const subtotalVenta = totalVenta / 1.18;
    const igvVenta = totalVenta - subtotalVenta;

    setTotales({
      subtotal: parseFloat(subtotalVenta.toFixed(2)),
      igv: parseFloat(igvVenta.toFixed(2)),
      total: parseFloat(totalVenta.toFixed(2)),
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "clienteId" && value) {
      const c = clientes.find(cliente => cliente.id === parseInt(value));
      if (c) {
        setFormData(prev => ({ ...prev, [name]: value, direccion: c.direccion || "" }));
        return;
      }
    }
    if (name === "tipoComprobante") {
      let serie = value === "FACTURA" ? "FTR1" : "BLT1";
      setFormData(prev => ({ ...prev, [name]: value, serieComprobante: serie }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const agregarProducto = (producto) => {
    const existente = detalles.find(d => d.productoId === producto.id);
    if (existente) {
      setDetalles(prev => prev.map(d =>
        d.productoId === producto.id
          ? { ...d, cantidad: d.cantidad + 1, subtotal: (d.cantidad + 1) * d.precioUnitario }
          : d
      ));
    } else {
      const precio = parseFloat(producto.precioVenta || 0);
      setDetalles(prev => [...prev, {
        productoId: producto.id,
        producto: producto,
        cantidad: 1,
        precioUnitario: precio,
        subtotal: precio,
        unidad: producto.unidadMedida || "UND",
      }]);
    }
    setBusquedaProducto("");
    setMostrarSugerencias(false);
  };

  const actualizarDetalle = (index, campo, valor) => {
    setDetalles(prev => prev.map((d, i) => {
      if (i === index) {
        let actual = { ...d, [campo]: parseFloat(valor) || 0 };
        if (campo === "cantidad" || campo === "precioUnitario") {
          actual.subtotal = actual.cantidad * actual.precioUnitario;
        }
        return actual;
      }
      return d;
    }));
  };

  const eliminarDetalle = (index) => {
    setDetalles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (detalles.length === 0) {
      Swal.fire("¡Atención!", "Debe agregar al menos un producto", "warning");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        clienteId: formData.clienteId ? parseInt(formData.clienteId) : null,
        sucursalId: parseInt(formData.sucursalId),
        detalles: detalles.map(d => ({
          productoId: parseInt(d.productoId),
          cantidad: parseFloat(d.cantidad),
          precioUnitario: parseFloat(d.precioUnitario),
          subtotal: parseFloat(d.subtotal),
        })),
        total: totales.total,
        subtotal: totales.subtotal,
        igv: totales.igv,
      };
      await ventaService.crearVenta(payload);
      Swal.fire("¡Éxito!", "Venta registrada satisfactoriamente", "success");
      resetearFormulario();
      onVentaCreada?.();
    } catch (error) {
      Swal.fire("Error", "No se pudo procesar la venta.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProductoSeleccionado = (producto) => {
    agregarProducto(producto);
    setMostrarModalProducto(false);
  };

  const handleRestaurarVenta = (datos) => {
    setFormData(prev => ({ ...prev, ...datos.formData }));
    setDetalles(datos.detalles);
    setMostrarModalAparcar(false);
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto || 0);
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/30 font-bold italic">
      {/* Premium Header */}
      <div className="flex flex-col gap-6 rounded-2xl bg-menta-petroleo p-6 text-white shadow-2xl font-bold italic relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShoppingCart size={150} />
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div className="flex items-center gap-5">
            <button
              onClick={onCancelar}
              className="group flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="font-bold italic">
              <h2 className="text-2xl font-black tracking-tight italic">Nueva Venta Electrónica</h2>
              <div className="flex items-center gap-2 text-menta-claro/80 text-xs font-black uppercase tracking-[2px] italic">
                <Building size={14} /> QUISPE NINA AMILCAR - RUC: 10444332211
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-bold italic">
            <button
              onClick={() => { setModoModalAparcar("aparcar"); setMostrarModalAparcar(true); }}
              className="flex h-11 items-center gap-2 rounded-xl bg-white/10 px-5 text-sm font-black transition hover:bg-white/20 italic"
            >
              <Archive size={18} /> APARCAR
            </button>
            <button
              onClick={() => { setModoModalAparcar("ver"); setMostrarModalAparcar(true); }}
              className="flex h-11 items-center gap-2 rounded-xl bg-white/10 px-5 text-sm font-black transition hover:bg-white/20 italic"
            >
              <Eye size={18} /> VER APARCADOS
            </button>
            <button
              onClick={resetearFormulario}
              className="flex h-11 items-center gap-2 rounded-xl bg-red-500/20 px-5 text-sm font-black text-red-200 transition hover:bg-red-500/30 italic"
            >
              <Trash2 size={18} /> LIMPIAR
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4 lg:grid-cols-5 font-bold italic">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-menta-claro/50 italic">Vendedor</span>
            <span className="text-sm font-black italic">Administrador</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-menta-claro/50 italic">Fecha de Venta</span>
            <span className="text-sm font-black italic flex items-center gap-2">
              <Calendar size={14} className="text-menta-turquesa" /> {formData.fechaVenta}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-menta-claro/50 italic">Vencimiento</span>
            <span className="text-sm font-black italic">{formData.fechaVencimiento}</span>
          </div>
          <div className="flex flex-col gap-1 col-span-2 lg:col-span-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-menta-claro/50 italic">Serie/Siguiente Correlativo</span>
            <span className="text-sm font-black text-menta-turquesa italic">
              {formData.serieComprobante} - {formData.numeroComprobante || 'Calculando...'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 font-bold italic">
        {/* Left Side: Config & Client */}
        <div className="lg:col-span-8 flex flex-col gap-6 font-bold italic">

          {/* Main Attributes Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm font-bold italic">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-50 pb-4 font-bold italic">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-menta-suave text-menta-petroleo font-bold italic">
                <Settings size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">Atributos del Comprobante</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 font-bold italic">
              <div className="space-y-1.5 font-bold italic">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-bold italic">Tipo de Comprobante</label>
                <select name="tipoComprobante" value={formData.tipoComprobante} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold focus:border-menta-turquesa italic">
                  <option value="FACTURA">Factura Electrónica</option>
                  <option value="BOLETA">Boleta Electrónica</option>
                </select>
              </div>
              <div className="space-y-1.5 font-bold italic">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-bold italic">Serie</label>
                <div className="relative font-bold italic">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold italic" size={16} />
                  <input type="text" name="serieComprobante" value={formData.serieComprobante} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-bold focus:border-menta-turquesa italic" />
                </div>
              </div>
              <div className="space-y-1.5 font-bold italic">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-bold italic">Tipo Operación</label>
                <select name="tipoOperacion" value={formData.tipoOperacion} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold focus:border-menta-turquesa italic">
                  <option value="Venta interna">Venta interna</option>
                  <option value="Exportación">Exportación</option>
                </select>
              </div>
              <div className="space-y-1.5 font-bold italic">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-bold italic">Método de Pago</label>
                <select name="metodoPago" value={formData.metodoPago} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold focus:border-menta-turquesa italic">
                  <option value="EFECTIVO">Efectivo Cash</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
                  <option value="YAPE">Yape / Plin</option>
                </select>
              </div>
              <div className="space-y-1.5 font-bold italic">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-bold italic">Forma de Pago</label>
                <select name="formaPago" value={formData.formaPago} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold focus:border-menta-turquesa italic">
                  <option value="CONTADO">Contado</option>
                  <option value="CREDITO">Venta al Crédito</option>
                </select>
              </div>
              <div className="space-y-1.5 font-bold italic">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-bold italic">Dólar / T.C.</label>
                <div className="relative font-bold italic">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold italic" size={16} />
                  <input type="number" name="tipoCambio" value={formData.tipoCambio} onChange={handleInputChange} step="0.001" className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-black text-emerald-600 focus:border-menta-turquesa italic" />
                </div>
              </div>
            </div>
          </div>

          {/* Client Selection Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm font-bold italic relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transform -rotate-12">
              <User size={80} />
            </div>
            <div className="mb-6 flex items-center justify-between border-b border-slate-50 pb-4 font-bold italic">
              <div className="flex items-center gap-3 font-bold italic">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold italic">
                  <User size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">Información del Cliente</h3>
              </div>
              <button onClick={() => setMostrarModalCliente(true)} className="flex items-center gap-1.5 text-xs font-black text-menta-turquesa hover:text-menta-marino transition italic">
                <UserPlus size={16} /> REGISTRAR NUEVO
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 font-bold italic relative z-10">
              <div className="space-y-1.5 font-bold italic">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-bold italic">Seleccionar Cliente</label>
                <select name="clienteId" value={formData.clienteId} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold focus:border-menta-turquesa italic">
                  <option value="">-- Seleccione un cliente --</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.numeroDocumento})</option>)}
                </select>
              </div>
              <div className="space-y-1.5 font-bold italic">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-bold italic">Dirección Fiscal / Entrega</label>
                <div className="relative font-bold italic">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold italic" size={16} />
                  <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-bold bg-slate-50 italic" />
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2 font-bold italic">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-bold italic">Placa del Vehículo (Opcional)</label>
                <div className="relative font-bold italic">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold italic" size={16} />
                  <input type="text" name="placaVehiculo" value={formData.placaVehiculo} onChange={(e) => setFormData(prev => ({ ...prev, placaVehiculo: e.target.value.toUpperCase() }))} placeholder="Ej: ABC-123" className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-bold italic" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Search & Products List */}
        <div className="lg:col-span-4 flex flex-col gap-6 font-bold italic">
          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm font-bold italic flex flex-col">
            <div className="mb-6 flex items-center justify-between border-b border-slate-50 pb-4 font-bold italic">
              <div className="flex items-center gap-3 font-bold italic">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600 font-bold italic">
                  <Search size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">Buscar Productos</h3>
              </div>
              <button
                onClick={() => setMostrarModalProducto(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-menta-suave text-menta-petroleo hover:bg-menta-turquesa hover:text-white transition italic"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="relative font-bold italic mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold italic" size={20} />
              <input
                type="text"
                placeholder="Código, Nombre o SKU..."
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-menta-turquesa/10 transition italic font-bold"
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
              />
              {mostrarSugerencias && productosFiltrados.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[400px] overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl font-bold italic">
                  {productosFiltrados.map(p => (
                    <button
                      key={p.id}
                      onClick={() => agregarProducto(p)}
                      className="flex w-full items-center gap-4 rounded-xl p-3 text-left hover:bg-slate-50 transition border-b border-slate-50 last:border-0 italic"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 italic">
                        <Archive size={18} />
                      </div>
                      <div className="flex flex-1 flex-col truncate italic font-bold">
                        <span className="truncate font-black text-slate-800 italic">{p.nombre}</span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider italic">
                          <span className="bg-slate-100 px-1.5 rounded">{p.codigo}</span>
                          <span className="text-emerald-600">{formatearMoneda(p.precioVenta)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 font-bold italic">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] italic">Atajos Rápidos</p>
              <div className="grid grid-cols-2 gap-3 font-bold italic">
                <button onClick={() => setMostrarModalHistorialCliente(true)} className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 hover:bg-menta-suave transition group italic">
                  <Clock size={24} className="text-slate-400 group-hover:text-menta-petroleo transition" />
                  <span className="text-[10px] font-black uppercase text-slate-500 italic">Historial</span>
                </button>
                <button onClick={() => { setModoModalAparcar("ver"); setMostrarModalAparcar(true); }} className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 hover:bg-amber-50 transition group italic">
                  <Archive size={24} className="text-slate-400 group-hover:text-amber-600 transition" />
                  <span className="text-[10px] font-black uppercase text-slate-500 italic">Aparcados</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle Table Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-100 overflow-hidden font-bold italic">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-100 font-bold italic">
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest italic">
            <Layers size={18} className="text-menta-petroleo" /> Items del Comprobante
          </h3>
          <span className="text-xs font-black text-slate-400 italic uppercase">Items: {detalles.length}</span>
        </div>

        <div className="overflow-x-auto font-bold italic">
          <table className="w-full text-left text-sm whitespace-nowrap font-bold italic">
            <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
              <tr>
                <th className="px-6 py-4 font-bold italic">#</th>
                <th className="px-6 py-4 font-bold italic">Descripción del Item</th>
                <th className="px-6 py-4 text-center font-bold italic">Unidad</th>
                <th className="px-6 py-4 text-center font-bold italic">Cantidad</th>
                <th className="px-6 py-4 text-right font-bold italic">Precio Unit.</th>
                <th className="px-6 py-4 text-right font-bold italic">Total</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold italic">
              {detalles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center font-bold italic">
                    <div className="flex flex-col items-center gap-3 text-slate-200 font-bold italic">
                      <ShoppingCart size={64} strokeWidth={1} />
                      <p className="text-lg font-black text-slate-300 uppercase italic tracking-widest">El carrito está vacío</p>
                    </div>
                  </td>
                </tr>
              ) : (
                detalles.map((d, idx) => (
                  <tr key={idx} className="group transition hover:bg-slate-50/50 font-bold italic">
                    <td className="px-6 py-5 text-slate-300 font-black italic">{idx + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col font-bold italic">
                        <span className="font-black text-slate-800 italic underline decoration-menta-turquesa/30 underline-offset-4">{d.producto?.nombre}</span>
                        <span className="text-[10px] text-slate-400 italic">SKU: {d.producto?.codigo || 'S/C'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-bold italic">
                      <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500 italic uppercase">{d.unidad}</span>
                    </td>
                    <td className="px-6 py-5 text-center font-bold italic">
                      <input
                        type="number"
                        className="w-20 rounded-xl border-none bg-slate-100 py-2 text-center font-black italic focus:ring-2 focus:ring-menta-turquesa transition italic"
                        value={d.cantidad}
                        onChange={(e) => actualizarDetalle(idx, "cantidad", e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-5 text-right font-bold italic">
                      <div className="relative font-bold italic flex justify-end">
                        <input
                          type="number"
                          className="w-28 rounded-xl border-none bg-slate-100 py-2 pr-2 text-right font-black italic focus:ring-2 focus:ring-menta-turquesa transition italic"
                          value={d.precioUnitario}
                          onChange={(e) => actualizarDetalle(idx, "precioUnitario", e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-slate-900 italic font-bold">
                      {formatearMoneda(d.subtotal)}
                    </td>
                    <td className="px-6 py-5 text-center font-bold italic">
                      <button
                        onClick={() => eliminarDetalle(idx)}
                        className="rounded-xl p-2.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition italic"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals & Footer Action */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between font-bold italic">
        <div className="flex flex-col gap-2 font-bold italic max-w-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-100 font-bold italic">
            <Info size={24} className="text-amber-600 flex-shrink-0" />
            <p className="text-[11px] font-bold text-amber-900 leading-snug italic font-bold italic">
              Asegúrese de que el tipo de comprobante coincida con la serie seleccionada para evitar rechazos en el envío a SUNAT.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 font-bold italic w-full lg:w-[400px]">
          <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl font-bold italic relative overflow-hidden">
            <div className="absolute top-0 left-0 p-10 opacity-5 pointer-events-none">
              <DollarSign size={120} />
            </div>

            <div className="space-y-4 font-bold italic relative z-10">
              <div className="flex justify-between text-xs font-black uppercase tracking-[3px] text-slate-400 italic font-bold italic">
                <span>Subtotal</span>
                <span>{formatearMoneda(totales.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-black uppercase tracking-[3px] text-slate-400 italic font-bold italic">
                <span>IGV (18%)</span>
                <span>{formatearMoneda(totales.igv)}</span>
              </div>
              <div className="pt-6 border-t border-slate-800 flex justify-between items-end font-bold italic">
                <div className="flex flex-col font-bold italic">
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-menta-turquesa italic underline decoration-menta-turquesa/30 underline-offset-4">MONTO TOTAL</span>
                  <span className="text-[10px] text-slate-500 italic font-bold">{formData.moneda}</span>
                </div>
                <span className="text-4xl font-black italic tracking-tight">{formatearMoneda(totales.total)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-3xl bg-menta-turquesa py-6 text-sm font-black text-menta-petroleo shadow-xl shadow-menta-turquesa/20 transition hover:bg-menta-esmeralda hover:scale-[1.01] active:scale-95 disabled:opacity-50 italic uppercase tracking-[4px] font-bold"
          >
            {loading ? (
              <RefreshCcw size={24} className="animate-spin" />
            ) : (
              <>
                <Save size={24} /> GENERAR VENTA
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      {mostrarModalProducto && (
        <FormularioVentaProductServicio onClose={() => setMostrarModalProducto(false)} onProductoSeleccionado={handleProductoSeleccionado} />
      )}
      {mostrarModalCliente && (
        <ModalCliente onClose={() => setMostrarModalCliente(false)} onClienteCreado={handleClienteCreado} />
      )}
      {mostrarModalHistorialCliente && (
        <ModalHistorialCliente client={clientes.find(c => c.id === parseInt(formData.clienteId))} onClose={() => setMostrarModalHistorialCliente(false)} />
      )}
      {mostrarModalAparcar && (
        <ModalAparcar
          mode={modoModalAparcar}
          ventaActual={obtenerDatosVentaActual()}
          onClose={() => setMostrarModalAparcar(false)}
          onRestaurar={handleRestaurarVenta}
          onAparcado={handleAparcarVenta}
        />
      )}
    </div>
  );

  function obtenerDatosVentaActual() {
    return {
      formData: formData,
      detalles: detalles,
      totales: totales,
    };
  }
};

export default FormularioVenta;