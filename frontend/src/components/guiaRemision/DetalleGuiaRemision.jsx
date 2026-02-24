import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Truck,
  Package,
  FileText,
  Download,
  Edit
} from 'lucide-react';
import Swal from 'sweetalert2';
import guiaRemisionService from '../../services/guiaRemisionService';
import '../../styles/DetalleGuia.css';

const DetalleGuiaRemision = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guia, setGuia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDetalleGuia();
  }, [id]);

  const cargarDetalleGuia = async () => {
    try {
      setLoading(true);
      const response = await guiaRemisionService.obtenerGuiaRemisionPorId(id);
      setGuia(response.guiaRemision || response);
    } catch (error) {
      console.error('Error al cargar detalle de guía:', error);
      setError('Error al cargar los detalles de la guía de remisión');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar los detalles de la guía de remisión'
      });
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = async () => {
    try {
      await guiaRemisionService.descargarPDF(id);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo descargar el PDF'
      });
    }
  };

  const editarGuia = () => {
    navigate(`/guia-remision/editar/${id}`);
  };

  const obtenerColorEstado = (estado) => {
    const colores = {
      'Pendiente': '#fbbf24',
      'En tránsito': '#3b82f6',
      'Entregado': '#10b981',
      'Anulado': '#ef4444'
    };
    return colores[estado] || '#6b7280';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="detalle-guia-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando detalles de la guía...</p>
        </div>
      </div>
    );
  }

  if (error || !guia) {
    return (
      <div className="detalle-guia-container">
        <div className="error-message">
          <h3>Error al cargar la guía</h3>
          <p>{error || 'Guía de remisión no encontrada'}</p>
          <button onClick={() => navigate('/guia-remision/lista')} className="btn-volver">
            <ArrowLeft size={16} />
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-guia-container">
      {/* Header */}
      <div className="detalle-header">
        <div className="header-left">
          <button onClick={() => navigate('/guia-remision/lista')} className="btn-volver">
            <ArrowLeft size={16} />
            Volver
          </button>
          <div className="titulo-info">
            <h1>Guía de Remisión</h1>
            <p className="numero-guia">{guia.serieComprobante} - {guia.numeroComprobante}</p>
          </div>
        </div>
        <div className="header-actions">
          <span 
            className="estado-badge"
            style={{ backgroundColor: obtenerColorEstado(guia.estado) }}
          >
            {guia.estado}
          </span>

          <button onClick={descargarPDF} className="btn-pdf">
            <Download size={16} />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Información General */}
      <div className="detalle-content">
        <div className="info-grid">
          {/* Información de la Guía */}
          <div className="info-card">
            <h3><FileText size={20} /> Información de la Guía</h3>
            <div className="info-row">
              <span className="label">Fecha de Salida:</span>
              <span className="value">
                <Calendar size={16} />
                {formatearFecha(guia.fechaSalida)}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Motivo de Traslado:</span>
              <span className="value">{guia.motivoTraslado}</span>
            </div>
            <div className="info-row">
              <span className="label">Sucursal:</span>
              <span className="value">{guia.Sucursal?.nombre || 'No especificada'}</span>
            </div>
            <div className="info-row">
              <span className="label">Usuario:</span>
              <span className="value">
                <User size={16} />
                {guia.Usuario ? `${guia.Usuario.nombre} ${guia.Usuario.apellido}` : 'No especificado'}
              </span>
            </div>
            {guia.Venta && (
              <div className="info-row">
                <span className="label">Venta Asociada:</span>
                <span className="value">{guia.Venta.serieComprobante} - {guia.Venta.numeroComprobante}</span>
              </div>
            )}
          </div>

          {/* Información del Cliente */}
          <div className="info-card">
            <h3><User size={20} /> Cliente</h3>
            {guia.Cliente ? (
              <>
                <div className="info-row">
                  <span className="label">Nombre:</span>
                  <span className="value">{guia.Cliente.nombre}</span>
                </div>
                <div className="info-row">
                  <span className="label">Documento:</span>
                  <span className="value">{guia.Cliente.numeroDocumento}</span>
                </div>
                <div className="info-row">
                  <span className="label">Dirección:</span>
                  <span className="value">{guia.Cliente.direccion || 'No especificada'}</span>
                </div>
                {guia.Cliente.telefono && (
                  <div className="info-row">
                    <span className="label">Teléfono:</span>
                    <span className="value">{guia.Cliente.telefono}</span>
                  </div>
                )}
                {guia.Cliente.email && (
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{guia.Cliente.email}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="no-data">Sin cliente asignado</p>
            )}
          </div>

          {/* Información de Traslado */}
          <div className="info-card">
            <h3><MapPin size={20} /> Traslado</h3>
            <div className="info-row">
              <span className="label">Punto de Partida:</span>
              <span className="value">{guia.puntoPartida}</span>
            </div>
            <div className="info-row">
              <span className="label">Punto de Llegada:</span>
              <span className="value">{guia.puntoLlegada}</span>
            </div>
            {guia.observacion && (
              <div className="info-row">
                <span className="label">Observaciones:</span>
                <span className="value">{guia.observacion}</span>
              </div>
            )}
          </div>

          {/* Información del Transporte */}
          <div className="info-card">
            <h3><Truck size={20} /> Transporte</h3>
            {guia.tipoTransporte && (
              <div className="info-row">
                <span className="label">Tipo de Transporte:</span>
                <span className="value">{guia.tipoTransporte}</span>
              </div>
            )}
            {guia.nroPlaca && (
              <div className="info-row">
                <span className="label">Placa del Vehículo:</span>
                <span className="value">{guia.nroPlaca}</span>
              </div>
            )}
            {guia.conductor && (
              <div className="info-row">
                <span className="label">Conductor:</span>
                <span className="value">{guia.conductor}</span>
              </div>
            )}
            {guia.dniConductor && (
              <div className="info-row">
                <span className="label">DNI Conductor:</span>
                <span className="value">{guia.dniConductor}</span>
              </div>
            )}
            {guia.marca && (
              <div className="info-row">
                <span className="label">Marca:</span>
                <span className="value">{guia.marca}</span>
              </div>
            )}
            {guia.modelo && (
              <div className="info-row">
                <span className="label">Modelo:</span>
                <span className="value">{guia.modelo}</span>
              </div>
            )}
            {guia.rutaVehiculo && (
              <div className="info-row">
                <span className="label">Ruta:</span>
                <span className="value">{guia.rutaVehiculo}</span>
              </div>
            )}
            {guia.direccionFiscal && (
              <div className="info-row">
                <span className="label">Dirección Fiscal:</span>
                <span className="value">{guia.direccionFiscal}</span>
              </div>
            )}
            {guia.codigoMTC && (
              <div className="info-row">
                <span className="label">Código MTC:</span>
                <span className="value">{guia.codigoMTC}</span>
              </div>
            )}
          </div>
        </div>

        {/* Detalles de Productos */}
        <div className="productos-section">
          <div className="productos-header">
            <h3><Package size={20} /> Productos</h3>
            {guia.DetalleGuiaRemisions && (
              <span className="total-productos">
                Total: {guia.DetalleGuiaRemisions.length} producto{guia.DetalleGuiaRemisions.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {guia.DetalleGuiaRemisions && guia.DetalleGuiaRemisions.length > 0 ? (
            <div className="productos-table">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Presentación</th>
                    <th>Cantidad</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {guia.DetalleGuiaRemisions.map((detalle, index) => (
                    <tr key={index}>
                      <td>{detalle.Producto?.codigo || 'N/A'}</td>
                      <td>{detalle.Producto?.nombre || 'Producto no encontrado'}</td>
                      <td>{detalle.Presentacion?.nombre || 'Sin presentación'}</td>
                      <td>{detalle.cantidad} {detalle.Producto?.unidadMedida || ''}</td>
                      <td>{detalle.descripcion || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No hay productos registrados en esta guía</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleGuiaRemision;