<script setup>
import { ref, onMounted } from 'vue'
import LaunchView from './views/LaunchView.vue'

// 控制显示状态的响应式变量
const showLaunch = ref(true)

// 组件挂载后启动定时器
onMounted(() => {
  // setTimeout(() => {
  //   showLaunch.value = false
  // }, 3000) // 3秒后切换
})
</script>

<template>
  <!-- 启动页面 -->
  <LaunchView v-if="showLaunch" />
  
  <!-- 主页面 -->
  <div v-else class="app">
    <h1 class="title">无障碍地图</h1>
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 600;
  margin: 0;
  text-align: center;
}
</style>
