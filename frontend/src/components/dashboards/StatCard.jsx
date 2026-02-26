import React from 'react';

/**
 * Card de métrica para el dashboard (icono + título + número).
 * @param {React.ReactNode} icon - Icono opcional (ej: <Users size={20} />)
 * @param {string} label - Título de la métrica
 * @param {string|number} value - Valor a mostrar
 * @param {boolean} loading - Si true muestra "..."
 * @param {string} valueClassName - Clases opcionales para el valor (ej: text-emerald-600)
 */
function StatCard({ icon, label, value, loading = false, valueClassName = 'text-menta-marino' }) {
  return (
    <div className="flex min-h-[120px] flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-menta-suave text-menta-petroleo">
          {icon}
        </span>
      )}
      <h3 className="text-sm font-medium text-menta-petroleo">{label}</h3>
      <p className={`mt-auto text-3xl font-semibold ${valueClassName}`}>
        {loading ? '...' : value}
      </p>
    </div>
  );
}

export default StatCard;
