import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Search,
  FileText,
  Calendar,
  UserPlus,
  ChevronRight,
  Layout,
  ShoppingBag,
  Truck,
  Building,
  CreditCard,
  DollarSign,
  Clock,
  RefreshCcw,
  Settings,
  Download,
  FileDown,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ArrowLeft,
  Info,
  Package,
  FileDigit,
  User,
  Hash,
  ArrowRight
} from 'lucide-react';
import { crearCompra, validarCompra, calcularTotales, probarConectividad } from '../../services/compraService';
import { obtenerProveedores, crearProveedor } from '../../services/proveedorService';
import { obtenerSucursales } from '../../services/sucursalService';
import { obtenerProductos } from '../../services/productoService';
import { obtenerClientes } from '../../services/clienteService';
import { consultarReniec, consultarSunat } from '../../services/consultaService';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const FormularioCompras = ({ onCancelar, onCompraCreada }) => {
  // Estados para datos reales
  const [proveedores, setProveedores] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Estados principales del formulario
  const [formData, setFormData] = useState({
    tipoComprobante: 'FACTURA ELECTRÓNICA',
    serie: '',
    numero: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    proveedor: '',
    moneda: 'Soles',
    tipoCambio: '3.511',
    ordenCompra: '',
    observaciones: '',
    constDetraccion: '',
    fechaDetraccion: '',
    porcentajeDetraccion: '',
    periodoCompra: new Date().toISOString().slice(0, 7),
    condicionPago: 'Contado',
    sucursalId: '',
    estado: 'PENDIENTE'
  });

  // Estados para productos/detalles
  const [detalles, setDetalles] = useState([]);
  const [detalleProducto, setDetalleProducto] = useState({
    productoId: '',
    cantidad: 1,
    precioUnitario: 0,
    subtotal: 0
  });

  const [opciones, setOpciones] = useState({
    aplicarOtroPeriodo: false,
    agregarCliente: false,
    agregarPagos: false,
    tieneIGV: true
  });

  const [pagos, setPagos] = useState([
    {
      formaPago: 'Efectivo',
      desde: 'CAJA GENERAL - Administracion',
      referencia: '',
      glosa: '',
      monto: '0'
    }
  ]);

  const [mostrarModalProveedor, setMostrarModalProveedor] = useState(false);
  const [mostrarModalImportar, setMostrarModalImportar] = useState(false);
  const [archivoXml, setArchivoXml] = useState(null);
  const [cargandoImportacion, setCargandoImportacion] = useState(false);

  const [nuevoProveedor, setNuevoProveedor] = useState({
    tipoDocumento: 'RUC',
    numeroDocumento: '',
    nombre: '',
    direccion: '',
    telefono: '',
    diasCredito: '',
    codigoInterno: '',
    codigoBarras: '',
    nacionalidad: 'Perú',
    tipoProveedor: 'Vendedor',
    esAgentePercepcion: false
  });

  const [consultandoProveedor, setConsultandoProveedor] = useState(false);
  const [errorConsultaProveedor, setErrorConsultaProveedor] = useState('');

  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      const [proveedoresData, sucursalesData, productosData, clientesData] = await Promise.all([
        obtenerProveedores(),
        obtenerSucursales(),
        obtenerProductos(),
        obtenerClientes()
      ]);

      setProveedores(proveedoresData.proveedores || proveedoresData.data || []);
      setSucursales(sucursalesData.sucursales || sucursalesData.data || []);
      setProductos(productosData.productos || productosData.data || []);
      setClientes(clientesData.clientes || clientesData.data || []);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos iniciales', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpcionChange = (e) => {
    const { name, checked } = e.target;
    setOpciones(prev => ({ ...prev, [name]: checked }));
  };

  const handleDetalleChange = (e) => {
    const { name, value } = e.target;
    const newDetalle = {
      ...detalleProducto,
      [name]: name === 'productoId' ? value : parseFloat(value) || 0
    };
    newDetalle.subtotal = newDetalle.cantidad * newDetalle.precioUnitario;
    setDetalleProducto(newDetalle);
  };

  const handleProveedorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoProveedor(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const consultarDocumentoProveedor = async () => {
    const numeroDocumento = nuevoProveedor.numeroDocumento;
    if (!numeroDocumento || (nuevoProveedor.tipoDocumento === 'DNI' && numeroDocumento.length !== 8) || (nuevoProveedor.tipoDocumento === 'RUC' && numeroDocumento.length !== 11)) {
      Swal.fire('Atención', 'Ingrese un número de documento válido', 'warning');
      return;
    }

    setConsultandoProveedor(true);
    setErrorConsultaProveedor('');

    try {
      let resultado = null;
      if (nuevoProveedor.tipoDocumento === 'DNI') {
        resultado = await consultarReniec(numeroDocumento);
      } else if (nuevoProveedor.tipoDocumento === 'RUC') {
        resultado = await consultarSunat(numeroDocumento);
      }

      if (resultado && (resultado.success || resultado.mensaje === 'Consulta exitosa') && resultado.datos) {
        let nombreCompleto = '';
        if (nuevoProveedor.tipoDocumento === 'DNI') {
          nombreCompleto = resultado.nombreCompleto || `${resultado.datos.nombres || ''} ${resultado.datos.apellidoPaterno || ''} ${resultado.datos.apellidoMaterno || ''}`.trim();
        } else if (nuevoProveedor.tipoDocumento === 'RUC') {
          nombreCompleto = resultado.nombreCompleto || resultado.datos.razonSocial || resultado.datos.nombre || '';
        }

        setNuevoProveedor(prev => ({
          ...prev,
          nombre: nombreCompleto,
          direccion: resultado.datos.direccion || '',
        }));

        Swal.fire('¡Éxito!', 'Datos encontrados satisfactoriamente', 'success');
      } else {
        Swal.fire('Información', 'No se encontraron datos para el documento ingresado', 'info');
      }
    } catch (error) {
      console.error('Error en consulta:', error);
      Swal.fire('Error', 'Ocurrió un error al consultar el documento', 'error');
    } finally {
      setConsultandoProveedor(false);
    }
  };

  const agregarProducto = () => {
    if (!detalleProducto.productoId || detalleProducto.cantidad <= 0 || detalleProducto.precioUnitario <= 0) {
      Swal.fire('Atención', 'Complete correctamente los datos del producto', 'warning');
      return;
    }

    const producto = productos.find(p => p.id == detalleProducto.productoId);
    if (!producto) return;

    const nuevoDetalle = {
      ...detalleProducto,
      producto: producto,
      id: Date.now() + Math.random()
    };

    setDetalles([...detalles, nuevoDetalle]);
    setDetalleProducto({
      productoId: '',
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0
    });
  };

  const eliminarProducto = (id) => {
    setDetalles(detalles.filter(d => d.id !== id));
  };

  const handleDescargarPlantilla = (tipo) => {
    if (tipo === 'existentes') {
      const ws = XLSX.utils.aoa_to_sheet([['Código Interno', 'Cantidad', 'Precio unitario'], ['P001', '5', '12.50']]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Existentes');
      XLSX.writeFile(wb, 'plantilla_existentes.xlsx');
    } else {
      const ws = XLSX.utils.aoa_to_sheet([['Número', 'Código Interno', 'Modelo', 'Precio Unitario Venta', 'Cantidad'], ['Producto Ejemplo', '64001', 'M1', '10.00', '1']]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Nuevos');
      XLSX.writeFile(wb, 'plantilla_nuevos.xlsx');
    }
  };

  const calcularTotal = () => {
    const subtotal = detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
    const igv = opciones.tieneIGV ? subtotal * 0.18 : 0;
    const total = subtotal + igv;
    return { subtotal, igv, total };
  };

  const { subtotal, igv, total } = calcularTotal();

  const handleGuardarCompra = async (e) => {
    e.preventDefault();

    if (!formData.proveedor || !formData.sucursalId || !formData.serie || !formData.numero || detalles.length === 0) {
      Swal.fire('Faltan datos', 'Por favor complete todos los campos obligatorios y agregue productos', 'warning');
      return;
    }

    setLoading(true);
    try {
      const compraData = {
        proveedorId: parseInt(formData.proveedor),
        sucursalId: parseInt(formData.sucursalId),
        tipoComprobante: formData.tipoComprobante,
        serieComprobante: formData.serie,
        numeroComprobante: formData.numero,
        fechaCompra: formData.fechaEmision + 'T00:00:00Z',
        subtotal: parseFloat(subtotal),
        igv: parseFloat(igv),
        total: parseFloat(total),
        estado: 'PENDIENTE',
        observacion: formData.observaciones || '',
        detalles: detalles.map(detalle => ({
          productoId: parseInt(detalle.productoId),
          cantidad: parseFloat(detalle.cantidad),
          precioUnitario: parseFloat(detalle.precioUnitario),
          subtotal: parseFloat(detalle.subtotal)
        }))
      };

      await crearCompra(compraData);
      Swal.fire('¡Compra Guardada!', 'La compra se registró correctamente en el sistema', 'success');
      onCompraCreada?.();
    } catch (error) {
      console.error('Error al guardar compra:', error);
      Swal.fire('Error', 'No se pudo registrar la compra', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarProveedor = async () => {
    if (!nuevoProveedor.numeroDocumento || !nuevoProveedor.nombre) {
      Swal.fire('Atención', 'Nombre y documento son obligatorios', 'warning');
      return;
    }

    try {
      setLoading(true);
      const resultado = await crearProveedor({
        nombre: nuevoProveedor.nombre,
        tipoDocumento: nuevoProveedor.tipoDocumento,
        numeroDocumento: nuevoProveedor.numeroDocumento,
        direccion: nuevoProveedor.direccion || null,
        telefono: nuevoProveedor.telefono || null,
      });

      const proveedoresData = await obtenerProveedores();
      setProveedores(proveedoresData.proveedores || proveedoresData.data || []);
      setFormData(prev => ({ ...prev, proveedor: resultado.id.toString() }));
      setMostrarModalProveedor(false);
      Swal.fire('¡Éxito!', 'Proveedor creado satisfactoriamente', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo crear el proveedor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImportarXml = async () => {
    if (!archivoXml) return;
    setCargandoImportacion(true);
    try {
      // Mock parsing function based on previous logic
      const texto = await archivoXml.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(texto, 'text/xml');
      const lines = Array.from(doc.getElementsByTagName('cac:InvoiceLine'));

      const nuevosDetalles = lines.map(node => {
        const qty = parseFloat(node.getElementsByTagName('cbc:InvoicedQuantity')[0]?.textContent) || 0;
        const price = parseFloat(node.getElementsByTagName('cbc:PriceAmount')[0]?.textContent) || 0;
        const code = node.getElementsByTagName('cbc:ID')[0]?.textContent || '';
        const productoMatch = productos.find(p => p.codigo === code);

        return {
          productoId: productoMatch?.id || '',
          producto: productoMatch || { nombre: 'Producto XML: ' + code },
          cantidad: qty,
          precioUnitario: price,
          subtotal: qty * price,
          id: Date.now() + Math.random()
        };
      }).filter(d => d.cantidad > 0);

      setDetalles([...detalles, ...nuevosDetalles]);
      setMostrarModalImportar(false);
      Swal.fire('Importación', `Se importaron ${nuevosDetalles.length} productos correctamente`, 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo procesar el archivo XML', 'error');
    } finally {
      setCargandoImportacion(false);
      setArchivoXml(null);
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6 bg-slate-50/30 animate-in fade-in duration-500">

      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 p-8 text-white shadow-2xl shadow-indigo-200">
        <div className="absolute right-0 top-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <ShoppingBag size={280} />
        </div>
        <div className="absolute left-0 bottom-0 p-10 opacity-5 pointer-events-none transform -translate-x-1/4 translate-y-1/4">
          <Truck size={200} />
        </div>

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={onCancelar}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all active:scale-95 group shadow-lg"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Orden de <span className="text-indigo-300">Compra</span></h1>
              <div className="mt-2 flex items-center gap-2 text-indigo-200/80 text-[10px] font-bold uppercase tracking-[0.2em]">
                <Layout size={14} className="text-indigo-400" /> Registro de Ingresos de Mercadería
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setMostrarModalImportar(true)}
              className="flex h-12 items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-6 text-sm font-bold border border-white/10 hover:bg-white/20 transition-all border-dashed"
            >
              <FileDigit size={20} className="text-indigo-300" /> IMPORTAR XML
            </button>
            <div className="h-10 w-px bg-white/10 hidden sm:block mx-2" />
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest leading-none mb-1">Total Compra</span>
              <span className="text-2xl font-black">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleGuardarCompra} className="grid grid-cols-1 gap-6 lg:grid-cols-12 pb-12">

        {/* Main Section */}
        <div className="lg:col-span-8 space-y-6">

          {/* Document Info Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3 border-b border-slate-50 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                <FileText size={20} />
              </div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Información del Comprobante</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Comprobante</label>
                <select name="tipoComprobante" value={formData.tipoComprobante} onChange={handleInputChange} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all">
                  <option value="FACTURA ELECTRÓNICA">FACTURA ELECTRÓNICA</option>
                  <option value="BOLETA DE VENTA ELECTRONICA">BOLETA DE VENTA ELECTRONICA</option>
                  <option value="NOTA DE VENTA">NOTA DE VENTA</option>
                  <option value="GUÍA">GUÍA DE REMISIÓN</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Serie</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" name="serie" value={formData.serie} onChange={handleInputChange} placeholder="F001" className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-11 pr-4 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Número</label>
                <input type="text" name="numero" value={formData.numero} onChange={handleInputChange} placeholder="0004523" className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Fec. Emisión</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="date" name="fechaEmision" value={formData.fechaEmision} onChange={handleInputChange} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-11 pr-4 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Fec. Vencimiento</label>
                <input type="date" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleInputChange} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Moneda</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                  <select name="moneda" value={formData.moneda} onChange={handleInputChange} className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 pl-11 pr-4 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none">
                    <option value="Soles">PEN - Soles</option>
                    <option value="Dolares">USD - Dólares</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Info Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between border-b border-slate-50 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                  <Truck size={20} />
                </div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Proveedor y Almacén</h2>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalProveedor(true)}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-all uppercase tracking-widest group"
              >
                <UserPlus size={16} className="group-hover:scale-110" /> <span>Nuevo Proveedor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Seleccionar Proveedor</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select name="proveedor" value={formData.proveedor} onChange={handleInputChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none">
                    <option value="">Buscar proveedor...</option>
                    {proveedores.map(prov => (
                      <option key={prov.id} value={prov.id}>{prov.nombre} - {prov.ruc || prov.numeroDocumento}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Sucursal / Almacén</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select name="sucursalId" value={formData.sucursalId} onChange={handleInputChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none">
                    <option value="">Seleccione destino...</option>
                    {sucursales.map(suc => (
                      <option key={suc.id} value={suc.id}>{suc.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Product Items Table Card */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
                  <Package size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Detalle de Compra</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{detalles.length} Items Registrados</span>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-8 py-4 w-12 text-center">#</th>
                    <th className="px-6 py-4">Descripción del Producto</th>
                    <th className="px-6 py-4 text-center">Unidad</th>
                    <th className="px-6 py-4 text-center">Cant.</th>
                    <th className="px-6 py-4 text-right">Precio Unit.</th>
                    <th className="px-6 py-4 text-right">Subtotal</th>
                    <th className="px-8 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detalles.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-200 group transition-all duration-500 hover:text-indigo-200">
                          <ShoppingBag size={80} strokeWidth={1} className="transition-transform group-hover:scale-110" />
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-black uppercase tracking-[0.3em]">Carrito de Compra Vacío</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Use el panel lateral para agregar productos</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    detalles.map((detalle, idx) => (
                      <tr key={detalle.id} className="group transition-all duration-300 hover:bg-slate-50/50">
                        <td className="px-8 py-5 text-center font-bold text-slate-300 italic">{idx + 1}</td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-700">{detalle.producto?.nombre || 'Producto XML'}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{detalle.producto?.codigo || '--'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500 uppercase">{detalle.producto?.unidadMedida || 'UNI'}</span>
                        </td>
                        <td className="px-6 py-5 text-center font-black text-slate-700">{detalle.cantidad}</td>
                        <td className="px-6 py-5 text-right font-bold text-slate-500">
                          {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(detalle.precioUnitario)}
                        </td>
                        <td className="px-6 py-5 text-right font-black text-indigo-600">
                          {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(detalle.subtotal)}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <button
                            type="button"
                            onClick={() => eliminarProducto(idx)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-400 transition-all hover:bg-red-500 hover:text-white hover:rotate-12 active:scale-95 shadow-sm"
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

            {detalles.length > 0 && (
              <div className="bg-slate-900 p-8 text-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <div className="flex flex-col gap-1 opacity-60">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Subtotal</span>
                    <span className="text-xl font-bold">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(subtotal)}</span>
                  </div>
                  <div className="flex flex-col gap-1 opacity-60">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Impuestos (18%)</span>
                    <span className="text-xl font-bold">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(igv)}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end relative overflow-hidden">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 mb-2">
                      <CreditCard size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 mb-1">Total Final Compra</span>
                    <span className="text-5xl font-black tracking-tight">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">

          {/* Add Product Selection */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3 border-b border-slate-50 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                <Plus size={20} />
              </div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Agregar Items</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Producto / Insumo</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <select
                    name="productoId"
                    value={detalleProducto.productoId}
                    onChange={handleDetalleChange}
                    className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none"
                  >
                    <option value="">Seleccione producto...</option>
                    {productos.filter(p => p.estado).map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} {p.codigo ? `(${p.codigo})` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Cantidad</label>
                  <input type="number" name="cantidad" value={detalleProducto.cantidad} onChange={handleDetalleChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-lg font-black text-slate-700 focus:border-indigo-500 outline-none transition-all text-center" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">P. Unitario</label>
                  <input type="number" name="precioUnitario" value={detalleProducto.precioUnitario} onChange={handleDetalleChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-lg font-black text-slate-700 focus:border-indigo-500 outline-none transition-all text-center" />
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-50 p-6 flex items-center justify-between border border-indigo-100/50 group">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Valor Parcial</span>
                  <span className="text-xl font-black text-indigo-700">{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(detalleProducto.subtotal)}</span>
                </div>
                <button
                  type="button"
                  onClick={agregarProducto}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus size={28} />
                </button>
              </div>
            </div>
          </div>

          {/* Config Options */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3 border-b border-slate-50 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 shadow-sm border border-orange-100">
                <Settings size={20} />
              </div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Opciones de carga</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-4 group cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <input type="checkbox" name="tieneIGV" checked={opciones.tieneIGV} onChange={handleOpcionChange} className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">Aplicar IGV (18%)</span>
                  <span className="text-[10px] text-slate-400 font-medium">Calcular impuestos sobre subtotal</span>
                </div>
              </label>
              <label className="flex items-center gap-4 group cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <input type="checkbox" name="aplicarOtroPeriodo" checked={opciones.aplicarOtroPeriodo} onChange={handleOpcionChange} className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">Cambiar Periodo</span>
                  <span className="text-[10px] text-slate-400 font-medium">Afectar stock en mes contable distinto</span>
                </div>
              </label>
              <label className="flex items-center gap-4 group cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <input type="checkbox" name="agregarPagos" checked={opciones.agregarPagos} onChange={handleOpcionChange} className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">Control de Pagos</span>
                  <span className="text-[10px] text-slate-400 font-medium">Registrar egreso de caja asociado</span>
                </div>
              </label>
            </div>
          </div>

          {/* Plantillas Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <FileDown size={20} className="text-emerald-500" />
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Plantillas Excel</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => handleDescargarPlantilla('existentes')}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
              >
                <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-700 uppercase tracking-widest">Productos Existentes</span>
                <Download size={14} className="text-emerald-500" />
              </button>
              <button
                type="button"
                onClick={() => handleDescargarPlantilla('nuevos')}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
              >
                <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-700 uppercase tracking-widest">Productos Nuevos</span>
                <Download size={14} className="text-emerald-500" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full h-20 items-center justify-center gap-3 rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCcw size={32} className="animate-spin" /> : (
              <div className="flex items-center gap-4">
                <CheckCircle2 size={32} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300 mb-0.5">Finalizar Proceso</span>
                  <span className="text-lg font-black uppercase tracking-widest">GUARDAR COMPRA</span>
                </div>
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Modals Section */}

      {/* Nuevo Proveedor Modal */}
      {mostrarModalProveedor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setMostrarModalProveedor(false)} />
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-[3rem] bg-white p-8 md:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] animate-in zoom-in-95 backdrop-saturate-200 border border-slate-100/50">

            <button onClick={() => setMostrarModalProveedor(false)} className="absolute right-10 top-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90">
              <XCircle size={24} />
            </button>

            <div className="mb-10 flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-200">
                <UserPlus size={40} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Nuevo <span className="text-indigo-600">Proveedor</span></h2>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Alta de socios comerciales en el sistema</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Tipo de Documento</label>
                  <select name="tipoDocumento" value={nuevoProveedor.tipoDocumento} onChange={handleProveedorChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-700 outline-none">
                    <option value="RUC">RUC - Registro Único Contribuyente</option>
                    <option value="DNI">DNI - Documento Nacional Identidad</option>
                    <option value="CE">Carnet Extranjería</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Número de Documento</label>
                  <div className="flex gap-2">
                    <input type="text" name="numeroDocumento" value={nuevoProveedor.numeroDocumento} onChange={handleProveedorChange} className="flex-1 h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-lg font-black text-slate-700 outline-none" />
                    <button type="button" onClick={consultarDocumentoProveedor} className="flex h-14 items-center gap-2 rounded-2xl bg-slate-900 px-6 font-bold text-white transition-all hover:bg-indigo-600 active:scale-95">
                      {consultandoProveedor ? <RefreshCcw size={20} className="animate-spin" /> : <Search size={20} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Razón Social / Nombre Comercial</label>
                  <input type="text" name="nombre" value={nuevoProveedor.nombre} onChange={handleProveedorChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 font-bold text-slate-700 outline-none" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Dirección Legal</label>
                  <input type="text" name="direccion" value={nuevoProveedor.direccion} onChange={handleProveedorChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 font-bold text-slate-700 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Teléfono</label>
                    <input type="text" name="telefono" value={nuevoProveedor.telefono} onChange={handleProveedorChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 font-bold text-slate-700 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Días de Crédito</label>
                    <input type="number" name="diasCredito" value={nuevoProveedor.diasCredito} onChange={handleProveedorChange} className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 font-bold text-slate-700 outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Tipo de Proveedor</label>
                  <div className="flex gap-4">
                    {['Vendedor', 'Fabricante', 'Distribuidor'].map(tipo => (
                      <label key={tipo} className={`flex-1 flex items-center justify-center h-14 rounded-2xl border-2 transition-all cursor-pointer font-bold uppercase tracking-widest text-[10px] ${nuevoProveedor.tipoProveedor === tipo ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}>
                        <input type="radio" name="tipoProveedor" value={tipo} className="hidden" onChange={handleProveedorChange} />
                        {tipo}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-end gap-4">
              <button onClick={() => setMostrarModalProveedor(false)} className="h-14 px-10 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest">Descartar</button>
              <button onClick={handleGuardarProveedor} className="h-14 px-12 rounded-2xl bg-indigo-600 font-bold text-white shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all uppercase tracking-widest active:scale-95">REGISTRAR PROVEEDOR</button>
            </div>
          </div>
        </div>
      )}

      {/* Importar XML Modal */}
      {mostrarModalImportar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setMostrarModalImportar(false)} />
          <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl animate-in zoom-in-95 border border-slate-100">
            <div className="mb-8 flex flex-col items-center text-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600 shadow-inner">
                <FileDigit size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Importar Factura XML</h3>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em] mt-1">Formatos UBL 2.1 Soportados</p>
              </div>
            </div>

            <div className="group relative h-48 w-full">
              <input
                type="file"
                accept=".xml"
                onChange={handleArchivoXmlChange}
                className="absolute inset-0 z-10 w-full opacity-0 cursor-pointer"
              />
              <div className={`h-full w-full rounded-2xl border-4 border-dashed transition-all flex flex-col items-center justify-center gap-4 ${archivoXml ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50'}`}>
                {archivoXml ? (
                  <>
                    <CheckCircle2 size={48} className="text-indigo-500" />
                    <span className="text-sm font-bold text-indigo-700 uppercase tracking-tighter truncate max-w-[200px]">{archivoXml.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setArchivoXml(null); }} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-red-500 underline">Quitar archivo</button>
                  </>
                ) : (
                  <>
                    <Download size={48} className="text-slate-300 group-hover:text-indigo-300 group-hover:scale-110 transition-all" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Arrastre aquí su XML</span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleImportarXml}
                disabled={!archivoXml || cargandoImportacion}
                className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
              >
                {cargandoImportacion ? <RefreshCcw size={24} className="animate-spin mx-auto" /> : 'Sincronizar Comprobante'}
              </button>
              <button onClick={() => setMostrarModalImportar(false)} className="w-full h-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Cerrar Ventana</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormularioCompras;