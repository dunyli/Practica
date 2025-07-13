import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  // Базовый путь для деплоя на GitHub Pages
  base: '/Practica/',
  
  // Плагины
  plugins: [
    vue(), // Основной плагин Vue
    vueDevTools(), // Интеграция Vue DevTools
  ],

  // Настройки разрешения модулей
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // Алиас для src/
      '~': fileURLToPath(new URL('./node_modules', import.meta.url)) // Алиас для node_modules
    },
    extensions: ['.js', '.vue', '.json'] // Автодополнение расширений файлов
  },

  // Настройки сервера разработки
  server: {
    port: 3000, // Порт по умолчанию
    open: true, // Автоматически открывать браузер
    strictPort: true // Запрещать автоматический выбор порта
  },

  // Настройки сборки
  build: {
    outDir: 'dist', // Папка для сборки
    assetsDir: 'assets', // Папка для статики
    emptyOutDir: true, // Очищать папку перед сборкой
    sourcemap: true, // Генерация sourcemaps
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]', // Формат имен файлов
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },

  // Оптимизации
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'] // Предкомпиляция зависимостей
  }
})