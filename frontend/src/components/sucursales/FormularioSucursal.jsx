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

const inputBase =
  "w-full rounded-lg border px-3 py-2.5 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const inputError = "border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500";
const inputValidando = "border-blue-400 bg-blue-50/50 focus:ring-blue-500";

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

  const inputClass = (name) =>
    [
      inputBase,
      errores[name] ? inputError : "",
      validandoCampo === name ? inputValidando : "",
      !errores[name] && validandoCampo !== name ? "border-slate-300" : "",
    ]
      .filter(Boolean)
      .join(" ");

  const FormGroup = ({ id, name, label, required, children, span2 }) => (
    <div className={span2 ? "md:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-700">
        {label}{required && " *"}
      </label>
      {children}
      {errores[name] && (
        <p className="mt-1 text-sm font-medium text-red-600">{errores[name]}</p>
      )}
    </div>
  );

  if (cargando && esEdicion) {
    return (
      <div className="mx-auto max-w-4xl py-6">
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 shadow-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-slate-600">Cargando datos de la sucursal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 px-6">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate("/sucursales/gestion")}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl">
            <Building size={28} className="shrink-0 text-blue-600" />
            {esEdicion ? "Editar Sucursal" : "Nueva Sucursal"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {esEdicion
              ? "Modifica los datos de la sucursal"
              : "Completa los datos para crear una nueva sucursal"}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={manejarEnvio} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
          {/* Información Básica */}
          <section>
            <h3 className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3 text-lg font-semibold text-slate-900">
              <Building size={20} className="text-blue-600" />
              Información Básica
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormGroup id="nombre" name="nombre" label="Nombre de la Sucursal" required>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={inputClass("nombre")}
                  placeholder="Ej: Sucursal Principal"
                />
              </FormGroup>
              <FormGroup id="ubicacion" name="ubicacion" label="Ubicación" required>
                <input
                  type="text"
                  id="ubicacion"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={inputClass("ubicacion")}
                  placeholder="Ej: Av. Principal 123"
                />
              </FormGroup>
              <FormGroup id="telefono" name="telefono" label="Teléfono">
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={inputClass("telefono")}
                  placeholder="Ej: 987654321"
                />
              </FormGroup>
              <FormGroup id="email" name="email" label="Email">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={inputClass("email")}
                  placeholder="sucursal@empresa.com"
                />
              </FormGroup>
            </div>
          </section>

          {/* Información Fiscal */}
          <section>
            <h3 className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3 text-lg font-semibold text-slate-900">
              <FileText size={20} className="text-blue-600" />
              Información Fiscal (SUNAT)
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormGroup id="ruc" name="ruc" label="RUC">
                <input
                  type="text"
                  id="ruc"
                  name="ruc"
                  value={formData.ruc}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={inputClass("ruc")}
                  placeholder="20123456789"
                  maxLength={11}
                />
              </FormGroup>
              <FormGroup id="razonSocial" name="razonSocial" label="Razón Social" required>
                <input
                  type="text"
                  id="razonSocial"
                  name="razonSocial"
                  value={formData.razonSocial}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={inputClass("razonSocial")}
                  placeholder="EMPRESA DEMO S.A.C."
                />
              </FormGroup>
              <FormGroup id="nombreComercial" name="nombreComercial" label="Nombre Comercial" required span2>
                <input
                  type="text"
                  id="nombreComercial"
                  name="nombreComercial"
                  value={formData.nombreComercial}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={inputClass("nombreComercial")}
                  placeholder="EMPRESA DEMO"
                />
              </FormGroup>
            </div>
          </section>

          {/* Ubicación Detallada */}
          <section>
            <h3 className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3 text-lg font-semibold text-slate-900">
              <MapPin size={20} className="text-blue-600" />
              Ubicación Detallada
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormGroup id="direccion" name="direccion" label="Dirección Completa" required span2>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={inputClass("direccion")}
                  placeholder="Av. Principal 123, Urbanización Ejemplo"
                />
              </FormGroup>
              <FormGroup id="ubigeo" name="ubigeo" label="UBIGEO" required>
                <input
                  type="text"
                  id="ubigeo"
                  name="ubigeo"
                  value={formData.ubigeo}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={inputClass("ubigeo")}
                  placeholder="150101"
                  maxLength={6}
                />
              </FormGroup>
              <FormGroup id="urbanizacion" name="urbanizacion" label="Urbanización" required>
                <input
                  type="text"
                  id="urbanizacion"
                  name="urbanizacion"
                  value={formData.urbanizacion}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={inputClass("urbanizacion")}
                  placeholder="Urbanización Ejemplo"
                />
              </FormGroup>
              <FormGroup id="distrito" name="distrito" label="Distrito" required>
                <input
                  type="text"
                  id="distrito"
                  name="distrito"
                  value={formData.distrito}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={inputClass("distrito")}
                  placeholder="Lima"
                />
              </FormGroup>
              <FormGroup id="provincia" name="provincia" label="Provincia" required>
                <input
                  type="text"
                  id="provincia"
                  name="provincia"
                  value={formData.provincia}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={inputClass("provincia")}
                  placeholder="Lima"
                />
              </FormGroup>
              <FormGroup id="departamento" name="departamento" label="Departamento" required>
                <input
                  type="text"
                  id="departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  className={inputClass("departamento")}
                  placeholder="Lima"
                />
              </FormGroup>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
          <button
            type="button"
            onClick={() => navigate("/sucursales/gestion")}
            disabled={cargando}
            className="order-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:order-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {cargando ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {esEdicion ? "Actualizando..." : "Creando..."}
              </>
            ) : (
              <>
                <Save size={18} />
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
