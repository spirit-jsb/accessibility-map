export function validateConfig(env, api) {
  const issues = []
  const warnings = []

  const RULES = [
    {
      check: () => api.DATA_SOURCE === 'api' && !api.BASE_URL,
      message: 'API mode requires BASE_URL.',
    },
    {
      check: () => env.isProduction && !env.security.enableHttps && api.DATA_SOURCE === 'api',
      message: 'HTTPS must be enabled in production when using API mode.',
    },
    {
      check: () => api.CACHE.ENABLED && !api.CACHE.TTL,
      message: 'CACHE.TTL is required when cache is enabled.',
    },
    {
      check: () => env.isProduction && env.features.enableMock,
      message: 'Mock data must be disabled in production.',
    },
  ]

  for (const rule of RULES) {
    if (rule.check()) {
      issues.push(rule.message)
    }
  }

  if (env.isDevelopment && api.CACHE.ENABLED) {
    warnings.push('Cache is enabled in development, which may affect debugging.')
  }

  if (warnings.length) {
    console.warn('⚠️ Config Warnings:')
    warnings.forEach((w) => console.warn(`  - ${w}`))
  }

  if (issues.length) {
    console.error('❌ Config Validation Failed:')
    issues.forEach((i) => console.error(`  - ${i}`))
  } else {
    console.log('✅ Config validation passed.')
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  }
}

export function getConfigSummary(env, api) {
  return {
    app: {
      name: env.app.title,
      version: env.app.version,
    },
    env: {
      name: env.current,
      timestamp: new Date().toISOString(),
    },
    debug: {
      enabled: env.debug.enabled,
      logLevel: env.debug.logLevel,
      showConsole: env.debug.showConsole,
    },
    data: {
      source: api.DATA_SOURCE,
      apiUrl: api.API.BASE_URL || 'Static files',
    },
    cache: {
      enabled: api.CACHE.ENABLED,
      ttl: api.CACHE.TTL,
    },
    features: {
      mockData: env.features.enableMock,
      hotReload: env.features.enableHotReload,
      devTools: env.features.enableDevtools,
    },
    security: {
      httpsEnabled: env.security.enableHttps,
    },
    api: {
      timeout: api.API.TIMEOUT,
    },
    retry:
      api.DATA_SOURCE === 'api'
        ? {
            enabled: api.RETRY.ENABLED,
            maxAttempts: api.RETRY.MAX_ATTEMPTS,
            delay: api.RETRY.DELAY,
          }
        : null,
  }
}
