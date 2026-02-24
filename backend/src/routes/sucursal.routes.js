const express = require('express');
const router = express.Router();
const sucursalCtrl = require('../controllers/sucursal.controller');
const { verificarToken, esSuperAdmin } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Sucursales
 *   description: API para gestión de sucursales(2)
 */

/**
 * @swagger
 * /sucursales:
 *   post:
 *     summary: Crear una nueva sucursal
 *     description: |
 *       Permite crear una nueva sucursal con todos los datos requeridos para la integración con SUNAT.
 *       Solo usuarios con rol SuperAdmin pueden realizar esta acción.
 *
 *       **REQUISITOS:**
 *       - Nombre único para la sucursal
 *       - RUC único para la empresa
 *       - Todos los campos requeridos para SUNAT deben estar completos
 *       - Formato válido para RUC (11 dígitos) y UBIGEO (6 dígitos)
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - ubicacion
 *               - ruc
 *               - razonSocial
 *               - nombreComercial
 *               - direccion
 *               - ubigeo
 *               - urbanizacion
 *               - distrito
 *               - provincia
 *               - departamento
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la sucursal
 *                 example: "Sucursal Principal"
 *               ubicacion:
 *                 type: string
 *                 description: Ubicación física de la sucursal
 *                 example: "Av. Principal 123"
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono de la sucursal
 *                 example: "987654321"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico de la sucursal
 *                 example: "sucursal@empresa.com"
 *               ruc:
 *                 type: string
 *                 pattern: '^[0-9]{11}$'
 *                 description: RUC de la empresa (11 dígitos)
 *                 example: "20123456789"
 *               razonSocial:
 *                 type: string
 *                 description: Razón social de la empresa
 *                 example: "EMPRESA DEMO S.A.C."
 *               nombreComercial:
 *                 type: string
 *                 description: Nombre comercial de la empresa
 *                 example: "EMPRESA DEMO"
 *               direccion:
 *                 type: string
 *                 description: Dirección fiscal de la empresa
 *                 example: "Av. Principal 123"
 *               ubigeo:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: Código UBIGEO (6 dígitos)
 *                 example: "150101"
 *               urbanizacion:
 *                 type: string
 *                 description: Nombre de la urbanización o zona
 *                 example: "Urbanización Ejemplo"
 *               distrito:
 *                 type: string
 *                 description: Distrito donde se encuentra la sucursal
 *                 example: "Distrito Ejemplo"
 *               provincia:
 *                 type: string
 *                 description: Provincia donde se encuentra la sucursal
 *                 example: "Provincia Ejemplo"
 *               departamento:
 *                 type: string
 *                 description: Departamento donde se encuentra la sucursal
 *                 example: "Departamento Ejemplo"
 *             additionalProperties: false
 *           examples:
 *             sucursal_completa:
 *               summary: Sucursal con todos los datos requeridos
 *               value:
 *                 nombre: "Sucursal Principal"
 *                 ubicacion: "Av. Principal 123"
 *                 telefono: "987654321"
 *                 email: "sucursal@empresa.com"
 *                 ruc: "20123456789"
 *                 razonSocial: "EMPRESA DEMO S.A.C."
 *                 nombreComercial: "EMPRESA DEMO"
 *                 direccion: "Av. Principal 123"
 *                 ubigeo: "150101"
 *                 urbanizacion: "Urbanización Ejemplo"
 *                 distrito: "Distrito Ejemplo"
 *                 provincia: "Provincia Ejemplo"
 *                 departamento: "Departamento Ejemplo"
 *     responses:
 *       201:
 *         description: Sucursal creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   description: Mensaje de confirmación
 *                   example: "Sucursal creada exitosamente"
 *                 sucursal:
 *                   $ref: '#/components/schemas/Sucursal'
 *             examples:
 *               creacion_exitosa:
 *                 summary: Creación exitosa
 *                 value:
 *                   mensaje: "Sucursal creada exitosamente"
 *                   sucursal:
 *                     id: 1
 *                     nombre: "Sucursal Principal"
 *                     ubicacion: "Av. Principal 123"
 *                     telefono: "987654321"
 *                     email: "sucursal@empresa.com"
 *                     ruc: "20123456789"
 *                     razonSocial: "EMPRESA DEMO S.A.C."
 *                     nombreComercial: "EMPRESA DEMO"
 *                     direccion: "Av. Principal 123"
 *                     ubigeo: "150101"
 *                     urbanizacion: "Urbanización Ejemplo"
 *                     distrito: "Distrito Ejemplo"
 *                     provincia: "Provincia Ejemplo"
 *                     departamento: "Departamento Ejemplo"
 *                     estado: true
 *                     createdAt: "2023-01-01T00:00:00Z"
 *                     updatedAt: "2023-01-01T00:00:00Z"
 *       400:
 *         description: Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Faltan campos requeridos para la integración con SUNAT"
 *                 camposFaltantes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["ruc", "razonSocial"]
 *             examples:
 *               campos_faltantes:
 *                 summary: Campos requeridos faltantes
 *                 value:
 *                   mensaje: "Faltan campos requeridos para la integración con SUNAT"
 *                   camposFaltantes: ["ruc", "razonSocial"]
 *               formato_invalido:
 *                 summary: Formato de RUC o UBIGEO inválido
 *                 value:
 *                   mensaje: "El RUC debe tener 11 dígitos numéricos"
 *       403:
 *         description: No tiene permisos para crear sucursales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No tiene permisos para crear sucursales"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al crear la sucursal"
 *                 error:
 *                   type: string
 *                   example: "Error de conexión a la base de datos"
 */
