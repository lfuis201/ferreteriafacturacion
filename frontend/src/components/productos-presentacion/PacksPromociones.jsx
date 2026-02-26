import React, { useEffect, useState } from 'react';
import { Package, Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { listarProductosCompuestos, crearProductoCompuesto, actualizarProductoCompuesto, eliminarProductoCompuesto } from '../../services/productosCompuestosService';
import { obtenerProductos } from '../../services/productoService';
import { obtenerCategorias } from '../../services/categoriaService';
import { obtenerSucursales, obtenerSucursalesPublico } from '../../services/sucursalService';

const inputBase = 'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-menta-turquesa focus:outline-none focus:ring-2 focus:ring-menta-turquesa';

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
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-menta-suave text-menta-petroleo">
            <Package size={24} />
          </span>
          <h1 className="text-2xl font-semibold text-fondo">Packs y Promociones</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-menta-petroleo px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-menta-marino"
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-fondo">Productos compuestos</h2>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Nombre"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className={`${inputBase} max-w-xs`}
          />
          <button
            type="button"
            onClick={async () => {
              const lista = await listarProductosCompuestos({ nombre: filtroNombre });
              setProductos(lista);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-menta-petroleo transition hover:bg-slate-50"
          >
            <Search size={18} /> Buscar
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Cód. Interno</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Unidad</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Historial Ventas</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">P.Unitario (Venta)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Tiene Igv</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-menta-petroleo">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {productos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-menta-petroleo">
                      Total 0
                    </td>
                  </tr>
                ) : (
                  productos.map((producto, index) => (
                    <tr key={producto.id ?? index} className="transition-colors hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{index + 1}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{producto.codigoInterno}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{producto.unidad}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-fondo">{producto.nombre}</td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-sm text-menta-marino">{producto.descripcion}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">-</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{producto.precioUnitarioVenta}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-menta-marino">{(producto.tipoAfectacion || '').toLowerCase().includes('gravado') ? 'Sí' : 'No'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => abrirEdicion(producto)} className="rounded-lg p-2 text-slate-500 transition hover:bg-menta-claro hover:text-menta-petroleo" title="Editar">
                            <Pencil size={18} />
                          </button>
                          <button type="button" onClick={() => borrarProducto(producto.id)} className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600" title="Eliminar">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-4 py-3">
            <span className="text-sm text-menta-petroleo">Total: {productos.length}</span>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="text-lg font-semibold text-fondo">{isEditing ? 'Editar producto compuesto' : 'Nuevo producto compuesto'}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Nombre *</label>
                    <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className={inputBase} required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Nombre secundario</label>
                    <input type="text" value={formData.nombreSecundario} onChange={(e) => setFormData({ ...formData, nombreSecundario: e.target.value })} className={inputBase} />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-menta-petroleo">Descripción</label>
                  <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={3} className={inputBase} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Modelo</label>
                    <input type="text" value={formData.modelo} onChange={(e) => setFormData({ ...formData, modelo: e.target.value })} className={inputBase} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Unidad</label>
                    <select value={formData.unidad} onChange={(e) => setFormData({ ...formData, unidad: e.target.value })} className={inputBase}>
                      <option value="Unidad">Unidad</option>
                      <option value="Caja">Caja</option>
                      <option value="Paquete">Paquete</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Moneda</label>
                    <select value={formData.moneda} onChange={(e) => setFormData({ ...formData, moneda: e.target.value })} className={inputBase}>
                      <option value="Soles">Soles</option>
                      <option value="Dólares">Dólares</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Precio Unitario (Venta) *</label>
                    <input type="number" step="0.01" value={formData.precioUnitarioVenta} onChange={(e) => setFormData({ ...formData, precioUnitarioVenta: e.target.value })} className={inputBase} required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-menta-petroleo">Sucursal</label>
                    <select value={formData.sucursalId} onChange={(e) => setFormData({ ...formData, sucursalId: e.target.value })} className={inputBase}>
                      <option value="">Seleccionar</option>
                      {sucursales.map((s) => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="button" onClick={agregarProducto} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-menta-petroleo transition hover:bg-menta-claro">
                  <Plus size={18} /> Agregar productos
                </button>

                {formData.productosAsociados.length > 0 && (
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-menta-petroleo">Producto</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-menta-petroleo">Cantidad</th>
                          <th className="px-3 py-2 w-12" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {formData.productosAsociados.map((producto, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2">
                              <select value={producto.productoId} onChange={(e) => handleProductoChange(index, 'productoId', e.target.value)} className={inputBase}>
                                <option value="">Seleccionar producto</option>
                                {productosDisponibles.map(p => (
                                  <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" min={1} value={producto.cantidad} onChange={(e) => handleProductoChange(index, 'cantidad', e.target.value)} className={`${inputBase} w-24`} />
                            </td>
                            <td className="px-3 py-2">
                              <button type="button" onClick={() => eliminarProducto(index)} className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Campos Adicionales */}
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-fondo">Campos adicionales</h3>
                  <div> 


 {/* 
                    <div className="space-y-1">
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





                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label>Tipo de afectación (Venta)</label>
                        <select 
                          value={formData.tipoAfectacion}
                          onChange={(e) => setFormData({...formData, tipoAfectacion: e.target.value})}
                          className={inputBase}
                        >
                          <option value="Gravado - Operación Onerosa">Gravado - Operación Onerosa</option>
                          <option value="Exonerado">Exonerado</option>
                          <option value="Inafecto">Inafecto</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label>
                          Código Sunat <span className="packs-promociones-info-icon">ⓘ</span>
                        </label>
                        <input 
                          type="text"
                          value={formData.codigoSunat}
                          onChange={(e) => setFormData({...formData, codigoSunat: e.target.value})}
                          className={inputBase}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label>
                        Código interno <span className="packs-promociones-info-icon">ⓘ</span>
                      </label>
                      <input 
                        type="text"
                        value={formData.codigoInterno}
                        onChange={(e) => setFormData({...formData, codigoInterno: e.target.value})}
                        className={inputBase}
                      />
                    </div>

                    <div className="space-y-1">
                      <label>
                        Total P. Compra (Referencia) <span className="packs-promociones-info-icon">ⓘ</span>
                      </label>
                      <input 
                        type="number"
                        step="0.01"
                        value={formData.totalPCompra}
                        onChange={(e) => setFormData({...formData, totalPCompra: e.target.value})}
                        className={inputBase}
                      />
                    </div>

                    <div className="space-y-1">
                      <label>
                        Precio Unitario (Compra) <span className="packs-promociones-required">*</span>
                      </label>
                      <input 
                        type="number"
                        step="0.01"
                        value={formData.precioUnitarioCompra}
                        onChange={(e) => setFormData({...formData, precioUnitarioCompra: e.target.value})}
                        className={inputBase}
                        required
                      />
                    </div>
                  </div>

                  <div className="hidden">



{/*
                    <div className="space-y-1">
                      <label>
                        Categoría
                        
                      </label>
                      <select 
                        value={formData.categoria}
                        onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                        className={inputBase}
                      >
                        <option value="">Seleccionar</option>
                        {categorias.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
*/}


{/*
                    <div className="space-y-1">
                      <label>
                        Marca
                      
                      </label>
                      <select 
                        value={formData.marca}
                        onChange={(e) => setFormData({...formData, marca: e.target.value})}
                        className={inputBase}
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

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" className="rounded-lg bg-menta-petroleo px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-menta-marino">
                  {isEditing ? 'Actualizar' : 'Guardar'}
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