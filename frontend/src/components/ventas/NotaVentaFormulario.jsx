import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  X,
  Search,
  Save,
  UserPlus,
  ShoppingCart,
  Building,
  DollarSign,
  Calendar,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle,
  Truck,
  Hash,
  CreditCard,
  Clock,
  Briefcase
} from 'lucide-react';
import ModalCliente from './ModalCliente';
import FormularioVentaProductServicio from './FormularioVentaProductServicio';
import { obtenerClientes } from '../../services/clienteService';
import { crearNotaVenta } from '../../services/notaVentaService';
import Swal from 'sweetalert2';

const NotaVentaFormulario = ({ onCancel, onSuccess }) => {
  const [pagos, setPagos] = useState([
    {
      id: 1,
      fecha: new Date().toISOString().split('T')[0],
      metodoPago: 'Efectivo',
      destino: 'CAJA GENERAL',
      referencia: '',
      glosa: '',
      monto: 0,
      agregar: true
    }
  ]);

  const [productos, setProductos] = useState([]);
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [showModalProductos, setShowModalProductos] = useState(false);

  // Estados para todos los campos del formulario
  const [formData, setFormData] = useState({
    direccionCliente: '',
    establecimiento: 'Oficina Principal',
    serie: 'NV01',
    moneda: 'soles',
    fechaEmision: new Date().toISOString().split('T')[0],
    tipoPeriodo: '',
    direccionEnvio: '',
    fechaVencimiento: '',
    placa: '',
    tipoCambio: '3.848',
    ordenCompra: '',
    vendedor: 'Administrador',
    observacion: ''
  });

  // Estados para cálculos
  const [subtotal, setSubtotal] = useState(0);
  const [igv, setIgv] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cargar clientes al montar el componente
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const response = await obtenerClientes();
        setClientes(response.clientes || []);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    };
    cargarClientes();
  }, []);

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar cambios en productos
  const handleProductoChange = (id, campo, valor) => {
    setProductos(prevProductos =>
      prevProductos.map(producto => {
        if (producto.id === id) {
          const productoActualizado = { ...producto, [campo]: valor };

          if (campo === 'cantidad' || campo === 'precioU') {
            const cantidad = campo === 'cantidad' ? parseFloat(valor) || 0 : producto.cantidad;
            const precio = campo === 'precioU' ? parseFloat(valor) || 0 : producto.precioU;
            productoActualizado.subtotal = cantidad * precio;
            productoActualizado.total = productoActualizado.subtotal;
            productoActualizado.valorU = precio;
            productoActualizado.precioUnitario = precio;
          }

          return productoActualizado;
        }
        return producto;
      })
    );
  };

  const eliminarProducto = (id) => {
    setProductos(prevProductos => prevProductos.filter(producto => producto.id !== id));
  };

  const calcularTotales = () => {
    const subtotalCalculado = productos.reduce((sum, producto) => sum + (producto.subtotal || 0), 0);
    const igvCalculado = subtotalCalculado * 0.18;
    const totalCalculado = subtotalCalculado + igvCalculado;

    setSubtotal(subtotalCalculado);
    setIgv(igvCalculado);
    setTotal(totalCalculado);
  };

  useEffect(() => {
    calcularTotales();
  }, [productos]);

  const handleGuardarNotaVenta = async (e) => {
    e?.preventDefault();
    if (!clienteSeleccionado) {
      Swal.fire('Atención', 'Por favor seleccione un cliente', 'warning');
      return;
    }

    if (productos.length === 0) {
      Swal.fire('Atención', 'Por favor agregue al menos un producto', 'warning');
      return;
    }

    setLoading(true);
    try {
      const notaVentaData = {
        clienteId: clienteSeleccionado,
        direccionCliente: formData.direccionCliente,
        establecimiento: formData.establecimiento,
        moneda: formData.moneda,
        tipoPeriodo: formData.tipoPeriodo,
        direccionEnvio: formData.direccionEnvio,
        fechaVencimiento: formData.fechaVencimiento || null,
        placa: formData.placa,
        tipoCambio: parseFloat(formData.tipoCambio) || 3.848,
        ordenCompra: formData.ordenCompra,
        vendedor: formData.vendedor,
        observacion: formData.observacion,
        subtotal: subtotal,
        igv: igv,
        total: total,
        detalles: productos.map(producto => ({
          productoId: producto.productoId || producto.id,
          cantidad: producto.cantidad,
          precioUnitario: producto.precioU || producto.precioUnitario,
          subtotal: producto.subtotal
        })),
        pagos: pagos.filter(pago => pago.agregar && pago.monto > 0)
      };

      const response = await crearNotaVenta(notaVentaData);
      onSuccess?.(response);
    } catch (error) {
      console.error('Error al guardar nota de venta:', error);
      Swal.fire('Error', error.message || 'No se pudo guardar la nota', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductoSeleccionado = (producto) => {
    if (!producto || !producto.id) return;

    const precioVenta = parseFloat(producto.precio_venta || producto.precio || 0);
    const nuevoProducto = {
      id: Date.now(),
      productoId: producto.id,
      descripcion: producto.nombre || producto.descripcion || 'Sin descripción',
      unidad: producto.unidad_medida || producto.unidad || 'UND',
      cantidad: 1,
      valorU: precioVenta,
      precioU: precioVenta,
      precioUnitario: precioVenta,
      subtotal: precioVenta,
      total: precioVenta,
      codigo: producto.codigo || '',
      stock: producto.stock || 0
    };

    setProductos(prevProductos => [...prevProductos, nuevoProducto]);
    setShowModalProductos(false);
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(monto || 0);
  };

  return (
    <div className="flex flex-col space-y-6 bg-white p-4 md:p-8 font-bold italic">
      {/* Upper Grid - Primary Data */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Card - Client Management */}
        <div className="lg:col-span-2 space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/50 italic">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-menta-suave text-menta-petroleo">
              <User size={20} className="font-bold" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-menta-petroleo tracking-wider">Identificación del Cliente</h3>
              <p className="text-[10px] text-slate-400 font-bold italic">Seleccione o cree un cliente para la transacción</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                <span>Cliente / Entidad</span>
                <button
                  type="button"
                  onClick={() => setShowModalCliente(true)}
                  className="flex items-center gap-1.5 text-menta-turquesa hover:text-menta-marino transition font-bold"
                >
                  <UserPlus size={14} />
                  NUEVO CLIENTE
                </button>
              </label>
              <div className="relative font-bold italic">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <select
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 transition"
                  value={clienteSeleccionado}
                  onChange={(e) => setClienteSeleccionado(e.target.value)}
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id} className="font-bold">
                      {cliente.numeroDocumento} - {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Dirección Fiscal / Habitación</label>
              <div className="relative font-bold italic">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  placeholder="Calle, Av. o Distrito..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-menta-turquesa focus:ring-4 focus:ring-menta-turquesa/10 transition"
                  name="direccionCliente"
                  value={formData.direccionCliente}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Establecimiento</label>
              <div className="relative font-bold italic">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-menta-turquesa transition"
                  name="establecimiento"
                  value={formData.establecimiento}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Serie Comprobante</label>
              <div className="relative font-bold italic">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm font-black text-menta-petroleo outline-none focus:border-menta-turquesa transition italic"
                  name="serie"
                  value={formData.serie}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2 font-bold italic">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Divisa Venta</label>
              <div className="relative font-bold italic">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                <select
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-menta-turquesa transition italic"
                  name="moneda"
                  value={formData.moneda}
                  onChange={handleInputChange}
                >
                  <option value="soles">Soles Peruanos (S/.)</option>
                  <option value="dolares">Dólares Americanos ($)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card - Logistics/Context */}
        <div className="space-y-6 rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-200 italic font-bold">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4 font-bold italic">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-menta-suave italic font-bold">
              <Calendar size={20} />
            </div>
            <div className="font-bold italic">
              <h3 className="text-sm font-black uppercase tracking-wider text-white italic font-bold">Lógica de Tiempo</h3>
              <p className="text-[10px] text-slate-500 font-bold italic uppercase">Fechas y responsabilidad</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 font-bold italic">
            <div className="space-y-2 font-bold italic">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic font-bold">F. Emisión</label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-800 bg-slate-800 py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-menta-turquesa transition italic font-bold"
                name="fechaEmision"
                value={formData.fechaEmision}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2 font-bold italic">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic font-bold">F. Vencimiento</label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-800 bg-slate-800 py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-menta-turquesa transition italic font-bold"
                name="fechaVencimiento"
                value={formData.fechaVencimiento}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2 font-bold italic">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic font-bold">Responsable Venta</label>
            <div className="relative font-bold italic">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                className="w-full rounded-xl border border-slate-800 bg-slate-800 py-3 pl-10 pr-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-menta-turquesa transition italic font-bold"
                name="vendedor"
                value={formData.vendedor}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-800/50 p-3 text-[10px] text-slate-400 font-bold italic uppercase">
            <Info size={14} className="text-menta-turquesa shrink-0" />
            Esta nota será generada como un comprobante interno.
          </div>
        </div>
      </div>

      {/* Items Management */}
      <div className="space-y-4 font-bold italic">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 font-bold italic">
          <div className="flex items-center gap-2 text-menta-petroleo font-bold italic">
            <ShoppingCart size={22} className="text-menta-marino" />
            <h3 className="text-lg font-black uppercase tracking-tighter italic font-bold">Detalle de Productos / Servicios</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowModalProductos(true)}
            className="flex items-center gap-2 rounded-xl bg-menta-petroleo px-6 py-3 text-sm font-black text-white shadow-xl shadow-menta-petroleo/20 transition hover:bg-menta-marino active:scale-95 font-bold italic font-bold"
          >
            <Plus size={20} />
            AGREGAR ITEM
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm font-bold italic">
          <table className="w-full text-left text-sm whitespace-nowrap italic font-bold">
            <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-5 text-center font-bold">#</th>
                <th className="px-5 py-5 font-bold">Descripción Técnica</th>
                <th className="px-5 py-5 text-center font-bold">U.M.</th>
                <th className="px-5 py-5 text-center font-bold">Cantidad</th>
                <th className="px-5 py-5 text-right font-bold">Precio Unit.</th>
                <th className="px-5 py-5 text-right font-bold">Total</th>
                <th className="px-5 py-5 text-center font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold italic">
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-24 text-center font-bold italic">
                    <div className="flex flex-col items-center gap-4 text-slate-200 font-bold italic">
                      <LayoutGrid size={64} strokeWidth={1} />
                      <div className="font-bold italic">
                        <p className="text-lg font-black text-slate-400 uppercase tracking-widest italic font-bold">Sin elementos</p>
                        <p className="text-xs text-slate-300 italic font-bold">Agregue productos para iniciar la cotización</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                productos.map((producto, index) => (
                  <tr key={producto.id} className="group transition hover:bg-slate-50/50 font-bold italic">
                    <td className="px-5 py-4 text-center font-bold text-slate-300 font-bold italic">{index + 1}</td>
                    <td className="px-5 py-4 font-bold italic">
                      <input
                        type="text"
                        className="w-full border-none bg-transparent p-0 font-bold text-slate-800 focus:ring-0 outline-none italic font-bold"
                        placeholder="Descripción personalizada..."
                        value={producto.descripcion}
                        onChange={(e) => handleProductoChange(producto.id, 'descripcion', e.target.value)}
                      />
                    </td>
                    <td className="px-5 py-4 text-center font-bold italic">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest font-bold italic">
                        {producto.unidad}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-bold italic">
                      <input
                        type="number"
                        className="w-20 rounded-xl border border-slate-100 bg-slate-50 py-1.5 px-3 text-center text-sm font-black text-slate-800 outline-none focus:border-menta-turquesa transition font-bold italic"
                        value={producto.cantidad}
                        onChange={(e) => handleProductoChange(producto.id, 'cantidad', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-5 py-4 text-right font-bold italic">
                      <input
                        type="number"
                        className="w-28 rounded-xl border border-slate-100 bg-slate-50 py-1.5 px-3 text-right text-sm font-black text-slate-800 outline-none focus:border-menta-turquesa transition font-bold italic"
                        value={producto.precioU}
                        onChange={(e) => handleProductoChange(producto.id, 'precioU', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-5 py-4 text-right font-black text-menta-petroleo text-base italic font-bold">
                      {formatearMoneda(producto.total)}
                    </td>
                    <td className="px-5 py-4 text-center font-bold italic">
                      <button
                        type="button"
                        onClick={() => eliminarProducto(producto.id)}
                        className="rounded-xl p-2.5 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500 hover:scale-110 font-bold italic"
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

      {/* Footer Grid - Observations & Summary */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 font-bold italic">
        {/* Aditional Context */}
        <div className="space-y-6 font-bold italic">
          <div className="space-y-2 font-bold italic">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic font-bold">Notas y Observaciones</label>
            <textarea
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm font-bold text-slate-700 outline-none focus:border-menta-turquesa transition font-bold italic"
              rows="4"
              placeholder="Detalles internos, condiciones de pago, etc..."
              name="observacion"
              value={formData.observacion}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 font-bold italic">
            <div className="space-y-2 font-bold italic">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic font-bold">Asociar Placa</label>
              <div className="relative font-bold italic">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm font-black text-slate-700 outline-none focus:border-menta-turquesa transition italic font-bold"
                  name="placa"
                  value={formData.placa}
                  onChange={handleInputChange}
                  placeholder="---"
                />
              </div>
            </div>
            <div className="space-y-2 font-bold italic">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic font-bold">Referencia O/C</label>
              <div className="relative font-bold italic">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm font-black text-slate-700 outline-none focus:border-menta-turquesa transition italic font-bold"
                  name="ordenCompra"
                  value={formData.ordenCompra}
                  onChange={handleInputChange}
                  placeholder="N/A"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Board */}
        <div className="flex flex-col rounded-3xl bg-slate-900 p-8 text-white shadow-2xl shadow-slate-200 font-bold italic">
          <div className="flex-1 space-y-5 font-bold italic">
            <div className="flex items-center justify-between font-bold italic">
              <div className="flex items-center gap-2 text-slate-400 font-bold italic">
                <LayoutGrid size={14} className="text-slate-500" />
                <span className="text-xs font-black uppercase tracking-widest italic font-bold">Subtotal Gravada</span>
              </div>
              <span className="text-xl font-bold italic">{formatearMoneda(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between font-bold italic">
              <div className="flex items-center gap-2 text-slate-400 font-bold italic">
                <AlertTriangle size={14} className="text-slate-500" />
                <span className="text-xs font-black uppercase tracking-widest italic font-bold">IGV Sistematizado (18%)</span>
              </div>
              <span className="text-xl font-bold italic">{formatearMoneda(igv)}</span>
            </div>
            <div className="my-8 border-t border-slate-800 pt-8 font-bold italic">
              <div className="flex items-end justify-between font-bold italic">
                <div className="font-bold italic">
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[4px] text-menta-turquesa italic font-bold">
                    <CheckCircle size={14} />
                    Importe Total
                  </span>
                  <p className="mt-1 text-[10px] text-slate-500 font-bold italic uppercase tracking-wider">Cálculo exacto en soles</p>
                </div>
                <div className="flex flex-col items-end font-bold italic">
                  <span className="text-5xl font-black tracking-tighter text-white italic font-bold underline decoration-menta-turquesa/30 underline-offset-8">
                    {formatearMoneda(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row font-bold italic">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-2xl border border-slate-700 bg-transparent py-4 text-xs font-black uppercase tracking-widest text-slate-400 transition hover:bg-slate-800 hover:text-white font-bold italic"
            >
              DESCARTAR
            </button>
            <button
              type="submit"
              onClick={handleGuardarNotaVenta}
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-3 rounded-2xl bg-menta-petroleo py-5 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-menta-petroleo/30 transition hover:bg-menta-marino hover:scale-[1.02] active:scale-95 disabled:opacity-50 font-bold italic"
            >
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              ) : (
                <>
                  <Save size={22} strokeWidth={2.5} />
                  GUARDAR NOTA DE VENTA
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Overlays / Modales */}
      {showModalCliente && (
        <ModalCliente
          onClose={() => setShowModalCliente(false)}
          onClienteCreado={(nuevo) => {
            setClientes([...clientes, nuevo]);
            setClienteSeleccionado(nuevo.id);
            setShowModalCliente(false);
          }}
        />
      )}

      {showModalProductos && (
        <FormularioVentaProductServicio
          onClose={() => setShowModalProductos(false)}
          onProductoSeleccionado={handleProductoSeleccionado}
        />
      )}
    </div>
  );
};

export default NotaVentaFormulario;