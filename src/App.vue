<script setup>
import { ref, onMounted } from 'vue'
import LaunchView from './views/LaunchView.vue'
import HomeView from './views/HomeView.vue'

// 控制显示状态的响应式变量
const showLaunch = ref(true)

// 组件挂载后启动定时器
onMounted(() => {
  setTimeout(() => {
    showLaunch.value = false
  }, 3000) // 3秒后切换
})
</script>

<template>
  <!-- 启动页面 -->
  <LaunchView v-if="showLaunch" />
  
  <!-- 主页面 -->
  <HomeView v-else />
</template>
