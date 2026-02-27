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
  Clock,
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
      Swal.fire("Atención", "Debe agregar al menos un producto", "warning");
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

  const handleClienteCreado = (nuevoCliente) => {
    setClientes(prev => [...prev, nuevoCliente]);
    setFormData(prev => ({ ...prev, clienteId: nuevoCliente.id.toString(), direccion: nuevoCliente.direccion || "" }));
  };

  const handleAparcarVenta = () => {
    resetearFormulario();
    setMostrarModalAparcar(false);
  };

  const obtenerDatosVentaActual = () => {
    return {
      formData: formData,
      detalles: detalles,
      totales: totales,
    };
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/30">
      {/* Header Section */}
      <div className="flex flex-col gap-6 rounded-2xl bg-menta-petroleo p-6 text-white shadow-xl relative overflow-hidden">
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
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Nueva Venta Electrónica</h2>
              <div className="flex items-center gap-2 text-menta-claro/80 text-xs font-bold uppercase tracking-[2px]">
                <Building size={14} /> QUISPE NINA AMILCAR - RUC: 10444332211
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { setModoModalAparcar("aparcar"); setMostrarModalAparcar(true); }}
              className="flex h-11 items-center gap-2 rounded-xl bg-white/10 px-5 text-sm font-bold transition hover:bg-white/20"
            >
              <Archive size={18} /> APARCAR
            </button>
            <button
              onClick={() => { setModoModalAparcar("ver"); setMostrarModalAparcar(true); }}
              className="flex h-11 items-center gap-2 rounded-xl bg-white/10 px-5 text-sm font-bold transition hover:bg-white/20"
            >
              <Eye size={18} /> VER APARCADOS
            </button>
            <button
              onClick={resetearFormulario}
              className="flex h-11 items-center gap-2 rounded-xl bg-red-500/20 px-5 text-sm font-bold text-red-200 transition hover:bg-red-500/30"
            >
              <Trash2 size={18} /> LIMPIAR
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4 lg:grid-cols-5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-menta-claro/50">Vendedor</span>
            <span className="text-sm font-semibold">Administrador</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-menta-claro/50">Fecha de Venta</span>
            <span className="text-sm font-semibold flex items-center gap-2">
              <Calendar size={14} className="text-menta-turquesa" /> {formData.fechaVenta}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-menta-claro/50">Vencimiento</span>
            <span className="text-sm font-semibold">{formData.fechaVencimiento}</span>
          </div>
          <div className="flex flex-col gap-1 col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-menta-claro/50">Serie / Correlativo</span>
            <span className="text-sm font-bold text-menta-turquesa">
              {formData.serieComprobante} - {formData.numeroComprobante || '...'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: Config & Client */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Main Attributes Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-menta-suave text-menta-petroleo">
                <Settings size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Atributos del Comprobante</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tipo de Comprobante</label>
                <select name="tipoComprobante" value={formData.tipoComprobante} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-menta-turquesa outline-none">
                  <option value="FACTURA">Factura Electrónica</option>
                  <option value="BOLETA">Boleta Electrónica</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Serie</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" name="serieComprobante" value={formData.serieComprobante} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-semibold focus:border-menta-turquesa outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tipo Operación</label>
                <select name="tipoOperacion" value={formData.tipoOperacion} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-menta-turquesa outline-none">
                  <option value="Venta interna">Venta interna</option>
                  <option value="Exportación">Exportación</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Método de Pago</label>
                <select name="metodoPago" value={formData.metodoPago} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-menta-turquesa outline-none">
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
                  <option value="YAPE">Yape / Plin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Forma de Pago</label>
                <select name="formaPago" value={formData.formaPago} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-menta-turquesa outline-none">
                  <option value="CONTADO">Contado</option>
                  <option value="CREDITO">Crédito</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">T. Cambio</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                  <input type="number" name="tipoCambio" value={formData.tipoCambio} onChange={handleInputChange} step="0.001" className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-bold text-emerald-600 focus:border-menta-turquesa outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Client Selection Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transform -rotate-12">
              <User size={80} />
            </div>
            <div className="mb-6 flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <User size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Información del Cliente</h3>
              </div>
              <button onClick={() => setMostrarModalCliente(true)} className="flex items-center gap-1.5 text-xs font-bold text-menta-turquesa hover:text-menta-marino transition">
                <UserPlus size={16} /> NUEVO CLIENTE
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Seleccionar Cliente</label>
                <select name="clienteId" value={formData.clienteId} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-menta-turquesa outline-none">
                  <option value="">-- Seleccione un cliente --</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.numeroDocumento})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dirección</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-semibold bg-slate-50 outline-none" />
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Placa Vehículo (Opcional)</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="text"
                    name="placaVehiculo"
                    value={formData.placaVehiculo}
                    onChange={(e) => setFormData(prev => ({ ...prev, placaVehiculo: e.target.value.toUpperCase() }))}
                    placeholder="ABC-123"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-semibold focus:border-menta-turquesa outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Search & Products List */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
            <div className="mb-6 flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <Search size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Buscar Productos</h3>
              </div>
              <button
                onClick={() => setMostrarModalProducto(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-menta-suave text-menta-petroleo hover:bg-menta-turquesa hover:text-white transition"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="text"
                placeholder="Código o nombre..."
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-menta-turquesa/10 transition outline-none"
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
              />
              {mostrarSugerencias && productosFiltrados.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[400px] overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl">
                  {productosFiltrados.map(p => (
                    <button
                      key={p.id}
                      onClick={() => agregarProducto(p)}
                      className="flex w-full items-center gap-4 rounded-xl p-3 text-left hover:bg-slate-50 transition border-b border-slate-50 last:border-0"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                        <Archive size={18} />
                      </div>
                      <div className="flex flex-1 flex-col truncate">
                        <span className="truncate font-bold text-slate-800">{p.nombre}</span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="bg-slate-100 px-1.5 rounded">{p.codigo}</span>
                          <span className="text-emerald-600">{formatearMoneda(p.precioVenta)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px]">Atajos</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setMostrarModalHistorialCliente(true)} className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 hover:bg-menta-suave transition group">
                  <Clock size={24} className="text-slate-400 group-hover:text-menta-petroleo transition" />
                  <span className="text-[10px] font-bold uppercase text-slate-500">Historial</span>
                </button>
                <button onClick={() => { setModoModalAparcar("ver"); setMostrarModalAparcar(true); }} className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 hover:bg-amber-50 transition group">
                  <Archive size={24} className="text-slate-400 group-hover:text-amber-600 transition" />
                  <span className="text-[10px] font-bold uppercase text-slate-500">Aparcados</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle Table Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest">
            <Layers size={18} className="text-menta-petroleo" /> Items del Comprobante
          </h3>
          <span className="text-xs font-bold text-slate-400">Items: {detalles.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/30">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 text-center">Unidad</th>
                <th className="px-6 py-4 text-center">Cantidad</th>
                <th className="px-6 py-4 text-right">Precio</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {detalles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-200">
                      <ShoppingCart size={64} strokeWidth={1} />
                      <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Carrito vacío</p>
                    </div>
                  </td>
                </tr>
              ) : (
                detalles.map((d, idx) => (
                  <tr key={idx} className="group transition hover:bg-slate-50/50">
                    <td className="px-6 py-5 text-slate-300 font-bold">{idx + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{d.producto?.nombre}</span>
                        <span className="text-[10px] text-slate-400">SKU: {d.producto?.codigo || 'S/C'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500 uppercase">{d.unidad}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <input
                        type="number"
                        className="w-20 rounded-xl border-none bg-slate-100 py-2 text-center font-bold focus:ring-2 focus:ring-menta-turquesa outline-none transition"
                        value={d.cantidad}
                        onChange={(e) => actualizarDetalle(idx, "cantidad", e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <input
                        type="number"
                        className="w-28 rounded-xl border-none bg-slate-100 py-2 pr-3 text-right font-bold focus:ring-2 focus:ring-menta-turquesa outline-none transition"
                        value={d.precioUnitario}
                        onChange={(e) => actualizarDetalle(idx, "precioUnitario", e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-slate-900">
                      {formatearMoneda(d.subtotal)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => eliminarDetalle(idx)}
                        className="rounded-xl p-2.5 text-slate-200 hover:bg-red-50 hover:text-red-500 transition"
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
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-100">
            <Info size={24} className="text-amber-600 flex-shrink-0" />
            <p className="text-[11px] font-bold text-amber-900 leading-snug">
              VERIFIQUE QUE EL TIPO DE COMPROBANTE COINCIDA CON LA SERIE PARA EVITAR RECHAZOS.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full lg:w-[400px]">
          <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 p-10 opacity-5 pointer-events-none">
              <DollarSign size={120} />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between text-xs font-bold uppercase tracking-[3px] text-slate-400">
                <span>Subtotal</span>
                <span>{formatearMoneda(totales.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-[3px] text-slate-400">
                <span>IGV (18%)</span>
                <span>{formatearMoneda(totales.igv)}</span>
              </div>
              <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[4px] text-menta-turquesa">MONTO TOTAL</span>
                  <span className="text-[10px] text-slate-500 font-bold">{formData.moneda}</span>
                </div>
                <span className="text-4xl font-black tracking-tight">{formatearMoneda(totales.total)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-3xl bg-menta-turquesa py-6 text-sm font-bold text-menta-petroleo shadow-lg shadow-menta-turquesa/20 transition hover:bg-menta-esmeralda hover:scale-[1.01] active:scale-95 disabled:opacity-50 uppercase tracking-[4px]"
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
};

export default FormularioVenta;