import React, { useEffect, useState } from 'react';
import '../../styles/ListaCaja.css';
import Swal from 'sweetalert2';
import {
  abrirCaja,
  cerrarCaja,
  obtenerEstadoCaja,
  generarReporteCaja,
  eliminarHistorialCaja,
} from '../../services/cajaService';
import { obtenerSucursales } from '../../services/sucursalService';

const ListaCaja = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cajas, setCajas] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [selectedSucursalId, setSelectedSucursalId] = useState('');
  const [loggedUserLabel, setLoggedUserLabel] = useState('');
  const [formData, setFormData] = useState({
    vendedor: 'Administrador',
    saldoInicial: '0',
    numeroReferencia: 'Administrador',
    sucursalId: ''
  });
  const [editData, setEditData] = useState({ id: null, observaciones: '' });
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const getSucursalId = () => {
    try {
      const usuarioRaw = localStorage.getItem('usuario');
      if (!usuarioRaw) return null;
      const usuario = JSON.parse(usuarioRaw);
      return usuario?.sucursal?.id ?? usuario?.sucursalId ?? null;
    } catch (e) {
      return null;
    }
  };

  const getUsuarioLabel = () => {
    try {
      const usuarioRaw = localStorage.getItem('usuario');
      if (!usuarioRaw) return 'Administrador';
      const u = JSON.parse(usuarioRaw);
      const nombreCompleto = [u?.nombre, u?.apellido].filter(Boolean).join(' ').trim();
      return nombreCompleto || u?.username || u?.rol || 'Administrador';
    } catch (e) {
      return 'Administrador';
    }
  };

  // Cargar estado de cajas cuando cambia la sucursal seleccionada
  useEffect(() => {
    const cargarEstado = async () => {
      try {
        setCargando(true);
        const sucursalId = selectedSucursalId || getSucursalId();
        if (!sucursalId) {
          Swal.fire('Error', 'No se encontró sucursal en la sesión del usuario. Inicie sesión nuevamente o asigne una sucursal.', 'error');
          setCajas([]);
          setTotalItems(0);
          return;
        }
        try {
          const data = await obtenerEstadoCaja({ sucursalId });
          const lista = data?.historial?.cajas || [];
          const normalizadas = lista.map((c) => ({
            ...c,
            saldoInicial: Number(c.saldoInicial ?? 0),
            saldoFinal: Number(c.saldoFinal ?? 0),
            saldoReal: Number((c.saldoFinal ?? c.saldoInicial) ?? 0),
          }));
          setCajas(normalizadas);
          setTotalItems(normalizadas.length);
          setCurrentPage(1); // Resetear a primera página cuando cambian los datos
        } catch (e) {
          const msg = e?.message || '';
          if (msg.includes('No se encontraron cajas')) {
            setCajas([]);
            setTotalItems(0);
          } else {
            throw e;
          }
        }
      } catch (error) {
        Swal.fire('Error', error.message || 'No se pudo obtener el estado de caja', 'error');
        setCajas([]);
        setTotalItems(0);
      } finally {
        setCargando(false);
      }
    };
    cargarEstado();
  }, [selectedSucursalId]);

  // Cargar sucursales si el usuario puede elegir
  useEffect(() => {
    const initSucursales = async () => {
      try {
        const usuarioRaw = localStorage.getItem('usuario');
        const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
        const rol = usuario?.rol;
        const currentSucursalId = getSucursalId();
        const userLabel = getUsuarioLabel();
        setLoggedUserLabel(userLabel);
        if (rol === 'SuperAdmin') {
          const resp = await obtenerSucursales();
          const lista = resp?.sucursales || resp?.data || [];
          setSucursales(lista);
          setFormData((prev) => ({ ...prev, vendedor: userLabel, sucursalId: prev.sucursalId || currentSucursalId || '' }));
          setSelectedSucursalId((prev) => prev || currentSucursalId || (lista[0]?.id || ''));
        } else {
          setSucursales([]);
          setFormData((prev) => ({ ...prev, vendedor: userLabel, sucursalId: currentSucursalId || '' }));
          setSelectedSucursalId(currentSucursalId || '');
        }
      } catch (e) {
        const sid = getSucursalId() || '';
        const userLabel = getUsuarioLabel();
        setLoggedUserLabel(userLabel);
        setFormData((prev) => ({ ...prev, vendedor: userLabel, sucursalId: sid }));
        setSelectedSucursalId((prev) => prev || sid);
      }
    };
    initSucursales();
  }, []);

  // Filtrar cajas basado en searchTerm
  const filteredCajas = cajas.filter(c =>
    (c.usuario?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.observaciones || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.usuario?.apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.estado || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular páginas
  const totalPages = Math.ceil(filteredCajas.length / itemsPerPage);
  
  // Obtener cajas para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCajas = filteredCajas.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Página siguiente
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // Abrir caja
  const handleGuardar = async () => {
    try {
      const usuarioRaw = localStorage.getItem('usuario');
      const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
      const rol = usuario?.rol;
      const sucursalId = rol === 'SuperAdmin' ? formData.sucursalId || getSucursalId() : getSucursalId();
      if (!sucursalId) {
        Swal.fire('Error', 'No se encontró sucursal en la sesión del usuario. Inicie sesión nuevamente o asigne una sucursal.', 'error');
        return;
      }
      if (!formData.saldoInicial || isNaN(parseFloat(formData.saldoInicial))) {
        Swal.fire('Error', 'Debe ingresar un saldo inicial válido', 'error');
        return;
      }
      const payload = {
        sucursalId,
        saldoInicial: parseFloat(formData.saldoInicial || '0'),
        observaciones: formData.numeroReferencia || undefined,
      };
      const res = await abrirCaja(payload);
      Swal.fire('Éxito', res?.mensaje || 'Caja aperturada correctamente', 'success');
      handleCloseModal();
      // Recargar estado
      const data = await obtenerEstadoCaja({ sucursalId });
      const lista = data?.historial?.cajas || [];
      const normalizadas = lista.map((c) => ({
        ...c,
        saldoInicial: Number(c.saldoInicial ?? 0),
        saldoFinal: Number(c.saldoFinal ?? 0),
        saldoReal: Number((c.saldoFinal ?? c.saldoInicial) ?? 0),
      }));
      setCajas(normalizadas);
      setTotalItems(normalizadas.length);
      setCurrentPage(1);
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo aperturar la caja', 'error');
    }
  };

  // Cerrar caja
  const handleCerrarCaja = async (caja) => {
    try {
      const { value: saldoFinal } = await Swal.fire({
        title: 'Cerrar caja',
        input: 'number',
        inputLabel: 'Saldo final',
        inputPlaceholder: '0.00',
        inputAttributes: { step: '0.01' },
        showCancelButton: true,
      });

      if (saldoFinal === undefined) return; // cancelado

      const sucursalId = getSucursalId();
      if (!sucursalId) {
        Swal.fire('Error', 'No se encontró sucursal en la sesión del usuario. Inicie sesión nuevamente o asigne una sucursal.', 'error');
        return;
      }
      const payload = {
        sucursalId,
        saldoFinal: parseFloat(saldoFinal || '0'),
      };
      const res = await cerrarCaja(payload);
      Swal.fire('Éxito', res?.mensaje || 'Caja cerrada correctamente', 'success');

      const data = await obtenerEstadoCaja({ sucursalId });
      const lista = data?.historial?.cajas || [];
      const normalizadas = lista.map((c) => ({
        ...c,
        saldoInicial: Number(c.saldoInicial ?? 0),
        saldoFinal: Number(c.saldoFinal ?? 0),
        saldoReal: Number((c.saldoFinal ?? c.saldoInicial) ?? 0),
      }));
      setCajas(normalizadas);
      setTotalItems(normalizadas.length);
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo cerrar la caja', 'error');
    }
  };

  // Reporte general
  const handleReporteGeneral = async () => {
    try {
      const sucursalId = selectedSucursalId || getSucursalId();
      if (!sucursalId) {
        Swal.fire('Error', 'Seleccione una sucursal válida', 'error');
        return;
      }
      const data = await generarReporteCaja({ sucursalId });
      const reporte = data?.reporte || data;

      const buildReporteHTML = (rep) => {
        const filas = (rep?.cajas || []).map((c) => `
          <tr>
            <td style="border:1px solid #ccc;padding:6px">${c.id ?? ''}</td>
            <td style="border:1px solid #ccc;padding:6px">${c.sucursalId ?? ''}</td>
            <td style="border:1px solid #ccc;padding:6px">${c.fechaApertura ?? '-'}</td>
            <td style="border:1px solid #ccc;padding:6px">${c.fechaCierre ?? '-'}</td>
            <td style="border:1px solid #ccc;padding:6px">${Number(c.saldoInicial ?? 0).toFixed(2)}</td>
            <td style="border:1px solid #ccc;padding:6px">${c.saldoFinal != null ? Number(c.saldoFinal).toFixed(2) : '-'}</td>
            <td style="border:1px solid #ccc;padding:6px">${[(c.Usuario?.nombre || ''),(c.Usuario?.apellido || '')].filter(Boolean).join(' ')}</td>
            <td style="border:1px solid #ccc;padding:6px">${c.estado ?? ''}</td>
            <td style="border:1px solid #ccc;padding:6px">${c.Sucursal?.nombre ?? ''}</td>
          </tr>
        `).join('');

        return `
          <div style="text-align:left">
            <div style="margin-bottom:10px">
              <strong>Sucursal:</strong> ${rep?.Sucursal?.nombre || rep?.sucursalId || ''}<br/>
              <strong>Total de cajas:</strong> ${rep?.totalCajas ?? (rep?.cajas?.length || 0)}
            </div>
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr>
                  <th style="border:1px solid #ccc;padding:6px">ID</th>
                  <th style="border:1px solid #ccc;padding:6px">Sucursal</th>
                  <th style="border:1px solid #ccc;padding:6px">Apertura</th>
                  <th style="border:1px solid #ccc;padding:6px">Cierre</th>
                  <th style="border:1px solid #ccc;padding:6px">Saldo inicial</th>
                  <th style="border:1px solid #ccc;padding:6px">Saldo final</th>
                  <th style="border:1px solid #ccc;padding:6px">Vendedor</th>
                  <th style="border:1px solid #ccc;padding:6px">Estado</th>
                  <th style="border:1px solid #ccc;padding:6px">Sucursal nombre</th>
                </tr>
              </thead>
              <tbody>
                ${filas || '<tr><td colspan="9" style="text-align:center;padding:8px">Sin cajas</td></tr>'}
              </tbody>
            </table>
          </div>
        `;
      };

      const html = buildReporteHTML(reporte);
      Swal.fire({ title: 'Reporte de Caja', html, width: 900 });
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo generar el reporte', 'error');
    }
  };

  // Abrir modal de edición
  const handleEditarCaja = (caja) => {
    setEditData({ id: caja.id, observaciones: caja.observaciones || '', sucursalId: caja.sucursalId });
    setShowEditModal(true);
  };

  // Guardar edición
  const handleGuardarEdicion = async () => {
    try {
      if (!editData.id) return;
      const { actualizarCaja } = await import('../../services/cajaService');
      const res = await actualizarCaja(editData.id, { observaciones: editData.observaciones });
      Swal.fire('Éxito', res?.mensaje || 'Caja actualizada', 'success');
      setShowEditModal(false);

      const sucursalId = editData.sucursalId || getSucursalId();
      if (!sucursalId) {
        setCajas((prev) => prev.map((c) => c.id === editData.id ? { ...c, observaciones: editData.observaciones } : c));
        return;
      }
      try {
        const data = await obtenerEstadoCaja({ sucursalId });
        const lista = data?.historial?.cajas || [];
        const normalizadas = lista.map((c) => ({
          ...c,
          saldoInicial: Number(c.saldoInicial ?? 0),
          saldoFinal: Number(c.saldoFinal ?? 0),
          saldoReal: Number((c.saldoFinal ?? c.saldoInicial) ?? 0),
        }));
        setCajas(normalizadas);
        setTotalItems(normalizadas.length);
      } catch (e) {
        const msg = e?.message || '';
        if (msg.includes('No se encontraron cajas')) {
          setCajas([]);
          setTotalItems(0);
        } else {
          throw e;
        }
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo actualizar la caja', 'error');
    }
  };

  // Eliminar historial de la sucursal actual
  const handleEliminarHistorial = async () => {
    try {
      const sucursalId = selectedSucursalId || getSucursalId();
      const confirma = await Swal.fire({
        title: 'Eliminar historial',
        text: 'Esta acción no se puede deshacer. ¿Continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });
      if (!confirma.isConfirmed) return;
      if (!sucursalId) {
        Swal.fire('Error', 'No se encontró sucursal en la sesión del usuario. Inicie sesión nuevamente o asigne una sucursal.', 'error');
        return;
      }
      const res = await eliminarHistorialCaja(sucursalId);
      Swal.fire('Éxito', res?.mensaje || 'Historial eliminado', 'success');
      try {
        const data = await obtenerEstadoCaja({ sucursalId });
        const lista = data?.historial?.cajas || [];
        const normalizadas = lista.map((c) => ({
          ...c,
          saldoInicial: Number(c.saldoInicial ?? 0),
          saldoFinal: Number(c.saldoFinal ?? 0),
          saldoReal: Number((c.saldoFinal ?? c.saldoInicial) ?? 0),
        }));
        setCajas(normalizadas);
        setTotalItems(normalizadas.length);
        setCurrentPage(1);
      } catch (e) {
        const msg = e?.message || '';
        if (msg.includes('No se encontraron cajas')) {
          setCajas([]);
          setTotalItems(0);
          setCurrentPage(1);
        } else {
          throw e;
        }
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo eliminar el historial', 'error');
    }
  };

  return (
    <div className="lc-container">
      <div className="lc-header">
        <h1 className="lc-title">
          <span className="lc-icon">🏪</span>
          CAJAS
        </h1>
        <div className="lc-header-buttons">
          <button className="lc-btn lc-btn-primary" onClick={handleReporteGeneral}>
            📊 Reporte general
          </button>
          <button className="lc-btn lc-btn-danger" onClick={handleOpenModal}>
            📂 Aperturar caja chica POS
          </button>
          <button className="lc-btn lc-btn-secondary" onClick={handleEliminarHistorial}>
            🗑️ Eliminar historial sucursal
          </button>
        </div>
      </div>

      <div className="lc-content">
        <h2 className="lc-subtitle">Listado de cajas</h2>

        <div className="lc-filters">
          {sucursales.length > 0 ? (
            <select
              className="lc-select"
              value={selectedSucursalId}
              onChange={(e) => setSelectedSucursalId(e.target.value)}
            >
              <option value="">Seleccione sucursal</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          ) : (
            <input
              className="lc-select"
              value={selectedSucursalId || getSucursalId() || ''}
              readOnly
            />
          )}
          <div className="lc-search-box">
            <input
              type="text"
              className="lc-search-input"
              placeholder="Buscar por nombre, apellido, observaciones o estado..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Resetear a primera página al buscar
              }}
            />
            <button className="lc-btn lc-btn-search">
              🔍 Buscar
            </button>
          </div>
        </div>

        <div className="lc-table-wrapper">
          <table className="lc-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Observaciones</th>
                <th>Vendedor</th>
                <th>Apertura</th>
                <th>Cierre</th>
                <th>Saldo inicial</th>
                <th>Saldo final</th>
                <th>Saldo real</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentCajas.map((caja) => (
                <tr key={caja.id}>
                  <td>{caja.id}</td>
                  <td>{caja.observaciones || '-'}</td>
                  <td>{`${(caja.usuario?.nombre || '')} ${(caja.usuario?.apellido || '')}`.trim() || '-'}</td>
                  <td>{caja.fechaApertura ? new Date(caja.fechaApertura).toLocaleString() : '-'}</td>
                  <td>{caja.fechaCierre ? new Date(caja.fechaCierre).toLocaleString() : '-'}</td>
                  <td>{Number(caja.saldoInicial ?? 0).toFixed(2)}</td>
                  <td>{Number(caja.saldoFinal ?? 0).toFixed(2)}</td>
                  <td>{Number((caja.saldoFinal ?? caja.saldoInicial) ?? 0).toFixed(2)}</td>
                  <td>
                    <span className={`lc-badge ${caja.estado === 'ABIERTA' ? 'lc-badge-open' : 'lc-badge-closed'}`}>
                      {caja.estado}
                    </span>
                  </td>
                  <td>
                    <div className="lc-action-buttons">
                      {caja.estado === 'ABIERTA' ? (
                        <>
                          <button className="lc-btn-action lc-btn-cerrar" onClick={() => handleCerrarCaja(caja)}>Cerrar Caja</button>
                          <button className="lc-btn-action lc-btn-editar" onClick={() => handleEditarCaja(caja)}>Editar</button>
                          <button className="lc-btn-action lc-btn-eliminar" onClick={handleEliminarHistorial}>Eliminar</button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {currentCajas.length === 0 && (
                <tr>
                  <td colSpan="10" className="lc-no-data">
                    {cargando ? 'Cargando...' : 'No se encontraron cajas'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lc-pagination">
          <span>
            Mostrando {currentCajas.length} de {filteredCajas.length} cajas 
            {searchTerm && ` (filtradas de ${cajas.length} totales)`}
          </span>
          <div className="lc-pagination-controls">
            <button 
              className="lc-pagination-btn" 
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            
            {getPageNumbers().map(number => (
              <button
                key={number}
                className={`lc-pagination-btn ${currentPage === number ? 'lc-active' : ''}`}
                onClick={() => paginate(number)}
              >
                {number}
              </button>
            ))}
            
            <button 
              className="lc-pagination-btn" 
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              &gt;
            </button>
          </div>
          <span>Página {currentPage} de {totalPages || 1}</span>
        </div>
      </div>

      {showModal && (
        <div className="lc-modal-overlay" onClick={handleCloseModal}>
          <div className="lc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lc-modal-header">
              <h3>Aperturar Caja chica POS</h3>
              <button className="lc-modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="lc-modal-body">
              <div className="lc-form-group">
                <label className="lc-label">Vendedor</label>
                <select 
                  className="lc-input"
                  name="vendedor"
                  value={formData.vendedor}
                  onChange={handleInputChange}
                >
                  <option value={loggedUserLabel || 'Administrador'}>{loggedUserLabel || 'Administrador'}</option>
                  <option value="Administrador">Administrador</option>
                  <option value="almacen">Almacén</option>
                  <option value="taller">Taller</option>
                </select>
              </div>
              <div className="lc-form-row">
                <div className="lc-form-group">
                  <label className="lc-label">Saldo inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    className="lc-input"
                    name="saldoInicial"
                    value={formData.saldoInicial}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="lc-form-group">
                  <label className="lc-label">Número de Referencia</label>
                  <input
                    type="text"
                    className="lc-input"
                    name="numeroReferencia"
                    value={formData.numeroReferencia}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="lc-form-group">
                <label className="lc-label">Sucursal</label>
                {sucursales.length > 0 ? (
                  <select
                    className="lc-input"
                    name="sucursalId"
                    value={formData.sucursalId}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccione una sucursal</option>
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="lc-input"
                    value={getSucursalId() || ''}
                    readOnly
                  />
                )}
              </div>
            </div>
            <div className="lc-modal-footer">
              <button className="lc-btn lc-btn-secondary" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className="lc-btn lc-btn-danger" onClick={handleGuardar}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="lc-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="lc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lc-modal-header">
              <h3>Editar Caja</h3>
              <button className="lc-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="lc-modal-body">
              <div className="lc-form-group">
                <label className="lc-label">Observaciones</label>
                <textarea
                  className="lc-input"
                  rows={3}
                  name="observaciones"
                  value={editData.observaciones}
                  onChange={handleEditInputChange}
                />
              </div>
            </div>
            <div className="lc-modal-footer">
              <button className="lc-btn lc-btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancelar
              </button>
              <button className="lc-btn lc-btn-danger" onClick={handleGuardarEdicion}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaCaja;