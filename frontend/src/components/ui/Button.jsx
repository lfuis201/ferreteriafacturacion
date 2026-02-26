import React from "react";
import { Loader2 } from "lucide-react";

const variantStyles = {
  primary:
    "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg shadow-blue-500/25 focus:ring-blue-500",
  secondary:
    "bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-white focus:ring-slate-500",
  outline:
    "border-2 border-slate-300 dark:border-slate-600 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-500",
  ghost:
    "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-500",
  danger:
    "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3.5 text-base rounded-xl",
};

/**
 * Botón reutilizable con loading e icono opcional a la derecha.
 * @param {boolean} loading - Muestra spinner y deshabilita el botón
 * @param {React.ReactNode} iconRight - Icono a la derecha (ej: <ArrowRight className="w-4 h-4" />)
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - true = w-full
 * @param {string} className - Clases extra
 * @param {React.ReactNode} children - Texto o contenido del botón
 */
function Button({
  loading = false,
  iconRight,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-60 disabled:cursor-not-allowed
        transition
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.trim()}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
      ) : null}
      {children}
      {!loading && iconRight ? (
        <span className="shrink-0 flex items-center">{iconRight}</span>
      ) : null}
    </button>
  );
}

export default Button;
