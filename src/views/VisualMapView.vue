<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

import navigationBack from '../assets/images/navigation-back.svg'
import userMarkerIcon from '../assets/images/user-marker.svg'
import { AMAP_CONFIG } from '../configs/amapConfig.js'
import { accessibilityService } from '../services/accessibilityService.js'
import { amapService } from '../services/amapService.js'

const emit = defineEmits(['back', 'navigateToVisualFacilityList'])

const facilityTypes = ref([])
const facilityTypeIconMap = ref({})
const userLocation = ref(null)

const availableFacilityTypes = computed(() => {
  if (!facilityTypes.value.length || !Object.keys(facilityTypeIconMap.value).length) {
    return []
  }

  return facilityTypes.value
    .filter((facilityType) => facilityType.is_active)
    .sort((a, b) => a.order - b.order)
    .map((facilityType) => {
      const iconMapping = facilityTypeIconMap.value[facilityType.id]
      if (!iconMapping) {
        console.warn(`Icon not found for facility type: ${facilityType.id}`)
        return null
      }

      return {
        id: facilityType.id,
        icon: new URL(`../assets/images/${iconMapping.icon}`, import.meta.url).href,
        alt: iconMapping.alt,
        name: facilityType.name,
        action: facilityType.id,
      }
    })
})

const fetchFacilityTypesData = async () => {
  try {
    console.log('Loading facility types data...')

    const [facilityTypesResult, facilityTypeIconMappingsResult] = await Promise.all([
      accessibilityService.getFacilityTypes(),
      accessibilityService.getFacilityIconMappings(),
    ])

    if (!facilityTypesResult.success) throw new Error(facilityTypesResult.message)
    if (!facilityTypeIconMappingsResult.success)
      throw new Error(facilityTypeIconMappingsResult.message)

    facilityTypes.value = facilityTypesResult.data.data.facility_types || []
    facilityTypeIconMap.value = facilityTypeIconMappingsResult.data || {}

    console.log('Data loaded successfully:', {
      facilityTypes: facilityTypes.value.length,
      facilityTypeIcons: Object.keys(facilityTypeIconMap.value).length,
    })
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

const initializeMap = async () => {
  try {
    await amapService.initializeMap('display-map')
    console.log('地图初始化完成')

    await getUserLocation()

    amapService.map.setCenter([userLocation.value.longitude, userLocation.value.latitude])
    amapService.map.setZoom(18)
  } catch (error) {
    console.error('展示地图初始化失败：', error)
  }
}

const getUserLocation = async () => {
  try {
    const location = await amapService.getCurrentPosition({
      showCircle: true,
      showMarker: true,
    })

    // 保存用户位置
    userLocation.value = location

    console.log('获取当前位置成功：', location)
  } catch (error) {
    console.error('获取当前位置失败：', error)
  }
}

const handleBack = () => {
  emit('back')
}

const handleFacilityTypeClick = (facilityType) => {
  console.log('点击设施类型:', facilityType)
  emit('navigateToVisualFacilityList', facilityType.action)
}

onMounted(() => {
  fetchFacilityTypesData()
  initializeMap()
})

onUnmounted(() => {
  amapService.destroy()
})
</script>

<template>
  <div class="visual-map-view">
    <div class="navigation-bar">
      <button class="navigation-back-button" @click="handleBack">
        <img :src="navigationBack" alt="返回" class="navigation-back-icon" />
      </button>
      <h1 class="navigation-title">视觉地图</h1>
    </div>

    <div class="map-section">
      <div id="display-map" style="width: 100%; height: 100%"></div>
    </div>

    <div class="facility-type-list-section">
      <div
        v-for="item in availableFacilityTypes"
        :key="item.id"
        class="facility-type-item"
        @click="handleFacilityTypeClick(item)"
      >
        <img :src="item.icon" :alt="item.alt" />
        <p class="facility-type-name">{{ item.name }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visual-map-view {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
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
  filter: brightness(0) invert(0) sepia(1) saturate(10000%) hue-rotate(0deg);
  height: 44px;
}

.navigation-title {
  position: absolute;
  left: 50%;
  flex: 1;
  transform: translateX(-50%);
  margin: 0;
  padding: 0;
  color: #121212;
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  text-align: center;
  white-space: nowrap;
}

.map-section {
  flex: 1;
  overflow: hidden;
}

.facility-type-list-section {
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 0;
  padding: 12px 0 calc(env(safe-area-inset-bottom) + 12px);
}

.facility-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.facility-type-name {
  margin: 0;
  color: #121212;
  font-weight: 500;
  font-size: 14px;
  text-align: center;
}
</style>
