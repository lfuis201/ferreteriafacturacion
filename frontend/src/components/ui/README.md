# Componentes UI reutilizables (Tailwind)

## Input

Input con **icono opcional a la derecha** (Lucide/Heroicons) y soporte para error.

```jsx
import { Input } from "@/components/ui";
import { Mail, Search } from "lucide-react";

// Básico
<Input placeholder="Correo" name="email" />

// Con icono a la derecha
<Input
  placeholder="Buscar..."
  iconRight={<Search className="w-5 h-5" />}
/>

// Con error (borde rojo + mensaje)
<Input error="El correo no es válido" placeholder="Correo" />

// Con ref (para react-hook-form, etc.)
<Input ref={registerRef} name="correo" />
```

Props: todas las de `<input>` nativo + `iconRight`, `error`, `className`.

---

## Button

Botón con **loading** (spinner) e **icono opcional a la derecha**.

```jsx
import { Button } from "@/components/ui";
import { ArrowRight, Save } from "lucide-react";

// Primario con loading
<Button loading={isSubmitting} type="submit">
  Guardar
</Button>

// Con icono a la derecha
<Button iconRight={<ArrowRight className="w-4 h-4" />}>
  Siguiente
</Button>

// Variantes: primary | secondary | outline | ghost | danger
<Button variant="outline">Cancelar</Button>

// Tamaños: sm | md | lg
<Button size="lg">Entrar</Button>

// Ancho completo
<Button fullWidth>Enviar</Button>
```

Props: `loading`, `iconRight`, `variant`, `size`, `fullWidth`, `className`, `children`, y las de `<button>`.
