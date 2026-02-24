import React, { useEffect, useState } from 'react';
import '../../styles/PacksPromociones.css';
import { listarProductosCompuestos, crearProductoCompuesto, actualizarProductoCompuesto, eliminarProductoCompuesto } from '../../services/productosCompuestosService';
import { obtenerProductos } from '../../services/productoService';
import { obtenerCategorias } from '../../services/categoriaService';
import { obtenerSucursales, obtenerSucursalesPublico } from '../../services/sucursalService';

const PacksPromociones = () => {
  const [showModal, setShowModal] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    nombreSecundario: '',
    descripcion: '',
    modelo: '',
    unidad: 'Unidad',
    moneda: 'Soles',
    precioUnitarioVenta: '0',
    plataforma: '',
    almacen: 'Almacén Oficina Principal',
    sucursalId: '',
    imagen: null,
    tipoAfectacion: 'Gravado - Operación Onerosa',
    codigoSunat: '',
    codigoInterno: '',
    totalPCompra: '0',
    precioUnitarioCompra: '0',
    categoria: '',
    marca: '',
    productosAsociados: []
  });

  // Cargar datos iniciales
  useEffect(() => {
    const cargarInicial = async () => {
      try {
        const lista = await listarProductosCompuestos();
        setProductos(lista);

        const respProductos = await obtenerProductos();
        const disponibles = respProductos.productos || respProductos.data || [];
        setProductosDisponibles(disponibles);

        const respCategorias = await obtenerCategorias();
        setCategorias(respCategorias.categorias || respCategorias.data || []);

        // Derivar marcas desde productos disponibles
        const marcasUnicas = Array.from(new Set(disponibles.map(p => p.marca).filter(Boolean)));
        setMarcas(marcasUnicas);

        // Cargar sucursales (con fallback público)
        try {
          const respSuc = await obtenerSucursales();
          setSucursales(respSuc.sucursales || respSuc.data || []);
        } catch (err) {
          const respSucPub = await obtenerSucursalesPublico();
          setSucursales(respSucPub.sucursales || respSucPub.data || []);
        }
      } catch (e) {
        console.error('Error cargando datos iniciales:', e);
      }
    };
    cargarInicial();
  }, []);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
        setFormData({ ...formData, imagen: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const agregarProducto = () => {
    setFormData({
      ...formData,
      productosAsociados: [
        ...formData.productosAsociados,
        { productoId: '', cantidad: 1 }
      ]
    });
  };

  const eliminarProducto = (index) => {
    const nuevosProductos = formData.productosAsociados.filter((_, i) => i !== index);
    setFormData({ ...formData, productosAsociados: nuevosProductos });
  };

  const handleProductoChange = (index, field, value) => {
    const nuevosProductos = [...formData.productosAsociados];
    nuevosProductos[index][field] = value;
    setFormData({ ...formData, productosAsociados: nuevosProductos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formData.nombre,
        nombreSecundario: formData.nombreSecundario,
        descripcion: formData.descripcion,
        modelo: formData.modelo,
        unidad: formData.unidad,
        moneda: formData.moneda,
        precioUnitarioVenta: formData.precioUnitarioVenta,
        plataforma: formData.plataforma,
        almacen: formData.almacen,
        sucursalId: formData.sucursalId || null,
        imagen: imagenPreview || null,
        tipoAfectacion: formData.tipoAfectacion,
        codigoSunat: formData.codigoSunat,
        codigoInterno: formData.codigoInterno,
        totalPCompra: formData.totalPCompra,
        precioUnitarioCompra: formData.precioUnitarioCompra,
        categoriaId: formData.categoria || null,
        marca: formData.marca || null,
        productosAsociados: formData.productosAsociados
          .filter(p => p.productoId && p.cantidad)
          .map(p => ({ productoId: Number(p.productoId), cantidad: Number(p.cantidad) }))
      };

      if (isEditing && editId) {
        await actualizarProductoCompuesto(editId, payload);
      } else {
        await crearProductoCompuesto(payload);
      }

      const lista = await listarProductosCompuestos();
      setProductos(lista);
      setShowModal(false);
      // Reset form
      setFormData({
        nombre: '',
        nombreSecundario: '',
        descripcion: '',
        modelo: '',
        unidad: 'Unidad',
        moneda: 'Soles',
        precioUnitarioVenta: '0',
        plataforma: '',
        almacen: 'Almacén Oficina Principal',
        sucursalId: '',
        imagen: null,
        tipoAfectacion: 'Gravado - Operación Onerosa',
        codigoSunat: '',
        codigoInterno: '',
        totalPCompra: '0',
        precioUnitarioCompra: '0',
        categoria: '',
        marca: '',
        productosAsociados: []
      });
      setImagenPreview(null);
      setIsEditing(false);
      setEditId(null);
    } catch (err) {
      console.error('Error al guardar producto compuesto:', err);
      alert(err.message || 'Error al guardar');
    }
  };

  const abrirEdicion = (producto) => {
    setIsEditing(true);
    setEditId(producto.id);
    setShowModal(true);
    setImagenPreview(producto.imagen || null);
    setFormData({
      nombre: producto.nombre || '',
      nombreSecundario: producto.nombreSecundario || '',
      descripcion: producto.descripcion || '',
      modelo: producto.modelo || '',
      unidad: producto.unidad || 'Unidad',
      moneda: producto.moneda || 'Soles',
      precioUnitarioVenta: String(producto.precioUnitarioVenta ?? '0'),
      plataforma: producto.plataforma || '',
      almacen: producto.almacen || 'Almacén Oficina Principal',
      sucursalId: producto.sucursalId || producto.Sucursal?.id || '',
      imagen: null,
      tipoAfectacion: producto.tipoAfectacion || 'Gravado - Operación Onerosa',
      codigoSunat: producto.codigoSunat || '',
      codigoInterno: producto.codigoInterno || '',
      totalPCompra: String(producto.totalPCompra ?? '0'),
      precioUnitarioCompra: String(producto.precioUnitarioCompra ?? '0'),
      categoria: producto.categoriaId || '',
      marca: producto.marca || '',
      productosAsociados: (producto.ProductoCompuestoItems || producto.ProductoCompuestoItem || [])
        .map(it => ({ productoId: it.productoId, cantidad: it.cantidad }))
    });
  };

  const borrarProducto = async (id) => {
    if (!confirm('¿Eliminar este producto compuesto?')) return;
    try {
      await eliminarProductoCompuesto(id);
      const lista = await listarProductosCompuestos();
      setProductos(lista);
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert(err.message || 'Error al eliminar');
    }
  };

  return (
    <div className="packs-promociones-container">
      <div className="packs-promociones-header">
        <div className="packs-promociones-title">
          <span className="packs-promociones-icon">📦</span>
          <h1>PRODUCTOS</h1>
        </div>
        <div className="packs-promociones-actions">
         
          <button className="packs-promociones-btn-nuevo" onClick={() => setShowModal(true)}>
            ⊕ Nuevo
          </button>
        
        </div>
      </div>

      <div className="packs-promociones-section">
        <div className="packs-promociones-section-header">
          <h2>Productos compuestos</h2>
       
        </div>

        <div className="packs-promociones-filters">
          <input 
            type="text" 
            className="packs-promociones-filter-input"
            placeholder="Nombre"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
          />
         
          <button className="packs-promociones-btn-buscar" onClick={async () => {
            const lista = await listarProductosCompuestos({ nombre: filtroNombre });
            setProductos(lista);
          }}>🔍 Buscar</button>
        </div>

        <div className="packs-promociones-table-wrapper">
          <table className="packs-promociones-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cód. Interno</th>
                <th>Unidad</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Historial Ventas</th>
                <th>P.Unitario (Venta)</th>
                <th>Tiene Igv</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="9" className="packs-promociones-empty">
                    Total 0
                  </td>
                </tr>
              ) : (
                productos.map((producto, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{producto.codigoInterno}</td>
                    <td>{producto.unidad}</td>
                    <td>{producto.nombre}</td>
                    <td>{producto.descripcion}</td>
                    <td>-</td>
                    <td>{producto.precioUnitarioVenta}</td>
                    <td>{(producto.tipoAfectacion || '').toLowerCase().includes('gravado') ? 'Sí' : 'No'}</td>
                    <td>
                      <button type="button" className="packs-promociones-btn-delete" onClick={() => abrirEdicion(producto)}>✎</button>
                      <button type="button" className="packs-promociones-btn-delete" style={{ marginLeft: 8 }} onClick={() => borrarProducto(producto.id)}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="packs-promociones-pagination">
            <button className="packs-promociones-page-btn">‹</button>
            <button className="packs-promociones-page-btn packs-promociones-active">1</button>
            <button className="packs-promociones-page-btn">›</button>
          </div>
        </div>
      </div>

      {/* Modal Nuevo Producto */}
      {showModal && (
        <div className="packs-promociones-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="packs-promociones-modal" onClick={(e) => e.stopPropagation()}>
            <div className="packs-promociones-modal-header">
              <h2>Nuevo producto compuesto</h2>
              <button 
                className="packs-promociones-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="packs-promociones-modal-body">
              <div className="packs-promociones-form-section">
                <div className="packs-promociones-form-row-2">
                  <div className="packs-promociones-form-group">
                    <label>
                      Nombre <span className="packs-promociones-required">*</span>
                    </label>
                    <input 
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="packs-promociones-input"
                      required
                    />
                  </div>

                  <div className="packs-promociones-form-group">
                    <label>Nombre secundario</label>
                    <input 
                      type="text"
                      value={formData.nombreSecundario}
                      onChange={(e) => setFormData({...formData, nombreSecundario: e.target.value})}
                      className="packs-promociones-input"
                    />
                  </div>
                </div>

                <div className="packs-promociones-form-row-3">
                  <div className="packs-promociones-form-group">
                    <label>Descripción</label>
                    <textarea 
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      className="packs-promociones-textarea"
                      rows="3"
                    />
                  </div>

                  <div className="packs-promociones-form-group">
                    <label>Modelo</label>
                    <input 
                      type="text"
                      value={formData.modelo}
                      onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                      className="packs-promociones-input"
                    />
                  </div>

                  <div className="packs-promociones-form-group">
                    <label>Unidad</label>
                    <select 
                      value={formData.unidad}
                      onChange={(e) => setFormData({...formData, unidad: e.target.value})}
                      className="packs-promociones-select"
                    >
                      <option value="Unidad">Unidad</option>
                      <option value="Caja">Caja</option>
                      <option value="Paquete">Paquete</option>
                    </select>
                  </div>
                </div>

                <div className="packs-promociones-form-row-4">
                  <div className="packs-promociones-form-group">
                    <label>Moneda</label>
                    <select 
                      value={formData.moneda}
                      onChange={(e) => setFormData({...formData, moneda: e.target.value})}
                      className="packs-promociones-select"
                    >
                      <option value="Soles">Soles</option>
                      <option value="Dólares">Dólares</option>
                    </select>
                  </div>

                  <div className="packs-promociones-form-group">
                    <label>
                      Precio Unitario (Venta) <span className="packs-promociones-required">*</span>
                    </label>
                    <input 
                      type="number"
                      step="0.01"
                      value={formData.precioUnitarioVenta}
                      onChange={(e) => setFormData({...formData, precioUnitarioVenta: e.target.value})}
                      className="packs-promociones-input"
                      required
                    />
                  </div>

              

                  <div className="packs-promociones-form-group">
                    <label>Sucursal</label>
                    <select 
                      value={formData.sucursalId}
                      onChange={(e) => setFormData({...formData, sucursalId: e.target.value})}
                      className="packs-promociones-select"
                    >
                      <option value="">Seleccionar</option>
                      {sucursales.map((s) => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Botón Agregar Productos */}
                <button 
                  type="button"
                  onClick={agregarProducto}
                  className="packs-promociones-btn-agregar-productos"
                >
                  + Agregar productos
                </button>

                {/* Tabla de Productos Asociados */}
                {formData.productosAsociados.length > 0 && (
                  <div className="packs-promociones-productos-section">
                    <table className="packs-promociones-productos-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.productosAsociados.map((producto, index) => (
                          <tr key={index}>
                            <td>
                              <select 
                                value={producto.productoId}
                                onChange={(e) => handleProductoChange(index, 'productoId', e.target.value)}
                                className="packs-promociones-select-table"
                              >
                                <option value="">Seleccionar producto</option>
                                {productosDisponibles.map(p => (
                                  <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input 
                                type="number"
                                min="1"
                                value={producto.cantidad}
                                onChange={(e) => handleProductoChange(index, 'cantidad', e.target.value)}
                                className="packs-promociones-input-table"
                              />
                            </td>
                            <td>
                              <button 
                                type="button"
                                onClick={() => eliminarProducto(index)}
                                className="packs-promociones-btn-delete"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Campos Adicionales */}
                <div className="packs-promociones-campos-adicionales">
                  <h3>Campos adicionales</h3>
                  
                  <div className="packs-promociones-form-row-imagen"> 


 {/* 
                    <div className="packs-promociones-form-group">
                      <label>Imagen</label>
                      <div className="packs-promociones-imagen-upload">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleImagenChange}
                          className="packs-promociones-file-input"
                          id="imagen-upload"
                        />
                        <label htmlFor="imagen-upload" className="packs-promociones-imagen-label">
                          {imagenPreview ? (
                            <img src={imagenPreview} alt="Preview" className="packs-promociones-imagen-preview" />
                          ) : (
                            <span className="packs-promociones-imagen-placeholder">+</span>
                          )}
                        </label>
                      </div>
                    </div> */}





                    <div className="packs-promociones-form-group-flex">
                      <div className="packs-promociones-form-group">
                        <label>Tipo de afectación (Venta)</label>
                        <select 
                          value={formData.tipoAfectacion}
                          onChange={(e) => setFormData({...formData, tipoAfectacion: e.target.value})}
                          className="packs-promociones-select"
                        >
                          <option value="Gravado - Operación Onerosa">Gravado - Operación Onerosa</option>
                          <option value="Exonerado">Exonerado</option>
                          <option value="Inafecto">Inafecto</option>
                        </select>
                      </div>

                      <div className="packs-promociones-form-group">
                        <label>
                          Código Sunat <span className="packs-promociones-info-icon">ⓘ</span>
                        </label>
                        <input 
                          type="text"
                          value={formData.codigoSunat}
                          onChange={(e) => setFormData({...formData, codigoSunat: e.target.value})}
                          className="packs-promociones-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="packs-promociones-form-row-4">
                    <div className="packs-promociones-form-group">
                      <label>
                        Código interno <span className="packs-promociones-info-icon">ⓘ</span>
                      </label>
                      <input 
                        type="text"
                        value={formData.codigoInterno}
                        onChange={(e) => setFormData({...formData, codigoInterno: e.target.value})}
                        className="packs-promociones-input"
                      />
                    </div>

                    <div className="packs-promociones-form-group">
                      <label>
                        Total P. Compra (Referencia) <span className="packs-promociones-info-icon">ⓘ</span>
                      </label>
                      <input 
                        type="number"
                        step="0.01"
                        value={formData.totalPCompra}
                        onChange={(e) => setFormData({...formData, totalPCompra: e.target.value})}
                        className="packs-promociones-input"
                      />
                    </div>

                    <div className="packs-promociones-form-group">
                      <label>
                        Precio Unitario (Compra) <span className="packs-promociones-required">*</span>
                      </label>
                      <input 
                        type="number"
                        step="0.01"
                        value={formData.precioUnitarioCompra}
                        onChange={(e) => setFormData({...formData, precioUnitarioCompra: e.target.value})}
                        className="packs-promociones-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="packs-promociones-form-row-2">



{/*
                    <div className="packs-promociones-form-group">
                      <label>
                        Categoría
                        
                      </label>
                      <select 
                        value={formData.categoria}
                        onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                        className="packs-promociones-select"
                      >
                        <option value="">Seleccionar</option>
                        {categorias.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
*/}


{/*
                    <div className="packs-promociones-form-group">
                      <label>
                        Marca
                      
                      </label>
                      <select 
                        value={formData.marca}
                        onChange={(e) => setFormData({...formData, marca: e.target.value})}
                        className="packs-promociones-select"
                      >
                        <option value="">Seleccionar</option>
                        {marcas.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>*/}






                  </div>
                </div>
              </div>

              <div className="packs-promociones-modal-footer">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="packs-promociones-btn-cancelar"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="packs-promociones-btn-guardar"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacksPromociones;