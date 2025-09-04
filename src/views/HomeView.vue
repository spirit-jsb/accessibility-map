<script setup>
import { ref } from "vue";

import VisualFacilityListView from "./VisualFacilityListView.vue";
import VisualMapView from "./VisualMapView.vue";
import logo from "../assets/images/logo.svg";
import speechMap from "../assets/images/speech-map.svg";
import visualMap from "../assets/images/visual-map.svg";

const currentView = ref("home");
const selectedFacilityTypeId = ref(null);

const goToVisualMap = () => {
  currentView.value = "visualMap";
};

const goToSpeechMap = () => {
  console.log("跳转到语音地图");
};

const handleNavigateToVisualFacilityList = (facilityTypeId) => {
  selectedFacilityTypeId.value = facilityTypeId;
  currentView.value = "visualFacilityList";
};

const handleBackToVisualMap = () => {
  currentView.value = "visualMap";
};
</script>

<template>
  <div v-if="currentView === 'home'" class="home-screen">
    <div class="content">
      <div class="logo-section">
        <img :src="logo" alt="中国残疾人联合会" class="logo" />
      </div>

      <div class="function-buttons-section">
        <div class="button-item" @click="goToVisualMap">
          <div class="button-icon-wrapper">
            <img :src="visualMap" alt="视觉地图" class="button-icon" />
          </div>
          <span class="button-name">视觉地图</span>
        </div>

        <div class="button-item" @click="goToSpeechMap">
          <div class="button-icon-wrapper">
            <img :src="speechMap" alt="语音地图" class="button-icon" />
          </div>
          <span class="button-name">语音地图</span>
        </div>
      </div>
    </div>
  </div>

  <VisualMapView
    v-else-if="currentView === 'visualMap'"
    @back="currentView = 'home'"
    @navigateToVisualFacilityList="handleNavigateToVisualFacilityList"
  />

  <VisualFacilityListView
    v-else-if="currentView === 'visualFacilityList'"
    :facility-type-id="selectedFacilityTypeId"
    @back="handleBackToVisualMap"
  />
</template>

<style scoped>
.home-screen {
  width: 100%;
  min-height: 100vh;
  background-color: #121212;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-section {
  margin: 40px 0px 0px;
}

.logo {
  width: 68px;
  height: 68px;
}

.function-buttons-section {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 72px;
  align-items: center;
}

.button-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.button-icon-wrapper {
  border: 2.5px solid #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.button-icon {
  width: 56px;
  height: 56px;
  margin: 8px 12px;
}

.button-name {
  font-weight: bold;
  font-size: 20px;
  color: #ffffff;
  text-align: center;
  font-style: normal;
  text-transform: none;
}
</style>
