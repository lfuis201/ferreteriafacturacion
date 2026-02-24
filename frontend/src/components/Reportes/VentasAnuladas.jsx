import React from 'react';
import ReporteTemplate from './ReporteTemplate';

const VentasAnuladas = ({ onBack }) => {
  const datos = [
    { fecha: '2024-01-15', documento: 'F001-00001', cliente: 'Juan Pérez', total: 1500.00, motivo: 'Error en facturación' },
    { fecha: '2024-01-14', documento: 'B001-00025', cliente: 'María García', total: 850.00, motivo: 'Cancelación cliente' }
  ];

  const columnas = ['Fecha', 'Documento', 'Cliente', 'Total', 'Motivo'];

  return (
    <ReporteTemplate
      onBack={onBack}
      titulo="Reporte de Ventas Anuladas"
      datos={datos}
      columnas={columnas}
    />
  );
};

export default VentasAnuladas;