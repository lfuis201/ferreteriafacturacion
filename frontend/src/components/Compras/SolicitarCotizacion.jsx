import React, { useEffect, useState } from 'react';
import { obtenerCotizaciones, eliminarCotizacion, cambiarEstadoCotizacion, crearCotizacion, actualizarCotizacion, obtenerCotizacionPorId } from '../../services/cotizacionService';
import { obtenerClientes } from '../../services/clienteService';
import FormularioVentaProductServicio from './FormularioVentaProductServicio';
import '../../styles/SolicitarCotizacion.css';

const SolicitarCotizacion = () => {
  const [showModal, setShowModal] = useState(false);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [clientes, setClientes] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [mostrarSelectorProducto, setMostrarSelectorProducto] = useState(false);
  const [editCotizacionId, setEditCotizacionId] = useState(null);
  const [formData, setFormData] = useState({
    proveedor: '',
    correo: '',
    productos: []
  });

  const agregarProducto = () => {
    setFormData({
      ...formData,
      productos: [...formData.productos, { descripcion: '', unidad: '', cantidad: '' }]
    });
  };

  const eliminarProducto = (index) => {
    const nuevosProductos = formData.productos.filter((_, i) => i !== index);
    setFormData({ ...formData, productos: nuevosProductos });
  };

  const handleProductoChange = (index, field, value) => {
    const nuevosProductos = [...formData.productos];
    nuevosProductos[index][field] = value;
    setFormData({ ...formData, productos: nuevosProductos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!formData.clienteId) {
        setError('Debe seleccionar un cliente');
        return;
      }
      if (!formData.fechaEmision) {
        setError('Debe seleccionar fecha de emisión');
        return;
      }
      if (!formData.productos || formData.productos.length === 0) {
        setError('Debe agregar al menos un producto');
        return;
      }

      const totalGravado = formData.productos.reduce((sum, p) => sum + ((p.precioVenta || 0) * (p.cantidad || 1)), 0);
      const igv = totalGravado * 0.18;
      const total = totalGravado + igv;

      const payload = {
        clienteId: formData.clienteId,
        fechaEmision: formData.fechaEmision,
        fechaEntrega: null,
        tiempoValidez: '',
        tiempoEntrega: '',
        direccionEnvio: '',
        terminoPago: '',
        numeroCuenta: '',
        registradoPor: usuarioActual?.nombre || 'Admin',
        vendedor: usuarioActual?.nombre || 'Vendedor',
        cliente: '',
        comprobantes: '0',
        notasDeVenta: '0',
        pedido: '',
        oportunidadVenta: '',
        infReferencial: '',
        contrato: '',
        tipoCambio: '3.85',
        moneda: 'SOL',
        tExportacion: 0.00,
        tGratuito: 0.00,
        tInafecta: 0.00,
        tExonerado: 0.00,
        tGravado: totalGravado,
        subtotal: totalGravado,
        igv,
        total,
        observacion: '',
        validezDias: 15,
        productos: formData.productos,
        pagos: [],
        detalles: formData.productos.map(p => ({
          productoId: p.id,
          cantidad: p.cantidad || 1,
          precioUnitario: p.precioVenta || 0,
          subtotal: (p.cantidad || 1) * (p.precioVenta || 0),
          descripcion: p.nombre || p.descripcion || ''
        }))
      };

      if (editCotizacionId) {
        await actualizarCotizacion(editCotizacionId, payload);
      } else {
        await crearCotizacion(payload);
      }

      setShowModal(false);
      setFormData({ proveedor: '', correo: '', productos: [], clienteId: '', fechaEmision: '' });
      setEditCotizacionId(null);
      cargarCotizaciones({ fechaInicio: fechaFiltro || undefined });
    } catch (err) {
      console.error('Error al guardar cotización:', err);
      setError(err.message || 'No se pudo guardar la cotización');
    }
  };

  const abrirSelectorProducto = () => setMostrarSelectorProducto(true);
  const cerrarSelectorProducto = () => setMostrarSelectorProducto(false);
  const handleProductoSeleccionado = (producto) => {
    const nuevo = {
      id: producto.id,
      nombre: producto.nombre,
      precioVenta: producto.precioVenta || producto.precio || 0,
      unidad: producto.unidadMedida || 'Unidad',
      cantidad: 1,
      descripcion: producto.nombre
    };
    setFormData(prev => ({ ...prev, productos: [...prev.productos, nuevo] }));
    cerrarSelectorProducto();
  };

  // Cargar cotizaciones reales desde el backend
  const cargarCotizaciones = async (filtros = {}) => {
    try {
      setLoading(true);
      setError('');

      // Incluir sucursal del usuario si existe en localStorage
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado) {
        try {
          const usuario = JSON.parse(usuarioGuardado);
          if (usuario.sucursalId) {
            filtros.sucursalId = usuario.sucursalId;
          }
        } catch (err) {
          console.error('Error al parsear usuario del localStorage:', err);
        }
      }

      const data = await obtenerCotizaciones(filtros);
      const lista = data?.cotizaciones || [];

      // Mapear a formato de tabla actual sin cambiar estilos
      const formateadas = lista.map((c) => ({
        id: c.id,
        fechaEmision: c.fechaEmision || c.fecha || '-',
        estado: c.estado || '-',
        documento: c.numeroReferencia || c.id,
      
        acciones: '—'
      }));

      setCotizaciones(formateadas);
    } catch (err) {
      console.error('Error al cargar cotizaciones:', err);
      setError(err.message || 'Error al cargar cotizaciones');
      setCotizaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try { setUsuarioActual(JSON.parse(usuarioGuardado)); } catch {}
    }
    const cargarClientesAsync = async () => {
      try {
        const data = await obtenerClientes();
        const lista = data?.clientes || data?.data || data || [];
        setClientes(lista);
      } catch (err) {
        console.error('Error al cargar clientes:', err);
      }
    };
    cargarClientesAsync();
    cargarCotizaciones();
  }, []);

  const handleBuscar = () => {
    const filtros = {};
    if (fechaFiltro) filtros.fechaInicio = fechaFiltro;
    cargarCotizaciones(filtros);
  };

  const handleEliminar = async (id) => {
    try {
      await eliminarCotizacion(id);
      cargarCotizaciones({ fechaInicio: fechaFiltro || undefined });
    } catch (err) {
      console.error('Error al eliminar cotización:', err);
      setError(err.message || 'No se pudo eliminar la cotización');
    }
  };

 

  const handleEditar = async (id) => {
    try {
      const data = await obtenerCotizacionPorId(id);
      const c = data?.cotizacion;
      if (!c) return;
      setFormData({
        proveedor: '',
        correo: '',
        clienteId: c.clienteId,
        fechaEmision: c.fechaEmision || c.fecha || '',
        productos: (c.DetalleCotizacions || c.detalles || []).map(d => ({
          id: d.productoId,
          nombre: d.Producto?.nombre || d.descripcion || '',
          precioVenta: d.precioUnitario || 0,
          unidad: d.Producto?.unidadMedida || 'Unidad',
          cantidad: d.cantidad || 1,
          descripcion: d.descripcion || ''
        }))
      });
      setEditCotizacionId(id);
      setShowModal(true);
    } catch (err) {
      console.error('Error al cargar cotización para editar:', err);
      setError(err.message || 'No se pudo cargar la cotización');
    }
  };

  return (
    <div className="solicitar-cotizacion-container">
      <div className="solicitar-cotizacion-header">
        <div className="solicitar-cotizacion-title">
          <span className="solicitar-cotizacion-icon">📋</span>
          <h1>SOLICITAR COTIZACIÓN</h1>
        </div>
        <button className="solicitar-cotizacion-btn-nuevo" onClick={() => setShowModal(true)}>
          ⊕ Nuevo
        </button>
      </div>

      <div className="solicitar-cotizacion-filters">
        <input 
          type="date" 
          className="solicitar-cotizacion-date-input"
          placeholder="Fecha de emisión"
          value={fechaFiltro}
          onChange={(e) => setFechaFiltro(e.target.value)}
        />
        
        <button className="solicitar-cotizacion-btn-buscar" onClick={handleBuscar}>🔍 Buscar</button>
      </div>

      <div className="solicitar-cotizacion-table-wrapper">
        <table className="solicitar-cotizacion-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha Emisión</th>
              <th>Estado</th>
              <th>Documento</th>
          
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="solicitar-cotizacion-empty">Cargando…</td>
              </tr>
            ) : cotizaciones.length === 0 ? (
              <tr>
                <td colSpan="6" className="solicitar-cotizacion-empty">
                  Total 0
                </td>
              </tr>
            ) : (
              cotizaciones.map((cot, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{cot.fechaEmision}</td>
                  <td>{cot.estado}</td>
                  <td>{cot.documento}</td>
                 
                  <td>
                  
                    <button
                      className="solicitar-cotizacion-page-btn"
                      onClick={() => handleEditar(cot.id)}
                      style={{ marginLeft: 8 }}
                    >
                      Editar
                    </button>
                    <button
                      className="solicitar-cotizacion-page-btn"
                      onClick={() => handleEliminar(cot.id)}
                      style={{ marginLeft: 8 }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="solicitar-cotizacion-pagination">
          <button className="solicitar-cotizacion-page-btn">‹</button>
          <button className="solicitar-cotizacion-page-btn solicitar-cotizacion-active">1</button>
          <button className="solicitar-cotizacion-page-btn">›</button>
        </div>
      </div>

      {showModal && (
        <div className="solicitar-cotizacion-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="solicitar-cotizacion-modal" onClick={(e) => e.stopPropagation()}>
            <div className="solicitar-cotizacion-modal-header">
              <div className="solicitar-cotizacion-modal-logo">
                <div className="solicitar-cotizacion-logo-circle">🏢</div>
                <div className="solicitar-cotizacion-modal-info">
                  <h2>COTIZACIÓN</h2>
                 
                </div>
              </div>
              <button 
                className="solicitar-cotizacion-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="solicitar-cotizacion-modal-body">
              <div className="solicitar-cotizacion-form-row">
                <div className="solicitar-cotizacion-form-group">
                  <label>Cliente</label>
                  <select 
                    value={formData.clienteId || ''}
                    onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                    className="solicitar-cotizacion-select"
                  >
                    <option value="">Seleccionar</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre || c.razonSocial || c.numeroDocumento}</option>
                    ))}
                  </select>
                </div>

                <div className="solicitar-cotizacion-form-group">
                  <label>
                    Correo electrónico
                  
                  </label>
                  <input 
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({...formData, correo: e.target.value})}
                    className="solicitar-cotizacion-input"
                  />
                </div>

                <div className="solicitar-cotizacion-form-group">
                  <label>Fec. Emisión</label>
                  <input 
                    type="date"
                    value={formData.fechaEmision || ''}
                    onChange={(e) => setFormData({ ...formData, fechaEmision: e.target.value })}
                    className="solicitar-cotizacion-input"
                  />
                </div>
              </div>

              <div className="solicitar-cotizacion-table-section">
                <table className="solicitar-cotizacion-productos-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Descripción</th>
                      <th>Unidad</th>
                      <th>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.productos.map((producto, index) => (
                      <tr key={index}>
                        <td>
                          <button 
                            type="button"
                            onClick={() => eliminarProducto(index)}
                            className="solicitar-cotizacion-btn-delete"
                          >
                            🗑️
                          </button>
                        </td>
                        <td>
                          <input 
                            type="text"
                            value={producto.descripcion}
                            onChange={(e) => handleProductoChange(index, 'descripcion', e.target.value)}
                            className="solicitar-cotizacion-input-table"
                          />
                        </td>
                        <td>
                          <input 
                            type="text"
                            value={producto.unidad}
                            onChange={(e) => handleProductoChange(index, 'unidad', e.target.value)}
                            className="solicitar-cotizacion-input-table"
                          />
                        </td>
                        <td>
                          <input 
                            type="number"
                            value={producto.cantidad}
                            onChange={(e) => handleProductoChange(index, 'cantidad', e.target.value)}
                            className="solicitar-cotizacion-input-table"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div style={{ display: 'flex', gap: 8 }}>
               
                  <button 
                    type="button"
                    onClick={abrirSelectorProducto}
                    className="solicitar-cotizacion-btn-agregar"
                  >
                    + Agregar Producto
                  </button>
                </div>
              </div>

              <div className="solicitar-cotizacion-modal-footer">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="solicitar-cotizacion-btn-cancelar"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="solicitar-cotizacion-btn-guardar"
                >
                  Guardar
                </button>
              </div>
            </form>
            {mostrarSelectorProducto && (
              <div className="solicitar-cotizacion-modal-overlay" onClick={cerrarSelectorProducto}>
                <div className="solicitar-cotizacion-modal" onClick={(e) => e.stopPropagation()}>
                  <FormularioVentaProductServicio onProductoSeleccionado={handleProductoSeleccionado} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitarCotizacion;