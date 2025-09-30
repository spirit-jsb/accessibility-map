import AMapLoader from '@amap/amap-jsapi-loader'

import { AMAP_CONFIG } from '../configs/amapConfig.js'

class AmapService {
  constructor() {
    this.amap = null
    this.map = null
    this.geolocation = null
    this.walking = null

    this.speechSynthesis = window.speechSynthesis

    this.currentPosition = null
    this.currentDeviceOrientation = null

    this.intervalListeningId = null

    this.deviceOrientationListener = null

    this.markers = []
    this.polylines = []

    this.isAMapLoaded = false
    this.isMapReady = false
  }

  async loadAMapAPI() {
    if (this.isAMapLoaded && this.amap) {
      return this.map
    }

    window._AMapSecurityConfig = {
      securityJsCode: AMAP_CONFIG.SECURITY_JS_CODE,
    }

    try {
      console.log('高德地图 JS API 开始加载...')

      this.amap = await AMapLoader.load({
        key: AMAP_CONFIG.KEY,
        version: AMAP_CONFIG.VERSION,
        plugins: AMAP_CONFIG.PLUGINS,
      })

      this.isAMapLoaded = true

      console.log('高德地图 JS API 加载成功')

      return this.amap
    } catch (error) {
      console.error('高德地图 JS API 加载失败：', error)
      throw new Error(`高德地图 JS API 加载失败：${error.message}`)
    }
  }

  async initializeMap(container, options = {}) {
    if (!this.amap) {
      await this.loadAMapAPI()
    }

    try {
      console.log('地图初始化...')

      const mapOptions = {
        zoom: options.zoom || AMAP_CONFIG.MAP.DEFAULT_ZOOM,
        ...options,
      }

      this.map = new this.amap.Map(container, mapOptions)

      this.isMapReady = true

      console.log('地图初始化成功')

      return this.map
    } catch (error) {
      console.error('地图初始化失败：', error)
      throw new Error(`地图初始化失败：${error.message}`)
    }
  }

  async getCurrentPosition(options = {}) {
    if (!this.amap) {
      await this.loadAMapAPI()
    }

    return new Promise((resolve, reject) => {
      try {
        this.geolocation = new this.amap.Geolocation({
          convert: AMAP_CONFIG.GEOLOCATION.CONVERT,
          enableHighAccuracy: AMAP_CONFIG.GEOLOCATION.ENABLE_HIGH_ACCURACY,
          timeout: AMAP_CONFIG.GEOLOCATION.TIMEOUT,
          maximumAge: AMAP_CONFIG.GEOLOCATION.MAXIMUM_AGE,
          showButton: AMAP_CONFIG.GEOLOCATION.SHOW_BUTTON,
          panToLocation: AMAP_CONFIG.GEOLOCATION.PAN_TO_LOCATION,
          zoomToAccuracy: AMAP_CONFIG.GEOLOCATION.ZOOM_TO_ACCURACY,
          needAddress: AMAP_CONFIG.GEOLOCATION.NEED_ADDRESS,
          ...options,
        })

        this.geolocation.getCurrentPosition((status, result) => {
          if (status === 'complete' && result.info === 'SUCCESS') {
            this.currentPosition = {
              longitude: result.position.lng,
              latitude: result.position.lat,
              accuracy: result.accuracy,
              addressComponent: result.addressComponent,
              address: result.formattedAddress,
            }

            console.log('获取当前位置成功：', this.currentPosition)
            resolve(this.currentPosition)
          } else {
            console.error('获取当前位置失败：', result.info)
            reject(new Error(`获取当前位置失败：${result.info}`))
          }
        })

        if (this.map && options.mode !== 'navigation') {
          this.map.addControl(this.geolocation)
        }

        const mode = options.mode || 'normal'
      } catch (error) {
        console.error('获取当前位置失败：', error)
        reject(new Error(`获取当前位置失败：${error.message}`))
      }
    })
  }

  startNavigationModeListeningPosition(callback, options = {}) {
    return this.listeningPosition(callback, {
      mode: 'navigation',
      ...options,
    })
  }

  startNormalModeListeningPosition(callback, options = {}) {
    return this.listeningPosition(callback, {
      mode: 'normal',
      ...options,
    })
  }

  startPowerSavingModeListeningPosition(callback, options = {}) {
    return this.listeningPosition(callback, {
      mode: 'power-saving',
      ...options,
    })
  }

