const express = require('express');
const router = express.Router();
const tallerController = require('../controllers/taller.Controller');
const verificarToken = require('../middlewares/verificarToken'); 
const { esAdminOSuperAdminOTrabajador } = require('../middlewares/roleMiddleware');
const upload = require('../config/uploadConfig');






/**
 * @swagger
 * tags:
 *   name: Clientes en el taller
 *   description: API para gestión de clientes en el taller
 */


/**
 * @swagger
 * /talleres/reporte:
 *   get:
 *     summary: Generar reporte de atención en el taller
 *     description: |
 *       Genera un reporte de atención en el taller con filtros opcionales. 
 *       Todos los parámetros son opcionales - si no se proporcionan filtros, devuelve todos los registros.
 *       Los filtros de texto (marca, placa) permiten búsqueda parcial.
 *       La fechaInicio filtra registros para ese día específico (no un rango).
 *     tags: [Clientes en el taller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: operario
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID del operario asignado (filtro exacto)
 *         example: 5
 *       - in: query
 *         name: fechaInicio
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha específica para filtrar registros de ese día (formato YYYY-MM-DD)
 *         example: 2023-01-01
 *       - in: query
 *         name: estado
 *         required: false
 *         schema:
 *           type: string
 *           enum: ['Pendiente', 'En Proceso', 'Finalizado', 'Cancelado']
 *         description: Estado exacto del registro de atención
 *         example: Finalizado
 *       - in: query
 *         name: categoria
 *         required: false
 *         schema:
 *           type: string
 *           enum: ['Garantía', 'Reparación', 'Mantenimiento', 'Diagnóstico', 'Mantenimiento Preventivo', 'Mantenimiento Correctivo', 'Planchado y Pintura', 'Equipamiento']
 *         description: Categoría exacta del registro de atención
 *         example: Reparación
 *       - in: query
 *         name: marca
 *         required: false
 *         schema:
 *           type: string
 *         description: Marca del vehículo (búsqueda parcial, insensible a mayúsculas)
 *         example: Toyota
 *       - in: query
 *         name: placa
 *         required: false
 *         schema:
 *           type: string
 *         description: Placa del vehículo (búsqueda parcial, insensible a mayúsculas)
 *         example: ABC-123
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filtros:
 *                   type: object
 *                   description: Filtros aplicados en la consulta (null si no se proporcionó el filtro)
 *                   properties:
 *                     operario:
 *                       type: string
 *                       nullable: true
 *                       description: ID del operario como string
 *                       example: "5"
 *                     fechaInicio:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: 2023-01-01
 *                     estado:
 *                       type: string
 *                       nullable: true
 *                       example: Finalizado
 *                     categoria:
 *                       type: string
 *                       nullable: true
 *                       example: Reparación
 *                     marca:
 *                       type: string
 *                       nullable: true
 *                       example: Toyota
 *                     placa:
 *                       type: string
 *                       nullable: true
 *                       example: ABC-123
 *                 totalRegistros:
 *                   type: integer
 *                   description: Número total de registros encontrados
 *                   example: 10
 *                 totalPrecioMantenimiento:
 *                   type: number
 *                   format: float
 *                   description: Suma total de los precios de mantenimiento de todos los registros
 *                   example: 15000.00
 *                 acumuladoOperario:
 *                   type: object
 *                   nullable: true
 *                   description: Información acumulada del operario (solo cuando se filtra por operario)
 *                   properties:
 *                     operarioId:
 *                       type: integer
 *                       example: 5
 *                     totalPrecioMantenimiento:
 *                       type: number
 *                       format: float
 *                       example: 15000.00
 *                     cantidadTrabajos:
 *                       type: integer
 *                       example: 10
 *                 registros:
 *                   type: array
 *                   description: Lista de registros de atención en el taller
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       cliente:
 *                         type: object
 *                         nullable: true
 *                         description: Información del cliente (puede ser null si no hay cliente asociado)
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           nombre:
 *                             type: string
 *                             example: Juan Pérez
 *                           telefono:
 *                             type: string
 *                             example: 987654321
 *                       operario:
 *                         type: string
 *                         nullable: true
 *                         description: Campo de texto legacy del operario
 *                         example: Carlos López
 *                       operarioAsignado:
 *                         type: object
 *                         nullable: true
 *                         description: Información detallada del operario asignado
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           nombres:
 *                             type: string
 *                             example: Carlos
 *                           apellidos:
 *                             type: string
 *                             example: López
 *                           nombreCompleto:
 *                             type: string
 *                             example: Carlos López
 *                           puesto:
 *                             type: string
 *                             example: Mecánico
 *                           especialidad:
 *                             type: string
 *                             example: Motor
 *                       fechaRegistro:
 *                         type: string
 *                         format: date-time
 *                         example: 2023-01-15T10:30:00.000Z
 *                       estado:
 *                         type: string
 *                         example: Finalizado
 *                       categoria:
 *                         type: string
 *                         example: Reparación
 *                       marca:
 *                         type: string
 *                         example: Toyota
 *                       modelo:
 *                         type: string
 *                         example: Hilux
 *                       placa:
 *                         type: string
 *                         example: ABC-123
 *                       precioMantenimiento:
 *                         type: number
 *                         format: float
 *                         example: 500.00
 *                       responsable:
 *                         type: object
 *                         nullable: true
 *                         description: Información del responsable (puede ser null si no hay responsable asociado)
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           nombre:
 *                             type: string
 *                             example: Carlos
 *                           apellido:
 *                             type: string
 *                             example: López
 *       404:
 *         description: No se encontraron registros de atención en el taller con los filtros aplicados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: No se encontraron registros de atención en el taller con los filtros aplicados
 *                 filtros:
 *                   type: object
 *                   description: Filtros que fueron aplicados en la búsqueda
 *                   properties:
 *                     operario:
 *                       type: string
 *                       nullable: true
 *                       example: "5"
 *                     fechaInicio:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: 2023-01-01
 *                     estado:
 *                       type: string
 *                       nullable: true
 *                       example: Finalizado
 *                     categoria:
 *                       type: string
 *                       nullable: true
 *                       example: Reparación
 *                     marca:
 *                       type: string
 *                       nullable: true
 *                       example: Toyota
 *                     placa:
 *                       type: string
 *                       nullable: true
 *                       example: ABC-123
 *                 totalRegistros:
 *                   type: integer
 *                   example: 0
 *                 totalPrecioMantenimiento:
 *                   type: number
 *                   format: float
 *                   example: 0
 *                 registros:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Error al generar el reporte de atención en el taller
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 *                 stack:
 *                   type: string
 *                   description: Stack trace del error (solo en desarrollo)
 *                   example: Error at line 123...
 */
router.get('/reporte', [verificarToken, esAdminOSuperAdminOTrabajador], tallerController.generarReporteTalleres);




// Ruta para crear un cliente en el taller
/**
 * @swagger
 * /talleres:
 *   post:
 *     summary: Crear un cliente el taller
 *     description: Crea un nuevo cliente en el taller con imágenes. Los campos nombreCliente, telefonoCliente y nombreUsuario se llenan automáticamente a partir del clienteId y el usuario autenticado. Los campos nombreOperario, puestoOperario y especialidadOperario se llenan automáticamente a partir del operarioId.
 *     tags: [Clientes en el taller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 description: ID del cliente (requerido para llenar automáticamente nombreCliente y telefonoCliente)
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada del cliente en el taller
 *               motivoIngreso:
 *                 type: string
 *                 description: Motivo de ingreso del vehículo
 *               estado:
 *                 type: string
 *                 enum: ['Pendiente', 'En Proceso', 'Finalizado', 'Cancelado']
 *                 description: Estado del taller
 *               numeroSerie:
 *                 type: string
 *                 description: Número de serie del vehículo
 *               marca:
 *                 type: string
 *                 description: Marca del vehículo
 *               equipo:
 *                 type: string
 *                 description: Equipo del vehículo
 *               modelo:
 *                 type: string
 *                 description: Modelo del vehículo
 *               placa:
 *                 type: string
 *                 description: Placa del vehículo
 *               quilometraje:
 *                 type: integer
 *                 description: Quilometraje del vehículo
 *               operarioId:
 *                 type: integer
 *                 description: ID del operario responsable del taller (requerido). Use GET /operarios/activos para obtener la lista de operarios disponibles con sus IDs. Automáticamente llena nombreOperario, puestoOperario y especialidadOperario en la respuesta.
 *                 example: 1
 *               categoria:
 *                 type: string
 *                 enum: ['Garantía', 'Reparación', 'Mantenimiento', 'Diagnóstico', 'Mantenimiento Preventivo', 'Mantenimiento Correctivo', 'Planchado y Pintura', 'Equipamiento']
 *                 description: Categoría del taller
 *               checklist:
 *                 type: object
 *                 description: Checklist del taller









 *               imagen1:
 *                 type: string
 *                 format: binary
 *                 description: Primera imagen del taller (obligatoria)
 *               imagen2:
 *                 type: string
 *                 format: binary
 *                 description: Segunda imagen del taller (opcional)
 *               imagen3:
 *                 type: string
 *                 format: binary
 *                 description: Tercera imagen del taller (opcional)
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente en el taller
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Cliente creado exitosamente en el taller
 *                 taller:
 *                   $ref: '#/components/schemas/Taller'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cliente o usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', [verificarToken, esAdminOSuperAdminOTrabajador, upload], tallerController.crearTaller);




// Ruta para obtener todos los clientes en el taller
/**
 * @swagger
 * /talleres:
 *   get:
 *     summary: Obtener todos los clientes en el taller
 *     description: Obtiene una lista de todos los clientes en el taller
 *     tags: [Clientes en el taller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes en el taller obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Taller'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', [verificarToken, esAdminOSuperAdminOTrabajador], tallerController.obtenerTalleres);




// Ruta para obtener un cliente en el taller por ID - DEBE IR DESPUÉS DE /reporte
/**
 * @swagger
 * /talleres/{id}:
 *   get:
 *     summary: Obtener un registro del taller por ID
 *     description: Obtiene un  registro del cleinte en el taller específico por su ID
 *     tags: [Clientes en el taller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del taller
 *     responses:
 *       200:
 *         description: cliente en el Taller obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Taller'
 *       404:
 *         description: Taller no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', [verificarToken, esAdminOSuperAdminOTrabajador], tallerController.obtenerTallerPorId);












// Ruta para actualizar un taller
/**
 * @swagger
 * /talleres/{id}:
 *   put:
 *     summary: Actualizar un clinete en el taller
 *     description: Actualiza un cliebte existente en el taller.
 *     tags: [Clientes en el taller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del taller con el clinete a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 description: ID del cliente
 *               nombreCliente:
 *                 type: string
 *                 description: Nombre del cliente
 *               telefonoCliente:
 *                 type: string
 *                 description: Teléfono del cliente
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada del cliente en el taller
 *               motivoIngreso:
 *                 type: string
 *                 description: Motivo de ingreso del vehículo
 *               estado:
 *                 type: string
 *                 enum: ['Pendiente', 'En Proceso', 'Finalizado', 'Cancelado']
 *                 description: Estado del vehículo en el taller
 *               numeroSerie:
 *                 type: string
 *                 description: Número de serie del vehículo
 *               marca:
 *                 type: string
 *                 description: Marca del vehículo
 *               equipo:
 *                 type: string
 *                 description: Equipo del vehículo
 *               modelo:
 *                 type: string
 *                 description: Modelo del vehículo
 *               placa:
 *                 type: string
 *                 description: Placa del vehículo
 *               quilometraje:
 *                 type: integer
 *                 description: Quilometraje del vehículo
 *               operario:
 *                 type: string
 *                 description: Operario responsable del taller
 *               categoria:
 *                 type: string
 *                 enum: ['Garantía', 'Reparación', 'Mantenimiento', 'Diagnóstico', 'Mantenimiento Preventivo', 'Mantenimiento Correctivo', 'Planchado y Pintura', 'Equipamiento']
 *                 description: Categoría del taller

 *               precioMantenimiento:
 *                 type: number
 *                 format: float
 *                 description: Precio del mantenimiento
 *               placaChecklist:
 *                 type: string
 *                 description: Placa del vehículo en el checklist
 *               colorChecklist:
 *                 type: string
 *                 description: Color del vehículo en el checklist
 *               chasisChecklist:
 *                 type: string
 *                 description: Chasis del vehículo en el checklist
 *               numeroFlotaChecklist:
 *                 type: string
 *                 description: Número de flota del vehículo en el checklist
 *               kilometrajeChecklist:
 *                 type: integer
 *                 description: Kilometraje del vehículo en el checklist
 *               añoChecklist:
 *                 type: integer
 *                 description: Año del vehículo en el checklist
 *               vencimientoSoatChecklist:
 *                 type: string
 *                 format: date
 *                 description: Vencimiento del SOAT en el checklist
 *               vencimientoRevisionTecChecklist:
 *                 type: string
 *                 format: date
 *                 description: Vencimiento de la revisión técnica en el checklist
 *               imagen1:
 *                 type: string
 *                 format: binary
 *                 description: Primera imagen del taller (opcional)
 *               imagen2:
 *                 type: string
 *                 format: binary
 *                 description: Segunda imagen del taller (opcional)
 *               imagen3:
 *                 type: string
 *                 format: binary
 *                 description: Tercera imagen del taller (opcional)
 *             note: "El usuarioId no puede ser actualizado y mantendrá su valor original"
 *     responses:
 *       200:
 *         description: cliente actualizado exitosamente en el taller
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "cliente actualizado exitosamente en el taller"
 *                 taller:
 *                   $ref: '#/components/schemas/Taller'
 *             example:
 *               mensaje: "cliente actualizado exitosamente en el taller"
 *               taller:
 *                 id: 1
 *                 clienteId: 1
 *                 nombreCliente: "Juan Pérez"
 *                 telefonoCliente: "987654321"
 *                 descripcion: "Mantenimiento general"
 *                 motivoIngreso: "Revisión periódica"
 *                 estado: "En Proceso"
 *                 numeroSerie: "ABC123456"
 *                 marca: "Toyota"
 *                 equipo: "Camioneta"
 *                 modelo: "Hilux"
 *                 placa: "ABC-123"
 *                 quilometraje: 15000
 *                 operario: "Carlos López"
 *                 categoria: "Mantenimiento"
 *                 usuarioId: 5
 *                 usuario:
 *                   id: 5
 *                   nombre: "Carlos"
 *                   apellido: "López"
 *                 imagen: "http://localhost:3000/uploads/img1.jpg,http://localhost:3000/uploads/img2.jpg"
 *                 checklist: {}
 *                 precioMantenimiento: 500.00
 *                 placaChecklist: "ABC-123"
 *                 colorChecklist: "Blanco"
 *                 chasisChecklist: "XYZ789"
 *                 numeroFlotaChecklist: "F001"
 *                 kilometrajeChecklist: 15000
 *                 añoChecklist: 2020
 *                 vencimientoSoatChecklist: "2024-12-31"
 *                 vencimientoRevisionTecChecklist: "2024-06-30"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-20T14:45:00.000Z"
 *       400:
 *         description: Error en la solicitud (datos inválidos o cliente inexistente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               cliente_no_existe:
 *                 summary: Cliente en el taller no existe
 *                 value:
 *                   mensaje: "El cliente seleccionado no existe o está inactivo"
 *               datos_invalidos:
 *                 summary: Datos inválidos
 *                 value:
 *                   mensaje: "Error en los datos proporcionados"
 *       403:
 *         description: No tiene permisos para actualizar talleres
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               mensaje: "No tiene permisos para actualizar talleres"
 *       404:
 *         description: Clinete en el Taller no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               mensaje: "Clinete en el Taller no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               mensaje: "Error al actualizar el clleinte en el taller"
 *               error: "Database connection failed"
 */
router.put('/:id', [verificarToken, esAdminOSuperAdminOTrabajador, upload], tallerController.actualizarTaller);







// Ruta para eliminar un taller
/**
 * @swagger
 * /talleres/{id}:
 *   delete:
 *     summary: Eliminar un cliente en el taller
 *     description: Eliminar un cliente en el taller
 *     tags: [Clientes en el taller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del taller
 *     responses:
 *       200:
 *         description: Cliente en el Taller eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example:  Cliente en el Taller eliminado exitosamente
 *       404:
 *         description: Cliente en el Taller no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', [verificarToken, esAdminOSuperAdminOTrabajador], tallerController.eliminarTaller);

/**
 * @swagger
 * /talleres/{id}/ventas:
 *   get:
 *     summary: Obtener ventas asociadas a un taller
 *     description: Obtiene todas las ventas asociadas a un taller específico
 *     tags: [Clientes en el taller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del taller
 *     responses:
 *       200:
 *         description: Lista de ventas asociadas al taller
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Ventas obtenidas exitosamente"
 *                 taller:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     descripcion:
 *                       type: string
 *                     ventas:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Taller no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/ventas', [verificarToken, esAdminOSuperAdminOTrabajador], tallerController.obtenerVentasPorTaller);

/**
 * @swagger
 * /talleres/{tallerId}/ventas/{ventaId}:
 *   post:
 *     summary: Asociar una venta a un taller
 *     description: Asocia una venta existente a un taller específico
 *     tags: [Clientes en el taller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tallerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del taller
 *       - in: path
 *         name: ventaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta
 *     responses:
 *       200:
 *         description: Venta asociada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Venta asociada al taller exitosamente"
 *                 taller:
 *                   type: object
 *       400:
 *         description: La venta ya está asociada a otro taller
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Taller o venta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:tallerId/ventas/:ventaId', [verificarToken, esAdminOSuperAdminOTrabajador], tallerController.asociarVentaATaller);

/**
 * @swagger
 * /talleres/{tallerId}/ventas/{ventaId}:
 *   delete:
 *     summary: Desasociar una venta de un taller
 *     description: Desasocia una venta de un taller específico
 *     tags: [Clientes en el taller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tallerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del taller
 *       - in: path
 *         name: ventaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta
 *     responses:
 *       200:
 *         description: Venta desasociada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Venta desasociada del taller exitosamente"
 *                 taller:
 *                   type: object
 *       404:
 *         description: Taller o venta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:tallerId/ventas/:ventaId', [verificarToken, esAdminOSuperAdminOTrabajador], tallerController.desasociarVentaDeTaller);

module.exports = router;