<script setup>
import { computed, onMounted, ref } from 'vue'

import navigateIndicator from '../assets/images/navigate-indicator.svg'
import navigationBack from '../assets/images/navigation-back.svg'
import { accessibilityService } from '../services/accessibilityService.js'

const props = defineProps({
  facilityTypeId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['back'])

const facilityType = ref(null)
const facilityTypeIconMap = ref({})
const facilities = ref([])
const userLocation = ref({ latitude: null, longitude: null })

const nearbyFacilities = computed(() => {
  if (!facilities.value.length || !userLocation.value) {
    return []
  }

  return facilities.value
    .filter((facility) => facility.type_id === props.facilityTypeId && facility.is_active)
    .map((facility) => {
      const facilityTypeIcon = getFacilityTypeIcon()

      const distance = calculateDistance(
        userLocation.value.latitude,
        userLocation.value.longitude,
        facility.location.latitude,
        facility.location.longitude,
      )

      return {
        facilityTypeIcon,
        ...facility,
        distance: Math.round(distance),
        distanceText:
          distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`,
      }
    })
    .sort((a, b) => a.distance - b.distance)
})

const getFacilityTypeIcon = () => {
  const iconMapping = facilityTypeIconMap.value[props.facilityTypeId]
  if (!iconMapping) {
    return null
  }
  return {
    icon: new URL(`../assets/images/${iconMapping.icon}`, import.meta.url).href,
    alt: iconMapping.alt,
  }
}

/**
 * 计算两个地理坐标点之间的距离
 * 使用 Haversine 公式计算地球表面两点间的最短距离
 *
 * @param {number} latitude1 - 起点纬度
 * @param {number} longitude1 - 起点经度
 * @param {number} latitude2 - 终点纬度
 * @param {number} longitude2 - 终点经度
 * @returns {number} 两点间的距离(单位：米)
 *
 */
const calculateDistance = (latitude1, longitude1, latitude2, longitude2) => {
  // 地球半径(千米)
  const R = 6371

  // 将经纬度转换为弧度
  const dLatitude = ((latitude2 - latitude1) * Math.PI) / 180 // 纬度差
  const dLongitude = ((longitude2 - longitude1) * Math.PI) / 180 // 经度差

  // Haversine 公式计算
  const a =
    Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) + // 纬度差的正弦平方
    Math.cos((latitude1 * Math.PI) / 180) * // 起点纬度的余弦
      Math.cos((latitude2 * Math.PI) / 180) * // 终点纬度的余弦
      Math.sin(dLongitude / 2) * // 经度差的正弦
      Math.sin(dLongitude / 2) // 经度差的正弦

  // 计算大圆距离
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  // 将距离从千米转换为米
  const distance = R * c
  return distance * 1000
}

const fetchUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value.latitude = position.coords.latitude
        userLocation.value.longitude = position.coords.longitude
        console.log('获取到用户位置:', userLocation.value)
      },
      (error) => {
        console.warn('无法获取用户位置，使用默认值:', error)
      },
    )
  } else {
    console.warn('浏览器不支持地理位置，使用默认值')
  }
}

const fetchFacilitiesData = async () => {
  try {
    console.log('Loading facilities data for type:', props.facilityTypeId)

    const [facilityTypesResult, facilityIconMappingsResult, facilitiesResult] = await Promise.all([
      accessibilityService.getFacilityTypes(),
      accessibilityService.getFacilityIconMappings(),
      accessibilityService.getFacilities(),
    ])

    if (!facilityTypesResult.success) throw new Error(facilityTypesResult.message)
    if (!facilityIconMappingsResult.success) throw new Error(facilityIconMappingsResult.message)
    if (!facilitiesResult.success) throw new Error(facilitiesResult.message)

    const facilityTypes = facilityTypesResult.data.data.facility_types || []
    facilityType.value = facilityTypes.find((type) => type.id === props.facilityTypeId)

    facilityTypeIconMap.value = facilityIconMappingsResult.data || {}
    facilities.value = facilitiesResult.data.data.facilities || []

    console.log('Data loaded successfully:', {
      facilityType: facilityType.value?.name,
      facilityIcons: Object.keys(facilityTypeIconMap.value).length,
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
}

onMounted(() => {
  fetchUserLocation()
  fetchFacilitiesData()
})
</script>

<template>
  <div class="visual-facility-list-view">
    <div class="navigation-bar">
      <button class="navigation-back-button" @click="handleBack">
        <img :src="navigationBack" alt="返回" class="navigation-back-icon" />
      </button>
      <h1 class="navigation-title">{{ facilityType?.name || '设施列表' }}</h1>
    </div>

    <div class="scrollable-section">
      <div class="facility-list">
        <div
          v-for="item in nearbyFacilities"
          :key="item.id"
          class="facility-item"
          @click="handleFacilityClick(item)"
        >
          <img
            v-if="item.facilityTypeIcon"
            :src="item.facilityTypeIcon.icon"
            :alt="item.facilityTypeIcon.alt"
            class="facility-type-icon"
          />
          <span class="facility-name">{{ item.name }}</span>
          <span class="facility-distance">{{ item.distanceText }}</span>
          <img :src="navigateIndicator" alt="导航指示" class="facility-navigate-indicator-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visual-facility-list-view {
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

.scrollable-section {
  flex: 1;
  padding: 0 0 calc(env(safe-area-inset-bottom, 34px)) 0;
  overflow-y: auto;
}

.facility-list {
  display: flex;
  flex-direction: column;
  padding: 0 8px;
}

.facility-item {
  display: flex;
  position: relative;
  align-items: center;
  padding: 12px 8px;
}

.facility-item::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #1212124d;
  height: 1px;
  content: '';
}

.facility-item:last-child::after {
  display: none;
}

.facility-type-icon {
  width: 42px;
  height: 42px;
}

.facility-name {
  margin-left: 12px;
  color: #121212;
  font-weight: 400;
  font-size: 16px;
}

.facility-distance {
  margin-left: auto;
  color: #121212;
  font-weight: 400;
  font-size: 14px;
}

.facility-navigate-indicator-icon {
  margin-left: 4px;
}
</style>
