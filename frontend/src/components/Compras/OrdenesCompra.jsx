import React, { useState, useEffect } from 'react';
import '../../styles/OrdenesCompra.css';
import { obtenerCompras, obtenerCompraPorId, crearCompra, actualizarCompra, eliminarCompra } from '../../services/compraService';
import { obtenerProveedores } from '../../services/proveedorService';
import { obtenerProductos } from '../../services/productoService';
import { obtenerClientes } from '../../services/clienteService';
import ProductoDetalle from './FormularioVentaProductServicio';

const OrdenesCompra = () => {
  const [showModal, setShowModal] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroTermino, setFiltroTermino] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    proveedor: '',
    formaPago: '',
    tipoCambio: '3.465',
    codigoCliente: '',
    tipo: '',
    tipoComprobante: 'FACTURA ELECTRÓNICA',
    serie: '',
    numero: '',
    ordenVenta: '',
    fechaEmision: '2025-10-07',
    fechaVencimiento: '2025-10-07',
    moneda: 'Soles',
    cliente: '',
    cotizacion: '',
    creadoPor: '',
    aprobadoPor: '',
    observacion: '',
    productos: []
  });

  const [clientes, setClientes] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [mostrarSelectorProductos, setMostrarSelectorProductos] = useState(false);

  const agregarProducto = () => {
    setFormData({
      ...formData,
      productos: [...formData.productos, { productoId: null, descripcion: '', cantidad: '', precio: '', subtotal: 0 }]
    });
  };

  const eliminarProducto = (index) => {
    const nuevosProductos = formData.productos.filter((_, i) => i !== index);
    setFormData({ ...formData, productos: nuevosProductos });
  };

  // Función única para auto-asignar productoId
  const autoAsignarProductoId = async (index, valorDescripcion) => {
    try {
      if (!valorDescripcion || valorDescripcion.length < 2) return;
      
      // Si la descripción viene con código y nombre "COD - Nombre", tomar la parte del nombre
      const partes = valorDescripcion.split(' - ');
      const nombreLimpio = partes.length > 1 ? partes.slice(1).join(' - ') : valorDescripcion;

      const res = await obtenerProductos({ nombre: nombreLimpio });
      const lista = res.productos || res.data || [];
      
      if (lista.length > 0) {
        setFormData((prev) => {
          const nuevos = [...prev.productos];
          nuevos[index] = { 
            ...nuevos[index], 
            productoId: lista[0].id,
            descripcion: lista[0].nombre || lista[0].descripcion || valorDescripcion
          };
          return { ...prev, productos: nuevos };
        });
      }
    } catch (err) {
      // Silenciar errores de autocompletado; se validará en el envío
      console.debug('autoAsignarProductoId: no se pudo resolver producto', err);
    }
  };

  const handleProductoChange = (index, field, value) => {
    const nuevosProductos = [...formData.productos];
    nuevosProductos[index][field] = value;
    
    if (field === 'cantidad' || field === 'precio') {
      const cantidad = parseFloat(nuevosProductos[index].cantidad) || 0;
      const precio = parseFloat(nuevosProductos[index].precio) || 0;
      nuevosProductos[index].subtotal = cantidad * precio;
    }

    // Intentar asociar el producto por descripción
    if (field === 'descripcion') {
      autoAsignarProductoId(index, value);
    }
    
    setFormData({ ...formData, productos: nuevosProductos });
  };

  const cargarProveedores = async () => {
    try {
      const resp = await obtenerProveedores();
      const lista = resp.proveedores || resp.data || [];
      setProveedores(lista);
    } catch (e) {
      console.error('Error cargando proveedores', e);
    }
  };

  const cargarClientes = async () => {
    try {
      const resp = await obtenerClientes();
      const lista = resp.clientes || resp.data || [];
      setClientes(lista);
    } catch (e) {
      console.error('Error cargando clientes', e);
    }
  };

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      setError(null);
      const filtros = {};
      if (filtroFecha) {
        filtros.fechaInicio = filtroFecha;
        filtros.fechaFin = filtroFecha;
      }
      const resp = await obtenerCompras(filtros);
      const compras = resp.compras || [];
      const mapeadas = compras.map((c) => ({
        id: c.id,
        fechaEmision: c.fechaCompra || '',
        fechaVencimiento: c.fechaVencimiento || '',
        proveedor: c.Proveedor?.nombre || '',
        tipo: c.tipoComprobante || '',
        ordenCompra: c.numeroComprobante || c.id,
        codCliente: '',
        ordenVenta: '',
        moneda: c.moneda || '',
        totalGravado: (parseFloat(c.subtotal || 0)).toFixed(2),
        totalIgv: (parseFloat(c.igv || 0)).toFixed(2),
        total: (parseFloat(c.total || 0)).toFixed(2)
      }));
      setOrdenes(mapeadas);
    } catch (e) {
      console.error('Error al cargar órdenes', e);
      setError('No se pudieron cargar las órdenes de compra');
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
    cargarOrdenes();
    cargarClientes();
  }, []);

  useEffect(() => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        setUsuarioActual(usuario);
        setFormData(prev => ({
          ...prev,
          creadoPor: usuario?.id || '',
          aprobadoPor: usuario?.id || ''
        }));
      }
    } catch (e) {
      console.error('No se pudo obtener el usuario actual', e);
    }
  }, []);

  const handleBuscar = () => {
    cargarOrdenes();
  };

  const handleEditar = async (id) => {
    try {
      const resp = await obtenerCompraPorId(id);
      const compra = resp.compra || {};
      const productos = (compra.DetalleCompras || compra.detalles || []).map((d) => ({
        productoId: d.productoId || d.Producto?.id || null,
        descripcion: d.Producto?.nombre || d.descripcion || '',
        cantidad: d.cantidad || d.cantidadComprada || 0,
        precio: d.precioUnitario || d.precio || 0,
        subtotal: (parseFloat(d.cantidad || d.cantidadComprada || 0) * parseFloat(d.precioUnitario || d.precio || 0))
      }));
      setFormData({
        proveedor: compra.proveedorId || compra.Proveedor?.id || '',
        formaPago: '',
        tipoCambio: compra.tipoCambio || '3.465',
        codigoCliente: '',
        tipo: '',
        tipoComprobante: compra.tipoComprobante || 'FACTURA ELECTRÓNICA',
        serie: compra.serieComprobante || compra.serie || '',
        numero: compra.numeroComprobante || compra.numero || '',
        ordenVenta: '',
        fechaEmision: compra.fechaCompra || '',
        fechaVencimiento: compra.fechaVencimiento || '',
        moneda: compra.moneda || 'Soles',
        cliente: '',
        cotizacion: '',
        creadoPor: usuarioActual?.id || '',
        aprobadoPor: usuarioActual?.id || '',
        observacion: compra.observaciones || '',
        productos
      });
      setEditandoId(id);
      setShowModal(true);
    } catch (e) {
      console.error('Error al cargar compra para edición', e);
      alert('No se pudo cargar la compra para editar.');
    }
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Eliminar esta orden de compra?');
    if (!confirmar) return;
    try {
      await eliminarCompra(id);
      await cargarOrdenes();
    } catch (e) {
      console.error('Error eliminando compra', e);
      alert('No se pudo eliminar la compra.');
    }
  };

  // Filtrado local por término de búsqueda
  const ordenesFiltradas = ordenes.filter((o) => {
    if (!filtroTermino) return true;
    const term = filtroTermino.toLowerCase();
    return (
      String(o.proveedor || '').toLowerCase().includes(term) ||
      String(o.ordenCompra || '').toLowerCase().includes(term) ||
      String(o.moneda || '').toLowerCase().includes(term)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Resolver productoId faltantes por descripción antes de armar detalles
      const productosConId = await Promise.all((formData.productos || []).map(async (p) => {
        let productoId = p.productoId;
        let descripcion = p.descripcion;
        
        if (!productoId && descripcion && descripcion.length > 1) {
          try {
            // Intentar con nombre limpio (soporta cadenas "COD - Nombre")
            const partes = descripcion.split(' - ');
            const nombreLimpio = partes.length > 1 ? partes.slice(1).join(' - ') : descripcion;
            const res = await obtenerProductos({ nombre: nombreLimpio });
            const lista = res.productos || res.data || [];
            if (lista.length > 0) {
              productoId = lista[0].id;
            }
          } catch (err) {
            // Ignorar error y dejar productoId como está
          }
        }
        
        return {
          ...p,
          productoId
        };
      }));

      // Validación estricta de líneas
      const erroresLineas = [];
      productosConId.forEach((p, idx) => {
        if (!p.productoId) {
          erroresLineas.push(`Línea ${idx + 1}: producto no seleccionado`);
        }
        const cantidad = parseFloat(p.cantidad);
        const precio = parseFloat(p.precio);
        if (!cantidad || cantidad <= 0) {
          erroresLineas.push(`Línea ${idx + 1}: cantidad inválida`);
        }
        if (!precio || precio <= 0) {
          erroresLineas.push(`Línea ${idx + 1}: precio inválido`);
        }
      });
      
      if (erroresLineas.length > 0) {
        alert('Corregir antes de generar:\n' + erroresLineas.join('\n'));
        return;
      }

      const detalles = productosConId.map(p => ({
        productoId: p.productoId,
        cantidad: parseFloat(p.cantidad) || 0,
        precioUnitario: parseFloat(p.precio) || 0,
        subtotal: (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio) || 0)
      }));
      
      const subtotal = detalles.reduce((s, d) => s + (d.cantidad * d.precioUnitario), 0);
      const igv = subtotal * 0.18;
      const total = subtotal + igv;

      const payload = {
        proveedorId: formData.proveedor ? parseInt(formData.proveedor) : null,
        tipoComprobante: formData.tipoComprobante,
        serie: formData.serie || undefined,
        numero: formData.numero || undefined,
        fechaEmision: formData.fechaEmision,
        fechaVencimiento: formData.fechaVencimiento,
        moneda: formData.moneda,
        tipoCambio: parseFloat(formData.tipoCambio) || 3.465,
        observaciones: formData.observacion,
        sucursalId: usuarioActual?.sucursalId ? parseInt(usuarioActual.sucursalId) : undefined,
        detalles,
        subtotal,
        igv,
        total
      };

      if (editandoId) {
        await actualizarCompra(editandoId, payload);
      } else {
        await crearCompra(payload);
      }

      setShowModal(false);
      setEditandoId(null);
      await cargarOrdenes();
      setFormData({
        proveedor: '',
        formaPago: '',
        tipoCambio: '3.465',
        codigoCliente: '',
        tipo: '',
        tipoComprobante: 'FACTURA ELECTRÓNICA',
        serie: '',
        numero: '',
        ordenVenta: '',
        fechaEmision: '2025-10-07',
        fechaVencimiento: '2025-10-07',
        moneda: 'Soles',
        cliente: '',
        cotizacion: '',
        creadoPor: usuarioActual?.id || '',
        aprobadoPor: usuarioActual?.id || '',
        observacion: '',
        productos: []
      });
    } catch (e) {
      console.error('Error al guardar compra', e);
      alert('No se pudo guardar la compra.');
    }
  };

  const abrirSelectorProductos = () => setMostrarSelectorProductos(true);
  const cerrarSelectorProductos = () => setMostrarSelectorProductos(false);
  
  const onProductoSeleccionado = (productoSeleccionado) => {
    if (!productoSeleccionado) return;
    const precioBase = parseFloat(
      productoSeleccionado?.precioCompra ??
      productoSeleccionado?.precioVenta ??
      0
    );
    const nuevaLinea = {
      productoId: productoSeleccionado.id,
      descripcion: productoSeleccionado.nombre || productoSeleccionado.descripcion || '',
      cantidad: 1,
      precio: isNaN(precioBase) ? 0 : precioBase,
      subtotal: isNaN(precioBase) ? 0 : precioBase,
    };
    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, nuevaLinea]
    }));
    setMostrarSelectorProductos(false);
  };

  const resetForm = () => {
    setFormData({
      proveedor: '',
      formaPago: '',
      tipoCambio: '3.465',
      codigoCliente: '',
      tipo: '',
      tipoComprobante: 'FACTURA ELECTRÓNICA',
      serie: '',
      numero: '',
      ordenVenta: '',
      fechaEmision: '2025-10-07',
      fechaVencimiento: '2025-10-07',
      moneda: 'Soles',
      cliente: '',
      cotizacion: '',
      creadoPor: usuarioActual?.id || '',
      aprobadoPor: usuarioActual?.id || '',
      observacion: '',
      productos: []
    });
    setEditandoId(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="ordenes-compra-container">
      <div className="ordenes-compra-header">
        <div className="ordenes-compra-title">
          <span className="ordenes-compra-icon">🛒</span>
          <h1>ÓRDENES DE COMPRA</h1>
        </div>
        <button 
          className="ordenes-compra-btn-nuevo" 
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          ⊕ Nuevo
        </button>
      </div>

      <div className="ordenes-compra-filters">
        <input 
          type="date" 
          className="ordenes-compra-date-input"
          placeholder="Fecha de emisión"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
        />
        <input 
          type="text" 
          className="ordenes-compra-search-input"
          placeholder="🔍 Buscar"
          value={filtroTermino}
          onChange={(e) => setFiltroTermino(e.target.value)}
        />
        <button className="ordenes-compra-btn-buscar" onClick={handleBuscar}>🔍 Buscar</button>
      </div>

      <div className="ordenes-compra-table-wrapper">
        <table className="ordenes-compra-table">
          <thead>
            <tr>
              <th>#</th>
              <th>F. Emisión</th>
              <th>F. Vencimiento</th>
              <th>Proveedor</th>
              <th>Tipo</th>
              <th>O. Compra</th>
              <th>Cod. Cliente</th>
              <th>O. Venta</th>
              <th>Moneda</th>
              <th>T.Gravado</th>
              <th>T.Igv</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="13" className="ordenes-compra-loading">
                  Cargando...
                </td>
              </tr>
            ) : ordenesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="13" className="ordenes-compra-empty">
                  {error ? error : 'Total 0'}
                </td>
              </tr>
            ) : (
              ordenesFiltradas.map((orden, index) => (
                <tr key={orden.id || index}>
                  <td>{index + 1}</td>
                  <td>{orden.fechaEmision}</td>
                  <td>{orden.fechaVencimiento}</td>
                  <td>{orden.proveedor}</td>
                  <td>{orden.tipo}</td>
                  <td>{orden.ordenCompra}</td>
                  <td>{orden.codCliente}</td>
                  <td>{orden.ordenVenta}</td>
                  <td>{orden.moneda}</td>
                  <td>{orden.totalGravado}</td>
                  <td>{orden.totalIgv}</td>
                  <td>{orden.total}</td>
                  <td>
                    <button type="button" onClick={() => handleEditar(orden.id)}>✏️ Editar</button>
                    <button type="button" onClick={() => handleEliminar(orden.id)} className="ordenes-compra-btn-delete" style={{ marginLeft: 8 }}>🗑️ Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="ordenes-compra-pagination">
          <button className="ordenes-compra-page-btn">‹</button>
          <button className="ordenes-compra-page-btn ordenes-compra-active">1</button>
          <button className="ordenes-compra-page-btn">›</button>
        </div>
      </div>

      {showModal && (
        <div className="ordenes-compra-modal-overlay" onClick={handleCloseModal}>
          <div className="ordenes-compra-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ordenes-compra-modal-header">
              <div className="ordenes-compra-modal-logo">
                <div className="ordenes-compra-logo-circle">🏢</div>
                <div className="ordenes-compra-modal-info">
                  <h2>{editandoId ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}</h2>
                </div>
              </div>
              <button 
                className="ordenes-compra-modal-close"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="ordenes-compra-modal-body">
              <div className="ordenes-compra-form-section">
                <div className="ordenes-compra-form-row-3">
                  <div className="ordenes-compra-form-group">
                    <label>Proveedor</label>
                    <select 
                      value={formData.proveedor}
                      onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                      className="ordenes-compra-select"
                      required
                    >
                      <option value="">Seleccionar</option>
                      {proveedores.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ordenes-compra-form-group">
                    <label>Fec Emisión</label>
                    <input 
                      type="date"
                      value={formData.fechaEmision}
                      onChange={(e) => setFormData({...formData, fechaEmision: e.target.value})}
                      className="ordenes-compra-input"
                      required
                    />
                  </div>

                  <div className="ordenes-compra-form-group">
                    <label>Fec. Vencimiento</label>
                    <input 
                      type="date"
                      value={formData.fechaVencimiento}
                      onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})}
                      className="ordenes-compra-input"
                      required
                    />
                  </div>

                  <div className="ordenes-compra-form-group">
                    <label>Moneda</label>
                    <select 
                      value={formData.moneda}
                      onChange={(e) => setFormData({...formData, moneda: e.target.value})}
                      className="ordenes-compra-select"
                    >
                      <option value="Soles">Soles</option>
                      <option value="Dólares">Dólares</option>
                    </select>
                  </div>
                </div>
                <div className="ordenes-compra-form-row-3">
                  <div className="ordenes-compra-form-group">
                    <label>Tipo de comprobante</label>
                    <select 
                      value={formData.tipoComprobante}
                      onChange={(e) => setFormData({...formData, tipoComprobante: e.target.value})}
                      className="ordenes-compra-select"
                      required
                    >
                      <option value="FACTURA ELECTRÓNICA">FACTURA ELECTRÓNICA</option>
                      <option value="BOLETA DE VENTA ELECTRONICA">BOLETA DE VENTA ELECTRONICA</option>
                      <option value="NOTA DE CREDITO">NOTA DE CREDITO</option>
                      <option value="NOTA DE DEBITO">NOTA DE DEBITO</option>
                      <option value="GUÍA">GUÍA</option>
                      <option value="NOTA DE VENTA">NOTA DE VENTA</option>
                      <option value="RECIBO POR HONORARIOS">RECIBO POR HONORARIOS</option>
                      <option value="SERVICIOS PÚBLICOS">SERVICIOS PÚBLICOS</option>
                    </select>
                  </div>
                  <div className="ordenes-compra-form-group">
                    <label>Serie</label>
                    <input 
                      type="text"
                      value={formData.serie}
                      onChange={(e) => setFormData({...formData, serie: e.target.value})}
                      className="ordenes-compra-input"
                      placeholder="Ej. F001"
                    />
                  </div>
                  <div className="ordenes-compra-form-group">
                    <label>Número</label>
                    <input 
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData({...formData, numero: e.target.value})}
                      className="ordenes-compra-input"
                      placeholder="Ej. 00012345"
                    />
                  </div>
                </div>

                <div className="ordenes-compra-form-row-2">
                  <div className="ordenes-compra-form-group">
                    <label>Forma de pago</label>
                    <select 
                      value={formData.formaPago}
                      onChange={(e) => setFormData({...formData, formaPago: e.target.value})}
                      className="ordenes-compra-select"
                    >
                      <option value="">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Credito">Crédito</option>
                    </select>
                  </div>

                  <div className="ordenes-compra-form-group">
                    <label>
                      Tipo de cambio <span className="ordenes-compra-info-icon">ⓘ</span>
                    </label>
                    <input 
                      type="number"
                      step="0.001"
                      value={formData.tipoCambio}
                      onChange={(e) => setFormData({...formData, tipoCambio: e.target.value})}
                      className="ordenes-compra-input"
                    />
                  </div>

                  <div className="ordenes-compra-form-group">
                    <label>Código de cliente</label>
                    <input 
                      type="text"
                      value={formData.codigoCliente}
                      onChange={(e) => setFormData({...formData, codigoCliente: e.target.value})}
                      className="ordenes-compra-input"
                    />
                  </div>

                  <div className="ordenes-compra-form-group">
                    <label>Tipo</label>
                    <select 
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      className="ordenes-compra-select"
                    >
                      <option value="">Bienes</option>
                      <option value="Servicios">Servicios</option>
                    </select>
                  </div>

                  <div className="ordenes-compra-form-group">
                    <label>O. Venta</label>
                    <input 
                      type="text"
                      value={formData.ordenVenta}
                      onChange={(e) => setFormData({...formData, ordenVenta: e.target.value})}
                      className="ordenes-compra-input"
                    />
                  </div>
                </div>

                <div className="ordenes-compra-form-row-2">
                  <div className="ordenes-compra-form-group">
                    <label>Cliente</label>
                    <input 
                      type="text"
                      value={formData.cliente}
                      onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                      className="ordenes-compra-input"
                      placeholder="Escriba el nombre o número de documento del cliente"
                      list="clientes-list"
                    />
                    <datalist id="clientes-list">
                      {clientes?.map((c) => (
                        <option key={c.id} value={`${c.nombre}${c.numeroDocumento ? ` (${c.numeroDocumento})` : ''}`} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="ordenes-compra-form-row-2">
                  <div className="ordenes-compra-form-group">
                    <label>Creado por</label>
                    <select 
                      value={formData.creadoPor}
                      onChange={(e) => setFormData({...formData, creadoPor: e.target.value})}
                      className="ordenes-compra-select"
                    >
                      <option value="">Seleccionar</option>
                      {usuarioActual && (
                        <option value={usuarioActual.id}>
                          {usuarioActual.nombre} {usuarioActual.apellido}
                        </option>
                      )}
                    </select>
                  </div>

                  <div className="ordenes-compra-form-group">
                    <label>Aprobado por</label>
                    <select 
                      value={formData.aprobadoPor}
                      onChange={(e) => setFormData({...formData, aprobadoPor: e.target.value})}
                      className="ordenes-compra-select"
                    >
                      <option value="">Seleccionar</option>
                      {usuarioActual && (
                        <option value={usuarioActual.id}>
                          {usuarioActual.nombre} {usuarioActual.apellido}
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="ordenes-compra-form-group">
                  <label>Observación</label>
                  <div className="ordenes-compra-editor-toolbar">
                    <button type="button" className="ordenes-compra-editor-btn"><strong>B</strong></button>
                    <button type="button" className="ordenes-compra-editor-btn"><em>I</em></button>
                    <button type="button" className="ordenes-compra-editor-btn">🔗</button>
                    <button type="button" className="ordenes-compra-editor-btn">≡</button>
                    <button type="button" className="ordenes-compra-editor-btn">#</button>
                    <button type="button" className="ordenes-compra-editor-btn">⋮</button>
                    <button type="button" className="ordenes-compra-editor-btn">""</button>
                    <button type="button" className="ordenes-compra-editor-btn">↶</button>
                    <button type="button" className="ordenes-compra-editor-btn">↷</button>
                  </div>
                  <textarea 
                    value={formData.observacion}
                    onChange={(e) => setFormData({...formData, observacion: e.target.value})}
                    className="ordenes-compra-textarea"
                    rows="4"
                  />
                </div>
              </div>

              <div className="ordenes-compra-productos-section">
                {formData.productos.length > 0 && (
                  <table className="ordenes-compra-productos-table">
                    <thead>
                      <tr>
                        <th>Acción</th>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.productos.map((producto, index) => (
                        <tr key={index}>
                          <td>
                            <button 
                              type="button"
                              onClick={() => eliminarProducto(index)}
                              className="ordenes-compra-btn-delete"
                            >
                              🗑️
                            </button>
                          </td>
                          <td>
                            <input 
                              type="text"
                              value={producto.descripcion}
                              onChange={(e) => handleProductoChange(index, 'descripcion', e.target.value)}
                              className="ordenes-compra-input-table"
                              placeholder="Descripción del producto"
                            />
                          </td>
                          <td>
                            <input 
                              type="number"
                              min="0"
                              step="1"
                              value={producto.cantidad}
                              onChange={(e) => handleProductoChange(index, 'cantidad', e.target.value)}
                              className="ordenes-compra-input-table"
                            />
                          </td>
                          <td>
                            <input 
                              type="number"
                              min="0"
                              step="0.01"
                              value={producto.precio}
                              onChange={(e) => handleProductoChange(index, 'precio', e.target.value)}
                              className="ordenes-compra-input-table"
                            />
                          </td>
                          <td>
                            <input 
                              type="number"
                              value={producto.subtotal.toFixed(2)}
                              readOnly
                              className="ordenes-compra-input-table ordenes-compra-readonly"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                
                <div className="ordenes-compra-productos-buttons">
                  <button 
                    type="button"
                    onClick={abrirSelectorProductos}
                    className="ordenes-compra-btn-agregar"
                  >
                    + Agregar Producto desde Lista
                  </button>
                  
                </div>
              </div>

              {mostrarSelectorProductos && (
                <div className="ordenes-compra-modal-overlay">
                  <div className="ordenes-compra-modal productos-modal">
                    <div className="ordenes-compra-modal-header">
                      <h2>Seleccionar producto</h2>
                      <button type="button" className="ordenes-compra-btn-cerrar" onClick={cerrarSelectorProductos}>×</button>
                    </div>
                    <div className="ordenes-compra-modal-body">
                      <ProductoDetalle onProductoSeleccionado={onProductoSeleccionado} />
                    </div>
                  </div>
                </div>
              )}

              <div className="ordenes-compra-modal-footer">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="ordenes-compra-btn-cancelar"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="ordenes-compra-btn-generar"
                >
                  {editandoId ? 'Actualizar' : 'Generar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesCompra;