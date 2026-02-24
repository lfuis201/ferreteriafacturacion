import React, { useState, useEffect } from 'react';
import './ModalUbicacionProducto.css';
import { obtenerSucursales } from '../../services/sucursalService';
import { obtenerInventario } from '../../services/inventarioService';

const ModalUbicacionProducto = ({ isOpen, onClose, producto }) => {
  const [sucursales, setSucursales] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && producto) {
      cargarDatos();
    }
  }, [isOpen, producto]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar sucursales y inventario del producto
      const [sucursalesResponse, inventarioResponse] = await Promise.all([
        obtenerSucursales(),
        obtenerInventario({ productoId: producto.id })
      ]);
      
      const sucursalesData = sucursalesResponse.sucursales || [];
      const inventarioData = inventarioResponse.inventario || [];
      
      // Combinar datos de sucursales con inventario
      const sucursalesConStock = sucursalesData.map(sucursal => {
        const stockEnSucursal = inventarioData.find(inv => inv.sucursalId === sucursal.id);
        return {
          ...sucursal,
          stock: stockEnSucursal ? stockEnSucursal.stock : 0,
          stockMinimo: stockEnSucursal ? stockEnSucursal.stockMinimo : 0,
          precioVenta: stockEnSucursal ? stockEnSucursal.precioVenta : 0
        };
      });
      
      setSucursales(sucursalesConStock);
      setInventario(inventarioData);
    } catch (err) {
      setError('Error al cargar los datos de ubicación del producto');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header del modal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '15px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            📍 Ubicación del Producto
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              padding: '5px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Información del producto */}
        {producto && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            <h4 style={{
              margin: '0 0 10px 0',
              fontSize: '16px',
              color: '#333'
            }}>
              {producto.nombre}
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px',
              fontSize: '12px',
              color: '#666'
            }}>
              <div><strong>Código:</strong> {producto.codigo}</div>
              <div><strong>Categoría:</strong> {producto.Categorium?.nombre || producto.categoria || 'Sin categoría'}</div>
              <div><strong>Precio:</strong> S/ {parseFloat(producto.precioVenta || 0).toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* Lista de sucursales */}
        <div>
          <h4 style={{
            margin: '0 0 15px 0',
            fontSize: '14px',
            color: '#333'
          }}>
            Sucursales con Stock Disponible
          </h4>
          
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#666'
            }}>
              Cargando información de sucursales...
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: '#fff5f5',
              borderRadius: '6px',
              border: '1px solid #f5c6cb'
            }}>
              <p style={{ color: '#dc3545', margin: '0 0 10px 0' }}>{error}</p>
              <button
                onClick={cargarDatos}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Reintentar
              </button>
            </div>
          ) : sucursales.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#666'
            }}>
              No se encontraron sucursales disponibles.
            </div>
          ) : (
            (() => {
              // Filtrar solo las sucursales que tienen stock disponible
              const sucursalesConStock = sucursales.filter(sucursal => sucursal.stock > 0);
              
              return sucursalesConStock.length === 0 ? (
                <div style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '6px',
                  padding: '20px',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: '#856404'
                }}>
                  <strong>⚠️ Este producto no tiene stock disponible en ninguna sucursal</strong>
                  <p style={{ margin: '10px 0 0 0', fontSize: '12px' }}>
                    El producto existe pero actualmente no hay unidades disponibles para la venta.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '15px',
                    fontSize: '12px',
                    color: '#155724'
                  }}>
                    <strong>✅ Producto disponible en {sucursalesConStock.length} sucursal{sucursalesConStock.length > 1 ? 'es' : ''}</strong>
                  </div>
                  <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    {/* Header de la tabla */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr 1fr',
                      backgroundColor: '#f8f9fa',
                      padding: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#333',
                      borderBottom: '1px solid #ddd'
                    }}>
                      <div>Sucursal</div>
                      <div style={{ textAlign: 'center' }}>Stock</div>
                      <div style={{ textAlign: 'center' }}>Stock Mín.</div>
                      <div style={{ textAlign: 'center' }}>Precio</div>
                      <div>Dirección</div>
                      <div style={{ textAlign: 'center' }}>Estado</div>
                    </div>
                    
                    {/* Filas de sucursales con stock */}
                    {sucursalesConStock.map((sucursal, index) => (
                      <div
                        key={sucursal.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr 1fr',
                          padding: '12px',
                          fontSize: '12px',
                          borderBottom: index < sucursalesConStock.length - 1 ? '1px solid #eee' : 'none',
                          backgroundColor: 'white'
                        }}
                      >
                        <div style={{
                          fontWeight: '500',
                          color: '#333'
                        }}>
                          {sucursal.nombre}
                        </div>
                        <div style={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: sucursal.stock <= sucursal.stockMinimo ? '#ffc107' : '#28a745'
                        }}>
                          {sucursal.stock}
                        </div>
                        <div style={{
                          textAlign: 'center',
                          color: '#666'
                        }}>
                          {sucursal.stockMinimo}
                        </div>
                        <div style={{
                          textAlign: 'center',
                          color: '#666'
                        }}>
                          S/ {sucursal.precioVenta ? parseFloat(sucursal.precioVenta).toFixed(2) : '0.00'}
                        </div>
                        <div style={{
                          color: '#666',
                          fontSize: '11px'
                        }}>
                          {sucursal.direccion || 'No especificada'}
                        </div>
                        <div style={{
                          textAlign: 'center'
                        }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            backgroundColor: sucursal.stock <= sucursal.stockMinimo ? '#ffc107' : '#28a745',
                            color: 'white'
                          }}>
                            {sucursal.stock <= sucursal.stockMinimo ? 'Stock Bajo' : 'Disponible'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* Footer del modal */}
        <div style={{
          marginTop: '20px',
          textAlign: 'right',
          borderTop: '1px solid #eee',
          paddingTop: '15px'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalUbicacionProducto;