import React from 'react';
import ReporteTemplate from './ReporteTemplate';

const VentasPorHora = ({ onBack }) => {
  const datos = [
    { hora: '09:00-10:00', cantidadVentas: 12, totalVentas: 2500.00 },
    { hora: '10:00-11:00', cantidadVentas: 18, totalVentas: 3200.00 },
    { hora: '11:00-12:00', cantidadVentas: 25, totalVentas: 4100.00 }
  ];

  return (
    <ReporteTemplate
      onBack={onBack}
      titulo="Reporte de Ventas por Hora"
      datos={datos}
      columnas={['Hora', 'Cantidad Ventas', 'Total Ventas']}
    />
  );
};

export default VentasPorHora;