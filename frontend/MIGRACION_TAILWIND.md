# Migración a Tailwind CSS

El proyecto tiene **Tailwind v4** instalado y más de **100 archivos CSS** propios. Esta guía explica cómo convivir con ambos y migrar poco a poco.

---

## Estado actual

- **Tailwind** está activo: las clases de Tailwind (ej. `flex`, `p-4`, `bg-blue-500`, `rounded-lg`) ya se pueden usar en cualquier componente.
- Los **CSS actuales** siguen funcionando: no hace falta borrarlos para usar Tailwind.
- Estrategia recomendada: **migración gradual** (componente a componente).

---

## Cómo migrar un componente

### Opción A: Solo añadir Tailwind (sin tocar el CSS)

En cualquier JSX puedes usar clases de Tailwind junto con las que ya tengas:

```jsx
<div className="mi-clase-del-css flex items-center gap-2 p-4 rounded-lg">
  ...
</div>
```

No quites el `import` del CSS del componente; déjalo hasta que ese archivo CSS deje de ser necesario.

### Opción B: Sustituir estilos por Tailwind

1. Abre el componente (ej. `LoginUsuario.jsx`).
2. Sustituye clases o estilos inline por clases de Tailwind.
   - Ejemplo: `<div className="login-container">` con estilos en `LoginUsuario.css` → `<div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">`.
3. Cuando ese componente ya no use nada del archivo CSS asociado, quita el `import` del CSS en el `.jsx`.
4. Si el archivo CSS queda vacío o solo con cosas que Tailwind no cubre (keyframes, temas), puedes borrarlo o dejarlo para esos casos.

### Equivalencias rápidas (CSS → Tailwind)

| CSS | Tailwind |
|-----|----------|
| `display: flex` | `flex` |
| `justify-content: center` | `justify-center` |
| `align-items: center` | `items-center` |
| `padding: 1rem` | `p-4` |
| `margin: 0 auto` | `mx-auto` |
| `border-radius: 8px` | `rounded-lg` |
| `background: #3b82f6` | `bg-blue-500` |
| `color: white` | `text-white` |
| `font-weight: bold` | `font-bold` |
| `gap: 0.5rem` | `gap-2` |
| `width: 100%` | `w-full` |
| `max-width: 1280px` | `max-w-7xl` |

Documentación completa: [tailwindcss.com/docs](https://tailwindcss.com/docs).

---

## Orden sugerido para migrar

1. **Páginas nuevas**: hazlas solo con Tailwind.
2. **Componentes pequeños**: Login, formularios simples, modales.
3. **Listas y tablas**: sustituir contenedores, espaciados y tipografía por Tailwind.
4. **Dashboards y pantallas grandes**: al final, cuando ya domines las clases en el proyecto.

No hace falta migrar todo; puedes dejar CSS propio para cosas muy específicas (animaciones, prints, temas muy custom).

---

## Si un estilo no existe en Tailwind

- **Clase arbitraria**: `className="w-[237px]"` o `className="bg-[#1a1a2e]"`.
- **Estilos que se repiten**: definirlos en `index.css` o en un CSS que importes en `main.jsx` usando `@layer components` (Tailwind v4) o una clase normal y usarla junto con Tailwind.

---

## Resumen

- Tailwind ya está activo en todo el proyecto.
- Sigue usando tus CSS actuales; añade Tailwind donde quieras.
- Migra de a poco: componente a componente, quitando el CSS cuando ya no lo uses.
- Para dudas de clases: [Tailwind CSS Docs](https://tailwindcss.com/docs).