  async listeningPosition(callback, options = {}) {
    const mode = options.mode || 'normal' // 'navigation', 'normal', 'power-saving'

    const listeningInterval =
      options.mode === 'navigation'
        ? 2000
        : options.mode === 'normal'
          ? 5000
          : options.mode === 'power-saving'
            ? 15000
            : 5000
    const listeningThreshold =
      options.mode === 'navigation'
        ? 2
        : options.mode === 'normal'
          ? 5
          : options.mode === 'power-saving'
            ? 10
            : 5

    this.clearPositionListener()

    this.intervalListeningId = setInterval(async () => {
      try {
        const listeningPosition = await this.getCurrentPosition({
          showCircle: mode !== 'navigation',
          showMarker: mode !== 'navigation',
          panToLocation: mode !== 'navigation',
          ...options,
        })

        if (this.shouldUpdatePosition(listeningPosition, listeningThreshold)) {
          this.currentPosition = listeningPosition

          callback(listeningPosition, null)
        }
      } catch (error) {
        console.error('监听位置获取失败：', error)
        callback(null, new Error(`监听位置获取失败：${error.message}`))
      }
    }, listeningInterval)

    try {
      const initialPosition = await this.getCurrentPosition({
        showCircle: mode !== 'navigation',
        showMarker: mode !== 'navigation',
        ...options,
      })

      this.currentPosition = initialPosition

      callback(initialPosition, null)
    } catch (error) {
      console.error('初始位置获取失败：', error)
      callback(null, new Error(`初始位置获取失败：${error.message}`))
    }
  }

  shouldUpdatePosition(newPosition, threshold = 5) {
    if (!this.currentPosition) {
      return true
    }

    const distance = this.calculateDistance(
      [this.currentPosition.longitude, this.currentPosition.latitude],
      [newPosition.longitude, newPosition.latitude],
    )

    return distance >= threshold
  }

  clearPositionListener() {
    if (this.intervalListeningId) {
      clearInterval(this.intervalListeningId)
      this.intervalListeningId = null
    }
  }

