import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, Calendar, ChevronDown } from 'lucide-react';
import { crearCotizacion, actualizarCotizacion, generarPDFCotizacion, generarPDFCotizacionFormato } from '../../services/cotizacionService';
import { obtenerClientes } from '../../services/clienteService';
import ModalCliente from './ModalCliente';
import FormularioVentaProductServicio from './FormularioVentaProductServicio';
import "../../styles/cotizacionesformulario.css";

const CotizacionesFormulario = ({ onCotizacionGuardada, onCerrar, cotizacionInicial, modoEdicion = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClienteOpen, setIsModalClienteOpen] = useState(false);
  const [showFormularioProducto, setShowFormularioProducto] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cotizacionId, setCotizacionId] = useState(null);
  
  // Estados para clientes
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // Estado para usuario actual
  const [usuarioActual, setUsuarioActual] = useState(null);
  
  // Estados para todos los campos del formulario
  const [formData, setFormData] = useState({
    cliente: '',
    clienteId: null,
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaEntrega: '',
    tiempoValidez: '15',
    tiempoEntrega: '',
    direccionEnvio: '',
    terminoPago: 'Contado',
    numeroCuenta: '',
    moneda: 'SOL',
    vendedor: 'Administrador',
    tipoCambio: '3.85',
    observacion: '',
    validezDias: 15
  });

  const [pagos, setPagos] = useState([
    {
      id: 1,
      metodoPago: 'Efectivo',
      destino: 'CAJA GENERAL',
      referencia: '',
      glosa: '',
      monto: 0
    }
  ]);

  const [nuevoPago, setNuevoPago] = useState({
    metodoPago: 'Efectivo',
    destino: 'CAJA GENERAL',
    referencia: '',
    glosa: '',
    monto: 0
  });

  // Estado para previsualización PDF de cotización
  const [showPreviewCotizacion, setShowPreviewCotizacion] = useState(false);
  const [previewCotizacionPdfUrl, setPreviewCotizacionPdfUrl] = useState('');
  const [cotizacionGuardadaInfo, setCotizacionGuardadaInfo] = useState(null);
  const [cotizacionGuardadaPayload, setCotizacionGuardadaPayload] = useState(null);

  // Cargar clientes al iniciar el componente
  useEffect(() => {
    const cargarClientes = async () => {
      setLoadingClientes(true);
      try {
        const clientesData = await obtenerClientes();
        console.log('Datos de clientes recibidos:', clientesData);
        const listaClientes = clientesData.clientes || clientesData.data || clientesData || [];
        console.log('Lista de clientes procesada:', listaClientes);
        setClientes(listaClientes);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      } finally {
        setLoadingClientes(false);
      }
    };

    cargarClientes();
  }, []);

  // Obtener usuario actual del localStorage
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        setUsuarioActual(usuario);
        console.log('Usuario actual cargado:', usuario);
      } catch (error) {
        console.error('Error al parsear usuario del localStorage:', error);
      }
    }
  }, []);

  // Prefill cuando se edita una cotización
  useEffect(() => {
    if (cotizacionInicial) {
      setCotizacionId(cotizacionInicial.id);
      setFormData(prev => ({
        ...prev,
        cliente: cotizacionInicial.cliente || cotizacionInicial.Cliente?.nombre || '',
        clienteId: cotizacionInicial.clienteId || cotizacionInicial.Cliente?.id || null,
        fechaEmision: (cotizacionInicial.fechaEmision || cotizacionInicial.fecha || new Date().toISOString()).split('T')[0],
        fechaEntrega: cotizacionInicial.fechaEntrega ? cotizacionInicial.fechaEntrega.split('T')[0] : '',
        tiempoValidez: cotizacionInicial.tiempoValidez || '15',
        tiempoEntrega: cotizacionInicial.tiempoEntrega || '',
        direccionEnvio: cotizacionInicial.direccionEnvio || '',
        terminoPago: cotizacionInicial.terminoPago || 'Contado',
        numeroCuenta: cotizacionInicial.numeroCuenta || '',
        moneda: cotizacionInicial.moneda || 'SOL',
        vendedor: cotizacionInicial.vendedor || 'Administrador',
        tipoCambio: cotizacionInicial.tipoCambio || '3.85',
        observacion: cotizacionInicial.observacion || '',
        validezDias: cotizacionInicial.validezDias || 15
      }));

      // Productos desde DetalleCotizacion
      const detalles = cotizacionInicial.DetalleCotizacions || cotizacionInicial.DetalleCotizacion || [];
      if (detalles && detalles.length > 0) {
        const prods = detalles.map((det, idx) => ({
          id: det.productoId || idx,
          nombre: det.Producto?.nombre || det.descripcion || `Producto ${det.productoId}`,
          descripcion: det.descripcion || det.Producto?.nombre || '',
          cantidad: Number(det.cantidad) || 1,
          precioVenta: Number(det.precioUnitario) || 0,
          subtotal: (Number(det.cantidad) || 1) * (Number(det.precioUnitario) || 0)
        }));
        setProductos(prods);
      }

      // Pagos
      if (cotizacionInicial.pagos && Array.isArray(cotizacionInicial.pagos)) {
        setPagos(cotizacionInicial.pagos.map((p, i) => ({
          id: p.id || i + 1,
          metodoPago: p.metodoPago || 'Efectivo',
          destino: p.destino || 'CAJA GENERAL',
          referencia: p.referencia || '',
          glosa: p.glosa || '',
          monto: Number(p.monto) || 0
        })));
      }
    }
  }, [cotizacionInicial]);

  // Función para manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNuevoPago({
      metodoPago: 'Efectivo',
      destino: 'CAJA GENERAL',
      referencia: '',
      glosa: '',
      monto: 0
    });
  };

  const agregarPago = () => {
    const id = Date.now();
    setPagos([...pagos, { ...nuevoPago, id }]);
    closeModal();
  };

  const eliminarPago = (id) => {
    setPagos(pagos.filter(pago => pago.id !== id));
  };

  const handleInputChange = (field, value) => {
    setNuevoPago(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funciones para el modal de cliente
  const closeModalCliente = () => {
    setIsModalClienteOpen(false);
  };

  const handleClienteCreado = (nuevoCliente) => {
    console.log('Cliente creado:', nuevoCliente);
    // Agregar el nuevo cliente a la lista
    setClientes(prev => [...prev, nuevoCliente]);
    // Seleccionar el nuevo cliente
    setFormData(prev => ({
      ...prev,
      clienteId: nuevoCliente.id,
      cliente: nuevoCliente.nombre
    }));
    closeModalCliente();
  };

  // Funciones para el formulario de producto
  const handleProductoGuardado = (nuevoProducto) => {
    console.log('Producto recibido:', nuevoProducto);
    
    // Validar que el producto tenga los datos necesarios
    if (!nuevoProducto) {
      console.error('No se recibió ningún producto');
      return;
    }

    const productoConId = {
      ...nuevoProducto,
      id: nuevoProducto.id || Date.now(),
      cantidad: 1,
      descuento: 0,
      // Usar precioVenta o precio1 como fallback
      precioVenta: nuevoProducto.precioVenta || nuevoProducto.precio1 || 0,
      subtotal: nuevoProducto.precioVenta || nuevoProducto.precio1 || 0,
      // Asegurar que tenga nombre y descripción
      nombre: nuevoProducto.nombre || nuevoProducto.descripcion || 'Producto sin nombre',
      descripcion: nuevoProducto.descripcion || nuevoProducto.nombre || 'Sin descripción'
    };
    
    console.log('Producto procesado:', productoConId);
    setProductos([...productos, productoConId]);
    setShowFormularioProducto(false);
  };

  const handleCancelarProducto = () => {
    setShowFormularioProducto(false);
  };

  // Función para actualizar productos en la tabla
  const actualizarProducto = (id, campo, valor) => {
    setProductos(productos.map(producto => {
      if (producto.id === id) {
        const productoActualizado = { ...producto, [campo]: valor };
        
        // Recalcular subtotal cuando cambie cantidad, valorUnitario o precioVenta
        if (campo === 'cantidad' || campo === 'valorUnitario' || campo === 'precioVenta') {
          const cantidad = campo === 'cantidad' ? valor : producto.cantidad || 1;
          const precio = campo === 'precioVenta' ? valor : producto.precioVenta || 0;
          productoActualizado.subtotal = cantidad * precio;
        }
        
        return productoActualizado;
      }
      return producto;
    }));
  };

  // Función para eliminar producto
  const eliminarProducto = (id) => {
    setProductos(productos.filter(producto => producto.id !== id));
  };

  // Función para editar producto (abrir modal de edición)
  const editarProducto = (id) => {
    const producto = productos.find(p => p.id === id);
    if (producto) {
      // Aquí podrías abrir un modal de edición más completo
      console.log('Editando producto:', producto);
    }
  };

  // Función para guardar cotización con envío al backend
  const guardarCotizacion = async () => {
    try {
      setLoading(true);
      setError('');

      // Validar que el usuario esté autenticado
      if (!usuarioActual) {
        setError('No hay usuario autenticado. Por favor, inicie sesión nuevamente.');
        return;
      }

      // Validar que el usuario tenga ID
      if (!usuarioActual.id) {
        setError('El usuario no tiene un ID válido. Contacte al administrador.');
        return;
      }

      // Validaciones básicas
      if (!formData.clienteId) {
        setError('Debe seleccionar un cliente');
        return;
      }

      if (productos.length === 0) {
        setError('Debe agregar al menos un producto');
        return;
      }

    
      // Calcular totales
      const totalGravado = productos.reduce((sum, producto) => 
        sum + ((producto.precioVenta || 0) * (producto.cantidad || 1)), 0
      );
      const igv = totalGravado * 0.18;
      const total = totalGravado + igv;

      // Preparar datos para enviar al backend
      const cotizacionData = {
        clienteId: formData.clienteId,
        // No enviar usuarioId ni sucursalId - el backend los obtiene del token JWT
        fechaEmision: formData.fechaEmision,
        fechaEntrega: formData.fechaEntrega || null,
        tiempoValidez: formData.tiempoValidez,
        tiempoEntrega: formData.tiempoEntrega,
        direccionEnvio: formData.direccionEnvio,
        terminoPago: formData.terminoPago,
        numeroCuenta: formData.numeroCuenta,
        registradoPor: usuarioActual.nombre || 'Admin',
        vendedor: formData.vendedor,
        cliente: formData.cliente,
        comprobantes: '0',
        notasDeVenta: '0',
        pedido: '',
        oportunidadVenta: '',
        infReferencial: '',
        contrato: '',
        tipoCambio: formData.tipoCambio,
        moneda: formData.moneda,
        tExportacion: 0.00,
        tGratuito: 0.00,
        tInafecta: 0.00,
        tExonerado: 0.00,
        tGravado: totalGravado,
        subtotal: totalGravado,
        igv: igv,
        total: total,
        observacion: formData.observacion,
        validezDias: parseInt(formData.validezDias) || 15,
        productos: productos,
        pagos: pagos,
        detalles: productos.map(producto => ({
          productoId: producto.id,
          cantidad: producto.cantidad || 1,
          precioUnitario: producto.precioVenta || 0,
          subtotal: (producto.cantidad || 1) * (producto.precioVenta || 0),
          descripcion: producto.nombre || producto.descripcion || ''
        }))
      };

      console.log('Datos de cotización a enviar:', cotizacionData);
      
      // Crear o actualizar en backend según modoEdicion
      let result;
      if (modoEdicion && cotizacionId) {
        result = await actualizarCotizacion(cotizacionId, cotizacionData);
      } else {
        result = await crearCotizacion(cotizacionData);
      }
      
      console.log('Respuesta del backend:', result);
      
      // Preparar payload para notificar al cerrar la previsualización
      setCotizacionGuardadaPayload({
        ...cotizacionData,
        id: result.cotizacion.id,
        numeroReferencia: result.cotizacion.numeroReferencia
      });
      
      // Preparar información y abrir modal de previsualización de inmediato
      setCotizacionGuardadaInfo({
        id: result.cotizacion.id,
        numeroReferencia: result.cotizacion.numeroReferencia
      });
      setShowPreviewCotizacion(true);

      // Generar PDF por defecto (A4) en segundo plano
      try {
        const blob = await generarPDFCotizacionFormato(result.cotizacion.id, 'A4');
        const url = window.URL.createObjectURL(blob);
        setPreviewCotizacionPdfUrl(url);
      } catch (pdfErr) {
        console.error('No se pudo generar el PDF de la cotización:', pdfErr);
      }

    } catch (error) {
      console.error('Error completo al guardar cotización:', error);
      console.error('Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.message || 'Error al guardar la cotización');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cotizaciones-container">
      {/* Mostrar errores */}
      {error && (
        <div className="error-message" style={{
          backgroundColor: '#fee', 
          color: '#c33', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {/* Form Grid */}
      <div className="form-grid">
        {/* Cliente - Select tradicional */}
        <div className="form-group">
          <label className="form-label">
            Cliente <span 
              className="nuevo-link"
              onClick={() => setIsModalClienteOpen(true)}
            >
              [+ Nuevo]
            </span>
          </label>
          
          <select
            className="form-input"
            value={formData.clienteId || ''}
            onChange={(e) => {
              const clienteId = e.target.value;
              const clienteSeleccionado = clientes.find(c => c.id.toString() === clienteId);
              setFormData(prev => ({
                ...prev,
                clienteId: clienteId,
                cliente: clienteSeleccionado ? clienteSeleccionado.nombre : ''
              }));
            }}
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} - {cliente.numeroDocumento}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha Emisión */}
        <div className="form-group">
          <label className="form-label">
            Fec. Emisión
          </label>
          <input
            type="date"
            className="form-input"
            value={formData.fechaEmision}
            onChange={(e) => handleFormChange('fechaEmision', e.target.value)}
          />
        </div>

        {/* Fecha Entrega */}
        <div className="form-group">
          <label className="form-label">
            Fec. Entrega
          </label>
          <input
            type="date"
            className="form-input"
            value={formData.fechaEntrega}
            onChange={(e) => handleFormChange('fechaEntrega', e.target.value)}
          />
        </div>

        {/* Tiempo de Validez */}
        <div className="form-group">
          <label className="form-label">
            Tiempo de Validez (días)
          </label>
          <input
            type="number"
            className="form-input"
            value={formData.validezDias}
            onChange={(e) => handleFormChange('validezDias', e.target.value)}
          />
        </div>

        {/* Tiempo de Entrega */}
        <div className="form-group">
          <label className="form-label">
            Tiempo de Entrega
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.tiempoEntrega}
            onChange={(e) => handleFormChange('tiempoEntrega', e.target.value)}
          />
        </div>

        {/* Dirección de envío */}
        <div className="form-group">
          <label className="form-label">
            Dirección de envío
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.direccionEnvio}
            onChange={(e) => handleFormChange('direccionEnvio', e.target.value)}
          />
        </div>

        {/* Término de pago */}
        <div className="form-group">
          <label className="form-label">
            Término de pago
          </label>
          <select 
            className="form-select"
            value={formData.terminoPago}
            onChange={(e) => handleFormChange('terminoPago', e.target.value)}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta de débito">Tarjeta de débito</option>
            <option value="Tarjeta de crédito">Tarjeta de crédito</option>
            <option value="Plin">Plin</option>
            <option value="Yape">Yape</option>
            <option value="Contado">Contado</option>
            <option value="Crédito">Crédito</option>
            <option value="A 30 días">A 30 días</option>
            <option value="Factura a 15 días">Factura a 15 días</option>
            <option value="Factura a 30 días">Factura a 30 días</option>
            <option value="Factura a 45 días">Factura a 45 días</option>
            <option value="Factura a 60 días">Factura a 60 días</option>
            <option value="Contado contraentrega">Contado contraentrega</option>
            <option value="Tarjeta crédito visa">Tarjeta crédito visa</option>
          </select>
        </div>

        {/* Número de cuenta */}
        <div className="form-group">
          <label className="form-label">
            Número de cuenta
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.numeroCuenta}
            onChange={(e) => handleFormChange('numeroCuenta', e.target.value)}
          />
        </div>

        {/* Moneda */}
        <div className="form-group">
          <label className="form-label">
            Moneda
          </label>
          <select 
            className="form-select"
            value={formData.moneda}
            onChange={(e) => handleFormChange('moneda', e.target.value)}
          >
            <option value="SOL">SOL</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        {/* Vendedor */}
        <div className="form-group">
          <label className="form-label">
            Vendedor
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.vendedor}
            onChange={(e) => handleFormChange('vendedor', e.target.value)}
          />
        </div>

        {/* Tipo de cambio */}
        <div className="form-group">
          <label className="form-label">
            Tipo de cambio
          </label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            value={formData.tipoCambio}
            onChange={(e) => handleFormChange('tipoCambio', e.target.value)}
          />
        </div>

        {/* Observación */}
        <div className="form-group full-width">
          <label className="form-label">
            Observación
          </label>
          <textarea
            className="form-input"
            rows="3"
            value={formData.observacion}
            onChange={(e) => handleFormChange('observacion', e.target.value)}
            placeholder="Observaciones adicionales..."
          />
        </div>
      </div>

      {/* Pagos Section */}
      <div className="pagos-section">
        <div className="pagos-header">
          <h3 className="section-title">Pagos</h3>
          <button
            onClick={openModal}
            className="btn-agregar"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>

        {/* Pagos List */}
        <div className="pagos-list">
          <div className="pagos-grid-header">
            <div>Método de pago</div>
            <div>Destino</div>
            <div>Referencia</div>
            <div>Glosa</div>
            <div>Monto</div>
            <div></div>
          </div>
          
          {pagos.map((pago) => (
            <div key={pago.id} className="pago-item">
              <div className="text-sm">{pago.metodoPago}</div>
              <div className="text-sm">{pago.destino}</div>
              <div className="text-sm">{pago.referencia || '-'}</div>
              <div className="text-sm">{pago.glosa || '-'}</div>
              <div className="text-sm">{pago.monto}</div>
              <div>
                <button
                  onClick={() => eliminarPago(pago.id)}
                  className="btn-eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="btn-primary"
          onClick={() => setShowFormularioProducto(true)}
        >
          + Agregar Productos
        </button>
       
      
      </div>

      {/* Products Table */}
      <div className="products-table">
        <div className="table-header">
          <div className="table-grid-extended">
            <div>#</div>
            <div>Descripción</div>
            <div>Unidad</div>
            <div>Cantidad</div>
            <div>Valor U.</div>
            <div>Precio U.</div>
            <div>Subtotal</div>
            <div>Total</div>
            <div>Acciones</div>
          </div>
        </div>
        {productos.length === 0 ? (
          <div className="table-empty">
            No hay productos agregados
          </div>
        ) : (
          <div className="table-body">
            {productos.map((producto, index) => (
              <div key={producto.id} className="table-row table-grid-extended">
                <div>{index + 1}</div>
                <div>
                  <input
                    type="text"
                    value={producto.nombre || producto.descripcion || ''}
                    onChange={(e) => actualizarProducto(producto.id, 'nombre', e.target.value)}
                    className="table-input"
                    placeholder="Descripción del producto"
                  />
                  {producto.detalles && (
                    <div className="product-details">
                      {producto.detalles}
                    </div>
                  )}
                </div>
                <div>
                  <select
                    value={producto.unidadMedida || 'NIU'}
                    onChange={(e) => actualizarProducto(producto.id, 'unidadMedida', e.target.value)}
                    className="table-select"
                  >
                    <option value="NIU">Unidad</option>
                    <option value="MTQ">MTQ</option>
                    <option value="KGM">Kilogramo</option>
                    <option value="MTR">Metro</option>
                    <option value="LTR">Litro</option>
                    <option value="M2">Metro²</option>
                    <option value="M3">Metro³</option>
                    <option value="CJA">Caja</option>
                    <option value="PQT">Paquete</option>
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    value={producto.cantidad || 1}
                    onChange={(e) => actualizarProducto(producto.id, 'cantidad', parseFloat(e.target.value) || 1)}
                    className="table-input-number"
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={producto.valorUnitario || producto.precioVenta || 0}
                    onChange={(e) => actualizarProducto(producto.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                    className="table-input-number"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={producto.precioVenta || 0}
                    onChange={(e) => actualizarProducto(producto.id, 'precioVenta', parseFloat(e.target.value) || 0)}
                    className="table-input-number"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="table-calculated">
                  S/ {((producto.valorUnitario || producto.precioVenta || 0) * (producto.cantidad || 1)).toFixed(2)}
                </div>
                <div className="table-calculated">
                  S/ {((producto.precioVenta || 0) * (producto.cantidad || 1)).toFixed(2)}
                </div>
                <div className="table-actions">
                  <button
                    onClick={() => editarProducto(producto.id)}
                    className="btn-edit"
                    title="Editar producto"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => eliminarProducto(producto.id)}
                    className="btn-delete"
                    title="Eliminar producto"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="form-actions">
        <button
          onClick={() => onCerrar && onCerrar()}
          className="btn-secondary"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          onClick={guardarCotizacion}
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Generar Cotización'}
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Agregar Pago</h3>
              <button
                onClick={closeModal}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Método de pago */}
              <div className="modal-form-group">
                <label className="form-label">
                  Método de pago
                </label>
                <select
                  value={nuevoPago.metodoPago}
                  onChange={(e) => handleInputChange('metodoPago', e.target.value)}
                  className="form-select"
                >
                 <option>Plin</option>
            <option>Yape</option>
            <option>Factura a 60 días</option> 

            <option>Factura a 45 días</option>  
            <option>Factura a 15 días</option>  
            <option>Contado</option>  
            <option>Crédito</option>  
            <option>A 30 días</option>  
            <option>Contado contraentrega</option>  
            <option>Tarjeta crédito visa</option> 
             <option>Factura a 30 días</option>  
             <option> Transferencia </option>  
              <option> Tarjeta de débito </option>  
               <option> Tarjeta de crédito </option>  
                <option> Efectivo </option>
                </select>
              </div>

              {/* Destino */}
              <div className="modal-form-group">
                <label className="form-label">
                  Destino
                </label>
                <select
                  value={nuevoPago.destino}
                  onChange={(e) => handleInputChange('destino', e.target.value)}
                  className="form-select"
                >
                  <option>CAJA GENERAL</option> 
                </select>
              </div>

              {/* Referencia */}
              <div className="modal-form-group">
                <label className="form-label">
                  Referencia
                </label>
                <input
                  type="text"
                  value={nuevoPago.referencia}
                  onChange={(e) => handleInputChange('referencia', e.target.value)}
                  className="form-input"
                  placeholder="Número de operación, cheque, etc."
                />
              </div>

              {/* Glosa */}
              <div className="modal-form-group">
                <label className="form-label">
                  Glosa
                </label>
                <textarea
                  value={nuevoPago.glosa}
                  onChange={(e) => handleInputChange('glosa', e.target.value)}
                  className="modal-textarea"
                  rows="3"
                  placeholder="Descripción del pago"
                />
              </div>

              {/* Monto */}
              <div className="modal-form-group">
                <label className="form-label">
                  Monto
                </label>
                <input
                  type="number"
                  value={nuevoPago.monto}
                  onChange={(e) => handleInputChange('monto', parseFloat(e.target.value) || 0)}
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={closeModal}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={agregarPago}
                className="btn-confirm"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista previa de Cotización con opciones de impresión/descarga */}
      {showPreviewCotizacion && (
        <div className="modal-overlay" style={{ zIndex: 1600 }}>
          <div className="modal-content" style={{ width: '90%', maxWidth: '1100px' }}>
            <div className="modal-header" style={{ backgroundColor: '#2ecc71', color: 'white' }}>
              <h3 style={{ margin: 0 }}>
                {`Cotización registrada: ${cotizacionGuardadaInfo?.numeroReferencia || ''}`}
              </h3>
              <button
                className="btn-close"
                onClick={() => {
                  setShowPreviewCotizacion(false);
                  if (previewCotizacionPdfUrl) {
                    window.URL.revokeObjectURL(previewCotizacionPdfUrl);
                    setPreviewCotizacionPdfUrl('');
                  }
                  if (onCotizacionGuardada && cotizacionGuardadaPayload) {
                    onCotizacionGuardada(cotizacionGuardadaPayload);
                    setCotizacionGuardadaPayload(null);
                  }
                }}
                style={{ color: 'white', borderColor: 'white' }}
              >
                ×
              </button>
            </div>

            {/* Barra de acciones */}
            <div style={{ display: 'flex', gap: '12px', padding: '10px 12px' }}>
              <button
                onClick={async () => {
                  const blob = await generarPDFCotizacionFormato(cotizacionGuardadaInfo.id, 'A4');
                  const url = window.URL.createObjectURL(blob);
                  setPreviewCotizacionPdfUrl((old) => { if (old) window.URL.revokeObjectURL(old); return url; });
                }}
                style={{ background: 'transparent', color: '#2ecc71', border: 'none', cursor: 'pointer' }}
              >
                Imprimir A4
              </button>
              <button
                onClick={async () => {
                  const blob = await generarPDFCotizacionFormato(cotizacionGuardadaInfo.id, 'ticket');
                  const url = window.URL.createObjectURL(blob);
                  setPreviewCotizacionPdfUrl((old) => { if (old) window.URL.revokeObjectURL(old); return url; });
                }}
                style={{ background: 'transparent', color: '#2ecc71', border: 'none', cursor: 'pointer' }}
              >
                Imprimir Ticket
              </button>
              <button
                onClick={async () => {
                  // A5 no soportado; usar A4 como alternativa
                  const blob = await generarPDFCotizacionFormato(cotizacionGuardadaInfo.id, 'A4');
                  const url = window.URL.createObjectURL(blob);
                  setPreviewCotizacionPdfUrl((old) => { if (old) window.URL.revokeObjectURL(old); return url; });
                }}
                style={{ background: 'transparent', color: '#2ecc71', border: 'none', cursor: 'pointer' }}
              >
                Imprimir A5
              </button>
            </div>

            {/* Visor PDF */}
            <div style={{ height: '70vh', borderTop: '1px solid #eee' }}>
              {previewCotizacionPdfUrl ? (
                <iframe
                  src={previewCotizacionPdfUrl}
                  title="Vista previa de Cotización"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <div style={{ padding: 20 }}>Generando vista previa...</div>
              )}
            </div>

            {/* Acciones de descarga */}
            <div style={{ display: 'flex', gap: 16, padding: '12px' }}>
              <button
                onClick={async () => {
                  const blob = await generarPDFCotizacionFormato(cotizacionGuardadaInfo.id, 'A4');
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${cotizacionGuardadaInfo?.numeroReferencia || 'COTIZACION'}.pdf`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="nvf-btn-guardar"
                style={{ backgroundColor: '#3498db', color: 'white' }}
              >
                Descargar A4
              </button>
              <button
                onClick={async () => {
                  const blob = await generarPDFCotizacionFormato(cotizacionGuardadaInfo.id, 'ticket');
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${cotizacionGuardadaInfo?.numeroReferencia || 'COTIZACION'}-80mm.pdf`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="nvf-btn-guardar"
                style={{ backgroundColor: '#3498db', color: 'white' }}
              >
                Descargar 80mm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cliente */}
      {isModalClienteOpen && (
        <ModalCliente
          onClose={closeModalCliente}
          onClienteCreado={handleClienteCreado}
        />
      )}

      {/* Modal Formulario Producto */}
      {showFormularioProducto && (
        <div className="modal-overlay" style={{ zIndex: 1001 }}>
          <div className="modal-content" style={{ maxWidth: '95%', maxHeight: '95%', overflow: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">Agregar Producto</h3>
              <button
                onClick={handleCancelarProducto}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <FormularioVentaProductServicio
                onProductoSeleccionado={handleProductoGuardado}
                productos={productos}
                onCancelar={handleCancelarProducto}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CotizacionesFormulario;