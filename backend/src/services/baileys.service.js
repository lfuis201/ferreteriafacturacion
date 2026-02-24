const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

class BaileysService {
  constructor() {
    this.sessions = new Map();
    this.sessionsPath = process.env.WHATSAPP_SESSIONS_PATH || './whatsapp_sessions';
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    // Cache de QR y promesas de inicialización para evitar múltiples sockets simultáneos
    this.qrCodes = new Map(); // { sucursalId: { qrCode, at } }
    this.pendingInit = new Map(); // { sucursalId: Promise<void> }
    
    // Crear directorio de sesiones si no existe
    if (!fs.existsSync(this.sessionsPath)) {
      fs.mkdirSync(this.sessionsPath, { recursive: true });
    }
    
    // Restaurar sesiones existentes al inicializar
    this.restaurarSesionesExistentes();
  }

  async restaurarSesionesExistentes() {
    try {
      console.log('🔄 Restaurando sesiones de WhatsApp existentes...');
      
      if (!fs.existsSync(this.sessionsPath)) {
        console.log('📁 No hay directorio de sesiones previas');
        return;
      }

      const sessionDirs = fs.readdirSync(this.sessionsPath)
        .filter(dir => dir.startsWith('session_') && 
                fs.statSync(path.join(this.sessionsPath, dir)).isDirectory());

      if (sessionDirs.length === 0) {
        console.log('📁 No hay sesiones previas para restaurar');
        return;
      }

      console.log(`📱 Encontradas ${sessionDirs.length} sesiones previas`);
      
      for (const sessionDir of sessionDirs) {
        const sucursalId = sessionDir.replace('session_', '');
        const sessionPath = path.join(this.sessionsPath, sessionDir);
        
        // Verificar si hay archivos de credenciales
        const credsFile = path.join(sessionPath, 'creds.json');
        if (fs.existsSync(credsFile)) {
          console.log(`🔄 Restaurando sesión para sucursal ${sucursalId}`);
          
          // Intentar restaurar la sesión en segundo plano
          this.inicializarConexionSilenciosa(sucursalId)
            .catch(error => {
              console.log(`⚠️ No se pudo restaurar sesión para sucursal ${sucursalId}:`, error.message);
            });
        }
      }
    } catch (error) {
      console.error('❌ Error al restaurar sesiones:', error);
    }
  }

