import React from 'react';
import ReporteTemplate from './ReporteTemplate';

const VentasCredito = ({ onBack }) => {
  const datos = [
    { cliente: 'Juan Pérez', documento: 'F001-00001', fechaVenta: '2024-01-15', total: 1500.00, saldo: 750.00, estado: 'Pendiente' },
    { cliente: 'María García', documento: 'F001-00002', fechaVenta: '2024-01-14', total: 2200.00, saldo: 0.00, estado: 'Pagado' }
  ];

  return (
    <ReporteTemplate
      onBack={onBack}
      titulo="Reporte de Ventas a Crédito"
      datos={datos}
      columnas={['Cliente', 'Documento', 'Fecha Venta', 'Total', 'Saldo', 'Estado']}
    />
  );
};

export default VentasCredito;