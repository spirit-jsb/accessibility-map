import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), basicSsl()],
  server: {
    https: true, // 启用 https
    host: true, // 允许局域网访问
  },
})
