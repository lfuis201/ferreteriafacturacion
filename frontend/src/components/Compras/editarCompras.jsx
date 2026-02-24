
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/editarCompras.css';
import { obtenerCompraPorId, actualizarCompra } from '../../services/compraService';
import { obtenerProveedores } from '../../services/proveedorService';
import { obtenerProductos } from '../../services/productoService';
import { obtenerClientes } from '../../services/clienteService';
import { consultarReniec, consultarSunat } from '../../services/consultaService';

const EditarCompras = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [agregarCliente, setAgregarCliente] = useState(false);
  const [agregarPagos, setAgregarPagos] = useState(false);
  const [tieneIGV, setTieneIGV] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  
  // Estados para datos reales
  const [proveedores, setProveedores] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [clientes, setClientes] = useState([]);
  
  // Estados para clientes
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  
  const [formData, setFormData] = useState({
    tipoComprobante: '',
    serie: '',
    numero: '',
    fechaEmision: '',
    fechaVencimiento: '',
    proveedor: '',
    proveedorId: '',
    moneda: 'Soles',
    tipoCambio: '3.510',
    constDetraccion: '',
    fechaDetraccion: '',
    porcentajeDetraccion: '',
    condicionPago: 'Contado'
  });

  const [productos, setProductos] = useState([]);

  const [formasPago, setFormasPago] = useState([]);

  // Función para cargar datos iniciales
  const cargarDatosIniciales = async () => {
    try {
      const [proveedoresData, clientesData] = await Promise.all([
        obtenerProveedores(),
        obtenerClientes()
      ]);
      
      setProveedores(proveedoresData || []);
      setClientes(clientesData || []);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cerrar lista de clientes al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.fc-cliente-container')) {
        setMostrarListaClientes(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [proveedorData, setProveedorData] = useState({
    tipoDoc: 'RUC',
    numero: '',
    nombre: '',
    nombreComercial: '',
    diasCredito: 0,
    codigoInterno: '',
    codigoBarra: '',
    aplicaRetencion: false,
    telefono: '',
    nacionalidad: 'PERU',
    regimenTributario: '',
    tipoProveedor: '',
    vendedor: '',
    calificacion: '',
    esAgente: false
  });

  const agregarProducto = () => {
    const nuevoProducto = {
      id: productos.length + 1,
      descripcion: '',
      detalle: 'Gravado - Operación Onerosa',
      almacen: 'Almacén Oficina Principal',
      lote: '',
      unidad: 'NIU',
      cantidad: 1.0000,
      valorU: 0,
      precioU: 0,
      descuento: 0,
      cargo: 0,
      total: 0
    };
    setProductos([...productos, nuevoProducto]);
  };

  const eliminarProducto = (id) => {
    setProductos(productos.filter(producto => producto.id !== id));
  };

  const agregarFormaPago = () => {
    const nuevaFormaPago = {
      id: formasPago.length + 1,
      formaPago: 'Efectivo',
      desde: 'CAJA GENERAL - Administrador',
      referencia: '',
      glosa: '',
      monto: 0
    };
    setFormasPago([...formasPago, nuevaFormaPago]);
  };

  const eliminarFormaPago = (id) => {
    setFormasPago(formasPago.filter(pago => pago.id !== id));
  };

  // Funciones para manejar clientes
  const handleBusquedaCliente = (e) => {
    const valor = e.target.value;
    setBusquedaCliente(valor);

    if (valor.trim() === '') {
      setClientesFiltrados([]);
      setMostrarListaClientes(false);
      return;
    }

    // Filtrar clientes por nombre o número de documento
    const clientesFiltrados = clientes.filter(cliente => 
      cliente.nombre?.toLowerCase().includes(valor.toLowerCase()) ||
      cliente.numeroDocumento?.includes(valor)
    );

    setClientesFiltrados(clientesFiltrados);
    setMostrarListaClientes(true);
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente(`${cliente.nombre} - ${cliente.numeroDocumento}`);
    setMostrarListaClientes(false);
  };

  const limpiarSeleccionCliente = () => {
    setClienteSeleccionado(null);
    setBusquedaCliente('');
    setClientesFiltrados([]);
    setMostrarListaClientes(false);
  };

  const calcularTotales = () => {
    const subtotal = productos.reduce((sum, producto) => sum + producto.total, 0);
    const igv = tieneIGV ? subtotal * 0.18 : 0;
    const total = subtotal + igv;
    
    return {
      opGravada: tieneIGV ? subtotal : 0,
      igv: igv,
      total: total
    };
  };

  const totales = calcularTotales();

  // Cargar datos de la compra
  useEffect(() => {
    const cargarCompra = async () => {
      if (!id) {
        setError('ID de compra no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Cargando compra con ID:', id);
        const compraData = await obtenerCompraPorId(id);
        console.log('Datos de compra recibidos:', compraData);
        
        if (compraData && compraData.compra) {
          const compra = compraData.compra;
          
          // Actualizar formData con los datos de la compra
          setFormData({
            tipoComprobante: compra.tipoComprobante || '',
            serie: compra.serie || '',
            numero: compra.numeroComprobante || '',
            fechaEmision: compra.fechaCompra ? compra.fechaCompra.split('T')[0] : '',
            fechaVencimiento: compra.fechaVencimiento ? compra.fechaVencimiento.split('T')[0] : '',
            proveedor: compra.Proveedor ? `${compra.Proveedor.numeroDocumento} - ${compra.Proveedor.nombre}` : '',
            proveedorId: compra.proveedorId || '',
            moneda: compra.moneda || 'Soles',
            tipoCambio: compra.tipoCambio || '3.510',
            constDetraccion: compra.constDetraccion || '',
            fechaDetraccion: compra.fechaDetraccion || '',
            porcentajeDetraccion: compra.porcentajeDetraccion || '',
            condicionPago: compra.condicionPago || 'Contado'
          });

          // Actualizar productos si existen detalles
          if (compra.DetalleCompras && compra.DetalleCompras.length > 0) {
            const productosFormateados = compra.DetalleCompras.map((detalle, index) => ({
              id: index + 1,
              descripcion: detalle.Producto ? detalle.Producto.nombre : '',
              detalle: 'Gravado - Operación Onerosa',
              almacen: 'Almacén Oficina Principal',
              lote: '',
              unidad: detalle.Producto ? detalle.Producto.unidadMedida : 'NIU',
              cantidad: parseFloat(detalle.cantidad) || 0,
              valorU: parseFloat(detalle.precioUnitario) || 0,
              precioU: parseFloat(detalle.precioUnitario) || 0,
              descuento: 0,
              cargo: 0,
              total: parseFloat(detalle.subtotal) || 0
            }));
            setProductos(productosFormateados);
          }

          // Actualizar formas de pago si existen
          if (compra.PagoCompras && compra.PagoCompras.length > 0) {
            const pagosFormateados = compra.PagoCompras.map((pago, index) => ({
              id: index + 1,
              formaPago: pago.formaPago || 'Efectivo',
              desde: 'CAJA GENERAL - Administrador',
              referencia: pago.referencia || '',
              glosa: pago.glosa || '',
              monto: parseFloat(pago.monto) || 0
            }));
            setFormasPago(pagosFormateados);
          }

          // Verificar si tiene IGV
          setTieneIGV(compra.igv > 0);
          
          // Verificar si tiene cliente asociado
          if (compra.Cliente || compra.cliente) {
            const cliente = compra.Cliente || compra.cliente;
            setAgregarCliente(true);
            setClienteSeleccionado(cliente);
            setBusquedaCliente(`${cliente.nombre} - ${cliente.numeroDocumento}`);
          }
          
          // Verificar si tiene pagos
          if (compra.PagoCompras && compra.PagoCompras.length > 0) {
            setAgregarPagos(true);
          }
        }
        
      } catch (error) {
        console.error('Error al cargar compra:', error);
        setError('Error al cargar los datos de la compra: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarCompra();
  }, [id]);

  // Función para guardar cambios
  const guardarCambios = async () => {
    try {
      setGuardando(true);
      setError(null);

      const datosActualizados = {
        tipoComprobante: formData.tipoComprobante,
        serie: formData.serie,
        numeroComprobante: formData.numero,
        fechaCompra: formData.fechaEmision,
        fechaVencimiento: formData.fechaVencimiento,
        proveedorId: formData.proveedorId,
        clienteId: clienteSeleccionado ? clienteSeleccionado.id : null,
        moneda: formData.moneda,
        tipoCambio: parseFloat(formData.tipoCambio),
        condicionPago: formData.condicionPago,
        subtotal: totales.opGravada,
        igv: totales.igv,
        total: totales.total,
        detalles: productos.map(producto => ({
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precioUnitario: producto.precioU,
          subtotal: producto.total
        })),
        pagos: formasPago.map(pago => ({
          formaPago: pago.formaPago,
          monto: pago.monto,
          referencia: pago.referencia,
          glosa: pago.glosa
        }))
      };

      console.log('Guardando cambios:', datosActualizados);
      const resultado = await actualizarCompra(id, datosActualizados);
      console.log('Compra actualizada:', resultado);
      
      alert('Compra actualizada exitosamente');
      navigate('/compras/lista');
      
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      setError('Error al guardar los cambios: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="editar-compras">
        <div className="loading">Cargando datos de la compra...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editar-compras">
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/compras/lista')}>Volver a la lista</button>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-compras">
      <h2 className="titulo">Editar Compra</h2>
      
      <div className="formulario-compra">
        {/* Encabezado del formulario */}
        <div className="fila">
          <div className="campo">
            <label>Tipo comprobante</label>
            <select 
              value={formData.tipoComprobante}
              onChange={(e) => setFormData({...formData, tipoComprobante: e.target.value})}
            >
              <option>FACTURA ELECTRÓNICA</option>
            </select>
          </div>
          <div className="campo">
            <label>Serie *</label>
            <input 
              type="text" 
              value={formData.serie}
              onChange={(e) => setFormData({...formData, serie: e.target.value})}
            />
          </div>
          <div className="campo">
            <label>Número *</label>
            <input 
              type="text" 
              value={formData.numero}
              onChange={(e) => setFormData({...formData, numero: e.target.value})}
            />
          </div>
          <div className="campo">
            <label>Fec Emisión</label>
            <input 
              type="date" 
              value={formData.fechaEmision}
              onChange={(e) => setFormData({...formData, fechaEmision: e.target.value})}
            />
          </div>
          <div className="campo">
            <label>Fec. Vencimiento</label>
            <input 
              type="date" 
              value={formData.fechaVencimiento}
              onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})}
            />
          </div>
        </div>

        {/* Segunda fila */}
        <div className="fila">

          <div className="campo-proveedor">
            
            <label>
              Proveedor 

             {/* <button 
                className="btn-nuevo"
                onClick={() => setShowProveedorModal(true)}
              >
                [+ Nuevo]
              </button>*/}

            </label>

            <input 
              type="text" 
              value={formData.proveedor}
              readOnly
            />
          </div>
          
          <div className="campo">
            <label>Moneda</label>
            <select 
              value={formData.moneda}
              onChange={(e) => setFormData({...formData, moneda: e.target.value})}
            >
              <option>Soles</option>
              <option>Dólares</option>
            </select>
          </div>
          <div className="campo">
            <label>Tipo de cambio</label>
            <input 
              type="text" 
              value={formData.tipoCambio}
              onChange={(e) => setFormData({...formData, tipoCambio: e.target.value})}
            />
          </div>
        </div>

        {/* Campos de detracción */}
        <div className="fila">
          <div className="campo">
            <label>Const. Detracción</label>
            <input 
              type="text" 
              placeholder="Const. Detracción"
              value={formData.constDetraccion}
              onChange={(e) => setFormData({...formData, constDetraccion: e.target.value})}
            />
          </div>
          <div className="campo">
            <label>Fecha Detracción</label>
            <input 
              type="date" 
              placeholder="Fecha Detracción"
              value={formData.fechaDetraccion}
              onChange={(e) => setFormData({...formData, fechaDetraccion: e.target.value})}
            />
          </div>
          <div className="campo">
            <label>Porcentaje Detracción</label>
            <input 
              type="text" 
              placeholder="Porcentaje Detracción"
              value={formData.porcentajeDetraccion}
              onChange={(e) => setFormData({...formData, porcentajeDetraccion: e.target.value})}
            />
          </div>
         
        </div>

        {/* Checkboxes */}
        <div className="checkboxes-section">
          <div className="checkbox-item">
            <input 
              type="checkbox" 
              id="agregarCliente"
              checked={agregarCliente}
              onChange={(e) => setAgregarCliente(e.target.checked)}
            />
            <label htmlFor="agregarCliente">¿Desea agregar el cliente para esta compra?</label>
          </div>
          
          <div className="checkbox-item">
            <input 
              type="checkbox" 
              id="tieneIGV"
              checked={tieneIGV}
              onChange={(e) => setTieneIGV(e.target.checked)}
            />
            <label htmlFor="tieneIGV">¿La compra tiene el 10% de IGV?</label>
          </div>
          
          <div className="checkbox-item">
            <input 
              type="checkbox" 
              id="agregarPagos"
              checked={agregarPagos}
              onChange={(e) => setAgregarPagos(e.target.checked)}
            />
            <label htmlFor="agregarPagos">¿Desea agregar pagos a esta compra?</label>
          </div>
        </div>

        {/* Sección de cliente */}
        {agregarCliente && (
          <div className="fc-section">
            <h3 className="fc-section-title">Clientes</h3>
            <div className="fc-cliente-container">
              <div className="fc-cliente-busqueda">
                <input 
                  type="text" 
                  placeholder="Nombre o número de documento"
                  value={busquedaCliente}
                  onChange={handleBusquedaCliente}
                  className="fc-input fc-cliente-input"
                />
                {clienteSeleccionado && (
                  <button 
                    type="button"
                    onClick={limpiarSeleccionCliente}
                    className="fc-btn-limpiar"
                  >
                    ✕
                  </button>
                )}

                {/* Lista de clientes filtrados */}
                {mostrarListaClientes && clientesFiltrados.length > 0 && (
                  <div className="fc-clientes-dropdown">
                    {clientesFiltrados.slice(0, 10).map((cliente) => (
                      <div 
                        key={cliente.id}
                        className="fc-cliente-item"
                        onClick={() => seleccionarCliente(cliente)}
                      >
                        <div className="fc-cliente-nombre">{cliente.nombre}</div>
                        <div className="fc-cliente-documento">
                          {cliente.tipoDocumento}: {cliente.numeroDocumento}
                        </div>
                        {cliente.telefono && (
                          <div className="fc-cliente-telefono">Tel: {cliente.telefono}</div>
                        )}
                      </div>
                    ))}
                    {clientesFiltrados.length > 10 && (
                      <div className="fc-cliente-item fc-mas-resultados">
                        Y {clientesFiltrados.length - 10} clientes más...
                      </div>
                    )}
                  </div>
                )}

                {/* Mensaje cuando no hay resultados */}
                {mostrarListaClientes && busquedaCliente && clientesFiltrados.length === 0 && (
                  <div className="fc-clientes-dropdown">
                    <div className="fc-cliente-item fc-no-resultados">
                      No se encontraron clientes con ese criterio
                    </div>
                  </div>
                )}
              </div>

              {/* Información del cliente seleccionado */}
              {clienteSeleccionado && (
                <div className="fc-cliente-seleccionado">
                  <div className="fc-cliente-info">
                    <strong>{clienteSeleccionado.nombre}</strong>
                    <span>{clienteSeleccionado.tipoDocumento}: {clienteSeleccionado.numeroDocumento}</span>
                    {clienteSeleccionado.direccion && (
                      <span>Dirección: {clienteSeleccionado.direccion}</span>
                    )}
                    {clienteSeleccionado.telefono && (
                      <span>Teléfono: {clienteSeleccionado.telefono}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Condición de pago y formas de pago */}
        {agregarPagos && (
          <div className="seccion-pagos">
            <div className="condicion-pago">
              <label>Condición de pago</label>
              <select 
                value={formData.condicionPago}
                onChange={(e) => setFormData({...formData, condicionPago: e.target.value})}
              >
                <option>Contado</option>
                <option>Crédito</option>
              </select>
            </div>

            <div className="formas-pago">
              <div className="encabezado-formas-pago">
                <span>Forma de pago</span>
                <span>Desde</span>
                <span>Referencia</span>
                <span>Glosa</span>
                <span>Monto</span>
                <button 
                  className="btn-agregar-pago"
                  onClick={agregarFormaPago}
                >
                  [+ Agregar]
                </button>
              </div>

              {formasPago.map((forma) => (
                <div key={forma.id} className="fila-forma-pago">
                  <select value={forma.formaPago}>
                    <option>Efectivo</option>
                    <option>Transferencia</option>
                    <option>Cheque</option>
                  </select>
                  <select value={forma.desde}>
                    <option>CAJA GENERAL - Administrador</option>
                  </select>
                  <input type="text" value={forma.referencia} />
                  <input type="text" value={forma.glosa} />
                  <input type="number" value={forma.monto} />
                  <button 
                    className="btn-eliminar"
                    onClick={() => eliminarFormaPago(forma.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón agregar producto */}
        <button className="btn-agregar-producto" onClick={agregarProducto}>
          + Agregar Producto
        </button>

        {/* Tabla de productos */}
        <div className="tabla-productos">
          <div className="encabezado-tabla">
            <span>#</span>
            <span>Descripción</span>
            <span>Almacén</span>
            <span>Lote</span>
            <span>Unidad</span>
            <span>Cantidad</span>
            <span>Valor U.</span>
            <span>Precio U.</span>
            <span>Descuento</span>
            <span>Cargo</span>
            <span>Total</span>
            <span>Acciones</span>
          </div>

          {productos.map((producto) => (
            <div key={producto.id} className="fila-producto">
              <span>{producto.id}</span>
              <div className="descripcion-producto">
                <div className="nombre-producto">{producto.descripcion}</div>
                <div className="detalle-producto">{producto.detalle}</div>
              </div>
              <span>{producto.almacen}</span>
              <span>{producto.lote}</span>
              <span>{producto.unidad}</span>
              <span>{producto.cantidad}</span>
              <span>S/ {producto.valorU.toFixed(6)}</span>
              <span>S/ {producto.precioU.toFixed(6)}</span>
              <span>S/ {producto.descuento}</span>
              <span>S/ {producto.cargo}</span>
              <span>S/ {producto.total.toFixed(2)}</span>
              <div className="acciones-producto">
                <button 
                  className="btn-eliminar"
                  onClick={() => eliminarProducto(producto.id)}
                >
                  ✕
                </button>
                <button className="btn-editar">✎</button>
              </div>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="totales">
          <div className="totales-info">
            <div>OP.GRAVADA: S/ {totales.opGravada.toFixed(2)}</div>
            <div>IGV: S/ {totales.igv.toFixed(2)}</div>
            <div className="total-final">TOTAL COMPRAS: S/ {totales.total.toFixed(2)}</div>
          </div>
        </div>

        {/* Botones finales */}
        <div className="botones-finales">
          <button 
            className="btn-cancelar" 
            onClick={() => navigate('/compras/lista')}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button 
            className="btn-guardar" 
            onClick={guardarCambios}
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Modal Nuevo Proveedor */}
      {showProveedorModal && (
        <div className="modal-overlay">
          <div className="modal-proveedor">
            <div className="modal-header">
              <h3>Nuevo Proveedor</h3>
              <button 
                className="btn-cerrar-modal"
                onClick={() => setShowProveedorModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-tabs">
              <button className="tab active">Datos del proveedor</button>
              <button className="tab">Dirección</button>
              <button className="tab">Otros Datos</button>
              <button className="tab">Direcciones de envío (Guías)</button>
            </div>

            <div className="modal-content">
              <div className="fila-modal">
                <div className="campo-modal">
                  <label>Tipo Doc. Identidad *</label>
                  <select 
                    value={proveedorData.tipoDoc}
                    onChange={(e) => setProveedorData({...proveedorData, tipoDoc: e.target.value})}
                  >
                    <option>RUC</option>
                    <option>DNI</option>
                  </select>
                </div>
                <div className="campo-modal">
                  <label>Número *</label>
                  <div className="numero-input">
                    <input 
                      type="text" 
                      value={proveedorData.numero}
                      onChange={(e) => setProveedorData({...proveedorData, numero: e.target.value})}
                      placeholder="0/11"
                    />
                    <button className="btn-sunat">🔍 SUNAT</button>
                  </div>
                </div>
              </div>

              <div className="fila-modal">
                <div className="campo-modal">
                  <label>Nombre *</label>
                  <input 
                    type="text" 
                    value={proveedorData.nombre}
                    onChange={(e) => setProveedorData({...proveedorData, nombre: e.target.value})}
                  />
                </div>
                <div className="campo-modal">
                  <label>Nombre comercial</label>
                  <input 
                    type="text" 
                    value={proveedorData.nombreComercial}
                    onChange={(e) => setProveedorData({...proveedorData, nombreComercial: e.target.value})}
                  />
                </div>
              </div>

              <div className="fila-modal">
                <div className="campo-modal">
                  <label>Días de crédito</label>
                  <input 
                    type="number" 
                    value={proveedorData.diasCredito}
                    onChange={(e) => setProveedorData({...proveedorData, diasCredito: e.target.value})}
                  />
                </div>
                <div className="campo-modal">
                  <label>Código interno</label>
                  <input 
                    type="text" 
                    value={proveedorData.codigoInterno}
                    onChange={(e) => setProveedorData({...proveedorData, codigoInterno: e.target.value})}
                  />
                </div>
                <div className="campo-modal">
                  <label>Código de barra</label>
                  <input 
                    type="text" 
                    value={proveedorData.codigoBarra}
                    onChange={(e) => setProveedorData({...proveedorData, codigoBarra: e.target.value})}
                  />
                </div>
                <div className="campo-modal-checkbox">
                  <label>¿Aplica retención?</label>
                  <input 
                    type="checkbox" 
                    checked={proveedorData.aplicaRetencion}
                    onChange={(e) => setProveedorData({...proveedorData, aplicaRetencion: e.target.checked})}
                  />
                </div>
              </div>

              <div className="fila-modal">
                <div className="campo-modal">
                  <label>Teléfono [Agregar +]</label>
                  <input 
                    type="text" 
                    value={proveedorData.telefono}
                    onChange={(e) => setProveedorData({...proveedorData, telefono: e.target.value})}
                  />
                </div>
                <div className="campo-modal">
                  <label>Nacionalidad</label>
                  <select 
                    value={proveedorData.nacionalidad}
                    onChange={(e) => setProveedorData({...proveedorData, nacionalidad: e.target.value})}
                  >
                    <option>PERU</option>
                  </select>
                </div>
                <div className="campo-modal">
                  <label>Régimen Tributario</label>
                  <select 
                    value={proveedorData.regimenTributario}
                    onChange={(e) => setProveedorData({...proveedorData, regimenTributario: e.target.value})}
                  >
                    <option>Seleccionar</option>
                  </select>
                </div>
              </div>

              <div className="fila-modal">
                <div className="campo-modal">
                  <label>Tipo de proveedor</label>
                  <select 
                    value={proveedorData.tipoProveedor}
                    onChange={(e) => setProveedorData({...proveedorData, tipoProveedor: e.target.value})}
                  >
                    <option>Seleccionar</option>
                  </select>
                </div>
                <div className="campo-modal">
                  <label>Vendedor</label>
                  <select 
                    value={proveedorData.vendedor}
                    onChange={(e) => setProveedorData({...proveedorData, vendedor: e.target.value})}
                  >
                    <option>Seleccionar</option>
                  </select>
                </div>
                <div className="campo-modal">
                  <label>Calificación</label>
                  <select 
                    value={proveedorData.calificacion}
                    onChange={(e) => setProveedorData({...proveedorData, calificacion: e.target.value})}
                  >
                    <option>Seleccionar</option>
                  </select>
                </div>
              </div>

              <div className="checkbox-modal">
                <input 
                  type="checkbox" 
                  id="esAgente"
                  checked={proveedorData.esAgente}
                  onChange={(e) => setProveedorData({...proveedorData, esAgente: e.target.checked})}
                />
                <label htmlFor="esAgente">¿Es agente de percepción?</label>
              </div>

              <div className="botones-modal">
                <button className="btn-buscar">Buscar por Nombres y Apellidos</button>
                <button className="btn-cerrar" onClick={() => setShowProveedorModal(false)}>
                  Cerrar
                </button>
                <button className="btn-guardar-modal">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarCompras;