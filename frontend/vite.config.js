import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Importante para rutas relativas
  server: {
  // Opciones para permitir hosts
  allowedHosts: [
    'md-invoice-apt-bernard.trycloudflare.com', // Añade el host específico
    'localhost', // Generalmente se incluye localhost
    '.trycloudflare.com' // O usa un comodín para subdominios
  ]
}
})
