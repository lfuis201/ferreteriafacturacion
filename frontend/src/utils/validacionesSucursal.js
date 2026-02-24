// src/utils/validacionesSucursal.js

/**
 * Validaciones para el formulario de sucursales
 */

// Expresiones regulares
const REGEX_RUC = /^\d{11}$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^[+]?[0-9\s\-()]{7,15}$/;
const REGEX_UBIGEO = /^\d{6}$/;
const REGEX_SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const REGEX_ALFANUMERICO = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-.,#]+$/;

/**
 * Valida un campo individual
 * @param {string} campo - Nombre del campo
 * @param {string} valor - Valor del campo
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validarCampo = (campo, valor) => {
  const valorTrimmed = valor?.toString().trim() || '';

  switch (campo) {
    case 'nombre':
      if (!valorTrimmed) {
        return 'El nombre de la sucursal es obligatorio';
      }
      if (valorTrimmed.length < 2) {
        return 'El nombre debe tener al menos 2 caracteres';
      }
      if (valorTrimmed.length > 100) {
        return 'El nombre no puede exceder 100 caracteres';
      }
      if (!REGEX_ALFANUMERICO.test(valorTrimmed)) {
        return 'El nombre solo puede contener letras, números y caracteres básicos';
      }
      break;

    case 'ubicacion':
      if (!valorTrimmed) {
        return 'La ubicación es obligatoria';
      }
      if (valorTrimmed.length < 3) {
        return 'La ubicación debe tener al menos 3 caracteres';
      }
      if (valorTrimmed.length > 200) {
        return 'La ubicación no puede exceder 200 caracteres';
      }
      break;

    case 'ruc':
      // RUC es opcional, solo validar si se proporciona
      if (valorTrimmed && !REGEX_RUC.test(valorTrimmed)) {
        return 'El RUC debe tener exactamente 11 dígitos';
      }
      if (valorTrimmed && !validarRUC(valorTrimmed)) {
        return 'El RUC ingresado no es válido';
      }
      break;

    case 'razonSocial':
      if (!valorTrimmed) {
        return 'La razón social es obligatoria';
      }
      if (valorTrimmed.length < 3) {
        return 'La razón social debe tener al menos 3 caracteres';
      }
      if (valorTrimmed.length > 150) {
        return 'La razón social no puede exceder 150 caracteres';
      }
      break;

    case 'nombreComercial':
      if (!valorTrimmed) {
        return 'El nombre comercial es obligatorio';
      }
      if (valorTrimmed.length < 2) {
        return 'El nombre comercial debe tener al menos 2 caracteres';
      }
      if (valorTrimmed.length > 100) {
        return 'El nombre comercial no puede exceder 100 caracteres';
      }
      break;

    case 'direccion':
      if (!valorTrimmed) {
        return 'La dirección es obligatoria';
      }
      if (valorTrimmed.length < 5) {
        return 'La dirección debe tener al menos 5 caracteres';
      }
      if (valorTrimmed.length > 200) {
        return 'La dirección no puede exceder 200 caracteres';
      }
      break;

    case 'ubigeo':
      if (!valorTrimmed) {
        return 'El UBIGEO es obligatorio';
      }
      if (!REGEX_UBIGEO.test(valorTrimmed)) {
        return 'El UBIGEO debe tener exactamente 6 dígitos';
      }
      break;

    case 'distrito':
      if (!valorTrimmed) {
        return 'El distrito es obligatorio';
      }
      if (valorTrimmed.length < 2) {
        return 'El distrito debe tener al menos 2 caracteres';
      }
      if (valorTrimmed.length > 50) {
        return 'El distrito no puede exceder 50 caracteres';
      }
      if (!REGEX_SOLO_LETRAS.test(valorTrimmed)) {
        return 'El distrito solo puede contener letras';
      }
      break;

    case 'provincia':
      if (!valorTrimmed) {
        return 'La provincia es obligatoria';
      }
      if (valorTrimmed.length < 2) {
        return 'La provincia debe tener al menos 2 caracteres';
      }
      if (valorTrimmed.length > 50) {
        return 'La provincia no puede exceder 50 caracteres';
      }
      if (!REGEX_SOLO_LETRAS.test(valorTrimmed)) {
        return 'La provincia solo puede contener letras';
      }
      break;

    case 'departamento':
      if (!valorTrimmed) {
        return 'El departamento es obligatorio';
      }
      if (valorTrimmed.length < 2) {
        return 'El departamento debe tener al menos 2 caracteres';
      }
      if (valorTrimmed.length > 50) {
        return 'El departamento no puede exceder 50 caracteres';
      }
      if (!REGEX_SOLO_LETRAS.test(valorTrimmed)) {
        return 'El departamento solo puede contener letras';
      }
      break;




      case 'urbanizacion':
      if (!valorTrimmed) {
        return 'La urbanización es obligatoria';
      }
      if (valorTrimmed.length < 3) {
        return 'La urbanización debe tener al menos 3 caracteres';
      }
      if (valorTrimmed.length > 100) {
        return 'La urbanización no puede exceder 100 caracteres';
      }
      if (!REGEX_ALFANUMERICO.test(valorTrimmed)) {
        return 'La urbanización solo puede contener letras, números y caracteres básicos';
      }
      break;

    case 'email':
      if (valorTrimmed && !REGEX_EMAIL.test(valorTrimmed)) {
        return 'El formato del email no es válido';
      }
      if (valorTrimmed && valorTrimmed.length > 100) {
        return 'El email no puede exceder 100 caracteres';
      }
      break;

    case 'telefono':
      if (valorTrimmed && !REGEX_TELEFONO.test(valorTrimmed)) {
        return 'El formato del teléfono no es válido';
      }
      if (valorTrimmed && valorTrimmed.length > 15) {
        return 'El teléfono no puede exceder 15 caracteres';
      }
      break;

    default:
      break;
  }

  return null;
};

/**
 * Valida todo el formulario de sucursal
 * @param {Object} datos - Datos del formulario
 * @returns {Object} - Objeto con errores por campo
 */
