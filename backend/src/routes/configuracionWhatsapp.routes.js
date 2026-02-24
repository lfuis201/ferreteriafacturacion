const express = require('express');
const router = express.Router();
const ConfiguracionWhatsappController = require('../controllers/configuracionWhatsapp.controller');
const { verificarToken, esSuperAdmin } = require('../middlewares/authMiddleware');
const { esAdminOSuperAdmin } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Configuración WhatsApp
 *   description: API para gestión de configuración WhatsApp y envío de comprobantes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ConfiguracionWhatsapp:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la configuración
 *         sucursalId:
           type: integer
           description: ID de la sucursal
         proveedorApi:
           type: string
           description: Proveedor de la API de WhatsApp
         urlApi:
           type: string
           description: URL de la API de WhatsApp
         tokenApi:
           type: string
           description: Token de autenticación de la API
         usuarioApi:
           type: string
           description: Usuario de la API
         numeroTelefono:
           type: string
           description: Número de teléfono de WhatsApp
         mensajeSaludo:
           type: string
           description: Mensaje de saludo
         mensajeDespedida:
           type: string
           description: Mensaje de despedida
         plantillaFactura:
           type: string
           description: Plantilla para facturas
         plantillaBoleta:
           type: string
           description: Plantilla para boletas
         envioAutomatico:
           type: boolean
           description: Envío automático de comprobantes
         limiteDiario:
           type: integer
           description: Límite diario de mensajes
         horaInicioEnvio:
           type: string
           description: Hora de inicio para envío
         horaFinEnvio:
           type: string
           description: Hora de fin para envío
         activo:
           type: boolean
           description: Estado de la configuración
 */

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

// Rutas para configuración WhatsApp

/**
 * @swagger
 * /configuracion-whatsapp/{sucursalId}:
 *   get:
 *     summary: Obtener configuración WhatsApp de una sucursal
 *     tags: [Configuración WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Configuración WhatsApp obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ConfiguracionWhatsapp'
 *       404:
 *         description: Configuración no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.get('/:sucursalId', 
  esAdminOSuperAdmin,
  ConfiguracionWhatsappController.obtenerConfiguracion
);

/**
 * @swagger
 * /configuracion-whatsapp/{sucursalId}/crear:
 *   post:
 *     summary: Crear configuración WhatsApp para una sucursal
 *     tags: [Configuración WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
               - proveedorApi
               - urlApi
               - numeroTelefono
             properties:
               proveedorApi:
                 type: string
                 description: Proveedor de la API de WhatsApp
                 example: "https://api.whatsapp.com/send"
               urlApi:
                 type: string
                 description: URL de la API de WhatsApp
                 example: "https://api.whatsapp.com"
               tokenApi:
                 type: string
                 description: Token de autenticación de la API
               usuarioApi:
                 type: string
                 description: Usuario de la API (opcional)
               passwordApi:
                 type: string
                 description: Contraseña de la API (opcional)
               numeroTelefono:
                 type: string
                 description: Número de teléfono de WhatsApp
                 example: "+51987654321"
               mensajeSaludo:
                 type: string
                 description: Mensaje de saludo
                 example: "¡Hola! Te enviamos tu comprobante de compra."
               mensajeDespedida:
                 type: string
                 description: Mensaje de despedida
                 example: "Gracias por tu preferencia. ¡Que tengas un buen día!"
               plantillaFactura:
                 type: string
                 description: Plantilla para facturas
                 example: "Factura N° {numero}\nFecha: {fecha}\nTotal: S/ {total}"
               plantillaBoleta:
                 type: string
                 description: Plantilla para boletas
                 example: "Boleta N° {numero}\nFecha: {fecha}\nTotal: S/ {total}"
               envioAutomatico:
                 type: boolean
                 description: Envío automático de comprobantes
                 example: false
               limiteDiario:
                 type: integer
                 description: Límite diario de mensajes
                 example: 100
               horaInicioEnvio:
                 type: string
                 description: Hora de inicio para envío
                 example: "08:00"
               horaFinEnvio:
                 type: string
                 description: Hora de fin para envío
                 example: "18:00"
               activo:
                 type: boolean
                 description: Estado de la configuración
                 example: true
 *     responses:
 *       201:
 *         description: Configuración creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ConfiguracionWhatsapp'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.post('/:sucursalId',
  esAdminOSuperAdmin,
  ConfiguracionWhatsappController.guardarConfiguracion
);

/**
 * @swagger
 * /configuracion-whatsapp/{sucursalId}/actualizar:
 *   put:
 *     summary: Actualizar configuración WhatsApp de una sucursal
 *     tags: [Configuración WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
               proveedorApi:
                 type: string
                 description: Proveedor de la API de WhatsApp
               urlApi:
                 type: string
                 description: URL de la API de WhatsApp
               tokenApi:
                 type: string
                 description: Token de autenticación de la API
               usuarioApi:
                 type: string
                 description: Usuario de la API (opcional)
               passwordApi:
                 type: string
                 description: Contraseña de la API (opcional)
               numeroTelefono:
                 type: string
                 description: Número de teléfono de WhatsApp
               mensajeSaludo:
                 type: string
                 description: Mensaje de saludo
               mensajeDespedida:
                 type: string
                 description: Mensaje de despedida
               plantillaFactura:
                 type: string
                 description: Plantilla para facturas
               plantillaBoleta:
                 type: string
                 description: Plantilla para boletas
               envioAutomatico:
                 type: boolean
                 description: Envío automático de comprobantes
               limiteDiario:
                 type: integer
                 description: Límite diario de mensajes
               horaInicioEnvio:
                 type: string
                 description: Hora de inicio para envío
               horaFinEnvio:
                 type: string
                 description: Hora de fin para envío
               activo:
                 type: boolean
                 description: Estado de la configuración
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ConfiguracionWhatsapp'
 *       404:
 *         description: Configuración no encontrada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.put('/:sucursalId/actualizar',
  esAdminOSuperAdmin,
  ConfiguracionWhatsappController.guardarConfiguracion
);

/**
 * @swagger
 * /configuracion-whatsapp/{sucursalId}/probar-conexion:
 *   post:
 *     summary: Probar conexión con WhatsApp usando Baileys (GRATUITO)
 *     tags: [Configuración WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Conexión exitosa con WhatsApp usando Baileys
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     proveedor:
 *                       type: string
 *                       description: Proveedor utilizado (Baileys GRATUITO)
 *                     estado:
 *                       type: string
 *                       description: Estado de la conexión
 *                     numeroTelefono:
 *                       type: string
 *                       description: Número de teléfono configurado
 *                     qrCode:
 *                       type: string
 *                       description: Código QR si es necesario conectar
 *                     requiereQR:
 *                       type: boolean
 *                       description: Si necesita escanear código QR
 *                     instrucciones:
 *                       type: string
 *                       description: Instrucciones para conectar
 *       400:
 *         description: Error en la configuración o conexión
 *       404:
 *         description: Configuración no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 *       500:
 *         description: Error de conexión con WhatsApp
 */
