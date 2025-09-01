<script setup>
import { ref, onMounted, computed } from "vue";

import navigationBack from "../assets/images/navigation-back.svg";
import { accessibilityService } from "../services/accessibilityService.js";

const emit = defineEmits(["back"]);

const facilityTypes = ref([]);
const facilityIconMappings = ref({});

const functionButtons = computed(() => {
  if (
    !facilityTypes.value.length ||
    !Object.keys(facilityIconMappings.value).length
  ) {
    return [];
  }

  return [...facilityTypes.value]
    .sort((a, b) => a.order - b.order)
    .map((facilityType) => {
      const iconMapping = facilityIconMappings.value[facilityType.id];
      if (!iconMapping) {
        console.warn(`Icon not found for facility: ${facilityType.id}`);
        return null;
      }

      return {
        id: facilityType.id,
        icon: `/src/assets/images/${iconMapping.icon}`,
        alt: iconMapping.alt,
        label: iconMapping.label,
        description: facilityType.description,
      };
    })
    .filter(Boolean);
});

const loadFacilityData = async () => {
  try {
    console.log("Loading facility data...");

    const [facilityTypesResult, facilityIconMappingsResult] = await Promise.all(
      [
        accessibilityService.getFacilityTypes(),
        accessibilityService.getFacilityIconMappings(),
      ]
    );

    if (!facilityTypesResult.success) {
      throw new Error(facilityTypesResult.message);
    }

    if (!facilityIconMappingsResult.success) {
      throw new Error(facilityIconMappingsResult.message);
    }

    facilityTypes.value = facilityTypesResult.data.data.facility_types || [];
    facilityIconMappings.value = facilityIconMappingsResult.data || {};

    console.log("Data loaded successfully:", {
      facilities: facilityTypes.value.length,
      icons: Object.keys(facilityIconMappings.value).length,
    });
  } catch (error) {
    console.error("Failed to load data:", error);
  }
};

const handleBack = () => {
  emit("back");
};

const handleFunctionClick = (button) => {
  console.log("点击功能按钮:", {
    id: button.id,
    label: button.label,
    description: button.description,
  });
};

onMounted(() => {
  loadFacilityData();
});
</script>

<template>
  <div class="visual-map-container">
    <div class="nav-bar">
      <button class="back-btn" @click="handleBack">
        <img :src="navigationBack" alt="返回" class="back-icon" />
      </button>
    </div>

    <div class="map-container"></div>

    <div class="bottom-functions">
      <div class="function-grid">
        <div
          v-for="(button, index) in functionButtons"
          :key="button.id || index"
          class="function-item"
          @click="handleFunctionClick(button)"
        >
          <div class="function-icon-wrapper">
            <img :src="button.icon" :alt="button.alt" class="function-icon" />
          </div>
          <span class="function-label">{{ button.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visual-map-container {
  width: 100%;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.nav-bar {
  padding: 0;
  background-color: transparent;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 99;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 6px;
}

.back-icon {
  filter: brightness(0) saturate(100%) invert(7%) sepia(0%) saturate(0%)
    hue-rotate(0deg) brightness(95%) contrast(86%);
}

.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.bottom-functions {
  padding: 0;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 12px 0;
  padding: 12px 12px calc(env(safe-area-inset-bottom, 20px) + 12px) 12px;
  width: 100%;
  height: 100%;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.function-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.function-icon {
}

.function-label {
  font-size: 14px;
  font-weight: 500;
  color: #000000;
  text-align: center;
  font-style: normal;
}

@media (max-width: 414px) {
  .function-grid {
    gap: 12px 0;
    padding: 12px 12px calc(env(safe-area-inset-bottom, 20px) + 12px) 12px;
  }

  .function-label {
    font-size: 14px;
    color: #000000;
    text-align: center;
    font-style: normal;
  }
}

@media (max-width: 375px) {
  .function-grid {
    gap: 12px 0;
    padding: 12px 12px calc(env(safe-area-inset-bottom, 20px) + 12px) 12px;
  }

  .function-label {
    font-size: 14px;
    color: #000000;
    text-align: center;
    font-style: normal;
  }
}

@media (max-height: 667px) {
  .function-grid {
    gap: 12px 0;
    padding: 12px 12px calc(env(safe-area-inset-bottom, 20px) + 12px) 12px;
  }

  .function-label {
    font-size: 14px;
    color: #000000;
    text-align: center;
    font-style: normal;
  }
}
</style>
