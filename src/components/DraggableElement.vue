<script setup lang="ts">
import { computed } from 'vue'
import { useDragResize, type Bounds, type Rect, type ResizeCorner } from '@/composables/useDragResize'

const props = defineProps<{
  rect: Rect
  bounds: Bounds
  selected: boolean
}>()

const emit = defineEmits<{
  'update:rect': [rect: Rect]
  select: []
  delete: []
}>()

const { startDrag, startResize } = useDragResize(
  () => props.rect,
  (rect) => emit('update:rect', rect),
  () => props.bounds,
)

const style = computed(() => ({
  left: `${props.rect.x}px`,
  top: `${props.rect.y}px`,
  width: `${props.rect.width}px`,
  height: `${props.rect.height}px`,
}))

const corners: ResizeCorner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

function onSurfaceDown(event: PointerEvent) {
  emit('select')
  startDrag(event)
}
</script>

<template>
  <div class="draggable" :class="{ selected }" :style="style">
    <div class="drag-surface" @pointerdown="onSurfaceDown">
      <slot />
    </div>
    <template v-if="selected">
      <div
        v-for="corner in corners"
        :key="corner"
        class="handle"
        :class="corner"
        @pointerdown="startResize(corner, $event)"
      />
      <button
        type="button"
        class="delete-btn"
        title="Eliminar"
        @click="emit('delete')"
      >
        ×
      </button>
    </template>
  </div>
</template>

<style scoped>
.draggable {
  position: absolute;
  pointer-events: auto;
}

.drag-surface {
  width: 100%;
  height: 100%;
  cursor: move;
}

.draggable.selected {
  outline: 1px dashed var(--color-primary);
}

.handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--color-primary);
  border: 1px solid #fff;
  border-radius: 2px;
}

.handle.top-left {
  top: -5px;
  left: -5px;
  cursor: nwse-resize;
}

.handle.top-right {
  top: -5px;
  right: -5px;
  cursor: nesw-resize;
}

.handle.bottom-left {
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}

.handle.bottom-right {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}

.delete-btn {
  position: absolute;
  top: -28px;
  right: -8px;
  width: 20px;
  height: 20px;
  padding: 0;
  line-height: 1;
  border: 1px solid var(--color-danger);
  border-radius: 50%;
  background: #fff;
  color: var(--color-danger);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.delete-btn:hover {
  background: var(--color-danger);
  color: #fff;
}
</style>
