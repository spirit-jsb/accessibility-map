<script setup>
// 视觉地图页面组件
import navigationBackIcon from '../assets/images/navigation-back.svg'
import entranceExitIcon from '../assets/images/entrance-exit.svg'
import sharedAssistiveAidsIcon from '../assets/images/shared-assistive-aids.svg'
import parkAudioGuideIcon from '../assets/images/park-audio-guide.svg'
import loveStationIcon from '../assets/images/love-station.svg'
import voiceGuideDeviceIcon from '../assets/images/voice-guide-device.svg'
import plantBrailleSignIcon from '../assets/images/plant-braille-sign.svg'
import infoCorridorIcon from '../assets/images/info-corridor.svg'
import toiletAccessibleIcon from '../assets/images/toilet-accessible.svg'

// 定义事件
const emit = defineEmits(['back'])

// 功能按钮数据
const functionButtons = [
  { icon: entranceExitIcon, label: '出入口', alt: '出入口' },
  { icon: sharedAssistiveAidsIcon, label: '爱心共享辅具空间', alt: '爱心共享辅具空间' },
  { icon: parkAudioGuideIcon, label: '公园全景智慧语音导览图', alt: '公园全景智慧语音导览图' },
  { icon: loveStationIcon, label: '爱心驿站', alt: '爱心驿站' },
  { icon: voiceGuideDeviceIcon, label: '语音介绍装置', alt: '语音介绍装置' },
  { icon: plantBrailleSignIcon, label: '植物科普盲文牌', alt: '植物科普盲文牌' },
  { icon: infoCorridorIcon, label: '宣传长廊', alt: '宣传长廊' },
  { icon: toiletAccessibleIcon, label: '无障碍卫生间', alt: '无障碍卫生间' }
]

// 返回按钮点击事件
const handleBack = () => {
  emit('back')
}

// 功能按钮点击事件
const handleFunctionClick = (label) => {
  console.log('点击功能按钮:', label)
}
</script>

<template>
  <div class="visual-map-container">
    <!-- 导航栏 -->
    <div class="nav-bar">
      <button class="back-btn" @click="handleBack">
        <img :src="navigationBackIcon" alt="返回" class="back-icon" />
      </button>
    </div>

    <!-- 地图区域 -->
    <div class="map-container">
      <!-- 地图内容预留区域 -->
    </div>

    <!-- 底部功能按钮区域 -->
    <div class="bottom-functions">
      <div class="function-grid">
        <div 
          v-for="(button, index) in functionButtons" 
          :key="index"
          class="function-item"
          @click="handleFunctionClick(button.label)"
        >
          <div class="function-icon-wrapper">
            <img :src="button.icon" :alt="button.alt" class="function-icon" />
          </div>
          <span class="function-label">{{ button.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visual-map-container {
  width: 100%;
  height: 100vh;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 导航栏 */
.nav-bar {
  padding: 0;
  background-color: transparent;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 99;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 6px;
}

.back-icon {
  filter: brightness(0) saturate(100%) invert(7%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(86%);
}

/* 地图区域 */
.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 底部功能按钮区域 */
.bottom-functions {
  padding: 0;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 12px 0;
  padding: 12px 12px calc(env(safe-area-inset-bottom, 20px) + 12px) 12px;
  width: 100%;
  height: 100%;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.function-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.function-icon {}

.function-label {
  font-size: 14px;
  font-weight: 500;
  color: #000000;
  text-align: center;
  font-style: normal;
}

/* 响应式适配 */
@media (max-width: 414px) {
  .function-grid {
    gap: 12px 0;
    padding: 12px 12px calc(env(safe-area-inset-bottom, 20px) + 12px) 12px;
  }
  
  .function-label {
    font-size: 14px;
    color: #000000;
    text-align: center;
    font-style: normal;
  }
}

@media (max-width: 375px) {
  .function-grid {
    gap: 12px 0;
    padding: 12px 12px calc(env(safe-area-inset-bottom, 20px) + 12px) 12px;
  }
  
  .function-label {
    font-size: 14px;
    color: #000000;
    text-align: center;
    font-style: normal;
  }
}

@media (max-height: 667px) {
  .function-grid {
    gap: 12px 0;
    padding: 12px 12px calc(env(safe-area-inset-bottom, 20px) + 12px) 12px;
  }
  
  .function-label {
    font-size: 14px;
    color: #000000;
    text-align: center;
    font-style: normal;
  }
}
</style>