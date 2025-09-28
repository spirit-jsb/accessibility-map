import { API_CONFIG } from '../configs/apiConfig.js'
import { dataLoader } from '../utils/dataLoader.js'
import { amapService } from './amapService.js'

class AccessibilityService {
  constructor() {
    this.dataLoader = dataLoader
  }

  async getFacilityCategories(useCache = true) {
    try {
      const data = await this.dataLoader.loadData(
        API_CONFIG.API.ENDPOINTS.FACILITY_CATEGORIES,
        API_CONFIG.STATIC.ENDPOINTS.FACILITY_CATEGORIES,
        API_CONFIG.CACHE.KEYS.FACILITY_CATEGORIES,
        useCache,
      )

      return {
        success: true,
        data: data,
        message: 'Facility categories loaded successfully',
      }
    } catch (error) {
      console.error('Failed to load facility categories:', error)
      return {
        success: false,
        data: null,
        message: `Failed to load facility categories: ${error.message}`,
      }
    }
  }

  async getFacilityTypes(useCache = true) {
    try {
      const data = await this.dataLoader.loadData(
        API_CONFIG.API.ENDPOINTS.FACILITY_TYPES,
        API_CONFIG.STATIC.ENDPOINTS.LABOR_PARK_FACILITY_TYPES,
        API_CONFIG.CACHE.KEYS.LABOR_PARK_FACILITY_TYPES,
        useCache,
      )

      return {
        success: true,
        data: data,
        message: 'Facility types loaded successfully',
      }
    } catch (error) {
      console.error('Failed to load facility types:', error)
      return {
        success: false,
        data: null,
        message: `Failed to load facility types: ${error.message}`,
      }
    }
  }

  async getFacilityIconMappings(useCache = true) {
    try {
      const data = await this.dataLoader.loadData(
        API_CONFIG.API.ENDPOINTS.FACILITY_ICON_MAPPINGS,
        API_CONFIG.STATIC.ENDPOINTS.LABOR_PARK_FACILITY_ICON_MAPPINGS,
        API_CONFIG.CACHE.KEYS.LABOR_PARK_FACILITY_ICON_MAPPINGS,
        useCache,
      )

      return {
        success: true,
        data: data,
        message: 'Facility icon mappings loaded successfully',
      }
    } catch (error) {
      console.error('Failed to load facility icon mappings:', error)
      return {
        success: false,
        data: null,
        message: `Failed to load facility icon mappings: ${error.message}`,
      }
    }
  }

  async getFacilities(useCache = true) {
    try {
      const data = await this.dataLoader.loadData(
        API_CONFIG.API.ENDPOINTS.FACILITIES,
        API_CONFIG.STATIC.ENDPOINTS.LABOR_PARK_FACILITIES,
        API_CONFIG.CACHE.KEYS.LABOR_PARK_FACILITIES,
        useCache,
      )

      if (data && data.data && data.data.facilities) {
        for (const facility of data.data.facilities) {
          if (facility.location && facility.location.latitude && facility.location.longitude) {
            try {
              const [convertedLongitude, convertedLatitude] = await amapService.convertCoordinate(
                facility.location.longitude,
                facility.location.latitude,
              )

              facility.location.longitude = convertedLongitude
              facility.location.latitude = convertedLatitude
            } catch (error) {
              console.warn(`设施${facility.name}坐标转换失败`)
            }
          } else {
            console.log(`设施${facility.name}没有有效的坐标数据`)
          }
        }
      } else {
        console.log('未找到有效的设施数据或设施列表为空')
      }

      return {
        success: true,
        data: data,
        message: 'Facilities loaded successfully',
      }
    } catch (error) {
      console.error('Failed to load facilities:', error)
      return {
        success: false,
        data: null,
        message: `Failed to load facilities: ${error.message}`,
      }
    }
  }

  setDataSource(dataSource) {
    this.dataLoader.setDataSource(dataSource)
  }
}

export const accessibilityService = new AccessibilityService()

export default AccessibilityService
