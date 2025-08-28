<script setup>
// 主页面组件
import { ref } from 'vue'
import logoSvg from '../assets/images/logo.svg'
import visualMapIcon from '../assets/images/visual-map.svg'
import voiceMapIcon from '../assets/images/voice-map.svg'
import VisualMapView from './VisualMapView.vue'

// 当前显示的页面状态
const currentView = ref('home')

// 跳转到视觉地图页面
const goToVisualMap = () => {
  currentView.value = 'visualMap'
}

// 跳转到语音地图页面
const goToVoiceMap = () => {
  // 语音地图功能待实现
  console.log('跳转到语音地图')
}
</script>

<template>
  <!-- 主页面 -->
  <div v-if="currentView === 'home'" class="home-container">
    <div class="content">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <img :src="logoSvg" alt="无障碍地图" class="logo" />
      </div>
      
      <!-- 功能按钮区域 -->
      <div class="function-buttons">
        <div class="button-item" @click="goToVisualMap">
          <div class="function-btn">
            <img :src="visualMapIcon" alt="视觉地图" class="btn-icon" />
          </div>
          <span class="btn-label">视觉地图</span>
        </div>
        
        <div class="button-item" @click="goToVoiceMap">
          <div class="function-btn">
            <img :src="voiceMapIcon" alt="语音地图" class="btn-icon" />
          </div>
          <span class="btn-label">语音地图</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 视觉地图页面 -->
  <VisualMapView v-else-if="currentView === 'visualMap'" @back="currentView = 'home'" />
</template>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background-color: #121212;
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 40px;
  position: relative;
}

.logo-section {
  margin: 40px 0 48px;
}

.logo {
  width: 68px;
  height: 68px;
}

.function-buttons {
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

.function-btn {
  width: 80px;
  height: 80px;
  border: 2.5px solid #FFFFFF;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px 12px;
}

.btn-icon {
  width: 56px;
  height: 56px;
}

.btn-label {
  font-size: 20px;
  font-weight: bold;
  font-style: normal;
  color: #FFFFFF;
}

/* 响应式 */
@media (max-width: 480px) {
  .content { padding: 0 0 30px; }
  .logo { width: 56px; height: 56px; }
  .logo-section { margin: 32px 0 40px; }
  .function-buttons { gap: 40px; }
  .function-btn { width: 70px; height: 70px; }
  .btn-icon { width: 32px; height: 32px; }
  .btn-label { font-size: 14px; }
}

@media (max-width: 375px) {
  .logo { width: 48px; height: 48px; }
  .logo-section { margin: 28px 0 36px; }
  .function-buttons { gap: 30px; }
  .function-btn { width: 60px; height: 60px; }
  .btn-icon { width: 28px; height: 28px; }
  .btn-label { font-size: 13px; }
}

@media (max-height: 600px) {
  .content { padding: 0 0 20px; }
  .logo-section { margin: 24px 0 32px; }
}
</style>