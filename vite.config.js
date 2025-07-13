import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/Practica/',
  // Плагины
  plugins: [
    vue(), // Основной плагин Vue
  ],
  build: {
    outDir: 'dist'
  },
  // Настройки разрешения модулей
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
