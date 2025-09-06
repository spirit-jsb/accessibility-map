import { API_CONFIG } from '../configs/apiConfig.js'
import { cacheManager } from './cacheManager.js'
import { httpClient } from './httpClient.js'

class DataLoader {
  constructor() {
    this.dataSource = API_CONFIG.DATA_SOURCE
    this.staticPath = API_CONFIG.STATIC.BASE_PATH
  }

  async loadFromeAPI(endpoint) {
    try {
      return await httpClient.get(endpoint)
    } catch (error) {
      console.error(`Failed to load from API: ${endpoint}`, error)
      throw error
    }
  }

  async loadFromStatic(endpoint) {
    const fullPath = this.staticPath ? `${this.staticPath}${endpoint}` : endpoint

    try {
      const result = await fetch(fullPath)
      return result.json()
    } catch (error) {
      console.error(`Failed to load from static: ${fullPath}`, error)
      throw error
    }
  }

  async loadData(apiEndpoint, staticEndpoint, cacheKey, useCache = true) {
    if (useCache) {
      const cached = cacheManager.get(cacheKey)
      if (cached) return cached
    }

    const loadAPI = async () => {
      const data = await this.loadFromAPI(apiEndpoint)
      if (useCache) cacheManager.set(cacheKey, data)
      return data
    }

    const loadStatic = async () => {
      const data = await this.loadFromStatic(staticEndpoint)
      if (useCache) cacheManager.set(cacheKey, data)
      return data
    }

    return this.dataSource === 'api' ? loadAPI() : loadStatic()
  }

  setDataSource(mode) {
    if (['api', 'static'].includes(mode)) this.dataSource = mode
    else console.warn(`Invalid data source mode: ${mode}`)
  }

  getDataSource() {
    return this.dataSource
  }
}

export const dataLoader = new DataLoader()

export default DataLoader
