<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { TextElementData } from '@/stores/editor'
import { useEditorStore } from '@/stores/editor'
import { useHistoryStore } from '@/stores/history'
import { UpdateElementCommand } from '@/commands/elementCommands'

const props = defineProps<{ element: TextElementData }>()
const store = useEditorStore()
const history = useHistoryStore()

const contentRef = ref<HTMLElement | null>(null)
const isEditable = computed(() => store.selectedElementId === props.element.id)
let contentBeforeEdit = props.element.content

const style = computed(() => ({
  fontFamily: props.element.fontFamily,
  fontSize: `${props.element.fontSize}px`,
  color: props.element.color,
  fontWeight: props.element.bold ? 'bold' : 'normal',
  fontStyle: props.element.italic ? 'italic' : 'normal',
  textDecoration: props.element.underline ? 'underline' : 'none',
  textAlign: props.element.align,
}))

function setDomContent(text: string) {
  if (contentRef.value && contentRef.value.innerText !== text) {
    contentRef.value.innerText = text
  }
}

onMounted(() => setDomContent(props.element.content))
watch(
  () => props.element.id,
  () => setDomContent(props.element.content),
)
watch(
  () => props.element.content,
  (content) => {
    // Skip while the user is actively typing here — the DOM is already the
    // source of truth for that keystroke. Undo/redo and other external
    // changes land while this element isn't focused, so sync those in.
    if (document.activeElement !== contentRef.value) {
      setDomContent(content)
    }
  },
)

function onInput(event: Event) {
  const target = event.target as HTMLElement
  store.patchElement(store.currentPage, props.element.id, { content: target.innerText })
}

function onFocus() {
  contentBeforeEdit = props.element.content
}

function onBlur() {
  const after = props.element.content
  if (after === contentBeforeEdit) return
  history.execute(
    new UpdateElementCommand(
      store.currentPage,
      props.element.id,
      'text',
      { content: contentBeforeEdit },
      { content: after },
    ),
  )
}
</script>

<template>
  <div
    ref="contentRef"
    class="text-element"
    :style="style"
    :contenteditable="isEditable"
    @input="onInput"
    @focus="onFocus"
    @blur="onBlur"
  />
</template>

<style scoped>
.text-element {
  width: 100%;
  height: 100%;
  outline: none;
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 2px;
  box-sizing: border-box;
  cursor: text;
}
</style>
