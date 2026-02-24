import React, { useState } from "react";
import { 
  crearTransportista, 
  consultarRENIEC, 
  consultarSUNAT 
} from "../../services/transportistaService";

const ModalTransportistaPublico = ({ isOpen, onClose, onSave }) => {
  const [transportistaData, setTransportistaData] = useState({
    tipoDocumento: "RUC",
    numeroDocumento: "",
    razonSocial: "",
    direccionFiscal: "",
    mtc: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let updatedData = {
      ...transportistaData,
      [name]: type === "checkbox" ? checked : value,
    };

    // Auto-detectar tipo de documento basado en la longitud del número
    if (name === "numeroDocumento" && value.length > 0) {
      // Solo números
      const numericValue = value.replace(/\D/g, '');
      
      if (numericValue.length === 8) {
        updatedData.tipoDocumento = "DNI";
      } else if (numericValue.length === 11) {
        updatedData.tipoDocumento = "RUC";
      }
      
      updatedData.numeroDocumento = numericValue;
    }

    setTransportistaData(updatedData);

    // Auto-consulta cuando se completa el número de documento
    if (name === "numeroDocumento" && updatedData.numeroDocumento.length >= 8) {
      if (updatedData.tipoDocumento === "DNI" && updatedData.numeroDocumento.length === 8) {
        handleConsultarRENIEC(updatedData.numeroDocumento);
      } else if (updatedData.tipoDocumento === "RUC" && updatedData.numeroDocumento.length === 11) {
        handleConsultarSUNAT(updatedData.numeroDocumento);
      }
    }
  };

  const handleConsultarRENIEC = async (dni = null) => {
    const documento = dni || transportistaData.numeroDocumento;
    if (!documento || documento.length !== 8) {
      setError("Ingrese un DNI válido de 8 dígitos");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await consultarRENIEC(documento);

      if (response.mensaje === "Consulta exitosa") {
        const nombreCompleto = response.nombreCompleto;

        setTransportistaData((prev) => ({
          ...prev,
          razonSocial: nombreCompleto,
        }));
      } else {
        setError(response.mensaje || "No se encontraron datos en RENIEC");
      }
    } catch (error) {
      console.error("Error al consultar RENIEC:", error);
      setError("Error al consultar RENIEC. Verifique la conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsultarSUNAT = async (ruc = null) => {
    const documento = ruc || transportistaData.numeroDocumento;
    if (!documento || documento.length !== 11) {
      setError("Ingrese un RUC válido de 11 dígitos");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await consultarSUNAT(documento);

      if (response.mensaje === "Consulta exitosa") {
        const razonSocial = response.nombreCompleto;
        const direccion = response.datos.direccion || "";

        setTransportistaData((prev) => ({
          ...prev,
          razonSocial: razonSocial || "",
          direccionFiscal: direccion || "",
        }));
      } else {
        setError(response.mensaje || "No se encontraron datos en SUNAT");
      }
    } catch (error) {
      console.error("Error al consultar SUNAT:", error);
      setError("Error al consultar SUNAT. Verifique la conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validaciones básicas
    if (!transportistaData.numeroDocumento || !transportistaData.razonSocial) {
      setError("Complete los campos obligatorios: Número de documento y Razón Social");
      return;
    }

    // Validación de longitud de documento
    if (transportistaData.tipoDocumento === "RUC" && transportistaData.numeroDocumento.length !== 11) {
      setError("El RUC debe tener 11 dígitos");
      return;
    }
    
    if (transportistaData.tipoDocumento === "DNI" && transportistaData.numeroDocumento.length !== 8) {
      setError("El DNI debe tener 8 dígitos");
      return;
    }

    try {
      setIsLoading(true);
      
      // Crear el transportista en la base de datos
      const response = await crearTransportista({
        ...transportistaData,
        tipoTransportista: "Empresa de transporte"
      });
      
      if (response && response.transportista) {
        // Crear objeto completo para el callback
        const transportistaCompleto = {
          id: response.transportista.id,
          nombre: response.transportista.razonSocial,
          numeroDocumento: response.transportista.numeroDocumento,
          tipoDocumento: response.transportista.tipoDocumento,
          ...response.transportista
        };
        
        onSave(transportistaCompleto);
        handleClose();
      } else {
        setError("Error al crear el transportista");
      }
    } catch (error) {
      console.error("Error al crear transportista:", error);
      setError(error.response?.data?.mensaje || "Error al crear el transportista");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTransportistaData({
      tipoDocumento: "RUC",
      numeroDocumento: "",
      razonSocial: "",
      direccionFiscal: "",
      mtc: ""
    });
    setError("");
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "10px",
            borderBottom: "1px solid #eee",
          }}
        >
          <h2 style={{ margin: 0, color: "#4A90E2", fontSize: "18px" }}>
            Nuevo Transportista - Transporte Público
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: "#fee",
              color: "#c33",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "15px",
              border: "1px solid #fcc",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Tipo de Documento */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#B8860B" }}>
              Tipo Doc. Identidad *
            </label>
            <select
              name="tipoDocumento"
              value={transportistaData.tipoDocumento}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
              <option value="CE">Carnet de Extranjería</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
          </div>

          {/* Número de Documento */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#B8860B" }}>
              Número *
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                name="numeroDocumento"
                value={transportistaData.numeroDocumento}
                onChange={handleInputChange}
                maxLength={
                  transportistaData.tipoDocumento === "RUC" ? 11 : 
                  transportistaData.tipoDocumento === "DNI" ? 8 : 
                  transportistaData.tipoDocumento === "CE" ? 12 : 
                  20
                }
                required
                placeholder={
                  transportistaData.tipoDocumento === "RUC" ? "Ingrese RUC" : 
                  transportistaData.tipoDocumento === "DNI" ? "Ingrese DNI" : 
                  transportistaData.tipoDocumento === "CE" ? "Ingrese Carnet de Extranjería" : 
                  "Ingrese número de documento"
                }
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (transportistaData.tipoDocumento === "RUC") {
                    handleConsultarSUNAT();
                  } else if (transportistaData.tipoDocumento === "DNI") {
                    handleConsultarRENIEC();
                  }
                }}
                disabled={isLoading}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#4A90E2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {transportistaData.tipoDocumento === "RUC" ? "SUNAT" : 
                 transportistaData.tipoDocumento === "DNI" ? "RENIEC" : 
                 "Consultar"}
              </button>
            </div>
          </div>

          {/* Razón Social */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#B8860B" }}>
              Razón Social *
            </label>
            <input
              type="text"
              name="razonSocial"
              value={transportistaData.razonSocial}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Dirección Fiscal */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#B8860B" }}>
              Dirección fiscal
            </label>
            <input
              type="text"
              name="direccionFiscal"
              value={transportistaData.direccionFiscal}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* MTC */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#B8860B" }}>
              MTC
            </label>
            <input
              type="text"
              name="mtc"
              value={transportistaData.mtc}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Botones */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "10px 20px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#f8f9fa",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: isLoading ? "#6c757d" : "#4A90E2",
                color: "white",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTransportistaPublico;