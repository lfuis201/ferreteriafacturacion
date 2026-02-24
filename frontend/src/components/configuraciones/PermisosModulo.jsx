import React, { useEffect, useMemo, useState } from 'react';
import { obtenerUsuarios } from '../../services/usuarioService';
import { obtenerValorConfiguracion, guardarConfiguracion } from '../../services/configuracionService';
import '../../styles/PermisosModulo.css';

const PermisosModulo = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [permisos, setPermisos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guardadoOk, setGuardadoOk] = useState('');

  const MODULOS = useMemo(() => ([
    { key: 'DASHBOARD', label: 'Dashboard' },
    { key: 'VENTAS', label: 'Ventas' },
    { key: 'COMPRAS', label: 'Compras' },
    { key: 'PRODUCTOS', label: 'Productos' },
    { key: 'INVENTARIO', label: 'Inventario' },
    { key: 'CONFIGURACIONES', label: 'Configuraciones' },
    { key: 'USUARIOS', label: 'Usuarios' },
    { key: 'SUCURSALES', label: 'Sucursales' },
    { key: 'GUIA_REMISION', label: 'Guía de Remisión' },
  ]), []);

  const CATEGORIA = 'SEGURIDAD';
  const buildClave = (id) => `PERMISOS_MODULOS_${id}`;

  const buildDefaultPermisos = () => {
    const base = {};
    MODULOS.forEach(m => {
      base[m.key] = { acceso: false, crear: false, editar: false, eliminar: false };
    });
    return base;
  };

  const cargarUsuarios = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerUsuarios();
      setUsuarios(data?.usuarios || []);
    } catch (e) {
      setError(e.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const cargarPermisosUsuario = async (id) => {
    if (!id) return;
    setLoading(true);
    setError('');
    setGuardadoOk('');
    try {
      const valor = await obtenerValorConfiguracion(buildClave(id), buildDefaultPermisos());
      setPermisos({ ...buildDefaultPermisos(), ...(valor || {}) });
    } catch (e) {
      setError(e.message || 'Error al cargar permisos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (usuarioId) cargarPermisosUsuario(usuarioId);
  }, [usuarioId]);

  const togglePermiso = (modKey, campo) => {
    setPermisos(prev => ({
      ...prev,
      [modKey]: { ...prev[modKey], [campo]: !prev[modKey][campo] }
    }));
  };

  const guardar = async () => {
    if (!usuarioId) {
      setError('Seleccione un usuario');
      return;
    }
    setLoading(true);
    setError('');
    setGuardadoOk('');
    try {
      await guardarConfiguracion({
        clave: buildClave(usuarioId),
        valor: permisos,
        tipo: 'JSON',
        descripcion: `Permisos de módulos para usuario ${usuarioId}`,
        categoria: CATEGORIA,
      });
      setGuardadoOk('Permisos guardados correctamente');
    } catch (e) {
      setError(e.message || 'Error al guardar permisos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="permisos-modulo">
      <h2 className="permisos-modulo__titulo">Permisos de módulo</h2>
      
      {error && <div className="permisos-modulo__mensaje permisos-modulo__mensaje--error">{error}</div>}
      {guardadoOk && <div className="permisos-modulo__mensaje permisos-modulo__mensaje--exito">{guardadoOk}</div>}
      
      <div className="permisos-modulo__selector">
        <label className="permisos-modulo__label">Usuario</label>
        <select 
          className="permisos-modulo__select"
          value={usuarioId} 
          onChange={(e) => setUsuarioId(e.target.value)} 
          disabled={loading}
        >
          <option value="">Seleccione un usuario</option>
          {usuarios.map(u => (
            <option key={u.id} value={u.id}>
              {u.nombre} {u.apellido} ({u.rol})
            </option>
          ))}
        </select>
      </div>

      {usuarioId && (
        <div className="permisos-modulo__contenido">
          <div className="permisos-modulo__tabla-contenedor">
            <table className="permisos-modulo__tabla">
              <thead className="permisos-modulo__tabla-cabecera">
                <tr>
                  <th className="permisos-modulo__th modulo">Módulo</th>
                  <th className="permisos-modulo__th">Acceso</th>
                  <th className="permisos-modulo__th">Crear</th>
                  <th className="permisos-modulo__th">Editar</th>
                  <th className="permisos-modulo__th">Eliminar</th>
                </tr>
              </thead>
              <tbody className="permisos-modulo__tabla-cuerpo">
                {MODULOS.map(m => (
                  <tr key={m.key} className="permisos-modulo__fila">
                    <td className="permisos-modulo__td permisos-modulo__modulo-nombre">{m.label}</td>
                    <td className="permisos-modulo__td permisos-modulo__celda-checkbox">
                      <input
                        type="checkbox"
                        className="permisos-modulo__checkbox"
                        checked={!!permisos[m.key]?.acceso}
                        onChange={() => togglePermiso(m.key, 'acceso')}
                      />
                    </td>
                    <td className="permisos-modulo__td permisos-modulo__celda-checkbox">
                      <input
                        type="checkbox"
                        className="permisos-modulo__checkbox"
                        checked={!!permisos[m.key]?.crear}
                        onChange={() => togglePermiso(m.key, 'crear')}
                        disabled={!permisos[m.key]?.acceso}
                      />
                    </td>
                    <td className="permisos-modulo__td permisos-modulo__celda-checkbox">
                      <input
                        type="checkbox"
                        className="permisos-modulo__checkbox"
                        checked={!!permisos[m.key]?.editar}
                        onChange={() => togglePermiso(m.key, 'editar')}
                        disabled={!permisos[m.key]?.acceso}
                      />
                    </td>
                    <td className="permisos-modulo__td permisos-modulo__celda-checkbox">
                      <input
                        type="checkbox"
                        className="permisos-modulo__checkbox"
                        checked={!!permisos[m.key]?.eliminar}
                        onChange={() => togglePermiso(m.key, 'eliminar')}
                        disabled={!permisos[m.key]?.acceso}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="permisos-modulo__acciones">
            <button 
              className="permisos-modulo__boton" 
              onClick={guardar} 
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar permisos'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermisosModulo;