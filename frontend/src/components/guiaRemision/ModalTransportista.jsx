import React, { useState } from "react";
import axios from "axios";

const ModalTransportista = ({ isOpen, onClose, onSave }) => {
  const [transportistaData, setTransportistaData] = useState({
    tipoDocumento: "RUC",
    numeroDocumento: "",
    razonSocial: "",
    direccion: "",
    telefono: "",
    email: "",
    licenciaConducir: "",
    fechaVencimientoLicencia: "",
    categoria: "",
    restricciones: "",
    observaciones: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Función para obtener la longitud máxima según el tipo de documento
  const getMaxLength = (tipoDocumento) => {
    switch (tipoDocumento) {
      case "DNI":
        return 8;
      case "RUC":
        return 11;
      case "CE":
      case "PASAPORTE":
      case "DOC_TRIB_NO_DOM":
      case "CARNE_SOLIC_REFUGIO":
      case "C_IDENT_RREE":
      case "PTP":
      case "DOC_ID_EXTR":
      case "CPP":
        return 15;
      default:
        return 15;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransportistaData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-consulta cuando se completa el número de documento
    if (name === "numeroDocumento" && value.length >= 8) {
      if (transportistaData.tipoDocumento === "DNI" && value.length === 8) {
        handleConsultarRENIEC(value);
      } else if (transportistaData.tipoDocumento === "RUC" && value.length === 11) {
        handleConsultarSUNAT(value);
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
      const response = await axios.get(
        `http://localhost:3001/api/clientes/consultar-reniec/${documento}`
      );

      if (response.data.success) {
        const { nombres, apellidoPaterno, apellidoMaterno } = response.data.data;
        const nombreCompleto = `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.trim();

        setTransportistaData((prev) => ({
          ...prev,
          razonSocial: nombreCompleto,
        }));
      } else {
        setError(response.data.message || "No se encontraron datos en RENIEC");
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
      const response = await axios.get(
        `http://localhost:3001/api/clientes/consultar-sunat/${documento}`
      );

      if (response.data.success) {
        const { razonSocial, direccion } = response.data.data;

        setTransportistaData((prev) => ({
          ...prev,
          razonSocial: razonSocial || "",
          direccion: direccion || "",
        }));
      } else {
        setError(response.data.message || "No se encontraron datos en SUNAT");
      }
    } catch (error) {
      console.error("Error al consultar SUNAT:", error);
      setError("Error al consultar SUNAT. Verifique la conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!transportistaData.numeroDocumento || !transportistaData.razonSocial) {
      setError("Complete los campos obligatorios");
      return;
    }

    onSave(transportistaData);
    handleClose();
  };

  const handleClose = () => {
    setTransportistaData({
      tipoDocumento: "RUC",
      numeroDocumento: "",
      razonSocial: "",
      direccion: "",
      telefono: "",
      email: "",
      licenciaConducir: "",
      fechaVencimientoLicencia: "",
      categoria: "",
      restricciones: "",
      observaciones: "",
    });
    setError("");
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
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
          <h2 style={{ margin: 0, color: "#333", fontSize: "18px" }}>
            🚌 Nueva Empresa de Transporte - Transporte Público
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

        <form onSubmit={handleSubmit}>
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

          {/* Tipo de Documento */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Tipo de Documento *
            </label>
            <select
              name="tipoDocumento"
              value={transportistaData.tipoDocumento}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              <option value="RUC">RUC</option>
              <option value="DNI">DNI</option>
              <option value="CE">CE</option>
              <option value="PASAPORTE">Pasaporte</option>
              <option value="DOC_TRIB_NO_DOM">Doc.trib.no.dom.sin.ruc</option>
              <option value="CARNE_SOLIC_REFUGIO">CARNE SOLIC REFUGIO</option>
              <option value="C_IDENT_RREE">C.IDENT.-RREE</option>
              <option value="PTP">PTP</option>
              <option value="DOC_ID_EXTR">DOC.ID.EXTR.</option>
              <option value="CPP">CPP</option>
            </select>
          </div>

          {/* Número de Documento */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              {transportistaData.tipoDocumento === "RUC" ? "RUC" : "DNI"} *
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                name="numeroDocumento"
                value={transportistaData.numeroDocumento}
                onChange={handleInputChange}
                maxLength={getMaxLength(transportistaData.tipoDocumento)}
                required
                placeholder={
                  transportistaData.tipoDocumento === "RUC"
                    ? "Ingrese RUC de 11 dígitos"
                    : transportistaData.tipoDocumento === "DNI"
                    ? "Ingrese DNI de 8 dígitos"
                    : `Ingrese documento de ${getMaxLength(transportistaData.tipoDocumento)} dígitos`
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
                onClick={() =>
                  transportistaData.tipoDocumento === "RUC"
                    ? handleConsultarSUNAT()
                    : handleConsultarRENIEC()
                }
                disabled={isLoading}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? "..." : "Consultar"}
              </button>
            </div>
          </div>

          {/* Razón Social / Nombre */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              {transportistaData.tipoDocumento === "RUC" ? "Razón Social" : "Nombre Completo"} *
            </label>
            <input
              type="text"
              name="razonSocial"
              value={transportistaData.razonSocial}
              onChange={handleInputChange}
              required
              placeholder={
                transportistaData.tipoDocumento === "DNI"
                  ? "Se completará automáticamente con RENIEC"
                  : transportistaData.tipoDocumento === "RUC"
                  ? "Se completará automáticamente con SUNAT"
                  : "Razón social de la empresa"
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Dirección */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Dirección
            </label>
            <input
              type="text"
              name="direccion"
              value={transportistaData.direccion}
              onChange={handleInputChange}
              placeholder="Dirección de la empresa"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Teléfono y Email */}
          <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={transportistaData.telefono}
                onChange={handleInputChange}
                placeholder="Teléfono de contacto"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={transportistaData.email}
                onChange={handleInputChange}
                placeholder="Correo electrónico"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {/* Información del Conductor */}
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "15px", 
            borderRadius: "6px", 
            marginBottom: "15px",
            border: "1px solid #e9ecef"
          }}>
            <h4 style={{ margin: "0 0 15px 0", color: "#495057", fontSize: "16px" }}>
              Información del Conductor Principal
            </h4>
            
            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Licencia de Conducir
                </label>
                <input
                  type="text"
                  name="licenciaConducir"
                  value={transportistaData.licenciaConducir}
                  onChange={handleInputChange}
                  placeholder="Número de licencia"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  name="fechaVencimientoLicencia"
                  value={transportistaData.fechaVencimientoLicencia}
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
            </div>

            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={transportistaData.categoria}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="A-I">A-I (Motocicletas hasta 125cc)</option>
                  <option value="A-IIa">A-IIa (Motocicletas hasta 250cc)</option>
                  <option value="A-IIb">A-IIb (Motocicletas más de 250cc)</option>
                  <option value="A-III">A-III (Vehículos menores)</option>
                  <option value="B-I">B-I (Automóviles)</option>
                  <option value="B-IIa">B-IIa (Camionetas hasta 3500kg)</option>
                  <option value="B-IIb">B-IIb (Camiones hasta 8000kg)</option>
                  <option value="B-IIc">B-IIc (Camiones más de 8000kg)</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Restricciones
                </label>
                <input
                  type="text"
                  name="restricciones"
                  value={transportistaData.restricciones}
                  onChange={handleInputChange}
                  placeholder="Restricciones de la licencia"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={transportistaData.observaciones}
              onChange={handleInputChange}
              rows="3"
              placeholder="Observaciones adicionales"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                resize: "vertical",
              }}
            />
          </div>

          {/* Botones */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
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
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "14px",
                opacity: isLoading ? 0.6 : 1,
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

export default ModalTransportista;