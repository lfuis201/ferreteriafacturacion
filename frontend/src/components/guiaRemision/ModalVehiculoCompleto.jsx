import React, { useState } from 'react';
import apiClient from "../../services/apiService";

function ModalVehiculoCompleto({ isOpen, onClose, onVehiculoCreado }) {
  const [vehiculoData, setVehiculoData] = useState({
    nroPlacaId: "",
    tucId: "",
    autorizacionMTCPlacaPrincipal: "",
    nroPlacaSecundaria: "",
    tucPlacaSecundaria: "",
    autorizacionMTCPlacaSecundaria: "",
    modeloVehiculo: "",
    marcaVehiculo: "",
    configuracion: "",
    predeterminado: false
  });

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

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
      
      if (response.data && response.data.vehiculo) {
        setMensaje("✅ Vehículo creado exitosamente");
        onVehiculoCreado(response.data.vehiculo);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      setMensaje(`❌ Error al crear vehículo: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
            maxWidth: "700px",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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
            }}
          >
            <h2 style={{ margin: 0, fontSize: "18px" }}>
              Nuevo Vehículo
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {/* Nro. de Placa */}
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
                  Nro. de Placa <span style={{ color: "#666" }}>ℹ️</span>
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
                  T.U.C <span style={{ color: "#666" }}>ℹ️</span>
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
                  Nro. de Placa secundaria <span style={{ color: "#666" }}>ℹ️</span>
                </label>
                <input
                  type="text"
                  name="nroPlacaSecundaria"
                  value={vehiculoData.nroPlacaSecundaria}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
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
                  T.U.C Placa secundaria <span style={{ color: "#666" }}>ℹ️</span>
                </label>
                <input
                  type="text"
                  name="tucPlacaSecundaria"
                  value={vehiculoData.tucPlacaSecundaria}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
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
                />
              </div>

              {/* Configuración */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Configuración
                </label>
                <input
                  type="text"
                  name="configuracion"
                  value={vehiculoData.configuracion}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
              </div>

              {/* Predeterminado */}
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "10px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: "#666",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    name="predeterminado"
                    checked={vehiculoData.predeterminado}
                    onChange={handleInputChange}
                    style={{
                      transform: "scale(1.2)",
                    }}
                  />
                  Predeterminado
                </label>
              </div>

              {/* Mensaje de estado */}
              {mensaje && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      backgroundColor: mensaje.includes("✅")
                        ? "#d4edda"
                        : "#f8d7da",
                      color: mensaje.includes("✅")
                        ? "#155724"
                        : "#721c24",
                      border: `1px solid ${
                        mensaje.includes("✅")
                          ? "#c3e6cb"
                          : "#f5c6cb"
                      }`,
                    }}
                  >
                    {mensaje}
                  </div>
                </div>
              )}
            </div>

            {/* Botones */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "white",
                  color: "#333",
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
                  backgroundColor: loading ? "#ccc" : "#4a90e2",
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

export default ModalVehiculoCompleto;