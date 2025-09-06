<script setup>
import HomeView from './views/HomeView.vue'
import LaunchView from './views/LaunchView.vue'
import { onMounted, ref } from 'vue'

const showLaunch = ref(true)

onMounted(() => {
  setTimeout(() => {
    showLaunch.value = false
  }, 3000)
})
</script>

<template>
  <LaunchView v-if="showLaunch" />

  <HomeView v-else />
</template>
