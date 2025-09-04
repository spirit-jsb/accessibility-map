<script setup>
import { ref, onMounted, computed } from "vue";

import navigateIndicator from "../assets/images/navigate-indicator.svg";
import navigationBack from "../assets/images/navigation-back.svg";
import { accessibilityService } from "../services/accessibilityService.js";

const props = defineProps({
  facilityTypeId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["back"]);

const facilityType = ref(null);
const facilityIconMappings = ref({});
const facilities = ref([]);
const userLocation = ref({ latitude: 31.23, longitude: 121.473 });

const getFacilityIcon = computed(() => {
  const iconMapping = facilityIconMappings.value[props.facilityTypeId];
  if (!iconMapping) {
    return null;
  }
  return {
    icon: new URL(`../assets/images/${iconMapping.icon}`, import.meta.url).href,
    alt: iconMapping.alt,
  };
});

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log("获取到用户位置:", userLocation.value);
      },
      (error) => {
        console.warn("无法获取用户位置，使用默认位置:", error);
      }
    );
  } else {
    console.warn("浏览器不支持地理位置，使用默认位置");
  }
};

const loadFacilityListData = async () => {
  try {
    console.log("Loading facility list data for type:", props.facilityTypeId);

    const [facilityTypesResult, facilityIconMappingsResult, facilitiesResult] =
      await Promise.all([
        accessibilityService.getFacilityTypes(),
        accessibilityService.getFacilityIconMappings(),
        accessibilityService.getFacilities(),
      ]);

    if (!facilityTypesResult.success) {
      throw new Error(facilityTypesResult.message);
    }

    if (!facilityIconMappingsResult.success) {
      throw new Error(facilityIconMappingsResult.message);
    }

    if (!facilitiesResult.success) {
      throw new Error(facilitiesResult.message);
    }

    const facilityTypes = facilityTypesResult.data.data.facility_types || [];
    facilityType.value = facilityTypes.find(
      (type) => type.id === props.facilityTypeId
    );

    facilityIconMappings.value = facilityIconMappingsResult.data || {};

    facilities.value = facilitiesResult.data.data.facilities || [];

    console.log("Data loaded successfully:", {
      facilityType: facilityType.value?.name,
      icons: Object.keys(facilityIconMappings.value).length,
      facilities: facilities.value.length,
    });
  } catch (error) {
    console.error("Failed to load facility list data:", error);
  }
};

const handleBack = () => {
  emit("back");
};

const handleFacilityClick = (facility) => {
  console.log("点击设施:", facility);
};

const facilitiesWithDistance = computed(() => {
  if (!facilities.value.length || !userLocation.value) {
    return [];
  }

  return facilities.value
    .filter(
      (facility) =>
        facility.type_id === props.facilityTypeId && facility.is_active
    )
    .map((facility) => {
      const distance = calculateDistance(
        userLocation.value.latitude,
        userLocation.value.longitude,
        facility.location.latitude,
        facility.location.longitude
      );

      return {
        ...facility,
        distance: Math.round(distance),
        distanceText:
          distance < 1000
            ? `${Math.round(distance)}m`
            : `${(distance / 1000).toFixed(1)}km`,
      };
    })
    .sort((a, b) => a.distance - b.distance);
});

/**
 * 计算两个地理坐标点之间的距离
 * 使用 Haversine 公式计算地球表面两点间的最短距离
 *
 * @param {number} latitude1 - 起点纬度
 * @param {number} longitude1 - 起点经度
 * @param {number} latitude2 - 终点纬度
 * @param {number} longitude2 - 终点经度
 * @returns {number} 两点间的距离(单位：米)
 *
 */
const calculateDistance = (latitude1, longitude1, latitude2, longitude2) => {
  // 地球半径(千米)
  const R = 6371;

  // 将经纬度转换为弧度
  const dLatitude = ((latitude2 - latitude1) * Math.PI) / 180; // 纬度差
  const dLongitude = ((longitude2 - longitude1) * Math.PI) / 180; // 经度差

  // Haversine 公式计算
  const a =
    Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) + // 纬度差的正弦平方
    Math.cos((latitude1 * Math.PI) / 180) * // 起点纬度的余弦
      Math.cos((latitude2 * Math.PI) / 180) * // 终点纬度的余弦
      Math.sin(dLongitude / 2) * // 经度差的正弦
      Math.sin(dLongitude / 2); // 经度差的正弦

  // 计算大圆距离
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // 将距离从千米转换为米
  const distance = R * c;
  return distance * 1000;
};

onMounted(() => {
  getUserLocation();
  loadFacilityListData();
});
</script>

<template>
  <div class="visual-facility-list-container">
    <div class="navigation-bar">
      <button class="navigation-back-button" @click="handleBack">
        <img :src="navigationBack" alt="返回" class="navigation-back-icon" />
      </button>
      <h1 class="navigation-title">{{ facilityType?.name || "设施列表" }}</h1>
    </div>

    <div class="facility-list-container">
      <div
        v-for="facility in facilitiesWithDistance"
        :key="facility.id"
        class="facility-item"
        :data-type="facility.type_id"
        @click="handleFacilityClick(facility)"
      >
        <div class="facility-icon-wrapper">
          <img
            v-if="getFacilityIcon"
            :src="getFacilityIcon.icon"
            :alt="getFacilityIcon.alt"
            class="facility-icon"
          />
        </div>
        <span class="facility-name">{{ facility.name }}</span>
        <div class="facility-distance-wrapper">
          <span class="distance-text">{{ facility.distanceText }}</span>
          <img
            :src="navigateIndicator"
            alt="导航指示"
            class="navigate-indicator-icon"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visual-facility-list-container {
  width: 100%;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navigation-bar {
  padding: 0;
  background-color: transparent;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 99;
}

.navigation-back-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navigation-back-icon {
  filter: brightness(0) saturate(100%) invert(7%) sepia(0%) saturate(0%)
    hue-rotate(0deg) brightness(95%) contrast(86%);
}

.navigation-title {
  font-weight: 600;
  font-size: 17px;
  color: #121212;
  line-height: 22px;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin: 0;
  padding: 0;
  flex: 1;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.facility-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 calc(env(safe-area-inset-bottom, 20px));
}

.facility-item {
  display: flex;
  align-items: center;
  padding: 0px;
  position: relative;
  cursor: pointer;
}

.facility-item::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 8px;
  right: 8px;
  height: 1px;
  background-color: #1212124d;
}

.facility-item:last-child::after {
  display: none;
}

.facility-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 11px 0px 11px 16px;
}

.facility-icon {
  width: 42px;
  height: 42px;
}

.facility-name {
  font-weight: 400;
  font-size: 16px;
  color: #121212;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-left: 12px;
}

.facility-distance-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  margin-right: 8px;
}

.distance-text {
  font-weight: 400;
  font-size: 14px;
  color: #121212;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

.navigate-indicator-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
