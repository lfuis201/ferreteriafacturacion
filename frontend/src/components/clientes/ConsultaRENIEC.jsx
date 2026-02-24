import React, { useState } from 'react';
import RENIECService from '../../services/reniecService';
import './ConsultaRENIEC.css';

const ConsultaRENIEC = () => {
  const [dni, setDni] = useState('');
  const [datosRENIEC, setDatosRENIEC] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDNIChange = (e) => {
    const value = e.target.value;
    // Solo permitir números y máximo 8 dígitos
    if (/^\d{0,8}$/.test(value)) {
      setDni(value);
      setError('');
      setDatosRENIEC(null);
    }
  };

  const handleConsultar = async () => {
    if (!RENIECService.validarDNI(dni)) {
      setError('El DNI debe tener 8 dígitos numéricos');
      return;
    }

    setLoading(true);
    setError('');
    setDatosRENIEC(null);

    try {
      const resultado = await RENIECService.consultarPorDNI(dni);
      setDatosRENIEC(resultado);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setDni('');
    setDatosRENIEC(null);
    setError('');
  };

  return (
    <div className="consulta-reniec">
      <h2>Consulta de Datos RENIEC</h2>
      
      <div className="form-group">
        <label htmlFor="dni">Número de DNI:</label>
        <input
          type="text"
          id="dni"
          value={dni}
          onChange={handleDNIChange}
          placeholder="Ingrese 8 dígitos del DNI"
          maxLength="8"
          className="dni-input"
        />
        <small>Ingrese solo los 8 dígitos del DNI</small>
      </div>

      <div className="button-group">
        <button 
          onClick={handleConsultar} 
          disabled={loading || !dni || dni.length !== 8}
          className="btn-consultar"
        >
          {loading ? 'Consultando...' : 'Consultar RENIEC'}
        </button>
        
        <button 
          onClick={handleLimpiar} 
          className="btn-limpiar"
        >
          Limpiar
        </button>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {datosRENIEC && (
        <div className="resultado-reniec">
          <h3>Datos Obtenidos de RENIEC</h3>
          
          <div className="datos-grid">
            <div className="dato-item">
              <label>Nombre Completo:</label>
              <span>{datosRENIEC.nombreCompleto || 'No disponible'}</span>
            </div>
            
            <div className="dato-item">
              <label>Nombres:</label>
              <span>{datosRENIEC.datos.nombres || 'No disponible'}</span>
            </div>
            
            <div className="dato-item">
              <label>Apellido Paterno:</label>
              <span>{datosRENIEC.datos.apellidoPaterno || 'No disponible'}</span>
            </div>
            
            <div className="dato-item">
              <label>Apellido Materno:</label>
              <span>{datosRENIEC.datos.apellidoMaterno || 'No disponible'}</span>
            </div>
            
            <div className="dato-item">
              <label>Dirección:</label>
              <span>{datosRENIEC.datos.direccion || 'No disponible'}</span>
            </div>
            
            <div className="dato-item">
              <label>Ubigeo:</label>
              <span>{datosRENIEC.datos.ubigeo || 'No disponible'}</span>
            </div>
            
            {datosRENIEC.datos.distrito && (
              <div className="dato-item">
                <label>Distrito:</label>
                <span>{datosRENIEC.datos.distrito}</span>
              </div>
            )}
            
            {datosRENIEC.datos.provincia && (
              <div className="dato-item">
                <label>Provincia:</label>
                <span>{datosRENIEC.datos.provincia}</span>
              </div>
            )}
            
            {datosRENIEC.datos.departamento && (
              <div className="dato-item">
                <label>Departamento:</label>
                <span>{datosRENIEC.datos.departamento}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="info-adicional">
        <h4>Información Adicional</h4>
        <ul>
          <li>Esta consulta utiliza APIs gratuitas de RENIEC</li>
          <li>Los datos se obtienen en tiempo real</li>
          <li>Si una API falla, se intenta con alternativas</li>
          <li>El DNI debe ser válido y estar activo</li>
        </ul>
      </div>
    </div>
  );
};

export default ConsultaRENIEC;
