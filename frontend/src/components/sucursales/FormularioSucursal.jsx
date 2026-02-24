// src/components/sucursales/FormularioSucursal.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Building,
  MapPin,
  FileText,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  crearSucursal,
  actualizarSucursal,
  obtenerSucursalPorId,
} from "../../services/sucursalService";
import {
  validarFormularioSucursal,
  validarCampo,
  formatearRUC,
  formatearTelefono,
  formatearUBIGEO,
  capitalizarTexto,
  limpiarDatosFormulario,
  tieneErrores,
  MENSAJES_ERROR,
} from "../../utils/validacionesSucursal";
import "../../styles/FormularioSucursal.css";

const FormularioSucursal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    telefono: "",
    email: "",
    ruc: "",
    razonSocial: "",
    nombreComercial: "",
    direccion: "",
    ubigeo: "",
    urbanizacion: "",
    distrito: "",
    provincia: "",
    departamento: "",
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [errores, setErrores] = useState({});
  const [validandoCampo, setValidandoCampo] = useState(null);

  const cargarDatos = useCallback(async () => {
    if (!esEdicion) return;

    try {
      setCargando(true);
      const sucursalData = await obtenerSucursalPorId(id);
      const sucursal = sucursalData.sucursal;

      setFormData({
        nombre: sucursal.nombre || "",
        ubicacion: sucursal.ubicacion || "",
        telefono: sucursal.telefono || "",
        email: sucursal.email || "",
        ruc: sucursal.ruc || "",
        razonSocial: sucursal.razonSocial || "",
        nombreComercial: sucursal.nombreComercial || "",
        direccion: sucursal.direccion || "",
        ubigeo: sucursal.ubigeo || "",
        urbanizacion: sucursal.urbanizacion || "",
        distrito: sucursal.distrito || "",
        provincia: sucursal.provincia || "",
        departamento: sucursal.departamento || "",
      });
    } catch (error) {
      setError("Error al cargar los datos de la sucursal: " + error.message);
    } finally {
      setCargando(false);
    }
  }, [id, esEdicion]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const validarFormulario = () => {
    const datosLimpios = limpiarDatosFormulario(formData);
    const nuevosErrores = validarFormularioSucursal(datosLimpios);

    setErrores(nuevosErrores);
    return !tieneErrores(nuevosErrores);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    let valorFormateado = value;

    // Aplicar formateo según el campo
    switch (name) {
      case "ruc":
        valorFormateado = formatearRUC(value);
        break;
      case "telefono":
        valorFormateado = formatearTelefono(value);
        break;
      case "ubigeo":
        valorFormateado = formatearUBIGEO(value);
        break;
      case "distrito":
      case "provincia":
      case "departamento":
        valorFormateado = capitalizarTexto(value);
        break;
      default:
        valorFormateado = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: valorFormateado,
    }));

    // Validar campo en tiempo real
    const error = validarCampo(name, valorFormateado);
    setErrores((prev) => ({
      ...prev,
      [name]: error || "",
    }));
  };

  const manejarBlur = (e) => {
    const { name, value } = e.target;
    setValidandoCampo(name);

    // Validar campo al perder el foco
    const error = validarCampo(name, value);
    setErrores((prev) => ({
      ...prev,
      [name]: error || "",
    }));

    setTimeout(() => setValidandoCampo(null), 300);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      const primerError = Object.keys(errores)[0];
      if (primerError) {
        // Enfocar el primer campo con error
        const elemento = document.querySelector(`[name="${primerError}"]`);
        if (elemento) {
          elemento.focus();
          elemento.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      Swal.fire({
        icon: "error",
        title: "Errores en el formulario",
        text: MENSAJES_ERROR.CAMPOS_REQUERIDOS,
        confirmButtonColor: "#d33",
      });
      return;
    }

    try {
      setCargando(true);
      setError("");

      const datosLimpios = limpiarDatosFormulario(formData);

      if (esEdicion) {
        await actualizarSucursal(id, datosLimpios);
        Swal.fire({
          icon: "success",
          title: "Sucursal actualizada",
          text: "La sucursal ha sido actualizada correctamente",
          confirmButtonColor: "#10b981",
        });
      } else {
        await crearSucursal(datosLimpios);
        Swal.fire({
          icon: "success",
          title: "Sucursal creada",
          text: "La sucursal ha sido creada correctamente",
          confirmButtonColor: "#10b981",
        });
      }

      navigate("/sucursales/gestion");
    } catch (error) {
      console.error("Error al guardar sucursal:", error);
      let mensajeError = MENSAJES_ERROR.ERROR_SERVIDOR;

      if (error.message) {
        if (error.message.includes("RUC")) {
          mensajeError = "Ya existe una sucursal con este RUC";
        } else if (
          error.message.includes("conexión") ||
          error.message.includes("network")
        ) {
          mensajeError = MENSAJES_ERROR.ERROR_CONEXION;
        } else if (
          error.message.includes("permisos") ||
          error.message.includes("autorizado")
        ) {
          mensajeError = MENSAJES_ERROR.ERROR_PERMISOS;
        } else {
          mensajeError = error.message;
        }
      }

      setError(mensajeError);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: mensajeError,
        confirmButtonColor: "#d33",
      });
    } finally {
      setCargando(false);
    }
  };

  if (cargando && esEdicion) {
    return (
      <div className="formulario-sucursal">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando datos de la sucursal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="formulario-sucursal">
      <div className="header-section">
        <button
          className="btn-back"
          onClick={() => navigate("/sucursales/gestion")}
          type="button"
        >
          <ArrowLeft className="icon" />
          Volver
        </button>

        <div className="title-section">
          <h2>
            <Building className="icon" />
            {esEdicion ? "Editar Sucursal" : "Nueva Sucursal"}
          </h2>
          <p className="subtitle">
            {esEdicion
              ? "Modifica los datos de la sucursal"
              : "Completa los datos para crear una nueva sucursal"}
          </p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={manejarEnvio} className="form-container">
        <div className="form-sections">
          {/* Información Básica */}
          <div className="form-section">
            <h3 className="section-title">
              <Building className="section-icon" />
              Información Básica
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombre">Nombre de la Sucursal *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={`${errores.nombre ? "error" : ""} ${
                    validandoCampo === "nombre" ? "validando" : ""
                  }`}
                  placeholder="Ej: Sucursal Principal"
                />
                {errores.nombre && (
                  <span className="error-message">{errores.nombre}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="ubicacion">Ubicación *</label>
                <input
                  type="text"
                  id="ubicacion"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={`${errores.ubicacion ? "error" : ""} ${
                    validandoCampo === "ubicacion" ? "validando" : ""
                  }`}
                  placeholder="Ej: Av. Principal 123"
                />
                {errores.ubicacion && (
                  <span className="error-message">{errores.ubicacion}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={`${errores.telefono ? "error" : ""} ${
                    validandoCampo === "telefono" ? "validando" : ""
                  }`}
                  placeholder="Ej: 987654321"
                />
                {errores.telefono && (
                  <span className="error-message">{errores.telefono}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={`${errores.email ? "error" : ""} ${
                    validandoCampo === "email" ? "validando" : ""
                  }`}
                  placeholder="sucursal@empresa.com"
                />
                {errores.email && (
                  <span className="error-message">{errores.email}</span>
                )}
              </div>
            </div>
          </div>

          {/* Información Fiscal */}
          <div className="form-section">
            <h3 className="section-title">
              <FileText className="section-icon" />
              Información Fiscal (SUNAT)
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="ruc">RUC</label>
                <input
                  type="text"
                  id="ruc"
                  name="ruc"
                  value={formData.ruc}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={`${errores.ruc ? "error" : ""} ${
                    validandoCampo === "ruc" ? "validando" : ""
                  }`}
                  placeholder="20123456789"
                  maxLength="11"
                />
                {errores.ruc && (
                  <span className="error-message">{errores.ruc}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="razonSocial">Razón Social *</label>
                <input
                  type="text"
                  id="razonSocial"
                  name="razonSocial"
                  value={formData.razonSocial}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={`${errores.razonSocial ? "error" : ""} ${
                    validandoCampo === "razonSocial" ? "validando" : ""
                  }`}
                  placeholder="EMPRESA DEMO S.A.C."
                />
                {errores.razonSocial && (
                  <span className="error-message">{errores.razonSocial}</span>
                )}
              </div>

              <div className="form-group span-2">
                <label htmlFor="nombreComercial">Nombre Comercial *</label>
                <input
                  type="text"
                  id="nombreComercial"
                  name="nombreComercial"
                  value={formData.nombreComercial}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={`${errores.nombreComercial ? "error" : ""} ${
                    validandoCampo === "nombreComercial" ? "validando" : ""
                  }`}
                  placeholder="EMPRESA DEMO"
                />
                {errores.nombreComercial && (
                  <span className="error-message">
                    {errores.nombreComercial}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Información de Ubicación */}
          <div className="form-section">
            <h3 className="section-title">
              <MapPin className="section-icon" />
              Ubicación Detallada
            </h3>

            <div className="form-grid">
              <div className="form-group span-2">
                <label htmlFor="direccion">Dirección Completa *</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={`${errores.direccion ? "error" : ""} ${
                    validandoCampo === "direccion" ? "validando" : ""
                  }`}
                  placeholder="Av. Principal 123, Urbanización Ejemplo"
                />
                {errores.direccion && (
                  <span className="error-message">{errores.direccion}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="ubigeo">UBIGEO *</label>
                <input
                  type="text"
                  id="ubigeo"
                  name="ubigeo"
                  value={formData.ubigeo}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={`${errores.ubigeo ? "error" : ""} ${
                    validandoCampo === "ubigeo" ? "validando" : ""
                  }`}
                  placeholder="150101"
                  maxLength="6"
                />
                {errores.ubigeo && (
                  <span className="error-message">{errores.ubigeo}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="urbanizacion">Urbanización *</label>
                <input
                  type="text"
                  id="urbanizacion"
                  name="urbanizacion"
                  value={formData.urbanizacion}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={`${errores.urbanizacion ? "error" : ""} ${
                    validandoCampo === "urbanizacion" ? "validando" : ""
                  }`}
                  placeholder="Urbanización Ejemplo"
                />
                {errores.urbanizacion && (
                  <span className="error-message">{errores.urbanizacion}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="distrito">Distrito *</label>
                <input
                  type="text"
                  id="distrito"
                  name="distrito"
                  value={formData.distrito}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={`${errores.distrito ? "error" : ""} ${
                    validandoCampo === "distrito" ? "validando" : ""
                  }`}
                  placeholder="Lima"
                />
                {errores.distrito && (
                  <span className="error-message">{errores.distrito}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="provincia">Provincia *</label>
                <input
                  type="text"
                  id="provincia"
                  name="provincia"
                  value={formData.provincia}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={`${errores.provincia ? "error" : ""} ${
                    validandoCampo === "provincia" ? "validando" : ""
                  }`}
                  placeholder="Lima"
                />
                {errores.provincia && (
                  <span className="error-message">{errores.provincia}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="departamento">Departamento *</label>
                <input
                  type="text"
                  id="departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={`${errores.departamento ? "error" : ""} ${
                    validandoCampo === "departamento" ? "validando" : ""
                  }`}
                  placeholder="Lima"
                />
                {errores.departamento && (
                  <span className="error-message">{errores.departamento}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/sucursales")}
            disabled={cargando}
          >
            Cancelar
          </button>

          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? (
              <>
                <div className="btn-spinner"></div>
                {esEdicion ? "Actualizando..." : "Creando..."}
              </>
            ) : (
              <>
                <Save className="icon" />
                {esEdicion ? "Actualizar Sucursal" : "Crear Sucursal"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioSucursal;
