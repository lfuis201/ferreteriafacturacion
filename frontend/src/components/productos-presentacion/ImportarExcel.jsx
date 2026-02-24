import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { importarProductosExcel } from '../../services/productoService';
import '../../styles/ImportarExcel.css';

const ImportarExcel = ({ isOpen, onClose, onImportComplete }) => {
  const [archivo, setArchivo] = useState(null);
  const [datosPreview, setDatosPreview] = useState([]);
  const [erroresValidacion, setErroresValidacion] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [paso, setPaso] = useState(1); // 1: Seleccionar archivo, 2: Preview y validación, 3: Importar

  // Estructura esperada del Excel en el orden específico solicitado
  const columnasEsperadas = [
    'Nombre',
    'Código Interno',
    'Código Proveedor (OEM)',
    'Código competencia',
    'Productos relacionados',
    'Aplicación',
    'Modelo',
    'Origen',
    'Descripción',
    'Código Sunat',
    'Código Tipo de Unidad',
    'Código Tipo de Moneda',
    'Precio Unitario Venta',
    'Codigo Tipo de Afectación del Igv Venta',
    'Tiene Igv',
    'Precio Unitario Compra',
    'Codigo Tipo de Afectación del Igv Compra',
    'Stock',
    'Stock Mínimo',
    'Categoria',
    'Marca',
    'Rango años',
    'Cód barras'
  ];

  // Mapeo de columnas de Excel a campos de base de datos
  const mapeoColumnas = {
    'nombre': ['Nombre', 'NOMBRE', 'nombre'],
    'codigo': ['Código Interno', 'Codigo Interno', 'CODIGO INTERNO', 'codigo', 'CODIGO'],
    'codigo_proveedor_oem': ['Código Proveedor (OEM)', 'Codigo Proveedor (OEM)', 'CODIGO PROVEEDOR (OEM)'],
    'codigo_competencia': ['Código competencia', 'Codigo competencia', 'CODIGO COMPETENCIA'],
    'productos_relacionados': ['Productos relacionados', 'PRODUCTOS RELACIONADOS'],
    'aplicacion': ['Aplicación', 'Aplicacion', 'APLICACION'],
    'modelo': ['Modelo', 'MODELO'],
    'origen': ['Origen', 'ORIGEN'],
    'descripcion': ['Descripción', 'Descripcion', 'DESCRIPCION'],
    'codigo_sunat': ['Código Sunat', 'Codigo Sunat', 'CODIGO SUNAT'],
    'codigo_tipo_de_unidad': ['Código Tipo de Unidad', 'Codigo Tipo de Unidad', 'CODIGO TIPO DE UNIDAD'],
    'codigo_tipo_de_moneda': ['Código Tipo de Moneda', 'Codigo Tipo de Moneda', 'CODIGO TIPO DE MONEDA'],
    'precio_unitario_venta': ['Precio Unitario Venta', 'PRECIO UNITARIO VENTA', 'precio_venta', 'PRECIO_VENTA', 'precio venta'],
    'codigo_tipo_de_afectacion_del_igv_venta': ['Codigo Tipo de Afectación del Igv Venta', 'CODIGO TIPO DE AFECTACION DEL IGV VENTA'],
    'tiene_igv': ['Tiene Igv', 'TIENE IGV'],
    'precio_unitario_compra': ['Precio Unitario Compra', 'PRECIO UNITARIO COMPRA', 'precio_compra', 'PRECIO_COMPRA', 'precio compra'],
    'codigo_tipo_de_afectacion_del_igv_compra': ['Codigo Tipo de Afectación del Igv Compra', 'CODIGO TIPO DE AFECTACION DEL IGV COMPRA'],
    'stock': ['Stock', 'STOCK'],
    'stock_minimo': ['Stock Mínimo', 'Stock Minimo', 'STOCK MINIMO'],
    'categoria': ['Categoria', 'CATEGORIA'],
    'marca': ['Marca', 'MARCA'],
    'rango_anos': ['Rango años', 'Rango anos', 'RANGO ANOS'],
    'cod_barras': ['Cód barras', 'Cod barras', 'COD BARRAS', 'codigo_barras', 'CODIGO BARRAS']
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea un archivo Excel
      const extensionesValidas = ['.xlsx', '.xls'];
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!extensionesValidas.includes(extension)) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo inválido',
          text: 'Por favor selecciona un archivo Excel (.xlsx o .xls)'
        });
        return;
      }

      setArchivo(file);
      procesarArchivo(file);
    }
  };

  const procesarArchivo = async (file) => {
    setCargando(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir a JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new Error('El archivo debe contener al menos una fila de encabezados y una fila de datos');
      }

      // Obtener encabezados (primera fila)
      const encabezados = jsonData[0].map(col => col?.toString().trim());
      
      // Validar columnas requeridas - verificar que existan en el mapeo o en los encabezados
      const camposRequeridos = ['nombre', 'codigo', 'precio_unitario_venta', 'precio_unitario_compra'];
      const columnasFaltantes = camposRequeridos.filter(campo => {
        const posiblesNombres = mapeoColumnas[campo] || [];
        // Verificar si alguno de los posibles nombres existe en los encabezados
        const tieneColumna = posiblesNombres.some(nombre => encabezados.includes(nombre));
        return !tieneColumna;
      });
      
      if (columnasFaltantes.length > 0) {
        const nombresEsperados = columnasFaltantes.map(campo => {
          const posiblesNombres = mapeoColumnas[campo] || [];
          return posiblesNombres[0] || campo; // Usar el primer nombre posible
        });
        throw new Error(`Faltan las siguientes columnas requeridas: ${nombresEsperados.join(', ')}`);
      }

      // Procesar datos
      const datosProcessados = [];
      const errores = [];

      for (let i = 1; i < jsonData.length; i++) {
        const fila = jsonData[i];
        if (fila.length === 0 || !fila.some(cell => cell !== null && cell !== undefined && cell !== '')) {
          continue; // Saltar filas vacías
        }

        const producto = {};
        encabezados.forEach((encabezado, index) => {
          // Buscar el campo de BD correspondiente al encabezado de Excel
          const campoBD = Object.keys(mapeoColumnas).find(key => {
            const posiblesNombres = mapeoColumnas[key];
            return posiblesNombres.includes(encabezado);
          });
          
          if (campoBD) {
            producto[campoBD] = fila[index];
          } else {
            // Si no hay mapeo, usar el encabezado tal como está (para compatibilidad)
            producto[encabezado.toLowerCase().replace(/\s+/g, '_')] = fila[index];
          }
        });

        // Validar datos del producto
        const erroresFila = validarProducto(producto, i + 1);
        if (erroresFila.length > 0) {
          errores.push(...erroresFila);
        }

        datosProcessados.push({ ...producto, fila: i + 1 });
      }

      setDatosPreview(datosProcessados);
      setErroresValidacion(errores);
      setPaso(2);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al procesar archivo',
        text: error.message
      });
    } finally {
      setCargando(false);
    }
  };

  const validarProducto = (producto, numeroFila) => {
    const errores = [];

    // Validaciones básicas
    if (!producto.nombre || producto.nombre.toString().trim() === '') {
      errores.push({ fila: numeroFila, campo: 'nombre', mensaje: 'El nombre es requerido' });
    }

    if (!producto.codigo || producto.codigo.toString().trim() === '') {
      errores.push({ fila: numeroFila, campo: 'codigo', mensaje: 'El código es requerido' });
    }

    // La categoría ahora es opcional
    // if (!producto.categoria || producto.categoria.toString().trim() === '') {
    //   errores.push({ fila: numeroFila, campo: 'categoria', mensaje: 'La categoría es requerida' });
    // }

    // La sucursal ahora es opcional - se creará automáticamente si no existe
    // if (!producto.sucursal || producto.sucursal.toString().trim() === '') {
    //   errores.push({ fila: numeroFila, campo: 'sucursal', mensaje: 'La sucursal es requerida' });
    // }

    // El almacén ahora es opcional - se creará automáticamente si no existe
    // if (!producto.almacen || producto.almacen.toString().trim() === '') {
    //   errores.push({ fila: numeroFila, campo: 'almacen', mensaje: 'El almacén es requerido' });
    // }

    // Validar precios
    if (!producto.precio_unitario_compra || isNaN(parseFloat(producto.precio_unitario_compra)) || parseFloat(producto.precio_unitario_compra) <= 0) {
      errores.push({ fila: numeroFila, campo: 'precio_unitario_compra', mensaje: 'El precio de compra debe ser un número mayor a 0' });
    }

    if (!producto.precio_unitario_venta || isNaN(parseFloat(producto.precio_unitario_venta)) || parseFloat(producto.precio_unitario_venta) <= 0) {
      errores.push({ fila: numeroFila, campo: 'precio_unitario_venta', mensaje: 'El precio de venta debe ser un número mayor a 0' });
    }

    // Validar stock si está presente
    if (producto.stock && (isNaN(parseInt(producto.stock)) || parseInt(producto.stock) < 0)) {
      errores.push({ fila: numeroFila, campo: 'stock', mensaje: 'El stock debe ser un número entero mayor o igual a 0' });
    }

    // Validar stock mínimo si está presente
    if (producto.stock_minimo && (isNaN(parseInt(producto.stock_minimo)) || parseInt(producto.stock_minimo) < 0)) {
      errores.push({ fila: numeroFila, campo: 'stock_minimo', mensaje: 'El stock mínimo debe ser un número entero mayor o igual a 0' });
    }

    // Validar nuevos campos si están presentes
    if (producto.codigo_tipo_moneda && producto.codigo_tipo_moneda.toString().trim() !== '' && !/^[A-Z]{3}$/.test(producto.codigo_tipo_moneda)) {
      errores.push({ fila: numeroFila, campo: 'codigo_tipo_moneda', mensaje: 'El código de tipo de moneda debe ser de 3 letras mayúsculas (ej: PEN, USD)' });
    }

    if (producto.tiene_igv && !['true', 'false', '1', '0', 'sí', 'no', 'si'].includes(producto.tiene_igv.toString().toLowerCase())) {
      errores.push({ fila: numeroFila, campo: 'tiene_igv', mensaje: 'El campo tiene IGV debe ser true/false, 1/0, sí/no' });
    }

    // Validar presentación si está presente (actualizado para nuevos campos)
    if (producto.presentacion_descripcion || producto.presentacion_factor) {
      // Si hay descripción de presentación, validar factor
      if (producto.presentacion_descripcion && (!producto.presentacion_factor || isNaN(parseFloat(producto.presentacion_factor)) || parseFloat(producto.presentacion_factor) <= 0)) {
        errores.push({ fila: numeroFila, campo: 'presentacion_factor', mensaje: 'El factor de presentación es requerido y debe ser un número mayor a 0 cuando se especifica una presentación' });
      }
      
      // Validar precios de presentación si están presentes
      if (producto.presentacion_precio1 && (isNaN(parseFloat(producto.presentacion_precio1)) || parseFloat(producto.presentacion_precio1) <= 0)) {
        errores.push({ fila: numeroFila, campo: 'presentacion_precio1', mensaje: 'El precio 1 de presentación debe ser un número mayor a 0' });
      }
      if (producto.presentacion_precio2 && (isNaN(parseFloat(producto.presentacion_precio2)) || parseFloat(producto.presentacion_precio2) <= 0)) {
        errores.push({ fila: numeroFila, campo: 'presentacion_precio2', mensaje: 'El precio 2 de presentación debe ser un número mayor a 0' });
      }
      if (producto.presentacion_precio3 && (isNaN(parseFloat(producto.presentacion_precio3)) || parseFloat(producto.presentacion_precio3) <= 0)) {
        errores.push({ fila: numeroFila, campo: 'presentacion_precio3', mensaje: 'El precio 3 de presentación debe ser un número mayor a 0' });
      }
    }

    return errores;
  };

  const descargarPlantilla = () => {
    const datosPlantilla = [
      columnasEsperadas,
      [
        // Ejemplo 1: Martillo de Acero
        'Martillo de Acero',           // Nombre
        'MAR001',                      // Código Interno
        'HAM-500-ST',                  // Código Proveedor (OEM)
        'COMP-MAR-001',                // Código competencia
        'TOR001,PIN001',               // Productos relacionados
        'Construcción y carpintería',   // Aplicación (descripcion)
        'Modelo 500g',                 // Modelo
        'China',                       // Origen
        'Martillo de acero forjado con mango de madera, peso 500g', // Descripción
        '82055100',                    // Código Sunat
        'NIU',                         // Código Tipo de Unidad (unidadMedida)
        'PEN',                         // Código Tipo de Moneda
        '35.00',                       // Precio Unitario Venta
        '10',                          // Codigo Tipo de Afectación del Igv Venta
        'Sí',                          // Tiene Igv
        '25.50',                       // Precio Unitario Compra
        '10',                          // Codigo Tipo de Afectación del Igv Compra
        '50',                          // Stock
        '10',                          // Stock Mínimo
        'Herramientas',                // Categoria
        'Stanley',                     // Marca
        '2020-2025',                   // Rango años
        '7891234567890'                // Cód barras
      ],
      [
        // Ejemplo 2: Tornillo Phillips
        'Tornillo Phillips',           // Nombre
        'TOR001',                      // Código Interno
        'SCR-PH-1/4',                  // Código Proveedor (OEM)
        'COMP-TOR-001',                // Código competencia
        'MAR001',                      // Productos relacionados
        'Fijación en madera y metal',   // Aplicación (descripcion)
        '1/4 x 2"',                    // Modelo
        'Perú',                        // Origen
        'Tornillo phillips cabeza plana 1/4 x 2 pulgadas', // Descripción
        '73181590',                    // Código Sunat
        'NIU',                         // Código Tipo de Unidad (unidadMedida)
        'PEN',                         // Código Tipo de Moneda
        '0.75',                        // Precio Unitario Venta
        '10',                          // Codigo Tipo de Afectación del Igv Venta
        'Sí',                          // Tiene Igv
        '0.50',                        // Precio Unitario Compra
        '10',                          // Codigo Tipo de Afectación del Igv Compra
        '1000',                        // Stock
        '100',                         // Stock Mínimo
        'Tornillería',                 // Categoria
        'Ace',                         // Marca
        '2021-2026',                   // Rango años
        '7891234567891'                // Cód barras
      ],
      [
        // Ejemplo 3: Pintura Blanca
        'Pintura Látex Blanca',        // Nombre
        'PIN001',                      // Código Interno
        'PAINT-LAT-WHT-1G',           // Código Proveedor (OEM)
        'COMP-PIN-001',                // Código competencia
        '',                            // Productos relacionados
        'Pintura interior y exterior',  // Aplicación (descripcion)
        'Látex Premium',               // Modelo
        'Colombia',                    // Origen
        'Pintura látex blanca de alta calidad, rendimiento 40m²/galón', // Descripción
        '32081000',                    // Código Sunat
        'GLL',                         // Código Tipo de Unidad (unidadMedida)
        'PEN',                         // Código Tipo de Moneda
        '65.00',                       // Precio Unitario Venta
        '10',                          // Codigo Tipo de Afectación del Igv Venta
        'Sí',                          // Tiene Igv
        '45.00',                       // Precio Unitario Compra
        '10',                          // Codigo Tipo de Afectación del Igv Compra
        '25',                          // Stock
        '5',                           // Stock Mínimo
        'Pinturas',                    // Categoria
        'Sherwin Williams',            // Marca
        '2022-2027',                   // Rango años
        '7891234567892'                // Cód barras
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(datosPlantilla);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, 'plantilla_productos.xlsx');
    
    // Mostrar información sobre la plantilla
    Swal.fire({
      icon: 'success',
      title: 'Plantilla descargada',
      html: `
        <p>Se ha descargado la plantilla con el orden específico de campos:</p>
        <ul style="text-align: left; margin: 10px 0; font-size: 12px;">
          <li>✅ Nombre, Código Interno, Código Proveedor (OEM)</li>
          <li>✅ Código competencia, Productos relacionados, Aplicación</li>
          <li>✅ Modelo, Origen, Descripción, Código Sunat</li>
          <li>✅ Código Tipo de Unidad, Código Tipo de Moneda</li>
          <li>✅ Precios, IGV, Stock, Categoría, Marca, etc.</li>
        </ul>
        <p><strong>Nota:</strong> Complete todos los campos según sus productos. Los campos obligatorios son: Nombre, Código Interno, Precio Unitario Venta y Precio Unitario Compra.</p>
      `,
      confirmButtonText: 'Entendido'
    });
  };

  const importarDatos = async () => {
    if (erroresValidacion.length > 0) {
      const resultado = await Swal.fire({
        icon: 'warning',
        title: 'Errores de validación',
        text: `Se encontraron ${erroresValidacion.length} errores. ¿Deseas continuar importando solo los registros válidos?`,
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar'
      });

      if (!resultado.isConfirmed) {
        return;
      }
    }

    setCargando(true);
    try {
      // Usar el servicio para importar productos
      const resultado = await importarProductosExcel(archivo);

      // Mostrar resultado de la importación
      let mensaje = `Importación completada:\n`;
      mensaje += `• Productos creados: ${resultado.productosCreados}\n`;
      if (resultado.presentacionesCreadas > 0) {
        mensaje += `• Presentaciones creadas: ${resultado.presentacionesCreadas}\n`;
      }
      if (resultado.errores && resultado.errores.length > 0) {
        mensaje += `• Errores encontrados: ${resultado.errores.length}`;
      }

      await Swal.fire({
        icon: resultado.errores && resultado.errores.length > 0 ? 'warning' : 'success',
        title: 'Importación completada',
        text: mensaje,
        confirmButtonText: 'Aceptar'
      });

      // Si hay errores, mostrar detalles
      if (resultado.errores && resultado.errores.length > 0) {
        const erroresTexto = resultado.errores.map(error => 
          `Fila ${error.fila}: ${error.error}`
        ).join('\n');
        
        await Swal.fire({
          icon: 'info',
          title: 'Detalles de errores',
          text: erroresTexto,
          confirmButtonText: 'Entendido'
        });
      }

      onImportComplete && onImportComplete();
      handleCerrar();
    } catch (error) {
      console.error('Error en importación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error en la importación',
        text: error.message || 'Ocurrió un error inesperado'
      });
    } finally {
      setCargando(false);
    }
  };

  const handleCerrar = () => {
    setArchivo(null);
    setDatosPreview([]);
    setErroresValidacion([]);
    setPaso(1);
    onClose();
  };

  const renderPaso1 = () => (
    <div className="importar-paso">
      <div className="importar-header">
        <FileSpreadsheet size={48} className="importar-icon" />
        <h3>Importar Productos desde Excel</h3>
        <p>Selecciona un archivo Excel con los datos de productos y presentaciones</p>
      </div>

      <div className="importar-acciones">
        <button 
          type="button" 
          className="btn-descargar-plantilla"
          onClick={descargarPlantilla}
        >
          <Download size={20} />
          Descargar Plantilla
        </button>
      </div>

      <div className="importar-upload">
        <input
          type="file"
          id="archivo-excel"
          accept=".xlsx,.xls"
          onChange={handleArchivoChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="archivo-excel" className="upload-area">
          <Upload size={48} />
          <span>Haz clic para seleccionar archivo Excel</span>
          <small>Formatos soportados: .xlsx, .xls</small>
        </label>
      </div>

      {cargando && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Procesando archivo...</span>
        </div>
      )}
    </div>
  );

  const renderPaso2 = () => (
    <div className="importar-paso">
      <div className="importar-header">
        <h3>Vista Previa y Validación</h3>
        <p>Revisa los datos antes de importar</p>
      </div>

      {erroresValidacion.length > 0 && (
        <div className="errores-validacion">
          <div className="errores-header">
            <AlertCircle size={20} />
            <span>Se encontraron {erroresValidacion.length} errores</span>
          </div>
          <div className="errores-lista">
            {erroresValidacion.slice(0, 10).map((error, index) => (
              <div key={index} className="error-item">
                <span className="error-fila">Fila {error.fila}:</span>
                <span className="error-campo">{error.campo}</span>
                <span className="error-mensaje">{error.mensaje}</span>
              </div>
            ))}
            {erroresValidacion.length > 10 && (
              <div className="error-item">... y {erroresValidacion.length - 10} errores más</div>
            )}
          </div>
        </div>
      )}

      <div className="preview-stats">
        <div className="stat-item">
          <CheckCircle size={20} className="stat-icon success" />
          <span>Registros válidos: {datosPreview.length - erroresValidacion.filter((error, index, self) => 
            self.findIndex(e => e.fila === error.fila) === index
          ).length}</span>
        </div>
        <div className="stat-item">
          <AlertCircle size={20} className="stat-icon error" />
          <span>Registros con errores: {erroresValidacion.filter((error, index, self) => 
            self.findIndex(e => e.fila === error.fila) === index
          ).length}</span>
        </div>
      </div>

      <div className="preview-table-container">
        <table className="preview-table">
          <thead>
            <tr>
              <th>Fila</th>
              <th>Nombre</th>
              <th>Código</th>
              <th>Categoría</th>
              <th>Precio Compra</th>
              <th>Precio Venta</th>
              <th>Presentación</th>
              <th>Factor</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {datosPreview.slice(0, 10).map((producto, index) => {
              const tieneErrores = erroresValidacion.some(error => error.fila === producto.fila);
              const tienePresentacion = producto.presentacion_descripcion || producto.presentacion_factor;
              return (
                <tr key={index} className={tieneErrores ? 'fila-error' : 'fila-valida'}>
                  <td>{producto.fila}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.codigo}</td>
                  <td>{producto.categoria || '-'}</td>
                  <td>{producto.precio_compra}</td>
                  <td>{producto.precio_venta}</td>
                  <td>{producto.presentacion_descripcion || '-'}</td>
                  <td>{producto.presentacion_factor || '-'}</td>
                  <td>
                    {tieneErrores ? (
                      <span className="estado-error">
                        <AlertCircle size={16} />
                        Error
                      </span>
                    ) : (
                      <span className="estado-valido">
                        <CheckCircle size={16} />
                        {tienePresentacion ? 'Con Presentación' : 'Válido'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {datosPreview.length > 10 && (
          <div className="preview-more">
            ... y {datosPreview.length - 10} registros más
          </div>
        )}
      </div>

      <div className="importar-acciones">
        <button 
          type="button" 
          className="btn-secundario"
          onClick={() => setPaso(1)}
        >
          Volver
        </button>
        <button 
          type="button" 
          className="btn-primario"
          onClick={importarDatos}
          disabled={cargando || datosPreview.length === 0}
        >
          {cargando ? 'Importando...' : 'Importar Datos'}
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-importar-excel">
        <div className="modal-header">
          <h2>Importar Productos desde Excel</h2>
          <button className="btn-cerrar" onClick={handleCerrar}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {paso === 1 && renderPaso1()}
          {paso === 2 && renderPaso2()}
        </div>
      </div>
    </div>
  );
};

export default ImportarExcel;