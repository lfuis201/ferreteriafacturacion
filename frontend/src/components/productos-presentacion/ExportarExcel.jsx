import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { exportarProductosExcel } from '../../services/productoService';
import { obtenerCategorias } from '../../services/categoriaService';
import { obtenerSucursales } from '../../services/sucursalService';
import '../../styles/ExportarExcel.css';

const ExportarExcel = ({ isOpen, onClose }) => {
  const [filtros, setFiltros] = useState({
    categoriaId: '',
    sucursalId: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  const cargarDatos = async () => {
    try {
      const [categoriasData, sucursalesData] = await Promise.all([
        obtenerCategorias(),
        obtenerSucursales()
      ]);
      console.log('Categorías cargadas:', categoriasData);
      console.log('Sucursales cargadas:', sucursalesData);
      // Las categorías vienen directamente como array
      setCategorias(categoriasData.data || categoriasData || []);
      // Las sucursales vienen envueltas en { sucursales: [...] }
      setSucursales(sucursalesData.data?.sucursales || sucursalesData.sucursales || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExportar = async () => {
    setCargando(true);
    try {
      // Filtrar valores vacíos
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) => value !== '')
      );
      
      console.log('Filtros originales:', filtros);
      console.log('Filtros limpios enviados:', filtrosLimpios);

      await exportarProductosExcel(filtrosLimpios);
      
      Swal.fire({
        icon: 'success',
        title: 'Exportación exitosa',
        text: 'El archivo Excel se ha descargado correctamente',
        confirmButtonText: 'Aceptar'
      });
      
      onClose();
    } catch (error) {
      console.error('Error en exportación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error en la exportación',
        text: error.message || 'Ocurrió un error inesperado',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setCargando(false);
    }
  };

  const handleCerrar = () => {
    setFiltros({
      categoriaId: '',
      sucursalId: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content exportar-excel-modal">
        <div className="modal-header">
          <h2>Exportar Productos a Excel</h2>
          <button 
            className="btn-close" 
            onClick={handleCerrar}
            disabled={cargando}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="filtros-exportacion">


                {/*No se usa por ahora */}
            {/*  <h3>Filtros de Exportación</h3>
            <p className="filtros-descripcion">
              Selecciona los filtros que deseas aplicar. Si no seleccionas ningún filtro, se exportarán todos los productos.
            </p>*/}
          
                 {/*  <div className="filtros-grid">
              <div className="campo-filtro">
                <label htmlFor="categoriaId">Categoría:</label>
                <select
                  id="categoriaId"
                  name="categoriaId"
                  value={filtros.categoriaId}
                  onChange={handleInputChange}
                  disabled={cargando}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo-filtro">
                <label htmlFor="sucursalId">Sucursal:</label>
                <select
                  id="sucursalId"
                  name="sucursalId"
                  value={filtros.sucursalId}
                  onChange={handleInputChange}
                  disabled={cargando}
                >
                  <option value="">Todas las sucursales</option>
                  {sucursales.map(sucursal => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo-filtro">
                <label htmlFor="fechaDesde">Fecha desde:</label>
                <input
                  type="date"
                  id="fechaDesde"
                  name="fechaDesde"
                  value={filtros.fechaDesde}
                  onChange={handleInputChange}
                  disabled={cargando}
                />
              </div>

              <div className="campo-filtro">
                <label htmlFor="fechaHasta">Fecha hasta:</label>
                <input
                  type="date"
                  id="fechaHasta"
                  name="fechaHasta"
                  value={filtros.fechaHasta}
                  onChange={handleInputChange}
                  disabled={cargando}
                />
              </div>
            </div>*/}
           








            <div className="info-exportacion">
              <h4>Información del archivo Excel:</h4>
              <ul>
                <li>Se incluirán todos los productos.</li>
                <li>Si un producto tiene presentaciones, se creará una fila por cada presentación</li>
                <li>El archivo incluirá: código, nombre, descripción, categoría, sucursal, precios, presentaciones y stock</li>
                
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={handleCerrar}
            disabled={cargando}
          >
            Cancelar
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleExportar}
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="spinner"></span>
                Exportando...
              </>
            ) : (
              'Exportar Excel'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportarExcel;