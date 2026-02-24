import React, { useEffect, useState } from 'react';
import { obtenerValorConfiguracion, guardarConfiguracion } from '../../services/configuracionService';

// Editor simple de listas (array de strings) guardadas como JSON en Configuración
// Props: titulo, clave, categoria (por defecto 'GENERAL')
const ListConfigEditor = ({ titulo, clave, categoria = 'GENERAL' }) => {
  const [items, setItems] = useState([]);
  const [nuevoItem, setNuevoItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  const persistItems = async (nuevosItems, successMsg = 'Guardado correctamente') => {
    setLoading(true);
    setError('');
    setMensaje('');
    try {
      await guardarConfiguracion({
        clave,
        categoria,
        tipo: 'JSON',
        valor: nuevosItems,
        descripcion: `Lista configurada para ${titulo}`,
      });
      setItems(nuevosItems);
      setMensaje(successMsg);
    } catch (e) {
      setError(e.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const cargar = async () => {
    setLoading(true);
    setError('');
    setMensaje('');
    try {
      // Obtener el valor ya parseado desde el backend (JSON -> array)
      const valor = await obtenerValorConfiguracion(clave, '[]');
      let lista = [];
      if (Array.isArray(valor)) {
        lista = valor;
      } else if (typeof valor === 'string') {
        try { lista = JSON.parse(valor); } catch { lista = []; }
        if (!Array.isArray(lista)) lista = [];
      }
      setItems(lista);
    } catch (e) {
      // Si no existe en backend, iniciamos vacío y creamos configuración por defecto
      setItems([]);
      try {
        await guardarConfiguracion({
          clave,
          categoria,
          tipo: 'JSON',
          valor: [],
          descripcion: `Inicializada automáticamente para ${titulo}`,
        });
        setMensaje('Configuración creada por defecto');
      } catch (initErr) {
        // Ignorar errores de inicialización silenciosamente para no romper la vista
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [clave]);

  const agregar = () => {
    const val = (nuevoItem || '').trim();
    if (!val) return;
    if (items.includes(val)) { setMensaje('Elemento ya existe'); return; }
    const nuevos = [...items, val];
    setNuevoItem('');
    // Guardar inmediatamente en BD
    persistItems(nuevos, 'Elemento agregado y guardado');
  };

  const quitar = (val) => {
    const nuevos = items.filter((x) => x !== val);
    // Guardar inmediatamente en BD
    persistItems(nuevos, 'Elemento eliminado y guardado');
  };

  const iniciarEdicion = (index) => {
    setEditIndex(index);
    setEditValue(items[index] ?? '');
  };

  const cancelarEdicion = () => {
    setEditIndex(null);
    setEditValue('');
  };

  const confirmarEdicion = () => {
    const val = (editValue || '').trim();
    if (!val) { cancelarEdicion(); return; }
    const nuevos = [...items];
    nuevos[editIndex] = val;
    cancelarEdicion();
    // Guardar inmediatamente en BD
    persistItems(nuevos, 'Elemento actualizado y guardado');
  };

  const guardar = async () => {
    setLoading(true);
    setError('');
    setMensaje('');
    try {
      await guardarConfiguracion({
        clave,
        categoria,
        tipo: 'JSON',
        valor: items,
        descripcion: `Lista configurada para ${titulo}`,
      });
      setMensaje('Guardado correctamente');
    } catch (e) {
      setError(e.message || 'Error al guardar');
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
        <input 
          type="text" 
          placeholder={`Nuevo elemento en ${titulo}`} 
          value={nuevoItem}
          onChange={(e) => setNuevoItem(e.target.value)}
        />
        <button onClick={agregar} disabled={loading}>Agregar</button>
      </div>

      <ul>
        {items.map((val, idx) => (
          <li key={`${val}-${idx}`}>
            {editIndex === idx ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button onClick={confirmarEdicion} disabled={loading}>Actualizar</button>
                <button onClick={cancelarEdicion} disabled={loading}>Cancelar</button>
              </>
            ) : (
              <>
                <span>{val}</span>
                <button onClick={() => iniciarEdicion(idx)} disabled={loading}>Editar</button>
                <button onClick={() => quitar(val)} disabled={loading}>Quitar</button>
              </>
            )}
          </li>
        ))}
      </ul>

      <div>
        <button onClick={guardar} disabled={loading}>Guardar cambios</button>
      </div>
    </div>
  );
};

export default ListConfigEditor;