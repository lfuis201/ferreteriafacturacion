import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/GaleriaImagenes.css';

function GaleriaImagenes({ producto, onCerrar }) {
  const [imagenActual, setImagenActual] = useState(0);

  if (!producto || !producto.imagen) {
    return null;
  }

  // Procesar las imágenes del producto (separadas por comas)
  const imagenesArray = producto.imagen.split(',').filter(img => img && img.trim() !== '');
  
  // Las URLs ya están completas desde el backend
  const imagenesValidas = imagenesArray.map(img => img.trim());

  if (imagenesValidas.length === 0) {
    return null;
  }

  const siguienteImagen = () => {
    setImagenActual((prev) => (prev + 1) % imagenesValidas.length);
  };

  const imagenAnterior = () => {
    setImagenActual((prev) => (prev - 1 + imagenesValidas.length) % imagenesValidas.length);
  };

  const irAImagen = (index) => {
    setImagenActual(index);
  };

  return (
    <div className="galeria-overlay" onClick={onCerrar}>
      <div className="galeria-modal" onClick={(e) => e.stopPropagation()}>
        <div className="galeria-header">
          <h3>{producto.nombre}</h3>
          <button className="btn-cerrar" onClick={onCerrar}>
            <X size={24} />
          </button>
        </div>

        <div className="galeria-contenido">
          <div className="imagen-principal">
            {imagenesValidas.length > 1 && (
              <button className="btn-navegacion btn-anterior" onClick={imagenAnterior}>
                <ChevronLeft size={24} />
              </button>
            )}
            
            <img 
              src={imagenesValidas[imagenActual]} 
              alt={`${producto.nombre} - Imagen ${imagenActual + 1}`}
              onError={(e) => {
                e.target.src = '/placeholder-product.png';
              }}
            />
            
            {imagenesValidas.length > 1 && (
              <button className="btn-navegacion btn-siguiente" onClick={siguienteImagen}>
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {imagenesValidas.length > 1 && (
            <div className="miniaturas">
              {imagenesValidas.map((imagen, index) => (
                <div 
                  key={index}
                  className={`miniatura ${index === imagenActual ? 'activa' : ''}`}
                  onClick={() => irAImagen(index)}
                >
                  <img 
                    src={imagen} 
                    alt={`Miniatura ${index + 1}`}
                    onError={(e) => {
                      e.target.src = '/placeholder-product.png';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="galeria-info">
          <span>{imagenActual + 1} de {imagenesValidas.length}</span>
        </div>
      </div>
    </div>
  );
}

export default GaleriaImagenes;