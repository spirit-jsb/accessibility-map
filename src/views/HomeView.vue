<script setup>
import SpeechFacilityListView from './SpeechFacilityListView.vue'
import SpeechMapView from './SpeechMapView.vue'
import VisualFacilityListView from './VisualFacilityListView.vue'
import VisualMapView from './VisualMapView.vue'
import { ref } from 'vue'

import logo from '../assets/images/logo.svg'
import speechMap from '../assets/images/speech-map.svg'
import visualMap from '../assets/images/visual-map.svg'

const currentView = ref('home')
const selectedFacilityTypeId = ref(null)

const handleNavigateToVisualMap = () => {
  currentView.value = 'visualMap'
}

const handleNavigateToSpeechMap = () => {
  currentView.value = 'speechMap'
}

const handleNavigateToVisualFacilityList = (facilityTypeId) => {
  selectedFacilityTypeId.value = facilityTypeId
  currentView.value = 'visualFacilityList'
}

const handleNavigateToSpeechFacilityList = (facilityTypeId) => {
  selectedFacilityTypeId.value = facilityTypeId
  currentView.value = 'speechFacilityList'
}

const handleBackToVisualMap = () => {
  currentView.value = 'visualMap'
}

const handleBackToSpeechMap = () => {
  currentView.value = 'speechMap'
}
</script>

<template>
  <div v-if="currentView === 'home'" class="home-view">
    <div class="navigation-bar"></div>

    <img :src="logo" alt="中国残疾人联合会" class="logo-image" />

    <div class="function-section">
      <div class="function-item" @click="handleNavigateToVisualMap">
        <img :src="visualMap" alt="视觉地图" class="function-icon" />
        <span class="function-name">视觉地图</span>
      </div>

      <div class="function-item" @click="handleNavigateToSpeechMap">
        <img :src="speechMap" alt="语音地图" class="function-icon" />
        <span class="function-name">语音地图</span>
      </div>
    </div>
  </div>

  <VisualMapView
    v-else-if="currentView === 'visualMap'"
    @back="currentView = 'home'"
    @navigateToVisualFacilityList="handleNavigateToVisualFacilityList"
  />

  <SpeechMapView
    v-else-if="currentView === 'speechMap'"
    @back="currentView = 'home'"
    @navigateToSpeechFacilityList="handleNavigateToSpeechFacilityList"
  />

  <VisualFacilityListView
    v-else-if="currentView === 'visualFacilityList'"
    :facility-type-id="selectedFacilityTypeId"
    @back="handleBackToVisualMap"
  />

  <SpeechFacilityListView
    v-else-if="currentView === 'speechFacilityList'"
    :facility-type-id="selectedFacilityTypeId"
    @back="handleBackToSpeechMap"
  />
</template>

<style scoped>
.home-view {
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
  height: 44px;
}

.logo-image {
  margin: 12px auto;
  width: 68px;
  height: 68px;
}

.function-section {
  display: flex;
  position: absolute;
  top: 50%;
  left: 50%;
  align-items: center;
  gap: 72px;
  transform: translate(-50%, -50%);
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.function-icon {
  border: 2.5px solid #ffffff;
  border-radius: 8px;
  padding: 8px 12px;
}

.function-name {
  color: #ffffff;
  font-weight: bold;
  font-size: 20px;
  text-align: center;
}
</style>