export const validarFormularioSucursal = (datos) => {
  const errores = {};
  
  // Campos obligatorios
   const camposObligatorios = [
    'nombre', 'ubicacion', 'urbanizacion', 'razonSocial', 'nombreComercial',
    'direccion', 'ubigeo', 'distrito', 'provincia', 'departamento'
  ];
  
  // Campos opcionales
  const camposOpcionales = ['email', 'telefono', 'ruc'];
  
  // Validar campos obligatorios
  camposObligatorios.forEach(campo => {
    const error = validarCampo(campo, datos[campo]);
    if (error) {
      errores[campo] = error;
    }
  });
  
  // Validar campos opcionales solo si tienen valor
  camposOpcionales.forEach(campo => {
    if (datos[campo]) {
      const error = validarCampo(campo, datos[campo]);
      if (error) {
        errores[campo] = error;
      }
    }
  });
  
  return errores;
};

/**
 * Valida un RUC peruano
 * @param {string} ruc - RUC a validar
 * @returns {boolean} - true si es válido
 */
export const validarRUC = (ruc) => {
  if (!ruc || ruc.length !== 11) return false;
  
  // Verificar que todos sean dígitos
  if (!/^\d{11}$/.test(ruc)) return false;
  
  // Permitir cualquier RUC de 11 dígitos sin validar el algoritmo
  return true;
};

/**
 * Formatea un RUC agregando guiones
 * @param {string} ruc - RUC a formatear
 * @returns {string} - RUC formateado
 */
export const formatearRUC = (ruc) => {
  if (!ruc) return '';
  const soloNumeros = ruc.replace(/\D/g, '');
  if (soloNumeros.length <= 11) {
    return soloNumeros;
  }
  return soloNumeros.slice(0, 11);
};

/**
 * Formatea un teléfono
 * @param {string} telefono - Teléfono a formatear
 * @returns {string} - Teléfono formateado
 */
export const formatearTelefono = (telefono) => {
  if (!telefono) return '';
  // Permitir solo números, espacios, guiones, paréntesis y el signo +
  return telefono.replace(/[^0-9\s\-()+ ]/g, '').slice(0, 15);
};

/**
 * Formatea un UBIGEO
 * @param {string} ubigeo - UBIGEO a formatear
 * @returns {string} - UBIGEO formateado
 */
export const formatearUBIGEO = (ubigeo) => {
  if (!ubigeo) return '';
  const soloNumeros = ubigeo.replace(/\D/g, '');
  return soloNumeros.slice(0, 6);
};

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} texto - Texto a capitalizar
 * @returns {string} - Texto capitalizado
 */
export const capitalizarTexto = (texto) => {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
};

/**
 * Valida si hay errores en el formulario
 * @param {Object} errores - Objeto de errores
 * @returns {boolean} - true si hay errores
 */
export const tieneErrores = (errores) => {
  return Object.keys(errores).length > 0;
};

/**
 * Obtiene el primer error del formulario
 * @param {Object} errores - Objeto de errores
 * @returns {string|null} - Primer error encontrado
 */
export const obtenerPrimerError = (errores) => {
  const campos = Object.keys(errores);
  return campos.length > 0 ? errores[campos[0]] : null;
};

/**
 * Limpia los datos del formulario eliminando espacios extra
 * @param {Object} datos - Datos del formulario
 * @returns {Object} - Datos limpios
 */
export const limpiarDatosFormulario = (datos) => {
  const datosLimpios = {};
  
  Object.keys(datos).forEach(campo => {
    if (typeof datos[campo] === 'string') {
      datosLimpios[campo] = datos[campo].trim();
    } else {
      datosLimpios[campo] = datos[campo];
    }
  });
  
  return datosLimpios;
};

/**
 * Mensajes de error personalizados
 */
export const MENSAJES_ERROR = {
  CAMPOS_REQUERIDOS: 'Por favor, completa todos los campos obligatorios',
  RUC_INVALIDO: 'El RUC ingresado no es válido',
  EMAIL_INVALIDO: 'El formato del email no es válido',
  TELEFONO_INVALIDO: 'El formato del teléfono no es válido',
  UBIGEO_INVALIDO: 'El UBIGEO debe tener 6 dígitos',
  DATOS_DUPLICADOS: 'Ya existe una sucursal con estos datos',
  ERROR_SERVIDOR: 'Error del servidor. Intenta nuevamente.',
  ERROR_CONEXION: 'Error de conexión. Verifica tu internet.',
  ERROR_PERMISOS: 'No tienes permisos para realizar esta acción'
};

/**
 * Departamentos del Perú para validación
 */
export const DEPARTAMENTOS_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios',
  'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna',
  'Tumbes', 'Ucayali'
];

/**
 * Valida si un departamento es válido
 * @param {string} departamento - Departamento a validar
 * @returns {boolean} - true si es válido
 */
export const validarDepartamento = (departamento) => {
  return DEPARTAMENTOS_PERU.includes(departamento);
};