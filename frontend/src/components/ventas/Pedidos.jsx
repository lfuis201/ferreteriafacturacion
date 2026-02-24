import React, { useState, useEffect } from 'react';
import '../../styles/Pedidos.css';
import ModalCliente from './ModalCliente';
import { obtenerClientes } from '../../services/clienteService';
import FormularioVentaProductServicio from './FormularioVentaProductServicio';
import { listarPedidos, crearPedido } from '../../services/pedidoService';

const Pedidos = () => {
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  
  const [visibleColumns, setVisibleColumns] = useState({
    fechaEmision: true,
    fechaEntrega: true,
    vendedor: true,
    cliente: true,
    //estado: true,
    pedido: true,
    comprobantes: true,
    notasVenta: true,
    cotizacion: true,
    //guias: true,
    pedidoMiTienda: true,
    moneda: true,
    tExportacion: true,
    tInafecto: true,
    tExonerado: true,
    tGravado: true,
    tIgv: true,
    total: true,
    //pdf: true,
    //estadoFinal: true,
    //acciones: true
  });

  const [pedidosData, setPedidosData] = useState([]);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const resp = await listarPedidos();
        const lista = resp.pedidos || [];
        setPedidosData(lista);
      } catch (err) {
        console.error('Error cargando pedidos:', err.message || err);
      }
    };
    cargarPedidos();
  }, []);

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const handleNewOrder = () => {
    setShowNewOrderModal(true);
  };

  return (
    <div className="pedidos-container">
      <div className="pedidos-header">
        <h1>Pedidos</h1>
        <button className="btn-nuevo" onClick={handleNewOrder}>
          Nuevo
        </button>
      </div>

      <div className="column-controls">
        <button 
          className="btn-toggle-columns"
          onClick={() => setShowColumnModal(!showColumnModal)}
        >
          Mostrar/Ocultar columnas
        </button>

        {showColumnModal && (
          <div className="columns-modal">
            <div className="columns-modal-contenttt">
              <h3>Mostrar/Ocultar columnas</h3>
              <div className="columns-list">
                <label>
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.tExportacion}
                    onChange={() => toggleColumn('tExportacion')}
                  />
                  T. Exportación
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.tInafecto}
                    onChange={() => toggleColumn('tInafecto')}
                  />
                  T. Inafecto
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.tExonerado}
                    onChange={() => toggleColumn('tExonerado')}
                  />
                  T. Exonerado
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.tGravado}
                    onChange={() => toggleColumn('tGravado')}
                  />
                  T. Gravado
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.tIgv}
                    onChange={() => toggleColumn('tIgv')}
                  />
                  T. IGV
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.fechaEntrega}
                    onChange={() => toggleColumn('fechaEntrega')}
                  />
                  F. Entrega
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.notasVenta}
                    onChange={() => toggleColumn('notasVenta')}
                  />
                  Notas de venta
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.cotizacion}
                    onChange={() => toggleColumn('cotizacion')}
                  />
                  Cotización
                </label> 


                {/*    <label>
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.guias}
                    onChange={() => toggleColumn('guias')}
                  />
                  Guías de Remisión
                </label>*/ }

            



              </div>
              <button 
                className="btn-close-modal"
                onClick={() => setShowColumnModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="pedidos-table">
          <thead>
            <tr>
              {visibleColumns.fechaEmision && <th>Fecha Emisión</th>}
              {visibleColumns.fechaEntrega && <th>Fecha Entrega</th>}
              {visibleColumns.vendedor && <th>Vendedor</th>}
              {visibleColumns.cliente && <th>Cliente</th>}
              {/*   {visibleColumns.estado && <th>Estado</th>} */}
            

              {visibleColumns.pedido && <th>Pedido</th>}
              {visibleColumns.comprobantes && <th>Comprobantes</th>}
              {visibleColumns.notasVenta && <th>Notas de venta</th>}
              {visibleColumns.cotizacion && <th>Cotización</th>} 


               {/*   {visibleColumns.guias && <th>Guías</th>} */}
             
              {visibleColumns.moneda && <th>Moneda</th>}
              {visibleColumns.tExportacion && <th>T.Exportación</th>}
              {visibleColumns.tInafecto && <th>T.Inafecto</th>}
              {visibleColumns.tExonerado && <th>T.Exonerado</th>}
              {visibleColumns.tGravado && <th>T.Gravado</th>}
              {visibleColumns.tIgv && <th>T.IGV</th>}
              {visibleColumns.total && <th>Total</th>}
             
  {/*   {visibleColumns.pdf && <th>PDF</th>} */}
              

                  {/*  {visibleColumns.estadoFinal && <th>Estado</th>}*/}
               {/*   {visibleColumns.acciones && <th>Acciones</th>}*/}
             
            </tr>
          </thead>
          <tbody>
            {pedidosData.length === 0 ? (
              <tr>
                <td colSpan="21" className="no-data">
                  Total 0
                </td>
              </tr>
            ) : (
              pedidosData.map((pedido, index) => (
                <tr key={pedido.id || index}>
                  {visibleColumns.fechaEmision && (
                    <td>{pedido.fechaEmision || ''}</td>
                  )}
                  {visibleColumns.fechaEntrega && (
                    <td>{pedido.fechaEntrega || ''}</td>
                  )}
                  {visibleColumns.vendedor && (
                    <td>{pedido.vendedor || ''}</td>
                  )}
                  {visibleColumns.cliente && (
                    <td>{pedido.Cliente?.nombre || ''}</td>
                  )}
                  
                  {visibleColumns.pedido && (
                    <td>{pedido.numeroPedido || pedido.id}</td>
                  )}
                  {visibleColumns.comprobantes && (
                    <td>{pedido.comprobantes || '0'}</td>
                  )}
                  {visibleColumns.notasVenta && (
                    <td>{pedido.notasDeVenta || '0'}</td>
                  )}
                  {visibleColumns.cotizacion && (
                    <td>{pedido.cotizacion || ''}</td>
                  )}
                 
                  {visibleColumns.moneda && (
                    <td>{pedido.moneda || ''}</td>
                  )}
                  {visibleColumns.tExportacion && (
                    <td>{pedido.tExportacion ?? 0}</td>
                  )}
                  {visibleColumns.tInafecto && (
                    <td>{pedido.tInafecto ?? 0}</td>
                  )}
                  {visibleColumns.tExonerado && (
                    <td>{pedido.tExonerado ?? 0}</td>
                  )}
                  {visibleColumns.tGravado && (
                    <td>{pedido.tGravado ?? 0}</td>
                  )}
                  {visibleColumns.tIgv && (
                    <td>{pedido.tIgv ?? 0}</td>
                  )}
                  {visibleColumns.total && (
                    <td>{pedido.total ?? 0}</td>
                  )}


                   {/* Acciones futuras 
                  {visibleColumns.pdf && (
                    <td>
                      {pedido.pdfUrl ? (
                        <a href={pedido.pdfUrl} target="_blank" rel="noreferrer">PDF</a>
                      ) : (
                        ''
                      )}
                    </td>
                  )}*/}
                  
                  {visibleColumns.acciones && (
                    <td>
                      {/* Acciones futuras */}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showNewOrderModal && (
        <NewOrderModal 
          onClose={() => setShowNewOrderModal(false)} 
          onSaved={(pedidoCreado) => {
            setShowNewOrderModal(false);
            if (pedidoCreado) {
              setPedidosData(prev => [pedidoCreado, ...prev]);
            }
          }}
        />
      )}
    </div>
  );
};

const NewOrderModal = ({ onClose, onSaved }) => {
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    cliente: '',
    direccionEnvio: '',
    vendedor: '',
    condicionPago: '',
    observacion: '',
    fechaEmision: '2025-10-01',
    fechaVencimiento: '',
    fechaEntrega: '',
    terminoPago: 'Contado',
    moneda: 'Soles',
    tipoCambio: '3.476',
    empresaTransporte: ''
  });

  const [datosAdicionales, setDatosAdicionales] = useState([
    { titulo: '', descripcion: '' },
    { titulo: '', descripcion: '' },
    { titulo: '', descripcion: '' },
    { titulo: '', descripcion: '' }
  ]);

  const [productos, setProductos] = useState([]);

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await obtenerClientes();
      const clientesData = response.clientes || [];
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'cliente') {
      filtrarClientes(value);
    }
  };

  const filtrarClientes = (termino) => {
    if (!termino.trim()) {
      setClientesFiltrados([]);
      setMostrarSugerencias(false);
      return;
    }

    const filtrados = clientes.filter(cliente => 
      cliente.nombre?.toLowerCase().includes(termino.toLowerCase()) ||
      cliente.numeroDocumento?.includes(termino)
    );

    setClientesFiltrados(filtrados);
    setMostrarSugerencias(filtrados.length > 0);
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData(prev => ({
      ...prev,
      cliente: `${cliente.nombre} - ${cliente.numeroDocumento}`,
      direccionEnvio: cliente.direccion || ''
    }));
    setMostrarSugerencias(false);
  };

  const handleDatoAdicionalChange = (index, field, value) => {
    const newDatos = [...datosAdicionales];
    newDatos[index][field] = value;
    setDatosAdicionales(newDatos);
  };

  const agregarDatoAdicional = () => {
    setDatosAdicionales([...datosAdicionales, { titulo: '', descripcion: '' }]);
  };

  const eliminarDatoAdicional = (index) => {
    const newDatos = datosAdicionales.filter((_, i) => i !== index);
    setDatosAdicionales(newDatos);
  };

  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false);

  const cerrarFormularioProducto = () => {
    setMostrarFormularioProducto(false);
  };

  const onProductoSeleccionado = (producto) => {
    const descripcion = producto.nombre || producto.descripcion || 'Sin descripción';
    const unidad = producto.unidadMedida || 'NIU';
    const cantidad = 1;
    const precioUnitario = Number(producto.precioVenta || 0);
    const subtotal = Number((cantidad * precioUnitario).toFixed(2));
    const total = subtotal;

    setProductos(prev => ([
      ...prev,
      { descripcion, unidad, cantidad, precioUnitario, subtotal, total }
    ]));

    setMostrarFormularioProducto(false);
  };

  const agregarProducto = () => {
    setMostrarFormularioProducto(true);
  };

  const handleGuardar = async () => {
    try {
      const payload = {
        clienteId: clienteSeleccionado?.id || null,
        fechaEmision: formData.fechaEmision || null,
        fechaVencimiento: formData.fechaVencimiento || null,
        fechaEntrega: formData.fechaEntrega || null,
        direccionEnvio: formData.direccionEnvio || null,
        vendedor: formData.vendedor || null,
        condicionPago: formData.condicionPago || null,
        observacion: formData.observacion || null,
        terminoPago: formData.terminoPago || null,
        moneda: formData.moneda || null,
        tipoCambio: formData.tipoCambio || null,
        empresaTransporte: formData.empresaTransporte || null,
        productos: productos.map(p => ({
          productoId: p.productoId || null,
          descripcion: p.descripcion,
          unidad: p.unidad,
          cantidad: Number(p.cantidad || 1),
          precioUnitario: Number(p.precioUnitario || 0),
          subtotal: Number(p.subtotal || (Number(p.cantidad || 1) * Number(p.precioUnitario || 0))),
          total: Number(p.total || p.subtotal || (Number(p.cantidad || 1) * Number(p.precioUnitario || 0)))
        }))
      };

      const resp = await crearPedido(payload);
      const nuevo = resp.pedido;
      if (nuevo) {
        onSaved && onSaved(nuevo);
      }
    } catch (error) {
      console.error('Error al guardar pedido:', error.message || error);
    }
  };

  const handleOpenModalCliente = () => {
    setShowModalCliente(true);
  };

  const handleCloseModalCliente = () => {
    setShowModalCliente(false);
  };

  const handleClienteCreado = (cliente) => {
    setFormData(prev => ({
      ...prev,
      cliente: `${cliente.nombre} - ${cliente.numeroDocumento}`,
      direccionEnvio: cliente.direccion || ''
    }));
    setClienteSeleccionado(cliente);
    setShowModalCliente(false);
    cargarClientes();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contenttt" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body-pedido">
          {/* Cliente */}
          <div className="form-section-pedido" style={{position: 'relative'}}>
            <label>Cliente <span className="nuevo-tag" onClick={handleOpenModalCliente} style={{cursor: 'pointer'}}>[+ Nuevo]</span></label>
            <input 
              type="text" 
              placeholder="Escriba el nombre o número de documento del cliente"
              value={formData.cliente}
              onChange={(e) => handleInputChange('cliente', e.target.value)}
              onFocus={() => {
                if (formData.cliente && clientesFiltrados.length > 0) {
                  setMostrarSugerencias(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setMostrarSugerencias(false), 200);
              }}
            />
            
            {mostrarSugerencias && clientesFiltrados.length > 0 && (
              <div className="sugerencias-clientes" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {clientesFiltrados.map((cliente) => (
                  <div
                    key={cliente.id}
                    className="sugerencia-cliente"
                    onClick={() => seleccionarCliente(cliente)}
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <div style={{fontWeight: 'bold'}}>{cliente.nombre}</div>
                    <div style={{fontSize: '12px', color: '#666'}}>
                      {cliente.tipoDocumento}: {cliente.numeroDocumento}
                    </div>
                    {cliente.direccion && (
                      <div style={{fontSize: '12px', color: '#888'}}>
                        {cliente.direccion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dirección de envío */}
          <div className="form-section-pedido">
            <label>Dirección de envio</label>
            <input 
              type="text" 
              value={formData.direccionEnvio}
              onChange={(e) => handleInputChange('direccionEnvio', e.target.value)}
            />
          </div>

          {/* Fila 1: Vendedor y Condición de pago */}
          <div className="form-row-pedido">
            <div className="form-section-pedido">
              <label>Vendedor</label>
              <select 
                value={formData.vendedor}
                onChange={(e) => handleInputChange('vendedor', e.target.value)}
              >
                <option value="Administrador">Administrador</option> 
                 <option value="Taller">Taller</option> 
              </select>
            </div>
            <div className="form-section-pedido">
              <label>Condicion de pago CPE</label>
              <select 
                value={formData.condicionPago}
                onChange={(e) => handleInputChange('condicionPago', e.target.value)}
              >
                <option value="Contado">Contado</option>
                 <option value="Credito">Credito</option>
              </select>
            </div>
          </div>

          {/* Observación */}
          <div className="form-section-pedido">
            <label>Observación</label>
            <textarea 
              value={formData.observacion}
              onChange={(e) => handleInputChange('observacion', e.target.value)}
            />
          </div>

          {/* Fila 2: Fechas */}
          <div className="form-row-pedido-triple">
            <div className="form-section-pedido">
              <label>Fec. Emisión</label>
              <input 
                type="date" 
                value={formData.fechaEmision}
                onChange={(e) => handleInputChange('fechaEmision', e.target.value)}
              />
            </div>
            <div className="form-section-pedido">
              <label>Fec. Vencimiento</label>
              <input 
                type="date" 
                value={formData.fechaVencimiento}
                onChange={(e) => handleInputChange('fechaVencimiento', e.target.value)}
              />
            </div>
            <div className="form-section-pedido">
              <label>Fec. Entrega</label>
              <input 
                type="date" 
                value={formData.fechaEntrega}
                onChange={(e) => handleInputChange('fechaEntrega', e.target.value)}
              />
            </div>
          </div>

          {/* Fila 3: Término, Moneda, Tipo cambio */}
          <div className="form-row-pedido-triple">
            <div className="form-section-pedido">
              <label>Termino de pago</label>
              <select 
                value={formData.terminoPago}
                onChange={(e) => handleInputChange('terminoPago', e.target.value)}
              >
                <option value="Contado">Contado</option>
                <option value="Credito">Crédito</option>  
                  <option value=" A 30 días"> A 30 días</option>  
           <option value="Contado contraentrega"> Contado contraentrega </option>  
           <option value="Tarjeta credito visa"> Tarjeta credito visa </option>  
           <option value="Factura a 30 días"> Factura a 30 días </option>  
           <option value="Transferencia"> Transferencia </option>  
           <option value="Tarjeta de débito"> Tarjeta de débito </option>  
           <option value="Tarjeta de crédito"> Tarjeta de crédito </option>  
           <option value="Efectivo"> Efectivo </option>  
             <option value="Plin"> Plin </option> 


           <option value="Yape"> Yape </option> 
            <option value="Factura a 60 días"> Factura a 60 días </option> 
            <option value="Factura a 45 días"> Factura a 45 días </option> 
            <option value="Factura a 15 dias"> Factura a 15 dias </option> 



             










              </select>
            </div>
            <div className="form-section-pedido">
              <label>Moneda</label>
              <select 
                value={formData.moneda}
                onChange={(e) => handleInputChange('moneda', e.target.value)}
              >
                <option value="Soles">Soles</option>
                <option value="Dolares">Dólares</option>
              </select>
            </div>
            <div className="form-section-pedido">
              <label>Tipo de cambio ⓘ</label>
              <input 
                type="text" 
                value={formData.tipoCambio}
                onChange={(e) => handleInputChange('tipoCambio', e.target.value)}
              />
            </div>
          </div>

          {/* Empresa transporte */}
          <div className="form-section-pedido">
            <label>Nombre empresa transporte</label>
            <input 
              type="text" 
              value={formData.empresaTransporte}
              onChange={(e) => handleInputChange('empresaTransporte', e.target.value)}
            />
          </div>

          {/* Tabla de productos */}
          <div className="productos-section">
            <table className="productos-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Descripción</th>
                  <th>Unidad</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-productos">
                      No hay productos agregados
                    </td>
                  </tr>
                ) : (
                  productos.map((producto, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{producto.descripcion}</td>
                      <td>{producto.unidad}</td>
                      <td>{producto.cantidad}</td>
                      <td>{producto.precioUnitario}</td>
                      <td>{producto.subtotal}</td>
                      <td>{producto.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer-pedido">
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button> 
          <button 
            type="button" 
            className="btn-agregar-producto"
            onClick={handleGuardar}
          >
            Guardar
          </button>
          <button 
            type="button" 
            className="btn-agregar-producto"
            onClick={agregarProducto}
          >
            + Agregar Producto
          </button>
        </div>
      </div>

      {/* Modal Cliente */}
      {showModalCliente && (
        <ModalCliente 
          onClose={handleCloseModalCliente}
          onClienteCreado={handleClienteCreado}
        />
      )}

      {/* Modal Producto - CORREGIDO */}
      {mostrarFormularioProducto && (
        <div 
          className="modal-producto-overlay"
          onClick={cerrarFormularioProducto}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div 
            className="modal-producto-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '85vw',
              maxWidth: '1100px',
              maxHeight: '85vh',
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#c9302c',
                color: '#fff',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                flexShrink: 0
              }}
            >
              <span style={{ fontWeight: 600 }}>Agregue Productos / Servicios</span>
              <button 
                type="button" 
                onClick={cerrarFormularioProducto}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  lineHeight: 1
                }}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div style={{ 
              padding: '12px', 
              overflowY: 'auto',
              flex: 1
            }}>
              <FormularioVentaProductServicio 
                onProductoSeleccionado={onProductoSeleccionado}
                productos={productos}
              />
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 8, 
              padding: '10px 14px',
              borderTop: '1px solid #ddd',
              flexShrink: 0
            }}>
              <button 
                type="button" 
                className="btn-cancelar" 
                onClick={cerrarFormularioProducto}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;