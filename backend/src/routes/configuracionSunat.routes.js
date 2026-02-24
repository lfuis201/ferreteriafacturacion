const express = require('express');
const router = express.Router();
const multer = require('multer');
const ConfiguracionSunatController = require('../controllers/configuracionSunat.controller');
const { verificarToken, esSuperAdmin } = require('../middlewares/authMiddleware');
const { esAdminOSuperAdmin } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Configuración SUNAT
 *   description: API para gestión de configuración SUNAT y certificados digitales
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ConfiguracionSunat:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la configuración
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal
 *         ambiente:
 *           type: string
 *           enum: ['DEMO', 'PRODUCCION']
 *           description: Ambiente de SUNAT
 *         rucEmisor:
 *           type: string
 *           description: RUC del emisor
 *         usuarioSol:
 *           type: string
 *           description: Usuario SOL de SUNAT
 *         claveSol:
 *           type: string
 *           description: Clave SOL de SUNAT
 *         certificadoPfx:
 *           type: string
 *           description: Ruta del certificado PFX
 *         passwordCertificado:
 *           type: string
 *           description: Contraseña del certificado
 *         urlSunatFactura:
 *           type: string
 *           description: URL de SUNAT para facturas
 *         urlSunatGuia:
 *           type: string
 *           description: URL de SUNAT para guías
 *         urlSunatRetencion:
 *           type: string
 *           description: URL de SUNAT para retenciones
 *         activo:
 *           type: boolean
 *           description: Estado de la configuración
 */

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

// Rutas para configuración SUNAT

/**
 * @swagger
 * /configuracion-sunat/{sucursalId}:
 *   get:
 *     summary: Obtener configuración SUNAT de una sucursal
 *     tags: [Configuración SUNAT]
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
 *         description: Configuración SUNAT obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ConfiguracionSunat'
 *       404:
 *         description: Configuración no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.get('/:sucursalId', 
  esAdminOSuperAdmin,
  ConfiguracionSunatController.obtenerConfiguracion
);

/**
 * @swagger
 * /configuracion-sunat/{sucursalId}:
 *   post:
 *     summary: Crear configuración SUNAT para una sucursal
 *     tags: [Configuración SUNAT]
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
 *               - ambiente
 *               - rucEmisor
 *               - usuarioSol
 *               - claveSol
 *             properties:
 *               ambiente:
 *                 type: string
 *                 enum: ['DEMO', 'PRODUCCION']
 *                 description: Ambiente de SUNAT
 *               rucEmisor:
 *                 type: string
 *                 description: RUC del emisor
 *               usuarioSol:
 *                 type: string
 *                 description: Usuario SOL de SUNAT
 *               claveSol:
 *                 type: string
 *                 description: Clave SOL de SUNAT
 *               passwordCertificado:
 *                 type: string
 *                 description: Contraseña del certificado
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
 *                   $ref: '#/components/schemas/ConfiguracionSunat'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.post('/:sucursalId',
  esAdminOSuperAdmin,
  ConfiguracionSunatController.guardarConfiguracion
);

/**
 * @swagger
 * /configuracion-sunat/{sucursalId}:
 *   put:
 *     summary: Actualizar configuración SUNAT de una sucursal
 *     tags: [Configuración SUNAT]
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
 *               ambiente:
 *                 type: string
 *                 enum: ['DEMO', 'PRODUCCION']
 *                 description: Ambiente de SUNAT
 *               rucEmisor:
 *                 type: string
 *                 description: RUC del emisor
 *               usuarioSol:
 *                 type: string
 *                 description: Usuario SOL de SUNAT
 *               claveSol:
 *                 type: string
 *                 description: Clave SOL de SUNAT
 *               passwordCertificado:
 *                 type: string
 *                 description: Contraseña del certificado
 *               activo:
 *                 type: boolean
 *                 description: Estado de la configuración
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
 *                   $ref: '#/components/schemas/ConfiguracionSunat'
 *       404:
 *         description: Configuración no encontrada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.put('/:sucursalId',
  esAdminOSuperAdmin,
  ConfiguracionSunatController.guardarConfiguracion
);

/**
 * @swagger
 * /configuracion-sunat/{sucursalId}/certificado:
 *   post:
 *     summary: Subir certificado PFX para SUNAT
 *     tags: [Configuración SUNAT]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - certificado
 *               - password
 *             properties:
 *               certificado:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de certificado PFX o P12
 *               password:
 *                 type: string
 *                 description: Contraseña del certificado
 *     responses:
 *       200:
 *         description: Certificado subido exitosamente
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
 *                     certificadoPfx:
 *                       type: string
 *                       description: Ruta del certificado guardado
 *       400:
 *         description: Archivo inválido o contraseña incorrecta
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.post('/:sucursalId/certificado',
  esAdminOSuperAdmin,
  ConfiguracionSunatController.uploadCertificado,
  ConfiguracionSunatController.subirCertificado
);

/**
 * @swagger
 * /configuracion-sunat/{sucursalId}/correlativo/{tipoDocumento}:
 *   get:
 *     summary: Obtener siguiente correlativo para un tipo de documento
 *     tags: [Configuración SUNAT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: path
 *         name: tipoDocumento
 *         required: true
 *         schema:
 *           type: string
 *           enum: [FACTURA, BOLETA, NOTA_CREDITO, NOTA_DEBITO]
 *         description: Tipo de documento
 *     responses:
 *       200:
 *         description: Correlativo obtenido exitosamente
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
 *                     siguienteCorrelativo:
 *                       type: integer
 *                       description: Siguiente número correlativo
 *       404:
 *         description: Configuración no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.get('/:sucursalId/correlativo/:tipoDocumento',
  esAdminOSuperAdmin,
  ConfiguracionSunatController.obtenerSiguienteCorrelativo
);

/**
 * @swagger
 * /configuracion-sunat/{sucursalId}/correlativo/{tipoDocumento}:
 *   put:
 *     summary: Actualizar correlativo para un tipo de documento
 *     tags: [Configuración SUNAT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: path
 *         name: tipoDocumento
 *         required: true
 *         schema:
 *           type: string
 *           enum: [FACTURA, BOLETA, NOTA_CREDITO, NOTA_DEBITO]
 *         description: Tipo de documento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correlativo
 *             properties:
 *               correlativo:
 *                 type: integer
 *                 description: Nuevo número correlativo
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Correlativo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Configuración no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.put('/:sucursalId/correlativo/:tipoDocumento',
  esAdminOSuperAdmin,
  ConfiguracionSunatController.actualizarCorrelativo
);

/**
 * @swagger
 * /configuracion-sunat/{sucursalId}/probar-conexion:
 *   post:
 *     summary: Probar conexión con SUNAT
 *     tags: [Configuración SUNAT]
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
 *         description: Conexión exitosa con SUNAT
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
 *                     estado:
 *                       type: string
 *                       description: Estado de la conexión
 *                     tiempoRespuesta:
 *                       type: number
 *                       description: Tiempo de respuesta en ms
 *       400:
 *         description: Error en la configuración
 *       404:
 *         description: Configuración no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 *       500:
 *         description: Error de conexión con SUNAT
 */
router.post('/:sucursalId/probar-conexion',
  esAdminOSuperAdmin,
  ConfiguracionSunatController.probarConexion
);

// Middleware de manejo de errores específico para multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB permitido.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado.'
      });
    }
  }
  
  if (error.message === 'Solo se permiten archivos PFX o P12') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;