const express = require('express');
const router = express.Router();
const transportistaController = require('../controllers/transportista.controller');
const verificarToken = require('../middlewares/verificarToken');

/**
 * @swagger
 * tags:
 *   name: Transportistas
 *   description: API para gestionar transportistas
 */

/**
 * @swagger
 * /transportistas:
 *   get:
 *     summary: Obtener todos los transportistas
 *     tags: [Transportistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipoTransportista
 *         schema:
 *           type: string
 *           enum: ['Empresa de transporte', 'Transportista independiente']
 *         description: Filtrar por tipo de transportista
 *     responses:
 *       200:
 *         description: Lista de transportistas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 transportistas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transportista'
 *                 filtros:
 *                   type: object
 *       500:
 *         description: Error al obtener transportistas
 */
router.get('/', verificarToken, transportistaController.obtenerTransportistas);

/**
 * @swagger
 * /transportistas/buscar:
 *   get:
 *     summary: Buscar transportistas por razón social o documento
 *     tags: [Transportistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: razonSocial
 *         schema:
 *           type: string
 *         description: Razón social o nombre comercial del transportista a buscar
 *       - in: query
 *         name: tipoDocumento
 *         schema:
 *           type: string
 *           enum: ['Doc.trib.no.dom.sin.ruc','DNI','RUC','CE','PASAPORTE','OTRO','CARNE SOLIC REFUGIO','C.IDENT.-RREE','PTP','DOC.ID.EXTR.','CPP']
 *         description: Tipo de documento del transportista
 *       - in: query
 *         name: numeroDocumento
 *         schema:
 *           type: string
 *         description: Número de documento del transportista
 *     responses:
 *       200:
 *         description: Transportistas encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 transportistas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transportista'
 *       400:
 *         description: Debe proporcionar al menos un término de búsqueda
 *       500:
 *         description: Error al buscar transportistas
 */
router.get('/buscar', verificarToken, transportistaController.buscarTransportistas);

/**
 * @swagger
 * /transportistas/{id}:
 *   get:
 *     summary: Obtener un transportista por ID
 *     tags: [Transportistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del transportista
 *     responses:
 *       200:
 *         description: Transportista encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 transportista:
 *                   $ref: '#/components/schemas/Transportista'
 *       404:
 *         description: Transportista no encontrado
 *       500:
 *         description: Error al obtener el transportista
 */
router.get('/:id', verificarToken, transportistaController.obtenerTransportistaPorId);

/**
 * @swagger
 * /transportistas/documento/{tipoDocumento}/{numeroDocumento}:
 *   get:
 *     summary: Buscar transportista por documento
 *     tags: [Transportistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipoDocumento
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['Doc.trib.no.dom.sin.ruc','DNI','RUC','CE','PASAPORTE','OTRO','CARNE SOLIC REFUGIO','C.IDENT.-RREE','PTP','DOC.ID.EXTR.','CPP']
 *         description: Tipo de documento
 *       - in: path
 *         name: numeroDocumento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento
 *     responses:
 *       200:
 *         description: Transportista encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 transportista:
 *                   $ref: '#/components/schemas/Transportista'
 *       404:
 *         description: Transportista no encontrado
 *       500:
 *         description: Error al buscar el transportista
 */
router.get('/documento/:tipoDocumento/:numeroDocumento', verificarToken, transportistaController.buscarPorDocumento);

/**
 * @swagger
 * /transportistas/tipo/{tipo}:
 *   get:
 *     summary: Obtener transportistas por tipo
 *     tags: [Transportistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['Empresa de transporte', 'Transportista independiente']
 *         description: Tipo de transportista
 *     responses:
 *       200:
 *         description: Transportistas encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 transportistas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transportista'
 *                 tipo:
 *                   type: string
 *       500:
 *         description: Error al obtener transportistas por tipo
 */
router.get('/tipo/:tipo', verificarToken, transportistaController.obtenerPorTipo);

