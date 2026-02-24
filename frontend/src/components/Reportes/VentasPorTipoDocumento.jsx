import React from 'react';
import ReporteTemplate from './ReporteTemplate';

const VentasPorTipoDocumento = ({ onBack }) => {
  const datos = [
    { tipoDocumento: 'Factura', cantidadVentas: 125, totalVentas: 28500.00, porcentaje: 65.2 },
    { tipoDocumento: 'Boleta', cantidadVentas: 89, totalVentas: 15200.00, porcentaje: 34.8 }
  ];

  return (
    <ReporteTemplate
      onBack={onBack}
      titulo="Reporte de Ventas por Tipo de Documento"
      datos={datos}
      columnas={['Tipo Documento', 'Cantidad Ventas', 'Total Ventas', 'Porcentaje']}
    />
  );
};

export default VentasPorTipoDocumento;