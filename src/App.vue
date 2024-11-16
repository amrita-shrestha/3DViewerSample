<script setup lang="ts">
import ModelViewer from './components/ModelViewer.vue';
import { ref } from 'vue';

const modelUrl = ref('');
const fileType = ref<'ply' | 'stl' | 'glb'>('glb');

const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && ['ply', 'stl', 'glb'].includes(extension)) {
      fileType.value = extension as 'ply' | 'stl' | 'glb';
      modelUrl.value = URL.createObjectURL(file);
    } else {
      alert('Please upload a .ply, .stl, or .glb file');
    }
  }
};
</script>

<template>
  <div class="app-container">
    <h1>3D Model Viewer</h1>
    <div class="upload-section">
      <input 
        type="file" 
        accept=".ply,.stl,.glb" 
        @change="handleFileUpload"
        class="file-input"
      >
      <p class="supported-formats">Supported formats: PLY, STL, GLB</p>
    </div>
    <div class="viewer-container">
      <ModelViewer
        v-if="modelUrl"
        :model-url="modelUrl"
        :file-type="fileType"
      />
      <div v-else class="placeholder">
        Please upload a 3D model to view
      </div>
    </div>
  </div>
</template>

<style>
.app-container {
  width: 100%;
  height: 100vh;
  padding: 20px;
  background: #f5f5f5;
}

.upload-section {
  margin-bottom: 20px;
  text-align: center;
}

.file-input {
  padding: 10px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.supported-formats {
  margin-top: 8px;
  color: #666;
  font-size: 0.9em;
}

.viewer-container {
  width: 100%;
  height: calc(100vh - 180px);
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 1.2em;
}

h1 {
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}
</style>