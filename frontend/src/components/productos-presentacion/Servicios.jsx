import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/Servicios.css';
import { servicioService } from '../../services/servicioService';

const Servicios = () => {
  const [showModal, setShowModal] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [buscarNombre, setBuscarNombre] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('Precio');
  
  const [formData, setFormData] = useState({
    codigoInterno: '',
    unidad: '-',
    nombre: '',
    descripcion: '',
    modelo: '',
    moneda: 'Soles',
    precioUnitarioVenta: '0',
    tipoAfectacion: 'Gravado - Operación Onerosa',
    codigoSunat: '',
    categoria: '',
    marca: ''
  });

  // Formateador de moneda
  const formatoPrecio = (moneda, valor) => {
    const num = Number(valor || 0);
    const pref = moneda === 'Dólares' ? '$' : 'S/';
    return `${pref} ${num.toFixed(2)}`;
  };

  // Cargar servicios reales desde el recurso dedicado de servicios
  const cargarServicios = async (filtroNombre = '') => {
    try {
      setCargando(true);
      setError('');
      const { servicios } = await servicioService.obtenerServicios({ nombre: filtroNombre });
      const mapeados = (servicios || []).map(s => ({
        id: s.id,
        codigoInterno: s.codigo || '',
        unidad: s.unidadMedida || '-',
        nombre: s.nombre,
        //historial: 0,
        stock: '',
        precioUnitarioVenta: formatoPrecio('Soles', s.precioVenta),
        tieneIgv: s.tieneIgv ? 'Si' : 'No',
        raw: s
      }));
      setServicios(mapeados);
    } catch (e) {
      setError(e.message || 'Error al cargar servicios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarServicios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (servicio = null) => {
    if (servicio) {
      setEditingId(servicio.id);
      setFormData({
        codigoInterno: servicio.codigoInterno,
        unidad: servicio.unidad,
        nombre: servicio.nombre,
        descripcion: '',
        modelo: '',
        moneda: 'Soles',
        precioUnitarioVenta: servicio.precioUnitarioVenta.replace('S/ ', ''),
        tipoAfectacion: 'Gravado - Operación Onerosa',
        codigoSunat: '',
        categoria: '',
        marca: ''
      });
    } else {
      setEditingId(null);
      setFormData({
        codigoInterno: '',
        unidad: '-',
        nombre: '',
        descripcion: '',
        modelo: '',
        moneda: 'Soles',
        precioUnitarioVenta: '0',
        tipoAfectacion: 'Gravado - Operación Onerosa',
        codigoSunat: '',
        categoria: '',
        marca: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Construir payload JSON para backend de servicios
      const payload = {
        nombre: formData.nombre,
        codigo: formData.codigoInterno,
        descripcion: formData.descripcion || '',
        precioVenta: parseFloat(formData.precioUnitarioVenta || '0'),
        unidadMedida: formData.unidad || '-',
        // Mapeo del tipo de afectación a los valores del modelo
        tipodeAfectacion:
          formData.tipoAfectacion === 'Gravado - Operación Onerosa'
            ? 'Gravado_Operación_Onerosa'
            : formData.tipoAfectacion === 'Exonerado'
            ? 'Exonerado_Operación_Onerosa'
            : formData.tipoAfectacion === 'Inafecto'
            ? 'Inafecto_Operación_Onerosa'
            : null,
        codigosunat: formData.codigoSunat || '',
        modelo: formData.modelo || '',
        marca: formData.marca || '',
        tieneIgv: formData.tipoAfectacion.includes('Gravado')
      };

      if (editingId) {
        await servicioService.actualizarServicio(editingId, payload);
      } else {
        await servicioService.crearServicio(payload);
      }

      await cargarServicios();
      setShowModal(false);
      setEditingId(null);
    } catch (err) {
      const serverMsg = err?.response?.data?.mensaje || err?.response?.data?.error;
      alert(serverMsg || err.message || 'Error al guardar el servicio');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este servicio?')) return;
    try {
      await servicioService.eliminarServicio(id);
      await cargarServicios();
    } catch (err) {
      alert(err.message || 'Error al eliminar el servicio');
    }
  };

  // Ordenamiento memoizado
  const serviciosOrdenados = useMemo(() => {
    const copia = [...servicios];
    if (ordenarPor === 'Nombre') {
      copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (ordenarPor === 'Código') {
      copia.sort((a, b) => (a.codigoInterno || '').localeCompare(b.codigoInterno || ''));
    } else {
      // Precio
      const parsePrecio = (p) => Number(String(p).replace(/[^0-9.]/g, '')) || 0;
      copia.sort((a, b) => parsePrecio(a.precioUnitarioVenta) - parsePrecio(b.precioUnitarioVenta));
    }
    return copia;
  }, [servicios, ordenarPor]);

  const handleBuscar = async () => {
    await cargarServicios(buscarNombre);
  };

  return (
    <div className="servicios-container">
      <div className="servicios-header">
        <div className="servicios-title">
          <span className="servicios-icon">⚙️</span>
          <h1>SERVICIOS</h1>
        </div>
        <div className="servicios-actions">
         
         
          <button 
            className="servicios-btn-nuevo"
            onClick={() => handleOpenModal()}
          >
            ⊕ Nuevo
          </button>
        </div>
      </div>

      <div className="servicios-section">
        <div className="servicios-section-header">
          <h2>Listado de servicios</h2>
        <div className="servicios-section-actions">
           
            <select 
              className="servicios-select-ordenar"
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
            >
              <option value="Precio">Ordenar por Precio</option>
              <option value="Nombre">Ordenar por Nombre</option>
              <option value="Código">Ordenar por Código</option>
            </select>
          </div>
        </div>

        <div className="servicios-filters">
          <input 
            type="text" 
            className="servicios-filter-input"
            placeholder="Nombre"
            value={buscarNombre}
            onChange={(e) => setBuscarNombre(e.target.value)}
          />
         
          <button className="servicios-btn-buscar" onClick={handleBuscar}>🔍 Buscar</button>
        </div>

        <div className="servicios-table-wrapper">
          <table className="servicios-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Cód. Interno</th>
                <th>Unidad</th>
                <th>Nombre</th>
                {/* <th>Historial</th>*/ }
               

                {/*  <th>Stock</th>*/ }
                <th>P.Unitario (Venta)</th>
                <th>Tiene Igv (Venta)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {serviciosOrdenados.map((servicio, index) => (
                <tr key={servicio.id}>
                  <td>{index + 1}</td>
                  <td>{servicio.id}</td>
                  <td>{servicio.codigoInterno}</td>
                  <td>{servicio.unidad}</td>
                  <td>{servicio.nombre}</td>
                 
               
                  <td>{servicio.precioUnitarioVenta}</td>
                  <td>{servicio.tieneIgv}</td>
                  <td>
                    <div className="servicios-acciones">
                      <button 
                        className="servicios-btn-editar"
                        onClick={() => handleOpenModal(servicio)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className="servicios-btn-eliminar"
                        onClick={() => handleDelete(servicio.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="servicios-pagination">
            <span>Total {serviciosOrdenados.length}</span>
            <div className="servicios-pagination-buttons">
              <button className="servicios-page-btn">‹</button>
              <button className="servicios-page-btn servicios-active">1</button>
              <button className="servicios-page-btn">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="servicios-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="servicios-modal" onClick={(e) => e.stopPropagation()}>
            <div className="servicios-modal-header">
              <h2>{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
              <button 
                className="servicios-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="servicios-modal-body">
              <div className="servicios-form-section">
                <div className="servicios-form-row-2">
                  <div className="servicios-form-group">
                    <label>
                      Nombre <span className="servicios-required">*</span>
                    </label>
                    <input 
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="servicios-input"
                      required
                    />
                  </div>

                  <div className="servicios-form-group">
                    <label>Código Interno</label>
                    <input 
                      type="text"
                      value={formData.codigoInterno}
                      onChange={(e) => setFormData({...formData, codigoInterno: e.target.value})}
                      className="servicios-input"
                      required
                    />
                  </div>
                </div>

                <div className="servicios-form-row-3">
                  <div className="servicios-form-group">
                    <label>Descripción</label>
                    <textarea 
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      className="servicios-textarea"
                      rows="3"
                    />
                  </div>

                  <div className="servicios-form-group">
                    <label>Modelo</label>
                    <input 
                      type="text"
                      value={formData.modelo}
                      onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                      className="servicios-input"
                    />
                  </div>

                  <div className="servicios-form-group">
                    <label>Unidad</label>
                    <select 
                      value={formData.unidad}
                      onChange={(e) => setFormData({...formData, unidad: e.target.value})}
                      className="servicios-select"
                    >
                      <option value="Servicio"> - Servicio</option>
                      <option value="NIU">NIU - Unidad</option>
                      <option value="HUR">HUR - Hora</option>
                    </select>
                  </div>
                </div>

                <div className="servicios-form-row-4">
                  <div className="servicios-form-group">
                    <label>Moneda</label>
                    <select 
                      value={formData.moneda}
                      onChange={(e) => setFormData({...formData, moneda: e.target.value})}
                      className="servicios-select"
                    >
                      <option value="Soles">Soles</option>
                      <option value="Dólares">Dólares</option>
                    </select>
                  </div>

                  <div className="servicios-form-group">
                    <label>
                      Precio Unitario (Venta) <span className="servicios-required">*</span>
                    </label>
                    <input 
                      type="number"
                      step="0.01"
                      value={formData.precioUnitarioVenta}
                      onChange={(e) => setFormData({...formData, precioUnitarioVenta: e.target.value})}
                      className="servicios-input"
                      required
                    />
                  </div>

                  <div className="servicios-form-group">
                    <label>Tipo de afectación (Venta)</label>
                    <select 
                      value={formData.tipoAfectacion}
                      onChange={(e) => setFormData({...formData, tipoAfectacion: e.target.value})}
                      className="servicios-select"
                    >
                      <option value="Gravado - Operación Onerosa">Gravado - Operación Onerosa</option>
                      <option value="Exonerado">Exonerado</option>
                      <option value="Inafecto">Inafecto</option>
                    </select>
                  </div>

                  <div className="servicios-form-group">
                    <label>
                      Código Sunat <span className="servicios-info-icon">ⓘ</span>
                    </label>
                    <input 
                      type="text"
                      value={formData.codigoSunat}
                      onChange={(e) => setFormData({...formData, codigoSunat: e.target.value})}
                      className="servicios-input"
                    />
                  </div>
                </div>

                <div className="servicios-form-row-2">
                  <div className="servicios-form-group">
                    <label>
                      Categoría
                    
                    </label>
                    <select 
                      value={formData.categoria}
                      onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                      className="servicios-select"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Consultoría">Consultoría</option>
                      <option value="Soporte">Soporte</option>
                    </select>
                  </div>

                
                </div>
              </div>

              <div className="servicios-modal-footer">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="servicios-btn-cancelar"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="servicios-btn-guardar"
                >
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Servicios;