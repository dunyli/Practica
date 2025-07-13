import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Инициализация приложения
const initApp = async () => {
  try {
    const app = createApp(App)
    app.use(createPinia())
    app.mount('#app')
  } catch (error) {
    console.error('Application initialization failed:', error)
  }
}

initApp()