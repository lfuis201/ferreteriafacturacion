const { ConfiguracionWhatsapp, RegistroEnvio } = require('../models');
const crypto = require('crypto');
const axios = require('axios');
const { obtenerInstanciaBaileys } = require('../services/baileys.service');

class ConfiguracionWhatsappController {
  // Obtener configuración WhatsApp
  static async obtenerConfiguracion(req, res) {
    try {
      const { sucursalId } = req.params;
      
      const configuracion = await ConfiguracionWhatsapp.findOne({
        where: { sucursalId },
        attributes: { exclude: ['tokenApi', 'passwordApi'] } // Excluir datos sensibles
      });

      if (!configuracion) {
        // Crear configuración por defecto si no existe
        console.log(`📱 Creando configuración WhatsApp por defecto para sucursal ${sucursalId}`);
        
        configuracion = await ConfiguracionWhatsapp.create({
          sucursalId,
          usuarioId: null,
          proveedor: 'baileys',
          activo: true,
          apiKey: 'BAILEYS_FREE',
          apiSecret: null,
          apiUrl: 'local://baileys',
          numeroTelefono: '+51946811898', // Número por defecto - debe cambiarse
          plantillaMensaje: 'Hola {{cliente}}, adjunto encontrarás tu comprobante {{tipo}} {{numero}} por un total de S/ {{total}}. Gracias por tu compra en {{empresa}}.',
          mensajeSaludo: '¡Hola! Te enviamos tu comprobante de compra.',
          mensajeDespedida: 'Gracias por tu preferencia. ¡Que tengas un buen día!',
          envioAutomatico: false,
          tiposComprobante: ['factura', 'boleta'],
          formatosEnvio: ['pdf'],
          horarioInicio: '08:00:00',
          horarioFin: '18:00:00',
          limiteMensajesDia: 999999
        });
        
        console.log(`✅ Configuración WhatsApp creada automáticamente para sucursal ${sucursalId}`);
      }

      res.json({
        success: true,
        data: configuracion
      });
    } catch (error) {
      console.error('Error al obtener configuración WhatsApp:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear o actualizar configuración WhatsApp
  static async guardarConfiguracion(req, res) {
    try {
      const { sucursalId } = req.params;
      const {
        proveedorApi,
        urlApi,
        tokenApi,
        usuarioApi,
        passwordApi,
        numeroTelefono,
        mensajeSaludo,
        mensajeDespedida,
        plantillaFactura,
        plantillaBoleta,
        envioAutomatico,
        limiteDiario,
        horaInicioEnvio,
        horaFinEnvio,
        activo
      } = req.body;

      // Validar datos requeridos
      if (!numeroTelefono) {
        return res.status(400).json({
          success: false,
          message: 'Número de teléfono es requerido'
        });
      }

      // Buscar configuración existente
      let configuracion = await ConfiguracionWhatsapp.findOne({
        where: { sucursalId }
      });

      // Mapear campos del request a campos del modelo
        const datosConfiguracion = {
          sucursalId,
          usuarioId: req.user?.id || null, // Obtener usuarioId del token JWT
          proveedor: 'baileys', // Usar baileys como proveedor GRATUITO por defecto
          activo: activo !== undefined ? activo : true,
          apiKey: 'BAILEYS_FREE', // Identificador para servicio gratuito
          apiSecret: null,
          apiUrl: 'local://baileys', // URL local para identificar servicio Baileys
          numeroTelefono,
          plantillaMensaje: 'Hola {{cliente}}, adjunto encontrarás tu comprobante {{tipo}} {{numero}} por un total de S/ {{total}}. Gracias por tu compra en {{empresa}}.',
          mensajeSaludo: mensajeSaludo || '¡Hola! Te enviamos tu comprobante de compra.',
          mensajeDespedida: mensajeDespedida || 'Gracias por tu preferencia. ¡Que tengas un buen día!',
          envioAutomatico: envioAutomatico !== undefined ? envioAutomatico : false,
          tiposComprobante: ['factura', 'boleta'],
          formatosEnvio: ['pdf'],
          horarioInicio: horaInicioEnvio || '08:00:00',
          horarioFin: horaFinEnvio || '18:00:00',
          limiteMensajesDia: limiteDiario || 999999 // Sin límite para servicio gratuito
        };

      if (configuracion) {
        // Actualizar configuración existente
        await configuracion.update(datosConfiguracion);
      } else {
        // Crear nueva configuración
        configuracion = await ConfiguracionWhatsapp.create(datosConfiguracion);
      }

      // Retornar configuración sin datos sensibles
      const configuracionResponse = await ConfiguracionWhatsapp.findByPk(configuracion.id, {
        attributes: { exclude: ['apiKey', 'apiSecret'] }
      });

      res.json({
        success: true,
        message: configuracion.isNewRecord ? 'Configuración WhatsApp creada exitosamente' : 'Configuración WhatsApp actualizada exitosamente',
        data: configuracionResponse
      });
    } catch (error) {
      console.error('Error al guardar configuración WhatsApp:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Probar conexión con API de WhatsApp usando Baileys (GRATUITO)
  static async probarConexion(req, res) {
    try {
      const { sucursalId } = req.params;
      
      const configuracion = await ConfiguracionWhatsapp.findOne({
        where: { sucursalId }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración WhatsApp'
        });
      }

      if (!configuracion.activo) {
        return res.status(400).json({
          success: false,
          message: 'La configuración WhatsApp está desactivada'
        });
      }

      try {
        // Usar Baileys para conexión gratuita
        const baileysService = obtenerInstanciaBaileys(sucursalId);
        const estadoConexion = await baileysService.verificarEstado(sucursalId);

        if (!estadoConexion.isConnected) {
          // Inicializar en segundo plano para no bloquear la respuesta
          baileysService.inicializarConexionSilenciosa(sucursalId)
            .catch(err => console.warn('Error inicializando conexión silenciosa:', err?.message));

          return res.json({
            success: true,
            message: 'Servicio WhatsApp inicializado. Escanearemos y generaremos el QR en breve.',
            data: {
              proveedor: 'Baileys (GRATUITO)',
              estado: 'Esperando QR',
              numeroTelefono: configuracion.numeroTelefono,
              qrCode: null,
              requiereQR: true,
              instrucciones: 'Abre WhatsApp > Dispositivos vinculados > Vincular dispositivo. Se mostrará un QR cuando esté listo.'
            }
          });
        } else {
          return res.json({
            success: true,
            message: 'WhatsApp conectado y listo para enviar mensajes',
            data: {
              proveedor: 'Baileys (GRATUITO)',
              estado: 'Conectado',
              numeroTelefono: configuracion.numeroTelefono,
              requiereQR: false
            }
          });
        }
      } catch (baileysError) {
        console.error('Error con Baileys:', baileysError);
        res.status(400).json({
          success: false,
          message: 'Error al conectar con WhatsApp usando Baileys',
          error: baileysError.message
        });
      }
    } catch (error) {
      console.error('Error al probar conexión WhatsApp:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener código QR para conexión WhatsApp
  static async obtenerCodigoQR(req, res) {
    try {
      const { sucursalId } = req.params;
      
      const configuracion = await ConfiguracionWhatsapp.findOne({
        where: { sucursalId }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración WhatsApp'
        });
      }

      try {
        const baileysService = obtenerInstanciaBaileys(sucursalId);
        const resultado = await baileysService.obtenerCodigoQR(sucursalId);
        
        // Si ya está conectado, no requiere QR
        if (resultado?.isConnected && resultado?.requiresQR === false) {
          return res.json({
            success: true,
            message: 'WhatsApp ya está conectado',
            data: {
              qrCode: null,
              requiereQR: false,
              estado: 'Conectado'
            }
          });
        }

        // Si hubo timeout esperando QR, informar sin error
        if (resultado?.timeout && !resultado?.qrCode) {
          return res.json({
            success: true,
            message: 'Esperando generación de QR',
            data: {
              qrCode: null,
              requiereQR: true,
              estado: 'Esperando QR'
            }
          });
        }

        // Caso normal: devolver QR generado
        return res.json({
          success: true,
          message: 'Código QR generado',
          data: {
            qrCode: resultado.qrCode,
            requiereQR: true,
            instrucciones: 'Abre WhatsApp en tu teléfono > Dispositivos vinculados > Vincular dispositivo > Escanea el código QR'
          }
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: 'Error al generar código QR',
          error: error.message
        });
      }
    } catch (error) {
      console.error('Error al obtener código QR:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Verificar estado de conexión WhatsApp
  static async verificarEstadoConexion(req, res) {
    try {
      const { sucursalId } = req.params;
      
      const configuracion = await ConfiguracionWhatsapp.findOne({
        where: { sucursalId }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración WhatsApp'
        });
      }

      try {
        const baileysService = obtenerInstanciaBaileys(sucursalId);
        const estado = await baileysService.verificarEstado(sucursalId);
        
        res.json({
          success: true,
          message: 'Estado de conexión obtenido',
          data: {
            conectado: estado.isConnected,
            numeroTelefono: estado.phoneNumber || configuracion.numeroTelefono,
            estado: estado.isConnected ? 'Conectado' : 'Desconectado',
            proveedor: 'Baileys (GRATUITO)'
          }
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: 'Error al verificar estado de conexión',
          error: error.message
        });
      }
    } catch (error) {
      console.error('Error al verificar estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Enviar comprobante por WhatsApp usando Baileys (GRATUITO)
  static async enviarComprobante(req, res) {
    try {
      const { sucursalId } = req.params;
      const { numeroDestino, mensaje, archivoBase64, nombreArchivo } = req.body;

      if (!numeroDestino || !mensaje) {
        return res.status(400).json({
          success: false,
          message: 'Número de destino y mensaje son requeridos'
        });
      }

      const configuracion = await ConfiguracionWhatsapp.findOne({
        where: { sucursalId }
      });

      if (!configuracion) {
        // Crear configuración por defecto si no existe
        console.log(`📱 Creando configuración WhatsApp por defecto para envío en sucursal ${sucursalId}`);
        
        configuracion = await ConfiguracionWhatsapp.create({
          sucursalId,
          usuarioId: null,
          proveedor: 'baileys',
          activo: true,
          apiKey: 'BAILEYS_FREE',
          apiSecret: null,
          apiUrl: 'local://baileys',
          numeroTelefono: '+51999999999',
          plantillaMensaje: 'Hola {{cliente}}, adjunto encontrarás tu comprobante {{tipo}} {{numero}} por un total de S/ {{total}}. Gracias por tu compra en {{empresa}}.',
          mensajeSaludo: '¡Hola! Te enviamos tu comprobante de compra.',
          mensajeDespedida: 'Gracias por tu preferencia. ¡Que tengas un buen día!',
          envioAutomatico: false,
          tiposComprobante: ['factura', 'boleta'],
          formatosEnvio: ['pdf'],
          horarioInicio: '08:00:00',
          horarioFin: '18:00:00',
          limiteMensajesDia: 999999
        });
        
        console.log(`✅ Configuración WhatsApp creada automáticamente para envío en sucursal ${sucursalId}`);
      }
      
      if (!configuracion.activo) {
        return res.status(400).json({
          success: false,
          message: 'La configuración WhatsApp está desactivada'
        });
      }

      try {
        const baileysService = obtenerInstanciaBaileys(sucursalId);
        
        // Verificar que esté conectado
        const estado = await baileysService.verificarEstado(sucursalId);
        if (!estado.isConnected) {
          return res.status(400).json({
            success: false,
            message: 'WhatsApp no está conectado. Por favor, escanea el código QR primero.',
            requiereQR: true
          });
        }

        // Enviar mensaje usando Baileys
        let resultado;
        if (archivoBase64 && nombreArchivo) {
          // Enviar con archivo adjunto
          resultado = await baileysService.enviarMensajeConArchivo(
            numeroDestino,
            mensaje,
            archivoBase64,
            nombreArchivo
          );
        } else {
          // Enviar solo texto
          resultado = await baileysService.enviarMensaje(numeroDestino, mensaje);
        }

        // Registrar envío exitoso
        await RegistroEnvio.create({
          sucursalId,
          numeroDestino,
          mensaje,
          estado: 'enviado',
          fechaEnvio: new Date(),
          respuestaApi: JSON.stringify(resultado)
        });

        res.json({
          success: true,
          message: 'Comprobante enviado exitosamente usando Baileys (GRATUITO)',
          data: {
            messageId: resultado.messageId || 'N/A',
            numeroDestino,
            fechaEnvio: new Date(),
            proveedor: 'Baileys (GRATUITO)'
          }
        });
      } catch (baileysError) {
        // Registrar envío fallido
        await RegistroEnvio.create({
          sucursalId,
          numeroDestino,
          mensaje,
          estado: 'fallido',
          fechaEnvio: new Date(),
          respuestaApi: JSON.stringify({ error: baileysError.message })
        });

        res.status(400).json({
          success: false,
          message: 'Error al enviar comprobante con Baileys',
          error: baileysError.message
        });
      }
    } catch (error) {
      console.error('Error al enviar comprobante WhatsApp:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de envíos
  static async obtenerEstadisticas(req, res) {
    try {
      const { sucursalId } = req.params;
      
      const configuracion = await ConfiguracionWhatsapp.findOne({
        where: { sucursalId }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración WhatsApp'
        });
      }

      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

      res.json({
        success: true,
        data: {
          enviosHoy: configuracion.enviosHoy || 0,
          enviosMes: configuracion.enviosMes || 0,
          limiteDiario: configuracion.limiteDiario,
          ultimoEnvio: configuracion.fechaUltimoEnvio,
          estado: configuracion.activo ? 'Activo' : 'Inactivo',
          puedeEnviar: await configuracion.puedeEnviar()
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Resetear contador diario (para uso administrativo)
  static async resetearContador(req, res) {
    try {
      const { sucursalId } = req.params;
      
      const configuracion = await ConfiguracionWhatsapp.findOne({
        where: { sucursalId }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración WhatsApp'
        });
      }

      await configuracion.update({
        enviosHoy: 0,
        fechaUltimoReset: new Date()
      });

      res.json({
        success: true,
        message: 'Contador de envíos diarios reseteado exitosamente'
      });
    } catch (error) {
      console.error('Error al resetear contador:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Listar todas las sesiones activas
  static async listarSesiones(req, res) {
    try {
      const baileysService = obtenerInstanciaBaileys();
      const sesiones = await baileysService.listarSesiones();
      const estadisticas = baileysService.obtenerEstadisticas();
      
      res.json({
        success: true,
        message: 'Sesiones obtenidas exitosamente',
        data: {
          sesiones,
          estadisticas
        }
      });
    } catch (error) {
      console.error('Error al listar sesiones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Limpiar sesiones inválidas
  static async limpiarSesiones(req, res) {
    try {
      const baileysService = obtenerInstanciaBaileys();
      const resultado = await baileysService.limpiarSesionesInvalidas();
      
      res.json({
        success: true,
        message: `Limpieza completada. ${resultado.sesionesLimpiadas} sesiones eliminadas.`,
        data: resultado
      });
    } catch (error) {
      console.error('Error al limpiar sesiones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Desconectar sesión específica
  static async desconectarSesion(req, res) {
    try {
      const { sucursalId } = req.params;
      
      const baileysService = obtenerInstanciaBaileys();
      await baileysService.desconectar(sucursalId);
      
      res.json({
        success: true,
        message: `Sesión de sucursal ${sucursalId} desconectada exitosamente`
      });
    } catch (error) {
      console.error('Error al desconectar sesión:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar sesión persistente (archivos del disco)
  static async eliminarSesionPersistente(req, res) {
    try {
      const { sucursalId } = req.params;
      
      const baileysService = obtenerInstanciaBaileys();
      await baileysService.eliminarSesionPersistente(sucursalId);
      
      res.json({
        success: true,
        message: `Sesión persistente de sucursal ${sucursalId} eliminada exitosamente`
      });
    } catch (error) {
      console.error('Error al eliminar sesión persistente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = ConfiguracionWhatsappController;