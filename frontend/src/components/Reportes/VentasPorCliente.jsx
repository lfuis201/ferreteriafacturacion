import React, { useEffect, useState } from 'react';
import { obtenerReporteVentas } from '../../services/ventaService';
import { obtenerClientes } from '../../services/clienteService';
import '../../styles/VentasPorCliente.css'; // Importar el CSS

// Componente funcional sin estilos: Ventas por Cliente
// Usa servicios reales del backend para consolidar ventas por cliente.
const VentasPorCliente = ({ onBack }) => {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    clienteId: '',
    ordenarPor: 'total'
  });

  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [consolidado, setConsolidado] = useState([]);

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const res = await obtenerClientes();
        const lista = res.clientes || res.data || res || [];
        setClientes(lista);
      } catch (err) {
        console.error('Error cargando clientes:', err);
      }
    };
    cargarClientes();
    cargarReporte();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarReporte = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerReporteVentas({
        fechaInicio: filtros.fechaInicio || undefined,
        fechaFin: filtros.fechaFin || undefined,
        clienteId: filtros.clienteId || undefined
      });
      const ventasData = data.ventas || data.data?.ventas || [];
      setVentas(ventasData);
      const agrupado = agruparPorCliente(ventasData);
      setConsolidado(ordenarConsolidado(agrupado, filtros.ordenarPor));
    } catch (err) {
      setError(err.message || 'Error al cargar ventas por cliente');
      setVentas([]);
      setConsolidado([]);
    } finally {
      setLoading(false);
    }
  };

  const agruparPorCliente = (ventasData) => {
    const mapa = new Map();
    ventasData.forEach(v => {
      const id = v.Cliente?.id || 'sin_cliente';
      const nombre = v.Cliente?.nombre || 'Sin cliente';
      const documento = v.Cliente?.numeroDocumento || '';
      const total = Number(v.total || 0);
      const fecha = v.fechaVenta ? new Date(v.fechaVenta) : null;
      const entry = mapa.get(id) || { id, cliente: nombre, documento, cantidadCompras: 0, totalCompras: 0, ultimaCompra: null };
      entry.cantidadCompras += 1;
      entry.totalCompras += total;
      if (!entry.ultimaCompra || (fecha && fecha > entry.ultimaCompra)) {
        entry.ultimaCompra = fecha;
      }
      mapa.set(id, entry);
    });
    return Array.from(mapa.values()).map(e => ({
      ...e,
      promedioCompra: e.cantidadCompras > 0 ? e.totalCompras / e.cantidadCompras : 0
    }));
  };

  const ordenarConsolidado = (datos, criterio) => {
    const copia = [...datos];
    switch (criterio) {
      case 'cantidad':
        copia.sort((a, b) => b.cantidadCompras - a.cantidadCompras);
        break;
      case 'promedio':
        copia.sort((a, b) => b.promedioCompra - a.promedioCompra);
        break;
      case 'cliente':
        copia.sort((a, b) => a.cliente.localeCompare(b.cliente));
        break;
      case 'total':
      default:
        copia.sort((a, b) => b.totalCompras - a.totalCompras);
        break;
    }
    return copia;
  };

  const aplicarOrden = (criterio) => {
    setFiltros({ ...filtros, ordenarPor: criterio });
    setConsolidado(ordenarConsolidado(consolidado, criterio));
  };

  const formatearMoneda = (valor) => `S/ ${Number(valor || 0).toFixed(2)}`;

  return (
    <div className="ventas-cliente-container">
      <div className="ventas-cliente-header">
        <button onClick={onBack} className="ventas-cliente-btn-back">Volver</button>
        <h2>Ventas por Cliente</h2>
      </div>

      <div className="ventas-cliente-filtros">
        <div className="ventas-cliente-filtros-grid">
          <div className="ventas-cliente-filtro-grupo">
            <label>Fecha desde: </label>
            <input type="date" value={filtros.fechaInicio} onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })} />
          </div>
          <div className="ventas-cliente-filtro-grupo">
            <label>Fecha hasta: </label>
            <input type="date" value={filtros.fechaFin} onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })} />
          </div>
          <div className="ventas-cliente-filtro-grupo">
            <label>Cliente: </label>
            <select value={filtros.clienteId} onChange={(e) => setFiltros({ ...filtros, clienteId: e.target.value })}>
              <option value="">Todos</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="ventas-cliente-filtro-grupo">
            <label>Ordenar por: </label>
            <select value={filtros.ordenarPor} onChange={(e) => aplicarOrden(e.target.value)}>
              <option value="total">Total compras</option>
              <option value="cantidad">Cantidad compras</option>
              <option value="promedio">Promedio compra</option>
              <option value="cliente">Nombre cliente</option>
            </select>
          </div>
        </div>
        <div className="ventas-cliente-filtros-acciones">
          <button onClick={cargarReporte} disabled={loading} className="ventas-cliente-btn-filtrar">
            {loading ? 'Cargando...' : 'Aplicar filtros'}
          </button>
        </div>
      </div>

      {error && <div className="ventas-cliente-error">{error}</div>}

      <div className="ventas-cliente-resumen">
        <h3>Resumen</h3>
        <div className="ventas-cliente-resumen-grid">
          <div className="ventas-cliente-resumen-card">
            <div className="ventas-cliente-resumen-numero">{consolidado.length}</div>
            <div className="ventas-cliente-resumen-label">Clientes</div>
          </div>
          <div className="ventas-cliente-resumen-card">
            <div className="ventas-cliente-resumen-numero">
              {formatearMoneda(consolidado.reduce((s, c) => s + c.totalCompras, 0))}
            </div>
            <div className="ventas-cliente-resumen-label">Monto Total</div>
          </div>
        </div>
      </div>

      <div className="ventas-cliente-tabla">
        <h3>Consolidado por cliente</h3>
        <div className="ventas-cliente-tabla-container">
          <table className="ventas-cliente-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Documento</th>
                <th>Cantidad Compras</th>
                <th>Total Compras</th>
                <th>Promedio</th>
                <th>Última Compra</th>
              </tr>
            </thead>
            <tbody>
              {consolidado.map((c) => (
                <tr key={c.id}>
                  <td className="ventas-cliente-nombre">{c.cliente}</td>
                  <td className="ventas-cliente-documento">{c.documento || '-'}</td>
                  <td className="ventas-cliente-cantidad">{c.cantidadCompras}</td>
                  <td className="ventas-cliente-total">{formatearMoneda(c.totalCompras)}</td>
                  <td className="ventas-cliente-promedio">{formatearMoneda(c.promedioCompra)}</td>
                  <td className="ventas-cliente-fecha">{c.ultimaCompra ? c.ultimaCompra.toLocaleDateString() : '-'}</td>
                </tr>
              ))}
              {consolidado.length === 0 && (
                <tr>
                  <td colSpan="6" className="ventas-cliente-sin-datos">No hay datos para los filtros seleccionados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VentasPorCliente;