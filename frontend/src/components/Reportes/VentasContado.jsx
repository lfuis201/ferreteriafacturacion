import React from 'react';
import ReporteTemplate from './ReporteTemplate';

const VentasContado = ({ onBack }) => {
  const datos = [
    { fecha: '2024-01-15', documento: 'B001-00001', cliente: 'Carlos López', total: 850.00, formaPago: 'Efectivo' },
    { fecha: '2024-01-15', documento: 'F001-00003', cliente: 'Ana Rodríguez', total: 1200.00, formaPago: 'Tarjeta' }
  ];

  return (
    <ReporteTemplate
      onBack={onBack}
      titulo="Reporte de Ventas al Contado"
      datos={datos}
      columnas={['Fecha', 'Documento', 'Cliente', 'Total', 'Forma de Pago']}
    />
  );
};

export default VentasContado;