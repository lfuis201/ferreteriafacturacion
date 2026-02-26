import React from "react";
import { ChevronRight, ChevronDown, LogOut } from "lucide-react";

/**
 * Sidebar reutilizable con menú, submenús desplegables y footer de usuario.
 * Estilos con Tailwind, tema claro.
 *
 * @param {string} title - Título del sidebar (ej: "Ferretería")
 * @param {string} roleLabel - Etiqueta del rol (ej: "SuperAdmin")
 * @param {Array} items - [{ id, label, icon }]
 * @param {Object} submenus - { [parentId]: [{ id, label }] } para ítems con hijos
 * @param {string} activeSection - id del ítem o sección activa
 * @param {Object} expanded - { [parentId]: boolean }
 * @param {Object} subsection - { [parentId]: string } id del hijo activo
 * @param {Function} onItemClick - (itemId) => void
 * @param {Function} onSubItemClick - (parentId, subId) => void
 * @param {Object} user - { nombre, apellido, correo }
 * @param {Function} onLogout - () => void
 * @param {string} className - Clases extra para el contenedor
 */
function Sidebar({
  title = "App",
  roleLabel = "",
  items = [],
  submenus = {},
  activeSection = "",
  expanded = {},
  subsection = {},
  onItemClick,
  onSubItemClick,
  user = {},
  onLogout,
  className = "",
}) {
  const hasChildren = (id) => submenus[id] && submenus[id].length > 0;

  return (
    <aside
      className={`flex flex-col w-72 h-screen max-h-screen shrink-0 shadow-xl rounded-r-2xl overflow-hidden bg-fondo ${className}`}
      aria-label="Menú principal"
    >
      {/* Header */}
      <div className="shrink-0 border-b border-menta-petroleo p-5">
        <h2 className="truncate text-lg font-semibold text-white drop-shadow-sm">
          {title}
        </h2>
        {roleLabel && (
          <p className="mt-0.5 text-sm text-white">{roleLabel}</p>
        )}
      </div>

      {/* Menu con scroll */}
      <nav className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-3">
        <ul className="space-y-0.5 px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isExpandable = hasChildren(item.id);
            const isExpanded = isExpandable && expanded[item.id];
            const isActive = activeSection === item.id;
            const activeSub = subsection[item.id];

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onItemClick?.(item.id)}
                  className={`
                    flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white
                    transition-all duration-200
                    ${isActive && !isExpandable
                      ? "bg-menta-petroleo shadow-md"
                      : "hover:bg-menta-petroleo"
                    }
                  `}
                >
                  {Icon && (
                    <span className="flex-shrink-0 text-menta-claro">
                      <Icon size={20} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {isExpandable && (
                    <span className="flex-shrink-0 text-menta-medio">
                      {isExpanded ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </span>
                  )}
                </button>

                {/* Submenu */}
                {isExpandable && isExpanded && submenus[item.id] && (
                  <ul className="mt-0.5 ml-4 space-y-0.5 border-l-2 border-menta-petroleo pl-3">
                    {submenus[item.id].map((sub) => {
                      const isSubActive = activeSub === sub.id;
                      return (
                        <li key={sub.id}>
                          <button
                            type="button"
                            onClick={() => onSubItemClick?.(item.id, sub.id)}
                            className={`
                              flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-white
                              transition-all duration-200
                              ${isSubActive
                                ? "bg-menta-petroleo font-medium"
                                : "hover:bg-menta-petroleo"
                              }
                            `}
                          >
                            {sub.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-menta-petroleo p-4">
        <div className="mb-3">
          <p className="truncate text-sm font-medium text-white">
            {user.nombre} {user.apellido}
          </p>
          <p className="truncate text-xs text-white">{user.correo}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-menta-turquesa bg-menta-petroleo px-3 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-menta-marino"
        >
          <span className="text-menta-medio">
            <LogOut size={18} />
          </span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
