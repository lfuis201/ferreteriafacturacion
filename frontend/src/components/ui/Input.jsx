import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Input reutilizable con icono opcional a la derecha.
 * Para type="password" usa passwordToggle para mostrar ojito y ver/ocultar contraseña.
 */
const Input = React.forwardRef(
  ({ iconRight, error, passwordToggle, type, className = "", ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const hasRightContent = iconRight || (isPassword && passwordToggle);

    const baseInput =
      "w-full px-4 py-3 rounded-xl border bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition";
    const borderClass = error
      ? "border-red-500 focus:ring-red-500"
      : "border-slate-300";
    const paddingRight = hasRightContent ? "pr-11" : "";

    const inputType = isPassword && passwordToggle && showPassword ? "text" : type;

    return (
      <div className={`w-full ${className}`}>
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`${baseInput} ${borderClass} ${paddingRight}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${rest.id || "input"}-error` : undefined}
            {...rest}
          />
          {isPassword && passwordToggle ? (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          ) : iconRight ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 flex items-center justify-center">
              {iconRight}
            </div>
          ) : null}
        </div>
        {error && (
          <p
            id={rest.id ? `${rest.id}-error` : "input-error"}
            className="mt-1.5 text-sm text-red-600"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
