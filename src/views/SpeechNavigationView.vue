<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

import exitNavigation from '../assets/images/exit-navigation.svg'
import logo from '../assets/images/logo.svg'
import navigationBack from '../assets/images/navigation-back.svg'
import overviewNavigation from '../assets/images/overview-navigation.svg'
import walkingNavigationIndicator from '../assets/images/walking-navigation-indicator.svg'
import { amapService } from '../services/amapService'

const props = defineProps({
  facility: {
    type: Object,
    required: true,
  },
  userLocation: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['back'])

const isNavigating = ref(false)
const currentRoute = ref(null)
const currentStepIndex = ref(0)
const currentUserLocation = ref(props.userLocation)

const navigationStats = ref({
  totalDistance: 0,
  remainingDistance: 0,
  estimatedTime: 0,
  elapsedTime: 0,
})

const currentInstruction = computed(() => {
  if (!currentRoute.value || !currentRoute.value.steps) {
    return null
  }

  return currentRoute.value.steps[currentStepIndex.value].instruction
})

const startNavigation = async () => {
  try {
    const start = [props.userLocation.longitude, props.userLocation.latitude]
    const end = [props.facility.location.gcj02.longitude, props.facility.location.gcj02.latitude]

    const route = await amapService.planningWalkingRoute(start, end)

    currentRoute.value = route

    navigationStats.value.totalDistance = route.distance
    navigationStats.value.remainingDistance = route.distance
    navigationStats.value.estimatedTime = route.time

    startListeningLocation()

    amapService.speak(`开始导航到${props.facility.name}，距离您${Math.round(route.distance)}米`)

    isNavigating.value = true

    console.log('导航开始成功')
  } catch (error) {
    amapService.speak('导航开始失败，请重试')

    console.error('导航开始失败：', error)
  }
}

const startListeningLocation = () => {
  amapService.startNavigationModeListeningPosition((position, error) => {
    if (error) {
      console.error('开始监听位置失败：', error)
      return
    }
    currentUserLocation.value = position

    updateNavigation(position)
    checkRouteDeviation(position)

    console.log('开始监听位置成功：', position)
  })
}

const updateNavigation = (position) => {
  if (!currentRoute.value) {
    return
  }

  const userLocation = [position.longitude, position.latitude]
  const endLocation = [
    props.facility.location.gcj02.longitude,
    props.facility.location.gcj02.latitude,
  ]

  const remainingDistance = amapService.calculateDistance(userLocation, endLocation)
  navigationStats.value.remainingDistance = remainingDistance

  if (remainingDistance < 20) {
    handleArrival()
    return
  }

  updateRouteStep(position)
}

const updateRouteStep = (position) => {
  if (!currentRoute.value || !currentRoute.value.steps) {
    return
  }

  const userLocation = [position.longitude, position.latitude]
  const routeSteps = currentRoute.value.steps

  let minimumDistance = Infinity
  let closestStepIndex = currentStepIndex.value

  for (let i = currentStepIndex.value; i < routeSteps.length; i++) {
    const step = routeSteps[i]
    if (step.path && step.path.length > 0) {
      const distance = amapService.calculateDistance(userLocation, step.path[0])
      if (distance < minimumDistance) {
        minimumDistance = distance
        closestStepIndex = i
      }
    }
  }

  if (closestStepIndex !== currentStepIndex.value) {
    currentStepIndex.value = closestStepIndex

    const instruction = routeSteps[closestStepIndex].instruction
    if (instruction) {
      amapService.speak(instruction)
    }
  }
}

const handleArrival = () => {
  if (!window.speechSynthesis) {
    setTimeout(() => {
      stopNavigation()
    }, 3000)
    return
  }

  amapService.speak(`已到达目的地：${props.facility.name}`, {
    onEnd: () => {
      setTimeout(() => {
        stopNavigation()
      }, 1000)
    },
  })
}

const checkRouteDeviation = (position) => {
  if (!currentRoute.value || !currentRoute.value.steps) {
    return
  }

  const userLocation = [position.longitude, position.latitude]

  const routePaths = []
  currentRoute.value.steps.forEach((step) => {
    if (step.path && step.path.length > 0) {
      routePaths.push(...step.path)
    }
  })

  if (routePaths.length === 0) {
    return
  }

  let minimumDistance = Infinity

  for (const path of routePaths) {
    const distance = amapService.calculateDistance(userLocation, path)
    if (distance < minimumDistance) {
      minimumDistance = distance
    }
  }

  if (minimumDistance > 50) {
    restartNavigation(position)
    amapService.speak('您已偏离，已重新规划路径')

    console.log('检测路径偏移，重新规划路径')
  }
}

const restartNavigation = async (position) => {
  try {
    const start = [position.longitude, position.latitude]
    const end = [props.facility.location.gcj02.longitude, props.facility.location.gcj02.latitude]

    const newRoute = await amapService.planningWalkingRoute(start, end)

    currentRoute.value = newRoute
    currentStepIndex.value = 0

    navigationStats.value.remainingDistance = newRoute.distance
    navigationStats.value.estimatedTime = newRoute.time

    amapService.speak('路径重新规划完成')

    console.log('导航重新开始成功')
  } catch (error) {
    amapService.speak('导航重新开始失败，请重试')

    console.error('导航重新开始失败：', error)
  }
}

const stopNavigation = () => {
  isNavigating.value = false

  amapService.clearPositionListener()

  amapService.destroy()

  emit('back')
}

const handleExitNavigation = () => {
  stopNavigation()
}

onMounted(async () => {
  await startNavigation()
})

onUnmounted(async () => {
  stopNavigation()
})
</script>

<template>
  <div class="speech-navigation-view">
    <div class="navigation-bar">
      <button class="navigation-back-button" @click="handleBack">
        <img :src="navigationBack" alt="返回" class="navigation-back-icon" />
      </button>
    </div>

    <img :src="logo" alt="中国残疾人联合会" class="logo-image" />

    <div class="navigation-instruction-section">
      <img :src="walkingNavigationIndicator" alt="步行导航指示" />
      <span class="navigation-instruction-text">{{
        currentInstruction || '正在获取导航信息...'
      }}</span>
    </div>

    <div class="navigation-control-section">
      <div>
        <button class="exit-navigation-button" @click="handleExitNavigation">
          <img :src="exitNavigation" alt="退出导航" class="exit-navigation-icon" />
          <span class="exit-navigation-label">退出</span>
        </button>
      </div>

      <div class="center-navigation-control">
        <div class="navigation-trip-information">
          <span class="navigation-remaining-distance"
            >{{ Math.round((navigationStats.remainingDistance / 1000) * 10) / 10 }}公里</span
          >
          <span class="navigation-estimated-time"
            >{{ Math.round(navigationStats.estimatedTime / 60) }}分钟</span
          >
        </div>

        <div class="arrival-time-information">
          <span class="arrival-time">
            {{
              new Date(Date.now() + navigationStats.estimatedTime * 1000).toLocaleTimeString(
                'zh-CN',
                {
                  hour: '2-digit',
                  minute: '2-digit',
                },
              )
            }}到达
          </span>
        </div>
      </div>

      <div class="right-navigation-control"></div>
    </div>
  </div>
</template>

<style scoped>
.speech-navigation-view {
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
}

.navigation-back-button {
  display: flex;
  border: none;
  background: none;
  padding: 0 6px;
}

.navigation-back-icon {
  filter: brightness(0) invert(1);
  height: 44px;
}

.logo-image {
  margin: 12px auto;
  width: 68px;
  height: 68px;
}

.navigation-instruction-section {
  display: flex;
  gap: 16px;
  margin: 16px 12px;
  border: 2.5px solid #ffffff;
  border-radius: 12px;
  background-color: transparent;
  padding: 12px 16px;
}

.navigation-instruction-text {
  color: #ffffff;
  font-weight: bold;
  font-size: 17px;
}

.navigation-control-section {
  display: flex;
  position: absolute;
  right: 12px;
  bottom: calc(env(safe-area-inset-bottom) + 16px);
  left: 12px;
  justify-content: space-between;
  gap: 16px;
  border: 2.5px solid #ffffff;
  border-radius: 12px;
  background-color: transparent;
  padding: 12px 16px;
}

.exit-navigation-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  background: none;
}

.exit-navigation-icon {
  filter: brightness(0) invert(100%);
}

.exit-navigation-label {
  color: #ffffff;
  font-weight: 400;
  font-size: 16px;
}

.center-navigation-control {
  gap: 4px;
}

.navigation-trip-information {
  display: flex;
  gap: 16px;
}

.navigation-remaining-distance,
.navigation-estimated-time {
  color: #ffffff;
  font-weight: bold;
  font-size: 18px;
}

.arrival-time-information {
  text-align: center;
}

.arrival-time {
  color: #ffffff;
  font-weight: 400;
  font-size: 14px;
}

.right-navigation-control {
  width: 44px;
}
</style>
