import React, { useEffect, useState } from 'react';
import '../../styles/AvanzadoContable.css';
import { obtenerValorConfiguracion, guardarConfiguracion } from '../../services/configuracionService';

const CATEGORIA_CONTABILIDAD = 'CONTABILIDAD';
const CLAVE_CUENTAS_VENTA = 'CONTABILIDAD_CUENTAS_VENTA';

const AvanzadoContable = () => {
  const [cuentas, setCuentas] = useState({
    totalSoles: '',
    igvSoles: '',
    subtotalSoles: '',
    totalDolares: '',
    igvDolares: '',
    subtotalDolares: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCuentas({
      ...cuentas,
      [name]: value
    });
  };

  const cargarCuentas = async () => {
    setLoading(true);
    setError('');
    try {
      const valor = await obtenerValorConfiguracion(CLAVE_CUENTAS_VENTA, null);
      if (valor && typeof valor === 'object') {
        setCuentas({
          totalSoles: valor.totalSoles || '',
          igvSoles: valor.igvSoles || '',
          subtotalSoles: valor.subtotalSoles || '',
          totalDolares: valor.totalDolares || '',
          igvDolares: valor.igvDolares || '',
          subtotalDolares: valor.subtotalDolares || ''
        });
      }
    } catch (e) {
      setError(e.message || 'Error al cargar configuración contable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCuentas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGuardar = async () => {
    setLoading(true);
    setError('');
    try {
      await guardarConfiguracion({
        clave: CLAVE_CUENTAS_VENTA,
        valor: {
          totalSoles: (cuentas.totalSoles || '').trim(),
          igvSoles: (cuentas.igvSoles || '').trim(),
          subtotalSoles: (cuentas.subtotalSoles || '').trim(),
          totalDolares: (cuentas.totalDolares || '').trim(),
          igvDolares: (cuentas.igvDolares || '').trim(),
          subtotalDolares: (cuentas.subtotalDolares || '').trim()
        },
        tipo: 'JSON',
        descripcion: 'Cuentas contables para ventas (Soles y Dólares)',
        categoria: CATEGORIA_CONTABILIDAD,
        activo: true,
      });
      await cargarCuentas();
    } catch (e) {
      setError(e.message || 'Error al guardar configuración contable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ac-container">
      <div className="ac-section">
        <h2 className="ac-title">Cuentas contables (Ventas)</h2>
        {error && <div className="ac-error">{error}</div>}
        {loading && <div className="ac-loading">Cargando...</div>}

        <div className="ac-form-container">
          <div className="ac-row">
            <div className="ac-form-group">
              <label className="ac-label">Total Soles</label>
              <input 
                type="text" 
                name="totalSoles"
                className="ac-input"
                value={cuentas.totalSoles}
                onChange={handleChange}
                placeholder="Ej: 70111"
              />
            </div>
            <div className="ac-form-group">
              <label className="ac-label">IGV Soles</label>
              <input 
                type="text" 
                name="igvSoles"
                className="ac-input"
                value={cuentas.igvSoles}
                onChange={handleChange}
                placeholder="Ej: 40111"
              />
            </div>
            <div className="ac-form-group">
              <label className="ac-label">Subtotal Soles</label>
              <input 
                type="text" 
                name="subtotalSoles"
                className="ac-input"
                value={cuentas.subtotalSoles}
                onChange={handleChange}
                placeholder="Ej: 70111"
              />
            </div>
          </div>

          <div className="ac-row">
            <div className="ac-form-group">
              <label className="ac-label">Total Dólares</label>
              <input 
                type="text" 
                name="totalDolares"
                className="ac-input"
                value={cuentas.totalDolares}
                onChange={handleChange}
                placeholder="Ej: 70111"
              />
            </div>
            <div className="ac-form-group">
              <label className="ac-label">IGV Dólares</label>
              <input 
                type="text" 
                name="igvDolares"
                className="ac-input"
                value={cuentas.igvDolares}
                onChange={handleChange}
                placeholder="Ej: 40111"
              />
            </div>
            <div className="ac-form-group">
              <label className="ac-label">Subtotal Dólares</label>
              <input 
                type="text" 
                name="subtotalDolares"
                className="ac-input"
                value={cuentas.subtotalDolares}
                onChange={handleChange}
                placeholder="Ej: 70111"
              />
            </div>
          </div>

          <div className="ac-button-container">
            <button className="ac-btn-guardar" onClick={handleGuardar} disabled={loading}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvanzadoContable;