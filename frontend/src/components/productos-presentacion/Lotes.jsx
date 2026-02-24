import React, { useEffect, useState } from 'react';
import '../../styles/Lotes.css'; // Archivo CSS específico para este componente
import loteService from '../../services/loteService';
import { obtenerProductos } from '../../services/productoService';
import { obtenerAlmacenes } from '../../services/almacenService';
import { obtenerSucursales } from '../../services/sucursalService';

const Lotes = () => {
  const [showModal, setShowModal] = useState(false);
  const [lotes, setLotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loteEditando, setLoteEditando] = useState(null);
  const [productos, setProductos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [formData, setFormData] = useState({
    lote: '',
    producto: '', // Puede ser ID o nombre
    vencimiento: '',
    almacén: '', // Puede ser ID o nombre
    estado: 'Activo',
    stock: '0'
  });

  const cargarProductos = async () => {
    try {
      const res = await obtenerProductos({});
      const lista = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.productos) ? res.productos : []);
      setProductos(lista);
    } catch (error) {
      console.error('Error al cargar productos:', error.message);
    }
  };

  const cargarSucursales = async () => {
    try {
      const data = await obtenerSucursales();
      setSucursales(data?.sucursales || []);
    } catch (error) {
      console.error('Error al cargar sucursales:', error.message);
    }
  };

  const cargarLotes = async () => {
    try {
      const { data, total } = await loteService.obtenerLotes({ page, limit });
      const filas = (data || []).map((item) => ({
        id: item.id,
        lote: item.lote,
        producto: item.Producto?.nombre || '',
        productoId: item.productoId,
        vencimiento: item.vencimiento || '',
        almacén: item.Almacen?.nombre || '',
        almacenId: item.almacenId,
        estado: item.estado,
        stock: item.stock
      }));
      setLotes(filas);
      setTotal(total || filas.length);
    } catch (error) {
      console.error('Error al cargar lotes:', error.message);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarSucursales();
  }, []);

  useEffect(() => {
    cargarLotes();
  }, [page]);

  // Abrir modal para nuevo lote
  const abrirModalNuevo = () => {
    setLoteEditando(null);
    setFormData({ lote: '', producto: '', vencimiento: '', almacén: '', estado: 'Activo', stock: '0' });
    setShowModal(true);
  };

  // Abrir modal para editar lote
  const abrirModalEditar = (lote) => {
    setLoteEditando(lote);
    setFormData({
      lote: lote?.lote || '',
      producto: String(lote?.productoId || ''),
      vencimiento: lote?.vencimiento || '',
      // Para edición, dejamos la sucursal vacía para que el usuario elija
      almacén: '',
      estado: lote?.estado || 'Activo',
      stock: String(lote?.stock ?? '0')
    });
    setShowModal(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setShowModal(false);
    setLoteEditando(null);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar lote (nuevo o edición)
  const guardarLote = async () => {
    const parseId = (valor, lista, campoNombre) => {
      if (!valor) return undefined;
      if (/^\d+$/.test(valor)) return Number(valor);
      const arr = Array.isArray(lista)
        ? lista
        : (Array.isArray(lista?.data) ? lista.data
          : (Array.isArray(lista?.productos) ? lista.productos
            : (Array.isArray(lista?.almacenes) ? lista.almacenes : [])));
      const encontrado = arr.find((x) => String(x[campoNombre] || '').toLowerCase() === String(valor).toLowerCase());
      return encontrado?.id;
    };

    const payload = {
      lote: formData.lote,
      productoId: parseId(formData.producto, productos, 'nombre'),
      // Enviar también el nombre para que el backend resuelva o cree el producto
      producto: (formData.producto || '').trim() || undefined,
      // Enviar sucursalId para que el backend resuelva/cree almacén por defecto
      sucursalId: (/^\d+$/.test(formData['almacén']) ? Number(formData['almacén']) : undefined),
      // No enviamos nombre de almacén desde el formulario de sucursal
      almacen: undefined,
      vencimiento: formData.vencimiento || null,
      estado: formData.estado || 'Activo',
      stock: Number(formData.stock) || 0,
    };

    // Validación previa: asegurar que producto y almacén existan en listas
    const norm = (s) => (s ?? '').toString().trim().toLowerCase();
    const productosLista = Array.isArray(productos)
      ? productos
      : (Array.isArray(productos?.productos) ? productos.productos : []);
    const productoSeleccionado = productosLista.find((p) => norm(p?.nombre) === norm(formData.producto));
    if (!payload.productoId && productoSeleccionado?.id) {
      payload.productoId = productoSeleccionado.id;
    }
    
    // No resolvemos almacén en frontend; el backend lo hará en base a sucursalId

    // No bloquear envío: si no se resuelven IDs, el backend intentará resolver por nombre

    try {
      if (loteEditando?.id) {
        await loteService.actualizarLote(loteEditando.id, payload);
      } else {
        await loteService.crearLote(payload);
      }
      await cargarLotes();
      cerrarModal();
    } catch (error) {
      alert(error.message || 'Error al guardar el lote');
    }
  };

  // Eliminar lote
  const eliminarLote = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este lote?')) {
      try {
        await loteService.eliminarLote(id);
        await cargarLotes();
      } catch (error) {
        alert(error.message || 'Error al eliminar el lote');
      }
    }
  };

  return (
    <div className="lotes-container">
      <div className="lotes-header">
        <h1 className="lotes-title">Lotes</h1>
       
        
      </div>

      <div className="lotes-actions">
        <button 
          className="lotes-btn-nuevo"
          onClick={abrirModalNuevo}
        >
          Nuevo
        </button>
        <div className="lotes-total">
          Total: ({total})
        </div>
      </div>

      <div className="lotes-tabla-container">
        <table className="lotes-tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Lote</th>
              <th>Producto</th>
              <th>Vencimiento</th>
              <th>Almacén</th>
              <th>Estado</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lotes.length === 0 ? (
              <tr>
                <td colSpan="10" className="lotes-tabla-vacia">
                  No hay lotes registrados
                </td>
              </tr>
            ) : (
              lotes.map((lote, index) => (
                <tr key={lote.id}>
                  <td>{index + 1}</td>
                  <td>{lote.lote}</td>
                  <td>{lote.producto}</td>
                  <td>{lote.vencimiento}</td>
                  <td>{lote.almacén}</td>
                  <td>{lote.estado}</td>
                  <td>{lote.stock}</td>
                
                  <td className="lotes-acciones">
                    <button 
                      className="lotes-btn-editar"
                      onClick={() => abrirModalEditar(lote)}
                    >
                      Editar
                    </button>
                    <button 
                      className="lotes-btn-eliminar"
                      onClick={() => eliminarLote(lote.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="lotes-modal-overlay">
          <div className="lotes-modal">
            <div className="lotes-modal-header">
              <h2 className="lotes-modal-title">
                {loteEditando ? 'Editar Lote' : 'Nuevo Lote'}
              </h2>
              <button 
                className="lotes-modal-cerrar"
                onClick={cerrarModal}
              >
                ×
              </button>
            </div>
            
            <div className="lotes-modal-body">
              <div className="lotes-form-grid">
                <div className="lotes-form-group">
                  <label className="lotes-form-label">Lote</label>
                  <input
                    type="text"
                    name="lote"
                    value={formData.lote}
                    onChange={handleInputChange}
                    className="lotes-form-input"
                  />
                </div>
                
                <div className="lotes-form-group">
                  <label className="lotes-form-label">Producto</label>
                  <select
                    name="producto"
                    value={formData.producto}
                    onChange={handleInputChange}
                    className="lotes-form-input"
                  >
                    <option value="">Seleccione producto</option>
                    {(
                      Array.isArray(productos)
                        ? productos
                        : (Array.isArray(productos?.data)
                            ? productos.data
                            : (Array.isArray(productos?.productos)
                                ? productos.productos
                                : []))
                    ).map((p) => (
                      <option key={p.id} value={String(p.id)}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <div className="lotes-form-group">
                  <label className="lotes-form-label">Vencimiento</label>
                  <input
                    type="date"
                    name="vencimiento"
                    value={formData.vencimiento}
                    onChange={handleInputChange}
                    className="lotes-form-input"
                  />
                </div>
                
                <div className="lotes-form-group">
                  <label className="lotes-form-label">Sucursal</label>
                  <select
                    name="almacén"
                    value={formData.almacén}
                    onChange={handleInputChange}
                    className="lotes-form-input"
                  >
                    <option value="">Seleccione sucursal</option>
                    {(Array.isArray(sucursales) ? sucursales : []).map((s) => (
                      <option key={s.id} value={String(s.id)}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <div className="lotes-form-group">
                  <label className="lotes-form-label">Estado</label>
                  <input
                    type="text"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="lotes-form-input"
                  />
                </div>
                
                <div className="lotes-form-group">
                  <label className="lotes-form-label">Stock</label>
                  <input
                    type="text"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="lotes-form-input"
                  />
                </div>
                
              
                
             
              </div>
            </div>
            
            <div className="lotes-modal-footer">
              <button 
                className="lotes-btn-cancelar"
                onClick={cerrarModal}
              >
                Cancelar
              </button>
              <button 
                className="lotes-btn-guardar"
                onClick={guardarLote}
              >
                {loteEditando ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lotes;