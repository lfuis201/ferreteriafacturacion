import React, { useState, useEffect } from 'react';
import '../../styles/FormularioCompras.css';
import { crearCompra, validarCompra, calcularTotales, probarConectividad } from '../../services/compraService';
import { obtenerProveedores, crearProveedor } from '../../services/proveedorService';
import { obtenerSucursales } from '../../services/sucursalService';
import { obtenerProductos } from '../../services/productoService';
import { obtenerClientes } from '../../services/clienteService';
import { consultarReniec, consultarSunat } from '../../services/consultaService';
import * as XLSX from 'xlsx';

const FormularioCompras = () => {
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
  // Importación desde XML
  const [mostrarModalImportar, setMostrarModalImportar] = useState(false);
  const [archivoXml, setArchivoXml] = useState(null);
  const [cargandoImportacion, setCargandoImportacion] = useState(false);
  
  // Estado para el nuevo proveedor
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

  // Estados para consulta automática
  const [consultandoProveedor, setConsultandoProveedor] = useState(false);
  const [errorConsultaProveedor, setErrorConsultaProveedor] = useState('');

  // Estados para clientes
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cerrar lista de clientes al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.fc-clientes-input-container')) {
        setMostrarListaClientes(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // Probar conectividad primero
      console.log('🔍 Probando conectividad con el backend...');
      const conectado = await probarConectividad();
      if (!conectado) {
        console.error('❌ No se puede conectar al backend');
        setErrors({ general: 'No se puede conectar al servidor. Verifique que el backend esté ejecutándose.' });
        return;
      }
      
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
      setErrors({ general: 'Error al cargar los datos iniciales' });
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario principal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOpcionChange = (e) => {
    const { name, checked } = e.target;
    setOpciones(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Manejar cambios en el detalle de producto
  const handleDetalleChange = (e) => {
    const { name, value } = e.target;
    const newDetalle = {
      ...detalleProducto,
      [name]: name === 'productoId' ? value : parseFloat(value) || 0
    };
    
    // Calcular subtotal automáticamente
    newDetalle.subtotal = newDetalle.cantidad * newDetalle.precioUnitario;
    
    setDetalleProducto(newDetalle);
  };

  // Manejar cambios en el proveedor
  const handleProveedorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoProveedor(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Consulta automática cuando se ingresa el número de documento
    if (name === 'numeroDocumento' && value.length >= 8) {
      consultarDocumentoProveedor(value);
    }
  };

  // Función para consultar documento automáticamente
  const consultarDocumentoProveedor = async (numeroDocumento) => {
    if (!numeroDocumento || numeroDocumento.length < 8) return;

    setConsultandoProveedor(true);
    setErrorConsultaProveedor('');

    try {
      let resultado = null;
      
      if (nuevoProveedor.tipoDocumento === 'DNI' && numeroDocumento.length === 8) {
        resultado = await consultarReniec(numeroDocumento);
      } else if (nuevoProveedor.tipoDocumento === 'RUC' && numeroDocumento.length === 11) {
        resultado = await consultarSunat(numeroDocumento);
      }

      if (resultado && resultado.mensaje === 'Consulta exitosa' && resultado.datos) {
        // Extraer el nombre según el tipo de documento
        let nombreCompleto = '';
        if (nuevoProveedor.tipoDocumento === 'DNI') {
          // Para DNI, usar nombreCompleto del backend o construir desde datos
          nombreCompleto = resultado.nombreCompleto || 
            `${resultado.datos.nombres || ''} ${resultado.datos.apellidoPaterno || ''} ${resultado.datos.apellidoMaterno || ''}`.trim();
        } else if (nuevoProveedor.tipoDocumento === 'RUC') {
          // Para RUC, usar nombreCompleto del backend o razonSocial
          nombreCompleto = resultado.nombreCompleto || resultado.datos.razonSocial || resultado.datos.nombre || '';
        }

        setNuevoProveedor(prev => ({
          ...prev,
          nombre: nombreCompleto,
          direccion: resultado.datos.direccion || '',
          ruc: nuevoProveedor.tipoDocumento === 'RUC' ? numeroDocumento : (resultado.datos.ruc || prev.ruc || '')
        }));
        
        setErrorConsultaProveedor('✅ Datos obtenidos exitosamente');
      } else {
        setErrorConsultaProveedor('No se encontraron datos para el documento consultado');
      }
    } catch (error) {
      console.error('Error en consulta automática:', error);
      setErrorConsultaProveedor(`❌ Error al consultar: ${error.message}`);
    } finally {
      setConsultandoProveedor(false);
    }
  };

  // Función para consulta manual
  const consultarManualProveedor = () => {
    if (nuevoProveedor.numeroDocumento) {
      consultarDocumentoProveedor(nuevoProveedor.numeroDocumento);
    }
  };

  // Manejar pagos
  const handlePagoChange = (index, field, value) => {
    const newPagos = [...pagos];
    newPagos[index][field] = value;
    setPagos(newPagos);
  };

  // Agregar producto al detalle
  const agregarProducto = () => {
    if (!detalleProducto.productoId || detalleProducto.cantidad <= 0 || detalleProducto.precioUnitario <= 0) {
      setErrors(prev => ({
        ...prev,
        detalle: 'Complete todos los campos del producto'
      }));
      return;
    }

    const producto = productos.find(p => p.id == detalleProducto.productoId);
    
    // Verificar que el producto existe y está activo
    if (!producto || !producto.estado) {
      setErrors(prev => ({
        ...prev,
        detalle: 'El producto seleccionado no está disponible'
      }));
      return;
    }
    const nuevoDetalle = {
      ...detalleProducto,
      producto: producto,
      id: Date.now() // ID temporal
    };

    const nuevosDetalles = [...detalles, nuevoDetalle];
    setDetalles(nuevosDetalles);

    // Limpiar el formulario de detalle
    setDetalleProducto({
      productoId: '',
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0
    });

    setErrors(prev => ({
      ...prev,
      detalle: ''
    }));
  };

  // Eliminar producto del detalle
  const eliminarProducto = (index) => {
    const nuevosDetalles = detalles.filter((_, i) => i !== index);
    setDetalles(nuevosDetalles);
  };

  const agregarPago = () => {
    setPagos([...pagos, {
      formaPago: 'Efectivo',
      desde: 'CAJA GENERAL - Administracion',
      referencia: '',
      glosa: '',
      monto: '0'
    }]);
  };

  const eliminarPago = (index) => {
    if (pagos.length > 1) {
      setPagos(pagos.filter((_, i) => i !== index));
    }
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

  // Modal de proveedor
  const abrirModalProveedor = () => {
    setMostrarModalProveedor(true);
  };

  const cerrarModalProveedor = () => {
    setMostrarModalProveedor(false);
    setNuevoProveedor({
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
  };

  // ----- Importar productos desde XML -----
  const abrirModalImportar = () => {
    setMostrarModalImportar(true);
  };

  const cerrarModalImportar = () => {
    setMostrarModalImportar(false);
    setArchivoXml(null);
  };

  const handleArchivoXmlChange = (event) => {
    const archivo = event.target.files[0];
    if (archivo && (archivo.type === 'text/xml' || archivo.name.toLowerCase().endsWith('.xml'))) {
      setArchivoXml(archivo);
    } else {
      alert('Por favor seleccione un archivo XML válido');
      event.target.value = '';
    }
  };

  const parseXmlCompra = async (file) => {
    const texto = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(texto, 'text/xml');

    // Intentar múltiples estructuras comunes (Factura, Nota de Débito/Crédito)
    const invoiceLines = Array.from(doc.getElementsByTagName('cac:InvoiceLine'));
    const debitLines = Array.from(doc.getElementsByTagName('cac:DebitNoteLine'));
    const creditLines = Array.from(doc.getElementsByTagName('cac:CreditNoteLine'));
    const lines = invoiceLines.length ? invoiceLines : (debitLines.length ? debitLines : creditLines);

    const nuevosDetalles = [];

    // Helpers seguros para XML con namespaces (evita querySelector con ':')
    const getTag = (node, tag) => {
      const list = node.getElementsByTagName(tag);
      return list && list.length > 0 ? list[0] : null;
    };

    const getText = (node) => (node && node.textContent ? node.textContent.trim() : '');

    const procesarLinea = (node) => {
      // Código de producto
      const sellersId = getTag(node, 'cac:SellersItemIdentification') || getTag(node, 'cac:Item');
      const codeNode = sellersId ? getTag(sellersId, 'cbc:ID') : getTag(node, 'cbc:ID');

      // Cantidad
      const qtyNode = getTag(node, 'cbc:InvoicedQuantity') 
        || getTag(node, 'cbc:DebitedQuantity') 
        || getTag(node, 'cbc:CreditedQuantity');

      // Precio unitario
      const price = getTag(node, 'cac:Price');
      const priceNode = price ? getTag(price, 'cbc:PriceAmount') : getTag(node, 'cbc:PriceAmount');

      const codigo = getText(codeNode);
      const cantidad = parseFloat(getText(qtyNode)) || 0;
      let precioUnitario = parseFloat(getText(priceNode)) || 0;

      // Fallback: derivar precio de LineExtensionAmount / cantidad
      if (!precioUnitario) {
        const lineExt = getTag(node, 'cbc:LineExtensionAmount');
        if (lineExt && cantidad > 0) {
          const totalLinea = parseFloat(getText(lineExt)) || 0;
          precioUnitario = cantidad ? totalLinea / cantidad : 0;
        }
      }

      if (cantidad > 0 && precioUnitario > 0) {
        const productoMatch = productos.find(p => (p.codigo || '').toString().trim() === codigo);
        const detalle = {
          productoId: productoMatch?.id || '',
          cantidad,
          precioUnitario,
          subtotal: cantidad * precioUnitario,
          producto: productoMatch || undefined,
          id: Date.now() + Math.random()
        };
        nuevosDetalles.push(detalle);
      }
    };

    if (lines.length > 0) {
      lines.forEach(procesarLinea);
    }

    return nuevosDetalles;
  };

  const handleImportarXml = async () => {
    if (!archivoXml) {
      alert('Por favor seleccione un archivo XML');
      return;
    }

    try {
      setCargandoImportacion(true);
      const importados = await parseXmlCompra(archivoXml);

      if (importados.length === 0) {
        alert('No se encontraron ítems válidos en el XML');
        return;
      }

      setDetalles(prev => [...prev, ...importados]);
      cerrarModalImportar();
      alert(`Se importaron ${importados.length} ítems desde el XML`);
    } catch (error) {
      console.error('Error al importar XML en formulario:', error);
      alert('Error al importar XML: ' + error.message);
    } finally {
      setCargandoImportacion(false);
    }
  };

  const guardarProveedor = async () => {
    if (!nuevoProveedor.numeroDocumento || !nuevoProveedor.nombre) {
      alert('Complete los campos obligatorios del proveedor');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos del proveedor con solo los campos que acepta el backend
      const datosProveedor = {
        nombre: nuevoProveedor.nombre,
        tipoDocumento: nuevoProveedor.tipoDocumento,
        numeroDocumento: nuevoProveedor.numeroDocumento,
        direccion: nuevoProveedor.direccion || null,
        telefono: nuevoProveedor.telefono || null,
        // email y contacto no están en el formulario pero están en el modelo
        email: null,
        contacto: null
      };
      
      const resultado = await crearProveedor(datosProveedor);
      
      // Recargar lista de proveedores
      const proveedoresData = await obtenerProveedores();
      setProveedores(proveedoresData.proveedores || proveedoresData.data || []);
      
      // Seleccionar el nuevo proveedor automáticamente
      setFormData(prev => ({
        ...prev,
        proveedor: resultado.proveedor?.id || resultado.id
      }));

      alert('Proveedor guardado exitosamente');
      cerrarModalProveedor();
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      alert('Error al guardar el proveedor: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales
  const calcularTotal = () => {
    const subtotal = detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
    const igv = opciones.tieneIGV ? subtotal * 0.18 : 0;
    const total = subtotal + igv;
    
    return { subtotal, igv, total };
  };

  const { subtotal, igv, total } = calcularTotal();

  // Enviar compra
  const enviarCompra = async (e) => {
    e.preventDefault();
    
    // Validación básica con mensajes específicos
    const newErrors = {};
    
    if (!formData.proveedor) {
      newErrors.proveedor = 'Seleccione un proveedor';
    }
    
    if (!formData.sucursalId) {
      newErrors.sucursalId = 'Seleccione una sucursal';
    }
    
    if (!formData.serie) {
      newErrors.serie = 'Ingrese la serie del comprobante';
    }
    
    if (!formData.numero) {
      newErrors.numero = 'Ingrese el número del comprobante';
    }

    if (detalles.length === 0) {
      newErrors.general = 'Agregue al menos un producto';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const compraData = {
      // Mapear exactamente a los campos que espera el backend
      proveedorId: parseInt(formData.proveedor), // Backend espera 'proveedorId' como número
      sucursalId: parseInt(formData.sucursalId), // Backend espera 'sucursalId' como número
      tipoComprobante: formData.tipoComprobante,
      serieComprobante: formData.serie, // Backend espera 'serieComprobante'
      numeroComprobante: formData.numero, // Backend espera 'numeroComprobante'
      fechaCompra: formData.fechaEmision + 'T00:00:00Z', // Backend espera 'fechaCompra' en formato ISO
      subtotal: parseFloat(subtotal),
      igv: parseFloat(igv),
      total: parseFloat(total),
      estado: 'PENDIENTE',
      observacion: formData.observaciones || '', // Backend espera 'observacion' (singular)
      detalles: detalles.map(detalle => ({
        productoId: parseInt(detalle.productoId),
        cantidad: parseFloat(detalle.cantidad),
        precioUnitario: parseFloat(detalle.precioUnitario),
        subtotal: parseFloat(detalle.subtotal)
      }))
    };

    try {
      setLoading(true);
      
      // Verificar conectividad antes de enviar
      console.log('🔍 Verificando conectividad antes de crear compra...');
      const conectado = await probarConectividad();
      if (!conectado) {
        setErrors({ general: 'No se puede conectar al servidor. Verifique que el backend esté ejecutándose.' });
        alert('Error: No se puede conectar al servidor');
        return;
      }
      
      const resultado = await crearCompra(compraData);
      
      // Limpiar formulario después del éxito
      setFormData({
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
      
      setDetalles([]);
      setPagos([{
        formaPago: 'Efectivo',
        desde: 'CAJA GENERAL - Administracion',
        referencia: '',
        glosa: '',
        monto: '0'
      }]);
      setErrors({});
      alert('Compra creada exitosamente');
      
    } catch (error) {
      console.error('Error al crear compra:', error);
      setErrors({ general: 'Error al crear la compra' });
      alert('Error al crear la compra');
    } finally {
      setLoading(false);
    }
  };

  const meses = [
    { value: 'ene', label: 'ene', numero: '01' },
    { value: 'feb', label: 'feb', numero: '02' },
    { value: 'mar', label: 'mar', numero: '03' },
    { value: 'abr', label: 'abr', numero: '04' },
    { value: 'may', label: 'may', numero: '05' },
    { value: 'jun', label: 'jun', numero: '06' },
    { value: 'jul', label: 'jul', numero: '07' },
    { value: 'ago', label: 'ago', numero: '08' },
    { value: 'sep', label: 'sep', numero: '09' },
    { value: 'oct', label: 'oct', numero: '10' },
    { value: 'nov', label: 'nov', numero: '11' },
    { value: 'dic', label: 'dic', numero: '12' }
  ];

  // Estado para el año del calendario
  const [anoCalendario, setAnoCalendario] = useState(new Date().getFullYear());
  
  // Función para cambiar año
  const cambiarAno = (direccion) => {
    setAnoCalendario(prev => prev + direccion);
  };

  // Función para seleccionar mes
  const seleccionarMes = (mes) => {
    const nuevoPeriodo = `${anoCalendario}-${mes.numero}`;
    setFormData({...formData, periodoCompra: nuevoPeriodo});
  };

  // Obtener mes actual del período
  const obtenerMesActual = () => {
    if (formData.periodoCompra) {
      const [ano, mes] = formData.periodoCompra.split('-');
      return mes;
    }
    return new Date().toISOString().slice(5, 7);
  };

  // Función para descargar plantilla de productos existentes
  const descargarPlantillaProductosExistentes = () => {
    // Estructura de la plantilla para productos existentes
    const encabezados = [
      'Código Interno',
      'Cantidad',
      'Precio unitario'
    ];

    // Datos de ejemplo
    const datosEjemplo = [
      ['P0141', '4', '25.6']
    ];

    // Crear hoja de trabajo
    const datosPlantilla = [encabezados, ...datosEjemplo];
    const ws = XLSX.utils.aoa_to_sheet(datosPlantilla);

    // Configurar ancho de columnas
    ws['!cols'] = [
      { wch: 15 }, // Código Interno
      { wch: 10 }, // Cantidad
      { wch: 15 }  // Precio unitario
    ];

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos Existentes');

    // Descargar archivo
    const fechaActual = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `plantilla_productos_existentes_${fechaActual}.xlsx`);
  };

  // Función para descargar plantilla de productos nuevos
  const descargarPlantillaProductosNuevos = () => {
    // Estructura de la plantilla para productos nuevos (basada en la estructura completa del sistema)
    const encabezados = [
      'Número',
      'Código Interno',
      'Modelo',
      'Código Sunat',
      'Código Tipo de Unidad',
      'Código Tipo de Moneda',
      'Precio Unitario Venta',
      'Código Tipo de Afectación de Igv',
      'Tasa Igv',
      'Precio Unitario Compra',
      'Código Tipo de Afectación de Igv Compra',
      'Stock Mínimo',
      'Stock Máximo',
      'Descripción Número Lote/Serie',
      'Código Sunat Fec. Vencimiento',
      'Cod Barra',
      'Intervenciones',
      'Cantidad'
    ];

    // Datos de ejemplo basados en la imagen proporcionada
    const datosEjemplo = [
      [
        'BATERIAS BATERIAS 6X6 COLOR NEGRO',
        '64001',
        '',
        'NIU',
        'PEN',
        '10.00',
        '10',
        '0.18',
        '10.00',
        '10',
        '0',
        '0',
        'BATERIAS BATERIAS 6X6 COLOR NEGRO',
        '',
        '1000000001',
        'Intervenciones',
        '1'
      ]
    ];

    // Crear hoja de trabajo
    const datosPlantilla = [encabezados, ...datosEjemplo];
    const ws = XLSX.utils.aoa_to_sheet(datosPlantilla);

    // Configurar ancho de columnas
    ws['!cols'] = [
      { wch: 35 }, // Número
      { wch: 15 }, // Código Interno
      { wch: 15 }, // Modelo
      { wch: 15 }, // Código Sunat
      { wch: 20 }, // Código Tipo de Unidad
      { wch: 20 }, // Código Tipo de Moneda
      { wch: 20 }, // Precio Unitario Venta
      { wch: 25 }, // Código Tipo de Afectación de Igv
      { wch: 10 }, // Tasa Igv
      { wch: 20 }, // Precio Unitario Compra
      { wch: 30 }, // Código Tipo de Afectación de Igv Compra
      { wch: 15 }, // Stock Mínimo
      { wch: 15 }, // Stock Máximo
      { wch: 30 }, // Descripción Número Lote/Serie
      { wch: 25 }, // Código Sunat Fec. Vencimiento
      { wch: 15 }, // Cod Barra
      { wch: 15 }, // Intervenciones
      { wch: 10 }  // Cantidad
    ];

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos Nuevos');

    // Descargar archivo
    const fechaActual = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `plantilla_productos_nuevos_${fechaActual}.xlsx`);
  };

  return (
    <div className="fc-container">
      <h2 className="fc-title">Nueva Compra</h2>
      
      <form className="fc-form" onSubmit={enviarCompra}>
        <div className="fc-row">
          <div className="fc-field">
            <label className="fc-label">Tipo comprobante</label>
            <select 
              name="tipoComprobante" 
              value={formData.tipoComprobante}
              onChange={handleInputChange}
              className="fc-select"
            >
              <option value="FACTURA ELECTRÓNICA">FACTURA ELECTRÓNICA</option>
              <option value="BOLETA DE VENTA ELECTRONICA">BOLETA DE VENTA ELECTRONICA</option>
              <option value="NOTA DE CREDITO">NOTA DE CRÉDITO</option>
              <option value="NOTA DE DEBITO">NOTA DE DÉBITO</option>
              <option value="GUÍA">GUÍA</option>
              <option value="NOTA DE VENTA">NOTA DE VENTA</option>
              <option value="RECIBO POR HONORARIOS">RECIBO POR HONORARIOS</option>
              <option value="SERVICIOS PÚBLICOS">SERVICIOS PÚBLICOS</option>
            </select>
          </div>
          
          <div className="fc-field">
            <label className="fc-label">Serie <span className="fc-required">*</span></label>
            <input 
              type="text" 
              name="serie"
              value={formData.serie}
              onChange={handleInputChange}
              className="fc-input"
            />
            {errors.serie && <span className="fc-error">{errors.serie}</span>}
          </div>
          
          <div className="fc-field">
            <label className="fc-label">Número <span className="fc-required">*</span></label>
            <input 
              type="text" 
              name="numero"
              value={formData.numero}
              onChange={handleInputChange}
              className="fc-input"
            />
            {errors.numero && <span className="fc-error">{errors.numero}</span>}
          </div>
          
          <div className="fc-field">
            <label className="fc-label">Fec Emisión</label>
            <input 
              type="date" 
              name="fechaEmision"
              value={formData.fechaEmision}
              onChange={handleInputChange}
              className="fc-date-input"
            />
          </div>
          
          <div className="fc-field">
            <label className="fc-label">Fec. Vencimiento</label>
            <input 
              type="date" 
              name="fechaVencimiento"
              value={formData.fechaVencimiento}
              onChange={handleInputChange}
              className="fc-date-input"
            />
          </div>
        </div>

        <div className="fc-row">
          <div className="fc-field">
            <label className="fc-label">Proveedor <span className="fc-required">*</span> <span className="fc-new" onClick={abrirModalProveedor}>[+ Nuevo]</span></label>
            <select 
              name="proveedor"
              value={formData.proveedor}
              onChange={handleInputChange}
              className="fc-select"
            >
              <option value="">Seleccionar</option>
              {proveedores.map(proveedor => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombre} - {proveedor.ruc || proveedor.numeroDocumento}
                </option>
              ))}
            </select>
            {errors.proveedor && <span className="fc-error">{errors.proveedor}</span>}
          </div>

          <div className="fc-field">
            <label className="fc-label">Sucursal <span className="fc-required">*</span></label>
            <select 
              name="sucursalId"
              value={formData.sucursalId}
              onChange={handleInputChange}
              className="fc-select"
            >
              <option value="">Seleccionar</option>
              {sucursales.map(sucursal => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </option>
              ))}
            </select>
            {errors.sucursalId && <span className="fc-error">{errors.sucursalId}</span>}
          </div>
          
          <div className="fc-field">
            <label className="fc-label">Moneda</label>
            <select 
              name="moneda"
              value={formData.moneda}
              onChange={handleInputChange}
              className="fc-select"
            >
              <option value="Soles">Soles</option>
              <option value="Dolares">Dólares</option>
            </select>
          </div>
          
          <div className="fc-field">
            <label className="fc-label">Tipo de cambio <span className="fc-info">ⓘ</span></label>
            <input 
              type="text" 
              name="tipoCambio"
              value={formData.tipoCambio}
              onChange={handleInputChange}
              className="fc-input"
            />
          </div>
          
          <div className="fc-field">
            <label className="fc-label">Orden de compra</label>
            <input 
              type="text" 
              name="ordenCompra"
              value={formData.ordenCompra}
              onChange={handleInputChange}
              className="fc-input"
              placeholder="Número de documento"
            />
          </div>
        </div>

        <div className="fc-row">
          <div className="fc-field fc-full-width">
            <label className="fc-label">Observaciones</label>
            <textarea 
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              className="fc-textarea"
              placeholder="Observaciones"
            />
          </div>
        </div>

        <div className="fc-row">
          <div className="fc-field">
            <label className="fc-label">Const. Detracción</label>
            <input 
              type="text" 
              name="constDetraccion"
              value={formData.constDetraccion}
              onChange={handleInputChange}
              className="fc-input"
              placeholder="Const. Detracción"
            />
          </div>
          
          <div className="fc-field">
            <label className="fc-label">Fecha Detracción</label>
            <input 
              type="date" 
              name="fechaDetraccion"
              value={formData.fechaDetraccion}
              onChange={handleInputChange}
              className="fc-date-input"
              placeholder="Fecha Detracción"
            />
          </div>
          
          <div className="fc-field">
            <label className="fc-label">Porcentaje Detracción</label>
            <input 
              type="text" 
              name="porcentajeDetraccion"
              value={formData.porcentajeDetraccion}
              onChange={handleInputChange}
              className="fc-input"
              placeholder="Porcentaje Detracción"
            />
          </div>
        </div>

        <div className="fc-checkboxes">
          <div className="fc-checkbox-item">
            <input 
              type="checkbox" 
              id="aplicarOtroPeriodo"
              name="aplicarOtroPeriodo"
              checked={opciones.aplicarOtroPeriodo}
              onChange={handleOpcionChange}
              className="fc-checkbox"
            />
            <label htmlFor="aplicarOtroPeriodo" className="fc-checkbox-label">
              ¿Desea aplicar la compra para otro periodo?
            </label>
          </div>

          <div className="fc-checkbox-item">
            <input 
              type="checkbox" 
              id="agregarCliente"
              name="agregarCliente"
              checked={opciones.agregarCliente}
              onChange={handleOpcionChange}
              className="fc-checkbox"
            />
            <label htmlFor="agregarCliente" className="fc-checkbox-label">
              ¿Desea agregar el cliente para esta compra?
            </label>
          </div>

          <div className="fc-checkbox-item">
            <input 
              type="checkbox" 
              id="agregarPagos"
              name="agregarPagos"
              checked={opciones.agregarPagos}
              onChange={handleOpcionChange}
              className="fc-checkbox"
            />
            <label htmlFor="agregarPagos" className="fc-checkbox-label">
              ¿Desea agregar pagos a esta compra?
            </label>
          </div>

          <div className="fc-checkbox-item">
            <input 
              type="checkbox" 
              id="tieneIGV"
              name="tieneIGV"
              checked={opciones.tieneIGV}
              onChange={handleOpcionChange}
              className="fc-checkbox"
            />
            <label htmlFor="tieneIGV" className="fc-checkbox-label">
              ¿La compra tiene el 18% de IGV?
            </label>
          </div>
        </div>

        {/* Sección de productos */}
        <div className="fc-section">
          <h3 className="fc-section-title">Productos</h3>
          <div style={{ marginBottom: '10px' }}>
            <button
              type="button"
              className="fc-btn fc-btn-secondary"
              onClick={abrirModalImportar}
            >
              Importar XML
            </button>
          </div>
          
          <div className="fc-producto-form">
            <div className="fc-row">
              <div className="fc-field">
                <label className="fc-label">Producto <span className="fc-required">*</span></label>
                <select 
                  name="productoId"
                  value={detalleProducto.productoId}
                  onChange={handleDetalleChange}
                  className="fc-select"
                >
                  <option value="">Seleccionar producto</option>
                  {productos.filter(producto => producto.estado === true).map(producto => (
                    <option key={producto.id} value={producto.id}>
                      {producto.codigo} - {producto.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="fc-field">
                <label className="fc-label">Cantidad <span className="fc-required">*</span></label>
                <input 
                  type="number" 
                  name="cantidad"
                  value={detalleProducto.cantidad}
                  onChange={handleDetalleChange}
                  className="fc-input"
                  min="1"
                />
              </div>
              
              <div className="fc-field">
                <label className="fc-label">Precio Unitario <span className="fc-required">*</span></label>
                <input 
                  type="number" 
                  name="precioUnitario"
                  value={detalleProducto.precioUnitario}
                  onChange={handleDetalleChange}
                  className="fc-input"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="fc-field">
                <label className="fc-label">Subtotal</label>
                <input 
                  type="text" 
                  value={`S/ ${detalleProducto.subtotal.toFixed(2)}`}
                  className="fc-input"
                  readOnly
                />
              </div>
              
              <div className="fc-field">
                <button 
                  type="button" 
                  onClick={agregarProducto}
                  className="fc-btn fc-btn-primary"
                >
                  + Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Lista de productos agregados */}
          {detalles.length > 0 && (
            <div className="fc-productos-lista">
              <table className="fc-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.map((detalle, index) => (
                    <tr key={detalle.id || index}>
                      <td>{detalle.producto?.nombre || 'Producto'}</td>
                      <td>{detalle.cantidad}</td>
                      <td>S/ {detalle.precioUnitario.toFixed(2)}</td>
                      <td>S/ {detalle.subtotal.toFixed(2)}</td>
                      <td>
                        <button 
                          type="button"
                          onClick={() => eliminarProducto(index)}
                          className="fc-delete-btn"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Totales */}
              <div className="fc-totales">
                <div className="fc-total-item">
                  <strong>Subtotal: S/ {subtotal.toFixed(2)}</strong>
                </div>
                <div className="fc-total-item">
                  <strong>IGV: S/ {igv.toFixed(2)}</strong>
                </div>
                <div className="fc-total-item fc-total-final">
                  <strong>Total: S/ {total.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}
          {errors.detalle && <span className="fc-error">{errors.detalle}</span>}
        </div>

        {/* Período de compra SUNAT */}
        {opciones.aplicarOtroPeriodo && (
          <div className="fc-section fc-periodo-section">
            <h3 className="fc-section-title">Período de compra (SUNAT)</h3>
            <div className="fc-periodo-container">
              <input 
                type="text" 
                value={formData.periodoCompra}
                onChange={(e) => setFormData({...formData, periodoCompra: e.target.value})}
                className="fc-periodo-input"
              />
              <div className="fc-calendario">
                <div className="fc-calendario-header">
                  <button 
                    type="button" 
                    className="fc-nav-btn"
                    onClick={() => cambiarAno(-1)}
                  >
                    ‹
                  </button>
                  <span>{anoCalendario}</span>
                  <button 
                    type="button" 
                    className="fc-nav-btn"
                    onClick={() => cambiarAno(1)}
                  >
                    ›
                  </button>
                </div>
                <div className="fc-meses-grid">
                  {meses.map((mes) => (
                    <button
                      key={mes.value}
                      type="button"
                      className={`fc-mes-btn ${mes.numero === obtenerMesActual() ? 'fc-mes-activo' : ''}`}
                      onClick={() => seleccionarMes(mes)}
                    >
                      {mes.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección de clientes */}
        {opciones.agregarCliente && (
          <div className="fc-section">
            <div className="fc-clientes-container">
              <span className="fc-clientes-text">Clientes</span>
              <div className="fc-clientes-input-container">
                <input 
                  type="text" 
                  className="fc-clientes-input"
                  placeholder="Buscar o agregar cliente..."
                  value={busquedaCliente}
                  onChange={handleBusquedaCliente}
                  onFocus={() => {
                    if (clientesFiltrados.length > 0) {
                      setMostrarListaClientes(true);
                    }
                  }}
                />
                {clienteSeleccionado && (
                  <button 
                    type="button"
                    className="fc-limpiar-cliente-btn"
                    onClick={limpiarSeleccionCliente}
                    title="Limpiar selección"
                  >
                    ×
                  </button>
                )}
                
                {/* Lista desplegable de clientes */}
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

        {/* Condición de pago */}
        {opciones.agregarPagos && (
          <div className="fc-section fc-pagos-section">
            <div className="fc-condicion-pago">
              <label className="fc-label">Condición de pago</label>
              <select 
                value={formData.condicionPago}
                onChange={(e) => setFormData({...formData, condicionPago: e.target.value})}
                className="fc-select"
              >
                <option value="Contado">Contado</option>
                <option value="Crédito">Crédito</option>
              </select>
            </div>

            <div className="fc-pagos-table">
              <div className="fc-pagos-header">
                <span>Forma de pago</span>
                <span>Desde <span className="fc-info">ⓘ</span></span>
                <span>Referencia</span>
                <span>Glosa</span>
                <span>Monto</span>
                <span>
                  <button 
                    type="button" 
                    className="fc-agregar-btn"
                    onClick={agregarPago}
                  >
                    [+ Agregar]
                  </button>
                </span>
              </div>
              
              {pagos.map((pago, index) => (
                <div key={index} className="fc-pagos-row">
                  <select 
                    value={pago.formaPago}
                    onChange={(e) => handlePagoChange(index, 'formaPago', e.target.value)}
                    className="fc-select fc-small"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                  
                  <select 
                    value={pago.desde}
                    onChange={(e) => handlePagoChange(index, 'desde', e.target.value)}
                    className="fc-select fc-small"
                  >
                    <option value="CAJA GENERAL - Administracion">CAJA GENERAL - Administracion</option>
                  </select>
                  
                  <input 
                    type="text"
                    value={pago.referencia}
                    onChange={(e) => handlePagoChange(index, 'referencia', e.target.value)}
                    className="fc-input fc-small"
                  />
                  
                  <input 
                    type="text"
                    value={pago.glosa}
                    onChange={(e) => handlePagoChange(index, 'glosa', e.target.value)}
                    className="fc-input fc-small"
                  />
                  
                  <input 
                    type="text"
                    value={pago.monto}
                    onChange={(e) => handlePagoChange(index, 'monto', e.target.value)}
                    className="fc-input fc-small"
                  />
                  
                  <button 
                    type="button"
                    onClick={() => eliminarPago(index)}
                    className="fc-delete-btn"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Nuevo Proveedor */}
        {mostrarModalProveedor && (
          <div className="fc-modal-overlay">
            <div className="fc-modal">
              <div className="fc-modal-header">
                <h3>Nuevo Proveedor</h3>
                <button className="fc-modal-close" onClick={cerrarModalProveedor}>×</button>
              </div>
              
              <div className="fc-modal-body">
                <div className="fc-modal-row">
                  <div className="fc-modal-field">
                    <label className="fc-label">Tipo Doc. Identidad *</label>
                    <select 
                      name="tipoDocumento"
                      value={nuevoProveedor.tipoDocumento}
                      onChange={handleProveedorChange}
                      className="fc-select"
                    >
                      <option value="RUC">RUC</option>
                      <option value="DNI">DNI</option>
                      <option value="CE">Carnet Extranjería</option>
                    </select>
                  </div>
                  
                  <div className="fc-modal-field">
                    <label className="fc-label">Número *</label>
                    <div className="fc-input-group">
                      <input 
                        type="text" 
                        name="numeroDocumento"
                        value={nuevoProveedor.numeroDocumento}
                        onChange={handleProveedorChange}
                        className="fc-input"
                        placeholder="Número de documento"
                        disabled={consultandoProveedor}
                      />
                      <button 
                        type="button"
                        onClick={consultarManualProveedor}
                        disabled={consultandoProveedor || !nuevoProveedor.numeroDocumento}
                        className="fc-btn fc-btn-consulta"
                      >
                        {consultandoProveedor ? 'Consultando...' : 'Consultar'}
                      </button>
                    </div>
                    {errorConsultaProveedor && (
                      <div className="fc-error-message">
                        {errorConsultaProveedor}
                      </div>
                    )}
                  </div>
                </div>

                <div className="fc-modal-row">
                  <div className="fc-modal-field fc-full-width">
                    <label className="fc-label">Nombre *</label>
                    <input 
                      type="text" 
                      name="nombre"
                      value={nuevoProveedor.nombre}
                      onChange={handleProveedorChange}
                      className="fc-input"
                      placeholder="Nombre completo"
                    />
                  </div>
                </div>


                {/*

                <div className="fc-modal-row">
                  <div className="fc-modal-field fc-full-width">
                    <label className="fc-label">Dirección</label>
                    <input 
                      type="text" 
                      name="direccion"
                      value={nuevoProveedor.direccion}
                      onChange={handleProveedorChange}
                      className="fc-input"
                      placeholder="Dirección completa"
                    />
                  </div>
                </div>*/}

                <div className="fc-modal-row">
                  <div className="fc-modal-field">
                    <label className="fc-label">Teléfono</label>
                    <input 
                      type="text" 
                      name="telefono"
                      value={nuevoProveedor.telefono}
                      onChange={handleProveedorChange}
                      className="fc-input"
                      placeholder="Teléfono"
                    />
                  </div>
                  
                  <div className="fc-modal-field">
                    <label className="fc-label">Días de crédito</label>
                    <input 
                      type="number" 
                      name="diasCredito"
                      value={nuevoProveedor.diasCredito}
                      onChange={handleProveedorChange}
                      className="fc-input"
                      placeholder="0"
                    />
                </div>
              </div>

              <div className="fc-modal-row">
                <div className="fc-modal-field">
                    <label className="fc-label">Código Interno</label>
                    <input 
                      type="text" 
                      name="codigoInterno"
                      value={nuevoProveedor.codigoInterno}
                      onChange={handleProveedorChange}
                      className="fc-input"
                      placeholder="Código interno"
                    />
                  </div>
                  
                  <div className="fc-modal-field">
                    <label className="fc-label">Código de barra</label>
                    <input 
                      type="text" 
                      name="codigoBarras"
                      value={nuevoProveedor.codigoBarras}
                      onChange={handleProveedorChange}
                      className="fc-input"
                      placeholder="Código de barra"
                    />
                  </div>
                </div>

                <div className="fc-modal-row">
                  <div className="fc-modal-field">
                    <label className="fc-label">Nacionalidad</label>
                    <select 
                      name="nacionalidad"
                      value={nuevoProveedor.nacionalidad}
                      onChange={handleProveedorChange}
                      className="fc-select"
                    >
                      <option value="Perú">Perú</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  
                  <div className="fc-modal-field">
                    <label className="fc-label">Tipo de proveedor</label>
                    <select 
                      name="tipoProveedor"
                      value={nuevoProveedor.tipoProveedor}
                      onChange={handleProveedorChange}
                      className="fc-select"
                    >
                      <option value="Vendedor">Vendedor</option>
                      <option value="Fabricante">Fabricante</option>
                      <option value="Distribuidor">Distribuidor</option>
                    </select>
                  </div>
                </div>


                {/* <div className="fc-modal-row">
                  <div className="fc-modal-checkbox">
                    <input 
                      type="checkbox" 
                      id="esAgentePercepcion"
                      name="esAgentePercepcion"
                      checked={nuevoProveedor.esAgentePercepcion}
                      onChange={handleProveedorChange}
                      className="fc-checkbox"
                    />
                    <label htmlFor="esAgentePercepcion" className="fc-checkbox-label">
                      ¿Es agente de percepción?
                    </label>
                  </div>
                </div>*/}

               
              </div>
              
              <div className="fc-modal-footer">
                <button 
                  type="button" 
                  className="fc-btn fc-btn-secondary"
                  onClick={cerrarModalProveedor}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="fc-btn fc-btn-primary"
                  onClick={guardarProveedor}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Proveedor'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Importar XML */}
        {mostrarModalImportar && (
          <div className="fc-modal-overlay">
            <div className="fc-modal">
              <div className="fc-modal-header">
                <h3>Importar XML de Compra</h3>
                <button className="fc-modal-close" onClick={cerrarModalImportar}>×</button>
              </div>
              <div className="fc-modal-body">
                <div className="fc-modal-row">
                  <div className="fc-modal-field fc-full-width">
                    <label className="fc-label">Archivo XML</label>
                    <input 
                      type="file" 
                      accept=".xml" 
                      onChange={handleArchivoXmlChange}
                      className="fc-input"
                    />
                    {archivoXml && (
                      <div className="fc-file-name">Archivo: {archivoXml.name}</div>
                    )}
                  </div>
                </div>
                <div className="fc-modal-actions">
                  <button 
                    type="button" 
                    className="fc-btn fc-btn-cancel" 
                    onClick={cerrarModalImportar}
                    disabled={cargandoImportacion}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="fc-btn fc-btn-primary" 
                    onClick={handleImportarXml}
                    disabled={cargandoImportacion || !archivoXml}
                  >
                    {cargandoImportacion ? 'Importando...' : 'Importar XML'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {errors.general && (
          <div className="fc-error-general">
            {errors.general}
          </div>
        )}

        {loading && (
          <div className="fc-loading">
            <span>Cargando...</span>
          </div>
        )}

        <div className="fc-actions">
          <button 
            type="submit" 
            className="fc-btn fc-btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Compra'}
          </button>


         {/* 
          <button type="button" className="fc-btn fc-btn-secondary">Subir productos existentes</button>
          <button type="button" className="fc-btn fc-btn-secondary">Subir productos nuevos</button> 


             <div className="fc-file-actions">
            <button type="button" className="fc-btn fc-btn-outline">Seleccionar archivo</button>
            <span className="fc-file-text">Ningún archivo seleccionado</span>
            <button type="button" className="fc-btn fc-btn-link">Cargar Archivo</button>
          </div>*/ }
          
      
          
          {/*  <button type="button" className="fc-btn fc-btn-cancel">Cancelar</button>*/ }
        </div>


         {/* 

        <div className="fc-download-links">
          <button 
            type="button" 
            className="fc-download-link"
            onClick={descargarPlantillaProductosExistentes}
          >
            Descargar formato para subir productos existentes
          </button>
          <button 
            type="button" 
            className="fc-download-link"
            onClick={descargarPlantillaProductosNuevos}
          >
            Descargar formato para subir productos nuevos
          </button>
        </div>
*/ }




      </form>
    </div>
  );
};

export default FormularioCompras;