<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { useHistoryStore } from '@/stores/history'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const history = useHistoryStore()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
  },
)

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function jumpTo(index: number) {
  history.goTo(index)
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal">
      <header class="modal-header">
        <h2>Historial de cambios</h2>
        <button type="button" class="close-btn" aria-label="Cerrar" @click="emit('close')">×</button>
      </header>

      <ul class="history-list">
        <li>
          <button
            type="button"
            class="history-item"
            :class="{ current: history.currentIndex === 0 }"
            @click="jumpTo(0)"
          >
            Estado inicial
          </button>
        </li>
        <li v-for="entry in history.timeline" :key="entry.index">
          <button
            type="button"
            class="history-item"
            :class="{
              current: history.currentIndex === entry.index,
              future: entry.index > history.currentIndex,
            }"
            @click="jumpTo(entry.index)"
          >
            {{ entry.index }}. {{ entry.label }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.4);
}

.modal {
  width: 320px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.close-btn {
  border: none;
  background: none;
  padding: 0.2rem;
  line-height: 1;
  font-size: 1.1rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.close-btn:hover {
  color: var(--color-text);
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  overflow-y: auto;
}

.history-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.55rem 0.75rem;
  border: none;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-text);
  font-size: 0.85rem;
  cursor: pointer;
}

.history-item:hover {
  background: var(--color-bg);
}

.history-item.future {
  color: var(--color-text-muted);
}

.history-item.current {
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
}
</style>