router.post('/', [verificarToken, esSuperAdmin], sucursalCtrl.crearSucursal);
/**
 * @swagger
 * /sucursales:
 *   get:
 *     summary: Obtener todas las sucursales
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sucursales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sucursal'
 *       403:
 *         description: No tiene permisos para ver sucursales
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, sucursalCtrl.obtenerSucursales);

// Endpoint público para obtener sucursales (usado en registro de SuperAdmin)
router.get('/publico/lista', sucursalCtrl.obtenerSucursales);

/**
 * @swagger
 * /sucursales/{id}:
 *   get:
 *     summary: Obtener una sucursal por ID
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Detalles de la sucursal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sucursal'
 *       404:
 *         description: Sucursal no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verificarToken, sucursalCtrl.obtenerSucursalPorId);

/**
 * @swagger
 * /sucursales/{id}:
 *   patch:
 *     summary: Actualizar una sucursal
 *     description: Actualiza los datos de una sucursal existente, incluyendo información para SUNAT
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sucursal a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la sucursal
 *                 example: "Sucursal Principal"
 *               ubicacion:
 *                 type: string
 *                 description: Dirección física de la sucursal
 *                 example: "Av. Principal 123"
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono de la sucursal
 *                 example: "987654321"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico de la sucursal
 *                 example: "sucursal@empresa.com"
 *               ruc:
 *                 type: string
 *                 pattern: '^[0-9]{11}$'
 *                 description: RUC de la sucursal (11 dígitos)
 *                 example: "20604051984"
 *               razonSocial:
 *                 type: string
 *                 description: Razón social de la empresa
 *                 example: "FACTURACION ELECTRONICA MONSTRUO E.I.R.L."
 *               nombreComercial:
 *                 type: string
 *                 description: Nombre comercial de la empresa
 *                 example: "Monstruo Facturación"
 *               direccion:
 *                 type: string
 *                 description: Dirección completa de la empresa
 *                 example: "Av. Principal 123"
 *               ubigeo:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: Código UBIGEO (6 dígitos)
 *                 example: "150114"
 *               urbanizacion:
 *                 type: string
 *                 description: Nombre de la urbanización
 *                 example: "Urbanización Principal"
 *               distrito:
 *                 type: string
 *                 description: Distrito de la sucursal
 *                 example: "LA MOLINA"
 *               provincia:
 *                 type: string
 *                 description: Provincia de la sucursal
 *                 example: "LIMA"
 *               departamento:
 *                 type: string
 *                 description: Departamento de la sucursal
 *                 example: "LIMA"
 *     responses:
 *       200:
 *         description: Sucursal actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Sucursal actualizada exitosamente"
 *                 sucursal:
 *                   $ref: '#/components/schemas/Sucursal'
 *       400:
 *         description: Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Faltan campos requeridos para la integración con SUNAT"
 *                 camposFaltantes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["ruc", "razonSocial"]
 *       403:
 *         description: No tiene permisos para actualizar sucursales
 *       404:
 *         description: Sucursal no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id', [verificarToken, esSuperAdmin], sucursalCtrl.actualizarSucursal);

/**
 * @swagger
 * /sucursales/{id}:
 *   delete:
 *     summary: Eliminar una sucursal
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Sucursal eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       403:
 *         description: No tiene permisos para eliminar sucursales
 *       404:
 *         description: Sucursal no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', [verificarToken, esSuperAdmin], sucursalCtrl.eliminarSucursal);



/**
 * @swagger
 * /sucursales/asignar-administrador:
 *   post:
 *     summary: Asignar administrador a una sucursal
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sucursalId
 *               - usuarioId
 *             properties:
 *               sucursalId:
 *                 type: integer
 *                 description: ID de la sucursal
 *               usuarioId:
 *                 type: integer
 *                 description: ID del usuario
 *     responses:
 *       200:
 *         description: Administrador asignado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Sucursal o usuario no encontrado
 *       403:
 *         description: No tiene permisos para asignar administradores
 *       500:
 *         description: Error del servidor
 */
router.post('/asignar-administrador', [verificarToken, esSuperAdmin], sucursalCtrl.asignarAdministrador);

module.exports = router;