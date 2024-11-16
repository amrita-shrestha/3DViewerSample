<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useThreeScene } from '../composables/useThreeScene';
import { useModelLoader, type ModelFileType } from '../composables/useModelLoader';

const props = defineProps<{
  modelUrl: string;
  fileType: ModelFileType;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const { scene, camera, initScene, animate, handleResize, cleanup, isInitialized, controls } = useThreeScene();
const { loadModel, isLoading, error } = useModelLoader(scene, camera);

const handleWindowResize = () => {
  if (containerRef.value) {
    handleResize(containerRef.value);
  }
};

watch([() => props.modelUrl, () => props.fileType], ([newUrl, newType]) => {
  if (isInitialized.value && newUrl) {
    loadModel(newUrl, newType);
  }
});

onMounted(() => {
  if (containerRef.value) {
    initScene(containerRef.value);
    if (props.modelUrl) {
      loadModel(props.modelUrl, props.fileType);
    }
    animate();
    window.addEventListener('resize', handleWindowResize);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize);
  if (containerRef.value) {
    cleanup(containerRef.value);
  }
});

// Reset camera position
const resetView = () => {
  if (scene.children.length > 0) {
    const model = scene.children.find(child => 
      child instanceof THREE.Mesh || child instanceof THREE.Group
    );
    if (model) {
      const { fitCameraToObject } = useModelLoader(scene, camera);
      fitCameraToObject(model, 1.25, controls);
    }
  }
};
</script>

<template>
  <div class="model-viewer-container">
    <div ref="containerRef" class="model-viewer"></div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading model...</div>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <div class="controls">
      <button @click="resetView" class="reset-button">Reset View</button>
    </div>
  </div>
</template>

<style scoped>
.model-viewer-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  overflow: hidden;
}

.model-viewer {
  width: 100%;
  height: 100%;
  min-height: 400px;
  touch-action: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.loading-text {
  font-size: 1.1em;
}

.error-message {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: #ff4444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.controls {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  z-index: 1000;
}

.reset-button {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.reset-button:hover {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>