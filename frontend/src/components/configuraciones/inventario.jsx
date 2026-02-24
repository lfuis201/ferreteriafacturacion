import React, { useEffect, useState } from 'react';
import { listarConfiguraciones, obtenerValorConfiguracion, guardarConfiguracion } from '../../services/configuracionService';
import '../../styles/Inventario.css';

const Inventario = () => {
  const [configuraciones, setConfiguraciones] = useState({
    ventaRestriccionStock: false,
    revisionInventario: false,
    generarCodigoProducto: false,
    validarStockAgregar: false,
    confirmarRechazarTraslados: false,
    realizarPedidosStock: false,
    productosCompuestosAlmacen: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const CATEGORIA = 'INVENTARIO';
  const CLAVE = 'INVENTARIO_OPCIONES';

  const cargarConfiguraciones = async () => {
    setLoading(true);
    setError('');
    try {
      // Intentar obtener valor JSON de configuración
      const valor = await obtenerValorConfiguracion(CLAVE, configuraciones);
      if (valor && typeof valor === 'object') {
        setConfiguraciones({
          ...configuraciones,
          ...valor
        });
      } else {
        // Si no existe, crear configuración inicial en backend
        await guardarConfiguracion({
          clave: CLAVE,
          valor: configuraciones,
          tipo: 'JSON',
          descripcion: 'Opciones avanzadas de inventario',
          categoria: CATEGORIA
        });
      }
    } catch (e) {
      setError(e.message || 'Error cargando configuraciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConfiguraciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (campo) => {
    const nuevas = {
      ...configuraciones,
      [campo]: !configuraciones[campo]
    };
    setConfiguraciones(nuevas);
    // Guardar inmediatamente cada cambio
    guardarConfiguracion({
      clave: CLAVE,
      valor: nuevas,
      tipo: 'JSON',
      descripcion: 'Opciones avanzadas de inventario',
      categoria: CATEGORIA
    }).catch(() => {
      // Si falla el guardado, revertir visualmente no es crítico, mostramos error
      setError('No se pudo guardar la configuración');
    });
  };

  const handleGenerar = () => {
    console.log('Generando códigos internos...');
    // Lógica para generar códigos
  };

  return (
    <div className="inv-container">
      {loading && (
        <div className="inv-loading">Cargando configuraciones...</div>
      )}
      {error && (
        <div className="inv-error">{error}</div>
      )}
      <div className="inv-section">
        <h2 className="inv-title">Configuraciones</h2>

        <div className="inv-grid">
          {/* Columna Izquierda */}
          <div className="inv-column">
            {/* Venta con restricción de stock */}
            <div className="inv-config-item">
              <div className="inv-config-header">
                <span className="inv-config-label">
                  Venta con restricción de stock <span className="inv-info-icon">ⓘ</span>
                </span>
              </div>
              <div className="inv-toggle-container">
                <span className="inv-toggle-text">No</span>
                <label className="inv-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={configuraciones.ventaRestriccionStock}
                    onChange={() => handleToggle('ventaRestriccionStock')}
                  />
                  <span className="inv-toggle-slider"></span>
                </label>
                <span className="inv-toggle-text">Si</span>
              </div>
            </div>

            {/* Revisión de inventario */}
            <div className="inv-config-item">
              <div className="inv-config-header">
                <span className="inv-config-label">
                  Revisión de inventario <span className="inv-info-icon">ⓘ</span>
                </span>
              </div>
              <div className="inv-toggle-container">
                <span className="inv-toggle-text">No</span>
                <label className="inv-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={configuraciones.revisionInventario}
                    onChange={() => handleToggle('revisionInventario')}
                  />
                  <span className="inv-toggle-slider"></span>
                </label>
                <span className="inv-toggle-text">Si</span>
              </div>
            </div>

            {/* Generar automáticamente código interno de productos existentes 
            <div className="inv-config-item">
              <div className="inv-config-header">
                <span className="inv-config-label">
                  Generar automáticamente código interno de productos existentes
                </span>
              </div>
              <button className="inv-btn-generar" onClick={handleGenerar}>
                Generar
              </button>
            </div>*/}

            {/* Realizar pedidos solo con stock disponible */}
            <div className="inv-config-item">
              <div className="inv-config-header">
                <span className="inv-config-label">
                  Realizar pedidos solo con stock disponible
                </span>
              </div>
              <div className="inv-toggle-container">
                <span className="inv-toggle-text">No</span>
                <label className="inv-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={configuraciones.realizarPedidosStock}
                    onChange={() => handleToggle('realizarPedidosStock')}
                  />
                  <span className="inv-toggle-slider"></span>
                </label>
                <span className="inv-toggle-text">Si</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="inv-column">
            {/* Generar automáticamente código interno del producto */}
            <div className="inv-config-item">
              <div className="inv-config-header">
                <span className="inv-config-label">
                  Generar automáticamente código interno del producto
                </span>
              </div>
              <div className="inv-toggle-container">
                <span className="inv-toggle-text">No</span>
                <label className="inv-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={configuraciones.generarCodigoProducto}
                    onChange={() => handleToggle('generarCodigoProducto')}
                  />
                  <span className="inv-toggle-slider"></span>
                </label>
                <span className="inv-toggle-text">Si</span>
              </div>
            </div>

            {/* Validar stock al agregar producto */}
            <div className="inv-config-item">
              <div className="inv-config-header">
                <span className="inv-config-label">
                  Validar stock al agregar producto <span className="inv-info-icon">ⓘ</span>
                </span>
              </div>
              <div className="inv-toggle-container">
                <span className="inv-toggle-text">No</span>
                <label className="inv-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={configuraciones.validarStockAgregar}
                    onChange={() => handleToggle('validarStockAgregar')}
                  />
                  <span className="inv-toggle-slider"></span>
                </label>
                <span className="inv-toggle-text">Si</span>
              </div>
            </div>

            {/* Confirmar / Rechazar traslados */}
            <div className="inv-config-item">
              <div className="inv-config-header">
                <span className="inv-config-label">
                  Confirmar / Rechazar traslados
                </span>
              </div>
              <div className="inv-toggle-container">
                <span className="inv-toggle-text">No</span>
                <label className="inv-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={configuraciones.confirmarRechazarTraslados}
                    onChange={() => handleToggle('confirmarRechazarTraslados')}
                  />
                  <span className="inv-toggle-slider"></span>
                </label>
                <span className="inv-toggle-text">Si</span>
              </div>
            </div>

            {/* Productos compuestos por almacén */}
            <div className="inv-config-item">
              <div className="inv-config-header">
                <span className="inv-config-label">
                  Productos compuestos por almacén
                </span>
              </div>
              <div className="inv-toggle-container">
                <span className="inv-toggle-text">No</span>
                <label className="inv-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={configuraciones.productosCompuestosAlmacen}
                    onChange={() => handleToggle('productosCompuestosAlmacen')}
                  />
                  <span className="inv-toggle-slider"></span>
                </label>
                <span className="inv-toggle-text">Si</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventario;