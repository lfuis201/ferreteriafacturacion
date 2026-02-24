const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const verificarToken = require('../middlewares/verificarToken');

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: API para gestionar clientes(7)
 */

/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Obtener todos los clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 *       500:
 *         description: Error al obtener clientes
 */
router.get('/', verificarToken, clienteController.obtenerClientes);

/**
 * @swagger
 * /clientes/buscar:
 *   get:
 *     summary: Buscar clientes por nombre o documento
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Nombre del cliente a buscar
 *       - in: query
 *         name: tipoDocumento
 *         schema:
 *           type: string
 *           enum: [DNI, RUC, CE, PASAPORTE, OTRO]
 *         description: Tipo de documento del cliente
 *       - in: query
 *         name: numeroDocumento
 *         schema:
 *           type: string
 *         description: Número de documento del cliente
 *     responses:
 *       200:
 *         description: Lista de clientes encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 *       500:
 *         description: Error al buscar clientes
 */
router.get('/buscar', verificarToken, clienteController.buscarClientes);

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error al obtener cliente
 */
router.get('/:id', verificarToken, clienteController.obtenerClientePorId);

/**
 * @swagger
 * /clientes/reniec/info:
 *   get:
 *     summary: Obtener información sobre la API de RENIEC
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información de la API obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 api:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     url:
 *                       type: string
 *                     estado:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                     limite:
 *                       type: string
 *                     documentacion:
 *                       type: string
 *                 estado:
 *                   type: string
 *                 ultimaVerificacion:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Error al obtener información de la API
 */
router.get('/reniec/info', verificarToken, clienteController.obtenerInfoAPI);










/**
 * @swagger
 * /clientes/reniec/{tipoDocumento}/{numeroDocumento}:
 *   get:
 *     summary: Consultar datos de RENIEC por DNI o RUC
 *     tags: [Clientes]
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
 *         description: Datos obtenidos de RENIEC
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
 *                     ubigeo:
 *                       type: string
 *                       example: "150131"
 *                     viaTipo:
 *                       type: string
 *                       example: "AV."
 *                     viaNombre:
 *                       type: string
 *                       example: "JOSE GALVEZ BARRENECHEA"
 *                     zonaCodigo:
 *                       type: string
 *                       example: "URB."
 *                     zonaTipo:
 *                       type: string
 *                       example: "CORPAC"
 *                     numero:
 *                       type: string
 *                       example: "566"
 *                     interior:
 *                       type: string
 *                       example: "101"
 *                     lote:
 *                       type: string
 *                       example: "-"
 *                     dpto:
 *                       type: string
 *                       example: "-"
 *                     manzana:
 *                       type: string
 *                       example: "-"
 *                     kilometro:
 *                       type: string
 *                       example: "-"
 *                     distrito:
 *                       type: string
 *                       example: "SAN ISIDRO"
 *                     provincia:
 *                       type: string
 *                       example: "LIMA"
 *                     departamento:
 *                       type: string
 *                       example: "LIMA"
 *                 nombreCompleto:
 *                   type: string
 *                   example: "ROSARIO NANCY VASQUEZ AMAO"
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "El DNI debe tener 8 dígitos numéricos"
 *       500:
 *         description: Error al consultar RENIEC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al consultar RENIEC"
 *                 error:
 *                   type: string
 *                   example: "Error de conexión"
 *                 sugerencia:
 *                   type: string
 *                   example: "Verifique que el número de documento sea válido o intente más tarde"
 */
router.get('/reniec/:tipoDocumento/:numeroDocumento', verificarToken, clienteController.consultarRENIEC);



















/**
* @swagger
* /clientes:
*   post:
*     summary: Crear un nuevo cliente (consulta automática de RENIEC para DNI y RUC)
*     description: |
*       Crea un nuevo cliente. Si se proporciona un DNI o RUC válido, el sistema automáticamente consultará RENIEC/SUNAT para obtener los datos oficiales.
*       
*       **Comportamiento automático:**
*       - **DNI**: Consulta automática a RENIEC para obtener nombres, apellidos y dirección
*       - **RUC**: Consulta automática a SUNAT para obtener razón social y dirección
*       - **Otros documentos**: Se crean con los datos proporcionados manualmente
*       
*       **Prioridad de datos:**
*       - Si proporcionas un nombre, se mantiene (no se sobrescribe con RENIEC)
*       - Si proporcionas una dirección, se mantiene (no se sobrescribe con RENIEC)
*       - Los campos vacíos se completan automáticamente con datos de RENIEC/SUNAT
*     tags: [Clientes]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               nombre:
*                 type: string
*                 description: Nombre del cliente (opcional si se proporciona DNI/RUC válido)
*                 example: "Juan Pérez"
*               tipoDocumento:
*                 type: string
*                 enum: [Doc.trib.no.dom.sin.ruc, DNI, RUC, CE, PASAPORTE, OTRO, CARNE SOLIC REFUGIO, C.IDENT.-RREE, PTP, DOC.ID.EXTR., CPP]
*                 description: Tipo de documento del cliente
*                 example: "DNI"
*               numeroDocumento:
*                 type: string
*                 description: Número de documento del cliente
*                 example: "71496588"
*               direccion:
*                 type: string
*                 description: Dirección del cliente (opcional si se proporciona DNI/RUC válido)
*                 example: "Av. Principal 123"
*               telefono:
*                 type: string
*                 description: Teléfono del cliente
*                 example: "987654321"
*               email:
*                 type: string
*                 format: email
*                 description: Email del cliente
*                 example: "cliente@example.com"
*               codInterno:
*                 type: string
*                 description: Código interno del cliente
*                 example: "CLI001"
*           examples:
*             cliente_dni_automatico:
*               summary: Cliente con DNI (consulta automática a RENIEC)
*               value:
*                 tipoDocumento: "DNI"
*                 numeroDocumento: "71496588"
*                 telefono: "987654321"
*                 email: "cliente@example.com"
*             cliente_ruc_automatico:
*               summary: Cliente con RUC (consulta automática a SUNAT)
*               value:
*                 tipoDocumento: "RUC"
*                 numeroDocumento: "20601030013"
*                 telefono: "987654321"
*                 email: "contacto@empresa.com"
*             cliente_manual:
*               summary: Cliente con datos manuales (otros tipos de documento)
*               value:
*                 nombre: "Juan Pérez García"
*                 tipoDocumento: "CE"
*                 numeroDocumento: "001234567"
*                 direccion: "Av. Principal 123"
*                 telefono: "987654321"
*                 email: "juan@example.com"
*                 codInterno: "CLI001"
*             cliente_dni_con_datos_propios:
*               summary: Cliente con DNI pero manteniendo datos proporcionados
*               value:
*                 nombre: "Mi Nombre Personalizado"
*                 tipoDocumento: "DNI"
*                 numeroDocumento: "71496588"
*                 direccion: "Mi Dirección Personalizada"
*                 telefono: "987654321"
*                 email: "cliente@example.com"
*     responses:
*       201:
*         description: Cliente creado exitosamente
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 mensaje:
*                   type: string
*                   example: "Cliente creado exitosamente"
*                 cliente:
*                   $ref: '#/components/schemas/Cliente'
*                 consultaRENIECRealizada:
*                   type: boolean
*                   description: Indica si se realizó consulta automática a RENIEC/SUNAT
*                   example: true
*                 consultaRENIECExitosa:
*                   type: boolean
*                   description: Indica si la consulta automática fue exitosa
*                   example: true
*                 datosRENIEC:
*                   type: object
*                   description: Datos obtenidos de RENIEC/SUNAT (solo si se consultó)
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
*                     nombre:
*                       type: string
*                       example: "REXTIE S.A.C."
*                     direccion:
*                       type: string
*                       example: "AV. JOSE GALVEZ BARRENECHEA NRO 566 INT. 101 URB. CORPAC"
*                     ubigeo:
*                       type: string
*                       example: "150131"
*                     distrito:
*                       type: string
*                       example: "SAN ISIDRO"
*                     provincia:
*                       type: string
*                       example: "LIMA"
*                     departamento:
*                       type: string
*                       example: "LIMA"
*                 nombreOriginal:
*                   type: string
*                   description: Nombre proporcionado originalmente
*                   example: "Cliente Test"
*                 nombreFinal:
*                   type: string
*                   description: Nombre final del cliente (puede ser completado automáticamente)
*                   example: "ROSARIO NANCY VASQUEZ AMAO"
*       400:
*         description: Error en la validación o cliente ya existe
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 mensaje:
*                   type: string
*                   example: "Ya existe un cliente con ese número de documento"
*                 clienteExistente:
*                   type: object
*                   description: Información del cliente existente
*                   properties:
*                     id:
*                       type: integer
*                       example: 1
*                     nombre:
*                       type: string
*                       example: "Juan Pérez"
*                     tipoDocumento:
*                       type: string
*                       example: "DNI"
*                     numeroDocumento:
*                       type: string
*                       example: "71496588"
*       500:
*         description: Error interno del servidor
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 mensaje:
*                   type: string
*                   example: "Error al crear el cliente"
*                 error:
*                   type: string
*                   example: "Detalles del error específico"
*/


router.post('/', verificarToken, clienteController.crearCliente);




/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     summary: Actualizar cliente por ID
 *     description: Actualiza la información de un cliente existente, incluyendo datos de SUNAT/RENIEC si es necesario
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cliente a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del cliente
 *                 example: "Juan Pérez"
 *               tipoDocumento:
 *                 type: string
 *                 enum: [DNI, RUC, CE, PASAPORTE, OTRO]
 *                 description: Tipo de documento del cliente
 *                 example: "DNI"
 *               numeroDocumento:
 *                 type: string
 *                 description: Número de documento del cliente
 *                 example: "12345678"
 *               direccion:
 *                 type: string
 *                 description: Dirección del cliente
 *                 example: "Av. Principal 123"
 *               telefono:
 *                 type: string
 *                 description: Teléfono del cliente
 *                 example: "987654321"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del cliente
 *                 example: "juan.perez@example.com"
 *               estado:
 *                 type: boolean
 *                 description: Estado del cliente (activo/inactivo)
 *                 example: true
 *               apellidoPaterno:
 *                 type: string
 *                 description: Apellido paterno del cliente (para DNI)
 *                 example: "Pérez"
 *               apellidoMaterno:
 *                 type: string
 *                 description: Apellido materno del cliente (para DNI)
 *                 example: "Gómez"
 *               nombres:
 *                 type: string
 *                 description: Nombres del cliente (para DNI)
 *                 example: "Juan"
 *               ubigeo:
 *                 type: string
 *                 description: Código UBIGEO de la dirección
 *                 example: "150101"
 *               viaTipo:
 *                 type: string
 *                 description: Tipo de vía (AV., JR., etc.)
 *                 example: "AV."
 *               viaNombre:
 *                 type: string
 *                 description: Nombre de la vía
 *                 example: "Principal"
 *               zonaCodigo:
 *                 type: string
 *                 description: Código de zona (URB., MZ., etc.)
 *                 example: "URB."
 *               zonaTipo:
 *                 type: string
 *                 description: Tipo de zona (Residencial, Industrial, etc.)
 *                 example: "Residencial"
 *               numero:
 *                 type: string
 *                 description: Número de la dirección
 *                 example: "123"
 *               interior:
 *                 type: string
 *                 description: Número interior
 *                 example: "A"
 *               lote:
 *                 type: string
 *                 description: Número de lote
 *                 example: "15"
 *               dpto:
 *                 type: string
 *                 description: Número de departamento
 *                 example: "201"
 *               manzana:
 *                 type: string
 *                 description: Número de manzana
 *                 example: "B"
 *               kilometro:
 *                 type: string
 *                 description: Kilómetro de la dirección
 *                 example: "5.5"
 *               distrito:
 *                 type: string
 *                 description: Distrito
 *                 example: "Lima"
 *               provincia:
 *                 type: string
 *                 description: Provincia
 *                 example: "Lima"
 *               departamento:
 *                 type: string
 *                 description: Departamento
 *                 example: "Lima"
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Cliente actualizado exitosamente"
 *                 cliente:
 *                   $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Error en la validación de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Ya existe otro cliente con ese número de documento"
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Cliente no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al actualizar el cliente"
 *                 error:
 *                   type: string
 *                   example: "Detalles del error específico"
 */
router.put('/:id', verificarToken, clienteController.actualizarCliente);

/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     summary: Eliminar cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente eliminado
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error al eliminar cliente
 */
router.delete('/:id', verificarToken, clienteController.eliminarCliente);

module.exports = router;