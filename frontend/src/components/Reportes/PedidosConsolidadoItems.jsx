import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, FileText, Calendar, Filter, Package, BarChart3 } from 'lucide-react'; 
import '../../styles/ReportePedidosConsolidadoItems.css';
import { listarPedidos } from '../../services/pedidoService';
import { obtenerProductos } from '../../services/productoService';

const PedidosConsolidadoItems = ({ onBack }) => {
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    producto: '',
    categoria: '',
    estado: ''
  });

  const [items, setItems] = useState([]);
  const [itemsFiltrados, setItemsFiltrados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const aplicarFiltros = () => {
    const prodTxt = filtros.producto.trim().toLowerCase();
    const catTxt = filtros.categoria.trim().toLowerCase();
    const estadoSel = filtros.estado; // completo | parcial | pendiente
    const filtrados = items.filter(it => {
      const okProd = prodTxt ? (it.producto?.toLowerCase().includes(prodTxt)) : true;
      const okCat = catTxt ? (it.categoria?.toLowerCase().includes(catTxt)) : true;
      let okEstado = true;
      if (estadoSel === 'completo') okEstado = it.porcentajeEntregado === 100;
      else if (estadoSel === 'parcial') okEstado = it.porcentajeEntregado > 0 && it.porcentajeEntregado < 100;
      else if (estadoSel === 'pendiente') okEstado = it.porcentajeEntregado === 0;
      return okProd && okCat && okEstado;
    });
    setItemsFiltrados(filtrados);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const exportarExcel = () => {
    console.log('Exportando consolidado de ítems a Excel...');
  };

  const cargarConsolidado = async () => {
    setCargando(true);
    setError('');
    try {
      const [respPedidos, respProductos] = await Promise.all([
        listarPedidos(),
        obtenerProductos({})
      ]);
      const pedidos = Array.isArray(respPedidos?.pedidos) ? respPedidos.pedidos : [];
      const productos = Array.isArray(respProductos?.productos) ? respProductos.productos : [];
      const prodMap = new Map();
      productos.forEach(pr => {
        prodMap.set(pr.id, {
          nombre: pr.nombre || '',
          codigo: pr.codigo || '',
          categoria: (pr.Categoria?.nombre) || pr.categoria || ''
        });
      });

      const acumulado = new Map();
      pedidos.forEach(p => {
        const detalles = p.DetallePedidos || p.DetallePedido || [];
        const fechaEntrega = p.fechaEntrega ? new Date(p.fechaEntrega) : null;
        detalles.forEach(d => {
          const key = d.productoId ? `prod:${d.productoId}` : `desc:${d.descripcion}`;
          const info = d.productoId ? prodMap.get(d.productoId) || {} : {};
          const actual = acumulado.get(key) || {
            producto: info.nombre || d.descripcion || 'Sin nombre',
            codigo: info.codigo || '',
            categoria: info.categoria || 'N/A',
            cantidadPedida: 0,
            cantidadEntregada: 0,
            cantidadPendiente: 0,
            porcentajeEntregado: 0,
            ultimaEntrega: '-' 
          };
          const cant = Number(d.cantidad || 0);
          actual.cantidadPedida += cant;
          // No tenemos entregas asociadas al pedido, asumimos 0
          actual.cantidadEntregada += 0;
          actual.cantidadPendiente = actual.cantidadPedida - actual.cantidadEntregada;
          actual.porcentajeEntregado = actual.cantidadPedida > 0 ? Number(((actual.cantidadEntregada / actual.cantidadPedida) * 100).toFixed(1)) : 0;
          if (fechaEntrega) {
            const actualFecha = actual.ultimaEntrega !== '-' ? new Date(actual.ultimaEntrega) : null;
            if (!actualFecha || fechaEntrega > actualFecha) {
              actual.ultimaEntrega = fechaEntrega.toISOString().slice(0,10);
            }
          }
          acumulado.set(key, actual);
        });
      });

      const lista = Array.from(acumulado.values());
      setItems(lista);
      setItemsFiltrados(lista);
    } catch (err) {
      setError(err?.message || 'Error al cargar consolidado');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarConsolidado();
  }, []);

  const totalPedido = itemsFiltrados.reduce((sum, item) => sum + (Number(item.cantidadPedida)||0), 0);
  const totalEntregado = itemsFiltrados.reduce((sum, item) => sum + (Number(item.cantidadEntregada)||0), 0);
  const totalPendiente = itemsFiltrados.reduce((sum, item) => sum + (Number(item.cantidadPendiente)||0), 0);
  const porcentajeGeneral = ((totalEntregado / totalPedido) * 100).toFixed(1);

  const getEstadoColor = (porcentaje) => {
    if (porcentaje === 100) return 'completado';
    if (porcentaje >= 75) return 'alto';
    if (porcentaje >= 50) return 'medio';
    return 'bajo';
  };

  return (
    <div className="pedidos-consolidado-container">
      <div className="pedidos-consolidado-reporte">
        {/* Header */}
        <div className="pedidos-consolidado-header">
          <button onClick={onBack} className="pedidos-consolidado-back-button">
            <ArrowLeft className="pedidos-consolidado-home-icon" />
          </button>
          <div className="pedidos-consolidado-breadcrumb">
            <span>Reportes</span> / <span>Pedidos</span> / <span>Consolidado de Ítems</span>
          </div>
        </div>

        {/* Título */}
        <div className="pedidos-consolidado-title">
          <Package className="pedidos-consolidado-title-icon" />
          <h1>Reporte Consolidado de Ítems de Pedidos</h1>
        </div>

        {/* Filtros */}
        <div className="pedidos-consolidado-filtros-section">
          <div className="pedidos-consolidado-filtros-header">
            <Filter className="pedidos-consolidado-filter-icon" />
            <h3>Filtros de Búsqueda</h3>
          </div>
          
          <div className="pedidos-consolidado-filtros-grid">
            <div className="pedidos-consolidado-filtro-grupo">
              <label>
                <Calendar size={16} />
                Fecha Desde:
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                className="pedidos-consolidado-filtro-input"
              />
            </div>

            <div className="pedidos-consolidado-filtro-grupo">
              <label>
                <Calendar size={16} />
                Fecha Hasta:
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                className="pedidos-consolidado-filtro-input"
              />
            </div>

            <div className="pedidos-consolidado-filtro-grupo">
              <label>
                <Search size={16} />
                Producto:
              </label>
              <input
                type="text"
                placeholder="Buscar producto..."
                value={filtros.producto}
                onChange={(e) => handleFiltroChange('producto', e.target.value)}
                className="pedidos-consolidado-filtro-input"
              />
            </div>

            <div className="pedidos-consolidado-filtro-grupo">
              <label>Categoría:</label>
              <select
                value={filtros.categoria}
                onChange={(e) => handleFiltroChange('categoria', e.target.value)}
                className="pedidos-consolidado-filtro-select"
              >
                <option value="">Todas las categorías</option>
                <option value="Herramientas">Herramientas</option>
                <option value="Ferretería">Ferretería</option>
                <option value="Herramientas Eléctricas">Herramientas Eléctricas</option>
                <option value="Materiales">Materiales</option>
              </select>
            </div>

            <div className="pedidos-consolidado-filtro-grupo">
              <label>Estado:</label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="pedidos-consolidado-filtro-select"
              >
                <option value="">Todos los estados</option>
                <option value="completo">Completado (100%)</option>
                <option value="parcial">Parcialmente entregado</option>
                <option value="pendiente">Con pendientes</option>
              </select>
            </div>
          </div>

          <div className="pedidos-consolidado-filtros-acciones">
            <button className="pedidos-consolidado-btn-filtrar" onClick={aplicarFiltros}>
              <Search size={16} />
              Aplicar Filtros
            </button>
            <button className="pedidos-consolidado-btn-exportar" onClick={exportarExcel}>
              <FileText size={16} />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div className="pedidos-consolidado-resumen-section">
          <div className="pedidos-consolidado-resumen-card">
            <div className="pedidos-consolidado-resumen-numero">{itemsFiltrados.length}</div>
            <div className="pedidos-consolidado-resumen-label">Total Productos</div>
          </div>
          <div className="pedidos-consolidado-resumen-card">
            <div className="pedidos-consolidado-resumen-numero">{totalPedido.toLocaleString()}</div>
            <div className="pedidos-consolidado-resumen-label">Cantidad Pedida</div>
          </div>
          <div className="pedidos-consolidado-resumen-card">
            <div className="pedidos-consolidado-resumen-numero">{totalEntregado.toLocaleString()}</div>
            <div className="pedidos-consolidado-resumen-label">Cantidad Entregada</div>
          </div>
          <div className="pedidos-consolidado-resumen-card">
            <div className="pedidos-consolidado-resumen-numero">{totalPendiente.toLocaleString()}</div>
            <div className="pedidos-consolidado-resumen-label">Cantidad Pendiente</div>
          </div>
          <div className="pedidos-consolidado-resumen-card pedidos-consolidado-destacado">
            <div className="pedidos-consolidado-resumen-numero">{porcentajeGeneral}%</div>
            <div className="pedidos-consolidado-resumen-label">% Cumplimiento</div>
          </div>
        </div>

        {/* Tabla */}
        <div className="pedidos-consolidado-tabla-section">
          <div className="pedidos-consolidado-tabla-header">
            <h3>Consolidado de Ítems de Pedidos</h3>
            <div className="pedidos-consolidado-tabla-stats">
              <BarChart3 size={16} />
              <span>Mostrando {itemsFiltrados.length} productos</span>
            </div>
          </div>
          
          <div className="pedidos-consolidado-tabla-container">
            <table className="pedidos-consolidado-reporte-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Categoría</th>
                  <th>Cant. Pedida</th>
                  <th>Cant. Entregada</th>
                  <th>Cant. Pendiente</th>
                  <th>% Entregado</th>
                  <th>Última Entrega</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>Cargando ítems...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: 'red' }}>{error}</td>
                  </tr>
                ) : itemsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>No hay resultados</td>
                  </tr>
                ) : (
                  itemsFiltrados.map((item, index) => (
                    <tr key={index}>
                      <td className="pedidos-consolidado-producto-nombre">
                        <Package size={16} className="pedidos-consolidado-producto-icon" />
                        {item.producto}
                      </td>
                      <td className="pedidos-consolidado-codigo">{item.codigo}</td>
                      <td className="pedidos-consolidado-categoria">{item.categoria}</td>
                      <td className="pedidos-consolidado-cantidad pedidos-consolidado-pedida">{item.cantidadPedida.toLocaleString()}</td>
                      <td className="pedidos-consolidado-cantidad pedidos-consolidado-entregada">{item.cantidadEntregada.toLocaleString()}</td>
                      <td className="pedidos-consolidado-cantidad pedidos-consolidado-pendiente">
                        {item.cantidadPendiente > 0 ? (
                          <span className="pedidos-consolidado-pendiente-highlight">{item.cantidadPendiente.toLocaleString()}</span>
                        ) : (
                          <span className="pedidos-consolidado-completo">0</span>
                        )}
                      </td>
                      <td className="pedidos-consolidado-porcentaje">
                        <div className="pedidos-consolidado-progreso-container">
                          <div className="pedidos-consolidado-progreso-bar">
                            <div 
                              className={`pedidos-consolidado-progreso-fill pedidos-consolidado-${getEstadoColor(item.porcentajeEntregado)}`}
                              style={{ width: `${item.porcentajeEntregado}%` }}
                            ></div>
                          </div>
                          <span className="pedidos-consolidado-progreso-texto">{item.porcentajeEntregado}%</span>
                        </div>
                      </td>
                      <td className="pedidos-consolidado-fecha">{item.ultimaEntrega}</td>
                      <td>
                        <span className={`pedidos-consolidado-estado pedidos-consolidado-estado-${getEstadoColor(item.porcentajeEntregado)}`}>
                          {item.porcentajeEntregado === 100 ? 'Completado' : 
                           item.porcentajeEntregado >= 75 ? 'En progreso' :
                           item.porcentajeEntregado >= 50 ? 'Parcial' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedidosConsolidadoItems;