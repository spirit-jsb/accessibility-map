<script setup>
import logo from '../assets/images/logo.svg'
</script>

<template>
  <div class="launch-view">
    <div class="content-container-view">
      <img :src="logo" alt="中国残疾人联合会" class="logo" />

      <div class="text-container-view">
        <p class="small-text-item">无障碍设施建设问题</p>
        <p class="medium-text-item">是一个国家和社会文明的标志</p>
        <p class="large-text-item">我们要高度重视</p>
      </div>
    </div>

    <p class="copyright-view">无障碍地图网站 © 2025</p>
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

.text-container-view {
  margin: 48px 25px 0px 25px;
}

.small-text-item,
.medium-text-item,
.large-text-item {
  margin: 0px;
  color: #ffffff;
  font-style: normal;
  font-weight: bold;
  text-align: left;
}

.small-text-item {
  margin-bottom: 6px;
  font-size: 20px;
}

.medium-text-item {
  margin-bottom: 5px;
  font-size: 25px;
}

.large-text-item {
  font-size: 30px;
}

.copyright-view {
  margin: auto auto calc(env(safe-area-inset-bottom, 34px) + 16px) auto;
  color: #ffffff;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  text-align: center;
}
</style>
