<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

import logo from '../assets/images/logo.svg'
import navigationBack from '../assets/images/navigation-back.svg'
import { accessibilityService } from '../services/accessibilityService.js'
import { amapService } from '../services/amapService.js'

const emit = defineEmits(['back', 'navigateToSpeechFacilityList'])

const facilityTypes = ref([])
const userLocation = ref({
  latitude: null,
  longitude: null,
  locationName: '获取位置中...',
  heading: 0,
  directionText: '北',
})

const availableFacilityTypes = computed(() => {
  if (!facilityTypes.value.length) return []

  return facilityTypes.value
    .filter((facilityType) => facilityType.is_active)
    .sort((a, b) => a.order - b.order)
    .map((facilityType) => ({
      id: facilityType.id,
      name: `查看附近的${facilityType.name}`,
      action: facilityType.id,
    }))
})

const fetchFacilityTypesData = async () => {
  try {
    console.log('Loading facility type data...')

    const facilityTypesResult = await accessibilityService.getFacilityTypes()

    if (!facilityTypesResult.success) throw new Error(facilityTypesResult.message)

    facilityTypes.value = facilityTypesResult.data.data.facility_types || []

    console.log('Data loaded successfully:', { facilityTypes: facilityTypes.value.length })
  } catch (error) {
    console.error('Failed to load facility type data:', error)
  }
}

const getUserLocation = async () => {
  try {
    const location = await amapService.getCurrentPosition()

    userLocation.value.latitude = location.latitude
    userLocation.value.longitude = location.longitude
    userLocation.value.locationName = location.address
  } catch (error) {
    console.error('获取用户位置失败：', error)
  }
}

const handleBack = () => {
  emit('back')
}

const handleFacilityTypeClick = (facilityType) => {
  emit('navigateToSpeechFacilityList', facilityType.action)
}

onMounted(() => {
  fetchFacilityTypesData()
  getUserLocation()
})

onUnmounted(() => {
  amapService.destroy()
})
</script>

<template>
  <div class="speech-map-view">
    <div class="navigation-bar">
      <button class="navigation-back-button" @click="handleBack">
        <img :src="navigationBack" alt="返回" class="navigation-back-icon" />
      </button>
      <h1 class="navigation-title">语音地图</h1>
    </div>

    <img :src="logo" alt="中国残疾人联合会" class="logo-image" />

    <div class="scrollable-section">
      <div class="scrollable-content">
        <div class="position-infomation">
          <div class="location-item">
            <p class="location-label">当前位置：</p>
            <div class="marquee-container">
              <p class="location-value">
                <template v-if="userLocation.locationName !== '获取位置中...'">
                  {{ userLocation.locationName }}
                </template>
                <template v-else> 获取位置中... </template>
              </p>
            </div>
          </div>
          <div class="direction-item">
            <p class="direction-label">当前方向：</p>
            <p class="direction-value">{{ userLocation.directionText }}</p>
          </div>
        </div>

        <div class="facility-type-list">
          <div
            v-for="item in availableFacilityTypes"
            :key="item.id"
            class="facility-type-item"
            @click="handleFacilityTypeClick(item)"
          >
            <p class="facility-type-name">{{ item.name }}</p>
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
  padding: 0 0 calc(env(safe-area-inset-bottom)) 0;
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
  margin: 0;
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
  white-space: nowrap;
}

.location-value,
.direction-value {
  margin: 0;
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
  margin: 0;
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
}
</style>
