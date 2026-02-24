import React, { useState } from "react";
import { 
  crearTransportista, 
  consultarRENIEC, 
  consultarSUNAT,
  actualizarTransportista
} from "../../services/transportistaService";

// Función para obtener la longitud máxima según el tipo de documento
const getMaxLength = (tipoDocumento) => {
  switch (tipoDocumento) {
    case "RUC":
      return 11;
    case "DNI":
      return 8;
    case "CE":
      return 12;
    case "PASAPORTE":
      return 12;
    case "Doc.trib.no.dom.sin.ruc":
      return 15;
    case "CARNE_SOLIC_REFUGIO":
      return 12;
    case "C_IDENT_RREE":
      return 12;
    case "PTP":
      return 12;
    case "DOC_ID_EXTR":
      return 15;
    case "CPP":
      return 12;
    default:
      return 15;
  }
};

const Transportistas = ({ isOpen, onClose, onSave, initialData }) => {
  const [transportistaData, setTransportistaData] = useState({
    tipoDocumento: "RUC",
    numeroDocumento: "",
    razonSocial: "",
    direccionFiscal: "",
    mtc: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // Bandera para respetar la selección manual del tipo de documento
  const [seleccionManualTipoDoc, setSeleccionManualTipoDoc] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    if (initialData && initialData.id) {
      setTransportistaData({
        tipoDocumento: initialData.tipoDocumento || "RUC",
        numeroDocumento: initialData.numeroDocumento || "",
        razonSocial: initialData.razonSocial || initialData.nombre || "",
        direccionFiscal: initialData.direccionFiscal || "",
        mtc: initialData.mtc || ""
      });
    } else {
      setTransportistaData({
        tipoDocumento: "RUC",
        numeroDocumento: "",
        razonSocial: "",
        direccionFiscal: "",
        mtc: ""
      });
    }
    setError("");
    setIsLoading(false);
    setSeleccionManualTipoDoc(false);
  }, [isOpen, initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let updatedData = {
      ...transportistaData,
      [name]: type === "checkbox" ? checked : value,
    };

    // Si se cambia manualmente el tipo de documento, activar la bandera
    if (name === "tipoDocumento") {
      setSeleccionManualTipoDoc(true);
    }

    // Auto-detectar tipo de documento basado en la longitud del número
    if (name === "numeroDocumento" && value.length > 0) {
      // Solo números
      const numericValue = value.replace(/\D/g, '');
      // Solo cambiar automáticamente si NO hubo selección manual
      if (!seleccionManualTipoDoc) {
        if (numericValue.length === 8) {
          updatedData.tipoDocumento = "DNI";
        } else if (numericValue.length === 11) {
          updatedData.tipoDocumento = "RUC";
        }
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
      setError("Complete los campos obligatorios: Número de documento y Nombre");
      return;
    }

    // Validación de longitud de documento usando getMaxLength
    const maxLength = getMaxLength(transportistaData.tipoDocumento);
    if (transportistaData.numeroDocumento.length !== maxLength) {
      setError(`El ${transportistaData.tipoDocumento} debe tener ${maxLength} dígitos`);
      return;
    }

    try {
      setIsLoading(true);
      let response;
      if (initialData && initialData.id) {
        // Actualizar transportista existente
        response = await actualizarTransportista(initialData.id, {
          ...transportistaData,
          tipoTransportista: initialData.tipoTransportista || "Empresa de transporte"
        });
      } else {
        // Crear nuevo transportista
        response = await crearTransportista({
          ...transportistaData,
          tipoTransportista: "Empresa de transporte"
        });
      }

      if (response && (response.transportista || response.data)) {
        const t = response.transportista || response.data;
        const transportistaCompleto = {
          id: t.id,
          nombre: t.razonSocial,
          numeroDocumento: t.numeroDocumento,
          tipoDocumento: t.tipoDocumento,
          ...t
        };
        onSave(transportistaCompleto);
        handleClose();
      } else {
        setError("Error al guardar el transportista");
      }
    } catch (error) {
      console.error("Error al guardar transportista:", error);
      setError(error.response?.data?.mensaje || "Error al guardar el transportista");
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
            {initialData && initialData.id ? "Editar Transportista" : "Nuevo Transportista"}
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
              <option value="CARNE_SOLIC_REFUGIO">Carné de Solicitante de Refugio</option>
              <option value="C_IDENT_RREE">Carné de Identidad RREE</option>
              <option value="PTP">Permiso Temporal de Permanencia</option>
              <option value="DOC_ID_EXTR">Documento de Identidad Extranjero</option>
              <option value="CPP">Carné de Permiso de Permanencia</option>
              <option value="Doc.trib.no.dom.sin.ruc">Documento Tributario No Domiciliado sin RUC</option>
            </select>
          </div>

          {/* Número de Documento */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#B8860B" }}>
              Número *
            </label>
            
            <div style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="text"
                  name="numeroDocumento"
                  value={transportistaData.numeroDocumento}
                  onChange={handleInputChange}
                  maxLength={getMaxLength(transportistaData.tipoDocumento)}
                  required
                  placeholder={`Ingrese documento (máx. ${getMaxLength(transportistaData.tipoDocumento)} caracteres)`}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />

                {/* Contador de dígitos */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 10px",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "600",
                    color:
                      transportistaData.numeroDocumento.length ===
                      getMaxLength(transportistaData.tipoDocumento)
                        ? "#28a745"
                        : transportistaData.numeroDocumento.length > 0
                        ? "#17a2b8"
                        : "#6c757d",
                    minWidth: "60px",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: "700" }}>
                    {transportistaData.numeroDocumento.length}/
                    {getMaxLength(transportistaData.tipoDocumento)}
                  </span>
                  {transportistaData.numeroDocumento.length ===
                    getMaxLength(transportistaData.tipoDocumento) && (
                    <span style={{ fontSize: "14px" }}>✓</span>
                  )}
                </div>
              </div>

              {/* Barra de progreso visual */}
              <div
                style={{
                  marginTop: "4px",
                  height: "3px",
                  backgroundColor: "#e9ecef",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    backgroundColor:
                      transportistaData.numeroDocumento.length ===
                      getMaxLength(transportistaData.tipoDocumento)
                        ? "#28a745"
                        : transportistaData.numeroDocumento.length > 0
                        ? "#17a2b8"
                        : "#e9ecef",
                    width: `${
                      (transportistaData.numeroDocumento.length /
                        getMaxLength(transportistaData.tipoDocumento)) *
                      100
                    }%`,
                    transition:
                      "width 0.2s ease-in-out, background-color 0.2s ease-in-out",
                  }}
                />
              </div>

              {/* Información del tipo de documento seleccionado */}
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "10px",
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                {transportistaData.tipoDocumento === "DNI" && "📝 DNI: 8 dígitos"}
                {transportistaData.tipoDocumento === "RUC" && "🏢 RUC: 11 dígitos"}
                {transportistaData.tipoDocumento === "CE" &&
                  "🆔 Carnet de Extranjería: 12 caracteres"}
                {transportistaData.tipoDocumento === "PASAPORTE" &&
                  "🛂 Pasaporte: 12 caracteres"}
                {transportistaData.tipoDocumento === "CARNE_SOLIC_REFUGIO" &&
                  "🛡️ Carné de Solicitante de Refugio: 12 caracteres"}
                {transportistaData.tipoDocumento === "C_IDENT_RREE" &&
                  "🌐 Carné de Identidad RREE: 12 caracteres"}
                {transportistaData.tipoDocumento === "PTP" &&
                  "📄 Permiso Temporal de Permanencia: 12 caracteres"}
                {transportistaData.tipoDocumento === "DOC_ID_EXTR" &&
                  "🌍 Documento de Identidad Extranjero: 15 caracteres"}
                {transportistaData.tipoDocumento === "CPP" &&
                  "📋 Carné de Permiso de Permanencia: 12 caracteres"}
                {transportistaData.tipoDocumento === "Doc.trib.no.dom.sin.ruc" &&
                  "💼 Documento Tributario No Domiciliado sin RUC: 15 caracteres"}
              </div>
            </div>

            {/* Botón de consulta */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  if (transportistaData.tipoDocumento === "RUC") {
                    handleConsultarSUNAT();
                  } else if (transportistaData.tipoDocumento === "DNI") {
                    handleConsultarRENIEC();
                  }
                }}
                disabled={
                  isLoading || 
                  transportistaData.numeroDocumento.length !== getMaxLength(transportistaData.tipoDocumento) ||
                  (transportistaData.tipoDocumento !== "RUC" && transportistaData.tipoDocumento !== "DNI")
                }
                style={{
                  padding: "8px 15px",
                  backgroundColor: 
                    transportistaData.numeroDocumento.length === getMaxLength(transportistaData.tipoDocumento) &&
                    (transportistaData.tipoDocumento === "RUC" || transportistaData.tipoDocumento === "DNI")
                      ? "#4A90E2"
                      : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: 
                    isLoading || 
                    transportistaData.numeroDocumento.length !== getMaxLength(transportistaData.tipoDocumento) ||
                    (transportistaData.tipoDocumento !== "RUC" && transportistaData.tipoDocumento !== "DNI")
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "12px",
                  opacity: 
                    isLoading || 
                    transportistaData.numeroDocumento.length !== getMaxLength(transportistaData.tipoDocumento) ||
                    (transportistaData.tipoDocumento !== "RUC" && transportistaData.tipoDocumento !== "DNI")
                      ? 0.6
                      : 1,
                }}
              >
                {transportistaData.tipoDocumento === "RUC" ? "Consultar SUNAT" : 
                 transportistaData.tipoDocumento === "DNI" ? "Consultar RENIEC" : 
                 "No disponible"}
              </button>
            </div>
          </div>

          {/* Razón Social */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#B8860B" }}>
              Nombre *
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

export default Transportistas;