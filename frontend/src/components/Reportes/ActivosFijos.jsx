import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Search, ArrowLeft, Package } from 'lucide-react';
import '../../styles/ReporteComprasActivosFijo.css';

const ActivosFijos = ({ onBack }) => {
  const [activosFijos, setActivosFijos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    categoria: '',
    estado: 'todos',
    valorMinimo: '',
    valorMaximo: ''
  });

  useEffect(() => {
    cargarActivosFijos();
  }, []);

  const cargarActivosFijos = async () => {
    try {
      setLoading(true);
      // Aquí deberías hacer la llamada real a tu API
      // const response = await fetch('/api/activos-fijos');
      // const data = await response.json();
      
      // Datos de ejemplo mientras implementas la API real
      const datosEjemplo = [
        {
          id: 1,
          codigo: 'AF-001',
          descripcion: 'Computadora Dell Inspiron 15',
          categoria: 'Equipos de Cómputo',
          fechaAdquisicion: '2023-06-15',
          valorAdquisicion: 2500.00,
          depreciacionAcumulada: 312.50,
          valorLibros: 2187.50,
          estado: 'Activo',
          ubicacion: 'Oficina Principal'
        },
        {
          id: 2,
          codigo: 'AF-002',
          descripcion: 'Escritorio Ejecutivo de Madera',
          categoria: 'Muebles y Enseres',
          fechaAdquisicion: '2023-03-10',
          valorAdquisicion: 800.00,
          depreciacionAcumulada: 80.00,
          valorLibros: 720.00,
          estado: 'Activo',
          ubicacion: 'Oficina Gerencia'
        },
        {
          id: 3,
          codigo: 'AF-003',
          descripcion: 'Montacargas Toyota 2.5T',
          categoria: 'Maquinaria y Equipo',
          fechaAdquisicion: '2022-11-20',
          valorAdquisicion: 45000.00,
          depreciacionAcumulada: 5625.00,
          valorLibros: 39375.00,
          estado: 'Activo',
          ubicacion: 'Almacén Principal'
        },
        {
          id: 4,
          codigo: 'AF-004',
          descripcion: 'Impresora Multifuncional HP',
          categoria: 'Equipos de Cómputo',
          fechaAdquisicion: '2023-08-05',
          valorAdquisicion: 1200.00,
          depreciacionAcumulada: 100.00,
          valorLibros: 1100.00,
          estado: 'En Mantenimiento',
          ubicacion: 'Oficina Contabilidad'
        }
      ];
      
      setActivosFijos(datosEjemplo);
    } catch (error) {
      console.error('Error al cargar activos fijos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const aplicarFiltros = () => {
    // Implementar lógica de filtrado
    cargarActivosFijos();
  };

  const exportarReporte = () => {
    // Implementar exportación a Excel/PDF
    console.log('Exportando reporte de activos fijos...');
  };

  const activosFiltrados = activosFijos.filter(activo => {
    if (filtros.estado !== 'todos' && activo.estado.toLowerCase() !== filtros.estado.toLowerCase()) {
      return false;
    }
    if (filtros.categoria && !activo.categoria.toLowerCase().includes(filtros.categoria.toLowerCase())) {
      return false;
    }
    if (filtros.valorMinimo && activo.valorLibros < parseFloat(filtros.valorMinimo)) {
      return false;
    }
    if (filtros.valorMaximo && activo.valorLibros > parseFloat(filtros.valorMaximo)) {
      return false;
    }
    return true;
  });

  const valorTotalAdquisicion = activosFiltrados.reduce((sum, activo) => sum + activo.valorAdquisicion, 0);
  const valorTotalLibros = activosFiltrados.reduce((sum, activo) => sum + activo.valorLibros, 0);
  const depreciacionTotal = activosFiltrados.reduce((sum, activo) => sum + activo.depreciacionAcumulada, 0);

  if (loading) {
    return (
      <div className="reportes-container">
        <div className="loading-spinner">Cargando reporte de activos fijos...</div>
      </div>
    );
  }

  return (
    <div className="reportes-container">
      {/* Header */}
      <div className="reportes-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <span className="home-icon">🏠</span>
        <span className="breadcrumb">REPORTES</span>
        <span className="separator">/</span>
        <span className="breadcrumb">COMPRAS</span>
        <span className="separator">/</span>
        <span className="breadcrumb active">ACTIVOS FIJOS</span>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <h3>Filtros de Búsqueda</h3>
        <div className="filtros-grid">
          <div className="filtro-item">
            <label>Fecha Inicio:</label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
            />
          </div>
          <div className="filtro-item">
            <label>Fecha Fin:</label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
            />
          </div>
          <div className="filtro-item">
            <label>Categoría:</label>
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={filtros.categoria}
              onChange={(e) => handleFiltroChange('categoria', e.target.value)}
            />
          </div>
          <div className="filtro-item">
            <label>Estado:</label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="activo">Activo</option>
              <option value="en mantenimiento">En Mantenimiento</option>
              <option value="dado de baja">Dado de Baja</option>
            </select>
          </div>
          <div className="filtro-item">
            <label>Valor Mínimo:</label>
            <input
              type="number"
              placeholder="0.00"
              value={filtros.valorMinimo}
              onChange={(e) => handleFiltroChange('valorMinimo', e.target.value)}
            />
          </div>
          <div className="filtro-item">
            <label>Valor Máximo:</label>
            <input
              type="number"
              placeholder="0.00"
              value={filtros.valorMaximo}
              onChange={(e) => handleFiltroChange('valorMaximo', e.target.value)}
            />
          </div>
        </div>
        <div className="filtros-actions">
          <button onClick={aplicarFiltros} className="btn-filtrar">
            <Filter size={16} /> Aplicar Filtros
          </button>
          <button onClick={exportarReporte} className="btn-exportar">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="resumen-section">
        <div className="resumen-card">
          <h4>Total Activos</h4>
          <p className="resumen-numero">{activosFiltrados.length}</p>
        </div>
        <div className="resumen-card">
          <h4>Valor Adquisición</h4>
          <p className="resumen-numero">S/ {valorTotalAdquisicion.toFixed(2)}</p>
        </div>
        <div className="resumen-card">
          <h4>Valor en Libros</h4>
          <p className="resumen-numero">S/ {valorTotalLibros.toFixed(2)}</p>
        </div>
        <div className="resumen-card">
          <h4>Depreciación Total</h4>
          <p className="resumen-numero">S/ {depreciacionTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabla de Activos Fijos */}
      <div className="tabla-section">
        <h3>Detalle de Activos Fijos</h3>
        <div className="tabla-container">
          <table className="reportes-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Fecha Adquisición</th>
                <th>Valor Adquisición</th>
                <th>Depreciación</th>
                <th>Valor en Libros</th>
                <th>Estado</th>
                <th>Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {activosFiltrados.map(activo => (
                <tr key={activo.id}>
                  <td>{activo.codigo}</td>
                  <td>{activo.descripcion}</td>
                  <td>{activo.categoria}</td>
                  <td>{new Date(activo.fechaAdquisicion).toLocaleDateString()}</td>
                  <td>S/ {activo.valorAdquisicion.toFixed(2)}</td>
                  <td>S/ {activo.depreciacionAcumulada.toFixed(2)}</td>
                  <td>S/ {activo.valorLibros.toFixed(2)}</td>
                  <td>
                    <span className={`estado-badge estado-${activo.estado.toLowerCase().replace(' ', '-')}`}>
                      {activo.estado}
                    </span>
                  </td>
                  <td>{activo.ubicacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivosFijos;