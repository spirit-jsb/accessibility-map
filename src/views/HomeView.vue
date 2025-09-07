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
    <div class="content-container-view">
      <img :src="logo" alt="中国残疾人联合会" class="logo" />

      <div class="function-container-view">
        <div class="function-item" @click="handleNavigateToVisualMap">
          <div class="function-item-icon-wrapper">
            <img :src="visualMap" alt="视觉地图" class="function-item-icon" />
          </div>
          <span class="function-item-label">视觉地图</span>
        </div>

        <div class="function-item" @click="handleNavigateToSpeechMap">
          <div class="function-item-icon-wrapper">
            <img :src="speechMap" alt="语音地图" class="function-item-icon" />
          </div>
          <span class="function-item-label">语音地图</span>
        </div>
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

.content-container-view {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  margin: 40px 0px 0px;
  width: 68px;
  height: 68px;
}

.function-container-view {
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

.function-item-icon-wrapper {
  display: flex;
  align-items: center;
  border: 2.5px solid #ffffff;
  border-radius: 8px;
}

.function-item-icon {
  margin: 8px 12px;
  width: 56px;
  height: 56px;
}

.function-item-label {
  color: #ffffff;
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  text-align: center;
}
</style>
