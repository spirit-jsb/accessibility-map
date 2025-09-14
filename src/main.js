import App from './App.vue'
import { createApp } from 'vue'

import './assets/styles/style.css'
import { configManager } from './utils/configManager'
import { debugManager } from './utils/debugManager'

const initializeApp = async () => {
  try {
    // 初始化调试工具（仅在开发环境）
    await debugManager.initialize()
    
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
