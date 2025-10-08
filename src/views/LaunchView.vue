<script setup>
import logo from '../assets/images/logo.svg'
</script>

<template>
  <div class="launch-view">
    <div class="navigation-bar"></div>

    <img :src="logo" alt="中国残疾人联合会" class="logo-image" />

    <div class="xis-quotations-section">
      <p class="small-text">无障碍设施建设问题</p>
      <p class="medium-text">是一个国家和社会文明的标志</p>
      <p class="large-text">我们要高度重视</p>
    </div>

    <div class="copyright-section">
      <a class="copyright-label">Copyright © 2025 曦曦の聴感不良. 保留所有权利。</a>
    </div>
  </div>
</template>

<style scoped>
.launch-view {
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

.xis-quotations-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 36px 24px;
}

.small-text,
.medium-text,
.large-text {
  margin: 0;
  color: #ffffff;
  font-weight: bold;
}

.small-text {
  font-size: 20px;
}

.medium-text {
  font-size: 25px;
}

.large-text {
  font-size: 30px;
}

.copyright-section {
  display: flex;
  position: absolute;
  right: 0;
  bottom: calc(env(safe-area-inset-bottom) + 16px);
  left: 0;
  justify-content: center;
}

.copyright-label {
  color: #ffffff;
  font-weight: bold;
  font-size: 15x;
}
</style>
