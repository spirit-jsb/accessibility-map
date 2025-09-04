<script setup>
import logo from "../assets/images/logo.svg";
</script>

<template>
  <div class="launch-screen">
    <div class="content">
      <div class="logo-section">
        <img :src="logo" alt="中国残疾人联合会" class="logo" />
      </div>

      <div class="text-section">
        <p class="small-text">无障碍设施建设问题</p>
        <p class="medium-text">是一个国家和社会文明的标志</p>
        <p class="large-text">我们要高度重视</p>
      </div>
    </div>

    <div class="footer">
      <p class="copyright">无障碍地图网站 © 2025</p>
    </div>
  </div>
</template>

<style scoped>
.launch-screen {
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

.text-section {
  margin: 48px 25px 0px 25px;
}

.small-text,
.medium-text,
.large-text {
  font-weight: bold;
  color: #ffffff;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin: 0px;
}

.small-text {
  font-size: 20px;
  margin-bottom: 6px;
}

.medium-text {
  font-size: 25px;
  margin-bottom: 5px;
}

.large-text {
  font-size: 30px;
}

.footer {
  margin: auto 0px 16px 0px;
  text-align: center;
}

.copyright {
  font-weight: bold;
  font-size: 14px;
  color: #ffffff;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin: 0px;
}
</style>
