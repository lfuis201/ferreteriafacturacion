import React, { useState } from "react";
import { crearConductor, consultarRENIEC } from "../../services/conductorService";

// Componente principal del modal conductor
function ModalConductor({ onClose, onConductorCreado }) {
  const [loading, setLoading] = useState(false);
  const [consultandoRENIEC, setConsultandoRENIEC] = useState(false);
  const [mensajeRENIEC, setMensajeRENIEC] = useState("");
  const [consultaAutomatica, setConsultaAutomatica] = useState(false);
  const [conductorData, setConductorData] = useState({
    nombre: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    telefono: "",
    direccion: "",
    licencia: "",
    modoTraslado: "Transporte privado",
  });

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

  // Función para detectar automáticamente el tipo de documento
  const detectarTipoDocumento = (numeroDocumento) => {
    const numeroLimpio = numeroDocumento.replace(/\D/g, "");
    
    if (numeroLimpio.length === 8) {
      return "DNI";
    } else if (numeroLimpio.length === 11) {
      return "RUC";
    } else if (numeroLimpio.length === 15) {
      // Para documentos de 15 dígitos, mantener el tipo actual o usar CE por defecto
      const tiposde15 = ["CE", "PASAPORTE", "DOC_TRIB_NO_DOM", "CARNE_SOLIC_REFUGIO", "C_IDENT_RREE", "PTP", "DOC_ID_EXTR", "CPP"];
      return tiposde15.includes(conductorData.tipoDocumento) ? conductorData.tipoDocumento : "CE";
    }
    return conductorData.tipoDocumento; // Mantener el tipo actual si no coincide
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let updatedData = {
      ...conductorData,
      [name]: value
    };

    // Detectar automáticamente el tipo de documento cuando se ingresa el número
    if (name === "numeroDocumento") {
      const tipoDetectado = detectarTipoDocumento(value);
      if (tipoDetectado !== conductorData.tipoDocumento) {
        updatedData.tipoDocumento = tipoDetectado;
      }

      // Si la licencia tiene solo una letra, completar automáticamente con el número
      if (
        updatedData.licencia &&
        updatedData.licencia.length === 1 &&
        /^[A-Za-z]$/.test(updatedData.licencia)
      ) {
        updatedData.licencia = `${updatedData.licencia.toUpperCase()}${value}`;
      }
    }

    setConductorData(updatedData);

    // Consulta automática cuando se completa el documento
    if (name === "numeroDocumento") {
      consultarAutomaticamente(updatedData.tipoDocumento, value);
    }
    if (name === "tipoDocumento") {
      consultarAutomaticamente(value, conductorData.numeroDocumento);
    }
  };

  // Manejador específico para autocompletar la licencia
  const handleLicenciaChange = (e) => {
    const valor = e.target.value || "";

    // Si se ingresa solo una letra, completar automáticamente con el número de documento
    if (valor.length === 1 && /^[A-Za-z]$/.test(valor)) {
      setConductorData((prev) => ({
        ...prev,
        licencia: `${valor.toUpperCase()}${prev.numeroDocumento || ""}`,
      }));
    } else {
      setConductorData((prev) => ({ ...prev, licencia: valor }));
    }
  };

  // Función para consultar automáticamente cuando se completa el documento
  const consultarAutomaticamente = async (tipoDoc, numeroDoc) => {
    if (consultaAutomatica) return;

    const numeroLimpio = numeroDoc.replace(/\D/g, "");
    if (
      (tipoDoc === "DNI" && numeroLimpio.length === 8) ||
      (tipoDoc === "RUC" && numeroLimpio.length === 11)
    ) {
      setConsultaAutomatica(true);
      try {
        setConsultandoRENIEC(true);
        setMensajeRENIEC("Consultando automáticamente...");

        const response = await consultarRENIEC(tipoDoc, numeroDoc);

        if (response.datos) {
          const datos = response.datos;
          
          setConductorData(prev => ({
            ...prev,
            nombre: tipoDoc === "DNI" 
              ? `${datos.nombres || ""} ${datos.apellidoPaterno || ""} ${datos.apellidoMaterno || ""}`.trim()
              : datos.razonSocial || datos.nombre || "",
            direccion: datos.direccion || prev.direccion,
          }));

          setMensajeRENIEC(
            `✅ Datos obtenidos automáticamente de ${tipoDoc === "DNI" ? "RENIEC" : "SUNAT"}`
          );
        }
      } catch (error) {
        console.error("Error en consulta automática:", error);
        setMensajeRENIEC(`❌ Error en consulta automática: ${error.message}`);
      } finally {
        setConsultandoRENIEC(false);
        setConsultaAutomatica(false);
      }
    }
  };

  // Función para consultar RENIEC manualmente
  const consultarRENIECManual = async () => {
    if (!conductorData.numeroDocumento || !conductorData.tipoDocumento) {
      alert("Debe ingresar el tipo y número de documento");
      return;
    }

    if (conductorData.tipoDocumento !== "DNI" && conductorData.tipoDocumento !== "RUC") {
      alert("Solo se puede consultar RENIEC para DNI y RUC");
      return;
    }

    try {
      setConsultandoRENIEC(true);
      setMensajeRENIEC("Consultando...");

      const response = await consultarRENIEC(conductorData.tipoDocumento, conductorData.numeroDocumento);

      if (response.datos) {
        const datos = response.datos;

        setConductorData(prev => ({
          ...prev,
          nombre: prev.nombre || (conductorData.tipoDocumento === "DNI" 
            ? `${datos.nombres || ""} ${datos.apellidoPaterno || ""} ${datos.apellidoMaterno || ""}`.trim()
            : datos.razonSocial || datos.nombre || ""),
          direccion: prev.direccion || datos.direccion || "",
        }));

        setMensajeRENIEC(
          `✅ Datos obtenidos de ${conductorData.tipoDocumento === "DNI" ? "RENIEC" : "SUNAT"} exitosamente`
        );
      } else {
        throw new Error("No se encontraron datos para el documento consultado");
      }
    } catch (error) {
      console.error("Error al consultar:", error);
      setMensajeRENIEC(
        `❌ Error al consultar ${conductorData.tipoDocumento === "DNI" ? "RENIEC" : "SUNAT"}: ${error.message}`
      );
    } finally {
      setConsultandoRENIEC(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const conductorParaCrear = {
        tipoDocumento: conductorData.tipoDocumento,
        numeroDocumento: conductorData.numeroDocumento,
        nombre: conductorData.nombre,
        telefono: conductorData.telefono,
        direccion: conductorData.direccion,
        licencia: conductorData.licencia,
        modoTraslado: conductorData.modoTraslado,
        consultarRENIEC: conductorData.tipoDocumento === 'DNI' || conductorData.tipoDocumento === 'RUC'
      };

      const response = await crearConductor(conductorParaCrear);
      
      if (response.conductor) {
        onConductorCreado(response.conductor);
        onClose();
      }
    } catch (error) {
      console.error('Error al crear conductor:', error);
      alert(`Error al crear conductor: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
              backgroundColor: "#f8f9fa",
            }}
          >
            <h2 style={{ margin: 0, color: "#333", fontSize: "18px" }}>
              🚗 Nuevo Conductor - Transporte Privado
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
              

              {/* Tipo de Documento */}
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
                  Tipo de Documento *
                </label>
                <select
                  name="tipoDocumento"
                  value={conductorData.tipoDocumento}
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
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
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
                  Número de Documento *
                </label>
                <input
                  type="text"
                  name="numeroDocumento"
                  value={conductorData.numeroDocumento}
                  onChange={handleInputChange}
                  required
                  maxLength={getMaxLength(conductorData.tipoDocumento)}
                  placeholder={
                    conductorData.tipoDocumento === "DNI"
                      ? "8 dígitos - Consulta automática"
                      : conductorData.tipoDocumento === "RUC"
                      ? "11 dígitos - Consulta automática"
                      : `${getMaxLength(conductorData.tipoDocumento)} dígitos`
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
              </div>



              {/* Nombre Completo */}
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
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={conductorData.nombre}
                  onChange={handleInputChange}
                  required
                  placeholder={
                     conductorData.tipoDocumento === "DNI"
                       ? "Se completará automáticamente con RENIEC"
                       : conductorData.tipoDocumento === "RUC"
                       ? "Se completará automáticamente con SUNAT"
                       : "Nombre completo del conductor"
                   }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor:
                      (conductorData.tipoDocumento === "DNI" ||
                        conductorData.tipoDocumento === "RUC") &&
                      !conductorData.nombre
                        ? "#f8f9fa"
                        : "white",
                  }}
                />
              </div>

              {/* Teléfono */}
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
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={conductorData.telefono}
                  onChange={handleInputChange}
                  placeholder="Número de teléfono"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
              </div>


              {/* Licencia */}
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
                  Licencia
                </label>
                <input
                  type="text"
                  name="licencia"
                  value={conductorData.licencia}
                  onChange={handleLicenciaChange}
                  
                  style={{
                    width: "80%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
              </div>















              {/* Mensaje de RENIEC */}
              {mensajeRENIEC && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      backgroundColor: mensajeRENIEC.includes("✅")
                        ? "#d4edda"
                        : mensajeRENIEC.includes("❌")
                        ? "#f8d7da"
                        : "#fff3cd",
                      color: mensajeRENIEC.includes("✅")
                        ? "#155724"
                        : mensajeRENIEC.includes("❌")
                        ? "#721c24"
                        : "#856404",
                      border: `1px solid ${
                        mensajeRENIEC.includes("✅")
                          ? "#c3e6cb"
                          : mensajeRENIEC.includes("❌")
                          ? "#f5c6cb"
                          : "#ffeaa7"
                      }`,
                    }}
                  >
                    {mensajeRENIEC}
                  </div>
                </div>
              )}

              {/* Botón para consultar RENIEC manualmente */}
              {(conductorData.tipoDocumento === "DNI" ||
                conductorData.tipoDocumento === "RUC") &&
                conductorData.numeroDocumento && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <button
                      type="button"
                      onClick={consultarRENIECManual}
                      disabled={consultandoRENIEC}
                      style={{
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "4px",
                        backgroundColor: consultandoRENIEC
                          ? "#6c757d"
                          : "#17a2b8",
                        color: "white",
                        cursor: consultandoRENIEC ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {consultandoRENIEC
                        ? "🔄 Consultando..."
                        : `🔍 Consultar ${
                            conductorData.tipoDocumento === "DNI"
                              ? "RENIEC"
                              : "SUNAT"
                          }`}
                    </button>
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        fontSize: "10px",
                        color: "#666",
                      }}
                    >
                      Consulta manual opcional. Al crear el transportista se consulta automáticamente.
                    </small>
                  </div>
                )}

              {/* Información automática */}
              <div style={{ gridColumn: "1 / -1" }}>
                <div
                  style={{
                    padding: "10px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    backgroundColor: "#e7f3ff",
                    color: "#0066cc",
                    border: "1px solid #b3d9ff",
                  }}
                >
                  <strong>💡 Consulta Automática:</strong>
                  <br />• <strong>DNI:</strong> Se obtienen automáticamente nombres, apellidos y dirección de RENIEC
                  <br />• <strong>RUC:</strong> Se obtiene automáticamente razón social y dirección de SUNAT
                  <br />• <strong>Otros documentos:</strong> Se usan los datos que ingreses manualmente
                </div>
              </div>
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
                  backgroundColor: "#f8f9fa",
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
                  fontWeight: "bold",
                }}
              >
                {loading ? "Creando..." : "Crear Conductor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ModalConductor;