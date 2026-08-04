<script setup lang="ts">
import { ref, watch, onBeforeUnmount, onMounted } from 'vue'
import { useEditorStore, type PageElement } from '@/stores/editor'
import { useHistoryStore } from '@/stores/history'
import { DeleteElementCommand, UpdateElementCommand } from '@/commands/elementCommands'
import DraggableElement from '@/components/DraggableElement.vue'
import TextElement from '@/components/TextElement.vue'
import ImageElement from '@/components/ImageElement.vue'
import type { Rect } from '@/composables/useDragResize'

const store = useEditorStore()
const history = useHistoryStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const pageWidth = ref(0)
const pageHeight = ref(0)

let renderTask: ReturnType<import('pdfjs-dist').PDFPageProxy['render']> | null = null

async function renderPage() {
  const doc = store.pdfDocument
  const canvas = canvasRef.value
  if (!doc || !canvas) return

  const page = await doc.getPage(store.currentPage)
  const viewport = page.getViewport({ scale: store.scale })

  canvas.width = viewport.width
  canvas.height = viewport.height
  pageWidth.value = viewport.width
  pageHeight.value = viewport.height

  const context = canvas.getContext('2d')
  if (!context) return

  renderTask?.cancel()
  renderTask = page.render({ canvasContext: context, viewport, canvas })
  try {
    await renderTask.promise
  } catch (err) {
    if (err instanceof Error && err.name !== 'RenderingCancelledException') {
      throw err
    }
  }
}

watch(
  [() => store.pdfDocument, () => store.currentPage, () => store.scale],
  renderPage,
  { flush: 'post' },
)

onBeforeUnmount(() => {
  renderTask?.cancel()
})

function elementRect(element: PageElement): Rect {
  return { x: element.x, y: element.y, width: element.width, height: element.height }
}

function onRectUpdate(id: string, rect: Rect) {
  store.patchElement(store.currentPage, id, rect)
}

function onRectCommit(id: string, before: Rect, after: Rect) {
  const element = store.currentPageElements.find((el) => el.id === id)
  if (!element) return
  history.execute(new UpdateElementCommand(store.currentPage, id, element.type, before, after))
}

function deleteElementWithHistory(id: string) {
  const element = store.currentPageElements.find((el) => el.id === id)
  if (!element) return
  history.execute(new DeleteElementCommand(store.currentPage, element))
}

function onOverlayPointerDown(event: PointerEvent) {
  if (event.target === event.currentTarget) {
    store.selectElement(null)
  }
}

function isEditingField(): boolean {
  const active = document.activeElement as HTMLElement | null
  return Boolean(active?.isContentEditable || active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA')
}

function onKeyDown(event: KeyboardEvent) {
  const key = event.key.toLowerCase()
  const withModifier = event.ctrlKey || event.metaKey

  if (withModifier && key === 'z' && !isEditingField()) {
    event.preventDefault()
    if (event.shiftKey) history.redo()
    else history.undo()
    return
  }

  if (withModifier && key === 'y' && !isEditingField()) {
    event.preventDefault()
    history.redo()
    return
  }

  if (event.key !== 'Delete' && event.key !== 'Backspace') return
  if (!store.selectedElementId) return
  if (isEditingField()) return

  event.preventDefault()
  deleteElementWithHistory(store.selectedElementId)
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="pdf-canvas-wrapper">
    <div v-if="store.isLoading" class="status">Cargando PDF…</div>
    <div v-else-if="store.error" class="status error">{{ store.error }}</div>
    <div
      v-else-if="store.pdfDocument"
      class="page-stage"
      :style="{ width: pageWidth + 'px', height: pageHeight + 'px' }"
    >
      <canvas ref="canvasRef" class="pdf-page" />
      <div class="overlay" @pointerdown="onOverlayPointerDown">
        <DraggableElement
          v-for="el in store.currentPageElements"
          :key="el.id"
          :rect="elementRect(el)"
          :bounds="{ width: pageWidth, height: pageHeight }"
          :selected="store.selectedElementId === el.id"
          @update:rect="(rect) => onRectUpdate(el.id, rect)"
          @commit:rect="(before, after) => onRectCommit(el.id, before, after)"
          @select="store.selectElement(el.id)"
          @delete="deleteElementWithHistory(el.id)"
        >
          <TextElement v-if="el.type === 'text'" :element="el" />
          <ImageElement v-else :element="el" />
        </DraggableElement>
      </div>
    </div>
    <div v-else class="placeholder">
      <div class="placeholder-icon">📄</div>
      <p>Carga un PDF para empezar a editar</p>
    </div>
  </div>
</template>

<style scoped>
.pdf-canvas-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex: 1;
  padding: 2.5rem 1rem;
  overflow: auto;
}

.page-stage {
  position: relative;
  background: #fff;
  box-shadow: var(--shadow-md);
  border-radius: 2px;
}

.pdf-page {
  display: block;
}

.overlay {
  position: absolute;
  inset: 0;
}

.status {
  margin-top: 3rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.status.error {
  color: var(--color-danger);
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 3.5rem;
  margin-top: 2rem;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-muted);
}

.placeholder-icon {
  font-size: 2.5rem;
}

.placeholder p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
