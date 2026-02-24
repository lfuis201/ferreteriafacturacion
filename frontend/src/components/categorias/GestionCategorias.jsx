import React, { useState } from 'react';
import ListaCategorias from './ListaCategorias';
import FormularioCategoria from './FormularioCategoria';

function GestionCategorias() {
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista' | 'formulario'
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const handleNuevaCategoria = () => {
    setCategoriaSeleccionada(null);
    setVistaActual('formulario');
  };

  const handleEditarCategoria = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setVistaActual('formulario');
  };

  const handleGuardarCategoria = (categoria) => {
    // Volver a la lista después de guardar
    setVistaActual('lista');
    setCategoriaSeleccionada(null);
  };

  const handleCancelar = () => {
    setVistaActual('lista');
    setCategoriaSeleccionada(null);
  };

  return (
    <div className="gestion-categorias">
      {vistaActual === 'lista' ? (
        <ListaCategorias 
          onNuevaCategoria={handleNuevaCategoria}
          onEditarCategoria={handleEditarCategoria}
        />
      ) : (
        <FormularioCategoria 
          categoria={categoriaSeleccionada}
          onGuardar={handleGuardarCategoria}
          onCancelar={handleCancelar}
        />
      )}
    </div>
  );
}

export default GestionCategorias;