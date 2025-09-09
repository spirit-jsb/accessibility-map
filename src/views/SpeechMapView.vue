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

const availableFacilityTypes = computed(() => {
  return facilityTypes.value
    .filter((facilityType) => facilityType.is_active)
    .map((facilityType) => ({
      id: facilityType.id,
      name: `查看附近的${facilityType.name}`,
      action: facilityType.id,
    }))
})

const fetchUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userPosition.value.latitude = position.coords.latitude
        userPosition.value.longitude = position.coords.longitude
        console.log('获取到用户位置:', userPosition.value.latitude, userPosition.value.longitude)
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

const fetchFacilityTypesData = async () => {
  try {
    console.log('Loading facility type data...')

    const [facilityTypesResult, facilityIconMappingsResult] = await Promise.all([
      accessibilityService.getFacilityTypes(),
      accessibilityService.getFacilityIconMappings(),
    ])

    if (!facilityTypesResult.success) throw new Error(facilityTypesResult.message)
    if (!facilityIconMappingsResult.success) throw new Error(facilityIconMappingsResult.message)

    facilityTypes.value = facilityTypesResult.data.data.facility_types || []
    facilityIconMap.value = facilityIconMappingsResult.data || {}

    console.log('Data loaded successfully:', {
      facilityTypes: facilityTypes.value.length,
      facilityIcons: Object.keys(facilityIconMap.value).length,
    })
  } catch (error) {
    console.error('Failed to load facility type data:', error)
  }
}

const handleBack = () => {
  emit('back')
}

const handleFacilityTypeClick = (facilityType) => {
  emit('navigateToSpeechFacilityList', facilityType.action)
}

onMounted(() => {
  fetchUserLocation()
  listenToDeviceHeading()
  fetchFacilityTypesData()
})
</script>

<template>
  <div class="speech-map-view">
    <div class="navigation-bar">
      <button class="navigation-back-button" @click="handleBack">
        <img :src="navigationBack" alt="返回" class="navigation-back-icon" />
      </button>
      <div class="navigation-title">语音地图</div>
    </div>

    <img :src="logo" alt="中国残疾人联合会" class="logo-image" />

    <div class="scrollable-section">
      <div class="scrollable-content">
        <div class="position-infomation">
          <div class="location-item">
            <div class="location-label">当前位置：</div>
            <div class="marquee-container">
              <span class="location-value">
                <template v-if="userPosition.longitude && userPosition.latitude">
                  经度{{ userPosition.longitude }} 纬度{{ userPosition.latitude }}
                </template>
                <template v-else> 正在定位... </template>
              </span>
            </div>
          </div>
          <div class="direction-item">
            <div class="direction-label">当前方向：</div>
            <span class="direction-value">{{ userPosition.directionText }}</span>
          </div>
        </div>

        <div class="facility-type-list">
          <div
            v-for="item in availableFacilityTypes"
            :key="item.id"
            class="facility-type-item"
            @click="handleFacilityTypeClick(item)"
          >
            <span class="facility-type-name">{{ item.name }}</span>
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
  display: flex;
  border: none;
  background: none;
  padding: 0 6px;
}

.navigation-back-icon {
  filter: brightness(0) invert(1);
  height: 44px;
}

.navigation-title {
  position: absolute;
  left: 50%;
  flex: 1;
  transform: translateX(-50%);
  margin: 0;
  padding: 0;
  color: #ffffff;
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  text-align: center;
  white-space: nowrap;
}

.logo-image {
  margin: 12px auto;
  width: 68px;
  height: 68px;
}

.scrollable-section {
  flex: 1;
  padding: 0 0 calc(env(safe-area-inset-bottom, 34px)) 0;
  overflow-y: auto;
}

.scrollable-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 0;
}

.position-infomation {
  display: flex;
  gap: 24px;
  padding: 0 24px;
}

.location-item {
  display: flex;
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

.location-label,
.direction-label {
  flex-shrink: 0;
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
  white-space: nowrap;
}

.location-value,
.direction-value {
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
  white-space: nowrap;
}

.location-value {
  display: inline-block;
  animation: marquee 10s linear infinite;
}

.marquee-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.facility-type-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0px 24px;
}

.facility-type-item {
  display: flex;
  align-items: center;
  border: 2px solid #ffffff;
  border-radius: 4px;
  padding: 16px 8px;
}

.facility-type-name {
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
}
</style>
