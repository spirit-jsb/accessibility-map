<script setup>
import { computed, onMounted, ref } from 'vue'

import navigationBack from '../assets/images/navigation-back.svg'
import { accessibilityService } from '../services/accessibilityService.js'

const emit = defineEmits(['back', 'navigateToVisualFacilityList'])

const facilityTypes = ref([])
const facilityIconMappings = ref({})

const bottomFunctionItems = computed(() => {
  if (!facilityTypes.value.length || !Object.keys(facilityIconMappings.value).length) {
    return []
  }

  return [...facilityTypes.value]
    .sort((a, b) => a.order - b.order)
    .map((facilityType) => {
      const iconMapping = facilityIconMappings.value[facilityType.id]
      if (!iconMapping) {
        console.warn(`Icon not found for facility: ${facilityType.id}`)
        return null
      }

      return {
        id: facilityType.id,
        icon: new URL(`../assets/images/${iconMapping.icon}`, import.meta.url).href,
        alt: iconMapping.alt,
        label: iconMapping.label,
        description: facilityType.description,
      }
    })
    .filter(Boolean)
})

const loadFacilityData = async () => {
  try {
    console.log('Loading facility data...')

    const [facilityTypesResult, facilityIconMappingsResult] = await Promise.all([
      accessibilityService.getFacilityTypes(),
      accessibilityService.getFacilityIconMappings(),
    ])

    if (!facilityTypesResult.success) {
      throw new Error(facilityTypesResult.message)
    }

    if (!facilityIconMappingsResult.success) {
      throw new Error(facilityIconMappingsResult.message)
    }

    facilityTypes.value = facilityTypesResult.data.data.facility_types || []
    facilityIconMappings.value = facilityIconMappingsResult.data || {}

    console.log('Data loaded successfully:', {
      facilityTypes: facilityTypes.value.length,
      facilityIcons: Object.keys(facilityIconMappings.value).length,
    })
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

const handleBack = () => {
  emit('back')
}

const handleBottomFunctionItemClick = (item) => {
  console.log('点击功能按钮:', {
    id: item.id,
    label: item.label,
    description: item.description,
  })

  emit('navigateToVisualFacilityList', item.id)
}

onMounted(() => {
  loadFacilityData()
})
</script>

<template>
  <div class="visual-map-view">
    <div class="navigation-bar">
      <button class="navigation-back-button" @click="handleBack">
        <img :src="navigationBack" alt="返回" class="navigation-back-icon" />
      </button>
    </div>

    <div class="map-container-view"></div>

    <div class="bottom-function-container-view">
      <div class="bottom-function-grid">
        <div
          v-for="(item, index) in bottomFunctionItems"
          :key="item.id || index"
          class="bottom-function-item"
          @click="handleBottomFunctionItemClick(item)"
        >
          <img :src="item.icon" :alt="item.alt" class="bottom-function-item-icon" />
          <span class="bottom-function-item-label">{{ item.label }}</span>
        </div>
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
  border: none;
  background: none;
}

.navigation-back-icon {
  filter: brightness(0) saturate(100%) invert(7%) sepia(0%) saturate(0%) hue-rotate(0deg)
    brightness(95%) contrast(86%);
}

.map-container-view {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.bottom-function-container-view {
  padding: 0;
}

.bottom-function-grid {
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 0;
  margin: 12px 0px calc(env(safe-area-inset-bottom, 34px) + 12px) 0px;
  width: 100%;
}

.bottom-function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.bottom-function-item-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
}

.bottom-function-item-label {
  color: #121212;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  text-align: center;
}
</style>
