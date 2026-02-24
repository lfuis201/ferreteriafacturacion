import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, FileText, Calendar, Filter } from 'lucide-react';
import '../../styles/ReportePedidosGeneral.css';
import { listarPedidos } from '../../services/pedidoService';

const PedidosGeneral = ({ onBack }) => {
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    cliente: '',
    estado: ''
  });

  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const normalizarEstado = (estado) => {
    if (!estado) return '';
    const e = String(estado).toLowerCase();
    if (e.includes('pend')) return 'Pendiente';
    if (e.includes('entreg') || e.includes('complet')) return 'Entregado';
    if (e.includes('proces')) return 'En Proceso';
    if (e.includes('cancel')) return 'Cancelado';
    return estado;
  };

  const cargarPedidos = async () => {
    setCargando(true);
    setError('');
    try {
      const resp = await listarPedidos();
      const lista = Array.isArray(resp?.pedidos) ? resp.pedidos : [];
      const mapeados = lista.map((p) => ({
        id: p.id,
        numeroPedido: p.numeroPedido || `PED-${String(p.id).padStart(3,'0')}`,
        fecha: p.fechaEmision ? new Date(p.fechaEmision).toLocaleDateString('es-PE') : (p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-PE') : ''),
        cliente: p.Cliente?.nombre || 'Sin cliente',
        total: Number(p.total ?? 0),
        estado: normalizarEstado(p.estado || 'Pendiente')
      }));
      setPedidos(mapeados);
      setPedidosFiltrados(mapeados);
    } catch (err) {
      setError(err?.message || 'Error al cargar pedidos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const exportarExcel = () => {
    console.log('Exportando a Excel...');
  };

  const aplicarFiltros = () => {
    const desde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
    const hasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;
    const clienteTxt = filtros.cliente.trim().toLowerCase();
    const estadoSel = filtros.estado;

    const filtrados = pedidos.filter(p => {
      // Fecha
      let okFecha = true;
      if (desde || hasta) {
        const partes = p.fecha.split('/');
        // asume formato es-PE dd/mm/aaaa
        const f = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
        if (desde && f < desde) okFecha = false;
        if (hasta && f > hasta) okFecha = false;
      }

      // Cliente
      const okCliente = clienteTxt ? (p.cliente?.toLowerCase().includes(clienteTxt)) : true;

      // Estado
      const okEstado = estadoSel ? (p.estado === estadoSel) : true;

      return okFecha && okCliente && okEstado;
    });
    setPedidosFiltrados(filtrados);
  };

  return (
    <div className="pedidos-general-container">
      <div className="reporte-template">
        {/* Header */}
        <div className="reporte-header">
          <button onClick={onBack} className="back-button">
            <ArrowLeft className="home-icon" />
          </button>
          <div className="breadcrumb">
            <span>Reportes</span> / <span>Pedidos</span> / <span>General</span>
          </div>
        </div>

        {/* Título */}
        <div className="reporte-title">
          <FileText className="title-icon" />
          <h1>Reporte General de Pedidos</h1>
        </div>

        {/* Filtros */}
        <div className="filtros-section">
          <div className="filtros-header">
            <Filter className="filter-icon" />
            <h3>Filtros de Búsqueda</h3>
          </div>
          
          <div className="filtros-grid">
            <div className="filtro-grupo">
              <label>
                <Calendar size={16} />
                Fecha Desde:
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                className="filtro-input"
              />
            </div>

            <div className="filtro-grupo">
              <label>
                <Calendar size={16} />
                Fecha Hasta:
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                className="filtro-input"
              />
            </div>

            <div className="filtro-grupo">
              <label>
                <Search size={16} />
                Cliente:
              </label>
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={filtros.cliente}
                onChange={(e) => handleFiltroChange('cliente', e.target.value)}
                className="filtro-input"
              />
            </div>

            <div className="filtro-grupo">
              <label>Estado:</label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="filtro-select"
              >
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="filtros-acciones">
            <button className="btn-filtrar" onClick={aplicarFiltros}>
              <Search size={16} />
              Aplicar Filtros
            </button>
            <button className="btn-exportar" onClick={exportarExcel}>
              <FileText size={16} />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div className="resumen-section">
          <div className="resumen-card">
            <div className="resumen-numero">{pedidosFiltrados.length}</div>
            <div className="resumen-label">Total Pedidos</div>
          </div>
          <div className="resumen-card">
            <div className="resumen-numero">
              ${pedidosFiltrados.reduce((sum, p) => sum + (Number(p.total)||0), 0).toLocaleString()}
            </div>
            <div className="resumen-label">Valor Total</div>
          </div>
          <div className="resumen-card">
            <div className="resumen-numero">
              {pedidosFiltrados.filter(p => p.estado === 'Pendiente').length}
            </div>
            <div className="resumen-label">Pendientes</div>
          </div>
        </div>

        {/* Tabla */}
        <div className="tabla-section">
          <div className="tabla-header">
            <h3>Reporte General de Pedidos</h3>
          </div>
          
          <div className="tabla-container">
            <table className="reporte-tabla">
              <thead>
                <tr>
                  <th>Número Pedido</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>Cargando pedidos...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'red' }}>{error}</td>
                  </tr>
                ) : pedidosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No hay resultados</td>
                  </tr>
                ) : (
                  pedidosFiltrados.map((pedido, index) => (
                    <tr key={index}>
                      <td className="numero-pedido">{pedido.numeroPedido}</td>
                      <td>{pedido.fecha}</td>
                      <td>{pedido.cliente}</td>
                      <td className="total">S/.{Number(pedido.total||0).toLocaleString()}</td>
                      <td>
                        <span className={`estado estado-${pedido.estado.toLowerCase().replace(' ', '-')}`}>
                          {pedido.estado}
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

export default PedidosGeneral;