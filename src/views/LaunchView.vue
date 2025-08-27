<script setup>
// 启动页面组件
import logoSvg from '../assets/images/logo.svg'
</script>

<template>
  <div class="launch-container">
    <div class="content">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <img :src="logoSvg" alt="无障碍地图" class="logo" />
      </div>
      
      <!-- 文字内容 -->
      <div class="text-content">
        <h1 class="title">无障碍设施建设问题</h1>
        <h2 class="subtitle">是一个国家和社会文明的标志</h2>
        <p class="emphasis">我们要高度重视</p>
      </div>
    </div>
    
    <!-- 底部版权信息 -->
    <footer class="footer">
      <p class="copyright">无障碍地图网站 © 2025</p>
    </footer>
  </div>
</template>

<style scoped>
.launch-container {
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
}

.logo-section {
  margin: 40px 0 48px;
}

.logo {
  width: 68px;
  height: 68px;
}

.text-content {
  width: 100%;
  padding: 0 25px;
}

.title, .subtitle, .emphasis {
  font-weight: bold;
  font-style: normal;
  text-align: left;
  margin: 0 0 8px 0;
}

.title {
  font-size: 20px;
}

.subtitle {
  font-size: 25px;
}

.emphasis {
  font-size: 30px;
  margin-bottom: 0;
}

.footer {
  padding: 0 20px 16px;
  text-align: center;
}

.copyright {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
}

/* 响应式 */
@media (max-width: 480px) {
  .content { padding: 0 0 30px; }
  .logo { width: 56px; height: 56px; }
  .logo-section { margin: 32px 0 40px; }
  .text-content { padding: 0 20px; }
  .title { font-size: 18px; }
  .subtitle { font-size: 22px; }
  .emphasis { font-size: 26px; }
}

@media (max-width: 375px) {
  .logo { width: 48px; height: 48px; }
  .logo-section { margin: 28px 0 36px; }
  .text-content { padding: 0 16px; }
  .title { font-size: 16px; }
  .subtitle { font-size: 20px; }
  .emphasis { font-size: 24px; }
}

@media (max-height: 600px) {
  .content { padding: 0 0 20px; }
  .logo-section { margin: 24px 0 32px; }
}
</style>