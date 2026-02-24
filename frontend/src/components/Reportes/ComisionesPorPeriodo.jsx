import React from 'react';
import ReporteTemplate from './ReporteTemplate';

const ComisionesPorPeriodo = ({ onBack }) => {
  const datos = [
    { periodo: 'Enero 2024', vendedor: 'Carlos López', ventasTotales: 25600.00, comisionTotal: 1280.00 },
    { periodo: 'Enero 2024', vendedor: 'Ana Rodríguez', ventasTotales: 22100.00, comisionTotal: 1105.00 },
    { periodo: 'Diciembre 2023', vendedor: 'Carlos López', ventasTotales: 28900.00, comisionTotal: 1445.00 }
  ];

  return (
    <ReporteTemplate
      onBack={onBack}
      titulo="Reporte de Comisiones por Período"
      datos={datos}
      columnas={['Período', 'Vendedor', 'Ventas Totales', 'Comisión Total']}
    />
  );
};

export default ComisionesPorPeriodo;