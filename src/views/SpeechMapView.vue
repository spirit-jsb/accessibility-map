<script setup>
import { computed, onMounted, ref } from 'vue'

import logo from '../assets/images/logo.svg'
import navigationBack from '../assets/images/navigation-back.svg'
import { accessibilityService } from '../services/accessibilityService.js'

const emit = defineEmits(['back', 'navigateToSpeechFacilityList'])

const facilityTypes = ref([])
const facilityIconMap = ref({})
const userPosition = ref({
  latitude: null,
  longitude: null,
  locationName: '未知地点',
  heading: 0,
  directionText: '北',
})

const facilityItems = computed(() => {
  return facilityTypes.value.map((type) => ({
    id: type.id,
    text: `查看附近的${type.name}`,
    action: type.id,
  }))
})

const fetchUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userPosition.value.latitude = position.coords.latitude
        userPosition.value.longitude = position.coords.longitude
        console.log('获取到用户位置:', userPosition.value)
      },
      (error) => {
        console.warn('无法获取用户位置，使用默认值:', error)
      },
    )
  } else {
    console.warn('浏览器不支持地理位置，使用默认值')
  }
}

const listenToDeviceHeading = async () => {
  // iOS Safari 需要权限
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    try {
      const permission = await DeviceOrientationEvent.requestPermission()
      if (permission !== 'granted') {
        console.warn('用户未授权访问方向数据')
        return
      }
    } catch (err) {
      console.error('请求方向权限失败:', err)
      return
    }
  }

  if (window.DeviceOrientationEvent) {
    window.addEventListener(
      'deviceorientation',
      (event) => {
        let heading
        if (typeof event.webkitCompassHeading !== 'undefined') {
          heading = event.webkitCompassHeading // iOS Safari
        } else {
          heading = 360 - event.alpha // 兜底
        }

        userPosition.value.heading = heading

        const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
        const index = Math.round(heading / 45) % 8
        userPosition.value.directionText = directions[index]
      },
      true,
    )
  } else {
    console.error('浏览器不支持设备方向检测')
  }
}

const fetchFacilityData = async () => {
  try {
    console.log('Loading facility data...')

    const [typesResult, iconsResult] = await Promise.all([
      accessibilityService.getFacilityTypes(),
      accessibilityService.getFacilityIconMappings(),
    ])

    if (!typesResult.success) throw new Error(typesResult.message)
    if (!iconsResult.success) throw new Error(iconsResult.message)

    facilityTypes.value = typesResult.data.data.facility_types || []
    facilityIconMap.value = iconsResult.data || {}

    console.log('Data loaded:', {
      facilityTypes: facilityTypes.value.length,
      facilityIcons: Object.keys(facilityIconMap.value).length,
    })
  } catch (error) {
    console.error('Error loading facility data:', error)
  }
}

const onBack = () => {
  emit('back')
}

const onFunctionItemClick = (item) => {
  console.log('点击功能按钮:', item)
}

onMounted(() => {
  fetchUserLocation()
  listenToDeviceHeading()
  fetchFacilityData()
})
</script>

<template>
  <div class="speech-map-view">
    <div class="navigation-bar">
      <button class="navigation-back-button" @click="onBack">
        <img :src="navigationBack" alt="返回" class="navigation-back-icon" />
      </button>
    </div>

    <div class="logo-section">
      <img :src="logo" alt="中国残疾人联合会" class="logo-image" />
    </div>

    <div class="scrollable-container">
      <div class="scrollable-content">
        <div class="position-section">
          <div class="position-grid">
            <div class="location-item">
              <div class="location-content">
                <div class="location-label">当前位置：</div>
                <div class="location-value marquee-container">
                  <span class="marquee-location-text">
                    <template v-if="userPosition.longitude && userPosition.latitude">
                      经度{{ userPosition.longitude }} 纬度{{ userPosition.latitude }}
                    </template>
                    <template v-else> 正在定位... </template>
                  </span>
                </div>
              </div>
            </div>
            <div class="direction-item">
              <div class="direction-content">
                <div class="direction-label">当前方向：</div>
                <div class="direction-value">{{ userPosition.directionText }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="function-section">
          <div class="function-grid">
            <div
              v-for="(item, index) in facilityItems"
              :key="item.id"
              class="function-item"
              @click="onFunctionItemClick(item)"
            >
              <div class="function-content">
                <div class="function-text">{{ item.text }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.speech-map-view {
  display: flex;
  flex-direction: column;
  background-color: #121212;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.navigation-bar {
  display: flex;
  position: relative;
  align-items: center;
  z-index: 99;
  background-color: transparent;
  padding: 0;
}

.navigation-back-button {
  border: none;
  background: none;
}

.navigation-back-icon {
  filter: brightness(0) invert(1);
}

.logo-section {
  display: flex;
  justify-content: center;
}

.logo-image {
  width: 68px;
  height: 68px;
}

.scrollable-container {
  flex: 1;
  padding: 48px 24px calc(env(safe-area-inset-bottom, 34px)) 24px;
  overflow-y: auto;
}

.scrollable-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.position-section {
}

.position-grid {
  display: flex;
  flex-direction: row;
  gap: 24px;
}

.location-item {
  flex: 1; /* 占据剩余宽度 */
  border: 2px solid #ffffff;
  border-radius: 4px;
  padding: 16px 8px;
  min-width: 0; /* 防止内容溢出 */
}

.direction-item {
  display: inline-flex; /* 宽度随内容变化 */
  flex: 0; /* 不再拉伸 */
  border: 2px solid #ffffff;
  border-radius: 4px;
  padding: 16px 8px;
}

.location-content,
.direction-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
}

.location-label,
.direction-label {
  flex-shrink: 0;
  color: #ffffff;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  text-align: left;
  white-space: nowrap;
}

.location-value,
.direction-value {
  color: #ffffff;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  text-align: left;
  white-space: nowrap;
}

.marquee-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.marquee-location-text {
  display: inline-block;
  animation: marquee 10s linear infinite;
  white-space: nowrap;
}

@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.marquee-container:hover .marquee-location-text {
  animation-play-state: paused;
}

.function-section {
}

.function-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.function-item {
  border: 2px solid #ffffff;
  border-radius: 4px;
  padding: 16px 8px;
  width: 100%;
}

.function-content {
  display: flex;
}

.function-text {
  color: #ffffff;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  text-align: left
}
</style>
