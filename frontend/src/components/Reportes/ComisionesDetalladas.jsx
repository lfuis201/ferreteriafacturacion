import React from 'react';
import ReporteTemplate from './ReporteTemplate';

const ComisionesDetalladas = ({ onBack }) => {
  const datos = [
    { vendedor: 'Carlos López', fecha: '2024-01-15', documento: 'F001-00001', cliente: 'Juan Pérez', venta: 1500.00, comision: 75.00 },
    { vendedor: 'Ana Rodríguez', fecha: '2024-01-15', documento: 'B001-00025', cliente: 'María García', venta: 850.00, comision: 42.50 }
  ];

  return (
    <ReporteTemplate
      onBack={onBack}
      titulo="Reporte de Comisiones Detalladas"
      datos={datos}
      columnas={['Vendedor', 'Fecha', 'Documento', 'Cliente', 'Venta', 'Comisión']}
    />
  );
};

export default ComisionesDetalladas;