/**
 * @swagger
 * /transportistas/reniec/{tipoDocumento}/{numeroDocumento}:
 *   get:
 *     summary: Consultar datos de RENIEC por DNI o RUC
 *     tags: [Transportistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipoDocumento
 *         schema:
 *           type: string
 *           enum: ['DNI', 'RUC']
 *         required: true
 *         description: Tipo de documento (DNI o RUC)
 *       - in: path
 *         name: numeroDocumento
 *         schema:
 *           type: string
 *         required: true
 *         description: Número de documento a consultar
 *     responses:
 *       200:
 *         description: Datos obtenidos de RENIEC/SUNAT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Consulta exitosa"
 *                 tipoDocumento:
 *                   type: string
 *                   example: "DNI"
 *                 datos:
 *                   type: object
 *                   properties:
 *                     nombres:
 *                       type: string
 *                       example: "ROSARIO NANCY"
 *                     apellidoPaterno:
 *                       type: string
 *                       example: "VASQUEZ"
 *                     apellidoMaterno:
 *                       type: string
 *                       example: "AMAO"
 *                     direccion:
 *                       type: string
 *                       example: ""
 *                     nombre:
 *                       type: string
 *                       example: "EMPRESA TRANSPORTES S.A.C."
 *                 nombreCompleto:
 *                   type: string
 *                   example: "ROSARIO NANCY VASQUEZ AMAO"
 *       400:
 *         description: Documento inválido
 *       500:
 *         description: Error al consultar RENIEC/SUNAT
 */
router.get('/reniec/:tipoDocumento/:numeroDocumento', verificarToken, transportistaController.consultarRENIEC);

/**
 * @swagger
 * /transportistas:
 *   post:
 *     summary: Crear un nuevo transportista
 *     tags: [Transportistas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipoDocumento
 *               - numeroDocumento
 *               - razonSocial
 *             properties:
 *               tipoDocumento:
 *                 type: string
 *                 enum: ['Doc.trib.no.dom.sin.ruc','DNI','RUC','CE','PASAPORTE','OTRO','CARNE SOLIC REFUGIO','C.IDENT.-RREE','PTP','DOC.ID.EXTR.','CPP']
 *                 description: Tipo de documento de identidad
 *               numeroDocumento:
 *                 type: string
 *                 description: Número de documento
 *               razonSocial:
 *                 type: string
 *                 description: Razón social o nombre comercial
 *               nombreComercial:
 *                 type: string
 *                 description: Nombre comercial
 *               direccionFiscal:
 *                 type: string
 *                 description: Dirección fiscal
 *               telefono:
 *                 type: string
 *                 description: Teléfono de contacto
 *               email:
 *                 type: string
 *                 description: Correo electrónico
 *               mtc:
 *                 type: string
 *                 description: Número MTC
 *               autorizacionMTC:
 *                 type: string
 *                 description: Autorización MTC
 *               tipoTransportista:
 *                 type: string
 *                 enum: ['Empresa de transporte', 'Transportista independiente']
 *                 description: Tipo de transportista
 *     responses:
 *       201:
 *         description: Transportista creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 transportista:
 *                   $ref: '#/components/schemas/Transportista'
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error al crear el transportista
 */
router.post('/', verificarToken, transportistaController.crearTransportista);

/**
 * @swagger
 * /transportistas/{id}:
 *   put:
 *     summary: Actualizar un transportista
 *     tags: [Transportistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del transportista
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipoDocumento:
 *                 type: string
 *                 enum: ['Doc.trib.no.dom.sin.ruc','DNI','RUC','CE','PASAPORTE','OTRO','CARNE SOLIC REFUGIO','C.IDENT.-RREE','PTP','DOC.ID.EXTR.','CPP']
 *                 description: Tipo de documento de identidad
 *               numeroDocumento:
 *                 type: string
 *                 description: Número de documento
 *               razonSocial:
 *                 type: string
 *                 description: Razón social o nombre comercial
 *               nombreComercial:
 *                 type: string
 *                 description: Nombre comercial
 *               direccionFiscal:
 *                 type: string
 *                 description: Dirección fiscal
 *               telefono:
 *                 type: string
 *                 description: Teléfono de contacto
 *               email:
 *                 type: string
 *                 description: Correo electrónico
 *               mtc:
 *                 type: string
 *                 description: Número MTC
 *               autorizacionMTC:
 *                 type: string
 *                 description: Autorización MTC
 *               tipoTransportista:
 *                 type: string
 *                 enum: ['Empresa de transporte', 'Transportista independiente']
 *                 description: Tipo de transportista
 *     responses:
 *       200:
 *         description: Transportista actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 transportista:
 *                   $ref: '#/components/schemas/Transportista'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Transportista no encontrado
 *       500:
 *         description: Error al actualizar el transportista
 */
router.put('/:id', verificarToken, transportistaController.actualizarTransportista);

/**
 * @swagger
 * /transportistas/{id}:
 *   delete:
 *     summary: Eliminar (desactivar) un transportista
 *     tags: [Transportistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del transportista
 *     responses:
 *       200:
 *         description: Transportista eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       404:
 *         description: Transportista no encontrado
 *       500:
 *         description: Error al eliminar el transportista
 */
router.delete('/:id', verificarToken, transportistaController.eliminarTransportista);

module.exports = router;