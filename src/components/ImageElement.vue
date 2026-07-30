<script setup lang="ts">
import type { ImageElementData } from '@/stores/editor'

defineProps<{ element: ImageElementData }>()
</script>

<template>
  <img :src="element.src" class="image-element" draggable="false" alt="" />
</template>

<style scoped>
.image-element {
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
  user-select: none;
}
</style>
