import React, { useState } from 'react';
import whatsappService from '../../services/whatsappService';

function ModalWhatsApp({ onClose, venta, cliente }) {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [telefono, setTelefono] = useState(
    cliente?.telefono || 
    cliente?.celular || 
    cliente?.whatsapp || 
    venta?.Cliente?.telefono || 
    venta?.Cliente?.celular || 
    venta?.Cliente?.whatsapp || 
    ''
  );
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [estadoEnvio, setEstadoEnvio] = useState(null);

  // Generar mensaje predeterminado
  React.useEffect(() => {
    if (venta && cliente) {
      console.log('Datos recibidos en ModalWhatsApp:', { venta, cliente });
      const mensajeDefault = whatsappService.generarMensajePredeterminado(venta, cliente);
      console.log('Mensaje generado:', mensajeDefault);
      setMensaje(mensajeDefault);
    }
  }, [venta, cliente]);

  

  const abrirWhatsAppWeb = () => {
    const numeroLimpio = telefono.replace(/\D/g, '');
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/51${numeroLimpio}?text=${mensajeCodificado}`;
    window.open(url, '_blank');
  };

  const enviarPorWhatsApp = async () => {
    try {
      setLoading(true);
      setError('');

      // Validaciones básicas
      const numeroLimpio = (telefono || '').replace(/\D/g, '');
      if (!numeroLimpio || numeroLimpio.length < 9) {
        setError('Ingrese un número válido de 9 dígitos.');
        setLoading(false);
        return;
      }

      // Determinar sucursalId desde la venta
      const sucursalId = venta?.sucursalId || venta?.SucursalId || venta?.establecimientoId || 1;

      // Si el backend requiere PDF, intentamos construirlo desde venta
      let archivoBase64 = null;
      let nombreArchivo = null;
      if (venta?.pdfBase64) {
        archivoBase64 = venta.pdfBase64;
        nombreArchivo = `${venta?.serieComprobante || 'Serie'}-${venta?.numeroComprobante || venta?.id}.pdf`;
      }

      const payload = {
        sucursalId,
        numeroDestino: numeroLimpio,
        mensaje,
        archivoBase64,
        nombreArchivo
      };

      const resp = await whatsappService.enviarComprobante(payload);
      setEstadoEnvio(resp?.data || resp);
      setEnviado(true);
    } catch (e) {
      console.error('Error al enviar por WhatsApp:', e);
      setError(e?.message || 'No se pudo enviar el mensaje.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          backgroundColor: '#25D366',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            fontSize: '24px'
          }}>📱</div>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 'bold'
          }}>Enviar Comprobante por WhatsApp</h3>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {enviado ? (
            <div style={{
              textAlign: 'center',
              padding: '20px'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '15px'
              }}>✅</div>
              <h4 style={{
                color: '#25D366',
                marginBottom: '10px'
              }}>¡Mensaje enviado exitosamente!</h4>
              <p style={{
                color: '#666',
                fontSize: '14px'
              }}>El comprobante ha sido enviado al cliente por WhatsApp.</p>
            </div>
          ) : (
            <>
              {/* Información de la venta */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  margin: '0 0 10px 0',
                  fontSize: '14px',
                  color: '#333'
                }}>Información de la Venta</h4>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  lineHeight: '1.5'
                }}>
                  <div><strong>Cliente:</strong> {cliente?.nombre}</div>
                  <div><strong>Comprobante:</strong> {venta?.tipoComprobante} {venta?.numeroComprobante}</div>
                  <div><strong>Total:</strong> S/ {venta?.total ? parseFloat(venta.total).toFixed(2) : '0.00'}</div>
                  <div><strong>Fecha:</strong> {venta?.fechaVenta ? new Date(venta.fechaVenta).toLocaleDateString('es-PE') : 'Fecha no disponible'}</div>
                </div>
              </div>

              {/* Número de teléfono */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>Número de WhatsApp</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 987654321"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Mensaje */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>Mensaje</label>
                <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={6}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '12px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              
              {error && (
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: '#fee',
                  border: '1px solid #fcc',
                  color: '#c33',
                  borderRadius: '6px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⚠️</span>
                  {error}
                </div>
              )}
              </div>

              {/* Botones */}
              <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'space-between'
              }}>
                <button
                  onClick={abrirWhatsAppWeb}
                  style={{
                    backgroundColor: '#25D366',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  🌐 Abrir WhatsApp Web
                </button>
                
                <button
                  onClick={enviarPorWhatsApp}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#ccc' : '#128C7E',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  {loading ? 'Enviando…' : '📲 Enviar por WhatsApp'}
                </button>
              </div>

             
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalWhatsApp;