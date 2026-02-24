import React, { useState } from 'react';
import apiClient from "../../services/apiService";

function ModalVehiculo({ isOpen, onClose, onVehiculoCreado }) {
  const [vehiculoData, setVehiculoData] = useState({
    nroPlacaId: "",
    marcaVehiculo: "",
    modeloVehiculo: "",
    año: "",
    color: "",
    tipoVehiculo: "AUTOMOVIL",
    modoTraslado: "TRANSPORTE_PRIVADO",
    // Campos para Transporte Público
    numeroTarjetaCirculacion: "",
    numeroAsientos: "",
    pesoMaximo: "",
    cargaUtil: "",
    numeroEjes: "",
    configuracionVehicular: "",
  });

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const tiposVehiculo = [
    "AUTOMOVIL",
    "CAMIONETA",
    "CAMION",
    "OMNIBUS",
    "MOTOCICLETA",
    "MOTOTAXI",
    "REMOLQUE",
    "SEMIREMOLQUE"
  ];

  const configuracionesVehiculares = [
    "2S1", "2S2", "2S3", "3S1", "3S2", "3S3",
    "2T2", "2T3", "3T2", "3T3", "2R2", "2R3",
    "3R2", "3R3", "4R2", "4R3"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehiculoData(prev => ({
      ...prev,
      [name]: value
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
      marcaVehiculo: "",
      modeloVehiculo: "",
      año: "",
      color: "",
      tipoVehiculo: "AUTOMOVIL",
      modoTraslado: "TRANSPORTE_PRIVADO",
      numeroTarjetaCirculacion: "",
      numeroAsientos: "",
      pesoMaximo: "",
      cargaUtil: "",
      numeroEjes: "",
      configuracionVehicular: "",
    });
    setMensaje("");
  };

  const cargarDatosEjemplo = () => {
    setVehiculoData({
      nroPlacaId: "",
      marcaVehiculo: "",
      modeloVehiculo: "",
      año: "",
      color: "",
      tipoVehiculo: "",
      modoTraslado: "",
      numeroTarjetaCirculacion: "",
      numeroAsientos: "",
      pesoMaximo: "",
      cargaUtil: "",
      numeroEjes: "",
      configuracionVehicular: "",
    });
    setMensaje("📝 Datos de ejemplo cargados");
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
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Nuevo Vehículo
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#666",
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

          {/* Mensaje de estado */}
          {mensaje && (
            <div
              style={{
                padding: "10px 20px",
                backgroundColor: mensaje.includes("✅") ? "#d4edda" : "#f8d7da",
                color: mensaje.includes("✅") ? "#155724" : "#721c24",
                fontSize: "12px",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              {mensaje}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
            {/* Grid de campos básicos */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
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
                  Número de Placa *
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

              {/* Marca */}
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
                  Marca *
                </label>
                <input
                  type="text"
                  name="marcaVehiculo"
                  value={vehiculoData.marcaVehiculo}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  placeholder="Ej: Toyota"
                />
              </div>

              {/* Modelo */}
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
                  Modelo *
                </label>
                <input
                  type="text"
                  name="modeloVehiculo"
                  value={vehiculoData.modeloVehiculo}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  placeholder="Ej: Hilux"
                />
              </div>

              {/* Año */}
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
                  Año *
                </label>
                <input
                  type="number"
                  name="año"
                  value={vehiculoData.año}
                  onChange={handleInputChange}
                  required
                  min="1900"
                  max="2030"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  placeholder="Ej: 2022"
                />
              </div>

              {/* Color */}
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
                  Color *
                </label>
                <input
                  type="text"
                  name="color"
                  value={vehiculoData.color}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                  placeholder="Ej: Blanco"
                />
              </div>

              {/* Tipo de Vehículo */}
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
                  Tipo de Vehículo *
                </label>
                <select
                  name="tipoVehiculo"
                  value={vehiculoData.tipoVehiculo}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  {tiposVehiculo.map(tipo => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modo de Traslado */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Modo de Traslado *
              </label>
              <div style={{ display: "flex", gap: "15px" }}>
                <label style={{ display: "flex", alignItems: "center", fontSize: "12px" }}>
                  <input
                    type="radio"
                    name="modoTraslado"
                    value="TRANSPORTE_PRIVADO"
                    checked={vehiculoData.modoTraslado === "TRANSPORTE_PRIVADO"}
                    onChange={handleInputChange}
                    style={{ marginRight: "5px" }}
                  />
                  Transporte Privado
                </label>
                <label style={{ display: "flex", alignItems: "center", fontSize: "12px" }}>
                  <input
                    type="radio"
                    name="modoTraslado"
                    value="TRANSPORTE_PUBLICO"
                    checked={vehiculoData.modoTraslado === "TRANSPORTE_PUBLICO"}
                    onChange={handleInputChange}
                    style={{ marginRight: "5px" }}
                  />
                  Transporte Público
                </label>
              </div>
            </div>

            {/* Campos para Transporte Público */}
            {vehiculoData.modoTraslado === "TRANSPORTE_PUBLICO" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  marginBottom: "20px",
                  padding: "15px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <h4 style={{ gridColumn: "1 / -1", margin: "0 0 10px 0", fontSize: "14px", color: "#333" }}>
                  Datos Adicionales para Transporte Público
                </h4>

                {/* Número de Tarjeta de Circulación */}
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
                    Tarjeta de Circulación *
                  </label>
                  <input
                    type="text"
                    name="numeroTarjetaCirculacion"
                    value={vehiculoData.numeroTarjetaCirculacion}
                    onChange={handleInputChange}
                    required={vehiculoData.modoTraslado === "TRANSPORTE_PUBLICO"}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                    placeholder="Ej: TC123456789"
                  />
                </div>

                {/* Número de Asientos */}
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
                    Número de Asientos *
                  </label>
                  <input
                    type="number"
                    name="numeroAsientos"
                    value={vehiculoData.numeroAsientos}
                    onChange={handleInputChange}
                    required={vehiculoData.modoTraslado === "TRANSPORTE_PUBLICO"}
                    min="1"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                    placeholder="Ej: 5"
                  />
                </div>

                {/* Peso Máximo */}
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
                    Peso Máximo (kg) *
                  </label>
                  <input
                    type="number"
                    name="pesoMaximo"
                    value={vehiculoData.pesoMaximo}
                    onChange={handleInputChange}
                    required={vehiculoData.modoTraslado === "TRANSPORTE_PUBLICO"}
                    min="0"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                    placeholder="Ej: 3500"
                  />
                </div>

                {/* Carga Útil */}
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
                    Carga Útil (kg) *
                  </label>
                  <input
                    type="number"
                    name="cargaUtil"
                    value={vehiculoData.cargaUtil}
                    onChange={handleInputChange}
                    required={vehiculoData.modoTraslado === "TRANSPORTE_PUBLICO"}
                    min="0"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                    placeholder="Ej: 1200"
                  />
                </div>

                {/* Número de Ejes */}
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
                    Número de Ejes *
                  </label>
                  <input
                    type="number"
                    name="numeroEjes"
                    value={vehiculoData.numeroEjes}
                    onChange={handleInputChange}
                    required={vehiculoData.modoTraslado === "TRANSPORTE_PUBLICO"}
                    min="1"
                    max="10"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                    placeholder="Ej: 2"
                  />
                </div>

                {/* Configuración Vehicular */}
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
                    Configuración Vehicular *
                  </label>
                  <select
                    name="configuracionVehicular"
                    value={vehiculoData.configuracionVehicular}
                    onChange={handleInputChange}
                    required={vehiculoData.modoTraslado === "TRANSPORTE_PUBLICO"}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <option value="">Seleccionar configuración</option>
                    {configuracionesVehiculares.map(config => (
                      <option key={config} value={config}>
                        {config}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #e0e0e0",
                paddingTop: "15px",
              }}
            >
              <button
                type="button"
                onClick={cargarDatosEjemplo}
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
                Cargar Ejemplo
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
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
                    backgroundColor: loading ? "#6c757d" : "#007bff",
                    color: "white",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "12px",
                  }}
                >
                  {loading ? "Creando..." : "Crear Vehículo"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ModalVehiculo;