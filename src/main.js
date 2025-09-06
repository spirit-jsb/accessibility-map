import App from './App.vue'
import { createApp } from 'vue'

import './assets/styles/style.css'
import { configManager } from './utils/configManager'

const initializeApp = async () => {
  try {
    const configInitialized = await configManager.initialize()

    if (!configInitialized) {
      console.error('❌ Failed to initialize config')
    }

    const app = createApp(App)
    app.mount('#app')

    console.log('✅ Application started successfully')
  } catch (error) {
    console.error('❌ Failed to start application:', error)
    createApp(App).mount('#app')
  }
}

initializeApp()
