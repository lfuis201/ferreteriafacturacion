import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Building2, DollarSign, FileSpreadsheet, Zap } from 'lucide-react';
import { 
  listarConfiguraciones, 
  guardarConfiguracion, 
  eliminarConfiguracion, 
  obtenerConfiguracion 
} from '../../services/configuracionService';  


import ListConfigEditor from './ListConfigEditor'; 
import ScalarConfigEditor from './ScalarConfigEditor'; 
import EmpresaConfig from './Empresaconfig';
import ListadoAtributos from './ListadoAtributos';
import ListadoTipodetraccion from './ListadoTipodetraccion';
import ListadoUnidades from './ListadoUnidades';
import TiposMotivos from './TiposMotivos';



import MetodosPago from './MetodosPago';
import MotivoIngreso from './MotivoIngreso';
import ListadoMetodPago from './ListadoMetodPago';
import ComprobanteIngresoGasto from './ComprobanteIngresoGasto';
import NumeroFacturacion from './NumeroFacturacion';
import AvanzadoContable from './AvanzadoContable';
import Inventario from './inventario'; 
import PermisosModulo from './PermisosModulo';



import '../../styles/Configuraciones.css';

const Configuraciones = () => {
  const sections = useMemo(() => ([
    {
      title: 'General',
      items: [
        { icon: <FileText size={16} />, label: 'Listado de bancos' },
        { icon: <FileText size={16} />, label: 'Listado de cuentas bancarias' },
        { icon: <FileText size={16} />, label: 'Lista de monedas' },
        { icon: <FileText size={16} />, label: 'Listado de tarjetas' },
        { icon: <FileText size={16} />, label: 'Lista de almacenes' },
        { icon: <FileText size={16} />, label: 'Lista de agencias' },
      ]
    },

    
    {
      title: 'Empresa',
      items: [
        { icon: <Building2 size={16} />, label: 'Empresa' },
        { icon: <Building2 size={16} />, label: 'Permisos de módulo' }, 
      
        { icon: <Building2 size={16} />, label: 'Habilita elementos de taller mecánico' },  
        { icon: <Building2 size={16} />, label: 'Habilita elementos de farmacia' },  

      ]
    }, 
    
    {
      title: 'SUNAT',
      items: [
        { icon: <FileText size={16} />, label: 'Listado de Atributos' },
        { icon: <FileText size={16} />, label: 'Listado de tipos de detracciones' },
        { icon: <FileText size={16} />, label: 'Listado de unidades' },
        { icon: <FileText size={16} />, label: 'Tipos de motivos de transferencias' },
      ]
    },
    {
      title: 'Ingreso/Egresos',
      items: [
        { icon: <DollarSign size={16} />, label: 'Métodos de pago - ingreso / gastos' },
        { icon: <FileText size={16} />, label: 'Motivos de ingresos / Gastos' },
        { icon: <FileText size={16} />, label: 'Listado de métodos de pago' },
        { icon: <FileText size={16} />, label: 'comprobantes ingreso / Gastos' },
      ]
    }, 

    
   // {
     // title: 'Plantillas PDF',
    //  items: [
     //   { icon: <FileSpreadsheet size={16} />, label: 'PDF' },
    //    { icon: <FileSpreadsheet size={16} ///     { icon: <FileSpreadsheet size={16} />, label: 'Pre Impresos' },
   //     { icon: <FileSpreadsheet size={16} />, label: 'PDF - Unidades de medida' },
    //    { icon: <FileSpreadsheet size={16} />, label: 'PDF - Denominación' },
   //     { icon: <FileSpreadsheet size={16} />, label: 'PDF - Casilla personalizada' },
   //     { icon: <FileSpreadsheet size={16} />, label: 'PDF - QR - Yape/Plin' },
   //   ]
  //  }, 






  
    {
      title: 'Avanzado',
      items: [
      
        { icon: <FileText size={16} />, label: 'Numeración de facturación' },
        { icon: <FileText size={16} />, label: 'Avanzado - Contable' },
        { icon: <FileText size={16} />, label: 'Inventarios' },
      
      ]
    }
  ]), []);

  const CATEGORY_MAP = {
    'Listado de bancos': 'GENERAL',
    'Listado de cuentas bancarias': 'GENERAL',
    'Lista de monedas': 'GENERAL',
    'Listado de tarjetas': 'GENERAL',
    'Lista de almacenes': 'ALMACENES',
    'Lista de agencias': 'AGENCIAS',
    'Empresa': 'EMPRESA',
    'Permisos de módulo': 'EMPRESA',




    'Habilita elementos de taller mecánico': 'EMPRESA',
    'Habilita elementos de farmacia': 'EMPRESA',
    'MultiEmpresa': 'EMPRESA',





    'Giro de negocio': 'EMPRESA',
    'Avanzado': 'AVANZADO',
    'Accesos directos': 'EMPRESA',
    'Dashboard - Ventas - Compras': 'EMPRESA',
    'Listado de Atributos': 'SUNAT',
    'Listado de tipos de detracciones': 'SUNAT',
    'Listado de unidades': 'SUNAT',
    'Tipos de motivos de transferencias': 'SUNAT',
    'Métodos de pago - ingreso / gastos': 'INGRESOS_EGRESOS',
    'Motivos de ingresos / Gastos': 'INGRESOS_EGRESOS',
    'Listado de métodos de pago': 'INGRESOS_EGRESOS',
    'comprobantes ingreso / Gastos': 'INGRESOS_EGRESOS',
    'PDF': 'PDF',
    'PDF - Ticket': 'PDF',
    'Pre Impresos': 'PDF',
    'PDF - Unidades de medida': 'PDF',
    'PDF - Denominación': 'PDF',
    'PDF - Casilla personalizada': 'PDF',
    'PDF - QR - Yape/Plin': 'PDF',
    'Tareas programadas': 'AVANZADO',
    'Numeración de facturación': 'FACTURACION',
    'Avanzado - Contable': 'CONTABILIDAD',
    'Inventarios': 'INVENTARIOS',
    'Nota de ventas': 'VENTAS',
  };

  const [vista, setVista] = useState('menu');
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [configuraciones, setConfiguraciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);
  const [form, setForm] = useState({ clave: '', valor: '', tipo: 'STRING', descripcion: '' });
  const [selectedTipo, setSelectedTipo] = useState('STRING');
  const [selectedEditor, setSelectedEditor] = useState(null); // 'list' | 'scalar'
  const [customView, setCustomView] = useState(null); // vista específica para SUNAT

  const cargarConfiguraciones = async (categoria) => {
    setLoading(true);
    setError('');
    try {
      const lista = await listarConfiguraciones({ categoria });
      setConfiguraciones(lista);
    } catch (e) {
      setError(e.message || 'Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  // Claves específicas para las 6 opciones de 'General'
  const KEY_MAP = {
    'Listado de bancos': 'BANCOS',
    'Listado de cuentas bancarias': 'CUENTAS_BANCARIAS',
    'Lista de monedas': 'MONEDAS',
    'Listado de tarjetas': 'TARJETAS',
    'Lista de almacenes': 'ALMACENES',
    'Lista de agencias': 'AGENCIAS',
  };

  // Opciones específicas de 'Empresa' con clave y tipo
  const SCALAR_MAP = {
    'MultiEmpresa': { key: 'MULTI_EMPRESA', tipo: 'BOOLEAN', categoria: 'EMPRESA' },
    'Giro de negocio': { key: 'GIRO_NEGOCIO', tipo: 'STRING', categoria: 'EMPRESA' },


    
    'Habilita elementos de taller mecánico': { key: 'TALLER_MECANICO_HABILITADO', tipo: 'BOOLEAN', categoria: 'EMPRESA' },
    'Habilita elementos de farmacia': { key: 'FARMACIA_ELEMENTOS_HABILITADO', tipo: 'BOOLEAN', categoria: 'EMPRESA' },
  };

  // Mapeo de opciones SUNAT a vistas específicas
  const CUSTOM_VIEW_MAP = {
    'Listado de Atributos': 'atributos',
    'Listado de tipos de detracciones': 'detracciones',
    'Listado de unidades': 'unidades',
    'Tipos de motivos de transferencias': 'motivos',
    // Ingresos/Egresos
    'Métodos de pago - ingreso / gastos': 'metodosPago',
    'Motivos de ingresos / Gastos': 'motivoIngreso',
    'Listado de métodos de pago': 'listadoMetodPago',
    'comprobantes ingreso / Gastos': 'comprobanteIngresoGasto',
    // Avanzado
    'Numeración de facturación': 'numeroFacturacion',
    'Avanzado - Contable': 'avanzadoContable',
    'Inventarios': 'inventario',
    // Empresa
    'Permisos de módulo': 'permisosModulo',
  };

  const onClickItem = async (label) => {
    const categoria = CATEGORY_MAP[label] || 'GENERAL';
    setItemSeleccionado(label);
    setCategoriaSeleccionada(categoria);

    // Redirigir explícitamente a la vista de EmpresaConfig
    if (label === 'Empresa') {
      setSelectedKey(null);
      setSelectedEditor(null);
      setCustomView(null);
      setVista('empresa');
      return;
    }

    // Redirigir a componentes personalizados para SUNAT
    const view = CUSTOM_VIEW_MAP[label];
    if (view) {
      setSelectedKey(null);
      setSelectedEditor(null);
      setCustomView(view);
      setVista('custom');
      return;
    }
    const keyList = KEY_MAP[label];
    if (keyList) {
      setSelectedKey(keyList);
      setSelectedEditor('list');
      setVista('list');
      return;
    }

    const scalar = SCALAR_MAP[label];
    if (scalar) {
      setSelectedKey(scalar.key);
      setSelectedTipo(scalar.tipo);
      setSelectedEditor('scalar');
      setVista('scalar');
      return;
    }

    setVista('detalle');
    await cargarConfiguraciones(categoria);
  };

  const parseValorPorTipo = (valor, tipo) => {
    if (tipo === 'NUMBER') return Number(valor);
    if (tipo === 'BOOLEAN') return valor === 'true' || valor === true;
    if (tipo === 'JSON') {
      try { return JSON.parse(valor); } catch { return valor; }
    }
    return valor;
  };

  const guardar = async () => {
    if (!form.clave) { setError('Clave requerida'); return; }
    setLoading(true);
    setError('');
    try {
      const payload = {
        clave: form.clave,
        valor: parseValorPorTipo(form.valor, form.tipo),
        tipo: form.tipo,
        descripcion: form.descripcion || '',
        categoria: categoriaSeleccionada || 'GENERAL',
      };
      await guardarConfiguracion(payload);
      await cargarConfiguraciones(categoriaSeleccionada);
      setForm({ clave: '', valor: '', tipo: 'STRING', descripcion: '' });
    } catch (e) {
      setError(e.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const editar = async (clave) => {
    setLoading(true);
    setError('');
    try {
      const cfg = await obtenerConfiguracion(clave);
      setForm({
        clave: cfg.clave,
        valor: typeof cfg.valor === 'object' ? JSON.stringify(cfg.valor) : String(cfg.valor),
        tipo: cfg.tipo || 'STRING',
        descripcion: cfg.descripcion || '',
      });
    } catch (e) {
      setError(e.message || 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (clave) => {
    setLoading(true);
    setError('');
    try {
      await eliminarConfiguracion(clave);
      await cargarConfiguraciones(categoriaSeleccionada);
    } catch (e) {
      setError(e.message || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="config-dashboard">
      {vista === 'menu' && (
        <>
          <div className="config-header">
            <div className="config-breadcrumb">
              <span className="config-breadcrumb-home">🏠</span>
              <span className="config-breadcrumb-text">DASHBOARD</span>
              <span className="config-breadcrumb-separator">/</span>
              <span className="config-breadcrumb-current">CONFIGURACIÓN</span>
            </div>
          </div>

          <div className="config-grid">
            {sections.map((section, idx) => (
              <div key={idx} className="config-card">
                <h3 className="config-card-title">{section.title}</h3>
                <div className="config-card-items">
                  {section.items.map((item, itemIdx) => (
                    <div 
                      key={itemIdx} 
                      className="config-item"
                      onClick={() => onClickItem(item.label)}
                    >
                      <span className="config-item-icon">{item.icon}</span>
                      <span className="config-item-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {vista === 'list' && selectedKey && (
        <div>
          <div>
            <button onClick={() => { setVista('menu'); setItemSeleccionado(null); setSelectedKey(null); }}>
              ← Volver
            </button>
          </div>
          <ListConfigEditor titulo={itemSeleccionado} clave={selectedKey} categoria="GENERAL" />
        </div>
      )}

      {vista === 'scalar' && selectedKey && (
        <div>
          <div>
            <button onClick={() => { setVista('menu'); setItemSeleccionado(null); setSelectedKey(null); }}>
              ← Volver
            </button>
          </div>
          <ScalarConfigEditor titulo={itemSeleccionado} clave={selectedKey} tipo={selectedTipo} categoria={categoriaSeleccionada || 'EMPRESA'} />
        </div>
      )}

      {vista === 'empresa' && (
        <div>
          <div>
            <button onClick={() => { setVista('menu'); setItemSeleccionado(null); }}>
              ← Volver
            </button>
          </div>
      <EmpresaConfig />
    </div>
  )}

  {vista === 'custom' && customView && (
    <div>
      <div>
        <button onClick={() => { setVista('menu'); setItemSeleccionado(null); setCustomView(null); }}>
          ← Volver
        </button>
      </div>
      {customView === 'atributos' && <ListadoAtributos />}
      {customView === 'detracciones' && <ListadoTipodetraccion />}
      {customView === 'unidades' && <ListadoUnidades />}
      {customView === 'motivos' && <TiposMotivos />}
      {customView === 'metodosPago' && <MetodosPago />}
      {customView === 'motivoIngreso' && <MotivoIngreso />}
      {customView === 'listadoMetodPago' && <ListadoMetodPago />}
      {customView === 'comprobanteIngresoGasto' && <ComprobanteIngresoGasto />}
      {customView === 'numeroFacturacion' && <NumeroFacturacion />}
      {customView === 'avanzadoContable' && <AvanzadoContable />}
      {customView === 'inventario' && <Inventario />}
      {customView === 'permisosModulo' && <PermisosModulo />}
    </div>
  )}

  {vista === 'detalle' && (
    <div>
      <div>
        <button onClick={() => { setVista('menu'); setItemSeleccionado(null); setConfiguraciones([]); }}>
          ← Volver
            </button>
            <h3>{itemSeleccionado} ({categoriaSeleccionada})</h3>
          </div>

          {error && <div>{error}</div>}
          {loading && <div>Cargando...</div>}

          <div>
            <h4>Configuraciones</h4>
            {configuraciones.length === 0 && <div>Sin configuraciones en esta categoría.</div>}
            {configuraciones.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Clave</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {configuraciones.map((cfg) => (
                    <tr key={cfg.clave}>
                      <td>{cfg.clave}</td>
                      <td>{cfg.tipo}</td>
                      <td>{typeof cfg.valor === 'object' ? JSON.stringify(cfg.valor) : String(cfg.valor)}</td>
                      <td>
                        <button onClick={() => editar(cfg.clave)}>Editar</button>
                        <button onClick={() => eliminar(cfg.clave)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div>
            <h4>{form.clave ? 'Editar configuración' : 'Nueva configuración'}</h4>
            <div>
              <label>Clave</label>
              <input 
                type="text" 
                value={form.clave} 
                onChange={(e) => setForm({ ...form, clave: e.target.value })} 
                placeholder="Ej: IGV_VISIBLE" 
              />
            </div>
            <div>
              <label>Tipo</label>
              <select 
                value={form.tipo} 
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              >
                <option value="STRING">STRING</option>
                <option value="NUMBER">NUMBER</option>
                <option value="BOOLEAN">BOOLEAN</option>
                <option value="JSON">JSON</option>
              </select>
            </div>
            <div>
              <label>Valor</label>
              <input 
                type="text" 
                value={form.valor} 
                onChange={(e) => setForm({ ...form, valor: e.target.value })} 
                placeholder='Ej: true, 18, PEN o {"k":1}' 
              />
            </div>
            <div>
              <label>Descripción</label>
              <input 
                type="text" 
                value={form.descripcion} 
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
                placeholder="Descripción opcional" 
              />
            </div>

            <div>
              <button onClick={guardar} disabled={loading}>Guardar</button>
              <button onClick={() => setForm({ clave: '', valor: '', tipo: 'STRING', descripcion: '' })} disabled={loading}>
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuraciones;