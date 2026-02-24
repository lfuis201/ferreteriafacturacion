import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Truck, Package, FileText, User, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import ProductoGuiaRemision from './ProductoGuiaRemision';
import ModalCliente from './ModalCliente';
import ModalConductor from './ModalConductor';
import ModalConductorPublico from './ModalConductorPublico';
import ModalVehiculo from './ModalVehiculo';
import ModalVehiculoPrivado from './ModalVehiculoPrivado';
import ModalVehiculoPublico from './ModalVehiculoPublico';
import ModalTransportista from './ModalTransportista';
import ModalTransportistaPublico from './ModalTransportistaPublico';
import guiaRemisionService from '../../services/guiaRemisionService';
import clienteService from '../../services/clienteService';
import { obtenerConductores } from '../../services/conductorService';
import { obtenerVehiculos } from '../../services/vehiculoService';
import { obtenerTransportistas } from '../../services/transportistaService';
import '../../styles/FormularioGuia.css';

// Datos de ubigeo simplificados (solo 3 como solicitado)
const ubigeosIniciales = [
  {
    id: "150101",
    codigo: "150101",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "LIMA",
  },
  {
    id: "150102",
    codigo: "150102",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "ANCON",
  },
  {
    id: "150103",
    codigo: "150103",
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "ATE",
  }
];

// Modal para añadir nuevo ubigeo
function ModalNuevoUbigeo({ isOpen, onClose, onUbigeoCreado, tipo }) {
  const [nuevoUbigeo, setNuevoUbigeo] = useState({
    codigo: "",
    departamento: "",
    provincia: "",
    distrito: "",
    direccion: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoUbigeo((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !nuevoUbigeo.departamento ||
      !nuevoUbigeo.provincia ||
      !nuevoUbigeo.distrito ||
      !nuevoUbigeo.direccion
    ) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const direccionCompleta = `${nuevoUbigeo.direccion}, ${nuevoUbigeo.distrito}, ${nuevoUbigeo.provincia}, ${nuevoUbigeo.departamento}`;
    
    const ubigeoData = {
      direccionCompleta,
      codigo: nuevoUbigeo.codigo
    };
    
    onUbigeoCreado(ubigeoData);

    // Limpiar formulario
    setNuevoUbigeo({
      codigo: "",
      departamento: "",
      provincia: "",
      distrito: "",
      direccion: ""
    });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1500,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            Nueva dirección de {tipo === 'partida' ? 'partida' : 'llegada'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ×
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          <div
            style={{
              display: "grid",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            {/* Dirección */}
             <div>
               <label
                 style={{
                   display: "block",
                   marginBottom: "5px",
                   fontSize: "12px",
                   fontWeight: "bold",
                   color: "#333",
                 }}
               >
                 Dirección *
               </label>
               <input
                 type="text"
                 name="direccion"
                 value={nuevoUbigeo.direccion}
                 onChange={handleInputChange}
                 placeholder="Ej: Av. Los Olivos 123"
                 required
                 style={{
                   width: "100%",
                   padding: "8px",
                   border: "1px solid #ddd",
                   borderRadius: "4px",
                   fontSize: "12px",
                 }}
               />
             </div>

             {/* Código de Ubigeo */}
             <div>
               <label
                 style={{
                   display: "block",
                   marginBottom: "5px",
                   fontSize: "12px",
                   fontWeight: "bold",
                   color: "#333",
                 }}
               >
                 Código Ubigeo
               </label>
               <input
                 type="text"
                 name="codigo"
                 value={nuevoUbigeo.codigo}
                 readOnly
                 style={{
                   width: "100%",
                   padding: "8px",
                   border: "1px solid #ddd",
                   borderRadius: "4px",
                   fontSize: "12px",
                   backgroundColor: "#f8f9fa",
                   color: "#666"
                 }}
               />
             </div>

            {/* Ubigeo */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Ubigeo
              </label>
              <select
                name="departamento"
                value={nuevoUbigeo.departamento}
                onChange={(e) => {
                  const selectedUbigeo = ubigeosIniciales.find(u => u.departamento === e.target.value);
                  if (selectedUbigeo) {
                    setNuevoUbigeo(prev => ({
                      ...prev,
                      departamento: selectedUbigeo.departamento,
                      provincia: selectedUbigeo.provincia,
                      distrito: selectedUbigeo.distrito,
                      codigo: selectedUbigeo.codigo
                    }));
                  }
                }}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                <option value="">Seleccionar</option>
                {ubigeosIniciales.map(ubigeo => (
                  <option key={ubigeo.id} value={ubigeo.departamento}>
                    {ubigeo.departamento} - {ubigeo.provincia} - {ubigeo.distrito}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botones */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#f8f9fa",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#28a745",
                color: "white",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormularioGuiaCompleto() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [productoEditando, setProductoEditando] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // Datos de venta si viene desde lista de ventas
  const ventaData = location.state?.ventaData;
  const fromVenta = location.state?.fromVenta || false;
  
  // Estados para los modales de ubigeo
  const [modalPartidaOpen, setModalPartidaOpen] = useState(false);
  const [modalLlegadaOpen, setModalLlegadaOpen] = useState(false);
  
  // Estados para el modal de conductor
  const [mostrarModalConductor, setMostrarModalConductor] = useState(false);
  const [mostrarModalConductorPublico, setMostrarModalConductorPublico] = useState(false);
  const [conductores, setConductores] = useState([]);
  const [conductorSeleccionado, setConductorSeleccionado] = useState(null);
  
  // Estados para el modal de vehículo
  const [mostrarModalVehiculo, setMostrarModalVehiculo] = useState(false);
  const [mostrarModalVehiculoPrivado, setMostrarModalVehiculoPrivado] = useState(false);
  const [mostrarModalVehiculoPublico, setMostrarModalVehiculoPublico] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  
  // Estados para el modal de transportista
  const [mostrarModalTransportista, setMostrarModalTransportista] = useState(false);
  const [mostrarModalTransportistaPublico, setMostrarModalTransportistaPublico] = useState(false);
  const [transportistas, setTransportistas] = useState([]);
  const [transportistaSeleccionado, setTransportistaSeleccionado] = useState(null);

  // Estado para previsualización PDF de guía
  const [showPreviewGuia, setShowPreviewGuia] = useState(false);
  const [previewGuiaPdfUrl, setPreviewGuiaPdfUrl] = useState('');
  const [guiaGuardadaInfo, setGuiaGuardadaInfo] = useState(null);

  // Funciones para manejar los modales de ubigeo
  const handleUbigeoPartidaCreado = (ubigeoData) => {
    setFormData(prev => ({
      ...prev,
      puntoPartida: ubigeoData.direccionCompleta,
      codigoUbigeoPartida: ubigeoData.codigo
    }));
    setModalPartidaOpen(false);
  };

  const handleUbigeoLlegadaCreado = (ubigeoData) => {
    setFormData(prev => ({
      ...prev,
      puntoLlegada: ubigeoData.direccionCompleta,
      codigoUbigeoLlegada: ubigeoData.codigo
    }));
    setModalLlegadaOpen(false);
  };
  
  // Funciones para manejar el modal de conductor
  const handleNuevoConductor = () => {
    setMostrarModalConductor(true);
  };

  const handleNuevoConductorPublico = () => {
    setMostrarModalConductorPublico(true);
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

  const handleConductorPublicoCreado = (conductor) => {
    setConductores(prev => [...prev, conductor]);
    setConductorSeleccionado(conductor);
    setFormData(prev => ({
      ...prev,
      conductor: conductor.nombre,
      dniConductor: conductor.numeroDocumento
    }));
    setMostrarModalConductorPublico(false);
  };
  
  // Funciones para manejar el modal de vehículo
  const handleNuevoVehiculo = () => {
    if (formData.tipoTransporte === 'privado') {
      setMostrarModalVehiculoPrivado(true);
    } else {
      setMostrarModalVehiculo(true);
    }
  };

  const handleNuevoVehiculoPublico = () => {
    setMostrarModalVehiculoPublico(true);
  };
  
  const handleVehiculoCreado = (vehiculo) => {
    setVehiculos(prev => [...prev, vehiculo]);
    setVehiculoSeleccionado(vehiculo);
    setFormData(prev => ({
      ...prev,
      vehiculo: vehiculo.nroPlacaId,
      placaVehiculo: vehiculo.nroPlacaId,
      nroPlaca: vehiculo.nroPlacaId,
      marca: vehiculo.marcaVehiculo || '',
      modelo: vehiculo.modeloVehiculo || ''
    }));
    setMostrarModalVehiculo(false);
  };

  const handleVehiculoPrivadoCreado = (vehiculo) => {
    setVehiculos(prev => [...prev, vehiculo]);
    setVehiculoSeleccionado(vehiculo);
    setFormData(prev => ({
      ...prev,
      vehiculo: vehiculo.nroPlacaId,
      placaVehiculo: vehiculo.nroPlacaId,
      nroPlaca: vehiculo.nroPlacaId,
      marca: vehiculo.marcaVehiculo || '',
      modelo: vehiculo.modeloVehiculo || ''
    }));
    setMostrarModalVehiculoPrivado(false);
  };

  const handleVehiculoPublicoCreado = (vehiculo) => {
    setVehiculos(prev => [...prev, vehiculo]);
    setVehiculoSeleccionado(vehiculo);
    setFormData(prev => ({
      ...prev,
      vehiculo: vehiculo.nroPlacaId,
      placaVehiculo: vehiculo.nroPlacaId,
      nroPlaca: vehiculo.nroPlacaId,
      marca: vehiculo.marcaVehiculo || '',
      modelo: vehiculo.modeloVehiculo || ''
    }));
    setMostrarModalVehiculoPublico(false);
  };
  
  const handleSeleccionarVehiculo = (e) => {
    const vehiculoId = e.target.value;
    const vehiculo = vehiculos.find(v => v.id.toString() === vehiculoId);
    if (vehiculo) {
      setVehiculoSeleccionado(vehiculo);
      setFormData(prev => ({
        ...prev,
        vehiculo: vehiculo.nroPlacaId,
        placaVehiculo: vehiculo.nroPlacaId,
        nroPlaca: vehiculo.nroPlacaId,
        marca: vehiculo.marcaVehiculo || '',
        modelo: vehiculo.modeloVehiculo || ''
      }));
    } else {
      setVehiculoSeleccionado(null);
      setFormData(prev => ({
        ...prev,
        vehiculo: '',
        placaVehiculo: '',
        nroPlaca: '',
        marca: '',
        modelo: ''
      }));
    }
  };
  
  // Funciones para manejar el modal de transportista
  const handleNuevoTransportista = () => {
    setMostrarModalTransportista(true);
  };

  const handleNuevoTransportistaPublico = () => {
    setMostrarModalTransportistaPublico(true);
  };
  
  const handleTransportistaCreado = (transportista) => {
    setTransportistas(prev => [...prev, transportista]);
    setTransportistaSeleccionado(transportista);
    setFormData(prev => ({
      ...prev,
      transportista: transportista.nombre,
      rucTransportista: transportista.numeroDocumento
    }));
    setMostrarModalTransportista(false);
  };

  const handleTransportistaPublicoCreado = (transportista) => {
    setTransportistas(prev => [...prev, transportista]);
    setTransportistaSeleccionado(transportista);
    setFormData(prev => ({
      ...prev,
      transportista: transportista.nombre,
      rucTransportista: transportista.numeroDocumento
    }));
    setMostrarModalTransportistaPublico(false);
  };
  
  const handleSeleccionarTransportista = (e) => {
    const transportistaId = e.target.value;
    const transportista = transportistas.find(t => t.id.toString() === transportistaId);
    if (transportista) {
      setTransportistaSeleccionado(transportista);
      setFormData(prev => ({
        ...prev,
        transportista: transportista.nombre,
        rucTransportista: transportista.numeroDocumento
      }));
    } else {
      setTransportistaSeleccionado(null);
      setFormData(prev => ({
        ...prev,
        transportista: '',
        rucTransportista: ''
      }));
    }
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
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    // Datos del cliente
    clienteId: '',
    nombreCliente: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    direccion: '',
    telefono: '',
    email: '',
    
    // Datos de la guía
    establecimiento: '',
    serie: 'T001',
    numero: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaSalida: new Date().toISOString().split('T')[0],
    puntoPartida: 'Almacén Principal - Ferretería',
    puntoLlegada: '',
    codigoUbigeoPartida: '',
    codigoUbigeoLlegada: '',
    modoTraslado: 'Transporte privado',
    motivoTraslado: 'Venta',
    unidadMedida: 'KGM',
    pesoTotal: 1,
    numeroPaquetes: 0,
    descripcionMotivo: '',
    observacion: '',
    ordenPedido: '',
    ordenCompra: '',
    referencia: '',
    documentoRelacionado: '',
    
    // Datos de transporte
    tipoTransporte: 'privado', // 'privado' o 'publico'
    vehiculoM1L: false, // Checkbox para vehículos M1 o L
    nroPlaca: '',
    marca: '',
    modelo: '',
    conductor: '',
    dniConductor: '',
    rutaVehiculo: '',
    direccionFiscal: '',
    codigoMTC: '',
    rucTransportista: '' // Campo para RUC en transporte público
  });

  // Efecto para prellenar datos cuando viene de una venta
  useEffect(() => {
    if (ventaData && fromVenta) {
      console.log('🔄 Datos de venta recibidos:', ventaData);
      console.log('🔍 Estructura completa de ventaData:', JSON.stringify(ventaData, null, 2));
      
      // Prellenar datos del cliente
      const cliente = ventaData.Cliente;
      const sucursal = ventaData.Sucursal || ventaData.sucursal;
      if (cliente) {
        console.log('👤 Datos del cliente:', cliente);
        setClienteSeleccionado(cliente);
        setFormData(prev => ({
          ...prev,
          clienteId: cliente.id,
          nombreCliente: cliente.nombre,
          tipoDocumento: cliente.tipoDocumento || 'DNI',
          numeroDocumento: cliente.numeroDocumento || '',
          direccion: cliente.direccion || '',
          telefono: cliente.telefono || '',
          email: cliente.email || '',
          puntoLlegada: cliente.direccion || '',
          documentoRelacionado: `${ventaData.serieComprobante}-${ventaData.numeroComprobante}`,
          ordenPedido: ventaData.numeroComprobante?.toString() || '',
          establecimiento: sucursal?.nombre || 'Oficina Principal',
          observacion: `Guía generada desde venta ${ventaData.serieComprobante}-${ventaData.numeroComprobante}`
        }));
      }
      
      // Prellenar productos de la venta
      console.log('📦 Verificando DetalleVenta:', ventaData.DetalleVenta);
      console.log('📦 Tipo de DetalleVenta:', typeof ventaData.DetalleVenta);
      console.log('📦 Es array:', Array.isArray(ventaData.DetalleVenta));
      
      if (ventaData.DetalleVenta && ventaData.DetalleVenta.length > 0) {
        console.log('✅ Cargando productos desde venta:', ventaData.DetalleVenta);
        const productosVenta = ventaData.DetalleVenta.map((detalle, index) => {
          console.log(`📋 Procesando detalle ${index}:`, detalle);
          return {
            id: `venta-${index}`,
            productoId: detalle.productoId,
            presentacionId: detalle.presentacionId,
            nombre: detalle.Producto?.nombre || `Producto ${detalle.productoId}`,
            codigo: detalle.Producto?.codigo || '',
            presentacion: detalle.Presentacion?.descripcion || detalle.Presentacion?.unidad || 'Unidad',
            descripcion: detalle.Producto?.nombre || `Producto ${detalle.productoId}`,
            cantidad: detalle.cantidad,
            peso: detalle.cantidad * (detalle.Producto?.peso || 1), // Peso basado en producto
            unidadMedida: detalle.Producto?.unidadMedida || 'NIU'
          };
        });
        console.log('✅ Productos procesados para guía:', productosVenta);
        setProductosSeleccionados(productosVenta);
      } else {
        console.log('❌ No se encontraron detalles de venta o está vacío');
        console.log('❌ ventaData.DetalleVenta:', ventaData.DetalleVenta);
      }
    }
  }, [ventaData, fromVenta]);

  // Cargar clientes disponibles
  const cargarClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await clienteService.obtenerClientes();
      setClientes(response.clientes || response.data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoadingClientes(false);
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

  // Cargar vehículos disponibles
  const cargarVehiculos = async () => {
    try {
      const response = await obtenerVehiculos();
      setVehiculos(response.vehiculos || response.data || []);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    }
  };

  // Cargar transportistas disponibles
  const cargarTransportistas = async () => {
    try {
      const response = await obtenerTransportistas();
      setTransportistas(response.transportistas || response.data || []);
    } catch (error) {
      console.error('Error al cargar transportistas:', error);
    }
  };

  // Cargar guía existente para edición
  const cargarGuiaExistente = async (guiaId) => {
    try {
      setLoading(true);
      const response = await guiaRemisionService.obtenerGuiaRemisionPorId(guiaId);
      const guia = response.guiaRemision || response;
      
      if (guia) {
        setIsEditing(true);
        
        // Cargar datos del formulario
        setFormData({
          clienteId: guia.clienteId || '',
          nombreCliente: guia.Cliente?.nombre || '',
          tipoDocumento: guia.Cliente?.tipoDocumento || 'DNI',
          numeroDocumento: guia.Cliente?.numeroDocumento || '',
          direccion: guia.Cliente?.direccion || '',
          telefono: guia.Cliente?.telefono || '',
          email: guia.Cliente?.email || '',
          establecimiento: guia.establecimiento || '',
          serie: guia.serie || 'T001',
          numero: guia.numero || '',
          fechaEmision: guia.fechaEmision ? guia.fechaEmision.split('T')[0] : new Date().toISOString().split('T')[0],
          fechaSalida: guia.fechaSalida ? guia.fechaSalida.split('T')[0] : new Date().toISOString().split('T')[0],
          puntoPartida: guia.puntoPartida || 'Almacén Principal - Ferretería',
          codigoUbigeoPartida: guia.codigoUbigeoPartida || '',
          puntoLlegada: guia.puntoLlegada || '',
          codigoUbigeoLlegada: guia.codigoUbigeoLlegada || '',
          modoTraslado: guia.modoTraslado || 'Transporte privado',
          motivoTraslado: guia.motivoTraslado || 'Venta',
          unidadMedida: guia.unidadMedida || 'KGM',
          pesoTotal: guia.pesoTotal || 1,
          numeroPaquetes: guia.numeroPaquetes || 0,
          descripcionMotivo: guia.descripcionMotivo || '',
          observacion: guia.observacion || '',
          ordenPedido: guia.ordenPedido || '',
          ordenCompra: guia.ordenCompra || '',
          referencia: guia.referencia || '',
          documentoRelacionado: guia.documentoRelacionado || '',
          tipoTransporte: guia.tipoTransporte || 'privado',
          vehiculoM1L: guia.vehiculoM1L || false,
          nroPlaca: guia.nroPlaca || '',
          marca: guia.marca || '',
          modelo: guia.modelo || '',
          conductor: guia.conductor || '',
          dniConductor: guia.dniConductor || '',
          rutaVehiculo: guia.rutaVehiculo || '',
          direccionFiscal: guia.direccionFiscal || '',
          codigoMTC: guia.codigoMTC || '',
          rucTransportista: guia.rucTransportista || ''
        });
        
        // Cargar cliente seleccionado
        if (guia.Cliente) {
          setClienteSeleccionado(guia.Cliente);
        }
        
        // Cargar productos
        if (guia.DetalleGuiaRemisions && guia.DetalleGuiaRemisions.length > 0) {
          const productosGuia = guia.DetalleGuiaRemisions.map((detalle, index) => ({
            id: `guia-${index}`,
            productoId: detalle.productoId,
            presentacionId: detalle.presentacionId,
            nombre: detalle.Producto?.nombre || `Producto ${detalle.productoId}`,
            codigo: detalle.Producto?.codigo || '',
            presentacion: detalle.Presentacion?.descripcion || detalle.Presentacion?.unidad || 'Unidad',
            descripcion: detalle.Producto?.nombre || `Producto ${detalle.productoId}`,
            cantidad: detalle.cantidad,
            peso: detalle.peso || (detalle.cantidad * (detalle.Producto?.peso || 1)),
            unidadMedida: detalle.unidadMedida || detalle.Producto?.unidadMedida || 'NIU'
          }));
          setProductosSeleccionados(productosGuia);
        }
      }
    } catch (error) {
      console.error('Error al cargar guía:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar guía',
        text: 'No se pudo cargar la información de la guía'
      });
      navigate('/guia-remision/lista');
    } finally {
      setLoading(false);
    }
  };

  // Cargar clientes al inicializar
  useEffect(() => {
    cargarClientes();
    cargarConductores();
    cargarVehiculos();
    cargarTransportistas();
  }, []);

  // Cargar guía si estamos en modo edición
  useEffect(() => {
    if (id && !fromVenta) {
      cargarGuiaExistente(id);
    }
  }, [id, fromVenta]);

  // Calcular totales
  const calcularTotales = () => {
    const totalBultos = productosSeleccionados.length;
    const pesoTotal = productosSeleccionados.reduce((sum, producto) => sum + (producto.peso || 0), 0);
    return { totalBultos, pesoTotal };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleClienteCreado = async (nuevoCliente) => {
    console.log('Cliente creado:', nuevoCliente);
    setClienteSeleccionado(nuevoCliente);
    setFormData(prev => ({
      ...prev,
      clienteId: nuevoCliente.id,
      nombreCliente: nuevoCliente.nombre,
      tipoDocumento: nuevoCliente.tipoDocumento || 'DNI',
      numeroDocumento: nuevoCliente.numeroDocumento || '',
      direccion: nuevoCliente.direccion || '',
      telefono: nuevoCliente.telefono || '',
      email: nuevoCliente.email || ''
    }));
    setMostrarModalCliente(false);
  };

  const handleNuevoCliente = () => {
    setMostrarModalCliente(true);
  };

  const handleSeleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData(prev => ({
      ...prev,
      clienteId: cliente.id,
      nombreCliente: cliente.nombre,
      tipoDocumento: cliente.tipoDocumento || 'DNI',
      numeroDocumento: cliente.numeroDocumento || '',
      direccion: cliente.direccion || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      puntoLlegada: cliente.direccion || prev.puntoLlegada
    }));
  };

  const handleProductoSeleccionado = (producto) => {
    setProductosSeleccionados(prev => [...prev, producto]);
  };

  const eliminarProducto = (index) => {
    setProductosSeleccionados(prev => prev.filter((_, i) => i !== index));
  };

  const editarProducto = (index) => {
    setProductoEditando(index);
  };

  const actualizarProducto = (index, productoActualizado) => {
    setProductosSeleccionados(prev => 
      prev.map((producto, i) => i === index ? productoActualizado : producto)
    );
    setProductoEditando(null);
  };

  const cancelarEdicion = () => {
    setProductoEditando(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (productosSeleccionados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Productos requeridos',
        text: 'Debe agregar al menos un producto a la guía de remisión'
      });
      return;
    }

    if (!formData.puntoPartida || !formData.puntoLlegada) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Debe completar el punto de partida y llegada'
      });
      return;
    }

    // Validaciones para transporte privado
    if (formData.tipoTransporte === 'privado') {
      // Si NO es vehículo M1 o L, entonces conductor y placa son obligatorios
      if (!formData.vehiculoM1L) {
        if (!formData.conductor || !formData.dniConductor) {
          Swal.fire({
            icon: 'warning',
            title: 'Datos del conductor requeridos',
            text: 'Para transporte privado debe ingresar los datos del conductor'
          });
          return;
        }
        if (!formData.nroPlaca) {
          Swal.fire({
            icon: 'warning',
            title: 'Placa del vehículo requerida',
            text: 'Para transporte privado debe ingresar la placa del vehículo'
          });
          return;
        }
      }
      // Si ES vehículo M1 o L, conductor y placa son opcionales (no se validan)
    }

    // Validaciones para transporte público
    if (formData.tipoTransporte === 'publico') {
      // RUC del transportista es obligatorio
      if (!formData.rucTransportista) {
        Swal.fire({
          icon: 'warning',
          title: 'RUC del transportista requerido',
          text: 'Para transporte público debe ingresar el RUC del transportista'
        });
        return;
      }
      // Conductor y placa son opcionales para transporte público
    }

    try {
      setLoading(true);
      
      const detalles = productosSeleccionados.map(producto => ({
        productoId: producto.productoId,
        presentacionId: producto.presentacionId === 'default' ? null : producto.presentacionId,
        cantidad: producto.cantidad,
        descripcion: producto.descripcion
      }));

      const guiaData = {
        establecimiento: formData.establecimiento,
        serie: formData.serie,
        fechaEmision: formData.fechaEmision,
        clienteId: formData.clienteId || null,
        fechaSalida: formData.fechaSalida,
        puntoPartida: formData.puntoPartida,
        codigoUbigeoPartida: formData.codigoUbigeoPartida,
        puntoLlegada: formData.puntoLlegada,
        codigoUbigeoLlegada: formData.codigoUbigeoLlegada,
        motivoTraslado: formData.motivoTraslado,
        tipoTransporte: formData.tipoTransporte,
        vehiculoM1L: formData.vehiculoM1L,
        // Para transporte privado con M1/L activo, enviar null para campos de vehículo
        // Para transporte público, enviar null si no se han llenado los campos opcionales
        nroPlaca: (formData.tipoTransporte === 'privado' && formData.vehiculoM1L) || 
                  (formData.tipoTransporte === 'publico' && !formData.nroPlaca) ? null : formData.nroPlaca,
        conductor: (formData.tipoTransporte === 'privado' && formData.vehiculoM1L) || 
                   (formData.tipoTransporte === 'publico' && !formData.conductor) ? null : formData.conductor,
        dniConductor: (formData.tipoTransporte === 'privado' && formData.vehiculoM1L) || 
                      (formData.tipoTransporte === 'publico' && !formData.dniConductor) ? null : formData.dniConductor,
        marca: (formData.tipoTransporte === 'privado' && formData.vehiculoM1L) || 
               (formData.tipoTransporte === 'publico' && !formData.marca) ? null : formData.marca,
        modelo: (formData.tipoTransporte === 'privado' && formData.vehiculoM1L) || 
                (formData.tipoTransporte === 'publico' && !formData.modelo) ? null : formData.modelo,
        rutaVehiculo: formData.rutaVehiculo,
        direccionFiscal: formData.direccionFiscal,
        codigoMTC: formData.codigoMTC,
        rucTransportista: formData.rucTransportista,
        observacion: formData.observacion,
        ordenPedido: formData.ordenPedido,
        ordenCompra: formData.ordenCompra,
        referencia: formData.referencia,
        documentoRelacionado: formData.documentoRelacionado,
        detalles
      };

      console.log('Datos a enviar:', guiaData);
      
      let response;
      if (isEditing && id) {
        // Si estamos editando, usar el endpoint de actualización
        response = await guiaRemisionService.actualizarGuiaRemision(id, guiaData);
        
        const info = response?.guiaRemision || response?.data?.guiaRemision || response;
        try {
          const blob = await guiaRemisionService.generarPdfGuia(info.id);
          const url = window.URL.createObjectURL(blob);
          setPreviewGuiaPdfUrl(url);
          setGuiaGuardadaInfo({
            id: info.id,
            serieComprobante: info.serieComprobante,
            numeroComprobante: info.numeroComprobante
          });
          setShowPreviewGuia(true);
        } catch (pdfErr) {
          console.error('No se pudo generar el PDF de la guía:', pdfErr);
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Guía de remisión actualizada',
          text: `Guía ${info.serieComprobante}-${info.numeroComprobante} actualizada exitosamente`,
          confirmButtonText: 'Aceptar'
        });
      } else if (fromVenta && ventaData?.id) {
        // Si viene de una venta, usar el endpoint específico
        response = await guiaRemisionService.generarDesdeVenta(ventaData.id, guiaData);
        
        const info = response?.guiaRemision || response?.data?.guiaRemision || response;
        try {
          const blob = await guiaRemisionService.generarPdfGuia(info.id);
          const url = window.URL.createObjectURL(blob);
          setPreviewGuiaPdfUrl(url);
          setGuiaGuardadaInfo({
            id: info.id,
            serieComprobante: info.serieComprobante,
            numeroComprobante: info.numeroComprobante
          });
          setShowPreviewGuia(true);
        } catch (pdfErr) {
          console.error('No se pudo generar el PDF de la guía:', pdfErr);
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Guía de remisión creada',
          text: `Guía ${info.serieComprobante}-${info.numeroComprobante} creada exitosamente`,
          confirmButtonText: 'Aceptar'
        });
      } else {
        // Si es una guía nueva, usar el endpoint general
        response = await guiaRemisionService.crearGuiaRemision(guiaData);
        
        const info = response?.guiaRemision || response?.data?.guiaRemision || response;
        try {
          const blob = await guiaRemisionService.generarPdfGuia(info.id);
          const url = window.URL.createObjectURL(blob);
          setPreviewGuiaPdfUrl(url);
          setGuiaGuardadaInfo({
            id: info.id,
            serieComprobante: info.serieComprobante,
            numeroComprobante: info.numeroComprobante
          });
          setShowPreviewGuia(true);
        } catch (pdfErr) {
          console.error('No se pudo generar el PDF de la guía:', pdfErr);
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Guía de remisión creada',
          text: `Guía ${info.serieComprobante}-${info.numeroComprobante} creada exitosamente`,
          confirmButtonText: 'Aceptar'
        });
      }
      
    } catch (error) {
      console.error('Error al procesar guía:', error);
      Swal.fire({
        icon: 'error',
        title: isEditing ? 'Error al actualizar guía' : 'Error al crear guía',
        text: error.response?.data?.mensaje || 'Ocurrió un error inesperado'
      });
    } finally {
      setLoading(false);
    }
  };

  const { totalBultos, pesoTotal } = calcularTotales();

  // Validar si el formulario está completo
  const formularioCompleto = () => {
    const tieneProductos = productosSeleccionados.length > 0;
    const tienePuntos = formData.puntoPartida && formData.puntoLlegada;
    
    let tieneTransporte = true;
    
    if (formData.tipoTransporte === 'privado') {
      // Si NO es vehículo M1 o L, entonces conductor y placa son obligatorios
      if (!formData.vehiculoM1L) {
        tieneTransporte = formData.conductor && formData.dniConductor && formData.nroPlaca;
      }
      // Si ES vehículo M1 o L, no se requiere validación adicional
    } else if (formData.tipoTransporte === 'publico') {
      // Para transporte público, solo RUC es obligatorio
      tieneTransporte = formData.rucTransportista;
    }
    
    console.log('Validación formulario:', {
      tieneProductos,
      tienePuntos,
      tieneTransporte,
      tipoTransporte: formData.tipoTransporte,
      vehiculoM1L: formData.vehiculoM1L,
      productosCount: productosSeleccionados.length
    });
    
    return tieneProductos && tienePuntos && tieneTransporte;
  };

  return (
    <div className="formulario-guia-container">
      <div className="formulario-guia-header">
        <button 
          onClick={() => navigate('/guia-remision/gestion')}
          className="btn-volver"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <h1>🚚 {isEditing ? 'Editar Guía de Remisión' : 'Nueva Guía de Remisión'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="formulario-guia">
        {/* Sección Datos del Comprobante */}
        <div className="seccion-formulario">
          <div className="seccion-header">
            <FileText size={20} />
            <h2>Datos del Comprobante</h2>
          </div>
          
          <div className="grid-campos">
            <div className="campo-grupo">
              <label>Establecimiento *</label>
              <select 
                name="establecimiento"
                value={formData.establecimiento}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <option value="">Seleccionar establecimiento</option>
                <option value="Oficina Principal">Oficina Principal</option>
              </select>
            </div>
            
            <div className="campo-grupo">
              <label>Serie *</label>
              <input 
                type="text" 
                name="serie"
                value={formData.serie}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div className="campo-grupo">
              <label>Fecha de emisión ⓘ *</label>
              <input 
                type="date" 
                name="fechaEmision"
                value={formData.fechaEmision}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Sección Cliente */}
        <div className="seccion-formulario">
          <div className="seccion-header">
            <User size={20} />
            <h2>Datos del Cliente</h2>
          </div>
          
          <div className="grid-campos">
            <div className="campo-grupo">
              <label>
                Cliente
                {!clienteSeleccionado && (
                  <button
                    type="button"
                    onClick={handleNuevoCliente}
                    style={{
                      marginLeft: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                  >
                    [+ Nuevo]
                  </button>
                )}
              </label>
              {!clienteSeleccionado ? (
                <select
                  value={formData.clienteId}
                  onChange={(e) => {
                    const cliente = clientes.find(c => c.id.toString() === e.target.value);
                    if (cliente) {
                      handleSeleccionarCliente(cliente);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Seleccionar cliente existente...</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} - {cliente.numeroDocumento}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <input
                    type="text"
                    value={formData.nombreCliente}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setClienteSeleccionado(null);
                      setFormData(prev => ({
                        ...prev,
                        clienteId: '',
                        nombreCliente: '',
                        tipoDocumento: 'DNI',
                        numeroDocumento: '',
                        direccion: '',
                        telefono: '',
                        email: ''
                      }));
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Cambiar
                  </button>
                </div>
              )}
            </div>
            
            <div className="campo-grupo">
              <label>Tipo de Documento</label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                disabled={!!clienteSeleccionado}
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">Carnet de Extranjería</option>
              </select>
            </div>
            
            <div className="campo-grupo">
              <label>Número de Documento</label>
              <input
                type="text"
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleInputChange}
                readOnly={!!clienteSeleccionado}
                style={{
                  backgroundColor: clienteSeleccionado ? '#f8f9fa' : 'white'
                }}
              />
            </div>
            
            <div className="campo-grupo campo-completo">
              <label>Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                readOnly={!!clienteSeleccionado}
                style={{
                  backgroundColor: clienteSeleccionado ? '#f8f9fa' : 'white'
                }}
              />
            </div>
            
            <div className="campo-grupo">
              <label>Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                readOnly={!!clienteSeleccionado}
                style={{
                  backgroundColor: clienteSeleccionado ? '#f8f9fa' : 'white'
                }}
              />
            </div>
            
            <div className="campo-grupo">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                readOnly={!!clienteSeleccionado}
                style={{
                  backgroundColor: clienteSeleccionado ? '#f8f9fa' : 'white'
                }}
              />
            </div>
          </div>
        </div>

        {/* Sección Productos */}
        <div className="seccion-formulario">
          <div className="seccion-header">
            <Package size={20} />
            <h2>Productos Disponibles</h2>
          </div>
          
          <ProductoGuiaRemision 
            onProductoSeleccionado={handleProductoSeleccionado}
            productosSeleccionados={productosSeleccionados}
          />
          
          {/* Lista de productos seleccionados */}
          {productosSeleccionados.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>📋 Productos Seleccionados ({productosSeleccionados.length})</h3>
              <div className="tabla-productos">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Presentación</th>
                      <th>Cantidad</th>
                      <th>Peso (kg)</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosSeleccionados.map((producto, index) => (
                      <tr key={index}>
                        {productoEditando === index ? (
                          // Modo edición
                          <>
                            <td>
                              <div>
                                <strong>{producto.nombre}</strong>
                                <br />
                                <small>Código: {producto.codigo}</small>
                              </div>
                            </td>
                            <td>{producto.presentacion}</td>
                            <td>
                              <input
                                type="number"
                                value={producto.cantidad}
                                onChange={(e) => {
                                  const nuevaCantidad = parseFloat(e.target.value) || 0;
                                  const productoActualizado = { ...producto, cantidad: nuevaCantidad };
                                  setProductosSeleccionados(prev => 
                                    prev.map((p, i) => i === index ? productoActualizado : p)
                                  );
                                }}
                                style={{ width: '60px', padding: '2px' }}
                                min="0"
                                step="0.01"
                              />
                              {' '}{producto.unidadMedida}
                            </td>
                            <td>
                              <input
                                type="number"
                                value={producto.peso}
                                onChange={(e) => {
                                  const nuevoPeso = parseFloat(e.target.value) || 0;
                                  const productoActualizado = { ...producto, peso: nuevoPeso };
                                  setProductosSeleccionados(prev => 
                                    prev.map((p, i) => i === index ? productoActualizado : p)
                                  );
                                }}
                                style={{ width: '60px', padding: '2px' }}
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={producto.descripcion}
                                onChange={(e) => {
                                  const nuevaDescripcion = e.target.value;
                                  const productoActualizado = { ...producto, descripcion: nuevaDescripcion };
                                  setProductosSeleccionados(prev => 
                                    prev.map((p, i) => i === index ? productoActualizado : p)
                                  );
                                }}
                                style={{ width: '100%', padding: '2px' }}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => cancelarEdicion()}
                                className="btn-cancelar"
                                style={{ marginRight: '5px' }}
                              >
                                ✅
                              </button>
                              <button
                                type="button"
                                onClick={() => cancelarEdicion()}
                                className="btn-cancelar"
                              >
                                ❌
                              </button>
                            </td>
                          </>
                        ) : (
                          // Modo visualización
                          <>
                            <td>
                              <div>
                                <strong>{producto.nombre}</strong>
                                <br />
                                <small>Código: {producto.codigo}</small>
                              </div>
                            </td>
                            <td>{producto.presentacion}</td>
                            <td>{producto.cantidad} {producto.unidadMedida}</td>
                            <td>{producto.peso.toFixed(2)}</td>
                            <td>{producto.descripcion}</td>
                            <td>
                              <button
                                type="button"
                                onClick={() => editarProducto(index)}
                                className="btn-editar"
                               
                              >
                                ✏️
                              </button>
                              <br />
                              <button
                                type="button"
                                onClick={() => eliminarProducto(index)}
                                className="btn-editar"
                              >
                                ❌
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Resumen */}
                <div className="resumen-productos">
                  <div className="resumen-item">
                    <strong>Total de bultos: {totalBultos}</strong>
                  </div>
                  <div className="resumen-item">
                    <strong>Peso total: {pesoTotal.toFixed(2)} kg</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección Traslado */}
        <div className="seccion-formulario">
          <div className="seccion-header">
            <MapPin size={20} />
            <h2>Datos del Traslado</h2>
          </div>
          
          <div className="grid-campos">
            <div className="campo-grupo">
              <label>Fecha de Salida</label>
              <input
                type="date"
                name="fechaSalida"
                value={formData.fechaSalida}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="campo-grupo">
              <label>Motivo de Traslado</label>
              <select
                name="motivoTraslado"
                value={formData.motivoTraslado}
                onChange={handleInputChange}
                required
              >
                <option value="Venta">Venta</option>
                <option value="Compra">Compra</option>
                <option value="Trasladoentreestablecimientos">Traslado entre establecimientos de la misma empresa</option>
                <option value="Importación">Importación</option> 
                 <option value="Exportación">Exportación</option> 
                 <option value="Otros"> Otros no comprendido en ningún código del presente catálogo</option>
                  <option value="VentaSujetaConfirmacionComprador"> Venta sujeta a confirmación del comprador</option>

                   <option value="TrasladoEmisor"> Traslado emisor itinerante de comprobantes de pago Aquí no se está considerando el traslado a zona primaria</option>
                  <option value="Recojobienestransformados">Recojo de bienes transformados</option>
                  <option value="Trasladodebienes">Traslado de bienes para transformación</option>
                 
                <option value="Consignación">Consignación</option>
                <option value="Devolución">Devolución</option>
                <option value="Ventaentregaterceros">Venta con entrega a terceros</option>
              </select>
            </div>
            
            <div className="campo-grupo campo-completo"> 
                <label>
                  Punto de Partida * 
                  <span 
                    onClick={() => setModalPartidaOpen(true)}
                    style={{
                      color: '#007bff',
                      cursor: 'pointer',
                      marginLeft: '5px',
                      textDecoration: 'underline'
                    }}
                  >
                    [+ Nuevo]
                  </span>
                </label> 
                <input 
                  type="text" 
                  name="puntoPartida" 
                  value={formData.puntoPartida} 
                  onChange={handleInputChange} 
                  placeholder="Dirección de origen" 
                  required 
                /> 
                {formData.codigoUbigeoPartida && (
                  <small style={{ color: '#666', fontSize: '11px', marginTop: '2px', display: 'block' }}>
                    Código Ubigeo: {formData.codigoUbigeoPartida}
                  </small>
                )}
              </div>
            
            <div className="campo-grupo campo-completo"> 
               <label>
                 Punto de Llegada * 
                 <span 
                   onClick={() => setModalLlegadaOpen(true)}
                   style={{
                     color: '#007bff',
                     cursor: 'pointer',
                     marginLeft: '5px',
                     textDecoration: 'underline'
                   }}
                 >
                   [+ Nuevo]
                 </span>
               </label> 
               <input 
                 type="text" 
                 name="puntoLlegada" 
                 value={formData.puntoLlegada} 
                 onChange={handleInputChange} 
                 placeholder="Dirección de destino" 
                 required 
               /> 
               {formData.codigoUbigeoLlegada && (
                 <small style={{ color: '#666', fontSize: '11px', marginTop: '2px', display: 'block' }}>
                   Código Ubigeo: {formData.codigoUbigeoLlegada}
                 </small>
               )}
             </div>
          </div>
        </div>

        {/* Sección Información Adicional */}
        <div className="seccion-formulario">
          <div className="seccion-header">
            <FileText size={20} />
            <h2>Información Adicional</h2>
          </div>
          
          <div className="grid-campos">
            <div className="campo-grupo">
              <label>Orden de pedido ⓘ</label>
              <input
                type="text"
                name="ordenPedido"
                value={formData.ordenPedido}
                onChange={handleInputChange}
                placeholder="Número de orden de pedido"
              />
            </div>
            
            <div className="campo-grupo">
              <label>Orden de compra</label>
              <input
                type="text"
                name="ordenCompra"
                value={formData.ordenCompra}
                onChange={handleInputChange}
                placeholder="Número de orden de compra"
              />
            </div>
            
            <div className="campo-grupo">
              <label>Referencia</label>
              <select
                name="referencia"
                value={formData.referencia || ''}
                onChange={handleInputChange}
              >
                <option value="">Seleccionar</option>
                <option value="FACTURA">Factura</option>
                <option value="BOLETA">Boleta</option>
                <option value="NOTA_CREDITO">Nota de Crédito</option>
                <option value="NOTA_DEBITO">Nota de Débito</option>
                <option value="GUIA_REMISION">Guía de Remisión</option>
                <option value="ORDEN_COMPRA">Orden de Compra</option>
                <option value="ORDEN_PEDIDO">Orden de Pedido</option>
              </select>
            </div>
            
            <div className="campo-grupo">
              <label>Documento relacionado</label>
              <input
                type="text"
                name="documentoRelacionado"
                value={formData.documentoRelacionado}
                onChange={handleInputChange}
                placeholder="Número de documento relacionado"
              />
            </div>
          </div>
        </div>

        {/* Checkbox para vehículos M1 o L - Siempre visible */}
        <div className="seccion-formulario">
          <div className="checkbox-m1l-container">
            <span 
              className="icono-alerta"
              title="Al activar esta opción, se permite emitir guías de remisión sin necesidad de identificar al chofer o la placa del vehículo.&#10;&#10;M1: Vehículos con 8 asientos o menos (automóviles, SUVs, camionetas pequeñas).&#10;&#10;L: Vehículos de 2 a 3 ruedas (motocicletas, mototaxis)."
            >ⓘ</span>
            <input
              type="checkbox"
              name="vehiculoM1L"
              checked={formData.vehiculoM1L || false}
              onChange={handleInputChange}
              className="checkbox-m1l"
            />
            <span className="texto-m1l">Traslado en vehículos de categoría M1 o L</span>
          </div>
        </div>

        {/* Sección Transporte */}
        <div className="seccion-formulario">
          <div className="seccion-header">
            <Truck size={20} />
            <h2>Datos del Transporte</h2>
          </div>
          
          {/* Tipo de transporte */}
          <div className="tipo-transporte">
            <label>
              <input
                type="radio"
                name="tipoTransporte"
                value="privado"
                checked={formData.tipoTransporte === 'privado'}
                onChange={handleInputChange}
              />
              🚗 Transporte Privado
            </label>
            <label>
              <input
                type="radio"
                name="tipoTransporte"
                value="publico"
                checked={formData.tipoTransporte === 'publico'}
                onChange={handleInputChange}
              />
              🚌 Transporte Público
            </label>
          </div>
          

        </div>
        
        {/* Sección: Datos modo de traslado */}
        <div className="seccion-formulario">
          <div className="seccion-header">
            <Truck className="icono-seccion" />
            <h2>Datos modo de traslado</h2>
          </div>



          {/* Campos para transporte privado */}
          {formData.tipoTransporte === 'privado' && (
            <div className="grid-campos">
              {formData.vehiculoM1L ? (
                // Cuando M1/L está activo - Mostrar los 3 campos completos
                <>
                  <div className="campo-grupo">
                    <label>Número de placa</label>
                    <input
                      type="text"
                      name="nroPlaca"
                      value={formData.nroPlaca || ''}
                      onChange={handleInputChange}
                      placeholder="Número de placa"
                    />
                  </div>
                  
                  <div className="campo-grupo">
                    <label>Datos del conductor <button type="button" className="btn-nuevo" onClick={handleNuevoConductor}>[+ Nuevo]</button></label>
                    <select
                      name="conductor"
                      value={conductorSeleccionado?.id || ''}
                      onChange={handleSeleccionarConductor}
                    >
                      <option value="">Seleccionar conductor</option>
                      {conductores.map(conductor => (
                        <option key={conductor.id} value={conductor.id}>
                          {conductor.nombre} - {conductor.numeroDocumento}{conductor.licencia ? ` - Lic: ${conductor.licencia}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="campo-grupo">
                    <label>Datos del vehículo <button type="button" className="btn-nuevo" onClick={handleNuevoVehiculo}>[+ Nuevo]</button></label>
                    <select
                      name="vehiculo"
                      value={vehiculoSeleccionado?.id || ''}
                      onChange={handleSeleccionarVehiculo}
                    >
                      <option value="">Seleccionar vehículo</option>
                      {vehiculos.map(vehiculo => (
                        <option key={vehiculo.id} value={vehiculo.id}>
                          {vehiculo.nroPlacaId} - {vehiculo.marcaVehiculo} {vehiculo.modeloVehiculo}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                // Cuando M1/L no está activo - Solo mostrar conductor y vehículo
                <>
                  <div className="campo-grupo">
                    <label>Datos del conductor * <button type="button" className="btn-nuevo" onClick={handleNuevoConductor}>[+ Nuevo]</button></label>
                    <select
                      name="conductor"
                      value={conductorSeleccionado?.id || ''}
                      onChange={handleSeleccionarConductor}
                      required
                    >
                      <option value="">Seleccionar conductor</option>
                      {conductores.map(conductor => (
                        <option key={conductor.id} value={conductor.id}>
                          {conductor.nombre} - {conductor.numeroDocumento}{conductor.licencia ? ` - Lic: ${conductor.licencia}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="campo-grupo">
                    <label>Datos del vehículo * <button type="button" className="btn-nuevo" onClick={handleNuevoVehiculo}>[+ Nuevo]</button></label>
                    <select
                      name="vehiculo"
                      value={vehiculoSeleccionado?.id || ''}
                      onChange={handleSeleccionarVehiculo}
                      required
                    >
                      <option value="">Seleccionar vehículo</option>
                      {vehiculos.map(vehiculo => (
                        <option key={vehiculo.id} value={vehiculo.id}>
                          {vehiculo.nroPlacaId} - {vehiculo.marcaVehiculo} {vehiculo.modeloVehiculo}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Campos para transporte público */}
          {formData.tipoTransporte === 'publico' && (
           <div className="grid-campos">
      {/* Transportista */}
      <div className="campo-grupo">
        <label>
          Datos del transportista *{" "}
          <button
            type="button"
            className="btn-nuevo"
            onClick={handleNuevoTransportistaPublico}
          >
            [+ Nuevo]
          </button>
        </label>
        <select
          name="transportista"
          value={transportistaSeleccionado?.id || ""}
          onChange={handleSeleccionarTransportista}
          required
        >
          <option value="">Seleccionar transportista</option>
          {transportistas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.razonSocial} - {t.numeroDocumento}
            </option>
          ))}
        </select>
      </div>

      {/* Conductor */}
      <div className="campo-grupo">
        <label>
          Datos del conductor{" "}
          <button
            type="button"
            className="btn-nuevo"
            onClick={handleNuevoConductorPublico}
          >
            [+ Nuevo]
          </button>
        </label>
        <select
          name="conductor"
          value={conductorSeleccionado?.id || ""}
          onChange={handleSeleccionarConductor}
        >
          <option value="">Seleccionar conductor</option>
          {conductores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} - {c.numeroDocumento}{c.licencia ? ` - Lic: ${c.licencia}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Vehículo */}
      <div className="campo-grupo">
        <label>
          Datos del vehículo{" "}
          <button
            type="button"
            className="btn-nuevo"
            onClick={handleNuevoVehiculoPublico}
          >
            [+ Nuevo]
          </button>
        </label>
        <select
          name="vehiculo"
          value={vehiculoSeleccionado?.id || ""}
          onChange={handleSeleccionarVehiculo}
        >
          <option value="">Seleccionar vehículo</option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nroPlacaId} - {v.marcaVehiculo} {v.modeloVehiculo}
            </option>
          ))}
        </select>
      </div>

      {/* Ruta del vehículo 
      
       <div className="campo-grupo">
        <label>Ruta del Vehículo</label>
        <input
          type="text"
          name="rutaVehiculo"
          value={formData.rutaVehiculo || ""}
          onChange={handleInputChange}
          placeholder="Ingrese la ruta del vehículo"
        />
      </div>*/}
     

      {/* Dirección Fiscal
      
      
      <div className="campo-grupo">
        <label>Dirección Fiscal</label>
        <input
          type="text"
          name="direccionFiscal"
          value={formData.direccionFiscal || ""}
          onChange={handleInputChange}
          placeholder="Ingrese la dirección fiscal"
        />
      </div>*/}
      

      {/* Código MTC 
      
       <div className="campo-grupo">
        <label>Código MTC</label>
        <input
          type="text"
          name="codigoMTC"
          value={formData.codigoMTC || ""}
          onChange={handleInputChange}
          placeholder="Ingrese el código MTC"
        />
      </div>*/}
     
    </div>
  )
}
        </div>

        {/* Sección Observaciones */}
        <div className="seccion-formulario">
          <div className="seccion-header">
            <FileText size={20} />
            <h2>Observaciones</h2>
          </div>
          
          <div className="campo-grupo">
            <label>Observaciones</label>
            <textarea
              name="observacion"
              value={formData.observacion}
              onChange={handleInputChange}
              placeholder="Observaciones adicionales..."
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '120px',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="botones-accion">
          <button
            type="button"
            onClick={() => navigate('/guia-remision/gestion')}
            className="btn-cancelar"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !formularioCompleto()}
            className="btn-guardar"
          >
            <Save size={20} />
            {loading ? (isEditing ? 'Actualizando...' : 'Guardando...') : (isEditing ? 'Actualizar Guía de Remisión' : 'Crear Guía de Remisión')}
          </button>
        </div>
      </form>

      {/* Modal Cliente */}      {mostrarModalCliente && (
        <ModalCliente
          onClose={() => setMostrarModalCliente(false)}
          onClienteCreado={handleClienteCreado}
        />
      )}

      {/* Modales de Ubigeo */}
      <ModalNuevoUbigeo
        isOpen={modalPartidaOpen}
        onClose={() => setModalPartidaOpen(false)}
        onUbigeoCreado={handleUbigeoPartidaCreado}
        tipo="partida"
      />

      <ModalNuevoUbigeo
        isOpen={modalLlegadaOpen}
        onClose={() => setModalLlegadaOpen(false)}
        onUbigeoCreado={handleUbigeoLlegadaCreado}
        tipo="llegada"
      />
      
      {/* Modal Conductor */}
      {mostrarModalConductor && (
        <ModalConductor
          onClose={() => setMostrarModalConductor(false)}
          onConductorCreado={handleConductorCreado}
        />
      )}

      {/* Modal Conductor Público */}
      {mostrarModalConductorPublico && (
        <ModalConductorPublico
          onClose={() => setMostrarModalConductorPublico(false)}
          onConductorCreado={handleConductorPublicoCreado}
        />
      )}
      
      {/* Modal Vehículo */}
      {mostrarModalVehiculo && (
        <ModalVehiculo
          onClose={() => setMostrarModalVehiculo(false)}
          onVehiculoCreado={handleVehiculoCreado}
        />
      )}

      {/* Modal Vehículo Privado */}
      {mostrarModalVehiculoPrivado && (
        <ModalVehiculoPrivado
          onClose={() => setMostrarModalVehiculoPrivado(false)}
          onVehiculoCreado={handleVehiculoPrivadoCreado}
        />
      )}

      {/* Modal Vehículo Público */}
      {mostrarModalVehiculoPublico && (
        <ModalVehiculoPublico
          isOpen={mostrarModalVehiculoPublico}
          onClose={() => setMostrarModalVehiculoPublico(false)}
          onVehiculoCreado={handleVehiculoPublicoCreado}
        />
      )}
      
      {/* Modal Transportista */}
      {mostrarModalTransportista && (
        <ModalTransportista
          onClose={() => setMostrarModalTransportista(false)}
          onTransportistaCreado={handleTransportistaCreado}
        />
      )}

      {/* Modal Transportista Público */}
      {mostrarModalTransportistaPublico && (
        <ModalTransportistaPublico
          isOpen={mostrarModalTransportistaPublico}
          onClose={() => setMostrarModalTransportistaPublico(false)}
          onSave={handleTransportistaPublicoCreado}
        />
      )}

      {/* Vista previa de Guía de Remisión con opciones de impresión */}
      {showPreviewGuia && (
        <div className="modal-overlay" style={{ zIndex: 1600 }}>
          <div className="modal-content-large" style={{ width: '90%', maxWidth: '1100px' }}>
            <div className="modal-header" style={{ backgroundColor: '#e67e22', color: 'white' }}>
              <h3 style={{ margin: 0 }}>
                {`Guía registrada: ${guiaGuardadaInfo?.serieComprobante || ''}-${guiaGuardadaInfo?.numeroComprobante || ''}`}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowPreviewGuia(false);
                  if (previewGuiaPdfUrl) {
                    window.URL.revokeObjectURL(previewGuiaPdfUrl);
                    setPreviewGuiaPdfUrl('');
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
                  const blob = await guiaRemisionService.generarPdfGuia(guiaGuardadaInfo.id);
                  const url = window.URL.createObjectURL(blob);
                  setPreviewGuiaPdfUrl((old) => { if (old) window.URL.revokeObjectURL(old); return url; });
                }}
                style={{ background: 'transparent', color: '#e67e22', border: 'none', cursor: 'pointer' }}
              >
                Imprimir A4
              </button>
              <button
                onClick={async () => {
                  // Ticket no está soportado explícitamente; usamos A4 como alternativa
                  const blob = await guiaRemisionService.generarPdfGuia(guiaGuardadaInfo.id);
                  const url = window.URL.createObjectURL(blob);
                  setPreviewGuiaPdfUrl((old) => { if (old) window.URL.revokeObjectURL(old); return url; });
                }}
                style={{ background: 'transparent', color: '#e67e22', border: 'none', cursor: 'pointer' }}
              >
                Imprimir Ticket
              </button>
              <button
                onClick={async () => {
                  // A5 no está soportado; usamos A4 como alternativa
                  const blob = await guiaRemisionService.generarPdfGuia(guiaGuardadaInfo.id);
                  const url = window.URL.createObjectURL(blob);
                  setPreviewGuiaPdfUrl((old) => { if (old) window.URL.revokeObjectURL(old); return url; });
                }}
                style={{ background: 'transparent', color: '#e67e22', border: 'none', cursor: 'pointer' }}
              >
                Imprimir A5
              </button>
            </div>

            {/* Visor PDF */}
            <div style={{ height: '70vh', borderTop: '1px solid #eee' }}>
              {previewGuiaPdfUrl ? (
                <iframe
                  src={previewGuiaPdfUrl}
                  title="Vista previa de Guía de Remisión"
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
                  const blob = await guiaRemisionService.generarPdfGuia(guiaGuardadaInfo.id);
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${guiaGuardadaInfo?.serieComprobante || 'GUIA'}-${guiaGuardadaInfo?.numeroComprobante || ''}.pdf`;
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
                  // No hay formato 80mm; se descarga A4 con nombre diferenciado
                  const blob = await guiaRemisionService.generarPdfGuia(guiaGuardadaInfo.id);
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${guiaGuardadaInfo?.serieComprobante || 'GUIA'}-${guiaGuardadaInfo?.numeroComprobante || ''}-80mm.pdf`;
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
    </div>
  );
}

export default FormularioGuiaCompleto;
