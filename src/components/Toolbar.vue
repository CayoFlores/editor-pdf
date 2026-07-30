<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { buildExportedPdf, downloadPdf } from '@/utils/pdfExport'

const store = useEditorStore()
const isExporting = ref(false)

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    store.loadFile(file)
  }
  input.value = ''
}

function onImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    store.addImageElement(file)
  }
  input.value = ''
}

async function onDownload() {
  if (!store.originalBytes) return
  isExporting.value = true
  try {
    const bytes = await buildExportedPdf({
      originalBytes: store.originalBytes,
      elementsByPage: store.elementsByPage,
      scale: store.scale,
    })
    const baseName = store.fileName.replace(/\.pdf$/i, '') || 'documento'
    downloadPdf(bytes, `${baseName}-editado.pdf`)
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <header class="toolbar">
    <span class="brand">Editor de PDF</span>

    <label class="btn">
      Cargar PDF
      <input type="file" accept="application/pdf" @change="onFileChange" hidden />
    </label>

    <template v-if="store.pdfDocument">
      <span class="divider" />

      <div class="page-nav">
        <button
          type="button"
          class="btn btn-icon"
          :disabled="store.currentPage <= 1"
          @click="store.prevPage"
          aria-label="Página anterior"
        >
          ‹
        </button>
        <span class="page-indicator">Página {{ store.currentPage }} / {{ store.numPages }}</span>
        <button
          type="button"
          class="btn btn-icon"
          :disabled="store.currentPage >= store.numPages"
          @click="store.nextPage"
          aria-label="Página siguiente"
        >
          ›
        </button>
      </div>

      <span class="divider" />

      <button type="button" class="btn" @click="store.addTextElement">+ Texto</button>

      <label class="btn">
        + Imagen
        <input type="file" accept="image/png,image/jpeg" @change="onImageChange" hidden />
      </label>

      <span class="spacer" />

      <button type="button" class="btn btn-primary" :disabled="isExporting" @click="onDownload">
        {{ isExporting ? 'Generando…' : 'Descargar PDF' }}
      </button>
    </template>
  </header>
</template>

<style scoped>
.toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.25rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.brand {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text);
  margin-right: 0.5rem;
  white-space: nowrap;
}

.divider {
  width: 1px;
  height: 22px;
  background: var(--color-border);
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon {
  width: 30px;
  padding: 0.5rem 0;
}

.page-indicator {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.spacer {
  flex: 1;
}
</style>
