import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, X } from 'lucide-react';
import Swal from 'sweetalert2';
import guiaRemisionService from '../../services/guiaRemisionService';
import clienteService from '../../services/clienteService';
import { obtenerConductores } from '../../services/conductorService';
import '../../styles/FormularioGuia.css';
import ModalCliente from './ModalCliente';
import ModalConductor from './ModalConductor';

const FormularioGuia = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ventaData, onClose, onGuiaGenerada } = location.state || {};
  const fromVenta = Boolean(ventaData);
  
  const [productos, setProductos] = useState([
    { id: 1, unidad: 'NIU', descripcion: 'ACEITE OZONIZADO', cantidad: 1, peso: 0 }
  ]);
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
  const [mostrarModalConductor, setMostrarModalConductor] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [conductores, setConductores] = useState([]);
  const [conductorSeleccionado, setConductorSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    establecimiento: '',
    serie: 'T001',
    numero: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaTraslado: new Date().toISOString().split('T')[0],
    cliente: '',
    clienteDocumento: '',
    clienteTipoDocumento: 'DNI',
    clienteTelefono: '',
    clienteEmail: '',
    clienteDireccion: '',
    modoTraslado: 'Transporte privado',
    motivoTraslado: 'Venta',
    unidadMedida: 'KGM',
    pesoTotal: 1,
    numeroPaquetes: 0,
    descripcionMotivo: '',
    observaciones: '',
    ordenPedido: '',
    ordenCompra: '',
    documentoRelacionado: ''
  });

  // Efecto para prellenar datos cuando se recibe ventaData
  useEffect(() => {
    // Cargar conductores al montar el componente
    cargarConductores();
    
    if (ventaData) {
      console.log('Datos de venta recibidos:', ventaData);
      
      // Prellenar datos del cliente desde la venta
      const cliente = ventaData.Cliente || ventaData.cliente;
      const sucursal = ventaData.Sucursal || ventaData.sucursal;
      
      setFormData(prev => ({
        ...prev,
        cliente: cliente?.nombre || '',
        clienteDocumento: cliente?.numeroDocumento || '',
        clienteTipoDocumento: cliente?.tipoDocumento || 'DNI',
        clienteTelefono: cliente?.telefono || '',
        clienteEmail: cliente?.email || '',
        clienteDireccion: cliente?.direccion || '',
        documentoRelacionado: `${ventaData.serieComprobante}-${ventaData.numeroComprobante}`,
        ordenPedido: ventaData.numeroComprobante?.toString() || '',
        establecimiento: sucursal?.nombre || 'Oficina Principal',
        fechaTraslado: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        motivoTraslado: 'Venta' // Valor por defecto para ventas
      }));

      // Prellenar productos de la venta
      const detallesVenta = ventaData.DetalleVenta || ventaData.detalles || [];
      if (detallesVenta.length > 0) {
        const productosVenta = detallesVenta.map((detalle, index) => ({
          id: index + 1,
          productoId: detalle.productoId || detalle.Producto?.id,
          unidad: detalle.Producto?.unidadMedida || 'NIU',
          descripcion: detalle.Producto?.nombre || detalle.descripcion || '',
          cantidad: detalle.cantidad || 1,
          peso: detalle.cantidad || 1
        }));
        setProductos(productosVenta);
        
        // Calcular peso total
        const pesoTotal = productosVenta.reduce((total, prod) => total + (parseFloat(prod.peso) || 0), 0);
        setFormData(prev => ({ ...prev, pesoTotal }));
      }
    }
  }, [ventaData]);

  const agregarProducto = () => {
    const nuevoProducto = {
      id: productos.length + 1,
      productoId: null,
      unidad: 'NIU',
      descripcion: '',
      cantidad: 1,
      peso: 1
    };
    setProductos([...productos, nuevoProducto]);
  };

  const eliminarProducto = (id) => {
    const productosActualizados = productos.filter(producto => producto.id !== id);
    setProductos(productosActualizados);
    
    // Recalcular peso total
    const pesoTotal = productosActualizados.reduce((total, prod) => total + (parseFloat(prod.peso) || 0), 0);
    setFormData(prev => ({ ...prev, pesoTotal }));
  };

  const actualizarProducto = (id, campo, valor) => {
    setProductos(productos.map(producto => 
      producto.id === id ? { ...producto, [campo]: valor } : producto
    ));
    
    // Recalcular peso total cuando se actualiza la cantidad o peso
    if (campo === 'cantidad' || campo === 'peso') {
      const productosActualizados = productos.map(producto => 
        producto.id === id ? { ...producto, [campo]: valor } : producto
      );
      const pesoTotal = productosActualizados.reduce((total, prod) => total + (parseFloat(prod.peso) || 0), 0);
      setFormData(prev => ({ ...prev, pesoTotal }));
    }
  };

  const handleNuevoCliente = () => {
    setMostrarModalCliente(true);
  };

  const handleClienteCreado = (nuevoCliente) => {
    // Agregar el nuevo cliente al inicio de la lista (más reciente primero)
    setClientes((prev) => [nuevoCliente, ...prev]);
    
    // Seleccionar automáticamente el cliente recién creado
    setClienteSeleccionado(nuevoCliente);
    
    // Actualizar los campos del formulario con los datos del nuevo cliente
    setFormData(prev => ({
      ...prev,
      cliente: nuevoCliente.nombre,
      clienteDocumento: nuevoCliente.numeroDocumento,
      clienteTipoDocumento: nuevoCliente.tipoDocumento,
      clienteTelefono: nuevoCliente.telefono || '',
      clienteEmail: nuevoCliente.email || '',
      clienteDireccion: nuevoCliente.direccion || ''
    }));
    
    // Cerrar el modal
    setMostrarModalCliente(false);
  };

  // Funciones para manejar conductores
  const handleNuevoConductor = () => {
    setMostrarModalConductor(true);
  };

  const handleConductorCreado = (conductor) => {
    setConductores(prev => [...prev, conductor]);
    setConductorSeleccionado(conductor);
    setFormData(prev => ({
      ...prev,
      conductor: conductor.nombre,
      dniConductor: conductor.numeroDocumento
    }));
    setMostrarModalConductor(false);
  };

  const handleSeleccionarConductor = (e) => {
    const conductorId = e.target.value;
    const conductor = conductores.find(c => c.id.toString() === conductorId);
    if (conductor) {
      setConductorSeleccionado(conductor);
      setFormData(prev => ({
        ...prev,
        conductor: conductor.nombre,
        dniConductor: conductor.numeroDocumento
      }));
    }
  };

  // Cargar conductores disponibles
  const cargarConductores = async () => {
    try {
      const response = await obtenerConductores();
      setConductores(response.conductores || response.data || []);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
    }
  };

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleGenerar = async () => {
    try {
      // Validar campos requeridos
      if (!formData.establecimiento) {
        Swal.fire({
          title: 'Error',
          text: 'Debe seleccionar un establecimiento',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      if (!formData.cliente) {
        Swal.fire({
          title: 'Error',
          text: 'Debe seleccionar un cliente',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      if (productos.length === 0) {
        Swal.fire({
          title: 'Error',
          text: 'Debe agregar al menos un producto',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      // Preparar datos para el backend
       const cliente = ventaData?.Cliente || ventaData?.cliente;
       const guiaData = {
         clienteId: cliente?.id || null,
         ventaId: ventaData?.id || null,
         fechaSalida: formData.fechaTraslado,
         puntoPartida: formData.establecimiento || 'Almacén principal',
         puntoLlegada: cliente?.direccion || formData.clienteDireccion || 'Dirección del cliente',
         motivoTraslado: formData.motivoTraslado,
         nroPlaca: '', // Campo opcional
         conductor: '', // Campo opcional
         dniConductor: '', // Campo opcional
         observacion: formData.observaciones || `Guía generada desde venta ${ventaData?.serieComprobante}-${ventaData?.numeroComprobante}`,
         detalles: productos.map(producto => ({
           productoId: producto.productoId || null,
           presentacionId: null, // Campo opcional
           cantidad: producto.cantidad,
           descripcion: producto.descripcion
         }))
       };
      
      let resultado;
      
      if (ventaData?.id) {
        // Si viene de una venta, usar el endpoint específico
        resultado = await guiaRemisionService.generarDesdeVenta(ventaData.id, guiaData);
      } else {
        // Si es una guía nueva, usar el endpoint general
        resultado = await guiaRemisionService.crearGuia(guiaData);
      }
      
      if (resultado) {
        Swal.fire({
          title: 'Éxito',
          text: `Guía de remisión ${resultado.guiaRemision?.serieComprobante}-${resultado.guiaRemision?.numeroComprobante} generada correctamente`,
          icon: 'success',
          confirmButtonText: 'Entendido'
        }).then(() => {
          // Volver a la lista de ventas
          navigate('/ventas/lista');
        });
      }
    } catch (error) {
      console.error('Error al generar guía:', error);
      const errorMessage = error.response?.data?.mensaje || 'Error al generar la guía de remisión';
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    }
  };

  const handleCancelar = () => {
    // Volver a la lista de ventas
    navigate('/ventas/lista');
  };

  return (
    <div className="formulario-container">
      <div className="header-section">
        <button 
          className="btn-volver" 
          onClick={handleCancelar}
          title="Volver a la lista de ventas"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <h2 className="titulo-principal">
          {fromVenta ? `Nueva Guía de Remisión - Venta ${ventaData?.serie}-${ventaData?.numero}` : 'Nueva Guía de Remisión'}
        </h2>
      </div>
      
      <div className="form-grid">
        {/* Primera fila */}
        <div className="campo-grupo">
          <label>Establecimiento *</label>
          <select 
            className="campo-input"
            value={formData.establecimiento}
            onChange={(e) => handleInputChange('establecimiento', e.target.value)}
          >
            <option value="">Seleccionar establecimiento</option>
            <option value="Oficina Principal">Oficina Principal</option>
          </select>
        </div>
        
        <div className="campo-grupo">
          <label>Serie *</label>
          <input 
            type="text" 
            className="campo-input" 
            value={formData.serie}
            onChange={(e) => handleInputChange('serie', e.target.value)}
          />
        </div>
        
        <div className="campo-grupo">
          <label>Número *</label>
          <input 
            type="text" 
            className="campo-input" 
            value={formData.numero}
            onChange={(e) => handleInputChange('numero', e.target.value)}
          />
        </div>
        
        <div className="campo-grupo">
          <label>Fecha de emisión ⓘ</label>
          <input 
            type="date" 
            className="campo-input" 
            value={formData.fechaEmision}
            onChange={(e) => handleInputChange('fechaEmision', e.target.value)}
          />
        </div>
        
        <div className="campo-grupo">
          <label>Fecha de traslado *</label>
          <input 
            type="date" 
            className="campo-input" 
            value={formData.fechaTraslado}
            onChange={(e) => handleInputChange('fechaTraslado', e.target.value)}
          />
        </div>
        
        <div className="campo-grupo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <label>Cliente *</label>
            {!ventaData && (
              <button
                type="button"
                onClick={handleNuevoCliente}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'none',
                  padding: '0',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                [+ Nuevo]
              </button>
            )}
          </div>
          <input 
            type="text" 
            className="campo-input" 
            value={formData.cliente}
            onChange={(e) => handleInputChange('cliente', e.target.value)}
            placeholder="Nombre del cliente"
            readOnly={!!ventaData}
            style={{
              backgroundColor: ventaData ? '#f8f9fa' : 'white',
              cursor: ventaData ? 'not-allowed' : 'text'
            }}
          />
        </div>
        
        
        
        <div className="campo-grupo">
          <label>Número de Documento</label>
          <input 
            type="text" 
            className="campo-input" 
            value={formData.clienteDocumento}
            onChange={(e) => handleInputChange('clienteDocumento', e.target.value)}
            placeholder="Número de documento"
            readOnly={!!ventaData}
            style={{
              backgroundColor: ventaData ? '#f8f9fa' : 'white',
              cursor: ventaData ? 'not-allowed' : 'text'
            }}
          />
        </div>
        
        <div className="campo-grupo">
          <label>Dirección</label>
          <input 
            type="text" 
            className="campo-input" 
            value={formData.clienteDireccion}
            onChange={(e) => handleInputChange('clienteDireccion', e.target.value)}
            placeholder="Dirección del cliente"
            readOnly={!!ventaData}
            style={{
              backgroundColor: ventaData ? '#f8f9fa' : 'white',
              cursor: ventaData ? 'not-allowed' : 'text'
            }}
          />
        </div>
        
        <div className="campo-grupo">
          <label>Teléfono</label>
          <input 
            type="text" 
            className="campo-input" 
            value={formData.clienteTelefono}
            onChange={(e) => handleInputChange('clienteTelefono', e.target.value)}
            placeholder="Teléfono del cliente"
            readOnly={!!ventaData}
            style={{
              backgroundColor: ventaData ? '#f8f9fa' : 'white',
              cursor: ventaData ? 'not-allowed' : 'text'
            }}
          />
        </div>
        
        <div className="campo-grupo">
          <label>Email</label>
          <input 
            type="email" 
            className="campo-input" 
            value={formData.clienteEmail}
            onChange={(e) => handleInputChange('clienteEmail', e.target.value)}
            placeholder="Email del cliente"
            readOnly={!!ventaData}
            style={{
              backgroundColor: ventaData ? '#f8f9fa' : 'white',
              cursor: ventaData ? 'not-allowed' : 'text'
            }}
          />
        </div>
      </div>

      <div className="form-grid">
        {/* Segunda fila */}
        <div className="campo-grupo">
          <label>Modo de traslado *</label>
          <select 
            className="campo-input"
            value={formData.modoTraslado}
            onChange={(e) => handleInputChange('modoTraslado', e.target.value)}
          >
            <option>Transporte privado</option>
          </select>
        </div>
        
        <div className="campo-grupo">
          <label>Motivo de traslado *</label>
          <select 
            className="campo-input"
            value={formData.motivoTraslado}
            onChange={(e) => handleInputChange('motivoTraslado', e.target.value)}
          >
            <option>Venta</option>
          </select>
        </div>
        
        <div className="campo-grupo">
          <label>Unidad de medida *</label>
          <select 
            className="campo-input"
            value={formData.unidadMedida}
            onChange={(e) => handleInputChange('unidadMedida', e.target.value)}
          >
            <option>KGM</option>
          </select>
        </div>
        
        <div className="campo-grupo">
          <label>Peso total *</label>
          <input 
            type="number" 
            className="campo-input" 
            value={formData.pesoTotal}
            onChange={(e) => handleInputChange('pesoTotal', parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="campo-grupo">
          <label>Número de paquetes</label>
          <input 
            type="number" 
            className="campo-input" 
            value={formData.numeroPaquetes}
            onChange={(e) => handleInputChange('numeroPaquetes', parseInt(e.target.value) || 0)}
          />
        </div>
        
      </div>

      <div className="form-grid">
        {/* Tercera fila */}
        <div className="campo-grupo campo-descripcion">
          <label>Descripción de motivo de traslado</label>
          <textarea 
            className="campo-textarea" 
            placeholder="Descripción de motivo de traslado"
            value={formData.descripcionMotivo}
            onChange={(e) => handleInputChange('descripcionMotivo', e.target.value)}
          ></textarea>
        </div>
        
        <div className="campo-grupo campo-observaciones">
          <label>Observaciones</label>
          <textarea 
            className="campo-textarea" 
            placeholder="Observaciones"
            value={formData.observaciones}
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="form-grid">
        {/* Cuarta fila */}
        <div className="campo-grupo">
          <label>Orden de pedido ⓘ</label>
          <input 
            type="text" 
            className="campo-input" 
            value={formData.ordenPedido}
            onChange={(e) => handleInputChange('ordenPedido', e.target.value)}
          />
        </div>
        
        <div className="campo-grupo">
          <label>Orden de compra</label>
          <input 
            type="text" 
            className="campo-input" 
            value={formData.ordenCompra}
            onChange={(e) => handleInputChange('ordenCompra', e.target.value)}
          />
        </div>
        
        <div className="campo-grupo">
          <label>Referencia</label>
          <select className="campo-input">
            <option>Seleccione</option>
          </select>
        </div>
        
        <div className="campo-grupo">
          <label>Documento relacionado</label>
          <input 
            type="text" 
            className="campo-input" 
            value={formData.documentoRelacionado}
            onChange={(e) => handleInputChange('documentoRelacionado', e.target.value)}
          />
        </div>
      </div>

      <div className="alerta">
        <span className="icono-alerta">ⓘ</span>
        <span>Traslado en vehículos de categoría M1 o L.</span>
      </div>

      {/* Sección Datos envíos */}
      <h3 className="subtitulo">Datos envíos</h3>
      
      <div className="form-grid">
        <div className="campo-grupo">
          <label>Punto de partida * [+ Nuevo]</label>
          <input type="text" className="campo-input" />
        </div>
     
        <div className="campo-grupo">
          <label>Punto de llegada * [+ Nuevo]</label>
          <select className="campo-input">
            <option>Seleccionar punto de llegada</option>
          </select>
        </div>
      </div>

      {/* Sección Datos modo de traslado */}
      <h3 className="subtitulo">Datos modo de traslado</h3>
      
      <div className="form-grid">
        <div className="campo-grupo">
          <label>Datos del conductor * <button type="button" className="btn-nuevo" onClick={handleNuevoConductor}>[+ Nuevo]</button></label>
          <select 
            className="campo-input"
            value={conductorSeleccionado?.id || ''}
            onChange={handleSeleccionarConductor}
          >
            <option value="">Seleccionar conductor</option>
            {conductores.map(conductor => (
              <option key={conductor.id} value={conductor.id}>
                {conductor.nombre} - {conductor.numeroDocumento}{conductor.licencia ? ` - Lic: ${conductor.licencia}` : ''} - {conductor.modoTraslado === 'Transporte público' ? `MTC: ${conductor.mtc || 'N/A'}` : `Dir: ${conductor.direccionFiscal || 'N/A'}`}
              </option>
            ))}
          </select>
        </div>
        
        <div className="campo-grupo">
          <label>Datos del vehículo * [+ Nuevo]</label>
          <select className="campo-input">
            <option>Seleccionar vehículo</option>
          </select>
        </div>
      </div>

      {/* Sección productos */}
      <div className="productos-section">
        <button className="btn-agregar-productos" onClick={agregarProducto}>
          📋 Agregar productos
        </button>
        <button className="btn-descargar">Descargar formato Excel</button>
      </div>

      {/* Tabla de productos */}
      <div className="tabla-container">
        <table className="tabla-productos">
          <thead>
            <tr>
              <th>#</th>
              <th>Unidad</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Peso</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>
                  <input 
                    type="text" 
                    value={producto.unidad}
                    onChange={(e) => actualizarProducto(producto.id, 'unidad', e.target.value)}
                    className="input-tabla"
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={producto.descripcion}
                    onChange={(e) => actualizarProducto(producto.id, 'descripcion', e.target.value)}
                    className="input-tabla input-descripcion"
                  />
                </td>
                <td>
                  <div className="cantidad-container">
                    <button 
                      className="btn-cantidad"
                      onClick={() => actualizarProducto(producto.id, 'cantidad', Math.max(0, producto.cantidad - 1))}
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      value={producto.cantidad}
                      onChange={(e) => actualizarProducto(producto.id, 'cantidad', parseInt(e.target.value) || 0)}
                      className="input-cantidad"
                    />
                    <button 
                      className="btn-cantidad"
                      onClick={() => actualizarProducto(producto.id, 'cantidad', producto.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>
                  <div className="peso-container">
                    <input 
                      type="number" 
                      value={producto.peso}
                      onChange={(e) => actualizarProducto(producto.id, 'peso', parseFloat(e.target.value) || 0)}
                      className="input-tabla"
                    />
                    <button 
                      className="btn-cantidad"
                      onClick={() => actualizarProducto(producto.id, 'peso', producto.peso + 1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>
                  <button 
                    className="btn-eliminar"
                    onClick={() => eliminarProducto(producto.id)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-eliminar"
                    onClick={() => eliminarProducto(producto.id)}
                  >
                    ✖️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button className="btn-agregar-producto-tabla" onClick={agregarProducto}>
          + Agregar Producto
        </button>
      </div>

      <div className="producto-nuevo">
        <span>Producto [+ Nuevo]</span>
      </div>

      {/* Botones finales */}
      <div className="botones-finales">
        <button className="btn-vista-previa">Vista previa</button>
        <button className="btn-cancelar" onClick={handleCancelar}>Cancelar</button>
        <button className="btn-generar" onClick={handleGenerar}>Generar</button>
      </div>

      {/* Modal de Cliente */}
      {mostrarModalCliente && (
        <ModalCliente
          onClose={() => setMostrarModalCliente(false)}
          onClienteCreado={handleClienteCreado}
        />
      )}

      {/* Modal de Conductor */}
      {mostrarModalConductor && (
        <ModalConductor
          onClose={() => setMostrarModalConductor(false)}
          onConductorCreado={handleConductorCreado}
        />
      )}
    </div>
  );
};

export default FormularioGuia;