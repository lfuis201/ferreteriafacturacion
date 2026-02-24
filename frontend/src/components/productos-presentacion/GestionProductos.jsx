import React, { useState } from 'react';
import ListaProductos from './ListaProductos';
import FormularioProducto from './FormularioProducto';
import ImportarExcel from './ImportarExcel';
import ImportarPresentacionesExcel from './ImportarPresentacionesExcel';
import ExportarExcel from './ExportarExcel';
import ExportarPresentacionesExcel from './ExportarPresentacionesExcel';
import ExportarEtiquetas from './ExportarEtiquetas';
import MigracionProductos from './MigracionProductos';

function GestionProductos() {
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista' | 'formulario'
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [modalImportarPresentacionesAbierto, setModalImportarPresentacionesAbierto] = useState(false);
  const [modalExportarAbierto, setModalExportarAbierto] = useState(false);
  const [modalExportarPresentacionesAbierto, setModalExportarPresentacionesAbierto] = useState(false);
  const [modalEtiquetasAbierto, setModalEtiquetasAbierto] = useState(false);
  const [modalMigracionAbierto, setModalMigracionAbierto] = useState(false);
  const [recargarProductos, setRecargarProductos] = useState(0); // Contador para forzar recarga

  const handleNuevoProducto = () => {
    setProductoSeleccionado(null);
    setVistaActual('formulario');
  };

  const handleEditarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setVistaActual('formulario');
  };

  const handleGuardarProducto = (producto) => {
    // Volver a la lista después de guardar
    setVistaActual('lista');
    setProductoSeleccionado(null);
  };

  const handleCancelar = () => {
    setVistaActual('lista');
    setProductoSeleccionado(null);
  };

  const handleImportarExcel = () => {
    setModalImportarAbierto(true);
  };

  const handleImportarPresentaciones = () => {
    setModalImportarPresentacionesAbierto(true);
  };

  const handleExportarExcel = () => {
    setModalExportarAbierto(true);
  };

  const handleExportarPresentaciones = () => {
    setModalExportarPresentacionesAbierto(true);
  };

  const handleExportarEtiquetas = () => {
    setModalEtiquetasAbierto(true);
  };

  const handleMigrarProductos = () => {
    setModalMigracionAbierto(true);
  };

  const handleImportComplete = () => {
    // Refrescar la lista de productos después de la importación
    setVistaActual('lista');
    // Incrementar el contador para forzar la recarga de productos
    setRecargarProductos(prev => prev + 1);
  };

  return (
    <div className="gestion-productos">
      {vistaActual === 'lista' ? (
        <ListaProductos 
          onNuevoProducto={handleNuevoProducto}
          onEditarProducto={handleEditarProducto}
          onImportarExcel={handleImportarExcel}
          onImportarPresentaciones={handleImportarPresentaciones}
          onExportarExcel={handleExportarExcel}
          onExportarPresentaciones={handleExportarPresentaciones}
          onExportarEtiquetas={handleExportarEtiquetas}
          onMigrarProductos={handleMigrarProductos}
          recargarProductos={recargarProductos}
        />
      ) : (
        <FormularioProducto 
          producto={productoSeleccionado}
          onGuardar={handleGuardarProducto}
          onCancelar={handleCancelar}
        />
      )}
      
      <ImportarExcel 
          isOpen={modalImportarAbierto}
          onClose={() => setModalImportarAbierto(false)}
          onImportComplete={handleImportComplete}
        />
        
        <ImportarPresentacionesExcel 
           isOpen={modalImportarPresentacionesAbierto}
           onClose={() => setModalImportarPresentacionesAbierto(false)}
           onImportComplete={handleImportComplete}
         />
      
      <ExportarExcel 
        isOpen={modalExportarAbierto}
        onClose={() => setModalExportarAbierto(false)}
      />
      
      <ExportarPresentacionesExcel 
        isOpen={modalExportarPresentacionesAbierto}
        onClose={() => setModalExportarPresentacionesAbierto(false)}
      />
      
      {modalEtiquetasAbierto && (
        <ExportarEtiquetas 
          onCerrar={() => setModalEtiquetasAbierto(false)}
        />
      )}
      
      {modalMigracionAbierto && (
        <MigracionProductos 
          onCerrar={() => setModalMigracionAbierto(false)}
        />
      )}
    </div>
  );
}

export default GestionProductos;