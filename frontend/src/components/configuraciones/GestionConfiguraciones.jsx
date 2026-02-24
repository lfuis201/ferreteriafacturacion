import React, { useState } from 'react';
import { Settings, FileText, MessageCircle, ArrowLeft } from 'lucide-react';
import ConfiguracionSunat from './ConfiguracionSunat';
import ConfiguracionWhatsapp from './ConfiguracionWhatsapp';
import '../../styles/GestionConfiguraciones.css';

const GestionConfiguraciones = () => {
  const [seccionActiva, setSeccionActiva] = useState('menu');

  const configuraciones = [
    {
      id: 'sunat',
      titulo: 'Configuración SUNAT',
      descripcion: 'Configure certificados digitales, credenciales SOL y parámetros para facturación electrónica',
      icon: FileText,
      color: '#667eea',
      componente: ConfiguracionSunat
    },
    {
      id: 'whatsapp',
      titulo: 'Configuración WhatsApp',
      descripcion: 'Configure el envío automático de comprobantes a clientes por WhatsApp',
      icon: MessageCircle,
      color: '#25d366',
      componente: ConfiguracionWhatsapp
    }
  ];

  const renderMenu = () => (
    <div className="configuraciones-menu">
      <div className="menu-header">
        <div className="header-content">
          <Settings className="header-icon" />
          <div>
            <h1>Centro de Configuraciones</h1>
            <p>Gestione todas las configuraciones del sistema desde un solo lugar</p>
          </div>
        </div>
      </div>

      <div className="configuraciones-grid">
        {configuraciones.map((config) => {
          const IconComponent = config.icon;
          return (
            <div
              key={config.id}
              className="configuracion-card"
              onClick={() => setSeccionActiva(config.id)}
              style={{ '--card-color': config.color }}
            >
              <div className="card-header">
                <div className="card-icon" style={{ backgroundColor: config.color }}>
                  <IconComponent />
                </div>
                <h3>{config.titulo}</h3>
              </div>
              <p>{config.descripcion}</p>
              <div className="card-footer">
                <span className="configurar-btn">Configurar →</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3>¿Necesita ayuda?</h3>
          <p>
            Las configuraciones son esenciales para el correcto funcionamiento del sistema de facturación electrónica.
            Asegúrese de completar todos los campos requeridos.
          </p>
          <ul>
            <li><strong>SUNAT:</strong> Requerido para emitir comprobantes electrónicos válidos</li>
            <li><strong>WhatsApp:</strong> Opcional, para envío automático de comprobantes a clientes</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderConfiguracion = () => {
    const config = configuraciones.find(c => c.id === seccionActiva);
    if (!config) return null;

    const ComponenteConfiguracion = config.componente;

    return (
      <div className="configuracion-detalle">
        <div className="detalle-header">
          <button 
            className="btn-volver"
            onClick={() => setSeccionActiva('menu')}
          >
            <ArrowLeft className="btn-icon" />
            Volver al menú
          </button>
        </div>
        
        <ComponenteConfiguracion />
      </div>
    );
  };

  return (
    <div className="gestion-configuraciones">
      {seccionActiva === 'menu' ? renderMenu() : renderConfiguracion()}
    </div>
  );
};

export default GestionConfiguraciones;