  async inicializarConexionSilenciosa(sucursalId) {
    if (this.pendingInit.get(sucursalId)) {
      return this.pendingInit.get(sucursalId);
    }
    const sessionPath = path.join(this.sessionsPath, `session_${sucursalId}`);
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const initPromise = (async () => {
      try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const sock = makeWASocket({
          auth: state,
          printQRInTerminal: false,
          browser: ['Ferreteria System', 'Chrome', '1.0.0']
        });

        sock.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect, qr } = update;

          if (qr) {
            try {
              const qrCode = await QRCode.toDataURL(qr);
              this.qrCodes.set(sucursalId, { qrCode, at: Date.now() });
              console.log(`📱 QR generado (silencioso) para sucursal ${sucursalId}`);
            } catch (error) {
              console.error('❌ Error al generar QR (silencioso):', error);
            }
          }

          if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
              const attempts = this.reconnectAttempts.get(sucursalId) || 0;
              if (attempts < this.maxReconnectAttempts) {
                this.reconnectAttempts.set(sucursalId, attempts + 1);
                console.log(`🔄 Reconectando WhatsApp (silencioso) para sucursal ${sucursalId} (intento ${attempts + 1}/${this.maxReconnectAttempts})`);
                setTimeout(() => this.inicializarConexionSilenciosa(sucursalId), 3000 * (attempts + 1));
              } else {
                console.log(`❌ Máximo de reintentos alcanzado para sucursal ${sucursalId}`);
                this.reconnectAttempts.delete(sucursalId);
                this.sessions.delete(sucursalId);
              }
            } else {
              console.log(`🚪 Sesión cerrada para sucursal ${sucursalId}. Necesita volver a autenticarse.`);
              this.sessions.delete(sucursalId);
              this.reconnectAttempts.delete(sucursalId);
              // Eliminar credenciales persistentes para forzar nuevo QR en siguiente inicio
              try {
                const sessionPath = path.join(this.sessionsPath, `session_${sucursalId}`);
                if (fs.existsSync(sessionPath)) {
                  fs.rmSync(sessionPath, { recursive: true, force: true });
                  console.log(`🗑️ Credenciales eliminadas para sucursal ${sucursalId}`);
                }
              } catch (err) {
                console.warn(`⚠️ No se pudo eliminar credenciales de sucursal ${sucursalId}: ${err.message}`);
              }
              // limpiar QR en cache
              this.qrCodes.delete(sucursalId);
            }
          } else if (connection === 'open') {
            console.log(`✅ WhatsApp conectado (silencioso) para sucursal ${sucursalId}`);
            this.sessions.set(sucursalId, sock);
            this.reconnectAttempts.delete(sucursalId);
            this.qrCodes.delete(sucursalId);
          }
        });

        sock.ev.on('creds.update', saveCreds);
      } catch (error) {
        console.error(`❌ Error al inicializar sesión silenciosa para sucursal ${sucursalId}:`, error);
      }
    })();

    this.pendingInit.set(sucursalId, initPromise);
    initPromise.finally(() => this.pendingInit.delete(sucursalId));
    return initPromise;
  }

  async inicializarConexion(sucursalId) {
    try {
      const sessionPath = path.join(this.sessionsPath, `session_${sucursalId}`);
      
      // Crear directorio de sesión si no existe
      if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
      
      let qrCode = null;
      let isConnected = false;

      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ['Ferreteria System', 'Chrome', '1.0.0']
      });

      return new Promise((resolve) => {
        let resolved = false;
        const timeoutMs = parseInt(process.env.WHATSAPP_QR_TIMEOUT) || 60000;
        const timeout = setTimeout(() => {
          if (!resolved) {
            console.warn(`⏱️ Timeout esperando QR para sucursal ${sucursalId}`);
            resolved = true;
            resolve({
              success: true,
              isConnected: false,
              requiresQR: true,
              qrCode: qrCode || null,
              timeout: true
            });
          }
        }, timeoutMs);

        sock.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect, qr } = update;

          if (qr && !resolved) {
            try {
              qrCode = await QRCode.toDataURL(qr);
              console.log(`📱 QR generado para sucursal ${sucursalId}`);
              // Guardar en cache para consultas posteriores
              this.qrCodes.set(sucursalId, { qrCode, at: Date.now() });
              clearTimeout(timeout);
              resolved = true;
              return resolve({
                success: true,
                qrCode,
                isConnected: false,
                requiresQR: true
              });
            } catch (error) {
              console.error('❌ Error al generar QR:', error);
            }
          }

          if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
              const attempts = this.reconnectAttempts.get(sucursalId) || 0;
              if (attempts < this.maxReconnectAttempts) {
                this.reconnectAttempts.set(sucursalId, attempts + 1);
                console.log(`🔄 Reconectando WhatsApp para sucursal ${sucursalId} (intento ${attempts + 1}/${this.maxReconnectAttempts})`);
                setTimeout(() => this.inicializarConexion(sucursalId), 3000 * (attempts + 1));
              } else {
                console.log(`❌ Máximo de reintentos alcanzado para sucursal ${sucursalId}`);
                this.reconnectAttempts.delete(sucursalId);
                this.sessions.delete(sucursalId);
              }
            } else {
              console.log(`🚪 Sesión cerrada para sucursal ${sucursalId}. Necesita volver a autenticarse.`);
              this.sessions.delete(sucursalId);
              this.reconnectAttempts.delete(sucursalId);
              // Eliminar credenciales persistentes para forzar nuevo QR
              try {
                const sessionPath = path.join(this.sessionsPath, `session_${sucursalId}`);
                if (fs.existsSync(sessionPath)) {
                  fs.rmSync(sessionPath, { recursive: true, force: true });
                  console.log(`🗑️ Credenciales eliminadas para sucursal ${sucursalId}`);
                }
              } catch (err) {
                console.warn(`⚠️ No se pudo eliminar credenciales de sucursal ${sucursalId}: ${err.message}`);
              }
              // limpiar QR en cache
              this.qrCodes.delete(sucursalId);
            }
          } else if (connection === 'open' && !resolved) {
            console.log(`✅ WhatsApp conectado para sucursal ${sucursalId}`);
            isConnected = true;
            this.sessions.set(sucursalId, sock);
            this.reconnectAttempts.delete(sucursalId);
            this.qrCodes.delete(sucursalId);
            clearTimeout(timeout);
            resolved = true;
            resolve({
              success: true,
              isConnected: true,
              phoneNumber: sock.user?.id?.split(':')[0] || null
            });
          }
        });

        sock.ev.on('creds.update', saveCreds);
      });
    } catch (error) {
      console.error('Error al inicializar Baileys:', error);
      throw error;
    }
  }

  async verificarEstado(sucursalId) {
    try {
      const session = this.sessions.get(sucursalId);
      
      if (!session) {
        return {
          isConnected: false,
          phoneNumber: null,
          status: 'disconnected'
        };
      }

      // Verificar si la sesión está activa
      const isActive = session.ws?.readyState === 1;
      
      return {
        isConnected: isActive,
        phoneNumber: session.user?.id?.split(':')[0] || null,
        status: isActive ? 'connected' : 'disconnected'
      };
    } catch (error) {
      console.error('Error al verificar estado:', error);
      return {
        isConnected: false,
        phoneNumber: null,
        status: 'error'
      };
    }
  }

  async obtenerCodigoQR(sucursalId) {
    try {
      // Si ya hay una sesión activa, no necesita QR
      const estado = await this.verificarEstado(sucursalId);
      if (estado.isConnected) {
        return {
          success: true,
          qrCode: null,
          isConnected: true,
          requiresQR: false
        };
      }

      // Si ya tenemos un QR en cache, devolverlo
      const cached = this.qrCodes.get(sucursalId);
      if (cached?.qrCode) {
        return {
          success: true,
          qrCode: cached.qrCode,
          isConnected: false,
          requiresQR: true
        };
      }

      // Asegurar que haya una inicialización en curso, sin crear múltiples sockets
      await this.inicializarConexionSilenciosa(sucursalId).catch(err => {
        console.warn('Error inicializando conexión silenciosa:', err?.message);
      });

      const cachedAfterInit = this.qrCodes.get(sucursalId);
      if (cachedAfterInit?.qrCode) {
        return {
          success: true,
          qrCode: cachedAfterInit.qrCode,
          isConnected: false,
          requiresQR: true
        };
      }

      // Si aún no hay QR, indicar que estamos esperando
      return {
        success: true,
        isConnected: false,
        requiresQR: true,
        qrCode: null,
        timeout: true
      };
    } catch (error) {
      console.error('Error al obtener QR:', error);
      throw error;
    }
  }

  async enviarMensaje(numeroDestino, mensaje) {
    try {
      // Buscar una sesión activa
      let sessionActiva = null;
      for (const [sucursalId, session] of this.sessions.entries()) {
        const estado = await this.verificarEstado(sucursalId);
        if (estado.isConnected) {
          sessionActiva = session;
          break;
        }
      }

      if (!sessionActiva) {
        throw new Error('No hay sesiones de WhatsApp activas');
      }

      // Formatear número
      const numeroFormateado = numeroDestino.replace(/[^0-9]/g, '');
      const jid = numeroFormateado.includes('@') ? numeroDestino : `${numeroFormateado}@s.whatsapp.net`;

      // Enviar mensaje
      const resultado = await sessionActiva.sendMessage(jid, { text: mensaje });
      
      return {
        success: true,
        messageId: resultado.key.id,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  async enviarMensajeConArchivo(numeroDestino, mensaje, archivoBase64, nombreArchivo) {
    try {
      // Buscar una sesión activa
      let sessionActiva = null;
      for (const [sucursalId, session] of this.sessions.entries()) {
        const estado = await this.verificarEstado(sucursalId);
        if (estado.isConnected) {
          sessionActiva = session;
          break;
        }
      }

      if (!sessionActiva) {
        throw new Error('No hay sesiones de WhatsApp activas');
      }

      // Formatear número
      const numeroFormateado = numeroDestino.replace(/[^0-9]/g, '');
      const jid = numeroFormateado.includes('@') ? numeroDestino : `${numeroFormateado}@s.whatsapp.net`;

      // Convertir base64 a buffer
      const buffer = Buffer.from(archivoBase64, 'base64');
      
      // Determinar tipo de archivo
      const extension = path.extname(nombreArchivo).toLowerCase();
      let mimetype = 'application/octet-stream';
      
      if (extension === '.pdf') {
        mimetype = 'application/pdf';
      } else if (['.jpg', '.jpeg'].includes(extension)) {
        mimetype = 'image/jpeg';
      } else if (extension === '.png') {
        mimetype = 'image/png';
      }

      // Enviar archivo con mensaje
      const resultado = await sessionActiva.sendMessage(jid, {
        document: buffer,
        mimetype: mimetype,
        fileName: nombreArchivo,
        caption: mensaje
      });
      
      return {
        success: true,
        messageId: resultado.key.id,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error al enviar mensaje con archivo:', error);
      throw error;
    }
  }

  async desconectar(sucursalId) {
    try {
      const session = this.sessions.get(sucursalId);
      if (session) {
        await session.logout();
        this.sessions.delete(sucursalId);
        this.reconnectAttempts.delete(sucursalId);
      }
      // Eliminar archivos de sesión para asegurar que se solicite un nuevo QR
      try {
        const sessionPath = path.join(this.sessionsPath, `session_${sucursalId}`);
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true, force: true });
          console.log(`🗑️ Sesión persistente eliminada al desconectar sucursal ${sucursalId}`);
        }
      } catch (err) {
        console.warn(`⚠️ No se pudo eliminar la sesión persistente de sucursal ${sucursalId}: ${err.message}`);
      }
      // limpiar QR en cache
      this.qrCodes.delete(sucursalId);
      return { success: true };
    } catch (error) {
      console.error('Error al desconectar:', error);
      throw error;
    }
  }

  async listarSesiones() {
    try {
      const sesiones = [];
      
      for (const [sucursalId, session] of this.sessions.entries()) {
        const estado = await this.verificarEstado(sucursalId);
        sesiones.push({
          sucursalId,
          isConnected: estado.isConnected,
          phoneNumber: estado.phoneNumber,
          status: estado.status,
          reconnectAttempts: this.reconnectAttempts.get(sucursalId) || 0
        });
      }
      
      return sesiones;
    } catch (error) {
      console.error('Error al listar sesiones:', error);
      throw error;
    }
  }

  async limpiarSesionesInvalidas() {
    try {
      console.log('🧹 Limpiando sesiones inválidas...');
      let sesionesLimpiadas = 0;
      
      for (const [sucursalId, session] of this.sessions.entries()) {
        const estado = await this.verificarEstado(sucursalId);
        
        if (!estado.isConnected && estado.status === 'error') {
          console.log(`🗑️ Eliminando sesión inválida para sucursal ${sucursalId}`);
          this.sessions.delete(sucursalId);
          this.reconnectAttempts.delete(sucursalId);
          sesionesLimpiadas++;
        }
      }
      
      console.log(`✅ Limpieza completada. ${sesionesLimpiadas} sesiones eliminadas.`);
      return { sesionesLimpiadas };
    } catch (error) {
      console.error('Error al limpiar sesiones:', error);
      throw error;
    }
  }

  async eliminarSesionPersistente(sucursalId) {
    try {
      // Desconectar sesión activa si existe
      if (this.sessions.has(sucursalId)) {
        await this.desconectar(sucursalId);
      }
      
      // Eliminar archivos de sesión del disco
      const sessionPath = path.join(this.sessionsPath, `session_${sucursalId}`);
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log(`🗑️ Sesión persistente eliminada para sucursal ${sucursalId}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar sesión persistente:', error);
      throw error;
    }
  }

  // Método para obtener estadísticas del servicio
  obtenerEstadisticas() {
    return {
      sesionesActivas: this.sessions.size,
      sesionesConReintentos: this.reconnectAttempts.size,
      maxReintentos: this.maxReconnectAttempts,
      directorioSesiones: this.sessionsPath
    };
  }
}

// Instancia singleton
const baileysService = new BaileysService();

// Función para obtener la instancia
function obtenerInstanciaBaileys() {
  return baileysService;
}

module.exports = {
  BaileysService,
  obtenerInstanciaBaileys
};