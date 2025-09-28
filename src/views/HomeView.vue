<script setup>
import { ref } from 'vue'

import logo from '../assets/images/logo.svg'
import speechMap from '../assets/images/speech-map.svg'
import visualMap from '../assets/images/visual-map.svg'

const emit = defineEmits(['navigateToVisualMap', 'navigateToSpeechMap'])

const handleNavigateToVisualMap = () => {
  emit('navigateToVisualMap')
}

const handleNavigateToSpeechMap = () => {
  emit('navigateToSpeechMap')
}
</script>

<template>
  <div class="home-view">
    <div class="navigation-bar"></div>

    <img :src="logo" alt="中国残疾人联合会" class="logo-image" />

    <div class="function-section">
      <div class="function-item" @click="handleNavigateToVisualMap">
        <img :src="visualMap" alt="视觉地图" class="function-icon" />
        <p class="function-name">视觉地图</p>
      </div>

      <div class="function-item" @click="handleNavigateToSpeechMap">
        <img :src="speechMap" alt="语音地图" class="function-icon" />
        <p class="function-name">语音地图</p>
      </div>
    </div>
  </div>
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
  margin: 0;
  color: #ffffff;
  font-weight: bold;
  font-size: 20px;
  text-align: center;
}
</style>
