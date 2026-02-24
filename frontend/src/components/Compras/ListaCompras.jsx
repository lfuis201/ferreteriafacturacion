import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCompras, eliminarCompra, subirXmlCompra, obtenerCompraPorId } from '../../services/compraService';
import { obtenerProveedores } from '../../services/proveedorService';
import '../../styles/ListaCompras.css';

// Función auxiliar para formatear números de manera segura
const formatearNumero = (valor, decimales = 2) => {
  // Convertir a número si es string
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  // Verificar si es un número válido
  if (isNaN(numero) || numero === null || numero === undefined) {
    return '0.00';
  }
  
  // Formatear con decimales especificados
  return numero.toFixed(decimales);
};

const ListaCompras = () => {
  const navigate = useNavigate();
  const [modalPagos, setModalPagos] = useState(false);
  const [modalProductos, setModalProductos] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [archivoXml, setArchivoXml] = useState(null);
  const [cargandoImportacion, setCargandoImportacion] = useState(false);
  const [compras, setCompras] = useState([]);
  const [comprasFiltradas, setComprasFiltradas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    proveedor: '',
    estado: '',
    estadoPago: '',
    numero: ''
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros();
  }, [compras, filtros]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [comprasData, proveedoresData] = await Promise.all([
        obtenerCompras(),
        obtenerProveedores()
      ]);
      
      // Procesar y validar datos de compras
      const comprasArray = comprasData.compras || comprasData || [];
      const comprasProcesadas = comprasArray.map(compra => ({
        ...compra,
        total: parseFloat(compra.total) || 0,
        // Procesar pagos si existen
        pagos: compra.pagos ? compra.pagos.map(pago => ({
          ...pago,
          monto: parseFloat(pago.monto) || 0
        })) : [],
        // Procesar detalles si existen
        detalles: compra.detalles ? compra.detalles.map(detalle => ({
          ...detalle,
          precioUnitario: parseFloat(detalle.precioUnitario) || 0,
          cantidad: parseFloat(detalle.cantidad) || 0
        })) : []
      }));
      
      setCompras(comprasProcesadas);
      
      // Asegurar que proveedoresData sea un array
      const proveedoresArray = Array.isArray(proveedoresData) 
        ? proveedoresData 
        : (proveedoresData?.proveedores || []);
      setProveedores(proveedoresArray);
      
      setError(null);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar las compras');
      setCompras([]);
      setProveedores([]);
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...compras];

    // Filtro por búsqueda general
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(compra => {
        const proveedor = getProveedorNombre(compra.proveedorId).toLowerCase();
        const numero = compra.numeroComprobante?.toLowerCase() || '';
        const productos = compra.detalles?.map(d => d.producto?.nombre || '').join(' ').toLowerCase() || '';
        
        return proveedor.includes(busqueda) || 
               numero.includes(busqueda) || 
               productos.includes(busqueda);
      });
    }

    // Filtro por proveedor
    if (filtros.proveedor) {
      resultado = resultado.filter(compra => 
        compra.proveedorId === parseInt(filtros.proveedor)
      );
    }

    // Filtro por estado
    if (filtros.estado) {
      resultado = resultado.filter(compra => 
        compra.estado === filtros.estado
      );
    }

    // Filtro por estado de pago
    if (filtros.estadoPago) {
      resultado = resultado.filter(compra => {
        // Lógica para determinar estado de pago basado en pagos
        const totalPagado = compra.pagos?.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0) || 0;
        const total = parseFloat(compra.total || 0);
        
        if (filtros.estadoPago === 'Pagado') {
          return totalPagado >= total;
        } else if (filtros.estadoPago === 'Pendiente') {
          return totalPagado < total;
        }
        return true;
      });
    }

    // Filtro por número
    if (filtros.numero) {
      const numero = filtros.numero.toLowerCase();
      resultado = resultado.filter(compra => 
        compra.numeroComprobante?.toLowerCase().includes(numero)
      );
    }

    setComprasFiltradas(resultado);
  };

  const getProveedorNombre = (proveedorId) => {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    return proveedor ? proveedor.nombre : 'Proveedor no encontrado';
  };

  const getProveedorRuc = (proveedorId) => {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    return proveedor ? proveedor.ruc : '';
  };

  const getEstadoPago = (compra) => {
    const totalPagado = compra.pagos?.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0) || 0;
    const total = parseFloat(compra.total || 0);
    return totalPagado >= total ? 'Pagado' : 'Pendiente';
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      proveedor: '',
      estado: '',
      estadoPago: '',
      numero: ''
    });
  };

  if (cargando) {
    return (
      <div className="compras-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Cargando compras...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="compras-container">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          {error}
          <br />
          <button onClick={cargarDatos} style={{ marginTop: '1rem' }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }



  const abrirModalPagos = async (item) => {
    try {
      // Obtener los detalles completos de la compra
      const response = await obtenerCompraPorId(item.id);
      const compraCompleta = response.compra || response;
      setSelectedItem(compraCompleta);
      setModalPagos(true);
    } catch (error) {
      console.error('Error al obtener detalles de la compra:', error);
      setError('Error al cargar los pagos de la compra');
    }
  };

  const abrirModalProductos = async (item) => {
    try {
      // Obtener los detalles completos de la compra
      const response = await obtenerCompraPorId(item.id);
      const compraCompleta = response.compra || response;
      setSelectedItem(compraCompleta);
      setModalProductos(true);
    } catch (error) {
      console.error('Error al obtener detalles de la compra:', error);
      setError('Error al cargar los productos de la compra');
    }
  };

  const cerrarModales = () => {
    setModalPagos(false);
    setModalProductos(false);
    setModalImportar(false);
    setSelectedItem(null);
    setArchivoXml(null);
  };

  const abrirModalImportar = () => {
    setModalImportar(true);
  };

  const handleArchivoXmlChange = (event) => {
    const archivo = event.target.files[0];
    if (archivo && archivo.type === 'text/xml') {
      setArchivoXml(archivo);
    } else {
      alert('Por favor seleccione un archivo XML válido');
      event.target.value = '';
    }
  };

  const handleImportarXml = async () => {
    if (!archivoXml) {
      alert('Por favor seleccione un archivo XML');
      return;
    }

    try {
      setCargandoImportacion(true);
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('xmlFile', archivoXml);
      
      const resultado = await subirXmlCompra(formData);
      
      alert('XML importado exitosamente: ' + resultado.mensaje);
      
      // Recargar las compras para mostrar los cambios
      await cargarDatos();
      
      // Cerrar el modal
      cerrarModales();
    } catch (error) {
      console.error('Error al importar XML:', error);
      alert('Error al importar XML: ' + error.message);
    } finally {
      setCargandoImportacion(false);
    }
  };

  const handleEditarCompra = (compra) => {
    navigate(`/compras/editar/${compra.id}`);
  };

  const handleEliminarCompra = async (compra) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la compra ${compra.numeroComprobante}?`)) {
      try {
        await eliminarCompra(compra.id);
        alert('Compra eliminada exitosamente');
        // Recargar las compras para mostrar los cambios
        await cargarDatos();
      } catch (error) {
        console.error('Error al eliminar compra:', error);
        alert('Error al eliminar compra: ' + error.message);
      }
    }
  };

  return (
    <div className="compras-container">
      {/* Encabezado */}
      <div className="compras-header">
        <h2>COMPRAS</h2>
        <div className="header-actions">
          
          <button className="btn-importar" onClick={abrirModalImportar}>Importar</button>
        </div>
      </div>

      <div className="search-section">
       

        <div className="filtros-avanzados" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          <select 
            value={filtros.proveedor} 
            onChange={(e) => handleFiltroChange('proveedor', e.target.value)}
            style={{ padding: '5px' }}
          >
            <option value="">Todos los proveedores</option>
            {Array.isArray(proveedores) && proveedores.map(proveedor => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.nombre}
              </option>
            ))}
          </select>

          {/* <select 
            value={filtros.estado} 
            onChange={(e) => handleFiltroChange('estado', e.target.value)}
            style={{ padding: '5px' }}
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="COMPLETADA">Completada</option>

           
            
          </select>

          <select 
            value={filtros.estadoPago} 
            onChange={(e) => handleFiltroChange('estadoPago', e.target.value)}
            style={{ padding: '5px' }}
          >
            <option value="">Estado de pago</option>
            <option value="Pagado">Pagado</option>
            <option value="Pendiente">Pendiente</option>
          </select>*/}

           

           {/*
           
           <input 
            type="text" 
            placeholder="Número de comprobante"
            value={filtros.numero}
            onChange={(e) => handleFiltroChange('numero', e.target.value)}
            style={{ padding: '5px' }}
          />*/ }

          <button onClick={limpiarFiltros} style={{ padding: '5px 10px' }}>
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="compras-table">
          <thead>
            <tr>
              <th>#</th>
              <th>F. Emisión</th>
              <th>Proveedor</th>
              {/*<th>Estado</th>
              <th>Estado de pago</th>*/}
              <th>Número</th>
              <th>Productos</th>
            {/* <th>Pagos</th>*/}
              <th>Moneda</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comprasFiltradas.map((compra, index) => (
              <tr key={compra.id}>
                <td>{index + 1}</td>
                <td>{new Date(compra.fechaCompra).toLocaleDateString()}</td>
                <td>
                  <div className="proveedor-info">
                    <div className="proveedor-nombre">{getProveedorNombre(compra.proveedorId)}</div>
                    <div className="proveedor-ruc">{getProveedorRuc(compra.proveedorId)}</div>
                  </div>
                </td>
                


                {/*
                <td>
                  <span className="estado-badge estado-registrado">
                    {compra.estado}
                  </span>
                </td>

                <td>
                  <span className="estado-pago-badge estado-pagado">
                    {getEstadoPago(compra)}
                  </span>
                </td>*/ }

                <td>
                  <div className="numero-info">
                    <div className="numero">{compra.numeroComprobante}</div>
                    <div className="tipo">{compra.tipoComprobante}</div>
                  </div>
                </td>
                <td>
                  <button 
                    className="btn-icon-productos"
                    onClick={() => abrirModalProductos(compra)}
                  >
                    👁
                  </button>
                </td>

{/*
                <td>
                  <button 
                    className="btn-pagos"
                    onClick={() => abrirModalPagos(compra)}
                  >
                    Pagos
                  </button>
                </td>*/ }



                <td>{compra.moneda || 'PEN'}</td>
                <td className="total-amount">S/ {formatearNumero(compra.total)}</td>
                <td>
                  <div className="acciones">
                    <button 
                      className="btn-editar"
                      onClick={() => handleEditarCompra(compra)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-eliminar"
                      onClick={() => handleEliminarCompra(compra)}
                    >
                      Eliminar
                    </button>
                     {/*  <button className="btn-opciones">Opciones</button> */}

                   {/*  <button className="btn-copia">Copia</button> */}
                   

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>Mostrando {comprasFiltradas.length} de {compras.length} resultados</span>
        <div className="pagination-controls">
          <button disabled>Anterior</button>
          <button className="active">1</button>
          <button disabled>Siguiente</button>
        </div>
      </div>

      {/* Modal de Pagos */}
      {modalPagos && selectedItem && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal-pagos" onClick={e => e.stopPropagation()}>
            <div className="modal-header-pagos">
              <h3>Pagos de la compra: {selectedItem.numeroComprobante}</h3>
              <button className="modal-close" onClick={cerrarModales}>×</button>
            </div>
            <div className="modal-body-pagos">
              <table className="pagos-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha de pago</th>
                    <th>Método de pago</th>
                    <th>Destino</th>
                    <th>Referencia</th>
                    <th>Glosa</th>
                    <th>Archivo</th>
                    <th>Monto</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItem.PagoCompras && selectedItem.PagoCompras.length > 0 ? (
                    selectedItem.PagoCompras.map(pago => (
                      <tr key={pago.id}>
                        <td>{pago.id}</td>
                        <td>{new Date(pago.createdAt).toLocaleDateString()}</td>
                        <td>{pago.formaPago}</td>
                        <td>{pago.desde}</td>
                        <td>{pago.referencia || '-'}</td>
                        <td>{pago.glosa || '-'}</td>
                        <td>-</td>
                        <td>{formatearNumero(pago.monto)}</td>
                        <td>
                          <button className="btn-eliminar-pago">Eliminar</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" style={{textAlign: 'center'}}>No hay pagos registrados para esta compra.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="pagos-summary">
                <div className="summary-row">
                  <span>TOTAL PAGADO</span>
                  <span>{formatearNumero(selectedItem.PagoCompras?.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0))}</span>
                </div>
                <div className="summary-row">
                  <span>TOTAL A PAGAR</span>
                  <span>{formatearNumero(selectedItem.total)}</span>
                </div>
                <div className="summary-row">
                  <span>PENDIENTE DE PAGO</span>
                  <span>{formatearNumero(parseFloat(selectedItem.total || 0) - (selectedItem.PagoCompras?.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0) || 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Productos */}
      {modalProductos && selectedItem && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal-productos" onClick={e => e.stopPropagation()}>
            <div className="modal-header-productos">
              <h3>Productos de la Compra #{selectedItem.numeroComprobante}</h3>
              <button className="modal-close" onClick={cerrarModales}>×</button>
            </div>
            <div className="modal-body-productos">
              <table className="productos-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItem.DetalleCompras && selectedItem.DetalleCompras.length > 0 ? (
                    selectedItem.DetalleCompras.map((detalle, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="producto-nombre">{detalle.Producto?.nombre || 'Producto sin nombre'}</td>
                        <td>{detalle.cantidad}</td>
                        <td>S/ {formatearNumero(detalle.precioUnitario)}</td>
                        <td>S/ {formatearNumero(detalle.cantidad * (detalle.precioUnitario || 0))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{textAlign: 'center'}}>No hay productos registrados para esta compra.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Importar XML */}
      {modalImportar && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal-importar" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Importar XML de Compra</h3>
              <button className="modal-close" onClick={cerrarModales}>×</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="xmlFile">Archivo XML:</label>
                <input
                  type="file"
                  id="xmlFile"
                  accept=".xml"
                  onChange={handleArchivoXmlChange}
                  required
                />
                {archivoXml && (
                  <p className="archivo-seleccionado">
                    Archivo seleccionado: {archivoXml.name}
                  </p>
                )}
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-cancelar" 
                  onClick={cerrarModales}
                  disabled={cargandoImportacion}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-importar-xml" 
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
    </div>
  );
};

export default ListaCompras;