import apiClient, { handleApiError } from './apiService';

class WhatsAppService {
  /**
   * Enviar comprobante por WhatsApp
   * @param {Object} datos - Datos para enviar el comprobante
   * @param {string} datos.sucursalId - ID de la sucursal
   * @param {string} datos.numeroDestino - Número de teléfono del destinatario
   * @param {string} datos.mensaje - Mensaje a enviar
   * @param {string} datos.archivoBase64 - Archivo PDF en base64 (opcional)
   * @param {string} datos.nombreArchivo - Nombre del archivo (opcional)
   */
  async enviarComprobante(datos) {
    try {
      const { sucursalId, numeroDestino, mensaje, archivoBase64, nombreArchivo } = datos;
      
      const response = await apiClient.post(`/configuracion-whatsapp/${sucursalId}/enviar-comprobante`, {
        numeroDestino,
        mensaje,
        archivoBase64,
        nombreArchivo
      });
      
      return response.data;
    } catch (error) {
      handleApiError(error, 'Error al enviar comprobante por WhatsApp');
      throw error;
    }
  }

  /**
   * Obtener configuración de WhatsApp de una sucursal
   * @param {string} sucursalId - ID de la sucursal
   */
  async obtenerConfiguracion(sucursalId) {
    try {
      const response = await apiClient.get(`/configuracion-whatsapp/${sucursalId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Error al obtener configuración WhatsApp');
      throw error;
    }
  }

  /**
   * Probar conexión con WhatsApp
   * @param {string} sucursalId - ID de la sucursal
   */
  async probarConexion(sucursalId) {
    try {
      const response = await apiClient.post(`/configuracion-whatsapp/${sucursalId}/probar-conexion`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Error al probar conexión WhatsApp');
      throw error;
    }
  }

  // Obtener (o esperar) código QR para conectar WhatsApp
  async obtenerCodigoQR(sucursalId) {
    try {
      const response = await apiClient.get(`/configuracion-whatsapp/${sucursalId}/codigo-qr`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Error al obtener código QR de WhatsApp');
      throw error;
    }
  }

  // Verificar estado de conexión
  async verificarEstadoConexion(sucursalId) {
    try {
      const response = await apiClient.get(`/configuracion-whatsapp/${sucursalId}/estado-conexion`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Error al verificar estado de WhatsApp');
      throw error;
    }
  }

  // Crear configuración de WhatsApp
  async crearConfiguracion(sucursalId, payload) {
    try {
      // El backend expone POST en `/:sucursalId` para crear/guardar
      const response = await apiClient.post(`/configuracion-whatsapp/${sucursalId}`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Error al crear configuración WhatsApp');
      throw error;
    }
  }

  // Actualizar configuración de WhatsApp
  async actualizarConfiguracion(sucursalId, payload) {
    try {
      const response = await apiClient.put(`/configuracion-whatsapp/${sucursalId}/actualizar`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Error al actualizar configuración WhatsApp');
      throw error;
    }
  }

  // Obtener estadísticas de WhatsApp
  async obtenerEstadisticas(sucursalId) {
    try {
      const response = await apiClient.get(`/configuracion-whatsapp/${sucursalId}/estadisticas`);
      const raw = response.data;
      const src = raw?.data || raw?.estadisticas || raw;
      const mapped = {
        enviadosHoy: src?.enviosHoy ?? src?.enviadosHoy ?? 0,
        enviadosMes: src?.enviosMes ?? src?.enviadosMes ?? 0,
        fallidos: src?.fallidos ?? 0,
        exitosos: src?.exitosos ?? (src?.enviosHoy ?? 0),
        limiteDiario: src?.limiteDiario ?? 0,
        ultimoEnvio: src?.ultimoEnvio ?? null,
        estado: src?.estado ?? 'Desconocido',
        puedeEnviar: src?.puedeEnviar ?? true
      };
      return { success: true, estadisticas: mapped };
    } catch (error) {
      if (error.response?.status === 404) {
        return { estadisticas: { enviadosHoy: 0, enviadosMes: 0, fallidos: 0, exitosos: 0 } };
      }
      handleApiError(error, 'Error al obtener estadísticas WhatsApp');
      throw error;
    }
  }

  /**
   * Formatear número de teléfono
   * @param {string} numero - Número de teléfono
   */
  formatearNumero(numero) {
    // Remover espacios y caracteres especiales
    let numeroLimpio = numero.replace(/[^0-9+]/g, '');
    
    // Si no tiene código de país, agregar +51 (Perú)
    if (!numeroLimpio.startsWith('+')) {
      if (numeroLimpio.startsWith('51')) {
        numeroLimpio = '+' + numeroLimpio;
      } else if (numeroLimpio.length === 9) {
        numeroLimpio = '+51' + numeroLimpio;
      }
    }
    
    return numeroLimpio;
  }

  /**
   * Generar mensaje predeterminado para comprobante
   * @param {Object} venta - Datos de la venta
   * @param {Object} cliente - Datos del cliente
   */
  generarMensajePredeterminado(venta, cliente) {
    // Formatear fecha de manera más robusta
    let fecha = 'Fecha no disponible';
    const fechaVenta = venta.fechaVenta || venta.fecha || venta.createdAt;
    if (fechaVenta) {
      try {
        const fechaObj = new Date(fechaVenta);
        if (!isNaN(fechaObj.getTime())) {
          fecha = fechaObj.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
      } catch (error) {
        console.error('Error al formatear fecha:', error);
      }
    }
    
    const nombreCliente = cliente?.nombre || venta?.Cliente?.nombre || venta?.clienteNombre || 'Estimado cliente';
    const tipoComprobante = venta?.tipoComprobante || 'BOLETA';
    const numeroComprobante = venta?.numeroComprobante || venta?.numeroComprobanteSunat || venta?.numeroVenta || venta?.id;
    const total = venta?.total || 0;
    
    console.log('Datos de venta para WhatsApp:', {
      fechaVenta: venta.fechaVenta,
      fecha: venta.fecha,
      createdAt: venta.createdAt,
      fechaFormateada: fecha,
      pdfUrl: venta.pdfUrl,
      pdfPath: venta.pdfPath,
      numeroComprobante
    });
    
    // Construir URL del PDF si está disponible
     let enlacePDF = '';
     if (venta?.pdfUrl) {
       enlacePDF = `\n\n📎 Descargar comprobante PDF:\n${venta.pdfUrl}`;
     } else if (venta?.pdfPath) {
       // Si solo tenemos el path, construir la URL completa
       const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
       //const baseUrl = import.meta.env.VITE_API_URL ||'https://ferreteriafcturacion.onrender.com';

       enlacePDF = `\n\n📎 Descargar comprobante PDF:\n${baseUrl}${venta.pdfPath}`;
     } else if (numeroComprobante) {

       // URL por defecto basada en el número de comprobante
       //const baseUrl = import.meta.env.VITE_API_URL ||'https://ferreteriafcturacion.onrender.com';
       const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
       enlacePDF = `\n\n📎 Descargar comprobante PDF:\n${baseUrl}/files/${numeroComprobante}.pdf`;
     }
    
    return `¡Hola ${nombreCliente}! 👋\n\n` +
           `Te enviamos el comprobante de tu compra:\n\n` +
           `📄 Comprobante: ${tipoComprobante} N° ${numeroComprobante}\n` +
           `💰 Total: S/ ${parseFloat(total).toFixed(2)}\n` +
           `📅 Fecha: ${fecha}\n` +
           `🏪 Estado: ${venta?.estadoSunat === 'ACEPTADO' ? 'Procesado por SUNAT ✅' : 'En proceso 📋'}` +
           enlacePDF +
           `\n\n¡Gracias por confiar en nosotros! 🛒\n` +
           `Tu compra es muy importante para nosotros.\n\n` +
           `Si tienes alguna consulta, no dudes en contactarnos.\n\n` +
           `Saludos cordiales,\n` +
           `El equipo de ventas FAMASUR 😊`;
  }
}

const whatsappService = new WhatsAppService();
export default whatsappService;