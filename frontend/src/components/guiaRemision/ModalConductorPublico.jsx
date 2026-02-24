import React, { useState } from "react";
import { crearConductor, consultarRENIEC } from "../../services/conductorService";
import { consultarSUNAT } from "../../services/transportistaService";

// Componente principal del modal conductor para transporte público
function ModalConductorPublico({ onClose, onConductorCreado }) {
  const [loading, setLoading] = useState(false);
  const [consultandoRENIEC, setConsultandoRENIEC] = useState(false);
  const [mensajeRENIEC, setMensajeRENIEC] = useState("");
  const [consultaAutomatica, setConsultaAutomatica] = useState(false);
  const [conductorData, setConductorData] = useState({
    nombre: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    licencia: "",
    telefono: "",
   
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Auto-detección de tipo de documento basada en longitud
    if (name === "numeroDocumento") {
      const numeroLimpio = value.replace(/\D/g, "");
      let nuevoTipoDocumento = conductorData.tipoDocumento;
      
      if (numeroLimpio.length === 8) {
        nuevoTipoDocumento = "DNI";
      } else if (numeroLimpio.length === 11) {
        nuevoTipoDocumento = "RUC";
      }
      
      setConductorData(prev => {
        const licenciaAuto = prev.licencia && prev.licencia.length === 1 && /^[A-Za-z]$/.test(prev.licencia)
          ? `${prev.licencia.toUpperCase()}${value}`
          : prev.licencia;

        return {
          ...prev,
          [name]: type === 'checkbox' ? checked : value,
          tipoDocumento: nuevoTipoDocumento,
          licencia: licenciaAuto
        };
      });
      
      // Consulta automática cuando se completa el documento
      consultarAutomaticamente(nuevoTipoDocumento, value);
    } else {
      setConductorData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      
      // Consulta automática cuando se cambia el tipo de documento
      if (name === "tipoDocumento") {
        consultarAutomaticamente(value, conductorData.numeroDocumento);
      }
    }
  };

  // Manejador específico para autocompletar la licencia al escribir una letra
  const handleLicenciaChange = (e) => {
    const valor = e.target.value || "";

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
    
    if (tipoDoc === "DNI" && numeroLimpio.length === 8) {
      setConsultaAutomatica(true);
      try {
        setConsultandoRENIEC(true);
        setMensajeRENIEC("Consultando automáticamente...");

        const response = await consultarRENIEC(tipoDoc, numeroDoc);

        if (response.datos) {
          const datos = response.datos;
          
          setConductorData(prev => ({
            ...prev,
            nombre: `${datos.nombres || ""} ${datos.apellidoPaterno || ""} ${datos.apellidoMaterno || ""}`.trim(),
          }));

          setMensajeRENIEC("✅ Datos obtenidos automáticamente de RENIEC");
        }
      } catch (error) {
        console.error("Error en consulta automática:", error);
        setMensajeRENIEC(`❌ Error en consulta automática: ${error.message}`);
      } finally {
        setConsultandoRENIEC(false);
        setConsultaAutomatica(false);
      }
    } else if (tipoDoc === "RUC" && numeroLimpio.length === 11) {
      setConsultaAutomatica(true);
      try {
        setConsultandoRENIEC(true);
        setMensajeRENIEC("Consultando automáticamente...");

        const response = await consultarSUNAT(numeroDoc);

        if (response.mensaje === "Consulta exitosa") {
          const razonSocial = response.nombreCompleto;
          
          setConductorData(prev => ({
            ...prev,
            nombre: razonSocial || "",
          }));

          setMensajeRENIEC("✅ Datos obtenidos automáticamente de SUNAT");
        } else {
          setMensajeRENIEC(response.mensaje || "No se encontraron datos en SUNAT");
        }
      } catch (error) {
        console.error("Error en consulta automática SUNAT:", error);
        setMensajeRENIEC(`❌ Error en consulta automática: ${error.message}`);
      } finally {
        setConsultandoRENIEC(false);
        setConsultaAutomatica(false);
      }
    }
  };

  // Función para consultar RENIEC/SUNAT manualmente
  const consultarRENIECManual = async () => {
    if (!conductorData.numeroDocumento || !conductorData.tipoDocumento) {
      alert("Debe ingresar el tipo y número de documento");
      return;
    }

    if (conductorData.tipoDocumento !== "DNI" && conductorData.tipoDocumento !== "RUC") {
      alert("Solo se puede consultar para DNI y RUC");
      return;
    }

    try {
      setConsultandoRENIEC(true);
      setMensajeRENIEC("Consultando...");

      if (conductorData.tipoDocumento === "DNI") {
        const response = await consultarRENIEC(conductorData.tipoDocumento, conductorData.numeroDocumento);

        if (response.datos) {
          const datos = response.datos;

          setConductorData(prev => ({
            ...prev,
            nombre: prev.nombre || `${datos.nombres || ""} ${datos.apellidoPaterno || ""} ${datos.apellidoMaterno || ""}`.trim(),
          }));

          setMensajeRENIEC("✅ Datos obtenidos de RENIEC exitosamente");
        } else {
          throw new Error("No se encontraron datos para el documento consultado");
        }
      } else if (conductorData.tipoDocumento === "RUC") {
        const response = await consultarSUNAT(conductorData.numeroDocumento);

        if (response.mensaje === "Consulta exitosa") {
          const razonSocial = response.nombreCompleto;

          setConductorData(prev => ({
            ...prev,
            nombre: prev.nombre || razonSocial || "",
          }));

          setMensajeRENIEC("✅ Datos obtenidos de SUNAT exitosamente");
        } else {
          throw new Error(response.mensaje || "No se encontraron datos en SUNAT");
        }
      }
    } catch (error) {
      console.error("Error al consultar:", error);
      setMensajeRENIEC(`❌ Error al consultar ${conductorData.tipoDocumento === "DNI" ? "RENIEC" : "SUNAT"}: ${error.message}`);
    } finally {
      setConsultandoRENIEC(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const conductorParaCrear = {
        ...conductorData,
        consultarRENIEC: conductorData.tipoDocumento === 'DNI'
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
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
              backgroundColor: "#4A90E2",
              color: "white",
              padding: "15px 20px",
              borderRadius: "8px 8px 0 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px" }}>Nuevo Conductor - Transporte Público</h3>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "20px",
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
                  Tipo Doc. Identidad <span style={{ color: "red" }}>*</span>
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
                  <option value="CE">Carnet de Extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>

              {/* Número de Documento */}
              <div style={{ position: "relative" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Número <span style={{ color: "red" }}>*</span>
                </label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    name="numeroDocumento"
                    value={conductorData.numeroDocumento}
                    onChange={handleInputChange}
                    required
                    maxLength={
                      conductorData.tipoDocumento === "RUC" ? 11 : 
                      conductorData.tipoDocumento === "DNI" ? 8 : 
                      conductorData.tipoDocumento === "CE" ? 12 : 20
                    }
                    placeholder={
                      conductorData.tipoDocumento === "RUC" ? "Ingrese RUC" :
                      conductorData.tipoDocumento === "DNI" ? "Ingrese DNI" :
                      conductorData.tipoDocumento === "CE" ? "Ingrese Carnet de Extranjería" :
                      "Ingrese Pasaporte"
                    }
                    style={{
                      flex: 1,
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  />
                  {(conductorData.tipoDocumento === "DNI" || conductorData.tipoDocumento === "RUC") && (
                    <button
                      type="button"
                      onClick={consultarRENIECManual}
                      disabled={consultandoRENIEC || !conductorData.numeroDocumento}
                      style={{
                        marginLeft: "8px",
                        padding: "8px 12px",
                        backgroundColor: "#4A90E2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "10px",
                        cursor: consultandoRENIEC ? "not-allowed" : "pointer",
                        opacity: consultandoRENIEC || !conductorData.numeroDocumento ? 0.6 : 1,
                      }}
                    >
                      {consultandoRENIEC ? "..." : (conductorData.tipoDocumento === "RUC" ? "SUNAT" : "RENIEC")}
                    </button>
                  )}
                </div>
                {(conductorData.tipoDocumento === "DNI" || conductorData.tipoDocumento === "RUC") && (
                  <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
                    {conductorData.numeroDocumento.length}/{conductorData.tipoDocumento === "RUC" ? 11 : 8}
                  </div>
                )}
              </div>

              {/* Nombre */}
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
                  Nombre <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={conductorData.nombre}
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

              {/* Licencia */}
              <div style={{ position: "relative" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Licencia{" "}
                  <span
                    style={{
                      backgroundColor: "#666",
                      color: "white",
                      borderRadius: "50%",
                      width: "14px",
                      height: "14px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      marginLeft: "4px",
                    }}
                  >
                    i
                  </span>
                </label>
                <input
                  type="text"
                  name="licencia"
                  value={conductorData.licencia}
                  onChange={handleLicenciaChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
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
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
              </div>
            </div>

           

            {/* Mensaje RENIEC */}
            {mensajeRENIEC && (
              <div
                style={{
                  padding: "10px",
                  marginBottom: "15px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: mensajeRENIEC.includes("✅") ? "#d4edda" : "#f8d7da",
                  color: mensajeRENIEC.includes("✅") ? "#155724" : "#721c24",
                  border: `1px solid ${mensajeRENIEC.includes("✅") ? "#c3e6cb" : "#f5c6cb"}`,
                }}
              >
                {mensajeRENIEC}
              </div>
            )}

            {/* Botones */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                paddingTop: "15px",
                borderTop: "1px solid #eee",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 16px",
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
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: "#4A90E2",
                  color: "white",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  opacity: loading ? 0.6 : 1,
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

export default ModalConductorPublico;