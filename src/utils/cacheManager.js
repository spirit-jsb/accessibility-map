import { API_CONFIG } from '../configs/apiConfig.js'

class CacheManager {
  constructor() {
    this.cache = new Map()

    this.enabled = API_CONFIG.CACHE.ENABLED

    this.defaultTTL = API_CONFIG.CACHE.TTL
  }

  generateKey(key, params = {}) {
    if (Object.keys(params).length === 0) {
      return key
    }

    const paramString = Object.keys(params)
      .sort()
      .map((k) => `${k}:${params[k]}`)
      .join('|')
    return `${key}:${paramString}`
  }

  set(key, value, ttl = this.defaultTTL) {
    if (!this.enabled) return

    const expireTime = Date.now() + ttl
    this.cache.set(key, {
      value,
      expireTime,
    })
  }

  get(key) {
    if (!this.enabled) return null

    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expireTime) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  delete(key) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expireTime) {
        this.cache.delete(key)
      }
    }
  }

  getStats() {
    return {
      enabled: this.enabled,
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

export const cacheManager = new CacheManager()

if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup()
  }, 60000)
}

export default CacheManager