  async startListeningDeviceOrientation(callback) {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const permissionResult = await DeviceOrientationEvent.requestPermission()

        if (permissionResult !== 'granted') {
          console.error('用户未授权设备方向权限')
          callback(null, new Error(`用户未授权设备方向权限`))
          return
        }
      } catch (error) {
        console.error('iOS 设备方向权限请求失败：', error)
        callback(null, new Error(`iOS 设备方向权限请求失败：${error}`))
        return
      }
    }

    this.deviceOrientationListener = (event) => {
      let heading
      if (typeof event.webkitCompassHeading !== 'undefined') {
        heading = event.webkitCompassHeading
      } else {
        heading = 360 - event.alpha
      }

      this.currentDeviceOrientation = {
        deviceHeading: heading,
      }

      if (typeof callback === 'function') {
        callback(this.currentDeviceOrientation, null)
      }
    }
  }

  clearDeviceOrientationListener() {
    if (this.deviceOrientationListener) {
      window.removeEventListener('deviceorientation', this.deviceOrientationListener, true)

      this.deviceOrientationListener = null
    }
  }

  async planningWalkingRoute(start, end) {
    if (!this.amap) {
      await this.loadAMapAPI()
    }

    return new Promise((resolve, reject) => {
      try {
        this.walking = new this.amap.Walking()

        this.walking.search(start, end, (status, result) => {
          console.log(`${result.info} ${status}`)
          if (status === 'complete' && result.info === 'ok') {
            console.log('步行路线规划成功：', result)
            resolve(this.formatWalkingResult(result))
          } else {
            console.error('步行路线规划失败：', result.message)
            reject(new Error(`步行路线规划失败：${result.message}`))
          }
        })
      } catch (error) {
        console.error('步行路线规划失败：', error)
        reject(new Error(`步行路线规划失败：${error.message}`))
      }
    })
  }

  formatWalkingResult(result) {
    const route = result.routes[0]
    if (!route) return null

    const steps = route.steps.map((step, index) => ({
      index: index + 1,
      instruction: step.instruction,
      distance: step.distance,
      time: step.time,
      path: step.path.map((point) => [point.lng, point.lat]),
      action: step.action,
      orientation: step.orientation,
      road: step.road,
    }))

    return {
      distance: route.distance,
      time: route.time,
      steps: steps,
    }
  }

  addMarker(position, options = {}) {
    if (!this.amap || !this.map) {
      return null
    }

    const marker = new this.amap.Marker({
      position: position,
      content: options.content || '',
      title: options.title || '',
      ...options,
    })

    this.map.add(marker)
    this.markers.push(marker)

    return marker
  }

  clearMarkers() {
    if (this.markers.length > 0) {
      this.map.remove(this.markers)
      this.markers = []
    }
  }

  addPolyline(path, options = {}) {
    if (!this.amap || !this.map || !path || path.length === 0) {
      return null
    }

    const polyline = new this.amap.Polyline({
      path: path,
      strokeColor: options.routeColor || AMAP_CONFIG.NAVIGATION.ROUTE_COLOR,
      strokeOpacity: options.strokeOpacity || 0.8,
      strokeWeight: options.routeWeight || AMAP_CONFIG.NAVIGATION.ROUTE_WIDTH,
      ...options,
    })

    this.map.add(polyline)
    this.polylines.push(polyline)

    return polyline
  }

  clearPolylines() {
    if (this.polylines.length > 0) {
      this.map.remove(this.polylines)
      this.polylines = []
    }
  }

  async convertCoordinates(coordinates) {
    if (!this.amap) {
      await this.loadAMapAPI()
    }

    const convertedCoordinates = coordinates.map(
      (coordinate) => new this.amap.LngLat(coordinate.longitude, coordinate.latitude),
    )

    return new Promise((resolve, reject) => {
      try {
        this.amap.convertFrom(convertedCoordinates, 'gps', (status, result) => {
          if (status === 'complete' && result.info === 'ok') {
            const convertedResult = result.locations.map((location) => ({
              longitude: location.lng,
              latitude: location.lat,
            }))
            resolve(convertedResult)
          } else {
            console.error('坐标系转换失败：', result.info)
            reject(new Error(`坐标系转换失败：${result.info}`))
          }
        })
      } catch (error) {
        console.error('坐标系转换失败：', error)
        reject(new Error(`坐标系转换失败：${error.message}`))
      }
    })
  }

  manualConvertCoordinate(longitude, latitude) {
    var a = 6378245.0
    var ee = 0.00669342162296594323

    if (this.isOutOfChina(longitude, latitude)) {
      return [longitude, latitude]
    }

    var dlat = this.transformLatitude(longitude - 105.0, latitude - 35.0)
    var dlng = this.transformLongitude(longitude - 105.0, latitude - 35.0)

    const radlat = (latitude / 180.0) * Math.PI

    var magic = Math.sin(radlat)
    magic = 1 - ee * magic * magic

    const sqrtmagic = Math.sqrt(magic)

    dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * Math.PI)
    dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * Math.PI)

    const mglat = latitude + dlat
    const mglng = longitude + dlng

    return [mglng, mglat]
  }

  isOutOfChina(longitude, latitude) {
    return !(longitude > 73.66 && longitude < 135.05 && latitude > 3.86 && latitude < 53.55)
  }

  transformLongitude(longitude, latitude) {
    var ret =
      300.0 +
      longitude +
      2.0 * latitude +
      0.1 * longitude * longitude +
      0.1 * longitude * latitude +
      0.1 * Math.sqrt(Math.abs(longitude))
    ret +=
      ((20.0 * Math.sin(6.0 * longitude * Math.PI) + 20.0 * Math.sin(2.0 * longitude * Math.PI)) *
        2.0) /
      3.0
    ret +=
      ((20.0 * Math.sin(longitude * Math.PI) + 40.0 * Math.sin((longitude / 3.0) * Math.PI)) *
        2.0) /
      3.0
    ret +=
      ((150.0 * Math.sin((longitude / 12.0) * Math.PI) +
        300.0 * Math.sin((longitude / 30.0) * Math.PI)) *
        2.0) /
      3.0
    return ret
  }

  transformLatitude(longitude, latitude) {
    var ret =
      -100.0 +
      2.0 * longitude +
      3.0 * latitude +
      0.2 * latitude * latitude +
      0.1 * longitude * latitude +
      0.2 * Math.sqrt(Math.abs(longitude))
    ret +=
      ((20.0 * Math.sin(6.0 * longitude * Math.PI) + 20.0 * Math.sin(2.0 * longitude * Math.PI)) *
        2.0) /
      3.0
    ret +=
      ((20.0 * Math.sin(latitude * Math.PI) + 40.0 * Math.sin((latitude / 3.0) * Math.PI)) * 2.0) /
      3.0
    ret +=
      ((160.0 * Math.sin((latitude / 12.0) * Math.PI) +
        320 * Math.sin((latitude * Math.PI) / 30.0)) *
        2.0) /
      3.0
    return ret
  }

  calculateDistance(point1, point2) {
    if (!this.amap) {
      console.error('高德地图 JS API 未加载')
      return 0
    }

    console.log('Calculating distance between points:', point1, point2)

    const lngLat1 = new this.amap.LngLat(point1[0], point1[1])
    const lngLat2 = new this.amap.LngLat(point2[0], point2[1])

    return Math.round(lngLat1.distance(lngLat2))
  }

  speak(text, options = {}) {
    if (!this.speechSynthesis || !AMAP_CONFIG.SPEECH.ENABLED) {
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = options.lang || AMAP_CONFIG.SPEECH.LANG
    utterance.rate = options.rate || AMAP_CONFIG.SPEECH.RATE
    utterance.volume = options.volume || AMAP_CONFIG.SPEECH.VOLUME

    if (typeof options.onEnd === 'function') {
      utterance.onend = () => {
        options.onEnd()
      }
    }

    this.speechSynthesis.speak(utterance)
  }

  destroy() {
    this.clearPositionListener()
    this.clearDeviceOrientationListener()

    this.clearMarkers()
    this.clearPolylines()

    if (this.map) {
      this.map.destroy()
      this.map = null
    }

    this.geolocation = null
    this.walking = null

    this.currentPosition = null
    this.currentDeviceOrientation = null

    this.isMapReady = false
  }
}

export const amapService = new AmapService()

export default AmapService
