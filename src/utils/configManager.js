import { API_CONFIG } from '../configs/apiConfig.js'
import { ENV_CONFIG } from '../configs/envConfig.js'
import { getConfigSummary, validateConfig } from './configUtils.js'

class ConfigManager {
  constructor() {
    this.envConfig = ENV_CONFIG
    this.apiConfig = API_CONFIG
    this.initialized = false
  }

  async initialize() {
    const { isValid } = validateConfig(this.envConfig, this.apiConfig)
    if (!isValid) {
      console.error('❌ Initialization aborted due to config errors.')
      return false
    }

    this.setupGlobalConfig(this.envConfig, this.apiConfig)

    this.logConfigSummary(this.envConfig, this.apiConfig)

    this.initialized = true
    return true
  }

  setupGlobalConfig(env, api) {
    if (typeof window === 'undefined') return

    window.__APP_CONFIG__ = {
      app: {
        name: env.app.title,
        version: env.app.version,
      },
      env: env.current,
      api: {
        dataSource: api.DATA_SOURCE,
        baseUrl: api.BASE_URL || 'Static files',
      },
    }

    if (env.isDevelopment && env.debug.enabled) {
      window.__DEBUG__ = getConfigSummary(env, api)
    }
  }

  logConfigSummary(env, api) {
    const summary = getConfigSummary(env, api)

    console.group('🔧 Environment Summary')
    console.table({
      'App Name': summary.app.name,
      Version: summary.app.version,
      Environment: summary.env.name,
      'Debug Mode': summary.debug.enabled ? 'Enabled' : 'Disabled',
      'Log Level': summary.debug.logLevel,
      'Data Source': summary.data.source,
      'API URL': summary.data.apiUrl,
      Cache: summary.cache.enabled ? 'Enabled' : 'Disabled',
    })
    console.groupEnd()

    if (this.envConfig.isDevelopment && this.envConfig.debug.enabled) {
      console.group('🔍 Detailed Configuration')

      console.group('🎚️ Feature Flags')
      console.table({
        'Mock Data': summary.features.mockData ? 'Enabled' : 'Disabled',
        'Hot Reload': summary.features.hotReload ? 'Enabled' : 'Disabled',
        'Dev Tools': summary.features.devTools ? 'Enabled' : 'Disabled',
      })
      console.groupEnd()

      console.group('🔒 Security')
      console.table({
        'HTTPS Enabled': summary.security.httpsEnabled ? 'Yes' : 'No',
      })
      console.groupEnd()

      if (summary.data.source === 'api') {
        console.group('🔗 API Configuration')
        console.table({
          Timeout: `${summary.api.timeout} ms`,
          'Cache TTL': `${summary.cache.ttl} ms`,
          'Retry Attempts': summary.retry?.maxAttempts,
          'Retry Delay': `${summary.retry?.delay} ms`,
        })
        console.groupEnd()
      }

      console.groupEnd()
    }
  }
}

export const configManager = new ConfigManager()

export default ConfigManager
