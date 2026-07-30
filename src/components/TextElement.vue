<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { TextElementData } from '@/stores/editor'
import { useEditorStore } from '@/stores/editor'

const props = defineProps<{ element: TextElementData }>()
const store = useEditorStore()

const contentRef = ref<HTMLElement | null>(null)
const isEditable = computed(() => store.selectedElementId === props.element.id)

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

function onInput(event: Event) {
  const target = event.target as HTMLElement
  store.updateElement(props.element.id, { content: target.innerText })
}
</script>

<template>
  <div
    ref="contentRef"
    class="text-element"
    :style="style"
    :contenteditable="isEditable"
    @input="onInput"
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
