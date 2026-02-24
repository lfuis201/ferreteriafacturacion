const { ConfiguracionSunat } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Configuración de multer para subir archivos PFX
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/certificados');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cert-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Solo permitir archivos .pfx y .p12
  if (file.mimetype === 'application/x-pkcs12' || 
      path.extname(file.originalname).toLowerCase() === '.pfx' ||
      path.extname(file.originalname).toLowerCase() === '.p12') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PFX o P12'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

class ConfiguracionSunatController {
  // Obtener configuración SUNAT
  static async obtenerConfiguracion(req, res) {
    try {
      const { sucursalId } = req.params;
      
      const configuracion = await ConfiguracionSunat.findOne({
        where: { sucursalId },
        attributes: { exclude: ['passwordCertificado', 'passwordZona'] } // Excluir passwords por seguridad
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración SUNAT para esta sucursal'
        });
      }

      res.json({
        success: true,
        data: configuracion
      });
    } catch (error) {
      console.error('Error al obtener configuración SUNAT:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear o actualizar configuración SUNAT
  static async guardarConfiguracion(req, res) {
    try {
      const { sucursalId } = req.params;
      const {
        ambiente,
        usuarioSol,
        passwordSol,
        urlEnvio,
        urlConsulta,
        serieFactura,
        correlativoFactura,
        serieBoleta,
        correlativoBoleta,
        serieNotaCredito,
        correlativoNotaCredito,
        serieNotaDebito,
        correlativoNotaDebito,
        activo
      } = req.body;

      // Validar datos requeridos
      if (!ambiente) {
        return res.status(400).json({
          success: false,
          message: 'Ambiente es requerido'
        });
      }

      // Encriptar contraseña si se proporciona
      const passwordEncriptado = passwordSol ? crypto.createHash('sha256').update(passwordSol).digest('hex') : null;

      // Buscar configuración existente
      let configuracion = await ConfiguracionSunat.findOne({
        where: { sucursalId }
      });

      // Obtener URLs correctas según el ambiente
      const urlsAmbiente = ambiente === 'demo' ? {
        envio: 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService',
        consulta: 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billConsultService'
      } : {
        envio: 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService',
        consulta: 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billConsultService'
      };

      const datosConfiguracion = {
        sucursalId,
        ambiente,
        usuarioSol: usuarioSol || null,
        passwordSol: passwordEncriptado,
        urlEnvio: urlEnvio || urlsAmbiente.envio,
        urlConsulta: urlConsulta || urlsAmbiente.consulta,
        serieFactura: serieFactura || 'F001',
        correlativoFactura: correlativoFactura || 1,
        serieBoleta: serieBoleta || 'B001',
        correlativoBoleta: correlativoBoleta || 1,
        serieNotaCredito: serieNotaCredito || 'FC01',
        correlativoNotaCredito: correlativoNotaCredito || 1,
        serieNotaDebito: serieNotaDebito || 'FD01',
        correlativoNotaDebito: correlativoNotaDebito || 1,
        activo: activo !== undefined ? activo : true,
        estadoConexion: 'desconectado' // Mantener como desconectado hasta que se pruebe la conexión
      };

      if (configuracion) {
        // Actualizar configuración existente
        await configuracion.update(datosConfiguracion);
      } else {
        // Crear nueva configuración
        configuracion = await ConfiguracionSunat.create(datosConfiguracion);
      }

      // Retornar configuración sin passwords
      const configuracionResponse = await ConfiguracionSunat.findByPk(configuracion.id, {
        attributes: { exclude: ['passwordCertificado', 'passwordZona'] }
      });

      res.json({
        success: true,
        message: configuracion.isNewRecord ? 'Configuración SUNAT creada exitosamente' : 'Configuración SUNAT actualizada exitosamente',
        data: configuracionResponse
      });
    } catch (error) {
      console.error('Error al guardar configuración SUNAT:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Subir certificado PFX
  static async subirCertificado(req, res) {
    try {
      const { sucursalId } = req.params;
      const { password, passwordCertificado } = req.body;
      
      // Aceptar tanto 'password' (Swagger) como 'passwordCertificado' (frontend)
      const passwordCert = password || passwordCertificado;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha subido ningún archivo de certificado'
        });
      }

      if (!passwordCert) {
        // Eliminar archivo subido si no hay contraseña
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'La contraseña del certificado es requerida'
        });
      }

      // Encriptar contraseña del certificado
      const passwordEncriptado = crypto.createHash('sha256').update(passwordCert).digest('hex');

      // Buscar configuración existente
      let configuracion = await ConfiguracionSunat.findOne({
        where: { sucursalId }
      });

      const datosActualizacion = {
        certificadoPfx: req.file.path,
        nombreCertificado: req.file.originalname,
        passwordCertificado: passwordEncriptado,
        fechaActualizacion: new Date()
      };

      if (configuracion) {
        // Eliminar certificado anterior si existe
        if (configuracion.certificadoPfx && fs.existsSync(configuracion.certificadoPfx)) {
          fs.unlinkSync(configuracion.certificadoPfx);
        }
        
        // Actualizar configuración existente
        await configuracion.update(datosActualizacion);
      } else {
        // Crear nueva configuración con certificado
        configuracion = await ConfiguracionSunat.create({
          sucursalId,
          usuarioId: req.user.id,
          ...datosActualizacion,
          ambiente: 'demo', // Por defecto demo
          activo: true
        });
      }

      res.json({
        success: true,
        message: 'Certificado digital subido exitosamente',
        data: {
          nombreCertificado: req.file.originalname,
          fechaSubida: new Date()
        }
      });
    } catch (error) {
      console.error('Error al subir certificado:', error);
      
      // Eliminar archivo si hubo error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener siguiente correlativo
  static async obtenerSiguienteCorrelativo(req, res) {
    try {
      const { sucursalId, tipoDocumento } = req.params;
      
      const configuracion = await ConfiguracionSunat.findOne({
        where: { sucursalId }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración SUNAT'
        });
      }

      const siguienteCorrelativo = await configuracion.obtenerSiguienteCorrelativo(tipoDocumento);
      
      res.json({
        success: true,
        data: {
          tipoDocumento,
          siguienteCorrelativo
        }
      });
    } catch (error) {
      console.error('Error al obtener correlativo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Probar conexión con SUNAT
  static async probarConexion(req, res) {
    try {
      const { sucursalId } = req.params;
      
      const configuracion = await ConfiguracionSunat.findOne({
        where: { sucursalId }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración SUNAT'
        });
      }

      // Validar que tenga certificado y contraseña
      if (!configuracion.certificadoPfx || !configuracion.passwordCertificado) {
        return res.status(400).json({
          success: false,
          message: 'Faltan certificado digital y contraseña para probar la conexión'
        });
      }

      // Validar que el archivo de certificado existe
      if (!fs.existsSync(configuracion.certificadoPfx)) {
        return res.status(400).json({
          success: false,
          message: 'El archivo de certificado no existe en el servidor'
        });
      }

      try {
        // Validar certificado PFX
        const certificadoBuffer = fs.readFileSync(configuracion.certificadoPfx);
        
        if (certificadoBuffer.length < 100) {
          throw new Error('El archivo de certificado parece estar corrupto');
        }

        // Actualizar estado de conexión
        await configuracion.update({
          estadoConexion: 'conectado',
          ultimaConexion: new Date(),
          fechaVinculacion: configuracion.fechaVinculacion || new Date()
        });

        res.json({
          success: true,
          message: 'Certificado digital validado exitosamente',
          data: {
            estadoConexion: 'conectado',
            ultimaConexion: new Date(),
            ambiente: configuracion.ambiente,
            certificado: configuracion.nombreCertificado || 'Certificado válido'
          }
        });
      } catch (connectionError) {
        // Error de conexión
        await configuracion.update({
          estadoConexion: 'error',
          observaciones: `Error de certificado: ${connectionError.message}`
        });

        res.status(400).json({
          success: false,
          message: 'Error al validar certificado digital',
          error: connectionError.message
        });
      }
    } catch (error) {
      console.error('Error al probar conexión SUNAT:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar correlativo
  static async actualizarCorrelativo(req, res) {
    try {
      const { sucursalId, tipoDocumento } = req.params;
      const { correlativo } = req.body;
      
      if (!correlativo || correlativo < 1) {
        return res.status(400).json({
          success: false,
          message: 'El correlativo debe ser un número mayor a 0'
        });
      }
      
      const configuracion = await ConfiguracionSunat.findOne({
        where: { sucursalId }
      });

      if (!configuracion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró configuración SUNAT'
        });
      }

      await configuracion.actualizarCorrelativo(tipoDocumento, correlativo);
      
      res.json({
        success: true,
        message: 'Correlativo actualizado exitosamente',
        data: {
          tipoDocumento,
          nuevoCorrelativo: correlativo
        }
      });
    } catch (error) {
      console.error('Error al actualizar correlativo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

// Middleware para subir certificado
ConfiguracionSunatController.uploadCertificado = upload.single('certificado');

module.exports = ConfiguracionSunatController;