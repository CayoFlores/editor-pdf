import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { useHistoryStore } from '@/stores/history'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export const FONT_FAMILIES = ['Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'] as const
export type FontFamily = (typeof FONT_FAMILIES)[number]
export type TextAlign = 'left' | 'center' | 'right'

interface BaseElement {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface TextElementData extends BaseElement {
  type: 'text'
  content: string
  fontFamily: FontFamily
  fontSize: number
  color: string
  bold: boolean
  italic: boolean
  underline: boolean
  align: TextAlign
}

export interface ImageElementData extends BaseElement {
  type: 'image'
  src: string
  mimeType: string
}

export type PageElement = TextElementData | ImageElementData

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function createTextElement(): TextElementData {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    x: 40,
    y: 40,
    width: 220,
    height: 60,
    content: 'Texto',
    fontFamily: 'Helvetica',
    fontSize: 18,
    color: '#000000',
    bold: false,
    italic: false,
    underline: false,
    align: 'left',
  }
}

export async function createImageElement(file: File): Promise<ImageElementData> {
  const src = await fileToDataUrl(file)
  return {
    id: crypto.randomUUID(),
    type: 'image',
    x: 40,
    y: 40,
    width: 160,
    height: 160,
    src,
    mimeType: file.type,
  }
}

export const useEditorStore = defineStore('editor', () => {
  const pdfDocument = shallowRef<PDFDocumentProxy | null>(null)
  const originalBytes = shallowRef<ArrayBuffer | null>(null)
  const fileName = ref('')
  const numPages = ref(0)
  const currentPage = ref(1)
  const scale = ref(1.5)
  const isLoading = ref(false)
  const error = ref('')

  const elementsByPage = ref<Record<number, PageElement[]>>({})
  const selectedElementId = ref<string | null>(null)

  const currentPageElements = computed(() => elementsByPage.value[currentPage.value] ?? [])

  const selectedElement = computed(
    () => currentPageElements.value.find((el) => el.id === selectedElementId.value) ?? null,
  )

  const selectedTextElement = computed(() => {
    const el = selectedElement.value
    return el && el.type === 'text' ? el : null
  })

  async function loadFile(file: File) {
    isLoading.value = true
    error.value = ''
    try {
      const data = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: data.slice(0) })
      const doc = await loadingTask.promise

      pdfDocument.value?.loadingTask.destroy()
      pdfDocument.value = doc
      originalBytes.value = data
      fileName.value = file.name
      numPages.value = doc.numPages
      currentPage.value = 1
      elementsByPage.value = {}
      selectedElementId.value = null
      useHistoryStore().clear()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudo cargar el PDF'
      pdfDocument.value = null
      numPages.value = 0
    } finally {
      isLoading.value = false
    }
  }

  function goToPage(page: number) {
    if (page < 1 || page > numPages.value) return
    currentPage.value = page
    selectedElementId.value = null
  }

  function nextPage() {
    goToPage(currentPage.value + 1)
  }

  function prevPage() {
    goToPage(currentPage.value - 1)
  }

  /**
   * Low-level mutation primitives. These take an explicit page number
   * (instead of assuming `currentPage`) so that undo/redo commands can
   * target the page an edit actually happened on, even after the user
   * has navigated elsewhere.
   */
  function insertElement(page: number, element: PageElement, index?: number) {
    if (!elementsByPage.value[page]) {
      elementsByPage.value[page] = []
    }
    const list = elementsByPage.value[page]
    if (index === undefined || index >= list.length) {
      list.push(element)
    } else {
      list.splice(index, 0, element)
    }
  }

  function deleteElement(page: number, id: string) {
    const list = elementsByPage.value[page]
    if (!list) return
    elementsByPage.value[page] = list.filter((item) => item.id !== id)
    if (selectedElementId.value === id) selectedElementId.value = null
  }

  function elementIndex(page: number, id: string): number {
    return elementsByPage.value[page]?.findIndex((item) => item.id === id) ?? -1
  }

  function patchElement(page: number, id: string, patch: Partial<PageElement>) {
    const list = elementsByPage.value[page]
    const el = list?.find((item) => item.id === id)
    if (el) Object.assign(el, patch)
  }

  function selectElement(id: string | null) {
    selectedElementId.value = id
  }

  return {
    pdfDocument,
    originalBytes,
    fileName,
    numPages,
    currentPage,
    scale,
    isLoading,
    error,
    loadFile,
    goToPage,
    nextPage,
    prevPage,
    elementsByPage,
    currentPageElements,
    selectedElementId,
    selectedElement,
    selectedTextElement,
    insertElement,
    deleteElement,
    elementIndex,
    patchElement,
    selectElement,
  }
})
