import React from 'react';

const btnClass =
  'inline-flex min-h-[56px] w-full items-center justify-start gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-menta-marino transition-colors hover:border-slate-300 hover:bg-slate-50';

/**
 * Botón de acción rápida para el dashboard (icono + texto).
 * @param {React.ReactNode} icon - Elemento icono (ej: <Users size={18} />)
 * @param {string} label - Texto del botón
 * @param {function} onClick - Al hacer clic
 */
function QuickActionButton({ icon, label, onClick }) {
  return (
    <button type="button" className={btnClass} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default QuickActionButton;
