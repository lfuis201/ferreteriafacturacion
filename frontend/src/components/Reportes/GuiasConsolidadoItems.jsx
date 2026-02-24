import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, FileText, Calendar, Filter, Truck, BarChart3, Package, User, MapPin } from 'lucide-react'; 
import '../../styles/ReporteGuiasConsolidadoItems.css';
import guiaRemisionService from '../../services/guiaRemisionService';
import { obtenerClientes } from '../../services/clienteService';
import { obtenerProductos } from '../../services/productoService';
import { obtenerTransportistas } from '../../services/transportistaService';

const GuiasConsolidadoItems = ({ onBack }) => {
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    numeroGuia: '',
    clienteId: '',
    productoId: '',
    estado: '',
    transportista: ''
  });

  const [guias, setGuias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [transportistas, setTransportistas] = useState([]);

  const formatearFechaCorta = (fechaStr) => {
    if (!fechaStr) return '';
    try {
      const d = new Date(fechaStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return fechaStr;
    }
  };

  const cargarGuias = async () => {
    try {
      setCargando(true);
      setError(null);

      const filtrosApi = {
        estado: filtros.estado || undefined,
        fechaInicio: filtros.fechaDesde || undefined,
        fechaFin: filtros.fechaHasta || undefined,
      };

      const resp = await guiaRemisionService.obtenerGuias(filtrosApi);
      const guiasRemision = resp.guiasRemision || resp || [];

      // Aplanar detalles por ítem manteniendo el estilo actual
      const filas = [];
      guiasRemision.forEach((gr) => {
        const numeroGuia = gr.serieComprobante && gr.numeroComprobante
          ? `${gr.serieComprobante}-${gr.numeroComprobante}`
          : gr.numeroComprobante || '';
        const fecha = formatearFechaCorta(gr.fechaSalida);
        const cliente = (gr.Cliente && gr.Cliente.nombre) || '';
        const clienteId = (gr.Cliente && gr.Cliente.id) || null;
        const destino = gr.puntoLlegada || '';
        const transportista = gr.rucTransportista || gr.conductor || '';
        const transportistaDocumento = gr.rucTransportista || '';
        const estado = gr.estado || '';
        const fechaEntrega = gr.fechaEntrega ? formatearFechaCorta(gr.fechaEntrega) : '';
        const observaciones = gr.observacion || '';

        const detalles = gr.DetalleGuiaRemision || gr.DetalleGuiaRemisions || gr.detalles || [];
        if (Array.isArray(detalles) && detalles.length > 0) {
          detalles.forEach((det) => {
            filas.push({
              numeroGuia,
              fecha,
              cliente,
              producto: (det.Producto && det.Producto.nombre) || det.descripcion || '-',
              productoId: (det.Producto && det.Producto.id) || null,
              codigo: (det.Producto && det.Producto.codigo) || '',
              cantidad: Number(det.cantidad) || 0,
              peso: (det.Producto && det.Producto.peso) ? `${det.Producto.peso} kg` : '',
              destino,
              transportista,
              transportistaDocumento,
              estado,
              fechaEntrega,
              observaciones,
              clienteId,
            });
          });
        } else {
          // Sin detalles, crear una fila base para mantener coherencia visual
          filas.push({
            numeroGuia,
            fecha,
            cliente,
            producto: '-',
            codigo: '-',
            cantidad: 0,
            peso: '',
            destino,
            transportista,
            transportistaDocumento,
            estado,
            fechaEntrega,
            observaciones,
            clienteId,
          });
        }
      });

      // Filtros de texto aplicados en el frontend
      const filtrado = filas.filter((r) => {
        const f = filtros;
        const matchNumero = f.numeroGuia ? (r.numeroGuia || '').toLowerCase().includes(f.numeroGuia.toLowerCase()) : true;
        const matchCliente = f.clienteId ? r.clienteId === Number(f.clienteId) : true;
        const matchProducto = f.productoId ? r.productoId === Number(f.productoId) : true;
        const matchEstado = f.estado ? (r.estado || '').toLowerCase() === f.estado.toLowerCase() : true;
        const matchTransportista = f.transportista ? (r.transportistaDocumento || '').toLowerCase() === f.transportista.toLowerCase() : true;
        return matchNumero && matchCliente && matchProducto && matchEstado && matchTransportista;
      });

      setGuias(filtrado);
    } catch (e) {
      console.error('Error al cargar guías:', e);
      setError('No se pudieron cargar las guías de remisión');
      setGuias([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const cargarCatalogosYGuias = async () => {
      try {
        // Cargar catálogos para selects
        const [respClientes, respProductos, respTransportistas] = await Promise.all([
          obtenerClientes().catch(() => ({ clientes: [] })),
          obtenerProductos().catch(() => ({ productos: [] })),
          obtenerTransportistas().catch(() => ({ transportistas: [] })),
        ]);

        setClientes(respClientes.clientes || respClientes.data || []);
        setProductos(respProductos.productos || respProductos.data || []);
        setTransportistas(respTransportistas.transportistas || respTransportistas.data || []);
      } catch (err) {
        console.error('Error cargando catálogos:', err);
      } finally {
        // Siempre cargar guías luego de intentar cargar catálogos
        cargarGuias();
      }
    };
    cargarCatalogosYGuias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const exportarExcel = () => {
    console.log('Exportando consolidado de guías a Excel...');
  };

  const aplicarFiltros = () => {
    cargarGuias();
  };

  const totalGuias = guias.length;
  const totalItems = guias.reduce((sum, guia) => sum + (Number(guia.cantidad) || 0), 0);
  const guiasEntregadas = guias.filter(g => g.estado === 'Entregado').length;
  const guiasEnTransito = guias.filter(g => g.estado === 'En Tránsito').length;
  const guiasPendientes = guias.filter(g => g.estado === 'Pendiente').length;
  const porcentajeEntregado = totalGuias > 0 ? ((guiasEntregadas / totalGuias) * 100).toFixed(1) : '0.0';

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Entregado': return 'entregado';
      case 'En Tránsito': return 'en-transito';
      case 'Pendiente': return 'pendiente';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Entregado': return '✓';
      case 'En Tránsito': return '🚛';
      case 'Pendiente': return '⏳';
      default: return '?';
    }
  };

  return (
    <div className="guias-consolidado-container">
      <div className="guias-consolidado-reporte">
        {/* Header */}
        <div className="guias-consolidado-header">
          <button onClick={onBack} className="guias-consolidado-back-button">
            <ArrowLeft className="guias-consolidado-home-icon" />
          </button>
          <div className="guias-consolidado-breadcrumb">
            <span>Reportes</span> / <span>Guías</span> / <span>Consolidado de Ítems</span>
          </div>
        </div>

        {/* Título */}
        <div className="guias-consolidado-title">
          <Truck className="guias-consolidado-title-icon" />
          <h1>Reporte Consolidado de Ítems de Guías</h1>
        </div>

        {/* Filtros */}
        <div className="guias-consolidado-filtros-section">
          <div className="guias-consolidado-filtros-header">
            <Filter className="guias-consolidado-filter-icon" />
            <h3>Filtros de Búsqueda</h3>
          </div>
          
          <div className="guias-consolidado-filtros-grid">
            <div className="guias-consolidado-filtro-grupo">
              <label>
                <Calendar size={16} />
                Fecha Desde:
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                className="guias-consolidado-filtro-input"
              />
            </div>

            <div className="guias-consolidado-filtro-grupo">
              <label>
                <Calendar size={16} />
                Fecha Hasta:
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                className="guias-consolidado-filtro-input"
              />
            </div>

            <div className="guias-consolidado-filtro-grupo">
              <label>
                <Search size={16} />
                Número de Guía:
              </label>
              <input
                type="text"
                placeholder="Buscar número de guía..."
                value={filtros.numeroGuia}
                onChange={(e) => handleFiltroChange('numeroGuia', e.target.value)}
                className="guias-consolidado-filtro-input"
              />
            </div>

            <div className="guias-consolidado-filtro-grupo">
              <label>
                <User size={16} />
                Cliente:
              </label>
              <select
                value={filtros.clienteId}
                onChange={(e) => handleFiltroChange('clienteId', e.target.value)}
                className="guias-consolidado-filtro-select"
              >
                <option value="">Todos los clientes</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.numeroDocumento ? `(${c.numeroDocumento})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="guias-consolidado-filtro-grupo">
              <label>
                <Package size={16} />
                Producto:
              </label>
              <select
                value={filtros.productoId}
                onChange={(e) => handleFiltroChange('productoId', e.target.value)}
                className="guias-consolidado-filtro-select"
              >
                <option value="">Todos los productos</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="guias-consolidado-filtro-grupo">
              <label>Estado:</label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="guias-consolidado-filtro-select"
              >
                <option value="">Todos los estados</option>
                <option value="Entregado">Entregado</option>
                <option value="En Tránsito">En Tránsito</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>

            <div className="guias-consolidado-filtro-grupo">
              <label>
                <Truck size={16} />
                Transportista:
              </label>
              <select
                value={filtros.transportista}
                onChange={(e) => handleFiltroChange('transportista', e.target.value)}
                className="guias-consolidado-filtro-select"
              >
                <option value="">Todos los transportistas</option>
                {transportistas.map((t) => (
                  <option key={t.id} value={t.numeroDocumento}>
                    {t.nombreComercial || t.razonSocial} {t.numeroDocumento ? `(${t.numeroDocumento})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="guias-consolidado-filtros-acciones">
            <button className="guias-consolidado-btn-filtrar" onClick={aplicarFiltros}>
              <Search size={16} />
              Aplicar Filtros
            </button>
            <button className="guias-consolidado-btn-exportar" onClick={exportarExcel}>
              <FileText size={16} />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div className="guias-consolidado-resumen-section">
          <div className="guias-consolidado-resumen-card">
            <div className="guias-consolidado-resumen-numero">{totalGuias}</div>
            <div className="guias-consolidado-resumen-label">Total Guías</div>
          </div>
          <div className="guias-consolidado-resumen-card">
            <div className="guias-consolidado-resumen-numero">{totalItems.toLocaleString()}</div>
            <div className="guias-consolidado-resumen-label">Total Ítems</div>
          </div>
          <div className="guias-consolidado-resumen-card guias-consolidado-entregado">
            <div className="guias-consolidado-resumen-numero">{guiasEntregadas}</div>
            <div className="guias-consolidado-resumen-label">Entregadas</div>
          </div>
          <div className="guias-consolidado-resumen-card guias-consolidado-en-transito">
            <div className="guias-consolidado-resumen-numero">{guiasEnTransito}</div>
            <div className="guias-consolidado-resumen-label">En Tránsito</div>
          </div>
          <div className="guias-consolidado-resumen-card guias-consolidado-pendiente">
            <div className="guias-consolidado-resumen-numero">{guiasPendientes}</div>
            <div className="guias-consolidado-resumen-label">Pendientes</div>
          </div>
          <div className="guias-consolidado-resumen-card guias-consolidado-destacado">
            <div className="guias-consolidado-resumen-numero">{porcentajeEntregado}%</div>
            <div className="guias-consolidado-resumen-label">% Entregado</div>
          </div>
        </div>

        {/* Tabla */}
        <div className="guias-consolidado-tabla-section">
          <div className="guias-consolidado-tabla-header">
            <h3>Consolidado de Ítems de Guías</h3>
            <div className="guias-consolidado-tabla-stats">
              <BarChart3 size={16} />
              <span>Mostrando {guias.length} guías</span>
            </div>
          </div>
          
          <div className="guias-consolidado-tabla-container">
            <table className="guias-consolidado-reporte-tabla">
              <thead>
                <tr>
                  <th>Número Guía</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Cantidad</th>
                  <th>Peso</th>
                  <th>Destino</th>
                  <th>Transportista</th>
                  <th>Estado</th>
                  <th>Fecha Entrega</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {guias.map((guia, index) => (
                  <tr key={index}>
                    <td className="guias-consolidado-numero-guia">
                      <Truck size={16} className="guias-consolidado-guia-icon" />
                      {guia.numeroGuia}
                    </td>
                    <td className="guias-consolidado-fecha">{guia.fecha}</td>
                    <td className="guias-consolidado-cliente">
                      <User size={16} className="guias-consolidado-cliente-icon" />
                      {guia.cliente}
                    </td>
                    <td className="guias-consolidado-producto">
                      <Package size={16} className="guias-consolidado-producto-icon" />
                      {guia.producto}
                    </td>
                    <td className="guias-consolidado-codigo">{guia.codigo}</td>
                    <td className="guias-consolidado-cantidad">{guia.cantidad.toLocaleString()}</td>
                    <td className="guias-consolidado-peso">{guia.peso}</td>
                    <td className="guias-consolidado-destino">
                      <MapPin size={16} className="guias-consolidado-destino-icon" />
                      {guia.destino}
                    </td>
                    <td className="guias-consolidado-transportista">{guia.transportista}</td>
                    <td>
                      <span className={`guias-consolidado-estado guias-consolidado-estado-${getEstadoColor(guia.estado)}`}>
                        <span className="guias-consolidado-estado-icon">{getEstadoIcon(guia.estado)}</span>
                        {guia.estado}
                      </span>
                    </td>
                    <td className="guias-consolidado-fecha-entrega">
                      {guia.fechaEntrega || (
                        <span className="guias-consolidado-sin-fecha">Sin fecha</span>
                      )}
                    </td>
                    <td className="guias-consolidado-observaciones">
                      <div className="guias-consolidado-observaciones-container">
                        <span className="guias-consolidado-observaciones-texto" title={guia.observaciones}>
                          {guia.observaciones}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuiasConsolidadoItems;