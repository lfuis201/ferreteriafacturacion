import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
  Store,
  BarChart3,
  Trash2,
  Search,
  CheckCircle,
  Lock,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  Wallet,
  FileText,
} from 'lucide-react';
import {
  abrirCaja,
  cerrarCaja,
  obtenerEstadoCaja,
  generarReporteCaja,
  eliminarHistorialCaja,
} from '../../services/cajaService';
import { obtenerSucursales } from '../../services/sucursalService';

const inputBase =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

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
    <div className="mx-auto max-w-7xl space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <h1 className="flex items-center gap-3 text-xl font-bold text-slate-900 sm:text-2xl">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Store size={24} />
          </span>
          Cajas
        </h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReporteGeneral}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <BarChart3 size={18} />
            Reporte general
          </button>
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Wallet size={18} />
            Aperturar caja chica POS
          </button>
          <button
            type="button"
            onClick={handleEliminarHistorial}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            <Trash2 size={18} />
            Eliminar historial sucursal
          </button>
        </div>
      </div>

      {/* Filtros y tabla */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <FileText size={20} className="text-slate-600" />
          Listado de cajas
        </h2>

        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:gap-4">
          <div className="flex-1 sm:max-w-xs">
            <label className="mb-1 block text-sm font-medium text-slate-700">Sucursal</label>
            {sucursales.length > 0 ? (
              <select
                value={selectedSucursalId}
                onChange={(e) => setSelectedSucursalId(e.target.value)}
                className={inputBase}
              >
                <option value="">Seleccione sucursal</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            ) : (
              <input
                value={selectedSucursalId || getSucursalId() || ''}
                readOnly
                className={`${inputBase} bg-slate-50`}
              />
            )}
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Buscar</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre, apellido, observaciones o estado..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className={inputBase}
              />
              <span className="inline-flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 text-slate-500">
                <Search size={18} />
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Observaciones</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Vendedor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Apertura</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Cierre</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Saldo inicial</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Saldo final</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Saldo real</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {currentCajas.map((caja) => (
                  <tr key={caja.id} className="transition hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{caja.id}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-sm text-slate-600" title={caja.observaciones || ''}>{caja.observaciones || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{`${(caja.usuario?.nombre || '')} ${(caja.usuario?.apellido || '')}`.trim() || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{caja.fechaApertura ? new Date(caja.fechaApertura).toLocaleString() : '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{caja.fechaCierre ? new Date(caja.fechaCierre).toLocaleString() : '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-900">{Number(caja.saldoInicial ?? 0).toFixed(2)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-900">{Number(caja.saldoFinal ?? 0).toFixed(2)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-emerald-600">{Number((caja.saldoFinal ?? caja.saldoInicial) ?? 0).toFixed(2)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${caja.estado === 'ABIERTA' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {caja.estado === 'ABIERTA' ? <CheckCircle size={14} /> : <Lock size={14} />}
                        {caja.estado}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {caja.estado === 'ABIERTA' ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCerrarCaja(caja)}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                          >
                            <Lock size={14} />
                            Cerrar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditarCaja(caja)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          >
                            <Pencil size={14} />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={handleEliminarHistorial}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {currentCajas.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-500">
                      {cargando ? 'Cargando...' : 'No se encontraron cajas'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-slate-600">
            Mostrando {currentCajas.length} de {filteredCajas.length} cajas
            {searchTerm && ` (filtradas de ${cajas.length} totales)`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>
            {getPageNumbers().map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => paginate(number)}
                className={`min-w-[2.25rem] rounded-lg px-2 py-1.5 text-sm font-medium transition ${
                  currentPage === number
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <span className="text-sm text-slate-600">Página {currentPage} de {totalPages || 1}</span>
        </div>
      </div>

      {/* Modal Aperturar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleCloseModal}>
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Wallet size={22} className="text-emerald-600" />
                Aperturar Caja chica POS
              </h3>
              <button type="button" onClick={handleCloseModal} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Vendedor</label>
                <select name="vendedor" value={formData.vendedor} onChange={handleInputChange} className={inputBase}>
                  <option value={loggedUserLabel || 'Administrador'}>{loggedUserLabel || 'Administrador'}</option>
                  <option value="Administrador">Administrador</option>
                  <option value="almacen">Almacén</option>
                  <option value="taller">Taller</option>
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Saldo inicial</label>
                  <input type="number" step="0.01" name="saldoInicial" value={formData.saldoInicial} onChange={handleInputChange} className={inputBase} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Número de Referencia</label>
                  <input type="text" name="numeroReferencia" value={formData.numeroReferencia} onChange={handleInputChange} className={inputBase} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Sucursal</label>
                {sucursales.length > 0 ? (
                  <select name="sucursalId" value={formData.sucursalId} onChange={handleInputChange} className={inputBase}>
                    <option value="">Seleccione una sucursal</option>
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" value={getSucursalId() || ''} readOnly className={`${inputBase} bg-slate-50`} />
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/80 px-5 py-4">
              <button type="button" onClick={handleCloseModal} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancelar
              </button>
              <button type="button" onClick={handleGuardar} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                <Wallet size={16} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Pencil size={22} className="text-blue-600" />
                Editar Caja
              </h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Observaciones</label>
                <textarea rows={3} name="observaciones" value={editData.observaciones} onChange={handleEditInputChange} className={`${inputBase} resize-none`} />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/80 px-5 py-4">
              <button type="button" onClick={() => setShowEditModal(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancelar
              </button>
              <button type="button" onClick={handleGuardarEdicion} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                <Pencil size={16} />
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