<script setup>
import HomeView from './views/HomeView.vue'
import LaunchView from './views/LaunchView.vue'
import SpeechFacilityListView from './views/SpeechFacilityListView.vue'
import SpeechMapView from './views/SpeechMapView.vue'
import SpeechNavigationView from './views/SpeechNavigationView.vue'
import VisualFacilityListView from './views/VisualFacilityListView.vue'
import VisualMapView from './views/VisualMapView.vue'
import VisualNavigationView from './views/VisualNavigationView.vue'
import { onMounted, ref } from 'vue'

const showLaunch = ref(true)

const currentView = ref('home')

const selectedFacilityTypeId = ref(null)
const navigationData = ref(null)

const handleNavigateToVisualMap = () => {
  currentView.value = 'visualMap'
}

const handleNavigateToSpeechMap = () => {
  currentView.value = 'speechMap'
}

const handleBackToHome = () => {
  selectedFacilityTypeId.value = null
  currentView.value = 'home'
}

const handleNavigateToVisualFacilityList = (facilityTypeId) => {
  selectedFacilityTypeId.value = facilityTypeId
  currentView.value = 'visualFacilityList'
}

const handleNavigateToSpeechFacilityList = (facilityTypeId) => {
  selectedFacilityTypeId.value = facilityTypeId
  currentView.value = 'speechFacilityList'
}

const handleBackToVisualMap = () => {
  selectedFacilityTypeId.value = null
  currentView.value = 'visualMap'
}

const handleNavigateToVisualNavigation = (data) => {
  navigationData.value = data
  currentView.value = 'visualNavigation'
}

const handleBackToSpeechMap = () => {
  selectedFacilityTypeId.value = null
  currentView.value = 'speechMap'
}

const handleNavigateToSpeechNavigation = (data) => {
  navigationData.value = data
  currentView.value = 'speechNavigation'
}

const handleBackToVisualFacilityList = () => {
  navigationData.value = null
  currentView.value = 'visualFacilityList'
}

const handleBackToSpeechFacilityList = () => {
  navigationData.value = null
  currentView.value = 'speechFacilityList'
}

onMounted(() => {
  setTimeout(() => {
    showLaunch.value = false
  }, 3000)
})
</script>

<template>
  <LaunchView v-if="showLaunch" />

  <HomeView
    v-else-if="currentView === 'home'"
    @navigateToVisualMap="handleNavigateToVisualMap"
    @navigateToSpeechMap="handleNavigateToSpeechMap"
  />

  <VisualMapView
    v-else-if="currentView === 'visualMap'"
    @back="handleBackToHome"
    @navigateToVisualFacilityList="handleNavigateToVisualFacilityList"
  />

  <SpeechMapView
    v-else-if="currentView === 'speechMap'"
    @back="handleBackToHome"
    @navigateToSpeechFacilityList="handleNavigateToSpeechFacilityList"
  />

  <VisualFacilityListView
    v-else-if="currentView === 'visualFacilityList'"
    :facility-type-id="selectedFacilityTypeId"
    @back="handleBackToVisualMap"
    @navigateToVisualNavigation="handleNavigateToVisualNavigation"
  />

  <SpeechFacilityListView
    v-else-if="currentView === 'speechFacilityList'"
    :facility-type-id="selectedFacilityTypeId"
    @back="handleBackToSpeechMap"
    @navigateToSpeechNavigation="handleNavigateToSpeechNavigation"
  />

  <VisualNavigationView
    v-else-if="currentView === 'visualNavigation' && navigationData"
    :facility="navigationData.facility"
    :userLocation="navigationData.userLocation"
    @back="handleBackToVisualFacilityList"
  />

  <SpeechNavigationView
    v-else-if="currentView === 'speechNavigation' && navigationData"
    :facility="navigationData.facility"
    :userLocation="navigationData.userLocation"
    @back="handleBackToSpeechFacilityList"
  />
</template>
