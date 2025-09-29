import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const config = {
    plugins: [vue(), basicSsl()],
  }

  if (mode === 'development') {
    config.server = {
      https: true,
      host: true,
    }
  } else if (mode === 'test') {
    config.base = '/dev/accessibility-map/'
  } else if (mode === 'production') {
    config.base = '/accessibility-map/'
  }

  return config
})
