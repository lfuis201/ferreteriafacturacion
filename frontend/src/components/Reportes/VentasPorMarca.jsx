import React from 'react';
import ReporteTemplate from './ReporteTemplate';

const VentasPorMarca = ({ onBack }) => {
  const datos = [
    { marca: 'Stanley', cantidadVentas: 45, totalVentas: 8500.00, porcentaje: 35.2 },
    { marca: 'DeWalt', cantidadVentas: 32, totalVentas: 6200.00, porcentaje: 25.7 },
    { marca: 'Bosch', cantidadVentas: 28, totalVentas: 5100.00, porcentaje: 21.1 }
  ];

  return (
    <ReporteTemplate
      onBack={onBack}
      titulo="Reporte de Ventas por Marca"
      datos={datos}
      columnas={['Marca', 'Cantidad Ventas', 'Total Ventas', 'Porcentaje']}
    />
  );
};

export default VentasPorMarca;