router.post('/:sucursalId/probar-conexion',
  esAdminOSuperAdmin,
  ConfiguracionWhatsappController.probarConexion
);

/**
 * @swagger
 * /configuracion-whatsapp/{sucursalId}/enviar-comprobante:
 *   post:
 *     summary: Enviar comprobante por WhatsApp usando Baileys (GRATUITO - SIN LÍMITES)
 *     tags: [Configuración WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numeroDestino
 *               - mensaje
 *             properties:
 *               numeroDestino:
 *                 type: string
 *                 description: Número de WhatsApp del destinatario (incluir código de país)
 *                 example: "+51987654321"
 *               mensaje:
 *                 type: string
 *                 description: Mensaje a enviar
 *                 example: "Hola, te enviamos tu comprobante de compra. Gracias por tu preferencia."
 *               archivoBase64:
 *                 type: string
 *                 description: Archivo en formato base64 (opcional)
 *               nombreArchivo:
 *                 type: string
 *                 description: Nombre del archivo adjunto (opcional)
 *                 example: "comprobante.pdf"
 *     responses:
 *       200:
 *         description: Comprobante enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     mensajeId:
 *                       type: string
 *                       description: ID del mensaje enviado
 *                     estado:
 *                       type: string
 *                       description: Estado del envío
 *       400:
 *         description: Datos inválidos o límite diario alcanzado
 *       404:
 *         description: Configuración o comprobante no encontrado
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 *       500:
 *         description: Error al enviar mensaje
 */
router.post('/:sucursalId/enviar-comprobante',
  esAdminOSuperAdmin,
  ConfiguracionWhatsappController.enviarComprobante
);

