/**
 * Configuración para API de SUNAT
 * Usando la API de facturación electrónica de Lucode (apisunat.lucode.pe)
 */
const SUNAT_APIS = {
    // API principal para facturación electrónica

    PRINCIPAL: {
        baseURL: "https://facturaciondirecta.com/API_SUNAT",
        endpoint: "/post.php",
        timeout: 60000, // 60 segundos
        usuario: process.env.SUNAT_USER || "MODDATOS",
        password: process.env.SUNAT_PASSWORD || "MODDATOS",
        modo: process.env.SUNAT_MODE || "0", // 0: Producción, 1: Prueba
        monedas: {
            "1": "PEN", // Soles
            "2": "USD"  // Dólares
        },
        formasPago: {
            "1": "Contado",
            "2": "Crédito"
        },
        tiposDocumento: {
            "01": "FACTURA",
            "03": "BOLETA",
            "07": "NOTA_CREDITO",
            "08": "NOTA_DEBITO",
            "09": "GUIA_REMISION"
        }
    },
    // Nueva API de Lucode para facturación electrónica
    // Esta API se usa como alternativa cuando la API principal falla
    // Para obtener un token, regístrese en https://apisunat.lucode.pe
    // y configure la variable de entorno LUCODE_TOKEN o actualice este valor
    LUCODE: {
        baseURL: "https://apisunat.lucode.pe/api",
        endpoint: "/facturacion",
        timeout: 30000, // 30 segundos
        token: process.env.LUCODE_TOKEN || "", // Token de autenticación (REQUERIDO)
        modo: "0", // 0: Producción, 1: Prueba
        monedas: {
            "1": "PEN", // Soles
            "2": "USD"  // Dólares
        },
        formasPago: {
            "1": "Contado",
            "2": "Crédito"
        },
        tiposDocumento: {
            "01": "FACTURA",
            "03": "BOLETA",
            "07": "NOTA_CREDITO",
            "08": "NOTA_DEBITO",
            "09": "GUIA_REMISION"
        }
    }
};

module.exports = {
    SUNAT_APIS
};