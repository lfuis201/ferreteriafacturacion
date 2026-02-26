import React from 'react';
import {
  Users,
  Building2,
  FolderOpen,
  Package,
  DollarSign,
  BarChart3,
  Settings,
} from 'lucide-react';
import StatCard from './StatCard';
import QuickActionButton from './QuickActionButton';

const ICON_SIZE = 18;
const STAT_ICON_SIZE = 22;

const statsConfig = [
  { key: 'usuarios', label: 'Usuarios Totales', icon: <Users size={STAT_ICON_SIZE} /> },
  { key: 'sucursales', label: 'Sucursales', icon: <Building2 size={STAT_ICON_SIZE} /> },
  { key: 'productosYPresentaciones', label: 'Productos y Presentaciones', icon: <Package size={STAT_ICON_SIZE} /> },
  { key: 'ventasMes', label: 'Ventas del Mes', valueClassName: 'text-menta-esmeralda', icon: <DollarSign size={STAT_ICON_SIZE} /> },
];

function InicioOverview({ cargandoStats, stats, errorStats, onNavigate }) {
  const quickActions = [
    { path: '/usuarios/gestion', icon: <Users size={ICON_SIZE} />, label: 'Gestionar Usuarios' },
    { path: '/sucursales/gestion', icon: <Building2 size={ICON_SIZE} />, label: 'Gestionar Sucursales' },
    { path: '/categorias/gestion', icon: <FolderOpen size={ICON_SIZE} />, label: 'Gestionar Categorías' },
    { path: '/productos/gestion', icon: <Package size={ICON_SIZE} />, label: 'Gestionar Productos y Presentaciones' },
    { path: '/inventario/gestion', icon: <BarChart3 size={ICON_SIZE} />, label: 'Gestionar Inventario' },
    { path: '/ventas/lista', icon: <DollarSign size={ICON_SIZE} />, label: 'Ver Ventas' },
    { path: '/configuraciones', icon: <Settings size={ICON_SIZE} />, label: 'Configuraciones' },
  ];

  return (
    <div className="w-full h-full space-y-8 px-6 py-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-fondo">
            Panel de Control - SuperAdmin
          </h2>
          <p className="mt-1 text-sm text-menta-petroleo">
            Resumen general de tu sistema y accesos rápidos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {statsConfig.map(({ key, label, valueClassName, icon }) => (
          <StatCard
            key={key}
            icon={icon}
            label={label}
            value={stats[key]}
            loading={cargandoStats}
            valueClassName={valueClassName}
          />
        ))}
      </div>

      {errorStats && (
        <div className="rounded-lg border border-menta-esmeralda bg-white px-4 py-2 text-sm text-menta-petroleo">
          {errorStats}
        </div>
      )}

      <div className="mt-4 space-y-3">
        <h3 className="text-base font-semibold text-fondo">
          Acciones rápidas
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {quickActions.map(({ path, icon, label }) => (
            <QuickActionButton
              key={path}
              icon={icon}
              label={label}
              onClick={() => onNavigate(path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default InicioOverview;
