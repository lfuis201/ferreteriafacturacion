import React, { useState, useEffect } from 'react';
import { Camera, Info, Plus, Trash2 } from 'lucide-react';
import '../../styles/NotaVentaFormulario.css';
import ModalCliente from './ModalCliente';
import FormularioVentaProductServicio from './FormularioVentaProductServicio';
import { obtenerClientes } from '../../services/clienteService';
import { crearNotaVenta, generarPdfNotaVenta } from '../../services/notaVentaService';
const NotaVentaFormulario = () => {
  const [pagos, setPagos] = useState([
    {
      id: 1,
      fecha: '2025-06-30',
      metodoPago: 'Efectivo',
      destino: 'CAJA GENERAL - Adminitrac',
      referencia: '',
      glosa: '',
      monto: 0,
      agregar: true
    },
    {
      id: 2,
      fecha: '2025-06-30',
      metodoPago: 'Efectivo',
      destino: 'CAJA GENERAL - Adminitrac',
      referencia: '',
      glosa: '',
      monto: 0,
      agregar: false
    },
    {
      id: 3,
      fecha: '2025-06-30',
      metodoPago: 'Efectivo',
      destino: 'CAJA GENERAL - Adminitrac',
      referencia: '',
      glosa: '',
      monto: 0,
      agregar: false
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
  const [showPreview, setShowPreview] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState('');
  const [notaGuardada, setNotaGuardada] = useState(null);

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

  const agregarPago = () => {
    const nuevoPago = {
      id: pagos.length + 1,
      fecha: '2025-06-30',
      metodoPago: 'Efectivo',
      destino: 'CAJA GENERAL - Adminitrac',
      referencia: '',
      glosa: '',
      monto: 0,
      agregar: false
    };
    setPagos([...pagos, nuevoPago]);
  };

  const eliminarPago = (id) => {
    setPagos(pagos.filter(pago => pago.id !== id));
  };

  const agregarProducto = () => {
    const nuevoProducto = {
      id: Date.now(), // Usar timestamp para evitar conflictos de ID
      productoId: null, // Se asignará cuando se seleccione un producto real
      descripcion: '',
      unidad: 'UND',
      cantidad: 1,
      valorU: 0,
      precioU: 0,
      precioUnitario: 0,
      subtotal: 0,
      total: 0,
      codigo: '',
      stock: 0
    };
    setProductos(prevProductos => [...prevProductos, nuevoProducto]);
  };

  const handleCloseModal = () => {
    setShowModalCliente(false);
  };

  const handleClienteCreado = (nuevoCliente) => {
    console.log('Cliente creado:', nuevoCliente);
    // Actualizar la lista de clientes y seleccionar el nuevo cliente
    setClientes(prevClientes => [...prevClientes, nuevoCliente]);
    setClienteSeleccionado(nuevoCliente.id);
    setShowModalCliente(false);
  };

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
          
          // Recalcular subtotal si cambia cantidad o precio
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

  // Función para eliminar producto
  const eliminarProducto = (id) => {
    setProductos(prevProductos => prevProductos.filter(producto => producto.id !== id));
  };

  // Función para calcular totales
  const calcularTotales = () => {
    const subtotalCalculado = productos.reduce((sum, producto) => sum + (producto.subtotal || 0), 0);
    const igvCalculado = subtotalCalculado * 0.18;
    const totalCalculado = subtotalCalculado + igvCalculado;
    
    setSubtotal(subtotalCalculado);
    setIgv(igvCalculado);
    setTotal(totalCalculado);
  };

  // Efecto para recalcular totales cuando cambien los productos
  useEffect(() => {
    calcularTotales();
  }, [productos]);

  // Función para guardar la nota de venta
  const handleGuardarNotaVenta = async () => {
    if (!clienteSeleccionado) {
      alert('Por favor seleccione un cliente');
      return;
    }

    if (productos.length === 0) {
      alert('Por favor agregue al menos un producto');
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
      console.log('Nota de venta creada:', response);
      const info = response?.notaVenta;
      setNotaGuardada(info);
      
      // Generar y mostrar PDF A4 en vista previa
      try {
        const blob = await generarPdfNotaVenta(info.id, 'A4');
        const url = window.URL.createObjectURL(blob);
        setPreviewPdfUrl(url);
        setShowPreview(true);
      } catch (e) {
        console.error('No se pudo generar el PDF de la nota de venta:', e);
      }
      
      // Limpiar formulario
      setFormData({
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
      setClienteSeleccionado('');
      setProductos([]);
      setPagos([{
        id: 1,
        fecha: '2025-06-30',
        metodoPago: 'Efectivo',
        destino: 'CAJA GENERAL - Adminitrac',
        referencia: '',
        glosa: '',
        monto: 0,
        agregar: true
      }]);
      
    } catch (error) {
      console.error('Error al guardar nota de venta:', error);
      alert('Error al guardar la nota de venta: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModalProductos = () => {
    setShowModalProductos(true);
  };

  const handleCloseModalProductos = () => {
    setShowModalProductos(false);
  };

  const handleProductoSeleccionado = (producto) => {
    console.log('Producto seleccionado:', producto);
    
    // Verificar que el producto tenga los datos necesarios
    if (!producto || !producto.id) {
      console.error('Producto inválido:', producto);
      alert('Error: Producto inválido seleccionado');
      return;
    }

    const precioVenta = parseFloat(producto.precioVenta || producto.precio || 0);
    const nuevoProducto = {
      id: Date.now(), // Usar timestamp para evitar conflictos de ID
      productoId: producto.id, // ID real del producto para el backend
      descripcion: producto.nombre || producto.descripcion || 'Sin descripción',
      unidad: producto.unidadMedida || producto.unidad || 'UND',
      cantidad: 1,
      valorU: precioVenta,
      precioU: precioVenta,
      precioUnitario: precioVenta, // Campo adicional para el backend
      subtotal: precioVenta,
      total: precioVenta,
      // Datos adicionales del producto
      codigo: producto.codigo || '',
      stock: producto.stock || 0
    };
    
    setProductos(prevProductos => [...prevProductos, nuevoProducto]);
    setShowModalProductos(false);
  };

  return (
    <div >
      <div className="nvf-header">
        <div className="nvf-logo">
          <Camera size={40} className="nvf-camera-icon" />
        </div>
        <div className="nvf-info">
          <h3>Nota de venta</h3>
          <p className="nvf-empresa">SISTEMATIZATE PERU SOCIEDAD ANONIMA CERRADA</p>
          <p className="nvf-direccion">Lima, Lima, LIMA - PERU</p>
        </div>
      </div>

      <div className="nvf-form-section">
        <div className="nvf-row">
          <div className="nvf-field nvf-field-half">
            <label className="nvf-label">
              Cliente | <button 
                type="button"
                className="nvf-btn-nuevo" 
                onClick={() => setShowModalCliente(true)}
              >
                Nuevo(s)
              </button>
            </label>
            <div className="nvf-input-group">
              <select 
                className="nvf-input" 
                value={clienteSeleccionado}
                onChange={(e) => setClienteSeleccionado(e.target.value)}
              >
                <option value="">Seleccionar cliente...</option>
                {/* Opción fija para ventas a "Clientes - Varios" */}
               
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.numeroDocumento} - {cliente.nombre}
                  </option> 
                  
                ))}
              </select>
            </div>
          </div>
          <div className="nvf-field nvf-field-half">
            <label className="nvf-label">Dirección</label>
            <input 
              type="text" 
              className="nvf-input" 
              name="direccionCliente"
              value={formData.direccionCliente}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="nvf-row">
          <div className="nvf-field nvf-field-quarter">
            <label className="nvf-label">Establecimiento</label>
            <input 
              type="text" 
              className="nvf-input" 
              name="establecimiento"
              value={formData.establecimiento}
              onChange={handleInputChange}
            />
          </div>
          <div className="nvf-field nvf-field-quarter">
            <label className="nvf-label">Serie</label>
            <input 
              type="text" 
              className="nvf-input" 
              name="serie"
              value={formData.serie}
              onChange={handleInputChange}
            />
          </div>
          <div className="nvf-field nvf-field-quarter">
            <label className="nvf-label">Moneda</label>
            <select 
              className="nvf-select"
              name="moneda"
              value={formData.moneda}
              onChange={handleInputChange}
            >
              <option value="soles">Soles</option>
              <option value="dolares">Dólares</option>
            </select>
          </div>
          <div className="nvf-field nvf-field-quarter">
            <label className="nvf-label">Fec. Emisión</label>
            <input 
              type="date" 
              className="nvf-input" 
              name="fechaEmision"
              value={formData.fechaEmision}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="nvf-row">
          <div className="nvf-field nvf-field-third">
            <label className="nvf-label">
              Tipo periodo <Info size={14} className="nvf-info-icon" />
            </label>
            <select 
              className="nvf-select"
              name="tipoPeriodo"
              value={formData.tipoPeriodo}
              onChange={handleInputChange}
            >
              <option value="">Cant. Periodos</option>
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
          <div className="nvf-field nvf-field-third">
            <label className="nvf-label">Dirección de envío</label>
            <input 
              type="text" 
              className="nvf-input" 
              name="direccionEnvio"
              value={formData.direccionEnvio}
              onChange={handleInputChange}
            />
          </div>
          <div className="nvf-field nvf-field-third">
            <label className="nvf-label">
              Fec. Vencimiento
            </label>
            <input 
              type="date" 
              className="nvf-input" 
              name="fechaVencimiento"
              value={formData.fechaVencimiento}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="nvf-row">
          <div className="nvf-field nvf-field-quarter">
            <label className="nvf-label">Placa</label>
            <div className="nvf-input-with-counter">
              <input 
                type="text" 
                className="nvf-input" 
                name="placa"
                value={formData.placa}
                onChange={handleInputChange}
              />
              <span className="nvf-counter">{formData.placa.length}</span>
          
            </div>
          </div>
          <div className="nvf-field nvf-field-quarter">
            <label className="nvf-label">
              Tipo de cambio <Info size={14} className="nvf-info-icon" />
            </label>
            <input 
              type="text" 
              className="nvf-input" 
              name="tipoCambio"
              value={formData.tipoCambio}
              onChange={handleInputChange}
            />
          </div>
          <div className="nvf-field nvf-field-half">
            <label className="nvf-label">Orden de compra</label>
            <input 
              type="text" 
              className="nvf-input" 
              name="ordenCompra"
              value={formData.ordenCompra}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="nvf-row">
          <div className="nvf-field nvf-field-half">
            <label className="nvf-label">Vendedor</label>
            <input 
              type="text" 
              className="nvf-input" 
              name="vendedor"
              value={formData.vendedor}
              onChange={handleInputChange}
            />
          </div>
          <div className="nvf-field nvf-field-full">
            <label className="nvf-label">Observación</label>
            <textarea 
              className="nvf-textarea" 
              rows="3"
              name="observacion"
              value={formData.observacion}
              onChange={handleInputChange}
            ></textarea>
          </div>
        </div>
      </div>
     


     {/*
      <div className="nvf-section-title">
        <span>Buscar productos o servicios</span>
      </div>

      <div className="nvf-pagos-section">
        <table className="nvf-pagos-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Método de pago</th>
              <th>
                Destino <Info size={14} className="nvf-info-icon-inline" />
              </th>
              <th>Referencia</th>
              <th>Glosa</th>
              <th>Monto</th>
             
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago, index) => (
              <tr key={pago.id}>
                <td>
                  <input 
                    type="date" 
                    className="nvf-table-input" 
                    value={pago.fecha}
                    onChange={(e) => {
                      const newPagos = [...pagos];
                      newPagos[index].fecha = e.target.value;
                      setPagos(newPagos);
                    }}
                  />
                </td>
                <td>
                  <select 
                    className="nvf-table-select"
                    value={pago.metodoPago}
                    onChange={(e) => {
                      const newPagos = [...pagos];
                      newPagos[index].metodoPago = e.target.value;
                      setPagos(newPagos);
                    }}
                  >
                    <option>Efectivo</option>
                    <option>Transferencia</option>
                    <option>Tarjeta</option>
                  </select>
                </td>
                <td>
                  <select 
                    className="nvf-table-select"
                    value={pago.destino}
                    onChange={(e) => {
                      const newPagos = [...pagos];
                      newPagos[index].destino = e.target.value;
                      setPagos(newPagos);
                    }}
                  >
                    <option>CAJA GENERAL - Adminitrac</option>
                    <option>Banco</option>
                  </select>
                </td>
                <td>
                  <input 
                    type="text" 
                    className="nvf-table-input"
                    value={pago.referencia}
                    onChange={(e) => {
                      const newPagos = [...pagos];
                      newPagos[index].referencia = e.target.value;
                      setPagos(newPagos);
                    }}
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    className="nvf-table-input"
                    value={pago.glosa}
                    onChange={(e) => {
                      const newPagos = [...pagos];
                      newPagos[index].glosa = e.target.value;
                      setPagos(newPagos);
                    }}
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    className="nvf-table-input"
                    value={pago.monto}
                    onChange={(e) => {
                      const newPagos = [...pagos];
                      newPagos[index].monto = e.target.value;
                      setPagos(newPagos);
                    }}
                  />
                </td>
                <td>
                  <button 
                    className="nvf-btn-delete"
                    onClick={() => eliminarPago(pago.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
       
      </div> */}


       <div className="nvf-actions-row">
          <button className="nvf-btn-agregar" onClick={handleOpenModalProductos}>
            + Agregar Producto
          </button> 


          {/*   <button className="nvf-btn-consulta">
            Consulta de documentos
          </button>*/}
        
        </div>

      <div className="nvf-productos-section">
        <table className="nvf-productos-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Descripción</th>
              <th>Unidad</th>
              <th>Cantidad</th>
              <th>Valor U.</th>
              <th>Precio U.</th>
              <th>Subtotal</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan="8" className="nvf-empty-row">
                  <div className="nvf-empty-message">
                    No hay productos agregados
                  </div>
                </td>
              </tr>
            ) : (
              productos.map((producto, index) => (
                <tr key={producto.id}>
                  <td>{index + 1}</td>
                  <td>
                    <input 
                      type="text" 
                      className="nvf-table-input"
                      placeholder="Descripción"
                      value={producto.descripcion}
                      onChange={(e) => handleProductoChange(producto.id, 'descripcion', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="nvf-table-input"
                      placeholder="Unidad"
                      value={producto.unidad}
                      onChange={(e) => handleProductoChange(producto.id, 'unidad', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className="nvf-table-input"
                      value={producto.cantidad}
                      onChange={(e) => handleProductoChange(producto.id, 'cantidad', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className="nvf-table-input"
                      value={producto.valorU}
                      onChange={(e) => handleProductoChange(producto.id, 'valorU', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className="nvf-table-input"
                      value={producto.precioU}
                      onChange={(e) => handleProductoChange(producto.id, 'precioU', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>{(producto.subtotal || 0).toFixed(2)}</td>
                  <td>
                    {(producto.total || 0).toFixed(2)}
                    <button 
                      className="nvf-btn-delete-producto"
                      onClick={() => eliminarProducto(producto.id)}
                      style={{
                        marginLeft: '8px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '2px 6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <div className="nvf-footer-actions">
         
          <button 
            className="nvf-btn-guardar" 
            onClick={handleGuardarNotaVenta}
            disabled={loading}
            type="button"
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              marginLeft: '10px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Nota de Venta'}
          </button>
          <button 
            className="nvf-btn-limpiar" 
            onClick={() => {
              setFormData({
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
              setClienteSeleccionado('');
              setProductos([]);
            }}
            type="button"
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              marginLeft: '10px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Limpiar
          </button>
        </div>

        {/* Mostrar totales */}
        <div className="nvf-totales" style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          textAlign: 'right'
        }}>
          <div><strong>Subtotal: S/ {subtotal.toFixed(2)}</strong></div>
          <div><strong>IGV (18%): S/ {igv.toFixed(2)}</strong></div>
          <div style={{ fontSize: '18px', color: '#28a745' }}>
            <strong>Total: S/ {total.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Modal Cliente */}
      {showModalCliente && (
        <ModalCliente
          onClose={handleCloseModal}
          onClienteCreado={handleClienteCreado}
        />
      )}

      {/* Modal Productos */}
      {showModalProductos && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <div className="modal-header">
              <h3>Seleccionar Producto</h3>
              <button 
                className="modal-close-btn"
                onClick={handleCloseModalProductos}
              >
                ×
              </button>
            </div>
            <FormularioVentaProductServicio
              onProductoSeleccionado={handleProductoSeleccionado}
            />
          </div>
        </div>
      )}

      {/* Vista previa de Nota de Venta con opciones de impresión */}
      {showPreview && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content-large" style={{ width: '90%', maxWidth: '1100px' }}>
            <div className="modal-header" style={{ backgroundColor: '#e74c3c', color: 'white' }}>
              <h3 style={{ margin: 0 }}>
                {`Nota de venta registrada: ${notaGuardada?.serieComprobante || ''}-${notaGuardada?.numeroComprobante || ''}`}
              </h3>
              <button 
                className="modal-close-btn"
                onClick={() => {
                  setShowPreview(false);
                  if (previewPdfUrl) {
                    window.URL.revokeObjectURL(previewPdfUrl);
                    setPreviewPdfUrl('');
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
                  const blob = await generarPdfNotaVenta(notaGuardada.id, 'A4');
                  const url = window.URL.createObjectURL(blob);
                  setPreviewPdfUrl((old) => { if (old) window.URL.revokeObjectURL(old); return url; });
                }}
                style={{ background: 'transparent', color: '#e74c3c', border: 'none', cursor: 'pointer' }}
              >
                Imprimir A4
              </button>
              <button
                onClick={async () => {
                  const blob = await generarPdfNotaVenta(notaGuardada.id, '80mm');
                  const url = window.URL.createObjectURL(blob);
                  setPreviewPdfUrl((old) => { if (old) window.URL.revokeObjectURL(old); return url; });
                }}
                style={{ background: 'transparent', color: '#e74c3c', border: 'none', cursor: 'pointer' }}
              >
                Imprimir Ticket
              </button>
              <button
                onClick={async () => {
                  // A5 no está soportado explícitamente; usamos A4 como alternativa
                  const blob = await generarPdfNotaVenta(notaGuardada.id, 'A4');
                  const url = window.URL.createObjectURL(blob);
                  setPreviewPdfUrl((old) => { if (old) window.URL.revokeObjectURL(old); return url; });
                }}
                style={{ background: 'transparent', color: '#e74c3c', border: 'none', cursor: 'pointer' }}
              >
                Imprimir A5
              </button>
            </div>

            {/* Contenedor del PDF */}
            <div style={{ height: '70vh', borderTop: '1px solid #eee' }}>
              {previewPdfUrl ? (
                <iframe
                  title="Vista previa PDF Nota de Venta"
                  src={previewPdfUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <div style={{ padding: '20px' }}>Cargando PDF…</div>
              )}
            </div>

            {/* Botones de descarga rápida al pie */}
            <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', justifyContent: 'flex-start' }}>
              <button
                onClick={async () => {
                  const blob = await generarPdfNotaVenta(notaGuardada.id, 'A4');
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${notaGuardada?.serieComprobante || 'NV'}-${notaGuardada?.numeroComprobante || ''}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                }}
                style={{ border: '1px solid #ddd', borderRadius: 8, padding: 10 }}
              >
                A4
              </button>
              <button
                onClick={async () => {
                  const blob = await generarPdfNotaVenta(notaGuardada.id, '80mm');
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ticket_${notaGuardada?.serieComprobante || 'NV'}-${notaGuardada?.numeroComprobante || ''}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                }}
                style={{ border: '1px solid #ddd', borderRadius: 8, padding: 10 }}
              >
                80MM
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NotaVentaFormulario;