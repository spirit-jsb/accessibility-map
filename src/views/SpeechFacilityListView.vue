<script setup>
import { computed, onMounted, ref } from 'vue'

import logo from '../assets/images/logo.svg'
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
const facilities = ref([])
const userLocation = ref({ latitude: null, longitude: null })

const nearbyFacilities = computed(() => {
  if (!facilities.value.length || !userLocation.value) {
    return []
  }

  return facilities.value
    .filter((facility) => facility.type_id === props.facilityTypeId && facility.is_active)
    .map((facility) => {
      const distance = calculateDistance(
        userLocation.value.latitude,
        userLocation.value.longitude,
        facility.location.latitude,
        facility.location.longitude,
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
}

onMounted(() => {
  fetchUserLocation()
  fetchFacilitiesData()
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
          :data-type="item.type_id"
          @click="handleFacilityClick(item)"
        >
          <div class="facility-name">{{ item.name }}</div>
          <span class="facility-distance">{{ item.distanceText }}</span>
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
  border: none;
  background: none;
}

.navigation-back-icon {
  filter: brightness(0) invert(1);
}

.navigation-title {
  position: absolute;
  left: 50%;
  flex: 1;
  transform: translateX(-50%);
  margin: 0;
  padding: 0;
  color: #ffffff;
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  text-align: center;
  white-space: nowrap;
}

.logo-image {
  display: block;
  margin: 12px auto;
  width: 68px;
  height: 68px;
}

.scrollable-section {
  flex: 1;
  padding: 0 0 calc(env(safe-area-inset-bottom, 34px)) 0;
  overflow-y: auto;
}

.facility-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.facility-item {
  display: flex;
  justify-items: center;
  border: 2px solid #ffffff;
  border-radius: 4px;
  padding: 16px 8px;
  width: 100%;
}

.facility-name {
  color: #ffffff;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  text-align: left;
}

.facility-distance {
  margin-left: auto;
  color: #ffffff;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  text-align: left;
}

.facility-navigate-indicator-icon {
  filter: brightness(0) invert(1);
  margin-left: 4px;
}
</style>