/**
 * @swagger
 * /configuracion-whatsapp/{sucursalId}/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de envíos de WhatsApp
 *     tags: [Configuración WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para el reporte
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para el reporte
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalEnviados:
 *                       type: integer
 *                       description: Total de mensajes enviados
 *                     enviadosHoy:
 *                       type: integer
 *                       description: Mensajes enviados hoy
 *                     limiteDiario:
 *                       type: integer
 *                       description: Límite diario configurado
 *                     porcentajeUso:
 *                       type: number
 *                       description: Porcentaje de uso del límite diario
 *                     enviosPorTipo:
 *                       type: object
 *                       description: Envíos agrupados por tipo de comprobante
 *       404:
 *         description: Configuración no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.get('/:sucursalId/estadisticas',
  esAdminOSuperAdmin,
  ConfiguracionWhatsappController.obtenerEstadisticas
);

/**
 * @swagger
 * /configuracion-whatsapp/{sucursalId}/codigo-qr:
 *   get:
 *     summary: Obtener código QR para conectar WhatsApp con Baileys (GRATUITO)
 *     tags: [Configuración WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Código QR generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     qrCode:
 *                       type: string
 *                       description: Código QR en formato base64 o URL
 *                     instrucciones:
 *                       type: string
 *                       description: Instrucciones para escanear el QR
 *       404:
 *         description: Configuración no encontrada
 *       400:
 *         description: Error al generar código QR
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.get('/:sucursalId/codigo-qr',
  esAdminOSuperAdmin,
  ConfiguracionWhatsappController.obtenerCodigoQR
);

/**
 * @swagger
 * /configuracion-whatsapp/{sucursalId}/estado-conexion:
 *   get:
 *     summary: Verificar estado de conexión WhatsApp con Baileys
 *     tags: [Configuración WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Estado de conexión obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     conectado:
 *                       type: boolean
 *                       description: Si WhatsApp está conectado
 *                     numeroTelefono:
 *                       type: string
 *                       description: Número de teléfono conectado
 *                     estado:
 *                       type: string
 *                       description: Estado de la conexión
 *                     proveedor:
 *                       type: string
 *                       description: Proveedor utilizado (Baileys GRATUITO)
 *       404:
 *         description: Configuración no encontrada
 *       400:
 *         description: Error al verificar estado
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.get('/:sucursalId/estado-conexion',
  esAdminOSuperAdmin,
  ConfiguracionWhatsappController.verificarEstadoConexion
);

/**
 * @swagger
 * /configuracion-whatsapp/{sucursalId}/resetear-contador:
 *   post:
 *     summary: Resetear contador diario de mensajes (Solo SuperAdmin)
 *     tags: [Configuración WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Contador reseteado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     contadorAnterior:
 *                       type: integer
 *                       description: Valor del contador antes del reset
 *                     contadorActual:
 *                       type: integer
 *                       description: Valor del contador después del reset
 *       404:
 *         description: Configuración no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Solo SuperAdmin puede resetear el contador
 */
router.post('/:sucursalId/resetear-contador',
  esSuperAdmin,
  ConfiguracionWhatsappController.resetearContador
);

/**
 * @swagger
 * /configuracion-whatsapp/sesiones:
 *   get:
 *     summary: Listar todas las sesiones activas de WhatsApp
 *     tags: [Configuración WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesiones obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     sesiones:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sucursalId:
 *                             type: string
 *                           isConnected:
 *                             type: boolean
 *                           phoneNumber:
 *                             type: string
 *                           status:
 *                             type: string
 *                           reconnectAttempts:
 *                             type: integer
 *                     estadisticas:
 *                       type: object
 *                       properties:
 *                         sesionesActivas:
 *                           type: integer
 *                         sesionesConReintentos:
 *                           type: integer
 *                         maxReintentos:
 *                           type: integer
 *                         directorioSesiones:
 *                           type: string
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.get('/sesiones',
  esAdminOSuperAdmin,
  ConfiguracionWhatsappController.listarSesiones
);

/**
 * @swagger
 * /configuracion-whatsapp/sesiones/limpiar:
 *   post:
 *     summary: Limpiar sesiones inválidas de WhatsApp
 *     tags: [Configuración WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesiones limpiadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     sesionesLimpiadas:
 *                       type: integer
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.post('/sesiones/limpiar',
  esAdminOSuperAdmin,
  ConfiguracionWhatsappController.limpiarSesiones
);

/**
 * @swagger
 * /configuracion-whatsapp/{sucursalId}/desconectar:
 *   post:
 *     summary: Desconectar sesión específica de WhatsApp
 *     tags: [Configuración WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Sesión desconectada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Sesión no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.post('/:sucursalId/desconectar',
  esAdminOSuperAdmin,
  ConfiguracionWhatsappController.desconectarSesion
);

/**
 * @swagger
 * /configuracion-whatsapp/{sucursalId}/eliminar-sesion:
 *   delete:
 *     summary: Eliminar sesión persistente de WhatsApp (archivos del disco)
 *     tags: [Configuración WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Sesión persistente eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Sesión no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.delete('/:sucursalId/eliminar-sesion',
  esSuperAdmin,
  ConfiguracionWhatsappController.eliminarSesionPersistente
);

module.exports = router;