import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const clientRoot = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  root: clientRoot,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: `${projectRoot}/dist`,
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
