import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Info, X } from 'lucide-react';
import { obtenerSucursales } from '../../services/sucursalService';
import guiaRemisionService, { crearGuiaTransportista } from '../../services/guiaRemisionService';
import { obtenerPagadoresFlete } from '../../services/pagadorFleteService';
import { obtenerRemitentes } from '../../services/remitenteService';
import { obtenerClientes } from '../../services/clienteService';
import { obtenerVehiculos } from '../../services/vehiculoService';
import { obtenerConductores } from '../../services/conductorService';
import ModalPegadorFlete from './ModalPegadorFlete';
import RemitenteModal from './RemitenteModal';
import Empresasubcontratada from './Empresasubcontratada';
import ModalNuevaDireccion from './ModalNuevaDireccion';
import DestinatarioModal from './destinatarioModal';
import NuevoVehículo from './NuevoVehículo';
import ModalConductor from './ModalConductor';
import ModalAgregarProducto from './modalAgregarProducto';
import Swal from 'sweetalert2';
import '../../styles/FormularioGuiaRemision.css';

const FormularioGuiaRemisionTrans = () => {
  const [formData, setFormData] = useState({
    establecimiento: '',
    serie: 'VT01',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaTraslado: new Date().toISOString().split('T')[0],
    unidadMedida: 'KGM',
    pesoTotal: '0.00',
    numeroPaquetes: 0,
    ordenCompra: '',
    observaciones: '',
    empresaPagadora: '',
    empresaSubcontratada: '',
    remitente: '',
    destinatario: '',
    puntoPartida: '',
    puntoLlegada: '',
    datosVehiculo: 'AQS123 - HILUX - TOYOTA',
    datosVehiculoSecundario: '',
    datosConductor: '44348372 - TIRADO ROJAS MARIA AGUSTINA - L44348372',
    datosConductorSecundario: '',
    productos: []
  });

  const [establecimientos, setEstablecimientos] = useState([]);
  const [guiasRelacionadas, setGuiasRelacionadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarModalPagador, setMostrarModalPagador] = useState(false);
  const [mostrarModalRemitente, setMostrarModalRemitente] = useState(false);
  const [mostrarModalDestinatario, setMostrarModalDestinatario] = useState(false);
  const [mostrarModalVehiculo, setMostrarModalVehiculo] = useState(false);
  const [mostrarModalConductor, setMostrarModalConductor] = useState(false);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [mostrarModalEmpresaSubcontratada, setMostrarModalEmpresaSubcontratada] = useState(false);
  const [mostrarModalDireccionPartida, setMostrarModalDireccionPartida] = useState(false);
  const [mostrarModalDireccionLlegada, setMostrarModalDireccionLlegada] = useState(false);
  const [conductoresDisponibles, setConductoresDisponibles] = useState([]);
  const [pagadoresFlete, setPagadoresFlete] = useState([]);
  const [remitentes, setRemitentes] = useState([]);
  const [destinatarios, setDestinatarios] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [empresasSubcontratadas, setEmpresasSubcontratadas] = useState([]);
  const [direccionesPartida, setDireccionesPartida] = useState([]);
  const [direccionesLlegada, setDireccionesLlegada] = useState([]);

  // Cargar establecimientos, pagadores de flete y remitentes al montar el componente
  useEffect(() => {
    cargarEstablecimientos();
    cargarPagadoresFlete();
    cargarRemitentes();
    cargarDestinatarios();
    cargarVehiculos();
    cargarConductores();
  }, []);

  const cargarEstablecimientos = async () => {
    try {
      const response = await obtenerSucursales();
      setEstablecimientos(response.sucursales || []);
      
      // Seleccionar el primer establecimiento por defecto
      if (response.sucursales && response.sucursales.length > 0) {
        setFormData(prev => ({
          ...prev,
          establecimiento: response.sucursales[0].id.toString()
        }));
      }
    } catch (error) {
      console.error('Error al cargar establecimientos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los establecimientos'
      });
    }
  };

  const cargarPagadoresFlete = async () => {
    try {
      const response = await obtenerPagadoresFlete();
      setPagadoresFlete(response.pagadoresFlete || []);
      // También usar los pagadores de flete como empresas subcontratadas
      setEmpresasSubcontratadas(response.pagadoresFlete || []);
    } catch (error) {
      console.error('Error al cargar pagadores de flete:', error);
    }
  };

  const cargarRemitentes = async () => {
    try {
      const response = await obtenerRemitentes();
      setRemitentes(response.remitentes || []);
    } catch (error) {
      console.error('Error al cargar remitentes:', error);
    }
  };

  const cargarDestinatarios = async () => {
    try {
      const response = await obtenerClientes();
      setDestinatarios(response.clientes || []);
    } catch (error) {
      console.error('Error al cargar destinatarios:', error);
    }
  };

  const cargarVehiculos = async () => {
    try {
      const response = await obtenerVehiculos();
      setVehiculos(response.vehiculos || []);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    }
  };

  const cargarConductores = async () => {
    try {
      const response = await obtenerConductores();
      setConductores(response.conductores || []);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const incrementPaquetes = () => {
    setFormData(prev => ({
      ...prev,
      numeroPaquetes: prev.numeroPaquetes + 1
    }));
  };

  const decrementPaquetes = () => {
    setFormData(prev => ({
      ...prev,
      numeroPaquetes: Math.max(0, prev.numeroPaquetes - 1)
    }));
  };

  const incrementPeso = () => {
    setFormData(prev => ({
      ...prev,
      pesoTotal: (parseFloat(prev.pesoTotal) + 0.01).toFixed(2)
    }));
  };

  const agregarProducto = () => {
    setMostrarModalProducto(true);
  };

  const eliminarProducto = (productoId) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter(producto => producto.id !== productoId)
    }));
    
    Swal.fire({
      icon: 'success',
      title: 'Producto eliminado',
      text: 'El producto ha sido eliminado de la lista',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const agregarGuiaRelacionada = () => {
    const nuevaGuia = {
      id: Date.now(),
      serie: '',
      numero: '',
      ruc: ''
    };
    setGuiasRelacionadas(prev => [...prev, nuevaGuia]);
  };

  const eliminarGuiaRelacionada = (id) => {
    setGuiasRelacionadas(prev => prev.filter(guia => guia.id !== id));
  };

  const actualizarGuiaRelacionada = (id, campo, valor) => {
    setGuiasRelacionadas(prev => 
      prev.map(guia => 
        guia.id === id ? { ...guia, [campo]: valor } : guia
      )
    );
  };

  // Funciones para el modal del pagador
  const abrirModalPagador = () => {
    setMostrarModalPagador(true);
  };

  const cerrarModalPagador = () => {
    setMostrarModalPagador(false);
  };

  // Funciones para el modal del remitente
  const abrirModalRemitente = () => {
    setMostrarModalRemitente(true);
  };

  const cerrarModalRemitente = () => {
    setMostrarModalRemitente(false);
  };

  // Funciones para el modal del destinatario
  const abrirModalDestinatario = () => {
    setMostrarModalDestinatario(true);
  };

  const cerrarModalDestinatario = () => {
    setMostrarModalDestinatario(false);
  };

  // Funciones para el modal del vehículo
  const abrirModalVehiculo = () => {
    setMostrarModalVehiculo(true);
  };

  // Funciones para el modal del conductor
  const abrirModalConductor = () => {
    setMostrarModalConductor(true);
  };

  // Funciones para el modal de empresa subcontratada
  const abrirModalEmpresaSubcontratada = () => {
    setMostrarModalEmpresaSubcontratada(true);
  };

  const cerrarModalEmpresaSubcontratada = () => {
    setMostrarModalEmpresaSubcontratada(false);
  };

  // Funciones para los modales de dirección
  const abrirModalDireccionPartida = () => {
    setMostrarModalDireccionPartida(true);
  };

  const cerrarModalDireccionPartida = () => {
    setMostrarModalDireccionPartida(false);
  };

  const abrirModalDireccionLlegada = () => {
    setMostrarModalDireccionLlegada(true);
  };

  const cerrarModalDireccionLlegada = () => {
    setMostrarModalDireccionLlegada(false);
  };

  const handleDireccionCreada = (nuevaDireccion, tipo) => {
    // Crear un objeto de dirección con ID único
    const direccionConId = {
      id: Date.now(), // ID único basado en timestamp
      direccionCompleta: nuevaDireccion.direccionCompleta,
      codigo: nuevaDireccion.codigo
    };

    if (tipo === 'partida') {
      // Agregar a la lista de direcciones de partida
      setDireccionesPartida(prev => [...prev, direccionConId]);
      
      // Actualizar el campo del formulario con el ID de la nueva dirección
      setFormData(prev => ({
        ...prev,
        puntoPartida: direccionConId.id.toString()
      }));
      cerrarModalDireccionPartida();
    } else if (tipo === 'llegada') {
      // Agregar a la lista de direcciones de llegada
      setDireccionesLlegada(prev => [...prev, direccionConId]);
      
      // Actualizar el campo del formulario con el ID de la nueva dirección
      setFormData(prev => ({
        ...prev,
        puntoLlegada: direccionConId.id.toString()
      }));
      cerrarModalDireccionLlegada();
    }

    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: `Dirección de ${tipo} creada correctamente`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handlePagadorFleteCreado = (nuevoConductor) => {
    // Agregar el nuevo conductor a la lista
    setConductoresDisponibles(prev => [...prev, nuevoConductor]);
    
    // Agregar el nuevo pagador a la lista de pagadores de flete
    setPagadoresFlete(prev => [...prev, nuevoConductor]);
    
    // Actualizar el campo empresaPagadora con el ID del nuevo conductor
    setFormData(prev => ({
      ...prev,
      empresaPagadora: nuevoConductor.id.toString()
    }));

    // Recargar la lista de pagadores de flete desde el backend
    cargarPagadoresFlete();

    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Pagador del flete creado correctamente',
      timer: 2000,
      showConfirmButton: false
    });

    // Cerrar el modal
    setMostrarModalPagador(false);
  };

  const handleRemitenteCreado = (nuevoRemitente) => {
    // Agregar el nuevo remitente a la lista
    setRemitentes(prev => [...prev, nuevoRemitente]);
    
    // Actualizar el campo remitente con el ID del nuevo remitente
    setFormData(prev => ({
      ...prev,
      remitente: nuevoRemitente.id
    }));

    // Recargar la lista de remitentes desde el backend
    cargarRemitentes();

    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Remitente creado correctamente',
      timer: 2000,
      showConfirmButton: false
    });

    // Cerrar el modal
    cerrarModalRemitente();
  };

  const handleDestinatarioCreado = (nuevoDestinatario) => {
    // Agregar el nuevo destinatario a la lista
    setDestinatarios(prev => [...prev, nuevoDestinatario]);
    
    // Actualizar el campo destinatario con el ID del nuevo destinatario
    setFormData(prev => ({
      ...prev,
      destinatario: nuevoDestinatario.id
    }));

    // Recargar la lista de destinatarios desde el backend
    cargarDestinatarios();

    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Destinatario creado correctamente',
      timer: 2000,
      showConfirmButton: false
    });

    // Cerrar el modal
    cerrarModalDestinatario();
  };

  const handleVehiculoCreado = (nuevoVehiculo) => {
    setVehiculos(prev => [...prev, nuevoVehiculo]);
    setFormData(prev => ({
      ...prev,
      datosVehiculo: nuevoVehiculo.id
    }));

    // Recargar la lista de vehículos desde el backend
    cargarVehiculos();

    setMostrarModalVehiculo(false);
    Swal.fire({
      icon: 'success',
      title: 'Vehículo creado',
      text: `El vehículo ${nuevoVehiculo.nroPlacaId} ha sido creado exitosamente`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleConductorCreado = (nuevoConductor) => {
    setConductores(prev => [...prev, nuevoConductor]);
    setFormData(prev => ({
      ...prev,
      datosConductor: nuevoConductor.id
    }));

    // Recargar la lista de conductores desde el backend
    cargarConductores();

    setMostrarModalConductor(false);
    Swal.fire({
      icon: 'success',
      title: 'Conductor creado',
      text: `El conductor ${nuevoConductor.nombre} ha sido creado exitosamente`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleProductoAgregado = (nuevoProducto) => {
    // Agregar el producto a la lista de productos en formData
    const productoConId = {
      ...nuevoProducto,
      id: Date.now(), // ID temporal basado en timestamp
      unidad: 'UND' // Unidad por defecto
    };
    
    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, productoConId]
    }));
    
    setMostrarModalProducto(false);
    Swal.fire({
      icon: 'success',
      title: 'Producto agregado',
      text: `El producto ${nuevoProducto.producto} ha sido agregado exitosamente`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleEmpresaSubcontratadaCreada = (nuevaEmpresa) => {
    // Agregar la nueva empresa a la lista de empresas subcontratadas
    setEmpresasSubcontratadas(prev => [...prev, nuevaEmpresa]);
    
    // Actualizar el campo empresaSubcontratada con el ID de la nueva empresa
    setFormData(prev => ({
      ...prev,
      empresaSubcontratada: nuevaEmpresa.id.toString()
    }));

    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Empresa subcontratada creada correctamente',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const guardarGuiaRemision = async () => {
    // Prevenir múltiples clics
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      // Validaciones básicas
      if (!formData.establecimiento) {
        setLoading(false);
        throw new Error('Debe seleccionar un establecimiento');
      }
      if (!formData.remitente) {
        setLoading(false);
        throw new Error('Debe ingresar el remitente');
      }
      if (!formData.destinatario) {
        setLoading(false);
        throw new Error('Debe ingresar el destinatario');
      }
      if (!formData.puntoPartida) {
        setLoading(false);
        throw new Error('Debe ingresar el punto de partida');
      }
      if (!formData.puntoLlegada) {
        setLoading(false);
        throw new Error('Debe ingresar el punto de llegada');
      }
      if (!formData.datosVehiculo) {
        setLoading(false);
        throw new Error('Debe seleccionar un vehículo');
      }
      if (!formData.datosConductor) {
        setLoading(false);
        throw new Error('Debe seleccionar un conductor');
      }
      if (formData.productos.length === 0) {
        setLoading(false);
        throw new Error('Debe agregar al menos un producto');
      }

      // Obtener datos del vehículo seleccionado
      const vehiculoSeleccionado = vehiculos.find(v => v.id.toString() === formData.datosVehiculo.toString());
      
      // Obtener datos del conductor seleccionado
      const conductorSeleccionado = conductores.find(c => c.id.toString() === formData.datosConductor.toString());

      // Validar que se encontraron los datos
      if (!vehiculoSeleccionado) {
        setLoading(false);
        throw new Error('No se encontró el vehículo seleccionado');
      }
      if (!conductorSeleccionado) {
        setLoading(false);
        throw new Error('No se encontró el conductor seleccionado');
      }

      // Mapear los datos del formulario a la estructura que espera el backend
      const datosGuia = {
        clienteId: formData.destinatario ? parseInt(formData.destinatario) : null,
        conductor: conductorSeleccionado ? `${conductorSeleccionado.nombre} ${conductorSeleccionado.apellido}` : '',
        dniConductor: conductorSeleccionado?.numeroDocumento || '',
        marca: vehiculoSeleccionado?.marca || '',
        modelo: vehiculoSeleccionado?.modelo || '',
        rutaVehiculo: `${formData.puntoPartida} - ${formData.puntoLlegada}`,
        observacion: formData.observaciones || 'Guía de remisión de transportista',
        detalles: formData.productos.map(producto => ({
          productoId: producto.productoId || null,
          cantidad: parseFloat(producto.cantidad) || 0,
          descripcion: producto.producto || producto.descripcion || producto.nombre || '',
          peso: parseFloat(producto.peso) || 0
        }))
      };

      console.log('Datos a enviar:', datosGuia);
      console.log('Vehículo seleccionado:', vehiculoSeleccionado);
      console.log('Conductor seleccionado:', conductorSeleccionado);

      // Agregar timeout para evitar que se quede colgado
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La operación tardó demasiado')), 30000);
      });

      const response = await Promise.race([
        crearGuiaTransportista(datosGuia),
        timeoutPromise
      ]);

      setLoading(false);

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Guía de remisión creada correctamente'
      });

      // Limpiar formulario
      setFormData({
        establecimiento: establecimientos.length > 0 ? establecimientos[0].id.toString() : '',
        serie: 'VT01',
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaTraslado: new Date().toISOString().split('T')[0],
        unidadMedida: 'KGM',
        pesoTotal: '0.00',
        numeroPaquetes: 0,
        ordenCompra: '',
        observaciones: '',
        empresaPagadora: '',
        remitente: '',
        destinatario: '',
        puntoPartida: '',
        puntoLlegada: '',
        datosVehiculo: '',
        datosConductor: '',
        productos: [],
        guiasRelacionadas: []
      });

    } catch (error) {
      setLoading(false); // Asegurar que siempre se desbloquee el botón
      
      console.error('Error completo:', error);
      
      let mensajeError = 'Error al crear la guía de remisión';
      
      if (error.message === 'Timeout: La operación tardó demasiado') {
        mensajeError = 'La operación tardó demasiado tiempo. Verifique su conexión e intente nuevamente.';
      } else if (error.response) {
        // Error del servidor
        console.error('Error del servidor:', error.response.data);
        mensajeError = error.response.data?.mensaje || error.response.data?.error || 'Error en el servidor';
      } else if (error.request) {
        // Error de red
        console.error('Error de red:', error.request);
        mensajeError = 'Error de conexión con el servidor. Verifique que el backend esté funcionando.';
      } else {
        // Error de validación local
        mensajeError = error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensajeError,
        footer: 'Revise la consola del navegador para más detalles'
      });
    }
  };

  return (
    <div>
      <h1 className="formulario-titulo">Nueva G.R. Transportista</h1>
      
      <div className="formulario-grid">
        {/* Fila 1 */}
        <div className="campo-grupo">
          <label className="campo-label">Establecimiento <span className="requerido">*</span></label>
          <select 
            className="campo-input campo-select"
            value={formData.establecimiento}
            onChange={(e) => handleInputChange('establecimiento', e.target.value)}
          >
            <option value="">Seleccionar establecimiento</option>
            {establecimientos.map(establecimiento => (
              <option key={establecimiento.id} value={establecimiento.id}>
                {establecimiento.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="campo-grupo">
          <label className="campo-label">Serie <span className="requerido">*</span></label>
          <select 
            className="campo-input campo-select"
            value={formData.serie}
            onChange={(e) => handleInputChange('serie', e.target.value)}
          >
            <option value="VT01">VT01</option>
          </select>
        </div>

        <div className="campo-grupo">
          <label className="campo-label">
            Fecha de emisión <Info className="info-icon" size={16} />
          </label>
          <div className="fecha-input-container">
            <input 
              type="date"
              className="campo-input"
              value={formData.fechaEmision}
              onChange={(e) => handleInputChange('fechaEmision', e.target.value)}
            />
          </div>
        </div>

        <div className="campo-grupo">
          <label className="campo-label">Fecha de traslado <span className="requerido">*</span></label>
          <div className="fecha-input-container">
            <input 
              type="date"
              className="campo-input"
              value={formData.fechaTraslado}
              onChange={(e) => handleInputChange('fechaTraslado', e.target.value)}
            />
          </div>
        </div>

        <div className="campo-grupo">
          <label className="campo-label">Unidad de medida <span className="requerido">*</span></label>
          <select 
            className="campo-input campo-select"
            value={formData.unidadMedida}
            onChange={(e) => handleInputChange('unidadMedida', e.target.value)}
          >
            <option value="KGM">KGM</option>
          </select>
        </div>

        <div className="campo-grupo">
          <label className="campo-label">Peso total <span className="requerido">*</span></label>
          <div className="input-con-botones">
            <input 
              type="text"
              className="campo-input"
              value={formData.pesoTotal}
              onChange={(e) => handleInputChange('pesoTotal', e.target.value)}
            />
            <button type="button" className="boton-incrementar" onClick={incrementPeso}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Fila 2 */}
        <div className="campo-grupo">
          <label className="campo-label">Número de paquetes</label>
          <div className="input-con-botones">
            <input 
              type="number"
              className="campo-input"
              value={formData.numeroPaquetes}
              onChange={(e) => handleInputChange('numeroPaquetes', parseInt(e.target.value) || 0)}
            />
            <button type="button" className="boton-incrementar" onClick={incrementPaquetes}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="campo-grupo">
          <label className="campo-label">Orden de compra</label>
          <input 
            type="text"
            className="campo-input"
            value={formData.ordenCompra}
            onChange={(e) => handleInputChange('ordenCompra', e.target.value)}
          />
        </div>

        <div className="campo-grupo observaciones-grupo">
          <label className="campo-label">Observaciones</label>
          <textarea 
            className="campo-input campo-textarea"
            placeholder="Observaciones..."
            value={formData.observaciones}
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
            rows={4}
          />
        </div>

        <div className="campo-grupo guias-grupo">
          <label className="campo-label">
            Guías de remisión relacionadas 
            <span className="enlace-agregar" onClick={agregarGuiaRelacionada}>(+ Agregar)</span>
          </label>
          
          {guiasRelacionadas.length > 0 && (
            <div className="guias-relacionadas-container">
              <div className="guias-relacionadas-header">
                <div className="guia-columna">Serie</div>
                <div className="guia-columna">Número</div>
                <div className="guia-columna">RUC</div>
                <div className="guia-columna">Acciones</div>
              </div>
              
              {guiasRelacionadas.map((guia) => (
                <div key={guia.id} className="guia-relacionada-row">
                  <div className="guia-columna">
                    <input
                      type="text"
                      className="campo-input-small"
                      placeholder="T001"
                      value={guia.serie}
                      onChange={(e) => actualizarGuiaRelacionada(guia.id, 'serie', e.target.value)}
                    />
                  </div>
                  <div className="guia-columna">
                    <input
                      type="text"
                      className="campo-input-small"
                      placeholder="00000001"
                      value={guia.numero}
                      onChange={(e) => actualizarGuiaRelacionada(guia.id, 'numero', e.target.value)}
                    />
                  </div>
                  <div className="guia-columna">
                    <input
                      type="text"
                      className="campo-input-small"
                      placeholder="20000000001"
                      value={guia.ruc}
                      onChange={(e) => actualizarGuiaRelacionada(guia.id, 'ruc', e.target.value)}
                    />
                  </div>
                  <div className="guia-columna">
                    <button
                      type="button"
                      className="boton-eliminar"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        eliminarGuiaRelacionada(guia.id);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fila 3 - Empresas */}
        <div className="campo-grupo">
          <label className="campo-label">
            Empresa pagador del flete <Info className="info-icon" size={16} /> 
            <span className="enlace-agregar" onClick={abrirModalPagador}>(+ Nuevo)</span>
          </label>
          <select 
            className="campo-input campo-select"
            value={formData.empresaPagadora}
            onChange={(e) => handleInputChange('empresaPagadora', e.target.value)}
          >
            <option value="">Seleccionar pagador del flete</option>
            {pagadoresFlete.map(pagador => (
              <option key={pagador.id} value={pagador.id}>
                {pagador.numeroDocumento} - {pagador.nombre}
              </option>
            ))}
          </select>
        </div>





        

        <div className="campo-grupo">
          <label className="campo-label">
            Empresa subcontratada <Info className="info-icon" size={16} /> 
            <span className="enlace-agregar" onClick={abrirModalEmpresaSubcontratada}>(+ Nuevo)</span>
          </label>
          <select 
            className="campo-input campo-select"
            value={formData.empresaSubcontratada}
            onChange={(e) => handleInputChange('empresaSubcontratada', e.target.value)}
          >
            <option value="">Seleccionar empresa subcontratada</option>
            {empresasSubcontratadas.map(empresa => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.numeroDocumento} - {empresa.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Fila 4 - Remitente y Puntos */}
        <div className="campo-grupo">
          <label className="campo-label">
            Remitente <span className="requerido">*</span> 
            <span className="enlace-agregar" onClick={abrirModalRemitente}>(+ Nuevo)</span>
          </label>
          <select 
            className="campo-input campo-select"
            value={formData.remitente}
            onChange={(e) => handleInputChange('remitente', e.target.value)}
          >
            <option value="">Seleccionar remitente</option>
            {remitentes.map(remitente => (
              <option key={remitente.id} value={remitente.id}>
                {remitente.numeroDocumento} - {remitente.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="campo-grupo">
          <label className="campo-label">
            Punto de partida  
            <span className="enlace-agregar" onClick={abrirModalDireccionPartida} style={{cursor: 'pointer', color: '#007bff'}}>[+ Nuevo]</span> 
            <span className="requerido">*</span>
          </label>
          <select 
            className="campo-input campo-select"
            value={formData.puntoPartida}
            onChange={(e) => handleInputChange('puntoPartida', e.target.value)}
          >
            <option value="">Seleccionar punto de partida</option>
            {direccionesPartida.map(direccion => (
              <option key={direccion.id} value={direccion.id}>
                {direccion.direccionCompleta}
              </option>
            ))}
          </select>
        </div>

        {/* Fila 5 - Destinatario  */}
        <div className="campo-grupo">
          <label className="campo-label">
            Destinatario <span className="requerido">*</span> 
            <span className="enlace-agregar" onClick={abrirModalDestinatario} style={{cursor: 'pointer', color: '#007bff'}}>(+ Nuevo)</span>
          </label>
          <select 
            className="campo-input campo-select"
            value={formData.destinatario}
            onChange={(e) => handleInputChange('destinatario', e.target.value)}
          >
            <option value="">Seleccionar destinatario</option>
            {destinatarios.map(destinatario => (
              <option key={destinatario.id} value={destinatario.id}>
                {destinatario.numeroDocumento} - {destinatario.nombre}
              </option>
            ))}
          </select>
        </div>


        {/* Fila 5 - punto de  Llegada */}

        <div className="campo-grupo">
          <label className="campo-label">
            Punto de llegada 
            <span className="enlace-agregar" onClick={abrirModalDireccionLlegada} style={{cursor: 'pointer', color: '#007bff'}}>[+ Nuevo]</span>
            <span className="requerido">*</span>
          </label>
          <select 
            className="campo-input campo-select"
            value={formData.puntoLlegada}
            onChange={(e) => handleInputChange('puntoLlegada', e.target.value)}
          >
            <option value="">Seleccionar punto de llegada</option>
            {direccionesLlegada.map(direccion => (
              <option key={direccion.id} value={direccion.id}>
                {direccion.direccionCompleta}
              </option>
            ))}
          </select>
        </div>

        {/* Fila 6 - Vehículos */}
        <div className="campo-grupo">
          <label className="campo-label">
            Datos del vehículo <span className="requerido">*</span> 
            <span className="enlace-agregar" onClick={abrirModalVehiculo}>(+ Nuevo)</span>
          </label>
          <select 
            className="campo-input campo-select"
            value={formData.datosVehiculo}
            onChange={(e) => handleInputChange('datosVehiculo', e.target.value)}
          >
            <option value="">Seleccionar vehículo</option>
            {vehiculos.map(vehiculo => (
              <option key={vehiculo.id} value={vehiculo.id}>
                {vehiculo.nroPlacaId} - {vehiculo.modeloVehiculo} - {vehiculo.marcaVehiculo}
              </option>
            ))}
          </select>
        </div>



        
       {/* Fila 6 -  Conductores */}
        <div className="campo-grupo">
          <label className="campo-label">
            Datos del conductor <span className="requerido">*</span> 
            <span className="enlace-agregar" onClick={abrirModalConductor}>(+ Nuevo)</span>
          </label>
          <select 
            className="campo-input campo-select"
            value={formData.datosConductor}
            onChange={(e) => handleInputChange('datosConductor', e.target.value)}
          >
            <option value="">Seleccionar conductor</option>
            {conductores.map(conductor => (
              <option key={conductor.id} value={conductor.id}>
                {conductor.numeroDocumento} - {conductor.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Fila 7 -  vehículo Secundarios */}
        <div className="campo-grupo">
          <label className="campo-label">
            Datos del vehículo <span className="requerido">*</span> 
            <span className="enlace-agregar" onClick={abrirModalVehiculo}>(+ Nuevo)</span>
          </label>
          <select 
            className="campo-input campo-select"
            value={formData.datosVehiculo}
            onChange={(e) => handleInputChange('datosVehiculo', e.target.value)}
          >
            <option value="">Seleccionar vehículo</option>
            {vehiculos.map(vehiculo => (
              <option key={vehiculo.id} value={vehiculo.id}>
                {vehiculo.nroPlacaId} - {vehiculo.modeloVehiculo} - {vehiculo.marcaVehiculo}
              </option>
            ))}
          </select>
        </div>





          {/* Fila 7 -   Datos del conductor secundario */}
        


         <div className="campo-grupo">
          <label className="campo-label">
            Datos del conductor secundario <span className="requerido">*</span> 
            <span className="enlace-agregar" onClick={abrirModalConductor}>(+ Nuevo)</span>
          </label>
          <select 
            className="campo-input campo-select"
            value={formData.datosConductor}
            onChange={(e) => handleInputChange('datosConductor', e.target.value)}
          >
            <option value="">Seleccionar conductor</option>
            {conductores.map(conductor => (
              <option key={conductor.id} value={conductor.id}>
                {conductor.numeroDocumento} - {conductor.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="productos-seccion">
        <div className="productos-header">
          <div className="productos-columna">#</div>
          <div className="productos-columna">Unidad</div>
          <div className="productos-columna">Descripción</div>
          <div className="productos-columna">Cantidad</div>
          <div className="productos-columna">Peso</div>
          <div className="productos-columna">Acciones</div>
        </div> 

        {/* Mostrar productos agregados */}
        <div className="productos-body">
          {formData.productos.map((producto, index) => (
            <div key={producto.id} className="producto-fila">
              <div className="productos-columna">{index + 1}</div>
              <div className="productos-columna">{producto.unidad}</div>
              <div className="productos-columna">{producto.producto}</div>
              <div className="productos-columna">{producto.cantidad}</div>
              <div className="productos-columna">{producto.peso}</div>
              <div className="productos-columna">
                <button 
                  className="boton-eliminar-producto"
                  onClick={() => eliminarProducto(producto.id)}
                  title="Eliminar producto"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="boton-agregar-producto" onClick={agregarProducto}>
          <Plus size={16} />
          Agregar Producto
        </button>
      </div>

      {/* Botones de acción */}
      <div className="botones-grupo">
        <button 
          type="button" 
          className="boton-cancelar"
          onClick={() => {
            setFormData({
              establecimiento: establecimientos.length > 0 ? establecimientos[0].id.toString() : '',
              serie: 'VT01',
              fechaEmision: new Date().toISOString().split('T')[0],
              fechaTraslado: new Date().toISOString().split('T')[0],
              unidadMedida: 'KGM',
              pesoTotal: '0.00',
              numeroPaquetes: 0,
              ordenCompra: '',
              observaciones: '',
              empresaPagadora: '',
              empresaSubcontratada: '',
              remitente: '',
              destinatario: '',
              puntoPartida: '',
              puntoLlegada: '',
              datosVehiculo: 'AQS123 - HILUX - TOYOTA',
              datosVehiculoSecundario: '',
              datosConductor: '44348372 - TIRADO ROJAS MARIA AGUSTINA - L44348372',
              datosConductorSecundario: '',
              productos: []
            });
            setGuiasRelacionadas([]);
          }}
        >
          Cancelar
        </button>
        <button 
          type="button" 
          className="boton-guardar"
          onClick={guardarGuiaRemision}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* Modal del Pagador del Flete */}
      {mostrarModalPagador && (
        <ModalPegadorFlete
          onClose={cerrarModalPagador}
          onPagadorFleteCreado={handlePagadorFleteCreado}
        />
      )}

      {/* Modal del Remitente */}
      {mostrarModalRemitente && (
        <RemitenteModal
          onClose={cerrarModalRemitente}
          onRemitenteCreado={handleRemitenteCreado}
        />
      )}

      {/* Modal del Destinatario */}
      {mostrarModalDestinatario && (
        <DestinatarioModal
          onClose={cerrarModalDestinatario}
          onRemitenteCreado={handleDestinatarioCreado}
        />
      )}

      {/* Modal del Vehículo */}
      {mostrarModalVehiculo && (
        <NuevoVehículo
          onClose={() => setMostrarModalVehiculo(false)}
          onVehiculoCreado={handleVehiculoCreado}
        />
      )}

      {/* Modal del Conductor */}
      {mostrarModalConductor && (
        <ModalConductor
          onClose={() => setMostrarModalConductor(false)}
          onConductorCreado={handleConductorCreado}
        />
      )}

      {/* Modal Agregar Producto */}
      {mostrarModalProducto && (
        <ModalAgregarProducto
          isOpen={mostrarModalProducto}
          onClose={() => setMostrarModalProducto(false)}
          onSave={handleProductoAgregado}
        />
      )}

      {/* Modal de Empresa Subcontratada */}
      {mostrarModalEmpresaSubcontratada && (
        <Empresasubcontratada
          onClose={cerrarModalEmpresaSubcontratada}
          onPagadorFleteCreado={handleEmpresaSubcontratadaCreada}
        />
      )}

      {/* Modal de Nueva Dirección de Partida */}
      {mostrarModalDireccionPartida && (
        <ModalNuevaDireccion
          isOpen={mostrarModalDireccionPartida}
          onClose={cerrarModalDireccionPartida}
          onDireccionCreada={(direccion) => handleDireccionCreada(direccion, 'partida')}
          tipo="partida"
        />
      )}

      {/* Modal de Nueva Dirección de Llegada */}
      {mostrarModalDireccionLlegada && (
        <ModalNuevaDireccion
          isOpen={mostrarModalDireccionLlegada}
          onClose={cerrarModalDireccionLlegada}
          onDireccionCreada={(direccion) => handleDireccionCreada(direccion, 'llegada')}
          tipo="llegada"
        />
      )}
    </div>
  );
};

export default FormularioGuiaRemisionTrans;