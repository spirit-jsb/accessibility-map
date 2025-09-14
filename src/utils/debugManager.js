class DebugManager {
  constructor() {
    this.vConsole = null
    this.isInitialized = false
  }

  async initialize() {
    if (this.isInitialized) return

    if (import.meta.env.DEV) {
      const isDebugEnabled = import.meta.env.VITE_DEBUG_MODE === 'true'
      if (isDebugEnabled) {
        await this.loadVConsole()
      }
    }

    this.isInitialized = true
  }

  async loadVConsole() {
    if (this.vConsole) return

    if (import.meta.env.PROD) {
      console.warn('vConsole should not be loaded in production')
      return
    }

    try {
      const vconsole = await import('vconsole')

      this.vConsole = new vconsole.default({
        theme: 'light',
        defaultPlugins: ['system', 'network', 'element', 'storage'],
        maxLogNumber: 1000,
        onReady: () => {
          console.log('✅ vConsole is ready')
        },
        onClearLog: () => {
          console.log('🗑️ vConsole log cleared')
        },
      })

      console.log('✅ vConsole loaded for development')

      this.addCustomCommands()
    } catch (error) {
      console.warn('⚠️ Failed to load vConsole:', error)
    }
  }

  addCustomCommands() {
    if (!this.vConsole) return

    window.clearAppCache = () => {
      localStorage.clear()
      sessionStorage.clear()
      console.log('🧹 App cache cleared')
    }

    console.log('🛠️ Available debug commands:')
    console.log('  clearAppCache() - Clear application cache')
  }

  destroy() {
    if (this.vConsole) {
      this.vConsole.destroy()
      this.vConsole = null
    }
  }

  getVConsole() {
    return this.vConsole
  }
}

const debugManager = new DebugManager()

export { debugManager }
