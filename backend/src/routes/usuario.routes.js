const express = require("express");
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { verificarToken, esSuperAdmin } = require('../middlewares/authMiddleware');
const { esAdminOSuperAdmin } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - nombre
 *         - apellido
 *         - correo
 *         - password
 *         - rol
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del usuario
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *         apellido:
 *           type: string
 *           description: Apellido del usuario
 *         correo:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario (único)
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario (se almacena encriptada)
 *         rol:
 *           type: string
 *           enum: [SuperAdmin, Admin, Cajero, Almacenero]
 *           description: Rol del usuario en el sistema
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal a la que pertenece el usuario
 *         estado:
 *           type: boolean
 *           description: Estado del usuario (activo/inactivo)
 *       example:
 *         nombre: Juan
 *         apellido: Pérez
 *         correo: juan.perez@ejemplo.com
 *         password: contraseña123
 *         rol: Cajero
 *         sucursalId: 1
 */

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: API para autenticación de usuarios(1)
 */

/**
 * @swagger
 * /usuarios/register-superadmin:
 *   post:
 *     summary: Registrar un nuevo usuario como SuperAdmin sin token
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - correo
 *               - password
 *               - rol
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del usuario
 *               apellido:
 *                 type: string
 *                 description: Apellido del usuario
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario (único)
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario (se almacena encriptada)
 *               rol:
 *                 type: string
 *                 enum: [SuperAdmin, Admin, Cajero, Almacenero]
 *                 description: Rol del usuario en el sistema
 *               sucursalId:
 *                 type: integer
 *                 description: ID de la sucursal a la que pertenece el usuario
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos inválidos o correo ya registrado
 *       404:
 *         description: Sucursal no encontrada
 *       500:
 *         description: Error del servidor
 */



router.post('/register-superadmin', authCtrl.registerSuperAdmin);

// Ruta para verificar si existe un SuperAdmin
router.get('/verificar-superadmin', authCtrl.verificarSuperAdmin);

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - password
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */

router.post("/login", authCtrl.login);

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: API para gestión de usuarios(3)
 */

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un nuevo usuario como admin de la sucursal ademas de SuperAdmin tambien puede crear usuarios de otras sucursales como rol de cajero, almacenero, etc
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos inválidos o correo ya registrado
 *       403:
 *         description: No tiene permisos para crear usuarios
 *       500:
 *         description: Error del servidor
 */
router.post("/", [verificarToken, esAdminOSuperAdmin], authCtrl.register);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       403:
 *         description: No tiene permisos para ver usuarios
 *       500:
 *         description: Error del servidor
 */
router.get("/", verificarToken, authCtrl.obtenerUsuarios);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Detalles del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/:id", verificarToken, authCtrl.obtenerUsuarioPorId);

/**
 * @swagger
 * /usuarios/{id}:
 *   patch:
 *     summary: Actualizar un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               correo:
 *                 type: string
 *               rol:
 *                 type: string
 *               sucursalId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       403:
 *         description: No tiene permisos para actualizar usuarios
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.patch("/:id", [verificarToken, esAdminOSuperAdmin], authCtrl.actualizarUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario permanentemente de la base de datos
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado permanentemente de la base de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       403:
 *         description: No tiene permisos para eliminar usuarios
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", [verificarToken, esAdminOSuperAdmin], authCtrl.eliminarUsuario);


//router.get('/perfil', authCtrl.perfil);

module.exports = router;