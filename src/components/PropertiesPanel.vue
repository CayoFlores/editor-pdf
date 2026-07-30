<script setup lang="ts">
import { FONT_FAMILIES, useEditorStore, type FontFamily, type TextAlign } from '@/stores/editor'

const store = useEditorStore()

function update(patch: Partial<{
  fontFamily: FontFamily
  fontSize: number
  color: string
  bold: boolean
  italic: boolean
  underline: boolean
  align: TextAlign
}>) {
  const el = store.selectedTextElement
  if (!el) return
  store.updateElement(el.id, patch)
}
</script>

<template>
  <aside v-if="store.selectedTextElement" class="properties-panel">
    <h3>Texto</h3>

    <label class="field">
      Fuente
      <select
        :value="store.selectedTextElement.fontFamily"
        @change="update({ fontFamily: ($event.target as HTMLSelectElement).value as FontFamily })"
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
        @input="update({ fontSize: Number(($event.target as HTMLInputElement).value) })"
      />
    </label>

    <label class="field">
      Color
      <input
        type="color"
        :value="store.selectedTextElement.color"
        @input="update({ color: ($event.target as HTMLInputElement).value })"
      />
    </label>

    <div class="toggles">
      <button
        type="button"
        :class="{ active: store.selectedTextElement.bold }"
        @click="update({ bold: !store.selectedTextElement.bold })"
      >
        B
      </button>
      <button
        type="button"
        :class="{ active: store.selectedTextElement.italic }"
        @click="update({ italic: !store.selectedTextElement.italic })"
      >
        I
      </button>
      <button
        type="button"
        :class="{ active: store.selectedTextElement.underline }"
        @click="update({ underline: !store.selectedTextElement.underline })"
      >
        U
      </button>
    </div>

    <div class="toggles">
      <button
        type="button"
        :class="{ active: store.selectedTextElement.align === 'left' }"
        @click="update({ align: 'left' })"
      >
        Izq
      </button>
      <button
        type="button"
        :class="{ active: store.selectedTextElement.align === 'center' }"
        @click="update({ align: 'center' })"
      >
        Centro
      </button>
      <button
        type="button"
        :class="{ active: store.selectedTextElement.align === 'right' }"
        @click="update({ align: 'right' })"
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
