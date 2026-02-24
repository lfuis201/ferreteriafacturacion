import React, { useEffect, useState } from 'react';
import { obtenerValorConfiguracion, guardarConfiguracion, eliminarConfiguracion } from '../../services/configuracionService';

// Editor de valores escalares (STRING, NUMBER, BOOLEAN, JSON) para Configuración
// Props: titulo, clave, tipo ('STRING' por defecto), categoria ('EMPRESA' por defecto)
const ScalarConfigEditor = ({ titulo, clave, tipo = 'STRING', categoria = 'EMPRESA' }) => {
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const valorPorDefecto = () => {
    if (tipo === 'NUMBER') return 0;
    if (tipo === 'BOOLEAN') return false;
    if (tipo === 'JSON') return {};
    return '';
  };

  const cargar = async () => {
    setLoading(true);
    setError('');
    setMensaje('');
    try {
      const v = await obtenerValorConfiguracion(clave);
      setValor(v ?? valorPorDefecto());
    } catch (e) {
      // Inicializar en BD si no existe
      try {
        await guardarConfiguracion({
          clave,
          categoria,
          tipo,
          valor: valorPorDefecto(),
          descripcion: `Inicializada automáticamente para ${titulo}`,
        });
        setValor(valorPorDefecto());
        setMensaje('Configuración creada por defecto');
      } catch (initErr) {
        setError(initErr.message || 'Error al inicializar configuración');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [clave, tipo]);

  const parseOut = (raw) => {
    if (tipo === 'NUMBER') return Number(raw);
    if (tipo === 'BOOLEAN') return !!raw;
    if (tipo === 'JSON') {
      if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return raw; }
      }
      return raw;
    }
    return raw;
  };

  const toInputValue = (v) => {
    if (tipo === 'BOOLEAN') return !!v;
    if (tipo === 'JSON') return typeof v === 'string' ? v : JSON.stringify(v);
    return v ?? '';
  };

  const guardar = async () => {
    setLoading(true);
    setError('');
    setMensaje('');
    try {
      await guardarConfiguracion({
        clave,
        categoria,
        tipo,
        valor: parseOut(valor),
        descripcion: `Configuración actualizada para ${titulo}`,
      });
      setMensaje('Guardado correctamente');
    } catch (e) {
      setError(e.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async () => {
    setLoading(true);
    setError('');
    setMensaje('');
    try {
      await eliminarConfiguracion(clave);
      setValor(valorPorDefecto());
      setMensaje('Eliminado correctamente');
    } catch (e) {
      setError(e.message || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>{titulo}</h3>
      {loading && <div>Cargando...</div>}
      {error && <div>{error}</div>}
      {mensaje && <div>{mensaje}</div>}

      <div>
        {tipo === 'BOOLEAN' ? (
          <label>
            <input
              type="checkbox"
              checked={toInputValue(valor)}
              onChange={(e) => setValor(e.target.checked)}
              disabled={loading}
            />
            Activo
          </label>
        ) : tipo === 'JSON' ? (
          <textarea
            rows={6}
            value={toInputValue(valor)}
            onChange={(e) => setValor(e.target.value)}
            placeholder='{"clave":"valor"}'
            disabled={loading}
          />
        ) : (
          <input
            type={tipo === 'NUMBER' ? 'number' : 'text'}
            value={toInputValue(valor)}
            onChange={(e) => setValor(e.target.value)}
            placeholder={tipo === 'NUMBER' ? '0' : 'Texto'}
            disabled={loading}
          />
        )}
      </div>

      <div>
        <button onClick={guardar} disabled={loading}>Guardar</button>
        <button onClick={eliminar} disabled={loading}>Eliminar configuración</button>
      </div>
    </div>
  );
};

export default ScalarConfigEditor;