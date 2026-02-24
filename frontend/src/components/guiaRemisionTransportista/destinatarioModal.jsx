 
import React, { useState } from "react";
import { crearRemitente, consultarRENIEC } from "../../services/remitenteService";

// Componente principal del modal remitente
function destinatarioModal ({ onClose, onRemitenteCreado }) {
  const [loading, setLoading] = useState(false);
  const [consultandoRENIEC, setConsultandoRENIEC] = useState(false);
  const [mensajeRENIEC, setMensajeRENIEC] = useState("");
  const [consultaAutomatica, setConsultaAutomatica] = useState(false);
  
  // Estado para controlar el modal de nuevo ubigeo
  const [mostrarModalUbigeo, setMostrarModalUbigeo] = useState(false);
  
  // Estados para el selector de ubigeo
  const [selectedDepartamento, setSelectedDepartamento] = useState(null);
  const [selectedProvincia, setSelectedProvincia] = useState(null);
  const [selectedDistrito, setSelectedDistrito] = useState(null);
  
  // Datos iniciales de ubigeo (3 opciones como solicitado)
  const ubigeosIniciales = [
    {
      id: "150101",
      codigo: "150101",
      departamento: "LIMA",
      provincia: "LIMA",
      distrito: "LIMA",
    },
    {
      id: "150114",
      codigo: "150114",
      departamento: "LIMA",
      provincia: "LIMA",
      distrito: "LA MOLINA",
    },
    {
      id: "150140",
      codigo: "150140",
      departamento: "LIMA",
      provincia: "LIMA",
      distrito: "SAN ISIDRO",
    },
  ];

  const [remitenteData, setRemitenteData] = useState({
    nombre: "",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    telefono: "",
    direccion: "",
    departamento: "",
    provincia: "",
    distrito: "",
    ubigeo: "",
  });

  // Estados para manejo de ubigeo
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("");
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [distritoSeleccionado, setDistritoSeleccionado] = useState("");

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

  // Función para manejar la creación de nuevo ubigeo
  const handleUbigeoCreado = (nuevoUbigeo) => {
    // Actualizar el remitente con el nuevo ubigeo seleccionado
    setRemitenteData((prev) => ({
      ...prev,
      ubigeo: nuevoUbigeo.codigo,
      departamento: nuevoUbigeo.departamento,
      provincia: nuevoUbigeo.provincia,
      distrito: nuevoUbigeo.distrito,
    }));

    // Actualizar también los selects de ubigeo
    setSelectedDepartamento({ nombre: nuevoUbigeo.departamento });
    setSelectedProvincia({ nombre: nuevoUbigeo.provincia });
    setSelectedDistrito({ nombre: nuevoUbigeo.distrito });

    setMostrarModalUbigeo(false);
    alert("Ubigeo creado exitosamente y seleccionado");
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
      return tiposde15.includes(remitenteData.tipoDocumento) ? remitenteData.tipoDocumento : "CE";
    }
    return remitenteData.tipoDocumento; // Mantener el tipo actual si no coincide
  };

  // Función para manejar selección de ubigeo
  const handleUbigeoSelection = (tipo, valor) => {
    if (tipo === "departamento") {
      setDepartamentoSeleccionado(valor);
      setProvinciaSeleccionada("");
      setDistritoSeleccionado("");
      setRemitenteData((prev) => ({
        ...prev,
        departamento: valor,
        provincia: "",
        distrito: "",
        ubigeo: "",
      }));
    } else if (tipo === "provincia") {
      setProvinciaSeleccionada(valor);
      setDistritoSeleccionado("");
      setRemitenteData((prev) => ({
        ...prev,
        provincia: valor,
        distrito: "",
        ubigeo: "",
      }));
    } else if (tipo === "distrito") {
      setDistritoSeleccionado(valor);
      const ubigeoCompleto = ubigeosIniciales.find(
        (u) =>
          u.departamento === departamentoSeleccionado &&
          u.provincia === provinciaSeleccionada &&
          u.distrito === valor
      );
      if (ubigeoCompleto) {
        setRemitenteData((prev) => ({
          ...prev,
          distrito: valor,
          ubigeo: ubigeoCompleto.codigo,
          departamento: departamentoSeleccionado,
          provincia: provinciaSeleccionada,
        }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let updatedData = {
      ...remitenteData,
      [name]: value
    };

    // Detectar automáticamente el tipo de documento basado en la longitud
    if (name === "numeroDocumento") {
      const tipoDetectado = detectarTipoDocumento(value);
      if (tipoDetectado !== remitenteData.tipoDocumento) {
        updatedData.tipoDocumento = tipoDetectado;
      }
    }

    setRemitenteData(updatedData);

    // Consulta automática cuando se completa el documento
    if (name === "numeroDocumento") {
      consultarAutomaticamente(remitenteData.tipoDocumento, value);
    }
    if (name === "tipoDocumento") {
      consultarAutomaticamente(value, remitenteData.numeroDocumento);
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
          
          setRemitenteData(prev => ({
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
    if (!remitenteData.numeroDocumento || !remitenteData.tipoDocumento) {
      alert("Debe ingresar el tipo y número de documento");
      return;
    }

    if (remitenteData.tipoDocumento !== "DNI" && remitenteData.tipoDocumento !== "RUC") {
      alert("Solo se puede consultar RENIEC para DNI y RUC");
      return;
    }

    try {
      setConsultandoRENIEC(true);
      setMensajeRENIEC("Consultando...");

      const response = await consultarRENIEC(remitenteData.tipoDocumento, remitenteData.numeroDocumento);

      if (response.datos) {
        const datos = response.datos;

        setRemitenteData(prev => ({
          ...prev,
          nombre: prev.nombre || (remitenteData.tipoDocumento === "DNI" 
            ? `${datos.nombres || ""} ${datos.apellidoPaterno || ""} ${datos.apellidoMaterno || ""}`.trim()
            : datos.razonSocial || datos.nombre || ""),
          direccion: prev.direccion || datos.direccion || "",
        }));

        setMensajeRENIEC(
          `✅ Datos obtenidos de ${remitenteData.tipoDocumento === "DNI" ? "RENIEC" : "SUNAT"} exitosamente`
        );
      } else {
        throw new Error("No se encontraron datos para el documento consultado");
      }
    } catch (error) {
      console.error("Error al consultar:", error);
      setMensajeRENIEC(
        `❌ Error al consultar ${remitenteData.tipoDocumento === "DNI" ? "RENIEC" : "SUNAT"}: ${error.message}`
      );
    } finally {
      setConsultandoRENIEC(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const remitenteParaCrear = {
        tipoDocumento: remitenteData.tipoDocumento,
        numeroDocumento: remitenteData.numeroDocumento,
        nombre: remitenteData.nombre,
        telefono: remitenteData.telefono,
        direccion: remitenteData.direccion,
        departamento: remitenteData.departamento,
        provincia: remitenteData.provincia,
        distrito: remitenteData.distrito,
        ubigeo: remitenteData.ubigeo,
        consultarRENIEC: remitenteData.tipoDocumento === 'DNI' || remitenteData.tipoDocumento === 'RUC'
      };

      const response = await crearRemitente(remitenteParaCrear);
      
      if (response.remitente) {
        onRemitenteCreado(response.remitente);
        onClose();
      }
    } catch (error) {
      console.error('Error al crear remitente:', error);
      alert(`Error al crear remitente: ${error.message}`);
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
              Destinatario
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
                  value={remitenteData.tipoDocumento}
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
                  value={remitenteData.numeroDocumento}
                  onChange={handleInputChange}
                  required
                  maxLength={getMaxLength(remitenteData.tipoDocumento)}
                  placeholder={
                    remitenteData.tipoDocumento === "DNI"
                      ? "8 dígitos - Consulta automática"
                      : remitenteData.tipoDocumento === "RUC"
                      ? "11 dígitos - Consulta automática"
                      : `${getMaxLength(remitenteData.tipoDocumento)} dígitos`
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
                  value={remitenteData.telefono}
                  onChange={handleInputChange}
                  placeholder="Teléfono del remitente"
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
                  value={remitenteData.nombre}
                  onChange={handleInputChange}
                  required
                  placeholder={
                     remitenteData.tipoDocumento === "DNI"
                       ? "Se completará automáticamente con RENIEC"
                       : remitenteData.tipoDocumento === "RUC"
                       ? "Se completará automáticamente con SUNAT"
                       : "Nombre completo del remitente"
                   }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor:
                      (remitenteData.tipoDocumento === "DNI" ||
                        remitenteData.tipoDocumento === "RUC") &&
                      !remitenteData.nombre
                        ? "#f8f9fa"
                        : "white",
                  }}
                />
              </div>

              {/* Ubigeo */}
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
                  Ubigeo
                </label>
                
                {/* Selects horizontales para ubigeo */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  {/* Departamento */}
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "3px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#666",
                      }}
                    >
                      DEPARTAMENTO
                    </label>
                    <select
                      value={departamentoSeleccionado}
                      onChange={(e) =>
                        handleUbigeoSelection("departamento", e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "11px",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      {[...new Set(ubigeosIniciales.map((u) => u.departamento))]
                        .sort()
                        .map((departamento) => (
                          <option key={departamento} value={departamento}>
                            {departamento}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Provincia */}
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "3px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#666",
                      }}
                    >
                      PROVINCIA
                    </label>
                    <select
                      value={provinciaSeleccionada}
                      onChange={(e) =>
                        handleUbigeoSelection("provincia", e.target.value)
                      }
                      disabled={!departamentoSeleccionado}
                      style={{
                        width: "100%",
                        padding: "6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "11px",
                        backgroundColor: departamentoSeleccionado
                          ? "white"
                          : "#f5f5f5",
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      {departamentoSeleccionado &&
                        [
                          ...new Set(
                            ubigeosIniciales
                              .filter(
                                (u) =>
                                  u.departamento === departamentoSeleccionado
                              )
                              .map((u) => u.provincia)
                          ),
                        ]
                          .sort()
                          .map((provincia) => (
                            <option key={provincia} value={provincia}>
                              {provincia}
                            </option>
                          ))}
                    </select>
                  </div>

                  {/* Distrito */}
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "3px",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#666",
                      }}
                    >
                      DISTRITO
                    </label>
                    <select
                      value={distritoSeleccionado}
                      onChange={(e) =>
                        handleUbigeoSelection("distrito", e.target.value)
                      }
                      disabled={!provinciaSeleccionada}
                      style={{
                        width: "100%",
                        padding: "6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "11px",
                        backgroundColor: provinciaSeleccionada
                          ? "white"
                          : "#f5f5f5",
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      {provinciaSeleccionada &&
                        ubigeosIniciales
                          .filter(
                            (u) =>
                              u.departamento === departamentoSeleccionado &&
                              u.provincia === provinciaSeleccionada
                          )
                          .map((u) => u.distrito)
                          .sort()
                          .map((distrito) => (
                            <option key={distrito} value={distrito}>
                              {distrito}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                {/* Mostrar código de ubigeo seleccionado */}
                {remitenteData.ubigeo && (
                  <div
                    style={{
                      padding: "8px",
                      backgroundColor: "#e8f5e8",
                      border: "1px solid #28a745",
                      borderRadius: "4px",
                      fontSize: "11px",
                      color: "#155724",
                      fontWeight: "600",
                    }}
                  >
                    ✅ Ubigeo seleccionado: {remitenteData.ubigeo} - {remitenteData.departamento}, {remitenteData.provincia}, {remitenteData.distrito}
                  </div>
                )}
              </div>


              {/* Dirección */}
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
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={remitenteData.direccion}
                  onChange={handleInputChange}
                  placeholder="Dirección completa"
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
              {(remitenteData.tipoDocumento === "DNI" ||
                remitenteData.tipoDocumento === "RUC") &&
                remitenteData.numeroDocumento && (
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
                            remitenteData.tipoDocumento === "DNI"
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
                      Consulta manual opcional. Al crear el remitente se consulta automáticamente.
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
                {loading ? "Creando..." : "Crear Remitente"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Nuevo Ubigeo */}
      {mostrarModalUbigeo && (
        <ModalNuevoUbigeo
          isOpen={mostrarModalUbigeo}
          onClose={() => setMostrarModalUbigeo(false)}
          onUbigeoCreado={handleUbigeoCreado}
        />
      )}
    </>
  );
}

// Modal para añadir nuevo ubigeo
function ModalNuevoUbigeo({ isOpen, onClose, onUbigeoCreado }) {
  const [nuevoUbigeo, setNuevoUbigeo] = useState({
    codigo: "",
    departamento: "",
    provincia: "",
    distrito: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoUbigeo((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !nuevoUbigeo.codigo ||
      !nuevoUbigeo.departamento ||
      !nuevoUbigeo.provincia ||
      !nuevoUbigeo.distrito
    ) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const ubigeoCompleto = {
      id: nuevoUbigeo.codigo,
      ...nuevoUbigeo,
    };

    onUbigeoCreado(ubigeoCompleto);

    // Limpiar formulario
    setNuevoUbigeo({
      codigo: "",
      departamento: "",
      provincia: "",
      distrito: "",
    });
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
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1500,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            Nuevo Ubigeo
          </h3>
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          <div
            style={{
              display: "grid",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            {/* Código */}
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
                Código Ubigeo *
              </label>
              <input
                type="text"
                name="codigo"
                value={nuevoUbigeo.codigo}
                onChange={handleInputChange}
                placeholder="Ej: 150101"
                maxLength="6"
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

            {/* Departamento */}
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
                Departamento *
              </label>
              <select
                name="departamento"
                value={nuevoUbigeo.departamento}
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
                <option value="">Seleccione un departamento</option>
                <option value="AMAZONAS">AMAZONAS</option>
                <option value="ANCASH">ANCASH</option>
                <option value="APURIMAC">APURIMAC</option>
                <option value="AREQUIPA">AREQUIPA</option>
                <option value="AYACUCHO">AYACUCHO</option>
                <option value="CAJAMARCA">CAJAMARCA</option>
                <option value="CALLAO">CALLAO</option>
                <option value="CUSCO">CUSCO</option>
                <option value="HUANCAVELICA">HUANCAVELICA</option>
                <option value="HUANUCO">HUANUCO</option>
                <option value="ICA">ICA</option>
                <option value="JUNIN">JUNIN</option>
                <option value="LA_LIBERTAD">LA LIBERTAD</option>
                <option value="LAMBAYEQUE">LAMBAYEQUE</option>
                <option value="LIMA">LIMA</option>
                <option value="LORETO">LORETO</option>
                <option value="MADRE_DE_DIOS">MADRE DE DIOS</option>
                <option value="MOQUEGUA">MOQUEGUA</option>
                <option value="PASCO">PASCO</option>
                <option value="PIURA">PIURA</option>
                <option value="PUNO">PUNO</option>
                <option value="SAN_MARTIN">SAN MARTÍN</option>
                <option value="TACNA">TACNA</option>
                <option value="TUMBES">TUMBES</option>
                <option value="UCAYALI">UCAYALI</option>
              </select>
            </div>

            {/* Provincia */}
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
                Provincia *
              </label>
              <select
                name="provincia"
                value={nuevoUbigeo.provincia}
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
                <option value="">Seleccione una provincia</option>
                <option value="LIMA">LIMA</option>
                <option value="CALLAO">CALLAO</option>
                <option value="AREQUIPA">AREQUIPA</option>
              </select>
            </div>

            {/* Distrito */}
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
                Distrito *
              </label>
              <select
                name="distrito"
                value={nuevoUbigeo.distrito}
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
                <option value="">Seleccione un distrito</option>
                <option value="LIMA">LIMA</option>
                <option value="MIRAFLORES">MIRAFLORES</option>
                <option value="SAN ISIDRO">SAN ISIDRO</option>
                <option value="SURCO">SURCO</option>
                <option value="LA MOLINA">LA MOLINA</option>
              </select>
            </div>
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
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#007bff",
                color: "white",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              Crear Ubigeo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default destinatarioModal ;