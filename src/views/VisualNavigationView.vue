<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

import endMarkerIcon from '../assets/images/end-marker.svg'
import exitNavigation from '../assets/images/exit-navigation.svg'
import overviewNavigation from '../assets/images/overview-navigation.svg'
import userMarkerIcon from '../assets/images/user-marker.svg'
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

const deviceHeading = ref(0)

const navigationMap = ref(null)
const userMarker = ref(null)

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

const initializeNavigationMap = async () => {
  try {
    navigationMap.value = await amapService.initializeMap('navigation-map', {
      center: [props.userLocation.longitude, props.userLocation.latitude],
    })

    console.log('导航地图初始化成功')
  } catch (error) {
    console.error('导航地图初始化失败：', error)
  }
}

const startNavigation = async () => {
  try {
    const start = [props.userLocation.longitude, props.userLocation.latitude]
    const end = [props.facility.location.gcj02.longitude, props.facility.location.gcj02.latitude]

    const route = await amapService.planningWalkingRoute(start, end)

    currentRoute.value = route

    navigationStats.value.totalDistance = route.distance
    navigationStats.value.remainingDistance = route.distance
    navigationStats.value.estimatedTime = route.time

    displayNavigationRoute(start, end, route)

    startListeningLocation()
    startListeningDeviceOrientation()

    amapService.speak(`开始导航到${props.facility.name}，距离您${Math.round(route.distance)}米`)

    isNavigating.value = true

    console.log('导航开始成功')
  } catch (error) {
    amapService.speak('导航开始失败，请重试')

    console.error('导航开始失败：', error)
  }
}

const displayNavigationRoute = (start, end, route) => {
  if (!navigationMap.value || !route) {
    return
  }

  try {
    amapService.clearMarkers()
    amapService.clearPolylines()

    if (route.steps && route.steps.length > 0) {
      const pathPoints = []

      route.steps.forEach((step) => {
        if (step.path && step.path.length > 0) {
          pathPoints.push(...step.path)
        }
      })

      if (pathPoints.length > 0) {
        amapService.addPolyline(pathPoints)
      }
    }

    amapService.addMarker(end, {
      icon: endMarkerIcon,
      zIndex: 100,
    })

    userMarker.value = amapService.addMarker(currentUserLocation.value, {
      icon: userMarkerIcon,
      zIndex: 101,
    })

    amapService.map.setCenter(start)
    amapService.map.setZoom(18)

    updateUserMarkerRotation()

    console.log('显示导航路径成功')
  } catch (error) {
    console.error('显示导航路径失败：', error)
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

  updateUserMarker(userLocation)

  if (remainingDistance < 20) {
    handleArrival()
    return
  }

  updateRouteStep(position)
}

const updateUserMarker = (position) => {
  if (!navigationMap.value) {
    return
  }

  try {
    if (userMarker.value) {
      amapService.map.remove(userMarker.value)

      const index = amapService.markers.indexOf(userMarker.value)
      if (index > -1) {
        amapService.markers.splice(index, 1)
      }
    }

    const userMarkerContent = document.createElement('img')
    userMarkerContent.src = userMarkerIcon

    userMarker.value = amapService.addMarker(position, {
      content: userMarkerContent,
      anchor: 'center',
      zIndex: 101,
    })

    amapService.map.setCenter(position)
    amapService.map.setZoom(18)

    updateUserMarkerRotation()

    console.log('更新用户标记成功')
  } catch (error) {
    console.error('更新用户标记失败：', error)
  }
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
      emit('back')
    }, 3000)
    return
  }

  amapService.speak(`已到达目的地：${props.facility.name}`, {
    onEnd: () => {
      setTimeout(() => {
        emit('back')
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

    displayNavigationRoute(start, end, newRoute)

    amapService.speak('路径重新规划完成')

    console.log('导航重新开始成功')
  } catch (error) {
    amapService.speak('导航重新开始失败，请重试')

    console.error('导航重新开始失败：', error)
  }
}

const startListeningDeviceOrientation = () => {
  amapService.startListening((deviceOrientation, error) => {
    if (error) {
      console.error('开始监听设备方向失败：', error)
      return
    }

    deviceHeading.value = deviceOrientation

    updateUserMarkerRotation()

    console.log('开始监听设备方向成功：', deviceOrientation)
  })
}

const updateUserMarkerRotation = () => {
  if (navigationMap.value && userMarker.value) {
    const angle = -deviceHeading.value // 负值是因为地图坐标系与设备坐标系相反
    userMarker.value.setAngle(angle)
  }
}

const stopNavigation = () => {
  isNavigating.value = false

  amapService.clearPositionListener()
  amapService.clearDeviceOrientationListener()
  amapService.clearMarkers()
  amapService.clearPolylines()

  if (navigationMap.value) {
    amapService.destroy()
    navigationMap.value = null
  }

  emit('back')
}

const handleExitNavigation = () => {
  stopNavigation()
}

const handleOverviewNavigation = () => {}

onMounted(async () => {
  await initializeNavigationMap()
  await startNavigation()
})

onUnmounted(async () => {
  stopNavigation()
})
</script>

<template>
  <div class="visual-navigation-view">
    <div class="navigation-bar"></div>

    <div class="map-section">
      <div id="navigation-map" style="width: 100%; height: 100%"></div>
    </div>

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

      <div>
        <button class="overview-navigation-button" @click="handleOverviewNavigation">
          <img :src="overviewNavigation" alt="全览导航" class="overview-navigation-icon" />
          <span class="overview-navigation-label">全览</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visual-navigation-view {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
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

.map-section {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
}

.navigation-instruction-section {
  display: flex;
  position: absolute;
  top: calc(env(safe-area-inset-top) + 44px + 16px);
  right: 12px;
  left: 12px;
  gap: 16px;
  border-radius: 12px;
  background-color: #121212;
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
  bottom: calc(env(safe-area-inset-bottom, 34px) + 16px);
  left: 12px;
  justify-content: space-between;
  gap: 16px;
  border-radius: 12px;
  background-color: #121212;
  padding: 12px 16px;
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

.exit-navigation-button,
.overview-navigation-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  background: none;
}

.exit-navigation-icon,
.overview-navigation-icon {
  filter: brightness(0) invert(100%);
}

.exit-navigation-label,
.overview-navigation-label {
  color: #ffffff;
  font-weight: 400;
  font-size: 16px;
}
</style>
