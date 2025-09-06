export const getEnvVar = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue
}

export const getCurrentEnv = () => {
  const env = getEnvVar('VITE_APP_ENV')
  if (env) return env

  if (import.meta.env.DEV) return 'development'
  if (import.meta.env.PROD) return 'production'
  return 'development'
}
