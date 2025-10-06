export const AMAP_CONFIG = {
  KEY: 'a9aa947c93ad67825b56a885f514a75f',

  SECURITY_JS_CODE: '4fc32bfbf3f9dc7f870c22eb498f43b7',

  VERSION: '2.0',

  PLUGINS: ['AMap.Geolocation', 'AMap.Walking'],

  MAP: {
    DEFAULT_ZOOM: 18,
  },

  GEOLOCATION: {
    CONVERT: true,
    ENABLE_HIGH_ACCURACY: true,
    TIMEOUT: 10000,
    MAXIMUM_AGE: 60000,
    SHOW_BUTTON: false,
    PAN_TO_LOCATION: true,
    ZOOM_TO_ACCURACY: true,
    NEED_ADDRESS: true,
  },

  NAVIGATION: {
    ROUTE_COLOR: '#0088FF',
    ROUTE_WIDTH: 8,
  },

  SPEECH: {
    ENABLED: true,
    LANG: 'zh-CN',
    RATE: 1.0,
    VOLUME: 1.0,
  },
}

export default AMAP_CONFIG
