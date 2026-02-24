
import React, { useState } from "react";
import apiClient from "../../services/apiService";

// Componente principal del modal vehículo para transporte privado
function NuevoVehículo({ onClose, onVehiculoCreado }) {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [vehiculoData, setVehiculoData] = useState({
    nroPlacaId: "",
    tucId: "",
    autorizacionMTCPlacaPrincipal: "",
    nroPlacaSecundariaId: "",
    tucPlacaSecundariaId: "",
    autorizacionMTCPlacaSecundaria: "",
    modeloVehiculo: "",
    marcaVehiculo: "",
    configuracion: false,
    predeterminado: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVehiculoData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const response = await apiClient.post('/vehiculos', vehiculoData);
      setMensaje("✅ Vehículo creado exitosamente");
      onVehiculoCreado(response.data.vehiculo);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      setMensaje(`❌ ${error.response?.data?.mensaje || 'Error al crear vehículo'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVehiculoData({
      nroPlacaId: "",
      tucId: "",
      autorizacionMTCPlacaPrincipal: "",
      nroPlacaSecundariaId: "",
      tucPlacaSecundariaId: "",
      autorizacionMTCPlacaSecundaria: "",
      modeloVehiculo: "",
      marcaVehiculo: "",
      configuracion: false,
      predeterminado: false
    });
    setMensaje("");
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#4a90e2",
              color: "white",
              borderRadius: "8px 8px 0 0",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              🚛 Nuevo Vehículo
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                color: "white",
                cursor: "pointer",
                padding: "0",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
            {/* Mensaje */}
            {mensaje && (
              <div
                style={{
                  padding: "10px",
                  marginBottom: "15px",
                  borderRadius: "4px",
                  backgroundColor: mensaje.includes("✅") ? "#d4edda" : "#f8d7da",
                  color: mensaje.includes("✅") ? "#155724" : "#721c24",
                  border: `1px solid ${mensaje.includes("✅") ? "#c3e6cb" : "#f5c6cb"}`,
                  fontSize: "12px",
                }}
              >
                {mensaje}
              </div>
            )}

            {/* Campos básicos */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
              {/* Número de Placa */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Nro. de Placa *
                </label>
                <input
                  type="text"
                  name="nroPlacaId"
                  value={vehiculoData.nroPlacaId}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  placeholder="Ej: ABC-123"
                />
              </div>

              {/* T.U.C */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  T.U.C ⓘ
                </label>
                <input
                  type="text"
                  name="tucId"
                  value={vehiculoData.tucId}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  placeholder="Tarjeta Única de Circulación"
                />
              </div>

              {/* Autorización MTC de Placa principal */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Autorización MTC de Placa principal
                </label>
                <input
                  type="text"
                  name="autorizacionMTCPlacaPrincipal"
                  value={vehiculoData.autorizacionMTCPlacaPrincipal}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  placeholder="Autorización MTC"
                />
              </div>

              {/* Nro. de Placa secundaria */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Nro. de Placa secundaria ⓘ
                </label>
                <input
                  type="text"
                  name="nroPlacaSecundariaId"
                  value={vehiculoData.nroPlacaSecundariaId}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  placeholder="Placa secundaria"
                />
              </div>

              {/* T.U.C Placa secundaria */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  T.U.C Placa secundaria ⓘ
                </label>
                <input
                  type="text"
                  name="tucPlacaSecundariaId"
                  value={vehiculoData.tucPlacaSecundariaId}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  placeholder="T.U.C secundaria"
                />
              </div>

              {/* Autorización MTC de Placa secundaria */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Autorización MTC de Placa secundaria
                </label>
                <input
                  type="text"
                  name="autorizacionMTCPlacaSecundaria"
                  value={vehiculoData.autorizacionMTCPlacaSecundaria}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  placeholder="Autorización MTC secundaria"
                />
              </div>

              {/* Modelo de vehículo */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Modelo de vehículo
                </label>
                <input
                  type="text"
                  name="modeloVehiculo"
                  value={vehiculoData.modeloVehiculo}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  placeholder="Ej: Sprinter"
                />
              </div>

              {/* Marca de vehículo */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Marca de vehículo
                </label>
                <input
                  type="text"
                  name="marcaVehiculo"
                  value={vehiculoData.marcaVehiculo}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  placeholder="Ej: Mercedes-Benz"
                />
              </div>
            </div>

         

            {/* Botones */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #6c757d",
                  borderRadius: "4px",
                  backgroundColor: "white",
                  color: "#6c757d",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: loading ? "#6c757d" : "#4a90e2",
                  color: "white",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "12px",
                }}
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default NuevoVehículo;