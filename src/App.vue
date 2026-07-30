<script setup lang="ts">
import Toolbar from '@/components/Toolbar.vue'
import PdfCanvas from '@/components/PdfCanvas.vue'
import PropertiesPanel from '@/components/PropertiesPanel.vue'
</script>

<template>
  <div class="app">
    <Toolbar />
    <div class="workspace">
      <PdfCanvas class="workspace-canvas" />
      <PropertiesPanel />
    </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.workspace {
  display: flex;
  flex: 1;
  min-height: 0;
}

.workspace-canvas {
  flex: 1;
}
</style>
