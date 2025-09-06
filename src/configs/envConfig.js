import { getCurrentEnv, getEnvVar } from '../utils/envUtils.js'

export const ENV_CONFIG = {
  current: getCurrentEnv(),
  isDevelopment: getCurrentEnv() === 'development',
  isProduction: getCurrentEnv() === 'production',
  isTest: getCurrentEnv() === 'test',

  app: {
    title: getEnvVar('VITE_APP_TITLE', '无障碍地图网站'),
    version: getEnvVar('VITE_APP_VERSION', '0.0.0'),
    env: getCurrentEnv(),
  },

  debug: {
    enabled: getEnvVar('VITE_DEBUG_MODE', 'false') === 'true',
    logLevel: getEnvVar('VITE_LOG_LEVEL', 'info'),
    showConsole: getEnvVar('VITE_SHOW_CONSOLE', 'false') === 'true',
  },

  features: {
    enableMock: getEnvVar('VITE_ENABLE_MOCK', 'false') === 'true',
    enableHotReload: getEnvVar('VITE_ENABLE_HOT_RELOAD', 'true') === 'true',
    enableDevtools: getEnvVar('VITE_ENABLE_DEVTOOLS', 'false') === 'true',
  },

  security: {
    enableHttps: getEnvVar('VITE_ENABLE_HTTPS', 'false') === 'true',
  },
}

if (ENV_CONFIG.isProduction) {
  if (!ENV_CONFIG.debug.showConsole) {
    const preserveError = console.error
    const noop = () => {}

    Object.assign(console, {
      log: noop,
      info: noop,
      warn: noop,
      debug: noop,
      error: preserveError,
    })
  }
}
