<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

import logo from '../assets/images/logo.svg'
import navigateIndicator from '../assets/images/navigate-indicator.svg'
import navigationBack from '../assets/images/navigation-back.svg'
import { accessibilityService } from '../services/accessibilityService.js'
import { amapService } from '../services/amapService.js'

const props = defineProps({
  facilityTypeId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['back', 'navigateToSpeechNavigation'])

const facilityType = ref(null)
const facilities = ref([])
const userLocation = ref({ longitude: null, latitude: null })

const nearbyFacilities = computed(() => {
  if (!facilities.value.length || !userLocation.value.longitude || !userLocation.value.latitude) {
    return []
  }

  return facilities.value
    .filter((facility) => facility.type_id === props.facilityTypeId && facility.is_active)
    .map((facility) => {
      const distance = amapService.calculateDistance(
        [userLocation.value.longitude, userLocation.value.latitude],
        [facility.location.gcj02.longitude, facility.location.gcj02.latitude],
      )

      return {
        ...facility,
        distance: Math.round(distance),
        distanceText:
          distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`,
      }
    })
    .sort((a, b) => a.distance - b.distance)
})

const getUserLocation = async () => {
  try {
    const location = await amapService.getCurrentPosition()

    userLocation.value.longitude = location.longitude
    userLocation.value.latitude = location.latitude
  } catch (error) {
    console.error('获取用户位置失败：', error)
  }
}

const fetchFacilitiesData = async () => {
  try {
    console.log('Loading facilities data for type:', props.facilityTypeId)

    const [facilityTypesResult, facilitiesResult] = await Promise.all([
      accessibilityService.getFacilityTypes(),
      accessibilityService.getFacilities(),
    ])

    if (!facilityTypesResult.success) throw new Error(facilityTypesResult.message)
    if (!facilitiesResult.success) throw new Error(facilitiesResult.message)

    const facilityTypes = facilityTypesResult.data.data.facility_types || []
    facilityType.value = facilityTypes.find((type) => type.id === props.facilityTypeId)

    facilities.value = facilitiesResult.data.data.facilities || []

    console.log('Data loaded successfully:', {
      facilityType: facilityType.value?.name,
      facilities: facilities.value.length,
    })
  } catch (error) {
    console.error('Failed to load facilities data:', error)
  }
}

const handleBack = () => {
  emit('back')
}

const handleFacilityClick = (facility) => {
  console.log('点击设施:', facility)
  emit('navigateToSpeechNavigation', {
    facility: facility,
    userLocation: userLocation.value,
  })
}

onMounted(() => {
  fetchFacilitiesData()
  getUserLocation()
})

onUnmounted(() => {
  amapService.destroy()
})
</script>

<template>
  <div class="speech-facility-list-view">
    <div class="navigation-bar">
      <button class="navigation-back-button" @click="handleBack">
        <img :src="navigationBack" alt="返回" class="navigation-back-icon" />
      </button>
      <h1 class="navigation-title">{{ facilityType?.name || '设施列表' }}</h1>
    </div>

    <img :src="logo" alt="中国残疾人联合会" class="logo-image" />

    <div class="scrollable-section">
      <div class="facility-list">
        <div
          v-for="item in nearbyFacilities"
          :key="item.id"
          class="facility-item"
          @click="handleFacilityClick(item)"
        >
          <p class="facility-name">{{ item.name }}</p>
          <p class="facility-distance">{{ item.distanceText }}</p>
          <img :src="navigateIndicator" alt="导航指示" class="facility-navigate-indicator-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.speech-facility-list-view {
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

.facility-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 24px;
}

.facility-item {
  display: flex;
  align-items: center;
  border: 2px solid #ffffff;
  border-radius: 4px;
  padding: 16px 8px;
}

.facility-name {
  margin: 0;
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
}

.facility-distance {
  margin: 0;
  margin-left: auto;
  color: #ffffff;
  font-weight: 400;
  font-size: 14px;
}

.facility-navigate-indicator-icon {
  filter: brightness(0) invert(1);
  margin-left: 4px;
}
</style>
