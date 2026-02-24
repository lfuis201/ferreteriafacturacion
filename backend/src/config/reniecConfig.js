/**
 * Configuración para API de RENIEC
 * Usando exclusivamente apis.net.pe que es confiable y gratuita
 */

const RENIEC_APIS = {
  // API principal (apis.net.pe) - Confiable y gratuita
  PRINCIPAL: {
    baseURL: "https://api.apis.net.pe/v1",
    endpoint: "/dni",
    params: { numero: "" },
    timeout: 15000,
  },
  // API para RUC (apis.net.pe) - Confiable y gratuita
  RUC: {
    baseURL: "https://api.apis.net.pe/v1",
    endpoint: "/ruc",
    params: { numero: "" },
    timeout: 15000,
  },
};
module.exports = {
  RENIEC_APIS,
};
