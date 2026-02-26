/**
 * Tema de la app: paleta Menta / Petróleo + fondo (#0e0146)
 * Nombres semánticos (sin números). Colores en tailwind.css (@theme).
 *
 * Fondos:  bg-fondo | bg-menta-claro | bg-menta-suave | ...
 * Textos:  text-menta-claro | text-menta-petroleo | text-menta-marino | ...
 * Bordes:  border-menta-turquesa | border-fondo | ...
 */

export const hex = {
  fondo: '#0e0146',
  mentaClaro: '#C5FDD3',
  mentaSuave: '#94E1B4',
  mentaMedio: '#69C5A0',
  mentaEsmeralda: '#45A994',
  mentaTurquesa: '#288D8A',
  mentaPetroleo: '#126171',
  mentaMarino: '#033B51',
};

/** Clases de fondo reutilizables */
export const bg = {
  fondo: 'bg-fondo',
  mentaClaro: 'bg-menta-claro',
  mentaSuave: 'bg-menta-suave',
  mentaMedio: 'bg-menta-medio',
  mentaEsmeralda: 'bg-menta-esmeralda',
  mentaTurquesa: 'bg-menta-turquesa',
  mentaPetroleo: 'bg-menta-petroleo',
  mentaMarino: 'bg-menta-marino',
};

/** Clases de texto reutilizables */
export const text = {
  fondo: 'text-fondo',
  mentaClaro: 'text-menta-claro',
  mentaSuave: 'text-menta-suave',
  mentaMedio: 'text-menta-medio',
  mentaEsmeralda: 'text-menta-esmeralda',
  mentaTurquesa: 'text-menta-turquesa',
  mentaPetroleo: 'text-menta-petroleo',
  mentaMarino: 'text-menta-marino',
};

/** Clases de borde reutilizables */
export const border = {
  fondo: 'border-fondo',
  mentaClaro: 'border-menta-claro',
  mentaSuave: 'border-menta-suave',
  mentaMedio: 'border-menta-medio',
  mentaEsmeralda: 'border-menta-esmeralda',
  mentaTurquesa: 'border-menta-turquesa',
  mentaPetroleo: 'border-menta-petroleo',
  mentaMarino: 'border-menta-marino',
};

/** Clases compuestas (botones, cards, sidebar) */
export const themeClasses = {
  btnPrimary: 'bg-menta-petroleo text-menta-claro hover:bg-menta-marino focus:ring-menta-turquesa',
  btnSecondary: 'bg-menta-suave text-menta-marino hover:bg-menta-medio border border-menta-esmeralda',
  cardMenta: 'bg-white border border-menta-medio rounded-xl shadow-sm',
  sectionLight: 'bg-menta-claro',
  sidebar: 'bg-fondo text-menta-claro',
  headerNavy: 'bg-menta-marino text-menta-claro',
};
