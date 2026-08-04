<script setup lang="ts">
import { FONT_FAMILIES, useEditorStore, type TextElementData } from '@/stores/editor'
import { useHistoryStore } from '@/stores/history'
import { UpdateElementCommand } from '@/commands/elementCommands'

const store = useEditorStore()
const history = useHistoryStore()

function commit<K extends keyof TextElementData>(key: K, value: TextElementData[K]) {
  const el = store.selectedTextElement
  if (!el) return
  const before = { [key]: el[key] } as Partial<TextElementData>
  const after = { [key]: value } as Partial<TextElementData>
  history.execute(new UpdateElementCommand(store.currentPage, el.id, 'text', before, after))
}
</script>

<template>
  <aside v-if="store.selectedTextElement" class="properties-panel">
    <h3>Texto</h3>

    <label class="field">
      Fuente
      <select
        :value="store.selectedTextElement.fontFamily"
        @change="commit('fontFamily', ($event.target as HTMLSelectElement).value as TextElementData['fontFamily'])"
      >
        <option v-for="f in FONT_FAMILIES" :key="f" :value="f">{{ f }}</option>
      </select>
    </label>

    <label class="field">
      Tamaño
      <input
        type="number"
        min="6"
        max="200"
        :value="store.selectedTextElement.fontSize"
        @change="commit('fontSize', Number(($event.target as HTMLInputElement).value))"
      />
    </label>

    <label class="field">
      Color
      <input
        type="color"
        :value="store.selectedTextElement.color"
        @change="commit('color', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <div class="toggles">
      <button
        type="button"
        :class="{ active: store.selectedTextElement.bold }"
        @click="commit('bold', !store.selectedTextElement.bold)"
      >
        B
      </button>
      <button
        type="button"
        :class="{ active: store.selectedTextElement.italic }"
        @click="commit('italic', !store.selectedTextElement.italic)"
      >
        I
      </button>
      <button
        type="button"
        :class="{ active: store.selectedTextElement.underline }"
        @click="commit('underline', !store.selectedTextElement.underline)"
      >
        U
      </button>
    </div>

    <div class="toggles">
      <button
        type="button"
        :class="{ active: store.selectedTextElement.align === 'left' }"
        @click="commit('align', 'left')"
      >
        Izq
      </button>
      <button
        type="button"
        :class="{ active: store.selectedTextElement.align === 'center' }"
        @click="commit('align', 'center')"
      >
        Centro
      </button>
      <button
        type="button"
        :class="{ active: store.selectedTextElement.align === 'right' }"
        @click="commit('align', 'right')"
      >
        Der
      </button>
    </div>
  </aside>
</template>

<style scoped>
.properties-panel {
  width: 240px;
  flex-shrink: 0;
  padding: 1.25rem;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.properties-panel h3 {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.field select,
.field input[type='number'] {
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
}

.field input[type='color'] {
  width: 100%;
  height: 34px;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
}

.toggles {
  display: flex;
  gap: 0.4rem;
}

.toggles button {
  flex: 1;
  padding: 0.4rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.toggles button:hover {
  border-color: var(--color-primary);
}

.toggles button.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
</style>
