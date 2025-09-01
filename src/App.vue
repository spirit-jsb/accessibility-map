<script setup>
import { ref, onMounted } from "vue";

import HomeView from "./views/HomeView.vue";
import LaunchView from "./views/LaunchView.vue";

const showLaunch = ref(true);

onMounted(() => {
  setTimeout(() => {
    showLaunch.value = false;
  }, 3000);
});
</script>

<template>
  <LaunchView v-if="showLaunch" />

  <HomeView v-else />
</template>
